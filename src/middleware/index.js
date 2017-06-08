import playback from './playback';
import recorder from './recorder';

const middleware = [
  playback,
  recorder
];

export default middleware;
