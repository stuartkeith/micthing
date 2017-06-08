import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import logger from 'redux-logger';
import { Provider } from 'react-redux';
import { microphoneDisable, microphoneEnable, microphoneRequest } from './actions';
import App from './components/App';
import middleware from './middleware';
import reducer from './reducers';

let storeMiddleware = middleware;

if (process.env.NODE_ENV !== 'production') {
  storeMiddleware = [...storeMiddleware, logger];
}

const store = createStore(
  reducer,
  applyMiddleware(...storeMiddleware)
);

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

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
