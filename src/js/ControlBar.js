import ViewController from './ViewController';
import CustomDate from './utils/CustomDate';
import assert from 'fl-assert';


const DATEPICKER_FORMAT = 'YYYY-[W]WW';
export default class ControlBar extends ViewController {
  /**
   * @constructor
   * @param  {ModuleCoordinator} moduleCoordinator
   * @param  {String} modulePrefix
   * @return {ControlBar}
   */
  constructor(moduleCoordinator, modulePrefix) {
    super(modulePrefix);
    this.moduleCoordinator = moduleCoordinator;
    this.startDate = this.moduleCoordinator.getStartDate();
    this.loadingTimeout = null;
    Object.preventExtensions(this);

    this.acceptEvents('refreshBtnPressed');
  }

  buildHtml() {
    this.createButtons();
    this.setListeners();
  }

  /**
   * @private
   * @method createButtons
   * @param  {String} [cssPrefix]
   * @return {void}
   */
  createButtons() {
    const datePicker = document.createElement('input');
    datePicker.classList.add(`${this.cssPrefix}-btn`);
    datePicker.classList.add(`${this.cssPrefix}-datepicker`);
    datePicker.setAttribute('type', 'week');
    this.html.datePicker = datePicker;
    this.html.container.appendChild(datePicker);

    const scrollLeftBtn = document.createElement('button');
    scrollLeftBtn.classList.add(`${this.cssPrefix}-btn`);
    scrollLeftBtn.innerHTML = '<';
    this.html.scrollLeftBtn = scrollLeftBtn;
    this.html.container.appendChild(scrollLeftBtn);

    const scrollRightBtn = document.createElement('button');
    scrollRightBtn.classList.add(`${this.cssPrefix}-btn`);
    scrollRightBtn.innerHTML = '>';
    this.html.scrollRightBtn = scrollRightBtn;
    this.html.container.appendChild(scrollRightBtn);

    const refreshBtn = document.createElement('button');
    refreshBtn.classList.add(`${this.cssPrefix}-btn`);
    refreshBtn.classList.add(`${this.cssPrefix}-btn-refresh`);
    refreshBtn.innerHTML = '';
    this.html.refreshBtn = refreshBtn;
    this.html.container.appendChild(refreshBtn);

    const errorMessage = document.createElement('span');
    errorMessage.classList.add(`${this.cssPrefix}-errorMessage`);
    errorMessage.innerHTML = '';
    this.html.errorMessage = errorMessage;
    this.html.container.appendChild(errorMessage);
  }

  /**
   * @private
   * @method setListeners
   */
  setListeners() {
    this.html.datePicker.addEventListener('change', () => {
      const datepickerDate = new CustomDate(this.html.datePicker.value);
      const normalisedDate = datepickerDate.startOf('isoweek');
      this.moduleCoordinator.setStartDate(normalisedDate);
    });

    this.html.scrollLeftBtn.addEventListener('click', () => {
      this.scroll('left');
    });

    this.html.scrollRightBtn.addEventListener('click', () => {
      this.scroll('right');
    });

    this.html.refreshBtn.addEventListener('click', () => {
      this.trigger('refreshBtnPressed');
    });
  }

  /**
   * @public
   * @method setDatepickerDate
   * @param  {CustomDate} date
   */
  setDatepickerDate(date) {
    this.html.datePicker.value = date.format(DATEPICKER_FORMAT);
  }

  /**
   * @private
   * @method scroll
   * @param  {String} direction - up, down, left or right
   * @return {void}
   */
  scroll(direction) {
    const dayCount = this.moduleCoordinator.getDayCount();
    const daysToScroll = parseInt(dayCount * 2 / 3, 10) * (direction === 'right' ? 1 : -1);
    const currStartDate = this.moduleCoordinator.getStartDate();
    const newStartDate = new CustomDate(currStartDate).add(daysToScroll, 'days');
    this.moduleCoordinator.setStartDate(newStartDate);
  }

  /**
  * @public
  * @method setLoadingState
  * @param  {String} state 'loading', 'success', 'failure'
  */
  setLoadingState(state, message = '') {
    const minimumDelay = 1500;
    const loadingClass = `${this.cssPrefix}-btn-refresh--loading`;
    const successClass = `${this.cssPrefix}-btn-refresh--success`;
    const failureClass = `${this.cssPrefix}-btn-refresh--failure`;

    const setLoadingSpin = (on) => {
      const method = on ? 'add' : 'remove';
      this.html.refreshBtn.classList[method](loadingClass);
      this.html.refreshBtn.classList.remove(successClass, failureClass);
      this.html.errorMessage.innerHTML = '';
    };

    clearTimeout(this.loadingTimeout);
    this.html.refreshBtn.classList.remove(loadingClass, successClass, failureClass);
    switch (state) {
      case 'loading':
        setLoadingSpin(true);
        break;
      case 'success':
        this.html.refreshBtn.classList.add(successClass);
        this.loadingTimeout = setTimeout(() => setLoadingSpin(false), minimumDelay);
        break;
      case 'failure':
        this.html.refreshBtn.classList.add(failureClass);
        this.html.errorMessage.innerHTML = message;
        this.loadingTimeout = setTimeout(() => setLoadingSpin(false), minimumDelay);
        break;
      default:
        assert(false, `Invalid state option ${state}`);
    }
  }
}
