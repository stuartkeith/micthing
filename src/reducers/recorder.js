import { combineReducers } from 'redux';
import { CAPTURING_START, CAPTURING_STOP, RECORDING_START, RECORDING_STOP, RECORDING_THRESHOLD_SET } from '../actions';
import { RECORDING_STATE } from '../constants';

function recordingState(state = RECORDING_STATE.OFF, action) {
  switch (action.type) {
    case CAPTURING_START:
      return state === RECORDING_STATE.RECORDING ? RECORDING_STATE.CAPTURING : state;
    case CAPTURING_STOP:
      return state === RECORDING_STATE.CAPTURING ? RECORDING_STATE.RECORDING : state;
    case RECORDING_START:
      return RECORDING_STATE.RECORDING;
    case RECORDING_STOP:
      return RECORDING_STATE.OFF;
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
  recordingState,
  threshold,
  thresholdTimeoutSeconds
});
