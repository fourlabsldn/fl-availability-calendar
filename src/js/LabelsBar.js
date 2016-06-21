import ViewController from './ViewController';

export default class LabelsBar extends ViewController {
  constructor(title, modulePrefix) {
    super(modulePrefix);
    Object.preventExtensions(this);

    this.html.header.textContent = title;
  }

  buildHtml() {
    this.html.header = document.createElement('div');
    this.html.header.classList.add(`${this.cssPrefix}-header`);
    this.html.container.appendChild(this.html.header);

    this.html.labelsContainer = document.createElement('div');
    this.html.labelsContainer.classList.add(`${this.cssPrefix}-labelsContainer`);
    this.html.container.appendChild(this.html.labelsContainer);
  }

  /**
   * Used by CalendarContainer
   * @public
   * @method getHeader
   * @return {HTMLElement}
   */
  getHeader() {
    return this.html.header;
  }

  /**
   * @public
   * @method setSubjects
   * @param  {Array<Object>} subjects
   */
  setSubjects(subjects) {
    const labels = Array.of(this.html.labelsContainer.children);
    labels.forEach(l => l.remove());
    this.addSubjects(subjects, 'end');
  }
  /**
   * @public
   * @method addSubjecta
   * @param  {Array<Object>} subjects
   * @param  {String} position 'beginning' or 'end'
   */
  addSubjects(subjects, position) {
    const newLabelsFrag = document.createDocumentFragment();
    for (const subject of subjects) {
      const label = this.createSubjectLabel(subject);
      newLabelsFrag.appendChild(label);
    }
    const labelsContainer = this.html.labelsContainer;
    const referenceIndex = position === 'end' ? -1 : 0;
    labelsContainer.insertBefore(newLabelsFrag, labelsContainer[referenceIndex]);
  }


  /**
   * @private
   * @method createSubjectLabel
   * @param  {Object} subject
   * @return {HTMLElement}
   */
  createSubjectLabel(subject) {
    const el = document.createElement('div');
    el.classList.add(`${this.cssPrefix}-label`);
    el.classList.add(this.createLabelIdentifier(subject));
    el.textContent = subject.name;
    el.title = subject.name;
    return el;
  }

  /**
   * @public
   * @method removeSubject
   * @param  {Object} subject
   * @return {void}
   */
  removeSubject(subject) {
    const identifier = this.createLabelIdentifier(subject);
    const labelNode = this.html.labelsContainer.querySelector(`.${identifier}`);
    labelNode.remove();
  }


  /**
   * @private
   * @method createLabelIdentifier
   * @param  {Object} subject
   * @return {String}
   */
  createLabelIdentifier(subject) {
    return `${this.cssPrefix}-label-${subject.id}`;
  }
}
