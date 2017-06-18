import React from 'react';
import { connect } from 'react-redux';
import { layerClear, layerIncrementNote, layerRemove, layerSetMuted, layerSetVolume } from '../actions';
import { playbackListenerAdd, playbackListenerRemove } from '../actions';
import Button from './Button';
import Range from './Range';

function getOpacity(value) {
  const minimum = 0.2;

  return minimum + ((1 - minimum) * value);
}

class Layer extends React.Component {
  constructor(props) {
    super(props);

    this.setPlaybackElement = this.setPlaybackElement.bind(this);
    this.updatePlaybackIndex = this.updatePlaybackIndex.bind(this);
  }

  componentDidMount() {
    this.props.onPlaybackListenerAdd(this.updatePlaybackIndex);
  }

  componentWillUnmount() {
    this.props.onPlaybackListenerRemove(this.updatePlaybackIndex);
  }

  setPlaybackElement(element) {
    this.playbackElement = element;
  }

  updatePlaybackIndex(value) {
    const { layer } = this.props;

    const percentage = (value % layer.notes.length) * 100;

    this.playbackElement.style.transform = `translate3d(${percentage}%, -100%, 0)`;
  }

  render() {
    const { layer } = this.props;
    const { onClear, onIncrementNote, onRemove, onSetMuted, onSetVolume } = this.props;

    const layerHasNotes = layer.notes.find(value => value > 0) !== undefined;

    return (
      <div className="flex mb3" key={layer.id}>
        <Button
          onClick={() => layerHasNotes ? onClear(layer.id) : onRemove(layer.id)}
        >
          {layerHasNotes ? 'Clear' : 'Remove'}
        </Button>
        <div className="w1" />
        <Range
          min={0}
          max={1}
          step={0.01}
          value={layer.volume}
          onChange={(value) => onSetVolume(layer.id, value)}
        >
          Volume: {Math.floor(layer.volume * 100)}%
        </Range>
        <div className="w1" />
        <Button
          isDown={layer.isMuted}
          onClick={() => onSetMuted(layer.id, !layer.isMuted)}
        >
          Mute
        </Button>
        <div className="w1" />
        <div className="flex relative">
          {layer.notes.map((note, index) => (
            <div
              key={index}
              className="w2 h2 bg-white light-gray pointer ba"
              style={{opacity: getOpacity(note)}}
              onClick={() => onIncrementNote(layer.id, index, note)}
            />
          ))}
          <div
            ref={this.setPlaybackElement}
            className="w2 h1 bg-gold absolute left-0 top-0"
          />
        </div>
      </div>
    );
  }
}

export default connect(null, {
  onClear: layerClear,
  onIncrementNote: layerIncrementNote,
  onPlaybackListenerAdd: playbackListenerAdd,
  onPlaybackListenerRemove: playbackListenerRemove,
  onRemove: layerRemove,
  onSetMuted: layerSetMuted,
  onSetVolume: layerSetVolume
})(Layer);
