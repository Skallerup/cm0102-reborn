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

import { SHOT, type Outcome } from './shot';
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
  queueMode: number;                   // engine+0x8ea4: kommentarkøens +0 før konkurrencen
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
  /** sub_6d6f70 add_event(id, p1, s1, −1, −1, 0) */
  ev: (id: number, p1: GP | null, s1: number) => void;
  /** Match_Events +0 (kø-tilstanden, konstruktøren 1) – konkurrencen gemmer den i engine+0x8ea4 og sætter 0 (0x6be779/0x6be852)
   *  og lægger den tilbage ved slut (0x6bee80/0x6bee8d) */
  queueMode: { get(): number; set(v: number): void };
  /** sub_6bba10 (inline 0x6be73c/0x6be813): den ventende hændelse (engine+0x475a..) ryddes */
  clearIncident: () => void;
  /** sub_700bd0 med forudindstillet type (0x6beae6: 0x33) – skudscoren og begivenheden (0x1f7f TAKE_PENALTY) */
  shotScore: (p: GP, preset: number) => { score: number; event: number };
  /** sub_702050(p, a1 type, a2 S, a3 begivenhed, a4 param, a5, a6) – takeShot.ts */
  takeShot: (p: GP, a1: number, a2: number, a3: number, a4: number, a5: number, a6: (GP | null)[]) => void;
  /** engine+0xf5bc + 0x36·side: straffemålene i konkurrencen (sub_702050 tæller dem, 0x707dc6) */
  penScore: (s: Side) => number;
  /** fixture+0x49/+0x4a: konkurrencens resultat (0x6bee62–0x6bee77) */
  setResult?: (home: number, away: number) => void;
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
    case 4: {                                                                         // 0x6be80b
      env.clearIncident();                                                            // 0x6be813–0x6be84b (sub_6bba10 inline)
      const saved = env.queueMode.get(); env.queueMode.set(0);                        // 0x6be852/0x6be85c: engine+0x8ea4 = kø+0; kø+0 = 0
      const side = rand(2) as Side;                                                   // 0x6be85f: +0x8e9e = rand(2)
      const s: ShootoutState = { first: side, side, taken: [0, 0], left: [5, 5], sudden: false, order: [[], []], score: [0, 0], kicks: [], queueMode: saved };
      // 0x6be86f–0x6be8b7: +0x1c5 = 0, +0x477e passTo, +0x8eaa boldfarten, +0x8ea9 højden, +0xf5aa/+0xf5a6 (modtager/aflever ved assisten),
      // +0xf576 lastPasser, +0xf57a receiver = 0, +0x8ea6/+0x8eb9 = 0xff, +0x8ed6 margin = 0, +0x91de = 0. Boldholderen +0xf582 røres IKKE
      // (før: m.carrier = null *estimeret*).
      m.passTo = null; m.ballSpeed = 0; m.ballH = 0; m.passRecv = null; m.passGiver = null; m.lastPasser = null; m.receiver = null; m.margin = 0;
      s.order = shootoutOrder(env);                                                   // 0x6be8d7
      m.shootout = 5;                                                                 // 0x6be8e3 (+0x8ea3 = 0)
      return s;
    }
    case 5: return kick(env, st!);
    case 6: {                                                                         // 0x6bee2d
      const s = st!;
      const h = env.penScore(0), a = env.penScore(1);
      env.ev(0x2004, null, h > a ? 0 : 1);                                            // 0x6bee52 WIN_THE_SHOOTOUT (jbe: +0xf5bc ≤ +0xf5f2 → side 1)
      env.setResult?.(h, a);                                                          // 0x6bee68/0x6bee77 fixture+0x49/+0x4a
      m.shootout = 0;                                                                 // 0x6bee86
      env.queueMode.set(s.queueMode);                                                 // 0x6bee8d: kø+0 = engine+0x8ea4
      return s;
    }
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
  // 0x6be9d7–0x6bea0a (sikker): presset v = 2·(200 − rand(One on Ones, spillerpost +0x35)·(spark tilbage + 4))
  const oneOnOnes = taker.src.attrs[ATTRS.indexOf('oneOnOnes')] || 10;                                       // spillerpost +0x35 ("?" vist værdi som limens øvrige postfelter)
  let v = 2 * (200 - rand(oneOnOnes) * (s.left[k] + 4));
  const own = env.penScore(k), opp = env.penScore(o);                               // 0x6bea19/0x6bea31: +0xf5bc + 0x36·side
  if (opp > s.left[k] + own - 1) {                                                  // 0x6bea42: skal score for at holde holdet inde
    if (!s.sudden) env.ev(0x2005, taker, k);                                        // 0x6bea60 NEEDS_TO_SCORE (kun før sudden death, +0x8ea3 = 0)
    v += rand(Math.trunc(v * 2.25));                                                // 0x6bea6a fmul 2,25 (0x968ec8) → ftol → rand 0x6beabb
  } else if (own + 1 > opp + s.left[o]) {                                           // 0x6bea83: vinder, hvis han scorer
    if (!s.sudden) env.ev(0x2006, taker, k);                                        // 0x6beaa1 SCORE_TO_WIN
    v += rand(Math.trunc(v * 0.75));                                                // 0x6beaab fmul 0,75 (0x969040)
  }
  // mode 3 (0x6bead6–0x6beb0d): sub_700bd0 med typen 0x33 (begivenheden 0x1f7f, S = rand(5·v) + 150), S −= rand(v), og
  // sub_702050(0x33, S, begivenheden, 3, 0, 0) (0x6beda9/0x6bedb0) – skuddet afgør udfaldet, kommentaren og +0xf5bc (0x707dc6)
  const sc = env.shotScore(taker, SHOT.PENALTY);
  const S = ((sc.score - rand(v)) << 16) >> 16;                                     // 0x6beaf8 (movsx ebp, ax; sub ebp, eax)
  const before = env.penScore(k);
  env.takeShot(taker, SHOT.PENALTY, S, sc.event, 3, 0, []);
  const goal = env.penScore(k) > before;
  s.score = [env.penScore(0), env.penScore(1)];
  const rec: ShootoutKickRec = { side: k, taker, keeper, outcome: goal ? 'goal' : 'held', goal, S, K: 0 };   // adapteren: mål / ikke mål
  s.kicks.push(rec);
  env.onKick?.(rec, s);
  // NB: den gamle m.carrier = null / m.poss = −1 her er fjernet – sub_6be710 rører dem ikke efter sub_702050
  s.left[k]--;                                                                      // 0x6bedcd
  s.side = o;                                                                       // 0x6bede3
  return endCheck(m, s);
}

/** 0x6bede9–0x6bee1f: slut, når den ene ikke kan indhentes */
function endCheck(m: GridMatchState, s: ShootoutState): ShootoutState {
  // 0x6bede9: +0xf5bc > +0x8ea2 + +0xf5f2 eller +0xf5f2 > +0x8ea1 + +0xf5bc → +0x8eb3 = 6 (mode 3; mode 4 → 3, 0x6bee13)
  if (s.score[0] > s.score[1] + s.left[1] || s.score[1] > s.score[0] + s.left[0]) m.shootout = 6;
  return s;
}
