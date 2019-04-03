import { useRef } from 'react';

const uninitialised = Symbol();

export function useRefInit(callback) {
  const ref = useRef(uninitialised);

  if (ref.current === uninitialised) {
    ref.current = callback();
  }

  return ref.current;
}
