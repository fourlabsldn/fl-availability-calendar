import ViewController from './ViewController';
import CustomDate from './CustomDate';
import assert from 'fl-assert';

const CLASS_PREFIX = 'dateBar';

export default class DateBar extends ViewController {
  constructor(modulePrefix) {
    super();
    this.cssPrefix = `${modulePrefix}-${CLASS_PREFIX}`;
    this.startDate = new CustomDate();
    Object.preventExtensions(this);

    this.buildHtml();
  }

  buildHtml() {
    this.html.container.classList.add(this.cssPrefix);

    this.html.monthRow = document.createElement('div');
    this.html.monthRow.classList.add(`${this.cssPrefix}-monthRow`);
    this.html.container.appendChild(this.html.monthRow);

    this.html.dayRow = document.createElement('div');
    this.html.dayRow.classList.add(`${this.cssPrefix}-dayRow`);
    this.html.container.appendChild(this.html.dayRow);
  }

  /**
   * @method setStartDate
   * @param  {CustomDate} date
   */
  setStartDate(date) {
    assert(date instanceof CustomDate, 'Invalid startDate.');

    const dayCount = this.getDayCount();
    this.setDayCount(0);
    this.startDate = date;
    this.setDayCount(dayCount);
  }

  setDayCount(dayCount) {
    assert(typeof dayCount === 'number', `Invalid dayCount value: ${dayCount}`);
    while (this.getDayCount() > dayCount) {
      this.removeDay();
    }
    while (dayCount > this.getDayCount()) {
      this.addDay();
    }
  }

  /**
   * @method addDay
   * @param  {String} leftRight
   */
  addDay(leftRight = 'right') {
    let daysToAdd;
    if (leftRight === 'right') {
      daysToAdd = 1;
    } else if (leftRight === 'left') {
      daysToAdd = - 1;
    } else {
      assert(false, `Invalid leftRight value: ${leftRight}`);
    }

    const dayDate = this.getEndDate().add(daysToAdd, 'days');
    this.addToDayRow(dayDate, leftRight);
    this.addToMonthRow(dayDate, leftRight);
  }

  /**
   * @method addToDayRow
   * @param  {CustomDate} date
   * @param  {String} leftRight
   */
  addToDayRow(date, leftRight) {
    const newDay = document.createElement('div');
    newDay.classList.add(`${this.cssPrefix}-day`);
    newDay.innerHTML = date.format('DD');

    if (leftRight === 'right' || this.html.dayRow.length === 0) {
      this.html.dayRow.appendChild(newDay);
    } else if (leftRight === 'left') {
      const firstDayElement = this.html.dayRow.children[0];
      this.html.dayRow.insertBefore(newDay, firstDayElement);
    } else {
      assert(false, `Invalid leftRight value: ${leftRight}`);
    }
  }

  /**
   * @method addToMonthRow
   * @param  {CustomDate} date
   * @param  {String} leftRight
   */
  addToMonthRow(date, leftRight = 'right') {
    const monthName = date.format('MMM');
    const months = this.html.monthRow.children;

    const firstMonthElement = months[0];
    const lastMonthElement = months[months.length - 1];

    const existingMonth = leftRight === 'left' ? firstMonthElement : lastMonthElement;
    let monthEl;
    if (existingMonth && existingMonth.innerHTML === monthName) {
      monthEl = existingMonth;
      existingMonth.span = existingMonth.span + 1;
    } else {
      monthEl = document.createElement('div');
      monthEl.innerHTML = monthName;
      monthEl.span = 1;
      if (leftRight === 'right' || months.length === 0) {
        this.html.monthRow.appendChild(monthEl);
      } else {
        this.html.monthRow.insertBefore(monthEl, firstMonthElement);
      }
    }
    monthEl.className = '';
    monthEl.classList.add(`${this.cssPrefix}-month`);
    monthEl.classList.add(`${this.cssPrefix}-month-${monthEl.span}`);
  }

  /**
   * @method removeDay
   * @param  {String} leftRight
   */
  removeDay(leftRight = 'right') {
    this.removeFromDayRow(leftRight);
    this.removeFromMonthRow(leftRight);
  }

 /**
  * @method removeFromDayRow
  * @param  {String} leftRight
  */
  removeFromDayRow(leftRight = 'right') {
    // remove from day row
    if (leftRight === 'right') {
      const lastDay = this.html.dayRow.children[this.html.dayRow.children.length - 1];
      lastDay.remove();
    } else if (leftRight === 'left') {
      const firstDay = this.html.dayRow.children[0];
      firstDay.remove();
    }
  }

  /**
   * @method removeFromMonthRow
   * @param  {String} leftRight
   */
  removeFromMonthRow(leftRight = 'right') {
    const months = this.html.monthRow.children;
    const firstMonthElement = months[0];
    const lastMonthElement = months[months.length - 1];
    let monthEl;
    if (leftRight === 'right') {
      monthEl = lastMonthElement;
    } else if (leftRight === 'left') {
      monthEl = firstMonthElement;
    }

    if (monthEl.span > 1) {
      monthEl.span--;
      monthEl.className = '';
      monthEl.classList.add(`${this.cssPrefix}-month`);
      monthEl.classList.add(`${this.cssPrefix}-month-${monthEl.span}`);
    } else {
      monthEl.remove();
    }
  }

  scrollLeft() {
    this.addDay('left');
    this.removeDay('right');
  }
  scrollRight() {
    this.addDay('right');
    this.removeDay('left');
  }

  getEndDate() {
    const startDate = new CustomDate(this.startDate);
    const dayCount = this.getDayCount();
    const endDate = startDate.add(dayCount, 'days');
    return endDate;
  }

  getDayCount() {
    return this.html.dayRow.children.length;
  }

}
