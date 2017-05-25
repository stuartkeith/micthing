import React from 'react';
import { connect } from 'react-redux';
import { layerRemove, layerSetMuted, layerSetNote } from '../actions';
import Button from './Button';

class Layer extends React.Component {
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
        <div className="flex">
          {layer.notes.map((note, index) => (
            <div
              key={index}
              className="w2 h2 bg-white light-gray pointer ba"
              style={{opacity: note ? 1 : 0.2}}
              onClick={() => layerSetNote(layer.id, index, !note)}
            />
          ))}
        </div>
      </div>
    );
  }
}

export default connect(null, {
  layerRemove,
  layerSetMuted,
  layerSetNote
})(Layer);
