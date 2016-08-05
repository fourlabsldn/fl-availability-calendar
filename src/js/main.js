/* globals xController */
import './utils/fetch-polyfill';
import AvailabilityCalendar from './AvailabilityCalendar';
import Configuration from './Configuration';

xController((xdiv) => {
  Configuration.set('loadUrl', xdiv.dataset.loadUrl);
  Configuration.set('header', xdiv.dataset.header);
  Configuration.set('filters', JSON.parse(xdiv.dataset.filters));
  Configuration.set('credentials', JSON.parse(xdiv.dataset.credentials));
  // return new Calendar(subjectsTitle, loadUrl, xdiv);
  window.AvailabilityCalendar = new AvailabilityCalendar(xdiv);
});
