import React from 'react';
import { connect } from 'react-redux';
import { recordingListenerAdd, recordingListenerRemove, recordingThresholdSet } from '../actions';

class VolumeMeter extends React.Component {
  constructor(props) {
    super(props);

    this.audioInputListener = this.audioInputListener.bind(this);
    this.onClick = this.onClick.bind(this);
    this.setElement = this.setElement.bind(this);
  }

  componentDidMount() {
    this.props.recordingListenerAdd(this.audioInputListener);
  }

  componentWillUnmount() {
    this.props.recordingListenerRemove(this.audioInputListener);
  }

  audioInputListener(maxSample) {
    this.element.style.transform = `scale3d(${maxSample}, 1, 1)`;
  }

  onClick(event) {
    let element = event.currentTarget;
    let x = event.pageX;

    while (element) {
      x -= element.offsetLeft;

      element = element.offsetParent;
    }

    const value = x / event.currentTarget.offsetWidth;

    this.props.recordingThresholdSet(value);
  }

  setElement(element) {
    this.element = element;
  }

  render() {
    const { recordingThreshold } = this.props;

    const arrowStyle = {
      transform: `translate3d(${recordingThreshold * 100}%, 0, 0)`
    };

    return (
      <div className="h2 bg-black overflow-hidden relative" onClick={this.onClick}>
        <div ref={this.setElement} className="absolute absolute--fill bg-white transform-origin-left" />
        <div className="absolute absolute--fill transform-origin-left bl bw1 b--gold" style={arrowStyle} />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    recordingThreshold: state.recordingThreshold
  };
}

export default connect(mapStateToProps, {
  recordingListenerAdd,
  recordingListenerRemove,
  recordingThresholdSet
})(VolumeMeter);
