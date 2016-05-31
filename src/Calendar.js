import ControlBar from './ControlBar';
import DateBar from './DateBar';
import CustomDate from './CustomDate';
import SubjectsContainer from './SubjectsContainer';
import ViewController from './ViewController';

const CLASS_PREFIX = 'fl-msc';

export default class Calendar extends ViewController {
  constructor(loadUrl, xdiv) {
    super();

    this.startDate = new CustomDate();

    this.dateBar = new DateBar(CLASS_PREFIX);
    this.subjectsContainer = new SubjectsContainer(loadUrl, CLASS_PREFIX);
    this.controlBar = new ControlBar(
      this.startDate,
      this.dateBar,
      this.subjectsContainer,
      CLASS_PREFIX
    );

    this.buildHtml(
      xdiv,
      this.controlBar,
      this.dateBar,
      this.subjectsContainer
    );

    Object.preventExtensions(this);
  }

  /**
   * Creates the HTML structure for the Calendar
   * @method buildHtml
   * @param  {HTMLElement} xdiv - Container Element
   * @param  {controlBar} controlBar
   * @param  {dateBar} dateBar
   * @param  {Array<Subject>} subjects
   * @return {void}
   */
  buildHtml(
    xdiv,
    controlBar = this.controlBar,
    dateBar = this.dateBar,
    subjectsContainer = this.subjectsContainer
  ) {
    const container = this.html.container;
    container.classList.add(CLASS_PREFIX);
    container.appendChild(controlBar.html.container);
    container.appendChild(dateBar.html.container);
    container.appendChild(subjectsContainer.html.container);

    this.html.container = container;
    xdiv.appendChild(container);
  }
}