import React from "react";
import ReactDOM from "react-dom/client";
import { Layout } from "./components/Layout";
import { LetterCarousel } from "./containers/LetterCarousel";
import { letters } from "./letters";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <Layout>
      <LetterCarousel letters={letters} />
    </Layout>
  </React.StrictMode>
);
