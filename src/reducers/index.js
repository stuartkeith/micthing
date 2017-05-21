import { combineReducers } from 'redux';
import { CAPTURING_START, CAPTURING_STOP, LAYER_ADD, LAYER_REMOVE, LAYER_SET_MUTED, LAYER_SET_NOTE, MICROPHONE_DISABLE, MICROPHONE_ENABLE, MICROPHONE_REQUEST, RECORDING_START, RECORDING_STOP } from '../actions';
import { MICROPHONE_STATE } from '../constants';

function isCapturing(state = false, action) {
  switch (action.type) {
    case CAPTURING_STOP:
      return false;
    case CAPTURING_START:
      return true;
    default:
      return state;
  }
}

function isRecording(state = false, action) {
  switch (action.type) {
    case RECORDING_START:
      return true;
    case RECORDING_STOP:
      return false;
    default:
      return state;
  }
}

function layer(state, action) {
  switch (action.type) {
    case LAYER_ADD:
      return {
        id: action.layerId,
        notes: action.notes,
        isMuted: false
      };
    case LAYER_SET_MUTED:
      return Object.assign({}, state, {
        isMuted: action.value
      });
    case LAYER_SET_NOTE:
      return Object.assign({}, state, {
        notes: state.notes.map(function (note, index) {
          if (index !== action.index) {
            return note;
          }

          return action.value;
        })
      });
    default:
      return state;
  }
}

function layers(state = [], action) {
  switch (action.type) {
    case LAYER_ADD:
      return [
        layer(undefined, action),
        ...state
      ];
    case LAYER_REMOVE:
      return state.filter(layerObj => layerObj.id !== action.layerId);
    default:
  }

  if (action.layerId) {
    return state.map(function (layerObj) {
      if (layerObj.id === action.layerId) {
        return layer(layerObj, action);
      }

      return layerObj;
    });
  }

  return state;
}

function microphoneState(state = MICROPHONE_STATE.INIT, action) {
  switch (action.type) {
    case MICROPHONE_DISABLE:
      return MICROPHONE_STATE.DISABLED;
    case MICROPHONE_ENABLE:
      return MICROPHONE_STATE.ENABLED;
    case MICROPHONE_REQUEST:
      return MICROPHONE_STATE.REQUESTED_PERMISSION;
    default:
      return state;
  }
}

function nextLayerId(state = 1, action) {
  switch (action.type) {
    case LAYER_ADD:
      return action.layerId + 1;
    default:
      return state;
  }
}

function recordingThreshold(state = 0.1, action) {
  switch (action.type) {
    default:
      return state;
  }
}

function recordingThresholdSamples(state = 20000, action) {
  switch (action.type) {
    default:
      return state;
  }
}

export default combineReducers({
  isCapturing,
  isRecording,
  layers,
  microphoneState,
  nextLayerId,
  recordingThreshold,
  recordingThresholdSamples
});
