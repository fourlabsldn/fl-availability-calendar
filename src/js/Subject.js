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
  constructor(config, modulePrefix) {
    super();
    assert(typeof config.name === 'string', `Invalid subject name: ${config.name}`);
    this.name = config.name;
    this.id = config.id;

    this.cssPrefix = `${modulePrefix}-${CLASS_PREFIX}`;

    this.startDate = new CustomDate(startDate);
    this.days = [];

    // It must be ordered chronologically
    this.events = new Set();
    this.orderedeEvents = [];

    this.eventsLoadedRange = {
      from: new CustomDate(config.eventsFromDate),
      to: new CustomDate(config.eventsToDate),
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
   * @param  {Array<Object> | Set<Object>} events
   * @param  {CustomDate} fromDate
   * @param  {CustomDate} toDate
   */
  setEvents(events) {
    this.checkIfdestroyed();

    // Replace last events for new ones
    this.events = events;
    // for (const event of events) {
    //   this.events.add(event);
    // }
    this.updateOrderedEvents();
    this.refreshDayEvents();
  }

  /**
   * @method setStartDate
   * @param  {CustomDate} date
   */
  setStartDate(newstartDate) {
    this.checkIfdestroyed();

    const daysDiff = newstartDate.diff(this.startDate, 'days');
    const absoluteDiff = Math.abs(daysDiff);
    const dayCount = this.getDayCount();

    if (absoluteDiff >= dayCount) {
      this.removeMultipleDays('front', dayCount);
      this.startDate = new CustomDate(newstartDate);
      this.addMultipleDays('front', dayCount);
    } else {
      const removeFrom = (daysDiff < 0) ? 'front' : 'back';
      const addTo = (daysDiff < 0) ? 'back' : 'front';

      // In this case the startDate is changed in the add
      // and remove methods.
      this.removeMultipleDays(removeFrom, absoluteDiff);
      this.addMultipleDays(addTo, absoluteDiff);
    }
  }

  setEventsLoadedFrom(date) {
    if (this.orderedeEvents[0]) {
      const firstBusyDate = this.orderedeEvents[0].start;
      const dateIsAfterFirstBusyDate = (date.diff(firstBusyDate) > 0);
      if (dateIsAfterFirstBusyDate) {
        return;
      }
    }
    this.eventsLoadedRange.from = new CustomDate(date);
  }

  setEventsLoadedTo(date) {
    if (this.orderedeEvents[0]) {
      const lastBusyDate = this.orderedeEvents[this.orderedeEvents.length - 1].start;
      const dateIsBeforeLastBusyDate = (date.diff(lastBusyDate) < 0);
      if (dateIsBeforeLastBusyDate) {
        return;
      }
    }
    this.eventsLoadedRange.to = new CustomDate(date);
  }

  setDayCount(unsanitisedCount) {
    const count = parseInt(unsanitisedCount, 10);
    let dayCount = this.getDayCount();
    const method = dayCount < count ? 'addDay' : 'removeDay';
    let dayDiff = dayCount - count;

    while (dayDiff !== 0) {
      this[method]('front');
      dayCount += dayDiff > 0 ? -1 : 1;
      dayDiff = dayCount - count;
    }
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

  getEndDate() {
    const endDate = new CustomDate(this.startDate);
    const daysToAdd = Math.max(0, this.getDayCount() - 1);
    return endDate.add(daysToAdd, 'days');
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

    const addToFront = position === 'front';
    const firstDayToBeAdded = this.days.length === 0;
    assert(addToFront || position === 'back',
      `Invalid position value. Expected 'front' or 'back', gor '${position}'`);

    let newDate;
    if (firstDayToBeAdded) {
      newDate = new CustomDate(this.startDate);
    } else if (addToFront) {
      newDate = new CustomDate(this.getEndDate()).add(1, 'days');
    } else {
      newDate = (new CustomDate(this.startDate)).add(-1, 'days');
    }

    const dateEvents = this.getDateEvents(newDate);
    const newDay = new Day(newDate, dateEvents, this.cssPrefix);

    if (addToFront || firstDayToBeAdded) {
      this.days.push(newDay);
      requestAnimationFrame(() => {
        this.html.daysContainer.appendChild(newDay.html.container);
      });
    } else {
      this.days = [newDay].concat(this.days);
      requestAnimationFrame(() => {
        this.html.daysContainer.insertBefore(
          newDay.html.container,
          this.html.daysContainer.children[0]
        );
      });
      this.startDate = newDate;
    }
  }

  /**
   * @method removeDay
   * @param  {String} position - Accepts 'front' or 'back'
   */
  removeDay(position) {
    this.checkIfdestroyed();

    const fromFront = position === 'front';
    assert(fromFront || position === 'back',
      `Invalid position value. Expected 'front' or 'back', gor '${position}'`);

    if (this.getDayCount() === 0) { return; }

    if (fromFront) {
      const dayToBeRemoved = this.days.pop();
      dayToBeRemoved.destroy();
    } else {
      const [dayToBeRemoved] = this.days.splice(0, 1);
      dayToBeRemoved.destroy();
      this.startDate.add(1, 'days');
    }
  }

  /**
   * @method addMultipleDays
   * @param  {String} frontBack 'front' or 'back'
   * @param  {Int} amount
   * @return {Promise<Boolean>}
   */
  addMultipleDays(frontBack, amount) {
    for (let i = 0; i < amount; i++) {
      this.addDay(frontBack);
    }
  }

  /**
   * @method removeMultipleDays
   * @param  {String} frontBack 'front' or 'back'
   * @param  {Int} amount
   * @return {void}
   */
  removeMultipleDays(frontBack, amount) {
    for (let i = 0; i < amount; i++) {
      this.removeDay(frontBack);
    }
  }

  destroy() {
    this.checkIfdestroyed();

    this.days = null;
    this.destroyed = true;
    requestAnimationFrame(() => {
      this.html.container.remove();
    });
  }


}
