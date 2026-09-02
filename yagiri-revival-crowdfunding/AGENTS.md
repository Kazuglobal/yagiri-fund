# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Visual identity (durable)

Color and design reference: the brand's own marketplace page
`https://goooods.com/brands/e251415a-de6a-445f-a222-cfce2fff2861`.
Observed there: black circular wordmark (white serif "YAGIRI / BREWERY"), monochrome
white / warm-gray page chrome, ink `#212729`, muted gray `#868e96`, product labels in
white with black type, amber beer as the only warm color.

The prototype palette follows that identity — do not reintroduce the earlier
cream + navy blue scheme:

- `--paper` `#fbfaf8`, `--paper-2` / panel `#f0eeea`, `--white` `#ffffff`
- `--ink` `#212729`; `--navy` is now near-black `#14181a` (buttons, headline, figures); hover `#000`
- `--amber` `#c08a1e` (beer gold: rules, marker highlight, label letters, list numerals)
- `--blue` is now bronze `#8a6314` for small eyebrow/section labels (gold-family but AA-legible at 10–11px)
- `--line` `#e2dfd8`; body grays `#565c60` / `#6b7075` / `#868e96`

The header carries a black circular `.brand-mark` echoing the real logo. Keep the sticky
header opaque (`var(--paper)`) — a translucent header let body copy bleed through the lockup.

## Layout system (durable)

`src/styles.css` is the original concept layer. `src/design-v2.css` is loaded after it
(`main.jsx`) and owns the current design system — edit v2, don't fight the old file.

- **Type scale**: every heading is fluid via CSS vars in `design-v2.css` (`--fs-display`,
  `--fs-hero`, `--fs-h2`, `--fs-h3`, `--fs-body`). Never reintroduce a fixed `34px` heading;
  it breaks between 620px and 1240px where the columns shrink but the type does not.
- **Line breaks**: intended lines are `<span className="ln">` (block + `text-wrap:balance`),
  not `<br>`. A bare `<br>` inside a heading reintroduces 1–2 character orphan lines.
  The only surviving `<br>` is inside `.brand-mark`.
- **Full-width section heads**: story / recovery / people put `.section-label` + `h2` in a
  `<header className="section-head">` above the two-column body (`.story-body`,
  `.recovery-body`, `.people-body`). This is what lets the headings run at display scale.
- **Black grounds** carry the brand: `.facts-band` (damage figures) and `.support-bar`
  (sticky CTA). Keep them; they are the only place the logo's black appears at scale.
- **Full-bleed** uses `margin-inline: calc(50% - 50vw)` + `width:100vw`, which is safe only
  because `body{overflow-x:clip}` is set in `design-v2.css`. Use `clip`, never `hidden` —
  `hidden` would break the sticky header.
- `.closing::after` is a scrim so the white tagline stays legible over the bright sunset photo.

Verification loop used for layout work: render the page in an off-screen iframe at
1920/1600/1440/1280/1180/1024/900/760/620/480/390 and assert (a) no horizontal scroll,
(b) no element with `scrollWidth > clientWidth`, (c) no `.ln` whose last line is under 30%
of its container.

## Copy tone (durable)

This is a disaster-recovery appeal from the brewery's own voice. Never write in the
imperative at the supporter, and never frame the ask by dismissing another form of help.

- Rejected: 「寄付ではなく、先に一杯を買ってください。」 — commands the reader and
  belittles people who would simply donate. Replaced with
  「いただいた応援は、一杯になってお返しします。」
- Rejected: 「一緒につくってください。」 → 「一緒につくりませんか。」

Rule: the brewery promises and invites (お返しします / 〜ませんか / 〜いただけないでしょうか).
It does not instruct (〜してください / 〜すべき) and does not rank the reader's motives.
Facts (金額・日付・被害数値) and quoted statements stay verbatim; only framing is edited.

## Crowdfunding conventions + neutral palette (durable, supersedes earlier palette)

Second reference: a Makuake project page (`makuake.com/project/greendream/`). Structure was
adopted; Makuake's own colors (blue `#4ab3df`, yellow `#f7c600`, all-sans type) were NOT.

Palette moved to the neutral middle ground chosen by the user — the warm cream is gone,
the brand gold and the serif headings stay:

- `--paper` `#ffffff`, `--paper-2` `#fafafa`, `--ink` `#333333`, `--line` `#e5e5e5`
- `--navy` (near-black) `#14181a` and `--amber` (gold) `#c08a1e` unchanged
- Body grays: `#555555` / `#707070` / `#8a8a8a`
- Headings stay Noto Serif JP — do not switch the page to all-sans

`src/design-v3.css` holds the crowdfunding components, loaded after v2:

- `.fund-card` — Makuake-style status panel: 応援購入総額 / 達成率 / サポーター / 残り +
  目標金額 / ネクストゴール + CTA
- `.points` — the three-point summary above the story
- `.reward-list` — reward cards (3-up → 2-up at 1080 → 1-up at 620), replacing the dense table
- `.hero-tags` — plain `#tag` text, not chips

**Placeholder discipline**: 応援購入総額・達成率・サポーター数・残り日数 have no real values.
They render as `—` with class `.tbd`, the panel carries a `.fund-note` saying so, and the
footer repeats it. Never invent a supporter count, a percentage, or a deadline — ask.
Real values currently on the page: 目標金額 1,000,000円 / ネクストゴール 2,000,000円 /
復旧費用 約180万円 / 発送 2027年1月以降 / 残り口数 (from the original reward table).

## Narrative structure (durable)

Sections have distinct jobs. Do not let them re-tell the same beat:

1. **hero** — the conclusion: 70cm / あと5cm・補償0円 / 約180万円
2. **.points** — the same three facts as a scannable summary. Numbers live here.
3. **#story「はじまり」** — place and people, NOT the flood. Answers *why this town*:
   矢切の渡し / 古戦場 / 2019年創業 / YAGIRIYA / the visitor loop / the second shop.
   Ends by placing the rain "in the middle of that".
4. **.facts-band** — the numbers again, but as a visual strip, not prose.
5. **#damage「あの夜」** — detail only: the cooler, the mud, the sacks. Then 補償 / 醸造環境 /
   増設計画. Then the appeal, which opens with why it has to be repaired *here*.
6. **#about** — philosophy only. The town's history belongs to §3; here it is the *entry point*
   argument and what closes while the brewery is stopped.

Known fact, easy to get wrong: **40cm is the water level inside the walk-in cooler**, while the
insurance threshold is **45cm of indoor flooding**, and the brewery flooded to **70cm at its
deepest**. Three different measurements. Writing "屋内の浸水は40cm" breaks the あと5cm story —
this was introduced and reverted once already.

Phrases to keep rationed: 「7年」(hero / facts / beliefs — three, far apart), 「あと5cm」
(hero / facts / damage heading — a deliberate echo), 「その途中」and 「循環」(once each).
