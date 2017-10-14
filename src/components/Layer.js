import cn from '../utils/cn';
import React from 'react';
import { connect } from 'react-redux';
import { layerClear, layerIncrementNote, layerLoadNotes, layerRemove, layerSaveNotes, layerSetMuted, layerSetVolume } from '../actions';
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
    const { onClear, onIncrementNote, onLoad, onRemove, onSave, onSetMuted, onSetVolume } = this.props;

    const hasNotes = layer.notes.find(value => value > 0) !== undefined;
    const canSave = hasNotes && (layer.savedNotes.indexOf(layer.notes) === -1);

    return (
      <div>
        <div className="mb3 flex">
          <Button
            onClick={() => hasNotes ? onClear(layer.id) : onRemove(layer.id)}
          >
            {hasNotes ? 'Clear' : 'Remove'}
          </Button>
          <div className="w1" />
          <Range
            min={0}
            max={1}
            step={0.01}
            value={layer.volume}
            onChange={(value) => onSetVolume(layer.id, value)}
          >
            Volume
          </Range>
          <div className="w1" />
          <Button
            isDown={layer.isMuted}
            onClick={() => onSetMuted(layer.id, !layer.isMuted)}
          >
            Mute
          </Button>
          <div className="w1" />
          <Button
            disabled={!canSave}
            onClick={() => onSave(layer.id, layer.notes)}
          >
            Save
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
        <div className="h1 mb3 flex justify-end">
          {layer.savedNotes.map((notes, index) => (
            <div
              key={index}
              className={cn(
                'w1 h1 lh-1 bg-white dark-gray tc small',
                index > 0 ? 'ml2' : null,
                notes === layer.notes ? 'o-50' : 'pointer'
              )}
              onClick={() => onLoad(layer.id, notes)}
            >
              {String.fromCharCode(65 + index)}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default connect(null, {
  onClear: layerClear,
  onIncrementNote: layerIncrementNote,
  onLoad: layerLoadNotes,
  onPlaybackListenerAdd: playbackListenerAdd,
  onPlaybackListenerRemove: playbackListenerRemove,
  onRemove: layerRemove,
  onSave: layerSaveNotes,
  onSetMuted: layerSetMuted,
  onSetVolume: layerSetVolume
})(Layer);
