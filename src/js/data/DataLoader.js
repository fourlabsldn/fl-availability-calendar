import Ajax from './Ajax';
import assert from 'fl-assert';
import CustomDate from '../utils/CustomDate';
import Configuration from '../Configuration';

export default class DataLoader {
  constructor() {
    const loadUrl = Configuration.get('loadUrl');

    Configuration.onChange('loadUrl', (newUrl) => {
      this.ajaxNewSubjectsEvents.seturl(newUrl);
      this.ajaxNewSubjects.setUrl(newUrl);
    });

    this.ajaxNewSubjectsEvents = new Ajax(loadUrl);
    this.ajaxNewSubjects = new Ajax(loadUrl);
  }

  /**
   * @public
   * @method getSubjectsEvents
   * @param  {Array<Object>} ids
   * @param  {CustomDate} fromDate
   * @param  {CustomDate} toDate
   * @return {<Array<Object>>}
   */
  async getSubjectsEvents(subjects, fromDate, toDate) {
    if (subjects.length === 0) { return []; }
    const params = { ids: subjects.map(s => s.id), fromDate, toDate };
    const subjectsLoaded = await this.load(params, this.ajaxNewSubjectsEvents);

    // check that all subjects were loaded
    subjects.forEach(
      s => assert(subjectsLoaded.find(l => l.id === s.id),
          `Events for subject of id "${s.id}" not loaded.`)
    );
    return subjectsLoaded;
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
    const dateRange = {
      fromDate: params.fromDate.toISOString(), // eslint-disable-line no-param-reassign
      toDate: params.toDate.toISOString(), // eslint-disable-line no-param-reassign
    };

    const filters = Configuration.get('filters') || {};
    const credentials = Configuration.get('credentials') || {};
    const queryParams = Object.assign({}, params, filters, credentials, dateRange);
    const response = await ajaxFunc.query(queryParams);
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
        // TODO: FIXME: REMOVE THIS SUBJECTID
        e.subjectId = s.id;
      });
    });

    // TODO: this from and to dates are not needed any more.
    const fromDate = new CustomDate(responseObj.fromDate);
    const toDate = new CustomDate(responseObj.toDate);

    assert(fromDate.isValid() && toDate.isValid(), 'fromDate or fromToDate not in responseObj.');
    return responseObj.subjects;
  }

  /**
   * @public
   * @method setCredentials
   * @param  {Object} credentials
   */
  setCredentials(credentials) {
    this.credentials = credentials;
  }

  /**
   * @public
   * @method setCredentials
   * @param  {Object} credentials
   */
  setFilter(filter) {
    this.filter = filter;
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
