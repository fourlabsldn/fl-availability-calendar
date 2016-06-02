import ViewController from './ViewController';
import CustomDate from './CustomDate';

const CLASS_PREFIX = 'btnBar';
const DATEPICKER_FORMAT = 'YYYY-MM';


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
    this.startDate = null;
    this.dayCount = 0;

    this.dateBar = dateBar;
    this.subjectsContainer = subjectsContainer;

    this.createButtons();
    this.setButtonListeners();
    Object.preventExtensions(this);

    this.setStartDate(startDate);

    // TODO: This should be dynamic.
    this.subjectsContainer.addSubjects('bottom', SUBJECT_COUNT)
    .then(() => {
      this.setDayCount(COLUMN_COUNT);
    });
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
    datePicker.setAttribute('type', 'month');
    this.html.datePicker = datePicker;
    this.html.container.appendChild(datePicker);
  }

  setButtonListeners() {
    this.html.scrollLeftBtn.addEventListener('click', () => this.scrollLeft());
    this.html.scrollRightBtn.addEventListener('click', () => this.scrollRight());
    this.html.scrollUpBtn.addEventListener('click', () => this.scrollUp());
    this.html.scrollDownBtn.addEventListener('click', () => this.scrollDown());
    this.html.datePicker.addEventListener('change', () => {
      const datepickerDate = new CustomDate(this.html.datePicker.value);
      this.setStartDate(datepickerDate);
    });
  }

  /**
   * @method setDatepickerDate
   * @param  {CustomDate | String | Date} date
   */
  setStartDate(date) {
    const normalisedDate = new CustomDate(date);
    this.html.datePicker.value = normalisedDate.format(DATEPICKER_FORMAT);
    this.dateBar.setStartDate(date);
    this.subjectsContainer.setStartDate(date);
  }

  setDayCount(count) {
    this.subjectsContainer.setDayCount(count);
    this.dateBar.setDayCount(count);
  }

  scrollLeft() {
    this.subjectsContainer.scrollLeft();
    this.dateBar.scrollLeft();
  }

  scrollRight() {
    this.subjectsContainer.scrollRight();
    this.dateBar.scrollRight();
  }

  scrollUp() {
    this.subjectsContainer.scrollUp();
  }

  scrollDown() {
    this.subjectsContainer.scrollDown();
  }
}
