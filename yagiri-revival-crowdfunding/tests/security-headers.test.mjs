import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import worker from "../worker/index.js";

const ROOT = new URL("../", import.meta.url);

function createKv(initial = {}) {
  const store = new Map(Object.entries(initial));
  return {
    async get(key, options) {
      const value = store.get(key);
      if (value === undefined) return null;
      return options?.type === "json" ? JSON.parse(value) : value;
    },
    async put(key, value) {
      store.set(key, value);
    },
    async delete(key) {
      store.delete(key);
    },
  };
}

function assertBaseline(response, label) {
  const h = response.headers;
  assert.equal(h.get("x-content-type-options"), "nosniff", `${label}: nosniff`);
  assert.equal(h.get("x-frame-options"), "DENY", `${label}: X-Frame-Options`);
  assert.equal(h.get("referrer-policy"), "strict-origin-when-cross-origin", `${label}: Referrer-Policy`);
  assert.match(h.get("strict-transport-security") ?? "", /max-age=\d{7,}/, `${label}: HSTS`);
  assert.ok(h.get("permissions-policy"), `${label}: Permissions-Policy`);
}

// ---------- responses the worker builds itself ----------

test("fund-summary JSON carries the baseline headers, a locked-down CSP and keeps CORS", async () => {
  const response = await worker.fetch(new Request("https://example.test/api/fund-summary"), {
    YAGIRI_FUND_KV: createKv(),
  });

  assert.equal(response.status, 200);
  assertBaseline(response, "fund-summary");
  assert.match(response.headers.get("content-security-policy"), /default-src 'none'/);
  assert.match(response.headers.get("content-security-policy"), /frame-ancestors 'none'/);
  // the production page on another origin must still be able to read it
  assert.equal(response.headers.get("access-control-allow-origin"), "*");
});

test("text responses from the OAuth endpoints carry the baseline headers", async () => {
  const response = await worker.fetch(new Request("https://example.test/api/base/auth"), {});

  assert.equal(response.status, 404);
  assertBaseline(response, "auth 404");
  assert.match(response.headers.get("content-security-policy"), /default-src 'none'/);
});

test("asset responses served through the worker carry the baseline headers without replacing their CSP", async () => {
  const response = await worker.fetch(
    new Request("https://example.test/flow", { headers: { accept: "text/html" } }),
    {
      ASSETS: {
        fetch: async (request) => {
          const isIndex = new URL(request.url).pathname === "/index.html";
          return new Response(isIndex ? "app" : "missing", {
            status: isIndex ? 200 : 404,
            headers: isIndex ? { "Content-Security-Policy": "default-src 'self'" } : {},
          });
        },
      },
    },
  );

  assert.equal(response.status, 200);
  assertBaseline(response, "SPA fallback");
  // the page CSP comes from _headers; the worker must not overwrite it with the API one
  assert.equal(response.headers.get("content-security-policy"), "default-src 'self'");
});

// ---------- the _headers file that the static-asset host applies ----------

async function readHeadersRules(relativePath) {
  const text = await readFile(new URL(relativePath, ROOT), "utf8");
  const rules = new Map();
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    if (!/^\s/.test(line)) continue;
    const idx = line.indexOf(":");
    rules.set(line.slice(0, idx).trim().toLowerCase(), line.slice(idx + 1).trim());
  }
  return { text, rules };
}

test("_headers applies the security headers to every path", async () => {
  const { text, rules } = await readHeadersRules("public/_headers");

  assert.match(text, /^\/\*\s*$/m, "rule must target /*");
  assert.equal(rules.get("x-content-type-options"), "nosniff");
  assert.equal(rules.get("x-frame-options"), "DENY");
  assert.equal(rules.get("referrer-policy"), "strict-origin-when-cross-origin");
  assert.match(rules.get("strict-transport-security") ?? "", /max-age=\d{7,}/);
  assert.ok(rules.get("permissions-policy"));

  const csp = rules.get("content-security-policy") ?? "";
  for (const directive of [
    "default-src 'self'",
    "script-src 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
  ]) {
    assert.ok(csp.includes(directive), `CSP must include ${directive}`);
  }
  // no escape hatches for script execution
  assert.ok(!/script-src[^;]*'unsafe-(inline|eval)'/.test(csp), "script-src must not allow unsafe-*");
});

test("CSP allows exactly the external origins the page actually uses", async () => {
  const { rules } = await readHeadersRules("public/_headers");
  const csp = rules.get("content-security-policy") ?? "";
  const directive = (name) => csp.split(";").map((d) => d.trim()).find((d) => d.startsWith(name + " ")) ?? "";

  // fetch target of the fund summary lives in App.jsx; if it moves, the CSP must move with it
  const app = await readFile(new URL("src/App.jsx", ROOT), "utf8");
  const apiOrigin = app.match(/const FUND_API_ORIGIN = '([^']*)'/)?.[1];
  assert.ok(apiOrigin !== undefined, "FUND_API_ORIGIN not found in App.jsx");
  if (apiOrigin) {
    assert.ok(directive("connect-src").includes(apiOrigin), `connect-src must allow ${apiOrigin}`);
  }

  // the production zone injects the Cloudflare Web Analytics beacon at the edge
  assert.ok(directive("script-src").includes("https://static.cloudflareinsights.com"));
  assert.ok(directive("connect-src").includes("https://cloudflareinsights.com"));

  // Google Fonts: stylesheet from googleapis, font files from gstatic
  const html = await readFile(new URL("index.html", ROOT), "utf8");
  if (html.includes("fonts.googleapis.com")) {
    assert.ok(directive("style-src").includes("https://fonts.googleapis.com"));
    assert.ok(directive("font-src").includes("https://fonts.gstatic.com"));
  }
});
