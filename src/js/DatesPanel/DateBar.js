import ViewController from '../ViewController';
import CustomDate from '../utils/CustomDate';
import assert from 'fl-assert';

const CLASS_PREFIX = 'DateBar';

export default class DateBar extends ViewController {
  constructor(startDate, modulePrefix) {
    super(modulePrefix, CLASS_PREFIX);
    this.startDate = new CustomDate(startDate);
    this.endDate = new CustomDate(startDate);
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
   * @method setDateRange
   * @param  {CustomDate} date
   */
  setDateRange(fromDate, toDate) {
    assert(fromDate instanceof CustomDate && toDate instanceof CustomDate, 'Invalid startDate.');
    this.startDate = new CustomDate(fromDate);
    this.endDate = new CustomDate(toDate);
    this.setDayRowRange(fromDate, toDate);
    this.setMonthRowRange(fromDate, toDate);
  }

  getDayCount() {
    return this.html.dayRow.children.length;
  }


  getEndDate() {
    return this.endDate;
  }


  /**
   * @private
   * @method setDayRowRange
   * @param  {CustomDate} fromDate
   * @param  {CustomDate} toDate
   */
  setDayRowRange(fromDate, toDate) {
    // Remove everything that is in there.
    const days = Array.from(this.html.dayRow.children);
    days.forEach(d => d.remove());

    let pointerDate = new CustomDate(fromDate);
    const frag = document.createDocumentFragment();
    while (!pointerDate.isAfter(toDate)) {
      // Create day elements
      const newDay = document.createElement('div');
      newDay.classList.add(`${this.cssPrefix}-day`);
      const newDate = new CustomDate(pointerDate);
      newDay.innerHTML = newDate.format('DD');

      frag.appendChild(newDay);
      pointerDate = new CustomDate(pointerDate).add(1, 'day');
    }

    this.html.dayRow.appendChild(frag);
  }

  /**
   * @private
   * @method setMonthRowRange
   * @param {CustomDate} fromDate
   * @param {CustomDate} toDate
   */
  setMonthRowRange(fromDate, toDate) {
    // Remove all months
    const months = Array.from(this.html.monthRow.children);
    months.forEach(m => m.remove());

    const frag = document.createDocumentFragment();
    let pointerDate = new CustomDate(fromDate);
    while (!pointerDate.isAfter(toDate)) {
      const monthName = pointerDate.format('MMM');
      const monthEl = document.createElement('div');
      monthEl.innerHTML = monthName;

      const timeToEndOfMonth = new CustomDate(pointerDate.endOf('month'))
        .diff(pointerDate, 'days');
      const timeToEndDate = toDate.diff(pointerDate, 'days');
      monthEl.span = Math.min(timeToEndOfMonth, timeToEndDate) + 1;

      monthEl.className = '';
      monthEl.classList.add(`${this.cssPrefix}-month`);
      monthEl.classList.add(`${this.cssPrefix}-month-${monthEl.span}`);
      frag.appendChild(monthEl);
      pointerDate = new CustomDate(pointerDate).add(1, 'month').startOf('month');
    }
    this.html.monthRow.appendChild(frag);
  }
  //
  // /**
  //  * @private
  //  * @method removeDay
  //  * @param  {String} leftRight
  //  */
  // removeDay(leftRight = 'right') {
  //   const toTheRight = leftRight === 'right';
  //
  //   this.removeFromDayRow(toTheRight);
  //   this.removeFromMonthRow(toTheRight);
  //   if (!toTheRight) {
  //     this.startDate.add(1, 'days');
  //   }
  // }

 // /**
 //  * @private
 //  * @method removeFromDayRow
 //  * @param  {Boolean} toTheRight
 //  */
 //  removeFromDayRow(toTheRight = true) {
 //    // remove from day row
 //    if (toTheRight) {
 //      const lastDay = this.html.dayRow.children[this.html.dayRow.children.length - 1];
 //      lastDay.remove();
 //    } else {
 //      const firstDay = this.html.dayRow.children[0];
 //      firstDay.remove();
 //    }
 //  }
 //
 //  /**
 //   * @private
 //   * @method removeFromMonthRow
 //   * @param  {Boolean} toTheRight
 //   */
 //  removeFromMonthRow(toTheRight = true) {
 //    const months = this.html.monthRow.children;
 //    const firstMonthElement = months[0];
 //    const lastMonthElement = months[months.length - 1];
 //
 //    let monthEl;
 //    if (toTheRight) {
 //      monthEl = lastMonthElement;
 //    } else {
 //      monthEl = firstMonthElement;
 //    }
 //
 //    if (monthEl.span > 1) {
 //      monthEl.span--;
 //      monthEl.className = '';
 //      monthEl.classList.add(`${this.cssPrefix}-month`);
 //      monthEl.classList.add(`${this.cssPrefix}-month-${monthEl.span}`);
 //    } else {
 //      monthEl.remove();
 //    }
 //  }



}
