import DateBar from './DateBar';
import SubjectRow from './SubjectRow';
import ViewController from '../ViewController';
import CustomDate from '../utils/CustomDate';

const CLASS_PREFIX = 'DatesPanel';
export default class DatesPanel extends ViewController {
  constructor(startDate, moduleCoordinator, modulePrefix) {
    super(modulePrefix, CLASS_PREFIX);
    this.moduleCoordinator = moduleCoordinator;
    this.dateBar = new DateBar(startDate, modulePrefix);
    this.subjectRows = [];

    Object.preventExtensions(this);

    this.html.container.insertBefore(
      this.dateBar.getContainer(),
      this.html.container.children[0]
    );
  }

  buildHtml() {
    this.html.subjectsContainer = document.createElement('div');
    this.html.subjectsContainer.classList.add(`${this.cssPrefix}-subjectsContainer`);
    this.html.container.appendChild(this.html.subjectsContainer);
  }

  getSubjectCount() {
    return this.subjectRows.length;
  }

  getDayCount() {
    return this.dateBar.getDayCount();
  }

  getStartDate() {
    return this.dateBar.getStartDate();
  }

  getEndDate() {
    return this.dateBar.getEndDate();
  }


  /**
   * Used by CalendarContainer
   * @public
   * @method getDateBar
   * @return {ViewController}
   */
  getDateBar() {
    return this.dateBar;
  }

  /**
   * @public
   * @method setDayCount
   * @param  {int} count
   */
  async setDayCount(count) {
    this.dateBar.setDayCount(count);
    await this.setRowsStartDate(this.getStartDate());
  }

  /**
   * @public
   * @method setStartDate
   * @param  {CustomDate} date
   */
  async setStartDate(date) {
    this.dateBar.setStartDate(date);
    await this.setRowsStartDate(date);
  }

  /**
   * Makes all subjectRows' start date be the current DatesPanel start Date.
   * @private
   * @method setRowsStartDate
   * @return {Promise}
   */
  async setRowsStartDate(date) {
    const dayCount = this.getDayCount();
    const fromDate = new CustomDate(date);
    const toDate = new CustomDate(date).add(dayCount - 1, 'days');
    const subjects = this.subjectRows.map(r => r.getSubject());
    const newEvents = await this.moduleCoordinator.getSubjectsEvents(subjects, fromDate, toDate);

    for (const subjectRow of this.subjectRows) {
      const subject = subjectRow.getSubject();
      subjectRow.setEvents(newEvents[subject.id], fromDate, toDate);
    }
  }
  /**
   * @public
   * @method getSubjectAt
   * @param  {String} position 'end' or 'beginning'
   * @return {Object} - or Null if none exist.
   */
  getSubjectAt(position) {
    const subjRowIndex = position === 'end' ? this.subjectRows.length - 1 : 0;
    const subjRow = this.subjectRows[subjRowIndex];
    return subjRow ? subjRow.getSubject() : null;
  }

  /**
   * Create Subject rows
   * @method addSubjects
   * @param  {Array<Object>} subjects
   * @param  {String} position
   */
  async addSubjects(subjects, position) {
    const fromDate = this.getStartDate();
    const toDate = this.getEndDate();
    for (const subject of subjects) {
      const newRow = new SubjectRow(subject, this.modulePrefix);
      this.addRow(newRow, position);
      newRow.setEvents(subject.events, fromDate, toDate);
    }
  }

  /**
   * @private
   * @method addRow
   * @param  {SubjectRow} newRow
   * @param  {String} position 'beginning' or 'end'
   */
  addRow(newRow, position) {
    const subjectsContainer = this.html.subjectsContainer;
    let referenceNodeIndex;
    if (position === 'end') {
      this.subjectRows = [newRow].concat(this.subjectRows);
      referenceNodeIndex = -1;
    } else {
      this.subjectRows = this.subjectRows.concat([newRow]);
      referenceNodeIndex = 0;
    }
    subjectsContainer.insertBefore(
      newRow.getContainer(),
      subjectsContainer.children[referenceNodeIndex]
    );
  }
}
