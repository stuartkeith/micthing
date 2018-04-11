import React from 'react';
import { connect } from 'react-redux';
import { layerSetNote, playbackListenerAdd, playbackListenerRemove } from '../actions';
import { NOTE_VALUES } from '../constants';

function getOpacity(value) {
  const minimum = 0.2;

  return minimum + ((1 - minimum) * value);
}

function getElementIndex(parentElement, childElement) {
  return Array.prototype.indexOf.call(parentElement.children, childElement);
}

class Notes extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isMouseDown: false,
      noteValue: 0
    };

    this.lastMouseDownTime = 0;

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);

    this.updatePlaybackIndex = this.updatePlaybackIndex.bind(this);

    this.playbackRef = React.createRef();
  }

  componentDidMount() {
    this.props.onPlaybackListenerAdd(this.updatePlaybackIndex);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.isMouseDown !== this.state.isMouseDown) {
      if (this.state.isMouseDown) {
        window.addEventListener('mouseup', this.onMouseUp);
      } else {
        window.removeEventListener('mouseup', this.onMouseUp);
      }
    }
  }

  componentWillUnmount() {
    this.props.onPlaybackListenerRemove(this.updatePlaybackIndex);
  }

  updatePlaybackIndex(value) {
    const { notes } = this.props;

    const percentage = (value % notes.length) * 100;

    this.playbackRef.current.style.transform = `translate3d(${percentage}%, -100%, 0)`;
  }

  onMouseDown(event) {
    const noteIndex = getElementIndex(event.currentTarget, event.target);

    if (noteIndex < 0) {
      return;
    }

    event.preventDefault();

    const now = Date.now();
    const timeSinceLastMouseDown = now - this.lastMouseDownTime;

    this.lastMouseDownTime = now;

    let noteValue;

    if (timeSinceLastMouseDown <= 300) {
      noteValue = NOTE_VALUES[NOTE_VALUES.length - 1];
    } else {
      noteValue = this.props.notes[noteIndex] === NOTE_VALUES[0] ? NOTE_VALUES[1] : NOTE_VALUES[0];
    }

    this.setState({
      isMouseDown: true,
      noteValue
    });

    this.props.onLayerSetNote(this.props.layerId, noteIndex, noteValue);
  }

  onMouseMove(event) {
    event.preventDefault();

    const noteIndex = getElementIndex(event.currentTarget, event.target);

    if (noteIndex < 0) {
      return;
    }

    const { layerId, notes, onLayerSetNote } = this.props;
    const { noteValue } = this.state;

    if (notes[noteIndex] === noteValue) {
      return;
    }

    onLayerSetNote(layerId, noteIndex, noteValue);
  }

  onMouseUp() {
    this.setState({
      isMouseDown: false
    });
  }

  render() {
    const { notes } = this.props;
    const { isMouseDown } = this.state;

    return (
      <div
        className="flex relative pointer"
        onMouseDown={!isMouseDown ? this.onMouseDown : null}
        onMouseMove={isMouseDown ? this.onMouseMove : null}
      >
        {notes.map((note, index) => (
          <div
            key={index}
            className="w2 h2 bg-white light-gray ba"
            style={{opacity: getOpacity(note)}}
          />
        ))}
        <div
          ref={this.playbackRef}
          className="w2 h1 bg-gold absolute left-0 top-0"
        />
      </div>
    );
  }
}

export default connect(null, {
  onLayerSetNote: layerSetNote,
  onPlaybackListenerAdd: playbackListenerAdd,
  onPlaybackListenerRemove: playbackListenerRemove
})(Notes);
