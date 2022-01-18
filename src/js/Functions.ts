export const elementsColliding = (div1: HTMLElement, div2: HTMLElement): boolean => {
  const d1 = div1.getBoundingClientRect();
  const d2 = div2.getBoundingClientRect();

  return !(
    d1.bottom < d2.top || d1.top > d2.bottom || d1.right < d2.left || d1.left > d2.right ||
    d2.bottom < d1.top || d2.top > d1.bottom || d2.right < d1.left || d2.left > d1.right
  );
};

export const getDistance = (div1: HTMLElement, div2: HTMLElement): number => {
  const d1 = div1.getBoundingClientRect();
  const d2 = div2.getBoundingClientRect();

  const d1minX = d1.x;
  const d1maxX = d1.x + d1.width;
  const d2minX = d2.x;
  const d2maxX = d2.x + d2.width;

  if (d1maxX < d2minX) {
    return d2minX - d1maxX;
  }

  if (d1minX > d2maxX) {
    return -(d1minX - d2maxX);
  }

  return 0;
};

export const shuffleArray = (arr: Array<any>): Array<any> => {
  const len = arr.length;
  for (let i = 0; i < arr.length * 2; i++) {
    const j = Math.floor(Math.random() * len);
    [arr[i % len], arr[j]] = [arr[j], arr[i % len]];
  }
  return arr;
};
