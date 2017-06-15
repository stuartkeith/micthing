import React from 'react';
import { connect } from 'react-redux';
import { playbackListenerAdd, playbackListenerRemove, layerRemove, layerIncrementNote, layerSetMuted } from '../actions';
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
    this.props.playbackListenerAdd(this.updatePlaybackIndex);
  }

  componentWillUnmount() {
    this.props.playbackListenerRemove(this.updatePlaybackIndex);
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
    const { layerRemove, layerSetMuted, layerIncrementNote } = this.props;

    return (
      <div className="flex mb3" key={layer.id}>
        <Button
          onClick={() => layerRemove(layer.id)}
        >
          Remove
        </Button>
        <div className="w1" />
        <Button
          isDown={layer.isMuted}
          onClick={() => layerSetMuted(layer.id, !layer.isMuted)}
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
              onClick={() => layerIncrementNote(layer.id, index, note)}
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
  playbackListenerAdd,
  playbackListenerRemove,
  layerRemove,
  layerIncrementNote,
  layerSetMuted
})(Layer);
