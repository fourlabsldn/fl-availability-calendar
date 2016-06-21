export default class ViewController {
  constructor(modulePrefix, classPrefix = this.constructor.name) {
    this.modulePrefix = modulePrefix;
    this.cssPrefix = classPrefix ? `${modulePrefix}-${classPrefix}` : modulePrefix;
    this.html = {};
    this.html.container = document.createElement('div');
    this.html.container.classList.add(this.cssPrefix);

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
   * @public
   * @method destroy
   * @return {void}
   */
  destroy() {
    this.html.container.remove();
    this.html = {};
    const thisKeys = Object.keys(this);
    thisKeys.forEach(k => { this[k] = null; });
  }
}
