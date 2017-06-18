import React from 'react';
import { connect } from 'react-redux';
import { layerClear, layerIncrementNote, layerRemove, layerSetMuted } from '../actions';
import { playbackListenerAdd, playbackListenerRemove } from '../actions';
import Button from './Button';

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
    const { onClear, onIncrementNote, onRemove, onSetMuted } = this.props;

    const layerHasNotes = layer.notes.find(value => value > 0) !== undefined;

    return (
      <div className="flex mb3" key={layer.id}>
        <Button
          onClick={() => layerHasNotes ? onClear(layer.id) : onRemove(layer.id)}
        >
          {layerHasNotes ? 'Clear' : 'Remove'}
        </Button>
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
  onRemove: layerRemove,
  onSetMuted: layerSetMuted,
  onPlaybackListenerAdd: playbackListenerAdd,
  onPlaybackListenerRemove: playbackListenerRemove
})(Layer);
