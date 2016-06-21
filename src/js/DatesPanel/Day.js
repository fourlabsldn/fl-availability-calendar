import assert from 'fl-assert';
import ViewController from '../ViewController';

export default class Day extends ViewController {
  /**
   * @method constructor
   * @param  {CustomDate} date
   * @param  {Array<Object>} events
   * @param  {String} modulePrefix
   * @return {Day}
   */
  constructor(date, events, modulePrefix) {
    super();
    this.destroyed = false;
    this.modulePrefix = modulePrefix;
    this.date = date;
    Object.preventExtensions(this);

    // TODO: FIXME: REMOVE THIS SUBJECTID
    const subjectId = events[0] ? events[0].subjectId : '';
    this.html.container.setAttribute('title', date.toString() + ` ${subjectId}`);
    if (events) {
      this.setEvents(events);
    }
  }

  destroy() {
    this.destroyed = true;
    this.html.container.remove();
    this.html = null;
  }

  checkIfdestroyed() {
    assert(!this.destroyed, 'Trying to call function on destroyed day.');
  }

  /**
   * @method setEvents
   * @param  {Array<Object>} events
   */
  setEvents(events) {
    assert(Array.isArray(events), `Invalid events object. Expected array and got ${typeof events}`);

    let classesToAdd = `${this.modulePrefix}-day`;
    const statuses = new Set();

    events.forEach(event => {
      if (typeof event.className === 'string') {
        classesToAdd += ` ${event.className}`;
      }
      if (typeof event.status === 'string') {
        statuses.add(event.status);
      }
    });

    for (const status of statuses) {
      classesToAdd += ` ${this.modulePrefix}-day--${status}`;
    }

    if (classesToAdd !== this.html.container.className) {
      this.html.container.className = classesToAdd;
    }
  }
}
