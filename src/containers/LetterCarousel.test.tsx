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

  it("should render and cycle through letters ending with isLast=true", () => {
    vi.useFakeTimers();
    // Provide distinct random values to avoid infinite loops
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0) // 4 rounds
      .mockReturnValueOnce(0) // first letter: A
      .mockReturnValueOnce(0.1) // second letter: C
      .mockReturnValueOnce(0.2) // third letter: F
      .mockReturnValueOnce(0.3) // fourth (final) letter: from allowedFinalIndexes
      .mockReturnValue(0.5); // fallback for any other calls

    render(<LetterCarousel letters={letterSettings} />);

    expect(screen.getByText("Start")).toBeEnabled();
    fireEvent.click(screen.getByText("Start"));

    // First letter - A - shown immediately
    act(() => {
      vi.advanceTimersToNextTimer();
    });
    act(() => {
      vi.advanceTimersToNextTimer();
    });
    expect(screen.getByTestId("carousel-item-A")).toHaveClass("active");
    expect(screen.getByTestId("carousel-item-A-wrapper")).toHaveClass(
      classnames.option(false),
    );

    // Advance through remaining rounds
    for (let i = 0; i < 3; i++) {
      act(() => {
        vi.advanceTimersToNextTimer();
      });
      act(() => {
        vi.advanceTimersToNextTimer();
      });
    }

    // After half duration timeout, isLast becomes true
    act(() => {
      vi.advanceTimersToNextTimer();
    });

    // Find the active carousel item and verify it has the selected class
    const activeItems = document.querySelectorAll(".carousel-item.active");
    expect(activeItems.length).toBe(1);

    // The wrapper inside should have the "selected" class (isLast=true)
    const wrapper = activeItems[0].querySelector('[data-testid$="-wrapper"]');
    expect(wrapper).toHaveClass(classnames.option(true));
  });
});
