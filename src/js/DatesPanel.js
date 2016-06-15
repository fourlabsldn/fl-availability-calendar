import ViewController from './ViewController';

export default class DatesPanel extends ViewController {
  constructor(modulePrefix) {
    super(modulePrefix);
    Object.preventExtensions(this);
  }

  buildHtml() {
    this.html.container.textContent = 'Imagine the dates';
  }
}
