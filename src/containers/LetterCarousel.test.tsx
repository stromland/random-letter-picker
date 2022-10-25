import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { letterSettings } from "../letters";
import { classnames, LetterCarousel } from "./LetterCarousel";

describe("LetterCarousel", () => {
  afterEach(() => {
    jest.spyOn(Math, "random").mockRestore();
  });
  it("should render", async () => {
    jest.useFakeTimers();
    jest
      .spyOn(Math, "random")
      .mockReturnValueOnce(0.01) // 4 rounds
      .mockReturnValueOnce(0.01) // first - A
      .mockReturnValueOnce(0.3) // second - I
      .mockReturnValueOnce(0.4) // third - L
      .mockReturnValueOnce(0.2); // fourth - F
    render(<LetterCarousel letters={letterSettings} />);

    expect(screen.getByText("Start")).toBeEnabled();
    userEvent.click(screen.getByText("Start"));

    act(jest.advanceTimersToNextTimer);
    act(jest.advanceTimersToNextTimer);
    expect(screen.getByTestId("carousel-item-A")).toHaveClass("active");
    expect(screen.getByTestId("carousel-item-A-wrapper")).toHaveClass(
      classnames.option(false)
    );

    act(jest.advanceTimersToNextTimer);
    act(jest.advanceTimersToNextTimer);
    expect(screen.getByTestId("carousel-item-I")).toHaveClass("active");
    expect(screen.getByTestId("carousel-item-I-wrapper")).toHaveClass(
      classnames.option(false)
    );

    act(jest.advanceTimersToNextTimer);
    act(jest.advanceTimersToNextTimer);
    expect(screen.getByTestId("carousel-item-L")).toHaveClass("active");
    expect(screen.getByTestId("carousel-item-L-wrapper")).toHaveClass(
      classnames.option(false)
    );

    act(jest.advanceTimersToNextTimer);
    act(jest.advanceTimersToNextTimer);
    expect(screen.getByTestId("carousel-item-F")).toHaveClass("active");

    act(jest.advanceTimersToNextTimer);
    expect(screen.getByTestId("carousel-item-F-wrapper")).toHaveClass(
      classnames.option(true)
    );
  });
});
