const userGestureEvents = ['mousedown', 'touchend'];

export function onNextUserGesture(callback) {
  const onUserGesture = function () {
    userGestureEvents.forEach((key) => window.removeEventListener(key, onUserGesture));

    callback();
  };

  userGestureEvents.forEach((key) => window.addEventListener(key, onUserGesture));
}
