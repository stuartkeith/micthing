import { LAYER_ADD, LAYER_REMOVE, PLAYBACK_LISTENER_ADD, PLAYBACK_LISTENER_REMOVE, PLAYBACK_START, PLAYBACK_STOP } from '../actions';
import { layerLoadNotes } from '../actions';
import MessageBus from '../utils/MessageBus';
import { audioContext, playBuffer, Scheduler, VisualScheduler } from '../webaudio';

export default function playback(store) {
  const buffersByLayerId = {};
  const indexMessageBus = new MessageBus();
  const scheduler = new Scheduler();
  const visualScheduler = new VisualScheduler();

  let index = 0;
  let nextIndex = 0;

  scheduler.callback = function (beatTime, beatLength) {
    index = nextIndex;

    // if first beat, load any queued notes first
    if (index === 0) {
      const layers = store.getState().layers;

      layers.list.forEach(function (layer) {
        if (layer.queuedNotes !== null) {
          store.dispatch(layerLoadNotes(layer.id, layer.queuedNotes));
        }
      });
    }

    visualScheduler.push(index, beatTime);

    const state = store.getState();
    const swing = nextIndex % 2 ? state.playback.swing : 0;

    scheduler.bpm = state.playback.bpm;

    state.layers.list.forEach(function (layer) {
      if (layer.isMuted || layer.volume === 0) {
        return;
      }

      const volume = layer.notes[index % layer.notes.length];

      if (volume <= 0) {
        return;
      }

      const buffer = buffersByLayerId[layer.id];

      playBuffer(audioContext.destination, buffer, {
        delay: beatTime + (beatLength * swing),
        volume: volume * state.playback.volume * layer.volume
      });
    });

    nextIndex = index === 15 ? 0 : (index + 1);
  };

  visualScheduler.callback = function (value) {
    indexMessageBus.update(value);
  };

  return function (next) {
    return function (action) {
      switch (action.type) {
        case LAYER_ADD:
          buffersByLayerId[action.layerId] = action.buffer;
          break;
        case LAYER_REMOVE:
          delete buffersByLayerId[action.layerId];
          break;
        case PLAYBACK_LISTENER_ADD:
          action.callback(index);

          indexMessageBus.addListener(action.callback);
          break;
        case PLAYBACK_LISTENER_REMOVE:
          indexMessageBus.removeListener(action.callback);
          break;
        case PLAYBACK_START:
          nextIndex = 0;

          scheduler.start();
          break;
        case PLAYBACK_STOP:
          scheduler.stop();
          break;
        default:
      }

      return next(action);
    };
  };
}
