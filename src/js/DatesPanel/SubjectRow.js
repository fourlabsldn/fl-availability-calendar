import Day from './Day';
import CustomDate from '../utils/CustomDate';
import ViewController from '../ViewController';

export default class SubjectRow extends ViewController {
  constructor(subject, rowStartDate, rowEndDate, modulePrefix) {
    super(modulePrefix);
    this.subject = subject;
    this.setEvents(subject.events, rowStartDate, rowEndDate);
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

  /**
   * @public
   * @method setEvents
   * @param  {Array<Object>} events - Ordered events index
   * @param  {CustomDate} rowStartDate
   * @param  {CustomDate} rowEndDate
   */
  setEvents(events, rowStartDate, rowEndDate) {
    const frag = document.createDocumentFragment();
    let pointerDate = new CustomDate(rowStartDate);
    let pointerEventIndex = 0;
    while (!pointerDate.isAfter(rowEndDate)) {
      let currEvent = events[pointerEventIndex];
      let newDay;
      while (currEvent && pointerDate.isAfter(currEvent.end)) {
        pointerEventIndex++;
        currEvent = events[pointerEventIndex];
      }
      if (currEvent && pointerDate.isAfter(currEvent.start)) {
        newDay = new Day(pointerDate, [currEvent], this.cssPrefix);
      } else {
        newDay = new Day(pointerDate, [], this.cssPrefix);
      }
      frag.appendChild(newDay.getContainer());
      pointerDate = new CustomDate(pointerDate).add(1, 'day');
    }
    this.html.container.innerHTML = '';
    this.html.container.appendChild(frag);
  }
}
