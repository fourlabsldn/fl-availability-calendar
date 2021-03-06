import Subject from './Subject';
import DataLoader from './DataLoader';
import assert from 'fl-assert';
import CustomDate from './CustomDate';
import ViewController from './ViewController';

const CLASS_PREFIX = 'subjects';

export default class SubjectsContainer extends ViewController {
  /**
   * @method constructor
   * @param  {String} loadUrl - URL from where to fetch subject data.
   * @param  {CustomDate} startDate
   * @param  {CustomDate} endDate
   * @param  {String} modulePrefix
   * @return {SubjectsContainer}
   */
  constructor(loadUrl, modulePrefix) {
    super();
    this.dataLoader = new DataLoader(loadUrl);
    this.startDate = new CustomDate();
    this.subjects = [];
    this.dayCount = 1;
    this.modulePrefix = modulePrefix;

    Object.preventExtensions(this);
    this.html.container.classList.add(`${modulePrefix}-${CLASS_PREFIX}`);
  }

  // ---------------------------------------------------------------------------
  // Setters
  // ---------------------------------------------------------------------------
  /**
   * @method setStartDate
   * @param  {CustomDate} newstartDate
   */
  async setStartDate(newstartDate) {
    assert(newstartDate instanceof CustomDate,
      'TypeError: startDate is not an instance of CustomDate');

    // NOTE: It is very important that this be the start of the day
    // as in further comparisons there will have to be a difference
    // of 24 hours between two dates.
    this.startDate = new CustomDate(newstartDate).startOf('day');

    const endDate = this.getEndDate();
    await this.loadSubjectsEvents(this.startDate, endDate);

    this.subjects.forEach((subject) => {
      subject.setStartDate(newstartDate);
    });
  }

  /**
   * Sets the amount of days being shown in each subject row.
   * @method setDayCount
   * @param  {Int} count
   * @return {Promise}
   */
  async setDayCount(count) {
    assert(count >= 0, 'Negative amount of days not allowed');

    this.dayCount = count;
    const endDate = this.getEndDate();
    await this.loadSubjectsEvents(this.startDate, endDate);

    this.subjects.forEach((subject) => {
      subject.setDayCount(count);
    });
  }

  /**
   * @method setSubjectCount
   * @param  {Int} count
   */
  async setSubjectCount(count) {
    const dayCount = this.getDayCount();
    if (dayCount === count) { return; }

    const addOrRemove = dayCount > count ? 'removeSubjects' : 'addSubjects';
    await this[addOrRemove]('bottom', count);
  }

  /**
   * @method setEvents
   * @param  {Array<Object>} subjects - Array of objects representing a subject
   * and having the events to be set.
   */
  setEvents(newEventsSubjects) {
    this.subjects.forEach(subject => {
      const subjWithNewEvents = newEventsSubjects.find(s => s.id === subject.id);
      if (subjWithNewEvents) {
        subject.setEvents(subjWithNewEvents.events);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Getters
  // ---------------------------------------------------------------------------

  /**
   * [getDayCount description]
   * @method getDayCount
   * @return {Int} Amount of days in each subject
   */
  getDayCount() {
    return this.dayCount || 1;
    // return this.subjects[0] ? this.subjects[0].getDayCount() : 1;
  }

  getEndDate() {
    const startDate = new CustomDate(this.startDate);
    const dayCount = this.getDayCount();
    const endDate = startDate.add(dayCount, 'days');
    return endDate;
  }

  // ---------------------------------------------------------------------------
  // Modifiers
  // ---------------------------------------------------------------------------

  /**
   * @method removeSubjects
   * @param  {String} topBottom - Accepts 'top' or 'bottom'
   * @param  {Int} amount
   */
  removeSubjects(topBottom, amount = 1) {
    const fromTop = topBottom === 'top';
    assert(fromTop || topBottom === 'bottom', `Invalid value for topBottom: ${topBottom}`);

    const start = fromTop ? 0 : this.subjects.length - amount;

    const subjectsToErase = this.subjects.splice(start, amount);
    subjectsToErase.forEach(subj => subj.destroy());
  }

  /**
   * Add subject rows to the container
   * @method addSubjects
   * @param  {String} topBottom - Accepts 'top' or 'bottom'
   * @param  {Int} amount
   * @return {Promise} - The promise will be resolved when the subject has been added.
   */
  async addSubjects(topBottom, amount = 1) {
    const fromTop = topBottom === 'top';
    for (let i = 0; i < amount; i++) {
      const subjConfig = await this.getNewSubjectConfig(fromTop);
      const noMoreSubjectsToLoad = !subjConfig;
      if (noMoreSubjectsToLoad) {
        return false;
      }

      //  This object already contains events for the date range of
      //  the container.
      const newSubject = new Subject(subjConfig, this.startDate, this.modulePrefix);
      newSubject.setDayCount(this.getDayCount());

      let referenceElement;
      if (fromTop) {
        this.subjects = [newSubject].concat(this.subjects);
        referenceElement = this.html.container.children[0];
      } else {
        this.subjects.push(newSubject);
        referenceElement = null;
      }

      requestAnimationFrame(() => {
        this.html.container.insertBefore(
          newSubject.html.container,
          referenceElement
        );
      });
    }
    return true;
  }

  /**
   * Gets events needed from dataloader and sends them to each event.
   * @method loadSubjectsEvents
   * @param  {CustomDate} fromDate - Date from which subjects need events.
   * @param  {CustomDate} toDate - Date until which subjects need events.
   * @return {Promise<void>}
   */
  async loadSubjectsEvents(fromDate, toDate) {
    const cacheStartDate = this.dataLoader.getCacheStartDate();
    const cacheEndDate = this.dataLoader.getCacheStartDate();
    const datesAlreadyLoaded = fromDate.isAfter(cacheStartDate) && toDate.isBefore(cacheEndDate);

    // no need to load from server;
    if (datesAlreadyLoaded || this.subjects.length === 0) { return; }

    const subjectsIds = this.subjects.map(subj => subj.getId());
    const eventData = await this.dataLoader.getEventsForIds(
      subjectsIds,
      fromDate,
      toDate
    );

    this.setEvents(eventData);
  }

  /**
   * @method getNewSubjectConfig
   * @param  {Boolean} fromTop
   * @return {Promise<Object>} Will be resolved into an object able to create a Subject instance
   */
  async getNewSubjectConfig(fromTop) {
    const beforeAfter = fromTop ? 'before' : 'after';
    const referenceElement = fromTop ? this.subjects[0] : this.subjects[this.subjects.length - 1];
    const referenceId = referenceElement ? referenceElement.getId() : null;
    const subjArray = await this.dataLoader.getSubjects(1, beforeAfter, referenceId);
    return subjArray[0];
  }

  /**
   * @method scrollUp
   * @return {Promise}
   */
  async scrollUp() {
    const subjectAdded = await this.addSubjects('top', 1);
    if (subjectAdded) {
      this.removeSubjects('bottom', 1);
    }
  }

  /**
   * @method scrollDown
   * @return {Promise}
   */
  async scrollDown() {
    const subjectAdded = await this.addSubjects('bottom', 1);
    if (subjectAdded) {
      this.removeSubjects('top', 1);
    }
  }
}
