export default function PopUp() {

  //Make sure it is called as a constructor
  if (!(this instanceof PopUp)) {
    return new PopUp();
  }

  var inDOM = false;
  var locked = false;
  var freeToHideTimer;

  this.el = document.createElement('p');
  this.el.classList.add('cal-popup');

  this.el.addEventListener('mouseover', function () {
    locked = true;
  }, true);

  this.el.addEventListener('mouseout', function () {
    locked = false;
  }, true);

  this.setText = function setText(text) {
    this.el.innerText = text;
  };

  function getOffset(element) {
    var xPosition = 0;
    var yPosition = 0;

    while (element) {
      xPosition += (element.offsetLeft + element.clientLeft);
      yPosition += (element.offsetTop + element.clientTop);
      element = element.offsetParent;
    }

    return {
      left: xPosition,
      top: yPosition,
    };
  }

  this.goTo = function goTo(x, y) {
    var xDivX = getOffset(xDivEl).left;
    var xDivY = getOffset(xDivEl).top;
    var transX = x - xDivX;
    var transY = y - xDivY;

    this.el.style.webkitTransform = 'translate3d(' + transX + 'px ,' + transY + 'px ,0)';
    this.el.style.transform = 'translate3d(' + transX + 'px ,' + transY + 'px ,0)';

    if (!inDOM) {
      xDivEl.appendChild(this.el);
      inDOM = true;
    }
  };

  this.show = function show() {
    this.el.style.opacity = 1;
    this.el.style.visibility = 'visible';
  };

  this.showAt = function showAt(text, x, y) {
    this.setText(text);
    this.goTo(x, y);
    this.show();
    clearInterval(freeToHideTimer);
  };

  this.freeToHide = function freeToHide() {
    // Will wait for a second and then check whether the
    //popup can be hidden. If someone asks for it to be shown
    //somewhere else this timer is cancelled.
    var _this = this;
    freeToHideTimer = setInterval(function () {
      if (!locked) {
        clearInterval(freeToHideTimer);
        _this.hide();
      }
    }, 1000);

  };

  this.hide = function hide() {
    this.el.style.opacity = 0;
    this.el.style.visibility = 'hidden';
  };

  return this;
}
