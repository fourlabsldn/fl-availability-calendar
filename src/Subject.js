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

    this.startDate = null;
    this.days = [];
    // It must be ordered chronologically
    this.events = [];
    this.eventLoadedRange = { from: null, to: null };
    this.destroyed = false;
    Object.preventExtensions(this);

    this.buildHtml();
  }

  buildHtml() {
    this.html.container.classList.add(this.cssPrefix);

    this.html.nameContainer = document.createElement('div');
    this.html.nameContainer.classList.add(`${this.cssPrefix}-name`);
    this.html.nameContainer.innerHTML = this.name;
    this.html.container.appendChild(this.html.nameContainer);

    this.html.daysContainer = document.createElement('div');
    this.html.daysContainer.classList.add(`${this.cssPrefix}-days`);
    this.html.container.appendChild(this.html.daysContainer);
  }

  getId() {
    return this.id;
  }

  checkIfdestroyed() {
    assert(!this.destroyed, 'Tried to invoke a method of a destroyed Subject object');
  }

  /**
   * @method setEvents
   * @param  {Array<Object>} events
   */
  setEvents(events) {
    this.checkIfdestroyed();

    this.events = events;
    this.refreshDayEvents();
  }

  refreshDayEvents() {
    this.checkIfdestroyed();

    this.days.forEach(day => {
      const dayEvents = this.getDateEvents(day.date);
      day.setEvents(dayEvents);
    });
  }

  /**
   * @method getDateEvents
   * @param  {CustomDate} date [description]
   * @return {Array<Object>}
   */
  getDateEvents(date) {
    this.checkIfdestroyed();

    if (!this.events) { return []; }

    let eventIndex = 0;
    let event = this.events[eventIndex];
    const dayEvents = [];

    // While events are starting before the date we are evaluating
    while (date.diff(event.startDate) > 0) {
      // Add to dayEvents if it finishes on or after the date in question.
      if (date.diff(event.endDate) <= 0) {
        dayEvents.add(event);
      }

      eventIndex++;
      event = this.events[eventIndex];
    }

    return dayEvents;
  }
  /**
   * @method addDay
   * @param  {String} position - Accepts 'front' or 'back'
   */
  addDay(position) {
    this.checkIfdestroyed();

    if (position === 'front') {
      const newDate = new CustomDate(this.startDate).add(this.days.length, 'days');
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
      if (this.days.length === 0) { return; }

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

  /**
   * @method setDayCount
   * @param  {Int} count
   */
  setDayCount(count) {
    this.checkIfdestroyed();

    const countDiff = count - this.days.length;
    let dayFunction;

    if (countDiff > 0) {
      dayFunction = 'addDay';
    } else if (count < this.days.length) {
      dayFunction = 'removeDay';
    }

    const position = 'front';
    for (let i = 0; i < Math.abs(countDiff); i++) {
      this[dayFunction](position);
    }
  }

  /**
   * @method setStartDate
   * @param  {CustomDate} date
   */
  setStartDate(date) {
    this.checkIfdestroyed();

    this.startDate = date;
    const dayCount = this.days.length;
    this.setDayCount(0);
    this.setDayCount(dayCount);
  }

  scrollLeft() {
    this.removeDay('front');
    this.addDay('back');
  }

  scrollRight() {
    this.removeDay('back');
    this.addDay('front');
  }

  getEventLoadedRange() {
    return this.eventLoadedRange;
  }

  setEventLoadedFrom(date) {
    if (this.events[0]) {
      const firstBusyDate = this.events[this.events.length - 1];
      const dateIsAfterFirstBusyDate = (date.diff(firstBusyDate) > 0);
      if (dateIsAfterFirstBusyDate) {
        assert(
          false,
          'Invalid date provided for EventLoadedFrom. Date is after first busy date.'
        );
      }
    }
    this.eventLoadedRange.from = date;
  }

  setEventLoadedTo(date) {
    if (this.events[0]) {
      const lastBusyDate = this.events[0];
      const dateIsBeforeLastBusyDate = (date.diff(lastBusyDate) < 0);
      if (dateIsBeforeLastBusyDate) {
        assert(
          false,
          'Invalid date provided for EventLoadedTo. Date is before last busy date.'
        );
      }
    }
    this.eventLoadedRange.to = date;
  }
}
