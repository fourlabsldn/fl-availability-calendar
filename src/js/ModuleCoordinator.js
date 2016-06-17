import assert from 'fl-assert';
import CustomDate from './utils/CustomDate';
import LegendsBar from './LegendsBar';
import ControlBar from './ControlBar';
import DatesPanel from './DatesPanel/DatesPanel';
import DataLoader from './data/DataLoader';
import CalendarContainer from './CalendarContainer';

const MODULE_PREFIX = 'fl-msc';
const CUSTOM_DAYCOUNT = 80;

export default class ModuleCoordinator {
  constructor(xdiv, loadUrl, subjectsHeader, initialSubjectCount) {
    this.startDate = new CustomDate();
    this.dataLoader = new DataLoader(loadUrl);

    // create html container
    this.calendarContainer = new CalendarContainer(MODULE_PREFIX);

    // create controlBar
    this.controlBar = new ControlBar(this, MODULE_PREFIX);
    this.calendarContainer.set('controlBar', this.controlBar);

    // create titlesContainer
    this.legendsBar = new LegendsBar(subjectsHeader, MODULE_PREFIX);
    this.calendarContainer.set('legendsBar', this.legendsBar);

    // create datesContainer
    this.datesPanel = new DatesPanel(this.startDate, this, MODULE_PREFIX);
    this.calendarContainer.set('datesPanel', this.datesPanel);

    Object.preventExtensions(this);

    xdiv.appendChild(this.calendarContainer.html.container);

    // set start date and dayCount
    this.setStartDate(this.startDate);

    this.setDayCount(CUSTOM_DAYCOUNT);

    // add x subjects
    // this.setSubjectCount(initialSubjectCount);
    this.setSubjectCount(1);
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
    const method = count > currentCount ? 'addSubjects': 'removeSubjects';
    this[method](diff, 'end');
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
   * @param  {String} position 'beginning' or 'end'
   */
  async addSubjects(amount, position) {
    const referenceSubj = this.datesPanel.getSubjectAt(position);
    const newSubjects = await this.dataLoader.getSubjects(amount, position, referenceSubj);
    this.datesPanel.addSubjects(newSubjects, position);
    this.legendsBar.addSubjects(newSubjects, position);
  }

  /**
   * @public
   * @method getSubjectEvents
   * @param  {Array<Object>} subjects
   * @param  {CustomDate} fromDate
   * @param  {CustomDate} toDate
   * @return {Object<Array<Object>>} - Each key is a subjectId and
   * each value an array of event objects
   */
  async getSubjectsEvents(subjects, fromDate, toDate) {
    return await this.dataLoader.getSubjectsEvents(subjects, fromDate, toDate);
  }

  removeSubjects() {
    assert.warn('Not implemented');
  }
}
