import ViewController from './ViewController';
import assert from 'fl-assert';

export default class CalendarContainer extends ViewController {
  constructor(modulePrefix) {
    super(modulePrefix);
    Object.preventExtensions(this);
  }

  set(name, instance) {
    assert(this.html[name], `Trying to set invalid property: ${name}`);
    this.html[name].parentNode.replaceChild(instance.html.container, this.html[name]);
    this.html[name] = instance.html.container;
  }

  buildHtml() {
    this.html.controlBar = document.createElement('div');
    this.html.container.appendChild(this.html.controlBar);

    this.html.panelWrapper = document.createElement('div');
    this.html.panelWrapper.classList.add(`${this.cssPrefix}-panelWrapper`);
    this.html.container.appendChild(this.html.panelWrapper);

    this.html.labelsBar = document.createElement('div');
    this.html.panelWrapper.appendChild(this.html.labelsBar);

    this.html.datesPanel = document.createElement('div');
    this.html.panelWrapper.appendChild(this.html.datesPanel);
  }
}
