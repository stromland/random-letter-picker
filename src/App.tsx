import React, { useState } from "react";
import { Button, Carousel } from "react-bootstrap";
import "./App.css";
import { letters } from "./letters";

function getRandomIndex(
  onIndex: (index: number) => void,
  onLast: () => void,
  maxIndex: number = 29,
  numberOfRounds: number = 5,
  displayTime: number = 4000
) {
  const selectedIndexes: Set<number> = new Set();

  const first = Math.floor(Math.random() * maxIndex);
  selectedIndexes.add(first);
  onIndex(first);

  let rounds = 0;

  const inter = setInterval(() => {
    let next: number | undefined;
    do {
      next = Math.floor(Math.random() * maxIndex);
    } while (selectedIndexes.has(next));

    selectedIndexes.add(next);

    onIndex(next);
    if (++rounds === numberOfRounds) {
      setTimeout(() => onLast(), displayTime / 2);
      clearInterval(inter);
    }
  }, displayTime);
}

function App() {
  return (
    <div className="App">
      <Letters />
    </div>
  );
}

function Letters() {
  const [index, setIndex] = useState<number>();
  const [isLast, setIsLast] = useState(false);
  return (
    <Carousel
      interval={null}
      activeIndex={index ?? 29}
      indicators={false}
      controls={false}
    >
      {letters.map((it) => (
        <Carousel.Item key={it}>
          <div
            style={{
              height: "100vh",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              background: isLast ? "#697F3F" : "#C4502A",
            }}
          >
            <h1 style={{ fontSize: "200px" }}>{it}</h1>
          </div>
        </Carousel.Item>
      ))}
      <Carousel.Item>
        <div
          style={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            background: "#F0E6C8",
          }}
        >
          <Button
            style={{ fontSize: "80px" }}
            onClick={() => getRandomIndex(setIndex, () => setIsLast(true))}
          >
            Start
          </Button>
        </div>
      </Carousel.Item>
    </Carousel>
  );
}

export default App;
