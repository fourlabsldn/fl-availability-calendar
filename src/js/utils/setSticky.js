/* eslint-disable no-param-reassign, prefer-arrow-callback */

// TODO use first parent non-static. Warn if element is not 'relative' or 'absolute' positioned
import assert from 'fl-assert';
const acceptableSides = ['left', 'top'];
const containers = new Map();
const updatedContainers = new Map();


export default function setSticky(side, element, container) {
  return;
  assert(acceptableSides.includes(side), `Invalid value for side: ${side}`);
  assert(container && typeof container.addEventListener === 'function',
    'Element does not have a parent.');

  if (!containers.has(container)) {
    trackContainer(container);
  }

  let upToDate = true;
  function moveFunction() {
    upToDate = true;
    const containerInfo = containers.get(container);
    if (side === 'left') {
      element.style.left = `${containerInfo.scrollLeft}px`;
    } else {
      element.style.top = `${containerInfo.scrollTop}px`;
    }
  }

  container.addEventListener('scroll', () => {
    // If not moved is because scroll has been called and the animation frame
    // function was not triggered yet
    if (!upToDate) { return; }
    upToDate = false;
    requestAnimationFrame(moveFunction);
  });
}

function trackContainer(container) {
  updatedContainers.set(container, true);
  container.addEventListener('scroll', function prepareContainerValueUpdate() {
    if (updatedContainers.get(container) === false) { return; }
    updatedContainers.set(container, false);
    requestAnimationFrame(() => updateContainerCoordinates(container));
  });
}

function updateContainerCoordinates(el) {
  containers.set(el, {
    scrollTop: el.scrollTop,
    scrollLeft: el.scrollLeft,
  });
  updatedContainers.set(el, true);
}
