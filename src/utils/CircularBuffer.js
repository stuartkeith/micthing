function incrementValue(value, max) {
  return value === max ? 0 : (value + 1);
}

class CircularBuffer {
  constructor(length) {
    if (length < 1) {
      throw new Error('CircularBuffer length must be >= 1');
    }

    this.buffer = new Array(length + 1)
      .fill(false)
      .map(_ => ({ value: null, time: null }));

    this.length = length;
    this.indexHead = 0;
    this.indexTail = 0;
  }

  clear() {
    this.indexHead = 0;
    this.indexTail = 0;
  }

  isEmpty() {
    return this.indexHead === this.indexTail;
  }

  remove() {
    if (this.isEmpty()) {
      return;
    }

    this.indexTail = incrementValue(this.indexTail, this.length);
  }

  read() {
    if (this.isEmpty()) {
      return null;
    }

    return this.buffer[this.indexTail];
  }

  write(value, time) {
    const data = this.buffer[this.indexHead];

    data.value = value;
    data.time = time;

    this.indexHead = incrementValue(this.indexHead, this.length);

    if (this.isEmpty()) {
      this.indexTail = incrementValue(this.indexTail, this.length);
    }
  }
}

export default CircularBuffer;
