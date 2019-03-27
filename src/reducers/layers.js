import { combineReducers } from 'redux';
import { LAYER_ADD, LAYER_CLEAR, LAYER_REMOVE, LAYER_REMOVE_ALL, LAYER_LOAD_NOTES, LAYER_QUEUE_NOTES, LAYER_SAVE_NOTES, LAYER_SET_MUTED, LAYER_SET_NOTE, LAYER_SET_VOLUME } from '../actions';
import { NOTE_VALUE_OFF, NOTE_VALUE_ON, NOTE_VALUE_ACCENT } from '../constants';
import { getRandomNumber, shuffleArray } from '../utils/random';

// generate a random kick drum pattern. leave space for the snare.
function generateRandomKickDrumNotes() {
  const notes = new Array(16).fill(NOTE_VALUE_OFF);

  // iterate through the notes in halves.
  for (let i = 0; i < notes.length; i += 8) {
    let j = 0;
    let lastIndexDelta = 1;

    while (j < 8) {
      notes[i + j] = j % 2 === 0 ? NOTE_VALUE_ACCENT : NOTE_VALUE_ON;

      // ensure we're never adding a note to the 2 and 4 - the snare will go
      // here next time.
      const relativeSnareIndex = 4 - j;
      const snareRangeModifier = relativeSnareIndex > 0 ? -1 : 0;

      let indexDelta = Math.floor(getRandomNumber(1, 6 + snareRangeModifier));

      if (indexDelta === lastIndexDelta) {
        indexDelta++;
      }

      if (indexDelta === relativeSnareIndex) {
        indexDelta++;
      }

      j += indexDelta;

      lastIndexDelta = indexDelta;
    }
  }

  return notes;
}

// generate a random snare pattern. hardcoded to play beats on the 2 and 4, but
// otherwise avoids doubling up on the previous layer (assumed to be the kick).
function generateRandomSnareNotes(layers) {
  const notes = new Array(16).fill(NOTE_VALUE_OFF);
  const previousLayerNotes = layers[layers.length - 1].notes;

  notes[4] = NOTE_VALUE_ACCENT;
  notes[12] = NOTE_VALUE_ACCENT;

  // some possible offsets - filter out any that will clash with the kick.
  const choices = [4 + 2, 4 + 3, 4 + 5, 4 + 7, 12 + 2, 12 + 4]
    .filter(index => previousLayerNotes[index] === NOTE_VALUE_OFF);

  shuffleArray(choices);

  choices.length = Math.floor(getRandomNumber(0, Math.min(choices.length, 2)));

  choices.forEach(index => notes[index] = Math.random() > 0.75 ? NOTE_VALUE_ACCENT : NOTE_VALUE_ON);

  return notes;
}

// generate a random pattern. uses weighted random numbers to ensure a much lower
// chance of clashes with previous layers' patterns, without excluding them
// entirely (who knows, they might sound good).
function randomNotes(layers) {
  const notes = new Array(16).fill(NOTE_VALUE_OFF);

  // each index starts with the same weight. any non-empty notes drastically
  // reduce the chance of that index being randomly chosen.
  const emptyWeight = 100;
  const noteChoices = notes.map((_, index) => ({ index, weight: emptyWeight }));

  // calculate the weights.
  layers.forEach(function (layer) {
    layer.notes.forEach(function (noteValue, noteValueIndex) {
      const noteChoice = noteChoices[noteValueIndex];

      let weightModifier;

      switch (noteValue) {
        case NOTE_VALUE_OFF:
          weightModifier = 1;
          break;
        case NOTE_VALUE_ON:
          weightModifier = 0.1;
          break;
        case NOTE_VALUE_ACCENT:
          weightModifier = 0.1;
          break;
        default:
          throw new Error('unhandled note value - ' + noteValue);
      }

      noteChoice.weight *= weightModifier;
    });
  });

  const notesToInsert = Math.floor(getRandomNumber(3, 7));

  // calculate the initial total weight of all of the notes. this will be
  // adjusted later when choices are removed.
  let totalWeight = 0;

  noteChoices.forEach(noteChoice => totalWeight += noteChoice.weight);

  // now it's time to add some notes.
  for (let i = 0; i < notesToInsert; i++) {
    let randomNumber = getRandomNumber(0, totalWeight);

    for (let j = 0; j < noteChoices.length; j++) {
      const noteChoice = noteChoices[j];

      // have we found a noteChoice to use?
      if (randomNumber < noteChoice.weight) {
        // if so, remove its weight from the total,
        totalWeight -= noteChoice.weight;

        // and remove it from the possible choices so there are no duplicates.
        noteChoices.splice(j, 1);

        // if the note is occupying an otherwise empty column, give it a chance
        // of being accented.
        if (noteChoice.weight === emptyWeight) {
          notes[noteChoice.index] = Math.random() > 0.7 ? NOTE_VALUE_ACCENT : NOTE_VALUE_ON;
        } else {
          notes[noteChoice.index] = NOTE_VALUE_ON;
        }

        break;
      }

      randomNumber -= noteChoice.weight;
    }
  }

  return notes;
}

function getNotes(existingLayers) {
  switch (existingLayers.length) {
    case 0:
      return generateRandomKickDrumNotes();
    case 1:
      return generateRandomSnareNotes(existingLayers);
    default:
      return randomNotes(existingLayers);
  }
}

function createLayer(id, existingLayers) {
  return {
    id,
    notes: getNotes(existingLayers),
    savedNotes: [],
    queuedNotes: null,
    isMuted: false,
    volume: 1
  };
}

function layer(state, action) {
  switch (action.type) {
    case LAYER_CLEAR:
      return {
        ...state,
        notes: state.notes.map(_ => NOTE_VALUE_OFF)
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
        createLayer(action.layerId, state),
        ...state
      ];
    case LAYER_REMOVE:
      return state.filter(layerObj => layerObj.id !== action.layerId);
    case LAYER_REMOVE_ALL:
      return [];
    case LAYER_CLEAR:
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
