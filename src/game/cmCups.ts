// De nationale pokaler, Liga Cup (Worthington Cup) og Charity Shield efter originalens rundetabeller (kalender runde 10D, 13/11-2026) – kun den
// originale database i ægte tilstand (cmCalendarOn). Tabellerne: data/cmCupTables.ts (create_round_table pr. klasse kørt i unicorn,
// ~/cm0102-engine/tools/sched/gen_cups.py): EngFaCup 0x56f320, EngCcCup 0x56c570, EngCharity 0x56d640, ScoFaCup 0x7ed5d0, GerCup 0x5d8ee0,
// FraCup 0x5ba3f0, SpaCup 0x84d220, PorCup 0x7cdc40, BelFaCup 0x41d310, TurCup 0x8fc670, RusCup 0x7e9530, NorCup 0x78f2e0, SweCup 0x88cf40
// (stage 7), DenCup 0x550c70, CroCup 0x517740, PolCup 0x7c8040, KorFaCup 0x66a720, JapEmpCup 0x661ff0, BraCup 0x427700, UsaOpenCup 0x90b170.
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
import type { Fixture, GameState } from './types';
import { CM_CUP_TABLES, type CmCupRound } from './data/cmCupTables';
import { cmCalendarOn, cmDate } from './cmCalendar';

export interface CmCupRoundInfo {
  date: string; slot: number; legs: number; gap: number; replays: number;
  /** fixture-koderne for første kamp (andet ben: w30 + 1 og f38dec) */
  cm: NonNullable<Fixture['cm']>;
  f0f: number; f11: number; neutral: boolean;
}

/** pokalens tabel-nøgle for et land ('ENG', 'SCO' …) */
export function cmCupKey(g: GameState, nation: number): string | null {
  if (!cmCalendarOn(g)) return null;
  for (const [k, t] of Object.entries(CM_CUP_TABLES)) if (t.nation === nation && !k.includes('_')) return k;
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
