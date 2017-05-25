import React from 'react';
import { connect } from 'react-redux';
import { layerRemove, layerSetMuted, layerSetNote, playbackStart, playbackStop, recordingStart, recordingStop } from '../actions';
import { MICROPHONE_STATE } from '../constants';
import Button from './Button';
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
    const { onLayerRemove, onSetLayerIsMuted, onSetLayerNote, onStartPlaying, onStopPlaying, onStartRecording, onStopRecording } = this.props;

    return (
      <div className="ma6">
        <div className="flex mb3">
          <Button
            hasMargin
            isDown={isRecording}
            onClick={isRecording ? onStopRecording : onStartRecording}
          >
            Record
          </Button>
          {layers.length ?
            <Button
              isDown={isPlaying}
              onClick={isPlaying ? onStopPlaying : onStartPlaying}
            >
              Play
            </Button>
            :
            null
          }
        </div>
        {isCapturing ? <p className="ma0 h2">...</p> : null}
        {layers.map((layer) => {
          return (
            <div className="flex mb3" key={layer.id}>
              <Button
                hasMargin
                onClick={() => onLayerRemove(layer.id)}
              >
                Remove
              </Button>
              <Button
                hasMargin
                isDown={layer.isMuted}
                onClick={() => onSetLayerIsMuted(layer.id, layer.isMuted)}
              >
                Mute
              </Button>
              <div className="flex">
                {layer.notes.map((note, index) => (
                  <div
                    key={index}
                    className="w2 h2 bg-white light-gray pointer ba"
                    style={{opacity: note ? 1 : 0.2}}
                    onClick={() => onSetLayerNote(layer.id, index, note)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return state;
}

function mapDispatchToProps(dispatch) {
  return {
    onLayerRemove: function (layerId) {
      dispatch(layerRemove(layerId));
    },
    onSetLayerIsMuted: function (layerId, value) {
      dispatch(layerSetMuted(layerId, !value));
    },
    onSetLayerNote: function (layerId, index, value) {
      dispatch(layerSetNote(layerId, index, !value));
    },
    onStartPlaying: function () {
      dispatch(playbackStart());
    },
    onStopPlaying: function () {
      dispatch(playbackStop());
    },
    onStartRecording: function () {
      dispatch(recordingStart());
    },
    onStopRecording: function () {
      dispatch(recordingStop());
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
