import { combineReducers } from 'redux';
import { LAYER_ADD, LAYER_REMOVE, LAYER_INCREMENT_NOTE, LAYER_SET_MUTED, LAYER_SET_NOTE } from '../actions';
import { NOTE_VALUES } from '../constants';

function layer(state, action) {
  switch (action.type) {
    case LAYER_ADD:
      return {
        id: action.layerId,
        notes: action.notes,
        isMuted: false
      };
    case LAYER_INCREMENT_NOTE:
      return Object.assign({}, state, {
        notes: state.notes.map(function (note, index) {
          if (index !== action.index) {
            return note;
          }

          for (let i = 0; i < NOTE_VALUES.length; i++) {
            if (NOTE_VALUES[i] > action.value) {
              return NOTE_VALUES[i];
            }
          }

          return 0;
        })
      });
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

function list(state = [], action) {
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

function nextId(state = 1, action) {
  switch (action.type) {
    case LAYER_ADD:
      return action.layerId + 1;
    default:
      return state;
  }
}

export default combineReducers({
  list,
  nextId
});
