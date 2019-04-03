import { mergeChildren } from './mergeChildren';

// ['a', 'b']
// to
// { 'a': { key: 'a'}, 'b': { key: 'b'} }
function keysToMap(keys) {
  return new Map(keys.map(key => [key, { key }]));
}

it('merges children', function () {
  const previousChildren = keysToMap(['a', 'b', 'c', 'd', 'e', 'f']);
  const nextChildren = keysToMap(['b', 'foo', 'e']);
  const result = mergeChildren(previousChildren, nextChildren);

  expect(result).toEqual(keysToMap([
    'a',
    'b',
    'foo',
    'c', 'd',
    'e',
    'f'
  ]));
});

it('rearranges children', function () {
  const previousChildren = keysToMap(['a', 'b', 'c']);
  const nextChildren = keysToMap(['a', 'c', 'b']);
  const result = mergeChildren(previousChildren, nextChildren);

  expect(result).toEqual(keysToMap([
    'a',
    'c',
    'b'
  ]));
});
