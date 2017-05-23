import { microphoneDisable, microphoneEnable, microphoneRequest } from '../actions';

export default function userMedia(store) {
  // if user has already granted permission,
  // there will still be a delay before getUserMedia resolves.
  // so wait before setting the "request permission" state
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

  return function (next) {
    return function (action) {
      return next(action);
    }
  }
}
