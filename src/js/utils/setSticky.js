/* eslint-disable no-param-reassign */

import assert from 'fl-assert';
const acceptableSides = ['left', 'top'];

export default function setSticky(side, element) {
  assert(acceptableSides.includes(side), `Invalid value for side: ${side}`);
  const container = element.parentNode;
  assert(container && typeof container.addEventListener === 'function',
    'Element does not have a parent.');

  let moved = true;
  const moveFunction = () => {
    if (moved) { return; }
    moved = true;
    if (side === 'left') {
      element.style.left = `${container.scrollLeft}px`;
    } else {
      element.style.top = `${container.scrollTop}px`;
    }
  };

  container.addEventListener('scroll', () => {
    // If not moved is because scroll has been called and the animation frame
    // function was not triggered yet
    if (!moved) { return; }
    moved = false;
    requestAnimationFrame(moveFunction);
  });
}
