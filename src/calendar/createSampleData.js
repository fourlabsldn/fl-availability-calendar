// Create content to use as example.
export default function createCalendarContent() {
  'use strict';

  function daysFromNow(days) {
    return new Date(Date.now() + (days * 86400000));
  }

  // Random number from 1 to 10
  function rand() {
    return parseInt(Math.random() * 10);
  }

  var properties = [];
  var propNo = 10000;
  var eventNo;
  var lastDate;

  for (var i = 0; i < propNo; i++) {
    properties[i] = {};
    properties[i].title = 'Property - asdf asd fasdf asdfasd' + (i + 1);
    properties[i].events = [];
    eventNo = rand() * 5;
    lastDate = rand();

    for (var j = 0; j < eventNo; j++) {
      properties[i].events[j] = {};
      properties[i].events[j].desc = 'Event' + i + j;

      // Random true or false
      properties[i].events[j].visitable = !!rand();

      lastDate += rand();
      properties[i].events[j].start = daysFromNow(lastDate).getTime();
      lastDate += rand();
      properties[i].events[j].end = daysFromNow(lastDate).getTime();
    }
  }

  return {
    subjects: properties,
  };
}
