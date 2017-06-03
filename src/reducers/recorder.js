import { combineReducers } from 'redux';
import { CAPTURING_START, CAPTURING_STOP, RECORDING_START, RECORDING_STOP, RECORDING_THRESHOLD_SET } from '../actions';

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

function threshold(state = 0.1, action) {
  switch (action.type) {
    case RECORDING_THRESHOLD_SET:
      return action.value;
    default:
      return state;
  }
}

function thresholdTimeoutSeconds(state = 0.5, action) {
  switch (action.type) {
    default:
      return state;
  }
}

export default combineReducers({
  isCapturing,
  isRecording,
  threshold,
  thresholdTimeoutSeconds
});
