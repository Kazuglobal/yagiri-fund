import { useEffect, useState } from 'react';
import {
  DAMAGE_DOC_IMAGES,
  FEATURED_IMAGES,
  HERO_SLIDES,
  LAW_URL,
  OFFICIAL_URL,
  REWARDS,
  TAPROOM_IMAGES,
  TARGET_AMOUNT,
  itemUrl,
} from './content/data.js';
import { CONTENT, LanguageSwitch, useLanguage } from './i18n.jsx';
import { listenCheckoutClicks, observeRewardsView } from './metaPixel.js';

// 集計APIの配信元。
// 本番ページ (fund.yagiribrewery.com) は矢切ブルワリー側のCloudflareアカウントで
// 配信されており、こちらからは KV の作成もシークレットの登録もできない。
// そのため BASE 連携（KV・cron・OAuth）は開発側アカウントの Worker
// `yagiri-fund-lp` に置き、本番ページからはクロスオリジンで取得する。
// Worker 側の /api/fund-summary は Access-Control-Allow-Origin: * を返すため、
// 単純な GET であればプリフライトなしで通る。
// 将来ページ本体と同じアカウントに API を置けるようになったら '' に戻せば
// 相対パス取得に戻る。
const FUND_API_ORIGIN = 'https://yagiri-fund-lp.globalbunny.workers.dev';

// Intended line breaks: each entry becomes a `.ln` block (see AGENTS.md).
// Meta Pixel の InitiateCheckout 用属性（src/metaPixel.js がクリックを拾う）。
// リターン名は表示言語に関わらず日本語で送り、広告側の集計を1本にまとめる。
const checkoutAttrs = (reward, price) => ({ 'data-reward': reward, 'data-price': price });
// 特定のリターンに紐づかない「支援する」系ボタン（リターン一覧へスクロールするだけ）
const GENERAL_CTA = checkoutAttrs('rewards', 0);
const rewardName = (i) => {
  const { kind, title } = CONTENT.ja.returns.items[i];
  return `${REWARDS[i].price}円 ${kind} ${title}`;
};
const featuredAttrs = (i) => {
  const reward = REWARDS.find((r) => r.image === FEATURED_IMAGES[i]);
  return checkoutAttrs(CONTENT.ja.join.featured[i].title, reward ? reward.price : 0);
};

const Lines = ({ lines }) => lines.map((line) => <span className="ln" key={line}>{line}</span>);

// Amount with a language-specific prefix (¥) or trailing unit (円 / 人).
const Money = ({ parts, unitTag: Unit = 'span', unitClass }) => (
  <>{parts.prefix}{parts.value}{parts.unit && <Unit className={unitClass}>{parts.unit}</Unit>}</>
);

export function App() {
  const [lang, setLang] = useLanguage();
  const t = CONTENT[lang];
  const [slideIndex, setSlideIndex] = useState(0);
  const [showBar, setShowBar] = useState(false);
  const [fundData, setFundData] = useState({
    totalAmount: 0,
    supportersCount: 0,
    percentage: 0,
    asOf: new Date(2026, 8, 10),
    itemSales: {},
  });

  useEffect(() => {
    let isMounted = true;
    fetch(`${FUND_API_ORIGIN}/api/fund-summary`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!isMounted || !data) return;
        const totalAmount = Number(data.totalAmount) || 0;
        setFundData({
          totalAmount,
          supportersCount: Number(data.supportersCount) || 0,
          percentage: Math.min(100, Math.round((totalAmount / TARGET_AMOUNT) * 1000) / 10),
          asOf: data.updatedAt ? new Date(data.updatedAt) : new Date(),
          itemSales: data.itemSales || {},
        });
      })
      .catch((err) => {
        // Keep initial fallback figures gracefully if offline or in dev
        console.warn('Real-time fund summary fetch:', err.message);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const scrollToHash = () => {
      const id = window.location.hash.slice(1);
      if (!id) return;
      window.requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ block: 'start' });
      });
    };

    scrollToHash();
    window.addEventListener('hashchange', scrollToHash);
    return () => window.removeEventListener('hashchange', scrollToHash);
  }, []);

  useEffect(() => {
    const hero = document.getElementById('top');
    if (!hero || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowBar(!entry.isIntersecting),
      { rootMargin: '-140px 0px 0px 0px' },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);
  useEffect(() => listenCheckoutClicks(), []);
  useEffect(() => observeRewardsView(document.getElementById('returns')), []);

  const [menuOpen, setMenuOpen] = useState(false);
  const go = () => {
    setMenuOpen(false);
    document.querySelector('#returns')?.scrollIntoView({ behavior: 'smooth' });
  };
  const goStory = () => {
    setMenuOpen(false);
    document.querySelector('#story')?.scrollIntoView({ behavior: 'smooth' });
  };

  const navLinks = [
    ['#story', t.nav.story],
    ['#beers', t.nav.beers],
    ['#returns', t.nav.returns],
    ['#recovery', t.nav.recovery],
    ['#faq', t.nav.faq],
  ];
  const statusText = (current) => {
    if (fundData.percentage >= 100) return t.hero.achieved;
    return fundData.totalAmount > 0 ? current(fundData.percentage) : t.hero.starting;
  };

  return <main>
    <header className={`site-header ${showBar ? 'header-scrolled' : ''}`}>
      <a className="brand" href="#top"><span className="brand-mark" aria-hidden="true">YAGIRI<br />BREWERY</span><span className="brand-text"><strong>{t.header.brandName}</strong><small>YAGIRI BREWERY</small></span></a>
      <nav className={menuOpen ? 'nav-open' : ''}>
        {navLinks.map(([href, label]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
      </nav>
      <div className="header-actions">
        <LanguageSwitch lang={lang} onChange={setLang} label={t.langSwitch.groupLabel} />
        <button className="primary small header-cta" onClick={go} {...GENERAL_CTA}>{t.header.cta}</button>
      </div>
      <button
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? t.header.closeMenu : t.header.openMenu}
        aria-expanded={menuOpen}
      >
        <span />
        <span />
        <span />
      </button>
    </header>

    {menuOpen && (
      <div className="mobile-nav-overlay" onClick={() => setMenuOpen(false)}>
        <div className="mobile-nav-panel" onClick={(e) => e.stopPropagation()}>
          <div className="mobile-nav-top">
            <strong>{t.header.menu}</strong>
            <button className="mobile-nav-close-btn" onClick={() => setMenuOpen(false)} aria-label={t.header.close}>✕</button>
          </div>
          <nav className="mobile-nav-list">
            {navLinks.map(([href, label]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
            <a href={OFFICIAL_URL} target="_blank" rel="noopener noreferrer">{t.nav.official}</a>
          </nav>
          <button className="primary" onClick={go} style={{ marginTop: '20px', width: '100%' }} {...GENERAL_CTA}>{t.header.mobileCta}</button>
        </div>
      </div>
    )}

    <section id="top" className="hero-v4">
      {/* 1. Auto-sliding Real Photos Hero Stage (100% clean photos, no text inside) */}
      <div className="hero-v4-stage">
        {/* Sliding photos */}
        {HERO_SLIDES.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={t.hero.slideAlts[i]}
            className={`hero-stage-bg ${slideIndex === i ? 'active' : ''}`}
            fetchPriority={i === 0 ? 'high' : 'auto'}
            decoding="async"
          />
        ))}

        {/* Slide pagination dots */}
        <div className="hero-slide-dots">
          {HERO_SLIDES.map((src, i) => (
            <button
              key={src}
              className={`slide-dot ${slideIndex === i ? 'active' : ''}`}
              onClick={() => setSlideIndex(i)}
              aria-label={t.hero.slideDot(i + 1)}
            />
          ))}
        </div>
      </div>

      {/* 2. Damage Highlights & Stats Card Block (Real Photos) */}
      <div className="hero-v4-dashboard">
        {/* Core Project Mission & Catchphrase */}
        <div className="hero-project-intro">
          <h1 className="hero-project-title">
            <span className="title-ln">{t.hero.titleLines[0]}</span>
            <span className="title-ln title-highlight">{t.hero.titleLines[1]}</span>
          </h1>
          <p className="hero-project-lead">
            {t.hero.leadLines.map((line) => <span className="lead-ln" key={line}>{line}</span>)}
          </p>
        </div>

        {/* 3. Primary Orange Heart CTA Button */}
        <div className="hero-v4-cta-wrap">
          <button className="hero-v4-cta-btn" onClick={go} {...GENERAL_CTA}>
            <span className="cta-heart-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </span>
            <div className="cta-text-group">
              <strong className="cta-main-text">{t.hero.ctaMain} <span className="cta-arrow">›</span></strong>
              <small className="cta-sub-text">{t.hero.ctaSub}</small>
            </div>
          </button>
        </div>

        {/* 4. Crowdfunding Metrics Display */}
        <div className="fund-v4-status">
          <div className="fund-v4-figures">
            <div className="fund-v4-col">
              <span className="fund-col-label">{t.hero.goalLabel}</span>
              <strong className="fund-col-val nowrap"><Money parts={t.yen(TARGET_AMOUNT)} unitClass="fund-unit" /></strong>
            </div>
            <div className="fund-v4-col active-highlight">
              <span className="fund-col-label">{t.hero.totalLabel}</span>
              <strong className="fund-col-val accent nowrap"><Money parts={t.yen(fundData.totalAmount)} unitClass="fund-unit" /></strong>
            </div>
            <div className="fund-v4-col">
              <span className="fund-col-label">{t.hero.supportersLabel}</span>
              <strong className="fund-col-val nowrap"><Money parts={t.hero.supporters(fundData.supportersCount)} unitClass="fund-unit" /></strong>
            </div>
            <div className="fund-v4-badge">
              <span className="badge-sub">{t.hero.badgeGoal}</span>
              <strong className="badge-amount"><Money parts={t.yen(TARGET_AMOUNT)} unitTag="small" /></strong>
              <span className="badge-sub">{statusText(t.hero.badgeCurrent)}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="fund-v4-progress-wrap">
            <div
              className="fund-v4-progress-bar"
              role="progressbar"
              aria-label={t.hero.progressLabel}
              aria-valuenow={fundData.percentage}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="fund-v4-progress-fill" style={{ width: `${Math.min(100, fundData.percentage)}%` }} />
            </div>
            <div className="fund-v4-progress-foot">
              <span className="fund-v4-status-text">{statusText(t.hero.statusRate)}</span>
              <span className="fund-v4-date">{t.asOf(fundData.asOf)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Toast Transition Banner */}
      <div className="hero-v4-toast-banner">
        <div className="toast-banner-content">
          <p className="toast-brush-lead">{t.hero.toastLead[0]}<br />{t.hero.toastLead[1]}</p>
          <p className="toast-sub-lead">{t.hero.toastSub[0]}<br className="mobile-only" />{t.hero.toastSub[1]}</p>
          <a href="#story" onClick={goStory} className="toast-scroll-prompt" aria-label={t.hero.scrollAria}>
            <span className="scroll-arrow">⌄</span>
            <span className="scroll-text">SCROLL</span>
          </a>
        </div>
      </div>
    </section>

    <section id="story" className="story section">
      <header className="section-head">
        <p className="section-label">{t.story.label}</p>
        <h2><Lines lines={t.story.heading} /></h2>
      </header>
      <div className="story-body">
      <article>
        {t.story.paragraphs.map((p) => <p key={p}>{p}</p>)}
      </article>
      <div className="story-media">
        <figure>
          <img src="/assets/brewery-before.webp" alt={t.story.before.alt} loading="lazy" decoding="async" />
          <figcaption>{t.story.before.caption}</figcaption>
        </figure>
        <div>
          <figure><img src="/assets/cleanup-keg.webp" alt={t.story.cleanup.alt} loading="lazy" decoding="async" /><figcaption>{t.story.cleanup.caption}</figcaption></figure>
          <figure><img src="/assets/flood-waterline.webp" alt={t.story.waterline.alt} loading="lazy" decoding="async" /><figcaption>{t.story.waterline.caption}</figcaption></figure>
        </div>
      </div>
      </div>
      <div className="taproom">
        <div className="taproom-head">
          <p className="section-label">{t.taproom.label}</p>
          <h3><Lines lines={t.taproom.heading} /></h3>
          <p>{t.taproom.body}</p>
        </div>
        <div className="taproom-grid">
          {TAPROOM_IMAGES.map((src, i) => <figure key={src}><img src={src} alt={t.taproom.photos[i].alt} loading="lazy" /><figcaption>{t.taproom.photos[i].caption}</figcaption></figure>)}
        </div>
      </div>
    </section>

    <section className="damage-story section" id="damage">
      <header>
        <p className="section-label">{t.damage.label}</p>
        <h2><Lines lines={t.damage.heading} /><span className="ln"><em>{t.damage.headingEm}</em></span></h2>
      </header>
      <div className="damage-lead">
        <blockquote><Lines lines={t.damage.quote} /></blockquote>
        <p>{t.damage.lead}</p>
      </div>
      <figure className="damage-photo">
        <img src="/assets/flood-interior-mud.webp" alt={t.damage.photo.alt} loading="lazy" decoding="async" />
        <figcaption>{t.damage.photo.caption}</figcaption>
      </figure>
      <div className="damage-documentary" aria-label={t.damage.documentaryLabel}>
        {DAMAGE_DOC_IMAGES.map((src, i) => <figure key={src}><img src={src} alt={t.damage.documentary[i].alt} loading="lazy" decoding="async" /><figcaption>{t.damage.documentary[i].caption}</figcaption></figure>)}
      </div>
      <div className="damage-details">
        {t.damage.details.map((d) => (
          <article key={d.tag}>
            <span>{d.tag}</span>
            <h3><Lines lines={d.heading} /></h3>
            <p>{d.body}</p>
          </article>
        ))}
      </div>
      <div className="damage-appeal">
        <div>
          <p className="section-label">{t.damage.appeal.label}</p>
          <h3><Lines lines={t.damage.appeal.heading} /></h3>
        </div>
        <div>
          {t.damage.appeal.paragraphs.map((p) => <p key={p}>{p}</p>)}
          <p><strong><Lines lines={t.damage.appeal.ask} /></strong></p>
          <button className="primary" onClick={go} {...GENERAL_CTA}>{t.damage.appeal.cta}</button>
        </div>
      </div>
    </section>

    <section id="recovery" className="recovery section">
      <header className="section-head">
        <p className="section-label">{t.recovery.label}</p>
        <h2><Lines lines={t.recovery.heading} /></h2>
      </header>
      <div className="recovery-body">
      <div className="recovery-copy">
        <p>{t.recovery.intro}</p>
        <ol>
          {t.recovery.items.map((item, i) => <li key={item.title}><span>{String(i + 1).padStart(2, '0')}</span><div><b>{item.title}</b><small>{item.note}</small></div></li>)}
        </ol>
        <p className="total">{t.recovery.totalLabel} <strong>{t.recovery.totalValue}</strong></p>
        <p className="reach">{t.recovery.reach}</p>
      </div>
      <figure className="waterline">
        <img src="/assets/flood-waterline.webp" alt={t.recovery.waterlineAlt} loading="lazy" decoding="async" />
        <figcaption><span>{t.recovery.waterlineLabel}</span><strong>40cm</strong></figcaption>
      </figure>
      </div>
    </section>

    <section className="join section">
      <header><p className="section-label">{t.join.label}</p><h2><Lines lines={t.join.heading} /></h2><p>{t.join.intro}</p></header>
      <div className="featured-grid">
        {t.join.featured.map(({ title, copy, price }, i) => <button key={title} onClick={go} className="featured-card" {...featuredAttrs(i)}>
          <img src={FEATURED_IMAGES[i]} alt={t.join.featuredAlt(title, price)} loading="lazy" decoding="async" />
          <span><b>{title}</b><small>{copy}</small><strong>{price}</strong></span>
        </button>)}
      </div>
      <button className="text-link" onClick={go} {...GENERAL_CTA}>{t.join.seeAll}</button>
    </section>

    <section id="returns" className="returns section">
      <header><p className="section-label">{t.returns.label}</p><h2><Lines lines={t.returns.heading} /></h2><p>{t.returns.intro}</p></header>
      <div className="reward-list">
        {REWARDS.map((reward, i) => {
          const copy = t.returns.items[i];
          const sold = fundData.itemSales[reward.itemId] || 0;
          const currentLeft = Math.max(0, reward.left - sold);
          return (
            <article key={reward.itemId}>
              <img className="reward-image" src={reward.image} alt={copy.alt} loading="lazy" decoding="async" />
              {t.returns.showCaption && (
                <div className="reward-caption">
                  <strong>{t.priceLabel(reward.price)}</strong>
                  <span>{copy.kind}</span>
                  <p>{copy.title}</p>
                </div>
              )}
              <ul className="reward-meta">
                <li>{currentLeft === 0 ? <strong style={{ color: '#dc2626' }}>{t.returns.soldOut}</strong> : t.returns.left(currentLeft)}</li>
                <li>{t.returns.delivery}</li>
              </ul>
              <a className="reward-cta" href={itemUrl(reward.itemId)} target="_blank" rel="noopener noreferrer" {...checkoutAttrs(rewardName(i), reward.price)}>{t.returns.cta}</a>
            </article>
          );
        })}
      </div>
    </section>

    <section className="label-section section">
      <div>
        <p className="section-label">{t.labels.label}</p>
        <h2><Lines lines={t.labels.heading} /></h2>
        <p>{t.labels.body}</p>
      </div>
      <div className="label-types">
        {t.labels.types.map((type) => <article key={type.key}><span>{type.key}</span><b>{type.name}</b><small>{type.note}</small></article>)}
      </div>
    </section>

    <section id="about" className="people section">
      <header className="section-head">
        <p className="section-label">{t.about.label}</p>
        <h2><Lines lines={t.about.heading} /></h2>
      </header>
      <div className="people-body">
      <article>
        {t.about.paragraphs.map((p) => <p key={p}>{p}</p>)}
        <a className="official-link" href={OFFICIAL_URL} target="_blank" rel="noopener noreferrer">{t.about.officialLink}<span aria-hidden="true">↗</span></a>
      </article>
      <div className="people-media">
        <figure className="people-portrait">
          <img src="/assets/watanabe-ishida-team.png" alt={t.about.portrait.alt} loading="lazy" decoding="async" />
          <figcaption>{t.about.portrait.caption}</figcaption>
        </figure>
        <figure className="people-fest">
          <img src="/assets/beerfest-team.webp" alt={t.about.fest.alt} loading="lazy" />
          <figcaption>{t.about.fest.caption}</figcaption>
        </figure>
      </div>
      </div>
      <div className="beliefs">
        {t.about.beliefs.map((b, i) => <article key={b.heading}><span>{String(i + 1).padStart(2, '0')}</span><h3>{b.heading}</h3><p>{b.body}</p></article>)}
      </div>
      <div id="team" className="team-story">
        <div className="team-story-heading">
          <p className="section-label">{t.team.label}</p>
          <h3><Lines lines={t.team.heading} /></h3>
        </div>
        <div className="team-story-copy">
          {t.team.paragraphs.map((p) => <p key={p}>{p}</p>)}
        </div>
        <div className="team-roles">
          {t.team.roles.map((role) => <article key={role.tag}><span>{role.tag}</span><h4>{role.name}</h4><p>{role.body}</p></article>)}
        </div>
        <blockquote><Lines lines={t.team.quote} /></blockquote>
      </div>
    </section>

    <section id="beers" className="beer-section section">
      <header>
        <p className="section-label">{t.beers.label}</p>
        <h2><Lines lines={t.beers.heading} /></h2>
        <p>{t.beers.intro}</p>
      </header>
      <div className="beer-intro">
        {t.beers.audiences.map((a) => <article key={a.heading}><b>{a.heading}</b><p>{a.body}</p></article>)}
      </div>
      <div className="beer-lineup">
        {t.beers.lineup.map((beer) => <article key={beer.name}><div><small>{beer.style}</small><h3>{beer.name}</h3></div><p>{beer.body}</p><span>{beer.note}</span></article>)}
      </div>
    </section>

    <section id="faq" className="guide section">
      <header className="guide-head"><h2>{t.faq.heading}</h2></header>
      <div>
        {t.faq.items.map((item) => <article key={item.q}><b>{item.q}</b><p>{item.a}</p></article>)}
      </div>
      <p className="legal">{t.faq.legal}<br />{t.faq.legalShop.before}<a href={LAW_URL} target="_blank" rel="noopener noreferrer">{t.faq.legalShop.link}</a>{t.faq.legalShop.after}<br />{t.faq.adsNotice}</p>
    </section>

    <section className="closing section">
      <img src="/assets/yagiri-river.png" alt={t.closing.imageAlt} loading="lazy" decoding="async" />
      <div><h2><Lines lines={t.closing.heading} /></h2><p><Lines lines={t.closing.body} /></p><button className="primary" onClick={go} {...GENERAL_CTA}>{t.closing.cta}</button></div>
      <strong>{t.closing.tagline}</strong>
    </section>

    <footer><div><b>{t.footer.company}</b><span>{t.footer.place}</span></div><a className="footer-official" href={OFFICIAL_URL} target="_blank" rel="noopener noreferrer">{t.footer.official}<span aria-hidden="true">↗</span></a></footer>

    <div className={showBar ? 'support-bar show' : 'support-bar'}>
      <div className="support-bar-figure"><small>{t.supportBar.label}</small><strong><Money parts={t.yen(TARGET_AMOUNT)} /></strong></div>
      <p className="support-bar-note">{t.supportBar.note[0]}<br />{t.supportBar.note[1]}</p>
      <button className="primary small" onClick={go} {...GENERAL_CTA}>{t.supportBar.cta}</button>
    </div>

  </main>;
}
