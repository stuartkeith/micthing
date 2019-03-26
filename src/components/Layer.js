import React from 'react';
import { connect } from 'react-redux';
import { layerClear, layerRemove, layerSaveNotes, layerSetMuted, layerSetVolume } from '../actions';
import { NOTE_VALUE_OFF } from '../constants';
import Button from './Button';
import Notes from './Notes';
import Range from './Range';

class Layer extends React.Component {
  render() {
    const { layer } = this.props;
    const { onClear, onRemove, onSave, onSetMuted, onSetVolume } = this.props;

    const hasNotes = layer.notes.find(value => value !== NOTE_VALUE_OFF) !== undefined;
    const canSave = hasNotes && (layer.savedNotes.indexOf(layer.notes) === -1);

    return (
      <div className="pb3 flex">
        <Button
          onClick={() => hasNotes ? onClear(layer.id) : onRemove(layer.id)}
        >
          {hasNotes ? 'Clear' : 'Remove'}
        </Button>
        <span className="w1 flex-none" />
        <Range
          min={0}
          max={1}
          step={0.01}
          value={layer.volume}
          onChange={(value) => onSetVolume(layer.id, value)}
        >
          Volume
        </Range>
        <span className="w1 flex-none" />
        <Button
          isDown={layer.isMuted}
          onClick={() => onSetMuted(layer.id, !layer.isMuted)}
        >
          Mute
        </Button>
        <span className="w1 flex-none" />
        <Button
          disabled={!canSave}
          onClick={() => onSave(layer.id, layer.notes)}
        >
          Save
        </Button>
        <span className="w1 flex-none" />
        <Notes layerId={layer.id} notes={layer.notes} />
      </div>
    );
  }
}

export default connect(null, {
  onClear: layerClear,
  onRemove: layerRemove,
  onSave: layerSaveNotes,
  onSetMuted: layerSetMuted,
  onSetVolume: layerSetVolume
})(Layer);
