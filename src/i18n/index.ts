import { en } from './en';
import type { Lang } from '../game/types';
import { nationLabel } from './nations';
import { compLabel } from './comps';
import { loadBoardPack } from './boardPack';

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
  if (!LAZY[l]) return;
  // bestyrelsens tekster (en lille pakke pr. sprog) hentes sammen med sprogets tekster
  const board = loadBoardPack(l);
  if (!dicts[l]) { try { dicts[l] = await LAZY[l]!(); } catch { /* offline uden cache: engelsk bruges i stedet */ } }
  await board;
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

/** CM 01/02: beløb vises rundet i den viste valuta med originalens trin (Cash 0x4426e0 – 15.000.000 kr., ikke 18.069.768 kr.); slås til i
 *  ægte tilstand af Shell (i18n må ikke importere motoren, så trinnet står her) */
let roundCash = false;
export function setMoneyRounding(on: boolean) { roundCash = on; }
const cashStepOf = (x: number) => x <= 10_000 ? 1000 : x <= 30_000 ? 2000 : x <= 100_000 ? 5000 : x <= 250_000 ? 10_000 : x <= 1_000_000 ? 25_000
  : x <= 5_000_000 ? 100_000 : x <= 20_000_000 ? 250_000 : x <= 50_000_000 ? 500_000 : 1_000_000;
// trinnene og grænserne står i valutaens enhed 0xad9cc0 (DKK/NOK/SEK 10, TRY 1.000.000) – 0x4426e0 ganger begge med den
const shown = (v: number) => { if (!roundCash) return v; const a = Math.abs(v), u = CASH_CUR[currency].unit, st = cashStepOf(a / u) * u; return Math.sign(v) * Math.round(a / st) * st; };
/** 0x4426e0 med flagbit 8 (små beløb: løn, bonusser) – i valutaens enhed. NB: 50.000-100.000 giver 5.000 (originalens tabel 0x9688e8). */
const cashStep8 = (x: number) => x <= 10 ? 1 : x <= 100 ? 5 : x <= 250 ? 10 : x <= 1000 ? 25 : x <= 5000 ? 100 : x <= 20_000 ? 250 : x <= 50_000 ? 500
  : x <= 100_000 ? 5000 : x <= 250_000 ? 10_000 : x <= 1_000_000 ? 25_000 : x <= 5_000_000 ? 100_000 : x <= 20_000_000 ? 250_000 : x <= 50_000_000 ? 500_000 : 1_000_000;

/** Klassisk udseende: money/moneyFull og moneyCm viser beløbene som originalens cash_format_money 0x441c10 (sættes af Shell) */
let cashStyle = false;
export function setCashStyle(on: boolean) { cashStyle = on; }
export const cashStyleOn = () => cashStyle;

/** Cash::get_display_amount 0x43f460(flags): uden 0x20 rundet til trinnet 0x4426e0 (bit 4: tabellen for store beløb, bit 8: små beløb,
 *  ellers 1000) – grænser og trin × valutaens enhed; (v + trin/2) / trin × trin med heltalsdivision. Positive beløb (fortegnet er kalderens). */
export function cashRound(v: number, flags: number, cur: Currency = currency): number {
  if (flags & 0x20) return v;
  const u = CASH_CUR[cur].unit;
  const st = flags & 4 ? cashStepOf(v / u) * u : flags & 8 ? cashStep8(v / u) * u : 1000;
  return Math.trunc((v + Math.trunc(st / 2)) / st) * st;
}

/** Et beløb i € som originalen: 0x43f460(flags) + 0x441c10(flags) – flagbit 2 = fuldt. `fit`: originalens mønster "fuldt, men over `fit`
 *  tegn forkortet" (fx kontraktskærmen 0x4e06e0: 6 → 5 / 0xA → 9 over 8 tegn). Negative beløb med '-' foran. */
export function cashMoney(eur: number, flags: number, fit = 0, cur: Currency = currency): string {
  const v = Math.round(eur * RATE[cur]);
  const a = Math.abs(v);
  let s = cashFormat(cashRound(a, flags, cur), (flags & 2) !== 0, cur);
  if (fit && s.length > fit) s = cashFormat(cashRound(a, (flags & ~2) | 1, cur), false, cur);
  return (v < 0 ? '-' : '') + s;
}

/** Klassisk udseende: originalens visning med de givne flag (se cashMoney); ellers det moderne money() */
export function moneyCm(eur: number, flags: number, fit = 0): string {
  return cashStyle ? cashMoney(eur, flags, fit) : money(eur);
}
/** Ugeløn/bonus som originalen (0x85e750/0x85f830: flag 0xA = fuldt, rundet med småbeløbstabellen); `fit` = over så mange tegn forkortet (lister og kontraktskærmen: 8) */
export const moneyWage = (eur: number, fit = 0) => moneyCm(eur, 0xa, fit);

export function money(eur: number): string {
  if (cashStyle) return cashMoney(eur, 5); // flag 5: forkortet + rundet (originalens almindelige i lister)
  const v = shown(eur * RATE[currency]);
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
  if (cashStyle) return cashMoney(eur, 6); // flag 6: fuldt + rundet
  const v = Math.round(shown(eur * RATE[currency]));
  const num = Math.abs(v).toLocaleString(LOCALE[lang]);
  return (v < 0 ? '-' : '') + (currency === 'DKK' ? `${num} kr.` : currency === 'SEK' || currency === 'NOK' ? `${num} kr` : currency === 'BRL' ? `R$ ${num}` : `${currencySymbol()}${num}`);
}

/** Originalens valutatabel (Cash 0x43f7f0(id) – unicorn-kørsel af exe'en): foran (0xad9ca8), efter (0xad9c70, kun fulde tal/under 1000),
 *  tusindtalsseparator (0xad9ca2), decimaltegn (0xad9cc8), enhederne K/M/B/T (0xad9d00/0xad9d68/0xad9ccc/0xad9d34 – med valutaen) og
 *  trinenheden til afrundingen (0xad9cc0). Id: GBP 0, DKK 6, EUR 7 (tegn 0xA4 = €, "€uro"), NOK 16, SEK 21, BRL 4, TRY 23. */
const CASH_CUR: Record<Currency, { pre: string; suf: string; sep: string; dec: string; K: string; M: string; B: string; T: string; unit: number }> = {
  EUR: { pre: '€', suf: '', sep: ',', dec: '.', K: 'K', M: 'M', B: 'B', T: 'T', unit: 1 },
  DKK: { pre: '', suf: 'DKr', sep: '.', dec: ',', K: 'K Dkr', M: 'M Dkr', B: 'B Dkr', T: 'T Dkr', unit: 10 },
  GBP: { pre: '£', suf: '', sep: ',', dec: '.', K: 'K', M: 'M', B: 'B', T: 'T', unit: 1 },
  SEK: { pre: '', suf: ' :-', sep: ' ', dec: ',', K: ' TKr', M: ' MKr', B: ' BKr', T: ' TKr', unit: 10 },
  NOK: { pre: 'Kr ', suf: '', sep: ',', dec: ',', K: ' K', M: ' M', B: ' B', T: ' T', unit: 10 },
  BRL: { pre: 'R$', suf: ',00', sep: '.', dec: ',', K: 'K', M: 'M', B: 'B', T: 'T', unit: 1 },
  TRY: { pre: '', suf: ' TL', sep: '.', dec: '.', K: ' K', M: ' Milyon', B: ' Milyar', T: ' Trilyon', unit: 1_000_000 },
};

/** cash_format_money 0x441c10(buf, len, v, flags) – heltal i den viste valuta. Kun flagbit 2 bruges: `full` = alle cifre med
 *  tusindtalsseparator + efterstillet valuta ("85.113.190DKr"); ellers forkortet fra 1000: 1-3 heltal, ≤ 2 AFKORTEDE decimaler uden
 *  efterstillede nuller, og enheden (som rummer valutaen): "1,5K Dkr", "388,08M Dkr", "1B Dkr". Negative tal (og ≥ 16 cifre) giver "0"
 *  (cifferløkken stopper) – fortegnet er kalderens sag. Mellemrum skrives som '|' (vises som mellemrum). */
export function cashFormat(v: number, full: boolean, cur: Currency = currency): string {
  const c = CASH_CUR[cur];
  const s = v > 0 ? String(Math.trunc(v)) : '';
  const L = s.length;
  if (L === 0 || L > 15) return `${c.pre}0${c.suf}`;
  if (full) return c.pre + s.replace(/\B(?=(\d{3})+$)/g, c.sep) + c.suf;
  if (L <= 3) return c.pre + s + c.suf;
  const grp = Math.floor((L - 1) / 3); // 1 = K, 2 = M, 3 = B, 4 = T
  const n = L - grp * 3; // heltalscifre (1-3); (en valuta uden B-enhed – fx Pta – viser M med separator; ingen af vores)
  const d = s.slice(n, n + 2).replace(/0+$/, '');
  return c.pre + s.slice(0, n) + (d ? c.dec + d : '') + (grp === 1 ? c.K : grp === 2 ? c.M : grp === 3 ? c.B : c.T);
}

/** Cash::get_display_amount 0x43f460 med flag 4/6 (uden 0x20): rundet til trinnet 0x4426e0 (trinnene × valutaens enhed 0xad9cc0) */
export function cashDisplayRound(v: number, cur: Currency = currency): number {
  const u = CASH_CUR[cur].unit;
  const st = cashStepOf(v / u) * u;
  return Math.trunc((v + Math.trunc(st / 2)) / st) * st;
}

/** CM 01/02 Finances-skærmen 0x460590: præcist beløb (flag 0x22, ingen Cash-afrunding), men over 13 tegn forkortet (0x21); underskud/negativ
 *  saldo: beløbet uden fortegn (forkortet over 12 tegn) i parentes "(86,41M Dkr)". */
export function moneyCx(eur: number): string {
  const v = Math.round(eur * RATE[currency]);
  if (v < 0) {
    const a = -v, f = cashFormat(a, true);
    return `(${f.length > 12 ? cashFormat(a, false) : f})`;
  }
  const f = cashFormat(v, true);
  return f.length > 13 ? cashFormat(v, false) : f;
}

/** Transfer Funds på Finances (0x463aec): negativ → null ("None available" i rødt); ellers flag 6 (fuldt, rundet til Cash-trinnet), over 13
 *  tegn forkortet med flag 0x21 (urundet) */
export function moneyCxFunds(eur: number): string | null {
  const v = Math.round(eur * RATE[currency]);
  if (v < 0) return null;
  const f = cashFormat(cashDisplayRound(v), true);
  return f.length > 13 ? cashFormat(v, false) : f;
}

export function dateFmt(iso: string, long = false): string {
  const d = new Date(iso + 'T00:00:00Z');
  return d.toLocaleDateString(LOCALE[lang], { day: 'numeric', month: long ? 'long' : 'short', year: 'numeric', weekday: long ? 'short' : undefined, timeZone: 'UTC' });
}
