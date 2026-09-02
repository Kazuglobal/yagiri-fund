import { useEffect, useState } from 'react';

const rewards = [
  ['3,000円', '応援枠', 'オリジナルステッカー／タップルーム1杯無料券', '40', '/assets/reward-support.jpg', 'ステッカーとドリンク券、クラフトビールのイメージ', 'https://www.yagiribrewery.com/items/155698632'],
  ['5,000円', '早割', '瓶ビール6本', '30', '/assets/reward-beer-6.jpg', '琥珀色のクラフトビール瓶6本', 'https://www.yagiribrewery.com/items/155699333'],
  ['6,000円', 'ビールで応援', '瓶ビール6本', '80', '/assets/reward-beer-6.jpg', '琥珀色のクラフトビール瓶6本', 'https://www.yagiribrewery.com/items/155699770'],
  ['12,000円', 'ビールで応援', '瓶ビール12本', '30', '/assets/reward-beer-12.jpg', '箱に収めたクラフトビール瓶12本', 'https://www.yagiribrewery.com/items/155699896'],
  ['15,000円', '贈る応援', 'オリジナルラベル瓶ビール6本', '15', '/assets/reward-custom-label.jpg', 'オリジナルラベルを付けたクラフトビールのギフト', 'https://www.yagiribrewery.com/items/155700597'],
  ['20,000円', '醸造所を体験', '醸造所見学プラン 1組2名', '15', '/assets/reward-brewery-tour.jpg', '醸造設備を見学する二人と案内する醸造家', 'https://www.yagiribrewery.com/items/155702192'],
  ['22,000円', '贈る応援', '完全オリジナルラベル瓶ビール6本', '5', '/assets/reward-custom-label.jpg', 'オリジナルラベルを付けたクラフトビールのギフト', 'https://www.yagiribrewery.com/items/155701267'],
  ['25,000円', 'お店で応援', '瓶ビール6本＋お食事券10,000円分', '12', '/assets/reward-dining.jpg', 'クラフトビール瓶と食事、食事券のセット', 'https://www.yagiribrewery.com/items/155702722'],
  ['40,000円', 'お店で応援', '瓶ビール12本＋お食事券20,000円分', '8', '/assets/reward-dining.jpg', 'クラフトビール瓶と食事、食事券のセット', 'https://www.yagiribrewery.com/items/155702823'],
  ['80,000円', 'イベント', '出張タップ 15L樽×2本', '3', '/assets/reward-event-tap.jpg', '出張用の二口ビールタップと15リットル樽2本', 'https://www.yagiribrewery.com/items/155702966'],
  ['100,000円', '一緒につくる', 'オリジナルビール醸造権＋ネーミングライツ', '2', '/assets/reward-brew-day.jpg', '麦芽とホップを確認しながらビールを仕込む様子', 'https://www.yagiribrewery.com/items/155703259'],
  ['300,000円', 'バッチオーナー', 'ケグ納品 15Lワンウェイ樽×11本', '1', '/assets/reward-keg-lot.jpg', '納品用に並べたクラフトビール樽11本', 'https://www.yagiribrewery.com/items/155703648'],
  ['380,000円', 'バッチオーナー', '瓶納品 約500本', '1', '/assets/reward-bottle-lot.jpg', '約500本分のクラフトビールを梱包したケース', 'https://www.yagiribrewery.com/items/155705721'],
];

const gallery = [
  ['/assets/flood-interior-mud.webp', '泥水が引いたあとの醸造所内'],
  ['/assets/flood-waterline.webp', '窓と外壁に残った水位の跡'],
  ['/assets/damaged-cold-room.webp', '浸水でパネルが歪んだプレハブ冷蔵庫'],
];

const featured = [
  ['ビールで応援する', '再開後の一番搾りを、6本まとめてご自宅へ。', '6,000円〜', '/assets/brewery-before.webp'],
  ['醸造所を体験する', '普段は入れない仕込みの現場に、1組2名でご案内。', '20,000円', '/assets/watanabe-ishida-team.png'],
  ['お店で乾杯する', '瓶ビール6本と、お食事券10,000円分。店で会いましょう。', '25,000円〜', '/assets/taproom-toast.png'],
  ['特別な一本を贈る', '名前や記念日を刻んだ、世界に一つのラベルで。', '15,000円〜', '/assets/brewery-before.webp'],
];

export function App() {
  const [photo, setPhoto] = useState(0);
  const [showBar, setShowBar] = useState(false);

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
  const go = () => document.querySelector('#returns')?.scrollIntoView({ behavior: 'smooth' });

  return <main>
    <header className="site-header">
      <a className="brand" href="#top"><span className="brand-mark" aria-hidden="true">YAGIRI<br />BREWERY</span><span className="brand-text"><strong>矢切ブルワリー</strong><small>YAGIRI BREWERY</small></span></a>
      <nav>
        <a href="#story">私たちのストーリー</a>
        <a href="#beers">ビールについて</a>
        <a href="#returns">リターン</a>
        <a href="#recovery">資金の使いみち</a>
        <a href="#faq">ご案内</a>
      </nav>
      <button className="primary small" onClick={go}>支援する</button>
    </header>

    <section id="top" className="hero">
      <div className="hero-copy">
        <p className="eyebrow">矢切ブルワリー 復旧支援プロジェクト</p>
        <h1><span className="ln">水に沈んだ醸造所を、</span><span className="ln">もう一度、動かしたい。</span></h1>
        <p className="hero-lead"><span className="ln">70cmの泥水が、7年分をのみ込みました。</span><span className="ln">保険の基準にあと5cm届かず、補償は0円。</span><span className="ln">それでも、この場所からまた出したい。</span></p>
        <span className="short-rule" />
        <p className="hero-ask">再開までに必要なのは、約180万円です。</p>
        <ul className="hero-tags"><li>#クラフトビール</li><li>#千葉・松戸</li><li>#矢切</li><li>#豪雨被害からの復旧</li></ul>
      </div>
      <div className="hero-visual">
        <img src={gallery[photo][0]} alt={gallery[photo][1]} />
        <aside className="fund-card">
          <div className="fund-total"><small>応援購入総額</small><strong className="tbd">—<span>円</span></strong></div>
          <div
            className="beer-progress"
            role="progressbar"
            aria-label="目標金額に対する達成率"
            aria-valuetext="公開時に入金額と連動します"
            style={{ '--beer-level': '0%' }}
          >
            <div className="beer-progress-glass" aria-hidden="true">
              <span className="beer-progress-liquid">
                <i /><i /><i />
              </span>
            </div>
            <div className="beer-progress-copy">
              <b>CRAFT BEER SUPPORT GAUGE</b>
              <small>応援が集まるほど、グラスが満ちていきます。</small>
            </div>
          </div>
          <ul className="fund-stats">
            <li><small>達成率</small><b className="tbd">—<span>%</span></b></li>
            <li><small>サポーター</small><b className="tbd">—<span>人</span></b></li>
            <li><small>残り</small><b className="tbd">—<span>日</span></b></li>
          </ul>
          <dl className="fund-goals">
            <div><dt>目標金額</dt><dd>1,000,000<span>円</span></dd></div>
            <div><dt>ネクストゴール</dt><dd>2,000,000<span>円</span></dd></div>
          </dl>
          <p className="fund-goal-note">ネクストゴールは、次の豪雨で二度と止めないための設備に充てます。</p>
          <button className="primary" onClick={go}>このプロジェクトを支援する</button>
          <p className="fund-note">「—」は公開時に実績値へ差し替えます。</p>
        </aside>
      </div>
      <div className="hero-thumbs">
        {gallery.map(([src, alt], index) => <button key={src} className={index === photo ? 'active' : ''} onClick={() => setPhoto(index)} aria-label={alt}><img src={src} alt="" /></button>)}
      </div>
    </section>

    <section id="story" className="story section">
      <header className="section-head">
        <p className="section-label">私たちのストーリー</p>
        <h2><span className="ln">はじまりは、江戸川のほとりの</span><span className="ln">小さな醸造所でした。</span></h2>
      </header>
      <ul className="points">
        <li>令和8年の千葉豪雨で最大70cm浸水。麦芽とホップ、ビールにしておよそ5,000杯分の原料を失いました。</li>
        <li>冷蔵庫内の水位は40cm。保険が下りる基準は屋内浸水45cm。5cm届かず、補償は0円でした。</li>
        <li>いただいた応援は、エアコン・冷却器・原料の復旧に充てます。必要額は約180万円です。</li>
      </ul>
      <div className="story-body">
      <article>
        <p>矢切は、川をはさんで東京と向かい合う町です。寅さんの「矢切の渡し」、戦国の古戦場。名前だけは知られていても、わざわざ降りる駅ではありません。2019年、その矢切でビールを仕込みはじめました。</p>
        <p>タップルーム「YAGIRIYA」には、近所の方も、ビールを目当てに電車で来た方も座ります。飲んだ人が「これはどこでつくっているのか」と調べ、矢切まで足を運ぶ。その循環がようやく回りはじめ、松戸西口に2軒目を出す準備を進めていました。</p>
        <p>令和8年の千葉豪雨が重なったのは、その途中でした。泥は設備の内側まで入り込み、洗っても落ちきりません。いまも室温は42℃のまま、仕込みは再開できていません。</p>
      </article>
      <div className="story-media">
        <figure>
          <img src="/assets/brewery-before.webp" alt="被災前の醸造所内" />
          <figcaption>被災前の醸造所。ここで仕込みを重ねてきました。</figcaption>
        </figure>
        <div>
          <figure><img src="/assets/cleanup-keg.webp" alt="浸水した樽を洗浄する様子" /><figcaption>浸水した樽を一本ずつ洗浄しています。</figcaption></figure>
          <figure><img src="/assets/flood-waterline.webp" alt="窓に残った水位の跡" /><figcaption>窓に残った水位の跡。</figcaption></figure>
        </div>
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
        <p>水は醸造所の中を最大70cmまで満たし、3坪のプレハブ冷蔵庫を押し流して大きく歪ませました。中に積んでいた麦芽とホップは、袋のまま泥水をかぶりました。使えなくなった原料は、ビールにしておよそ5,000杯分。仕込む前のビールが、一晩で消えたことになります。</p>
      </div>
      <figure className="damage-photo">
        <img src="/assets/flood-interior-mud.webp" alt="泥水が引いたあとの醸造所内" />
        <figcaption>水が引いたあとの醸造所。写真に写らない設備の内側にも、泥は入り込んでいます。</figcaption>
      </figure>
      <div className="damage-documentary" aria-label="被災状況の記録写真">
        <figure><img src="/assets/flooded-kegs.webp" alt="浸水で倒れた樽" /><figcaption>流され、設備の間に倒れた樽。</figcaption></figure>
        <figure><img src="/assets/flood-waterline.webp" alt="窓に残った浸水ライン" /><figcaption>窓に残った水位の跡。この高さまで水が来ました。</figcaption></figure>
        <figure><img src="/assets/damaged-cold-room.webp" alt="浸水で歪んだプレハブ冷蔵庫" /><figcaption>水に押され、パネルが歪んだプレハブ冷蔵庫。</figcaption></figure>
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
          <h3><span className="ln">待っていてくださる方が、</span><span className="ln">いることだけが支えです。</span></h3>
        </div>
        <div>
          <p>矢切でつくるから、矢切のビールです。この町の名前を背負って出してきた以上、直す場所もここしかありません。</p>
          <p>正直に言えば、自分たちの力だけでは立て直せないところまで来ています。それでも「再開を待っています」「また飲める日を楽しみにしています」と声をかけてくださる方がいます。その一言が、いまの私たちを立たせています。</p>
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
        <p>復旧費用は合計でおよそ180万円。内訳は、なくても醸造できる設備を一つも含んでいません。すべて、安全なビールをつくるために欠かせないものです。</p>
        <ol>
          <li><span>01</span><div><b>エアコン3台の交換</b><small>室温42℃を下げないと仕込めません。80万円以上</small></div></li>
          <li><span>02</span><div><b>冷却器（チラー）の交換</b><small>発酵温度が狂えば、味が再現できません。50万円</small></div></li>
          <li><span>03</span><div><b>原料・清掃・備品</b><small>失った麦芽とホップ、泥の洗浄と消毒。50万円</small></div></li>
        </ol>
        <p className="total">復旧費用の見込み <strong>約180万円</strong></p>
        <p className="reach">6,000円のご支援が167人分集まれば、第一目標の100万円に届きます。</p>
      </div>
      <figure className="waterline">
        <img src="/assets/flood-waterline.webp" alt="窓と外壁に残る浸水の跡" />
        <figcaption><span>浸水の高さ</span><strong>70cm</strong></figcaption>
      </figure>
      </div>
    </section>

    <section className="join section">
      <header><p className="section-label">応援のかたち</p><h2><span className="ln">いただいた応援は、</span><span className="ln">一杯になってお返しします。</span></h2><p>ビールで、醸造所で、お店で。4つの応援のかたちをご用意しました。</p></header>
      <div className="featured-grid">
        {featured.map(([title, copy, price, image]) => <button key={title} onClick={go} className="featured-card">
          <img src={image} alt="" />
          <span><b>{title}</b><small>{copy}</small><strong>{price}</strong></span>
        </button>)}
      </div>
      <button className="text-link" onClick={go}>すべてのリターンを見る</button>
    </section>

    <section id="returns" className="returns section">
      <header><p className="section-label">リターン一覧</p><h2><span className="ln">3,000円から、</span><span className="ln">再開の一部になれます。</span></h2><p>発送は2027年1月以降の予定です。お酒を含むリターンは20歳以上の方に限ります。</p></header>
      <div className="reward-list">
        {rewards.map(([price, kind, title, left, image, alt, url]) => <article key={price + title}>
          <img className="reward-image" src={image} alt={alt} />
          <small className="reward-kind">{kind}</small>
          <strong className="reward-price">{price}</strong>
          <b className="reward-title">{title}</b>
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
          <img src="/assets/watanabe-ishida-team.png" alt="矢切ブルワリーの出店ブースに立つ代表の渡辺と醸造担当の石田" />
          <figcaption>代表 渡辺（右）／ 醸造担当 石田（左）</figcaption>
        </figure>
        <figure>
          <img src="/assets/taproom-toast.png" alt="地域の方々とクラフトビールで乾杯する様子" />
          <figcaption>ビールから生まれる、地域のつながり</figcaption>
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
          <p>いま向き合うのは、自転車ではなく醸造タンクです。役割は違っても、味を決めるときは必ず二人。どちらか一人が納得しただけのビールは、世に出しません。二人ともが「うまい」と言ったものだけを届ける。創業から変えていない、たった一つの基準です。</p>
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
        <article><b>はじめての方へ</b><p>フルーツを使った親しみやすい味わいや、軽やかな飲み口から。苦味が得意でない方にも楽しめる入口を用意しています。</p></article>
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
      <p className="section-label">支援に関するご案内</p>
      <div>
        <article><b>お食事券・1杯無料券</b><p>有効期限は発行から1年です。現金との引き換えはできません。</p></article>
        <article><b>オリジナルビールの制作</b><p>最終的なレシピの決定権は醸造側に残ります。副原料は取り扱い実績のある範囲でのご相談となります。</p></article>
        <article><b>発送について</b><p>瓶の発送は6本単位です。復旧の進捗により発送時期が前後する場合があります。</p></article>
      </div>
      <p className="legal">20歳未満の方の飲酒は法律で禁止されています。有償で提供する場合は、支援者様側に酒類販売業免許が必要です。</p>
    </section>

    <section className="closing section">
      <img src="/assets/yagiri-river.png" alt="夕暮れの矢切周辺を表現した構成イメージ" />
      <div><h2><span className="ln">次の乾杯を、</span><span className="ln">一緒につくりませんか。</span></h2><p><span className="ln">あなたの6,000円が、止まった醸造所を</span><span className="ln">もう一度動かす最初の一押しになります。</span></p><button className="primary" onClick={go}>このプロジェクトを支援する</button></div>
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
