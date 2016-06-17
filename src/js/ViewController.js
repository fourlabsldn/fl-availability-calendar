export default class ViewController {
  constructor(modulePrefix, classPrefix = this.constructor.name) {
    this.modulePrefix = modulePrefix;
    this.cssPrefix = classPrefix ? `${modulePrefix}-${classPrefix}` : modulePrefix;
    this.html = {};
    this.html.container = document.createElement('div');
    this.html.container.classList.add(this.cssPrefix);

    // TODO: move all buildHtml to here
    this.buildHtml();
  }
}
