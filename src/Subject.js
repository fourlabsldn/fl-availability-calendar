import assert from 'fl-assert';
import ViewController from './ViewController';
import Day from './Day';
import CustomDate from './CustomDate';

const CLASS_PREFIX = 'subject';

export default class Subject extends ViewController {
  /**
   * @method constructor
   * @param  {Object} config
   * @param  {String} config.name
   * @param  {Int | String} config.id
   * @param  {String} modulePrefix
   * @return {Subject}
   */
  constructor(config, startDate, modulePrefix) {
    super();
    assert(typeof config.name === 'string', `Invalid subject name: ${config.name}`);
    this.name = config.name;
    this.id = config.id;

    this.cssPrefix = `${modulePrefix}-${CLASS_PREFIX}`;

    this.startDate = startDate;
    this.days = [];

    // It must be ordered chronologically
    this.events = new Set();
    this.orderedeEvents = [];

    this.eventsLoadedRange = {
      from: config.eventsFromDate,
      to: config.eventsToDate,
    };
    this.destroyed = false;
    Object.preventExtensions(this);

    this.setEvents(config.events);
    this.buildHtml();
  }

  buildHtml() {
    this.html.container.classList.add(this.cssPrefix);

    this.html.nameContainer = document.createElement('div');
    this.html.nameContainer.classList.add(`${this.cssPrefix}-name`);
    this.html.nameContainer.innerHTML = this.name;
    this.html.nameContainer.setAttribute('title', this.name);
    this.html.container.appendChild(this.html.nameContainer);

    this.html.daysContainer = document.createElement('div');
    this.html.daysContainer.classList.add(`${this.cssPrefix}-days`);
    this.html.container.appendChild(this.html.daysContainer);
  }

  // ---------------------------------------------------------------------------
  // Setters
  // ---------------------------------------------------------------------------
  /**
   * @method setEvents
   * @param  {Array<Object>} events
   */
  setEvents(events) {
    this.checkIfdestroyed();

    for (const event of events) {
      this.events.add(event);
    }
    this.updateOrderedEvents();
    this.refreshDayEvents();
  }

  /**
   * @method setStartDate
   * @param  {CustomDate} date
   */
  setStartDate(date) {
    this.checkIfdestroyed();

    this.startDate = date;
    const dayCount = this.getDayCount();
    this.setDayCount(0);
    this.setDayCount(dayCount);
  }

  setEventsLoadedFrom(date) {
    if (this.orderedeEvents[0]) {
      const firstBusyDate = this.orderedeEvents[0].start;
      const dateIsAfterFirstBusyDate = (date.diff(firstBusyDate) > 0);
      if (dateIsAfterFirstBusyDate) {
        assert(
          false,
          'Invalid date provided for EventLoadedFrom. Date is after first busy date.'
        );
      }
    }
    this.eventsLoadedRange.from = date;
  }

  setEventsLoadedTo(date) {
    if (this.orderedeEvents[0]) {
      const lastBusyDate = this.orderedeEvents[this.orderedeEvents.length - 1];
      const dateIsBeforeLastBusyDate = (date.diff(lastBusyDate) < 0);
      if (dateIsBeforeLastBusyDate) {
        assert(
          false,
          'Invalid date provided for EventLoadedTo. Date is before last busy date.'
        );
      }
    }
    this.eventsLoadedRange.to = date;
  }
  // ---------------------------------------------------------------------------
  // Getters
  // ---------------------------------------------------------------------------
  getId() {
    return this.id;
  }

  getDayCount() {
    return this.days.length;
  }

  getEventsLoadedRange() {
    assert(
      (this.eventsLoadedRange.from instanceof CustomDate &&
        this.eventsLoadedRange.to instanceof CustomDate),
      'Uninitialised eventsLoadedRange');
    return this.eventsLoadedRange;
  }

  checkIfdestroyed() {
    assert(!this.destroyed, 'Tried to invoke a method of a destroyed Subject object');
  }

  /**
   * @method getDateEvents
   * @param  {CustomDate} date [description]
   * @return {Array<Object>}
   */
  getDateEvents(date) {
    this.checkIfdestroyed();

    const events = this.orderedeEvents;
    if (!events.length) { return []; }

    let eventIndex = 0;
    let event = events[eventIndex];
    const dayEvents = [];

    // While events are starting before or at the date we are evaluating
    while (event && date.diff(event.start) >= 0) {
      // Add to dayEvents if it finishes on or after the date in question.
      if (date.diff(event.end) <= 0) {
        dayEvents.push(event);
      }

      eventIndex++;
      event = events[eventIndex];
    }
    return dayEvents;
  }

  // ---------------------------------------------------------------------------
  // Modifiers
  // ---------------------------------------------------------------------------

  updateOrderedEvents() {
    const ordered = [];
    for (const event of this.events) {
      insertInOrder(event, ordered);
    }
    this.orderedeEvents = ordered;

    function insertInOrder(event, arr) {
      let i = 0;
      while (arr[i] && arr[i].start.diff(event.start) < 0) {
        i++;
      }
      arr.splice(i, 0, event);
    }
  }

  refreshDayEvents() {
    this.checkIfdestroyed();

    this.days.forEach(day => {
      const dayEvents = this.getDateEvents(day.date);
      day.setEvents(dayEvents);
    });
  }

  /**
   * @method addDay
   * @param  {String} position - Accepts 'front' or 'back'
   */
  addDay(position = 'front') {
    this.checkIfdestroyed();

    if (position === 'front') {
      const newDate = new CustomDate(this.startDate).add(this.getDayCount() + 1, 'days');
      const dateEvents = this.getDateEvents(newDate);
      const newDay = new Day(newDate, dateEvents, this.cssPrefix);

      this.days.push(newDay);
      this.html.daysContainer.appendChild(newDay.html.container);
    } else if (position === 'back') {
      const newDate = new CustomDate(this.startDate).add(-1, 'days');
      const dateEvents = this.getDateEvents(newDate);
      const newDay = new Day(newDate, dateEvents, this.cssPrefix);

      this.days = [newDay].concat(this.days);
      const firstDay = this.days[0];
      if (firstDay) {
        this.html.daysContainer.insertBefore(
          newDay.html.container,
          firstDay.html.container
        );
      } else {
        this.html.daysContainer.appendChild(newDay.html.container);
      }
    } else {
      assert(false, `Invalid position value. Expected 'front' or 'back', gor '${position}'`);
    }
  }

  /**
   * @method removeDay
   * @param  {String} position - Accepts 'front' or 'back'
   */
  removeDay(position) {
    this.checkIfdestroyed();

    if (position === 'front') {
      const dayRemoved = this.days.push();
      dayRemoved.destroy();
    } else if (position === 'back') {
      if (this.getDayCount() === 0) { return; }

      const [dayRemoved] = this.days.splice(0, 1);
      dayRemoved.destroy();
    } else {
      assert(false, `Invalid position value. Expected 'front' or 'back', gor '${position}'`);
    }
  }

  destroy() {
    this.checkIfdestroyed();

    this.days = null;
    this.html.container.remove();
    this.destroyed = true;
  }


}
