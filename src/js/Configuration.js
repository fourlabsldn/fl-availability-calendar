import assert from 'fl-assert';
const allowedProperties = [
  'eventHoverTextGenerator',
  'eventClickCallback',
  'filters',
  'credentials',
  'header',
  'loadUrl',
];

class Configuration {
  constructor() {
    this.state = {};
    this.listeners = {};
  }

  set(property, value) {
    assert(allowedProperties.includes(property),
      `${property} is not a valid configuraiton property`);
    const oldValue = this.state[property];
    this.state[property] = value;
    this.trigger(property, value, oldValue);
  }

  get(property) {
    return this.state[property];
  }

  onChange(property, listener) {
    assert(typeof listener === 'function', `${listener} is not a function`);
    if (!this.listeners[property]) {
      this.listeners[property] = [];
    }

    this.listeners[property].push(listener);
  }

  trigger(property, ...args) {
    if (!this.listeners[property]) {
      return;
    }

    this.listeners[property].forEach(l => l(...args));
  }
}

export default new Configuration();
