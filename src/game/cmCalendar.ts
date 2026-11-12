// Originalens kalender (runde 10A, 12/11-2026) – kun den originale database i ægte tilstand (cmActive), som det øvrige cm*-kode:
//
//   Spilstarten 0x830520 (setup_pick_start_date) + 0x828480: den første række i nøglelandstabellen 0xb63d60 (35 × 0x48) med spillets
//     hovedland [0xae2d08] (det først valgte land) → +0x2a (landets sæsonstart; England = lørdagen nærmest 10/8 = 11/8-2001), et europæisk
//     land med start efter 1/9-2001 → 1/9-2001, så −4 uger (0x54cab0). 0x5cc850 kører spillet dag for dag fra databasens dato 1/1 til den
//     dato (startdatoen ≤ 1/1 → ingen forkørsel). England: 14/7-2001.
//   Ligaernes runder: create_schedule (EngPrm 0x573660, EngFirst 0x571980, EngSecond 0x5757a0, EngThird 0x5770e0 – data/cmSchedules.ts) →
//     League::create_fixtures 0x6835c0: runde i = skemaets række i (dato, tidspunkt +4); kampene lægges i FIXTURE_MANAGER::add_fixture
//     0x5aa680, som flytter en kamp, der støder sammen med en anden af klubbens kampe (find_new_fixture_date 0x5ab510).
//   Tv-flytningerne League::move_fixtures_for_tv 0x685640: hver dag (League::update_for_date 0x6847c0, 0x684af4: i dag + 4 uger) for
//     skemaets dato: pr. tv-plads den kamp med størst rand(ude +0x80 + 1500) + rand(hjemme +0x80) (0 ved en anden kamp for et af holdene
//     2–5 dage før/efter, 0x5acbe0) → ugedagen nærmest datoen og pladsens tidspunkt.
//   FA Cup: EngFaCup::create_round_table 0x56f320 (9 runder; spillets pokal har færre – runderne tælles fra finalen).
//
// IKKE porteret (se ENGINE_PORT_PLAN.md, runde 10A): de andre landes skemaer (35 nøglelande, ~100 klasser), Liga Cup/Charity Shield/
// Intertoto/landskampene i forkørslen, sammenstødsreglen 0x5ad780/0x5adba0 (kodernes rækkefølge; her: en anden kamp for et af holdene dagen
// før/samme dag/dagen efter, koden = den anden kamps type), resolve_same_day_clash 0x5ae380, klubbens foretrukne kampdag +0x72 (alle
// engelske klubber har 5 = lørdag eller 0xff), tv-nyheden (0x77bbe0/0x7861e0) og originalens parring af holdene (league_next_schedule_round
// 0x68a030 + talrækken).
import type { Fixture, GameState } from './types';
import { addDays, daysBetween, toDate } from './dates';
import { CM_FA_CUP, CM_SCHEDULES, type SchedRound, type SchedTv } from './data/cmSchedules';
import { seasonStartDay } from './cmFitness';
import { cmActive, cmRand } from './cmPlayerData';
import { fixturesOn, indexFixture, unindexFixture } from './state';

/** kalenderen gælder: den originale database i ægte tilstand (ikke draft-ligaen) */
export const cmCalendarOn = (g: GameState): boolean => cmActive(g) && !g.draft;

/** de 27 nøglelande uden for Europa (0x9cfa10 = Europa): Argentina, Australien, Brasilien, Japan, Sydkorea, USA */
const NON_EUROPE = new Set([8, 11, 27, 97, 170, 196]);
/** de engelske ligaer med originalens skema (turnerings-id'er i club_comp.dat) */
const ENGLAND = 60;

const isoOf = (t: number) => new Date(t).toISOString().slice(0, 10);
/** ugedag 0 = mandag … 6 = søndag (0x54a3f0) */
export const cmWeekday = (iso: string) => (toDate(iso).getUTCDay() + 6) % 7;

/** 0x549f70 Date(dag, måned 0–11, år, ugedag): dagen i året = månedstabellen + dag (løber over i næste måned som i originalen),
 *  så 0x54a2d0 – den dag med ugedagen, der ligger højst 3 dage før eller efter (ugedag −1 = ingen) */
export function cmDate(day: number, month: number, year: number, wd: number): string {
  const t = Date.UTC(year, month, 1) + (day - 1) * 86400000;
  if (wd < 0) return isoOf(t);
  const cur = (new Date(t).getUTCDay() + 6) % 7;
  let diff = wd - cur;
  if (diff > 3) diff -= 7;
  if (diff < -3) diff += 7;
  return isoOf(t + diff * 86400000);
}
/** 0x54a2d0 på en ISO-dato */
export const nearestWeekday = (iso: string, wd: number) => cmDate(Number(iso.slice(8, 10)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(0, 4)), wd);

/** Spilstarten 0x830520 − 4 uger (null: hovedlandet har ingen række i nøglelandstabellen). Den originale database starter altid i 2001. */
export function cmStartDate(mainNation: number | undefined, season: number): string | null {
  const A = seasonStartDay(mainNation);
  if (A === undefined || mainNation === undefined) return null;
  let start = isoOf(Date.UTC(season, 0, 1) + A * 86400000);
  // 0x83057b–0x830609: Europa og år 2001 – en start efter 1/9-2001 bliver 1/9-2001
  const sep1 = `${season}-09-01`;
  if (!NON_EUROPE.has(mainNation) && season === 2001 && start > sep1) start = sep1;
  start = addDays(start, -28);
  // 0x5cc850: startdatoen før databasens dato (1/1) → spillet starter på databasens dato
  const jan1 = `${season}-01-01`;
  return start < jan1 ? jan1 : start;
}

export interface CmRound { date: string; slot: number; tv: SchedTv[] }

/** Skemaet for en liga i sæsonen `year` (create_schedule med comp +0x40 = year); null = ligaen har ikke originalens skema her */
export function cmLeagueSchedule(compId: string, year: number): CmRound[] | null {
  const tpl = CM_SCHEDULES[compId];
  if (!tpl) return null;
  const xmas = tpl.xmas[cmWeekday(`${year}-12-17`)] ?? {};
  return tpl.rounds.map((base, i) => {
    const [r, tv] = (xmas[i] ?? [base, tpl.tv[i]]) as [SchedRound, SchedTv[]];
    return { date: cmDate(r[0], r[1], year + r[2], r[3]), slot: r[4], tv };
  });
}

/** FA Cup-rundens kampdato: spillets runde `round` af `total` (sidste = finalen) ↔ originalens runde talt fra finalen */
export function cmFaCupDate(nation: number, round: number, total: number, year: number): string | null {
  if (nation !== ENGLAND) return null;
  const r = CM_FA_CUP[CM_FA_CUP.length - 1 - (total - round)];
  return r ? cmDate(r[0], r[1], year + r[2], r[3]) : null;
}

// ---------------------------------------------------------------- FIXTURE_MANAGER (add_fixture 0x5aa680 / find_new_fixture_date 0x5ab510)

/** fixture +0x3a (kamptypen – se gameInputs.ts fixtureCodesOf): liga 2, pokal 4 (6 fra kvartfinalen), playoff 5, Europa 8, venskabskamp 1 */
function fixtureType(g: GameState, f: Fixture): number {
  const c = g.comps[f.comp];
  if (!c) return 1;
  if (c.type === 'league') return 2;
  if (c.type === 'playoff') return 5;
  if (c.type === 'continental') return 8;
  return f.stage === 'QF' || f.stage === 'SF' || f.stage === 'F' ? 6 : 4;
}

/** holdenes andre kampe fra dag `lo` til `hi` efter `date` (begge med) */
function clubFixtures(g: GameState, f: Fixture, date: string, lo: number, hi: number, clubs = [f.home, f.away]): Fixture[] {
  const out: Fixture[] = [];
  for (let k = lo; k <= hi; k++) {
    for (const id of fixturesOn(addDays(date, k))) {
      const o = g.fixtures[id];
      if (o && o.id !== f.id && (clubs.includes(o.home) || clubs.includes(o.away))) out.push(o);
    }
  }
  return out;
}

/** sammenstød for kampen på `date` (0x5ad780: dagen før, samme dag, dagen efter; −2 i anden gennemgang) → [kampene, værste kode] */
function clashes(g: GameState, f: Fixture, date: string, strict: boolean): [Fixture[], number] {
  const list = clubFixtures(g, f, date, strict ? -2 : -1, 1);
  return [list, list.reduce((m, o) => Math.max(m, fixtureType(g, o)), 0)];
}

/** 0x5af2f0: tidspunktet for en ugedag (England: lørdag/søndag eftermiddag, ellers aften) */
const slotFor = (wd: number) => (wd === 5 || wd === 6 ? 1 : 2);

function moveFixture(f: Fixture, date: string, slot?: number): void {
  if (f.date !== date) { unindexFixture(f.id, f.date); f.date = date; indexFixture(f.id, date); }
  if (slot !== undefined) f.slot = slot;
}

/** 0x5ab510 (ligakampe, type 2): søgningen fra F + 3 dage (F + 4 uger, når sidste runde ligger mere end 20 uger efter F) til sidste
 *  rundes dato i 4-dages skridt, ugedagene i rækkefølgen ons/tir · lør/søn · man/tor/fre, to gennemgange; ellers max(F, i dag) + 2 dage */
const WD_ORDER = [[2, 1], [5, 6], [0, 3, 4]];
export function cmFindNewDate(g: GameState, f: Fixture): void {
  const F = f.date;
  const last = (g.comps[f.comp]?.meta?.cmLast as string | undefined) ?? addDays(F, 14);
  const start = last > addDays(F, 140) ? addDays(F, 28) : addDays(F, 3);
  const earliest = addDays(g.date, 2);
  const type = fixtureType(g, f);
  for (let pass = 0; pass < 2; pass++) {
    for (const group of WD_ORDER) {
      for (const wd of group) {
        for (let cur = start; last > cur; cur = addDays(cur, 4)) {
          const D = nearestWeekday(cur, wd);
          if (earliest > D || D > last) continue;
          const [list, code] = clashes(g, f, D, pass === 1);
          if (!list.length || code === 1 || type > code) { moveFixture(f, D, slotFor(wd)); return; }
        }
      }
    }
  }
  moveFixture(f, addDays(F > g.date ? F : g.date, 2));
}

/** add_fixture 0x5aa680 (0x5aa890–0x5aaa64): et sammenstød med en kode ≥ kampens type → kampen selv flyttes; ellers bliver den, og de
 *  andre kampe flyttes (0x5abc30 + 0x5ab510 + add_fixture) */
export function cmPlaceFixture(g: GameState, f: Fixture): void {
  const [list, code] = clashes(g, f, f.date, false);
  if (!list.length) return;
  if (code >= fixtureType(g, f)) { cmFindNewDate(g, f); return; }
  for (const o of list) if (g.comps[o.comp]?.meta?.cmSched) cmFindNewDate(g, o);
}

// ---------------------------------------------------------------- tv-flytningerne (0x685640)

/** Dagen (sim.ts newDay): for hver liga med originalens skema – skemaets række på i dag + 4 uger får sine tv-kampe */
export function cmCalendarDay(g: GameState): void {
  if (!cmCalendarOn(g)) return;
  const target = addDays(g.date, 28);
  for (const c of Object.values(g.comps)) {
    if (c.type !== 'league' || !c.meta?.cmSched || c.finished) continue;
    const sched = cmLeagueSchedule(c.id, c.meta.cmYear as number);
    const row = sched?.find((r) => r.date === target);
    if (row?.tv.length) tvMoves(g, c.id, row);
  }
}

function tvMoves(g: GameState, comp: string, row: CmRound): void {
  // 0x5abd90: rundens kampe i turneringen på dagen og tidspunktet
  let list = fixturesOn(row.date).map((id) => g.fixtures[id]).filter((f): f is Fixture => !!f && f.comp === comp && !f.result && (f.slot ?? row.slot) === row.slot);
  const E = row.date;
  const rand = cmRand(g.seed ?? 0, daysBetween('2001-01-01', g.date), 0x685640);
  const rep = (club: number) => g.cmClubRep?.[club] ?? Math.round((g.clubs[club]?.rep ?? 0) * 100);
  for (const [wd, slot, kind] of row.tv) {
    if (slot < 0 || slot > 2 || !list.length) continue;
    const D = nearestWeekday(E, wd);
    // 0x6858b4–0x685964: tv-dagen efter datoen → [E + 2, E + 5], ellers [E − 5, E − 2]
    const [lo, hi] = D > E ? [2, 5] : [-5, -2];
    let best: Fixture | null = null, top = -1;
    for (const f of list) {
      let s = kind === 3 ? 50 : rand(rep(f.away) + 1500) + rand(rep(f.home));
      if (kind !== 3 && (clubFixtures(g, f, E, lo, hi, [f.home]).length || clubFixtures(g, f, E, lo, hi, [f.away]).length)) s = 0;
      if (s > top) { top = s; best = f; }
    }
    if (!best) continue;
    moveFixture(best, D, slot);
    list = list.filter((f) => f !== best);
  }
}
