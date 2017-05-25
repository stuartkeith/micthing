import React from 'react';
import { connect } from 'react-redux';
import { layerRemove, layerSetMuted, layerSetNote } from '../actions';
import Button from './Button';

class Layer extends React.Component {
  render() {
    const { layer } = this.props;
    const { onLayerRemove, onSetLayerIsMuted, onSetLayerNote } = this.props;

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
  }
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
    }
  };
}

export default connect(
  null,
  mapDispatchToProps
)(Layer);
