// Landsholdenes kalender som originalen (kun den originale database i ægte tilstand – cmActive; udvidet spil bruger international.ts' egne vinduer).
//
// Porteret (noter: ~/cm0102-engine/notes/international.md):
//  - Friendly::friendly_cup_table_init 0x5ca4f0 (landskampdatoerne: 110 poster à 0x14 bytes – ugedag, dag, måned, år i firårscyklussen, verdensdel
//    +0xc, turnering +0x10 = kvalifikationen, der bruger datoen, −1 = kun venskabskampe) og 0x5cc510 (årene: basisåret med (år − 2) % 4 = 0, + år,
//    −4 når mere end 3 år frem; Date 0x54a130/0x54a2d0 = cmDate), læst i unicorn (tools/sched/emu.py).
//  - Friendly::update_international_friendlies 0x5cbb00: 1/1 nulstilles modstanderlisterne og landene sorteres igen efter omdømmet (+0x8e,
//    qsort 0x5cc5f0); hver dag fra spilstarten [0xdd6ec8] ≤ i dag + 12 uger (Date::add_weeks 0x54c770(12) – 0x5cbb2d): datoen i dag + 84 dage slås op i tabellen, og alle poster med datoen arrangeres.
//  - Friendly::arrange_international_friendlies 0x5cbdf0: lande med en landskamp ±4 dage er optaget; i omdømmets rækkefølge parres hvert ledigt
//    land N med det første ledige M efter sig, hvor rand(500) (+ rand(1000) i samme verdensdel) > 400, verdensdelen står i en af postens linjer
//    (Afrika ikke i februar), mindst ét af landene har +0x88 ≥ 5, parret ikke er forbudt (0x5cc2d0/0x5cc3e0: Iran–USA, Irak–alle, Vietnam–USA,
//    Nordkorea–Sydkorea) og de ikke har mødt hinanden i år; hjemmeholdet efter rand(2) (0x5c6f00: 1 = N's stadion).
//  - ReserveComp::add_b_or_under21_fixture 0x7e6720 (fra add_fixture 0x5aa680): hver landskamp mellem landshold med omdømme ≥ 2500 får en U21-kamp
//    dagen før (Under 21 International 0x9cf798), undtagen 1/3–1/9 i år med (år % 4 = 0).
//  - EuroChampQual (EM 2004-kvalifikationen, 2002-kampagnen): grupperne 0x57dab0 (49 faste lande i 9 grupper à 5/6) og rundedatoerne
//    create_schedule 0x57d190 (10 runder 31/8-2002 … 4/10-2003, læst i unicorn).
// Kontrol mod oraklet (crowd1, frø 1, 3.9.60): venskabskampe pr. dato og U21-kampe dagen før – tests/cmIntl.test.ts.
// *Estimeret* (markeret "gæt" nedenfor): kampenes rækkefølge i grupperne (League's skema-par ikke læst – runde-robin), lodtrækningsdagen,
// playoff-datoerne, -lodtrækningen og udebanemål/lodtrækning ved lige stilling, "bedste toer",
// 'B' International (0x7e6720's B-gren: lige år før 20/6 – ikke bygget, U21-kampen spilles i stedet). U21-holdenes fyldspillere: originalens 0x90dc66 (cmVirtual.ts) i playNation.
import type { GameState } from './types';
import { cmIntlOn } from './cmPlayerData';
import { calIntl, cmCallupDaily, cmCallupRecord, cmDate, type CmIntlFx } from './cmCalendar';
import { addDays } from './dates';
import { rng } from './rng';
import { msvcQsort } from './engine/grid/subs';
import { forEachHuman } from './humans';
import { addNews, gs } from './state';
import { registerPrerun } from './cmPrerun';
import { intlHooks } from './hooks';
import { intlState, playNation, type IntlRow, type IntlTie } from './international';
import { cmIntlSquadDaily, cmNatList, cmWithdrawInjured, initSquads, selectForFixture, type SelFixture } from './cmIntlSquad';
import { cmFifaDaily, cmFifaInit } from './cmFifa';
import { cmFinalsBusy, cmFinalsDay, cmFinalsDuty } from './cmIntlFinals';

export { cmIntlOn };

/** 0x5ca4f0: [ugedag (0 = mandag), dag, måned (0–11), år i cyklussen, verdensdel (continent.dat 0–5), turnering (nøgleindeks 137–143 eller −1)] */
export const CM_INTL_DATES: [number, number, number, number, number, number][] = [
  [6, 12, 0, 3, 0, 141], [6, 26, 0, 3, 3, 138], [6, 1, 1, 3, 4, 137], [6, 23, 1, 3, 3, 138], [6, 24, 1, 3, 0, 141], [6, 2, 2, 3, 3, 138], [5, 15, 2, 3, 3, 138],
  [5, 24, 2, 3, 2, 142], [5, 10, 3, 3, 4, 137], [5, 5, 3, 3, 0, 141], [5, 15, 3, 3, 4, 137], [6, 20, 3, 3, 3, 138], [2, 25, 3, 3, 2, 142], [2, 26, 3, 3, 5, 140],
  [6, 27, 3, 3, 0, 141], [6, 4, 5, 3, 5, 140], [2, 4, 5, 3, 1, 139], [2, 6, 5, 3, 2, 142], [5, 7, 5, 3, 0, 141], [6, 29, 5, 3, 3, 138], [5, 10, 6, 3, 4, 137],
  [6, 24, 6, 3, 0, 141], [6, 26, 6, 3, 5, 140], [2, 16, 7, 3, 5, 140], [6, 17, 7, 3, 0, 141], [5, 2, 8, 3, 2, 142], [2, 6, 8, 3, 2, 142], [2, 6, 8, 3, 5, 140],
  [2, 9, 8, 3, 3, 138], [5, 17, 8, 3, 4, 137], [5, 13, 8, 3, 1, 139], [6, 28, 8, 3, 0, 141], [2, 1, 9, 3, 3, 138], [5, 7, 9, 3, 2, 142], [2, 7, 9, 3, 5, 140],
  [5, 20, 9, 3, 0, 141], [5, 29, 9, 3, 4, 137], [2, 15, 10, 3, 5, 140], [2, 15, 10, 3, 2, -1], [6, 16, 10, 3, 3, 138], [5, 29, 10, 3, 4, 137], [5, 24, 2, 0, 2, -1],
  [2, 25, 3, 0, 2, -1], [2, 16, 7, 0, 5, -1], [5, 25, 7, 0, 3, -1], [5, 2, 8, 0, 2, 143], [2, 6, 8, 0, 5, -1], [5, 7, 9, 0, 2, 143], [2, 7, 9, 0, 5, -1],
  [5, 10, 9, 0, 4, -1], [5, 10, 9, 0, 0, -1], [2, 15, 10, 0, 5, -1], [2, 15, 10, 0, 2, -1], [2, 18, 10, 0, 4, -1], [2, 18, 10, 0, 3, -1], [2, 18, 10, 0, 0, -1],
  [6, 15, 11, 0, 0, -1], [6, 15, 11, 0, 3, -1], [6, 15, 11, 0, 4, -1], [6, 10, 0, 1, 3, -1], [6, 12, 0, 1, 0, -1], [6, 10, 0, 1, 4, -1], [6, 24, 1, 1, 0, -1],
  [6, 23, 1, 1, 3, -1], [5, 24, 2, 1, 2, 143], [2, 24, 2, 1, 0, -1], [2, 29, 2, 1, 5, -1], [2, 24, 2, 1, 4, -1], [2, 24, 2, 1, 3, -1], [2, 26, 3, 1, 5, -1],
  [2, 25, 3, 1, 2, 143], [2, 28, 3, 1, 0, -1], [2, 28, 3, 1, 3, -1], [2, 6, 5, 1, 2, 143], [2, 9, 5, 1, 1, -1], [2, 9, 5, 1, 0, -1], [6, 25, 6, 1, 4, -1],
  [6, 24, 6, 1, 0, -1], [2, 16, 7, 1, 5, -1], [2, 18, 7, 1, 0, -1], [5, 2, 8, 1, 2, 143], [2, 6, 8, 1, 5, -1], [2, 6, 8, 1, 2, 143], [1, 7, 8, 1, 3, -1],
  [1, 7, 8, 1, 4, -1], [1, 7, 8, 1, 1, -1], [2, 7, 9, 1, 5, -1], [5, 9, 9, 1, 0, -1], [5, 9, 9, 1, 4, -1], [5, 9, 9, 1, 3, -1], [2, 15, 10, 1, 2, -1],
  [2, 17, 10, 1, 4, -1], [5, 24, 2, 2, 2, -1], [2, 26, 3, 2, 5, 140], [2, 25, 3, 2, 2, -1], [5, 1, 5, 2, 0, 141], [5, 15, 5, 2, 0, 141], [5, 25, 6, 2, 3, 138],
  [6, 26, 6, 2, 5, 140], [5, 25, 7, 2, 3, 138], [2, 6, 8, 2, 5, 140], [6, 1, 9, 2, 0, 141], [5, 7, 9, 2, 2, 142], [5, 7, 9, 2, 2, 143], [5, 7, 9, 2, 5, 140],
  [6, 10, 10, 2, 0, 141], [6, 17, 10, 2, 3, 138], [2, 15, 10, 2, 2, -1], [2, 15, 10, 2, 5, 140], [6, 10, 11, 2, 4, 137],
];
const AFRICA = 0;

/** 0x5cc510: tabellens datoer, som de står efter 1/1 i `year` (sorteret efter datoen, 0x5cc610) */
export function cmIntlDates(year: number): { d: string; cont: number; comp: number }[] {
  let base = year;
  while ((base - 2) % 4 !== 0) base++;
  const out = CM_INTL_DATES.map(([wd, day, mon, yo, cont, comp]) => {
    let y = base + yo;
    if (y - year > 3) y -= 4;
    return { d: cmDate(day, mon, y, wd), cont, comp };
  });
  return out.sort((a, b) => (a.d < b.d ? -1 : a.d > b.d ? 1 : 0));
}

/** de forbudte par (0x5cc2d0): [N, M], −1 = alle */
const FORBIDDEN: [string, string | null][] = [['Iran', 'United States'], ['Iraq', null], ['Vietnam', 'United States'], ['North Korea', 'South Korea']];

export interface CmIntlFix { d: string; h: number; a: number; u21?: 1 }
export interface CmIntlState {
  /** planlagte landskampe (venskabskampe + U21) */
  fix: CmIntlFix[];
  /** modstandere i kalenderåret pr. land (Friendly +0x34f6, nulstilles 1/1) */
  opp: Record<number, number[]>;
  /** landenes rækkefølge (Friendly +0x34fa, sorteret efter +0x8e) */
  order?: number[];
  /** nation +0x88 (antal indlæste spillere) pr. land – talt første gang */
  n88?: Record<number, number>;
  /** sidst behandlede dag (+0x34f4) */
  last?: string;
  /** HostCountry 0x5f9970: det valgte kandidatpar pr. EM-år (rækker med flere kandidater) */
  hosts?: Record<number, number>;
}
const cmState = (g: GameState): CmIntlState => {
  const st = (g.intl ??= { results: [], history: [] });
  return (st.cm ??= { fix: [], opp: {} });
};

const contOf = (g: GameState, n: number) => g.cmNationCont?.[n] ?? -1;
const repOf = (g: GameState, n: number) => g.cmNationRep?.[n] ?? 0;
/** nation +0x88: antal indlæste spillere af nationaliteten – 0x524d70 nulstiller og tæller (0x526307) efter databasestørrelsen (ikke nation.dat's felt) */
function p88(g: GameState, n: number): number {
  const s = cmState(g);
  if (!s.n88) { s.n88 = {}; for (const p of Object.values(g.players)) if (!p.virtual) s.n88[p.nation] = (s.n88[p.nation] ?? 0) + 1; }
  return s.n88[n] ?? 0;
}
/** landsholdets omdømme (nat_club.dat – club +0x80 i 0x7e6720) */
const teamRep = (g: GameState, n: number) => g.intl?.info?.[n]?.rep ?? repOf(g, n);

function sortOrder(g: GameState, prev?: number[]): number[] {
  const a = prev ? prev.slice() : g.nations.map((_, i) => i).filter((i) => contOf(g, i) >= 0);
  msvcQsort(a, (x, y) => repOf(g, y) - repOf(g, x));
  return a;
}

/** landshold med en landskamp i [fra, til] – planlagte venskabs-/U21-kampe, EM-kvalifikationens runder og slutrunderne */
function nationsBusy(g: GameState, from: string, to: string): Set<number> {
  const out = new Set<number>();
  const st = g.intl;
  if (!st) return out;
  for (const f of st.cm?.fix ?? []) if (f.d >= from && f.d <= to) { out.add(f.h); out.add(f.a); }
  const q = st.qual;
  if (q?.dates && q.sched) q.dates.forEach((d, r) => { if (d >= from && d <= to) for (const [h, a] of q.sched![r] ?? []) { out.add(h); out.add(a); } });
  if (q?.po) for (const t of q.po) for (const d of q.poDates ?? []) if (d >= from && d <= to) { out.add(t.a); out.add(t.b); }
  for (const n of cmFinalsBusy(g, from, to)) out.add(n);
  for (const t of [st.tournament, ...(st.cont ?? [])]) {
    if (!t || t.stage === 'done' || t.cm) continue;
    const inWin = (md: string) => { const d = `${t.year}-${md}`; return d >= from && d <= to; };
    const gdays = t.days?.g ?? ['06-10', '06-14', '06-18'], kdays = t.days?.ko ?? { R16: '06-23', QF: '06-27', SF: '07-01', F: '07-05' };
    const group = /^G/.test(t.stage);
    // gruppespillet: hele feltet; knockoutrunderne: kun dem, der stadig er med (i gruppespillet kan alle gå videre)
    if (group && (gdays.some(inWin) || Object.values(kdays).some(inWin))) for (const k of Object.keys(t.table)) out.add(+k);
    else if (!group && Object.values(kdays).some(inWin)) {
      const alive = t.ko.filter((x) => x.stage === t.stage);
      for (const x of alive) { if (x.winner === undefined || x.winner === x.a) out.add(x.a); if (x.winner === undefined || x.winner === x.b) out.add(x.b); }
    }
  }
  return out;
}

function forbidden(g: GameState, n: number, m: number): boolean {
  const nm = (i: number) => g.nations[i]?.name;
  return FORBIDDEN.some(([x, y]) => (nm(n) === x && (y === null || nm(m) === y)) || false);
}

/** 0x5cbdf0 for posterne med datoen `d` */
function arrange(g: GameState, d: string, entries: { cont: number }[]): void {
  const s = cmState(g);
  const order = (s.order ??= sortOrder(g));
  const busy = nationsBusy(g, addDays(d, -4), addDays(d, 4));
  const conts = entries.map((e) => e.cont);
  const contOk = (n: number) => conts.some((c) => c === -1 || c === contOf(g, n));
  const feb = d.slice(5, 7) === '02' && entries.length > 0;
  const made: [number, number][] = [];
  for (let i = 0; i < order.length; i++) {
    const n = order[i];
    if (busy.has(n) || !contOk(n)) continue;
    if (feb && contOf(g, n) === AFRICA) continue;
    for (let j = i + 1; j < order.length; j++) {
      const m = order[j];
      if (busy.has(m)) continue;
      let r = rng.int(0, 499);
      if (!contOk(m)) continue;
      if (feb && contOf(g, m) === AFRICA) continue;
      if (p88(g, n) < 5 && p88(g, m) < 5) continue;
      if (forbidden(g, n, m)) continue;
      if (contOf(g, n) === contOf(g, m)) r += rng.int(0, 999);
      if (r <= 400) continue;
      if ((s.opp[n] ?? []).includes(m)) continue;
      const nHome = rng.int(0, 1) === 1;
      const [h, a] = nHome ? [n, m] : [m, n];
      addFixture(g, { d, h, a });
      busy.add(n); busy.add(m);
      (s.opp[n] ??= []).push(m); (s.opp[m] ??= []).push(n);
      made.push([h, a]);
      break;
    }
  }
  void made;
}

/** add_fixture 0x5aa680 + 0x7e6720's U21-gren */
function addFixture(g: GameState, f: CmIntlFix): void {
  const s = cmState(g);
  s.fix.push(f);
  // add_fixture 0x5aa680 → 0x76bab0: truppen kaldes ind, når kampen ligger højst 14 dage frem (venskabskampene lægges 12 uger før – så sker det 14 dage før i callUps)
  const sel = () => { if (!inPrerun) selectForFixture(g, selFix(f), (n) => oppsOf(g, n, f.d)); };
  if (teamRep(g, f.h) < 2500 || teamRep(g, f.a) < 2500) { sel(); return; }
  const y = +f.d.slice(0, 4);
  if (y % 4 === 0) {
    // Date(1, 2, 2000)/Date(1, 8, 2000): dagene i et skudår (60, 244) – fixturens dag i året
    const doy = Math.round((Date.UTC(y, +f.d.slice(5, 7) - 1, +f.d.slice(8, 10)) - Date.UTC(y, 0, 1)) / 86400000);
    if (doy > 60 && doy < 244) return;
  }
  const u: CmIntlFix = { d: addDays(f.d, -1), h: f.h, a: f.a, u21: 1 };
  s.fix.push(u);
  if (!inPrerun) selectForFixture(g, selFix(u), (n) => oppsOf(g, n, u.d, true));
  sel();
}

const selFix = (f: CmIntlFix): SelFixture => ({ d: f.d, h: f.h, a: f.a, kind: 'friendly', slot: f.u21 ? 2 : 0 });

/** 0x76d560: landets modstandere i kampen på `from` og de næste 13 dages kampe (ikke slutrunder) – samme slags hold */
function oppsOf(g: GameState, n: number, from: string, u21?: boolean): number[] {
  const to = addDays(from, 13), out: number[] = [];
  const add = (h: number, a: number, d: string) => { if (d < from || d > to) return; if (h === n && !out.includes(a)) out.push(a); else if (a === n && !out.includes(h)) out.push(h); };
  for (const f of g.intl?.cm?.fix ?? []) if (!!f.u21 === !!u21) add(f.h, f.a, f.d);
  const q = g.intl?.qual;
  if (!u21 && q?.cm && q.dates && q.sched) q.dates.forEach((d, r) => { for (const [h, a] of q.sched![r] ?? []) add(h, a, d); });
  return out;
}

/** NationalTeams::daily_update 0x76b100: landskampene på i dag + 2 uger (0x54c770(2)) → 0x76bab0 (venskabskampene og U21-kampene) */
function callUps(g: GameState): void {
  const d = addDays(g.date, 14);
  for (const f of cmState(g).fix) {
    if (f.d !== d) continue;
    selectForFixture(g, selFix(f), (n) => oppsOf(g, n, f.d, !!f.u21));
    recordCallups(g, f.h, f.a, f.d, !!f.u21);
  }
}

/** 0x76b30b–0x76b40b: efter 0x76bab0 – 0x7771c0 for hjemme- og udeholdets liste (A-landsholdet – også ved U21-kampen, hvis hold er A-holdene) og
 *  for U21-kampen (+0x4d & 0x200) U21-holdenes lister (0x53b4f0, dagen før – 0x5409b0). Ikke for slutrunderne (0x76d940). 'B' (+0x4d & 0x100) findes
 *  ikke hos os. */
function recordCallups(g: GameState, h: number, a: number, d: string, u21: boolean): void {
  cmCallupRecord(g, cmNatList(g, h, 0), d);
  cmCallupRecord(g, cmNatList(g, a, 0), d);
  if (u21) {
    cmCallupRecord(g, cmNatList(g, h, 2), addDays(d, -1));
    cmCallupRecord(g, cmNatList(g, a, 2), addDays(d, -1));
  }
}

/** landskampene på dagen `d` som fixtures (cmCalendar.ts' sammenstødsregel 0x5adba0): venskabskampene (Friendly 72) og U21-kampene (401) med
 *  +0x3a = 9, EM-kvalifikationen (396) med 10 */
calIntl.on = (g: GameState, d: string): CmIntlFx[] => {
  const out: CmIntlFx[] = [];
  for (const f of g.intl?.cm?.fix ?? []) if (f.d === d) out.push({ d, h: f.h, a: f.a, type: 9, comp: f.u21 ? 401 : 72 });
  const q = g.intl?.qual;
  if (q?.cm && q.dates && q.sched) {
    const r = q.dates.indexOf(d);
    if (r >= 0) for (const [h, a] of q.sched[r] ?? []) out.push({ d, h, a, type: 10, comp: 396 });
    const pi = (q.poDates ?? []).indexOf(d);
    if (pi >= 0) for (const t of q.po ?? []) { const [h, a] = pi === 0 ? [t.a, t.b] : [t.b, t.a]; out.push({ d, h, a, type: 10, comp: 396 }); }
  }
  return out;
};

let inPrerun = false;
/** 0x5cbb00 – dagen `iso` (i forkørslen dens dato, ellers spillets) */
export function cmIntlFriendlyDay(g: GameState, iso: string): void {
  if (!cmIntlOn(g)) return;
  const s = cmState(g);
  if (iso.slice(5) === '01-01') { s.opp = {}; s.order = sortOrder(g, s.order); }
  const start = g.cmStart ?? g.cmFitStart;
  const target = addDays(iso, 7 * 12);                                     // 0x5cbb2d: add_weeks(12)
  if (start && start > target) return;
  if (s.last === iso) return;
  s.last = iso;
  const entries = cmIntlDates(+iso.slice(0, 4)).filter((e) => e.d === target);
  if (entries.length) arrange(g, target, entries);
}

/** dagens planlagte landskampe (U21 og venskabskampe) og EM-kvalifikationen */
export function cmIntlPlayDay(g: GameState): void {
  if (!cmIntlOn(g)) return;
  const s = cmState(g);
  const today = s.fix.filter((f) => f.d === g.date);
  if (today.length) {
    s.fix = s.fix.filter((f) => f.d !== g.date);
    // kampens fyldspillere (0x90dc66) laver playNation for begge hold
    for (const f of today) playNation(f.h, f.a, f.u21 ? 'u21' : 'friendly');
  }
  s.fix = s.fix.filter((f) => f.d >= g.date);
  cmEuroQualDay(g);
}

// ---------------------------------------------------------------- EM 2004-kvalifikationen (EuroChampQual, 2002-kampagnen)

/** 0x57dab0 (år 2002): de 49 faste lande i grupperne (gruppe · plads) */
export const EURO04_Q_GROUPS: string[][] = [
  ['Belarus', 'Wales', 'Switzerland', 'Denmark', 'Italy'],
  ['Slovenia', 'Latvia', 'Georgia', 'Greece', 'Norway', 'Albania'],
  ['Moldova', 'Northern Ireland', 'Finland', 'Turkey', 'Germany'],
  ['Armenia', 'Iceland', 'Ukraine', 'France', 'Russia', 'Andorra'],
  ['Luxembourg', 'Poland', 'Sweden', 'Bulgaria', 'England'],
  ['San Marino', 'Cyprus', 'Israel', 'Austria', 'Spain'],
  ['Liechtenstein', 'Hungary', 'Slovakia', 'Portugal', 'Romania', 'Azerbaijan'],
  ['Malta', 'FYR of Macedonia', 'Republic of Ireland', 'Croatia', 'Yugoslavia'],
  ['Scotland', 'Faroe Islands', 'Bosnia-Herzegovina', 'Lithuania', 'Estonia', 'Czech Republic'],
];
/** create_schedule 0x57d190: de 10 runder 0x68a160(runde, dag, måned (0–11), år + k, ugedag) for kampagnen +0x40 – [dag, måned, k, ugedag] */
const EQ_ROUNDS: [number, number, number, number][] = [[2, 8, 0, 5], [6, 8, 0, 2], [7, 9, 0, 5], [11, 9, 0, 2], [24, 2, 1, 5], [28, 2, 1, 2], [6, 5, 1, 2], [2, 8, 1, 5], [6, 8, 1, 2], [7, 9, 1, 5]];
export const euroQualDates = (y: number): string[] => EQ_ROUNDS.map(([d, m, k, wd]) => cmDate(d, m, y + k, wd));
/** 0x57d190 (år 2002): de 10 runder */
export const EURO04_Q_DATES = euroQualDates(2002);
/** set_up_rules 0x57e8f0: lodtrækningen +0xb6/+0xb8 = Date(10, marts, år, lørdag) (0x549f70) – 0x57fd60 trækker grupperne den dag (også i forkørslen) */
export const euroQualDrawDate = (y: number): string => cmDate(10, 2, y, 5);
/** EuroChampQual 0x57ce10: kampagnens år = år − 1 rundet op til (år − 1990) % 4 = 0; start_new_season 0x57ebb4 lægger 4 til */
export const isEuroCampaign = (y: number): boolean => (y - 1990) % 4 === 0;
/** playoff-kampene (gæt: create_playoff_stage 0x57ef50's rundetabel ikke læst) – 15/11 og 19/11 i kampagnens andet år */
const poDates = (y: number) => [`${y + 1}-11-15`, `${y + 1}-11-19`];
/** HostCountry::init_default_table 0x5f9970: EM's rækker (år → kandidaterne; én kandidat = fast). Efter 2028 ingen vært (find_hosts = 0). */
const EURO_HOSTS: Record<number, string[][]> = {
  2000: [['Holland', 'Belgium']], 2004: [['Portugal']], 2008: [['Scotland', 'Wales'], ['Sweden'], ['Switzerland']], 2012: [['France'], ['Norway'], ['Denmark']],
  2016: [['Republic of Ireland'], ['Switzerland'], ['Yugoslavia']], 2020: [['Switzerland'], ['Belgium'], ['Holland']], 2024: [['Italy'], ['Germany'], ['England']],
  2028: [['Greece'], ['Spain'], ['France']],
};
/** HostCountry::find_hosts 0x5fa730 for EM `year`: værtslandene. Rækker med flere kandidater vælges tilfældigt af HostCountry::daily_update 0x5fa850
 *  (*estimeret*: valget trækkes første gang, det bruges, med spillets talrække – originalens tidspunkt 5 år før er ikke vores) */
function euroHosts(g: GameState, year: number): number[] {
  const rows = EURO_HOSTS[year];
  if (!rows) return [];
  const s = cmState(g);
  const pick = rows.length > 1 ? ((s.hosts ??= {})[year] ??= rng.int(0, rows.length - 1)) : 0;
  return rows[pick].map((nm) => g.nations.findIndex((x) => x.name === nm)).filter((n) => n >= 0);
}

/** dobbelt runde-robin over 10 runder (gæt – League's skema-par ikke læst): 5 hold får en fridag pr. runde */
export function roundRobin(teams: number[]): [number, number][][] {
  const t = teams.length % 2 ? [...teams, -1] : teams.slice();
  const n = t.length, half: [number, number][][] = [];
  const rot = t.slice(1);
  for (let r = 0; r < n - 1; r++) {
    const cur = [t[0], ...rot];
    const pairs: [number, number][] = [];
    for (let i = 0; i < n / 2; i++) {
      const a = cur[i], b = cur[n - 1 - i];
      if (a < 0 || b < 0) continue;
      pairs.push(r % 2 ? [b, a] : [a, b]);
    }
    half.push(pairs);
    rot.unshift(rot.pop()!);
  }
  return [...half, ...half.map((p) => p.map(([a, b]) => [b, a] as [number, number]))];
}

const row = (n: number): IntlRow => ({ n, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 });
function book(t: Record<number, IntlRow>, a: number, b: number, hg: number, ag: number): void {
  const x = t[a], y = t[b];
  x.p++; y.p++; x.gf += hg; x.ga += ag; y.gf += ag; y.ga += hg;
  if (hg > ag) { x.w++; x.pts += 3; y.l++; } else if (hg < ag) { y.w++; y.pts += 3; x.l++; } else { x.d++; y.d++; x.pts++; y.pts++; }
}
const ranked = (t: Record<number, IntlRow>, grp: number[]) => grp.map((n) => t[n]).sort((a, b) => b.pts - a.pts || b.gf - b.ga - (a.gf - a.ga) || b.gf - a.gf);

/** EuroChampQual::pick_entrants 0x57f600 (kampagnen `y`): puljen = de europæiske lande (nation +0x71) i landenes rækkefølge uden EM-værterne for
 *  år + 2, højst 51 − værterne i Europa (+0xf6, 0–2 – ellers 1), sorteret efter landsholdets omdømme club +0x80 (qsort 0x4b07d0, faldende).
 *  For få lande (0x57f877) → null (originalen fortsætter med en ufuldstændig pulje – her ingen kampagne). */
function euroQualPool(g: GameState, y: number): { pool: number[]; f6: number; hosts: number[] } | null {
  const hosts = euroHosts(g, y + 2), eur = g.cmEurope ?? -1;
  let f6 = hosts.filter((n) => contOf(g, n) === eur).length;
  if (f6 > 2) f6 = 1;
  const f2 = 51 - f6, pool: number[] = [];
  for (let n = 0; n < g.nations.length; n++) if (contOf(g, n) === eur && pool.length < f2 && !hosts.includes(n)) pool.push(n);
  if (pool.length < f2) return null;
  msvcQsort(pool, (a, b) => teamRep(g, b) - teamRep(g, a));
  return { pool, f6, hosts };
}
/** 0x57d9d0: gruppens største størrelse (argumentet = gruppen − 1): +0xf6 = 1 → 0, 2, 5 → 6; +0xf6 = 2 → 0, 2, 5, 7 → 6; ellers 5 */
const groupCap = (f6: number, k: number) => (f6 === 1 ? [0, 2, 5].includes(k) : f6 === 2 ? [0, 2, 5, 7].includes(k) : false) ? 6 : 5;
/** EuroChampQual::draw_groups 0x57dab0 for år ≠ 2002 (0x57e6e6): 9 grupper (+0xff = 7, + 2); i 6 potter: gruppernes rækkefølge blandes (20 ombytninger af
 *  rand(9) og rand(9)), og grupperne i den rækkefølge får hver den næste fra puljen, når der er plads */
export function euroQualDraw(pool: number[], f6: number, rand: (n: number) => number): number[][] {
  const G = 9, perm = [0, 1, 2, 3, 4, 5, 6, 7, 8], groups: number[][] = Array.from({ length: G }, () => []);
  let placed = 0;
  for (let pot = 0; pot < 6 && placed < pool.length; pot++) {
    for (let k = 0; k < 20; k++) { const a = rand(G), b = rand(G); const t = perm[a]; perm[a] = perm[b]; perm[b] = t; }
    for (let i = 0; i < G && placed < pool.length; i++) {
      const gi = perm[i];
      if (groups[gi].length < groupCap(f6, gi - 1)) groups[gi].push(pool[placed++]);
    }
  }
  return groups;
}

function startEuroQual(g: GameState, y: number): void {
  const st = intlState();
  let groups: number[][], host: number[];
  if (y === 2002) {
    groups = EURO04_Q_GROUPS.map((grp) => grp.map((nm) => g.nations.findIndex((x) => x.name === nm)).filter((n) => n >= 0));
    host = euroHosts(g, 2004);
  } else {
    const p = euroQualPool(g, y);
    if (!p) return;
    groups = euroQualDraw(p.pool, p.f6, (n) => rng.int(0, n - 1)).filter((x) => x.length);
    host = p.hosts;
  }
  const dates = euroQualDates(y), year = y + 2;
  const table: Record<number, IntlRow> = {};
  for (const n of groups.flat()) table[n] = row(n);
  const per = groups.map(roundRobin);
  const sched = dates.map((_, r) => per.flatMap((x) => x[r] ?? []));
  st.qual = { name: 'euro', year, groups, region: groups.map(() => 'europe'), table, round: 0, dates, sched, cm: 1, ...(host.length ? { hosts: host } : {}) };
  intlHooks.ntStart?.('euroq', year, groups.flat());                    // 0x5806d0 set_predicted_positions → 0x775220 (NationalTeams)
  forEachHuman(() => addNews({ cat: 'general', key: 'intl.qual.start.euro', params: { year } }));
}

/** 0x57fd60 for dagen `iso`: lodtrækningen på +0xb6 (2002-kampagnen: de faste grupper; senere kun i spil startet med g.cmIntl). Dagen efter
 *  lodtrækningsdatoen tæller også (gemte spil fra før 20/11, hvor lodtrækningen var gættet til 14 dage før første runde). */
function euroQualDrawDay(g: GameState, iso: string): void {
  const y = +iso.slice(0, 4);
  if (!isEuroCampaign(y) || (y !== 2002 && g.cmIntl !== 1)) return;
  if (iso < euroQualDrawDate(y) || iso >= euroQualDates(y)[0]) return;
  const st = intlState();
  if (st.qual || st.history.some((h) => h.name === 'euro' && h.year === y + 2) || st.tournament?.name === 'euro' && st.tournament.year === y + 2) return;
  startEuroQual(g, y);
}

function cmEuroQualDay(g: GameState): void {
  const st = intlState();
  euroQualDrawDay(g, g.date);
  const q = st.qual;
  if (!q?.cm || !q.dates || !q.sched) return;
  // 0x76b100: kampene 14 dage frem → 0x76bab0
  const r = q.dates.indexOf(addDays(g.date, 14));
  if (r >= 0) for (const [h, a] of q.sched[r]) { selectForFixture(g, { d: q.dates[r], h, a, kind: 'euroq', slot: 0 }, (n) => oppsOf(g, n, q.dates![r])); recordCallups(g, h, a, q.dates[r], false); }
  const ri = q.dates.indexOf(g.date);
  if (ri >= 0) {
    for (const [h, a] of q.sched[ri]) {
      const res = playNation(h, a, 'euroq');
      book(q.table, h, a, res.hg, res.ag);
    }
    q.round = ri + 1;
    if (ri === q.dates.length - 1) euroQualGroupsDone(g);
    return;
  }
  const pi = (q.poDates ?? []).indexOf(g.date);
  if (pi >= 0 && q.po) {
    for (const t of q.po) {
      const [h, a] = pi === 0 ? [t.a, t.b] : [t.b, t.a];
      const res = playNation(h, a, 'euroq', 'PO');
      if (pi === 0) { t.hg = res.hg; t.ag = res.ag; continue; }
      // samlet stilling (t.a's mål: første kamp hjemme + anden kamp ude); udebanemål, ellers lodtrækning (gæt)
      const aGoals = (t.hg ?? 0) + res.ag, bGoals = (t.ag ?? 0) + res.hg;
      t.winner = aGoals > bGoals ? t.a : bGoals > aGoals ? t.b : res.ag > (t.ag ?? 0) ? t.a : res.ag < (t.ag ?? 0) ? t.b : rng.chance(0.5) ? t.a : t.b;
    }
    if (pi === 1) {
      intlHooks.ntOut?.('euroq', q.year, q.po.map((t) => (t.winner === t.a ? t.b : t.a)));   // 0x57f261: playoffens tabere
      q.qualified = [...(q.qualified ?? []), ...q.po.map((t) => t.winner!)];
      announceQualified(g, q.qualified);
    }
  }
}

function euroQualGroupsDone(g: GameState): void {
  const q = intlState().qual!;
  const rows = q.groups.map((grp) => ranked(q.table, grp));
  const winners = rows.map((x) => x[0].n);
  const seconds = rows.map((x) => x[1]).sort((a, b) => b.pts - a.pts || b.gf - b.ga - (a.gf - a.ga) || b.gf - a.gf);
  q.qualified = [...(q.hosts ?? []), ...winners, seconds[0].n].filter((n, i, a) => a.indexOf(n) === i);
  const rest = rng.shuffle(seconds.slice(1).map((x) => x.n).filter((n) => !q.qualified!.includes(n)));
  q.po = [];
  for (let i = 0; i + 1 < rest.length; i += 2) q.po.push({ stage: 'PO', a: rest[i], b: rest[i + 1] } as IntlTie);
  q.poDates = poDates(q.year - 2);
  // create_playoff_stage 0x57ef50 → 0x775000: de, der hverken er kvalificeret eller i playoff, mister turneringen
  const inPo = new Set(q.po.flatMap((t) => [t.a, t.b]));
  intlHooks.ntOut?.('euroq', q.year, q.groups.flat().filter((n) => !q.qualified!.includes(n) && !inPo.has(n)));
  if (!q.po.length) announceQualified(g, q.qualified);
}

function announceQualified(g: GameState, qualified: number[]): void {
  forEachHuman(() => {
    const mine = g.clubs[g.userClub]?.nation;
    for (const n of qualified.filter((x) => x === mine || x === g.manager.national?.nation)) addNews({ cat: 'general', key: 'intl.qual.done.euro', params: { nation: g.nations[n]?.name ?? '', year: intlState().qual?.year ?? 2004 } });
  });
}

/** landsholdsopholdet (0x76e040): lande med en planlagt landskamp inden for 14 dage */
function dutyNations(): number[] {
  const g = gs();
  if (!cmIntlOn(g)) return [];
  const to = addDays(g.date, 14);
  const out = new Set<number>();
  for (const f of g.intl?.cm?.fix ?? []) if (!f.u21 && f.d > g.date && f.d <= to) { out.add(f.h); out.add(f.a); }
  const q = g.intl?.qual;
  if (q?.cm && q.dates && q.sched) q.dates.forEach((d, r) => { if (d > g.date && d <= to) for (const [h, a] of q.sched![r]) { out.add(h); out.add(a); } });
  for (const n of cmFinalsDuty(g)) out.add(n);
  return [...out];
}

// Friendly::update_for_date er en af turneringerne (0x5cc850's vtbl+0x14(dato, 1)): også i forkørslen – dage før starten lægger kampe efter den
registerPrerun('comps1', (g, _day, iso) => { inPrerun = true; try { cmIntlFriendlyDay(g, iso); if (cmIntlOn(g)) euroQualDrawDay(g, iso); } finally { inPrerun = false; } });
intlHooks.cmDay = () => {
  const g = gs();
  // NationalTeams (0x76a4e0/0x76a840) og FIFA_RANKINGS (0x58dd50) bygges ved spilstarten – hos os på den første dag
  if (!g.intl?.cmSq) { cmFifaInit(g); initSquads(g); }
  cmIntlSquadDaily(g);
  cmFifaDaily(g);
  cmCallupDaily(g);
  callUps(g);
  cmIntlFriendlyDay(g, g.date);
  cmIntlPlayDay(g);
  cmFinalsDay(g);
};
intlHooks.dutyNations = dutyNations;
intlHooks.withdraw = (p, days, type) => { const g = gs(); if (cmIntlOn(g)) cmWithdrawInjured(g, p, days, type); };
