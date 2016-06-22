import ViewController from './ViewController';
import CustomDate from './utils/CustomDate';
import debounce from './utils/debounce';

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
    this.prepareSetLoading();
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
   * Creates the setLoading function. It has to be done this way because
   * it has to be debounced.
   * @private
   * @method prepareSetLoading
   * @return {void}
   */
  prepareSetLoading() {
    const minimumAnimationTime = 500;
    const setLoadingImmediate = (active) => {
      if (active) {
        this.html.refreshBtn.classList.add(`${this.cssPrefix}-btn-refresh--rotate`);
      } else {
        this.html.refreshBtn.classList.remove(`${this.cssPrefix}-btn-refresh--rotate`);
      }
    };
    const setLoadingDebounced = debounce(minimumAnimationTime, setLoadingImmediate);

    /**
     * Activates the loading icon spin
     * @public
     * @method setLoading
     * @param  {Boolean} active
     */
    this.setLoading = (active) => {
      return active ? setLoadingImmediate(active) : setLoadingDebounced(active);
    };
  }

}
