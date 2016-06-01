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
  }

  /**
   * Returns promise to resolve into subjects, either from cache or loaded
   * from the server.
   * @method getFromId
   * @param  {Int} id
   * @param  {Int} amount
   * @param  {CustomDate} fromDate
   * @param  {CustomDate} toDate
   * @return {Promise<Array>}
   */
  getFromId(id, amount, fromDate, toDate) {
    let targetIndex = this.cache.findIndex(subj => subj.id === id);
    if (this.cache.length === 0) {
      targetIndex = 0;
    }
    assert(targetIndex >= 0, `Invalid target Index: ${targetIndex}`);

    const toIndex = targetIndex + amount - 1;
    const fromIndex = targetIndex;
    return this.getCacheSection(fromIndex, toIndex, fromDate, toDate);
  }

  /**
   * Returns promise to resolve into subjects, either from cache or loaded
   * from the server.
   * @method getFromId
   * @param  {Int} id
   * @param  {Int} amount
   * @param  {CustomDate} fromDate
   * @param  {CustomDate} toDate
   * @return {Promise<Array>}
   */
  getUntilId(id, amount, fromDate, toDate) {
    let targetIndex = this.cache.findIndex(subj => subj.id === id);
    if (this.cache.length === 0) {
      targetIndex = 0;
    }
    assert(targetIndex >= 0, `Invalid target Index: ${targetIndex}`);

    const fromIndex = targetIndex - amount + 1;
    const toIndex = targetIndex;
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
  getCacheSection(fromIndex, toIndex, fromDate, toDate) { // eslint-disable-line complexity
    let needsLoadingFromServer = false;
    let loadTopBottom;
    const loadReferenceIds = [];
    if (fromIndex < 0 && this.moreToLoadAbove) {
      needsLoadingFromServer = true;
      loadTopBottom = 'top';
      loadReferenceIds.push(this.cache[toIndex] ? this.cache[toIndex].id : null);
    } else if (toIndex > this.cache.length && this.moreToLoadBelow) {
      needsLoadingFromServer = true;
      loadTopBottom = 'bottom';
      loadReferenceIds.push(this.cache[fromIndex] ? this.cache[fromIndex].id : null);
    } else {
      fromIndex = Math.min(fromIndex, this.cache.length); // eslint-disable-line no-param-reassign
      toIndex = Math.max(toIndex, 0); // eslint-disable-line no-param-reassign
      needsLoadingFromServer =
        !this.cacheSectionCoversPeriod(fromIndex, toIndex, fromDate, toDate);
      for (let index = fromIndex; index <= toIndex; index++) {
        loadReferenceIds.push(this.cache[index].id);
      }
    }

    if (needsLoadingFromServer) {
      const loadFrom = new CustomDate(fromDate).add(-30, 'days');
      const loadTo = new CustomDate(toDate).add(30, 'days');
      const amountRequested = toIndex - fromIndex + 1;
      const loadAmount = amountRequested + 30;

      return this.load(loadFrom, loadTo, loadReferenceIds, loadAmount, loadTopBottom)
        .then((data) => {
          return (data && data.subjects) ? data.subjects.slice(0, amountRequested) : [];
        });
    }

    return new Promise((resolve) => {
      resolve(this.cache.slice(fromIndex, toIndex));
    });
  }


  /**
   * Checks whether in a portion of the cache all subjects have event
   * data for the totality of a period.
   * @method cacheSectionCoversPeriod
   * @param  {[type]} fromIndex [description]
   * @param  {[type]} toIndex [description]
   * @param  {[type]} fromDate [description]
   * @param  {[type]} toDate [description]
   * @return {[type]} [description]
   */
  cacheSectionCoversPeriod(fromIndex, toIndex, fromDate, toDate) {
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
  /**
   * Fetches data from the server
   * @method load
   * @param  {CustomDate} fromDate
   * @param  {CustomDate} toDate
   * @param  {Array<String>} ids - Subject ids
   * @param  {Int} [idCountToLoad] - How many new ids to be loaded
   * @param  {String} [Method]
   * @return {Promise<Object>}
   */
  load(fromDate, toDate, ids, idCountToLoad = 0, topBottom, method = 'GET') {
    assert(method); // To be removed
    console.log('Loaded');
    // return fetch(this.loadUrl, {
    //   method,
    //   credentials: 'include',
    // })
    // .then((res) => res.json())
    return new Promise((resolve) => {
      const newData = this.createCalendarContent(ids, idCountToLoad, fromDate, toDate);
      this.addToCache(newData);
      this.moreToLoadAbove = newData.moreToLoadAbove;
      this.moreToLoadBelow = newData.moreToLoadBelow;
      resolve(newData);
    })
    .catch((err) => assert(false, err));
  }

  /**
   * Adds loaded data to existing cache.
   * @method addToCache
   * @param  {Object} data
   * @param  {CustomDate} data.fromDate
   * @param  {CustomDate} data.toDate
   * @param  {Array} data.subjects
   */
  addToCache(data) {
    for (const subject of data.subjects) {
      const cachedVersion = this.getCachedVersion(subject);
      if (cachedVersion) {
        cachedVersion.eventsFromDate =
          CustomDate.getEarliest(cachedVersion.eventsFromDate, data.fromDate);
        cachedVersion.eventsToDate =
          CustomDate.getLatest(cachedVersion.eventsToDate, data.toDate);

        for (const event of subject.events) {
          cachedVersion.events.add(event);
        }
      } else {
        subject.eventsFromDate = data.fromDate;
        subject.eventsToDate = data.toDate;
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
    const cachedVersion = this.cache.find(cachedSubject => {
      return cachedSubject.id === subject.id;
    });
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
   * @return {Object}
   */
  createCalendarContent(startingIds, amount, fromDate, toDate) {
    function daysFromNow(days) {
      return new Date(Date.now() + (days * 86400000));
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
        newEvent.start = daysFromNow(lastDate).getTime();
        lastDate += rand();
        newEvent.end = daysFromNow(lastDate).getTime();
        properties[i].events.add(newEvent);
      }
    }

    return {
      moreToLoadAbove: false,
      moreToLoadBelow: false,
      fromDate,
      toDate,
      subjects: properties,
    };
  }
}
