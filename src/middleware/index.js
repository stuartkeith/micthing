import playback from './playback';
import recorder from './recorder';
import userMedia from './userMedia';

const middleware = [
  playback,
  recorder,
  userMedia
];

export default middleware;
