import DateBar from './DateBar';
import SubjectRow from './SubjectRow';
import ViewController from '../ViewController';

const CLASS_PREFIX = 'DatesPanel';
export default class DatesPanel extends ViewController {
  constructor(startDate, modulePrefix) {
    super(modulePrefix, CLASS_PREFIX);
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

  getSubjects() {
    return this.subjectRows.map(r => r.getSubject());
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
   * @public
   * @method setSubjects
   * @param  {Array<objects>} subjects
   * @param  {CustomDate} fromDate
   * @param  {CustomDate} toDate
   */
  setSubjects(subjects, fromDate, toDate) {
    // TODO: Change this for a setDateRange method
    this.dateBar.setStartDate(fromDate);
    this.dateBar.setDayCount(toDate.diff(fromDate, 'days'));

    this.clearRows();
    for (const subject of subjects) {
      this.addRow(subject, fromDate, toDate, 'end');
    }
  }

  /**
   * Adds rows to represent subjects
   * @method addSubjects
   * @param  {Array<Object>} subjects
   * @param  {String} position 'beginning' or 'end'
   */
  addSubjects(subjects, position) {
    const fromDate = this.getStartDate();
    const toDate = this.getEndDate();
    subjects.forEach(s => this.addRow(s, fromDate, toDate, position));
  }

  /**
   * @private
   * @method addRow
   * @param  {SubjectRow} newRow
   * @param  {String} position 'beginning' or 'end'
   * @return {SubjectRow}
   */
  addRow(subject, fromDate, toDate, position) {
    const newRow = new SubjectRow(subject, fromDate, toDate, this.modulePrefix);
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

    return newRow;
  }

  clearRows() {
    for (const row of this.subjectRows) {
      row.destroy();
    }
    this.subjectRows = [];
  }
}
