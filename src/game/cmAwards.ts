// CM 01/02's priser (award/*.cpp i cm0102.exe 3.9.68, afkodet 14/11-2026) – kun den originale database i ægte tilstand (cmActive).
//
//   AWARD_MANAGER 0x413180 (dagligt 0x413540 efter dagens kampe; process_fixture 0x4134c0 fra match_day_apply_match_result 0x6b616e)
//   EnglandAwards 0x5788c0 (init: 2 + 4·6 priser, Conference kun med nation+0x11c & 4 – findes ikke i spillet)
//     [0] YEAR  English Players Player of the Year          (0x9cfa34)  rep 8000/5000
//     [1] YEAR  English Players Young Player of the Year    (0x9cfa38)  rep 7000/3500
//     pr. division (Premier/First/Second/Third, 6 poster fra [2]):
//       TEAM  … Team of the Week                            (0x9cfa6c…) rep 4000/500
//       MONTH … Manager of the Month                        (0x9cfbd8…) rep 5000/1500, manager
//       MONTH … Player of the Month                         (0x9cfa4c…) rep 5000/1500
//       MONTH … Young Player of the Month                   (0x9cfa5c…) rep 4500/1000
//       YEAR  … Manager of the Year                         (0x9cfbd4…) rep 7500/3500, manager
//       TEAM  English Players … Division Select             (0x9cfa3c…) rep 6500/2500
//   EnglandAwards::daily_update 0x579610: Date(5,3) = 6/4 → PFA-priserne (0x768cf0, statistiktype 0x11, Premier Division) og årets hold
//     (0x7698f0) for de fire divisioner; Date(30,4) = 31/5 → årets manager (0x768940) for de fire.
//   NationAwards::daily_update 0x768310: når i morgen er en ny måned → on_month_change 0x579900 (månedens manager 0x86f950, månedens spiller
//     og unge spiller 0x767150 – alder ≤ 20) og MONTH_RATINGS::reset 0x767f60.
//   MONTH_AWARD 0x766e10: kun månederne august (7) .. maj (4) – set_winner 0x7671c0 finder ellers ingen plads (ingen pris i juni/juli).
//   MONTH_RATINGS 0x767ee0/0x767fa0: alle spillere, der spillede (startere og brugte indskiftere, ikke genererede id ≥ [0xae2364]), i
//     kampe i landets turneringer (ikke venskabskampe, fixture+0x3a = 1): [staff, klubbens division ved første kamp, sum af den viste
//     karakter +0x35, kampe, alder +0x18]. find_best_player 0x768130: snit (sum/kampe; < 3 kampe sorteres sidst, 0x768200), mindstekravet
//     3, 2, 1, 0 kampe; division = posten og klubbens nuværende; med aldersgrænse kun spillere, efter at 3 ældre er sprunget over.
//   Staff_Records::record_match_result 0x868830: managerens point pr. kamp = trunc(vigtighed · trunc(modstanderens omdømme/1000) ·
//     turneringens omdømme (+0x69) · (X + 900/300/0) · 50 / 100000), X = 50·(mål + skud på mål) + 10·(skud ved siden) + 5·hjørnespark
//     (kampens holdblok +0/+8/+9/+0xa). +0xce (månedens, kun klubbens liga) nulstilles den 1. (0x86dda0), +0xba (sæsonens) ved landets
//     sæsonslut (0x86d6e0). 0x86f950: højeste +0xce > 0 blandt ligaens klubber med en manager, der har været der i 2 uger.
//     0x86fab0: de tre højeste +0xba, manager ankommet for 28 uger siden og mindst én kamp – kun med tre kandidater gives prisen.
//   0x768cf0 (årets spiller): Comp_Stats' snit (type 0x11 0x4a33df: karaktersum/kampe, kræver kampe ≥ ½ af klubbens) sorteret; de tre første
//     med starter (kampe − indskiftninger) ≥ trunc(ligakampe · f), f = 0,66, 0,56, … (−0,1); aldersgrænse som ovenfor (21 for de unge).
//   0x7698f0 (årets hold): samme liste, starter > trunc(kampe · f), TEAM_AWARD::add_candidate 0x8afa40 – pladsmaskerne 0x8afdc0 (type 0:
//     4-4-2 + 3 udskiftere), spillerens positioner 0x5b7d20 (+ SW→D, DM/AM→M, F+side→F midt), første ledige plads, ellers flyt en anden.
//   award_raise_winner_reputation 0x412f00: vinderens omdømme (spiller +9/+0xb/+0xd, manager +8/+0xa/+0xc).
//   Nyhederne: MONTH_AWARD::post_winner_news 0x767330/write_news 0x767580 (type 0x1b til divisionens managere), YEAR_AWARD 0x9304f0/0x930880
//     (division, ellers landet), TEAM_AWARD 0x8b0140/0x8b0370 (klubberne med spillere på holdet).
//
// *Estimeret* / ikke porteret: turneringens vigtighed (League::get_match_importance 0x68a3e0 – liga+0x51 kendes ikke; sat til 10, så den kun
//   skalerer), Team of the Week (0x769c70 – hvornår den kaldes er ikke fundet: her mandag, kampene fra torsdag til søndag, uden nyhed),
//   hvilken af nyhedernes varianter der vælges (originalen bruger staff-id/utils_random – her en fast hash), positionsordet (0x5465a0 er
//   rigere), International/European Awards (0x632e20/0x5836a0: YEAR_RATINGS og afstemningerne – kun databasens tidligere vindere vises),
//   klubbens +1000 (0x41310e) og Shortlist-kaldet 0x842c00. Prisen afgøres ved dagens start dagen efter (originalen: efter dagens kampe).
import AW from './data/cmAwards.json';
import { leagueRows } from './competitions';
import { ageOn, addDays, day, month, weekday } from './dates';
import { asOwner, isHumanClub } from './humans';
import { addNews } from './state';
import { cmActive, clubRepMem, repMemOf } from './cmPlayerData';
import { naturalMask } from './engine/grid/aiTacticChoice';
import type { Fixture, GameState, MatchReport, Player } from './types';

type AwardRow = [number, string, string, number, number];
const AWARDS = AW.awards as unknown as AwardRow[];
const HISTORY = AW.history as unknown as Record<string, [number, (string | null)[]][]>;
const BY_NAME = new Map(AWARDS.map((a) => [a[1], a[0]]));
export const cmAwardName = (id: number) => AWARDS[id]?.[1] ?? '';
/** databasens tidligere vindere (staff_comp_history.dat): [år, [1., 2., 3.]] */
export const cmAwardHistory = (id: number) => HISTORY[String(id)] ?? [];

export type CmAwKind = 'month' | 'mgrMonth' | 'year' | 'mgrYear' | 'team' | 'week';
export interface CmAwDef { id: number; kind: CmAwKind; tier: number; age?: number; rep: [number, number] }

const DIV = ['Premier', 'First', 'Second', 'Third'];
const id = (n: string) => BY_NAME.get(n) ?? -1;
/** EnglandAwards::init_awards 0x5788c0 (Conference-blokken udeladt) */
export const ENGLAND_AWARDS: CmAwDef[] = [
  { id: id('English Players Player of the Year'), kind: 'year', tier: 1, rep: [8000, 5000] },
  { id: id('English Players Young Player of the Year'), kind: 'year', tier: 1, age: 21, rep: [7000, 3500] },
  ...DIV.flatMap((d, i): CmAwDef[] => [
    { id: id(`English ${d} Division Team of the Week`), kind: 'week', tier: i + 1, rep: [4000, 500] },
    { id: id(`English ${d} Division Manager of the Month`), kind: 'mgrMonth', tier: i + 1, rep: [5000, 1500] },
    { id: id(`English ${d} Division Player of the Month`), kind: 'month', tier: i + 1, rep: [5000, 1500] },
    { id: id(`English ${d} Division Young Player of the Month`), kind: 'month', tier: i + 1, age: 20, rep: [4500, 1000] },
    { id: id(`English ${d} Division Manager of the Year`), kind: 'mgrYear', tier: i + 1, rep: [7500, 3500] },
    { id: id(`English Players ${d} Division Select`), kind: 'team', tier: i + 1, rep: [6500, 2500] },
  ]),
];
/** InternationalAwards 0x632b30 og EuropeanAwards 0x583480 – kun databasens historik (afstemningerne er ikke porteret) */
export const INTL_AWARDS = ['FIFA World Player of the Year', 'World Footballer of the Year', 'European Footballer of the Year', 'South American Footballer of the Year',
  'African Footballer of the Year', 'European Goalkeeper of the Year', 'European Defender of the Year', 'European Midfielder of the Year', 'European Striker of the Year'].map(id).filter((x) => x >= 0);

/** en vinder: spiller-id (eller staff-id for en manager / −1 for menneskets klub), klubben og værdien (snit/point) */
export interface CmAwPlace { id: number; mgr?: boolean; club: number; name: string; v?: number }
export interface CmAwWin {
  a: number;            // staff_comp-id
  y: number;            // sæsonens startår
  m?: number;           // måned 1..12 (månedens priser)
  d: string;            // afgjort
  w: CmAwPlace[];
  /** holdpriserne: [spiller, klub, pladsmaske] */
  team?: [number, number, number][];
}
export interface CmAwState {
  /** MONTH_RATINGS (England): måned/år og [division, sum, kampe, alder] pr. spiller */
  mr: { y: number; m: number; r: Record<number, [string, number, number, number]> };
  /** Comp_Stats pr. engelsk liga: [kampe, indskiftninger, karaktersum, mål, klub] pr. spiller */
  cs: Record<string, Record<number, [number, number, number, number, number]>>;
  /** Staff_Records' managerpost pr. manager-nøgle: [+0xce månedens, +0xba sæsonens, +0x8e kampe] */
  mg: Record<string, [number, number, number]>;
  mgM: string;
  won: CmAwWin[];
  /** Team of the Week: ligakampenes viste karakterer [spiller, karakter, dato] pr. liga (0x769c70 læser Match_Stats' kampposter) */
  wk?: Record<string, [number, number, string][]>;
}

export function cmAwOn(g: GameState): boolean {
  return cmActive(g) && !g.draft;
}

function st(g: GameState): CmAwState {
  return (g.cmAw ??= { mr: { y: +g.date.slice(0, 4), m: month(g.date), r: {} }, cs: {}, mg: {}, mgM: g.date.slice(0, 7), won: [] });
}

/** de engelske ligaer (tier 1..4) i spillet */
export function englandLeagues(g: GameState): string[] {
  const out: string[] = [];
  for (const [cid, l] of Object.entries(g.leagues)) {
    if (l.hidden || g.nations[l.nation]?.name !== 'England' || l.tier < 1 || l.tier > 4 || g.comps[cid]?.type !== 'league') continue;
    out[l.tier - 1] = cid;
  }
  return out;
}
const isEngland = (g: GameState, compId: string) => { const c = g.comps[compId]; return !!c && c.nation >= 0 && g.nations[c.nation]?.name === 'England'; };

/** managerens nøgle: databasens staff-id, menneskets klub som "h<klub>" */
function mgrKey(g: GameState, club: number): string | null {
  const c = g.clubs[club];
  if (!c) return null;
  if (c.manager === -1) return `h${club}`;
  return c.manager > 0 && g.staff[c.manager] ? `s${c.manager}` : null;
}
function mgrJoined(g: GameState, club: number): string {
  const c = g.clubs[club];
  if (c?.manager === -1) return g.manager.cmJoined ?? g.cmStart ?? g.date;
  const s = c ? g.staff[c.manager] : undefined;
  const car = s?.career?.filter((x) => x.club === club && !x.to).at(-1);
  return car?.from ?? s?.cmJoined ?? g.cmStart ?? '2001-07-14';
}
function mgrName(g: GameState, club: number): string {
  const c = g.clubs[club];
  if (c?.manager === -1) return g.manager.name;
  const s = c ? g.staff[c.manager] : undefined;
  return s ? `${s.first} ${s.last}`.trim() : '?';
}
const pname = (p: Player) => `${p.first} ${p.last}`.trim();
/** den viste karakter (MATCH_PLAYER +0x1b = trunc((+0x35 + 500)/1000), 1..10) */
const shownRating = (r: number) => Math.max(1, Math.min(10, Math.floor(r + 0.5)));

// ---------------------------------------------------------------- efter hver kamp

/** AWARD_MANAGER::process_fixture 0x4134c0 (MONTH_RATINGS 0x767ee0) + Comp_Stats for ligaerne + Staff_Records 0x868830 */
export function cmAwardsAfterMatch(g: GameState, f: Fixture, rep: MatchReport): void {
  if (!cmAwOn(g) || f.comp === 'FRIENDLY' || f.comp.startsWith('FR')) return;
  const comp = g.comps[f.comp];
  if (!comp || !isEngland(g, f.comp)) return;
  const s = st(g);
  const league = comp.type === 'league';
  const cs = league ? (s.cs[f.comp] ??= {}) : null;
  for (const line of rep.players) {
    const p = g.players[line.id];
    if (!p || p.virtual) continue;
    const r = shownRating(line.rating);
    const e = s.mr.r[p.id];
    if (e) { e[1] += r; e[2]++; }
    else {
      const div = g.clubs[p.club]?.league ?? '';
      s.mr.r[p.id] = [div, r, 1, ageOn(p.dob, g.date)];
    }
    if (league) ((s.wk ??= {})[f.comp] ??= []).push([p.id, r, f.date]);
    if (cs) {
      const c = (cs[p.id] ??= [0, 0, 0, 0, p.club]);
      c[0]++; if (line.sub) c[1]++; c[2] += r; c[3] += line.goals; c[4] = p.club;
    }
  }
  // Staff_Records::record_match_result 0x868830
  const [hs, as] = rep.stats;
  const compRep = g.cmCompRep?.[+(/^CM(\d+)$/.exec(f.comp)?.[1] ?? -1)] ?? 0;
  for (const [club, opp, me, them] of [[f.home, f.away, hs, as], [f.away, f.home, as, hs]] as const) {
    const k = mgrKey(g, club);
    if (!k) continue;
    const rec = (s.mg[k] ??= [0, 0, 0]);
    rec[2]++;
    const res = me.goals > them.goals ? 900 : me.goals === them.goals ? 300 : 0;
    const x = 50 * (me.goals + me.onTarget) + 10 * (me.shots - me.onTarget) + 5 * me.corners;
    const imp = 10;                                                                        // *estimeret* League::get_match_importance
    const pts = Math.trunc((imp * Math.trunc(clubRepMem(g, opp) / 1000) * compRep * (x + res) * 50) / 100000);
    if (league && g.clubs[club]?.league === f.comp) { rec[0] += pts; rec[1] += pts; }      // +0xce/+0xba: kun klubbens liga
  }
}

// ---------------------------------------------------------------- dagligt

/** AWARD_MANAGER::process_date 0x413540 for England (kaldes ved dagens start; gårsdagen er afsluttet) */
export function cmAwardsDaily(g: GameState): void {
  if (!cmAwOn(g)) return;
  const s = st(g);
  const y = addDays(g.date, -1);                                                       // originalens dag
  const lg = englandLeagues(g);
  // NationAwards::daily_update 0x768310: i morgen er en ny måned → månedens priser og MONTH_RATINGS::reset
  if (day(g.date) === 1 && month(y) === s.mr.m) {
    const m = s.mr.m;
    if (m >= 8 || m <= 5) monthAwards(g, s, lg, m, +y.slice(0, 4));
    s.mr = { y: +g.date.slice(0, 4), m: month(g.date), r: {} };
  }
  // Staff_Records::daily_update 0x86dda0: månedens point nulstilles ved en ny måned
  if (s.mgM !== g.date.slice(0, 7)) { for (const r of Object.values(s.mg)) r[0] = 0; s.mgM = g.date.slice(0, 7); }
  // EnglandAwards::daily_update 0x579610
  if (month(y) === 4 && day(y) === 6) {
    yearPlayerAward(g, s, lg[0], ENGLAND_AWARDS[0], -1);
    yearPlayerAward(g, s, lg[0], ENGLAND_AWARDS[1], 21);
    for (let t = 0; t < 4; t++) if (lg[t]) teamOfSeason(g, s, lg[t], defOf('team', t + 1)!);
  }
  if (month(y) === 5 && day(y) === 31) for (let t = 0; t < 4; t++) if (lg[t]) managerOfYear(g, s, lg[t], defOf('mgrYear', t + 1)!);
  // Team of the Week (0x769c70 – *estimeret* hver mandag)
  if (weekday(g.date) === 1) for (let t = 0; t < 4; t++) if (lg[t]) teamOfWeek(g, s, lg[t], defOf('week', t + 1)!);
}

/** Ved sæsonskiftet (1/7): Comp_Stats og managernes sæsonpoint (Staff_Records::end_season_for_nation 0x86d6e0) */
export function cmAwardsRollover(g: GameState): void {
  if (!cmAwOn(g) || !g.cmAw) return;
  g.cmAw.cs = {};
  g.cmAw.wk = {};
  for (const r of Object.values(g.cmAw.mg)) { r[1] = 0; r[2] = 0; }
  if (g.cmAw.won.length > 1500) g.cmAw.won = g.cmAw.won.slice(-1500);
}

const defOf = (kind: CmAwKind, tier: number, age?: number) => ENGLAND_AWARDS.find((d) => d.kind === kind && d.tier === tier && d.age === age);
const seasonOfDate = (d: string) => (month(d) >= 7 ? +d.slice(0, 4) : +d.slice(0, 4) - 1);

function monthAwards(g: GameState, s: CmAwState, lg: string[], m: number, yr: number): void {
  for (let t = 0; t < 4; t++) {
    const comp = lg[t];
    if (!comp) continue;
    // Staff_Records::find_manager_of_the_month 0x86f950
    const mdef = defOf('mgrMonth', t + 1)!;
    const two = addDays(g.date, -1 - 14);
    let best = 0, bestClub = 0;
    for (const r of leagueRows(g.comps[comp])) {
      const k = mgrKey(g, r.club);
      if (!k || mgrJoined(g, r.club) > two) continue;
      const pts = s.mg[k]?.[0] ?? 0;
      if (pts > best) { best = pts; bestClub = r.club; }
    }
    if (bestClub) award(g, mdef, comp, [{ id: g.clubs[bestClub].manager, mgr: true, club: bestClub, name: mgrName(g, bestClub), v: best }], m, yr);
    for (const age of [undefined, 20]) {
      const def = defOf('month', t + 1, age)!;
      const pid = bestRated(g, s, comp, age ?? -1);
      const p = pid ? g.players[pid] : undefined;
      if (p) award(g, def, comp, [{ id: p.id, club: p.club, name: pname(p), v: s.mr.r[p.id][1] / s.mr.r[p.id][2] }], m, yr);
    }
  }
}

/** MONTH_RATINGS::find_best_player 0x768130 */
export function bestRated(g: GameState, s: CmAwState, comp: string, maxAge: number): number {
  const rows = Object.entries(s.mr.r).map(([pid, e]) => ({ pid: +pid, e }));
  // 0x768200: < 3 kampe bagest, ellers snittet faldende (qsort – rækkefølgen ved lige snit er *estimeret*: spiller-id)
  rows.sort((a, b) => {
    const A = a.e[2] >= 3, B = b.e[2] >= 3;
    if (A !== B) return A ? -1 : 1;
    if (!A) return a.pid - b.pid;
    return b.e[1] / b.e[2] - a.e[1] / a.e[2] || a.pid - b.pid;
  });
  let older = 0;
  for (let min = 3; min >= 0; min--) {
    for (const { pid, e } of rows) {
      if (comp && e[0] !== comp) continue;
      if (e[2] < min) continue;
      if (maxAge >= 0) { if (e[3] > maxAge) { older++; continue; } if (older < 3) continue; }
      const p = g.players[pid];
      if (comp && (!p || g.clubs[p.club]?.league !== comp)) continue;
      return pid;
    }
  }
  return 0;
}

/** Comp_Stats' sorterede tabel, type 0x11 (0x4a4dc0/0x4a33df): snit for spillere med kampe ≥ ½ af klubbens; 0 tages ud */
function ratingTable(g: GameState, s: CmAwState, comp: string) {
  const played = new Map(leagueRows(g.comps[comp]).map((r) => [r.club, r.p]));
  const out: { pid: number; v: number; starts: number; apps: number }[] = [];
  for (const [pid, c] of Object.entries(s.cs[comp] ?? {})) {
    const team = played.get(c[4]) ?? 0;
    if (c[0] === 0 || team * 0.5 > c[0]) continue;
    const v = c[2] / c[0];
    if (v > 0) out.push({ pid: +pid, v, starts: c[0] - c[1], apps: c[0] });
  }
  return out.sort((a, b) => b.v - a.v || a.pid - b.pid);
}
/** ligaens kampe pr. hold (comp +0x3e − 1) · +0x3c (England: dobbelt turnering) */
const leagueGames = (g: GameState, comp: string) => Math.max(0, (g.comps[comp]?.clubs.length ?? 0) - 1) * 2;

/** 0x768cf0 nation_awards_award_player_of_year (statistiktype 0x11) */
function yearPlayerAward(g: GameState, s: CmAwState, comp: string | undefined, def: CmAwDef, maxAge: number): void {
  if (!comp) return;
  const games = leagueGames(g, comp);
  const table = ratingTable(g, s, comp);
  const picked: number[] = [];
  let older = 0;
  for (let f = 0.66; f > 0 && picked.length < 3; f = Math.fround(f - 0.1)) {
    const min = Math.trunc(games * f);
    for (const r of table) {
      const p = g.players[r.pid];
      if (!p || picked.includes(p.id) || r.starts < min) continue;
      if (maxAge >= 0) { if (ageOn(p.dob, g.date) > maxAge) { older++; continue; } if (older < 3) continue; }
      picked.push(p.id);
      if (picked.length === 3) break;
    }
  }
  if (picked.length < 3) return;
  award(g, def, '', picked.map((pid) => { const p = g.players[pid]; return { id: pid, club: p.club, name: pname(p), v: table.find((r) => r.pid === pid)!.v }; }));
}

/** 0x768940 nation_awards_award_manager_of_year (0x86fab0) */
function managerOfYear(g: GameState, s: CmAwState, comp: string, def: CmAwDef): void {
  const weeks28 = addDays(g.date, -1 - 28 * 7);
  const rows = leagueRows(g.comps[comp]).map((r) => r.club)
    .map((club) => ({ club, k: mgrKey(g, club) }))
    .sort((a, b) => (b.k ? s.mg[b.k]?.[1] ?? 0 : -1) - (a.k ? s.mg[a.k]?.[1] ?? 0 : -1));
  const pick: CmAwPlace[] = [];
  for (const { club, k } of rows) {
    if (pick.length >= 3) break;
    if (!k || mgrJoined(g, club) >= weeks28 || !(s.mg[k]?.[2])) continue;
    pick.push({ id: g.clubs[club].manager, mgr: true, club, name: mgrName(g, club), v: s.mg[k][1] });
  }
  if (pick.length === 3) award(g, def, comp, pick);
}

// ---------------------------------------------------------------- holdene (TEAM_AWARD)

/** TEAM_AWARD::init_slot_positions 0x8afdc0, type 0 (4-4-2) + tre udskiftere (+0x253 = 3) */
export const TEAM_SLOTS = [1, 0x804, 0x84, 0x204, 0x204, 0x210, 0x810, 0x210, 0x240, 0x240, 0x90, 1, 0x40, 4];

/** 0x5b7d20 + udvidelsen i 0x8afaeb–0x8afb39 */
export function awardMask(p: Player): number {
  // spillerpostens +0x0f..+0x19: positionerne og siderne +0x17 højre (side[2]), +0x18 venstre (side[0]), +0x19 midt (side[1])
  let m = naturalMask([...p.pos.slice(0, 8), p.side?.[2] ?? 1, p.side?.[0] ?? 1, p.side?.[1] ?? 1]);
  if (m & 2) m |= 4;
  if (m & 8) m |= 0x10;
  if (m & 0x20) m |= 0x10;
  if (m & 0x40 && (m & 0x80 || m & 0x800)) m |= 0x200;
  return m;
}

/** TEAM_AWARD::add_candidate 0x8afa40 – true, når holdet er fuldt */
export function addCandidate(team: (number | null)[], masks: Map<number, number>, pid: number, mask: number): boolean {
  if (team.includes(pid)) return team.every((x) => x !== null);
  masks.set(pid, mask);
  const fits = (slot: number, m: number) => (TEAM_SLOTS[slot] & m) === TEAM_SLOTS[slot];
  const free = TEAM_SLOTS.findIndex((_, i) => team[i] === null && fits(i, mask));
  if (free >= 0) team[free] = pid;
  else {
    // en anden spiller på en plads, han passer til, flyttes til en ledig plads, han også passer til
    outer: for (let j = 0; j < TEAM_SLOTS.length; j++) {
      const o = team[j];
      if (o === null || !fits(j, mask)) continue;
      const om = masks.get(o) ?? 0;
      for (let k = 0; k < TEAM_SLOTS.length; k++) if (team[k] === null && fits(k, om)) { team[k] = o; team[j] = pid; break outer; }
    }
  }
  return team.every((x) => x !== null);
}

/** 0x7698f0 NationAwards::award_team_of_season */
function teamOfSeason(g: GameState, s: CmAwState, comp: string, def: CmAwDef): void {
  const games = leagueGames(g, comp);
  const table = ratingTable(g, s, comp);
  const team: (number | null)[] = TEAM_SLOTS.map(() => null);
  const masks = new Map<number, number>();
  let full = false;
  for (let f = Math.fround(0.66); !full && f > 0; f = Math.fround(f - 0.1)) {
    const min = Math.trunc(games * f);
    for (const r of table) {
      const p = g.players[r.pid];
      if (!p || r.starts <= min) continue;
      if (addCandidate(team, masks, p.id, awardMask(p))) { full = true; break; }
    }
  }
  const ids = team.filter((x): x is number => x !== null);
  if (!ids.length) return;
  award(g, def, comp, [], undefined, undefined, team.map((pid, i) => [pid ?? 0, pid ? g.players[pid]?.club ?? 0 : 0, TEAM_SLOTS[i]]));
}

/** 0x769c70 Team of the Week (*estimeret* tidspunkt): ligaens kampe torsdag–søndag, karaktererne faldende */
function teamOfWeek(g: GameState, s: CmAwState, comp: string, def: CmAwDef): void {
  const from = addDays(g.date, -4), to = addDays(g.date, -1);
  const all = s.wk?.[comp] ?? [];
  const lines = all.filter(([, , d]) => d >= from && d <= to).map(([pid, r]) => ({ pid, r }));
  if (s.wk) s.wk[comp] = all.filter(([, , d]) => d > to);
  if (lines.length <= 20) return;
  lines.sort((a, b) => b.r - a.r || a.pid - b.pid);
  const team: (number | null)[] = TEAM_SLOTS.map(() => null);
  const masks = new Map<number, number>();
  for (const l of lines) { const p = g.players[l.pid]; if (p && !p.virtual && addCandidate(team, masks, p.id, awardMask(p))) break; }
  const prev = s.won.findIndex((w) => w.a === def.id);
  const win: CmAwWin = { a: def.id, y: seasonOfDate(g.date), d: to, w: [], team: team.map((pid, i) => [pid ?? 0, pid ? g.players[pid]?.club ?? 0 : 0, TEAM_SLOTS[i]]) };
  if (prev >= 0) s.won.splice(prev, 1);
  s.won.push(win);                                                                     // kun den seneste uge gemmes
}

// ---------------------------------------------------------------- vinderen

/** 0x412f00 award_raise_winner_reputation (mem-skala 0..10000) */
function raiseRep(g: GameState, w: CmAwPlace, rep: [number, number]): void {
  const [a3, a4] = rep;
  const clamp = (v: number) => Math.min(10000, v);
  if (!w.mgr) {
    const p = g.players[w.id];
    if (!p) return;
    const base = p.cmRepMem ?? p.cmRep ?? [p.rep * 2, p.rep * 2, p.rep * 2];
    let [r9, rb, rd] = base.map((x) => Math.trunc(x * 50));
    rd = Math.max(clamp(rd + Math.trunc(a4 * 0.05)), a4);
    const same = g.clubs[p.club]?.nation === p.nation;
    r9 = same ? Math.max(clamp(r9 + Math.trunc(a3 * 0.1)), a3) : Math.max(clamp(r9 + Math.trunc((a3 + a4) * 0.025)), Math.trunc(a3 / 2) + Math.trunc(a4 / 2));
    rb = Math.max(clamp(rb + Math.trunc(a3 * 0.1)), a3);
    p.cmRepMem = [repMemOf(r9), repMemOf(rb), repMemOf(rd)];
    return;
  }
  // manageren: +0xc ≥ a4, +8 ≥ a3 (samme land) ellers a3/2 + a4/2, +0xa ≥ a3
  const c = g.clubs[w.club];
  const human = c?.manager === -1;
  const s = human ? undefined : g.staff[w.id];
  const cur = human ? g.manager.cmRep : s?.cmRep;
  if (!cur) return;
  const nat = human ? g.manager.nation : s!.nation;
  const r8 = c && c.nation === nat ? Math.max(cur[0], a3) : Math.max(cur[0], Math.trunc(a3 / 2) + Math.trunc(a4 / 2));
  const next: [number, number, number] = [r8, Math.max(cur[1], a3), Math.max(cur[2], a4)];
  if (human) g.manager.cmRep = next; else s!.cmRep = next;
}

const hsh = (a: number, b: number) => { let x = (a * 0x9e3779b1 + b * 0x85ebca6b) >>> 0; x ^= x >>> 15; x = Math.imul(x, 0x2c1b3c6d) >>> 0; return (x ^ (x >>> 12)) >>> 0; };
export function posWord(p: Player | undefined): string {
  if (!p) return 'player';
  const m = awardMask(p);
  return m & 1 ? 'gk' : m & 0x40 ? 'st' : m & 0x38 ? 'mid' : m & 6 ? 'def' : 'player';
}

function award(g: GameState, def: CmAwDef, comp: string, w: CmAwPlace[], m?: number, yr?: number, team?: [number, number, number][]): void {
  const s = st(g);
  const season = yr !== undefined && m !== undefined ? (m >= 7 ? yr : yr - 1) : seasonOfDate(addDays(g.date, -1));
  const win: CmAwWin = { a: def.id, y: season, d: addDays(g.date, -1), w, ...(m !== undefined ? { m } : {}), ...(team ? { team } : {}) };
  s.won.push(win);
  const name = cmAwardName(def.id);
  for (const x of w.slice(0, 1)) raiseRep(g, x, def.rep);
  if (team) for (const [pid, club] of team) if (pid) raiseRep(g, { id: pid, club, name: '' }, def.rep);
  const humans = Object.values(g.clubs).filter((c) => isHumanClub(c.id) || c.id === g.userClub).map((c) => c.id);
  const inScope = (club: number) => (comp ? g.clubs[club]?.league === comp : g.nations[g.clubs[club]?.nation ?? -1]?.name === 'England');
  const date = addDays(g.date, -1);
  const seasonTxt = `${season}/${String(season + 1).slice(2)}`;
  // menneskets egne managerpriser i managerens historik (Staff_Records::add_month_award_record 0x86c8c0 / add_year_award_record 0x86c390)
  if ((def.kind === 'mgrMonth' || def.kind === 'mgrYear') && w[0] && g.clubs[w[0].club]?.manager === -1) {
    asOwner(w[0].club, () => g.manager.trophies.push({ season, comp: m !== undefined ? `${name} (${monthName(m)} ${yr})` : name, club: w[0].club }));
  }
  if (team) {
    // TEAM_AWARD::send_club_news 0x8b0140: klubberne med spillere på holdet
    const byClub = new Map<number, number[]>();
    for (const [pid, club] of team) if (pid && club) byClub.set(club, [...(byClub.get(club) ?? []), pid]);
    for (const [club, pids] of byClub) {
      if (!humans.includes(club)) continue;
      const names = pids.map((pid) => pname(g.players[pid]));
      const v = pids.length >= 4 ? 'n' : String(pids.length);
      asOwner(club, () => addNews({ cat: 'award', key: `cmaw.team.${v}`, date, params: { award: name, short: AWARDS[def.id]?.[2] ?? name, season: seasonTxt, p1: names[0], p2: names[1] ?? '', p3: names[2] ?? '', num: pids.length, club: g.clubs[club].short ?? g.clubs[club].name }, link: { kind: 'awards', id: def.id } }));
    }
    return;
  }
  const first = w[0];
  if (!first) return;
  const p = first.mgr ? undefined : g.players[first.id];
  const club = g.clubs[first.club];
  const params: Record<string, string | number> = {
    award: name, short: AWARDS[def.id]?.[2] ?? name, player: first.name, last: first.name.split(' ').at(-1) ?? first.name, club: club?.short ?? club?.name ?? '', season: seasonTxt,
    pos: first.mgr ? 'manager' : posWord(p), r2: w[1]?.name ?? '', r3: w[2]?.name ?? '',
  };
  let key: string;
  if (m !== undefined) {
    params.mon = m;
    // 0x767907: (staff / (måned + 1)) % 6 – her spillerens/managerens id i spillet
    key = `cmaw.mh.${Math.trunc(Math.max(0, first.id) / m) % 6}`;
    // 0x7676ba: uden klub → "for the month of"; manager/ingen klub-variant 0xa5ae44; ellers utils_random(3) (her en hash)
    const r = first.mgr || !club ? 0 : hsh(first.id, m + yr! * 12) % 3;
    params.body = !club ? 'nc' : r === 0 ? 'c' : r === 1 ? 'w' : 't';
  } else {
    // 0x931070: ((staff / x) + y) % 6 – *estimeret* id + sæson
    key = `cmaw.yh.${(Math.max(0, first.id) + season) % 6}`;
    const r = hsh(first.id, season) % 3;
    params.body = `${w.length >= 3 ? 3 : 2}${'cwp'[r]}`;
  }
  for (const c of humans) if (inScope(c)) asOwner(c, () => addNews({ cat: 'award', key, date, params, link: { kind: 'awards', id: def.id } }));
}

const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const monthName = (m: number) => MONTHS_EN[m - 1] ?? '';

// ---------------------------------------------------------------- til skærmen

/** prisens vindere i spillet (nyeste først) */
export function cmAwardWins(g: GameState, awardId: number): CmAwWin[] {
  return (g.cmAw?.won ?? []).filter((w) => w.a === awardId).slice().reverse();
}
