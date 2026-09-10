import {
  calculateFundSummary,
  exchangeCodeForTokens,
  getAuthUrl,
} from './base-client.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. API: Get Crowdfunding Summary
    if (url.pathname === '/api/fund-summary') {
      try {
        const summary = await calculateFundSummary(
          env.BASE_CLIENT_ID,
          env.BASE_CLIENT_SECRET,
          env.YAGIRI_FUND_KV
        );
        return new Response(JSON.stringify(summary), {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=60, s-maxage=180',
          },
        });
      } catch (err) {
        console.error('Error calculating fund summary:', err);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch summary', details: String(err) }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
          }
        );
      }
    }

    // 2. OAuth Step 1: Start BASE OAuth Flow
    if (url.pathname === '/api/base/auth') {
      if (!env.BASE_CLIENT_ID) {
        return new Response('BASE_CLIENT_ID is not configured in Worker secrets.', { status: 500 });
      }
      const redirectUri = url.origin + '/api/base/callback';
      const authUrl = getAuthUrl(env.BASE_CLIENT_ID, redirectUri);
      return Response.redirect(authUrl, 302);
    }

    // 3. OAuth Step 2: Callback from BASE
    if (url.pathname === '/api/base/callback') {
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');

      if (error) {
        return new Response('BASE Authorization error: ' + error, { status: 400 });
      }
      if (!code) {
        return new Response('Authorization code missing', { status: 400 });
      }

      try {
        const redirectUri = url.origin + '/api/base/callback';
        await exchangeCodeForTokens(
          code,
          env.BASE_CLIENT_ID,
          env.BASE_CLIENT_SECRET,
          redirectUri,
          env.YAGIRI_FUND_KV
        );

        // Pre-warm initial fund summary calculation in background
        if (ctx && ctx.waitUntil) {
          ctx.waitUntil(
            calculateFundSummary(
              env.BASE_CLIENT_ID,
              env.BASE_CLIENT_SECRET,
              env.YAGIRI_FUND_KV
            )
          );
        }

        const html = '<!DOCTYPE html><html lang="ja"><head><meta charset="utf-8"><title>BASE API 連携完了</title><style>body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #14181a; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; } .card { background: #1f2529; border: 1px solid #38424a; border-radius: 12px; padding: 32px; max-width: 480px; text-align: center; } h1 { color: #f59e0b; font-size: 22px; margin-bottom: 12px; } p { color: #cbd5e1; font-size: 15px; line-height: 1.6; margin-bottom: 24px; } a { display: inline-block; background: #d97706; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; }</style></head><body><div class="card"><h1>✓ BASE API 連携が完了しました</h1><p>矢切ブルワリーのBASEショップと正常に接続されました。<br>CF対象リターンの注文・入金が自動集計され、ダッシュボードへ反映されます。</p><a href="/">クラウドファンディングLPへ戻る</a></div></body></html>';

        return new Response(html, {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      } catch (err) {
        console.error('Callback error:', err);
        return new Response('Authentication failed: ' + err.message, { status: 500 });
      }
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
  },

  // 5. Cron Trigger: Scheduled background sync (e.g. every 5 minutes)
  async scheduled(event, env, ctx) {
    if (ctx && ctx.waitUntil) {
      ctx.waitUntil(
        calculateFundSummary(
          env.BASE_CLIENT_ID,
          env.BASE_CLIENT_SECRET,
          env.YAGIRI_FUND_KV
        )
      );
    }
  },
};
