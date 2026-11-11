// Kilde: cm-01-02-bosman-edition/app/identical/4_match_loop/match_loop.ts (kopieret 2026-11-09).
// Porteret af Bosman-projektet; ændringer: ubrugte parametre omdøbt til _rand/_m (strenge tsconfig).
// Gittermotoren (gridMatch.ts) er et laboratorium ved siden af MatchSim – ikke koblet ind i spillet.
/**
 * CM 01/02 match loop (section 4) – readable TypeScript port of what was read in cm0102.exe.
 * See MATCH_LOOP.md for the explanation and the sikkert / gættet / ukendt list.
 *
 * Covered: the tick loop sub_6b98c0, action order sub_6bd760, per-tick rolls sub_6f44a0/sub_6f55c0,
 * offside lines sub_6c3aa0, chasers sub_6c30e0, marking assignment, sub_7103e0 (a player's turn),
 * off-ball movement with the ball (sub_713fc0) and without (sub_714d40), loose ball sub_6bbe40,
 * ball out of play sub_6cd490, counter-attack flag sub_6bd6b0.
 * NOT covered (TODO, injected as hooks): sub_7109f0 (ball_carrier/), sub_6f09f0 step/duels,
 * sub_6fad40 pass, sub_6fa490 lofted, sub_70ec80 hold, sub_6bc030 zonal pick, sub_6bce80 run target,
 * sub_6c2be0 tactical cell, set pieces, sub_6be710 shoot-out, rating upkeep sub_6f4aa0.
 *
 * Addresses in comments are instruction addresses in cm0102.exe (image base 0x400000).
 */

// ------------------------------------------------------------------ basics

/** sub_90cfc0: 0..n-1; n <= 0 → 0 here (n < 0 behaves as n+1..0 in the original). */
export type Rand = (n: number) => number;
const ftol = (x: number) => Math.trunc(x); // sub_945640

/** Distance table float[12][9] at 0xa15e44, index [|dy|][|dx|] (sub_6f09b0). Hand-typed in the original. */
export const DIST: number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8],
  [1, 1.41, 2.23, 3.16, 4.12, 5.09, 6.08, 7.07, 8.06],
  [2, 2.23, 2.82, 3.6, 4.47, 5.38, 6.32, 7.28, 8.24],
  [3, 3.16, 3.6, 4.24, 5, 5.56, 6.7, 7.61, 8.3],
  [4, 4.12, 4.47, 5, 5.65, 6.4, 6.9, 8.06, 8.94],
  [5, 5.09, 5.38, 5.56, 6.4, 7.07, 7.81, 8.54, 9.4],
  [6, 6.08, 6.32, 6.7, 6.9, 7.81, 8.48, 9.21, 10],
  [7, 7.07, 7.28, 7.61, 8.06, 8.54, 9.21, 9.89, 10.6],
  [8, 8.06, 8.24, 8.3, 8.94, 9.4, 10, 10.6, 11.3],
  [9, 9.05, 9.21, 9.48, 9.84, 10.2, 10.7, 11.4, 12.1],
  [10, 10.04, 10.1, 10.4, 10.7, 11.1, 11.6, 12.2, 12.8],
  [11, 11.04, 11.1, 11.4, 11.7, 12, 12.5, 13, 13.6],
];
export const dist = (x1: number, y1: number, x2: number, y2: number) =>
  DIST[Math.abs(y1 - y2)][Math.abs(x1 - x2)];

export type Side = 0 | 1; // side 0 defends y=0 and attacks (4,11)

/** Action codes at match-player +0x198 (values sikkert, names gættet). */
export const ACT = {
  none: 0xffff, rest: 0x67, toPosition: 0x68, loseMarker: 0x69, runIntoSpace: 0x6a,
  backOnside: 0x6b, keeperToPosition: 0x71, stay: 0x76, coverGoalLine: 0x78, stepUp: 0x7a,
  chaseBall: 0x100, keeperGathers: 0x103, actAgain: 0x104, followMan: 0x105,
  runWithBall: 0x11, runWithBall2: 0x12,
} as const;

/** Position flag word (sub_6c38c0); meanings gættet except keeper. */
export const POS = { keeper: 0x1, def2: 0x2, def4: 0x4, mid8: 0x8, mid10: 0x10, mid20: 0x20,
  wingRole: 0x78, forward: 0x40, left: 0x80, right: 0x800, grp100: 0x100, grp200: 0x200, grp400: 0x400 } as const;

/** Team flags at match+0x9766 per side (bits from cm0102-original-rules.ts; "on" bit inferred). */
export const TEAM = { pressing: 0x100, offsideTrap: 0x400, counterAttack: 0x1000, menBehindBall: 0x4000 } as const;

export interface Player {
  side: Side; slot: number; active: boolean;      // +0x27, +0x19 (>=0)
  x: number; y: number;                           // +0x102, +0x103
  action: number;                                 // +0x198
  rating: number;                                 // +0x35 (x1000)
  condition: number;                              // +0x4d 0..10000
  pendingCond: number;                            // +0x59
  busy: number;                                   // +0x2b
  matchCA: number;                                // +0x3b
  form: number;                                   // +0x37 = position adaptation (≤ 0, smaller with Versatility) – rettelse 6, not form
  morale: number;                                 // +0x17
  injury: number;                                 // +0x1 (>50 = injured, gættet)
  agitation: number;                              // +0x1a2 (gættet)
  pos: number;                                    // sub_6c38c0 flags
  tacticByte: number;                             // tactics +0x5b4+slot (bit 4 = man-mark X)
  instr: bigint;                                  // 64-bit individual instructions (sub_5b5270)
  freeRoleRating: number;                         // record +0x1a
  a: Attr;                                        // match floats (sub_6ec010)
  cap: Caps;                                      // +0x10e..+0x117
  roll: Rolls;                                    // +0x104..+0x10d
  marks: Player | null;                           // +0x1aa
  markers: Player[];                              // +0x1ae[3], count +0x101
  /** sub_5b58e0(slot): mandsopdækningens mål i taktikken (sammenlignes med modstandernes +0x69) – kun med taktikbyte bit 4 */
  markRef?: unknown;
  /** +0x69: spillerens reference (staff), som taktikkens mandsopdækning peger på */
  ref?: unknown;
  /** sub_6c38f0: positionsordet i angreb (0 = som pos) */
  posAttack?: number;
  /** agitationens gulv 2·(25 − Temperament) (0x6eb0bd) – henfaldet i sub_6f4aa0 kræver det */
  agFloor?: number;
  /** +0xff ophidselses-tælleren og dens grundværdi trunc((trunc(motivation/2) + Dirtiness + 10)/4) (0x6ebcb6) */
  temperCount?: number;
  bffBase?: number;
}
export interface Attr { acceleration: number; anticipation: number; decisions: number; flair: number;
  jumping: number; marking: number; offTheBall: number; pace: number; positioning: number;
  tackling: number; teamwork: number; creativity: number; workRate: number; agility: number; versatility: number; }
export interface Caps { pace: number; decisions: number; positioning: number; offTheBall: number; marking: number;
  flair: number; creativity: number; anticipation: number; workRate: number; agility: number; }
export interface Rolls { pace: number; anticipation: number; decisions: number; offTheBall: number; marking: number;
  flair: number; positioning: number; creativity: number; agility: number; workRate: number; }

export interface Match {
  players: Player[];                      // both sides
  ballX: number; ballY: number;           // +0x8ea7/+0x8ea8
  ballH: number;                          // +0x8ea9 (−1..5, height gættet)
  ballSpeed: number;                      // +0x8eaa
  ballDir: number;                        // +0x8ed8 degrees
  lastTouch: Side;                        // +0x8eab
  poss: Side | -1;                        // +0x8eae
  state: number;                          // +0x8eb2 restart (2 throw 3 corner 4 GK 5 pen 6 FK 7 IFK 8 KO)
  shootout: number;                       // +0x8eb3
  clock: number;                          // +0x8ed0 ticks
  stoppage: number;                       // +0x8eb7
  subTick: number;                        // +0x8ed2
  paused: boolean;                        // +0x1a8
  carrier: Player | null;                 // +0xf582
  receiver: Player | null;                // +0xf57a (intended receiver)
  chaser: [Player | null, Player | null]; // +0xf586 / +0xf58a
  keeperOut: [boolean, boolean];          // +0x8eac / +0x8ead (sub_6c3010, not read)
  lineSide1: number;                      // +0x8eaf
  lineSide0: number;                      // +0x8eb0
  counterFlag: [boolean, boolean];        // match+6+side
  teamFlags: [number, number];            // +0x9766 per side
  aiMode: [number, number];               // +0x1ab+side (5 = slow down when well ahead – rettelse 3, PROMPT_FOR_CM_REBORN.md)
  touchCount: [number, number];           // +0x8d46+side (raised by last touch, gættet)
  loftCountdown: number;                  // +0x1c5 boldens flyvetid i spillerture (sub_6fad40 §6.4)
  passTo?: Player | null;                 // +0x477e spilleren, bolden er på vej til
  landX?: number; landY?: number;         // +0x1c6/+0x1c7 landingsfeltet
  fromX?: number; fromY?: number;         // +0x1c8/+0x1c9 afleverens felt
  margin?: number;                        // +0x8ed6 afleveringens kvalitet (sub_6f6c00's passPower)
  /** taktik +0x187b (formationskoden, dword) og engine+0xaf+side ("?") – læses af mandsopdækningen sub_7160f0 */
  formationWord?: [number, number];
  bAf?: [number, number];
  order: Player[];                        // +0x8f7e / count +0x8eb8
  prio: Player | null;                    // +0x91de
  /** engine+0x4782/+0x4786 og +0xf5aa/+0xf5a6 (se GridMatchState) – valgfri her (testenes Match-literaler); tikket rydder modtageren */
  x4782?: number; x4786?: number; passRecv?: Player | null; passGiver?: Player | null;
  /** engine+0x1a7: modtageren spillede bolden første gang (sub_6f6c00 0x6f9c9d) */
  firstTime?: number;
}

/** Hooks for functions not ported here. */
export interface Hooks {
  ballCarrier(p: Player): void;                                  // sub_7109f0(p,0) – ball_carrier/
  moveTo(p: Player, x: number, y: number, flags: number): void;  // sub_6f09f0(p,x,y,flags,0,0) TODO
  place(p: Player, x: number, y: number): void;                  // sub_6f46b0
  tacticalCell(p: Player): [number, number];                     // sub_6c2be0(p,..,1) + sub_715f50(x) TODO (sect. 2)
  formationCell(p: Player): [number, number];                    // sub_6c2a40 TODO
  runTarget(p: Player, mode: number): [number, number] | null;   // sub_6bce80 TODO (sect. 2)
  zonalPick(p: Player): Player | null;                           // sub_6bc030 TODO
  manMarkTarget(p: Player): Player | null;                       // sub_7160f0
  backOnside(p: Player): void;                                   // sub_6f5b80 TODO
  takeBall(p: Player): void;                                     // sub_6f0630
  turn(p: Player, x: number, y: number): void;                   // sub_6f4920
  canFollow(m: Player, x: number, y: number): boolean;           // sub_6bce20 (needs sub_6f4600)
  teammatesAhead(p: Player): number;                             // sub_6cb700(y, side, 1)
  nearestOppDist(side: Side, x: number, y: number): number;      // sub_6c3950(side,x,y,1)
  ownKeeper(side: Side): Player | null;                          // sub_6ce110
  restartTick(): void;                                           // sub_6c54a0 TODO
  /** den ventende hændelse (fordel) pr. tik, 0x6b9cb1–0x6b9db5: true = dommeren dømte, tikket slutter (0x6ba743) */
  incidentTick?(): boolean;
  /** run_match_steps 0x6b9aea–0x6b9cab: engine+0x8eb4 og sub_6d1210 (optøjer ved død bold). true = tikket slutter (0x6ba743) */
  deadBallTemper?(): boolean;
  /** sub_6d0b60 ved død bold efter en tur, når engine+0x8eb5 er sat (0x6ba73e) */
  treatInjured?(): void;
  pickTaker(side: Side, state: number): Player;                  // sub_6ceb90 TODO
  periodCheck(): 0 | 1 | 2 | 3 | 4;                              // sub_6bd930
  ballOut(lastTouch: Side): void;                                // sub_6cd490 (ported below as ballOutOfPlay)
  /** sub_6d6f70 Match_Events::add_event(id, eng, p1, side1, p2, side2, extra) – p1/p2 = spilleren (+0x2e) eller null (−1); side1 mangler = p1's side */
  comment(id: number, p1?: Player | null, side1?: number, p2?: Player | null, side2?: number, extra?: number): void;
  /** offside dømt mod `side` (team +0xf5ca+54·side ++) */
  offsideGiven?(side: Side): void;
  distToTarget(bx: number, by: number, tx: number, ty: number): number; // sub_6cc4e0 TODO
  landing?(x: number, y: number): void;                          // sub_6c9cd0 (gridMatch: pass.ts)
  receive?(p: Player, power: number, ox: number, oy: number): void; // sub_6f6c00 (gridMatch: pass.ts)
  /** kun fejlsøgning/spor: kaldes efter tikkets første sub_6c3aa0 (0x6ba01e), hvor originalens kampspor læser tilstanden */
  topOfTick?(): void;
}

// ------------------------------------------------------------------ geometry helpers (sikkert)

/** sub_6cb960(side,x,y): (x,y) in side's own penalty area. */
export const inOwnBox = (side: Side, x: number, y: number) =>
  x >= 2 && x <= 6 && (side === 1 ? y >= 10 && y <= 11 : y >= 0 && y <= 1);
/** sub_6cb930(side,y): side's own third (BALL_CARRIER.md). */
export const inOwnThird = (side: Side, y: number) => (side === 0 ? y < 3 : y > 8);
/** sub_714d00: in own half. */
export const inOwnHalf = (p: Player) => (p.side === 1 ? p.y >= 6 : p.y < 6);
const goalLine = (s: Side) => (s === 0 ? 11 : 0); // line the side attacks

/** sub_6c3aa0: offside lines. 0x6c3de3, 0x6c4118 */
export function offsideLines(m: Match): void {
  let max1 = 6, min0 = 5;
  for (const p of m.players) {
    if (!p.active || p.pos === POS.keeper) continue;
    if (p.side === 1 && p.y > max1) max1 = p.y;
    if (p.side === 0 && p.y < min0) min0 = p.y;
  }
  m.lineSide1 = max1 + 1;
  m.lineSide0 = min0 - 1;
}
/** sub_6c4180(side,y): ≥0 = beyond the opponents' line. */
export const beyondLine = (m: Match, side: Side, y: number) => (side === 1 ? m.lineSide0 - y : y - m.lineSide1);
/** sub_6c4130(p): 0 for the carrier. */
export const offsidePos = (m: Match, p: Player) => (p === m.carrier ? 0 : beyondLine(m, p.side, p.y));
/** sub_6ea760 core test. */
export const isOffside = (m: Match, side: Side, ry: number) =>
  side === 0 ? ry > m.ballY && ry >= m.lineSide1 : ry < m.ballY && ry <= m.lineSide0;

/** sub_6cd660 + sub_6cd5f0: is p the deepest outfield player of his side? */
export function isLastMan(m: Match, p: Player): boolean {
  const mates = m.players.filter((q) => q.active && q.side === p.side && q.pos !== POS.keeper);
  if (p.side === 0) return p.y <= Math.min(12, ...mates.map((q) => q.y));
  return p.y >= Math.max(-1, ...mates.map((q) => q.y));
}

/** sub_6c30e0(side,x,y,allowBusy): nearest outfield player; distance 0 returns at once. */
export function nearest(m: Match, side: Side, x: number, y: number, allowBusy: boolean): Player | null {
  let best: Player | null = null, bd = 5000; // 0x968db0
  for (const p of m.players.filter((q) => q.side === side)) { // slot order 0..19
    if (!p.active || p.pos === POS.keeper) continue;
    if (!allowBusy && p.busy > 1) continue;
    const d = dist(p.x, p.y, x, y);
    if (d === 0) return p;
    if (d < bd) { bd = d; best = p; }
  }
  return best;
}
/** sub_6c3010(k, x, y) (sikker, 0x6c3010–0x6c30d5): står målmanden k nærmest (x, y) af sit hold? Afstanden d = sub_6f09b0; en
 *  holdkammerat (slot ≥ 0, ikke k, ikke optaget: +0x2b = 0) tættere på → nej; lige så tæt → nej for en målmand (sub_717410 == 1 – en
 *  markspiller vinder uafgjort). En markspiller, der står på feltet (d = 0), er altid nærmest. Resultatet er engine+0x8eac/+0x8ead. */
export function keeperNearest(m: Match, k: Player | null, x: number, y: number): boolean {
  if (!k) return false;
  const d = dist(k.x, k.y, x, y), gk = k.pos === POS.keeper;
  if (d === 0 && !gk) return true;                                                  // 0x6c3038–0x6c3050
  for (const q of m.players) {
    if (q.side !== k.side || !q.active || q === k || q.busy !== 0) continue;        // 0x6c306f–0x6c307f
    const dq = dist(q.x, q.y, x, y);
    if (dq < d || (gk && dq === d)) return false;                                   // 0x6c309b / 0x6c30b7
  }
  return true;
}
/** sub_6cfda0: is p his side's chaser (keeper: keeper-out flag). */
export const isChaser = (m: Match, p: Player) =>
  p.pos === POS.keeper ? m.keeperOut[p.side] : m.chaser[p.side] === p;

// ------------------------------------------------------------------ rolls (sikkert)

/** Caps written at player setup, 0x6ef5af–0x6ef840. `form` already adjusted (see md §4). */
export function rollCaps(p: Player): Caps {
  const f3 = Math.trunc(p.form / 3); // signed /3 via 0x55555556
  const c = (v: number) => Math.max(ftol(Math.max(v, 2)), 2);
  return {
    pace: c(p.a.pace + 4),                                  // +0x10e
    positioning: c(f3 + p.a.positioning + 4),               // +0x110
    offTheBall: c(f3 + 0.9 * p.a.offTheBall + 5),           // +0x111
    marking: c(f3 + p.a.marking + 4),                       // +0x112
    flair: c(0.05 * (p.morale + p.a.flair - 10) ** 2),      // +0x113
    creativity: c(f3 + 0.8 * p.a.creativity + 5),           // +0x114
    anticipation: c(f3 + p.a.anticipation + 5),             // +0x115
    workRate: c(p.a.workRate + 2),                          // +0x116
    agility: c(p.a.agility + 5),                            // +0x117 ([+0x79])
    decisions: c(p.a.decisions + 2),                        // +0x10f
  };
}
/** sub_6f44a0. */
export function rollTick(p: Player, rand: Rand): void {
  const max2 = (n: number) => Math.max(rand(n), rand(n));
  const cp = ftol(p.condition * 0.0025) + p.cap.pace - 25;   // 0x6f44a7 (0x96d758)
  p.roll.pace = max2(cp);                                     // +0x104
  p.roll.positioning = max2(p.cap.positioning);               // +0x10a
  p.roll.offTheBall = rand(p.cap.offTheBall);                 // +0x107
  p.roll.marking = rand(p.cap.marking);                       // +0x108
  p.roll.flair = rand(p.cap.flair);                           // +0x109
  p.roll.creativity = max2(p.cap.creativity);                 // +0x10b
  p.roll.decisions = max2(p.cap.decisions);                   // +0x106
  p.roll.anticipation = rand(p.cap.anticipation);             // +0x105
  p.roll.workRate = rand(p.cap.workRate);                     // +0x10d
  p.roll.agility = rand(p.cap.agility);                       // +0x10c
}
/** sub_6f55c0: rolls + once-a-minute (1/11) condition update. (+0xff part omitted: TODO meaning.) */
export function playerTick(p: Player, rand: Rand): void {
  rollTick(p, rand);
  if (rand(11) !== 0) return;                                  // 0x6f55cb
  if (p.temperCount !== undefined && p.bffBase !== undefined && p.temperCount > p.bffBase) p.temperCount--;   // +0xff henfalder mod grundværdien
  p.condition += p.pendingCond;                                // 0x6f5613
  p.pendingCond = p.pendingCond === 1 ? 0 : p.pendingCond * 0.5;
  if (p.injury > 50) p.condition -= Math.min(0.25 * (p.injury - 50) ** 1.25, 25); // 0x6f564e
  p.condition = Math.min(10000, Math.max(1, p.condition));
}

// ------------------------------------------------------------------ order (sikkert)

/** sub_6bd760 + comparator sub_6bd840. NB the original uses MSVC qsort (unstable). */
export function buildOrder(m: Match, rand: Rand): Player[] {
  const list: Player[] = [];
  // ydelse: den første spiller med (side, plads) som m.players.find – slået op én gang i stedet for 40 gennemløb
  const bySlot: (Player | undefined)[] = new Array(40);
  for (const q of m.players) if (q.slot >= 0 && q.slot < 20 && !bySlot[q.side * 20 + q.slot]) bySlot[q.side * 20 + q.slot] = q;
  for (let i = 0; i < 20; i++) {
    const s = rand(2) as Side;                                 // 0x6bd773
    const p0 = bySlot[s * 20 + i]; if (p0?.active) list.push(p0);
    const p1 = bySlot[(1 - s) * 20 + i]; if (p1?.active) list.push(p1);
  }
  const keys = new Map<Player, number>();
  for (const p of list) keys.set(p, ftol((p.roll.pace + p.roll.anticipation) * (0.005 * p.matchCA + 0.5) * p.condition));
  list.sort((a, b) => {
    if (m.state !== 0 && a === m.carrier) return -1;
    if (m.state !== 0 && b === m.carrier) return 1;
    if (m.prio === a) return -1;
    if (m.prio === b) return 1;
    return keys.get(b)! - keys.get(a)!;
  });
  return list;
}

// ------------------------------------------------------------------ marking (sikkert except zonalPick)

/**
 * Markeringsrunden i sub_6b98c0 (0x6ba140–0x6ba345, sikker – gennemgået i asm 11/11). Alle i handlingsrækkefølgen får +0x1aa = 0 og
 * +0x101 = 0 først. Derefter, i rækkefølgen: taktikbyte bit 1 → ingen; mandsopdækningen sub_7160f0; ellers ikke målmand (sub_717410 == 1)
 * og ikke boldholderen; med "men behind ball" (0x4000) altid zonevalget; ellers springes spilleren over, når hans hold har bolden uden for
 * egen tredjedel, og zonevalget kaldes for forsvarere (0x4/0x2) på egen halvdel, midtbanespillere (0x8/0x10) med bolden i egen
 * tredjedel og for alle, når BOLDEN (ikke spilleren – rettet 11/11) er i eget felt. NB: +0x1aa sættes også, når modstanderen allerede
 * har 3 markører (0x6ba220/0x6ba314) – så står markøren uden at følge (han springer sin tur over, 0x6ba37c), sic.
 */
export function assignMarking(m: Match, h: Hooks): void {
  for (const p of m.order) { p.marks = null; p.markers = []; }
  const ownThird = (s: Side) => (s === 0 ? m.ballY < 3 : m.ballY > 8);
  for (const p of m.order) {
    if (p.tacticByte & 1) continue;                            // 0x6ba1c1 (meaning ukendt)
    let t = h.manMarkTarget(p);
    if (!t) {
      if (p.pos === POS.keeper || p === m.carrier) continue;
      if (m.teamFlags[p.side] & TEAM.menBehindBall) t = h.zonalPick(p);
      else {
        if (m.poss === p.side && !ownThird(p.side)) continue;   // 0x6ba244
        if ((p.pos & (POS.def4 | POS.def2) && inOwnHalf(p)) || (p.pos & (POS.mid8 | POS.mid10) && ownThird(p.side)) || inOwnBox(p.side, m.ballX, m.ballY))
          t = h.zonalPick(p);                                  // 0x6ba276 / 0x6ba297 / 0x6ba2cf
      }
    }
    if (t) { p.marks = t; if (t.markers.length < 3) t.markers.push(p); }
  }
}

/** sub_7160f0 (sikker): mandsopdækningens mål. Kun med taktikbyte bit 4: modstanderen på banen, hvis +0x69 er taktikkens mål. Med bit
 *  0x10 ("?") opgives han, når decisions-rullet ≠ 0 og modstanderens formationsord har bit 0x10000000 eller engine+0xaf+modside > 1,
 *  eller når målets angrebsposition afviger fra hans position uden at være angriber (0x40). */
export function manMarkTarget(m: Match, p: Player): Player | null {
  if (!(p.tacticByte & 4)) return null;
  const opp = (1 - p.side) as Side;
  const t = m.players.find((q) => q.side === opp && q.active && q.ref !== undefined && q.ref === p.markRef);
  if (!t) return null;
  if (!(p.tacticByte & 0x10)) return t;
  if (((m.formationWord?.[opp] ?? 0) & 0x10000000 || (m.bAf?.[opp] ?? 0) > 1) && p.roll.decisions !== 0) return null;
  const pa = t.posAttack ?? t.pos;
  if (pa !== t.pos && !(pa & 0x40) && p.roll.decisions !== 0) return null;
  return t;
}

/** sub_6bce20 (sikker): må markøren følge efter sin mand til (x, y)? Ingen afstandsgrænse – markøren må ikke stå i feltet, ikke være optaget
 *  (busy ≥ 2), ikke være boldholder eller tilsigtet modtager, skal have et markeringsrul ≠ 0 (sub_6f4600: positioneringsrullet, hvis
 *  taktikbyten har bit 2), og bolden skal være i spil. */
export function canFollow(m: Match, mk: Player | null, x: number, y: number): boolean {
  if (!mk || (mk.x === x && mk.y === y) || mk.busy >= 2 || mk === m.carrier || mk === m.receiver) return false;
  if ((mk.tacticByte & 2 ? mk.roll.positioning : mk.roll.marking) === 0) return false;   // sub_6f4600
  return m.state === 0;
}

/** sub_6f4aa0's agitationsdel (sikker): ag = max(ag·0,85, gulv), loft 100 */
export function agitationDecay(p: Player): void {
  if (p.agFloor !== undefined) p.agitation = Math.min(Math.max(Math.fround(p.agitation * Math.fround(0.85)), p.agFloor), 100);
}

/** sub_6bd6b0: counter-attack flag (only for teams with 0x1000). */
export function counterFlag(m: Match, side: Side, rand: Rand): boolean {
  let s = 0;
  for (const q of m.players) {
    if (!q.active || q.side === side) continue;
    if (side === 0 && q.y <= 5) s += 6 - q.y;
    if (side === 1 && q.y >= 6) s += q.y - 5;
  }
  return s > rand(15) + 30;                                    // 0x6bd733
}

// ------------------------------------------------------------------ the loose ball (sikkert)

/** sub_6bbe40 */
export function looseBall(m: Match, rand: Rand, h: Hooks): void {
  if (m.carrier || m.receiver || m.ballSpeed <= 0) return;
  if (m.state !== 0) { m.ballSpeed = 0; m.ballH = 0; return; }
  if (m.ballSpeed < 2 && rand(m.ballSpeed * m.ballSpeed) < rand(2)) return;   // 0x6bbe99
  m.ballSpeed--; if (m.ballH > 0) m.ballH--;
  const a = m.ballDir;
  if (a > 220 && a < 320) m.ballX--;
  else if (a > 40 && a < 140) m.ballX++;
  else if (a > 130 && a < 230) m.ballY--;
  else if (a < 50 || a > 310) m.ballY++;
  if (m.ballX < 0 || m.ballY < 0 || m.ballX >= 9 || m.ballY >= 12) h.ballOut(m.lastTouch);
}

/** sub_6cd490 (read by a helper agent; event ids 0x1f75 corner, 0x1f76 throw, 0x1f77 goal kick). */
export function ballOutOfPlay(m: Match, lastTouch: Side, h: Hooks): boolean {
  if (m.state !== 0) return true;
  m.poss = -1; m.carrier = null;
  // kommentaren (0x6cd4f8/0x6cd527/0x6cd561/0x6cd590/0x6cd5cd): p1 = −1, side1 = holdet, der får bolden
  if (m.ballX < 0 || m.ballX >= 9) { m.poss = lastTouch === 0 ? 1 : 0; m.state = 2; h.comment(0x1f76, null, m.poss); }
  else if (m.ballY < 0) { if (lastTouch === 1) { m.state = 4; m.poss = 0; h.comment(0x1f77, null, 0); } else { m.state = 3; m.poss = 1; h.comment(0x1f75, null, 1); } }
  else if (m.ballY >= 12) { if (lastTouch === 1) { m.state = 3; m.poss = 0; h.comment(0x1f75, null, 0); } else { m.state = 4; m.poss = 1; h.comment(0x1f77, null, 1); } }
  else return false;
  return true;
}

// ------------------------------------------------------------------ a player's turn sub_7103e0 (sikkert)

export function playerTurn(m: Match, p: Player, rand: Rand, h: Hooks): void {
  const markersFollow = () => {
    for (const mk of p.markers)
      if (h.canFollow(mk, p.x, p.y) && p.roll.offTheBall * p.roll.pace <= rand(900) + 50) defendOffBall(m, mk, rand, h); // 0x710612
  };
  const isCarrier = () => m.carrier === p;
  const notKeeper = p.pos !== POS.keeper;
  for (;;) {
    if (!isCarrier() && notKeeper) {
      if (rand(65) + p.condition * 0.0078125 <= rand(10)) { markersFollow(); p.action = ACT.rest; return; } // 0x710408
      const defending = m.poss === (p.side === 0 ? 1 : 0);
      let switchOff = defending;
      if (!defending && m.poss !== p.side) {
        const own = m.receiver && m.receiver.side === p.side;
        switchOff = !own && !(inOwnBox((1 - p.side) as Side, m.ballX, m.ballY) && m.ballH !== -1);
      }
      if (switchOff && rand(20) === 0 && p.roll.workRate === 0) {          // 0x7104cb
        markersFollow(); p.rating -= 15; p.action = ACT.rest; if (!p.busy) p.busy = 1;
        p.condition += rand(5) + 5; return;
      }
      if (m.aiMode[p.side] === 5) {                                         // 0x7104fd
        const D = dist(p.x, p.y, 4, goalLine(p.side));
        if (rand(12) > D && p.roll.workRate < rand(10)) {
          markersFollow(); p.action = ACT.rest; if (!p.busy) p.busy = 1; p.condition += rand(5) + 5; return;
        }
      }
    }
    if (p.busy && !isCarrier()) { markersFollow(); p.action = ACT.rest; return; } // 0x7105a1
    if (isCarrier()) {
      markersFollow();
      h.ballCarrier(p);                                                      // 0x710654
      m.firstTime = 0;                                                       // 0x71065f: engine+0x1a7 = 0 efter boldholderens valg
      if (isCarrier() || p.action === 0x6d || p.busy || m.state !== 0 || p.roll.offTheBall === 0) return;
      if (rand(ftol(p.a.anticipation)) > rand(5)) continue;                  // 0x7106ad "pass and move"
      return;
    }
    // off the ball
    const oppSide = (p.side === 0 ? 1 : 0) as Side;
    if (m.poss === oppSide) return defendOffBall(m, p, rand, h);
    if (m.poss === p.side) return attackOffBall(m, p, rand, h);
    if (m.receiver && m.receiver.side === p.side) return attackOffBall(m, p, rand, h);
    if (inOwnBox(oppSide, m.ballX, m.ballY) && m.ballH !== -1) return attackOffBall(m, p, rand, h);
    return defendOffBall(m, p, rand, h);
  }
}

// ------------------------------------------------------------------ attacking side, off the ball sub_713fc0

const INSTR_FWD_RUNS_A = 0x200000n;   // 0x714278 (meaning gættet)
const INSTR_FWD_RUNS_B = 0x800000n;   // 0x7147a4 (meaning gættet)
const INSTR_CROSS_YES = 0x4n << 32n;  // high dword & 4 (BALL_CARRIER.md)

export function attackOffBall(m: Match, p: Player, rand: Rand, h: Hooks): void {
  const mm = (p.tacticByte & 4) !== 0;
  p.action = ACT.none;
  if (m.ballH === -1 && m.poss !== -1) { const [x, y] = h.formationCell(p); p.action = ACT.toPosition; h.place(p, x, y); return; }
  if (m.poss === -1) {
    if (m.receiver === p && rand(20) + p.roll.offTheBall !== 0) { h.moveTo(p, m.ballX, m.ballY, 0x100); p.action = ACT.chaseBall; return; }
    if (!m.receiver && isChaser(m, p) && m.loftCountdown === 0) { h.moveTo(p, m.ballX, m.ballY, 0x100); p.action = ACT.chaseBall; return; }
  }
  const tryRun = (mode: number, code: number): boolean => {
    const t = h.runTarget(p, mode); if (!t) return false;
    if (code !== ACT.runIntoSpace || mode === 4) p.rating += 7;
    p.action = code; h.moveTo(p, t[0], t[1], -1); return true;
  };
  const loseMarkerTest = () => {
    const v = (2.5 - 0.0002 * p.rating) * (p.markers.length * p.roll.offTheBall); // 0x7141b9/0x7141c2
    return rand(p.pos & POS.forward ? 20 : 50) < v && tryRun(4, ACT.runIntoSpace);
  };
  const finalThird = p.side === 1 ? p.y < 3 : p.y > 8;
  if (finalThird && ((p.x >= 2 && p.x <= 6) || dist(p.x, p.y, m.ballX, m.ballY) > 2)) {
    if (loseMarkerTest()) return;
  } else {
    if (p.instr & INSTR_FWD_RUNS_A && rand(p.freeRoleRating) >= rand(5)) {           // 0x714283
      const t = h.runTarget(p, 12); if (t) { p.action = ACT.runIntoSpace; h.moveTo(p, t[0], t[1], -1); return; }
    }
    if (loseMarkerTest()) return;
  }
  let [tx, ty] = h.tacticalCell(p);                                                    // 0x7143a7
  const ballInOppBox = inOwnBox((1 - p.side) as Side, m.ballX, m.ballY);
  if (p.instr & INSTR_CROSS_YES && p.pos & POS.wingRole && !ballInOppBox) {
    const left = (p.pos & POS.left) !== 0, right = !left && (p.pos & POS.right) !== 0;
    if (p.side === 0) { if (left && m.ballX < 6) [tx, ty] = [0, 11]; else if (right && m.ballX < 2) [tx, ty] = [8, 11]; }
    else { if (left && m.ballX < 2) [tx, ty] = [8, 0]; else if (right && m.ballX < 6) [tx, ty] = [0, 0]; }
  }
  // 0x714643 (sikker): pos & 0x200 → 18 med 0x8, 20 med 0x4, ellers 0 – byten nulstilles ved 0x71464a (`mov [esp+0x13], 0` lige efter
  // `push esi` = rammens [esp+0xf]); uden 0x200 → 16. rand(0) = 0, så en sådan spiller løber frem, når off-the-ball-rullet > 0
  const N = p.pos & POS.grp200 ? (p.pos & POS.mid8 ? 18 : p.pos & POS.def4 ? 20 : 0) : 16;
  const counterOn = (m.teamFlags[p.side] & TEAM.counterAttack) !== 0;
  let forward = false;
  if ((counterOn ? m.counterFlag[p.side] : (p.instr & INSTR_FWD_RUNS_B) !== 0n) && p.roll.offTheBall > rand(N)) forward = true;
  else {
    const ahead = p.side === 0 ? m.ballY > p.y && p.y > 7 : m.ballY < p.y && p.y < 4;
    if (ahead && p.roll.flair !== 0 && h.teammatesAhead(p) < rand(3) + 1) forward = true;          // 0x714731
  }
  if (forward) { tx = Math.trunc((tx + 4) / 2); ty = goalLine(p.side); }
  if (p.roll.offTheBall !== 0) { const d = beyondLine(m, p.side, ty); if (d >= 0) ty = p.side === 0 ? ty - d : ty + d; }
  if (p.marks && p.marks.active) {                                                     // 0x7147ce
    p.action = ACT.followMan;
    let mx = p.marks.x, my = p.marks.y;
    if (p.roll.positioning !== 0) {
      if (!inOwnThird((p.side === 0 ? 1 : 0) as Side, my) && !mm && rand(21) > p.marks.a.jumping) {
        if (p.side === 0 && my > 0) my--; else if (p.side === 1 && my < 11) my++;
        if (mx <= 2) mx++; else if (mx >= 6) mx--;
      }
      h.moveTo(p, mx, my, -1); return;
    }
  }
  const off = offsidePos(m, p);
  if (off >= 0 && rand(5 * off) + p.roll.offTheBall > rand(3)) { p.action = ACT.backOnside; h.backOnside(p); return; } // 0x714945
  const creative = () => (p.roll.offTheBall && tryRun(4, ACT.runIntoSpace)) ||
    (p.markers.length > 0 && !(p.pos & 6) && p.roll.offTheBall && tryRun(4, ACT.loseMarker));
  if (p.x === tx && p.y === ty) {
    if ((p.pos === POS.keeper && p.roll.positioning) || p.roll.positioning === 0 || isLastMan(m, p)) { p.action = ACT.stay; h.moveTo(p, p.x, p.y, -1); return; }
    if (creative()) return;
    p.action = ACT.stay; h.moveTo(p, p.x, p.y, -1); return;
  }
  if (p.roll.flair > rand(ftol(p.a.teamwork + 10)) && creative()) return;              // 0x714b1e
  p.action = ACT.toPosition; h.moveTo(p, tx, ty, -1);
}

// ------------------------------------------------------------------ defending side, off the ball sub_714d40

const INSTR_CLOSE_DOWN = 0x8000n;   // 0x7156e6 (gættet)
const INSTR_CLOSE_DOWN_P = 0x2000n; // 0x715720, together with team pressing (gættet)

export function defendOffBall(m: Match, p: Player, rand: Rand, h: Hooks): void {
  const opp = (p.side === 0 ? 1 : 0) as Side;
  if (m.poss === -1) {
    if (m.receiver === p && rand(20) + p.roll.offTheBall !== 0) { h.moveTo(p, m.ballX, m.ballY, 0x100); p.action = ACT.chaseBall; return; }
    if (!m.receiver && isChaser(m, p) && m.loftCountdown === 0) { h.moveTo(p, m.ballX, m.ballY, 0x100); p.action = ACT.chaseBall; return; }
  }
  const mm = (p.tacticByte & 4) !== 0;
  p.action = ACT.none;
  const bx = m.ballX, by = m.ballY;
  if (m.ballH === -1 && m.poss !== -1) { const [x, y] = h.formationCell(p); p.action = ACT.toPosition; h.place(p, x, y); return; }
  const keeper = p.pos === POS.keeper;
  const trap = (m.teamFlags[p.side] & TEAM.offsideTrap) !== 0;
  // ---- step up / offside trap 0x714e87 (side 0) / 0x71502d (side 1)
  if (p.roll.decisions * p.roll.anticipation * p.roll.positioning > rand(25) && m.carrier && !keeper) {
    const s0 = p.side === 0;
    const okBall = s0 ? by > p.y && p.y < 6 : by < p.y && p.y > 5;
    if (okBall) {
      const att = m.players.filter((q) => q.active && q.side === opp && q.pos !== POS.keeper);
      const line = s0 ? m.lineSide0 : m.lineSide1;
      const a = att.length ? (s0 ? Math.min(...att.map((q) => q.y)) : Math.max(...att.map((q) => q.y))) : (s0 ? 9 : -1);
      if (s0 ? a <= line : a >= line) {
        const target = s0 ? line + 2 : line - 2;
        if (trap && Math.abs(p.y - line) < 2) { p.action = ACT.stepUp; h.moveTo(p, p.x, target, -1); return; }
        const last = s0 ? p.y - line === 1 && a + 1 <= line : line - p.y === 1 && a - 1 >= line;
        if (p.roll.decisions * p.roll.creativity > rand(100) && last) { p.action = ACT.stepUp; h.moveTo(p, p.x, target, -1); return; }
      }
    }
  }
  // ---- chase 0x7151b4
  if (!keeper) {
    const chase = m.poss === -1 || (m.carrier !== null && m.carrier.side !== p.side && beyondLine(m, opp, m.carrier.y) >= 0);
    // NB: closing down is only reached when `chase` holds but p is not the chaser (0x7151d7–0x715242)
    if (chase && !(m.receiver && m.receiver.side === p.side)) {
      if (isChaser(m, p)) { h.moveTo(p, bx, by, 0x100); p.action = ACT.chaseBall; return; }
      if (p.pos & (POS.grp200 | POS.grp100 | POS.grp400) && p.pos & (POS.mid8 | POS.mid10 | POS.mid20)) {   // closing down 0x715320
        if (rand(ftol(p.a.tackling)) + p.roll.workRate > rand(ftol(dist(p.x, p.y, bx, by) * 8))) { h.moveTo(p, bx, by, 0x100); p.action = ACT.chaseBall; return; }
      }
    }
  }
  // ---- man marking 0x7153cf
  const t = p.marks;
  if (t) {
    // 0x7153f9–0x71546a: with the offside trap and a carrier the marker may hold the zone instead.
    // NB each side compares t.y with the OTHER side's line (+0x8eaf for side 0) – read so, sic.
    let hold = false;
    if (trap && m.carrier) {
      if (p.side === 0) hold = p.y >= 6 || (by - 1 >= p.y && t.y < m.lineSide1);
      else hold = p.y <= 5 || (by + 1 <= p.y && t.y > m.lineSide0);
    }
    if (!hold) {
      if (!t.active) p.marks = null; // slot −5 or −3..−1 (0x715583)
      else {
        p.action = ACT.followMan;
        if (p.roll.anticipation !== 0 && m.receiver === t) { h.moveTo(p, bx, by, -1); return; }   // 0x715499
        let mx = t.x, my = t.y;
        if (!inOwnThird(opp, my) && !mm && rand(21) > t.a.jumping) {
          if (p.side === 0 && my > 0) my--; else if (p.side === 1 && my < 11) my++;
          if (mx <= 2) mx++; else if (mx >= 6) mx--;
        }
        h.moveTo(p, mx, my, -1); return;
      }
    }
  }
  // ---- zone 0x71558d
  let [tx, ty] = h.tacticalCell(p); let toBall = false;
  if (m.poss !== -1 && !keeper) {
    let k: number;
    if (rand(ftol(p.a.teamwork + 0.5)) === 0) k = 0;                           // 0x7155ab
    else {
      k = p.roll.workRate > rand(10) ? 1.995 : 1.5;                            // 0x7155e4 / 0x7155fb
      if (p.roll.decisions === 0) k *= 1.33;
      if (p.roll.positioning === 0) k *= 1.33;
      if (rand(150) + 30 < p.agitation) k *= 1.33;
    }
    if (dist(p.x, p.y, bx, by) < k) {
      const tf = m.teamFlags[p.side];
      if (p.instr & INSTR_CLOSE_DOWN || (p.instr & INSTR_CLOSE_DOWN_P && tf & TEAM.pressing) || tf & TEAM.menBehindBall) toBall = true;
      else if (!(p.pos & (POS.def2 | POS.def4)) && rand(m.touchCount[opp]) > rand(25) && !isLastMan(m, p)) toBall = true;
    }
    if (toBall) [tx, ty] = [bx, by];
  }
  if (keeper) return keeperOffBall(m, p, tx, ty, rand, h);
  if (m.poss !== -1 && inOwnBox(p.side, p.x, p.y)) {                           // 0x71590c
    const gk = h.ownKeeper(p.side);
    if (gk && gk.busy > 1) { h.moveTo(p, 4, p.side === 0 ? 0 : 11, -1); p.action = ACT.coverGoalLine; return; }
  }
  const off = offsidePos(m, p);
  if (off >= 0 && p.roll.offTheBall) { h.backOnside(p); p.action = ACT.backOnside; return; }
  if (isChaser(m, p)) {                                                        // 0x715c08
    let go: boolean;
    if (m.poss === -1 && inOwnHalf(p)) go = true;
    else if (m.poss !== -1) go = p.roll.workRate !== 0;
    else go = p.roll.workRate !== 0 && h.distToTarget(bx, by, tx, ty) < 2;
    if (go) {
      if (bx >= 0 && bx < 9 && by >= 0 && by < 12) {
        if (p.x === bx && p.y === by) {
          if (m.poss === -1 && m.ballH < 5 && m.loftCountdown === 0) {
            p.rating += 4; p.action = ACT.chaseBall; h.turn(p, 4, goalLine(p.side));
            h.comment(0x1f46, p); /* 0x715a59 (0x2113 if +0x1cd and p central in the opponents' box) */ h.takeBall(p); return;
          }
          p.action = ACT.actAgain; return;
        }
        p.action = ACT.chaseBall; h.moveTo(p, bx, by, 0x100); return;
      }
      p.action = toBall ? ACT.chaseBall : ACT.toPosition; h.moveTo(p, tx, ty, 0x100); return;
    }
  }
  // 0x715e0c
  if (inOwnBox(p.side, p.x, p.y)) {
    const oppHere = m.players.some((q) => q.active && q.side === opp && q.x === p.x && q.y === p.y);
    const mine = m.players.filter((q) => q.active && q.side === p.side && q.x === p.x && q.y === p.y).length;
    if (oppHere && mine === 1 && p.roll.positioning) { p.action = ACT.actAgain; return; }
  }
  if (p.x === tx && p.y === ty) { p.action = toBall ? ACT.chaseBall : ACT.stay; return; }
  p.action = toBall ? ACT.chaseBall : ACT.toPosition; h.moveTo(p, tx, ty, 0x100);
}

/** Keeper part of sub_714d40 (0x7159d4–0x715c03). tx,ty = his tactical cell. */
function keeperOffBall(m: Match, p: Player, tx: number, ty: number, _rand: Rand, h: Hooks): void {
  const bx = m.ballX, by = m.ballY;
  if (p.x === bx && p.y === by) {
    if (m.poss === -1 && m.ballH < 5 && m.loftCountdown === 0) {
      h.turn(p, 4, goalLine(p.side)); h.comment(0x1f46, p); h.takeBall(p); p.rating += 4; p.action = ACT.keeperGathers; return;
    }
    return;
  }
  if (isChaser(m, p) && dist(p.x, p.y, bx, by) <= 1.5) {
    const lazy = p.roll.decisions === 0 && p.roll.positioning === 0;
    if (inOwnBox(p.side, bx, by) && (m.poss === -1 || lazy)) { p.action = ACT.keeperGathers; h.moveTo(p, bx, by, 0x100); return; }
    if (m.poss === -1 && (h.nearestOppDist((p.side === 0 ? 1 : 0) as Side, bx, by) > 2.5 || lazy) && bx >= 0 && bx < 9 && by >= 0 && by < 12) {
      p.action = ACT.keeperGathers; h.moveTo(p, bx, by, 0x100); return;
    }
  }
  p.action = ACT.keeperToPosition; h.moveTo(p, tx, ty, -1);
}

// ------------------------------------------------------------------ the off-ball step, start of sub_6f09f0 (sikkert)

/**
 * Off-ball part of sub_6f09f0 (the carrier's dribble/duel part is TODO). Usable as Hooks.moveTo for
 * players without the ball. `facingOk` = sub_6fa140 (needs facing angle +0x19a and table 0xb67c30):
 * |angle diff| < ftol(2.25*roll10c + 45).
 */
export function offBallStep(_m: Match, p: Player, tx: number, ty: number, flags: number, rand: Rand,
                            facingOk: (p: Player, tx: number, ty: number) => boolean,
                            turn: (p: Player, tx: number, ty: number) => void,
                            knockCheck: (p: Player) => void,
                            markersFollow: (p: Player) => void): void {
  p.busy++;                                                              // 0x6f0a13
  if (p.x === tx && p.y === ty && flags !== 0xf && flags !== 0x100) { markersFollow(p); return; }
  knockCheck(p);                                                         // sub_6cfe10 0x6f0b0c
  if (!facingOk(p, tx, ty) && p.roll.agility === 0 && p.roll.positioning === 0 && p.roll.anticipation === 0) {
    turn(p, tx, ty); markersFollow(p); p.action = 0x6f; return;          // 0x6f0b7e, 0x6f0c07
  }
  const step = (a: number, b: number) => a + Math.sign(b - a);
  let nx = step(p.x, tx), ny = step(p.y, ty);                            // 0x6f0c1d
  if (p.roll.pace * p.roll.pace > rand(1000)) { nx = step(nx, tx); ny = step(ny, ty); } // 0x6f0c6c
  p.x = nx; p.y = ny;                                                    // 0x6f3b9a (grid lists updated too)
  markersFollow(p);                                                      // 0x6f3bf9
}

// ------------------------------------------------------------------ pass wrapper sub_6fa250 (sikkert)

export interface PassHooks {
  pass(p: Player, type: number, receiver: Player | null): boolean;   // sub_6fad40 TODO (only its start is read)
  offsidePlayer(side: Side, passerY: number, targetY: number): Player | null; // sub_6cfd70 → sub_6ea760
  missedOffside(o: Player): void;                                     // sub_6bb9a0(-1,o,0,0,8,o.x,o.y,-1,-1)
}
/** Start of sub_6fad40: the pass error terms (0x6fad40–0x6fae79). TODO the rest. */
export function passErrorStart(p: Player, passing: number, d: number, type: number, hasReceiver: boolean, rand: Rand) {
  const tired = rand(Math.trunc(((10000 - ftol(p.condition)) ** 2) / 50000));   // 0x6fad65
  let err = rand(ftol((4 * d ** 3) / Math.max(passing, 1)));                     // 0x6fae03
  if (!hasReceiver) err = rand(err);
  if (d < 2 && type !== 0x3d && type !== 0x5c) err += ftol(250 - 125 * d);       // 0x6fae60
  const n = Math.max(1, 5 * Math.trunc(ftol(9 * d + 2.5) / 5));                  // 0x6fae79
  return { tired, err, n };
}
export function passWrapper(m: Match, p: Player, type: number, receiver: Player | null, targetY: number,
                            setReceiver: boolean | { v: boolean }, rand: Rand, h: Hooks, ph: PassHooks): void {
  p.busy++;                                                       // 0x6fa26f
  if (!ph.pass(p, type, receiver)) return;
  if (type !== 0x36) {                                            // not a throw-in
    const o = ph.offsidePlayer(p.side, p.y, targetY);
    if (o) {
      const d = dist(o.x, o.y, 4, goalLine(o.side));
      if (rand(ftol(2 * d * d)) !== 0) {                          // 0x6fa2ec fmul + fadd st0,st0 = 2·d² → 0x6fa2f8 → 0x6fa3db offside given
        h.comment(0x1f78, o, p.side);                             // 0x6fa3f6: 8056 EVENT_RESTART_OFFSIDE (p1 = den offside, side = afleverens)
        h.offsideGiven?.(p.side);                                 // holdets offside +0xf5ca+54·side
        // TODO counters: team +0xf5ca+54*side ++, o.+0x13 ++, p.+0x1 --
        m.ballX = o.x; m.ballY = o.y; m.state = 7; m.poss = (p.side === 0 ? 1 : 0); m.carrier = null;
        return;
      }
      ph.missedOffside(o);
    }
  }
  if (m.state === 0 && (typeof setReceiver === 'boolean' ? setReceiver : setReceiver.v)) {   // arg3 – sub_6fad40 kan sætte den (§6.2)
    m.receiver = receiver; m.lastTouch = p.side;                   // 0x6fa34e (+ touchCount via 0x6fa367)
    m.touchCount[p.side]++;
    const o = p.side === 0 ? 1 : 0; if (m.touchCount[o] > 0) m.touchCount[o] -= 10;
    if (receiver && receiver.busy === 0 && receiver.roll.anticipation * receiver.roll.offTheBall > rand(80))
      playerTurn(m, receiver, rand, h);                           // 0x6fa3cf
  }
}

// ------------------------------------------------------------------ the tick loop sub_6b98c0 (sikkert in order; hooks TODO)

export function stoppage(m: Match, rand: Rand): void {
  const r = rand(10);                                   // 0x6b9f5f
  m.clock += r;
  m.stoppage += rand(ftol(0.8 * r));                    // 0x9689b0
}

/** One tick. Returns false when the period/match stops (sub_6bd930 result ≠ 0). */
export function tick(m: Match, rand: Rand, h: Hooks): boolean {
  // TODO: substitution pending (+0x8eb4), shoot-out (+0x8eb3 → sub_6be710), kick-off commentary,
  //       injured player lying down (+0x475a → sub_6bac40) – see MATCH_LOOP.md §3
  if (h.deadBallTemper?.()) return true;               // 0x6b9aea–0x6b9cab: optøjer ved død bold (sub_6d1210), før hændelsen
  if (h.incidentTick?.()) return true;                  // 0x6b9cb1 (før genstarten)
  if (!m.paused && m.state !== 0) {
    h.restartTick();                                    // sub_6c54a0
    if (m.state !== 0 && (!m.carrier || !m.carrier.active)) {
      const c = h.pickTaker(m.poss as Side, m.state);   // sub_6ceb90
      h.place(c, m.ballX, m.ballY); h.takeBall(c);      // +0x19c = 200 not modelled
      h.turn(c, m.ballX, m.ballY);                      // sub_6f4920(bx,by,4, side?1:10) TODO exact
    }
  }
  m.subTick++;
  if (m.subTick >= 1 || m.paused) {
    m.clock++; m.subTick = 0;
    const r = h.periodCheck();                          // sub_6bd930
    if (r === 1 || r === 2 || r === 3) return true;     // pausen/forlænget/dens pause: tikket slutter (0x6b9ef9 → 0x6baa10), kampen fortsætter
    if (r !== 0) return false;
    for (const p of m.players) if (p.active) playerTick(p, rand);   // sub_6f55c0
  }
  if (m.state === 0) {
    looseBall(m, rand, h);                              // sub_6bbe40
    if (m.state !== 0) { stoppage(m, rand); return true; }
  }
  // 0x6b9fa3–0x6b9fbd (sikker): har en anden end den sidste modtager (+0xf5aa) bolden, glemmes modtager og afleverer (+0xf5a6)
  if (m.carrier && m.carrier !== m.passRecv) { m.passRecv = null; m.passGiver = null; }
  // TODO sub_6cf750 stats, sub_6f4aa0 rating upkeep (busy-- is part of it):
  // sub_6f4aa0 (delvis): busy tælles ned; agitationen henfalder ×0,85 mod gulvet (player-state-bytes.md §1, float32 0x96d364)
  for (const p of m.players) {
    if (!p.active) continue;
    if (p.busy > 0) p.busy--;
    agitationDecay(p);
  }
  offsideLines(m);                                      // sub_6c3aa0
  h.topOfTick?.();                                      // fejlsøgning: samme sted som kampsporet (match_trace.c, kaldet 0x6ba01e)
  m.order = buildOrder(m, rand);                        // sub_6bd760
  m.prio = null;
  // 0x6ba05b–0x6ba0fa (sikker): jagerne sub_6c30e0 og målmandsflagene sub_6c3010(sub_6ce110(side), bold) → +0x8eac/+0x8ead
  const chasers = () => {
    m.chaser = [nearest(m, 0, m.ballX, m.ballY, !inOwnBox(0, m.ballX, m.ballY)),
                nearest(m, 1, m.ballX, m.ballY, !inOwnBox(1, m.ballX, m.ballY))];
    m.keeperOut = [keeperNearest(m, h.ownKeeper(0), m.ballX, m.ballY), keeperNearest(m, h.ownKeeper(1), m.ballX, m.ballY)];
  };
  chasers();
  let lbx = m.ballX, lby = m.ballY;                                                  // 0x6ba113/0x6ba119: [esp+0x13]/[esp+0x12]
  // 0x6ba100–0x6ba133 (sikker): kun et hold med 0x1000 får flaget genberegnet (efter rækkefølgen og jagerne); ellers beholder det
  // sin gamle værdi (0 fra init_match)
  for (const s of [0, 1] as Side[])
    if (m.teamFlags[s] & TEAM.counterAttack) m.counterFlag[s] = counterFlag(m, s, rand);
  assignMarking(m, h);
  let burst = false;
  for (let i = 0; i < m.order.length; i++) {
    const p = m.order[i];
    if (p.marks && m.poss !== p.side) continue;                               // 0x6ba37c
    if (!(burst && p.roll.pace <= rand(10))) playerTurn(m, p, rand, h);       // 0x6ba390
    if (p.action === ACT.runWithBall && rand(ftol(2010 - 100 * p.a.acceleration)) === 0) burst = true; // 0x6ba3b9
    else if (p.action === ACT.runWithBall2 && rand(ftol(2010 - 100 * p.a.pace)) === 0) burst = true;  // 0x6ba3e2
    if (m.state !== 0 || m.paused) { stoppage(m, rand); h.treatInjured?.(); return true; }   // 0x6ba6f3 (+ 0x6d0b60)
    // 0x6ba427–0x6ba536 (sikker): flyvetiden tælles ned efter hver spillers tur. Når den når 0 ved boldhøjde 4 uden bestemt modtager,
    // lander bolden (sub_6c9cd0). Ellers modtager +0x477e bolden, når han står i dens felt (sub_6f6c00); er han den tilsigtede modtager
    // (+0xf57a), ledig og med anticipation- og off-the-ball-rul, får han ét skridt (sub_713fc0 med +0x1c5 = 1) og så evt. modtagelsen.
    let landed = false;
    if (m.loftCountdown) {
      m.loftCountdown--;
      if (m.loftCountdown === 0 && m.ballH === 4 && !m.passTo && h.landing) { h.landing(m.landX ?? m.ballX, m.landY ?? m.ballY); landed = true; }
    }
    if (!landed && m.loftCountdown === 0 && m.passTo && h.receive) {
      const R = m.passTo;
      const recv = () => h.receive!(R, m.margin ?? 0, m.fromX ?? -1, m.fromY ?? -1);
      if (R.x === m.ballX && R.y === m.ballY) recv();
      else if (R === m.receiver && R.busy === 0 && R.roll.anticipation !== 0 && R.roll.offTheBall !== 0) {
        m.loftCountdown = 1; attackOffBall(m, R, rand, h); m.loftCountdown = 0;
        if (m.passTo === R && R.x === m.ballX && R.y === m.ballY) recv();
      }
    }
    if (m.state !== 0 || m.paused) { stoppage(m, rand); return true; }
    if (m.prio) return true;
    if ((p.action === ACT.actAgain || p.action === ACT.stay) && i < 22) m.order.push(p);   // 0x6ba57b
    offsideLines(m);
    // 0x6ba5a5–0x6ba68e (sikker): jagerne og målmandsflagene regnes kun igen, når bolden har flyttet sig siden sidst
    if (m.ballX !== lbx || m.ballY !== lby) { chasers(); lbx = m.ballX; lby = m.ballY; }
  }
  return true;
}
