import { LAYER_ADD, LAYER_REMOVE, LAYER_SET_VOLUME, PLAYBACK_LISTENER_ADD, PLAYBACK_LISTENER_REMOVE, PLAYBACK_START, PLAYBACK_STOP, VOLUME_SET } from '../actions';
import { layerLoadNotes } from '../actions';
import { NOTE_VALUE_OFF, NOTE_VALUE_ON, NOTE_VALUE_ACCENT } from '../constants';
import MessageBus from '../utils/MessageBus';
import { audioContext, Scheduler, VisualScheduler } from '../webaudio';

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
  const gainsByLayerId = new Map();
  const bufferSourcesByLayerId = new Map();
  const buffersByLayerId = new Map();
  const indexMessageBus = new MessageBus(0);
  const scheduler = new Scheduler();
  const visualScheduler = new VisualScheduler();

  masterGain.connect(audioContext.destination);

  let index = 0;

  const playBuffer = function (layer, volume, time, beatLength) {
    // stop sound already playing for this layer to avoid overlaps.
    // base it on the beat length to adapt to faster/slower BPMs.
    if (bufferSourcesByLayerId.has(layer.id)) {
      const [bufferSource, bufferGain, time, volume] = bufferSourcesByLayerId.get(layer.id);

      const stopTime = time + (beatLength * 3);

      bufferSource.stop(stopTime);

      bufferGain.gain.setValueAtTime(volume, time);
      bufferGain.gain.linearRampToValueAtTime(0, stopTime);
    }

    const layerGain = gainsByLayerId.get(layer.id);
    const buffer = buffersByLayerId.get(layer.id);

    const bufferGain = audioContext.createGain();
    bufferGain.gain.value = volume;

    const bufferSource = audioContext.createBufferSource();
    bufferSource.buffer = buffer;

    bufferSource.connect(bufferGain);
    bufferGain.connect(layerGain);

    bufferSource.start(time);

    bufferSourcesByLayerId.set(layer.id, [bufferSource, bufferGain, time, volume]);
  };

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

      playBuffer(layer, volume, beatTime + (beatLength * swing), beatLength);
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
          const gain = audioContext.createGain();
          gain.connect(masterGain);

          gainsByLayerId.set(action.layerId, gain);
          buffersByLayerId.set(action.layerId, action.buffer);
          break;
        case LAYER_REMOVE:
          gainsByLayerId.delete(action.layerId, gain);
          buffersByLayerId.delete(action.layerId);
          break;
        case LAYER_SET_VOLUME:
          gainsByLayerId.get(action.layerId).gain.value = Math.pow(action.value, 1.6);
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
