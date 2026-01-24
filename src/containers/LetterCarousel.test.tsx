import { act, fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { letterSettings } from "../letters";
import { classnames, LetterCarousel } from "./LetterCarousel";

// Mock canvas-confetti since jsdom doesn't support canvas context
vi.mock("canvas-confetti", () => ({
  default: vi.fn(),
}));

describe("LetterCarousel", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should render", () => {
    vi.useFakeTimers();
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0.01) // 4 rounds
      .mockReturnValueOnce(0.01) // first - A
      .mockReturnValueOnce(0.3) // second - I
      .mockReturnValueOnce(0.4) // third - L
      .mockReturnValueOnce(0.2); // fourth - F

    render(<LetterCarousel letters={letterSettings} />);

    expect(screen.getByText("Start")).toBeEnabled();
    fireEvent.click(screen.getByText("Start"));

    act(() => {
      vi.advanceTimersToNextTimer();
    });
    act(() => {
      vi.advanceTimersToNextTimer();
    });
    expect(screen.getByTestId("carousel-item-A")).toHaveClass("active");
    expect(screen.getByTestId("carousel-item-A-wrapper")).toHaveClass(
      classnames.option(false)
    );

    act(() => {
      vi.advanceTimersToNextTimer();
    });
    act(() => {
      vi.advanceTimersToNextTimer();
    });
    expect(screen.getByTestId("carousel-item-I")).toHaveClass("active");
    expect(screen.getByTestId("carousel-item-I-wrapper")).toHaveClass(
      classnames.option(false)
    );

    act(() => {
      vi.advanceTimersToNextTimer();
    });
    act(() => {
      vi.advanceTimersToNextTimer();
    });
    expect(screen.getByTestId("carousel-item-L")).toHaveClass("active");
    expect(screen.getByTestId("carousel-item-L-wrapper")).toHaveClass(
      classnames.option(false)
    );

    act(() => {
      vi.advanceTimersToNextTimer();
    });
    act(() => {
      vi.advanceTimersToNextTimer();
    });
    expect(screen.getByTestId("carousel-item-F")).toHaveClass("active");

    act(() => {
      vi.advanceTimersToNextTimer();
    });
    expect(screen.getByTestId("carousel-item-F-wrapper")).toHaveClass(
      classnames.option(true)
    );
  });
});
