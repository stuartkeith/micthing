import { LAYER_ADD, LAYER_REMOVE } from '../actions';
import { capturingStart, capturingStop, layerAdd, microphoneDisable, microphoneEnable, microphoneRequest } from '../actions';
import { audioContext, playBuffer, Scheduler } from '../webaudio';

const BUFFER_SIZE = 2048;
const FADE_SAMPLES = 400;
const MAX_RECORD_SECONDS = 4;

function copyBuffer(buffer, length) {
  const newBuffer = audioContext.createBuffer(buffer.numberOfChannels, length, buffer.sampleRate);

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    const oldData = buffer.getChannelData(i);
    const newData = newBuffer.getChannelData(i);

    for (let j = 0; j < length; j++) {
      newData[j] = oldData[j];
    }

    for (let j = 0; j < FADE_SAMPLES; j++) {
      const volume = j / FADE_SAMPLES;

      newData[j] *= volume;
      newData[length - j - 1] *= volume;
    }
  }

  return newBuffer;
}

function playback(store) {
  const buffersByLayerId = {};
  const scheduler = new Scheduler();

  let index = 0;

  scheduler.callback = function (beatTime, beatLength) {
    const state = store.getState();

    state.layers.forEach(function (layer) {
      if (layer.isMuted) {
        return;
      }

      const note = layer.notes[index % layer.notes.length];

      if (!note) {
        return;
      }

      const buffer = buffersByLayerId[layer.id];

      playBuffer(audioContext.destination, buffer, {
        delay: beatTime
      });
    });

    index++;
  };

  scheduler.start();

  return function (next) {
    return function (action) {
      switch (action.type) {
        case LAYER_ADD:
          buffersByLayerId[action.layerId] = action.buffer;
          break;
        case LAYER_REMOVE:
          delete buffersByLayerId[action.layerId];
          break;
        default:
      }

      return next(action);
    };
  };
}

function recorder(store) {
  let hasInitialised = false;

  return function (next) {
    return function (action) {
      if (hasInitialised || !action.mediaStream) {
        return next(action);
      }

      hasInitialised = true;

      const audioInput = audioContext.createMediaStreamSource(action.mediaStream);
      const audioRecorder = audioContext.createScriptProcessor(BUFFER_SIZE, 2, 2);
      const recordBufferLength = Math.floor(MAX_RECORD_SECONDS * audioContext.sampleRate);
      const recordBuffer = audioContext.createBuffer(2, recordBufferLength, audioContext.sampleRate);

      const recordDataL = recordBuffer.getChannelData(0);
      const recordDataR = recordBuffer.getChannelData(1);

      let isRecording = false;
      let bufferIndex = 0;
      let samplesUnderThreshold = 0;

      audioRecorder.onaudioprocess = function (event) {
        const state = store.getState();

        if (!state.isRecording) {
          if (isRecording) {
            isRecording = false;

            store.dispatch(capturingStop());
          }

          return;
        }

        const inputDataL = event.inputBuffer.getChannelData(0);
        const inputDataR = event.inputBuffer.getChannelData(1);

        for (let i = 0; i < inputDataL.length; i++) {
          const sampleMeetsThreshold = (inputDataL[i] >= state.recordingThreshold) || (inputDataR[i] >= state.recordingThreshold);
          const hasExpired = samplesUnderThreshold >= state.recordingThresholdSamples;
          const noRemainingSpace = bufferIndex >= recordBufferLength;

          if (!isRecording && sampleMeetsThreshold) {
            isRecording = true;
            bufferIndex = 0;
            samplesUnderThreshold = 0;

            store.dispatch(capturingStart());
          } else if (isRecording && (hasExpired || noRemainingSpace)) {
            isRecording = false;

            const buffer = copyBuffer(recordBuffer, Math.min(bufferIndex, recordBufferLength - 1));

            store.dispatch(capturingStop());

            if (state.layers.length < 5) {
              store.dispatch(layerAdd(state.nextLayerId, buffer));
            }
          }

          if (isRecording) {
            recordDataL[bufferIndex] = inputDataL[i];
            recordDataR[bufferIndex] = inputDataR[i];

            bufferIndex++;

            if (sampleMeetsThreshold) {
              samplesUnderThreshold = 0;
            } else {
              samplesUnderThreshold++;
            }
          }
        }
      };

      audioInput.connect(audioRecorder);
      audioRecorder.connect(audioContext.destination);

      return next(action);
    };
  };
}

function userMedia(store) {
  // if user has already granted permission,
  // there will still be a delay before getUserMedia resolves.
  // so wait before setting the "request permission" state
  const timeoutId = setTimeout(function () {
    store.dispatch(microphoneRequest());
  }, 500);

  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(function (mediaStream) {
      clearTimeout(timeoutId);

      store.dispatch(microphoneEnable(mediaStream));
    }, function () {
      clearTimeout(timeoutId);

      store.dispatch(microphoneDisable());
    });

  return function (next) {
    return function (action) {
      return next(action);
    }
  }
}

const middleware = [
  playback,
  recorder,
  userMedia
];

export default middleware;
