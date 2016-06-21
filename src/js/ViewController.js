import assert from 'fl-assert';

export default class ViewController {
  constructor(modulePrefix, classPrefix = this.constructor.name) {
    this.modulePrefix = modulePrefix;
    this.cssPrefix = classPrefix ? `${modulePrefix}-${classPrefix}` : modulePrefix;
    this.html = {};
    this.html.container = document.createElement('div');
    this.html.container.classList.add(this.cssPrefix);

    this.listeners = {};
    this.acceptEvents('destroy');

    this.buildHtml();
  }

  buildHtml() {
    return;
  }

  /**
   * @public
   * @method getContainer
   * @return {HTMLElement}
   */
  getContainer() {
    return this.html.container;
  }

  /**
   * Sets which events will be accepted.
   * @method acceptEvents
   * @param  {Array<String>} eventList
   * @return {void}
   */
  acceptEvents(...eventList) {
    for (const eventName of eventList) {
      this.listeners[eventName] = new Set();
    }
  }

  /**
   * @method on
   * @param  {function} fn
   * @param {String} event
   * @return {void}
   */
  on(event, fn) {
    assert(this.listeners[event], `Trying to listen to invalid event: ${event}`);
    this.listeners[event].add(fn);
  }

  /**
   * @method removeListener
   * @param  {String} event
   * @param  {Function} fn
   * @return {void}
   */
  removeListener(event, fn) {
    assert(this.listeners[event], `Trying to remove listener from invalid event: ${event}`);
    this.listeners[event].delete(fn);
  }

  /**
   * @method trigger
   * @param  {String} event
   */
  trigger(event) {
    if (!this.listeners[event]) { return; }
    this.listeners[event].forEach(fn => fn(this));
  }

  /**
   * @public
   * @method destroy
   * @return {void}
   */
  destroy() {
    this.trigger('destroy');
    this.html.container.remove();
    this.html = {};
    const thisKeys = Object.keys(this);
    thisKeys.forEach(k => { this[k] = null; });
  }
}
