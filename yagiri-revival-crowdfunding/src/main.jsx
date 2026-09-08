import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { App } from "./App.jsx";
import "./styles.css";
import "./design-v2.css";
import "./design-v3.css";

const container = document.getElementById("root");
const tree = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// The production build prerenders the markup into #root (scripts/prerender.mjs),
// so hydrate it instead of throwing it away and rendering from scratch.
// `vite dev` serves an empty #root, which still takes the createRoot path.
if (container.firstElementChild) {
  hydrateRoot(container, tree);
} else {
  createRoot(container).render(tree);
}
