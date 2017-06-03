import { combineReducers } from 'redux';
import { PLAYBACK_START, PLAYBACK_STOP } from '../actions';

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

export default combineReducers({
  isPlaying
});
