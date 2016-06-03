import ViewController from './ViewController';
import CustomDate from './CustomDate';

const CLASS_PREFIX = 'btnBar';
const DATEPICKER_FORMAT = 'YYYY-[W]WW';


// TODO: Make static constants dynamic;
const SUBJECT_COUNT = 20;
const COLUMN_COUNT = 30;

export default class ControlBar extends ViewController {
  /**
   * @constructor
   * @param  {CustomDate} startDate
   * @param  {DateBar} dateBar
   * @param  {SubjectsContainer} subjectsContainer
   * @param  {String} cssPrefix
   * @return {ControlBar}
   */
  constructor(startDate, dateBar, subjectsContainer, modulePrefix) {
    super();
    this.cssPrefix = `${modulePrefix}-${CLASS_PREFIX}`;
    this.html.container.classList.add(this.cssPrefix);

    this.startDate = new CustomDate(startDate);
    this.dayCount = 0;

    this.dateBar = dateBar;
    this.subjectsContainer = subjectsContainer;

    this.createButtons();
    this.setListeners();
    Object.preventExtensions(this);

    this.setStartDate(startDate)
      .then(() => this.subjectsContainer.setSubjectCount(SUBJECT_COUNT))
      .then(() => this.setDayCount(COLUMN_COUNT));
  }

  /**
   * @method createButtons
   * @param  {String} [cssPrefix]
   * @return {void}
   */
  createButtons(cssPrefix = this.cssPrefix) {
    const scrollLeftBtn = document.createElement('button');
    scrollLeftBtn.classList.add(`${cssPrefix}-btn`);
    scrollLeftBtn.innerHTML = '<';
    this.html.scrollLeftBtn = scrollLeftBtn;
    this.html.container.appendChild(scrollLeftBtn);

    const scrollRightBtn = document.createElement('button');
    scrollRightBtn.classList.add(`${cssPrefix}-btn`);
    scrollRightBtn.innerHTML = '>';
    this.html.scrollRightBtn = scrollRightBtn;
    this.html.container.appendChild(scrollRightBtn);

    const scrollUpBtn = document.createElement('button');
    scrollUpBtn.classList.add(`${cssPrefix}-btn`);
    scrollUpBtn.innerHTML = 'Scroll up';
    this.html.scrollUpBtn = scrollUpBtn;
    this.html.container.appendChild(scrollUpBtn);

    const scrollDownBtn = document.createElement('button');
    scrollDownBtn.classList.add(`${cssPrefix}-btn`);
    scrollDownBtn.innerHTML = 'Scroll Down';
    this.html.scrollDownBtn = scrollDownBtn;
    this.html.container.appendChild(scrollDownBtn);

    const datePicker = document.createElement('input');
    datePicker.classList.add(`${cssPrefix}-btn`);
    datePicker.classList.add(`${cssPrefix}-datepicker`);
    datePicker.setAttribute('type', 'week');
    this.html.datePicker = datePicker;
    this.html.container.appendChild(datePicker);
  }

  setListeners() {
    this.html.scrollLeftBtn.addEventListener('mousedown', () => {
      holdButton(this.scrollLeft.bind(this));
    });

    this.html.scrollRightBtn.addEventListener('mousedown', () => {
      holdButton(this.scrollRight.bind(this));
    });

    this.html.scrollUpBtn.addEventListener('mousedown', () => {
      holdButton(this.scrollUp.bind(this));
    });

    this.html.scrollDownBtn.addEventListener('mousedown', () => {
      holdButton(this.scrollDown.bind(this));
    });

    this.html.datePicker.addEventListener('change', () => {
      const datepickerDate = new CustomDate(this.html.datePicker.value);
      const normalisedDate = datepickerDate.startOf('isoweek');
      this.setStartDate(normalisedDate);
    });
  }

  /**
   * @method setDatepickerDate
   * @param  {CustomDate} date
   */
  setDatepickerDate(date) {
    this.html.datePicker.value = date.format(DATEPICKER_FORMAT);
  }

  /**
   * @method setStartDate
   * @param  {CustomDate} date
   */
  async setStartDate(date) {
    const newDate = date ? new CustomDate(date) : this.startDate;
    this.startDate = newDate;

    await this.subjectsContainer.setStartDate(newDate);
    this.setDatepickerDate(newDate);
    this.dateBar.setStartDate(newDate);
  }

  /**
   * Sets the start date given an offset number from the
   * current start date.
   * @method addToStartDate
   * @param  {CustomDate} val
   */
  async addToStartDate(val) {
    this.startDate.add(val);
    await this.setStartDate();
  }

  setDayCount(count) {
    this.subjectsContainer.setDayCount(count);
    this.dateBar.setDayCount(count);
  }

  async scrollLeft() {
    await this.addToStartDate(-1);
  }

  async scrollRight() {
    await this.addToStartDate(1);
  }

  scrollUp() {
    this.subjectsContainer.scrollUp();
  }

  scrollDown() {
    this.subjectsContainer.scrollDown();
  }
}

function holdButton(fn) {
  let functionSchedule;
  function doFunction(f) {
    f();
    functionSchedule = requestAnimationFrame(() => {
      doFunction(f);
    });
  }

  doFunction(fn);
  const docMouseUp = document.addEventListener('mouseup', () => {
    cancelAnimationFrame(functionSchedule);
    document.removeEventListener('mouseup', docMouseUp);
  });
}
