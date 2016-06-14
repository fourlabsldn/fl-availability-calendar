/* eslint-env node */
const moment = require('moment');
const DB = require('./DB');

/**
 * Creates random data
 * @method createCalendarContent
 * @return {Array}
 */

module.exports = function dbCreator(totalSubjects, fromDate, toDate) {
  // Random number from 1 to 10
  function rand(max = 10) {
    const randomNum = parseInt(Math.random() * max, 10);
    return Math.max(1, randomNum);
  }

  const maxEventLength = 10;
  const maxEventSpacing = 10;
  const subjects = [];

  for (let i = 0; i < totalSubjects; i++) {
    subjects[i] = {};
    subjects[i].id = i;
    subjects[i].name = `Property - Lorem Ipsum Dolor ${subjects[i].id}`;
    subjects[i].events = [];

    const lastDate = moment(fromDate);
    let eventsCoverWholePeriod;
    let eventCount = 0;
    do {
      const newEvent = {};
      newEvent.desc = `Event ${eventCount}`;
      newEvent.status = !!rand() ? 'busy' : 'half-busy';

      lastDate.add(rand(maxEventSpacing), 'days');
      newEvent.start = moment(lastDate);

      lastDate.add(rand(maxEventLength), 'days');
      newEvent.end = moment(lastDate);

      subjects[i].events.push(newEvent);
      eventCount++;
      eventsCoverWholePeriod = toDate.diff(lastDate) < 0;
    } while (!eventsCoverWholePeriod);
  }

  return new DB(subjects);
};
