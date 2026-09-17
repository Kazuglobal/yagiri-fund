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

// BASE の実際の形に合わせる：
//   GET /1/orders                    → 注文の概要のみ（商品情報は含まれない）
//   GET /1/orders/detail/:unique_key → { order: { order_items: [{ item_id, price, amount, status }] } }
// 以前は一覧に商品情報が入っている架空の形で模擬しており、テストは通るのに
// 本番では常に0円になっていた。
const CF_ITEM_20000 = "155702192";

function order(overrides = {}) {
  return {
    unique_key: overrides.unique_key || "order-1",
    cancelled: null,
    dispatch_status: "ordered",
    modified: 1700000000,
    first_name: "個人情報",
    last_name: "キャッシュされてはいけない",
    ...overrides,
  };
}

function item(itemId, price, amount = 1, status = "ordered") {
  return { item_id: Number(itemId), price, amount, status };
}

// orders: 一覧に出す注文, details: unique_key → order_items
function mockShop({ orders, details = {}, pageSize = 100 }) {
  const calls = { list: 0, detail: [] };
  mockBase((url) => {
    const u = new URL(url);
    const detail = u.pathname.match(/\/orders\/detail\/(.+)$/);
    if (detail) {
      const key = decodeURIComponent(detail[1]);
      calls.detail.push(key);
      const items = details[key] ?? [item(CF_ITEM, 3000)];
      return jsonReply({ order: { unique_key: key, order_items: items } });
    }
    if (u.pathname.endsWith("/orders")) {
      calls.list += 1;
      const offset = Number(u.searchParams.get("offset") || 0);
      return jsonReply({ orders: orders.slice(offset, offset + pageSize) });
    }
    return jsonReply({ error: "unexpected " + u.pathname }, 404);
  });
  return calls;
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

test("the reported shop state totals 26,000 yen from 3 supporters (items come from the detail API)", async () => {
  const calls = mockShop({
    orders: [order({ unique_key: "a" }), order({ unique_key: "b" }), order({ unique_key: "c" })],
    details: {
      a: [item(CF_ITEM, 3000)],
      b: [item(CF_ITEM, 3000)],
      c: [item(CF_ITEM_20000, 20000)],
    },
  });
  const kv = createKv({ BASE_ACCESS_TOKEN: "token" });

  const summary = await refreshFundSummary("id", "secret", kv);

  assert.equal(summary.totalAmount, 26000);
  assert.equal(summary.supportersCount, 3);
  assert.equal(summary.itemSales[CF_ITEM], 2);
  assert.equal(summary.itemSales[CF_ITEM_20000], 1);
  assert.deepEqual(calls.detail.sort(), ["a", "b", "c"]);
});

test("unpaid and cancelled orders are excluded and never fetched in detail", async () => {
  const calls = mockShop({
    orders: [
      order({ unique_key: "paid" }),
      order({ unique_key: "unpaid", dispatch_status: "unpaid" }),
      order({ unique_key: "cancelled-status", dispatch_status: "cancelled" }),
      order({ unique_key: "cancelled-flag", cancelled: 1700000000 }),
    ],
  });
  const kv = createKv({ BASE_ACCESS_TOKEN: "token" });

  const summary = await refreshFundSummary("id", "secret", kv);

  assert.equal(summary.totalAmount, 3000);
  assert.equal(summary.supportersCount, 1);
  assert.deepEqual(calls.detail, ["paid"]);
});

test("cancelled line items and non-crowdfunding items are not counted", async () => {
  mockShop({
    orders: [order({ unique_key: "mixed" }), order({ unique_key: "shop-only" })],
    details: {
      mixed: [item(CF_ITEM, 3000, 2), item(CF_ITEM_20000, 20000, 1, "cancelled"), item("999", 1500)],
      "shop-only": [item("999", 1500)],
    },
  });
  const kv = createKv({ BASE_ACCESS_TOKEN: "token" });

  const summary = await refreshFundSummary("id", "secret", kv);

  assert.equal(summary.totalAmount, 6000);
  assert.equal(summary.supportersCount, 1);
  assert.equal(summary.itemSales[CF_ITEM_20000], 0);
});

test("order details are cached so an unchanged shop costs no detail calls on the next run", async () => {
  const orders = [order({ unique_key: "a" }), order({ unique_key: "b" })];
  const kv = createKv({ BASE_ACCESS_TOKEN: "token" });

  mockShop({ orders });
  await refreshFundSummary("id", "secret", kv);

  const second = mockShop({ orders });
  const summary = await refreshFundSummary("id", "secret", kv);

  assert.equal(summary.totalAmount, 6000);
  assert.deepEqual(second.detail, []);
});

test("an order whose modified timestamp changed is fetched again", async () => {
  const kv = createKv({ BASE_ACCESS_TOKEN: "token" });
  mockShop({ orders: [order({ unique_key: "a", modified: 1 })] });
  await refreshFundSummary("id", "secret", kv);

  // 後から商品がキャンセルされた
  const again = mockShop({
    orders: [order({ unique_key: "a", modified: 2 })],
    details: { a: [item(CF_ITEM, 3000, 1, "cancelled")] },
  });
  const summary = await refreshFundSummary("id", "secret", kv);

  assert.deepEqual(again.detail, ["a"]);
  assert.equal(summary.totalAmount, 0);
  assert.equal(summary.supportersCount, 0);
});

test("the detail cache stores no personal information", async () => {
  mockShop({ orders: [order({ unique_key: "a" })] });
  const kv = createKv({ BASE_ACCESS_TOKEN: "token" });

  await refreshFundSummary("id", "secret", kv);

  const stored = [...kv.store.entries()]
    .filter(([key]) => key !== "BASE_ACCESS_TOKEN")
    .map(([, value]) => value)
    .join("\n");
  assert.doesNotMatch(stored, /個人情報|キャッシュされてはいけない/);
});

test("a failed detail call keeps the previous summary but saves the details already fetched", async () => {
  const previous = JSON.stringify({ isConfigured: true, totalAmount: 99000 });
  const kv = createKv({ BASE_ACCESS_TOKEN: "token", LATEST_FUND_SUMMARY: previous });
  const both = [order({ unique_key: "ok" }), order({ unique_key: "boom" })];
  mockBase((url) => {
    const u = new URL(url);
    if (u.pathname.endsWith("/orders")) {
      return jsonReply({ orders: Number(u.searchParams.get("offset") || 0) ? [] : both });
    }
    if (u.pathname.endsWith("/detail/ok")) {
      return jsonReply({ order: { order_items: [item(CF_ITEM, 3000)] } });
    }
    return jsonReply({ error: "rate_limited" }, 429);
  });

  await assert.rejects(refreshFundSummary("id", "secret", kv));
  assert.equal(kv.store.get("LATEST_FUND_SUMMARY"), previous);

  // 次回は失敗した分だけ取りに行く
  const retry = mockShop({ orders: both });
  const summary = await refreshFundSummary("id", "secret", kv);
  assert.deepEqual(retry.detail, ["boom"]);
  assert.equal(summary.totalAmount, 6000);
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
  const orders = Array.from({ length: 1100 }, (_, i) => order({ unique_key: `o${i}` }));
  const kv = createKv({ BASE_ACCESS_TOKEN: "token" });
  const previous = JSON.stringify({ isConfigured: true, totalAmount: 1 });
  kv.store.set("LATEST_FUND_SUMMARY", previous);

  // 詳細の取得は1回あたり上限付きで、残りは次回以降に回る。
  // 取り切るまでは不完全な合計を公開しない。
  let summary = null;
  let runs = 0;
  while (!summary && runs < 100) {
    runs += 1;
    const calls = mockShop({ orders });
    try {
      summary = await refreshFundSummary("id", "secret", kv);
    } catch {
      assert.equal(kv.store.get("LATEST_FUND_SUMMARY"), previous);
    }
    assert.ok(calls.detail.length <= 40, `run ${runs} fetched ${calls.detail.length} details`);
  }

  assert.equal(summary.supportersCount, 1100);
  assert.equal(summary.totalAmount, 3_300_000);
});

test("a BASE error mid-pagination keeps the previous summary", async () => {
  mockBase((url) => {
    const u = new URL(url);
    if (u.pathname.endsWith("/orders") && !Number(u.searchParams.get("offset") || 0)) {
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

// --- Revoked access token (e.g. after the BASE client secret is regenerated) ---

// BASE answers a revoked token with 400 invalid_request 「アクセストークンが無効です。」
const REVOKED_TOKEN_REPLY = () =>
  jsonReply({ error: "invalid_request", error_description: "アクセストークンが無効です。" }, 400);

function silenceConsoleError() {
  const original = console.error;
  console.error = () => {};
  return () => {
    console.error = original;
  };
}

test("a revoked cached access token is refreshed and the aggregation retried", async () => {
  const tokenRequests = [];
  mockBase((url, init) => {
    const u = new URL(url);
    const auth = init?.headers?.Authorization;
    if (u.pathname.endsWith("/oauth/token")) {
      tokenRequests.push(new URLSearchParams(init.body).get("grant_type"));
      return jsonReply({ access_token: "fresh-token", refresh_token: "fresh-refresh", expires_in: 3600 });
    }
    if (auth !== "Bearer fresh-token") return REVOKED_TOKEN_REPLY();
    if (u.pathname.endsWith("/orders")) return jsonReply({ orders: [order({ unique_key: "a" })] });
    return jsonReply({ order: { order_items: [item(CF_ITEM, 3000)] } });
  });
  const kv = createKv({ BASE_ACCESS_TOKEN: "revoked-token", BASE_REFRESH_TOKEN: "old-refresh" });
  const restore = silenceConsoleError();
  try {
    const summary = await refreshFundSummary("id", "new-secret", kv);

    assert.equal(summary.totalAmount, 3000);
    assert.deepEqual(tokenRequests, ["refresh_token"]);
    assert.equal(kv.store.get("BASE_ACCESS_TOKEN"), "fresh-token");
    assert.equal(kv.store.get("BASE_REFRESH_TOKEN"), "fresh-refresh");
  } finally {
    restore();
  }
});

test("when the refresh token is also rejected, the run fails loudly and keeps the previous summary", async () => {
  mockBase((url) => {
    if (new URL(url).pathname.endsWith("/oauth/token")) {
      return jsonReply({ error: "invalid_grant" }, 400);
    }
    return REVOKED_TOKEN_REPLY();
  });
  const previous = JSON.stringify({ isConfigured: true, totalAmount: 26000 });
  const kv = createKv({
    BASE_ACCESS_TOKEN: "revoked-token",
    BASE_REFRESH_TOKEN: "revoked-refresh",
    LATEST_FUND_SUMMARY: previous,
  });
  const restore = silenceConsoleError();
  try {
    await assert.rejects(refreshFundSummary("id", "new-secret", kv), /\/api\/base\/auth/);
    assert.equal(kv.store.get("LATEST_FUND_SUMMARY"), previous);
    assert.equal(kv.store.get("BASE_ACCESS_TOKEN"), undefined);
  } finally {
    restore();
  }
});

test("other API errors are not mistaken for a revoked token", async () => {
  const tokenRequests = [];
  mockBase((url) => {
    if (new URL(url).pathname.endsWith("/oauth/token")) {
      tokenRequests.push(url);
      return jsonReply({ access_token: "x", expires_in: 3600 });
    }
    return jsonReply({ error: "rate_limited" }, 429);
  });
  const kv = createKv({ BASE_ACCESS_TOKEN: "token", BASE_REFRESH_TOKEN: "refresh" });
  const restore = silenceConsoleError();
  try {
    await assert.rejects(refreshFundSummary("id", "secret", kv));
    assert.deepEqual(tokenRequests, []);
    assert.equal(kv.store.get("BASE_ACCESS_TOKEN"), "token");
  } finally {
    restore();
  }
});
