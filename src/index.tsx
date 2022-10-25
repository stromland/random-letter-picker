import React from "react";
import ReactDOM from "react-dom/client";
import { Layout } from "./components/Layout";
import { LetterCarousel } from "./containers/LetterCarousel";
import { letterSettings } from "./letters";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <Layout>
      <LetterCarousel letters={letterSettings} />
    </Layout>
  </React.StrictMode>
);
