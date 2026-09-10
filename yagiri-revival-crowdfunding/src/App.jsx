import { useEffect, useState } from 'react';

const rewards = [
  ['3,000円', '応援枠', 'オリジナルステッカー／タップルーム1杯無料券', '40', '/assets/reward-3000.png', '3,000円 応援枠 ステッカーとタップルーム1杯無料券のリターン案内', 'https://www.yagiribrewery.com/items/155698632'],
  ['5,000円', '早割', '瓶ビール6本', '30', '/assets/reward-5000.png', '5,000円 早割 瓶ビール6本のリターン案内', 'https://www.yagiribrewery.com/items/155699333'],
  ['6,000円', 'ビールで応援', '瓶ビール6本', '80', '/assets/reward-6000.png', '6,000円 ビールで応援 瓶ビール6本のリターン案内', 'https://www.yagiribrewery.com/items/155699770'],
  ['12,000円', 'ビールで応援', '瓶ビール12本', '30', '/assets/reward-12000.png', '12,000円 ビールで応援 瓶ビール12本のリターン案内', 'https://www.yagiribrewery.com/items/155699896'],
  ['15,000円', '贈る応援', 'オリジナルラベル瓶ビール6本', '15', '/assets/reward-15000.png', '15,000円 贈る応援 オリジナルラベル瓶ビール6本のリターン案内', 'https://www.yagiribrewery.com/items/155700597'],
  ['20,000円', '醸造所を体験', '醸造所見学プラン 1組2名', '15', '/assets/reward-20000.png', '20,000円 醸造所を体験 醸造所見学プランのリターン案内', 'https://www.yagiribrewery.com/items/155702192'],
  ['22,000円', '贈る応援', '完全オリジナルラベル瓶ビール6本', '5', '/assets/reward-22000.png', '22,000円 贈る応援 完全オリジナルラベル瓶ビール6本のリターン案内', 'https://www.yagiribrewery.com/items/155701267'],
  ['25,000円', 'お店で応援', '瓶ビール6本＋お食事券10,000円分', '12', '/assets/reward-25000.png', '25,000円 お店で応援 瓶ビール6本とお食事券10,000円分のリターン案内', 'https://www.yagiribrewery.com/items/155702722'],
  ['40,000円', 'お店で応援', '瓶ビール12本＋お食事券20,000円分', '8', '/assets/reward-40000.png', '40,000円 お店で応援 瓶ビール12本とお食事券20,000円分のリターン案内', 'https://www.yagiribrewery.com/items/155702823'],
  ['80,000円', 'イベント', '出張タップ 15L樽×2本', '3', '/assets/reward-80000.png', '80,000円 イベント 出張タップと15L樽2本のリターン案内', 'https://www.yagiribrewery.com/items/155702966'],
  ['100,000円', '一緒につくる', 'オリジナルビール醸造権＋ネーミングライツ', '2', '/assets/reward-100000.png', '100,000円 一緒につくる オリジナルビール醸造権とネーミングライツのリターン案内', 'https://www.yagiribrewery.com/items/155703259'],
  ['300,000円', 'バッチオーナー', 'ケグ納品 15Lワンウェイ樽×11本', '1', '/assets/reward-300000.png', '300,000円 バッチオーナー 15Lワンウェイ樽11本納品のリターン案内', 'https://www.yagiribrewery.com/items/155703648'],
  ['380,000円', 'バッチオーナー', '瓶納品 約500本', '1', '/assets/reward-380000.png', '380,000円 バッチオーナー 瓶約500本納品のリターン案内', 'https://www.yagiribrewery.com/items/155705721'],
];

const gallery = [
  ['/assets/flood-interior-mud.webp', '泥水が引いたあとの醸造所内'],
  ['/assets/flood-waterline.webp', '窓と外壁に残った水位の跡'],
  ['/assets/damaged-cold-room.webp', '浸水でパネルが歪んだプレハブ冷蔵庫'],
];

const featured = [
  ['ビールで応援する', '再開後の初仕込みビールを、6本まとめてご自宅へ。', '6,000円〜', '/assets/reward-6000.png'],
  ['醸造所を体験する', '普段は入れない仕込みの現場に、1組2名でご案内。', '20,000円', '/assets/reward-20000.png'],
  ['お店で乾杯する', '瓶ビール6本と、お食事券10,000円分。店で会いましょう。', '25,000円〜', '/assets/reward-25000.png'],
  ['特別な一本を贈る', '名前や記念日を刻んだ、世界に一つのラベルで。', '15,000円〜', '/assets/reward-15000.png'],
];

const heroSlides = [
  { src: '/assets/shop_entrance.webp', alt: '矢切ブルワリー YAGIRIYA 店舗外観' },
  { src: '/assets/slide_flooded_kegs.webp', alt: '浸水で倒れ散乱したビール樽と醸造設備' },
  { src: '/assets/damage_tanks.webp', alt: '大切な醸造設備が浸水' },
  { src: '/assets/slide_mud_floor.webp', alt: '泥水が引いたあとの醸造所の床' },
  { src: '/assets/slide_flood_waterline.webp', alt: '外壁と窓に残った浸水水位の跡' },
  { src: '/assets/slide_damaged_coldroom.webp', alt: '水圧で歪んだプレハブ冷蔵庫' },
  { src: '/assets/damage_floor.webp', alt: '床上約40cmの浸水被害' },
  { src: '/assets/damage_kegs.webp', alt: '約5,000杯分の原料・ケグの被害' },
  { src: '/assets/taproom-bar.webp', alt: 'アメリカンヴィンテージのタップルーム店内' },
  { src: '/assets/patrons_cheer.webp', alt: '賑わう店内とお客様の笑顔' },
];

export function App() {
  const [photo, setPhoto] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const [showBar, setShowBar] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % heroSlides.length);
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
  const [menuOpen, setMenuOpen] = useState(false);
  const go = () => {
    setMenuOpen(false);
    document.querySelector('#returns')?.scrollIntoView({ behavior: 'smooth' });
  };
  const goStory = () => {
    setMenuOpen(false);
    document.querySelector('#story')?.scrollIntoView({ behavior: 'smooth' });
  };

  return <main>
    <header className={`site-header ${showBar ? 'header-scrolled' : ''}`}>
      <a className="brand" href="#top"><span className="brand-mark" aria-hidden="true">YAGIRI<br />BREWERY</span><span className="brand-text"><strong>矢切ブルワリー</strong><small>YAGIRI BREWERY</small></span></a>
      <nav className={menuOpen ? 'nav-open' : ''}>
        <a href="#story" onClick={() => setMenuOpen(false)}>私たちのストーリー</a>
        <a href="#beers" onClick={() => setMenuOpen(false)}>ビールについて</a>
        <a href="#returns" onClick={() => setMenuOpen(false)}>リターン</a>
        <a href="#recovery" onClick={() => setMenuOpen(false)}>資金の使いみち</a>
        <a href="#faq" onClick={() => setMenuOpen(false)}>ご案内</a>
      </nav>
      <button className="primary small header-cta" onClick={go}>支援する</button>
      <button
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? 'メニューを閉じる' : 'メニューを開く'}
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
            <strong>メニュー</strong>
            <button className="mobile-nav-close-btn" onClick={() => setMenuOpen(false)} aria-label="閉じる">✕</button>
          </div>
          <nav className="mobile-nav-list">
            <a href="#story" onClick={() => setMenuOpen(false)}>私たちのストーリー</a>
            <a href="#beers" onClick={() => setMenuOpen(false)}>ビールについて</a>
            <a href="#returns" onClick={() => setMenuOpen(false)}>リターン</a>
            <a href="#recovery" onClick={() => setMenuOpen(false)}>資金の使いみち</a>
            <a href="#faq" onClick={() => setMenuOpen(false)}>ご案内</a>
          </nav>
          <button className="primary" onClick={go} style={{ marginTop: '20px', width: '100%' }}>今すぐ支援する</button>
        </div>
      </div>
    )}

    <section id="top" className="hero-v4">
      {/* 1. Auto-sliding Real Photos Hero Stage (100% clean photos, no text inside) */}
      <div className="hero-v4-stage">
        {/* Sliding photos */}
        {heroSlides.map((slide, i) => (
          <img
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            className={`hero-stage-bg ${slideIndex === i ? 'active' : ''}`}
            fetchPriority={i === 0 ? 'high' : 'auto'}
            decoding="async"
          />
        ))}

        {/* Slide pagination dots */}
        <div className="hero-slide-dots">
          {heroSlides.map((slide, i) => (
            <button
              key={slide.src}
              className={`slide-dot ${slideIndex === i ? 'active' : ''}`}
              onClick={() => setSlideIndex(i)}
              aria-label={`スライド ${i + 1}枚目を表示`}
            />
          ))}
        </div>
      </div>

      {/* 2. Damage Highlights & Stats Card Block (Real Photos) */}
      <div className="hero-v4-dashboard">
        {/* Core Project Mission & Catchphrase */}
        <div className="hero-project-intro">
          <h1 className="hero-project-title">
            <span className="title-ln">水に沈んだ醸造所を、</span>
            <span className="title-ln title-highlight">もう一度、動かしたい。</span>
          </h1>
          <p className="hero-project-lead">
            <span className="lead-ln">一晩の泥水が、7年分をのみ込みました。</span>
            <span className="lead-ln">保険の基準にあと5cm届かず、補償は0円。</span>
            <span className="lead-ln">それでも、この場所からもう一度、ビールを届けたい。</span>
          </p>
        </div>

        {/* 3. Primary Orange Heart CTA Button */}
        <div className="hero-v4-cta-wrap">
          <button className="hero-v4-cta-btn" onClick={go}>
            <span className="cta-heart-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </span>
            <div className="cta-text-group">
              <strong className="cta-main-text">今すぐ応援する <span className="cta-arrow">›</span></strong>
              <small className="cta-sub-text">矢切ブルワリーの復旧を支援する</small>
            </div>
          </button>
        </div>

        {/* 4. Crowdfunding Metrics Display (Reset state: funds not started yet) */}
        <div className="fund-v4-status">
          <div className="fund-v4-figures">
            <div className="fund-v4-col">
              <span className="fund-col-label">第1目標金額</span>
              <strong className="fund-col-val nowrap">1,000,000<span className="fund-unit">円</span></strong>
            </div>
            <div className="fund-v4-col active-highlight">
              <span className="fund-col-label">現在の支援総額</span>
              <strong className="fund-col-val accent nowrap">0<span className="fund-unit">円</span></strong>
            </div>
            <div className="fund-v4-col">
              <span className="fund-col-label">支援者数</span>
              <strong className="fund-col-val nowrap">0<span className="fund-unit">人</span></strong>
            </div>
            <div className="fund-v4-badge">
              <span className="badge-sub">目標金額</span>
              <strong className="badge-amount">1,000,000<small>円</small></strong>
              <span className="badge-sub">挑戦スタート！</span>
            </div>
          </div>

          {/* Progress Bar (0%) */}
          <div className="fund-v4-progress-wrap">
            <div
              className="fund-v4-progress-bar"
              role="progressbar"
              aria-valuenow={0}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="fund-v4-progress-fill" style={{ width: '0%' }} />
            </div>
            <p className="fund-v4-date">2026年9月10日時点</p>
          </div>
        </div>
      </div>

      {/* 5. Toast Transition Banner */}
      <div className="hero-v4-toast-banner">
        <div className="toast-banner-content">
          <p className="toast-brush-lead">また、<br />この場所で乾杯しよう。</p>
          <p className="toast-sub-lead">クラフトビールで、<br className="mobile-only" />もっとあたたかい街をつくる。</p>
          <a href="#story" onClick={goStory} className="toast-scroll-prompt" aria-label="ストーリーを読む">
            <span className="scroll-arrow">⌄</span>
            <span className="scroll-text">SCROLL</span>
          </a>
        </div>
      </div>
    </section>

    <section id="story" className="story section">
      <header className="section-head">
        <p className="section-label">私たちのストーリー</p>
        <h2><span className="ln">矢切の一杯を、八柱の</span><span className="ln">小さな醸造所でつくっています。</span></h2>
      </header>
      <div className="story-body">
      <article>
        <p>矢切は、江戸川を挟んで寅さんで有名な葛飾柴又と向かい合う町です。演歌の「矢切の渡し」や映画にもなった小説「野菊の墓」の舞台で知られています。</p>
        <p>2019年、私たちはこの町の名前を掲げてビール造りをはじめました。矢切のタップルーム「YAGIRIYA」でお客さまを迎え、ビールの醸造は同じ松戸市内の八柱にある小さな醸造所です。</p>
        <p>タップルームには、近所の方も、遠方から電車で訪れる方も集まります。飲んだ人が「どこでつくっているんだろう」と興味を持ち、矢切まで足を運んでくれる。その温かい循環がようやく形になり、松戸駅西口に2軒目の店舗を準備していた矢先でした。</p>
        <p>豪雨の泥水が、その八柱の醸造所をのみ込みました。</p>
      </article>
      <div className="story-media">
        <figure>
          <img src="/assets/brewery-before.webp" alt="被災前の醸造所内" loading="lazy" decoding="async" />
          <figcaption>被災前の醸造所。ここで仕込みを重ねてきました。</figcaption>
        </figure>
        <div>
          <figure><img src="/assets/cleanup-keg.webp" alt="浸水した樽を洗浄する様子" loading="lazy" decoding="async" /><figcaption>浸水した樽を一本ずつ洗浄しています。</figcaption></figure>
          <figure><img src="/assets/flood-waterline.webp" alt="外壁と窓に残った屋外の水位の跡" loading="lazy" decoding="async" /><figcaption>外壁と窓に残った、屋外の水位の跡。</figcaption></figure>
        </div>
      </div>
      </div>
      <div className="taproom">
        <div className="taproom-head">
          <p className="section-label">矢切のタップルーム</p>
          <h3><span className="ln">飲みに来た人が、矢切を</span><span className="ln">知って帰る場所があります。</span></h3>
          <p>「YAGIRIYA」は、クラフトビールとアメリカンヴィンテージが同居するパブリックハウスです。ヴィンテージショップ CANDY STORE ROCK と一緒に店をつくっており、50年代のジュークボックスが鳴るカウンターにお客さんが並びます。ここで一杯飲んだ方々がクラフトビールに興味を持つ矢切ブルワリーに興味を持つ。その入口が、この店です。</p>
        </div>
        <div className="taproom-grid">
          <figure><img src="/assets/taproom-exterior.webp" alt="タップルームYAGIRIYAの外観と看板" loading="lazy" /><figcaption>矢切のタップルーム「YAGIRIYA」。ここが入口です。</figcaption></figure>
          <figure><img src="/assets/taproom-counter.webp" alt="YAGIRIYA店内のカウンターとテーブル席" loading="lazy" /><figcaption>注文はカウンターで。奥までまっすぐ続く、細長い店内。</figcaption></figure>
          <figure><img src="/assets/taproom-bar.webp" alt="YAGIRIYAのバックバーに並ぶアメリカンヴィンテージの雑貨" loading="lazy" /><figcaption>棚に並ぶのは、集めてきたアメリカンヴィンテージ。</figcaption></figure>
          <figure><img src="/assets/taproom-seats.webp" alt="YAGIRIYAのテーブル席と壁のコレクション" loading="lazy" /><figcaption>壁のコレクションを眺めながら、ゆっくり飲めるテーブル席。</figcaption></figure>
          <figure><img src="/assets/taproom-jukebox.webp" alt="店内に置かれた50年代のジュークボックス" loading="lazy" /><figcaption>50年代のジュークボックス。店の音は、ここから鳴ります。</figcaption></figure>
          <figure><img src="/assets/taproom-terrace.webp" alt="YAGIRIYAのテラス席から見た通り" loading="lazy" /><figcaption>外にはテラス席。天気のいい日は、ここで一杯。</figcaption></figure>
        </div>
      </div>
    </section>

    <section className="damage-story section" id="damage">
      <header>
        <p className="section-label">被災したあの夜</p>
        <h2><span className="ln">あの夜、醸造所の中身は</span><span className="ln"><em>すべて泥水に変わりました。</em></span></h2>
      </header>
      <div className="damage-lead">
        <blockquote><span className="ln">「すべてをリセットするような非情なことが、</span><span className="ln">本当に起こりうるのだと思い知らされました。」</span></blockquote>
        <p>敷地に流れ込んだ水は、建物の外壁に高い跡を残しました。醸造所の床には浸水によって物が散乱、3坪のプレハブ冷蔵庫を押し流して大きく歪ませ、庫内には40cmの泥水がたまりました。庫内に積んでいた麦芽とホップは、袋のまま泥水に浸かり、使えなくなった原料はビールにしておよそ5,000杯分。仕込むはずだったビールが、たった一晩で消えてしまいました。</p>
      </div>
      <figure className="damage-photo">
        <img src="/assets/flood-interior-mud.webp" alt="泥水が引いたあとの醸造所内" loading="lazy" decoding="async" />
        <figcaption>水が引いたあとの醸造所。写真に写らない設備の内側にも、泥は入り込んでいます。</figcaption>
      </figure>
      <div className="damage-documentary" aria-label="被災状況の記録写真">
        <figure><img src="/assets/flooded-kegs.webp" alt="浸水で倒れた樽" loading="lazy" decoding="async" /><figcaption>流され、設備の間に倒れた樽。</figcaption></figure>
        <figure><img src="/assets/flood-waterline.webp" alt="外壁と窓に残った屋外の浸水ライン" loading="lazy" decoding="async" /><figcaption>外壁と窓に残った跡。敷地はこの高さまで水に浸かりました。</figcaption></figure>
        <figure><img src="/assets/damaged-cold-room.webp" alt="浸水で歪んだプレハブ冷蔵庫" loading="lazy" decoding="async" /><figcaption>水に押され、パネルが歪んだプレハブ冷蔵庫。</figcaption></figure>
      </div>
      <div className="damage-details">
        <article>
          <span>01 ／ 補償</span>
          <h3><span className="ln">あと5cm。</span><span className="ln">それで補償は0円でした。</span></h3>
          <p>保険が下りる基準は、屋内浸水45cm。冷蔵庫内にたまった水は40cmで、わずか5cm足りませんでした。設備も原料も失ったあとに届いたのは「補償対象外」の一枚です。復旧費用は、すべて自己負担になりました。</p>
        </article>
        <article>
          <span>02 ／ 醸造環境</span>
          <h3><span className="ln">室温42℃。</span><span className="ln">いまは仕込みができません。</span></h3>
          <p>エアコンは3台中2台が停止。残る1台も室外機が水をかぶり、いつ止まってもおかしくありません。発酵温度を保つ冷却器（チラー）も効率が大きく落ちています。この環境では、安全なビールをつくれません。</p>
        </article>
        <article>
          <span>03 ／ 被災のタイミング</span>
          <h3><span className="ln">増やす準備をしていた</span><span className="ln">その足元が崩れました。</span></h3>
          <p>飲んでくださる方が増え、醸造能力を上げるための設備増設を進めていました。つくる量を増やすための投資が、つくれない状態を立て直すための費用に置き換わりました。</p>
        </article>
      </div>
      <div className="damage-appeal">
        <div>
          <p className="section-label">それでも、もう一度</p>
          <h3><span className="ln">待っていてくださる方が、</span><span className="ln">いることが支えです。</span></h3>
        </div>
        <div>
          <p>この醸造所でつくるビールを待っている人がいる。</p>
          <p>正直に言えば、自分たちの力だけでは立て直すのが難しい状態です。それでも「再開を待っています」「また飲める日を楽しみにしています」と声をかけてくださる方がいます。その一言が、いまの私たちを立たせています。</p>
          <p><strong><span className="ln">この場所からもう一度ビールを出すために、</span><span className="ln">どうか、お力を貸していただけないでしょうか。</span></strong></p>
          <button className="primary" onClick={go}>再出発を支援する</button>
        </div>
      </div>
    </section>

    <section id="recovery" className="recovery section">
      <header className="section-head">
        <p className="section-label">資金の使いみち</p>
        <h2><span className="ln">いただいた1円まで、</span><span className="ln">醸造を再開する設備に。</span></h2>
      </header>
      <div className="recovery-body">
      <div className="recovery-copy">
        <p>復旧費用は合計でおよそ180万円。内訳に、無駄なものは一切ありません。すべて、安全でおいしいビールをつくるために不可欠な設備です。</p>
        <ol>
          <li><span>01</span><div><b>エアコン3台の交換</b><small>室温42℃を下げないと仕込めません。80万円以上</small></div></li>
          <li><span>02</span><div><b>冷却器（チラー）の交換</b><small>発酵温度が狂えば、味が再現できません。50万円</small></div></li>
          <li><span>03</span><div><b>原料・清掃・備品</b><small>失った麦芽とホップ、泥の洗浄と消毒。50万円</small></div></li>
        </ol>
        <p className="total">復旧費用の見込み <strong>約180万円</strong></p>
        <p className="reach">6,000円のご支援が167人分集まれば、第一目標の100万円に届きます。</p>
      </div>
      <figure className="waterline">
        <img src="/assets/flood-waterline.webp" alt="プレハブ冷蔵庫の内側に残る浸水の跡" loading="lazy" decoding="async" />
        <figcaption><span>冷蔵庫内の浸水</span><strong>40cm</strong></figcaption>
      </figure>
      </div>
    </section>

    <section className="join section">
      <header><p className="section-label">応援のかたち</p><h2><span className="ln">いただいた応援は、</span><span className="ln">一杯になってお返しします。</span></h2><p>ビールで、醸造所で、お店で。4つの応援のかたちをご用意しました。</p></header>
      <div className="featured-grid">
        {featured.map(([title, copy, price, image]) => <button key={title} onClick={go} className="featured-card">
          <img src={image} alt={`${title}（${price}）のリターン案内`} loading="lazy" decoding="async" />
          <span><b>{title}</b><small>{copy}</small><strong>{price}</strong></span>
        </button>)}
      </div>
      <button className="text-link" onClick={go}>すべてのリターンを見る</button>
    </section>

    <section id="returns" className="returns section">
      <header><p className="section-label">リターン一覧</p><h2><span className="ln">3,000円から、</span><span className="ln">再開への一歩を支えていただけます。</span></h2><p>All-in方式のため、目標未達でもご注文は成立します。発送は2027年1月以降の予定です。お酒を含むリターンは20歳以上の方に限ります。</p></header>
      <div className="reward-list">
        {rewards.map(([price, kind, title, left, image, alt, url]) => <article key={price + title}>
          <img className="reward-image" src={image} alt={alt} loading="lazy" decoding="async" />
          <ul className="reward-meta">
            <li>残り {left}口</li>
            <li>2027年1月以降お届け予定</li>
          </ul>
          <a className="reward-cta" href={url} target="_blank" rel="noopener noreferrer">詳しく見る</a>
        </article>)}
      </div>
    </section>

    <section className="label-section section">
      <div>
        <p className="section-label">オリジナルラベル</p>
        <h2><span className="ln">贈る相手の名前が入った、</span><span className="ln">世界に一つの6本を。</span></h2>
        <p>誕生日、結婚祝い、開店祝いに。15,000円プランは3種類のテンプレートにお名前・日付・ひとことを。22,000円プランは、ご希望を伺って一から制作します。あなたの支援が、そのまま誰かへの贈り物になります。</p>
      </div>
      <div className="label-types">
        <article><span>A</span><b>記念日タイプ</b><small>お名前／日付</small></article>
        <article><span>B</span><b>お名前ロゴタイプ</b><small>漢字2文字／英字</small></article>
        <article><span>C</span><b>熨斗タイプ</b><small>表書き／お名前</small></article>
      </div>
    </section>

    <section id="about" className="people section">
      <header className="section-head">
        <p className="section-label">私たちについて</p>
        <h2><span className="ln">この町を知る入口を、</span><span className="ln">一杯のビールでつくる。</span></h2>
      </header>
      <div className="people-body">
      <article>
        <p>私たちがつくりたかったのは、矢切を知らない人にとっての入口です。歴史や地理から入るのは、少し遠い。けれど一杯のビールなら、飲んだその日から、矢切は自分と関係のある地名になります。</p>
        <p>その入口は、醸造所が止まっているあいだ閉じたままです。町の側から見れば、知られる機会がひとつ減り続けている。私たちが急いでいるのは、そのためです。</p>
      </article>
      <div className="people-media">
        <figure className="people-portrait">
          <img src="/assets/watanabe-ishida-team.png" alt="矢切ブルワリーの出店ブースに立つ代表の渡辺と醸造担当の石田" loading="lazy" decoding="async" />
          <figcaption>代表 渡辺（右）／ 醸造担当 石田（左）</figcaption>
        </figure>
        <figure className="people-fest">
          <img src="/assets/beerfest-team.webp" alt="矢切ビールまつりの現場に集まったスタッフと仲間たち" loading="lazy" />
          <figcaption>矢切ビールまつりの現場で。ビールから生まれる、地域のつながり</figcaption>
        </figure>
      </div>
      </div>
      <div className="beliefs">
        <article><span>01</span><h3>人と人をつなげる。</h3><p>クラフトビールは、ただの飲み物ではありません。隣に座った初対面の人と話が始まる。その一杯を置ける場所を、この町に残したい。</p></article>
        <article><span>02</span><h3>地域の物語を届ける。</h3><p>飲んだ人が矢切の風景を思い浮かべる。そんな一杯を増やすことが、この町が知られるいちばんの近道だと思っています。</p></article>
        <article><span>03</span><h3>革新と、おいしさを両立する。</h3><p>新しい味を試し続けながら、「二人がうまいと思ったものだけを出す」という一線は、7年間一度も譲っていません。</p></article>
      </div>
      <div id="team" className="team-story">
        <div className="team-story-heading">
          <p className="section-label">つくっている二人</p>
          <h3><span className="ln">同じレースを走った二人で、</span><span className="ln">次の一杯を決める。</span></h3>
        </div>
        <div className="team-story-copy">
          <p>矢切ブルワリーを支えているのは、代表の渡辺と、醸造を担当する石田です。二人の出会いは大学の自転車競技部。ともに練習し、同じレースを走った経験から、言葉を尽くさなくても互いの考えを理解できる、厚いチームワークが育ちました。</p>
          <p>いま向き合うのは、自転車ではなく醸造タンクです。役割は違っても、味を決めるときは必ず二人。どちらか一人が納得しただけのビールは、世に出しません。二人そろって「うまい」と納得したものだけを届ける。創業から変えていない、たった一つの基準です。</p>
        </div>
        <div className="team-roles">
          <article><span>REPRESENTATIVE</span><h4>渡辺 ／ 代表</h4><p>矢切という土地と人をつなぎ、ビールをきっかけに新しい出会いが生まれる場所を育てます。</p></article>
          <article><span>BREWER</span><h4>石田 ／ 醸造担当</h4><p>飲みやすさの中に、香りと味わいの奥行きを。初心者にも愛好家にも発見のある一杯を追求します。</p></article>
        </div>
        <blockquote><span className="ln">誰でも楽しめる、おいしいビールを。</span><span className="ln">二人の「うまい」が重なったとき、そのビールは完成します。</span></blockquote>
      </div>
    </section>

    <section id="beers" className="beer-section section">
      <header>
        <p className="section-label">なにをつくっているのか</p>
        <h2><span className="ln">苦いから苦手、を</span><span className="ln">くつがえす一杯を。</span></h2>
        <p>初めての方には「ビールってこんなに飲みやすいんだ」という驚きを。愛好家には「この組み合わせは初めてだ」という発見を。飲みやすさと個性は両立できる。そこだけは、ずっと疑わずにやってきました。以下の4本は、いずれもいまは仕込めません。</p>
      </header>
      <div className="beer-intro">
        <article><b>はじめての方へ</b><p>フルーツを使った親しみやすい味わいや、軽やかな飲み口から。苦味が苦手な方でも楽しめるラインナップを用意しています。</p></article>
        <article><b>愛好家の方へ</b><p>ホップの組み合わせや投入方法、瓶内熟成まで。飲むたびに新しい表情が見つかる、奥行きのある一杯を追求しています。</p></article>
        <article><b>矢切を知らない方へ</b><p>「このビール、どこでつくっているんだろう」。印象に残る味わいから、この町を知るきっかけをつくります。</p></article>
      </div>
      <div className="beer-lineup">
        <article><div><small>HAZY IPA · ALC. 7.0%</small><h3>CANVAS</h3></div><p>Nectaron、Citra、Cryo Citra、Cascadeを贅沢に使用。独自の3回ドライホップ製法で苦味を抑え、柑橘とトロピカルの香りをジューシーに引き出した定番Hazy IPAです。</p><span>トロピカルで芳醇。IPAファンにも。</span></article>
        <article><div><small>GOSE · ALC. 7.0%</small><h3>SUNPARADE</h3></div><p>ライムとグレープフルーツの酸味に、ゴーゼ特有の塩味。フルーツピューレをたっぷり発酵させ、複雑さと爽快感を両立しました。</p><span>軽やかで飲みやすく、最初の一杯にも。</span></article>
        <article><div><small>BELGIAN BROWN ALE · ALC. 8.0%</small><h3>MERCKX 青</h3></div><p>ベルギーの伝統的なブラウンエールをベースに、ウイスキー樽熟成を思わせる芳醇な香りを加えました。瓶内熟成による味の変化も楽しめます。</p><span>ウイスキー好きの方へ。</span></article>
        <article><div><small>SAISON</small><h3>Saison de Bleu</h3></div><p>すっきりとした飲み心地と軽やかな口当たり、ほどよい苦味。食事にも合わせやすく、どんな場面でも選びやすい定番です。</p><span>迷ったときの一杯目に。</span></article>
      </div>
    </section>

    <section id="faq" className="guide section">
      <header className="guide-head"><h2>支援に関するご案内</h2></header>
      <div>
        <article><b>All-in方式です</b><p>目標金額に到達しなかった場合も、集まった金額で復旧を進めます。目標未達を理由としたご注文の取り消し・返金は行いません。</p></article>
        <article><b>キャンセル・返品</b><p>ご注文確定後のお客様都合によるキャンセル・返品はお受けできません。商品に欠陥があった場合はお取り替えいたします。</p></article>
        <article><b>お支払いのタイミング</b><p>ご注文確定時にお支払いが確定します。目標金額の達成を待って決済されるものではありません。</p></article>
        <article><b>発送について</b><p>瓶の発送は6本単位です。発送は2027年1月以降を予定しており、復旧の進捗により前後する場合があります。最新状況は活動報告でお知らせします。</p></article>
        <article><b>お食事券・1杯無料券</b><p>有効期限は発行から1年です。現金との引き換えはできません。</p></article>
        <article><b>オリジナルビールの制作</b><p>品質担保のため、最終的な醸造レシピの決定・調整はブルワリーにお任せいただく形となります。副原料は取り扱い実績のある範囲でのご相談となります。</p></article>
      </div>
      <p className="legal">20歳未満の方の飲酒は法律で禁止されています。20歳未満の方はお酒を含むリターンをご購入いただけません。リターンのお酒を有償で第三者に提供する場合は、支援者様側に酒類販売業免許が必要です。<br />ご注文・決済は矢切ブルワリー公式オンラインショップで行われます。事業者情報・お支払い方法・返品条件の詳細は<a href="https://www.yagiribrewery.com/law" target="_blank" rel="noopener noreferrer">特定商取引法に基づく表記</a>をご確認ください。</p>
    </section>

    <section className="closing section">
      <img src="/assets/yagiri-river.png" alt="夕暮れの矢切周辺を表現した構成イメージ" loading="lazy" decoding="async" />
      <div><h2><span className="ln">次の乾杯を、</span><span className="ln">一緒につくりませんか。</span></h2><p><span className="ln">あなたの温かい一押しが、止まった醸造所を</span><span className="ln">もう一度動かす力になります。</span></p><button className="primary" onClick={go}>このプロジェクトを支援する</button></div>
      <strong>矢切から、また、ビールを。</strong>
    </section>

    <footer><div><b>矢切ブルワリー合同会社 ／ 日暮醸造所</b><span>千葉県松戸市</span></div><p>人物・地域写真の一部は構成イメージです。公開時は実際の写真へ差し替えてください。応援購入総額・達成率・サポーター数・残り日数は未確定のため「—」で表示しています。</p></footer>

    <div className={showBar ? 'support-bar show' : 'support-bar'}>
      <div className="support-bar-figure"><small>第一目標</small><strong>1,000,000<span>円</span></strong></div>
      <p className="support-bar-note">復旧に必要な約180万円のうち、<br />まずは100万円を目指しています。</p>
      <button className="primary small" onClick={go}>このプロジェクトを支援する</button>
    </div>

  </main>;
}
