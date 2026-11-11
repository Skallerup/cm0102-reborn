// Straffesparkskonkurrencen som i originalen – CM3_MATCH_ENGINE::run_penalty_shootout_step sub_6be710 (thiscall (mode), ret 4) og
// skytternes rækkefølge sub_6be520. Ét kald pr. tik (sub_6b98c0 0x6b9b0a: +0x8eb3 1–3 → sub_6be710(4), 4–6 → sub_6be710(3)).
//
// +0x8eb3 (m.shootout): 1/4 start, 2/5 et spark, 3/6 slut, 0 ingen. sub_6bd930 sætter 4 for turneringer med fixture+0x38 & 1 (almindelige
// cupkampe: straffe efter 90 eller 120 min.) og 1 for & 0x20 (MLS' "run-in" – Bosman-projektets season_match_grid.c). Kun tilstand 4–6
// (mode 3, det beregnede spark) er porteret; tilstand 1–3 (mode 4: sparket spilles i motoren med sub_7109f0) er ikke.
//
// Felterne: +0x8e9e siden, der sparker; +0x8e9f/+0x8ea0 spark taget pr. side; +0x8ea1/+0x8ea2 spark tilbage af de 5 (sudden death: begge
// sættes til 1, når begge er 0, og +0x8ea3 = 1); +0x1af + 11·side de 11 skytter (spillerens idx 0..19); +0x8eda[20·side + idx] "har sparket";
// +0xf5bc/+0xf5f2 straffemålene.

import { SHOT, keeperBase, keeperValue, shotOutcome, shotScore, type Outcome } from './shot';
import * as H from './helpers';
import * as L from './loop';
import { ATTRS } from '../../attributes';
import type { GP, GridMatchState } from './gridMatch';

type Side = 0 | 1;
type Rand = (n: number) => number;

export interface ShootoutKickRec { side: Side; taker: GP; keeper: GP | null; outcome: Outcome; goal: boolean; S: number; K: number }
export interface ShootoutState {
  first: Side;
  side: Side;                          // +0x8e9e
  taken: [number, number];             // +0x8e9f/+0x8ea0
  left: [number, number];              // +0x8ea1/+0x8ea2
  sudden: boolean;                     // +0x8ea3
  order: [(GP | null)[], (GP | null)[]];   // +0x1af
  score: [number, number];             // +0xf5bc / +0xf5f2
  kicks: ShootoutKickRec[];
}

export interface ShootoutEnv {
  m: GridMatchState;
  rand: Rand;
  /** sidens spillere i idx-rækkefølge (de 20 i truppen) */
  players: (s: Side) => GP[];
  /** computeren vælger (managerposten er ikke et menneske, eller mennesket har assistent – som 0x6c54a0) */
  ai: (s: Side) => boolean;
  /** menneskets straffeskytter (0x898040 → taktikkens liste; Tactic.penOrder) */
  humanOrder: (s: Side) => number[];
  /** sub_6ceb90(side, 5, excluded): den bedste straffeskytte, der ikke har sparket – null når ingen (originalen: 0) */
  pickTaker: (s: Side, excluded: Set<GP>) => GP | null;
  /** sub_6ce110(side): holdets keeper */
  keeper: (s: Side) => GP | null;
  /** sub_6f0630: skytten tager bolden */
  takeBall: (p: GP) => void;
  onKick?: (k: ShootoutKickRec, st: ShootoutState) => void;
}

/** sub_6be520 (sikker): de 11 skytter pr. side. Menneskets hold: taktikkens liste (0x898040; en manglende plads udfyldes med sub_6ceb90 som
 *  Bosman-projektets fill_missing_takers – originalen lader den stå på −1 *estimeret*); computerens: sub_6ceb90(side, 5, excluded) igen og igen,
 *  og når ingen er tilbage, ryddes "har sparket" for siden, og den samme plads tages om (0x6be697). */
export function shootoutOrder(env: ShootoutEnv): [(GP | null)[], (GP | null)[]] {
  const order: [(GP | null)[], (GP | null)[]] = [[], []];
  for (const s of [0, 1] as Side[]) {
    let ex = new Set<GP>();
    const human = !env.ai(s) ? env.humanOrder(s) : null;
    for (let k = 0; k < 11; k++) {
      if (human) {
        const p = human[k] !== undefined ? env.players(s).find((q) => q.src.id === human[k] && q.active && !ex.has(q)) ?? null : null;
        if (p) { order[s][k] = p; ex.add(p); continue; }
      }
      let p = env.pickTaker(s, ex);
      if (!p) { ex = new Set(); p = env.pickTaker(s, ex); }                        // 0x6be697: ryd og prøv samme plads igen
      order[s][k] = p; if (p) ex.add(p);
    }
  }
  return order;
}

/** Ét kald af sub_6be710 (mode 3 – det beregnede spark). Returnerer tilstanden; m.shootout = 0, når konkurrencen er slut. */
export function shootoutStep(env: ShootoutEnv, st: ShootoutState | null): ShootoutState | null {
  const { m, rand } = env;
  switch (m.shootout) {
    case 4: {                                                                         // 0x6be80b: ingen ventende hændelse, siden = rand(2)
      const side = rand(2) as Side;
      const s: ShootoutState = { first: side, side, taken: [0, 0], left: [5, 5], sudden: false, order: [[], []], score: [0, 0], kicks: [] };
      m.carrier = null; m.receiver = null; m.passTo = null; m.lastPasser = null; m.margin = 0; m.ballH = 0;
      s.order = shootoutOrder(env);                                                   // 0x6be8d7
      m.shootout = 5;
      return s;
    }
    case 5: return kick(env, st!);
    case 6: m.shootout = 0; return st;                                                // 0x6bee2d: kommentar 0x2004, fixture+0x49/+0x4a
    default: return st;
  }
}

/** 0x6be8f2–0x6bee2a (mode 3) */
function kick(env: ShootoutEnv, s: ShootoutState): ShootoutState {
  const { m, rand } = env;
  m.state = 0;
  if (s.left[0] === 0 && s.left[1] === 0) { s.left = [1, 1]; s.sudden = true; }   // 0x6be903
  const k = s.side, o = (1 - k) as Side;
  const taker = s.order[k][s.taken[k] % 11];
  const keeper = env.keeper(o);
  s.taken[k]++;
  if (!taker) { s.left[k]--; s.side = o; return endCheck(m, s); }                    // originalen: et objekt før sidens spillere (fejl)
  taker.busy = 0; if (keeper) keeper.busy = 0;                                       // 0x7160e0(p, 0)
  env.takeBall(taker);                                                              // 0x6f0630
  m.ballH = 0;                                                                      // +0x8ea9
  // presset: v = 2·(200 − rand(One on Ones +0x35)·(spark tilbage + 4)); skal score / kan vinde: v += rand(2,25v) / rand(0,75v)
  const oneOnOnes = taker.src.attrs[ATTRS.indexOf('oneOnOnes')] || 10;                                       // spillerpost +0x35 ("?" vist værdi som limens øvrige postfelter)
  let v = 2 * (200 - rand(oneOnOnes) * (s.left[k] + 4));
  const own = s.score[k], opp = s.score[o];
  if (opp > s.left[k] + own - 1) v += rand(Math.trunc(v * 2.25));                     // 0x6bea42 (kommentar 0x2005)
  else if (own + 1 > opp + s.left[o]) v += rand(Math.trunc(v * 0.75));               // 0x6bea83 (kommentar 0x2006)
  // mode 3 (0x6bead6): skudscoren sub_700bd0 med typen 0x33 (straffe), minus rand(v), så sub_702050(…, 3, 0, 0)
  const a = taker.f;
  const r = shotScore({
    side: k, x: taker.x, y: taker.y, D: 0, ballHeight: 0, facingGoal: true, creativityRoll: taker.roll.creativity, flairRoll: taker.roll.flair, condition: taker.condition,
    w29: 0, momentum: taker.momentum, form: taker.form, prevAction: taker.action,
    attrs: { agility: a.agility, balance: a.balance, strength: a.strength, technique: a.technique, flair: a.flair, finishing: a.finishing, heading: a.heading, longShots: a.longShots,
      freeKicks: a.freeKicks, passing: a.passing, penalties: a.penalties, leftFoot: taker.leftFoot, rightFoot: taker.rightFoot },
    keeper: keeper ? { x: keeper.x, y: keeper.y, side: o, down: keeper.busy, distToShooter: L.dist(keeper.x, keeper.y, taker.x, taker.y), distToOwnGoal: L.dist(keeper.x, keeper.y, 4, o === 0 ? 0 : 11) } : null,
    weather: 3, matchByte1: 0,
  }, rand, SHOT.PENALTY);
  const S = r.score - rand(v);
  const kv = keeper ? keeperValue({ base: keeperBase(keeper.gkRating, keeper.f.handling, keeper.f.agility, keeper.form), w3b: keeper.matchCA, reflexes: keeper.f.reflexes,
    goalsConceded: m.goals[k], b8eaa: m.ballSpeed, distToBall: L.dist(keeper.x, keeper.y, taker.x, taker.y), isKeeper: true, down: keeper.busy, side: o, x: keeper.x, y: keeper.y,
    covers: keeper.view ? H.keeperCovers(keeper.view, taker.x, taker.y) : false }, taker, SHOT.PENALTY, rand) : { K: 0, state: 3, fumble: false };
  const out = shotOutcome({ S, type: SHOT.PENALTY, K: kv, param: 3, lineResult: 0, rand });
  const goal = out.outcome === 'goal' || out.outcome === 'goalInOffWoodwork';
  if (goal) s.score[k]++;                                                           // sub_702050: +0xf5bc under konkurrencen
  const rec: ShootoutKickRec = { side: k, taker, keeper, outcome: out.outcome, goal, S, K: kv.K };
  s.kicks.push(rec);
  env.onKick?.(rec, s);
  m.carrier = null; m.poss = -1;
  s.left[k]--;                                                                      // 0x6bedcd
  s.side = o;                                                                       // 0x6bede3
  return endCheck(m, s);
}

/** 0x6bede9–0x6bee1f: slut, når den ene ikke kan indhentes */
function endCheck(m: GridMatchState, s: ShootoutState): ShootoutState {
  if (s.score[0] > s.score[1] + s.left[1] || s.score[1] > s.score[0] + s.left[0]) m.shootout = 6;
  return s;
}
