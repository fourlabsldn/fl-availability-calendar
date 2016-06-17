import ViewController from '../ViewController';
import CustomDate from '../utils/CustomDate';
import assert from 'fl-assert';

const CLASS_PREFIX = 'DateBar';

export default class DateBar extends ViewController {
  constructor(startDate, modulePrefix) {
    super(modulePrefix, CLASS_PREFIX);
    this.startDate = new CustomDate(startDate);
    Object.preventExtensions(this);
  }

  buildHtml() {
    this.html.monthRow = document.createElement('div');
    this.html.monthRow.classList.add(`${this.cssPrefix}-monthRow`);
    this.html.container.appendChild(this.html.monthRow);

    this.html.dayRow = document.createElement('div');
    this.html.dayRow.classList.add(`${this.cssPrefix}-dayRow`);
    this.html.container.appendChild(this.html.dayRow);
  }

  /**
   * @public
   * @method getStartDate
   * @return {CustomDate}
   */
  getStartDate() {
    return this.startDate;
  }

  /**
   * @public
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


  getDayCount() {
    return this.html.dayRow.children.length;
  }

  /**
   * @public
   * @method setDayCount
   * @param  {Int} dayCount
   */
  setDayCount(dayCount) {
    assert(typeof dayCount === 'number', `Invalid dayCount value: ${dayCount}`);
    while (this.getDayCount() > dayCount) {
      this.removeDay();
    }
    while (dayCount > this.getDayCount()) {
      this.addDay();
    }
  }

  getEndDate() {
    const startDate = new CustomDate(this.startDate);
    const dayCount = Math.max(0, this.getDayCount() - 1);
    const endDate = startDate.add(dayCount, 'days');
    return endDate;
  }


  /**
   * @private
   * @method addDay
   * @param  {String} leftRight
   */
  addDay(leftRight = 'right') {
    const toTheRight = leftRight === 'right';
    assert(toTheRight || leftRight === 'left', `Invalid leftRight value: ${leftRight}`);

    const firstDayToBeAdded = this.getDayCount() === 0;
    let newDate;
    if (firstDayToBeAdded) {
      newDate = new CustomDate(this.startDate);
    } else if (toTheRight) {
      newDate = this.getEndDate().add(1, 'days');
    } else {
      newDate = (new CustomDate(this.startDate)).add(-1, 'days');
    }

    this.addToDayRow(newDate, toTheRight);
    this.addToMonthRow(newDate, toTheRight);

    if (!toTheRight) {
      this.startDate = newDate;
    }
  }

  /**
   * @private
   * @method addToDayRow
   * @param  {CustomDate} date
   * @param  {Boolean} toTheRight
   */
  addToDayRow(date, toTheRight = true) {
    const newDay = document.createElement('div');
    newDay.classList.add(`${this.cssPrefix}-day`);
    newDay.innerHTML = date.format('DD');

    if (toTheRight || this.html.dayRow.length === 0) {
      this.html.dayRow.appendChild(newDay);
    } else {
      const firstDayElement = this.html.dayRow.children[0];
      this.html.dayRow.insertBefore(newDay, firstDayElement);
    }
  }

  /**
   * @private
   * @method addToMonthRow
   * @param  {CustomDate} date
   * @param  {Boolean} toTheRight
   */
  addToMonthRow(date, toTheRight = true) {
    const monthName = date.format('MMM');
    const months = this.html.monthRow.children;

    const firstMonthElement = months[0];
    const lastMonthElement = months[months.length - 1];

    const existingMonth = toTheRight ? lastMonthElement : firstMonthElement;
    let monthEl;

    if (existingMonth && existingMonth.innerHTML === monthName) {
      monthEl = existingMonth;
      existingMonth.span = existingMonth.span + 1;
    } else {
      monthEl = document.createElement('div');
      monthEl.innerHTML = monthName;
      monthEl.span = 1;
      if (toTheRight || months.length === 0) {
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
   * @private
   * @method removeDay
   * @param  {String} leftRight
   */
  removeDay(leftRight = 'right') {
    const toTheRight = leftRight === 'right';

    this.removeFromDayRow(toTheRight);
    this.removeFromMonthRow(toTheRight);
    if (!toTheRight) {
      this.startDate.add(1, 'days');
    }
  }

 /**
  * @private
  * @method removeFromDayRow
  * @param  {Boolean} toTheRight
  */
  removeFromDayRow(toTheRight = true) {
    // remove from day row
    if (toTheRight) {
      const lastDay = this.html.dayRow.children[this.html.dayRow.children.length - 1];
      lastDay.remove();
    } else {
      const firstDay = this.html.dayRow.children[0];
      firstDay.remove();
    }
  }

  /**
   * @private
   * @method removeFromMonthRow
   * @param  {Boolean} toTheRight
   */
  removeFromMonthRow(toTheRight = true) {
    const months = this.html.monthRow.children;
    const firstMonthElement = months[0];
    const lastMonthElement = months[months.length - 1];

    let monthEl;
    if (toTheRight) {
      monthEl = lastMonthElement;
    } else {
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



}
