import CircularBuffer from '../utils/CircularBuffer';
import audioContext from './audioContext';

class VisualScheduler {
  constructor() {
    this.circularBuffer = new CircularBuffer(30);

    this.update = this.update.bind(this);
  }

  update() {
    const time = audioContext.currentTime + 0.08;

    let validData = null;

    while (true) {
      const data = this.circularBuffer.read();

      if (!data) {
        break;
      }

      if (data.time > time) {
        break;
      }

      validData = data;

      this.circularBuffer.remove();
    }

    if (validData) {
      this.callback(validData.value);
    }

    if (!this.circularBuffer.isEmpty()) {
      this.animationFrameId = requestAnimationFrame(this.update);
    }
  }

  push(value, time) {
    cancelAnimationFrame(this.animationFrameId);

    this.animationFrameId = requestAnimationFrame(this.update);

    this.circularBuffer.write(value, time);
  }
}

export default VisualScheduler;
