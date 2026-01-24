import { act, fireEvent, render, screen } from "@testing-library/react";
import confetti from "canvas-confetti";
import { vi } from "vitest";
import { letterSettings } from "../letters";
import { classnames, LetterCarousel } from "./LetterCarousel";

// Mock canvas-confetti since jsdom doesn't support canvas context
vi.mock("canvas-confetti", () => ({
  default: vi.fn(),
}));

describe("LetterCarousel", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    window.localStorage.clear();
  });

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

  it("should trigger confetti celebration when final letter is revealed", () => {
    vi.useFakeTimers();
    const confettiMock = vi.mocked(confetti);

    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0) // 4 rounds
      .mockReturnValueOnce(0) // first letter
      .mockReturnValueOnce(0.1) // second letter
      .mockReturnValueOnce(0.2) // third letter
      .mockReturnValueOnce(0.3) // fourth (final) letter
      .mockReturnValue(0.5);

    render(<LetterCarousel letters={letterSettings} />);
    fireEvent.click(screen.getByText("Start"));

    // Advance through all rounds
    for (let i = 0; i < 4; i++) {
      act(() => {
        vi.advanceTimersToNextTimer();
      });
      act(() => {
        vi.advanceTimersToNextTimer();
      });
    }

    // After half duration timeout, isLast becomes true and confetti fires
    act(() => {
      vi.advanceTimersToNextTimer();
    });

    // Verify confetti was called
    expect(confettiMock).toHaveBeenCalled();
    expect(confettiMock).toHaveBeenCalledWith(
      expect.objectContaining({
        particleCount: 3,
        angle: expect.any(Number),
        spread: 50,
        ticks: 150,
        origin: expect.objectContaining({ y: 0.6 }),
      })
    );
  });

  it("should automatically disable the picked letter after selection", () => {
    vi.useFakeTimers();

    // Set up explicit random sequence to ensure we know which letter gets picked
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0) // 4 rounds
      .mockReturnValueOnce(0) // first letter: A (index 2)
      .mockReturnValueOnce(0.1) // second letter: C (index 4)
      .mockReturnValueOnce(0.2) // third letter: F (index 7)
      .mockReturnValueOnce(0) // fourth (final): pick from allowedFinalIndexes, first available
      .mockReturnValue(0.5);

    render(<LetterCarousel letters={letterSettings} />);
    fireEvent.click(screen.getByText("Start"));

    // Advance through all rounds
    for (let i = 0; i < 4; i++) {
      act(() => {
        vi.advanceTimersToNextTimer();
      });
      act(() => {
        vi.advanceTimersToNextTimer();
      });
    }

    // After half duration timeout, isLast becomes true and letter is disabled
    act(() => {
      vi.advanceTimersToNextTimer();
    });

    // Check localStorage to verify a letter is now disabled
    const stored = window.localStorage.getItem("letters");
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    
    // Verify that exactly one letter is disabled (28 enabled out of 29)
    const enabledCount = Object.values(parsed).filter(Boolean).length;
    expect(enabledCount).toBe(28);
    
    // Verify at least one letter is disabled
    const disabledLetters = Object.entries(parsed).filter(([_, enabled]) => !enabled);
    expect(disabledLetters.length).toBe(1);
  });

  it("should reset all letters to enabled when the last letter is picked", () => {
    vi.useFakeTimers();

    // Start with only one letter enabled
    const singleLetterEnabled = Object.keys(letterSettings).reduce(
      (acc, key) => ({ ...acc, [key]: key === "A" }),
      {} as Record<string, boolean>
    );

    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0) // 4 rounds
      .mockReturnValueOnce(0) // first letter: A
      .mockReturnValueOnce(0.1) // second letter
      .mockReturnValueOnce(0.2) // third letter
      .mockReturnValueOnce(0) // fourth (final) letter: A
      .mockReturnValue(0.5);

    render(<LetterCarousel letters={singleLetterEnabled} />);
    fireEvent.click(screen.getByText("Start"));

    // Advance through all rounds
    for (let i = 0; i < 4; i++) {
      act(() => {
        vi.advanceTimersToNextTimer();
      });
      act(() => {
        vi.advanceTimersToNextTimer();
      });
    }

    // After half duration timeout, all letters should be reset
    act(() => {
      vi.advanceTimersToNextTimer();
    });

    // Check localStorage to verify all letters are enabled
    const stored = window.localStorage.getItem("letters");
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    Object.values(parsed).forEach((value) => {
      expect(value).toBe(true);
    });
  });

  it("should clean up confetti animation on unmount", () => {
    vi.useFakeTimers();
    const cancelAnimationFrameSpy = vi.spyOn(window, "cancelAnimationFrame");

    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0) // 4 rounds
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0.2)
      .mockReturnValueOnce(0.3)
      .mockReturnValue(0.5);

    const { unmount } = render(<LetterCarousel letters={letterSettings} />);
    fireEvent.click(screen.getByText("Start"));

    // Advance through all rounds to trigger confetti
    for (let i = 0; i < 4; i++) {
      act(() => {
        vi.advanceTimersToNextTimer();
      });
      act(() => {
        vi.advanceTimersToNextTimer();
      });
    }

    act(() => {
      vi.advanceTimersToNextTimer();
    });

    // Unmount while confetti might still be animating
    unmount();

    // cancelAnimationFrame should be called during cleanup
    expect(cancelAnimationFrameSpy).toHaveBeenCalled();
  });
});
