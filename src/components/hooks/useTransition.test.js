import React from 'react';
import { fireEvent, render } from 'react-testing-library';
import { useTransition } from './useTransition';

function App({ items, getKey, onUpdate }) {
  const [children, removeChild] = useTransition(items, {
    getKey,
    onUpdate
  });

  return (
    <div>
      {children.map(child =>
        <p
          key={child.key}
          data-testkey={child.key}
        >
          <span>Child {child.key}</span>
          <button onClick={() => removeChild(child.key)}>Remove</button>
        </p>
      )}
    </div>
  );
}

function items(keys) {
  return keys.map(key => ({ key }));
}

it('merges children', () => {
  const { container, rerender } = render(<App items={items(['a'])} />);

  expect(container.firstChild.childNodes.length).toBe(1);
  expect(container.firstChild.childNodes[0].dataset.testkey).toBe('a');

  rerender(<App items={items(['a', 'b', 'c', 'd', 'e', 'f'])} />);

  const firstNodes = container.firstChild.childNodes;

  expect(firstNodes.length).toEqual(6);

  ['a', 'b', 'c', 'd', 'e', 'f'].forEach(function (key, index) {
    expect(firstNodes[index].dataset.testkey).toBe(key);
  });

  rerender(<App items={items([
    'b',
    'foo',
    'e'
  ])} />);

  const secondNodes = container.firstChild.childNodes;

  expect(secondNodes.length).toEqual(7);

  [
    'a',
    'b',
    'foo',
    'c', 'd',
    'e',
    'f'
  ].forEach(function (key, index) {
    expect(secondNodes[index].dataset.testkey).toBe(key);
  });
});

it('calls onUpdate', () => {
  const onUpdate = jest.fn();

  const { rerender } = render(<App items={items([
    'a',
    'b',
    'c',
    'd',
    'e',
    'f'
  ])} />);

  rerender(<App items={items([
    'b',
    'foo',
    'e'
  ])} onUpdate={onUpdate} />);

  expect(onUpdate).toHaveBeenCalledTimes(7);

  [
    'a',
    'b',
    'foo',
    'c', 'd',
    'e',
    'f'
  ].forEach(function (key, index) {
    expect(onUpdate.mock.calls[index][0].key).toBe(key);
  });
});

it('calls onUpdate in correct order', () => {
  const onUpdate = jest.fn();

  const { rerender } = render(<App items={items([
    'a',
  ])} />);

  rerender(<App items={items([
    'b',
    'a'
  ])} />);

  rerender(<App items={items([
    'c',
    'b',
    'a',
  ])} onUpdate={onUpdate} />);

  expect(onUpdate).toHaveBeenCalledTimes(3);

  ['c', 'b', 'a'].forEach((key, index) => {
    expect(onUpdate.mock.calls[index][0].key).toBe(key);
  });
});

it('removes children', () => {
  const { container } = render(<App items={items(['a', 'b', 'c'])} />);

  fireEvent.click(container.querySelector('[data-testkey="b"] button'));

  const nodes = container.firstChild.childNodes;

  expect(nodes.length).toEqual(2);

  ['a', 'c'].forEach(function (key, index) {
    expect(nodes[index].dataset.testkey).toBe(key);
  });
});

it('uses custom getKey function', () => {
  const { container, rerender } = render(<App
    getKey={item => item.foo}
    items={[{ foo: 'a' }]}
  />);

  expect(container.firstChild.childNodes[0].dataset.testkey).toBe('a');

  rerender(<App
    getKey={item => item.foo}
    items={[
      { foo: 'a' },
      { foo: 'b'}
    ]}
  />);

  expect(container.firstChild.childNodes[0].dataset.testkey).toBe('a');
  expect(container.firstChild.childNodes[1].dataset.testkey).toBe('b');
});
