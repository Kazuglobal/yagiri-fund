// Meta Pixel のイベント送信。ベースコード（PageView）は public/meta-pixel.js。
// 広告ブロッカー等で fbq が無い環境でも、ページの動作は一切変えない。

// 同じタブで BASE へ遷移するとき、送信が途切れないよう待つ時間（150〜300ms の範囲）
const NAVIGATION_DELAY_MS = 200;

const getFbq = () => (typeof window !== 'undefined' && typeof window.fbq === 'function' ? window.fbq : null);

function trackInitiateCheckout(el) {
  const fbq = getFbq();
  if (!fbq) return false;
  fbq('track', 'InitiateCheckout', {
    value: Number(el.dataset.price) || 0,
    currency: 'JPY',
    content_name: el.dataset.reward,
  });
  return true;
}

// 新しいタブ・修飾キー付きクリック・ページ内リンクは、ブラウザの既定動作に任せる
function isSameTabNavigation(anchor, event) {
  if (!anchor || !anchor.href) return false;
  if (event.defaultPrevented || event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  const target = anchor.getAttribute('target');
  if (target && target !== '_self') return false;
  const url = new URL(anchor.href, window.location.href);
  return !(url.origin === window.location.origin && url.pathname === window.location.pathname && url.hash);
}

// data-reward を持つ要素のクリックで InitiateCheckout を送る（イベント委譲）。
// 戻り値は解除関数。
export function listenCheckoutClicks(root = document) {
  const onClick = (event) => {
    const el = event.target instanceof Element ? event.target.closest('[data-reward]') : null;
    if (!el) return;
    const anchor = el.closest('a');
    const sameTab = isSameTabNavigation(anchor, event);
    const sent = trackInitiateCheckout(el);
    if (!sent || !sameTab) return;
    event.preventDefault();
    const { href } = anchor;
    window.setTimeout(() => window.location.assign(href), NAVIGATION_DELAY_MS);
  };
  root.addEventListener('click', onClick);
  return () => root.removeEventListener('click', onClick);
}

// リターンセクションが初めて画面に入ったときに1回だけ ViewContent を送る。
// 戻り値は解除関数。
export function observeRewardsView(section) {
  if (!section || typeof IntersectionObserver === 'undefined') return () => {};
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    observer.disconnect();
    getFbq()?.('track', 'ViewContent', { content_name: 'rewards' });
  });
  observer.observe(section);
  return () => observer.disconnect();
}
