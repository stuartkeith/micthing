import { audioContext } from '../webaudio';
import { RECORDING_LISTENER_ADD, RECORDING_LISTENER_REMOVE } from '../actions';
import { capturingStart, capturingStop, layerAdd, playbackStart } from '../actions';
import MessageBus from '../utils/MessageBus';

const BUFFER_SIZE = 2048;
const FADE_SAMPLES = 400;
const MAX_RECORD_SECONDS = 4;

function createBuffer(dataL, dataR, length) {
  const buffer = audioContext.createBuffer(2, length, audioContext.sampleRate);

  const bufferL = buffer.getChannelData(0);
  const bufferR = buffer.getChannelData(1);

  for (let i = 0; i < length; i++) {
    bufferL[i] = dataL[i];
    bufferR[i] = dataR[i];
  }

  for (let i = 0; i < FADE_SAMPLES; i++) {
    const volume = i / FADE_SAMPLES;

    bufferL[i] *= volume;
    bufferR[i] *= volume;

    bufferL[length - i - 1] *= volume;
    bufferR[length - i - 1] *= volume;
  }

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

  update(isEnabled, recordingThreshold, recordingThresholdSamples) {
    while (this.inputBufferIndex < this.inputBufferL.length) {
      if (this.recordBufferIndex === this.recordBufferL.length) {
        return true;
      }

      if (this.isRecording && (this.consecutiveSamplesUnderThreshold >= recordingThresholdSamples)) {
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
  const maxSampleMessageBus = new MessageBus();
  const recordBufferLength = Math.floor(MAX_RECORD_SECONDS * audioContext.sampleRate);
  const recorder = new Recorder(recordBufferLength);

  let audioInput = null;

  const onAnimationFrame = function (time) {
    requestAnimationFrame(onAnimationFrame);

    const maxSample = Math.min(1, recorder.maxSample);

    recorder.maxSample = 0;

    maxSampleMessageBus.update(maxSample);
  };

  audioRecorder.onaudioprocess = function (event) {
    let state = store.getState();

    const inputBufferL = event.inputBuffer.getChannelData(0);
    const inputBufferR = event.inputBuffer.getChannelData(1);

    recorder.setInputBuffer(inputBufferL, inputBufferR);

    while (recorder.update(state.isRecording, state.recordingThreshold, state.recordingThresholdSamples)) {
      const buffer = createBuffer(recorder.recordBufferL, recorder.recordBufferR, recorder.recordBufferIndex);

      recorder.reset();

      if (state.layers.length < 5) {
        store.dispatch(layerAdd(state.nextLayerId, buffer));

        if (state.layers.length === 0) {
          store.dispatch(playbackStart());
        }
      }

      state = store.getState();
    }

    if (!state.isCapturing && recorder.isRecording) {
      store.dispatch(capturingStart());
    } else if (state.isCapturing && !recorder.isRecording) {
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
