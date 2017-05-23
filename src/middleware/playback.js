import { LAYER_ADD, LAYER_REMOVE, PLAYBACK_START, PLAYBACK_STOP } from '../actions';
import { audioContext, playBuffer, Scheduler } from '../webaudio';

export default function playback(store) {
  const buffersByLayerId = {};
  const scheduler = new Scheduler();

  let index = 0;

  scheduler.callback = function (beatTime, beatLength) {
    const state = store.getState();

    state.layers.forEach(function (layer) {
      if (layer.isMuted) {
        return;
      }

      const note = layer.notes[index % layer.notes.length];

      if (!note) {
        return;
      }

      const buffer = buffersByLayerId[layer.id];

      playBuffer(audioContext.destination, buffer, {
        delay: beatTime
      });
    });

    index++;
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
        case PLAYBACK_START:
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
