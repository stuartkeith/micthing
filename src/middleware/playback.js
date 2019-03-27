import { LAYER_ADD, LAYER_REMOVE, PLAYBACK_LISTENER_ADD, PLAYBACK_LISTENER_REMOVE, PLAYBACK_START, PLAYBACK_STOP, VOLUME_SET } from '../actions';
import { layerLoadNotes } from '../actions';
import { NOTE_VALUE_OFF, NOTE_VALUE_ON, NOTE_VALUE_ACCENT } from '../constants';
import MessageBus from '../utils/MessageBus';
import { audioContext, playBuffer, Scheduler, VisualScheduler } from '../webaudio';

function getNoteValueVolume(noteValue) {
  switch (noteValue) {
    case NOTE_VALUE_OFF:
      return 0;
    case NOTE_VALUE_ON:
      return 0.7;
    case NOTE_VALUE_ACCENT:
      return 1;
    default:
      throw new Error('unhandled noteValue - ' + noteValue);
  }
}

export default function playback(store) {
  const masterGain = audioContext.createGain();
  const buffersByLayerId = new Map();
  const indexMessageBus = new MessageBus(0);
  const scheduler = new Scheduler();
  const visualScheduler = new VisualScheduler();

  masterGain.connect(audioContext.destination);

  let index = 0;

  scheduler.callback = function (beatTime, beatLength) {
    // if first beat, load any queued notes first
    if (index % 16 === 0) {
      const layers = store.getState().layers;

      layers.list.forEach(function (layer) {
        if (layer.queuedNotes !== null) {
          store.dispatch(layerLoadNotes(layer.id, layer.queuedNotes));
        }
      });
    }

    visualScheduler.push(index, beatTime);

    const state = store.getState();
    const swing = index % 2 ? state.playback.swing : 0;

    scheduler.bpm = state.playback.bpm;

    state.layers.list.forEach(function (layer) {
      if (layer.isMuted || layer.volume === 0) {
        return;
      }

      const noteValue = layer.notes[index % layer.notes.length];
      const volume = getNoteValueVolume(noteValue);

      if (volume <= 0) {
        return;
      }

      const buffer = buffersByLayerId.get(layer.id);

      playBuffer(masterGain, buffer, {
        delay: beatTime + (beatLength * swing),
        volume: volume * layer.volume
      });
    });

    index++;
  };

  visualScheduler.callback = function (value) {
    indexMessageBus.update(value);
  };

  return function (next) {
    return function (action) {
      switch (action.type) {
        case LAYER_ADD:
          buffersByLayerId.set(action.layerId, action.buffer);
          break;
        case LAYER_REMOVE:
          buffersByLayerId.delete(action.layerId);
          break;
        case PLAYBACK_LISTENER_ADD:
          action.callback(index);

          indexMessageBus.addListener(action.callback);
          break;
        case PLAYBACK_LISTENER_REMOVE:
          indexMessageBus.removeListener(action.callback);
          break;
        case PLAYBACK_START:
          index = 0;

          scheduler.start();
          break;
        case PLAYBACK_STOP:
          scheduler.stop();
          break;
        case VOLUME_SET:
          masterGain.gain.value = Math.pow(action.value, 1.6);
          break;
        default:
      }

      return next(action);
    };
  };
}
