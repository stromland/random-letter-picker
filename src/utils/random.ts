export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max + 1 - min) + min);
}

export function getRandomIndexAndWait(
  onIndex: (index: number) => void,
  onLast: (isLast: boolean) => void,
  minIndex: number,
  maxIndex: number,
  minNumberOfRounds: number = 4,
  maxNumberOfRounds: number = 7,
  waitDuration: number = 4000
) {
  // Guard against invalid range
  if (maxIndex < minIndex) {
    console.warn('getRandomIndexAndWait called with invalid range: maxIndex < minIndex');
    return;
  }

  const selectedIndexes: Set<number> = new Set();
  const numberOfRounds = getRandomInt(minNumberOfRounds, maxNumberOfRounds);

  // First round
  const first = getRandomInt(minIndex, maxIndex);
  selectedIndexes.add(first);
  onIndex(first);

  const numberOfIndexes = maxIndex - minIndex + 1;
  let rounds = 1;

  let hasSelectedAll = numberOfIndexes === 0;

  // Next rounds
  const inter = setInterval(() => {
    let next: number | undefined;
    do {
      next = getRandomInt(minIndex, maxIndex);
    } while (selectedIndexes.has(next) && !hasSelectedAll);

    selectedIndexes.add(next);
    hasSelectedAll = selectedIndexes.size === numberOfIndexes;

    onIndex(next);
    if (++rounds === numberOfRounds || hasSelectedAll) {
      setTimeout(() => onLast(true), waitDuration / 2);
      clearInterval(inter);
    }
  }, waitDuration);
}
