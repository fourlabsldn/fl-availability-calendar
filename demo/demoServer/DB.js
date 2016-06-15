/* eslint-env node */
const moment = require('moment');

module.exports = class DB {
  constructor(data) {
    this.data = data;
  }

  /**
   * @method getEventsForIds
   * @param  {Array<int>} ids
   * @param  {String} fromDate ISO String
   * @param  {String} toDate ISO String
   * @return {Array<Object>} Array of event objects
   */
  get(ids, fromDateRaw, toDateRaw) {
    const fromDateNum = moment(parseInt(fromDateRaw, 10));
    const toDateNum = moment(parseInt(toDateRaw, 10));
    const fromDate = moment(fromDateNum);
    const toDate = moment(toDateNum);

    if (!fromDate.isValid() || !toDate.isValid()) {
      return [{ err: 'Invalid date' }];
    }
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
    if (!referenceId) {
      return this.data.slice(0, amount).map(s => s.id);
    }
    const refIndex = this.data.findIndex(r => r.id === referenceId);
    if (refIndex === -1) {
      return [{ errrrr: 'errrr' }];
    }

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

    return this.data.slice(fromIndex, toIndex).map(s => s.id);
  }
};
