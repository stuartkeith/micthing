export const CAPTURING_START = 'CAPTURING_START';
export const CAPTURING_STOP = 'CAPTURING_STOP';
export const LAYER_ADD = 'LAYER_ADD';
export const LAYER_REMOVE = 'LAYER_REMOVE';
export const LAYER_SET_MUTED = 'LAYER_SET_MUTED';
export const LAYER_SET_NOTE = 'LAYER_SET_NOTE';
export const MICROPHONE_DISABLE = 'MICROPHONE_DISABLE';
export const MICROPHONE_ENABLE = 'MICROPHONE_ENABLE';
export const MICROPHONE_REQUEST = 'MICROPHONE_REQUEST';
export const PLAYBACK_LISTENER_ADD = 'PLAYBACK_LISTENER_ADD';
export const PLAYBACK_LISTENER_REMOVE = 'PLAYBACK_LISTENER_REMOVE';
export const PLAYBACK_START = 'PLAYBACK_START';
export const PLAYBACK_STOP = 'PLAYBACK_STOP';
export const RECORDING_START = 'RECORDING_START';
export const RECORDING_STOP = 'RECORDING_STOP';

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
  const notes = new Array(16).fill(0).map(_ => Math.random() > 0.7);

  return {
    type: LAYER_ADD,
    layerId,
    buffer,
    notes
  };
}

export function layerRemove(layerId) {
  return {
    type: LAYER_REMOVE,
    layerId
  };
}

export function layerSetMuted(layerId, value) {
  return {
    type: LAYER_SET_MUTED,
    layerId,
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
