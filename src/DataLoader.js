import assert from 'fl-assert';
import CustomDate from './CustomDate';
import Ajax from './utils/Ajax';

const CONTENT_LOADING_PADDING = 40;
const MAX_LOADED_RANGE = 120; // in days

// // Data object example
// {
//   fromDate: CustomDate,
//   toDate: CustomDate,
//   subjects: [
//     {
//       name: "Prop number 1",
//       id:123
//       events: Set([
//         {
//           desc: "Rented to John",
//           start: today(),
//           end: daysFromNow(5)
//         },
//         {
//           desc: "Rented to Carl",
//           start: daysFromNow(10),
//           end: daysFromNow(20)
//         },
//         {
//           desc: "Under Maintenance",
//           visitable: true,
//           start: daysFromNow(30),
//           end: daysFromNow(50)
//         }
//       ])
//     }
//   ]
// };

export default class DataLoader {
  constructor(loadUrl) {
    this.ajax = new Ajax(loadUrl);
    this.cacheStartDate = new CustomDate();
    this.cacheEndDate = new CustomDate();

    this.cache = [];
  }

  // ---------------------------------------------------------------------------
  // Public
  // ---------------------------------------------------------------------------

  getCacheStartDate() {
    return new CustomDate(this.cacheStartDate);
  }

  getCacheEndDate() {
    return new CustomDate(this.cacheEndDate);
  }

  async getEventsForIds(ids, fromDate, toDate) {
    if (this.cacheStartDate.isAfter(fromDate) ||
        this.cacheEndDate.isBefore(toDate)) {
      return await this.loadSubjects({
        ids,
        fromDate,
        toDate,
      });
    }
    const cachedSubjects = this.cache.filter(subj => ids.indexOf(subj.id) !== -1);
    return cachedSubjects;
  }

  async getSubjects(amount, beforeAfter, referenceId) {
    const referenceSubjectIndex = this.cache.findIndex(subj => subj.id === referenceId);
    const referenceFound = referenceSubjectIndex !== -1;
    assert(referenceFound || this.cache.length === 0, `Invalid referenceId: ${referenceId}`);

    let haveAllSubjectsInCache;
    let fromIndex;
    let toIndex;
    if (beforeAfter === 'before') {
      haveAllSubjectsInCache = referenceSubjectIndex >= amount;
      toIndex = referenceSubjectIndex - 1;
      fromIndex = toIndex - amount;
    } else {
      haveAllSubjectsInCache = (referenceSubjectIndex + amount) < this.cache.length;
      fromIndex = referenceSubjectIndex + 1;
      toIndex = fromIndex + amount;
    }

    if (haveAllSubjectsInCache) {
      return this.cache.slice(fromIndex, toIndex);
    }

    return await this.loadSubjects({
      recordCount: amount,
      fromDate: this.cacheStartDate,
      toDate: this.cacheEndDate,
      referenceId,
      beforeAfter,
    });
  }

  async loadSubjects(params) {
    // Prepare dates
    const { loadFrom, loadTo } = this.calculateLoadingDate(params.fromDate, params.toDate);
    params.fromDate = loadFrom.toISOString(); // eslint-disable-line no-param-reassign
    params.toDate = loadTo.toISOString(); // eslint-disable-line no-param-reassign

    // Prepare amount
    if (params.recordCount) {
      params.recordCount += CONTENT_LOADING_PADDING; // eslint-disable-line no-param-reassign
    }

    const response = await this.ajax.query(params);
    const subjects = this.processServerResponse(response);
    return subjects;
  }

  /**
   * Compares from and to dates with cacheStartDate and cacheEndDate, choosing
   * the widest possible range within the range limit and adding adequate
   * padding
   * @method calculateLoadingDate
   * @param  {CustomDate} fromDate
   * @param  {CustomDate} toDate
   * @return {Object}
   */
  calculateLoadingDate(fromDate, toDate) {
    const earliestFrom = this.cacheStartDate.isAfter(fromDate) ? fromDate : this.cacheStartDate;
    const latestTo = this.cacheEndDate.isBefore(toDate) ? toDate : this.cacheEndDate;

    const widestRangeWithinLoadLimit =
      latestTo.diff(earliestFrom) + CONTENT_LOADING_PADDING * 2 < MAX_LOADED_RANGE;

    let loadFrom;
    let loadTo;
    if (widestRangeWithinLoadLimit) {
      loadFrom = new CustomDate(earliestFrom).add(-CONTENT_LOADING_PADDING, 'days');
      loadTo = new CustomDate(latestTo).add(CONTENT_LOADING_PADDING, 'days');
    } else {
      loadFrom = new CustomDate(fromDate).add(-CONTENT_LOADING_PADDING, 'days');
      loadTo = new CustomDate(toDate).add(CONTENT_LOADING_PADDING, 'days');
    }

    return { loadFrom, loadTo };
  }

  /**
   * @method processServerResponse
   * @param  {Object} responseObj - A typical server response
   * @return {Array<Object>} Array of subject objects
   */
  processServerResponse(responseObj) {
    // Convert event dates into CustomDate objects
    responseObj.subjects.forEach(s => {
      s.events.forEach(e => {
        e.start = new CustomDate(e.start); // eslint-disable-line no-param-reassign
        e.end = new CustomDate(e.end); // eslint-disable-line no-param-reassign
      });
    });
    const fromDate = new CustomDate(responseObj.fromDate);
    const toDate = new CustomDate(responseObj.toDate);

    assert(fromDate.isValid() && toDate.isValid(), 'fromDate or fromToDate not in responseObj.');
    this.cacheStartDate = fromDate;
    this.cacheEndDate = toDate;
    this.addToCache(responseObj.subjects);
    return responseObj.subjects;
  }

  /**
   * Adds loaded data to existing cache.
   * @method addToCache
   * @param  {Array} subjects
   * @param  {CustomDate} fromDate - Date where event data period coverage starts.
   * @param  {CustomDate} toDate - Date where event data period coverage ends.
   */
  addToCache(subjects) {
    for (const subject of subjects) {
      const cacheIndex = this.cache.findIndex(s => s.id === subject.id);
      if (cacheIndex !== -1) {
        this.cache[cacheIndex] = subject;
      } else {
        this.insertOrderedToCache(subject);
      }
    }
  }

  /**
   * Inserts an object to the cache according to a specific ordering
   * algorythm.
   * NOTE: The ordering is via id and it assumes that ids are sequential
   * and always incremented by one.
   * @method insertOrderedToCache
   * @param  {Object} subject [description]
   * @return {void}
   */
  insertOrderedToCache(subject) {
    let insertionIndex = 0;
    let cachedSubject = this.cache[insertionIndex];
    while (cachedSubject) {
      if (subject.id < cachedSubject.id) { break; }
      insertionIndex++;
      cachedSubject = this.cache[insertionIndex];
    }
    const deleteCount = 0;
    this.cache.splice(insertionIndex, deleteCount, subject);
  }
}
