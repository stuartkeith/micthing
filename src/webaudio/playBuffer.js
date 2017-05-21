import audioContext from './audioContext';

export default function playBuffer(destinationNode, buffer, options = {}) {
  const { delay = 0, playbackRate = 1, volume = 1, offset = 0, duration = buffer.length } = options;

  const gainNode = audioContext.createGain();
  gainNode.gain.value = volume;

  const bufferSource = audioContext.createBufferSource();
  bufferSource.buffer = buffer;
  bufferSource.playbackRate.value = playbackRate;

  bufferSource.connect(gainNode);
  gainNode.connect(destinationNode);

  bufferSource.start(delay, offset, duration);

  return bufferSource;
}
