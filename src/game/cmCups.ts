// De nationale pokaler, Liga Cup (Worthington Cup) og Charity Shield efter originalens rundetabeller (kalender runde 10D, 13/11-2026) – kun den
// originale database i ægte tilstand (cmCalendarOn). Tabellerne: data/cmCupTables.ts (create_round_table pr. klasse kørt i unicorn,
// ~/cm0102-engine/tools/sched/gen_cups.py): EngFaCup 0x56f320, EngCcCup 0x56c570, EngCharity 0x56d640, ScoFaCup 0x7ed5d0, GerCup 0x5d8ee0,
// FraCup 0x5ba3f0, SpaCup 0x84d220, PorCup 0x7cdc40, BelFaCup 0x41d310, TurCup 0x8fc670, RusCup 0x7e9530, NorCup 0x78f2e0, SweCup 0x88cf40
// (stage 7), DenCup 0x550c70, CroCup 0x517740, PolCup 0x7c8040, KorFaCup 0x66a720, JapEmpCup 0x661ff0, BraCup 0x427700, UsaOpenCup 0x90b170
// og (22/11) de engelske divisioners play-off ENG_PO1/2/3 = League::create_schedule stage 0 (EngFirst 0x571980, EngSecond 0x5757a0, EngThird
// 0x5770e0 – competitions.ts setupCmPlayoff).
//
//   Rundeposten (cup-round-record §1/§3): kampdato +3 (0x521eb0), tidspunkt +6, runde-id +7 → fixture +0x30 (+3/+4 første/andet ben, +1/+2 omkamp
//   – Cup::process_fixture 0x51a150: "code + 1 to + 5 name the replays, legs and decider"), indeks +9 → +0x34, +0xb → +0x36, +0xd → +0x38 (første
//   kamp), +0xf (afgørende kamp: andet ben efter første / første omkamp), +0x11 (anden omkamp), +0x13 spillested (4 = neutral → +0x3c), +0x17 →
//   +0x3a, +0x20 omkampe, +0x21 ben, +0x22 dage til omkamp/andet ben. Kampflag (+0x38): 0x1 straffe, 0x2 forlænget, 0x4 ingen udebanemål, 0x4000
//   udebanemål først efter forlænget (League Cup).
//
// Spillets pokaler beholder deres egen lodtrækning og antal runder (potens af 2 med oversiddere); originalens runder tælles fra finalen (som FA Cup
// i runde 10A). Liga Cup'en har originalens deltagerstruktur (de 92 ligaklubber; de europæiske klubber fra 3. runde – tabellens byes-nøgle =
// antallet). IKKE porteret: lodtrækningsdatoerne (spillets lodtrækning sker, når forrige runde er afgjort), EngCcCup::collect_entrants'
// rækkefølge ud over division/placering, 0x4000-reglens udebanemål i forlænget spilletid (her: ingen udebanemål), pokalernes præmier.
import type { Club, Fixture, GameState } from './types';
import { CM_CUP_TABLES, type CmCupRound } from './data/cmCupTables';
import { cmCalendarOn, cmDate } from './cmCalendar';
import { nation01 } from './cmFitness';
import { clubRepMem } from './cmPlayerData';
import { msvcQsort } from './engine/grid/subs';
import { FA_TROPHY } from './data/cm0102';

export interface CmCupRoundInfo {
  date: string; slot: number; legs: number; gap: number; replays: number;
  /** fixture-koderne for første kamp (andet ben: w30 + 1 og f38dec) */
  cm: NonNullable<Fixture['cm']>;
  f0f: number; f11: number; neutral: boolean;
}

/** pokalens tabel-nøgle for et land ('ENG', 'SCO' …) – tabellernes land er id'et i den originale database (nation01) */
export function cmCupKey(g: GameState, nation: number): string | null {
  if (!cmCalendarOn(g)) return null;
  const n01 = nation01(nation);
  for (const [k, t] of Object.entries(CM_CUP_TABLES)) if (t.nation === n01 && !k.includes('_')) return k;
  return null;
}

function roundsOf(key: string, year: number): CmCupRound[] | null {
  const t = CM_CUP_TABLES[key];
  if (!t) return null;
  return t.years?.[year] ?? t.rounds;
}

/** rundeposten for spillets runde `round` af `total` (sidste = finalen), talt fra finalen; `index` = den direkte runde (Liga Cup/Charity Shield) */
export function cmCupRound(key: string, year: number, round: number, total: number, direct = false): CmCupRoundInfo | null {
  const rs = roundsOf(key, year);
  if (!rs) return null;
  const r = rs[direct ? round - 1 : rs.length - 1 - (total - round)];
  if (!r) return null;
  const [, m, code, idx, b0b, f0d, f0f, f11, venue, b17, , , , , replays, legs, days] = r;
  void b0b;
  return {
    date: cmDate(m[0], m[1], year + m[2], m[3]), slot: m[4], legs: legs === 2 ? 2 : 1, gap: days, replays, f0f, f11, neutral: (venue & 4) !== 0,
    cm: { w30: legs === 2 ? code + 3 : code, b34: idx, b3a: b17, b3c: venue & 4 ? 1 : 0, f38: f0d, f38dec: legs === 2 ? f0f : undefined },
  };
}

/** Liga Cup'ens deltagerstruktur (EngCcCup 0x56c570, byes-nøglen = klubber i Europa): pr. runde [hold, kampe, nye, første nye] */
export function cmLeagueCupStructure(year: number, europeans: number): [number, number, number, number][] | null {
  const t = CM_CUP_TABLES.ENG_LC;
  const b = t?.byes?.[Math.min(europeans, Math.max(...Object.keys(t.byes ?? {}).map(Number)))];
  void year;
  return b ?? null;
}

/** kampflagene for en kamp (+0x38 efter rundens regler): kræver kampen en vinder (forlænget/straffe) – og gælder udebanemål */
export function cmFlagsOf(g: GameState, f: Fixture): number | null {
  const k = f.cm;
  if (!k) return null;
  if (f.leg === 2) {
    const tie = g.comps[f.comp]?.ties.find((t) => t.id === f.tieId);
    const f1 = tie?.fx.map((x) => g.fixtures[x]).find((x) => x?.leg === 1);
    return k.f38 | (f1?.result ? k.f38dec ?? 0 : 0);
  }
  return k.f38;
}

// ------------------------------------------------------------------------------------------------ FA Cup'en som originalen (22/11)
// EngFaCup (eng_fa_cup.cpp) i spil startet med modulet (g.cmCupPort – newgame.ts): 9 runder fra 4. kvalifikationsrunde (rundetabellen ENG,
// create_round_table 0x56f320), 152 deltagere inkl. ikke-ligaklubberne. EngFaCup::update_for_date 0x570550: den 3/10 (Date(3, 9, år) –
// 0x570667) hvert år: listen +0xa7, rundetabellen og kamptræet frigives, +0x45 = 1, collect_entrants 0x56fab0, set_up_rounds (+0x8c) og
// map_fixture_tree (+0x94). Cup::draw_round 0x51c410 trækker en runde på dens lodtrækningsdato (+0x00), når alle rundens hold kendes – ellers
// flyttes datoen én dag (og senere runders datoer med, 0x51c557); ikke-seedet (+0x0d & 0x400 = 0) og uden landsregel (+0x0b & 4 = 0) →
// randomize_round_teams 0x51e220 og set_home_teams_for_round 0x51e870(r, −1) (FA Cup: +0x0b = 0 og +0x24 = −1 → ingen ombytning: side a er
// hjemme). Omkampene (+0x20 = 1, +0x22 = 10 dage) som de øvrige pokaler (competitions.ts resolveTie).
// IKKE porteret: map_fixture_tree 0x518790's pladser i træet – rundens hold samles i rækkefølgen [forrige rundes vindere i kampenes
// rækkefølge, de nye deltagere fra +0x1e] før randomize_round_teams (som blander dem alle); lodtrækningsnyheden 0x51c6cf.

// cmNonLeague.ts' hjælpere (ikke importeret: cmNonLeague → cmFinance/cmBoardGame giver en importcyklus fra competitions.ts)
const s16 = (v: number) => (v << 16) >> 16;
const leagueId = (g: GameState, name: string): string | null => { for (const [id, l] of Object.entries(g.leagues)) if (l.name === name && !l.hidden) return id; return null; };
/** klubbens division +0x57 (= cmNonLeague.divOf) */
const divOf = (g: GameState, c: Club): number => { const m = /^CM(\d+)$/.exec(c.league); return m && !g.leagues[c.league]?.hidden ? +m[1] : g.cmFinRaw?.[c.id]?.[0] ?? -1; };
/** "English Conference" [0x9cf69c] (= cmNonLeague.cmConfDiv) */
function cmConfDiv(g: GameState): number {
  if (g.cmConfDiv !== undefined) return g.cmConfDiv;
  const third = leagueId(g, 'English Third Division');
  if (!third) return -1;
  const n = g.leagues[third].nation;
  return Object.values(g.clubs).some((c) => c.nation === n && g.leagues[c.league]?.hidden && g.cmFinRaw?.[c.id]?.[0] === 93) ? 93 : -1;
}
/** 0x4afbd0 (= cmNonLeague.pickByRep) */
function pickByRep(g: GameState, arr: Club[], k: number, rand: (n: number) => number): void {
  if (arr.length < k || k < 1) return;
  msvcQsort(arr, (x, y) => s16(clubRepMem(g, y.id)) - s16(clubRepMem(g, x.id)));
  const m = Math.min(3 * k, arr.length);
  for (let n = 0; n < m; n++) { const i = rand(m), j = rand(m); const t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
}

/** FA Cup'ens antal deltagere (+0x3e = 0x98, 0x56fbc1) */
export const FA_ENTRANTS = 152;
const ENG_DIVS = ['English Premier Division', 'English First Division', 'English Second Division', 'English Third Division'];

/** EngFaCup::collect_entrants 0x56fab0 → +0xa7 (klub-id'erne i listens rækkefølge). `nation` = Englands id i spillet, `year` = +0x40. Klubberne i
 *  klubtabellens rækkefølge (id'erne stiger som originalens 0xae23b4); divisionen +0x57 = cmNonLeague.divOf (club.dat's division for klubber
 *  uden kørende liga).
 *   - 0x56faf4–0x56fb85: FIFA Club World Championship [0x9cf7bc] i samme år → op til 2 engelske deltagere (+0xb3 – de springes over i
 *     divisionerne og lægges sidst). Spillet har ingen den turnering: altid 0 (rundetabellen ENG er lavet med +0xb3 = +0xb4 = 0).
 *   - FA Trophy [0x9cf6a0]: nation +0x11c & 4 (Conference kører – aldrig hos os) eller år 2001 → vinder/nr. 2 fra historikken
 *     (comp_util_get_latest_placed_club 0x4afd80, sted 0/1 – world-filens compHist 'cup:English FA Trophy', seneste år); ellers "vinderen" =
 *     klub 0, hvis den er i Conference (løkken 0x56fc81 går aldrig videre fra klub 0 – originalens fejl), og ingen nr. 2.
 *   - alle klubber: division ∈ {A Lower Division [0x9cf764], Premier, First, Second, Third} → springes over; Conference [0x9cf69c] → C;
 *     ellers landet England (+0x53) og højst 300 → A ("andre").
 *   - vinderen/nr. 2: i Conference → fjernes fra C (byttes med den sidste) og C's kvote 22 − 1; uden for ligaerne → fjernes fra A (findes
 *     den ikke: A's sidste → A[0] / A[1], 0x56fe91/0x56ff84) og A's kvote 38 − 1.
 *   - C: rand(n − 2) ↔ C[n − 1], rand(n − 2) ↔ C[n − 2] (0x56ffa7); A: 0x4afbd0(A, n, kvote) (qsort efter omdømme + min(3·kvote, n) ombytninger)
 *   - listen: A[0..kvote), C[0..kvote), vinderen, nr. 2, Third (ikke vinderen/nr. 2), Second, First (+ 60 ombytninger rand(24) ↔ rand(24)
 *     blandt de sidste 24, 0x570249), Premier – hver til listen har 152. */
export function cmFaCupEntrants(g: GameState, nation: number, year: number, rand: (n: number) => number): number[] {
  const ids = ENG_DIVS.map((n) => { const id = leagueId(g, n); return id ? +(/^CM(\d+)$/.exec(id)?.[1] ?? -1) : -1; });
  const [prm, first, second, third] = ids;
  const conf = cmConfDiv(g), lower = g.cmLowerDiv ?? -1;
  const skip = new Set([lower, prm, first, second, third]);
  const clubs = Object.values(g.clubs).sort((a, b) => a.id - b.id);
  const div = (c: Club | undefined) => (c ? divOf(g, c) : -1);
  let w: Club | undefined, ru: Club | undefined;
  if (year === 2001) {
    const h = g.cmCompHist?.[`cup:${FA_TROPHY}`]?.[0];
    if (h) { w = g.clubs[h[1]]; ru = h[2] >= 0 ? g.clubs[h[2]] : undefined; }
  } else {
    const c0 = g.clubs[0];
    if (c0 && div(c0) === conf) w = c0;
  }
  const A: Club[] = [], C: Club[] = [];
  for (const c of clubs) {
    const d = div(c);
    if (d < 0 || skip.has(d)) continue;
    if (d === conf) C.push(c);
    else if (c.nation === nation && A.length < 300) A.push(c);
  }
  let qC = 0x16, qA = 0x26;
  const remove = (arr: Club[], c: Club, at: number): void => {
    let found = false;
    for (let i = 0; i < arr.length; i++) if (arr[i] === c) { arr[i] = arr[arr.length - 1]; arr.pop(); found = true; }
    if (!found && arr.length) { const last = arr.pop()!; if (at < arr.length) arr[at] = last; else arr.push(last); }
  };
  const isConf = (c: Club) => div(c) === conf;
  const isOther = (c: Club) => { const d = div(c); return d >= 0 && !skip.has(d) && d !== conf; };
  if (w && isConf(w)) { const i = C.indexOf(w); if (i >= 0) { C[i] = C[C.length - 1]; C.pop(); } qC = 0x15; }
  else if (w && isOther(w)) { remove(A, w, 0); qA = 0x25; }
  if (ru && isConf(ru)) { const i = C.indexOf(ru); if (i >= 0) { C[i] = C[C.length - 1]; C.pop(); } qC--; }
  else if (ru && isOther(ru)) { remove(A, ru, 1); qA--; }
  // 0x56ffa7: to tilfældige Conference-klubber byttes om på de to sidste pladser
  const n = C.length;
  if (n >= 2) {
    const r1 = rand(n - 2), r2 = rand(n - 2);
    let t = C[r1]; C[r1] = C[n - 1]; C[n - 1] = t;
    t = C[r2]; C[r2] = C[n - 2]; C[n - 2] = t;
  }
  pickByRep(g, A, qA, rand);
  const out: number[] = [];
  for (const c of A.slice(0, Math.max(0, qA))) out.push(c.id);
  for (const c of C.slice(0, Math.max(0, qC))) out.push(c.id);
  if (w) out.push(w.id);
  if (ru) out.push(ru.id);
  const addDiv = (d: number, not: (Club | undefined)[]) => {
    for (const c of clubs) {
      if (out.length >= FA_ENTRANTS) return;
      if (div(c) === d && !not.includes(c)) out.push(c.id);
    }
  };
  addDiv(third, [w, ru]);
  addDiv(second, []);
  addDiv(first, []);
  for (let k = 0; k < 60 && out.length >= 24; k++) {
    const a = rand(24), b = rand(24);
    const i = out.length - 1 - a, j = out.length - 1 - b;
    const t = out[i]; out[i] = out[j]; out[j] = t;
  }
  addDiv(prm, []);
  return out;
}

/** Cup::randomize_round_teams 0x51e220 for en runde med `ties` kampe: holdene (`teams` – alle kendte, ingen tomme pladser) blandes
 *  (for hver plads i: rand(n) ↔ i, 0x51e491), og hvert hold får en tilfældig kamp: start rand(ties), videre fremad (rundt), første gennemgang
 *  kun kampe uden hold, så kampe med en ledig side (gennemgangen bliver stående, 0x51e60f); begge sider ledige → rand(2) ≠ 0 = side a.
 *  Resultatet [a, b] pr. kamp (set_home_teams_for_round: a hjemme). */
export function cmRandomizeRound(teams: number[], ties: number, rand: (n: number) => number): [number, number][] {
  const L = teams.slice();
  for (let i = 0; i < L.length; i++) { const j = rand(L.length); const t = L[j]; L[j] = L[i]; L[i] = t; }
  const A: (number | null)[] = new Array(ties).fill(null), B: (number | null)[] = new Array(ties).fill(null);
  let pass = 0;
  for (const club of L) {
    const start = rand(ties);
    let k = start;
    for (;;) {
      const aFree = A[k] === null, bFree = B[k] === null;
      if ((pass === 1 || (aFree && bFree)) && (aFree || bFree)) {
        if (aFree && (!bFree || rand(2) !== 0)) A[k] = club; else B[k] = club;
        break;
      }
      k = k + 1 >= ties ? 0 : k + 1;
      if (k === start) {
        if (pass) throw new Error('cmRandomizeRound: ingen ledig plads');
        pass = 1;
      }
    }
  }
  const out: [number, number][] = [];
  for (let k = 0; k < ties; k++) if (A[k] !== null && B[k] !== null) out.push([A[k]!, B[k]!]);
  return out;
}

/** rundens lodtrækningsdato (+0x00/+0x02: dag, årstillæg – 0x521e60) */
export function cmCupDrawDate(key: string, year: number, round: number): string | null {
  const r = roundsOf(key, year)?.[round - 1];
  if (!r) return null;
  const d = r[0];
  return cmDate(d[0], d[1], year + d[2], d[3]);
}

/** rundens [hold, kampe, nye, første nye] (+0x18/+0x1a/+0x1c/+0x1e) */
export function cmCupRoundShape(key: string, year: number, round: number): [number, number, number, number] | null {
  const r = roundsOf(key, year)?.[round - 1];
  return r ? [r[10], r[11], r[12], r[13]] : null;
}
