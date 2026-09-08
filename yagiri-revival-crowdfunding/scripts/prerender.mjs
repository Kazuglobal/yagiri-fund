#!/usr/bin/env node
// Inlines the app's HTML into dist/client/index.html at build time.
//
// The page is a single static landing page, so there is no reason to ship an
// empty <div id="root"> and make every crawler run the bundle before it sees
// the copy. src/main.jsx hydrates whatever is already there.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const indexPath = path.join(root, "dist", "client", "index.html");
const entryPath = path.join(root, "dist", "ssr", "entry-server.js");

const { render } = await import(pathToFileURL(entryPath).href);
const appHtml = render();

if (!appHtml || appHtml.length < 1000) {
  throw new Error(`Prerender produced suspiciously little HTML (${appHtml.length} chars)`);
}

const template = readFileSync(indexPath, "utf8");
const marker = '<div id="root"></div>';
if (!template.includes(marker)) {
  throw new Error(`Could not find ${marker} in dist/client/index.html`);
}

writeFileSync(indexPath, template.replace(marker, `<div id="root">${appHtml}</div>`));
console.log(`Prerendered ${appHtml.length} chars of HTML into dist/client/index.html`);
