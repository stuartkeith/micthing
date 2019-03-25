import React from 'react';
import { connect } from 'react-redux';
import { recordingListenerAdd, recordingListenerRemove, recordingThresholdSet } from '../actions';

class VolumeMeter extends React.Component {
  constructor(props) {
    super(props);

    this.audioInputListener = this.audioInputListener.bind(this);
    this.onClick = this.onClick.bind(this);

    this.indicatorRef = React.createRef();
  }

  componentDidMount() {
    this.props.recordingListenerAdd(this.audioInputListener);
  }

  componentWillUnmount() {
    this.props.recordingListenerRemove(this.audioInputListener);
  }

  audioInputListener(maxSample) {
    this.indicatorRef.current.style.transform = `scale3d(${maxSample}, 1, 1)`;
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

  render() {
    const { children, recordingThreshold } = this.props;

    const arrowStyle = {
      transform: `translate3d(${recordingThreshold * 100}%, 0, 0)`
    };

    return (
      <div className="h2 overflow-hidden relative pointer" onClick={this.onClick}>
        <div className="absolute absolute--fill bg-black" />
        <div ref={this.indicatorRef} className="absolute absolute--fill bg-white transform-origin-left" />
        <div className="absolute absolute--fill transform-origin-left bl bw1 b--gold" style={arrowStyle} />
        {children ? <p className="ma0 ml2 absolute transform-center-y">{children}</p> : null}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    recordingThreshold: state.recorder.threshold
  };
}

export default connect(mapStateToProps, {
  recordingListenerAdd,
  recordingListenerRemove,
  recordingThresholdSet
})(VolumeMeter);
