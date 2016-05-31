import moment from 'moment';

export default class CustomDate {
  /**
   * @method constructor
   * @param  {Date | String | CustomDate} info - Initialisation object.
   * @return {CustomDate}
   */
  constructor(info) {
    this.date = moment(info);
    Object.preventExtensions(this);
  }

  /**
   * @method add
   * @param  {moment} date
   * @param  {Int} amount - Positive or negative quantity
   * @param  {String} unit - Unit as string
   * @return {CustomDate}
   */
  add(date, amount, unit = 'days') {
    return this.date.add(amount, unit);
  }

  /**
   * @method diff
   * @param  {CustomDate} date2
   * @param  {Int} unit
   * @return {Int}
   */
  diff(date2, unit) {
    return this.date.diff(unit);
  }

  /**
   * @method format
   * @param  {String} formatting - A moment.js format
   * @return {String}
   */
  format(formatting) {
    return this.date.format(formatting);
  }

  isWithinRange(dateFrom, dateTo) {
    const afterDateFrom = this.diff(dateFrom) >= 0;
    const beforeDateTo = this.diff(dateTo) <= 0;
    return afterDateFrom && beforeDateTo;
  }

  toString() {
    return this.date.toString();
  }

  static getLatest(date1, date2) {
    return (date1.diff(date2) > 0) ? date1 : date2;
  }

  static getEarliest(date1, date2) {
    return (date1.diff(date2) > 0) ? date2 : date1;
  }

}
