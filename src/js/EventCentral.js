import assert from 'fl-assert';
const allowedEvents = [
  'eventCreated',
];

class EventCentral {
  constructor() {
    this.listeners = {};
  }

  on(eventName, listener) {
    assert(allowedEvents.includes(eventName),
      `${eventName} is not a valid configuraiton event`);
    assert(typeof listener === 'function', `${listener} is not a function`);
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }

    this.listeners[eventName].push(listener);
  }

  trigger(eventName, ...args) {
    if (!this.listeners[eventName]) {
      return;
    }

    this.listeners[eventName].forEach(l => l(...args));
  }
}

export default new EventCentral();
