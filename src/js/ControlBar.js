import ViewController from './ViewController';
import CustomDate from './utils/CustomDate';

const DATEPICKER_FORMAT = 'YYYY-[W]WW';
export default class ControlBar extends ViewController {
  /**
   * @constructor
   * @param  {ModuleCoordinator} moduleCoordinator
   * @param  {String} modulePrefix
   * @return {ControlBar}
   */
  constructor(moduleCoordinator, modulePrefix) {
    super(modulePrefix);
    this.moduleCoordinator = moduleCoordinator;
    this.startDate = this.moduleCoordinator.getStartDate();
    Object.preventExtensions(this);
  }

  buildHtml() {
    this.createButtons();
    this.setListeners();
  }

  /**
   * @private
   * @method createButtons
   * @param  {String} [cssPrefix]
   * @return {void}
   */
  createButtons() {
    const datePicker = document.createElement('input');
    datePicker.classList.add(`${this.cssPrefix}-btn`);
    datePicker.classList.add(`${this.cssPrefix}-datepicker`);
    datePicker.setAttribute('type', 'week');
    this.html.datePicker = datePicker;
    this.html.container.appendChild(datePicker);

    const scrollLeftBtn = document.createElement('button');
    scrollLeftBtn.classList.add(`${this.cssPrefix}-btn`);
    scrollLeftBtn.innerHTML = '<';
    this.html.scrollLeftBtn = scrollLeftBtn;
    this.html.container.appendChild(scrollLeftBtn);

    const scrollRightBtn = document.createElement('button');
    scrollRightBtn.classList.add(`${this.cssPrefix}-btn`);
    scrollRightBtn.innerHTML = '>';
    this.html.scrollRightBtn = scrollRightBtn;
    this.html.container.appendChild(scrollRightBtn);
  }

  /**
   * @private
   * @method setListeners
   */
  setListeners() {
    this.html.datePicker.addEventListener('change', () => {
      const datepickerDate = new CustomDate(this.html.datePicker.value);
      const normalisedDate = datepickerDate.startOf('isoweek');
      this.moduleCoordinator.setStartDate(normalisedDate);
    });

    this.html.scrollLeftBtn.addEventListener('mousedown', () => {
      this.scroll('left');
    });

    this.html.scrollRightBtn.addEventListener('mousedown', () => {
      this.scroll('right');
    });
  }

  /**
   * @public
   * @method setDatepickerDate
   * @param  {CustomDate} date
   */
  setDatepickerDate(date) {
    this.html.datePicker.value = date.format(DATEPICKER_FORMAT);
  }

  /**
   * @private
   * @method scroll
   * @param  {String} direction - up, down, left or right
   * @return {void}
   */
  scroll(direction) {
    const dayCount = this.moduleCoordinator.getDayCount();
    const daysToScroll = parseInt(dayCount * 2 / 3, 10) * (direction === 'right' ? 1 : -1);
    const currStartDate = this.moduleCoordinator.getStartDate();
    const newStartDate = new CustomDate(currStartDate).add(daysToScroll, 'days');
    this.moduleCoordinator.setStartDate(newStartDate);
  }
}
