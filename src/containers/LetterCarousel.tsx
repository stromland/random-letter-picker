import confetti from "canvas-confetti";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Carousel } from "react-bootstrap";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { letters as allLetters } from "../letters";
import { getRandomIndexAndWait } from "../utils/random";
import styles from "./LetterCarousel.module.css";
import { SettingsForm } from "./Settings/SettingsForm";

type LetterCarouselProps = {
  letters: Record<string, boolean>;
};

const indexes = {
  settings: 0,
  start: 1,
  letterStart: 2,
};

export function LetterCarousel(props: LetterCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(indexes.start);
  const [isLast, setIsLast] = useState(false);
  const hasHandledLastRef = useRef(false);
  const storage = useLocalStorage(props.letters);
  const { letters: storageLetters, save: storageSave } = storage;

  // Trigger confetti when final letter is revealed
  useEffect(() => {
    if (isLast && !hasHandledLastRef.current) {
      hasHandledLastRef.current = true;

      // Fire confetti celebration
      const colors = ["#ff6b6b", "#4ecdc4", "#ffe66d", "#95e1d3", "#f38181"];

      confetti({
        particleCount: 80,
        angle: 60,
        spread: 70,
        startVelocity: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 70,
        startVelocity: 55,
        origin: { x: 1, y: 0.7 },
        colors,
      });
    }
  }, [isLast]);

  // Disable the picked letter when final letter is revealed
  useEffect(() => {
    if (!isLast) return;

    const pickedLetterIndex = selectedIndex - indexes.letterStart;
    const pickedLetter = allLetters[pickedLetterIndex];

    if (pickedLetter) {
      const enabledCount = Object.values(storageLetters).filter(Boolean).length;

      if (enabledCount <= 1) {
        // Reset all letters to enabled
        const allEnabled = Object.keys(storageLetters).reduce(
          (acc, key) => ({ ...acc, [key]: true }),
          {} as Record<string, boolean>,
        );
        storageSave(allEnabled);
      } else {
        // Disable the picked letter
        storageSave({
          ...storageLetters,
          [pickedLetter]: false,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLast, selectedIndex]);

  const start = useCallback(() => {
    setIsLast(false);
    hasHandledLastRef.current = false;

    // Get current enabled letter indexes for final pick constraint
    const currentEnabledIndexes = allLetters
      .map((letter, index) =>
        storageLetters[letter] ? index + indexes.letterStart : -1,
      )
      .filter((index) => index !== -1);

    // Guard against empty enabled letters (shouldn't happen due to validation, but handle gracefully)
    if (currentEnabledIndexes.length === 0) {
      console.warn("No enabled letters available. Cannot start letter picker.");
      return;
    }

    const maxIndex = allLetters.length - 1 + indexes.letterStart;
    getRandomIndexAndWait(
      setSelectedIndex,
      setIsLast,
      indexes.letterStart,
      maxIndex,
      currentEnabledIndexes,
    );
  }, [storageLetters]);

  return (
    <Carousel
      activeIndex={selectedIndex ?? allLetters.length}
      interval={null}
      indicators={false}
      controls={false}
    >
      <Carousel.Item>
        <div
          data-testid={`carousel-item-settings`}
          className={classnames.settings}
        >
          <SettingsForm
            letters={storageLetters}
            onAbort={() => setSelectedIndex(indexes.start)}
            onSave={(options) => {
              storageSave(options.letters);
              setSelectedIndex(indexes.start);
            }}
          />
        </div>
      </Carousel.Item>
      <Carousel.Item>
        <div data-testid={`carousel-item-start`} className={classnames.start}>
          <Button style={{ fontSize: "5rem", borderRadius: 0 }} onClick={start}>
            Start
          </Button>
          <Button
            variant="secondary"
            style={{ fontSize: "2rem", borderRadius: 0 }}
            onClick={() => setSelectedIndex(indexes.settings)}
          >
            Innstillinger
          </Button>
        </div>
      </Carousel.Item>
      {allLetters.map((it) => (
        <Carousel.Item data-testid={`carousel-item-${it}`} key={it}>
          <div
            data-testid={`carousel-item-${it}-wrapper`}
            className={classnames.option(isLast)}
          >
            <h1 style={{ fontSize: "15rem" }}>{it}</h1>
            {isLast && (
              <Button
                variant="outline-dark"
                onClick={() => setSelectedIndex(indexes.start)}
              >
                <i className="bi bi-arrow-left"></i>
              </Button>
            )}
          </div>
        </Carousel.Item>
      ))}
    </Carousel>
  );
}

export const classnames = {
  settings: [styles["letter-item"], styles["letter-item-settings"]].join(" "),
  start: [styles["letter-item"], styles["letter-item-start"]].join(" "),
  option: (isLast: boolean) =>
    [
      styles["letter-item"],
      isLast ? styles["letter-item-selected"] : styles["letter-item-option"],
    ].join(" "),
};
