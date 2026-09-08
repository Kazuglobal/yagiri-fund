import { renderToString } from "react-dom/server";
import { App } from "./App.jsx";

// Rendered at build time by scripts/prerender.mjs and inlined into
// dist/client/index.html, so crawlers (and users on a slow connection) get the
// full copy without waiting for the JS bundle. The client hydrates it.
export function render() {
  return renderToString(<App />);
}
