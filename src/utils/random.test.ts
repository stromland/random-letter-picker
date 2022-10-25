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
});
