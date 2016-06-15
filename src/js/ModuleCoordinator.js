import CustomDate from './CustomDate';
import LegendsBar from './LegendsBar';
import ControlBar from './ControlBar';
import DatesPanel from './DatesPanel';
import CalendarContainer from './CalendarContainer';
import assert from 'fl-assert';

const MODULE_PREFIX = 'fl-msc';
const CUSTOM_DAYCOUNT = 80;

export default class ModuleCoordinator {
  constructor(xdiv, loadUrl, subjectsHeader, initialSubjectCount) {
    this.startDate = new CustomDate();

    // create html container
    this.calendarContainer = new CalendarContainer(MODULE_PREFIX);

    // create controlBar
    this.controlBar = new ControlBar(this, MODULE_PREFIX);
    this.calendarContainer.set('controlBar', this.controlBar);

    // create titlesContainer
    this.legendsBar = new LegendsBar(subjectsHeader, MODULE_PREFIX);
    this.calendarContainer.set('legendsBar', this.legendsBar);

    // create datesContainer
    this.datesPanel = new DatesPanel(this.startDate, MODULE_PREFIX);
    this.calendarContainer.set('datesPanel', this.datesPanel);

    xdiv.appendChild(this.calendarContainer.html.container);

    // set start date and dayCount
    this.setStartDate(this.startDate);

    this.setDayCount(CUSTOM_DAYCOUNT);

    // add x subjects
    // this.setSubjectCount(initialSubjectCount);
  }

  /**
   * @public
   * @method getStartDate
   * @return {CustomDate}
   */
  getStartDate() {
    return new CustomDate(this.startDate);
  }

  /**
   * @public
   * @method setStartDate
   * @param  {CustomDate} date
   */
  setStartDate(date) {
    this.startDate = new CustomDate(date);
    this.datesPanel.setStartDate(date);
    this.controlBar.setDatepickerDate(date);
    console.warn('setStartDate not fully implemented yet');
  }

  /**
   * @public
   * @method setSubjectCount
   * @param {Int} count
   */
  async setSubjectCount(count) {
    const currentCount = this.getSubjectCount();
    if (count === currentCount) { return; }
    const diff = Math.abs(currentCount - count);
    if (count > currentCount) {
      this.removeSubjects(diff);
      return;
    }

    for (let i = 0; i < diff; i++) {
      await this.addSubject('bottom');
    }
  }

  /**
   * @public
   * @method getSubjectCount
   * @return {Int}
   */
  getSubjectCount() {
    return this.datesPanel.getSubjectCount();
  }

  /**
   * @public
   * @method setDayCount
   * @param  {Int} count
   */
  setDayCount(count) {
    this.datesPanel.setDayCount(count);
  }

  /**
   * @public
   * @method addSubject
   * @param  {String} topBottom
   */
  async addSubject(topBottom) {
    const newSubject = await this.subjectFabric.newSubject(topBottom);
    if (!newSubject) { assert.warn(false, 'no subject created'); }
    this.datesPanel.addSubject(newSubject);
    this.legendsBar.addSubject(newSubject);
  }
}
