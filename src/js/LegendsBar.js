import ViewController from './ViewController';
const CLASS_PREFIX = 'LegendsBar';

export default class LegendsBar extends ViewController {
  constructor(title, modulePrefix) {
    super(modulePrefix, CLASS_PREFIX);
    Object.preventExtensions(this);

    this.html.header.textContent = title;
  }

  buildHtml() {
    this.html.header = document.createElement('div');
    this.html.header.classList.add(`${this.cssPrefix}-header`);
    this.html.container.appendChild(this.html.header);

    this.html.legendsContainer = document.createElement('div');
    this.html.container.appendChild(this.html.legendsContainer);
  }

  /**
   * @public
   * @method addSubject
   * @param  {Object} subject
   * @param  {String} beforeAfter
   */
  addSubject(subject, beforeAfter) {
    const legend = this.createSubjectLegend(subject);
    const referenceNode = beforeAfter === 'before'
      ? this.html.legendsContainer.children[0]
      : null;
    this.html.legendsContainer.insertBefore(legend, referenceNode);
  }

  /**
   * @public
   * @method removeSubject
   * @param  {Object} subject
   * @return {void}
   */
  removeSubject(subject) {
    const identifier = this.createLegendIdentifier(subject);
    const legendNode = this.html.legendsContainer.querySelector(`.${identifier}`);
    legendNode.remove();
  }

  /**
   * @private
   * @method createSubjectLegend
   * @param  {Object} subject
   * @return {HTMLElement}
   */
  createSubjectLegend(subject) {
    const el = document.createElement('div');
    el.classList.add(`${this.cssPrefix}-legend`);
    el.classList.add(this.createLegendIdentifier(subject));
    el.textContent = subject.name;
    return el;
  }

  /**
   * @private
   * @method createLegendIdentifier
   * @param  {Object} subject
   * @return {String}
   */
  createLegendIdentifier(subject) {
    return `${this.cssPrefix}-legend-${subject.id}`;
  }
}
