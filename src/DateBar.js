
import ViewController from './ViewController';

const CLASS_PREFIX = 'dateBar';

export default class DateBar extends ViewController {
  constructor(modulePrefix) {
    super();
    this.cssPrefix = `${modulePrefix}-${CLASS_PREFIX}`;
    Object.preventExtensions(this);

    this.buildHtml();
  }

  buildHtml() {
    this.html.container.classList.add(this.cssPrefix);

  }

  setStartDate() {

  }
  setDayCount() {

  }
  scrollLeft() {

  }
  scrollRight() {

  }
}
