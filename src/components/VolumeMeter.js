import React from 'react';
import { connect } from 'react-redux';
import { recordingListenerAdd, recordingListenerRemove } from '../actions';

class VolumeMeter extends React.Component {
  constructor(props) {
    super(props);

    this.audioInputListener = this.audioInputListener.bind(this);
    this.setElement = this.setElement.bind(this);
  }

  componentDidMount() {
    this.props.dispatch(recordingListenerAdd(this.audioInputListener));
  }

  componentWillUnmount() {
    this.props.dispatch(recordingListenerRemove(this.audioInputListener));
  }

  shouldComponentUpdate() {
    return false;
  }

  audioInputListener(maxSample) {
    this.element.style.transform = `scale3d(${maxSample}, 1, 1)`;
  }

  setElement(element) {
    this.element = element;
  }

  render() {
    return (
      <div className="w4 h1 relative">
        <div className="absolute absolute--fill bg-black" />
        <div ref={this.setElement} className="absolute absolute--fill bg-white transform-origin-left" />
      </div>
    );
  }
}

export default connect()(VolumeMeter);
