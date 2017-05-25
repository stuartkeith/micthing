import React from 'react';
import { connect } from 'react-redux';
import { playbackListenerAdd, playbackListenerRemove, layerRemove, layerSetMuted, layerSetNote } from '../actions';
import Button from './Button';

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
    const { layerRemove, layerSetMuted, layerSetNote } = this.props;

    return (
      <div className="flex mb3" key={layer.id}>
        <Button
          hasMargin
          onClick={() => layerRemove(layer.id)}
        >
          Remove
        </Button>
        <Button
          hasMargin
          isDown={layer.isMuted}
          onClick={() => layerSetMuted(layer.id, !layer.isMuted)}
        >
          Mute
        </Button>
        <div className="flex relative">
          {layer.notes.map((note, index) => (
            <div
              key={index}
              className="w2 h2 bg-white light-gray pointer ba"
              style={{opacity: note ? 1 : 0.2}}
              onClick={() => layerSetNote(layer.id, index, !note)}
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
  layerSetMuted,
  layerSetNote
})(Layer);
