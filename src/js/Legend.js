import ViewController from './ViewController';
import EventCentral from './EventCentral';

export default class Legend extends ViewController {
  constructor(modulePrefix) {
    super(modulePrefix);
    this.eventTypes = [];

    Object.preventExtensions(this);

    EventCentral.on('eventCreated', this.registerEventLegend.bind(this));
  }

  /**
   * @private
   * @method registerEventLegend
   * @param {object} event - Calendar event object
   * @return {void}
   */
  registerEventLegend(event, eventClass) {
    if (this.eventTypes.includes(event.status)) { return; }

    this.eventTypes = this.eventTypes.concat([event.status]);

    const legendObject = document.createElement('div');
    legendObject.classList.add(`${this.modulePrefix}-Legend-item`);

    const legendName = document.createElement('span');
    legendName.classList.add(`${this.modulePrefix}-Legend-name`);
    legendName.textContent = event.status;
    legendObject.appendChild(legendName);

    const legendColor = document.createElement('div');
    legendColor.classList.add(`${this.modulePrefix}-Legend-color`);
    legendColor.classList.add(eventClass);
    legendObject.appendChild(legendColor);

    this.html.container.appendChild(legendObject);
  }
}
