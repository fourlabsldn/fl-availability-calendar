import moment from 'moment';

export default class CustomDate {
  /**
   * @method constructor
   * @param  {Date | String | CustomDate} info - Initialisation object.
   * @return {CustomDate}
   */
  constructor(info) {
    if (info instanceof CustomDate) {
      this.date = moment(info.date);
    } else {
      this.date = moment(info);
    }
    Object.preventExtensions(this);
  }

  /**
   * @method add
   * @param  {moment} date
   * @param  {Int} amount - Positive or negative quantity
   * @param  {String} unit - Unit as string
   * @return {CustomDate}
   */
  add(amount, unit = 'days') {
    this.date.add(amount, unit);
    return this;
  }

  /**
   * @method diff
   * @param  {CustomDate} date2
   * @param  {Int} unit
   * @return {Int}
   */
  diff(date2, unit) {
    if (date2 instanceof CustomDate) {
      return this.date.diff(date2.date, unit);
    }
    return this.date.diff(date2, unit);
  }

  /**
   * @method format
   * @param  {String} formatting - A moment.js format
   * @return {String}
   */
  format(formatting) {
    return this.date.format(formatting);
  }

  startOf(unit) {
    const answer = this.date.startOf(unit);
    return new CustomDate(answer);
  }

  isWithinRange(dateFrom, dateTo) {
    const afterDateFrom = this.diff(dateFrom) >= 0;
    const beforeDateTo = this.diff(dateTo) <= 0;
    return afterDateFrom && beforeDateTo;
  }

  toString() {
    return this.date.toString();
  }

  isBefore(date) {
    return this.diff(date) < 0;
  }

  isAfter(date) {
    return this.diff(date) > 0;
  }

  toISOString() {
    return this.date.toISOString();
  }

  isValid() {
    return this.date.isValid();
  }

  static getLatest(date1, date2) {
    return (date1.diff(date2) > 0) ? date1 : date2;
  }

  static getEarliest(date1, date2) {
    return (date1.diff(date2) > 0) ? date2 : date1;
  }
}
