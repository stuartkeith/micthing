import React from 'react';

class Range extends React.Component {
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
  }

  onChange(event) {
    this.props.onChange(parseFloat(event.target.value));
  }

  render() {
    const { children, min, max, step, value } = this.props;

    const ratio = 1 - ((value - min) / (max - min));

    const indicatorStyle = {
      transform: `translate3d(${ratio * -100}%, 0, 0)`
    };

    return (
      <div className="relative">
        <input
          type="range"
          className="input-range-reset pointer absolute w-100 h-100"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={this.onChange}
        />
        <div className="relative bg-gold dark-gray overflow-hidden pointer-events-none">
          <div className="absolute absolute--fill bg-red" style={indicatorStyle} />
          <div className="relative tc lh-2 w4">
            {children}
          </div>
        </div>
      </div>
    )
  }
}

export default Range;
