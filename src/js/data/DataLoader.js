import Ajax from './Ajax';
import Cache from './Cache';
import assert from 'fl-assert';
import CustomDate from '../utils/CustomDate';

const CONTENT_LOADING_PADDING = 40;
const MAX_LOADED_RANGE = 120; // in days

export default class DataLoader {
  constructor(loadUrl) {
    this.cache = new Cache((a, b) => a.id - b.id);
    this.ajax = new Ajax(loadUrl);
    this.cacheStartDate = new CustomDate();
    this.cacheEndDate = new CustomDate();
    this.cache = [];
  }

  /**
   * @public
   * @method getEventsForSubjects
   * @param  {Array<Object>} ids
   * @param  {CustomDate} fromDate
   * @param  {CustomDate} toDate
   * @return {Array<Object>}
   */
  async getEventsForSubjects(subjects, fromDate, toDate) {
    // FIXME: Manage getting from cache
    await this.loadSubjects({
      ids,
      fromDate,
      toDate,
    });
  }

  /**
   * @public
   * @method getSubjects
   * @param  {Int} amount
   * @param  {String} position 'begigging' or 'end'
   * @param  {Object | Subject} referenceSubj
   * @return {Array<Object>}
   */
  async getSubjects(amount, position, referenceSubj) {
    const after = position === 'end';
    const cached = this.cache.get(amount, position, referenceSubj);

    const missingCount = amount - cached.length;
    if (missingCount === 0) { return cached; }

    let requestReferenceId = after ? cached[cached.length] : cached[0];
    requestReferenceId = requestReferenceId || referenceSubj.id;

    await this.loadSubjects({
      recordCount: amount,
      fromDate: this.cacheStartDate,
      toDate: this.cacheEndDate,
      referenceId: requestReferenceId,
      beforeAfter: after ? 'after' : 'before',
    });

    return this.cache.get(amount, position, referenceSubj);
  }

  /**
   * @private
   * @method loadSubjects
   * @param  {Object} params - pre request object
   * @return {Array<Object>}
   */
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
   * @private
   * @method calculateLoadingDate
   * @param  {CustomDate} fromDate
   * @param  {CustomDate} toDate
   * @return {Object}
   */
  calculateLoadingDate(fromDate, toDate) {
    const initialRange = toDate.diff(fromDate, 'days');
    const maximumPaddding = (MAX_LOADED_RANGE - initialRange) / 2;
    const padding = Math.min(maximumPaddding, CONTENT_LOADING_PADDING);
    const loadFrom = new CustomDate(fromDate).add(padding, 'days');
    const loadTo = new CustomDate(toDate).add(padding, 'days');
    return { loadFrom, loadTo };
  }

  /**
   * @private
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
    this.cache.set(responseObj.subjects);
    return responseObj.subjects;
  }
}


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
