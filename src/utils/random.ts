export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max + 1 - min) + min);
}

export function getRandomIndexAndWait(
  onIndex: (index: number) => void,
  onLast: (isLast: boolean) => void,
  maxIndex: number = 28,
  minNumberOfRounds: number = 4,
  maxNumberOfRounds: number = 7,
  waitDuration: number = 4000
) {
  const selectedIndexes: Set<number> = new Set();
  const numberOfRounds = getRandomInt(minNumberOfRounds, maxNumberOfRounds);

  // First round
  const first = getRandomInt(0, maxIndex);
  selectedIndexes.add(first);
  onIndex(first);

  let rounds = 1;

  // Next rounds
  const inter = setInterval(() => {
    let next: number | undefined;
    do {
      next = getRandomInt(0, maxIndex);
    } while (selectedIndexes.has(next));

    selectedIndexes.add(next);

    onIndex(next);
    if (++rounds === numberOfRounds) {
      setTimeout(() => onLast(true), waitDuration / 2);
      clearInterval(inter);
    }
  }, waitDuration);
}
