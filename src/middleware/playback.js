import { LAYER_ADD, LAYER_REMOVE, PLAYBACK_LISTENER_ADD, PLAYBACK_LISTENER_REMOVE, PLAYBACK_START, PLAYBACK_STOP } from '../actions';
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
    const state = store.getState();

    index = nextIndex;

    visualScheduler.push(index, beatTime);

    state.layers.list.forEach(function (layer) {
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

    nextIndex = index + 1;
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
