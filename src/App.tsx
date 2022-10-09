import React, { useState } from "react";
import { Button, Carousel } from "react-bootstrap";
import "./App.css";
import { letters } from "./letters";

function randomLetter(
  set: (letter: number) => void,
  setLast: (last: boolean) => void
) {
  const numberOfLetters = 5;
  const timeOfShow = 4000;
  const cache: Set<number> = new Set();

  setLast(false);
  const index = Math.floor(Math.random() * 29);
  cache.add(index);
  set(index);

  const inter = setInterval(() => {
    let chosen: number | undefined;
    do {
      chosen = Math.floor(Math.random() * 29);
      cache.add(chosen);
    } while (!cache.has(chosen));
    set(chosen);
  }, timeOfShow);

  setTimeout(() => {
    clearInterval(inter);
    setLast(true);
  }, timeOfShow * numberOfLetters + timeOfShow / 2);
}

function App() {
  return (
    <div className="App">
      <Letters />
    </div>
  );
}

function Letters() {
  const [letter, setLetter] = useState<number>();
  const [last, setLast] = useState(false);
  return (
    <Carousel
      interval={null}
      activeIndex={letter ?? 29}
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
              background: last ? "#697F3F" : "#C4502A",
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
            onClick={() => randomLetter(setLetter, setLast)}
          >
            Start
          </Button>
        </div>
      </Carousel.Item>
    </Carousel>
  );
}

export default App;
