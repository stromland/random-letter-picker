import * as random from "./random";
describe("getRandomInt", () => {
  afterEach(() => {
    jest.spyOn(Math, "random").mockRestore();
  });
  it("should get a random number", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.5);
    const num = random.getRandomInt(0, 10);
    expect(num).toBe(5);
  });

  it("should get min random number", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.09);
    const num = random.getRandomInt(0, 10);
    expect(num).toBe(0);
  });

  it("should get max random number", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.99);
    const num = random.getRandomInt(0, 10);
    expect(num).toBe(10);
  });
});

describe("getRandomIndexAndWait", () => {
  afterEach(() => {
    jest.spyOn(Math, "random").mockRestore();
  });

  it("should cycle 3 rounds", () => {
    jest.useFakeTimers();

    const randomMock = jest
      .spyOn(Math, "random")
      .mockReturnValueOnce(0.3) // Three rounds
      .mockReturnValueOnce(0.5) // First round
      .mockReturnValueOnce(0.7) // Second round
      .mockReturnValueOnce(0.2); // Third round

    const onIndex = jest.fn();
    const onLast = jest.fn();

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
      minRounds,
      maxRounds,
      waitDuration
    );
    // Get rounds and first index/round
    expect(randomMock).toHaveBeenCalledTimes(2);
    expect(onIndex).toHaveBeenCalledWith(5);

    // Second index/round
    jest.advanceTimersToNextTimer();
    expect(randomMock).toHaveBeenCalledTimes(3);
    expect(onIndex).toHaveBeenCalledWith(7);

    // Third index/round
    jest.advanceTimersToNextTimer();
    expect(randomMock).toHaveBeenCalledTimes(4);
    expect(onIndex).toHaveBeenCalledWith(2);

    // Wait half duraiton to call onLast
    const halfDuration = waitDuration / 2;
    jest.advanceTimersByTime(halfDuration - 100);
    expect(onLast).not.toHaveBeenCalled();
    jest.advanceTimersByTime(100);
    expect(onLast).toHaveBeenCalled();
  });

  it("should return early when maxIndex < minIndex (invalid range)", () => {
    jest.useFakeTimers();
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

    const onIndex = jest.fn();
    const onLast = jest.fn();

    random.getRandomIndexAndWait(
      onIndex,
      onLast,
      5, // minIndex
      2, // maxIndex (invalid: less than minIndex)
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
    jest.advanceTimersByTime(10000);
    expect(onIndex).not.toHaveBeenCalled();
    expect(onLast).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("should complete after 2 rounds when numberOfRounds is 2", () => {
    jest.useFakeTimers();

    jest
      .spyOn(Math, "random")
      .mockReturnValueOnce(0) // numberOfRounds = 2 (getRandomInt(2, 2) = 2)
      .mockReturnValueOnce(0.5) // First index = 5
      .mockReturnValueOnce(0.7); // Second index = 7

    const onIndex = jest.fn();
    const onLast = jest.fn();

    random.getRandomIndexAndWait(
      onIndex,
      onLast,
      0,
      10,
      2, // minNumberOfRounds
      2, // maxNumberOfRounds
      1000
    );

    // First round is called immediately (rounds = 1)
    expect(onIndex).toHaveBeenCalledTimes(1);
    expect(onIndex).toHaveBeenCalledWith(5);

    // After first interval: ++rounds becomes 2, matches numberOfRounds (2), stops
    jest.advanceTimersToNextTimer();
    expect(onIndex).toHaveBeenCalledTimes(2);
    expect(onIndex).toHaveBeenCalledWith(7);

    // Should call onLast after half duration (500ms)
    jest.advanceTimersByTime(500);
    expect(onLast).toHaveBeenCalledWith(true);
  });

  it("should stop early when all indexes have been selected", () => {
    jest.useFakeTimers();

    // With only 3 possible indexes (0, 1, 2), selecting all should stop early
    // getRandomInt(0, 2) with Math.random values:
    // 0 -> 0, 0.33 -> 1, 0.66 -> 2
    jest
      .spyOn(Math, "random")
      .mockReturnValueOnce(0.9) // numberOfRounds = 7 (high, more than available indexes)
      .mockReturnValueOnce(0) // First index: 0
      .mockReturnValueOnce(0.4) // Second index: 1
      .mockReturnValueOnce(0.9); // Third index: 2

    const onIndex = jest.fn();
    const onLast = jest.fn();

    random.getRandomIndexAndWait(
      onIndex,
      onLast,
      0,
      2, // Only 3 possible indexes: 0, 1, 2
      4, // minNumberOfRounds (more than available indexes)
      7, // maxNumberOfRounds
      1000
    );

    // First round (rounds = 1)
    expect(onIndex).toHaveBeenCalledTimes(1);
    expect(onIndex).toHaveBeenCalledWith(0);

    // Second round (rounds = 2)
    jest.advanceTimersByTime(1000);
    expect(onIndex).toHaveBeenCalledTimes(2);
    expect(onIndex).toHaveBeenCalledWith(1);

    // Third round - should trigger hasSelectedAll and stop (rounds = 3)
    jest.advanceTimersByTime(1000);
    expect(onIndex).toHaveBeenCalledTimes(3);
    expect(onIndex).toHaveBeenCalledWith(2);

    // Should call onLast after half duration (500ms)
    jest.advanceTimersByTime(500);
    expect(onLast).toHaveBeenCalledWith(true);

    // No more callbacks after this
    jest.advanceTimersByTime(5000);
    expect(onIndex).toHaveBeenCalledTimes(3);
  });
});
