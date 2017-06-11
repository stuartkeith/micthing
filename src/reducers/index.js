import { combineReducers } from 'redux';
import layers from './layers';
import microphone from './microphone';
import playback from './playback';
import recorder from './recorder';
import support from './support';

export default combineReducers({
  layers,
  microphone,
  playback,
  recorder,
  support
});
