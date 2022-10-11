import React, { useCallback, useState } from "react";
import { Button, Carousel } from "react-bootstrap";
import { getRandomIndexAndWait } from "../utils/random";

export const colors = {
  green: "#697F3F",
  red: "#C4502A",
  start: "#F0E6C8",
};

type LetterCarouselProps = {
  letters: string[];
};

export function LetterCarousel({ letters }: LetterCarouselProps) {
  const [index, setIndex] = useState<number>();
  const [isLast, setIsLast] = useState(false);

  const start = useCallback(() => {
    const maxIndex = letters.length - 1;
    getRandomIndexAndWait(setIndex, setIsLast, maxIndex);
  }, [letters.length]);

  return (
    <Carousel
      activeIndex={index ?? letters.length}
      interval={null}
      indicators={false}
      controls={false}
    >
      {letters.map((it) => (
        <Carousel.Item key={it}>
          <div style={getItemStyle(isLast ? colors.green : colors.red)}>
            <h1 style={{ fontSize: "15rem" }}>{it}</h1>
          </div>
        </Carousel.Item>
      ))}
      <Carousel.Item>
        <div style={getItemStyle(colors.start)}>
          <Button style={{ fontSize: "5rem" }} onClick={start}>
            Start
          </Button>
        </div>
      </Carousel.Item>
    </Carousel>
  );
}

function getItemStyle(background: string): React.CSSProperties {
  return {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    background,
  };
}
