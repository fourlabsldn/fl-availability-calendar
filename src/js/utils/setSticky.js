/* eslint-disable no-param-reassign */

import assert from 'fl-assert';
const acceptableSides = ['left', 'top'];

export default function setSticky(side, element, container) {
  assert(acceptableSides.includes(side), `Invalid value for side: ${side}`);
  assert(container && typeof container.addEventListener === 'function',
    'Element does not have a parent.');

  console.log('Element:', element);
  console.log('Container:', container);
  let moved = true;
  const moveFunction = () => {
    console.log(`moving: ${side}`);
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
