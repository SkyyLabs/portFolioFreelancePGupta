import React from "react";
import { hydrateRoot, createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/index.css";

const container = document.getElementById("root")!;

const app = (
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Routes are prerendered to static HTML (see scripts/prerender.mjs), so the
// container already holds markup on a normal page load — hydrate it rather than
// throwing it away. createRoot is the fallback for the dev server, which serves
// an empty shell.
if (container.hasChildNodes()) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
