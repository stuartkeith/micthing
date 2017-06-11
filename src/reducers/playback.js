import { combineReducers } from 'redux';
import { PLAYBACK_START, PLAYBACK_STOP, SWING_SET } from '../actions';

function isPlaying(state = false, action) {
  switch (action.type) {
    case PLAYBACK_START:
      return true;
    case PLAYBACK_STOP:
      return false;
    default:
      return state;
  }
}

function swing(state = 0, action) {
  switch (action.type) {
    case SWING_SET:
      return action.value;
    default:
      return state;
  }
}

export default combineReducers({
  isPlaying,
  swing
});
