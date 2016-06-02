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

    this.modulePrefix = modulePrefix;

    Object.preventExtensions(this);
    this.html.container.classList.add(`${modulePrefix}-${CLASS_PREFIX}`);
  }

  // ---------------------------------------------------------------------------
  // Setters
  // ---------------------------------------------------------------------------
  setStartDate(startDate) {
    assert(
      startDate instanceof CustomDate,
      'TypeError: startDate is not an instance of CustomDate'
    );
    this.startDate = new CustomDate(startDate);
    this.subjects.forEach((subject) => {
      subject.setStartDate(startDate);
    });
  }

  /**
   * Sets the amount of days being shown in each subject row.
   * @method setDayCount
   * @param  {Int} count
   * @return {Promise}
   */
  async setDayCount(count) {
    const countDiff = count - this.getDayCount();
    let dayFunction;

    if (countDiff > 0) {
      dayFunction = 'addDay';
    } else if (count < this.getDayCount()) {
      dayFunction = 'removeDay';
    }

    const position = 'front';
    const absDiff = Math.abs(countDiff);
    for (let i = 0; i < absDiff; i++) {
      await this[dayFunction](position);
    }
  }

  /**
   * @method setEvents
   * @param  {Object<Array>} subjectsEvents - Object where each key is a subject
   *                                        id and each value is a subject's events.
   */
  setEvents(subjectsEvents) {
    const ids = Object.keys(subjectsEvents);
    for (const id of ids) {
      const subj = this.subjects.find(sub => sub.id === id);
      if (subj) {
        subj.setEvents(subjectsEvents[id]);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Getters
  // ---------------------------------------------------------------------------
  /**
   * Returns an object with the date 'from' and 'to'
   * @method getSubjectsEventRange
   * @return {Object} - {to: CustomDate, from: Custom Date}
   */
  getSubjectsEventRange() {
    let fromDate = this.startDate;
    let toDate = this.startDate;
    for (const subject of this.subjects) {
      const range = subject.getEventsLoadedRange();
      if (range.from.diff(fromDate) < 0) {
        fromDate = range.from;
      }
      if (range.to.diff(toDate) > 0) {
        toDate = range.to;
      }
    }
    return {
      from: fromDate,
      to: toDate,
    };
  }

  /**
   * [getDayCount description]
   * @method getDayCount
   * @return {Int} Amount of days in each subject
   */
  getDayCount() {
    return this.subjects[0] ? this.subjects[0].getDayCount() : 1;
  }

  getEndDate() {
    const startDate = new CustomDate(this.startDate);
    const dayCount = this.getDayCount();
    const endDate = startDate.add(dayCount, 'days');
    return endDate;
  }

  /**
   * Checks that all subjects have event information for a date range.
   * @method subjectsCoverRange
   * @param  {CustomDate} fromDate
   * @param  {CustomDate} toDate
   * @return {Boolean}
   */
  subjectsCoverRange(fromDate, toDate) {
    const range = this.getSubjectsEventRange();
    const coverFromDate = range.from.diff(fromDate) <= 0;
    const coverToDate = range.to.diff(toDate) >= 0;
    return coverFromDate && coverToDate;
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
    const startDate = this.startDate;
    const dayCount = this.getDayCount();

    for (let i = 0; i < amount; i++) {
      const subjConfig = await this.getNewSubjectConfig(topBottom);
      const noMoreSubjectsToLoad = !subjConfig;
      if (noMoreSubjectsToLoad) {
        return false;
      }

      //  NOTE: This object already contains events for the date range of
      //  the container.
      const newSubject = new Subject(subjConfig, startDate, this.modulePrefix);

      // set correct dayCount
      for (let counter = 0; counter < dayCount; counter++) {
        newSubject.addDay();
      }

      const firstSubjectToBeAdded = this.subjects.length === 0;

      if (topBottom === 'bottom' || firstSubjectToBeAdded) {
        this.subjects.push(newSubject);
        requestAnimationFrame(() => {
          this.html.container.appendChild(newSubject.html.container);
        });
      } else {
        // Add subject to the beginning of the subjects array.
        this.subjects.splice(0, 0, newSubject);
        requestAnimationFrame(() => {
          this.html.container.insertBefore(
            newSubject.html.container,
            this.html.container.children[0]
          );
        });
      }
    }
    return true;
  }

  /**
   * @method getNewSubjectConfig
   * @param  {String} topBottom
   * @return {Promise<Object>} Will be resolved into an object able to create a Subject instance
   */
  async getNewSubjectConfig(
    topBottom = 'bottom',
    fromDate = this.startDate,
    toDate = this.getEndDate()
  ) {
    assert(topBottom === 'top' || topBottom === 'bottom',
      `Invalid topBottom option: ${topBottom}`);

    const fromTop = topBottom === 'top';
    let beforeAfter;
    let referenceElement;
    if (fromTop) {
      referenceElement = this.subjects[0];
      beforeAfter = 'before';
    } else {
      referenceElement = this.subjects[this.subjects.length - 1];
      beforeAfter = 'after';
    }

    const isFirstSubject = this.subjects.length === 0;
    const referenceId = isFirstSubject ? null : referenceElement.getId();

    const subjArray = await this.dataLoader
      .getSubjects(2, beforeAfter, referenceId, fromDate, toDate);

    // Only the reference element returned.
    if (subjArray.length < 2) { return null; }

    const newSubjectConfig = isFirstSubject || fromTop ? subjArray[0] : subjArray[1];
    return newSubjectConfig;
  }

  /**
   * Add a day to each subject
   * @method addDay
   * @param  {String} frontBack - 'front' or 'back'.
   * @return {Promise}
   */
  async addDay(frontBack) {
    let fromDate;
    let toDate;
    if (frontBack === 'front') {
      fromDate = this.startDate;
      toDate = this.getEndDate().add(1, 'days');
    } else if (frontBack === 'back') {
      fromDate = new CustomDate(this.startDate).add(-1, 'days');
      toDate = this.getEndDate();
    } else {
      assert(false, `Invalid addDay direction option: ${frontBack}`);
    }

    if (!this.subjectsCoverRange(fromDate, toDate)) {
      // Fetch more data if subjects currently don't have it.
      const subjectIds = this.subjects.map(subj => subj.getId());
      const eventData = await this.dataLoader.getEventsForIds(subjectIds, fromDate, toDate);
      this.setEvents(eventData);
    }
    this.subjects.forEach(subject => subject.addDay(frontBack));
  }

  removeDay(frontBack) {
    this.subjects.forEach(subject => subject.removeDay(frontBack));
  }

  async scrollLeft() {
    const dayAdded = await this.addDay('back');
    if (dayAdded) {
      this.removeDay('front');
    }
  }

  async scrollRight() {
    const dayAdded = await this.addDay('front');
    if (dayAdded) {
      this.removeDay('back');
    }
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
