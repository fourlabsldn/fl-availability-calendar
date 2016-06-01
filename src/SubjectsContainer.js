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
    this.endDate = new CustomDate();
    this.subjects = [];

    this.modulePrefix = modulePrefix;

    Object.preventExtensions(this);
    this.html.container.classList.add(`${modulePrefix}-${CLASS_PREFIX}`);
  }

  /**
   * TODO: Make this work and make it an async function
   * Add subject rows to the container
   * @method addSubjects
   * @param  {String} topBottom - Accepts 'top' or 'bottom'
   * @param  {Int} amount
   * @return {Promise} - The promise will be resolved when the subject has been added.
   */
  async addSubjects(topBottom, amount = 1) {
    if (topBottom !== 'bottom') { console.log('Not implemented'); }

    for (let i = 0; i < amount; i++) {
      const newSubjectConfigObject = await this.getNewSubjectConfig();
      if (!newSubjectConfigObject) { assert(false, 'No new subject found.'); }

      //  Create subject form object found.
      const newSubject = new Subject(newSubjectConfigObject, this.startDate, this.modulePrefix);
      this.subjects.push(newSubject);
      this.html.container.appendChild(newSubject.html.container);
    }
  }

  /**
   * @method getNewSubjectConfig
   * @param  {String} topBottom
   * @return {Promise<Object>} Will be resolved into an object able to create a Subject instance
   */
  getNewSubjectConfig(topBottom = 'bottom') {
    let fetchPromise;
    if (topBottom === 'top') {
      const topId = this.subjects[0] ? this.subjects[0].getId() : null;
      fetchPromise = this.dataLoader.getUntilId(topId, 2, this.startDate, this.endDate)
        .then(arr => arr[0]);
    } else if (topBottom === 'bottom') {
      const bottomElement = this.subjects[this.subjects.length - 1];
      const bottomId = bottomElement ? bottomElement.getId() : null;
      fetchPromise = this.dataLoader.getFromId(bottomId, 2, this.startDate, this.endDate)
        .then(arr => arr[1] || arr[0]);
    } else {
      assert(false, `Invalid topBottom option: ${topBottom}`);
    }

    return fetchPromise
  }

  /**
   * @method removeSubjects
   * @param  {String} topBottom - Accepts 'top' or 'bottom'
   * @param  {Int} amount
   */
  removeSubjects(topBottom, amount) {
    assert(typeof topBottom === 'string',
      'TypeError: invalid value for topBottom. Expected String and got ${typeof topBottom}');
    let start;
    let end;

    if (topBottom === 'bottom') {
      end = this.subjects.length;
      start = end - amount;
    } else if (topBottom === 'top') {
      end = amount;
      start = 0;
    } else {
      assert(false, 'Invalid value for topBottom: ${topBottom}');
    }

    for (let subjIndex = start; subjIndex < end; subjIndex++) {
      const [erasedSubject] = this.subjects.splice(subjIndex, 1);
      erasedSubject.destroy();
    }
  }

  /**
   * Sets the amount of days being shown in each subject row.
   * @method setDayCount
   * @param  {Int} count
   */
  setDayCount(count) {
    this.subjects.forEach(subject => subject.setDayCount(count));
  }

  setStartDate(startDate) {
    assert(
      startDate instanceof CustomDate,
      'TypeError: startDate is not an instance of CustomDate'
    );
    this.startDate = startDate;
    this.subjects.forEach((subject) => {
      subject.setStartDate(startDate);
    });
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

  scrollLeft() {
    this.subjects.forEach(subject => subject.scrollLeft());
  }
  scrollRight() {
    this.subjects.forEach(subject => subject.scrollRight());
  }

  /**
   * @method scrollUp
   * @return {Promise}
   */
  scrollUp() {
    this.removeSubjects('bottom', 1);
    return this.addSubjects('top', 1);
  }

  /**
   * @method scrollDown
   * @return {Promise}
   */
  scrollDown() {
    this.removeSubjects('bottom', 1);
    return this.addSubjects('down', 1);
  }

  // /**
  //  * @method loadData
  //  * @param  {CustomDate} startDate
  //  * @param  {CustomDate} endDate
  //  * @param  {Array<Int>} ids - All ids whose events should be fetched
  //  * @param  {Int} extraIdsToLoad - Amount of extra ids to load
  //  * @param  {String} topBottom - Whether to load from 'top' or from 'bottom'
  //  * @return {Promise<Object>}
  //  */
  // loadData(startDate, endDate, ids, extraIdsToLoad, topBottom) {
  //   // do we have at least 10 ids above?z
  //   // do we have at least 10 ids bellow?
  //   // do all of these ids have data loaded from two months before start date?
  //   // do all of these ids have data loaded from two months after start date?
  //   // load whatever is needed.
  //   return this.dataLoader.load(startDate, endDate, ids, extraIdsToLoad, topBottom)
  //   .then((res) => {
  //     const subjects = res.subjects;
  //     for (const subject of subjects) {
  //       // Add events to cached subject if it exists
  //       const subjViewController = this.cache.find(sub => sub.id === subject.id);
  //       if (subjViewController) {
  //         for (const event of subject.events) {
  //           subjViewController.events.add(event);
  //         }
  //
  //       // If the subject is not cached, then add it to cache.
  //       } else {
  //         this.cache[this.cache.length] = subject;
  //       }
  //     }
  //     console.log('Added subjects');
  //   });
  // }
}
