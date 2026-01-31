import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Layout } from "./components/Layout";
import { LetterCarousel } from "./containers/LetterCarousel";
import { letterSettings } from "./letters";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Layout>
      <LetterCarousel letters={letterSettings} />
    </Layout>
  </StrictMode>,
);
