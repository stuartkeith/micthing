import './webaudio/polyfills';

import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import logger from 'redux-logger';
import { Provider } from 'react-redux';
import { appInit, notSupported, webaudioStateChange } from './actions';
import App from './components/App';
import middleware from './middleware';
import reducer from './reducers';
import { allRequirementsAreSupported, requirements } from './requirements';
import { onNextUserGesture } from './utils/onNextUserGesture';
import { audioContext } from './webaudio';
import './index.css';

const storeMiddleware = [];

if (process.env.NODE_ENV !== 'production' && window.location.search.indexOf('nolog') < 0) {
  storeMiddleware.push(logger);
}

if (allRequirementsAreSupported) {
  storeMiddleware.push(...middleware);
}

const store = createStore(
  reducer,
  applyMiddleware(...storeMiddleware)
);

if (audioContext.state === 'suspended') {
  store.dispatch(webaudioStateChange(true));

  onNextUserGesture(function () {
    audioContext
      .resume()
      .then(() => store.dispatch(webaudioStateChange(false)));
  });
}

if (!allRequirementsAreSupported) {
  store.dispatch(notSupported(requirements));
}

store.dispatch(appInit());

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
