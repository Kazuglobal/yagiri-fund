import {
  exchangeCodeForTokens,
  fetchShopId,
  getAuthUrl,
  getFundSummary,
  refreshFundSummary,
  saveTokens,
} from './base-client.js';

const OAUTH_STATE_COOKIE = 'base_oauth_state';
const OAUTH_STATE_MAX_AGE_SECONDS = 600;
const CALLBACK_PATH = '/api/base/callback';
const OAUTH_STATE_KV_PREFIX = 'BASE_OAUTH_STATE:';

// 本番ページ側は public/_headers が同じヘッダを付ける。ここは Worker 自身が
// 組み立てる応答（/api/* の JSON・テキスト・連携完了HTML）と、Worker を経由して
// 返す静的アセットのための保険。値は _headers と揃えること。
const BASELINE_SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
  'Strict-Transport-Security': 'max-age=31536000',
};

// /api/* は HTML として解釈される前提が無いので、何も読み込ませない。
const API_CSP = "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'";

// 連携完了画面だけはインラインの <style> を持つ。
const CALLBACK_PAGE_CSP = "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'";

// 既存の Content-Security-Policy は上書きしない（静的アセットのCSPは _headers が決める）。
function withSecurityHeaders(response, { csp } = {}) {
  const secured = new Response(response.body, response);
  for (const [name, value] of Object.entries(BASELINE_SECURITY_HEADERS)) {
    secured.headers.set(name, value);
  }
  if (csp && !secured.headers.has('Content-Security-Policy')) {
    secured.headers.set('Content-Security-Policy', csp);
  }
  return secured;
}

function textResponse(body, status, extraHeaders = {}) {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  });
}

// 長さ以外の情報を比較時間から漏らさない文字列比較。
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const left = new TextEncoder().encode(a);
  const right = new TextEncoder().encode(b);
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let i = 0; i < left.length; i += 1) {
    diff |= left[i] ^ right[i];
  }
  return diff === 0;
}

function readCookie(request, name) {
  const header = request.headers.get('Cookie') || '';
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return null;
}

function stateCookie(value, maxAge) {
  return `${OAUTH_STATE_COOKIE}=${value}; Path=${CALLBACK_PATH}; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

const CLEAR_STATE_COOKIE = { 'Set-Cookie': stateCookie('', 0) };

// BASE 連携は管理者だけが行う操作。BASE_OAUTH_ADMIN_KEY が未設定なら
// エンドポイント自体を存在しないものとして扱う（連携後は削除して無効化できる）。
async function handleAuthStart(url, env) {
  if (!env.BASE_OAUTH_ADMIN_KEY || !env.BASE_CLIENT_ID) {
    return textResponse('Not found', 404);
  }
  if (!safeEqual(url.searchParams.get('key'), env.BASE_OAUTH_ADMIN_KEY)) {
    return textResponse('Forbidden', 403);
  }

  const state = crypto.randomUUID().replaceAll('-', '');
  // state はサーバー側にも保存する。Cookie だけの照合だと、攻撃者が自分で
  // state と Cookie を揃えてコールバックを直接呼べてしまうため。
  await env.YAGIRI_FUND_KV.put(OAUTH_STATE_KV_PREFIX + state, '1', {
    expirationTtl: OAUTH_STATE_MAX_AGE_SECONDS,
  });
  const authUrl = getAuthUrl(env.BASE_CLIENT_ID, url.origin + CALLBACK_PATH, state, {
    verifyShop: Boolean(env.BASE_EXPECTED_SHOP_ID),
  });
  return new Response(null, {
    status: 302,
    headers: {
      Location: authUrl,
      'Set-Cookie': stateCookie(state, OAUTH_STATE_MAX_AGE_SECONDS),
      'Cache-Control': 'no-store',
    },
  });
}

async function handleAuthCallback(request, url, env, ctx) {
  if (!env.BASE_OAUTH_ADMIN_KEY) {
    return textResponse('Not found', 404);
  }

  // 管理者が /api/base/auth から始めた連携以外（攻撃者自身の BASE アカウントでの
  // 連携や、第三者に踏ませたコールバック）はここで拒否する。
  // state は KV に発行済みで、かつ連携を始めたブラウザの Cookie と一致する必要があり、
  // 一度使ったら削除して再利用させない。
  const state = url.searchParams.get('state');
  if (!state || !safeEqual(state, readCookie(request, OAUTH_STATE_COOKIE))) {
    return textResponse('Invalid OAuth state', 403, CLEAR_STATE_COOKIE);
  }
  const stateKey = OAUTH_STATE_KV_PREFIX + state;
  if (!(await env.YAGIRI_FUND_KV.get(stateKey))) {
    return textResponse('Invalid OAuth state', 403, CLEAR_STATE_COOKIE);
  }
  await env.YAGIRI_FUND_KV.delete(stateKey);

  if (url.searchParams.get('error')) {
    return textResponse('BASE authorization was not completed', 400, CLEAR_STATE_COOKIE);
  }
  const code = url.searchParams.get('code');
  if (!code) {
    return textResponse('Authorization code missing', 400, CLEAR_STATE_COOKIE);
  }

  try {
    const tokens = await exchangeCodeForTokens(
      code,
      env.BASE_CLIENT_ID,
      env.BASE_CLIENT_SECRET,
      url.origin + CALLBACK_PATH
    );

    if (env.BASE_EXPECTED_SHOP_ID) {
      const shopId = await fetchShopId(tokens.access_token);
      if (shopId !== env.BASE_EXPECTED_SHOP_ID) {
        console.error('BASE OAuth shop mismatch:', shopId);
        return textResponse('This BASE shop is not allowed', 403, CLEAR_STATE_COOKIE);
      }
    }

    await saveTokens(env.YAGIRI_FUND_KV, tokens);

    if (ctx && ctx.waitUntil) {
      ctx.waitUntil(
        refreshFundSummary(env.BASE_CLIENT_ID, env.BASE_CLIENT_SECRET, env.YAGIRI_FUND_KV).catch(
          (err) => console.error('Initial fund summary refresh failed:', err)
        )
      );
    }

    const html = '<!DOCTYPE html><html lang="ja"><head><meta charset="utf-8"><title>BASE API 連携完了</title><style>body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #14181a; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; } .card { background: #1f2529; border: 1px solid #38424a; border-radius: 12px; padding: 32px; max-width: 480px; text-align: center; } h1 { color: #f59e0b; font-size: 22px; margin-bottom: 12px; } p { color: #cbd5e1; font-size: 15px; line-height: 1.6; margin-bottom: 24px; } a { display: inline-block; background: #d97706; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; }</style></head><body><div class="card"><h1>✓ BASE API 連携が完了しました</h1><p>矢切ブルワリーのBASEショップと正常に接続されました。<br>CF対象リターンの注文・入金が自動集計され、ダッシュボードへ反映されます。</p><a href="/">クラウドファンディングLPへ戻る</a></div></body></html>';

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'Content-Security-Policy': CALLBACK_PAGE_CSP,
        ...CLEAR_STATE_COOKIE,
      },
    });
  } catch (err) {
    console.error('Callback error:', err);
    return textResponse('Authentication failed', 500, CLEAR_STATE_COOKIE);
  }
}

async function route(request, url, env, ctx) {
    // 1. API: Get Crowdfunding Summary
    if (url.pathname === '/api/fund-summary') {
      try {
        const summary = await getFundSummary(env.YAGIRI_FUND_KV);
        return new Response(JSON.stringify(summary), {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=60, s-maxage=180',
          },
        });
      } catch (err) {
        console.error('Error calculating fund summary:', err);
        return new Response(JSON.stringify({ error: 'Failed to fetch summary' }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }

    // 2. OAuth Step 1: Start BASE OAuth Flow (admin only)
    if (url.pathname === '/api/base/auth') {
      return handleAuthStart(url, env);
    }

    // 3. OAuth Step 2: Callback from BASE
    if (url.pathname === CALLBACK_PATH) {
      return handleAuthCallback(request, url, env, ctx);
    }

    // 4. Static assets & SPA fallback
    const response = await env.ASSETS.fetch(request);
    const acceptsHtml = request.headers.get('accept')?.includes('text/html');

    if (response.status !== 404 || !acceptsHtml || !['GET', 'HEAD'].includes(request.method)) {
      return response;
    }

    const indexUrl = new URL(request.url);
    indexUrl.pathname = '/index.html';
    indexUrl.search = '';
    return env.ASSETS.fetch(new Request(indexUrl, request));
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const response = await route(request, url, env, ctx);
    const isApi = url.pathname.startsWith('/api/');
    return withSecurityHeaders(response, { csp: isApi ? API_CSP : undefined });
  },

  // 5. Cron Trigger: the only periodic path that re-aggregates from BASE.
  // A failed refresh leaves the previous summary in KV untouched.
  async scheduled(event, env, ctx) {
    const refresh = refreshFundSummary(
      env.BASE_CLIENT_ID,
      env.BASE_CLIENT_SECRET,
      env.YAGIRI_FUND_KV
    ).catch((err) => console.error('Scheduled fund summary refresh failed:', err));

    if (ctx && ctx.waitUntil) {
      ctx.waitUntil(refresh);
    } else {
      await refresh;
    }
  },
};
