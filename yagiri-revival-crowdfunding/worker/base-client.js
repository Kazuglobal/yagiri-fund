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

// BASE から全件集計し直す。途中で API が失敗したら例外を投げ、
// 不完全な合計でキャッシュを上書きしない。
export async function refreshFundSummary(clientId, clientSecret, kv) {
  const token = await getValidAccessToken(clientId, clientSecret, kv);
  if (!token) {
    return unconfiguredSummary();
  }

  const limit = ORDERS_PAGE_SIZE;

  let totalAmount = 0;
  const supporterOrders = new Set();
  const itemSales = {};

  for (const id of CF_ITEM_IDS) {
    itemSales[id] = 0;
  }

  for (let page = 0; ; page += 1) {
    if (page >= MAX_ORDER_PAGES) {
      throw new Error('BASE orders exceeded ' + MAX_ORDER_PAGES * limit + ' orders; refusing to cache a partial total');
    }
    const offset = page * limit;
    const res = await fetch(BASE_API + '/orders?limit=' + limit + '&offset=' + offset, {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    });

    if (!res.ok) {
      console.error('BASE orders API error (' + res.status + '):', await res.text());
      throw new Error('BASE orders API error (' + res.status + ')');
    }

    const data = await res.json();
    const orders = data.orders || [];

    if (orders.length === 0) {
      break;
    }

    for (const order of orders) {
      if (!isCountableOrder(order)) {
        continue;
      }

      const receiverDetails = order.order_receiver_detail || [];
      let isCFOrder = false;

      for (const receiver of receiverDetails) {
        const items = receiver.order_item_details || [];
        for (const item of items) {
          const itemIdStr = String(item.item_id);
          if (CF_ITEM_IDS.has(itemIdStr)) {
            isCFOrder = true;
            const price = Number(item.price) || 0;
            const amount = Number(item.amount) || 1;
            totalAmount += price * amount;
            itemSales[itemIdStr] = (itemSales[itemIdStr] || 0) + amount;
          }
        }
      }

      if (isCFOrder) {
        supporterOrders.add(order.unique_key || order.order_id);
      }
    }

    if (orders.length < limit) {
      break;
    }
  }

  const supportersCount = supporterOrders.size;
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
