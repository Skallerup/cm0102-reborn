// Slutrunderne i 2001/02 som originalen (kun den originale database i ægte tilstand – cmIntlOn). Noter: ~/cm0102-engine/notes/international.md.
//
// Porteret:
//  - VM 2002 (world_cup.cpp, klassen 0x92bf50): lodtrækningen Date(27, december, år − 1) (0x92d2bd, +0xb6/+0xb8 = −1); 2002 er fast (0x92eb46: år =
//    2002 → de 32 lande i grupperne A–H, 0x92eb52..0x92ef53 – WC2002 i international.ts); gruppernes runder create_schedule 0x92c290 (0x68a160:
//    Date(12/19/24, juni, ugedag fre/fre/ons) = 14/6, 21/6, 26/6) og tv-pladserne pr. gruppe (springtabellen 0x92ccd0 → 0x68a1c0 art 3: rundens to
//    kampe flyttes ved oprettelsen til ugedagen nærmest rundens dato – League::move_fixtures_for_tv 0x685640); slutspillet (0x521e60/0x521eb0):
//    ottendedelsfinaler 2/7, kvartfinaler 6/7, semifinaler 10/7, bronzekamp 13/7 (+0x30 = 140), finale 14/7 (150); ottendedelsfinalernes parringer
//    0x92d770: A1–B2, D1–C2, E1–F2, H1–G2, B1–A2, C1–D2, F1–E2, G1–H2; vinderne mødes parvis (Cup_Stage).
//  - Afrikamesterskabet 2002 (african_nations.cpp 0x401000): lodtrækningen Date(5, oktober, år − 1, lørdag) = 6/10-2001 (0x401b32); feltet
//    draw_finalists 0x4022c0: værterne (HostCountry::find_hosts 0x5fa730 – 2002: Egypten), så de afrikanske landshold i landenes rækkefølge (højst
//    50), værterne først og resten sorteret efter landsholdets omdømme club +0x80 (qsort 0x4b07d0); de 16 første i fire potter (1–4, 5–8, 9–12,
//    13–16), gruppe k får en tilfældig fra hver pot (rand(4) indtil en ledig, 0x4024de); runderne 10/2, 14/2, 18/2 og tv-pladserne (0x4012e0);
//    kvartfinaler 23/2 (0x402090: A1–B2, C1–D2, C2–D1, B1–A2), semifinaler 27/2, bronzekamp 1/3, finale 2/3 (oraklet crowd1: dag 39–60).
//  - Copa América 2001 (goldcup.cpp 0x5e0660): de faste 12 (pick_entrants 0x5e1d65: Colombia, Brasilien, Costa Rica, Chile, Mexico, Honduras,
//    Ecuador, Peru, Uruguay, Venezuela, Paraguay, Bolivia), gruppe A = plads 0, 3, 6, 9 (0x5e11e0), B og C = 1, 4, 7, 10 / 2, 5, 8, 11 (0x5e16b0);
//    lodtrækningen Date(20, marts, år, lørdag) = 17/3-2001 (0x5e1358); runderne 0x5e0900 (Date(6/10/13, juli, tor/man/tor)) og tv-pladserne – alle
//    18 gruppekampe ligger i forkørslen som i oraklet (dag 184–193); slutspillet create_knockout_stage 0x5e18a0: de tre treere rangeres (0x6827d0),
//    listen A1 A2 B1 B2 C1 C2 T1 T2 blandes (0x4afb40: 3·8 ombytninger af rand(8) og rand(8)) og parres; kvartfinaler 15/7 og 16/7 (oraklet: to og to),
//    semifinaler 18/7, bronzekamp 21/7, finale 22/7.
// *estimeret*: kampenes rækkefølge i en grupperunde (League::create_fixtures 0x6835c0's par ikke læst – 1–2/3–4, 1–3/2–4, 1–4/2–3 som spillets
// gruppespil) og dermed hvilken kamp, der får rundens første tv-plads.
import type { GameState } from './types';
import { cmDate, nearestWeekday } from './cmCalendar';
import { addDays } from './dates';
import { rng } from './rng';
import { msvcQsort } from './engine/grid/subs';
import { forEachHuman } from './humans';
import { addNews } from './state';
import { selectFinals } from './cmIntlSquad';
import { intlHooks } from './hooks';
import { intlState, playNation, rowsOf, WC2002, type IntlName, type IntlTie, type IntlTournament } from './international';

/** en planlagt slutrundekamp: dato, hold, runde ('G' = gruppespillet med gruppens indeks) */
export interface CmFinMatch { d: string; a: number; b: number; st: 'G' | 'R16' | 'QF' | 'SF' | '3P' | 'F'; grp?: number; done?: 1 }
export interface CmFinals { sched: CmFinMatch[]; out: number[]; first: string; final: string }

const PAIRS = [[[0, 1], [2, 3]], [[0, 2], [1, 3]], [[0, 3], [1, 2]]];

/** gruppernes kampe: tre runder (ISO-datoerne) og tv-pladsernes ugedage pr. gruppe [runde][kamp] (−1 = ikke flyttet) */
export function groupMatches(groups: number[][], rounds: string[], tv: number[][][]): CmFinMatch[] {
  const out: CmFinMatch[] = [];
  groups.forEach((grp, gi) => PAIRS.forEach((pairs, r) => pairs.forEach(([i, j], k) => {
    const wd = tv[gi]?.[r]?.[k] ?? -1;
    out.push({ d: wd >= 0 ? nearestWeekday(rounds[r], wd) : rounds[r], a: grp[i], b: grp[j], st: 'G', grp: gi });
  })));
  return out.sort((x, y) => (x.d < y.d ? -1 : x.d > y.d ? 1 : 0));
}

/** 0x92ccd0 (VM 2002): tv-pladsernes ugedage (0 = mandag) for gruppe A–H, runde 1–3, kamp 1–2 (gruppe G's sidste kamp har ingen plads) */
export const WC_TV = [[[2, 2], [1, 1], [1, 1]], [[3, 3], [2, 2], [1, 1]], [[4, 4], [3, 3], [2, 2]], [[4, 5], [5, 5], [2, 2]],
  [[5, 5], [5, 5], [3, 3]], [[6, 0], [6, 6], [3, 3]], [[0, 0], [0, 0], [4, -1]], [[6, 6], [5, 6], [4, 4]]];
/** 0x4012e0 (Afrikamesterskabet): gruppe A–D */
export const ACN_TV = [[[5, 6], [2, 2], [6, 6]], [[0, 0], [3, 3], [0, 0]], [[6, 6], [2, 3], [0, 0]], [[0, 1], [4, 4], [1, 1]]];
/** 0x5e0900 (Copa América): gruppe A–C */
export const COPA_TV = [[[2, 3], [6, 6], [2, 2]], [[4, 4], [0, 0], [3, 3]], [[5, 5], [1, 1], [4, 4]]];
/** 0x5e1d65: Copa América 2001's 12 (pladsernes rækkefølge) */
const COPA_2001 = ['Colombia', 'Brazil', 'Costa Rica', 'Chile', 'Mexico', 'Honduras', 'Ecuador', 'Peru', 'Uruguay', 'Venezuela', 'Paraguay', 'Bolivia'];
/** HostCountry::init_default_table 0x5f9970: Afrikamesterskabet 2002 = Egypten */
const ACN_2002_HOST = 'Egypt';

const nationIdx = (g: GameState, name: string) => g.nations.findIndex((x) => x.name === name);
const row = (n: number) => ({ n, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 });

/** slutspillets dage (0x521eb0 – se filhovedet) */
const FIN_KO: Record<string, Record<string, string>> = {
  wc: { R16: '2002-07-02', QF: '2002-07-06', SF: '2002-07-10', '3P': '2002-07-13', F: '2002-07-14' },
  afcon: { QF: '2002-02-23', SF: '2002-02-27', '3P': '2002-03-01', F: '2002-03-02' },
  copa: { QF: '2001-07-15', SF: '2001-07-18', '3P': '2001-07-21', F: '2001-07-22' },
};

function create(g: GameState, name: IntlName, year: number, groups: number[][], sched: CmFinMatch[], final: string): IntlTournament {
  const t: IntlTournament = { name, year, groups, table: {}, ko: [], stage: 'G1', cm: { sched, out: [], first: sched[0].d, final },
    // visningen (IntlTourClassic): gruppe A's runder og slutspillets dage
    days: { g: sched.filter((f) => f.grp === 0).map((f) => f.d.slice(5)).filter((d, i, a) => a.indexOf(d) === i), ko: Object.fromEntries(Object.entries(FIN_KO[name] ?? {}).map(([k, d]) => [k, d.slice(5)])) } };
  for (const n of groups.flat()) t.table[n] = row(n);
  const st = intlState();
  if (name === 'wc') st.tournament = t;
  else st.cont = [...(st.cont ?? []).filter((x) => x.name !== name), t];
  forEachHuman(() => addNews({ cat: 'general', key: `intl.start.${name}`, params: { year, n: groups.flat().length } }));
  void g;
  return t;
}

/** VM 2002: lodtrækningen 27/12-2001 */
function wcDraw(g: GameState): void {
  const groups = WC2002.map((grp) => grp.map((nm) => nationIdx(g, nm)));
  if (groups.flat().some((n) => n < 0)) return;
  const rounds = [cmDate(12, 5, 2002, 4), cmDate(19, 5, 2002, 4), cmDate(24, 5, 2002, 2)];
  create(g, 'wc', 2002, groups, groupMatches(groups, rounds, WC_TV), '2002-07-14');
  intlHooks.ntStart?.('wc', 2002, groups.flat());                      // 0x92f680 set_predicted_positions → 0x775220 (NationalTeams)
}

/** Afrikamesterskabet 2002: lodtrækningen 6/10-2001 (0x4022c0) */
function acnDraw(g: GameState): void {
  const host = nationIdx(g, ACN_2002_HOST);
  const africa = g.cmNationCont ? 0 : -1;
  const hosts = host >= 0 ? [host] : [];
  const rest: number[] = [];
  for (let n = 0; n < g.nations.length && hosts.length + rest.length < 50; n++) if ((g.cmNationCont?.[n] ?? -1) === africa && !hosts.includes(n)) rest.push(n);
  const rep = (n: number) => g.intl?.info?.[n]?.rep ?? g.cmNationRep?.[n] ?? 0;
  msvcQsort(rest, (x, y) => rep(y) - rep(x));
  const list: (number | null)[] = [...hosts, ...rest].slice(0, 16);
  if (list.length < 16) return;
  const groups: number[][] = [[], [], [], []];
  for (let k = 0; k < 4; k++) for (let pot = 0; pot < 4; pot++) {
    let i: number;
    do i = rng.int(0, 3); while (list[pot * 4 + i] === null);
    groups[k].push(list[pot * 4 + i]!);
    list[pot * 4 + i] = null;
  }
  create(g, 'afcon', 2002, groups, groupMatches(groups, ['2002-02-10', '2002-02-14', '2002-02-18'], ACN_TV), '2002-03-02');
}

/** Copa América 2001: lodtrækningen 17/3-2001 (i forkørslen) */
function copaDraw(g: GameState): void {
  const slots = COPA_2001.map((nm) => nationIdx(g, nm));
  if (slots.some((n) => n < 0)) return;
  const groups = [0, 1, 2].map((k) => [0, 1, 2, 3].map((i) => slots[3 * i + k]));
  const rounds = [cmDate(6, 6, 2001, 3), cmDate(10, 6, 2001, 0), cmDate(13, 6, 2001, 3)];
  create(g, 'copa', 2001, groups, groupMatches(groups, rounds, COPA_TV), '2001-07-22');
}

/** de nye slutspilskampe, når en runde er færdig */
function nextRound(t: IntlTournament, stage: CmFinMatch['st']): void {
  const cm = t.cm!;
  const add = (st: CmFinMatch['st'], d: string, a: number, b: number) => { cm.sched.push({ d, a, b, st }); t.ko.push({ stage: st, a, b } as IntlTie); };
  const pos = (gi: number, k: number) => rowsOf(t, t.groups[gi])[k].n;
  const winners = (st: string) => t.ko.filter((x) => x.stage === st).map((x) => x.winner!);
  const losers = (st: string) => t.ko.filter((x) => x.stage === st).map((x) => (x.winner === x.a ? x.b : x.a));
  const D = FIN_KO[t.name];
  if (stage === 'G') {
    for (const gi of t.groups.keys()) for (const n of rowsOf(t, t.groups[gi]).slice(2).map((r) => r.n)) cm.out.push(n);
    if (t.name === 'wc') {
      const P: [number, number, number, number][] = [[0, 0, 1, 1], [3, 0, 2, 1], [4, 0, 5, 1], [7, 0, 6, 1], [1, 0, 0, 1], [2, 0, 3, 1], [5, 0, 4, 1], [6, 0, 7, 1]];
      for (const [g1, k1, g2, k2] of P) add('R16', D.R16, pos(g1, k1), pos(g2, k2));
      t.stage = 'R16';
    } else if (t.name === 'afcon') {
      const P: [number, number, number, number][] = [[0, 0, 1, 1], [2, 0, 3, 1], [2, 1, 3, 0], [1, 0, 0, 1]];
      for (const [g1, k1, g2, k2] of P) add('QF', D.QF, pos(g1, k1), pos(g2, k2));
      t.stage = 'QF';
    } else {
      // 0x5e18a0: de tre treere i en midlertidig tabel (0x6827d0), de to bedste med; listen blandes (0x4afb40)
      const thirds = t.groups.map((grp) => rowsOf(t, grp)[2]).sort((a, b) => b.pts - a.pts || b.gf - b.ga - (a.gf - a.ga) || b.gf - a.gf);
      cm.out = cm.out.filter((n) => n !== thirds[0].n && n !== thirds[1].n);
      const list = [pos(0, 0), pos(0, 1), pos(1, 0), pos(1, 1), pos(2, 0), pos(2, 1), thirds[0].n, thirds[1].n];
      for (let k = 0; k < 3 * list.length; k++) { const i = rng.int(0, 7), j = rng.int(0, 7); [list[i], list[j]] = [list[j], list[i]]; }
      for (let k = 0; k < 8; k += 2) add('QF', k < 4 ? D.QF : addDays(D.QF, 1), list[k], list[k + 1]);
      t.stage = 'QF';
    }
    return;
  }
  for (const n of losers(stage)) if (stage !== 'SF') cm.out.push(n);
  const w = winners(stage);
  if (stage === 'R16') { for (let i = 0; i < 8; i += 2) add('QF', D.QF, w[i], w[i + 1]); t.stage = 'QF'; }
  else if (stage === 'QF') { for (let i = 0; i < 4; i += 2) add('SF', D.SF, w[i], w[i + 1]); t.stage = 'SF'; }
  else if (stage === 'SF') { const l = losers('SF'); add('3P', D['3P'], l[0], l[1]); add('F', D.F, w[0], w[1]); t.stage = 'F'; }
}

function playMatch(t: IntlTournament, f: CmFinMatch): void {
  const g = intlState();
  void g;
  if (f.st === 'G') {
    const r = playNation(f.a, f.b, t.name, undefined);
    const a = t.table[f.a], b = t.table[f.b];
    a.p++; b.p++; a.gf += r.hg; a.ga += r.ag; b.gf += r.ag; b.ga += r.hg;
    if (r.hg > r.ag) { a.w++; a.pts += 3; b.l++; } else if (r.hg < r.ag) { b.w++; b.pts += 3; a.l++; } else { a.d++; b.d++; a.pts++; b.pts++; }
    (t.played ??= []).push(`${f.a}-${f.b}`);
  } else {
    const r = playNation(f.a, f.b, t.name, f.st, true);
    const tie = t.ko.find((x) => x.stage === f.st && x.a === f.a && x.b === f.b && x.winner === undefined);
    if (tie) {
      tie.hg = r.hg; tie.ag = r.ag; tie.pens = !!r.pens;
      tie.winner = r.hg > r.ag ? tie.a : r.hg < r.ag ? tie.b : r.pens ? (r.pens[0] > r.pens[1] ? tie.a : tie.b) : rng.chance(0.5) ? tie.a : tie.b;
    }
  }
  f.done = 1;
}

function finish(gs0: GameState, t: IntlTournament): void {
  const fin = t.ko.find((x) => x.stage === 'F');
  if (!fin || fin.winner === undefined) return;
  t.winner = fin.winner; t.runnerUp = fin.a === fin.winner ? fin.b : fin.a; t.stage = 'done';
  if (t.name === 'wc') intlHooks.ntEnd?.('wc', t.year, t);              // 0x92d310 record_season_honours → 0x775420 (forbundenes vurdering)
  intlState().history.unshift({ year: t.year, name: t.name, winner: t.winner, runnerUp: t.runnerUp });
  forEachHuman(() => addNews({ cat: 'general', key: `intl.winner.${t.name}`, params: { nation: gs0.nations[t.winner!]?.name ?? '', runnerUp: gs0.nations[t.runnerUp!]?.name ?? '', year: t.year } }));
}

/** dagen (`g.date` – i forkørslen forkørslens dag): lodtrækningerne, udtagelserne 14 dage før (0x76b100 → 0x76bab0 med slutrundens størrelser) og
 *  dagens kampe */
export function cmFinalsDay(g: GameState, prerun = false): void {
  if (g.date === '2001-03-17' && !intlState().cont?.some((x) => x.name === 'copa' && x.year === 2001)) copaDraw(g);
  if (g.date === cmDate(5, 9, 2001, 5) && !intlState().cont?.some((x) => x.name === 'afcon' && x.year === 2002)) acnDraw(g);
  if (g.date === '2001-12-27' && !(intlState().tournament?.name === 'wc' && intlState().tournament?.year === 2002)) wcDraw(g);
  for (const t of cmTournaments(g)) {
    const cm = t.cm!;
    // 0x76bab0 14 dage før landets første kamp: slutrundens trup (23/23) til og med finalen
    if (!prerun) {
      const by = new Map<number, string>();
      for (const f of cm.sched) for (const n of [f.a, f.b]) if (!by.has(n) || by.get(n)! > f.d) by.set(n, f.d);
      const due = [...by].filter(([, d]) => addDays(d, -14) === g.date).map(([n]) => n);
      if (due.length) selectFinals(g, due, t.name, g.date, cm.final);
    }
    const today = cm.sched.filter((f) => f.d === g.date && !f.done);
    for (const f of today) playMatch(t, f);
    if (!today.length) continue;
    // runden er færdig: næste runde (gruppespillet: alle gruppekampe spillet)
    const st = today[0].st;
    if (cm.sched.every((f) => f.st !== st || f.done)) {
      if (st === 'F' || st === '3P') { if (cm.sched.every((f) => f.done)) finish(g, t); }
      else nextRound(t, st);
    }
  }
}

/** slutrunderne, originalens kalender kører (ikke færdige) */
export function cmTournaments(g: GameState): IntlTournament[] {
  const st = g.intl;
  return [st?.tournament, ...(st?.cont ?? [])].filter((t): t is IntlTournament => !!t?.cm && t.stage !== 'done');
}

/** landene i slutrunden, der stadig er med (landsholdsopholdet: fra 10 dage før den første kamp – 0x76c31b – til holdet er ude, 0x774f90) */
export function cmFinalsDuty(g: GameState): number[] {
  const out: number[] = [];
  for (const t of cmTournaments(g)) {
    if (g.date < addDays(t.cm!.first, -10)) continue;
    for (const k of Object.keys(t.table)) if (!t.cm!.out.includes(+k)) out.push(+k);
  }
  return out;
}

/** lande med en slutrundekamp i [fra, til] (venskabskampenes vagt 0x5cbdf0: kampe af type 0/1 ±4 dage) */
export function cmFinalsBusy(g: GameState, from: string, to: string): number[] {
  const out: number[] = [];
  for (const t of cmTournaments(g)) {
    for (const f of t.cm!.sched) if (f.d >= from && f.d <= to) out.push(f.a, f.b);
    // slutspillets kampe findes først, når runden før er spillet – holdene, der stadig er med, er optaget i slutspillets dage
    if (t.cm!.final >= from && t.cm!.first <= to) for (const k of Object.keys(t.table)) if (!t.cm!.out.includes(+k)) out.push(+k);
  }
  return out;
}
