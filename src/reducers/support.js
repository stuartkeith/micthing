import { combineReducers } from 'redux';
import { NOT_SUPPORTED } from '../actions';

function isSupported(state = true, action) {
  switch (action.type) {
    case NOT_SUPPORTED:
      return false;
    default:
      return state;
  }
}

function requirements(state = [], action) {
  switch (action.type) {
    case NOT_SUPPORTED:
      return action.requirements;
    default:
      return state;
  }
}

export default combineReducers({
  isSupported,
  requirements
});
