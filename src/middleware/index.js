import microphonePermissions from './microphonePermissions';
import playback from './playback';
import recorder from './recorder';

const middleware = [
  microphonePermissions,
  playback,
  recorder
];

export default middleware;
