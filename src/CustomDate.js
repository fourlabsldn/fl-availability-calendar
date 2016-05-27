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
}
