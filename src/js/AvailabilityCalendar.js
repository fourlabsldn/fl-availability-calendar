import ModuleCoordinator from './ModuleCoordinator';
import Configuration from './Configuration';
import assert from 'fl-assert';
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
    assert(typeof credentials === 'object', `${credentials} is not an object`);
    Configuration.set('credentials', credentials);
  }

  setFilter(filters) {
    assert(typeof filters === 'object', `${filters} is not an object`);
    Configuration.set('filters', filters);
  }

  /**
   * @public
   * @method onEventClick
   * @param  {Function} callback :: (details, e) => void
   * @return {void}
   */
  onEventClick(callback) {
    assert(typeof callback === 'function', `${callback} is not a function`);
    Configuration.set('eventClickCallback', callback);
  }

  /**
   * Process the text to be shown on event hover
   * @public
   * @method hoverText
   * @param  {Function} callback :: (details) => String
   * @return {void}
   */
  eventHoverText(callback) {
    assert(typeof callback === 'function', `${callback} is not a function`);
    Configuration.set('eventHoverTextGenerator', callback);
  }
}
