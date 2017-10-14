import './webaudio/polyfills';

import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import logger from 'redux-logger';
import { Provider } from 'react-redux';
import { microphoneDisable, microphoneEnable, microphoneRequest, notSupported } from './actions';
import App from './components/App';
import middleware from './middleware';
import reducer from './reducers';
import { allRequirementsAreSupported, requirements } from './requirements';

const storeMiddleware = [];

if (process.env.NODE_ENV !== 'production') {
  storeMiddleware.push(logger);
}

if (allRequirementsAreSupported) {
  storeMiddleware.push(...middleware);
}

const store = createStore(
  reducer,
  applyMiddleware(...storeMiddleware)
);

if (!allRequirementsAreSupported) {
  store.dispatch(notSupported(requirements));
} else {
  // if user has already granted permission,
  // there will still be a delay before getUserMedia resolves.
  // so wait before dispatching the action
  const timeoutId = setTimeout(function () {
    store.dispatch(microphoneRequest());
  }, 500);

  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(function (mediaStream) {
      clearTimeout(timeoutId);

      store.dispatch(microphoneEnable(mediaStream));
    }, function () {
      clearTimeout(timeoutId);

      store.dispatch(microphoneDisable());
    });
}

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
