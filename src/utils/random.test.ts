import { vi } from "vitest";
import * as random from "./random";

describe("getRandomInt", () => {
  afterEach(() => {
    vi.spyOn(Math, "random").mockRestore();
  });
  it("should get a random number", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const num = random.getRandomInt(0, 10);
    expect(num).toBe(5);
  });

  it("should get min random number", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.09);
    const num = random.getRandomInt(0, 10);
    expect(num).toBe(0);
  });

  it("should get max random number", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    const num = random.getRandomInt(0, 10);
    expect(num).toBe(10);
  });
});

describe("getRandomIndexAndWait", () => {
  afterEach(() => {
    vi.spyOn(Math, "random").mockRestore();
  });

  it("should cycle 3 rounds", () => {
    vi.useFakeTimers();

    const randomMock = vi
      .spyOn(Math, "random")
      .mockReturnValueOnce(0.3) // Three rounds
      .mockReturnValueOnce(0.5) // First round
      .mockReturnValueOnce(0.7) // Second round
      .mockReturnValueOnce(0.2); // Third round

    const onIndex = vi.fn();
    const onLast = vi.fn();

    const minIndex = 0;
    const maxIndex = 10;
    const minRounds = 0;
    const maxRounds = 10;
    const waitDuration = 1000;

    random.getRandomIndexAndWait(
      onIndex,
      onLast,
      minIndex,
      maxIndex,
      undefined, // allowedFinalIndexes
      minRounds,
      maxRounds,
      waitDuration
    );
    // Get rounds and first index/round
    expect(randomMock).toHaveBeenCalledTimes(2);
    expect(onIndex).toHaveBeenCalledWith(5);

    // Second index/round
    vi.advanceTimersToNextTimer();
    expect(randomMock).toHaveBeenCalledTimes(3);
    expect(onIndex).toHaveBeenCalledWith(7);

    // Third index/round
    vi.advanceTimersToNextTimer();
    expect(randomMock).toHaveBeenCalledTimes(4);
    expect(onIndex).toHaveBeenCalledWith(2);

    // Wait half duration to call onLast
    const halfDuration = waitDuration / 2;
    vi.advanceTimersByTime(halfDuration - 100);
    expect(onLast).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(onLast).toHaveBeenCalled();
  });

  it("should return early when maxIndex < minIndex (invalid range)", () => {
    vi.useFakeTimers();
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const onIndex = vi.fn();
    const onLast = vi.fn();

    random.getRandomIndexAndWait(
      onIndex,
      onLast,
      5, // minIndex
      2, // maxIndex (invalid: less than minIndex)
      undefined, // allowedFinalIndexes
      4,
      7,
      1000
    );

    // Should not call any callbacks
    expect(onIndex).not.toHaveBeenCalled();
    expect(onLast).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      "getRandomIndexAndWait called with invalid range: maxIndex < minIndex"
    );

    // Advance timers to ensure no intervals are running
    vi.advanceTimersByTime(10000);
    expect(onIndex).not.toHaveBeenCalled();
    expect(onLast).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("should complete after 2 rounds when numberOfRounds is 2", () => {
    vi.useFakeTimers();

    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0) // numberOfRounds = 2 (getRandomInt(2, 2) = 2)
      .mockReturnValueOnce(0.5) // First index = 5
      .mockReturnValueOnce(0.7); // Second index = 7

    const onIndex = vi.fn();
    const onLast = vi.fn();

    random.getRandomIndexAndWait(
      onIndex,
      onLast,
      0,
      10,
      undefined, // allowedFinalIndexes
      2, // minNumberOfRounds
      2, // maxNumberOfRounds
      1000
    );

    // First round is called immediately (rounds = 1)
    expect(onIndex).toHaveBeenCalledTimes(1);
    expect(onIndex).toHaveBeenCalledWith(5);

    // After first interval: ++rounds becomes 2, matches numberOfRounds (2), stops
    vi.advanceTimersToNextTimer();
    expect(onIndex).toHaveBeenCalledTimes(2);
    expect(onIndex).toHaveBeenCalledWith(7);

    // Should call onLast after half duration (500ms)
    vi.advanceTimersByTime(500);
    expect(onLast).toHaveBeenCalledWith(true);
  });

  it("should allow repeats when all indexes have been selected", () => {
    vi.useFakeTimers();

    // With only 3 possible indexes (0, 1, 2), after selecting all, it should reset and allow repeats
    // getRandomInt(4, 7) with Math.random = 0: result = floor(0 * 4 + 4) = 4 rounds
    // getRandomInt(0, 2) with Math.random values:
    // 0 -> 0, 0.4 -> 1, 0.9 -> 2
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0) // numberOfRounds = 4
      .mockReturnValueOnce(0) // First index: 0
      .mockReturnValueOnce(0.4) // Second index: 1
      .mockReturnValueOnce(0.9) // Third index: 2 (all selected, set resets)
      .mockReturnValueOnce(0); // Fourth index: 0 (repeat allowed)

    const onIndex = vi.fn();
    const onLast = vi.fn();

    random.getRandomIndexAndWait(
      onIndex,
      onLast,
      0,
      2, // Only 3 possible indexes: 0, 1, 2
      undefined, // allowedFinalIndexes
      4, // minNumberOfRounds
      7, // maxNumberOfRounds
      1000
    );

    // First round (rounds = 1)
    expect(onIndex).toHaveBeenCalledTimes(1);
    expect(onIndex).toHaveBeenCalledWith(0);

    // Second round (rounds = 2)
    vi.advanceTimersByTime(1000);
    expect(onIndex).toHaveBeenCalledTimes(2);
    expect(onIndex).toHaveBeenCalledWith(1);

    // Third round (rounds = 3) - all selected, set resets for next round
    vi.advanceTimersByTime(1000);
    expect(onIndex).toHaveBeenCalledTimes(3);
    expect(onIndex).toHaveBeenCalledWith(2);

    // Fourth round (rounds = 4) - repeat allowed after reset, completes at numberOfRounds
    vi.advanceTimersByTime(1000);
    expect(onIndex).toHaveBeenCalledTimes(4);
    expect(onIndex).toHaveBeenCalledWith(0);

    // Should call onLast after half duration (500ms)
    vi.advanceTimersByTime(500);
    expect(onLast).toHaveBeenCalledWith(true);

    // No more callbacks after this
    vi.advanceTimersByTime(5000);
    expect(onIndex).toHaveBeenCalledTimes(4);
  });

  it("should pick final round from allowedFinalIndexes only", () => {
    vi.useFakeTimers();

    // 10 possible indexes (0-9), but only indexes 2, 5, 8 are allowed for final pick
    // With 3 rounds, the final (3rd) round should pick from [2, 5, 8]
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0) // numberOfRounds = 3
      .mockReturnValueOnce(0) // First index: 0
      .mockReturnValueOnce(0.3) // Second index: 3
      .mockReturnValueOnce(0.5); // Third (final) index: picks from [2, 5, 8], index 1 = 5

    const onIndex = vi.fn();
    const onLast = vi.fn();

    random.getRandomIndexAndWait(
      onIndex,
      onLast,
      0,
      9, // 10 possible indexes: 0-9
      [2, 5, 8], // allowedFinalIndexes
      3, // minNumberOfRounds
      3, // maxNumberOfRounds
      1000
    );

    // First round (rounds = 1)
    expect(onIndex).toHaveBeenCalledTimes(1);
    expect(onIndex).toHaveBeenCalledWith(0);

    // Second round (rounds = 2)
    vi.advanceTimersByTime(1000);
    expect(onIndex).toHaveBeenCalledTimes(2);
    expect(onIndex).toHaveBeenCalledWith(3);

    // Third (final) round - should pick from allowedFinalIndexes [2, 5, 8]
    // With random 0.5 and pickFrom.length = 3: getRandomInt(0, 2) = floor(0.5 * 3) = 1 -> index 5
    vi.advanceTimersByTime(1000);
    expect(onIndex).toHaveBeenCalledTimes(3);
    expect(onIndex).toHaveBeenCalledWith(5);

    // Should call onLast after half duration (500ms)
    vi.advanceTimersByTime(500);
    expect(onLast).toHaveBeenCalledWith(true);
  });
});
