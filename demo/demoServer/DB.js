/* eslint-env node */
// const moment = require('moment');

module.exports = class DB {
  constructor(data) {
    this.data = data;
  }

  /**
   * @method getEventsForIds
   * @param  {Array<int>} ids
   * @param  {Moment} fromDate
   * @param  {Moment} toDate
   * @return {Array<Object>} Array of event objects
   */
  get(ids, fromDate, toDate) {
    const filteredRecords = this.data.filter(r => ids.indexOf(r.id) !== -1);
    const responseData = [];
    for (const record of filteredRecords) {
      const eventsWithinTimeframe = record.events.filter(event => {
        const beginAfterFromDate = fromDate.diff(event.start, 'days') <= 0;
        const endBeforeEndDate = toDate.diff(event.end, 'days') >= 0;
        return beginAfterFromDate && endBeforeEndDate;
      });

      const responseRecord = {};
      for (const prop of Object.keys(record)) {
        responseRecord[prop] = record[prop];
      }
      responseRecord.events = eventsWithinTimeframe;
      responseData.push(responseRecord);
    }

    return responseData;
  }

  getIds(beforeAfter, referenceId, amount) {
    if (typeof referenceId !== 'number') {
      return this.data.slice(0, amount).map(s => s.id);
    }
    const refIndex = this.data.findIndex(r => r.id === referenceId);
    if (refIndex === -1) {
      return [{ errrrr: 'errrr' }];
    }

    const fromIndex = beforeAfter === 'after'
      ? refIndex + 1
      : Math.max(0, refIndex - amount);
    const toIndex = beforeAfter === 'after'
      ? Math.min(refIndex + amount, this.data.length)
      : refIndex;

    return this.data.slice(fromIndex, toIndex).map(s => s.id);
  }
};
