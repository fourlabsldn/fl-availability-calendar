// import Day from './Day';
// import CustomDate from '../utils/CustomDate';
import ViewController from '../ViewController';

export default class SubjectRow extends ViewController {
  constructor(subject, rowStartDate, rowEndDate, modulePrefix) {
    super(modulePrefix);
    this.subject = subject;
    this.setEvents(subject.events, rowStartDate, rowEndDate);
  }

  buildHtml() {

  }

  /**
   * @public
   * @method getSubject
   * @return {Object}
   */
  getSubject() {
    return this.subject;
  }

  /**
   * @public
   * @method setEvents
   * @param  {Array<Object>} events - Ordered events index
   * @param  {CustomDate} rowStartDate
   * @param  {CustomDate} rowEndDate
   */
  setEvents(events, rawRowStartDate, rawRowEndDate) {
    const rowStartDate = rawRowStartDate.startOf('day');
    const rowEndDate = rawRowEndDate.endOf('day');

    const frag = document.createDocumentFragment();
    const eventsIterator = events[Symbol.iterator]();
    let currEvent = eventsIterator.next();
    while (!currEvent.done && currEvent.value.end.isBefore(rowStartDate)) {
      currEvent = eventsIterator.next();
    }

    while (!currEvent.done && !currEvent.value.start.isAfter(rowEndDate)) {
      const newEvent = this.createEvent(currEvent.value, rowStartDate, rowEndDate);
      frag.appendChild(newEvent);
      currEvent = eventsIterator.next();
    }

    this.html.container.innerHTML = '';
    this.html.container.appendChild(frag);
  }

  createEvent(event, rowStartDate, rowEndDate) {
    const dayWidth = '2em';
    const eventStart = event.start.isBefore(rowStartDate)
      ? rowStartDate
      : event.start.startOf('day');
    const eventEnd = event.end.isAfter(rowEndDate)
      ? rowEndDate
      : event.end.startOf('day');

    const offset = Math.max(0, eventStart.diff(rowStartDate, 'days'));
    const duration = eventEnd.diff(eventStart, 'days') + 1;

    const eventEl = document.createElement('div');
    eventEl.classList.add(`${this.cssPrefix}-event`);
    eventEl.classList.add(`${this.cssPrefix}-event--${event.status}`);
    if (event.className) { eventEl.classList.add(`${event.className}`); }
    eventEl.style.width = `calc(${duration} * ${dayWidth})`;
    eventEl.style.left = `calc(${offset} * ${dayWidth})`;

    const title = `${event.start.format('DD/MM')} - ${event.end.format('DD/MM')}
    ID - ${event.subjectId}`;
    eventEl.setAttribute('title', title);
    return eventEl;
  }
}
