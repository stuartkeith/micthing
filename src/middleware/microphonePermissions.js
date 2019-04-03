import { APP_INIT, MICROPHONE_REQUEST } from '../actions';
import { microphoneDisable, microphoneEnable, microphonePreapproved } from '../actions';

// when the user grants permission to use the mic, save something in
// localStorage. then we can skip the prompt next time and request immediately.
const localStorageKey = 'micthing.microphonePermissions';

export default function microphonePermissions(store) {
  const getUserMedia = function () {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(function (mediaStream) {
        store.dispatch(microphoneEnable(mediaStream));

        try {
          localStorage.setItem(localStorageKey, 'true');
        } catch (e) {
          console.error(e);
        }
      }, function () {
        store.dispatch(microphoneDisable());

        try {
          localStorage.removeItem(localStorageKey);
        } catch (e) {
          console.error(e);
        }
      });
  };

  const init = function () {
    let isPreapproved = false;

    try {
      isPreapproved = localStorage.getItem(localStorageKey);
    } catch (e) {
      console.error(e);
    }

    if (isPreapproved) {
      store.dispatch(microphonePreapproved());

      getUserMedia();
    }
  };

  return function (next) {
    return function (action) {
      switch (action.type) {
        case APP_INIT:
          init();
          break;
        case MICROPHONE_REQUEST:
          getUserMedia();
          break;
        default:
      }

      return next(action);
    };
  };
}
