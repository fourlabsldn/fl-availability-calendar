/* globals xController */
import Calendar from './Calendar';

xController((xdiv) => {
  const subjectsTitle = 'Properties';
  const loadUrl = '/';
  return new Calendar(subjectsTitle, loadUrl, xdiv);
});
