export default function cn(...values) {
  const prefix = ' ';

  let className = '';

  for (let i = 0; i < values.length; i++) {
    const value = values[i];

    if (value) {
      className += (className && prefix) + value;
    }
  }

  return className;
}
