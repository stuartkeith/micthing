import { combineReducers } from 'redux';
import { BPM_SET, PLAYBACK_START, PLAYBACK_STOP, SWING_SET, VOLUME_SET } from '../actions';

function bpm(state = 120, action) {
  switch (action.type) {
    case BPM_SET:
      return action.value;
    default:
      return state;
  }
}

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

function volume(state = 1, action) {
  switch (action.type) {
    case VOLUME_SET:
      return action.value;
    default:
      return state;
  }
}

export default combineReducers({
  bpm,
  isPlaying,
  swing,
  volume
});
