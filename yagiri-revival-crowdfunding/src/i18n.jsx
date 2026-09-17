import { useEffect, useState } from 'react';
import { ja } from './content/ja.js';
import { en } from './content/en.js';

export const CONTENT = { ja, en };
export const LANGS = ['ja', 'en'];
const DEFAULT_LANG = 'ja';
const STORAGE_KEY = 'yagiri-lang';

const isLang = (value) => LANGS.includes(value);

// URL (?lang=en) wins so a shared link opens in the language it was shared in;
// otherwise fall back to the visitor's last choice.
function readPreferredLang() {
  const fromUrl = new URLSearchParams(window.location.search).get('lang');
  if (isLang(fromUrl)) return fromUrl;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLang(stored)) return stored;
  } catch {
    // Storage can be blocked (private mode, disabled cookies); the default is fine.
  }
  return DEFAULT_LANG;
}

function persistLang(lang) {
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Not persisting only means the choice is forgotten on the next visit.
  }
  const url = new URL(window.location.href);
  if (lang === DEFAULT_LANG) url.searchParams.delete('lang');
  else url.searchParams.set('lang', lang);
  window.history.replaceState(window.history.state, '', url);
}

// The page is prerendered in Japanese, so the first client render must also be
// Japanese to hydrate cleanly. The stored preference is applied right after.
export function useLanguage() {
  const [lang, setLang] = useState(DEFAULT_LANG);

  useEffect(() => {
    const preferred = readPreferredLang();
    const raw = new URLSearchParams(window.location.search).get('lang');
    if (raw !== null && !isLang(raw)) persistLang(preferred);
    if (preferred === DEFAULT_LANG) return;
    setLang(preferred);
    // Swapping the copy changes text lengths, so a #section link that the browser
    // already scrolled to (in Japanese) would drift. Re-anchor after the re-render.
    const id = window.location.hash.slice(1);
    if (id) {
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ block: 'start' });
      }));
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = CONTENT[lang].htmlLang;
    document.title = CONTENT[lang].documentTitle;
  }, [lang]);

  const changeLang = (next) => {
    if (!isLang(next) || next === lang) return;
    setLang(next);
    persistLang(next);
  };

  return [lang, changeLang];
}

export function LanguageSwitch({ lang, onChange, label }) {
  return (
    <div className="lang-switch" role="group" aria-label={label}>
      <button type="button" lang="ja" aria-pressed={lang === 'ja'} onClick={() => onChange('ja')}>
        日本語
      </button>
      <button type="button" lang="en" aria-pressed={lang === 'en'} aria-label="English" onClick={() => onChange('en')}>
        EN
      </button>
    </div>
  );
}
