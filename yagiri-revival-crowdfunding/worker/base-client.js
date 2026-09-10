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

export function getAuthUrl(clientId, redirectUri) {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'read_orders read_items',
  });
  return 'https://api.thebase.in/1/oauth/authorize?' + params.toString();
}

export async function exchangeCodeForTokens(code, clientId, clientSecret, redirectUri, kv) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
  });

  const res = await fetch('https://api.thebase.in/1/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error('BASE token exchange failed (' + res.status + '): ' + errorText);
  }

  const data = await res.json();
  if (kv) {
    await kv.put('BASE_ACCESS_TOKEN', data.access_token, {
      expirationTtl: Math.max(60, (data.expires_in || 86400) - 300),
    });
    if (data.refresh_token) {
      await kv.put('BASE_REFRESH_TOKEN', data.refresh_token);
    }
    await kv.put('BASE_TOKEN_SAVED_AT', new Date().toISOString());
  }

  return data;
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

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
  });

  const res = await fetch('https://api.thebase.in/1/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Failed to refresh BASE token:', err);
    return null;
  }

  const data = await res.json();
  await kv.put('BASE_ACCESS_TOKEN', data.access_token, {
    expirationTtl: Math.max(60, (data.expires_in || 86400) - 300),
  });
  if (data.refresh_token) {
    await kv.put('BASE_REFRESH_TOKEN', data.refresh_token);
  }
  await kv.put('BASE_TOKEN_REFRESHED_AT', new Date().toISOString());
  return data.access_token;
}

export async function calculateFundSummary(clientId, clientSecret, kv) {
  if (kv) {
    const cached = await kv.get('LATEST_FUND_SUMMARY', { type: 'json' });
    if (cached && cached.cachedUntil && Date.now() < cached.cachedUntil) {
      return cached;
    }
  }

  const token = await getValidAccessToken(clientId, clientSecret, kv);
  if (!token) {
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

  let offset = 0;
  const limit = 100;
  let hasMore = true;

  let totalAmount = 0;
  const supporterOrders = new Set();
  const itemSales = {};

  for (const id of CF_ITEM_IDS) {
    itemSales[id] = 0;
  }

  while (hasMore) {
    const res = await fetch('https://api.thebase.in/1/orders?limit=' + limit + '&offset=' + offset, {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    });

    if (!res.ok) {
      console.error('BASE orders API error (' + res.status + '):', await res.text());
      break;
    }

    const data = await res.json();
    const orders = data.orders || [];

    if (orders.length === 0) {
      hasMore = false;
      break;
    }

    for (const order of orders) {
      if (order.cancelled !== null && order.cancelled !== undefined) {
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

    offset += limit;
    if (orders.length < limit || offset >= 1000) {
      hasMore = false;
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
    cachedUntil: Date.now() + 3 * 60 * 1000,
    itemSales,
  };

  if (kv) {
    await kv.put('LATEST_FUND_SUMMARY', JSON.stringify(summary));
  }

  return summary;
}
