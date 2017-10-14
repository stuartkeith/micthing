import React from 'react';
import { connect } from 'react-redux';
import { layerQueueNotes } from '../actions';
import cn from '../utils/cn';

const labels = [];

for (let i = 0; i < 26; i++) {
  labels[i] = String.fromCharCode(65 + i);
}

class LayersMatrix extends React.Component {
  render() {
    const { layers } = this.props;

    return (
      <div>
        {layers.map((layer) => (
          <div key={layer.id} className="flex">
            {layer.savedNotes.map((notes, index) => (
              <div
                key={index}
                className={cn(
                  'w2 h2 lh-2 bg-white dark-gray tc small',
                  notes === layer.notes ? 'o-20' : 'pointer',
                  notes === layer.queuedNotes ? 'o-50' : null
                )}
                onMouseEnter={() => this.onMouseEnter(layer, notes)}
              >
                {labels[index]}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  onMouseEnter(layer, notes) {
    if (layer.notes !== notes || layer.queuedNotes !== notes) {
      this.props.onSelect(layer.id, notes);
    }
  }
}

export default connect(null, {
  onSelect: layerQueueNotes
})(LayersMatrix);
