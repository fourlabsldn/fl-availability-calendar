/* globals xController */
import ModuleCoordinator from './ModuleCoordinator';

const INITIAL_SUBJECT_COUNT = 50;

xController((xdiv) => {
  const subjectsHeader = 'Properties';
  const loadUrl = xdiv.dataset.loadUrl;
  // return new Calendar(subjectsTitle, loadUrl, xdiv);
  return new ModuleCoordinator(xdiv, loadUrl, subjectsHeader, INITIAL_SUBJECT_COUNT);
});
