// Gittermotoren (9 × 12) – et laboratorium VED SIDEN AF MatchSim (Bosman-prompten, opgave 5). Ikke koblet ind i spillet.
// Bygger på Bosman-projektets porte: tik-løkken (loop.ts), boldholderens valg (ballCarrier.ts), afleveringsmulighederne
// (passOptions.ts), skuddet (shot.ts) og hjælpefunktionerne (helpers.ts) – de er "sikre" (læst i koden).
// Alt, der endnu er ukendt i originalen, ligger som navngivne kroge i GRID_UNKNOWN med et *estimeret* bud og
// adressen på den funktion i cm0102.exe, de står i for. Kør en sæson: npx tsx scripts/grid-stats.ts
import * as L from './loop';
import { ACTION, decideBallCarrier, type Decision, type PassOption, type Situation } from './ballCarrier';
import { passOptions, type Helpers as PassHelpers, type MatchPlayer as PassPlayer, type MatchState as PassState } from './passOptions';
import { SHOT, keeperBase, keeperValue, shotOutcome, shotScore, type Attrs as ShotAttrs } from './shot';
import * as H from './helpers';
import { cardFor, cardSeverity, foulGiven, refereeFactorInMatch } from '../cm0102-original-rules';
import { ATTRS } from '../../attributes';
import type { Player, Tactic } from '../../types';

export type Rand = (n: number) => number;
/** tællere til fejlsøgning (scripts/grid-stats.ts DEBUG=1) */
export const GRID_DEBUG: Record<string, number> = {};
const dbg = (k: string) => { GRID_DEBUG[k] = (GRID_DEBUG[k] ?? 0) + 1; };
/** Rand fra en 0..1-generator (vores Rng.next): 0..n-1, 0 ved n ≤ 0 (sub_90cfc0) */
export const randOf = (next01: () => number): Rand => (n) => (n <= 0 ? 0 : Math.floor(next01() * Math.trunc(n)));

export interface GridTeam { players: Player[] | Map<number, Player>; tactic: Tactic; nation?: string }
export interface GridSideStats { goals: number; shots: number; onTarget: number; corners: number; fouls: number; offsides: number; yellows: number; reds: number; passes: number; passesCompleted: number }
export interface GridResult { home: GridSideStats; away: GridSideStats; ticks: number }

type Side = 0 | 1;
const other = (s: Side) => (1 - s) as Side;
const goalRow = (s: Side) => (s === 0 ? 11 : 0); // den række siden angriber
const clampX = (x: number) => Math.max(0, Math.min(8, x));
const clampY = (y: number) => Math.max(0, Math.min(11, y));
const central = (x: number) => x >= 2 && x <= 6;
const inBoxOf = (defSide: Side, x: number, y: number) => central(x) && (defSide === 0 ? y <= 1 : y >= 10);

/** En spiller i gittermotoren: loop.ts' Player + det de andre porte læser */
export interface GP extends L.Player {
  src: Player;
  f: Record<string, number>; // kampværdier (sub_6ec010)
  posAttack: number;
  facing: number;
  strongFoot: 0 | 1;
  weakFootPenalty: number; // +0x2d = 20 − den svage fods værdi (rettelse 5)
  leftFoot: number; rightFoot: number;
  baseX: number; baseY: number; // pladsen i formationen (hele banen)
  gkRating: number;
  fouls: number; booked: boolean;
  view?: PassPlayer & H.MatchPlayer;
}

// ------------------------------------------------------------------ de ukendte dele (*estimeret*)

export interface GridMatchState extends L.Match {
  gp: GP[];
  stats: [GridSideStats, GridSideStats];
  goals: [number, number];
  arrive: number; // tik, hvor bolden når frem efter en aflevering (afleveringens rejse er ukendt – sub_6fad40)
  pendingPass: Side | -1;
  linesmanMark: number; // linjevogterens karakter-ord (officials +8), kun statistik
  period: number;
  depth: number;
  tactics: [Tactic, Tactic];
  nations: [string, string];
}

export const GRID_UNKNOWN = {
  /** sub_6c2be0 + sub_715f50 (taktisk felt): formationens plads forskudt mod bolden. *estimeret* */
  // Formationen holder formen: rykker ca. en tredjedel med bolden; forsvarerne holder en linje (defMin rækker fra eget mål,
  // dybere kun når bolden er i feltet); angriberne går ikke forbi modstandernes sidste linje (onside)
  shiftY: 0.33, shiftX: 0.4, possForward: 1, defBack: 1, defMin: 2,
  tacticalCell(m: GridMatchState, p: GP): [number, number] {
    if (p.pos === L.POS.keeper) return [4, p.side === 0 ? 0 : 11];
    const rel = p.side === 0 ? m.ballY : 11 - m.ballY; // boldens række set fra spillerens hold
    const fwd = Math.round((rel - 5.5) * this.shiftY) + (m.poss === p.side ? this.possForward : -this.defBack);
    let y = Math.max(0, Math.min(10, p.baseY + fwd)); // baseY er dybden set fra eget mål
    if (p.baseY <= 3) y = Math.max(y, rel <= 1 ? 1 : this.defMin);
    y = Math.min(y, onsideRow(m, p));

    const x = clampX(p.baseX + Math.round((m.ballX - 4) * this.shiftX));
    return [x, p.side === 0 ? y : 11 - y];
  },
  /** sub_6bce80 (løbemål): angribere løber 1-2 rækker frem mod mål. *estimeret* */
  runTarget(m: GridMatchState, p: GP, rand: Rand): [number, number] | null {
    if (!(p.pos & (L.POS.forward | L.POS.mid20 | L.POS.mid10))) return null;
    const own = p.side === 0 ? p.y : 11 - p.y;
    const lim = onsideRow(m, p) + (rand(1000) < 1000 * this.runBeyondP ? 1 : 0); // løb bag linjen (timing) *estimeret*
    const ty = Math.min(own + 1 + rand(2), lim);
    if (ty <= own) return null;
    return [clampX(p.x + (p.x < 4 ? 1 : p.x > 4 ? -1 : 0) * rand(2)), clampY(p.side === 0 ? ty : 11 - ty)];
  },
  /** andel af løbene, der går ét felt bag modstandernes linje (giver offside). *estimeret* */
  runBeyondP: 0.25,
  /** sub_6bc030 (zonevalg): nærmeste umarkerede modstander inden for 2 felter. *estimeret* */
  zonalPick(m: GridMatchState, p: GP): GP | null {
    let best: GP | null = null, bd = 2.01;
    for (const o of m.gp) if (o.active && o.side !== p.side && o.pos !== L.POS.keeper && o.markers.length === 0) {
      const d = L.dist(o.x, o.y, p.x, p.y);
      if (d < bd) { bd = d; best = o; }
    }
    return best;
  },
  /** sub_6f9f90 (sikker; notes/vision-space-offside.md §1): kan p se feltet (tx,ty)? useSkill = a3 (synsvinklen af Creativity-rullet,
   *  modstandere nær og markering), oppNear = a4, mark = a5, wantLane = a6 ≠ 0 (banen tælles med sub_6cbc00 og Creativity ≥ rand(lane²)). */
  canSee(m: GridMatchState, p: GP, tx: number, ty: number, useSkill: boolean, oppNear: number, mark: number, wantLane: boolean, rand: Rand): { ok: boolean; lane: number } {
    const ang = H.bearing(tx - p.x, ty - p.y);
    if (p.facing === ang) return { ok: true, lane: 0 };
    let limit = 75;
    if (useSkill) {
      const cr = p.roll.creativity;                                                            // +0x10b
      const v = H.isCrossingPosition(p.view!, tx, ty) ? H.ftol(4 * cr + oppNear * 10 + 60) : H.ftol(5 * cr + oppNear * 10 + 40);
      const w = H.ftol((L.DIST[Math.abs(p.y - ty)][Math.abs(p.x - tx)] - mark) * 20 - 50);
      limit = Math.max(30, Math.min(135, v - w));
    }
    let diff = Math.abs(p.facing - ang); if (diff > 180) diff = 360 - diff;
    if (diff >= limit) return { ok: false, lane: 0 };
    if (!wantLane) return { ok: true, lane: 0 };
    const lane = H.laneBlockers(m.gp, m.poss, p.x, p.y, tx, ty);
    return { ok: p.roll.creativity >= rand(lane * lane), lane };
  },
  /** sub_6f4650 (sikker): står på mållinjens midterfelter, eller ser målet (uden skill, < 75°). */
  facingGoal(m: GridMatchState, q: GP, rand: Rand): boolean {
    const gy = goalRow(q.side);
    if (q.y === gy && q.x >= 3 && q.x <= 5) return true;
    return this.canSee(m, q, 4, gy, false, 0, 0, false, rand).ok;
  },
  /** sub_6cbad0 (sikker): et af de tre felter i rækken foran (skråt højre, skråt venstre, lige) er fri for modstandere. */
  spaceAhead(m: GridMatchState, p: GP): boolean {
    const opp = other(p.side), y = p.side === 1 ? p.y - 1 : p.y + 1;
    if (y < 0 || y > 11) return false;
    const free = (x: number) => !m.gp.some((o) => o.active && o.side === opp && o.x === x && o.y === y);
    if (p.x < 8 && free(p.x + 1)) return true;
    if (p.x > 0 && free(p.x - 1)) return true;
    return free(p.x);
  },
  /** sub_6cb780 (sikker): 0 = ikke frit (egen halvdel, modstander i feltet, eller en modstander-markspiller mindst lige så nær målet);
   *  ellers 2 hvis en medspiller-markspiller er nærmere målet – og originalens egen løkke tager spilleren selv med, så 1 forekommer
   *  kun for målmænd. */
  freeRun(m: GridMatchState, p: GP, rand: Rand): 0 | 1 | 2 {
    if (L.inOwnHalf(p)) return 0;
    const opp = other(p.side), gy = goalRow(p.side);
    if (m.gp.some((o) => o.active && o.side === opp && o.x === p.x && o.y === p.y)) return 0;
    let t = Math.fround(L.dist(p.x, p.y, 4, gy) + 0.5);
    if (!this.facingGoal(m, p, rand)) t = Math.fround(t + 1);
    for (const q of m.gp) if (q.active && q.side === opp && q.pos !== L.POS.keeper && L.dist(q.x, q.y, 4, gy) <= t) return 0;
    for (const q of m.gp) if (q.active && q.side === p.side && q.pos !== L.POS.keeper && L.dist(q.x, q.y, 4, gy) < t) return 2;
    return 1;
  },
  /** sub_6cfd70 → sub_6ea760 (sikker bortset fra fordelsreglen sub_6bab90, som ikke er modelleret – "ingen fordel i gang"):
   *  hvem flages ved en aflevering fra række y0 mod y1 (excl = skytten ved skud, ellers null). Linjevogterens +0x29 = official29 (?),
   *  hans karakter (+8) = m.linesmanMark. Rækkereglerne er `offsideFlag` i cm0102-original-rules.ts. */
  offsidePlayer(m: GridMatchState, side: Side, y0: number, y1: number, excl: GP | null, rand: Rand): GP | null {
    const Lrow = side === 0 ? m.lineSide1 : m.lineSide0, s = side === 0 ? 1 : -1;
    if (side === 0 ? y1 <= y0 || y1 < Lrow : y1 >= y0 || y1 > Lrow) return null;
    const att = m.gp.filter((o) => o.active && o.side === side);                              // målmand med, slot-orden
    if (excl && !att.some((q) => (side === 0 ? q.y > y0 : q.y < y0))) return null;            // sub_6cb700(y0, side, 0)
    if (rand(this.official29 + 25) === 0) { m.linesmanMark -= 75; return null; }
    const inAttBox = (x: number, y: number) => x >= 2 && x <= 6 && (side === 0 ? y >= 10 : y <= 1);
    for (const q of att) {
      if (q === excl) continue;
      if (excl) {
        if (!inAttBox(excl.x, excl.y)) continue;
        if (rand(4) + 1 < L.dist(q.x, q.y, 4, y1)) continue;
      }
      const v = q.roll.offTheBall;                                                              // +0x107
      if (q.y === Lrow - 2 * s) { if (rand(6 * v + 500) === 0) { m.linesmanMark -= 25; return q; } }
      else if (q.y === Lrow - s) { if (rand(H.ftol(v ** 3 + 25)) === 0) { m.linesmanMark -= 15; return q; } }
      else if (q.y === Lrow) { if (rand(3) !== 0 && v < rand(18)) { m.linesmanMark += 15; return q; } }
      else if (side === 0 ? q.y > Lrow : q.y < Lrow) { if (v < rand(100)) return q; }
    }
    return null;
  },
  /** sub_6fad40 (afleveringen: præcision/opsnapning) – kun starten er læst (passErrorStart). *estimeret* */
  passK: 120, interceptP: 0.08,
  passResult(m: GridMatchState, p: GP, type: number, tx: number, ty: number, hasReceiver: boolean, rand: Rand): { kind: 'ok' | 'cut' | 'loose'; x: number; y: number; by?: GP } {
    const D = L.dist(p.x, p.y, tx, ty);
    const e = L.passErrorStart(p, Math.max(1, 10 * p.f.passing), D, type, hasReceiver, rand);
    for (const o of m.gp) {
      if (!o.active || o.side === p.side || o.busy > 1) continue;
      if (H.lineCells(p.x, p.y, tx, ty).some(([x, y]) => x === o.x && y === o.y && !(x === p.x && y === p.y))) {
        if (rand(1000) < 1000 * this.interceptP * (0.6 + o.f.anticipation / 25)) return { kind: 'cut', x: o.x, y: o.y, by: o };
      }
    }
    const bad = e.err + e.tired;
    if (rand(bad + this.passK) < bad) return { kind: 'loose', x: clampX(tx + rand(3) - 1), y: clampY(ty + rand(3) - 1) };
    return { kind: 'ok', x: tx, y: ty };
  },
  /** sub_6f09f0 fra 0x6f0e58 + sub_6c87e0 (duellen/tacklingen): *estimeret* */
  tackleP: 0.5, foulP: 0.095,
  challenge(m: GridMatchState, def: GP, car: GP, rand: Rand): 'won' | 'foul' | 'kept' {
    void m;
    const d = def.f.tackling * 2 + def.f.anticipation + def.f.strength + rand(20);
    const a = car.f.dribbling * 2 + car.f.agility + car.f.balance + rand(20);
    if (rand(1000) < 1000 * this.foulP * (0.5 + (def.src.attrs[ATTRS.indexOf('aggression')] || 10) / 20)) return 'foul';
    return d * this.tackleP * 3 > a ? 'won' : 'kept';
  },
  /** sub_6fad40 (første berøring, modstanderen i modtagerens felt): chancen for at modstanderen vinder bolden. *estimeret* */
  contestP: 0.35,
  /** chancen for, at en ledig forsvarer ved siden af boldholderens nye felt går ind i duellen (sub_6f09f0, ikke læst). *estimeret* */
  runChallengeP: 0.4,
  /** sub_6c87e0 før skuddet (udfordringen fra forsvarere i/ved skytten, SHOT.md §7 "udfordrings-grenen"): pr. forsvarer. *estimeret* */
  preShotP: 0.4, preShotReach: 1.5,
  /** sub_6fa490 + sub_6c9cd0 (høje bolde/hovedstød): indlæg ind i feltet, ellers langt frem. *estimeret* */
  crossWin: 0.42,
  /** Afværgede bolde over egen baglinje (giver hjørne via lastTouch): andel af de indlæg, forsvaret vinder i luften, og af de
   *  blokerede skud. sub_6c9cd0/sub_70dfd0 er ikke læst. *estimeret* */
  crossCornerP: 0.5, blockCornerP: 0.6,
  lofted(m: GridMatchState, p: GP, d: Extract<Decision, { kind: 'loftedBall' }>, rand: Rand): { kind: 'header'; by: GP } | { kind: 'loose'; x: number; y: number } | { kind: 'corner' } {
    const gr = goalRow(p.side);
    const nearBox = p.side === 0 ? p.y >= 8 : p.y <= 3;
    if (!d.clearance && nearBox) {
      const atk = m.gp.filter((o) => o.active && o.side === p.side && o !== p && o.pos !== L.POS.keeper && L.dist(o.x, o.y, 4, gr) <= 2.3);
      const def = m.gp.filter((o) => o.active && o.side !== p.side && L.dist(o.x, o.y, 4, gr) <= 2.3);
      const best = (xs: GP[]) => xs.sort((a, b) => b.f.heading + b.f.jumping - a.f.heading - a.f.jumping)[0];
      const A = best(atk), Df = best(def);
      if (A) {
        const sa = A.f.heading + A.f.jumping + p.f.crossing / 2 + rand(20), sd = Df ? Df.f.heading + Df.f.jumping + rand(20) : 0;
        if (sa * this.crossWin * 2 > sd) return { kind: 'header', by: A };
      }
      if (Df && rand(1000) < 1000 * this.crossCornerP) return { kind: 'corner' };
      return { kind: 'loose', x: clampX(4 + rand(5) - 2), y: clampY(gr + (p.side === 0 ? -2 - rand(3) : 2 + rand(3))) };
    }
    const dir = p.side === 0 ? 1 : -1;
    return { kind: 'loose', x: clampX(p.x + rand(5) - 2), y: clampY(p.y + dir * (4 + rand(4))) };
  },
  /** sub_6ceb90 (hvem tager dødbolden): *estimeret* */
  pickTaker(m: GridMatchState, side: Side, state: number): GP {
    const own = m.gp.filter((o) => o.active && o.side === side);
    const gk = own.find((o) => o.pos === L.POS.keeper);
    if (state === 4 && gk) return gk;
    const pref = (id: number) => own.find((o) => o.src.id === id);
    const tac = m.tactics[side];
    if (state === 5) return pref(tac.penalties) ?? own.sort((a, b) => b.f.penalties - a.f.penalties)[0];
    if (state === 3) return pref(tac.corners) ?? own.filter((o) => o !== gk).sort((a, b) => b.f.crossing - a.f.crossing)[0];
    if (state === 6) return pref(tac.freeKicks) ?? own.filter((o) => o !== gk).sort((a, b) => b.f.freeKicks - a.f.freeKicks)[0];
    if (state === 8) return own.filter((o) => o !== gk).sort((a, b) => (b.pos & L.POS.forward) - (a.pos & L.POS.forward))[0];
    return own.filter((o) => o !== gk).sort((a, b) => L.dist(a.x, a.y, m.ballX, m.ballY) - L.dist(b.x, b.y, m.ballX, m.ballY))[0];
  },
  /** sub_6e9820/sub_6ea4e0: hvilken udfordringstype frisparket var, kendes ikke her – andelen, der går gennem kortreglen (type 42). *estimeret* */
  cardShare: 0.11,
  /** dommerens Discipline (officials.dat 0x25) og +0x27 (frisparkgrænse) – vi vælger ikke en dommer her. *estimeret* */
  refDiscipline: 10, ref27: 10,
  /** hjemmebane: som MatchSim (homeAdv 2 i ORIGINAL): hjemmeholdets kampværdier ×(1 + 0,019·h), udeholdets ×(1 − 0,007·h). *estimeret* */
  homeAdv: 10,
  /** match+0x8eaa (keeperens fumle-chance tæt på). *estimeret* 0 */
  b8eaa: 0,
  /** sub_6ea760: linjevogterens officials-byte +0x29 (rand(+0x29 + 25) == 0 = overser alt) og hvor tæt på afleveringens mål en angriber
   *  skal stå for at blive vurderet (sub_6cfd70's udvalg er ikke læst). *estimeret* */
  official29: 10, offsideReach: 2,
  /** sub_70dfd0 (skuddets blokering/afbøjning): pr. forsvarer på linjen. *estimeret* */
  blockP: 0.2, deflectP: 0.06,
};

/** Rækken (set fra p's eget mål) med modstandernes sidste markspiller = højeste onside-række. */
function onsideRow(m: GridMatchState, p: GP): number {
  const opp = m.gp.filter((o) => o.active && o.side !== p.side && o.pos !== L.POS.keeper);
  if (!opp.length) return 10;
  const line = p.side === 0 ? Math.max(...opp.map((o) => o.y)) : 11 - Math.min(...opp.map((o) => o.y));
  return Math.max(6, Math.min(10, line));
}

// ------------------------------------------------------------------ opbygning

const POS_WORD: Record<string, number> = { GK: 0x1, SW: 0x2, D: 0x4, DM: 0x8, M: 0x10, AM: 0x20, ST: 0x40, WB: 0x8 };
const SIDE_WORD: Record<string, number> = { L: 0x80, C: 0x200, R: 0x800 };
const TECHN = ['anticipation', 'crossing', 'decisions', 'dribbling', 'finishing', 'handling', 'heading', 'longShots', 'marking', 'offTheBall', 'oneOnOnes', 'passing', 'penalties', 'positioning', 'reflexes', 'tackling', 'throwIns', 'creativity'] as const;
const RAWN = ['acceleration', 'pace', 'agility', 'balance', 'strength', 'flair', 'freeKicks', 'jumping', 'teamwork', 'technique', 'aggression', 'bravery', 'corners'] as const;

function makePlayer(p: Player, side: Side, slot: number, tactic: Tactic): GP {
  const s = tactic.slots[slot];
  const gk = s.pos === 'GK';
  const sh = (k: string) => p.attrs[ATTRS.indexOf(k as never)] || 10;
  const mc = H.matchCa({ ca: p.ca, pa: Math.max(p.ca, p.pa), isKeeper: gk });
  const f: Record<string, number> = {};
  for (const k of TECHN) f[k] = H.technicalMatchFloat(k, H.intrinsicFromShown(p.ca, sh(k)), mc);
  for (const k of RAWN) f[k] = H.rawMatchFloat(k, sh(k));
  f.workRate = sh('workRate'); f.versatility = sh('versatility');
  const pos = gk ? 0x1 : POS_WORD[s.pos] | (SIDE_WORD[s.side] ?? 0x200);
  // +0x37: positionstilpasningen (sub_6eecb0, rettelse 6) ud fra spillerens positionsevner [GK SW D DM M AM F WB] og sider [L C R]
  const r: H.PosRatings = { gk: p.pos[0], sw: p.pos[1], d: p.pos[2], dm: p.pos[3], m: p.pos[4], am: p.pos[5], f: p.pos[6], wb: p.pos[7], l: p.side?.[0] ?? 20, c: p.side?.[1] ?? 20, r: p.side?.[2] ?? 20, free: 1 };
  const form = Math.min(0, H.positionFit(pos, pos, r, sh('versatility')));
  const lf = p.foot === 'L' || p.foot === 'B' ? 20 : 8, rf = p.foot === 'R' || p.foot === 'B' ? 20 : 8;
  let bx = clampX(Math.round((s.y / 100) * 8)), by = Math.min(10, Math.round((s.x / 100) * 11));
  if (gk) { bx = 4; by = 0; }
  if (side === 1) bx = 8 - bx;
  const a: L.Attr = { acceleration: f.acceleration, anticipation: f.anticipation, decisions: f.decisions, flair: f.flair, jumping: f.jumping, marking: f.marking, offTheBall: f.offTheBall, pace: f.pace, positioning: f.positioning, tackling: f.tackling, teamwork: f.teamwork, creativity: f.creativity, workRate: f.workRate, agility: f.agility, versatility: f.versatility };
  const g: GP = {
    side, slot, active: true, x: bx, y: side === 0 ? by : 11 - by, action: L.ACT.none, rating: 6100, condition: 100 * Math.max(60, p.condition ?? 100), pendingCond: 0, busy: 0,
    matchCA: mc.K, form, morale: 10, injury: 0, agitation: 0, pos, tacticByte: 0, instr: 0n, freeRoleRating: 1, a,
    cap: undefined as unknown as L.Caps, roll: { pace: 0, anticipation: 0, decisions: 0, offTheBall: 0, marking: 0, flair: 0, positioning: 0, creativity: 0, agility: 0, workRate: 0 },
    marks: null, markers: [], src: p, f, posAttack: pos, facing: side === 0 ? 0 : 180, strongFoot: rf >= lf ? 1 : 0, weakFootPenalty: 20 - Math.min(lf, rf),
    leftFoot: lf, rightFoot: rf, baseX: bx, baseY: by, gkRating: p.pos[0], fouls: 0, booked: false,
  };
  g.cap = L.rollCaps(g);
  return g;
}

function attachView(m: GridMatchState, p: GP): void {
  const v = {
    side: p.side, slot: p.slot, x: p.x, y: p.y, posFlags: p.pos, pos: p.pos, posAttack: p.posAttack, plads: 0, condition: p.condition, w35: 0, passesInMove: 0,
    b2c: p.strongFoot, b2d: p.weakFootPenalty, busy: p.busy, facing: p.facing, momentum: 0, action: p.action, strongFoot: p.strongFoot, weakFootPenalty: p.weakFootPenalty,
    leftFoot: p.leftFoot, rightFoot: p.rightFoot, crossing: p.f.crossing, finishing: p.f.finishing, flair: p.f.flair, jumping: p.f.jumping, pace: p.f.pace, strength: p.f.strength,
    teamwork: p.f.teamwork, technique: p.f.technique, throwIns: p.f.throwIns, creativity: p.f.creativity, paceRoll: 0, anticRoll: 0, decRoll: 0, offBallRoll: 0, creatRoll: 0,
    instr: { lo: 0, hi: 0 }, staff: { id: p.src.id, nationName: m.nations[p.side], professionalism: p.src.attrs[ATTRS.indexOf('professionalism')] || 10, favoured: [], disliked: [] },
    rolls: { b107: 0, b108: 0, b10a: 0, b10c: 0 }, tacklingBit2: false, challengers: [] as H.MatchPlayer[],
  };
  p.view = v as PassPlayer & H.MatchPlayer;
}
/** opdatér visningerne (positioner, rul) før en beslutning */
function sync(m: GridMatchState): void {
  for (const p of m.gp) {
    const v = p.view!;
    v.x = p.x; v.y = p.y; v.slot = p.active ? p.slot : -1; v.busy = p.busy; v.facing = p.facing; v.action = p.action; v.condition = p.condition;
    v.paceRoll = p.roll.pace; v.anticRoll = p.roll.anticipation; v.decRoll = p.roll.decisions; v.offBallRoll = p.roll.offTheBall; v.creatRoll = p.roll.creativity;
    v.rolls.b107 = p.roll.offTheBall; v.rolls.b108 = p.roll.marking; v.rolls.b10a = p.roll.positioning; v.rolls.b10c = p.roll.agility;
    v.challengers = p.markers.map((q) => (q as GP).view!);
  }
}

const emptyStats = (): GridSideStats => ({ goals: 0, shots: 0, onTarget: 0, corners: 0, fouls: 0, offsides: 0, yellows: 0, reds: 0, passes: 0, passesCompleted: 0 });


// ------------------------------------------------------------------ kampen

export function runGridMatch(home: GridTeam, away: GridTeam, rand: Rand): GridResult {
  const teams = [home, away];
  const gp: GP[] = [];
  teams.forEach((t, side) => {
    const ps = t.players instanceof Map ? t.players : new Map(t.players.map((p) => [p.id, p]));
    t.tactic.lineup.forEach((id, slot) => { const p = ps.get(id); if (p) gp.push(makePlayer(p, side as Side, slot, t.tactic)); });
  });
  const m: GridMatchState = {
    players: gp, gp, ballX: 4, ballY: 6, ballH: -1, ballSpeed: 0, ballDir: 0, lastTouch: 0, poss: 0, state: 8, shootout: 0, clock: 0, stoppage: 0, subTick: 0,
    paused: false, carrier: null, receiver: null, chaser: [null, null], keeperOut: [false, false], lineSide1: 11, lineSide0: 0, counterFlag: [false, false],
    teamFlags: [0, 0], aiMode: [2, 2], touchCount: [0, 0], loftCountdown: 0, order: [], prio: null, linesmanMark: 0,
    tactics: [home.tactic, away.tactic], nations: [home.nation ?? 'England', away.nation ?? 'England'],
    stats: [emptyStats(), emptyStats()], goals: [0, 0], arrive: 0, pendingPass: -1, period: 0, depth: 0,
  };
  // hjemmebanen: kampværdierne (sub_6ec010-floats) skaleres som MatchSims homeMult (*estimeret*)
  for (const p of gp) {
    const k = p.side === 0 ? 1 + 0.019 * GRID_UNKNOWN.homeAdv : 1 - 0.007 * GRID_UNKNOWN.homeAdv;
    for (const key of Object.keys(p.f)) if (key !== 'workRate' && key !== 'versatility') p.f[key] *= k;
    for (const key of Object.keys(p.a) as (keyof L.Attr)[]) if (key !== 'workRate' && key !== 'versatility') p.a[key] *= k;
  }
  for (const p of gp) attachView(m, p);
  const st = (s: Side) => m.stats[s];

  const kickoffPositions = (taking: Side) => {
    for (const p of gp) {
      const by = Math.min(5, Math.round(p.baseY * 0.5));
      p.x = p.baseX; p.y = p.side === 0 ? by : 11 - by; p.busy = 0; p.action = L.ACT.none;
    }
    m.ballX = 4; m.ballY = taking === 0 ? 5 : 6; m.ballH = -1; m.state = 8; m.poss = taking; m.carrier = null; m.receiver = null;
  };
  const takeBall = (p: GP) => {
    dbg('take');
    if (m.pendingPass !== -1) { dbg(m.pendingPass === p.side ? 'pass:mate' : 'pass:opp'); if (m.pendingPass === p.side) st(p.side).passesCompleted++; m.pendingPass = -1; }
    m.carrier = p; m.poss = p.side; m.ballX = p.x; m.ballY = p.y; m.ballH = 0; m.ballSpeed = 0; m.receiver = null; m.lastTouch = p.side;
  };
  const restart = (state: number, side: Side, x: number, y: number) => {
    if (m.pendingPass !== -1) { dbg('pass:dead' + state); m.pendingPass = -1; }
    m.state = state; m.poss = side; m.carrier = null; m.receiver = null; m.ballX = clampX(x); m.ballY = clampY(y); m.ballH = -1; m.ballSpeed = 0;
  };

  const hooks: L.Hooks = {
    ballCarrier: (p) => carrierTurn(p as GP),
    moveTo: (p0, x, y, flags) => {
      const p = p0 as GP;
      const fx = clampX(x), fy = clampY(y);
      L.offBallStep(m, p, fx, fy, flags, rand,
        (q, tx, ty) => Math.abs(((H.cellDirection(q.x, q.y, tx, ty) - (q as GP).facing + 540) % 360) - 180) <= 90 || (q.x === tx && q.y === ty),
        (q, tx, ty) => { (q as GP).facing = H.cellDirection(q.x, q.y, tx, ty); }, () => {}, () => {});
      if (p.x !== fx || p.y !== fy) p.facing = H.cellDirection(p.x, p.y, fx, fy);
      if (flags === 0x100 && p.x === m.ballX && p.y === m.ballY && m.state === 0) {
        const rv = m.receiver as GP | null;
        if (!m.carrier && m.clock >= m.arrive) {
          // modtageren står i feltet: en modstander må vinde kampen om bolden (ellers tager modtageren den)
          if (rv && rv !== p && rv.side !== p.side && rv.active && rv.x === m.ballX && rv.y === m.ballY) { if (rand(1000) < 1000 * GRID_UNKNOWN.contestP) takeBall(p); else takeBall(rv); }
          else takeBall(p);
        }
        else if (m.carrier && m.carrier.side !== p.side) duel(p, m.carrier as GP);
      }
    },
    place: (p, x, y) => { p.x = clampX(x); p.y = clampY(y); },
    tacticalCell: (p) => GRID_UNKNOWN.tacticalCell(m, p as GP),
    formationCell: (p) => GRID_UNKNOWN.tacticalCell(m, p as GP),
    runTarget: (p) => GRID_UNKNOWN.runTarget(m, p as GP, rand),
    zonalPick: (p) => GRID_UNKNOWN.zonalPick(m, p as GP),
    manMarkTarget: () => null, // sub_7160f0: kræver mandsopdækning i taktikken (ikke i vores Tactic)
    backOnside: (p) => { p.y = clampY(p.y + (p.side === 0 ? -1 : 1)); },
    takeBall: (p) => takeBall(p as GP),
    turn: (p, x, y) => { (p as GP).facing = H.cellDirection(p.x, p.y, x, y); },
    canFollow: (mk, x, y) => L.dist(mk.x, mk.y, x, y) <= 1.5, // sub_6bce20 *estimeret*
    teammatesAhead: (p) => gp.filter((o) => o.active && o.side === p.side && o !== p && (p.side === 0 ? o.y > p.y : o.y < p.y)).length,
    nearestOppDist: (side, x, y) => H.nearestOpponent(gp.filter((o) => o.side !== side).map((o) => o.view!), x, y, true),
    ownKeeper: (side) => gp.find((o) => o.active && o.side === side && o.pos === L.POS.keeper) ?? null,
    restartTick: () => {},
    pickTaker: (side, state) => GRID_UNKNOWN.pickTaker(m, side, state),
    periodCheck: () => {
      if (m.period === 0 && m.clock >= 495 + m.stoppage) { m.period = 1; m.stoppage = 0; kickoffPositions(1); return 0; }
      return m.period === 1 && m.clock >= 990 + m.stoppage ? 2 : 0;
    },
    ballOut: (last) => ballOut(last),
    comment: (id) => { if (id === 0x1f78) st(m.carrier ? m.carrier.side : m.poss === -1 ? 0 : (m.poss as Side)).offsides++; },
    distToTarget: (bx, by, tx, ty) => L.dist(bx, by, tx, ty),
  };

  const ballOut = (last: Side) => {
    const bx = m.ballX, by = m.ballY;
    m.ballX = clampX(bx); m.ballY = clampY(by);
    m.state = 0; // ballOutOfPlay kræver åbent spil
    L.ballOutOfPlay(m, last, hooks);
    m.carrier = null; m.receiver = null; m.ballH = -1; m.ballSpeed = 0;
    if (m.pendingPass !== -1) { dbg('pass:out'); m.pendingPass = -1; }
    if (m.state === 3) { st(m.poss as Side).corners++; m.ballX = bx < 4 ? 0 : 8; m.ballY = goalRow(m.poss as Side); }
    else if (m.state === 4) { m.ballX = 4; m.ballY = m.poss === 0 ? 1 : 10; }
    else if (m.state === 2) m.ballX = bx < 0 ? 0 : bx > 8 ? 8 : bx;
  };

  const foul = (def: GP, car: GP) => {
    // dommeren (sub_6e9820, sikre regler i cm0102-original-rules.ts): strenghed i kampen, blæser han (type 42 = "usually given"),
    // og kortets alvor. Dommerens Discipline og +0x27 er *estimerede* (GRID_UNKNOWN.refDiscipline/ref27); udfordringstypen 42 er *estimeret*
    const U = GRID_UNKNOWN;
    const rf = refereeFactorInMatch(rand, U.refDiscipline, U.ref27, st(def.side).fouls);
    if (!foulGiven(rand, rf.factor, 42)) { dbg('foul:waved'); return; }
    st(def.side).fouls++; def.fouls++;
    const minute = Math.trunc(m.clock / 11);
    const sev = cardSeverity(rand, 42, def.fouls, U.refDiscipline, def.booked, minute, rf.overLimit);
    const card = rand(1000) < 1000 * GRID_UNKNOWN.cardShare ? cardFor(rand, sev, false, false) : null;
    if (card === 'yellow' && def.booked) { st(def.side).reds++; def.active = false; }
    else if (card === 'yellow') { st(def.side).yellows++; def.booked = true; }
    else if (card === 'red') { st(def.side).reds++; def.active = false; }
    if (inBoxOf(def.side, car.x, car.y)) restart(5, car.side, 4, def.side === 0 ? 1 : 10);
    else restart(6, car.side, car.x, car.y);
  };
  const duel = (def: GP, car: GP) => {
    if (!def.active || !car.active) return;
    const r = GRID_UNKNOWN.challenge(m, def, car, rand);
    if (r === 'won') takeBall(def);
    else if (r === 'foul') foul(def, car);
    def.busy++;
  };

  // pass ved setReceiver; bolden er hos modtageren efter rejsetiden
  const passHooks: L.PassHooks = {
    pass: () => true, // selve udførelsen ligger i doPass (sub_6fad40 – kun starten læst)
    offsidePlayer: (side, py, ty) => GRID_UNKNOWN.offsidePlayer(m, side, py, ty, null, rand),
    missedOffside: () => {},
  };

  const doPass = (p: GP, type: number, receiver: GP | null, tx: number, ty: number) => {
    st(p.side).passes++;
    // offside: sub_6fa260 (passWrapper) → sub_6cfd70 → sub_6ea760 (sikker) – originalen vurderer kun ved almindelige afleveringer
    // (indkast undtaget i sub_6fa260; målspark/hjørnespark går uden om i vores lim – "?")
    if (type !== ACTION.throwIn && type !== ACTION.goalKick && type !== ACTION.cornerKick) {
      L.passWrapper(m, p, type, receiver, ty, false, rand, hooks, passHooks);
      p.busy--; // passWrapper tæller busy op (0x6fa26f); limen gjorde det allerede i carrierTurn
      if (m.state === 7) { m.ballH = -1; m.ballSpeed = 0; m.pendingPass = -1; return; }
    }
    const r = GRID_UNKNOWN.passResult(m, p, type, tx, ty, !!receiver, rand);
    dbg('pr:' + r.kind + (receiver ? '' : ':space'));
    m.carrier = null;
    if (r.kind === 'cut') { m.pendingPass = -1; m.ballX = r.x; m.ballY = r.y; takeBall(r.by!); return; }
    m.pendingPass = p.side;
    m.ballX = r.x; m.ballY = r.y; m.ballH = 0; m.lastTouch = p.side; m.poss = -1;
    m.arrive = m.clock + Math.max(1, Math.ceil(L.dist(p.x, p.y, r.x, r.y) / 4));
    m.receiver = r.kind === 'ok' ? receiver : null;
    m.touchCount[p.side]++; if (m.touchCount[other(p.side)] > 0) m.touchCount[other(p.side)] -= 10;
  };

  const shoot = (p: GP, d: { action?: number; quality: number; special?: number }, header = false) => {
    const opp = other(p.side);
    const k = gp.find((o) => o.active && o.side === opp && o.pos === L.POS.keeper);
    const type = header ? SHOT.HEADER : d.action === ACTION.penaltyShot ? SHOT.PENALTY : d.action === ACTION.freeKickShot ? SHOT.FREE_KICK : SHOT.LOW_DRIVE;
    st(p.side).shots++;
    dbg('shotD' + Math.min(6, Math.round(L.dist(p.x, p.y, 4, goalRow(p.side)))) + ':s' + p.side + ':x' + p.x + 'y' + p.y);
    let lineResult: 0 | 1 | 2 = 0;
    let blocker: GP | null = null;
    if (type !== SHOT.PENALTY) for (const o of gp) {
      if (!o.active || o.side !== opp || o.pos === L.POS.keeper || o.busy > 1) continue;
      if (H.lineCells(p.x, p.y, 4, goalRow(p.side)).some(([x, y]) => x === o.x && y === o.y)) {
        const r = rand(1000);
        if (r < 1000 * GRID_UNKNOWN.blockP) { lineResult = 1; blocker = o; break; }
        if (r < 1000 * (GRID_UNKNOWN.blockP + GRID_UNKNOWN.deflectP)) lineResult = 2;
      }
    }
    const kv = k ? keeperValue({ base: keeperBase(k.gkRating, k.f.handling, k.f.agility, k.form), w3b: k.matchCA, reflexes: k.f.reflexes, goalsConceded: m.goals[opp === 0 ? 1 : 0],
      b8eaa: GRID_UNKNOWN.b8eaa, distToBall: L.dist(k.x, k.y, p.x, p.y), isKeeper: true, down: k.busy, side: opp, x: k.x, y: k.y, covers: H.keeperCovers(k.view!, p.x, p.y) }, p, type, rand) : { K: 0, state: 3, fumble: false };
    const out = shotOutcome({ S: d.quality, type, K: kv, param: d.special ?? 1, lineResult, rand });
    GRID_DEBUG.sumS = (GRID_DEBUG.sumS ?? 0) + d.quality; GRID_DEBUG.sumK = (GRID_DEBUG.sumK ?? 0) + kv.K; if (out.ratio !== undefined) { GRID_DEBUG.sumR = (GRID_DEBUG.sumR ?? 0) + out.ratio; dbg('nR'); }
    dbg(`k${kv.state}${k ? '' : 'none'}:s${p.side}`); dbg(`o:${out.outcome}:s${p.side}`); if (k) dbg(`kx${k.x}y${k.y}:s${opp}`);
    const onT = out.outcome === 'goal' || out.outcome === 'goalInOffWoodwork' || out.outcome === 'parried' || out.outcome === 'tippedForCorner' || out.outcome === 'held';
    if (onT) st(p.side).onTarget++;
    if (out.outcome === 'goal' || out.outcome === 'goalInOffWoodwork') {
      st(p.side).goals++; m.goals[p.side]++;
      m.stoppage += rand(Math.trunc(0.8 * 10)); kickoffPositions(opp); return;
    }
    if (out.outcome === 'retake') { restart(5, p.side, 4, opp === 0 ? 1 : 10); return; }
    if (out.outcome === 'held' && k) { m.carrier = null; m.ballX = k.x; m.ballY = k.y; takeBall(k); return; }
    if (out.outcome === 'tippedForCorner' || out.outcome === 'deflectedWide') { st(p.side).corners++; restart(3, p.side, p.x < 4 ? 0 : 8, goalRow(p.side)); return; }
    if (out.outcome === 'parried') { m.carrier = null; m.ballX = clampX((k?.x ?? 4) + rand(3) - 1); m.ballY = clampY(goalRow(p.side) + (p.side === 0 ? -1 : 1)); m.ballH = 0; m.poss = -1; m.arrive = m.clock + 1; return; }
    if (out.outcome === 'blocked' && blocker && rand(1000) < 1000 * GRID_UNKNOWN.blockCornerP) { st(p.side).corners++; restart(3, p.side, blocker.x < 4 ? 0 : 8, goalRow(p.side)); return; }
    if (out.outcome === 'blocked' && blocker) { m.carrier = null; m.ballX = blocker.x; m.ballY = blocker.y; m.ballH = 0; m.poss = -1; m.arrive = m.clock + 1; return; }
    restart(4, opp, 4, opp === 0 ? 1 : 10); // forbi: målspark
  };

  const recv = new Map<PassOption, GP | null>();
  const situation = (p: GP): Situation => {
    sync(m);
    const opp = other(p.side);
    const opps = gp.filter((o) => o.side === opp);
    const oppViews = opps.map((o) => o.view!);
    const inCell = opps.filter((o) => o.active && o.x === p.x && o.y === p.y);
    const pr = H.pressure(p.view!, inCell.map((o) => o.view!));
    const gr = goalRow(p.side);
    const D = L.dist(p.x, p.y, 4, gr);
    const attHalf = p.side === 0 ? p.y >= 6 : p.y < 6;
    const k = opps.find((o) => o.active && o.pos === L.POS.keeper);
    const [tx] = GRID_UNKNOWN.tacticalCell(m, p);
    const tacY = GRID_UNKNOWN.tacticalCell(m, p)[1];
    const ahead = p.side === 0 ? p.y - tacY : tacY - p.y;
    const nearestOpp = H.nearestOpponent(oppViews, p.x, p.y, true);
    // boldholderens "plads" (word +0x29), samme regel som ballCarrier.ts 0x7110f5 – uden de tilfældige tal
    let space = m.ballH === -1 ? 200 : pr.count === 0 ? Math.trunc(Math.min(nearestOpp, 3.5) * 60 + 57) : Math.max(-2000, Math.trunc(-(pr.count * Math.max(pr.w70, 0) ** 2) * 0.75 * 0.75));
    space += 70;
    p.view!.plads = space;
    const ps: PassState = { attackingSide: p.side, ballState: m.ballH, defLine: [m.lineSide1, m.lineSide0], teamFlags: m.teamFlags, competitionReputation: null, roleStaffId: [null, null],
      players: [gp.filter((o) => o.side === 0).map((o) => o.view!), gp.filter((o) => o.side === 1).map((o) => o.view!)] };
    const ref = new Map(gp.map((o) => [o.view!, o]));
    const ph: PassHelpers = {
      rand, dist: (dx, dy) => L.DIST[Math.min(11, dy)][Math.min(8, dx)],
      freeRun: (q) => GRID_UNKNOWN.freeRun(m, ref.get(q as never)!, rand),
      facingGoal: (q) => GRID_UNKNOWN.facingGoal(m, ref.get(q as never)!, rand),
      canSee: (_c, tx, ty, oppNear, mark) => GRID_UNKNOWN.canSee(m, p, tx, ty, true, oppNear, mark, true, rand),
      runTarget: (q) => { const t = GRID_UNKNOWN.runTarget(m, ref.get(q as never)!, rand); return t ? { x: t[0], y: t[1] } : null; },
      lineOfSight: (x, y, tx2, ty2, d) => H.footForTarget({ ...p.view!, x, y }, 0x5d, tx2, ty2, d).foot,
      spaceAhead: (q) => GRID_UNKNOWN.spaceAhead(m, ref.get(q as never)!),
      noDefenderGoalSide: (q) => H.noDefenderGoalSide(q as unknown as H.MatchPlayer, oppViews, inCell.length, false),
      onPitch: () => false,
    };
    const toOption = (c: ReturnType<typeof passOptions>): PassOption | null => {
      const o: PassOption = c.receiver
        ? { hasTarget: true, weight: c.weight, type: c.type ?? 0x0b, tx: c.x ?? c.receiver.x, ty: c.y ?? c.receiver.y }
        : { hasTarget: false, weight: c.weight, type: c.type ?? 0x0b, tx: c.x ?? p.x, ty: c.y ?? p.y };
      if (c.receiver) recv.set(o, ref.get(c.receiver as never) ?? null);
      return o;
    };
    let openPass: PassOption | null | undefined;
    const foot = H.footForTarget(p.view!, 0x16, 4, gr, D + 1);
    const ctx = () => ({ side: p.side, x: p.x, y: p.y, D, ballHeight: m.ballH, facingGoal: ph.facingGoal(p.view!), creativityRoll: p.roll.creativity, flairRoll: p.roll.flair,
      condition: p.condition, w29: Math.max(0, space), momentum: 0, form: p.form, prevAction: p.action, attrs: shotAttrs(p),
      keeper: k ? { x: k.x, y: k.y, side: opp, down: k.busy, distToShooter: L.dist(k.x, k.y, p.x, p.y), distToOwnGoal: L.dist(k.x, k.y, 4, gr) } : null, weather: 3, matchByte1: 0 });
    return {
      carrier: {
        side: p.side, x: p.x, y: p.y, dribbling: p.f.dribbling, finishing: p.f.finishing, flair: p.f.flair, freeKicks: p.f.freeKicks, heading: p.f.heading, longShots: p.f.longShots,
        teamwork: p.f.teamwork, decisionsRoll: p.roll.decisions, creativityRoll: p.roll.creativity, flairRoll: p.roll.flair, positioningRoll: p.roll.positioning, morale: 10, b11: 0,
        b2d: p.weakFootPenalty, condition: p.condition, momentum: 0, lastAction: p.action, isGoalkeeper: p.pos === L.POS.keeper, posFlags: p.pos, sideFlags: p.posAttack,
        runWithBall: false, holdUpBall: false, longShotsInstr: false, crossBall: false,
        professionalism: p.src.attrs[ATTRS.indexOf('professionalism')] || 10, sportsmanship: p.src.attrs[ATTRS.indexOf('sportsmanship')] || 10,
      },
      mode: 0, restart: m.state === 8 ? 0 : m.state, ballHeight: m.ballH, ballX: m.ballX, ballY: m.ballY, oppLastLine: p.side === 0 ? m.lineSide1 : m.lineSide0, D,
      nearestOpp, nearbyOpp: H.opponentsClose(oppViews, p.x, p.y, true), blockers: attHalf ? H.blockersOnLine(oppViews, p.x, p.y, 4, gr) : 0,
      pressure: pr.count, challenge: pr.w70,
      get pass() { if (openPass === undefined) openPass = m.state === 0 || m.state === 8 ? toOption(passOptions(ps, p.view!, p.x, p.y, -1, ph)) : null; return openPass; },
      setPiecePass: (code) => toOption(passOptions(ps, p.view!, p.x, p.y, code, ph)),
      shotScore: () => shotScore(ctx(), rand, m.state === 5 ? SHOT.PENALTY : m.state === 6 ? SHOT.FREE_KICK : 0xff).score,
      teammatesAhead: hooks.teammatesAhead(p), clearRun: GRID_UNKNOWN.freeRun(m, p, rand),
      oppKeeper: k ? { isRealKeeper: true, x: k.x, y: k.y, hasActed: k.busy !== 0, covers: H.keeperCovers(k.view!, p.x, p.y) } : null,
      oppInCell: inCell.length, committedOppInCell: 0, facingGoal: ph.facingGoal(p.view!), pastLastLine: L.beyondLine(m, p.side, p.y) >= 0,
      noDefenderGoalSide0: H.noDefenderGoalSide(p.view!, oppViews, inCell.length, false), noDefenderGoalSide1: H.noDefenderGoalSide(p.view!, oppViews, inCell.length, true),
      runTarget: (() => { const t = GRID_UNKNOWN.runTarget(m, p, rand); return t ? { found: true, tx: t[0], ty: t[1] } : { found: false, tx: p.x, ty: p.y }; })(),
      tacticalX: tx, beyondTactical: Math.max(0, ahead), clockTicks: m.clock, ownGoals: m.goals[p.side], oppGoals: m.goals[opp], lead: m.goals[p.side] - m.goals[opp],
      teamMode: m.aiMode[p.side], protectLead: false, oppOffsideTrap: (m.teamFlags[opp] & 0x400) !== 0,
      goalPathBlocked: H.isCrossingPosition(p.view!, 4, gr), sightCheckFails: foot.foot !== 2 && foot.foot !== p.strongFoot, possessionCounter: m.touchCount[p.side],
    };
  };

  function carrierTurn(p: GP): void {
    if (m.depth > 2) return; // sikkerhed: ingen kæde af afleveringer i samme tik
    m.depth++;
    try {
      const s = situation(p);
      const d = decideBallCarrier(s, rand);
      dbg('dec:' + d.kind + (m.state ? ':r' + m.state : ''));
      if (m.state !== 0) m.state = 0; // dødbolden er taget
      m.ballH = 0;
      p.busy++;
      switch (d.kind) {
        case 'pass': {
          const target = recv.get(d.pass) ?? null;
          p.action = d.action; doPass(p, d.pass.type, target, d.pass.tx, d.pass.ty); break;
        }
        case 'passToSpace': p.action = d.action; doPass(p, d.code, null, clampX(d.tx), clampY(d.ty)); break;
        case 'loftedBall': {
          p.action = d.action ?? 0x09;
          st(p.side).passes++;
          const r = GRID_UNKNOWN.lofted(m, p, d, rand);
          m.carrier = null;
          if (r.kind === 'header') {
            st(p.side).passesCompleted++;
            m.ballX = r.by.x; m.ballY = r.by.y; m.ballH = 4;
            const q = shotScore({ side: r.by.side, x: r.by.x, y: r.by.y, D: L.dist(r.by.x, r.by.y, 4, goalRow(r.by.side)), ballHeight: 4, facingGoal: true, creativityRoll: r.by.roll.creativity,
              flairRoll: r.by.roll.flair, condition: r.by.condition, w29: 100, momentum: 0, form: r.by.form, prevAction: 0, attrs: shotAttrs(r.by), keeper: null, weather: 3, matchByte1: 0 }, rand, SHOT.HEADER).score;
            shoot(r.by, { quality: q }, true);
          } else if (r.kind === 'corner') { m.pendingPass = -1; st(p.side).corners++; restart(3, p.side, p.x < 4 ? 0 : 8, goalRow(p.side)); }
          else { m.pendingPass = p.side; m.ballX = r.x; m.ballY = r.y; m.ballH = 0; m.poss = -1; m.arrive = m.clock + 2; m.lastTouch = p.side; }
          break;
        }
        case 'run': {
          p.action = d.action;
          const nx = clampX(p.x + Math.sign(d.tx - p.x)), ny = clampY(p.y + Math.sign(d.ty - p.y));
          if (nx !== p.x || ny !== p.y) p.facing = H.cellDirection(p.x, p.y, nx, ny);
          p.x = nx; p.y = ny; m.ballX = nx; m.ballY = ny;
          const def = gp.find((o) => o.active && o.side !== p.side && o.x === nx && o.y === ny && o.busy <= 1 && o.pos !== L.POS.keeper)
            // sub_6f09f0 fra 0x6f0e58 (boldholderens skridt/duel) er ikke læst: en ledig forsvarer ved siden af kan også gå ind i duellen
            ?? gp.find((o) => o.active && o.side !== p.side && o.busy <= 1 && o.pos !== L.POS.keeper && L.dist(o.x, o.y, nx, ny) <= 1.5 && rand(1000) < 1000 * GRID_UNKNOWN.runChallengeP);
          if (def) duel(def, p);
          break;
        }
        case 'hold': p.action = 0x10; { const def = p.markers[0] as GP | undefined; if (def) duel(def, p); } break;
        case 'shoot': {
          p.action = d.action ?? 0x16;
          if (m.state === 0 && d.action !== ACTION.penaltyShot && d.action !== ACTION.freeKickShot) {
            const near = gp.filter((o) => o.active && o.side !== p.side && o.pos !== L.POS.keeper && o.busy <= 1 && L.dist(o.x, o.y, p.x, p.y) <= GRID_UNKNOWN.preShotReach);
            const stopper = near.find((o) => rand(1000) < 1000 * GRID_UNKNOWN.preShotP * (0.5 + o.f.tackling / 30));
            if (stopper) { dbg('preShotStop'); stopper.busy++; if (rand(1000) < 1000 * GRID_UNKNOWN.foulP) foul(stopper, p); else takeBall(stopper); break; }
          }
          shoot(p, d); break;
        }
        case 'wouldShoot': break;
      }
    } finally { m.depth--; }
  }

  kickoffPositions(rand(2) as Side);
  let guard = 0;
  while (guard++ < 2000) {
    dbg('state' + m.state + (m.carrier ? 'C' : '') + (m.receiver ? 'R' : ''));
    if (!L.tick(m, rand, hooks)) break;
    // bolden uden for banen efter et løb/en aflevering
    if (m.state === 0 && (m.ballX < 0 || m.ballX > 8 || m.ballY < 0 || m.ballY > 11)) ballOut(m.lastTouch);
  }
  void passHooks;
  return { home: m.stats[0], away: m.stats[1], ticks: m.clock };
}

function shotAttrs(p: GP): ShotAttrs {
  return { agility: p.f.agility, balance: p.f.balance, strength: p.f.strength, technique: p.f.technique, flair: p.f.flair, finishing: p.f.finishing, heading: p.f.heading,
    longShots: p.f.longShots, freeKicks: p.f.freeKicks, passing: p.f.passing, penalties: p.f.penalties, leftFoot: p.leftFoot, rightFoot: p.rightFoot };
}
