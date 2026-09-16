import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import worker from "../worker/index.js";
import { refreshFundSummary } from "../worker/base-client.js";

const ADMIN_KEY = "admin-key-for-tests";
const CF_ITEM = "155698632";

function createKv(initial = {}) {
  const store = new Map(Object.entries(initial));
  return {
    store,
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

function createEnv(overrides = {}) {
  return {
    BASE_CLIENT_ID: "client-id",
    BASE_CLIENT_SECRET: "client-secret",
    BASE_OAUTH_ADMIN_KEY: ADMIN_KEY,
    YAGIRI_FUND_KV: createKv(),
    ...overrides,
  };
}

function jsonReply(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});

function mockBase(handler) {
  const calls = [];
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    calls.push(url);
    return handler(url, init);
  };
  return calls;
}

const STATE_KEY = "BASE_OAUTH_STATE:s";

function callbackRequest(state = "s") {
  return new Request(`https://example.test/api/base/callback?code=c&state=${state}`, {
    headers: { Cookie: `base_oauth_state=${state}` },
  });
}

function order(overrides = {}) {
  return {
    unique_key: overrides.unique_key || "order-1",
    cancelled: null,
    dispatch_status: "ordered",
    order_receiver_detail: [
      { order_item_details: [{ item_id: CF_ITEM, price: 3000, amount: 1 }] },
    ],
    ...overrides,
  };
}

// --- 1. OAuth endpoints require the admin key and a matching state ---

test("OAuth start is disabled when no admin key is configured", async () => {
  const env = createEnv({ BASE_OAUTH_ADMIN_KEY: undefined });
  const response = await worker.fetch(new Request("https://example.test/api/base/auth"), env);
  assert.equal(response.status, 404);
});

test("OAuth start rejects a missing or wrong admin key", async () => {
  for (const query of ["", "?key=wrong"]) {
    const response = await worker.fetch(
      new Request("https://example.test/api/base/auth" + query),
      createEnv(),
    );
    assert.equal(response.status, 403);
  }
});

test("OAuth start with the admin key sets a state cookie bound to the redirect", async () => {
  const env = createEnv();
  const response = await worker.fetch(
    new Request(`https://example.test/api/base/auth?key=${ADMIN_KEY}`),
    env,
  );
  assert.equal(response.status, 302);

  const location = new URL(response.headers.get("Location"));
  const state = location.searchParams.get("state");
  assert.ok(state && state.length >= 32);
  assert.ok(env.YAGIRI_FUND_KV.store.has(`BASE_OAUTH_STATE:${state}`));

  const cookie = response.headers.get("Set-Cookie");
  assert.match(cookie, new RegExp(`base_oauth_state=${state}`));
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
});

test("OAuth callback rejects a missing or mismatched state without touching KV", async () => {
  const calls = mockBase(() => jsonReply({}));
  const env = createEnv();
  const requests = [
    new Request("https://example.test/api/base/callback?code=attacker-code"),
    new Request("https://example.test/api/base/callback?code=attacker-code&state=abc", {
      headers: { Cookie: "base_oauth_state=other" },
    }),
    new Request("https://example.test/api/base/callback?code=attacker-code&state=", {
      headers: { Cookie: "base_oauth_state=" },
    }),
  ];

  for (const request of requests) {
    const response = await worker.fetch(request, env);
    assert.equal(response.status, 403);
  }
  assert.equal(calls.length, 0);
  assert.equal(env.YAGIRI_FUND_KV.store.size, 0);
});

test("OAuth callback rejects a self-chosen state that was never issued", async () => {
  const calls = mockBase(() => jsonReply({ access_token: "attacker-token" }));
  const env = createEnv();

  // 攻撃者は state と Cookie を自分で揃えられるが、KV に発行されていない。
  const response = await worker.fetch(callbackRequest("attacker-state"), env);

  assert.equal(response.status, 403);
  assert.equal(calls.length, 0);
  assert.equal(env.YAGIRI_FUND_KV.store.get("BASE_ACCESS_TOKEN"), undefined);
});

test("OAuth state cannot be replayed", async () => {
  mockBase((url) => {
    if (url.endsWith("/1/oauth/token")) return jsonReply({ access_token: "t", expires_in: 3600 });
    return jsonReply({ orders: [] });
  });
  const env = createEnv({ YAGIRI_FUND_KV: createKv({ [STATE_KEY]: "1" }) });

  assert.equal((await worker.fetch(callbackRequest(), env)).status, 200);
  assert.equal((await worker.fetch(callbackRequest(), env)).status, 403);
});

test("OAuth callback refuses tokens for a different shop", async () => {
  mockBase((url) => {
    if (url.endsWith("/1/oauth/token")) {
      return jsonReply({ access_token: "attacker-token", refresh_token: "r", expires_in: 3600 });
    }
    if (url.endsWith("/1/users/me")) return jsonReply({ user: { shop_id: "attacker-shop" } });
    return jsonReply({}, 404);
  });
  const env = createEnv({
    BASE_EXPECTED_SHOP_ID: "yagiribrewery",
    YAGIRI_FUND_KV: createKv({ [STATE_KEY]: "1" }),
  });

  const response = await worker.fetch(callbackRequest(), env);

  assert.equal(response.status, 403);
  assert.equal(env.YAGIRI_FUND_KV.store.get("BASE_ACCESS_TOKEN"), undefined);
});

test("OAuth callback stores tokens when state and shop match", async () => {
  mockBase((url) => {
    if (url.endsWith("/1/oauth/token")) {
      return jsonReply({ access_token: "owner-token", refresh_token: "owner-refresh", expires_in: 3600 });
    }
    if (url.endsWith("/1/users/me")) return jsonReply({ user: { shop_id: "yagiribrewery" } });
    return jsonReply({ orders: [] });
  });
  const env = createEnv({
    BASE_EXPECTED_SHOP_ID: "yagiribrewery",
    YAGIRI_FUND_KV: createKv({ [STATE_KEY]: "1" }),
  });

  const response = await worker.fetch(callbackRequest(), env);

  assert.equal(response.status, 200);
  assert.equal(env.YAGIRI_FUND_KV.store.get("BASE_ACCESS_TOKEN"), "owner-token");
  assert.equal(env.YAGIRI_FUND_KV.store.get("BASE_REFRESH_TOKEN"), "owner-refresh");
});

// --- 2. Only paid, non-cancelled orders count ---

test("unpaid and cancelled orders are excluded from the total", async () => {
  mockBase(() =>
    jsonReply({
      orders: [
        order({ unique_key: "paid" }),
        order({ unique_key: "unpaid", dispatch_status: "unpaid" }),
        order({ unique_key: "cancelled-status", dispatch_status: "cancelled" }),
        order({ unique_key: "cancelled-flag", cancelled: 1700000000 }),
      ],
    }),
  );
  const kv = createKv({ BASE_ACCESS_TOKEN: "token" });

  const summary = await refreshFundSummary("id", "secret", kv);

  assert.equal(summary.totalAmount, 3000);
  assert.equal(summary.supportersCount, 1);
});

// --- 3. Public requests do not drive BASE API calls; failures never cache partial totals ---

test("fund-summary serves the cached summary without calling BASE even when old", async () => {
  const calls = mockBase(() => jsonReply({ orders: [] }));
  const cached = { isConfigured: true, totalAmount: 42000, updatedAt: "2026-01-01T00:00:00.000Z" };
  const env = createEnv({
    YAGIRI_FUND_KV: createKv({
      BASE_ACCESS_TOKEN: "token",
      LATEST_FUND_SUMMARY: JSON.stringify(cached),
    }),
  });

  const response = await worker.fetch(new Request("https://example.test/api/fund-summary"), env);

  assert.equal(response.status, 200);
  assert.equal((await response.json()).totalAmount, 42000);
  assert.equal(calls.length, 0);
});

test("fund-summary never calls BASE even when no summary is cached yet", async () => {
  const calls = mockBase(() => jsonReply({ orders: [] }));
  const env = createEnv({ YAGIRI_FUND_KV: createKv({ BASE_ACCESS_TOKEN: "token" }) });

  const response = await worker.fetch(new Request("https://example.test/api/fund-summary"), env);

  assert.equal(response.status, 200);
  assert.equal((await response.json()).totalAmount, 0);
  assert.equal(calls.length, 0);
});

test("orders beyond the old 1,000 cap are counted", async () => {
  let page = 0;
  mockBase(() => {
    page += 1;
    const size = page <= 11 ? 100 : 0;
    return jsonReply({
      orders: Array.from({ length: size }, (_, i) => order({ unique_key: `p${page}-${i}` })),
    });
  });
  const kv = createKv({ BASE_ACCESS_TOKEN: "token" });

  const summary = await refreshFundSummary("id", "secret", kv);

  assert.equal(summary.supportersCount, 1100);
});

test("a BASE error mid-pagination keeps the previous summary", async () => {
  let page = 0;
  mockBase(() => {
    page += 1;
    if (page === 1) {
      return jsonReply({ orders: Array.from({ length: 100 }, (_, i) => order({ unique_key: `o${i}` })) });
    }
    return jsonReply({ error: "rate_limited" }, 429);
  });
  const previous = JSON.stringify({ isConfigured: true, totalAmount: 99000 });
  const kv = createKv({ BASE_ACCESS_TOKEN: "token", LATEST_FUND_SUMMARY: previous });

  await assert.rejects(refreshFundSummary("id", "secret", kv));
  assert.equal(kv.store.get("LATEST_FUND_SUMMARY"), previous);
});

// --- 4. Error responses do not echo internal details ---

test("fund-summary errors do not expose internal details", async () => {
  const env = createEnv({
    YAGIRI_FUND_KV: {
      async get() {
        throw new Error("internal KV detail");
      },
      async put() {},
    },
  });
  const originalError = console.error;
  console.error = () => {};
  try {
    const response = await worker.fetch(new Request("https://example.test/api/fund-summary"), env);
    assert.equal(response.status, 500);
    assert.doesNotMatch(await response.text(), /internal KV detail/);
  } finally {
    console.error = originalError;
  }
});
