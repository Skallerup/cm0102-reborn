// CM 01/02's priser (award/*.cpp i cm0102.exe 3.9.68, afkodet 14/11- og 18/11-2026) – den originale database i ægte tilstand (cmActive) og
// CM-databaser i ægte tilstand (cmLogic, nye spil). Noter: ~/cm0102-engine/notes/awards.md.
//
//   AWARD_MANAGER 0x413180/0x4135b0: ét NationAwards-objekt pr. land – KUN når landet er indlæst (nation +0x11c ≠ 0, Select League(s)):
//     Argentina, Belgien, Brasilien, Danmark, England, Finland, Frankrig, Tyskland, Holland, Irland, Italien, Japan, Norge, Portugal,
//     Skotland, Spanien, Sverige, USA, Polen, Grækenland, Kroatien, Australien, Nordirland, Tyrkiet, Rusland, Wales og Sydkorea.
//     Klassernes priser og regler er læst af exe'ens kode til data/cmNationAwards.json (scripts/build-cm-nation-awards.py):
//       vtbl[0] init: YEAR_AWARD 0x92fe80, TEAM_AWARD 0x8af520, MONTH_AWARD 0x766e10 (navn = staff_comp-nøglen, omdømmetal a3/a4, turnering,
//         spiller/manager, holdets opstilling 0x8afdc0, månederne); England og Italien uden de ekstra divisioner (nation +0x11c & 4).
//       vtbl[1] daily_update: Date(dag, måned 0–11, år, ugedag) 0x549f70 → de årlige priser; derefter NationAwards::daily_update 0x768310
//         (i morgen ny måned → vtbl[3] on_month_change og MONTH_RATINGS::reset 0x767f60).
//       vtbl[2] record_match_ratings: MONTH_RATINGS 0x767ee0 for landets kampe (0x5a96b0: kun ligakampe 0x4b0700; 0x7683a0: alle).
//       vtbl[4]: Team of the Week-priserne (0x769c70) – kaldt af Awards-skærmen 0x414cf0 (0x415300), når prisen vises.
//   Hjælperne:
//     0x768cf0 årets spiller af Comp_Stats 0x4a4dc0: art 0x11 snit (0x4a33df: karaktersum/kampe, kræver kampe ≥ ½ af klubbens), 2 mål, 12 kampens
//       spiller, 18 mål imod pr. kamp (stigende); posmaske 0x5481a0; filtre nationalitet =, klubland =, nationalitet ≠, begge =. De tre første med
//       starter ≥ trunc(ligakampe · f), f = 0,66 (0,1 for art 2/4/5) − 0,1 ad gangen; maxAlder: de unge først efter tre ældre (tælleren bliver).
//     0x769380 landets spiller af PlayerStats 0x7c1e30 (kategori 6, art 2: kategori 2) blandt alle spillere i spillende ligaer; værdi · trunc(trunc(
//       (trunc(klubomdømme/500) + 4·divisionens omdømme)/5)/2) (ikke art 2); kampe ≥ ftol(f · 25), f = 0,66 (0,01 for art 2/5) − 0,1; posmaske 4
//       uden libero (0x5481a0 & 2).
//     0x7683c0 + YEAR_RATINGS 0x931ae0: AWARD_MANAGER +0xc (udvalgte lande 0x414b40, nulstilles dag 364) / +0x10 (spillere med omdømme > 2000
//       0x414b20, dag 170). Efter hver kamp (0x9315d0/0x931690) for startopstillingen: karakteren · c (c = trunc(divisionens omdømme ·
//       trunc(klubomdømme/1000)/20) + trunc((klubomdømme − 5000)/1700), 1..20) fordelt på w8/wa/wc (/20, /60, /80; Europa /20, /20, /40),
//       kampe, mål, assists og kort. Kandidaterne: kampe ≥ 25 (15 i 2001 for +0xc), −5 ad gangen; sorteringen mode 0–5 (0x931f90 …).
//     0x7698f0 årets hold, 0x768940 årets manager (Staff_Records 0x86fab0), månedens manager 0x86f950, månedens spiller 0x767150/0x768130.
//   MONTH_AWARD 0x766e10: kun månederne i prisens vindue (England august–maj, Finland maj–oktober …) – set_winner 0x7671c0 finder ellers ingen plads.
//   MONTH_RATINGS 0x767ee0/0x767fa0: alle spillere, der spillede (startere og brugte indskiftere, ikke genererede id ≥ [0xae2364]): [staff,
//     klubbens division ved første kamp, sum af den viste karakter +0x35, kampe, alder +0x18]. find_best_player 0x768130: snit (< 3 kampe
//     sorteres sidst, 0x768200), mindstekravet 3, 2, 1, 0 kampe; division = posten og klubbens nuværende; maxAlder som ovenfor.
//   Staff_Records::record_match_result 0x868830: managerens point pr. kamp = trunc(vigtighed · trunc(modstanderens omdømme/1000) ·
//     turneringens omdømme (+0x69) · (X + 900/300/0) · 50 / 100000), X = 50·(mål + skud på mål) + 10·(skud ved siden) + 5·hjørnespark.
//     +0xce (månedens, kun klubbens liga) nulstilles den 1. (0x86dda0), +0xba (sæsonens) ved landets sæsonslut (0x86d6e0).
//   award_raise_winner_reputation 0x412f00, nyhederne 0x767330/0x767580 (måned), 0x9304f0/0x930880 (år), 0x8b0140/0x8b0370 (hold).
//
// *Estimeret* / ikke porteret: turneringens vigtighed (League::get_match_importance 0x68a3e0 – liga+0x51 kendes ikke; sat til 10, så den kun
//   skalerer), Team of the Week (0x769c70's datovindue er ikke porteret: her mandag, kampene fra torsdag til søndag, uden nyhed),
//   hvilken af nyhedernes varianter der vælges (originalen bruger staff-id/utils_random – her en fast hash), positionsordet (0x5465a0 er
//   rigere), International/European Awards (0x632e20/0x5836a0: kun databasens tidligere vindere vises), landskampene i YEAR_RATINGS
//   (0x931690's landsholdsgren), klubbens +1000 (0x41310e) og Shortlist-kaldet 0x842c00. Prisen afgøres ved dagens start dagen efter.
import AW from './data/cmAwards.json';
import NA from './data/cmNationAwards.json';
import { ATTRS } from './attributes';
import { leagueRows } from './competitions';
import { ageOn, addDays, day, month, weekday } from './dates';
import { asOwner, isHumanClub } from './humans';
import { addNews } from './state';
import { cmActive, cmLogic, clubRepMem, curRep, repMemOf, statAvg } from './cmPlayerData';
import { cmDate } from './cmCalendar';
import { posGroup } from './cmFutureMore';
import { naturalMask } from './engine/grid/aiTacticChoice';
import type { Fixture, GameState, MatchReport, Player } from './types';

type AwardRow = [number, string, string, number, number];
const AWARDS = AW.awards as unknown as AwardRow[];
const HISTORY = AW.history as unknown as Record<string, [number, (string | null)[]][]>;
const lc = (s: string) => s.toLowerCase();
const BY_NAME = new Map<string, number>();
for (const a of AWARDS) if (!BY_NAME.has(lc(a[1]))) BY_NAME.set(lc(a[1]), a[0]);
export const cmAwardName = (id: number) => AWARDS[id]?.[1] ?? '';
/** databasens tidligere vindere (staff_comp_history.dat): [år, [1., 2., 3.]] */
export const cmAwardHistory = (id: number, g?: GameState) => (g?.cmAwHist ? g.cmAwHist[id] : HISTORY[String(id)]) ?? [];

// ---------------------------------------------------------------- landenes priser (data/cmNationAwards.json)

/** nøglens navne (kæden i index.cpp – det første navn, databasen har, vinder) */
type Name = string | string[];
type Call = (string | number | string[])[];
interface RawAw { k: 'Y' | 'T' | 'M'; n: Name; r: [number, number]; c: Name | -1; p?: number; v?: number; l?: number; m?: [number, number] }
interface RawNation { aw: RawAw[]; days: [number, number, number, Call[]][]; mon: Call[]; wk: number[]; ml: number }
const RAW = NA as unknown as { nations: Record<string, RawNation>; short: Record<string, string> };
const names = (n: Name) => (Array.isArray(n) ? n : [n]);
const awardIdOf = (n: Name) => { for (const x of names(n)) { const v = BY_NAME.get(lc(x)); if (v !== undefined) return v; } return -1; };

export type CmAwKind = 'month' | 'mgrMonth' | 'year' | 'mgrYear' | 'team' | 'week';
export interface CmAwDef {
  id: number; kind: CmAwKind; tier: number; age?: number; rep: [number, number];
  /** landet (nation.dat-navnet), pladsen i landets liste, turneringens navne (club_comp-nøglen), holdets opstilling 0x8afdc0, månedsvinduet (0–11) */
  nation: string; slot: number; comp?: string[]; layout?: number; months?: [number, number];
}

function buildDefs(nation: string, raw: RawNation): CmAwDef[] {
  const ages = new Map<number, number>();
  const age = (slot: unknown, a: unknown) => { if (typeof slot === 'number' && typeof a === 'number' && a >= 0) ages.set(slot, a); };
  for (const [, , , calls] of raw.days) for (const c of calls) {
    if (c[0] === 'P') age(c[2], c[3]); else if (c[0] === 'N') age(c[1], c[6]); else if (c[0] === 'R') age(c[1], c[9]);
  }
  for (const c of raw.mon) { if (c[0] === 'MP') age(c[1], c[2]); else if (c[0] === 'MB') age(c[2], c[3]); }
  const tiers: string[] = [];
  return raw.aw.map((a, slot): CmAwDef => {
    const comp = a.c === -1 ? undefined : names(a.c);
    if (comp && !tiers.includes(comp[0])) tiers.push(comp[0]);
    const kind: CmAwKind = a.k === 'M' ? (a.p ? 'month' : 'mgrMonth') : a.k === 'Y' ? (a.p ? 'year' : 'mgrYear') : raw.wk.includes(slot) ? 'week' : 'team';
    return {
      id: awardIdOf(a.n), kind, tier: comp ? tiers.indexOf(comp[0]) + 1 : 1, rep: a.r, nation, slot,
      ...(ages.has(slot) ? { age: ages.get(slot) } : {}), ...(comp ? { comp } : {}), ...(a.l !== undefined ? { layout: a.l } : {}), ...(a.m ? { months: a.m } : {}),
    };
  });
}
/** landenes priser i klassens rækkefølge (AWARD-objektets plads) */
export const NATION_AWARDS: Record<string, CmAwDef[]> = Object.fromEntries(Object.entries(RAW.nations).map(([n, r]) => [n, buildDefs(n, r)]));
/** EnglandAwards::init_awards 0x5788c0 (Conference-blokken udeladt) */
export const ENGLAND_AWARDS: CmAwDef[] = NATION_AWARDS.England;
/** InternationalAwards 0x632b30 og EuropeanAwards 0x583480 – kun databasens historik (afstemningerne er ikke porteret) */
export const INTL_AWARDS = ['FIFA World Player of the Year', 'World Footballer of the Year', 'European Footballer of the Year', 'South American Footballer of the Year',
  'African Footballer of the Year', 'European Goalkeeper of the Year', 'European Defender of the Year', 'European Midfielder of the Year', 'European Striker of the Year'].map(awardIdOf).filter((x) => x >= 0);
/** turneringens korte navn (club_comp.dat +0x38) – Awards-skærmens titel "{competition} Awards" (0x414d67) */
export const cmCompShort = (n: string) => RAW.short[n] ?? n;
/** prisens definition (landet og pladsen) ud fra staff_comp-id'et */
export function cmAwardDef(id: number): CmAwDef | undefined {
  for (const defs of Object.values(NATION_AWARDS)) { const d = defs.find((x) => x.id === id); if (d) return d; }
  return undefined;
}

// ---------------------------------------------------------------- spillets lande og turneringer

const NAT_CACHE = new WeakMap<GameState, Map<string, number>>();
/** nationens indeks i spillet (nation.dat-navnet) */
export function natIdx(g: GameState, name: string): number {
  let m = NAT_CACHE.get(g);
  if (!m) { m = new Map(g.nations.map((n, i) => [n.name, i] as [string, number]).reverse()); NAT_CACHE.set(g, m); }
  return m.get(name) ?? -1;
}
/** nation +0x11c: landet er indlæst (Select League(s) – g.activeNations; ældre spil: landet har en spilbar liga) */
function nationLoaded(g: GameState, n: number): boolean {
  if (n < 0) return false;
  if (g.activeNations?.length) return g.activeNations.includes(n);
  return Object.values(g.comps).some((x) => x.type === 'league' && g.leagues[x.id]?.nation === n && !g.leagues[x.id]?.hidden);
}
/** landene med et NationAwards-objekt i dette spil (AWARD_MANAGER 0x4135b0) */
export function cmAwardNations(g: GameState): string[] {
  return Object.keys(RAW.nations).filter((n) => nationLoaded(g, natIdx(g, n)));
}
/** turneringen har en pris i et indlæst land (0x414ac0) – turneringsskærmens Awards */
export const compHasAwards = (g: GameState, comp: string) => cmAwardNations(g).some((n) => NATION_AWARDS[n].some((x) => x.id >= 0 && compOf(g, x.comp) === comp));
const COMP_CACHE = new WeakMap<GameState, Map<string, string | null>>();
/** turneringens id i spillet ud fra nøglens navne – kun en turnering, der spilles ([0xadadfc][id] ≠ 0: ikke en skjult liga) */
export function compOf(g: GameState, n: Name | undefined): string | undefined {
  if (!n) return undefined;
  let m = COMP_CACHE.get(g);
  if (!m) { m = new Map(); COMP_CACHE.set(g, m); }
  const key = names(n).join('|');
  if (!m.has(key)) {
    let found: string | null = null;
    for (const x of names(n)) {
      const c = Object.values(g.comps).find((c) => lc(c.name) === lc(x) && !g.leagues[c.id]?.hidden);
      if (c) { found = c.id; break; }
    }
    m.set(key, found);
  }
  return m.get(key) ?? undefined;
}
const keyNation = (g: GameState, v: unknown) => (typeof v === 'string' ? natIdx(g, v) : -1);

// ---------------------------------------------------------------- tilstanden

type MR = { y: number; m: number; r: Record<number, [string, number, number, number]> };
/** YEAR_RATINGS-posten (0x15 bytes): [spiller, nationalitet, +8, +0xa, +0xc, kampe +0xe, mål +0xf, assists +0x11, kort +0x13] */
export type YrEntry = [number, number, number, number, number, number, number, number, number];
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
  /** (spil fra før 18/11-2026) Englands MONTH_RATINGS – flyttes til mrN.England */
  mr?: MR;
  /** MONTH_RATINGS pr. land: måned/år og [division, sum, kampe, alder] pr. spiller */
  mrN?: Record<string, MR>;
  /** Comp_Stats pr. liga: [kampe, indskiftninger, karaktersum, mål, klub, mål imod, kampens spiller] pr. spiller */
  cs: Record<string, Record<number, number[]>>;
  /** Staff_Records' managerpost pr. manager-nøgle: [+0xce månedens, +0xba sæsonens, +0x8e kampe] */
  mg: Record<string, [number, number, number]>;
  mgM: string;
  won: CmAwWin[];
  /** Team of the Week: ligakampenes viste karakterer [spiller, karakter, dato] pr. liga (0x769c70 læser Match_Stats' kampposter) */
  wk?: Record<string, [number, number, string][]>;
  /** YEAR_RATINGS: s = AWARD_MANAGER +0xc (udvalgte lande), r = +0x10 (omdømme > 2000) */
  yr?: { s: YrEntry[]; r: YrEntry[] };
}

// (MODERN_PARITY 12) 2026/27 i ægte tilstand: nye spil får prisernes tilstand ved spilstarten (cmAwNewGame) – ældre 2026-spil og udvidet tilstand
// beholder spillets egne priser (awards.ts)
export function cmAwOn(g: GameState): boolean {
  return (cmActive(g) || (cmLogic(g) && !!g.cmAw)) && !g.draft;
}

/** (2026/27) spilstarten: AWARD_MANAGER 0x413180 og databasens tidligere vindere (world-cm.json `awHist`) for prisskærmens priser */
export function cmAwNewGame(g: GameState, hist: Record<number, [number, (string | null)[]][]> | undefined): void {
  if (g.draft) return;
  st(g);
  const ids = [...Object.values(NATION_AWARDS).flat().map((d) => d.id), ...INTL_AWARDS].filter((x) => x >= 0);
  g.cmAwHist = Object.fromEntries(ids.filter((x) => hist?.[x]).map((x) => [x, hist![x]]));
}

function st(g: GameState): CmAwState {
  const s = (g.cmAw ??= { mrN: {}, cs: {}, mg: {}, mgM: g.date.slice(0, 7), won: [] });
  if (!s.mrN) { s.mrN = s.mr ? { England: s.mr } : {}; delete s.mr; }
  return s;
}
const newMR = (g: GameState): MR => ({ y: +g.date.slice(0, 4), m: month(g.date), r: {} });

/** de engelske ligaer (tier 1..4) i spillet */
export function englandLeagues(g: GameState): string[] {
  const out: string[] = [];
  for (const d of ENGLAND_AWARDS) if (d.kind === 'week') { const c = compOf(g, d.comp); if (c) out[d.tier - 1] = c; }
  return out;
}

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
const compRepOf = (g: GameState, comp: string) => g.cmCompRep?.[+(/^CM(\d+)$/.exec(comp)?.[1] ?? -1)] ?? 0;

/** turneringerne med landenes priser i dette spil: Comp_Stats (årets spiller/hold), Team of the Week, MONTH_RATINGS (landet → kun ligaer?) */
interface Scope { stats: Set<string>; week: Set<string>; mr: Map<number, { nation: string; leagueOnly: boolean }> }
const SCOPE_CACHE = new WeakMap<GameState, { key: string; v: Scope }>();
function scopeOf(g: GameState): Scope {
  const key = `${g.activeNations?.join(',') ?? ''}|${Object.keys(g.comps).length}`;
  const c = SCOPE_CACHE.get(g);
  if (c && c.key === key) return c.v;
  const v: Scope = { stats: new Set(), week: new Set(), mr: new Map() };
  for (const n of cmAwardNations(g)) {
    const raw = RAW.nations[n];
    for (const d of NATION_AWARDS[n]) {
      const comp = compOf(g, d.comp);
      if (!comp) continue;
      if (d.kind === 'week') v.week.add(comp);
      else if (d.kind === 'year' || d.kind === 'team') v.stats.add(comp);
    }
    if (raw.mon.some((x) => x[0] === 'MP' || x[0] === 'MB')) v.mr.set(natIdx(g, n), { nation: n, leagueOnly: raw.ml === 1 });
  }
  SCOPE_CACHE.set(g, { key, v });
  return v;
}

// ---------------------------------------------------------------- efter hver kamp

/** AWARD_MANAGER::process_fixture 0x4134c0 (MONTH_RATINGS 0x767ee0, YEAR_RATINGS 0x9315d0) + Comp_Stats for ligaerne + Staff_Records 0x868830 */
export function cmAwardsAfterMatch(g: GameState, f: Fixture, rep: MatchReport): void {
  if (!cmAwOn(g) || f.comp === 'FRIENDLY' || f.comp.startsWith('FR')) return;
  const comp = g.comps[f.comp];
  if (!comp) return;
  const s = st(g);
  const sc = scopeOf(g);
  const league = comp.type === 'league';
  // NationAwards vtbl[2] for turneringens land (comp +0x5d): MONTH_RATINGS (0x5a96b0: kun ligaer)
  const mrn = comp.nation >= 0 ? sc.mr.get(comp.nation) : undefined;
  const mr = mrn && (league || !mrn.leagueOnly) ? (s.mrN![mrn.nation] ??= newMR(g)) : undefined;
  const cs = league && sc.stats.has(f.comp) ? (s.cs[f.comp] ??= {}) : null;
  const week = league && sc.week.has(f.comp);
  const [hs, as] = rep.stats;
  for (const line of rep.players) {
    const p = g.players[line.id];
    if (!p || p.virtual) continue;
    const r = shownRating(line.rating);
    if (mr) {
      const e = mr.r[p.id];
      if (e) { e[1] += r; e[2]++; }
      else mr.r[p.id] = [g.clubs[p.club]?.league ?? '', r, 1, ageOn(p.dob, g.date)];
    }
    if (week) ((s.wk ??= {})[f.comp] ??= []).push([p.id, r, f.date]);
    if (cs) {
      const c = (cs[p.id] ??= [0, 0, 0, 0, p.club, 0, 0]);
      const keeper = !line.sub && (p.pos[0] ?? 0) >= 15;
      c[0]++; if (line.sub) c[1]++; c[2] += r; c[3] += line.goals; c[4] = p.club;
      c[5] = (c[5] ?? 0) + (line.cmr ? line.cmr[0] : keeper ? (line.team === 0 ? as.goals : hs.goals) : 0);
      c[6] = (c[6] ?? 0) + (rep.mom === p.id ? 1 : 0);
    }
  }
  yearRatings(g, s, f, rep);
  // Staff_Records::record_match_result 0x868830
  const compRep = compRepOf(g, f.comp);
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

/** 0x414b40: de udvalgte lande – en dansk, fransk eller svensk spiller, eller en kamp i en belgisk, fransk, hollandsk eller svensk turnering */
function selectedNations(g: GameState, p: Player, compNation: number): boolean {
  const is = (v: number, n: string) => v >= 0 && v === natIdx(g, n);
  return is(p.nation, 'Denmark') || is(compNation, 'Belgium') || is(p.nation, 'France') || is(compNation, 'France') || is(compNation, 'Holland')
    || is(p.nation, 'Sweden') || is(compNation, 'Sweden');
}

const YR_IDX = new WeakMap<YrEntry[], Map<number, YrEntry>>();
/** YEAR_RATINGS::record 0x9315d0/0x931690 for begge hold: startopstillingen (de 11 første), ikke genererede spillere */
function yearRatings(g: GameState, s: CmAwState, f: Fixture, rep: MatchReport): void {
  const comp = g.comps[f.comp];
  const yr = (s.yr ??= { s: [], r: [] });
  const lvl = compRepOf(g, f.comp);
  for (const line of rep.players) {
    if (line.sub) continue;
    const p = g.players[line.id];
    if (!p || p.virtual || p.regen) continue;
    const club = line.team === 0 ? f.home : f.away;
    const crep = clubRepMem(g, club);
    let c = Math.trunc((lvl * Math.trunc(crep / 1000)) / 20) + Math.trunc((crep - 5000) / 1700);
    c = c < 1 ? 1 : c > 20 ? 20 : c;
    const x = shownRating(line.rating) * c;
    // turneringens art (+0x42): 2 = Europa, ellers liga/pokal
    const add = comp.type === 'continental' ? [Math.trunc(x / 20), Math.trunc(x / 20), Math.trunc(x / 40)] : [Math.trunc(x / 20), Math.trunc(x / 60), Math.trunc(x / 80)];
    const cards = (line.cmr ? line.cmr[7] + 2 * line.cmr[8] : line.yellow + (line.red ? 2 : 0));
    const put = (list: YrEntry[]) => {
      let idx = YR_IDX.get(list);
      if (!idx) { idx = new Map(list.map((q) => [q[0], q])); YR_IDX.set(list, idx); }
      let e = idx.get(p.id);
      if (!e) { e = [p.id, p.nation, 0, 0, 0, 0, 0, 0, 0]; list.push(e); idx.set(p.id, e); }
      e[2] += add[0]; e[3] += add[1]; e[4] += add[2]; e[5]++; e[6] += line.goals; e[7] += line.assists; e[8] += cards;
    };
    if (curRep(p) > 2000) put(yr.r);                                                   // 0x414b20
    if (selectedNations(g, p, comp.nation)) put(yr.s);                                 // 0x414b40
  }
}

// ---------------------------------------------------------------- dagligt

const doyOf = (iso: string) => Math.round((Date.parse(iso + 'T00:00:00Z') - Date.UTC(+iso.slice(0, 4), 0, 1)) / 86400000);

/** AWARD_MANAGER::process_date 0x413540 (kaldes ved dagens start; gårsdagen er originalens dag) */
export function cmAwardsDaily(g: GameState): void {
  if (!cmAwOn(g)) return;
  const s = st(g);
  const y = addDays(g.date, -1);
  const yy = +y.slice(0, 4);
  for (const n of cmAwardNations(g)) {
    const raw = RAW.nations[n];
    const defs = NATION_AWARDS[n];
    // vtbl[1] daily_update: Date-tjekkene
    for (const [d, m, wd, calls] of raw.days) if (cmDate(d, m, yy, wd) === y) for (const c of calls) yearCall(g, s, defs, c);
    // NationAwards::daily_update 0x768310: i morgen er en ny måned → on_month_change og MONTH_RATINGS::reset
    if (day(g.date) === 1) {
      const mr = s.mrN![n];
      if (raw.mon.length) monthAwards(g, s, n, defs, raw.mon, month(y), yy);
      if (mr) s.mrN![n] = newMR(g);
    }
  }
  // Staff_Records::daily_update 0x86dda0: månedens point nulstilles ved en ny måned
  if (s.mgM !== g.date.slice(0, 7)) { for (const r of Object.values(s.mg)) r[0] = 0; s.mgM = g.date.slice(0, 7); }
  // YEAR_RATINGS::daily 0x931aa0: dagen i året = +0xc → tømmes (+0xc: 364, +0x10: Date(20, 5) = 170)
  if (s.yr) { const dy = doyOf(y); if (dy === 364) s.yr.s = []; if (dy === 170) s.yr.r = []; }
  // Team of the Week (0x769c70 – *estimeret* hver mandag)
  if (weekday(g.date) === 1) for (const n of cmAwardNations(g)) for (const d of NATION_AWARDS[n]) if (d.kind === 'week') { const c = compOf(g, d.comp); if (c) teamOfWeek(g, s, c, d); }
}

/** Ved landets sæsonskifte: Comp_Stats og Team of the Week-kampene for turneringerne og managernes sæsonpoint (end_season_for_nation 0x86d6e0) */
export function cmAwardsRollover(g: GameState, inComp?: (id: string) => boolean, inClub?: (cid: number) => boolean): void {
  if (!cmAwOn(g) || !g.cmAw) return;
  const s = g.cmAw;
  for (const id of Object.keys(s.cs)) if (!inComp || inComp(id)) delete s.cs[id];
  if (s.wk) for (const id of Object.keys(s.wk)) if (!inComp || inComp(id)) delete s.wk[id];
  const inScope = (k: string) => {
    if (!inClub) return true;
    if (k.startsWith('h')) return inClub(+k.slice(1));
    const sid = +k.slice(1);
    const club = Object.values(g.clubs).find((c) => c.manager === sid);
    return club ? inClub(club.id) : true;
  };
  for (const [k, r] of Object.entries(s.mg)) if (inScope(k)) { r[1] = 0; r[2] = 0; }
  if (s.won.length > 1500) s.won = s.won.slice(-1500);
}

const seasonOfDate = (d: string) => (month(d) >= 7 ? +d.slice(0, 4) : +d.slice(0, 4) - 1);

/** de årlige kald under et Date-tjek (vtbl[1]) */
function yearCall(g: GameState, s: CmAwState, defs: CmAwDef[], c: Call): void {
  const [op] = c;
  const nat = (v: unknown) => keyNation(g, v);
  if (op === 'P') {
    const [, comp, slot, maxAge, posmask, stat, f7, f8, f9, f10] = c as [string, Name, number, number, number, number, unknown, unknown, unknown, unknown];
    const cid = compOf(g, comp);
    if (cid) yearPlayerAward(g, s, cid, defs[slot], maxAge, posmask, stat, [nat(f7), nat(f8), nat(f9), nat(f10)]);
  } else if (op === 'T') {
    const cid = compOf(g, c[1] as Name);
    if (cid) teamOfSeason(g, s, cid, defs[c[2] as number]);
  } else if (op === 'MY') {
    const cid = compOf(g, c[1] as Name);
    if (cid) managerOfYear(g, s, cid, defs[c[2] as number]);
  } else if (op === 'N') {
    const [, slot, a, b, cc, d, maxAge, posmask, stat] = c as [string, number, unknown, unknown, unknown, unknown, number, number, number];
    nationPlayerAward(g, defs[slot], [nat(a), nat(b), nat(cc), nat(d)], maxAge, posmask, stat);
  } else if (op === 'R') {
    const [, slot, obj, a4, a5, a6, a7, a8, mode, maxAge] = c as [string, number, number, unknown, unknown, unknown, unknown, unknown, number, number];
    ratingsAward(g, s, defs[slot], obj === 0x10 ? 'r' : 's', [nat(a4), nat(a5), nat(a6), nat(a7)], typeof a8 === 'string' || Array.isArray(a8) ? compOf(g, a8 as Name) ?? null : undefined, mode, maxAge);
  }
}

/** vtbl[3] on_month_change: månedens manager (0x86f950 → 0x7671c0) og spiller (0x767150 / 0x768130 → 0x7671c0) */
function monthAwards(g: GameState, s: CmAwState, nation: string, defs: CmAwDef[], calls: Call[], m: number, yr: number): void {
  const mr = s.mrN![nation];
  for (const c of calls) {
    if (c[0] === 'MM') {
      // Staff_Records::find_manager_of_the_month 0x86f950
      const comp = compOf(g, c[1] as Name);
      const def = defs[c[2] as number];
      if (!comp || !inWindow(def, m)) continue;
      const two = addDays(g.date, -1 - 14);
      let best = 0, bestClub = 0;
      for (const r of leagueRows(g.comps[comp])) {
        const k = mgrKey(g, r.club);
        if (!k || mgrJoined(g, r.club) > two) continue;
        const pts = s.mg[k]?.[0] ?? 0;
        if (pts > best) { best = pts; bestClub = r.club; }
      }
      if (bestClub) award(g, def, comp, [{ id: g.clubs[bestClub].manager, mgr: true, club: bestClub, name: mgrName(g, bestClub), v: best }], m, yr);
    } else if (c[0] === 'MP' || c[0] === 'MB') {
      // 0x767150(MONTH_RATINGS, maxAlder): prisens turnering (+9) → 0x768130, klubben = spillerens; 0x768130 + 0x7671c0(staff, 0, …) med klub 0
      const def = defs[(c[0] === 'MP' ? c[1] : c[2]) as number];
      const comp = compOf(g, c[0] === 'MP' ? def.comp : (c[1] as Name));
      if (!comp || !mr || !inWindow(def, m)) continue;
      const pid = bestRated(g, { mr }, comp, (c[0] === 'MP' ? c[2] : c[3]) as number);
      const p = pid ? g.players[pid] : undefined;
      if (p) award(g, def, comp, [{ id: p.id, club: c[0] === 'MP' ? p.club : 0, name: pname(p), v: mr.r[p.id][1] / mr.r[p.id][2] }], m, yr);
    }
  }
}
/** MONTH_AWARD 0x766e10: pladserne fra (fra-måned, år) til (til-måned, år) – kun månederne i vinduet har en plads (0x7671c0) */
function inWindow(def: CmAwDef, m: number): boolean {
  const [a, b] = def.months ?? [7, 4];
  const i = m - 1;
  return a <= b ? i >= a && i <= b : i >= a || i <= b;
}

/** MONTH_RATINGS::find_best_player 0x768130 */
export function bestRated(g: GameState, s: { mr?: MR }, comp: string, maxAge: number): number {
  const rows = Object.entries(s.mr?.r ?? {}).map(([pid, e]) => ({ pid: +pid, e }));
  // 0x768200: < 3 kampe bagest, ellers snittet faldende (qsort – rækkefølgen ved lige snit er *estimeret*: spiller-id; også 0x4ad250, 0x76a4b0, 0x931f90)
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

/** Comp_Stats' sorterede tabel 0x4a4dc0 (værdien 0x4a3250): 0x11 snit for spillere med kampe ≥ ½ af klubbens, 2 mål, 12 kampens spiller,
 *  18 mål imod pr. kamp; sorteret 0x4ad250 (18 stigende, ellers faldende); nul bagest tages ud */
function statTable(g: GameState, s: CmAwState, comp: string, stat: number) {
  const played = new Map(leagueRows(g.comps[comp]).map((r) => [r.club, r.p]));
  const out: { pid: number; v: number; starts: number; apps: number }[] = [];
  for (const [pid, c] of Object.entries(s.cs[comp] ?? {})) {
    let v = 0;
    if (stat === 0x11) { const team = played.get(c[4]) ?? 0; v = c[0] === 0 || team * 0.5 > c[0] ? 0 : c[2] / c[0]; }
    else if (stat === 2) v = c[3];
    else if (stat === 12) v = c[6] ?? 0;
    else if (stat === 18) v = c[0] ? (c[5] ?? 0) / c[0] : 0;
    out.push({ pid: +pid, v, starts: c[0] - c[1], apps: c[0] });
  }
  out.sort(stat === 18 ? (a, b) => a.v - b.v || a.pid - b.pid : (a, b) => b.v - a.v || a.pid - b.pid);
  while (out.length && out[out.length - 1].v === 0) out.pop();
  return out;
}
/** ligaens kampe pr. hold (comp +0x3e − 1) · +0x3c (dobbelt turnering) */
const leagueGames = (g: GameState, comp: string) => Math.max(0, (g.comps[comp]?.clubs.length ?? 0) - 1) * 2;

/** filtrene i 0x768cf0 (+0x2ac … +0x2b8): nationalitet =, klubland =, nationalitet ≠, klubland = og nationalitet = */
function passFilters(g: GameState, p: Player, f: number[]): boolean {
  const cn = g.clubs[p.club]?.nation ?? -1;
  if (f[0] >= 0 && p.nation !== f[0]) return false;
  if (f[1] >= 0 && cn !== f[1]) return false;
  if (f[2] >= 0 && p.nation === f[2]) return false;
  if (f[3] >= 0 && (cn !== f[3] || p.nation !== f[3])) return false;
  return true;
}

/** 0x768cf0 nation_awards_award_player_of_year */
function yearPlayerAward(g: GameState, s: CmAwState, comp: string, def: CmAwDef, maxAge: number, posmask: number, stat: number, filt: number[]): void {
  const games = leagueGames(g, comp);
  const table = statTable(g, s, comp, stat);
  const picked: number[] = [];
  let older = 0;
  for (let f = Math.fround(stat === 2 || stat === 4 || stat === 5 ? 0.1 : 0.66); f > 0 && picked.length < 3; f = Math.fround(f - 0.1)) {
    const min = Math.trunc(games * f);
    for (const r of table) {
      const p = g.players[r.pid];
      if (!p || picked.includes(p.id) || r.starts < min) continue;
      if (posmask !== 0 && !(posGroup(p) & posmask & 0xffff)) continue;
      if (!passFilters(g, p, filt)) continue;
      if (maxAge >= 0) { if (ageOn(p.dob, g.date) > maxAge) { older++; continue; } if (older < 3) continue; }
      picked.push(p.id);
      if (picked.length === 3) break;
    }
  }
  if (picked.length < 3) return;
  award(g, def, '', picked.map((pid) => { const p = g.players[pid]; return { id: pid, club: p.club, name: pname(p), v: table.find((r) => r.pid === pid)!.v }; }));
}

/** 0x769380 (landets spiller af PlayerStats): klubland =, nationalitet =, nationalitet ≠, nationalitet = eller klubland = */
function nationPlayerAward(g: GameState, def: CmAwDef, filt: number[], maxAge: number, posmask: number, stat: number): void {
  const cat = stat === 2 ? 2 : 6;
  const rows: { p: Player; v: number; apps: number }[] = [];
  for (const p of Object.values(g.players)) {
    if (p.virtual || p.regen) continue;
    const club = p.club ? g.clubs[p.club] : undefined;
    // klubbens division skal spilles ([0xadadfc][+0x57] ≠ 0); uden klub tjekkes intet
    if (club && (!g.comps[club.league] || g.leagues[club.league]?.hidden)) continue;
    const cn = club?.nation ?? -1;
    if (filt[0] >= 0 && (!club || cn !== filt[0])) continue;
    if (filt[1] >= 0 && p.nation !== filt[1]) continue;
    if (filt[2] >= 0 && p.nation === filt[2]) continue;
    if (filt[3] >= 0 && p.nation !== filt[3] && (!club || cn !== filt[3])) continue;
    let v = Math.fround(statAvg(p, cat, stat, 6.5));
    if (stat === 2 && v === 0) continue;
    const apps = Math.trunc(statAvg(p, cat, 1, 6.5));
    if (stat === 3) v = apps > 0 ? Math.fround(v / apps) : 0;
    if (stat !== 2) {
      const x = club && g.comps[club.league] ? Math.trunc((Math.trunc(clubRepMem(g, club.id) / 500) + 4 * compRepOf(g, club.league)) / 5) : 1;
      v = Math.fround(v * Math.trunc(x / 2));
    }
    rows.push({ p, v, apps });
  }
  rows.sort(stat === 3 ? (a, b) => a.v - b.v || a.p.id - b.p.id : (a, b) => b.v - a.v || a.p.id - b.p.id);
  const picked: { p: Player; v: number }[] = [];
  let older = 0;
  for (let f = Math.fround(stat === 5 || stat === 2 ? 0.01 : 0.66); f > 0 && picked.length < 3; f = Math.fround(f - 0.1)) {
    const min = Math.trunc(f * 25);
    for (const r of rows) {
      if (posmask !== 0) {
        const m = posGroup(r.p);
        if (!(m & posmask & 0xffff)) continue;
        if (posmask === 4 && m & 2) continue;
      }
      if (picked.some((x) => x.p === r.p) || r.apps < min) continue;
      if (maxAge >= 0) { if (ageOn(r.p.dob, g.date) > maxAge) { older++; continue; } if (older < 3) continue; }
      picked.push(r);
      if (picked.length === 3) break;
    }
  }
  if (picked.length < 3) return;
  award(g, def, '', picked.map(({ p, v }) => ({ id: p.id, club: p.club, name: pname(p), v })));
}

/** 0x7683c0 + YEAR_RATINGS::collect 0x931ae0: tre vindere af årets karakterer (uden afstemning – ingen af landenes priser har en shortlist) */
function ratingsAward(g: GameState, s: CmAwState, def: CmAwDef, obj: 's' | 'r', filt: number[], division: string | null | undefined, mode: number, maxAge: number): void {
  const list = s.yr?.[obj] ?? [];
  const sorted = list.slice().sort((a, b) => yrCompare(g, a, b, mode));
  let min = (+addDays(g.date, -1).slice(0, 4) === 2001 && obj === 's') ? 15 : 25;
  const picked: YrEntry[] = [];
  for (; min > 0 && picked.length < 3; min -= 5) {
    for (const e of sorted) {
      if (picked.length >= 3) break;
      if (((e[5] << 24) >> 24) < min || picked.includes(e)) continue;
      const p = g.players[e[0]];
      const cn = p && p.club ? g.clubs[p.club]?.nation ?? -1 : -1;
      if (filt[0] >= 0 && e[1] !== filt[0]) continue;
      if (filt[1] >= 0 && cn !== filt[1]) continue;
      if (filt[2] >= 0 && e[1] === filt[2]) continue;
      if (filt[3] >= 0 && (cn !== filt[3] || e[1] !== filt[3])) continue;
      if (maxAge >= 0 && p && ageOn(p.dob, g.date) > maxAge) continue;
      if (division !== undefined && (!p || g.clubs[p.club]?.league !== division)) continue;
      picked.push(e);
    }
  }
  if (picked.length < 3) return;
  award(g, def, '', picked.map((e) => { const p = g.players[e[0]]; return { id: e[0], club: p?.club ?? 0, name: p ? pname(p) : '?' }; }));
}
/** YEAR_RATINGS' sortering 0x931f90 / 0x9320e0 / 0x932230 / 0x9323b0 / 0x932500 / 0x932590 (højeste først; < 3 kampe bagest) */
function yrCompare(g: GameState, a: YrEntry, b: YrEntry, mode: number): number {
  const A = a[5] >= 3, B = b[5] >= 3;
  if (!A || !B) return A === B ? a[0] - b[0] : A ? -1 : 1;
  const d = yrScore(g, b, mode) - yrScore(g, a, mode);
  return d || a[0] - b[0];
}
function yrScore(g: GameState, e: YrEntry, mode: number): number {
  const f32 = Math.fround;
  const p = g.players[e[0]];
  const [, , w8, wa, wc, n, wf, w11, w13] = e;
  const posMul = (v: number) => (!p ? v : (p.pos[6] ?? 0) > 14 ? f32(v * f32(1.2)) : (p.pos[5] ?? 0) > 14 ? f32(v * f32(1.05)) : v);
  const ca = p?.ca ?? 0;
  if (mode <= 2) {
    const S = mode === 0 ? 2 * w8 + wa + wc + wf : mode === 1 ? 2 * wa + w8 + wc + wf : 2 * wc + wa + w8 + wf;
    let v = posMul(S / n + 2 * (n * 0.02));
    if (mode === 2 && p) v = f32(f32(v * ca) * f32(0.00625));
    return v;
  }
  if (mode === 4) return w13 / n;
  const S = 5 * wf + 3 * w11 + wc;
  let v = S / n;
  if (mode === 3) {
    if (p?.club && g.clubs[p.club]) v = f32(f32(v * clubRepMem(g, p.club)) * f32(0.0002));
    if (p) v = f32(f32(v * ca) * f32(0.02));
    return v;
  }
  // mode 5: (omdømme · 0,0002 + 4) og halveret, hvis Determination, Loyalty eller Sportsmanship (staff +0x58/+0x59/+0x5c) er under 10
  if (p) v = v * (curRep(p) * f32(0.0002) + 4);
  const at = (k: string) => (p ? Math.round(p.attrs[ATTRS.indexOf(k as never)] || 10) : 10);
  if (p && (at('determination') < 10 || at('loyalty') < 10 || at('sportsmanship') < 10)) v = f32(v * f32(0.5));
  return v;
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

/** TEAM_AWARD::init_slot_positions 0x8afdc0: de elleve pladser for opstillingen +0x25c (0, 1, 2, ellers 3) og udskifterne (+0x253 = 3) */
const LAYOUTS: number[][] = [
  [1, 0x804, 0x84, 0x204, 0x204, 0x210, 0x810, 0x210, 0x240, 0x240, 0x90],
  [1, 0x804, 0x84, 0x204, 0x204, 0x90, 0x210, 0x810, 0xc0, 0x240, 0x840],
  [1, 0x808, 0x88, 0x204, 0x204, 2, 0x210, 0x210, 0x240, 0x240, 0x210],
  [1, 0x804, 0x84, 2, 0x204, 0x208, 0x90, 0x810, 0x220, 0x240, 0x840],
];
const SUBS = [1, 0x40, 4];
export const teamSlots = (layout = 0) => [...LAYOUTS[layout >= 0 && layout <= 2 ? layout : 3], ...SUBS];
/** opstilling 0 (4-4-2) + tre udskiftere */
export const TEAM_SLOTS = teamSlots(0);

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
export function addCandidate(team: (number | null)[], masks: Map<number, number>, pid: number, mask: number, slots: number[] = TEAM_SLOTS): boolean {
  if (team.includes(pid)) return team.every((x) => x !== null);
  masks.set(pid, mask);
  const fits = (slot: number, m: number) => (slots[slot] & m) === slots[slot];
  const free = slots.findIndex((_, i) => team[i] === null && fits(i, mask));
  if (free >= 0) team[free] = pid;
  else {
    // en anden spiller på en plads, han passer til, flyttes til en ledig plads, han også passer til
    outer: for (let j = 0; j < slots.length; j++) {
      const o = team[j];
      if (o === null || !fits(j, mask)) continue;
      const om = masks.get(o) ?? 0;
      for (let k = 0; k < slots.length; k++) if (team[k] === null && fits(k, om)) { team[k] = o; team[j] = pid; break outer; }
    }
  }
  return team.every((x) => x !== null);
}

/** 0x7698f0 NationAwards::award_team_of_season */
function teamOfSeason(g: GameState, s: CmAwState, comp: string, def: CmAwDef): void {
  const games = leagueGames(g, comp);
  const table = statTable(g, s, comp, 0x11);
  const slots = teamSlots(def.layout);
  const team: (number | null)[] = slots.map(() => null);
  const masks = new Map<number, number>();
  let full = false;
  for (let f = Math.fround(0.66); !full && f > 0; f = Math.fround(f - 0.1)) {
    const min = Math.trunc(games * f);
    for (const r of table) {
      const p = g.players[r.pid];
      if (!p || r.starts <= min) continue;
      if (addCandidate(team, masks, p.id, awardMask(p), slots)) { full = true; break; }
    }
  }
  const ids = team.filter((x): x is number => x !== null);
  if (!ids.length) return;
  award(g, def, comp, [], undefined, undefined, team.map((pid, i) => [pid ?? 0, pid ? g.players[pid]?.club ?? 0 : 0, slots[i]]));
}

/** 0x769c70 Team of the Week: ligaens kampe torsdag–søndag, karaktererne faldende */
function teamOfWeek(g: GameState, s: CmAwState, comp: string, def: CmAwDef): void {
  const from = addDays(g.date, -4), to = addDays(g.date, -1);
  const all = s.wk?.[comp] ?? [];
  const lines = all.filter(([, , d]) => d >= from && d <= to).map(([pid, r]) => ({ pid, r }));
  if (s.wk) s.wk[comp] = all.filter(([, , d]) => d > to);
  if (lines.length <= 20) return;
  lines.sort((a, b) => b.r - a.r || a.pid - b.pid);
  const slots = teamSlots(def.layout);
  const team: (number | null)[] = slots.map(() => null);
  const masks = new Map<number, number>();
  for (const l of lines) { const p = g.players[l.pid]; if (p && !p.virtual && addCandidate(team, masks, p.id, awardMask(p), slots)) break; }
  const prev = s.won.findIndex((w) => w.a === def.id);
  const win: CmAwWin = { a: def.id, y: seasonOfDate(g.date), d: to, w: [], team: team.map((pid, i) => [pid ?? 0, pid ? g.players[pid]?.club ?? 0 : 0, slots[i]]) };
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
  const crosses = (def.months ?? [7, 4])[0] > (def.months ?? [7, 4])[1];
  const season = yr !== undefined && m !== undefined ? (crosses ? (m - 1 >= def.months![0] ? yr : yr - 1) : yr) : seasonOfDate(addDays(g.date, -1));
  const win: CmAwWin = { a: def.id, y: season, d: addDays(g.date, -1), w, ...(m !== undefined ? { m } : {}), ...(team ? { team } : {}) };
  s.won.push(win);
  const name = cmAwardName(def.id);
  for (const x of w.slice(0, 1)) raiseRep(g, x, def.rep);
  if (team) for (const [pid, club] of team) if (pid) raiseRep(g, { id: pid, club, name: '' }, def.rep);
  const humans = Object.values(g.clubs).filter((c) => isHumanClub(c.id) || c.id === g.userClub).map((c) => c.id);
  const nat = natIdx(g, def.nation);
  const inScope = (club: number) => (comp ? g.clubs[club]?.league === comp : (g.clubs[club]?.nation ?? -2) === nat);
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
      const nm = pids.map((pid) => pname(g.players[pid]));
      const v = pids.length >= 4 ? 'n' : String(pids.length);
      asOwner(club, () => addNews({ cat: 'award', key: `cmaw.team.${v}`, date, params: { award: name, short: AWARDS[def.id]?.[2] ?? name, season: seasonTxt, p1: nm[0], p2: nm[1] ?? '', p3: nm[2] ?? '', num: pids.length, club: g.clubs[club].short ?? g.clubs[club].name }, link: { kind: 'awards', id: def.id } }));
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

/** prisen, skærmen åbnes med (route-tilstanden awId / awComp / awNat / awScope), ellers menneskets lands første pris */
export function awardsStart(g: GameState, st: Record<string, unknown> | undefined): { nation: string | null; id: number } {
  const loaded = cmAwardNations(g);
  const first = (n: string) => NATION_AWARDS[n].find((d) => d.id >= 0)?.id ?? -1;
  if (st?.awScope === 'intl') return { nation: null, id: INTL_AWARDS[0] };
  if (typeof st?.awId === 'number') {
    const d = cmAwardDef(st.awId);
    if (d && loaded.includes(d.nation)) return { nation: d.nation, id: d.id };
    if (INTL_AWARDS.includes(st.awId)) return { nation: null, id: st.awId };
  }
  if (typeof st?.awComp === 'string') {
    for (const n of loaded) { const d = NATION_AWARDS[n].find((x) => x.id >= 0 && compOf(g, x.comp) === st.awComp); if (d) return { nation: n, id: d.id }; }
  }
  if (typeof st?.awNat === 'string' && loaded.includes(st.awNat)) return { nation: st.awNat, id: first(st.awNat) };
  const own = g.nations[g.clubs[g.userClub]?.nation ?? -1]?.name;
  const nation = own && loaded.includes(own) ? own : loaded[0];
  return nation ? { nation, id: first(nation) } : { nation: null, id: INTL_AWARDS[0] };
}

/** prisens vindere i spillet (nyeste først) */
export function cmAwardWins(g: GameState, awardId: number): CmAwWin[] {
  return (g.cmAw?.won ?? []).filter((w) => w.a === awardId).slice().reverse();
}
