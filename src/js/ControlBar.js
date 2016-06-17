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

    const scrollUpBtn = document.createElement('button');
    scrollUpBtn.classList.add(`${this.cssPrefix}-btn`);
    scrollUpBtn.innerHTML = 'Scroll up';
    this.html.scrollUpBtn = scrollUpBtn;
    this.html.container.appendChild(scrollUpBtn);

    const scrollDownBtn = document.createElement('button');
    scrollDownBtn.classList.add(`${this.cssPrefix}-btn`);
    scrollDownBtn.innerHTML = 'Scroll Down';
    this.html.scrollDownBtn = scrollDownBtn;
    this.html.container.appendChild(scrollDownBtn);

    const datePicker = document.createElement('input');
    datePicker.classList.add(`${this.cssPrefix}-btn`);
    datePicker.classList.add(`${this.cssPrefix}-datepicker`);
    datePicker.setAttribute('type', 'week');
    this.html.datePicker = datePicker;
    this.html.container.appendChild(datePicker);
  }

  /**
   * @private
   * @method setListeners
   */
  setListeners() {
    this.html.scrollLeftBtn.addEventListener('mousedown', () => {
      this.scroll('left');
    });

    this.html.scrollRightBtn.addEventListener('mousedown', () => {
      this.scroll('right');
    });

    this.html.scrollUpBtn.addEventListener('mousedown', () => {
      this.scroll('up');
    });

    this.html.scrollDownBtn.addEventListener('mousedown', () => {
      this.scroll('down');
    });

    this.html.datePicker.addEventListener('change', () => {
      const datepickerDate = new CustomDate(this.html.datePicker.value);
      const normalisedDate = datepickerDate.startOf('isoweek');
      this.setDatepickerDate(normalisedDate);
      // TODO: Change general date from here
      console.warn('Datepicker date not fully implemented.');
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
    console.log(`Scrolling ${direction}`);
  }
}