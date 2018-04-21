import { combineReducers } from 'redux';
import { WEBAUDIO_STATE_CHANGE } from '../actions';

function isSuspended(state = false, action) {
  switch (action.type) {
    case WEBAUDIO_STATE_CHANGE:
      return action.isSuspended;
    default:
      return state;
  }
}

export default combineReducers({
  isSuspended
});
