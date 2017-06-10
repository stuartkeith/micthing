// adapted from https://github.com/mohayonao/web-audio-api-shim/blob/master/src/AudioBuffer.js
if (typeof AudioBuffer !== 'undefined' && !AudioBuffer.prototype.hasOwnProperty('copyFromChannel')) {
  AudioBuffer.prototype.copyFromChannel = function (destination, channelNumber, startInChannel) {
    const source = this.getChannelData(channelNumber).subarray(startInChannel);

    destination.set(source.subarray(0, Math.min(source.length, destination.length)));
  };
}

// adapted from https://github.com/mohayonao/web-audio-api-shim/blob/master/src/AudioBuffer.js
if (typeof AudioBuffer !== 'undefined' && !AudioBuffer.prototype.hasOwnProperty('copyToChannel')) {
  AudioBuffer.prototype.copyToChannel = function (source, channelNumber, startInChannel) {
    const clipped = source.subarray(0, Math.min(source.length, this.length - (startInChannel)));

    this.getChannelData(channelNumber).set(clipped, startInChannel);
  };
}
