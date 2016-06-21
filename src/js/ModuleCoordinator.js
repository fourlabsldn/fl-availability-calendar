// import assert from 'fl-assert';
import CustomDate from './utils/CustomDate';
import LabelsBar from './LabelsBar';
import ControlBar from './ControlBar';
import DatesPanel from './DatesPanel/DatesPanel';
import DataLoader from './data/DataLoader';
import CalendarContainer from './CalendarContainer';

const MODULE_PREFIX = 'fl-msc';
const CUSTOM_DAYCOUNT = 80;

export default class ModuleCoordinator {
  constructor(xdiv, loadUrl, subjectsHeader, initialSubjectCount) {
    this.startDate = new CustomDate();
    this.endDate = new CustomDate();
    this.dataLoader = new DataLoader(loadUrl);

    // create html container
    this.calendarContainer = new CalendarContainer(MODULE_PREFIX);

    // create controlBar
    this.controlBar = new ControlBar(this, MODULE_PREFIX);
    this.calendarContainer.set('controlBar', this.controlBar);

    // create titlesContainer
    this.labelsBar = new LabelsBar(subjectsHeader, MODULE_PREFIX);
    this.calendarContainer.set('labelsBar', this.labelsBar);

    // create datesContainer
    this.datesPanel = new DatesPanel(this.startDate, MODULE_PREFIX);
    this.calendarContainer.set('datesPanel', this.datesPanel);

    Object.preventExtensions(this);

    xdiv.appendChild(this.calendarContainer.html.container);

    // set start date and dayCount
    this.setDateRange(
      this.startDate,
      new CustomDate(this.endDate).add(CUSTOM_DAYCOUNT, 'days')
    )
    .then(() => this.setSubjectCount(initialSubjectCount));
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
   * @method getEndDate
   * @return {CustomDate}
   */
  getEndDate() {
    return new CustomDate(this.endDate);
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
   * @private
   * @method getDayCount
   * @return {Int}
   */
  getDayCount() {
    return this.endDate.diff(this.startDate, 'days');
  }

  /**
   * @method setStartDate
   * @param  {CustomDate} date
   */
  async setStartDate(date) {
    const newEndDate = new CustomDate(date).add(this.getDayCount(), 'days');
    return await this.setDateRange(date, newEndDate);
  }

  /**
   * @private
   * @method setStartDate
   * @param  {CustomDate} fromDate
   * @param  {CustomDate} toDate
   */
  async setDateRange(fromDate, toDate) {
    if (fromDate.sameDay(this.getStartDate()) && toDate.sameDay(this.getEndDate())) { return; }
    const newFromDate = new CustomDate(fromDate).startOf('day');
    const newToDate = new CustomDate(toDate);
    const currentSubjects = this.datesPanel.getSubjects();
    const newSubjectEnvents = await this.dataLoader.getSubjectsEvents(
      currentSubjects,
      newFromDate,
      newToDate
    );
    this.datesPanel.setSubjects(newSubjectEnvents, fromDate, toDate);
    this.startDate = new CustomDate(newFromDate);
    this.endDate = new CustomDate(newToDate);
    this.controlBar.setDatepickerDate(newFromDate);
  }

  /**
   * @public
   * @method setSubjectCount
   * @param {Int} count
   */
  async setSubjectCount(count) {
    const currentSubjects = this.datesPanel.getSubjects();
    const currentSubjectCount = currentSubjects.length;
    if (count === currentSubjectCount) { return; }
    if (count > currentSubjectCount) {
      this.addSubjects(count - currentSubjectCount, 'end');
    } else {
      const fromDate = this.getStartDate();
      const toDate = this.getEndDate();
      this.datesPanel.setSubjects(currentSubjects.slice(0, count), fromDate, toDate);
      this.labelsBar.setSubjects(currentSubjects.slice(0, count));
    }
  }

  /**
   * @private
   * @method addSubject
   * @param  {String} position 'beginning' or 'end'
   */
  async addSubjects(amount, position) {
    const fromDate = this.getStartDate();
    const toDate = this.getEndDate();
    const referenceSubj = this.datesPanel.getSubjectAt(position);
    const newSubjects = await this.dataLoader.getSubjects(
      amount,
      position,
      referenceSubj,
      fromDate,
      toDate
    );
    this.datesPanel.addSubjects(newSubjects, position);
    this.labelsBar.addSubjects(newSubjects, position);
  }
}
