export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max + 1 - min) + min);
}

export function getRandomIndexAndWait(
  onIndex: (index: number) => void,
  onLast: (isLast: boolean) => void,
  minIndex: number,
  maxIndex: number,
  allowedFinalIndexes?: number[],
  minNumberOfRounds: number = 4,
  maxNumberOfRounds: number = 7,
  waitDuration: number = 4000
) {
  // Guard against invalid range
  if (maxIndex < minIndex) {
    console.warn('getRandomIndexAndWait called with invalid range: maxIndex < minIndex');
    return;
  }

  let selectedIndexes: Set<number> = new Set();
  const numberOfRounds = getRandomInt(minNumberOfRounds, maxNumberOfRounds);
  const numberOfIndexes = maxIndex - minIndex + 1;

  // First round
  const first = getRandomInt(minIndex, maxIndex);
  selectedIndexes.add(first);
  onIndex(first);

  let rounds = 1;

  // Next rounds
  const inter = setInterval(() => {
    const isLastRound = rounds + 1 === numberOfRounds;

    // If all letters have been shown, reset the set to allow repeats
    if (selectedIndexes.size === numberOfIndexes) {
      selectedIndexes = new Set();
    }

    let next: number;

    if (isLastRound && allowedFinalIndexes && allowedFinalIndexes.length > 0) {
      // Final round: pick from allowed indexes only
      const availableFinalIndexes = allowedFinalIndexes.filter(
        (idx) => !selectedIndexes.has(idx)
      );
      // If all allowed have been shown, pick from all allowed
      const pickFrom = availableFinalIndexes.length > 0 ? availableFinalIndexes : allowedFinalIndexes;
      next = pickFrom[getRandomInt(0, pickFrom.length - 1)];
    } else if (isLastRound && allowedFinalIndexes && allowedFinalIndexes.length === 0) {
      // Guard: if allowedFinalIndexes is provided but empty, log warning and pick from all
      console.warn('allowedFinalIndexes is empty. Falling back to random selection from all indexes.');
      do {
        next = getRandomInt(minIndex, maxIndex);
      } while (selectedIndexes.has(next));
    } else {
      // Regular round: pick from all indexes
      do {
        next = getRandomInt(minIndex, maxIndex);
      } while (selectedIndexes.has(next));
    }

    selectedIndexes.add(next);

    onIndex(next);
    if (++rounds === numberOfRounds) {
      setTimeout(() => onLast(true), waitDuration / 2);
      clearInterval(inter);
    }
  }, waitDuration);
}
