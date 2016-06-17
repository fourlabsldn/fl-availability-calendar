import ViewController from '../ViewController';
import DateBar from './DateBar';
import SubjectRow from './SubjectRow';

const CLASS_PREFIX = 'DatesPanel';
export default class DatesPanel extends ViewController {
  constructor(startDate, moduleCoordinator, modulePrefix) {
    super(modulePrefix, CLASS_PREFIX);

    this.dateBar = new DateBar(startDate, modulePrefix);
    this.subjectRows = [];

    Object.preventExtensions(this);

    this.html.container.insertBefore(
      this.dateBar.html.container,
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

  /**
   * @public
   * @method setDayCount
   * @param  {int} count
   */
  setDayCount(count) {
    this.dateBar.setDayCount(count);
    console.warn('setDayCount not fully implemented yet.');
  }

  /**
   * @public
   * @method setStartDate
   * @param  {CustomDate} date
   */
  setStartDate(date) {
    this.dateBar.setStartDate(date);
    console.warn('setStartDate not fully implemented yet.');
  }

  /**
   * @public
   * @method getSubjectAt
   * @param  {String} position 'end' or 'beginning'
   * @return {Object}
   */
  getSubjectAt(position) {
    const subjIndex = position === 'end' ? this.subjectRows.length - 1 : 0;
    return this.subjectRows[subjIndex].getSubject();
  }

  /**
   * Create Subject rows
   * @method addSubjects
   * @param  {Array<Object>} subjects
   * @param  {String} position
   */
  async addSubjects(subjects, position) {
    const events = await this.moduleCoordinator.getSubjectsEvents(subjects);
    for (const subject of subjects) {
      const newRow = new SubjectRow(subject);
      this.addRow(newRow, position);
      newRow.setEvents(events[subject.id]);
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
      referenceNodeIndex = subjectsContainer.children.length - 1;
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
