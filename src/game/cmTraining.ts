// Originalens interne egenskaber i spillet (Player.cmInt – spillerposten +0x1e … +0x43, s8) og træningen TRAINING_MANAGER (cm0102.exe 3.9.68,
// training_manager.cpp). Afkodet 12/11-2026; noterne ~/cm0102-engine/notes/cm-internal-attrs.md og cm-development.md.
//
// I cm0102.exe gemmer spillerposten de 18 tekniske/mentale egenskaber som interne værdier; det viste er display(CA + 2·intern) (sub_544380; målmænd
// 0,1·CA for Crossing/Creativity/Off the Ball). Spilstarten (sub_535a80 → sub_538ec0/sub_538bc0) er porteret i playerInit.ts. I sæsonen skrives
// spillerposten af:
//   - udviklingen i den daglige staff-opdatering 0x5ce2d0 (0x5d38f9–0x5d578d, cmDevelop.ts) og re-centreringen 0x538bc0 bagefter;
//   - træningen: TRAINING_MANAGER::update_player_training 0x8b1750 (dovent: de uger, der er gået siden sidst, højst 30) → apply_training_progress
//     0x8b2be0. Hver spiller har en post på 6 bytes ([TM+0x651d] + 6·spillerpostens id): +0 skemaet, +1 ugen ved sidste opdatering, +3..+5 fem
//     4-bit "træningseffekter" med fortegn (område 0 = +3 lav, 1 = +3 høj, 2 = +4 lav, 3 = +4 høj, 4 = +5 lav). Ugetælleren TM+0x688d tælles op
//     efter 0x5ce2d0 på dage med dag-i-året % 7 = 0 (0x8b1730 fra 0x5cda8a). 0x8b1750 kaldes ved kampopsætningen MATCH_PLAYER::setup (0x6eb045 –
//     alle i begge kamptrupper), ved en ny skade Injury::add_injury (0x62d312) og af skærmene (at se en spiller opdaterer ham – ikke porteret).
//   - 0x8b3640 trækker effekterne fra før re-centreringen 0x538bc0 og lægger dem på igen bagefter.
import type { GameState, Player } from './types';
import { ATTRS } from './attributes';
import { shownFromInternal, CM_INT_OFFSETS, normaliseInternals } from './playerInit';
import { cmActive } from './cmPlayerData';

/** De 18 viste af Player.cmInt og CA (originalens invariant); intet uden cmInt eller uden for den originale database i ægte tilstand. */
export function cmIntSync(g: GameState, p: Player): void {
  if (!p.cmInt || !cmActive(g)) return;
  shownFromInternal(p.attrs, p.cmInt, Math.trunc(p.ca), p.pos[0]);
}

// ------------------------------------------------------------------------------------------------ spillerposten (+0x0f … +0x45)

/** spillerpostens felter som originalen: CA +5, PA +7, omdømmet +9/+0xb/+0xd (hukommelsens skala 0..10000) og bytes +0x0f..+0x45 (s8) i `b[offset]` */
export interface CmRec { ca: number; pa: number; rep: [number, number, number]; b: number[] }
/** +0x1b..+0x44 (alfabetisk som player.dat) → vores egenskab; de 18 interne (CM_INT_OFFSETS) står i Player.cmInt */
export const REC_KEYS: [number, string][] = [
  [0x1b, 'acceleration'], [0x1c, 'aggression'], [0x1d, 'agility'], [0x1e, 'anticipation'], [0x1f, 'balance'], [0x20, 'bravery'], [0x21, 'consistency'],
  [0x22, 'corners'], [0x23, 'crossing'], [0x24, 'decisions'], [0x25, 'dirtiness'], [0x26, 'dribbling'], [0x27, 'finishing'], [0x28, 'flair'],
  [0x29, 'freeKicks'], [0x2a, 'handling'], [0x2b, 'heading'], [0x2c, 'importantMatches'], [0x2d, 'injuryProneness'], [0x2e, 'jumping'], [0x2f, 'influence'],
  [0x31, 'longShots'], [0x32, 'marking'], [0x33, 'offTheBall'], [0x34, 'naturalFitness'], [0x35, 'oneOnOnes'], [0x36, 'pace'], [0x37, 'passing'],
  [0x38, 'penalties'], [0x39, 'positioning'], [0x3a, 'reflexes'], [0x3c, 'stamina'], [0x3d, 'strength'], [0x3e, 'tackling'], [0x3f, 'teamwork'],
  [0x40, 'technique'], [0x41, 'throwIns'], [0x42, 'versatility'], [0x43, 'creativity'], [0x44, 'workRate'],
];
const s8 = (v: number) => (v << 24) >> 24;
const INT_AT = new Map<number, number>(CM_INT_OFFSETS.map((o, j) => [o, j]));

/** Player → spillerposten (de 22 ikke-interne som de viste heltal, de 18 interne fra cmInt; positionerne som recordRatings i aiTeam.ts) */
export function recOf(p: Player): CmRec {
  const b = new Array(0x46).fill(0);
  for (let k = 0; k < 8; k++) b[0x0f + k] = p.pos[k] | 0;
  b[0x17] = p.side[2] | 0; b[0x18] = p.side[0] | 0; b[0x19] = p.side[1] | 0; b[0x1a] = p.cmFree ?? 1;
  for (const [o, k] of REC_KEYS) {
    const j = INT_AT.get(o);
    b[o] = j !== undefined && p.cmInt ? s8(p.cmInt[j]) : Math.round(p.attrs[ATTRS.indexOf(k as never)] ?? 0);
  }
  const m = p.cmRepMem ?? [p.rep * 2, p.rep * 2, p.rep * 2];
  return { ca: Math.trunc(p.ca), pa: Math.trunc(p.pa), rep: [Math.round(m[0] * 50), Math.round(m[1] * 50), Math.round(m[2] * 50)], b };
}
/** spillerposten tilbage i Player (CA, omdømmet, de 40 egenskaber; de viste af de interne – cmIntSync) */
export function recInto(g: GameState, p: Player, r: CmRec): void {
  // originalen klemmer ikke CA her (0x5d48a0 + rand(T) kan i yderste fald gå under 1) – spillet kræver CA ≥ 1
  p.ca = Math.max(1, r.ca);
  p.cmRepMem = [r.rep[0] / 50, r.rep[1] / 50, r.rep[2] / 50];
  for (const [o, k] of REC_KEYS) {
    const j = INT_AT.get(o);
    if (j !== undefined && p.cmInt) p.cmInt[j] = s8(r.b[o]);
    else if (j === undefined) p.attrs[ATTRS.indexOf(k as never)] = r.b[o];
  }
  cmIntSync(g, p);
}

// ------------------------------------------------------------------------------------------------ TRAINING_MANAGER

/** træningsposten (6 bytes): skemaet +0, ugen +1 (word), effekterne +3/+4/+5 */
export interface CmTrainEntry { s: number; w: number; b3: number; b4: number; b5: number }
/** 0x8b3c50: målmænd (GK ≥ 15) på målmandsskemaet 6, de øvrige på det generelle 1; uge 0 og ingen effekter */
export const newTrainEntry = (gk: number): CmTrainEntry => ({ s: gk >= 15 ? 6 : 1, w: 0, b3: 0, b4: 0, b5: 0 });
const lo4 = (b: number) => s8((b & 0xf) << 4) >> 4;
const hi4 = (b: number) => s8(b) >> 4;
/** område k's effekt (signed nibble) */
export function nibble(e: CmTrainEntry, k: number): number {
  return k === 0 ? lo4(e.b3) : k === 1 ? hi4(e.b3) : k === 2 ? lo4(e.b4) : k === 3 ? hi4(e.b4) : lo4(e.b5);
}
function setNibble(e: CmTrainEntry, k: number, v: number): void {
  const n = v & 0xf;
  if (k === 0) e.b3 = (e.b3 & 0xf0) | n; else if (k === 1) e.b3 = (e.b3 & 0x0f) | (n << 4);
  else if (k === 2) e.b4 = (e.b4 & 0xf0) | n; else if (k === 3) e.b4 = (e.b4 & 0x0f) | (n << 4);
  else e.b5 = (e.b5 & 0xf0) | n;
}
/** 0x8b2be0's egenskaber pr. område: [offset, intern (±6·trin, ±125) eller 1..20 (±trin)] */
const AREA: [number, boolean][][] = [
  [[0x1b, false], [0x1d, false], [0x2e, false], [0x34, false], [0x36, false], [0x3a, true], [0x3c, false], [0x3d, false]],          // 0: fysik (+3 lav)
  [[0x24, true], [0x32, true], [0x33, true], [0x3f, false], [0x39, true]],                                                           // 1: taktik (+3 høj)
  [[0x27, true], [0x31, true], [0x38, true]],                                                                                       // 2: afslutning (+4 lav)
  [[0x22, false], [0x23, true], [0x26, true], [0x29, false], [0x2b, true], [0x37, true], [0x3e, true], [0x40, false], [0x41, true]], // 3: teknik (+4 høj)
  [[0x2a, true], [0x35, true]],                                                                                                     // 4: målmand (+5 lav)
];
/** 0x8b2be0 TRAINING_MANAGER::apply_training_progress(staff, deltas[5]) – områderne i originalens rækkefølge 3, 0, 2, 1, 4: trinnet = trunc(ny/2) −
 *  trunc(gammel/2) lægges på (1..20-egenskaber ±trin, de interne ±6·trin inden for ±125), og den nye effekt gemmes (4 bit). Positionstræningen
 *  (0x8b31a0–0x8b33a8, menneskets positionsskemaer) er ikke porteret. */
export function applyTraining(r: CmRec, e: CmTrainEntry, d: readonly number[]): void {
  for (const k of [3, 0, 2, 1, 4]) {
    const dk = s8(d[k]);
    if (!dk) continue;
    const o = nibble(e, k), n = o + dk;
    const step = s8(Math.trunc(n / 2) - Math.trunc(o / 2));
    if (step) for (const [off, int] of AREA[k]) {
      const v = s8(r.b[off]) + (int ? 6 * step : step);
      r.b[off] = int ? (v < -125 ? -125 : v > 125 ? 125 : v) : (v < 1 ? 1 : v > 20 ? 20 : v);
    }
    setNibble(e, k, o + dk);
  }
}
/** 0x8b3640(staff, 0): effekterne trækkes fra (de gemmes i 0xde1f3c..0xde1f40); (staff, 1) lægger de gemte på igen – omkring 0x538bc0 */
export function removeTraining(r: CmRec, e: CmTrainEntry): number[] {
  const saved = [0, 1, 2, 3, 4].map((k) => nibble(e, k));
  applyTraining(r, e, saved.map((v) => s8(-v)));
  return saved;
}
/** 0x538bc0 (staff_normalise_player_attributes) på spillerposten: 0x8b3640(0), re-centreringen af de 18 interne (playerInit.ts sub_538bc0), 0x8b3640(1) */
export function normaliseRec(r: CmRec, e: CmTrainEntry | null): void {
  const saved = e ? removeTraining(r, e) : null;
  const ints = CM_INT_OFFSETS.map((o) => s8(r.b[o]));
  normaliseInternals(ints, s8(r.b[0x0f]));
  CM_INT_OFFSETS.forEach((o, j) => { r.b[o] = s8(ints[j]); });
  if (e && saved) applyTraining(r, e, saved);
}

/** skemaets fem niveauer (+4..+8): 0x8b3d40/0x8b4e50's faste typer (cmFitness.ts PRESET) */
export const SCHEDULE_LEVELS: Record<number, number[]> = {
  0: [0, 0, 0, 0, 0], 1: [25, 25, 25, 25, 0], 2: [50, 10, 10, 10, 0], 3: [10, 50, 10, 10, 0], 4: [10, 10, 50, 10, 0], 5: [10, 10, 10, 50, 0], 6: [10, 10, 0, 10, 50], 7: [0, 0, 0, 0, 0],
};
export interface TrainIn {
  /** skemaets niveauer (0x8b39f0: skadet med status 2 → TM+0 "No Training", ellers skemaet; menneskets skemaer *estimeret* via vores programmer) */
  levels: readonly number[];
  /** 0x8b41d0(klub, område): 100 for computerens klubber; menneskets af trænernes fordeling (ikke porteret – 100, *estimeret*) */
  coach: (k: number) => number;
  /** staff +0x5b Professionalism, +0x58 Determination; spillerposten +0x0f målmandsevnen */
  prof: number; det: number; gk: number;
  /** klubbens manager er et menneske (0x8b188d: postens +5 bit 0x20; uden den nulstilles skemaet til 1/6 – 0x8b1cbc) */
  human: boolean;
}
/** 0x8b1750 TRAINING_MANAGER::update_player_training(staff, 0) – de uger, der er gået (højst 30): pr. område et mål t = 2·niveau + 60 + (træner −
 *  100)/5 (0..200); hver uge (målmænd med evne > 18: kun hver 2./4. uge, rand) med t > 100 og rand(210 − t) < 20 og effekten under
 *  Determination/3: rand(2|v| + 14) < 10 → +1; ellers med t < 110, rand(t + 60) < 20, effekten > −7 og over Professionalism/3 − 6: samme → −1.
 *  Bagefter 0x8b2be0 med ændringerne. (Menneskets skemaflag +5 bit 0x20, træningsbelastningen 0x62c660 – cmFitness.ts – og positionstræningen
 *  0x8b4b20/0x8b4450/0x8b4770 er ikke med her.) */
export function trainCore(r: CmRec, e: CmTrainEntry, week: number, i: TrainIn, rand: (n: number) => number): boolean {
  if (i.human) e.b5 |= 0x20;                                                   // 0x8b198e (menneskets skema vælges – vores program, se cmTrainPlayer)
  let days = (week - e.w) & 0xffff;
  if (days === 0) return false;                                                // 0x8b1be0 (uden positionsmaske)
  if (e.b5 & 0x20 && !i.human) { e.b5 &= 0xdf; e.s = i.gk >= 15 ? 6 : 1; }     // 0x8b1cbc: forlod menneskets klub (belastningen 50: cmFitness.ts)
  if (days > 30) days = 30;                                                    // 0x8b1d3a (ord uden fortegn)
  e.w = week & 0xffff;
  const d = [0, 0, 0, 0, 0];
  const profT = s8(Math.trunc(i.prof / 3) - 6), detT = s8(Math.trunc(i.det / 3));
  for (let k = 0; k < 5; k++) {
    let t = 2 * s8(i.levels[k]) + 60 + Math.trunc((i.coach(k) - 100) / 5);
    t = (t << 16) >> 16;
    t = t < 0 ? 0 : t > 200 ? 200 : t;
    const n = nibble(e, k);
    for (let w = 0; w < days; w++) {
      const v = s8(n + d[k]);
      if (i.gk > 18 && rand(k === 4 ? 2 : 4) !== 0) continue;                 // 0x8b1ebf
      if (t > 100 && rand(210 - t) < 20 && v < detT) {                         // 0x8b1ef2
        if (rand(2 * Math.abs(v) + 14) < 10) d[k] = s8(d[k] + 1);
        continue;
      }
      if (t < 110 && rand(t + 60) < 20 && v > -7 && v > profT) {               // 0x8b1f36
        if (rand(2 * Math.abs(v) + 14) < 10) d[k] = s8(d[k] - 1);
      }
    }
  }
  applyTraining(r, e, d);
  return true;
}

// ------------------------------------------------------------------------------------------------ i spillet

const coach100 = () => 100;
/** vores træningsprogram → originalens skematype (som cmFitness.ts SCHEDULE_PRESET) – menneskets skemaer *estimeret* */
const PRESET_OF: Record<string, number> = { general: 1, fitness: 2, defending: 3, ballcontrol: 4, tactics: 3, attacking: 5, shooting: 5, setpieces: 4, goalkeeping: 6, rest: 0 };

/** hvad 0x8b1750 får fra resten af spillet (cmFitnessGame.ts sætter skadestatus 0x62c400; humans = menneskets klubber) */
export interface TrainCtx { injured: (p: Player) => boolean; human: (club: number) => boolean; rand: (p: Player, salt: number) => (n: number) => number }
let tctx: TrainCtx | null = null;
export function setTrainCtx(c: TrainCtx): void { tctx = c; }

export function cmTrainOn(g: GameState, p: Player): boolean {
  // fyldspillerne (cmVirtual.ts) har ingen TRAINING_MANAGER-post – de laves på ny til hver kamp (*estimeret*)
  return !!p.cmInt && !p.regen && !p.virtual && cmActive(g);
}
/** 0x8b1750(staff, 0) for én spiller i spillet; salt adskiller kaldestederne i vores egen talrække */
export function cmTrainPlayer(g: GameState, p: Player, salt: number): void {
  if (!tctx || !cmTrainOn(g, p)) return;
  const e = (p.cmTrain ??= newTrainEntry(p.pos[0]));
  const week = g.cmTrainWeek ?? 0;
  if (((week - e.w) & 0xffff) === 0) return;
  const human = !!p.club && tctx.human(p.club);
  // 0x8b39f0: skadet (status 2) → skema 0; menneskets klub: managerens skema (vores program); ellers postens skema (1 eller 6)
  const type = tctx.injured(p) ? 0 : human && p.training ? PRESET_OF[p.training] ?? e.s : e.s;
  const r = recOf(p);
  const A = (k: string) => Math.round(p.attrs[ATTRS.indexOf(k as never)] ?? 10);
  if (trainCore(r, e, week, { levels: SCHEDULE_LEVELS[type] ?? SCHEDULE_LEVELS[1], coach: coach100, prof: A('professionalism'), det: A('determination'), gk: r.b[0x0f], human },
    tctx.rand(p, salt))) recInto(g, p, r);
}
/** MATCH_PLAYER::setup (0x6eb045): begge kamptrupper */
export function cmTrainSquads(g: GameState, ids: number[], fixture: number): void {
  if (!cmActive(g)) return;
  for (const id of ids) { const p = g.players[id]; if (p) cmTrainPlayer(g, p, 0x6eb045 ^ fixture); }
}
/** 0x8b1730 (efter 0x5ce2d0, 0x5cda8a): ugetælleren TM+0x688d tælles op på dage med dag-i-året % 7 = 0 */
export function cmTrainWeekTick(g: GameState, doy: number): void {
  if (doy % 7 === 0) g.cmTrainWeek = ((g.cmTrainWeek ?? 0) + 1) & 0xffff;
}
