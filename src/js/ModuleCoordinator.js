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
    const method = count > currentCount ? 'removeSubjects' : 'addSubjects';
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
    for (const newSubject of newSubjects) {
      this.datesPanel.addSubject(newSubject);
      this.legendsBar.addSubject(newSubject);
    }
  }

  /**
   * @public
   * @method getSubjectEvents
   * @param  {Int} id
   * @param  {CustomDate} fromDate
   * @param  {CustomDate} toDate
   * @return {Array<Object>}
   */
  async getSubjectEvents(id, fromDate, toDate) {
    return await this.dataLoader.getSubjectEvents(id, fromDate, toDate);
  }
}
