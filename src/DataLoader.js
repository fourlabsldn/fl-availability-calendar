import assert from 'fl-assert';
import CustomDate from './CustomDate';

const CONTENT_LOADING_PADDING = 40;
const MAX_LOADED_RANGE = 120; // in days

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

    // TODO: Initialise this to something that makes sense
    this.loadedContentStart = new CustomDate();
    this.loadedContentEnd = new CustomDate();

    // How many days before and after each event range to query.
    this.requestPadding = 30;

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

  // ---------------------------------------------------------------------------
  // Setters
  // ---------------------------------------------------------------------------

  getLoadedContentStart() {
    return this.loadedContentStart;
  }

  getLoadedContentEnd() {
    return this.loadedContentEnd;
  }

  // ---------------------------------------------------------------------------
  // Getters
  // ---------------------------------------------------------------------------

  /**
   * @method getEventsForIds
   * @param  {Array<Int>} idsToLoad
   * @param  {CustomDate} fromDate
   * @param  {CustomDate} toDate
   * @return {Promise<Object>>} - Promise resolves into an object where
   *                                     each key is a subject id and each value
   *                                     is an array of events.
   */
   // NOTE: The secret here is not loading events just for the ids requested,
   // but for all ids, so that we always have a standard start and end
   // date loaded from.
  async getEventsForIds(idsToLoad, fromDate, toDate) {
    // Load events for all ids.
    const allIds = this.cache.map(subj => subj.id);
    const events = await this.loadEvents(allIds, fromDate, toDate);

    const responseObject = {};
    for (const id of idsToLoad) {
      responseObject[id] = events[id];
    }

    return responseObject;
  }

  // TODO: Use config object with {before: 5, after: 6, ids: [1,2,3]}
  getSubjects(
    amount,
    beforeAfter = 'after',
    referenceId
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

    return this.getCacheSection(fromIndex, toIndex);
  }

  /**
   * Returns a section from the cache or fetches it from the server
   * @method getCacheSection
   * @param  {Int} fromIndex
   * @param  {Int} toIndex
   * @param  {CustomDate} fromDate
   * @param  {CustomDate} toDate
   * @return {Promise<Array<Object>>} Resolves to an array of subject objects.
   */
  async getCacheSection(fromIndex, toIndex) {
    const needsIndexesAbove = fromIndex < 0;
    const needsIndexesBelow = toIndex >= this.cache.length;

    const cachedFrom = Math.max(0, fromIndex);
    const cachedTo = Math.max(0, Math.min(toIndex, this.cache.length - 1));
    // We add one because the slice method does not include the 'to' index.
    const cachedSubjects = this.cache.slice(cachedFrom, cachedTo + 1);

    const serverRequests = [[], []];
    if (needsIndexesAbove && this.moreToLoadAbove) {
      // Plus one because the reference object is also returned
      const amount = Math.abs(fromIndex) + 1;
      const referenceId = this.cache.firstElementId();
      serverRequests[0] = this.loadSubjects(amount, 'before', referenceId);
    }

    if (needsIndexesBelow && this.moreToLoadBelow) {
      // Minimum two because reference object is also returned
      // Plus one because indexes are zero indexed and lengths are one indexed.
      const amount = Math.max(toIndex + 1 - this.cache.length, 2);
      const referenceId = this.cache.lastElementId();
      serverRequests[1] = this.loadSubjects(amount, 'after', referenceId);
    }

    const [indexesAbove, indexesBelow] = await Promise.all(serverRequests);
    return indexesAbove.concat(cachedSubjects, indexesBelow);
  }

  // ---------------------------------------------------------------------------
  // Modifiers
  // ---------------------------------------------------------------------------

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
  async loadSubjects(amount, beforeAfter, referenceId) {
    assert((beforeAfter === 'before' || beforeAfter === 'after'),
      `Invalid value for beforeAfter: ${beforeAfter}`);

    const requestFrom = this.loadedContentStart;
    const requestTo = this.loadedContentEnd;

    let loadedContent;
    if (beforeAfter === 'before') {
      loadedContent = {
        moreToLoadAbove: false,
        moreToLoadBelow: true,
        requestFrom,
        requestTo,
        subjects: [],
      };
    } else {
      loadedContent = await this.createCalendarContent(
        [referenceId],
        amount,
        requestFrom,
        requestTo
      );

      // Remove reference object if any
      if (referenceId) {
        loadedContent.subjects = loadedContent.subjects.slice(1);
      }
    }

    this.processServerResponse(loadedContent, requestFrom, requestTo);
    return loadedContent.subjects;
  }

  /**
   * Loads subject events from the server. For a particular set of subjects
   * specified by their ids.
   * @method loadEvents
   * @param  {Array<Int>} ids
   * @param  {CustomDate} fromDate
   * @param  {CustomDate} toDate
   * @return {Promise<Object>} - Resolves into an object where each key is an id
   *                             and each value an events array
   */
  async loadEvents(ids, fromDate, toDate) {
    const { loadFrom, loadTo } = this.calculateLoadingDate(fromDate, toDate);

    const loadedContent = await this.createCalendarContent(ids, ids.length, loadFrom, loadTo);
    this.processServerResponse(loadedContent, loadFrom, loadTo);

    const responseObj = {};
    for (const subject of loadedContent.subjects) {
      responseObj[subject.id] = subject.events;
    }

    console.log(`LOAD EXECUTED
      FROM ${loadFrom.format('DD/MM/YY')} TO ${loadTo.format('DD/MM/YY')}`);
    return responseObj;
  }

  calculateLoadingDate(fromDate, toDate) {
    const fromIsBeforeLoadedFrom = this.loadedContentStart.diff(fromDate) > 0;
    const toIsAfterLoadedTo = this.loadedContentEnd.diff(toDate) < 0;

    const earliestFrom = fromIsBeforeLoadedFrom ? fromDate : this.loadedContentStart;
    const latestTo = toIsAfterLoadedTo ? toDate : this.loadedContentEnd;

    const widestRangeWithinLoadLimit =
      latestTo.diff(earliestFrom) + CONTENT_LOADING_PADDING < MAX_LOADED_RANGE;

    let loadFrom = this.loadedContentStart;
    let loadTo = this.loadedContentEnd;

    if (widestRangeWithinLoadLimit) {
      if (fromIsBeforeLoadedFrom) {
        loadFrom = new CustomDate(fromDate).add(-CONTENT_LOADING_PADDING, 'days');
      } else if (toIsAfterLoadedTo) {
        loadTo = new CustomDate(toDate).add(CONTENT_LOADING_PADDING, 'days');
      }
    } else {
      loadFrom = new CustomDate(fromDate).add(-CONTENT_LOADING_PADDING, 'days');
      loadTo = new CustomDate(toDate).add(CONTENT_LOADING_PADDING, 'days');
    }

    return {
      loadFrom,
      loadTo,
    };
  }

  /**
   * @method processServerResponse
   * @param  {Object} responseObj - A typical server response
   * @return {Void}
   */
  processServerResponse(responseObj, loadedFrom, loadedUntil) {
    assert(loadedFrom && loadedUntil, 'loadedFrom or loadedUntil not provided.');
    this.moreToLoadAbove = responseObj.moreToLoadAbove;
    this.moreToLoadBelow = responseObj.moreToLoadBelow;
    this.loadedContentStart = loadedFrom;
    this.loadedContentEnd = loadedUntil;
    this.addToCache(responseObj.subjects);
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
      if (cacheIndex >= 0) {
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
    let i = 0;
    let cachedSubject = this.cache[i];
    let insertionIndex = i;
    while (cachedSubject) {
      if (subject.id < cachedSubject.id) {
        break;
      }
      i++;
      insertionIndex = i;
      cachedSubject = this.cache[i];
    }

    const deleteCount = 0;
    this.cache.splice(insertionIndex, deleteCount, subject);
  }

  /**
   * Creates random data
   * @method createCalendarContent
   * @return {Promise}
   */
  async createCalendarContent(startingIds, amount, fromDate, toDate) {
    // TODO: Minimise network requests.
    console.log('NETWORK REQUEST');
    // Random number from 1 to 10
    function rand(max = 10) {
      const randomNum = parseInt(Math.random() * max, 10);
      return Math.max(1, randomNum);
    }

    const dateVariation = toDate.diff(fromDate, 'days');
    const maxEventLength = Math.min(10, parseInt(dateVariation / 2, 10));
    const maxEventSpacing = Math.min(10, parseInt(dateVariation / 4, 10));
    const properties = [];
    const propNo = amount;
    const lastId = startingIds[startingIds.length - 1] || 0;
    let eventCount = 0;

    for (let i = 0; i < propNo; i++) {
      properties[i] = {};
      properties[i].id = startingIds[i] || lastId + i - startingIds.length + 1;
      properties[i].name = `Property - asdf asd fasdf asdfasd ${properties[i].id}`;
      properties[i].events = new Set();

      const lastDate = new CustomDate(fromDate);
      let eventsCoverWholePeriod;

      do {
        const newEvent = {};
        newEvent.desc = `Event ${eventCount}`;
        newEvent.status = !!rand() ? 'busy' : 'half-busy';

        lastDate.add(rand(maxEventSpacing), 'days');
        newEvent.start = new CustomDate(lastDate);

        lastDate.add(rand(maxEventLength), 'days');
        newEvent.end = new CustomDate(lastDate);

        properties[i].events.add(newEvent);
        eventCount++;
        eventsCoverWholePeriod = toDate.diff(lastDate) < 0;
      } while (!eventsCoverWholePeriod);
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
