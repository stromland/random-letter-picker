import { useCallback, useState } from "react";
import { Button, Carousel } from "react-bootstrap";
import { getRandomIndexAndWait } from "../../utils/random";
import styles from "./LetterCarousel.module.css";
import { SettingsForm } from "../Settings/SettingsForm";
import { useLocalStorage } from "./useLocalStorage";

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
  const storage = useLocalStorage(props.letters);

  const letters = Object.entries(storage.letters)
    .filter(([, active]) => active)
    .map(([letter]) => letter);

  const start = useCallback(() => {
    setIsLast(false);
    getRandomIndexAndWait(
      setSelectedIndex,
      setIsLast,
      indexes.letterStart,
      indexes.letterStart + letters.length - 1
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
      {letters.map((it) => (
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
