import { useCallback, useRef, useState } from 'react';
import { mergeChildren } from '../../utils/mergeChildren';

function childrenArrayToMap(array, getKey) {
  return new Map(array.map(child => {
    const key = getKey(child);

    return [key, { key, item: child }]
  }));
}

function mapToArray(map) {
  return Array.from(map, ([_key, value]) => value);
}

export function useTransition(children, { getKey = item => item.key, onUpdate }) {
  // hook used to manage transitions - children are cached in state and merged.
  // removed children need to be manually disposed of using removeChild.
  // side effects can be run on merge via onUpdate.

  // need to store some props in a ref for access within closures.
  const propsRef = useRef({});

  propsRef.current.onUpdate = onUpdate;

  // runs side effects when updating state. returns state for easily consumption
  // by setState.
  const onChange = function (state, previousMappedChildren, nextMappedChildren) {
    const onUpdate = propsRef.current.onUpdate;

    if (onUpdate) {
      state.mappedChildrenArray.forEach(function (child, index) {
        const wasInPrevious = previousMappedChildren.has(child.key);
        const isInNext = nextMappedChildren.has(child.key);

        let state;

        if (wasInPrevious && !isInNext) {
          state = 'exit';
        } else if (!wasInPrevious && isInNext) {
          state = 'enter';
        } else if (wasInPrevious && isInNext) {
          state = 'entered';
        } else {
          throw new Error('invalid state');
        }

        onUpdate(child, state, index);
      });
    }

    return state;
  };

  const [state, setState] = useState(() => {
    const mappedChildren = childrenArrayToMap(children, getKey);

    return onChange({
      // we only want to recalculate things if the children prop has changed,
      // or we'll get infinite loops. so keep track of it.
      lastChildren: children,
      // the result of the merge.
      mappedChildren,
      // store the array version separately - the map is mutable so we can't
      // rely on a useMemo call to do this. update it manually.
      mappedChildrenArray: mapToArray(mappedChildren)
    }, mappedChildren, mappedChildren);
  });

  const removeChild = useCallback((key) => {
    // remove the key and rebuild the array.
    setState(state => {
      state.mappedChildren.delete(key);

      return onChange({
        ...state,
        mappedChildrenArray: mapToArray(state.mappedChildren)
      }, state.mappedChildren, state.mappedChildren);
    });
  }, []);

  // if the props have changed, time to merge.
  if (state.lastChildren !== children) {
    const newMappedChildren = childrenArrayToMap(children, getKey);
    const mappedChildren = mergeChildren(state.mappedChildren, newMappedChildren);

    setState(onChange({
      lastChildren: children,
      mappedChildren,
      mappedChildrenArray: mapToArray(mappedChildren)
    }, state.mappedChildren, newMappedChildren));
  }

  return [state.mappedChildrenArray, removeChild];
}
