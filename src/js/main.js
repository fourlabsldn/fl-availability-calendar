/* globals xController */
import AvailabilityCalendar from './AvailabilityCalendar';

xController((xdiv) => {
  const loadUrl = xdiv.dataset.loadUrl;
  const subjectsHeader = xdiv.dataset.header || 'Subjects';
  // return new Calendar(subjectsTitle, loadUrl, xdiv);
  window.AvailabilityCalendar = new AvailabilityCalendar(xdiv, loadUrl, subjectsHeader);
});
