export const elementsColliding = (div1: HTMLElement, div2: HTMLElement): boolean => {
  const d1 = div1.getBoundingClientRect();
  const d2 = div2.getBoundingClientRect();

  return !(d1.bottom < d2.top || d1.top > d2.bottom || d1.right < d2.left || d1.left > d2.right);
};

export const getDistance = (div1: HTMLElement, div2: HTMLElement): number => {
  const d1 = div1.getBoundingClientRect();
  const d2 = div2.getBoundingClientRect();

  const distX = Math.abs(d1.x - d2.x);
  const distY = Math.abs(d1.y - d2.y);

  return distX + distY;
};

export const shuffleArray = (arr: Array<any>): Array<any> => {
  const len = arr.length;
  for (let i = 0; i < arr.length * 2; i++) {
    const j = Math.floor(Math.random() * len);
    [arr[i % len], arr[j]] = [arr[j], arr[i % len]];
  }
  return arr;
};
