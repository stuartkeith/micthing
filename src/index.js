import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import logger from 'redux-logger';
import { Provider } from 'react-redux';
import App from './App';
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

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
