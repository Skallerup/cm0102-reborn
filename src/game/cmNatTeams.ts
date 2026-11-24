// Landsholdenes aktuelle turnering som originalen (national_teams.cpp: NationalTeams this+4/this+8 pr. nation) – det, forbundets forventninger og
// vurdering (MANAGER_MANAGER, cmBoard.ts) læser. Kun den originale database i ægte tilstand med landsholdene i bestyrelsessystemet (cmBoardGame.ts).
// Noter: ~/cm0102-engine/notes/international.md ("Landstrænerjob").
//
// Porteret:
//  - 0x775220 set_current_competition(nation, turnering): uden turnering → den nye; er den aktuelle en slutrunde (0x76d940-listen: VM, EM …)
//    venter den nye (+8) uden forventninger; er den nye en slutrunde, venter den gamle; ellers den nye – derefter set_season_expectations 0x6a3770
//  - 0x775000 release_competition(nation): ingen turnering; ventede en, bliver den aktuel (med forventningerne)
//  - 0x775070 release_competitions_of_continent(Europa, 1): de europæiske turneringer (aktuel og ventende) slettes, en ventende rykker op
//  - 0x775420 clear_competition_for_comp_clubs: når VM/EM er færdige (record_season_honours 0x92d310/0x57b730) mister holdene turneringen
//    (uden den ventende) og får forbundets vurdering 0x6a5610
//  - set_predicted_positions (Comp_Stats +0x72): VM 0x92f680 (holdene efter omdømmet club +0x80, qsort 0x4b07d0: 1, 2, 3, 4, 5×4, 9×8,
//    17×8, 25×8), EM 0x57c9f0 (1, 2, 3, 3, 5×4, 9×8), EM-kvalifikationen 0x5806d0 (+0xf6 = 1, 2004-kampagnen: plads 0–8 → 1, 9–11 → 10, 12–14 → 13,
//    15–17 → 16, 18–26 → 19, 27–35 → 28, 36–44 → 37, ellers 46)
//  - vtable +0x70 get_qualification_status (forventningen) og +0x74 get_qualification_status_change (vurderingen, −3..3) for VM 0x92fae0/
//    0x92fb40, EM 0x57cd30/0x57cd80 og EM-kvalifikationen 0x580b50/0x580b80 (Comp_Stats +0x72 og +0x73 = slutplaceringen: 1 vinder, 2 finalist,
//    3/4 semifinale, 5 kvartfinale, 9 ottendedel, 17/25 gruppen – VM; EM: 9 = gruppen)
//
// Kaldt fra slutrunderne: VM 2002's lodtrækning og slutning (cmIntlFinals.ts), EM-kvalifikationen 2002–03 (cmIntl.ts) og de senere VM/EM
// (international.ts). VM-zonerne fra 2004 (0x90f600 …) og de kontinentale slutrunder (Copa América, Afrikamesterskabet, Asian Cup) kalder ikke
// NationalTeams i originalen.
import type { GameState } from './types';
import { msvcQsort } from './engine/grid/subs';
import { intlHooks, natCompHook } from './hooks';
import { gs } from './state';
import { cmBoardNationalAfterMatch, cmBoardNationalAnswer, cmBoardNationalExpect, cmBoardNationalResign, cmBoardNationalReview, cmBoardOn } from './cmBoardGame';
import type { IntlTournament } from './international';

export type NtClass = 'wc' | 'euro' | 'euroq';
/** turneringernes id'er (som international.ts' INTL_COMP: VM 404, EM 406, EM-kvalifikationen 396) */
const COMP_ID: Record<NtClass, number> = { wc: 404, euro: 406, euroq: 396 };
export interface NtState {
  /** this+4 (aktuel) og this+8 (ventende) pr. nation: turneringens nøgle "klasse:år" */
  cur: Record<number, string>; pen: Record<number, string>;
  /** Comp_Stats +0x72 (forudsagt) og +0x73 (slutplacering) pr. turnering og nation */
  pos: Record<string, Record<number, [number, number]>>;
}
const on = (g: GameState) => cmBoardOn(g) && !!g.cmBoard?.nm;
const st = (g: GameState): NtState => { const i = (g.intl ??= { results: [], history: [] }); return (i.ntc ??= { cur: {}, pen: {}, pos: {} }); };
const clsOf = (key: string) => key.split(':')[0] as NtClass;
/** 0x76d940 national_teams_is_finals_comp */
const isFinals = (key: string) => clsOf(key) === 'wc' || clsOf(key) === 'euro';
/** de europæiske turneringer (club_comp +0x59 = Europa) */
const isEuropean = (key: string) => clsOf(key) === 'euro' || clsOf(key) === 'euroq';

/** vtable +0x70: forventningen af den forudsagte placering x (+0x72) */
export function ntStatus(cls: NtClass, x: number): number {
  if (cls === 'euroq') return x < 14 ? -2 : -3;
  if (x === 1) return -1;
  if (x === 2) return 150;
  if (x < 5) return 130;
  if (x < 9) return 120;
  if (cls === 'euro') return -4;
  return x < 17 ? 20 : -4;
}
/** vtable +0x74: vurderingen af den forudsagte (x = +0x72) mod den opnåede placering (a = +0x73) */
export function ntGrade(cls: NtClass, x: number, a: number): number {
  if (cls === 'euroq') return x < 14 ? (a < 14 ? 0 : -1) : (a < 14 ? 1 : 0);
  if (cls === 'euro') {
    if (x < 3) return a < 5 ? 0 : a < 9 ? -1 : -2;
    if (x < 9) return a < 5 ? 2 : a < 9 ? 0 : -1;
    return a < 5 ? 3 : a < 9 ? 2 : 0;
  }
  if (x < 3) return a < 5 ? 0 : a < 9 ? -1 : a < 17 ? -2 : -3;
  if (x < 9) return a < 5 ? 2 : a < 9 ? 0 : a < 17 ? -1 : -2;
  if (x < 17) return a < 5 ? 3 : a < 9 ? 2 : a < 17 ? 0 : -1;
  return a < 9 ? 3 : a < 17 ? 2 : 0;
}

/** 0x775220 */
function setComp(g: GameState, n: number, key: string): void {
  const s = st(g);
  const cur = s.cur[n];
  if (cur === undefined) s.cur[n] = key;
  else if (isFinals(cur)) { s.pen[n] = key; return; }
  else if (isFinals(key)) { s.pen[n] = cur; s.cur[n] = key; }
  else s.cur[n] = key;
  cmBoardNationalExpect(g, n);
}
/** 0x775000 */
function release(g: GameState, n: number): void {
  const s = st(g);
  delete s.cur[n];
  const p = s.pen[n];
  if (p === undefined) return;
  s.cur[n] = p; delete s.pen[n];
  cmBoardNationalExpect(g, n);
}
/** 0x775070(Europa, 1) */
function releaseEurope(g: GameState): void {
  const s = st(g), eu = g.cmEurope ?? -1;
  for (let n = 0; n < g.nations.length; n++) {
    if ((g.cmNationCont?.[n] ?? -1) !== eu) continue;
    if (s.cur[n] !== undefined && isEuropean(s.cur[n])) delete s.cur[n];
    if (s.pen[n] !== undefined && isEuropean(s.pen[n])) delete s.pen[n];
    if (s.pen[n] !== undefined && s.cur[n] === undefined) { s.cur[n] = s.pen[n]; delete s.pen[n]; cmBoardNationalExpect(g, n); }
  }
}

/** set_predicted_positions: holdene efter landsholdets omdømme (club +0x80, qsort 0x4b07d0 faldende) og placeringstabellen */
function predicted(g: GameState, cls: NtClass, teams: number[]): Map<number, number> {
  const rep = (n: number) => g.intl?.info?.[n]?.rep ?? g.cmNationRep?.[n] ?? 0;
  const list = teams.slice();
  msvcQsort(list, (a, b) => rep(b) - rep(a));
  const WC = [1, 2, 3, 4, 5, 5, 5, 5, ...Array(8).fill(9), ...Array(8).fill(17), ...Array(8).fill(25)];
  const EURO = [1, 2, 3, 3, 5, 5, 5, 5, ...Array(8).fill(9)];
  const q = (r: number) => (r < 9 ? 1 : r < 12 ? 10 : r < 15 ? 13 : r < 18 ? 16 : r < 27 ? 19 : r < 36 ? 28 : r < 45 ? 37 : 46);
  const m = new Map<number, number>();
  list.forEach((n, i) => m.set(n, cls === 'euroq' ? q(i) : (cls === 'wc' ? WC : EURO)[i] ?? (cls === 'wc' ? 25 : 9)));
  return m;
}

/** turneringen begynder (VM: lodtrækningen, EM: lodtrækningen, EM-kvalifikationen: grupperne): forudsagte placeringer og 0x775220 for holdene */
export function ntStart(g: GameState, cls: NtClass, year: number, teams: number[]): void {
  if (!on(g)) return;
  const key = `${cls}:${year}`;
  if (cls !== 'wc') releaseEurope(g);
  const pr = predicted(g, cls, teams);
  st(g).pos[key] = Object.fromEntries([...pr].map(([n, x]) => [n, [x, 0]]));
  for (const n of teams) setComp(g, n, key);
}
/** holdene er slået ud af turneringen (0x775000 – EM-kvalifikationens grupper/playoff) */
export function ntOut(g: GameState, cls: NtClass, year: number, teams: number[]): void {
  if (!on(g)) return;
  const key = `${cls}:${year}`;
  for (const n of teams) if (st(g).cur[n] === key) release(g, n);
}
/** turneringen er færdig (0x775420): slutplaceringerne (+0x73), holdene mister turneringen, forbundets vurdering 0x6a5610 */
export function ntEnd(g: GameState, cls: NtClass, year: number, progress: Record<number, number>): void {
  if (!on(g)) return;
  const key = `${cls}:${year}`;
  const pos = st(g).pos[key];
  if (!pos) return;
  for (const k of Object.keys(pos)) {
    const n = +k;
    pos[n][1] = progress[n] ?? pos[n][1];
    delete st(g).cur[n];
    cmBoardNationalReview(g, n, COMP_ID[cls], ntGrade(cls, pos[n][0], pos[n][1]));
  }
  delete st(g).pos[key];
}

/** slutplaceringen (+0x73) af en slutrunde: vinder 1, finalist 2, bronzekampen 3/4 (uden: semifinalisterne 3), kvartfinale 5, ottendedel 9,
 *  gruppen (VM) 17 for treerne og 25 for firerne, (EM) 9 */
export function ntProgress(t: IntlTournament): Record<number, number> {
  const out: Record<number, number> = {};
  const rows = (grp: number[]) => grp.map((n) => t.table[n]).sort((a, b) => b.pts - a.pts || b.gf - b.ga - (a.gf - a.ga) || b.gf - a.gf);
  for (const grp of t.groups) rows(grp).forEach((r, i) => { out[r.n] = t.name === 'wc' ? (i < 2 ? 9 : i === 2 ? 17 : 25) : 9; });
  const loser = (x: { a: number; b: number; winner?: number }) => (x.winner === x.a ? x.b : x.a);
  for (const x of t.ko) {
    if (x.winner === undefined) continue;
    if (x.stage === 'R16') out[loser(x)] = 9;
    else if (x.stage === 'QF') out[loser(x)] = 5;
    else if (x.stage === 'SF') out[loser(x)] = 3;
    else if (x.stage === '3P') { out[x.winner] = 3; out[loser(x)] = 4; }
    else if (x.stage === 'F') { out[x.winner] = 1; out[loser(x)] = 2; }
  }
  return out;
}

// ---------------------------------------------------------------- krogene (international.ts, cmIntl.ts, cmIntlFinals.ts kender ikke bestyrelsen)

natCompHook.fn = (g, n) => {
  const key = g.intl?.ntc?.cur[n];
  if (key === undefined) return null;
  const x = g.intl!.ntc!.pos[key]?.[n]?.[0];
  return { f: x === undefined ? 0 : ntStatus(clsOf(key), x), t: COMP_ID[clsOf(key)] };
};
intlHooks.boardOn = () => on(gs());
intlHooks.ntStart = (cls, year, teams) => ntStart(gs(), cls, year, teams);
intlHooks.ntOut = (cls, year, teams) => ntOut(gs(), cls, year, teams);
intlHooks.ntEnd = (cls, year, t) => ntEnd(gs(), cls, year, ntProgress(t));
intlHooks.nationalAnswer = (accept) => cmBoardNationalAnswer(gs(), accept);
intlHooks.nationalResign = () => cmBoardNationalResign(gs());
/** international.ts INTL_COMP og intlCodes – fixture-koderne for landskampene */
const COMPS: Record<string, number> = { friendly: 72, wcq: 390, euroq: 396, wc: 404, euro: 406, copa: 407, afcon: 408, asian: 399 };
/** værtslandene for slutrunderne (spillestedets nation – HostCountry; Afrikamesterskabet 2002 som cmIntlFinals.ts' standardtabel) */
const HOSTS: Record<string, string[]> = { 'wc:2002': ['South Korea', 'Japan'], 'euro:2004': ['Portugal'], 'afcon:2002': ['Egypt'], 'copa:2001': ['Colombia'] };
intlHooks.boardMatch = (home, away, rep, kind, stage) => {
  const g = gs();
  if (!on(g) || kind === 'u21') return;
  const finals = kind === 'wc' || kind === 'euro' || kind === 'copa' || kind === 'afcon' || kind === 'asian';
  const w30 = stage === 'F' ? 150 : stage === '3P' ? 140 : stage === 'SF' ? 130 : stage === 'QF' ? 120 : stage === 'R16' ? 20 : stage === 'F1' || stage === 'PO' ? 153 : stage === 'F2' ? 154 : 0;
  let venue = home;
  if (finals) {
    const hosts = (HOSTS[`${kind}:${g.date.slice(0, 4)}`] ?? []).map((nm) => g.nations.findIndex((x) => x.name === nm)).filter((n) => n >= 0);
    venue = hosts.find((n) => n === home || n === away) ?? hosts[0] ?? -1;
  }
  cmBoardNationalAfterMatch(g, home, away, rep, { b3a: kind === 'friendly' ? 9 : 10, w30: kind === 'friendly' ? 0 : w30, compId: COMPS[kind] ?? 72, friendly: kind === 'friendly', venue,
    name: kind === 'wcq' ? `World Cup Quals (${WCQ_CONT[g.cmNationCont?.[home] ?? -1] ?? 'EUR'})` : NAT_COMP_SHORT[kind] ?? '' });
};
/** nation_comp.dat +0x38 (3.9.68) – turneringens korte navn i bestyrelsens kampreaktion; VM-kvalifikationen efter verdensdelen (continent.dat 0–5) */
const NAT_COMP_SHORT: Record<string, string> = { friendly: 'Friendly', euroq: "Euro Ch'ship Quals", wc: 'World Cup', euro: 'European Championship', copa: 'Copa America',
  afcon: 'African Nations', asian: 'Asian Cup' };
const WCQ_CONT = ['AFR', 'ASI', 'EUR', 'CON', 'OCE', 'SAM'];
