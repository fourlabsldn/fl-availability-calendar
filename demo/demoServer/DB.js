/* eslint-env node */
const moment = require('moment');

module.exports = class DB {
  constructor(data) {
    this.data = data;
  }

  /**
   * @method getEventsForIds
   * @param  {Array<int>} ids
   * @param  {String | moment | Date} fromDate
   * @param  {String | moment | Date} toDate
   * @return {Array<Object>} Array of event objects
   */
  get(ids, fromDateRaw, toDateRaw) {
    const fromDate = moment(fromDateRaw);
    const toDate = moment(toDateRaw);

    const records = this.data.filter(sub => ids.indexOf(sub.id) !== -1);
    const events = records.map(r => r.events);
    const eventsWithinTimeframe = events.filter(event => {
      const beginAfterFromDate = fromDate.diff(event.start) <= 0;
      const endBeforeEndDate = toDate.diff(event.end) >= 0;
      return beginAfterFromDate && endBeforeEndDate;
    });

    return eventsWithinTimeframe;
  }

  getIds(beforeAfter, referenceId, amount) {
    const refIndex = this.data.findIndex(r => r.id === referenceId);
    if (refIndex === -1) { return []; }

    let fromIndex;
    let toIndex;
    if (beforeAfter === 'before') {
      const totalElementsBefore = refIndex;
      const responseSize = Math.min(totalElementsBefore, amount);
      fromIndex = Math.max(0, responseSize - 1);
      toIndex = refIndex;
    } else {
      const totalElementsAfter = refIndex + 1 - this.data.length;
      const responseSize = Math.min(totalElementsAfter, amount);
      fromIndex = Math.max(0, refIndex);
      toIndex = Math.max(0, responseSize - 1 + refIndex);
    }

    return this.data.slice(fromIndex, toIndex);
  }
};
