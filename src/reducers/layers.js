import { combineReducers } from 'redux';
import { LAYER_ADD, LAYER_CLEAR, LAYER_REMOVE, LAYER_INCREMENT_NOTE, LAYER_LOAD_NOTES, LAYER_QUEUE_NOTES, LAYER_SAVE_NOTES, LAYER_SET_MUTED, LAYER_SET_NOTE, LAYER_SET_VOLUME } from '../actions';
import { NOTE_VALUES } from '../constants';

function layer(state, action) {
  switch (action.type) {
    case LAYER_ADD:
      return {
        id: action.layerId,
        notes: action.notes,
        savedNotes: [],
        queuedNotes: null,
        isMuted: false,
        volume: 1
      };
    case LAYER_CLEAR:
      return {
        ...state,
        notes: state.notes.map(_ => 0)
      };
    case LAYER_INCREMENT_NOTE:
      return {
        ...state,
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
      };
    case LAYER_LOAD_NOTES:
      return {
        ...state,
        notes: action.notes,
        queuedNotes: null
      };
    case LAYER_QUEUE_NOTES:
      return {
        ...state,
        queuedNotes: action.notes
      };
    case LAYER_SET_MUTED:
      return {
        ...state,
        isMuted: action.value
      };
    case LAYER_SET_NOTE:
      return {
        ...state,
        notes: state.notes.map(function (note, index) {
          if (index !== action.index) {
            return note;
          }

          return action.value;
        })
      };
    case LAYER_SET_VOLUME:
      return {
        ...state,
        volume: action.value
      };
    case LAYER_SAVE_NOTES:
      return {
        ...state,
        savedNotes: [
          ...state.savedNotes,
          action.notes
        ]
      };
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
    case LAYER_CLEAR:
    case LAYER_INCREMENT_NOTE:
    case LAYER_LOAD_NOTES:
    case LAYER_QUEUE_NOTES:
    case LAYER_SAVE_NOTES:
    case LAYER_SET_MUTED:
    case LAYER_SET_NOTE:
    case LAYER_SET_VOLUME:
      return state.map(function (layerObj) {
        if (layerObj.id === action.layerId) {
          return layer(layerObj, action);
        }

        return layerObj;
      });
    default:
      return state;
  }
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
