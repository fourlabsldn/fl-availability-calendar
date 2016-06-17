import ViewController from '../ViewController';
import DateBar from './DateBar';

const CLASS_PREFIX = 'DatesPanel';
export default class DatesPanel extends ViewController {
  constructor(startDate, moduleCoordinator, modulePrefix) {
    super(modulePrefix, CLASS_PREFIX);
    this.dateBar = new DateBar(startDate, modulePrefix);
    Object.preventExtensions(this);

    this.html.container.insertBefore(
      this.dateBar.html.container,
      this.html.container.children[0]
    );
  }

  buildHtml() {
    this.html.subjectsContainer = document.createElement('div');
    this.html.subjectsContainer.classList.add(`${this.cssPrefix}-subjectsContainer`);
    this.html.container.appendChild(this.html.subjectsContainer);
  }

  /**
   * @public
   * @method setDayCount
   * @param  {int} count
   */
  setDayCount(count) {
    this.dateBar.setDayCount(count);
    console.warn('setDayCount not fully implemented yet.');
  }

  /**
   * @public
   * @method setStartDate
   * @param  {CustomDate} date
   */
  setStartDate(date) {
    this.dateBar.setStartDate(date);
    console.warn('setStartDate not fully implemented yet.');
  }
}
