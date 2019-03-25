class MessageBus {
  constructor(initialValue) {
    this.lastValue = initialValue;
    this.listeners = [];
  }

  addListener(listener) {
    this.listeners.push(listener);

    listener(this.lastValue);
  }

  removeListener(listener) {
    const index = this.listeners.indexOf(listener);

    if (index < 0) {
      throw new Error('listener not found');
    }

    this.listeners.splice(index, 1);
  }

  update(value) {
    this.lastValue = value;

    for (let i = this.listeners.length - 1; i >= 0; i--) {
      this.listeners[i](value);
    }
  }
}

export default MessageBus;
