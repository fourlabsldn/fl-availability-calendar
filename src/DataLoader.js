import assert from 'fl-assert';
import CustomDate from './CustomDate';

// // Data object example
// {
//   moreToLoadAbove: true,
//   moreToLoadBelow: true,
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

// // Cache example
//  [
//     {
//       name: "Prop number 1",
//       id:123,
//       eventsFromDate,
//       eventsToDate,
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
//  ]
export default class DataLoader {
  /**
   * @method constructor
   * @param  {String} loadUrl - Url from where to fetch data
   * @return {DataLoader}
   */
  constructor(loadUrl) {
    this.loadUrl = loadUrl;
    this.cache = [];
    this.moreToLoadAbove = true;
    this.moreToLoadBelow = true;
    Object.preventExtensions(this);

    this.cache.lastElementId = () => {
      return this.cache.length ? this.cache[this.cache.length - 1].id : null;
    };
    this.cache.firstElementId = () => {
      return this.cache.length ? this.cache[0].id : null;
    };
    this.cache.findIndexWithId = (id) => {
      return this.cache.findIndex(subj => subj.id === id);
    };
  }

  /**
   * @method getEventsForIds
   * @param  {Array} ids
   * @param  {CustomDate} fromDate
   * @param  {CustomDate} toDate
   * @return {Promise<Array>}
   */
   // TODO: Implement this on its own
  getEventsForIds(ids, fromDate, toDate) {
    return this.getSubjects(ids.length, 'after', ids[0].id, fromDate, toDate);
  }

  // TODO: Use config object with {before: 5, after: 6, ids: [1,2,3]}
  getSubjects(
    amount,
    beforeAfter = 'after',
    referenceId,
    fromDate = new CustomDate(),
    toDate = new CustomDate()
  ) {
    assert((beforeAfter === 'before') || (beforeAfter === 'after'),
      `Invalid value for beforeAfter: ${beforeAfter}`);

    const targetIndex = this.cache.length > 0
      ? this.cache.findIndexWithId(referenceId)
      : 0;
    assert(targetIndex >= 0, `Invalid target Index: ${targetIndex}`);

    let fromIndex;
    let toIndex;
    const normalisedAmount = Math.max(amount, 1);

    if (beforeAfter === 'before') {
      fromIndex = targetIndex - normalisedAmount + 1;
      toIndex = targetIndex;
    } else {
      fromIndex = targetIndex;
      toIndex = targetIndex + normalisedAmount - 1;
    }

    return this.getCacheSection(fromIndex, toIndex, fromDate, toDate);
  }

  /**
   * Returns a section from the cache or fetches it from the server
   * @method getCacheSection
   * @param  {Int} fromIndex
   * @param  {Int} toIndex
   * @param  {CustomDate} fromDate
   * @param  {CustomDate} toDate
   * @return {Promise<Array>}
   */
  async getCacheSection(fromIndex, toIndex, fromDate, toDate) {
    const needsIndexesAbove = fromIndex < 0;
    const needsIndexesBelow = toIndex >= this.cache.length;
    const hasAllIndexes = !needsIndexesAbove && !needsIndexesBelow;
    const coversEntirePeriod = this.cacheCoversPeriod(fromIndex, toIndex, fromDate, toDate);

    const cachedFrom = Math.max(0, fromIndex);
    const cachedTo = Math.max(0, Math.min(toIndex, this.cache.length - 1));

    // We add one because the slice method does not include the 'to' index.
    const cachedSubjects = this.cache.slice(cachedFrom, cachedTo + 1);

    if (hasAllIndexes && coversEntirePeriod) {
      return cachedSubjects;
    }

    if (hasAllIndexes) {
      const ids = this.cache.slice(fromIndex, toIndex).map(subj => subj.id);
      return this.loadEvents(ids, fromDate, toDate);
    }

    const serverRequests = [];
    if (needsIndexesAbove && this.moreToLoadAbove) {
      const amount = Math.abs(fromIndex);
      const referenceId = this.cache.firstElementId();
      serverRequests.push(
        this.loadSubjects(amount, 'before', referenceId, fromDate, toDate)
      );
    } else {
      serverRequests.push([]);
    }

    if (needsIndexesBelow && this.moreToLoadBelow) {
      const amount = Math.max(toIndex - this.cache.length + 1, 1);
      const referenceId = this.cache.lastElementId();
      serverRequests.push(
        this.loadSubjects(amount, 'after', referenceId, fromDate, toDate)
      );
    } else {
      serverRequests.push([]);
    }

    const [indexesAbove, indexesBelow] = await Promise.all(serverRequests);
    return indexesAbove.concat(cachedSubjects, indexesBelow);
  }


  /**
   * Checks whether in a portion of the cache all subjects have event
   * data for the totality of a period.
   * @method cacheCoversPeriod
   * @param  {Int} fromIndex
   * @param  {Int} toIndex
   * @param  {CustomDate} fromDate
   * @param  {CustomDate} toDate
   * @return {Boolean}
   */
  cacheCoversPeriod(fromIndex, toIndex, fromDate, toDate) {
    assert(fromIndex <= toIndex, `Invalid indexes passed: ${fromIndex}, ${toIndex}`);
    assert(fromDate.diff(toDate) <= 0,
      `fromDate cannot be greater than toDate: ${fromDate.toString()}, ${toDate.toString()}`);

    if (fromIndex < 0 || toIndex >= this.cache.length) { return false; }

    let allCoverFromToPeriod = true;
    let index = fromIndex;
    while (index <= toIndex && allCoverFromToPeriod) {
      const coversFromDate = this.cache[index].eventsFromDate.diff(fromDate) <= 0;
      const coversToDate = this.cache[index].eventsToDate.diff(toDate) >= 0;
      allCoverFromToPeriod = allCoverFromToPeriod && coversFromDate && coversToDate;
      index++;
    }
    return allCoverFromToPeriod;
  }

  // TODO: Add padding to loading amount and loading range in load functions
  /**
   * Loads subjects from the server. These subjects will be either
   * before or after loadSubjects.
   * @method loadSubjects
   * @param  {Int} amount
   * @param  {String} beforeAfter
   * @param  {Int} referenceId
   * @param  {CustomDate} fromDate
   * @param  {CustomDate} toDate
   * @return {Promise<Array<Object>>} - Array with subjects
   */
  async loadSubjects(amount, beforeAfter, referenceId, fromDate, toDate) {
    assert((beforeAfter === 'before' || beforeAfter === 'after'),
      `Invalid value for beforeAfter: ${beforeAfter}`);

    let loadedContent;
    if (beforeAfter === 'before') {
      console.warn('loadSubjects before not Implemented');
      loadedContent = await this.createCalendarContent([referenceId], amount, fromDate, toDate);
    } else {
      loadedContent = await this.createCalendarContent([referenceId], amount, fromDate, toDate);
    }

    this.processServerResponse(loadedContent);
    return loadedContent.subjects;
  }

  /**
   * Loads subject events from the server. For a particular set of subjects
   * specified by their ids.
   * @method loadEvents
   * @param  {Array<Int>} ids
   * @param  {CustomDate} fromDate
   * @param  {CustomDate} toDate
   * @return {Promise<Array<Object>>} - Resolves into an array of subject objects
   */
  async loadEvents(ids, fromDate, toDate) {
    const loadedContent = await this.createCalendarContent(ids, ids.length, fromDate, toDate);
    this.processServerResponse(loadedContent);
    return loadedContent.subjects;
  }

  /**
   * @method processServerResponse
   * @param  {Object} responseObj - A typical server response
   * @return {Void}
   */
  processServerResponse(responseObj) {
    this.moreToLoadAbove = responseObj.moreToLoadAbove;
    this.moreToLoadBelow = responseObj.moreToLoadBelow;
    this.addToCache(responseObj.subjects, responseObj.fromDate, responseObj.toDate);
  }
  /**
   * Adds loaded data to existing cache.
   * @method addToCache
   * @param  {Array} subjects
   * @param  {CustomDate} fromDate - Date where event data period coverage starts.
   * @param  {CustomDate} toDate - Date where event data period coverage ends.
   */
  addToCache(subjects, fromDate, toDate) {
    for (const subject of subjects) {
      const cached = this.getCachedVersion(subject);
      if (cached) {
        cached.eventsFromDate = CustomDate.getEarliest(cached.eventsFromDate, fromDate);
        cached.eventsToDate = CustomDate.getLatest(cached.eventsToDate, toDate);

        for (const event of subject.events) {
          cached.events.add(event);
        }
      } else {
        subject.eventsFromDate = fromDate;
        subject.eventsToDate = toDate;
        this.insertOrderedToCache(subject);
      }
    }
  }

  /**
   * Returns the subject object in cache, if it exists,
   * which corresponds to the parameter given.
   * @method getCachedVersion
   * @param  {Object} subject - Object to create a Subject instance.
   * @return {Object}
   */
  getCachedVersion(subject) {
    const cachedVersion = this.cache.find(cached => cached.id === subject.id);
    return cachedVersion;
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
    let i = 0;
    let cachedSubject = this.cache[i];
    let insertionIndex;
    while (cachedSubject) {
      if (subject.id < cachedSubject.id) {
        insertionIndex = i;
        break;
      }
      i++;
      cachedSubject = this.cache[i];
    }

    if (insertionIndex) {
      const deleteCount = 0;
      this.cache.splice(insertionIndex, deleteCount, subject);
    } else {
      this.cache.push(subject);
    }
  }

  /**
   * Creates random data
   * @method createCalendarContent
   * @return {Promise}
   */
  async createCalendarContent(startingIds, amount, fromDate, toDate) {
    function daysFromNow(days) {
      const date = new CustomDate();
      return date.add(days, 'days');
    }

    // Random number from 1 to 10
    function rand() {
      return parseInt(Math.random() * 10, 10);
    }

    const properties = [];
    const propNo = amount;
    const lastId = startingIds[startingIds.length - 1] || 1;
    let eventNo;
    let lastDate;

    for (let i = 0; i < propNo; i++) {
      properties[i] = {};
      properties[i].id = startingIds[i] || lastId + i - startingIds.length;
      properties[i].name = `Property - asdf asd fasdf asdfasd ${properties[i].id}`;
      properties[i].events = new Set();
      eventNo = rand() * 5;
      lastDate = rand();

      for (let j = 0; j < eventNo; j++) {
        const newEvent = {};
        newEvent.desc = `Event ${i + j}`;

        // Random true or false
        newEvent.visitable = !!rand();

        lastDate += rand();
        newEvent.start = daysFromNow(lastDate);
        lastDate += rand();
        newEvent.end = daysFromNow(lastDate);
        properties[i].events.add(newEvent);
      }
    }

    return {
      moreToLoadAbove: true,
      moreToLoadBelow: true,
      fromDate,
      toDate,
      subjects: properties,
    };
  }
}
