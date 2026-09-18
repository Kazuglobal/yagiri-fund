import assert from "node:assert/strict";
import test from "node:test";
import { ja } from "../src/content/ja.js";
import { en } from "../src/content/en.js";
import { REWARDS, HERO_SLIDES, TAPROOM_IMAGES, DAMAGE_DOC_IMAGES, FEATURED_IMAGES, CAMPAIGN_END_DATE, calculateRemaining } from "../src/content/data.js";

// Walks both dictionaries together and reports every path whose type or
// array length differs, so a missing English string fails loudly instead of
// rendering `undefined` on the page.
function shapeMismatches(a, b, path = "") {
  const kind = (v) => (Array.isArray(v) ? "array" : typeof v);
  if (kind(a) !== kind(b)) return [`${path}: ${kind(a)} vs ${kind(b)}`];
  if (Array.isArray(a)) {
    const own = a.length === b.length ? [] : [`${path}: length ${a.length} vs ${b.length}`];
    return own.concat(a.flatMap((item, i) => (i < b.length ? shapeMismatches(item, b[i], `${path}[${i}]`) : [])));
  }
  if (a && typeof a === "object") {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    return [...keys].flatMap((key) =>
      key in a && key in b ? shapeMismatches(a[key], b[key], `${path}.${key}`) : [`${path}.${key}: missing in ${key in a ? "en" : "ja"}`],
    );
  }
  if (typeof a === "string" && (a.trim() === "" || b.trim() === "")) return [`${path}: empty string`];
  return [];
}

test("ja and en dictionaries have the same shape", () => {
  assert.deepEqual(shapeMismatches(ja, en), []);
});

test("per-item copy lines up with the shared page data", () => {
  for (const [name, dict] of [["ja", ja], ["en", en]]) {
    assert.equal(dict.returns.items.length, REWARDS.length, `${name}: rewards`);
    assert.equal(dict.hero.slideAlts.length, HERO_SLIDES.length, `${name}: hero slides`);
    assert.equal(dict.taproom.photos.length, TAPROOM_IMAGES.length, `${name}: taproom photos`);
    assert.equal(dict.damage.documentary.length, DAMAGE_DOC_IMAGES.length, `${name}: damage photos`);
    assert.equal(dict.join.featured.length, FEATURED_IMAGES.length, `${name}: featured`);
  }
});

test("formatters produce the expected money and date strings", () => {
  assert.deepEqual(ja.yen(1_000_000), { prefix: "", value: "1,000,000", unit: "円" });
  assert.deepEqual(en.yen(1_000_000), { prefix: "¥", value: "1,000,000", unit: "" });
  assert.equal(ja.asOf(new Date(2026, 8, 10)), "2026年9月10日時点");
  assert.equal(en.asOf(new Date(2026, 8, 10)), "As of Sep 10, 2026");
  assert.deepEqual(ja.hero.remainingDays(43), { value: "43", unit: "日" });
  assert.deepEqual(en.hero.remainingDays(43), { value: "43", unit: " days" });
  assert.deepEqual(en.hero.remainingDays(1), { value: "1", unit: " day" });
  assert.deepEqual(ja.hero.remainingHours(12), { value: "12", unit: "時間" });
  assert.deepEqual(en.hero.remainingHours(12), { value: "12", unit: " hrs" });
  assert.deepEqual(en.hero.remainingHours(1), { value: "1", unit: " hr" });
  assert.deepEqual(ja.hero.remainingEnded(), { value: "募集終了", unit: "" });
  assert.deepEqual(en.hero.remainingEnded(), { value: "Ended", unit: "" });
  assert.equal(en.returns.items[0].alt, "¥3,000 Supporter reward: Original sticker + 1 free drink ticket for the taproom");
});

test("calculateRemaining counts down correctly to October 31, 2026 23:59:59", () => {
  const target = new Date("2026-10-31T23:59:59+09:00");
  const onSep18 = calculateRemaining(new Date("2026-09-18T19:31:32+09:00"), target);
  assert.equal(onSep18.ended, false);
  assert.equal(onSep18.days, 43);
  assert.equal(onSep18.hours, 4);

  const onFinalDay = calculateRemaining(new Date("2026-10-31T10:00:00+09:00"), target);
  assert.equal(onFinalDay.ended, false);
  assert.equal(onFinalDay.days, 0);
  assert.equal(onFinalDay.hours, 13);

  const afterEnd = calculateRemaining(new Date("2026-11-01T00:00:01+09:00"), target);
  assert.equal(afterEnd.ended, true);
});

test("English copy keeps the flood measurements straight", () => {
  // 40cm = inside the walk-in cooler, 45cm = insurance threshold (see AGENTS.md)
  const insurance = en.damage.details[0].body;
  assert.match(insurance, /45cm of indoor flooding/);
  assert.match(insurance, /inside our walk-in cooler reached 40cm/);
  assert.doesNotMatch(JSON.stringify(en), /40cm of indoor flooding|indoor flooding (?:of|reached) 40cm/);
  assert.match(en.damage.lead, /4,500 glasses/);
});
