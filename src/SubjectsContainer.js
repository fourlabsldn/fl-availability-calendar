import Subject from './Subject';
import DataLoader from './DataLoader';
import assert from 'fl-assert';
import CustomDate from './CustomDate';
import ViewController from './ViewController';

const CLASS_PREFIX = 'subjects';
export default class SubjectsContainer extends ViewController {
  /**
   * @method constructor
   * @param  {String} loadUrl - URL from where to fetch subject data.
   * @param  {CustomDate} startDate
   * @param  {CustomDate} endDate
   * @param  {String} modulePrefix
   * @return {SubjectsContainer}
   */
  constructor(loadUrl, modulePrefix) {
    super();
    this.dataLoader = new DataLoader(loadUrl);
    this.startDate = null;
    this.endDate = null;
    this.subjects = [];

    Object.preventExtensions(this);
    this.html.container.classList.add(`${modulePrefix}-${CLASS_PREFIX}`);
  }

  /**
   * TODO: Make this work and make it an async function
   * Add subject rows to the container
   * @method addSubjects
   * @param  {String} topBottom - Accepts 'top' or 'bottom'
   * @param  {Int} amount
   */
  addSubjects(topBottom, amount = 1) {
    if (topBottom !== 'bottom') { console.log('Not implemented'); }

    for (let i = 0; i < amount; i++) {
      const newSubject = new Subject({ name: 'test', id: 123 });
      this.subjects.push(newSubject);
      this.html.container.appendChild(newSubject.html.container);
    }
  }

  /**
   * @method removeSubjects
   * @param  {String} topBottom - Accepts 'top' or 'bottom'
   * @param  {Int} amount
   */
  removeSubjects(topBottom, amount) {
    assert(typeof topBottom === 'string',
      'TypeError: invalid value for topBottom. Expected String and got ${typeof topBottom}');
    let start;
    let end;

    if (topBottom === 'bottom') {
      end = this.subjects.length;
      start = end - amount;
    } else if (topBottom === 'top') {
      end = amount;
      start = 0;
    } else {
      assert(false, 'Invalid value for topBottom: ${topBottom}');
    }

    for (let subjIndex = start; subjIndex < end; subjIndex++) {
      const [erasedSubject] = this.subjects.splice(subjIndex, 1);
      erasedSubject.destroy();
    }
  }

  /**
   * Sets the amount of days being shown in each subject row.
   * @method setDayCount
   * @param  {Int} count
   */
  setDayCount(count) {
    this.subjects.forEach(subject => subject.setDayCount(count));
  }

  setStartDate(startDate) {
    assert(
      startDate instanceof CustomDate,
      'TypeError: startDate is not an instance of CustomDate'
    );
    this.startDate = startDate;
    this.subjects.forEach((subject) => {
      subject.setStartDate(startDate);
    });
  }

  /**
   * @method setEvents
   * @param  {Object<Array>} subjectsEvents - Object where each key is a subject
   *                                        id and each value is a subject's events.
   */
  setEvents(subjectsEvents) {
    const ids = Object.keys(subjectsEvents);
    for (const id of ids) {
      const subj = this.subjects.find(sub => sub.id === id);
      if (subj) {
        subj.setEvents(subjectsEvents[id]);
      }
    }
  }

  scrollLeft() {
    this.subjects.forEach(subject => subject.scrollLeft());
  }
  scrollRight() {
    this.subjects.forEach(subject => subject.scrollRight());
  }
  scrollUp() {
    this.addSubjects('top', 1);
    this.removeSubjects('bottom', 1);
  }
  scrollDown() {
    this.addSubjects('down', 1);
    this.removeSubjects('bottom', 1);
  }
}
