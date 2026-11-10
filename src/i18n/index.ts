import { en } from './en';
import type { Lang } from '../game/types';
import { nationLabel } from './nations';
import { compLabel } from './comps';

// kun engelsk ligger i hovedfilen (forsidens bundle – søgemaskinerne ser engelsk); de øvrige sprog, også dansk,
// hentes først, når de vælges (≈280 KB hver) – ensureLang kaldes før første tegning (main.tsx)
const dicts: Partial<Record<Lang, Record<string, string>>> = { en };
const LAZY: Partial<Record<Lang, () => Promise<Record<string, string>>>> = {
  da: () => import('./da').then((m) => m.da),
  es: () => import('./es').then((m) => m.es), fr: () => import('./fr').then((m) => m.fr), de: () => import('./de').then((m) => m.de),
  it: () => import('./it').then((m) => m.it), pt: () => import('./pt').then((m) => m.pt), tr: () => import('./tr').then((m) => m.tr),
  sv: () => import('./sv').then((m) => m.sv), nb: () => import('./nb').then((m) => m.nb),
};
/** Sørg for, at sprogets tekster er hentet (kaldes ved opstart og ved sprogskift) */
export async function ensureLang(l: Lang): Promise<void> {
  if (dicts[l] || !LAZY[l]) return;
  try { dicts[l] = await LAZY[l]!(); } catch { /* offline uden cache: engelsk bruges i stedet */ }
}
/** Sprogene i spillet og på hjemmesiden (kort kode og navn på sproget selv) */
export const LANGS: [Lang, string, string][] = [['da', 'DA', 'Dansk'], ['de', 'DE', 'Deutsch'], ['en', 'EN', 'English'], ['es', 'ES', 'Español'], ['fr', 'FR', 'Français'], ['it', 'IT', 'Italiano'], ['nb', 'NO', 'Norsk'], ['pt', 'PT', 'Português'], ['sv', 'SV', 'Svenska'], ['tr', 'TR', 'Türkçe']];
export const isLang = (v: unknown): v is Lang => LANGS.some(([k]) => k === v);
/** Sprogets locale til tal og datoer */
export const LOCALE: Record<Lang, string> = { da: 'da-DK', en: 'en-GB', es: 'es-ES', fr: 'fr-FR', de: 'de-DE', it: 'it-IT', pt: 'pt-BR', tr: 'tr-TR', sv: 'sv-SE', nb: 'nb-NO' };
// enheder for store beløb pr. sprog (mia./mio./t.)
const UNITS: Record<Lang, [string, string, string]> = { da: [' mia.', ' mio.', ' t.'], en: ['bn', 'M', 'K'], es: [' mil M', ' M', ' mil'], fr: [' Md', ' M', ' k'], de: [' Mrd.', ' Mio.', ' Tsd.'], it: [' mld', ' mln', ' mila'], pt: [' bi', ' mi', ' mil'], tr: [' Mr', ' Mn', ' B'], sv: [' mdr', ' milj.', ' tn'], nb: [' mrd.', ' mill.', ' k'] };
let lang: Lang = (() => {
  try {
    const v = localStorage.getItem('cm0102.lang');
    if (isLang(v)) return v;
  } catch { /* ingen storage */ }
  // engelsk er standard for alle – dansk kun når man selv vælger det
  return 'en';
})();
try { document.documentElement.lang = lang; } catch { /* ingen DOM */ }

/** Landenavn på det valgte sprog (databasens navne er engelske) */
export function natName(name: string | undefined): string {
  return nationLabel(name, lang);
}

/** Liga-/turneringsnavn på det valgte sprog (CM-databasernes navne er engelske) */
export function compName<T extends string | undefined>(name: T): T {
  return compLabel(name, lang);
}

export function getLang(): Lang {
  return lang;
}

export function setLang(l: Lang) {
  lang = l;
  // uden et eget valg følger valutaen sproget
  if (!chosen) currency = langCurrency();
  try { document.documentElement.lang = l; } catch { /* ingen DOM */ }
  try { localStorage.setItem('cm0102.lang', l); } catch { /* ignore */ }
  // et sprog, der hentes: tegn siden igen, når teksterne er kommet (indtil da vises engelsk)
  if (!dicts[l]) void ensureLang(l).then(() => { try { window.dispatchEvent(new Event('cm-lang')); } catch { /* ingen DOM */ } });
}

/** Oversæt nøgle med {param}-erstatning. Ukendte nøgler vises som nøglen selv. */
export function t(key: string, params?: Record<string, string | number | undefined>): string {
  let s = dicts[lang]?.[key] ?? dicts.en![key] ?? key;
  if (params) {
    for (let [k, v] of Object.entries(params)) {
      if ((k === 'comp' || k === 'league') && typeof v === 'string') v = compLabel(v, lang);
      s = s.split(`{${k}}`).join(v === undefined ? '' : typeof v === 'number' && (k === 'fee' || k === 'wage' || k === 'balance') ? money(v) : String(v));
    }
  }
  return s;
}

export function has(key: string): boolean {
  return key in (dicts[lang] ?? {}) || key in dicts.en!;
}

export type Currency = 'EUR' | 'DKK' | 'GBP' | 'BRL' | 'TRY' | 'SEK' | 'NOK';
// én valuta pr. sprog: euro (de/es/fr/it), kroner (da/sv/nb), pund (en), real (pt – oversættelsen er brasiliansk) og lira (tr)
export const CURRENCIES: Currency[] = ['EUR', 'DKK', 'GBP', 'SEK', 'NOK', 'BRL', 'TRY'];
// Faste kurser (spillets interne beløb er i euro)
// (real og lira: faste kurser, *estimeret* efter niveauet i 2026)
const RATE: Record<Currency, number> = { EUR: 1, DKK: 7.46, GBP: 0.86, SEK: 11.1, NOK: 11.6, BRL: 6.2, TRY: 46 };
// valgt valuta (gemt) – ellers sprogets: dansk kroner, engelsk pund (som i CM 01/02), øvrige euro
let chosen: Currency | null = (() => {
  try {
    const v = localStorage.getItem('cm0102.currency');
    if ((CURRENCIES as string[]).includes(v ?? '')) return v as Currency;
  } catch { /* ingen storage */ }
  return null;
})();
const langCurrency = (): Currency => (lang === 'da' ? 'DKK' : lang === 'en' ? 'GBP' : lang === 'sv' ? 'SEK' : lang === 'nb' ? 'NOK' : lang === 'pt' ? 'BRL' : lang === 'tr' ? 'TRY' : 'EUR');
let currency: Currency = chosen ?? langCurrency();

export function getCurrency(): Currency {
  return currency;
}

export function setCurrency(c: Currency) {
  currency = c;
  chosen = c;
  try { localStorage.setItem('cm0102.currency', c); } catch { /* ignore */ }
}

/** Euro → valgt valuta (til inputfelter) */
export function toCur(eur: number): number {
  return Math.round(eur * RATE[currency]);
}

/** Valgt valuta → euro (med decimaler) */
export function fromCurExact(v: number): number {
  return Math.round((v / RATE[currency]) * 100) / 100;
}

/** Valgt valuta → euro */
export function fromCur(v: number): number {
  return Math.round(v / RATE[currency]);
}

export function currencySymbol(): string {
  return currency === 'DKK' ? 'kr.' : currency === 'SEK' || currency === 'NOK' ? 'kr' : currency === 'GBP' ? '£' : currency === 'BRL' ? 'R$' : currency === 'TRY' ? '₺' : '€';
}

export function money(eur: number): string {
  const v = eur * RATE[currency];
  const neg = v < 0;
  const a = Math.abs(v);
  const loc = LOCALE[lang];
  const [bn, mn, th] = UNITS[lang];
  const dec = (n: number, d: number) => n.toLocaleString(loc, { minimumFractionDigits: d, maximumFractionDigits: d });
  let num: string;
  let unit = '';
  if (a >= 1_000_000_000) { num = dec(a / 1_000_000_000, 2); unit = bn; }
  else if (a >= 1_000_000) { num = dec(a / 1_000_000, a >= 10_000_000 ? 1 : 2); unit = mn; }
  else if (a >= 100_000) { num = dec(Math.round(a / 1000), 0); unit = th; }
  else num = dec(currency === 'EUR' ? Math.round(a) : Math.round(a / 10) * 10, 0);
  let s: string;
  if (currency === 'DKK') s = `${num}${unit} kr.`;
  else if (currency === 'SEK' || currency === 'NOK') s = `${num}${unit} kr`;
  else if (currency === 'BRL') s = `R$ ${num}${unit}`;
  else s = `${currencySymbol()}${num}${unit}`;
  return (neg ? '-' : '') + s;
}

/** Hele beløbet uden forkortelse (CM 01/02: "£22,000,000") */
export function moneyFull(eur: number): string {
  const v = Math.round(eur * RATE[currency]);
  const num = Math.abs(v).toLocaleString(LOCALE[lang]);
  return (v < 0 ? '-' : '') + (currency === 'DKK' ? `${num} kr.` : currency === 'SEK' || currency === 'NOK' ? `${num} kr` : currency === 'BRL' ? `R$ ${num}` : `${currencySymbol()}${num}`);
}

export function dateFmt(iso: string, long = false): string {
  const d = new Date(iso + 'T00:00:00Z');
  return d.toLocaleDateString(LOCALE[lang], { day: 'numeric', month: long ? 'long' : 'short', year: 'numeric', weekday: long ? 'short' : undefined, timeZone: 'UTC' });
}
