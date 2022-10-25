import React, { useCallback, useEffect, useState } from "react";
import { Button, Carousel } from "react-bootstrap";
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

function useLocalStorage(init: Record<string, boolean>) {
  const LETTERS_KEY = "letters";
  const [letters, setLetters] = useState<Record<string, boolean>>({});

  const save = useCallback((data: Record<string, boolean>) => {
    const strData = JSON.stringify(data);
    window.localStorage.setItem(LETTERS_KEY, strData);
    setLetters(data);
  }, []);

  useEffect(() => {
    const data = window.localStorage.getItem(LETTERS_KEY);
    if (data) {
      const parsed: Record<string, boolean> = JSON.parse(data);
      setLetters(parsed);
    } else {
      save(init);
      setLetters(init);
    }
  }, [init, save]);

  const hasBeenSaved = Object.keys(letters).length > 0;

  return { letters, save, hasBeenSaved };
}

export function LetterCarousel(props: LetterCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(indexes.start);
  const [isLast, setIsLast] = useState(false);
  const storage = useLocalStorage(props.letters);

  const letters = Object.entries(storage.letters)
    .filter(([, active]) => active)
    .map(([letter]) => letter);

  const start = useCallback(() => {
    setIsLast(false);
    const maxIndex = letters.length - 1;
    getRandomIndexAndWait(
      setSelectedIndex,
      setIsLast,
      indexes.letterStart,
      maxIndex + indexes.letterStart
    );
  }, [letters.length]);

  return (
    <Carousel
      activeIndex={selectedIndex ?? letters.length}
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
            letters={storage.letters}
            onAbort={() => setSelectedIndex(indexes.start)}
            onSave={(options) => {
              storage.save(options.letters);
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
      {letters.map((it, index) => (
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
