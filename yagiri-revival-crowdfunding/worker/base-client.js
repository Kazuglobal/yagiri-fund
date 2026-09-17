/**
 * BASE API OAuth2.0 Client & Crowdfunding Metrics Aggregator
 */

export const CF_ITEM_IDS = new Set([
  '155698632', // 3,000円
  '155699333', // 5,000円
  '155699770', // 6,000円
  '155699896', // 12,000円
  '155700597', // 15,000円
  '155702192', // 20,000円
  '155701267', // 22,000円
  '155702722', // 25,000円
  '155702823', // 40,000円
  '155702966', // 80,000円
  '155703259', // 100,000円
  '155703648', // 300,000円
  '155705721', // 380,000円
]);

export const TARGET_AMOUNT = 1_000_000;

const BASE_API = 'https://api.thebase.in/1';
const SUMMARY_KEY = 'LATEST_FUND_SUMMARY';
const ORDERS_PAGE_SIZE = 100;
// 暴走防止の上限。到達したら合計が不完全なので、保存せずに失敗させる。
const MAX_ORDER_PAGES = 100;

// 入金前・キャンセル済みの注文は支援額に含めない。
// 未入金注文を数えると、支払う気のない注文で表示額を水増しできてしまう。
const EXCLUDED_DISPATCH_STATUSES = new Set(['unpaid', 'cancelled']);

// read_users はショップ検証（BASE_EXPECTED_SHOP_ID 設定時）にだけ必要。
export function getAuthUrl(clientId, redirectUri, state, { verifyShop = false } = {}) {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: verifyShop ? 'read_orders read_items read_users' : 'read_orders read_items',
    state,
  });
  return BASE_API + '/oauth/authorize?' + params.toString();
}

async function requestToken(params) {
  const res = await fetch(BASE_API + '/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params).toString(),
  });

  if (!res.ok) {
    console.error('BASE token request failed (' + res.status + '):', await res.text());
    throw new Error('BASE token request failed (' + res.status + ')');
  }
  return res.json();
}

// トークンは取得するだけで保存しない。
// 呼び出し側がショップを検証してから saveTokens で保存する。
export function exchangeCodeForTokens(code, clientId, clientSecret, redirectUri) {
  return requestToken({
    grant_type: 'authorization_code',
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
  });
}

export async function fetchShopId(accessToken) {
  const res = await fetch(BASE_API + '/users/me', {
    headers: { Authorization: 'Bearer ' + accessToken },
  });
  if (!res.ok) {
    throw new Error('BASE users/me failed (' + res.status + ')');
  }
  const data = await res.json();
  return data.user?.shop_id ?? null;
}

export async function saveTokens(kv, data, timestampKey = 'BASE_TOKEN_SAVED_AT') {
  await kv.put('BASE_ACCESS_TOKEN', data.access_token, {
    expirationTtl: Math.max(60, (data.expires_in || 86400) - 300),
  });
  if (data.refresh_token) {
    await kv.put('BASE_REFRESH_TOKEN', data.refresh_token);
  }
  await kv.put(timestampKey, new Date().toISOString());
}

export async function getValidAccessToken(clientId, clientSecret, kv) {
  if (!kv) return null;

  const currentAccess = await kv.get('BASE_ACCESS_TOKEN');
  if (currentAccess) {
    return currentAccess;
  }

  const refreshToken = await kv.get('BASE_REFRESH_TOKEN');
  if (!refreshToken) {
    return null;
  }

  let data;
  try {
    data = await requestToken({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    });
  } catch (err) {
    console.error('Failed to refresh BASE token:', err);
    return null;
  }

  await saveTokens(kv, data, 'BASE_TOKEN_REFRESHED_AT');
  return data.access_token;
}

function unconfiguredSummary() {
  return {
    isConfigured: false,
    targetAmount: TARGET_AMOUNT,
    totalAmount: 0,
    supportersCount: 0,
    percentage: 0,
    updatedAt: new Date().toISOString(),
    itemSales: {},
  };
}

function isCountableOrder(order) {
  if (order.cancelled !== null && order.cancelled !== undefined) return false;
  return !EXCLUDED_DISPATCH_STATUSES.has(order.dispatch_status);
}

// 公開リクエストから呼ぶ読み取り専用の入口。BASE API は一切叩かない。
// キャッシュがあれば古くてもそのまま返し、無ければ未集計として返す
// （再集計は cron と OAuth 連携直後だけが行う）。
export async function getFundSummary(kv) {
  const cached = kv ? await kv.get(SUMMARY_KEY, { type: 'json' }) : null;
  return cached || unconfiguredSummary();
}

// 注文ごとの商品明細のキャッシュ。BASE の注文一覧 (GET /1/orders) は商品情報を
// 返さないため、商品IDと金額は注文詳細 (GET /1/orders/detail/:unique_key) から取る。
// 詳細を毎回全件取り直すとレート制限（5,000回/時）と Workers のサブリクエスト上限を
// 食い潰すので、一覧の modified が変わらない注文は前回の明細を使い回す。
// 保存するのは CF 対象商品の [item_id, 単価, 数量] だけで、氏名・住所などは持たない。
const ORDER_ITEMS_CACHE_KEY = 'BASE_ORDER_ITEMS_CACHE';
// 1回の集計で新しく取りに行く注文詳細の上限。超えた分は次回（5分後）に回す。
const MAX_DETAIL_FETCHES_PER_RUN = 40;

// BASE は失効したアクセストークンに 401 ではなく
// 400 invalid_request「アクセストークンが無効です。」を返す（client secret を再発行した直後など）。
function isRevokedTokenResponse(status, body) {
  if (status === 401) return true;
  try {
    const data = JSON.parse(body);
    return data.error === 'invalid_token' || /アクセストークン/.test(data.error_description || '');
  } catch {
    return false;
  }
}

async function baseGet(path, token) {
  const res = await fetch(BASE_API + path, {
    headers: { Authorization: 'Bearer ' + token },
  });
  if (!res.ok) {
    const body = await res.text();
    console.error('BASE API error ' + path.split('?')[0] + ' (' + res.status + '):', body);
    const err = new Error('BASE API error (' + res.status + ')');
    err.revokedToken = isRevokedTokenResponse(res.status, body);
    throw err;
  }
  return res.json();
}

// 支援として数える注文の一覧（未入金・キャンセルを除く）。
async function listCountableOrders(token) {
  const limit = ORDERS_PAGE_SIZE;
  const countable = [];
  for (let page = 0; ; page += 1) {
    if (page >= MAX_ORDER_PAGES) {
      throw new Error('BASE orders exceeded ' + MAX_ORDER_PAGES * limit + ' orders; refusing to cache a partial total');
    }
    const data = await baseGet('/orders?limit=' + limit + '&offset=' + page * limit, token);
    const orders = data.orders || [];
    for (const order of orders) {
      if (isCountableOrder(order)) {
        countable.push({ key: String(order.unique_key), modified: order.modified ?? null });
      }
    }
    if (orders.length < limit) {
      return countable;
    }
  }
}

// 注文詳細から CF 対象商品だけを [item_id, 単価, 数量] で取り出す。
// 明細単位でキャンセルされた商品は数えない。
function extractCfItems(detail) {
  const items = detail?.order?.order_items || [];
  const result = [];
  for (const item of items) {
    const itemId = String(item.item_id);
    if (!CF_ITEM_IDS.has(itemId) || item.status === 'cancelled') continue;
    result.push([itemId, Number(item.price) || 0, Number(item.amount) || 1]);
  }
  return result;
}

// BASE から集計し直す。途中で API が失敗したら例外を投げ、
// 不完全な合計でキャッシュを上書きしない（取得済みの注文明細だけは保存し、次回に引き継ぐ）。
//
// KV に残っているアクセストークンは期限前でも BASE 側で失効していることがある。
// その場合はキャッシュを捨ててリフレッシュトークンで取り直し、1回だけやり直す。
export async function refreshFundSummary(clientId, clientSecret, kv) {
  const token = await getValidAccessToken(clientId, clientSecret, kv);
  if (!token) {
    return unconfiguredSummary();
  }

  try {
    return await aggregateFundSummary(token, kv);
  } catch (err) {
    if (!err.revokedToken || !kv) throw err;
  }

  await kv.delete('BASE_ACCESS_TOKEN');
  const renewed = await getValidAccessToken(clientId, clientSecret, kv);
  if (!renewed) {
    throw new Error(
      'BASE access token was revoked and could not be refreshed; re-authorize via /api/base/auth'
    );
  }
  return aggregateFundSummary(renewed, kv);
}

async function aggregateFundSummary(token, kv) {
  const orders = await listCountableOrders(token);
  const previousCache = (kv && (await kv.get(ORDER_ITEMS_CACHE_KEY, { type: 'json' }))) || {};

  // 今回数える注文だけを残す（キャンセル・未入金に変わった注文はここで落ちる）
  const cache = {};
  let fetched = 0;
  let failure = null;

  for (const { key, modified } of orders) {
    const cached = previousCache[key];
    if (cached && cached.m === modified) {
      cache[key] = cached;
      continue;
    }
    if (failure) continue;
    if (fetched >= MAX_DETAIL_FETCHES_PER_RUN) {
      failure = new Error('More than ' + MAX_DETAIL_FETCHES_PER_RUN + ' new orders; the rest are fetched on the next run');
      continue;
    }
    try {
      const detail = await baseGet('/orders/detail/' + encodeURIComponent(key), token);
      cache[key] = { m: modified, i: extractCfItems(detail) };
      fetched += 1;
    } catch (err) {
      failure = err;
    }
  }

  if (kv && fetched > 0) {
    await kv.put(ORDER_ITEMS_CACHE_KEY, JSON.stringify(cache));
  }
  if (failure) {
    throw failure;
  }

  let totalAmount = 0;
  let supportersCount = 0;
  const itemSales = {};
  for (const id of CF_ITEM_IDS) {
    itemSales[id] = 0;
  }

  for (const { key } of orders) {
    const lines = cache[key]?.i || [];
    if (lines.length === 0) continue;
    supportersCount += 1;
    for (const [itemId, price, amount] of lines) {
      totalAmount += price * amount;
      itemSales[itemId] += amount;
    }
  }

  const percentage = Math.min(100, Math.round((totalAmount / TARGET_AMOUNT) * 1000) / 10);

  const summary = {
    isConfigured: true,
    targetAmount: TARGET_AMOUNT,
    totalAmount,
    supportersCount,
    percentage,
    updatedAt: new Date().toISOString(),
    itemSales,
  };

  if (kv) {
    await kv.put(SUMMARY_KEY, JSON.stringify(summary));
  }

  return summary;
}
