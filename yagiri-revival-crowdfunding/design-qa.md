# Design QA

## 2026-08-30 実写写真への差し替え

- 提供された24枚から、被災前の醸造所、泥の残る床、倒れた樽、窓の水位跡、歪んだ冷蔵庫、樽の洗浄作業の6枚を採用。
- WebP（長辺1800px）へ最適化し、各画像は約195KB〜622KB。元写真の縦横比と内容を保持している。
- ヒーロー3枚、ストーリー3枚、被災記録4枚、資金用途の水位写真を実写へ更新。
- 1440×1000: 全画像の読み込み完了、横オーバーフローなし。被災記録の3列表示を確認。
- 390×844: 全画像の読み込み完了、横オーバーフローなし。被災記録が1列へ切り替わることを確認。
- ブラウザのerror / warningログ: 0件。
- Vite本番ビルド: 成功。

final result: passed

## Comparison target

- Source visual truth: `C:\Users\s1598\.codex\attachments\b8af4271-2482-4186-98ed-f9ccb12f5224\image-1.png`
- Source pixels: 628 × 472 px
- Implementation screenshots:
  - `C:\Users\s1598\Documents\ChatGPT\yagiri-2\yagiri-revival-crowdfunding\qa-about-final.png`
  - `C:\Users\s1598\Documents\ChatGPT\yagiri-2\yagiri-revival-crowdfunding\qa-about-focus.png`
  - `C:\Users\s1598\Documents\ChatGPT\yagiri-2\yagiri-revival-crowdfunding\qa-about-mobile.png`
- Desktop viewport / capture: 1536 × 639 CSS px, device density 1
- Mobile viewport / capture: 390 × 844 CSS px, device density 1
- State: 「私たちについて」人物写真とキャプションを表示した通常状態

## Full-view comparison evidence

人物写真は加工済みの代替画像ではなく、提供された628 × 472 pxの実写真をそのまま使用している。デスクトップでは人物二名、YAGIRI breweryのブース名、販売ブースの文脈が同時に残る4:3寄りのトリミングになっている。スマートフォンでは横幅331.2 px・高さ230 pxで表示され、左右の人物、顔、エプロン、ブランド名が欠けていない。横方向のページオーバーフローは両表示で発生していない。

## Focused region comparison evidence

`qa-about-focus.png` で人物写真と直後のキャプションを重点確認した。原写真の主題である渡辺氏と石田氏が同じ重要度で見え、写真下に「代表 渡辺（左）／ 醸造担当 石田（右）」を追加したことで、元写真だけでは伝わらない人物識別が補われている。実写真の色調・解像感・ロゴ表記に不要な加工や差し替えはない。

## Required fidelity surfaces

- Fonts and typography: 既存のNoto Serif JP / Noto Sans JPの階層を維持。キャプションは本文より小さい10px、十分な行間で補助情報として表示される。
- Spacing and layout rhythm: デスクトップは本文と写真群の2カラム、モバイルは1カラムへ自然に切り替わる。写真間8px、キャプション上9pxで既存の編集的なリズムに適合する。
- Colors and visual tokens: 既存の生成り背景、濃紺、アンバーのトークンを変更せず、実写真の黒いテントとエプロンがページの落ち着いた色調に馴染む。
- Image quality and asset fidelity: 提供された実写真を直接使用。自然寸法628 × 472 pxを確認済み。顔やブランド名の欠落、引き伸ばし、透明ハロー、代替図形はない。
- Copy and content: 人物の役割を実際の写真に対応させたキャプションを追加。既存の「代表の渡辺と醸造担当の石田」という本文と整合する。

## Findings

- P0/P1/P2の修正事項なし。
- P3: 将来、より高解像度の同一写真が用意できる場合は大型ディスプレイ向けに差し替えると、さらに精細になる。

## Primary interactions and runtime checks

- ヘッダーの「支援する」ボタンを操作し、`#returns` がビューポート上端へ移動することを確認。
- `http://127.0.0.1:4173/#about` を直接開き、固定ヘッダー下の73.5px位置へ人物紹介が表示されることを確認。
- デスクトップと390px幅で横スクロールがないことを確認。
- ブラウザコンソールのerrorログ: 0件。
- Vite本番ビルド: 成功。

## Comparison history

- 初回比較: 実写真の人物とブランド名はデスクトップ／モバイルの双方で保持されていた。一方、直接URLの `#about` が人物紹介へ移動しないP2導線不具合を確認。
- 修正: 初期表示と`hashchange`時に対象要素へ移動する処理、および固定ヘッダー分の`scroll-margin-top`を追加。
- 修正後比較: `qa-about-final.png` で人物紹介の見出し・実写真・キャプションが固定ヘッダーに隠れず表示され、横オーバーフローとコンソールエラーがないことを確認。

## Implementation checklist

- [x] 実写真をローカル資産として配置
- [x] 「私たちについて」に人物名キャプション付きで掲載
- [x] 醸造所見学プランとストーリー内の人物画像にも反映
- [x] デスクトップ／モバイル表示確認
- [x] 支援CTA動作確認
- [x] 人物紹介の直接リンク動作確認
- [x] 本番ビルド確認

final result: passed
