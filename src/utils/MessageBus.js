class MessageBus {
  constructor() {
    this.listeners = [];
  }

  addListener(listener) {
    this.listeners.push(listener);
  }

  removeListener(listener) {
    const index = this.listeners.indexOf(listener);

    if (index < 0) {
      throw new Error('listener not found');
    }

    this.listeners.splice(index, 1);
  }

  update(value) {
    for (let i = this.listeners.length - 1; i >= 0; i--) {
      this.listeners[i](value);
    }
  }
}

export default MessageBus;
