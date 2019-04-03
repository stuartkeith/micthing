export function mergeChildren(previousChildren, nextChildren) {
  // merges two maps of children while keeping their order. based on
  // react-transition-group's mergeChildMappings:
  // https://github.com/reactjs/react-transition-group/blob/master/src/utils/ChildMapping.js
  //
  // for each child in nextChildren, there may be children that were present
  // in previousChildren that are no longer there.
  //
  // for example:
  //
  // previousChildren: ['a', 'b', 'c', 'd', 'e', 'f']
  // nextChildren: ['b', 'foo', 'e']
  //
  // 'a', 'c', and 'e' have gone, but we want to keep them around. how do we
  // know where they go?
  //
  // to solve this, each child in nextChildren has an array of any missing
  // children (if any) that should be inserted before it. you can see below that
  // 'b' knows 'a' precedes it, and 'e' knows 'c' and 'd' precede it. 'f' is a
  // special case - it does not precede any existing children, so it is inserted
  // at the end.
  //
  // previousChildren: ['a', 'b',        'c', 'd', 'e', 'f']
  // nextChildren:     [     'b', 'foo',           'e'     ]
  // result:           ['a', 'b', 'foo', 'c', 'd', 'e', 'f']
  //
  // step by step:
  //
  // is 'a' in nextChildren? no. put it in the list for later.
  //   - pendingKeys:     ['a']
  //   - nextKeysPending: {}
  // is 'b' in nextChildren? yes. associate the list (['a']) with 'b'.
  //   - pendingKeys:     []
  //   - nextKeysPending: { 'b': ['a'] }
  // is 'c' in nextChildren? no. put in the list.
  //   - pendingKeys:     ['c']
  //   - nextKeysPending: { 'b': ['a'] }
  // is 'd' in nextChildren? no. put in the list.
  //   - pendingKeys:     ['c', 'd']
  //   - nextKeysPending: { 'b': ['a'] }
  // is 'e' in nextChildren? yes. associate the list (['c', 'd']) with 'e'.
  //   - pendingKeys:     []
  //   - nextKeysPending: { 'b': ['a'], 'e : ['c', 'd'] }
  // is 'f' in nextChildren? no.
  //   - pendingKeys:     ['f']
  //   - nextKeysPending: { 'b': ['a'], 'e : ['c', 'd'] }
  //
  // 'pendingKeys' is left with 'f'.
  //
  // now, for each child in nextChildren, we can determine which (if any)
  // children go before that child in the output. we also know which children
  // are left over and need to go at the end of the output.
  //
  // now we can build the final merged list.
  // for each child in nextChild (['b', 'foo', 'e']):
  //
  // does 'b' have any children from the old list before it? yes.
  //   - ['a']
  // now add 'b' itself.
  //   - ['a'] + ['b']
  // does 'foo' have any children from the old list before it? no.
  //   - ['a', 'b'] + ['foo']
  // does 'e' have any children from the old list before it? yes.
  //   - ['a', 'b', 'foo'] + ['c', 'd']
  // now add 'e' itself.
  //   - ['a', 'b', 'foo', 'c', 'd'] + ['e']
  //
  // then we just need to add any leftover children (in this case ['f']) to
  // the end:
  //   - ['a', 'b', 'foo', 'c', 'd', 'e'] + ['f']
  //
  // and that's it.

  const getValueForKey = function (key) {
    return nextChildren.has(key) ? nextChildren.get(key) : previousChildren.get(key);
  };

  const nextKeysPending = new Map();
  let pendingKeys = [];

  previousChildren.forEach(function (previousChild) {
    if (!nextChildren.has(previousChild.key)) {
      pendingKeys.push(previousChild);
    } else {
      // don't store an empty array - we can just skip it.
      if (pendingKeys.length) {
        nextKeysPending.set(previousChild.key, pendingKeys);

        // reset the list.
        pendingKeys = [];
      }
    }
  });

  const result = new Map();

  nextChildren.forEach(function (nextChild) {
    if (nextKeysPending.has(nextChild.key)) {
      nextKeysPending.get(nextChild.key).forEach(function (previousChild) {
        result.set(previousChild.key, getValueForKey(previousChild.key));
      });
    }

    result.set(nextChild.key, nextChild);
  });

  pendingKeys.forEach(function (previousChild) {
    result.set(previousChild.key, getValueForKey(previousChild.key));
  });

  return result;
}
