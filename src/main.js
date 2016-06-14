/* globals xController */
import Calendar from './Calendar';

xController((xdiv) => {
  const subjectsTitle = 'Properties';
  const loadUrl = xdiv.dataset.loadUrl;
  return new Calendar(subjectsTitle, loadUrl, xdiv);
});
