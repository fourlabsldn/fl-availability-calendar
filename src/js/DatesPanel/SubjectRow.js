import ViewController from '../ViewController';

export default class SubjectRow extends ViewController {
  constructor(subject, modulePrefix) {
    super(modulePrefix);
    this.subject = subject;
  }

  buildHtml() {

  }

  /**
   * @public
   * @method getSubject
   * @return {Object}
   */
  getSubject() {
    return this.subject;
  }
}
