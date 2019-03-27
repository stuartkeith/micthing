export function getRandomNumber(min, max) {
  return min + ((max - min + 1) * Math.random());
}

export function shuffleArray(array) {
  let m = array.length;

  while (m) {
    let i = Math.floor(Math.random() * m--);
    let t = array[m];

    array[m] = array[i];
    array[i] = t;
  }

  return array;
}
