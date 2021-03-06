import ViewController from '../ViewController';
import Configuration from '../Configuration';
import EventCentral from '../EventCentral';

export default class SubjectRow extends ViewController {
  constructor(subject, rowStartDate, rowEndDate, modulePrefix) {
    super(modulePrefix);
    this.subject = subject;

    // On event click
    this.html.container.addEventListener('click', (e) => {
      const eventData = getEventDataFromElement(e.target);
      const evtClickCallback = Configuration.get('eventClickCallback');
      if (eventData && evtClickCallback) {
        evtClickCallback(eventData, subject, e);
      }
    });

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

    const eventClass = `${this.cssPrefix}-event--${event.status}`;
    eventEl.classList.add(eventClass);
    if (event.className) { eventEl.classList.add(`${event.className}`); }
    eventEl.style.width = `calc(${duration} * ${dayWidth})`;
    eventEl.style.left = `calc(${offset} * ${dayWidth})`;

    const hoverTextGenerator = Configuration.get('eventHoverTextGenerator');
    const title = hoverTextGenerator
      ? hoverTextGenerator(event)
      : `${event.start.format('DD/MM')} - ${event.end.format('DD/MM')}

    ID - ${event.subjectId}`;
    eventEl.setAttribute('title', title);

    setEventDataToElement(event, eventEl);
    EventCentral.trigger('eventCreated', event, eventClass);
    return eventEl;
  }
}

function setEventDataToElement(data, el) {
  el.eventData = data;
}

function getEventDataFromElement(el) {
  return el.eventData;
}
