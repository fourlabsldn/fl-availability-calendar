export default function debounce(callback, FuncDelay) {
  'use strict';
  var delay = FuncDelay;
  var params;
  var _this = this;
  var timeoutObj;

  function timeoutFunc() {
    if (timeoutObj) {
      clearTimeout(timeoutObj);
    }

    callback.apply(_this, params); //Call function with latest parameters
  }

  return function () {
    params = arguments;
    if (timeoutObj) {
      clearTimeout(timeoutObj);
    }

    timeoutObj = setTimeout(timeoutFunc, delay);

    //Now we return a function that allows the user to call the
    //method immediately and cancel any timeouts.
    //use it like myDebouncedFunc(arg1, arg2)("now!");
    return function (now) {
      if (now) {
        timeoutFunc();
      }
    };
  };
}
