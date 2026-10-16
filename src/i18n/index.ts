import { da } from './da';
import { en } from './en';
import type { Lang } from '../game/types';

const dicts: Record<Lang, Record<string, string>> = { da, en };
let lang: Lang = (() => {
  try {
    const v = localStorage.getItem('cm0102.lang');
    if (v === 'da' || v === 'en') return v;
  } catch { /* ingen storage */ }
  return navigator.language?.startsWith('da') ? 'da' : 'en';
})();

export function getLang(): Lang {
  return lang;
}

export function setLang(l: Lang) {
  lang = l;
  try { localStorage.setItem('cm0102.lang', l); } catch { /* ignore */ }
}

/** Oversæt nøgle med {param}-erstatning. Ukendte nøgler vises som nøglen selv. */
export function t(key: string, params?: Record<string, string | number | undefined>): string {
  let s = dicts[lang][key] ?? dicts.en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      s = s.split(`{${k}}`).join(v === undefined ? '' : typeof v === 'number' && k === 'fee' ? money(v) : String(v));
    }
  }
  return s;
}

export function has(key: string): boolean {
  return key in dicts[lang] || key in dicts.en;
}

export function money(v: number): string {
  const neg = v < 0;
  const a = Math.abs(v);
  let s: string;
  if (a >= 1_000_000) {
    s = `€${(a / 1_000_000).toFixed(a >= 10_000_000 ? 1 : 2)}${lang === 'da' ? ' mio.' : 'M'}`;
    if (lang === 'da') s = s.replace('.', ',');
  }
  else if (a >= 100_000) s = `€${Math.round(a / 1000)}${lang === 'da' ? ' t.' : 'K'}`;
  else if (a >= 1000) s = `€${Math.round(a).toLocaleString(lang === 'da' ? 'da-DK' : 'en-GB')}`;
  else s = `€${Math.round(a)}`;
  return (neg ? '-' : '') + s;
}

export function dateFmt(iso: string, long = false): string {
  const d = new Date(iso + 'T00:00:00Z');
  return d.toLocaleDateString(lang === 'da' ? 'da-DK' : 'en-GB', { day: 'numeric', month: long ? 'long' : 'short', year: 'numeric', weekday: long ? 'short' : undefined, timeZone: 'UTC' });
}
