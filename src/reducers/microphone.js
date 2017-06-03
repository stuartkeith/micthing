import { combineReducers } from 'redux';
import { MICROPHONE_DISABLE, MICROPHONE_ENABLE, MICROPHONE_REQUEST } from '../actions';
import { MICROPHONE_STATE } from '../constants';

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

export default combineReducers({
  state: microphoneState
});
