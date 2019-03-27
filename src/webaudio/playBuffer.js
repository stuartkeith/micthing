import audioContext from './audioContext';

export default function playBuffer(destinationNode, buffer, options = {}) {
  const { delay = 0, playbackRate = 1, volume = 1, offset = 0, duration = undefined } = options;

  const gainNode = audioContext.createGain();
  gainNode.gain.value = Math.pow(volume, 1.6);

  const bufferSource = audioContext.createBufferSource();
  bufferSource.buffer = buffer;
  bufferSource.playbackRate.value = playbackRate;

  bufferSource.connect(gainNode);
  gainNode.connect(destinationNode);

  bufferSource.start(delay, offset, duration);

  return bufferSource;
}
