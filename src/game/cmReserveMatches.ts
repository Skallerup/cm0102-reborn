// Originalens reservekampe – turneringen "Reserve" (club_comp.dat 87 = [0x9cf684], reservemanageren [0xb74434]) i cm0102.exe 3.9.68.
// Afkodet 20/11-2026 (~/cm0102-engine/notes/reserve-matches.md, afsnittet "Reservekampene for de spilbare klubber"). Alle databaser: nye
// spil får kontakten g.cmRsv ved spilstarten (newgame.ts) – aldrig gated på databasen eller tilstanden.
//
//   0x5aaf00  FIXTURE_MANAGER (hvert tidspunkt): onsdag (ugedag 2, 0 = mandag) → 0x7e6380(i dag + 3); torsdag (3) → 0x7e6380(i dag + 3) og
//             0x7e6380(i dag + 1). Lørdag/søndag: gårsdagens reservekampe uden et menneske (0x600a50(klub, 1, 1, 0, 0)) fjernes fra listen.
//   0x7e6380  reservekampene for førsteholdenes kampe på dato D: reservedatoen R = D + 2, når D er en fredag, ellers D − 2 (lørdag → torsdag,
//             søndag → fredag, fredag → søndag). Pr. række i nøglelandstabellen 0xb63d60 med landet indlæst (+0x11c) – ikke Frankrig
//             [0x9cf300] – og pr. tidspunkt 0..2: hver kamp på D i landet, hvis turnering er en kørende liga (0x4b0700) og som 0x7e6ba0
//             godkender, kopieres: turneringen = Reserve, +0x3a = 1, +0x40 = +0x41 = 0 (reservesiderne), dato R, hjemme- og udeholdet BYTTET
//             (undtagen i Tyrkiet [0x9cf4dc]), stadion = den nye hjemmeklubs +0x6e (aldrig sat i databasen) ellers +0x69 – er det optaget den
//             dag (0x5ae870), oprettes kampen ikke. add_fixture 0x5aa680(kopien, 1): et sammenstød (0x5ad780: en anden kamp for et af holdene
//             dagen før, samme dag eller dagen efter) med type ≥ 1 → en 0x7e6f20-turnering (Reserve) droppes (0x5aa951).
//   0x7e6ba0  (kamp, 1): runde-/navnekoderne +0x30 ≠ 0 / +0x32 ∈ {0x418, 0x419, 0xa0} → nej (ligakampe har 0); hjemmeklubben i Tyrkiet kun
//             i divisionen [0x9cf8d4] (−1 i databasen → aldrig); 26/12 → nej; hjemmeklubben i Scottish Premier [0x9cf5dc] eller Tyrkiet: hvert
//             hold skal have mindst 15 spillere ≤ 21 år; begge klubber reservehold (0x542740); pr. klub over truppens 50 pladser: tom plads → t,
//             spiller i klubben (+0x39) uden skade (0x62c400 = 0): id < [0xae2364] → r, ikke førsteholdet (+0x5e & 1 = 0) → n (rigtig → nr);
//             n < 11 kræver r ≤ 36 og t ≥ 14 − n (fyldspillerne 0x90d2f0 har plads); menneskets klub kræver n ≥ 11 og nr ≥ 1.
//   kampen    MATCH_DAY som alle kampe (hele motoren): udtagelsen 0x6db500 sætter hold+0x19 = 1, +0x1a = 0 for reservesiden – pick_team 0x6dbc50
//             (aiTeam.ts reserveExclusion/aiTeamSetup): computerens 14 bedste "førsteholdsspillere" (0x6e2000 med 14 masker, flag 0x8520c2) er
//             udelukket, flagene 0x20100 ^ 0x80000 uden tilfældige tal; menneskets reserver vælges af assistenten (0x600e90) blandt spillerne
//             uden for førsteholdet (seniorer kun når de står i reserveudtagelsen 0x8972c0 – den findes ikke i spillet). Ingen tilskuere
//             (init_match 0x6b86c9). Efter kampen 0x6b5f00: 0x6b6cc0 (omdømme/moral – 0x6d3610/0x6d3de0 med reserveturneringens +0x69, b40 = 0),
//             0x4ca6d0 intet (+0x40 = 0), Discipline 0x55ca00 som en venskabskamp (ligaorganerne, uden afsoning) + RulingBody 0x7e8278 (lige
//             rødt kort med kode ≥ 10 dømmes), 0x62c080 halv træthed (+0x40 = 0), 0x7c0d70 kategori 1, FinanceTable 0x59a5d0 (0 tilskuere:
//             omkostningerne delt), spejderne 0x7b5be0. Intet: tilladelsen 0x8c39f0, bestyrelsen 0x6951e0, priserne 0x4134c0, Staff_Records
//             0x868830 (+0x3a = 1), Club_Records 0x444930 (0x7e6f20), 0x7f8c00's første del, tabellen.
//
// Ikke porteret (UI/nyheder – senere opgave): reservemanagerens vtbl+4 0x7e6f70 (nyheden 0x25 om reserveholdets resultat til mennesket), "Reserves
// Latest" (0x723dd2), klubbens kampprogram/sidste kamp i reservevisningen (0x45ccf0/0x4671e0), "Control Reserve Team" (+0x9a05 – mennesket vælger
// selv), menneskets reserveudtagelse 0x8972c0, Belgiens bænk (+0x4d | 0x44 – Belgien er ikke spilbart i 2001), 0x5ad780's faste landsdage.
import type { GameState, Player } from './types';
import { addDays, ageOn } from './dates';
import { fixturesOn, squad } from './state';
import { cmWeekday } from './cmCalendar';
import { hasReserveTeam } from './cmBTeam';
import { isHumanClub } from './humans';
import { cmFitOn, cmFitRead } from './cmFitnessGame';

/** spillets turnerings-id for reservekampene (ikke i g.comps – som venskabskampene en "turnering uden tabel") */
export const RSV_COMP = 'RSV';
/** club_comp.dat's "Reserve" ([0x9cf684] = 87 i 3.9.60/3.9.68 og 2026/27-opdateringen; omdømmet +0x69 = 1) */
export const RSV_CM_ID = 87;

export interface CmRsvFixture { id: number; date: string; home: number; away: number }
export interface CmRsvState {
  /** de oprettede, endnu ikke spillede reservekampe */
  fx: CmRsvFixture[];
  /** næste kamp-id (negativt i spillet: −(1e9 + n)) */
  next: number;
  /** spillede reservekampe i alt (måling) */
  played?: number;
  /** menneskeklubbernes seneste reserveresultater (til en senere skærm) */
  hist?: { d: string; h: number; a: number; hg: number; ag: number }[];
}

export const cmRsvOn = (g: GameState) => !!g.cmRsv && !g.draft;
export function cmRsvNewGame(g: GameState): void { if (!g.draft) g.cmRsv = { fx: [], next: 1 }; }
export const rsvFixtureId = (n: number) => -(1e9 + n);
export const isRsvFixture = (f: { comp: string } | undefined) => f?.comp === RSV_COMP;

const nationName = (g: GameState, n: number | undefined) => g.nations[n ?? -1]?.name ?? '';
/** club_comp.dat-id'et for en af spillets turneringer ("CM<n>") */
const cmId = (comp: string | undefined) => { const m = /^CM(\d+)$/.exec(comp ?? ''); return m ? +m[1] : -1; };
/** [0x9cf5dc] Scottish Premier Division */
const SCO_PREMIER = 34;

/** 0x4b0700: turneringen er en kørende liga (ligatype, spillet, med klubber) */
function runningLeague(g: GameState, comp: string): boolean {
  const c = g.comps[comp];
  return !!c && c.type === 'league' && !g.leagues[comp]?.hidden && c.clubs.length > 0;
}

/** 0x62c400 ≠ 0: skadet eller genoptræner */
function hurt(g: GameState, p: Player): boolean {
  if (cmFitOn(g)) return cmFitRead(g).status(p) !== 0;
  return !!p.injury;
}
/** +0x5e & 1: førsteholdet (spillets Player.reserves / cmPlace 1 = reserverne) */
export const rsvSenior = (p: Player) => !(p.cmPlace === 1 || (p.cmPlace === undefined && p.reserves));
const real = (p: Player) => !p.regen && !p.virtual;

/** 0x7e6ba0's optælling for én klub; null = afvist */
function clubOk(g: GameState, cid: number, date: string, young: number): boolean {
  let empty = 0, reals = 0, ns = 0, nsReal = 0, yng = 0;
  const ps = squad(cid);
  empty = Math.max(0, 50 - ps.length);
  for (const p of ps) {
    if (p.club !== cid || hurt(g, p)) continue;
    if (real(p)) reals++;
    if (young >= 0 && ageOn(p.dob, date) <= 21) yng++;
    if (rsvSenior(p)) continue;
    if (real(p)) nsReal++;
    ns++;
  }
  if (ns < 11 && (reals > 36 || empty < 14 - ns)) return false;
  if (isHumanClub(cid) && (ns < 11 || nsReal < 1)) return false;
  return yng >= young;
}

/** 0x7e6ba0(kamp, 1) for en ligakamp */
function fixtureOk(g: GameState, f: { date: string; home: number; away: number; comp: string }): boolean {
  const H = g.clubs[f.home], A = g.clubs[f.away];
  if (!H || !A) return false;
  // hjemmeklubben i Tyrkiet: kun divisionen [0x9cf8d4] (−1 i databasen)
  if (nationName(g, H.nation) === 'Turkey') return false;
  // Boxing Day
  if (f.date.slice(5) === '12-26') return false;
  const young = cmId(H.league) === SCO_PREMIER ? 15 : -1;
  if (!hasReserveTeam(g, f.home) || !hasReserveTeam(g, f.away)) return false;
  return clubOk(g, f.home, f.date, young) && clubOk(g, f.away, f.date, young);
}

/** klubbens stadion (club +0x69 → cmCrowd[3]) */
const stadiumOf = (g: GameState, cid: number) => g.cmCrowd?.[cid]?.[3] ?? -1;

/** 0x5ae870: en anden kamp på stadionet den dag (spillets kampe og de oprettede reservekampe) */
function stadiumBusy(g: GameState, st: CmRsvState, home: number, date: string): boolean {
  const s = stadiumOf(g, home);
  if (s < 0) return false;
  for (const id of fixturesOn(date)) { const f = g.fixtures[id]; if (f && stadiumOf(g, f.home) === s) return true; }
  return st.fx.some((r) => r.date === date && stadiumOf(g, r.home) === s);
}

/** 0x5ad780: en anden kamp for et af holdene dagen før, samme dag eller dagen efter */
function clash(g: GameState, st: CmRsvState, home: number, away: number, date: string): boolean {
  const hit = (h: number, a: number) => h === home || h === away || a === home || a === away;
  for (let k = -1; k <= 1; k++) {
    const d = addDays(date, k);
    for (const id of fixturesOn(d)) { const f = g.fixtures[id]; if (f && hit(f.home, f.away)) return true; }
    if (st.fx.some((r) => r.date === d && hit(r.home, r.away))) return true;
  }
  return false;
}

/** 0x7e6380(D): reservekampene for førsteholdenes ligakampe på D */
export function cmRsvCreate(g: GameState, D: string): number {
  const st = g.cmRsv;
  if (!st) return 0;
  const R = cmWeekday(D) === 4 ? addDays(D, 2) : addDays(D, -2);
  let n = 0;
  for (const nat of g.activeNations) {
    const nn = nationName(g, nat);
    if (nn === 'France') continue;
    for (const id of fixturesOn(D)) {
      const f = g.fixtures[id];
      if (!f || f.result || g.comps[f.comp]?.nation !== nat || !runningLeague(g, f.comp)) continue;
      if (!fixtureOk(g, f)) continue;
      const [home, away] = nn === 'Turkey' ? [f.home, f.away] : [f.away, f.home];
      if (stadiumBusy(g, st, home, R) || clash(g, st, home, away, R)) continue;
      st.fx.push({ id: rsvFixtureId(st.next++), date: R, home, away });
      n++;
    }
  }
  return n;
}

/** 0x5aaf00's del for reservekampene: dagligt ved dagens start */
export function cmRsvDaily(g: GameState): void {
  if (!cmRsvOn(g)) return;
  const wd = cmWeekday(g.date);
  if (wd === 2 || wd === 3) cmRsvCreate(g, addDays(g.date, 3));
  if (wd === 3) cmRsvCreate(g, addDays(g.date, 1));
}

/** dagens reservekampe (fjernes fra listen – de spilles nu) */
export function cmRsvTake(g: GameState): CmRsvFixture[] {
  const st = g.cmRsv;
  if (!st || !st.fx.length) return [];
  const today = st.fx.filter((r) => r.date <= g.date);
  if (today.length) st.fx = st.fx.filter((r) => r.date > g.date);
  return today.filter((r) => r.date === g.date);
}

/** menneskeklubbens resultat gemmes (reservevisningens "Last Match"/kampprogram – senere skærm) */
export function cmRsvRecord(g: GameState, r: CmRsvFixture, hg: number, ag: number): void {
  const st = g.cmRsv;
  if (!st) return;
  st.played = (st.played ?? 0) + 1;
  if (isHumanClub(r.home) || isHumanClub(r.away)) {
    (st.hist ??= []).push({ d: r.date, h: r.home, a: r.away, hg, ag });
    if (st.hist.length > 40) st.hist.splice(0, st.hist.length - 40);
  }
}

/** kun til tests/målinger */
export const _test = { fixtureOk, clubOk, stadiumBusy, clash };
