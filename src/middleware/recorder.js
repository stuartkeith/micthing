import '../webaudio/polyfills';
import { audioContext } from '../webaudio';
import { RECORDING_LISTENER_ADD, RECORDING_LISTENER_REMOVE } from '../actions';
import { capturingStart, capturingStop, layerAdd, playbackStart } from '../actions';
import MessageBus from '../utils/MessageBus';

const BUFFER_SIZE = 2048;
const FADE_SAMPLES = 400;
const MAX_RECORD_SECONDS = 4;

function createBuffer(dataL, dataR, length) {
  // note that this mutates the dataL and dataR arrays.
  const buffer = audioContext.createBuffer(2, length, audioContext.sampleRate);

  for (let i = 0; i < FADE_SAMPLES; i++) {
    const volume = i / FADE_SAMPLES;

    dataL[i] *= volume;
    dataR[i] *= volume;

    dataL[length - i - 1] *= volume;
    dataR[length - i - 1] *= volume;
  }

  buffer.copyToChannel(dataL, 0);
  buffer.copyToChannel(dataR, 1);

  return buffer;
}

class Recorder {
  constructor(recordBufferLength) {
    this.recordBufferL = new Float32Array(recordBufferLength);
    this.recordBufferR = new Float32Array(recordBufferLength);

    this.maxSample = 0;

    this.reset();
    this.setInputBuffer([], []);
  }

  reset() {
    this.isRecording = false;
    this.consecutiveSamplesUnderThreshold = 0;
    this.recordBufferIndex = 0;
  }

  setInputBuffer(inputBufferL, inputBufferR) {
    this.inputBufferL = inputBufferL;
    this.inputBufferR = inputBufferR;

    this.inputBufferIndex = 0;
  }

  update(isEnabled, recordingThreshold, recordingThresholdTimeoutSamples) {
    while (this.inputBufferIndex < this.inputBufferL.length) {
      if (this.recordBufferIndex === this.recordBufferL.length) {
        return true;
      }

      if (this.isRecording && (this.consecutiveSamplesUnderThreshold >= recordingThresholdTimeoutSamples)) {
        return true;
      }

      const sampleL = this.inputBufferL[this.inputBufferIndex];
      const sampleR = this.inputBufferR[this.inputBufferIndex];

      const absSampleL = Math.abs(sampleL);
      const absSampleR = Math.abs(sampleR);

      this.maxSample = Math.max(this.maxSample, absSampleL, absSampleR);

      if (isEnabled && ((absSampleL >= recordingThreshold) || (absSampleR >= recordingThreshold))) {
        this.consecutiveSamplesUnderThreshold = 0;
        this.isRecording = true;
      } else {
        this.consecutiveSamplesUnderThreshold++;
      }

      this.inputBufferIndex++;

      if (this.isRecording) {
        this.recordBufferL[this.recordBufferIndex] = sampleL;
        this.recordBufferR[this.recordBufferIndex] = sampleR;

        this.recordBufferIndex++;
      }
    }

    return false;
  }
}

export default function recorder(store) {
  const audioRecorder = audioContext.createScriptProcessor(BUFFER_SIZE, 2, 2);
  const inputBufferL = new Float32Array(BUFFER_SIZE);
  const inputBufferR = new Float32Array(BUFFER_SIZE);
  const maxSampleMessageBus = new MessageBus();
  const recordBufferLength = Math.floor(MAX_RECORD_SECONDS * audioContext.sampleRate);
  const recorder = new Recorder(recordBufferLength);

  let audioInput = null;
  let currentMaxSample = 0;
  let previousTime = null;

  const onAnimationFrame = function (time) {
    requestAnimationFrame(onAnimationFrame);

    previousTime = previousTime || time;

    const elapsedTime = (time - previousTime) / 1000;
    const maxSample = Math.min(1, recorder.maxSample);

    if (maxSample >= currentMaxSample) {
      currentMaxSample = maxSample;
    } else {
      currentMaxSample *= Math.pow(0.1, elapsedTime);
    }

    previousTime = time;
    recorder.maxSample = 0;

    maxSampleMessageBus.update(currentMaxSample);
  };

  audioRecorder.onaudioprocess = function (event) {
    let state = store.getState();

    event.inputBuffer.copyFromChannel(inputBufferL, 0);
    event.inputBuffer.copyFromChannel(inputBufferR, 1);

    recorder.setInputBuffer(inputBufferL, inputBufferR);

    const recordingThresholdTimeoutSamples = state.recorder.thresholdTimeoutSeconds * audioContext.sampleRate;

    while (recorder.update(state.recorder.isRecording, state.recorder.threshold, recordingThresholdTimeoutSamples)) {
      const buffer = createBuffer(recorder.recordBufferL, recorder.recordBufferR, recorder.recordBufferIndex);

      recorder.reset();

      if (state.layers.list.length < 5) {
        store.dispatch(layerAdd(state.layers.nextId, buffer));

        if (state.layers.list.length === 0) {
          store.dispatch(playbackStart());
        }
      }

      state = store.getState();
    }

    if (!state.recorder.isCapturing && recorder.isRecording) {
      store.dispatch(capturingStart());
    } else if (state.recorder.isCapturing && !recorder.isRecording) {
      store.dispatch(capturingStop());
    }
  };

  audioRecorder.connect(audioContext.destination);

  return function (next) {
    return function (action) {
      if (action.mediaStream) {
        audioInput = audioContext.createMediaStreamSource(action.mediaStream);

        audioInput.connect(audioRecorder);

        requestAnimationFrame(onAnimationFrame);
      }

      switch (action.type) {
        case RECORDING_LISTENER_ADD:
          maxSampleMessageBus.addListener(action.callback);
          break;
        case RECORDING_LISTENER_REMOVE:
          maxSampleMessageBus.removeListener(action.callback);
          break;
        default:
      }

      return next(action);
    };
  };
}
