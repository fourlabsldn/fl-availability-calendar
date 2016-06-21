import Ajax from './Ajax';
import assert from 'fl-assert';
import CustomDate from '../utils/CustomDate';

export default class DataLoader {
  constructor(loadUrl) {
    this.ajaxNewSubjectsEvents = new Ajax(loadUrl);
    this.ajaxNewSubjects = new Ajax(loadUrl);
  }

  /**
   * @public
   * @method getSubjectsEvents
   * @param  {Array<Object>} ids
   * @param  {CustomDate} fromDate
   * @param  {CustomDate} toDate
   * @return {Object<Array<Object>>} - Each key is a subjectId and
   * each value an array of event objects
   */
  async getSubjectsEvents(subjects, fromDate, toDate) {
    if (subjects.length === 0) { return []; }
    const params = { ids: subjects.map(s => s.id), fromDate, toDate };
    const subjectsLoaded = await this.load(params, this.ajaxNewSubjectsEvents);

    const subjectsEvents = {};
    subjectsLoaded.forEach(s => { subjectsEvents[s.id] = s; });

    // check that all subjects were loaded
    subjects.forEach(
      s => assert(subjectsEvents[s.id], `Events for subject of id "${s.id}" not loaded.`)
    );
    return subjectsEvents;
  }

  /**
   * @public
   * @method getSubjects
   * @param  {Int} amount
   * @param  {String} position 'begigging' or 'end'
   * @param  {Object | Subject} referenceSubj
   * @return {Array<Object>}
   */
  async getSubjects(amount, position, referenceSubj, fromDate, toDate) {
    const params = {
      fromDate,
      toDate,
      referenceId: referenceSubj ? referenceSubj.id : null,
      recordCount: amount,
      beforeAfter: position === 'end' ? 'after' : 'before',
    };

    const subjectsLoaded = await this.load(params, this.ajaxNewSubjects);
    return subjectsLoaded;
  }

  /**
   * Performs an ajax call
   * @private
   * @method load
   * @param  {Object} params
   * @param  {Function} ajaxFunc
   * @return {Array<Object>}
   */
  async load(params, ajaxFunc) {
    params.fromDate = params.fromDate.toISOString(); // eslint-disable-line no-param-reassign
    params.toDate = params.toDate.toISOString(); // eslint-disable-line no-param-reassign

    const response = await ajaxFunc.query(params);
    const subjects = this.processServerResponse(response);
    return subjects;
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

    // TODO: this from and to dates are not needed any more.
    const fromDate = new CustomDate(responseObj.fromDate);
    const toDate = new CustomDate(responseObj.toDate);

    assert(fromDate.isValid() && toDate.isValid(), 'fromDate or fromToDate not in responseObj.');
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
