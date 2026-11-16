// Landsholdenes kalender som originalen (kun den originale database i ægte tilstand – cmActive; udvidet spil bruger international.ts' egne vinduer).
//
// Porteret (noter: ~/cm0102-engine/notes/international.md):
//  - Friendly::friendly_cup_table_init 0x5ca4f0 (landskampdatoerne: 110 poster à 0x14 bytes – ugedag, dag, måned, år i firårscyklussen, verdensdel
//    +0xc, turnering +0x10 = kvalifikationen, der bruger datoen, −1 = kun venskabskampe) og 0x5cc510 (årene: basisåret med (år − 2) % 4 = 0, + år,
//    −4 når mere end 3 år frem; Date 0x54a130/0x54a2d0 = cmDate), læst i unicorn (tools/sched/emu.py).
//  - Friendly::update_international_friendlies 0x5cbb00: 1/1 nulstilles modstanderlisterne og landene sorteres igen efter omdømmet (+0x8e,
//    qsort 0x5cc5f0); hver dag fra spilstarten [0xdd6ec8] ≤ i dag + 12: datoen i dag + 12 slås op i tabellen, og alle poster med datoen arrangeres.
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
// 'B' International (0x7e6720's B-gren: lige år før 20/6 – ikke bygget, U21-kampen spilles i stedet), U21-holdenes fyldspillere (0x90dc66 ikke læst).
import type { GameState, Player } from './types';
import { cmActive } from './cmPlayerData';
import { cmDate } from './cmCalendar';
import { addDays, ageOn } from './dates';
import { rng, Rng, hash } from './rng';
import { msvcQsort } from './engine/grid/subs';
import { randomName, emptyStats } from './data/generate';
import { forEachHuman } from './humans';
import { addNews, gs } from './state';
import { withNationFillers } from './cmPrerunMatches';
import { registerPrerun } from './cmPrerun';
import { intlHooks } from './hooks';
import { callUpNews, intlState, playNation, setNationFillers, u21Squad, type IntlRow, type IntlTie } from './international';

export const cmIntlOn = (g: GameState): boolean => cmActive(g) && !g.draft;

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
  for (const t of [st.tournament, ...(st.cont ?? [])]) {
    if (!t || t.stage === 'done') continue;
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
  // CM 01/02 kalder truppen ind, når kampen er lagt (0x76bab0 – 14 dage før; venskabskampene lægges 12 dage før)
  if (made.length && !inPrerun) {
    const opp = new Map<number, number>();
    for (const [h, a] of made) { opp.set(h, a); opp.set(a, h); }
    callUpNews([...opp.keys()], opp);
  }
}

/** add_fixture 0x5aa680 + 0x7e6720's U21-gren */
function addFixture(g: GameState, f: CmIntlFix): void {
  const s = cmState(g);
  s.fix.push(f);
  if (teamRep(g, f.h) < 2500 || teamRep(g, f.a) < 2500) return;
  const y = +f.d.slice(0, 4);
  if (y % 4 === 0) {
    // Date(1, 2, 2000)/Date(1, 8, 2000): dagene i et skudår (60, 244) – fixturens dag i året
    const doy = Math.round((Date.UTC(y, +f.d.slice(5, 7) - 1, +f.d.slice(8, 10)) - Date.UTC(y, 0, 1)) / 86400000);
    if (doy > 60 && doy < 244) return;
  }
  s.fix.push({ d: addDays(f.d, -1), h: f.h, a: f.a, u21: 1 });
}

let inPrerun = false;
/** 0x5cbb00 – dagen `iso` (i forkørslen dens dato, ellers spillets) */
export function cmIntlFriendlyDay(g: GameState, iso: string): void {
  if (!cmIntlOn(g)) return;
  const s = cmState(g);
  if (iso.slice(5) === '01-01') { s.opp = {}; s.order = sortOrder(g, s.order); }
  const start = g.cmStart ?? g.cmFitStart;
  const target = addDays(iso, 12);
  if (start && start > target) return;
  if (s.last === iso) return;
  s.last = iso;
  const entries = cmIntlDates(+iso.slice(0, 4)).filter((e) => e.d === target);
  if (entries.length) arrange(g, target, entries);
}

// ---------------------------------------------------------------- U21-holdenes fyldspillere (gæt: virtual_staff 0x90dc66 ikke læst)

const U21_FILL0 = 31_000_000;
const u21Fill = new WeakMap<GameState, Map<number, Player[]>>();
function u21Fillers(g: GameState, n: number): Player[] {
  const cache = (u21Fill.get(g) ?? u21Fill.set(g, new Map()).get(g)!);
  const hit = cache.get(n);
  if (hit) return hit;
  const have = u21Squad(n);
  const out: Player[] = [];
  const gk = have.filter((p) => p.pos[0] === Math.max(...p.pos)).length;
  if (have.length < 16 || gk < 1) {
    const r = new Rng(hash(g.seed ?? 0, 0x7e6720, n));
    const tpl = Object.values(g.players).filter((p) => !p.regen && !p.virtual && ageOn(p.dob, g.date) <= 21).slice(0, 2000);
    const want = Math.max(0, 18 - have.length);
    const y = +g.date.slice(0, 4);
    for (let k = 0; k < want && tpl.length; k++) {
      const isGk = k < 2 - Math.min(gk, 2);
      let t: Player | undefined;
      for (let i = 0; i < 400; i++) { const c = tpl[Math.floor(r.next() * tpl.length)]; if ((c.pos[0] === Math.max(...c.pos)) === isGk) { t = c; break; } }
      if (!t) continue;
      const [first, last] = randomName(g.names, n, r);
      const ca = 50 + Math.floor(r.next() * 11);
      const { cmFit: _f, cmInt: _i, ...rest } = t;
      void _f; void _i;
      out.push({
        ...rest, id: U21_FILL0 + n * 64 + k, first, last, nation: n, club: 0, ca, pa: ca, rep: 0, cmRep: [0, 0, 0], cmRepMem: [0, 0, 0], value: 0,
        dob: `${y - 18 - Math.floor(r.next() * 3)}-0${1 + Math.floor(r.next() * 9)}-1${Math.floor(r.next() * 9)}`,
        attrs: t.attrs.map((a) => Math.max(1, Math.min(20, Math.round(a * (ca / Math.max(50, t!.ca)))))), condition: 1, morale: 10, form: [], injury: null,
        banned: 0, yellowCount: 0, listed: false, loan: null, stats: emptyStats(), history: [], caps: 0, intGoals: 0, number: 0, virtual: 'other',
      } as Player);
    }
  }
  cache.set(n, out);
  return out;
}

/** dagens planlagte landskampe (U21 og venskabskampe) og EM-kvalifikationen */
export function cmIntlPlayDay(g: GameState): void {
  if (!cmIntlOn(g)) return;
  const s = cmState(g);
  const today = s.fix.filter((f) => f.d === g.date);
  if (today.length) {
    s.fix = s.fix.filter((f) => f.d !== g.date);
    for (const f of today) {
      if (f.u21) {
        setNationFillers(new Map([[f.h, u21Fillers(g, f.h)], [f.a, u21Fillers(g, f.a)]].filter(([, l]) => (l as Player[]).length) as [number, Player[]][]));
        try { if (u21Squad(f.h).length >= 11 && u21Squad(f.a).length >= 11) playNation(f.h, f.a, 'u21'); } finally { setNationFillers(null); }
      } else withNationFillers(g, [f.h, f.a], () => playNation(f.h, f.a, 'friendly'));
    }
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
/** 0x57d190 (år 2002): de 10 runder */
export const EURO04_Q_DATES = ['2002-08-31', '2002-09-04', '2002-10-05', '2002-10-09', '2003-03-22', '2003-03-26', '2003-06-04', '2003-08-30', '2003-09-03', '2003-10-04'];
/** playoff-kampene (gæt: create_playoff_stage 0x57ef50's rundetabel ikke læst) */
const EURO04_PO_DATES = ['2003-11-15', '2003-11-19'];
const EURO04_HOST = 'Portugal';

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

function startEuroQual(g: GameState): void {
  const st = intlState();
  const groups = EURO04_Q_GROUPS.map((grp) => grp.map((nm) => g.nations.findIndex((x) => x.name === nm)).filter((n) => n >= 0));
  const table: Record<number, IntlRow> = {};
  for (const n of groups.flat()) table[n] = row(n);
  const per = groups.map(roundRobin);
  const sched = EURO04_Q_DATES.map((_, r) => per.flatMap((x) => x[r] ?? []));
  st.qual = { name: 'euro', year: 2004, groups, region: groups.map(() => 'europe'), table, round: 0, dates: EURO04_Q_DATES.slice(), sched, cm: 1 };
  forEachHuman(() => addNews({ cat: 'general', key: 'intl.qual.start.euro', params: { year: 2004 } }));
}

function cmEuroQualDay(g: GameState): void {
  const st = intlState();
  // lodtrækningen før første runde (gæt: når truppen til første runde kaldes ind)
  if (g.date === addDays(EURO04_Q_DATES[0], -14) && !st.qual && !st.history.some((h) => h.name === 'euro' && h.year === 2004)) startEuroQual(g);
  const q = st.qual;
  if (!q?.cm || !q.dates || !q.sched) return;
  const r = q.dates.indexOf(addDays(g.date, 14));
  if (r >= 0) {
    const opp = new Map<number, number>();
    for (const [h, a] of q.sched[r]) { opp.set(h, a); opp.set(a, h); }
    callUpNews([...opp.keys()], opp);
  }
  const ri = q.dates.indexOf(g.date);
  if (ri >= 0) {
    for (const [h, a] of q.sched[ri]) {
      const res = withNationFillers(g, [h, a], () => playNation(h, a, 'euroq'));
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
      const res = withNationFillers(g, [h, a], () => playNation(h, a, 'euroq', 'PO'));
      if (pi === 0) { t.hg = res.hg; t.ag = res.ag; continue; }
      // samlet stilling (t.a's mål: første kamp hjemme + anden kamp ude); udebanemål, ellers lodtrækning (gæt)
      const aGoals = (t.hg ?? 0) + res.ag, bGoals = (t.ag ?? 0) + res.hg;
      t.winner = aGoals > bGoals ? t.a : bGoals > aGoals ? t.b : res.ag > (t.ag ?? 0) ? t.a : res.ag < (t.ag ?? 0) ? t.b : rng.chance(0.5) ? t.a : t.b;
    }
    if (pi === 1) {
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
  const host = g.nations.findIndex((x) => x.name === EURO04_HOST);
  q.qualified = [...(host >= 0 ? [host] : []), ...winners, seconds[0].n].filter((n, i, a) => a.indexOf(n) === i);
  const rest = rng.shuffle(seconds.slice(1).map((x) => x.n).filter((n) => !q.qualified!.includes(n)));
  q.po = [];
  for (let i = 0; i + 1 < rest.length; i += 2) q.po.push({ stage: 'PO', a: rest[i], b: rest[i + 1] } as IntlTie);
  q.poDates = EURO04_PO_DATES.slice();
  if (!q.po.length) announceQualified(g, q.qualified);
}

function announceQualified(g: GameState, qualified: number[]): void {
  forEachHuman(() => {
    const mine = g.clubs[g.userClub]?.nation;
    for (const n of qualified.filter((x) => x === mine || x === g.manager.national?.nation)) addNews({ cat: 'general', key: 'intl.qual.done.euro', params: { nation: g.nations[n]?.name ?? '', year: 2004 } });
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
  return [...out];
}

// Friendly::update_for_date er en af turneringerne (0x5cc850's vtbl+0x14(dato, 1)): også i forkørslen – dage før starten lægger kampe efter den
registerPrerun('comps1', (g, _day, iso) => { inPrerun = true; try { cmIntlFriendlyDay(g, iso); } finally { inPrerun = false; } });
intlHooks.cmDay = () => { const g = gs(); cmIntlFriendlyDay(g, g.date); cmIntlPlayDay(g); };
intlHooks.dutyNations = dutyNations;
