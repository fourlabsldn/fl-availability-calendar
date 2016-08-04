import ModuleCoordinator from './ModuleCoordinator';
const INITIAL_SUBJECT_COUNT = 100;

/**
 *  API that will talk to the outside world.
 * @class AvailabilityCalendar
 */
export default class AvailabilityCalendar {
  constructor(xdiv, loadUrl, subjectsHeader) {
    this.moduleCoordinator = new ModuleCoordinator(
      xdiv,
      loadUrl,
      subjectsHeader,
      INITIAL_SUBJECT_COUNT
    );
  }

  setCredentials(credentials) {
    this.moduleCoordinator.setCredentials(credentials);
  }

  setFilter(filters) {
    this.moduleCoordinator.setFilter(filters);
  }

  /**
   * @public
   * @method onEventClick
   * @param  {Function} callback :: (details, e) => void
   * @return {void}
   */
  onEventClick(callback) {
    this.moduleCoordinator.onEventClick(callback);
  }

  /**
   * Process the text to be shown on event hover
   * @public
   * @method hoverText
   * @param  {Function} callback :: (details) => String
   * @return {void}
   */
  eventHoverText(callback) {
    this.moduleCoordinator.eventHoverText(callback);
  }
}
