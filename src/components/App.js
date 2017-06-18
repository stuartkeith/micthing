import classNames from 'classnames';
import React from 'react';
import { connect } from 'react-redux';
import { bpmSet, playbackStart, playbackStop, recordingStart, recordingStop, swingSet, volumeSet } from '../actions';
import { BPM_MINIMUM, BPM_MAXIMUM, MICROPHONE_STATE } from '../constants';
import Button from './Button';
import IconCheck from './IconCheck';
import IconWarning from './IconWarning';
import Layer from './Layer';
import Range from './Range';
import VolumeMeter from './VolumeMeter';
import './App.css';

class App extends React.Component {
  render() {
    const { isSupported, microphoneState, supportRequirements } = this.props;

    if (!isSupported) {
      return (
        <div className="ma6">
          <h1 className="f2 lh-title">Sorry...</h1>
          <p className="f4 lh-copy mb4">
            Your browser doesn't support all the features we need.
          </p>
          {supportRequirements.map((requirement, index) => (
            <div
              key={index}
              className={classNames(
                'mb4',
                requirement.isSupported ? 'o-60' : null
              )}
            >
              <h2 className="lh-title">
                <span className="dib w2 h2 v-mid mr3">
                  {requirement.isSupported ?
                    <IconCheck />
                    :
                    <IconWarning />
                  }
                </span>
                <span className="v-mid">
                  {requirement.title} is {!requirement.isSupported ? ' not ' : null} supported
                </span>
              </h2>
              <p>
                {requirement.description}
                {' '}
                <a className="color-inherit" target="_blank" rel="noopener noreferrer" href={requirement.link}>Find out more</a>.
              </p>
            </div>
          ))}
        </div>
      );
    }

    switch (microphoneState) {
      case MICROPHONE_STATE.DISABLED:
        return (
          <div className="ma6">
            <h1 className="f2 lh-title">Sorry...</h1>
            <p className="f4 lh-copy">
              We can't access your microphone.
            </p>
          </div>
        );
      case MICROPHONE_STATE.REQUESTED_PERMISSION:
        return (
          <div className="ma6">
            <h1 className="f2 lh-title">Hi.</h1>
            <p className="f4 lh-copy">
              Please allow us to use your microphone.
            </p>
            <p className="f5 lh-copy">(look up)</p>
          </div>
        );
      case MICROPHONE_STATE.ENABLED:
        return this.renderRecorder();
      default:
    }

    return null;
  }

  renderRecorder() {
    const { bpm, isCapturing, isPlaying, isRecording, layers, swing, volume } = this.props;
    const { onBpmSet, onPlaybackStart, onPlaybackStop, onRecordingStart, onRecordingStop, onSwingSet, onVolumeSet } = this.props;

    return (
      <div className="ma6">
        <div className="mb3">
          <VolumeMeter />
        </div>
        <div className="flex mb3">
          <Button
            isDown={isRecording}
            onClick={isRecording ? onRecordingStop : onRecordingStart}
          >
            Record
          </Button>
        </div>
        {layers.length ?
          <div className="flex mb4">
            <Button
              isDown={isPlaying}
              onClick={isPlaying ? onPlaybackStop : onPlaybackStart}
            >
              Play
            </Button>
            <div className="w1" />
            <Range
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={onVolumeSet}
            >
              Volume: {Math.floor(volume * 100)}%
            </Range>
            <div className="w1" />
            <Range
              min={BPM_MINIMUM}
              max={BPM_MAXIMUM}
              step={1}
              value={bpm}
              onChange={onBpmSet}
            >
              BPM: {bpm}
            </Range>
            <div className="w1" />
            <Range
              min={0}
              max={0.95}
              step={0.01}
              value={swing}
              onChange={onSwingSet}
            >
              Swing: {Math.floor(swing * 100)}%
            </Range>
          </div>
          :
          null
        }
        {isCapturing ? <p className="ma0 h2">...</p> : null}
        {layers.map((layer) => (
          <Layer key={layer.id} layer={layer} />
        ))}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    bpm: state.playback.bpm,
    isCapturing: state.recorder.isCapturing,
    isPlaying: state.playback.isPlaying,
    isRecording: state.recorder.isRecording,
    isSupported: state.support.isSupported,
    layers: state.layers.list,
    microphoneState: state.microphone.state,
    supportRequirements: state.support.requirements,
    swing: state.playback.swing,
    volume: state.playback.volume
  };
}

export default connect(mapStateToProps, {
  onBpmSet: bpmSet,
  onPlaybackStart: playbackStart,
  onPlaybackStop: playbackStop,
  onRecordingStart: recordingStart,
  onRecordingStop: recordingStop,
  onSwingSet: swingSet,
  onVolumeSet: volumeSet
})(App);
