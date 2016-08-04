import assert from 'fl-assert';

class Globals {
  constructor() {
    this.state = {};
  }

  setEventHoverTextGenerator(func) {
    assert(typeof func === 'function', `${func} is not a function.`);
    this.state.eventHoverTextGenerator = func;
  }

  getEventHoverTextGenerator() {
    return this.state.eventHoverTextGenerator;
  }

  setEventClickCallback(func) {
    assert(typeof func === 'function', `${func} is not a function.`);
    this.state.eventClick = func;
  }

  getEventClickCallback() {
    return this.state.eventClick;
  }
}

export default new Globals();
