import { NOTE_VALUES } from '../constants';

export const BPM_SET = 'BPM_SET';
export const CAPTURING_START = 'CAPTURING_START';
export const CAPTURING_STOP = 'CAPTURING_STOP';
export const LAYER_ADD = 'LAYER_ADD';
export const LAYER_CLEAR = 'LAYER_CLEAR';
export const LAYER_REMOVE = 'LAYER_REMOVE';
export const LAYER_INCREMENT_NOTE = 'LAYER_INCREMENT_NOTE';
export const LAYER_LOAD_NOTES = 'LAYER_LOAD_NOTES';
export const LAYER_SAVE_NOTES = 'LAYER_SAVE_NOTES';
export const LAYER_SET_MUTED = 'LAYER_SET_MUTED';
export const LAYER_SET_NOTE = 'LAYER_SET_NOTE';
export const LAYER_SET_VOLUME = 'LAYER_SET_VOLUME';
export const MICROPHONE_DISABLE = 'MICROPHONE_DISABLE';
export const MICROPHONE_ENABLE = 'MICROPHONE_ENABLE';
export const MICROPHONE_REQUEST = 'MICROPHONE_REQUEST';
export const NOT_SUPPORTED = 'NOT_SUPPORTED';
export const PLAYBACK_LISTENER_ADD = 'PLAYBACK_LISTENER_ADD';
export const PLAYBACK_LISTENER_REMOVE = 'PLAYBACK_LISTENER_REMOVE';
export const PLAYBACK_START = 'PLAYBACK_START';
export const PLAYBACK_STOP = 'PLAYBACK_STOP';
export const RECORDING_LISTENER_ADD = 'RECORDING_LISTENER_ADD';
export const RECORDING_LISTENER_REMOVE = 'RECORDING_LISTENER_REMOVE';
export const RECORDING_START = 'RECORDING_START';
export const RECORDING_STOP = 'RECORDING_STOP';
export const RECORDING_THRESHOLD_SET = 'RECORDING_THRESHOLD_SET';
export const SWING_SET = 'SWING_SET';
export const VOLUME_SET = 'VOLUME_SET';

export function bpmSet(value) {
  return {
    type: BPM_SET,
    value
  };
}

export function capturingStart() {
  return {
    type: CAPTURING_START
  };
}

export function capturingStop() {
  return {
    type: CAPTURING_STOP
  };
}

export function layerAdd(layerId, buffer) {
  const notes = new Array(16).fill(0).map(function () {
    if (Math.random() <= 0.7) {
      return 0;
    }

    const randomIndex = 1 + Math.floor((NOTE_VALUES.length - 1) * Math.random());

    return NOTE_VALUES[randomIndex];
  });

  return {
    type: LAYER_ADD,
    layerId,
    buffer,
    notes
  };
}

export function layerClear(layerId) {
  return {
    type: LAYER_CLEAR,
    layerId
  };
}

export function layerRemove(layerId) {
  return {
    type: LAYER_REMOVE,
    layerId
  };
}

export function layerLoadNotes(layerId, notes) {
  return {
    type: LAYER_LOAD_NOTES,
    layerId,
    notes
  };
}

export function layerSaveNotes(layerId, notes) {
  return {
    type: LAYER_SAVE_NOTES,
    layerId,
    notes
  };
}

export function layerSetMuted(layerId, value) {
  return {
    type: LAYER_SET_MUTED,
    layerId,
    value
  };
}

export function layerIncrementNote(layerId, index, value) {
  return {
    type: LAYER_INCREMENT_NOTE,
    layerId,
    index,
    value
  };
}

export function layerSetNote(layerId, index, value) {
  return {
    type: LAYER_SET_NOTE,
    layerId,
    index,
    value
  }
}

export function layerSetVolume(layerId, value) {
  return {
    type: LAYER_SET_VOLUME,
    layerId,
    value
  };
}

export function microphoneDisable() {
  return {
    type: MICROPHONE_DISABLE
  };
}

export function microphoneEnable(mediaStream) {
  return {
    type: MICROPHONE_ENABLE,
    mediaStream
  };
}

export function microphoneRequest() {
  return {
    type: MICROPHONE_REQUEST
  };
}

export function notSupported(requirements) {
  return {
    type: NOT_SUPPORTED,
    requirements
  };
}

export function playbackListenerAdd(callback) {
  return {
    type: PLAYBACK_LISTENER_ADD,
    callback
  };
}

export function playbackListenerRemove(callback) {
  return {
    type: PLAYBACK_LISTENER_REMOVE,
    callback
  };
}

export function playbackStart() {
  return {
    type: PLAYBACK_START
  };
}

export function playbackStop() {
  return {
    type: PLAYBACK_STOP
  };
}

export function recordingListenerAdd(callback) {
  return {
    type: RECORDING_LISTENER_ADD,
    callback
  };
}

export function recordingListenerRemove(callback) {
  return {
    type: RECORDING_LISTENER_REMOVE,
    callback
  };
}

export function recordingStart() {
  return {
    type: RECORDING_START
  };
}

export function recordingStop() {
  return {
    type: RECORDING_STOP
  };
}

export function recordingThresholdSet(value) {
  return {
    type: RECORDING_THRESHOLD_SET,
    value
  };
}

export function swingSet(value) {
  return {
    type: SWING_SET,
    value
  };
}

export function volumeSet(value) {
  return {
    type: VOLUME_SET,
    value
  };
}
