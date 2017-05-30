import React from 'react';
import { connect } from 'react-redux';
import { playbackStart, playbackStop, recordingStart, recordingStop } from '../actions';
import { MICROPHONE_STATE } from '../constants';
import Button from './Button';
import Layer from './Layer';
import VolumeMeter from './VolumeMeter';
import './App.css';

class App extends React.Component {
  render() {
    const { microphoneState } = this.props;

    switch (microphoneState) {
      case MICROPHONE_STATE.DISABLED:
        return (
          <div className="ma6">
            <h1 className="f2 lh-title">Sorry...</h1>
            <p className="f4 lh-copy">
              I can't access your microphone.
            </p>
          </div>
        );
      case MICROPHONE_STATE.REQUESTED_PERMISSION:
        return (
          <div className="ma6">
            <h1 className="f2 lh-title">Hi.</h1>
            <p className="f4 lh-copy">
              Please allow this site to use your microphone.
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
    const { isCapturing, isPlaying, isRecording, layers } = this.props;
    const { playbackStart, playbackStop, recordingStart, recordingStop } = this.props;

    return (
      <div className="ma6">
        <VolumeMeter />
        <div className="flex mb3">
          <Button
            hasMargin
            isDown={isRecording}
            onClick={isRecording ? recordingStop : recordingStart}
          >
            Record
          </Button>
          {layers.length ?
            <Button
              isDown={isPlaying}
              onClick={isPlaying ? playbackStop : playbackStart}
            >
              Play
            </Button>
            :
            null
          }
        </div>
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
    isCapturing: state.isCapturing,
    isPlaying: state.isPlaying,
    isRecording: state.isRecording,
    layers: state.layers,
    microphoneState: state.microphoneState
  };
}

export default connect(mapStateToProps, {
  playbackStart,
  playbackStop,
  recordingStart,
  recordingStop
})(App);
