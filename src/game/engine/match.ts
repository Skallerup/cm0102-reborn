// Zonebaseret matchmotor i CM3-stil.
//
// Banen er delt i 5 bånd (længde) × 3 baner (bredde) = 15 zoner i absolutte koordinater
// (hjemmeholdet angriber mod x=100). Hver spiller har en angrebs- og en forsvarsposition,
// afledt af formation og instruktioner, og "dækker" zoner med en gaussisk vægt.
// Hvert "moment" vælger boldholderen en handling (aflevering, dribling, indlæg, gennembrud,
// skud), og den afgøres som en duel mellem angriberens og forsvarerens attributter, justeret
// for overtal i zonen. Formationens form bestemmer derfor naturligt, hvor man vinder og
// taber kampen. Der er ingen særlige "exploit"-genveje – se docs/ENGINE.md.

import { A, fitFactor, slotFit, slotRole } from '../attributes';
import type { Rng } from '../rng';
import type {
  CommentaryLine, MatchEvent, MatchReport, MatchStatsSide, Player, PlayerInstructions, PlayerMatchLine,
  ShotRecord, Tactic, TeamInstructions,
} from '../types';

export interface EngineTeam {
  club: number;
  tactic: Tactic;
  players: Map<number, Player>;
  morale?: number; // holdmoral-bonus (-1..1)
}

export interface EngineOptions {
  commentary: boolean;
  neutral?: boolean;
  importance?: number; // 0-1
  /** Afgør om der skal findes en vinder ved dette resultat (forlænget + straffe) */
  needsWinner?: (hg: number, ag: number) => boolean;
  fixtureId?: number;
  /** Kampdato (bruges til midlertidige effekter som "tændt" efter en samtale) */
  date?: string;
  /** AI håndterer udskiftninger for hold 0/1 */
  aiSubs?: [boolean, boolean];
}

interface SP {
  p: Player;
  team: number;
  slot: number;
  eff: Float32Array;
  cond: number;
  instr: PlayerInstructions;
  ax: number; ay: number; dx: number; dy: number;
  off: boolean;
  yellow: number;
  line: PlayerMatchLine;
  rating: number;
  enteredAt: number;
}

interface ZoneEntry { sp: SP; w: number }

interface TeamRT {
  idx: number;
  club: number;
  tactic: Tactic;
  ti: TeamInstructions;
  on: SP[];
  benchIds: number[];
  subsLeft: number;
  players: Map<number, Player>;
  zAtt: ZoneEntry[][];
  zDef: ZoneEntry[][];
  wAtt: number[];
  wDef: number[];
  stats: MatchStatsSide;
  homeMult: number;
  moraleMult: number;
  all: SP[]; // alle der har været på banen
  /** AI-trænerens udgangspunkt for mentaliteten (til justeringer undervejs) */
  baseMentality?: number;
}

const ZB = 5;
const ZL = 3;
const NZ = ZB * ZL;
/** Global afslutningsskala (kalibreret mod ~2,7 mål/kamp, se scripts/calibrate.ts) */
const FINISH_SCALE = 1.34;
const zoneX = (b: number) => 10 + b * 20;
const zoneY = (l: number) => 16.67 + l * 33.33;

/** Dæmper niveauforskelle en smule: uden den bliver topholdene urealistisk dominerende (150 mål, 60-målsscorere) */
const SQUASH = 0.84;
const squash = (v: number) => 11 + (v - 11) * SQUASH;
const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
const logistic = (x: number) => 1 / (1 + Math.exp(-x));
const logit = (p: number) => Math.log(p / (1 - p));

function emptyStats(): MatchStatsSide {
  return { goals: 0, shots: 0, onTarget: 0, xg: 0, possession: 0, corners: 0, fouls: 0, yellows: 0, reds: 0, offsides: 0, passes: 0, passesCompleted: 0 };
}

export class MatchSim {
  readonly teams: [TeamRT, TeamRT];
  readonly opts: EngineOptions;
  private r: Rng;
  totalMoments: number;
  moment = 0;
  minute = 0;
  half = 1;
  extraTime = false;
  finished = false;
  poss = 0;
  zone = 7; // midten
  private breakaway: SP | null = null;
  private rebound: SP | null = null;
  private lastPasser: SP | null = null;
  private lastPasserMoment = -10;
  commentary: CommentaryLine[] = [];
  events: MatchEvent[] = [];
  shots: ShotRecord[] = [];
  momentum: number[] = [];
  heat: [number[], number[]] = [new Array(NZ).fill(0), new Array(NZ).fill(0)];
  zonePoss: number[] = new Array(NZ).fill(0);
  zoneTotal: number[] = new Array(NZ).fill(0);
  pens?: [number, number];
  private momentumBucket = 0;
  private bucketThreat = 0;

  constructor(home: EngineTeam, away: EngineTeam, opts: EngineOptions, r: Rng) {
    this.r = r;
    this.opts = opts;
    this.teams = [this.makeTeam(home, 0), this.makeTeam(away, 1)];
    const tempo = (this.teams[0].ti.tempo + this.teams[1].ti.tempo) / 2;
    this.totalMoments = Math.round(240 * (1 + 0.07 * (tempo - 1)));
    this.poss = r.chance(0.5) ? 0 : 1;
    this.line('kickoff', this.teams[this.poss].on[10]);
  }

  // ---------- opsætning ----------

  private makeTeam(t: EngineTeam, idx: number): TeamRT {
    const homeMult = this.opts.neutral ? 1 : idx === 0 ? 1.025 : 0.99;
    const rt: TeamRT = {
      idx,
      club: t.club,
      tactic: t.tactic,
      ti: t.tactic.team,
      on: [],
      benchIds: t.tactic.bench.slice(),
      subsLeft: 3,
      players: t.players,
      zAtt: [], zDef: [], wAtt: [], wDef: [],
      stats: emptyStats(),
      homeMult,
      moraleMult: 1 + (t.morale ?? 0) * 0.03,
      all: [],
    };
    t.tactic.lineup.forEach((id, slot) => {
      const p = t.players.get(id);
      if (p) rt.on.push(this.makeSP(rt, p, slot, 0));
    });
    this.buildZones(rt);
    return rt;
  }

  private makeSP(rt: TeamRT, p: Player, slot: number, minute: number): SP {
    const s = rt.tactic.slots[slot];
    const fit = fitFactor(slotFit(p, s));
    const consistency = p.attrs[A.consistency];
    const firedUp = p.fired && this.opts.date && p.fired >= this.opts.date ? 0.02 : 0;
    const form = clamp(this.r.normal(1 + firedUp, 0.065 * (1.2 - consistency / 20) * (firedUp ? 0.7 : 1)), 0.86, 1.12);
    const imp = this.opts.importance ? 0.97 + 0.06 * (p.attrs[A.importantMatches] / 20) * this.opts.importance + (1 - this.opts.importance) * 0.03 : 1;
    const morale = 0.95 + 0.1 * (p.morale / 20);
    const mult = fit * form * imp * morale * rt.homeMult * rt.moraleMult;
    const eff = new Float32Array(36);
    for (let i = 0; i < 36; i++) eff[i] = squash(p.attrs[i]) * mult;
    // Mentale/fysiske påvirkes mindre af forkert position
    const physMult = form * morale * rt.homeMult;
    for (const k of [A.pace, A.acceleration, A.stamina, A.strength, A.jumping, A.naturalFitness] as number[]) eff[k] = squash(p.attrs[k]) * physMult;
    const sp: SP = {
      p, team: rt.idx, slot, eff,
      cond: clamp(p.condition / 100, 0.3, 1),
      instr: rt.tactic.individual[slot],
      ax: 0, ay: 0, dx: 0, dy: 0,
      off: false, yellow: 0,
      rating: 6.2,
      enteredAt: minute,
      line: { id: p.id, team: rt.idx, rating: 6, goals: 0, assists: 0, minutes: 0, yellow: 0, red: false, injured: false, sub: minute > 0, slot, shots: 0, tackles: 0, passes: 0, passesOk: 0, cond: p.condition },
    };
    rt.all.push(sp);
    return sp;
  }

  /** Beregn zonedækning for et hold (efter formation, instruktioner og hvem der er på banen) */
  buildZones(rt: TeamRT) {
    const ti = rt.ti;
    rt.zAtt = Array.from({ length: NZ }, () => []);
    rt.zDef = Array.from({ length: NZ }, () => []);
    rt.wAtt = new Array(NZ).fill(0);
    rt.wDef = new Array(NZ).fill(0);
    for (const sp of rt.on) {
      if (sp.off) continue;
      const s = rt.tactic.slots[sp.slot];
      sp.instr = rt.tactic.individual[sp.slot] ?? sp.instr;
      const role = slotRole(s);
      let adv = 0;
      switch (role) {
        case 'GK': adv = 0; break;
        case 'CB': adv = 8; break;
        case 'FB': adv = 12 + sp.instr.runs * 7; break;
        case 'DM': adv = 7 + sp.instr.runs * 3; break;
        case 'CM': adv = 9 + sp.instr.runs * 5; break;
        case 'WM': adv = 11 + sp.instr.runs * 5; break;
        case 'AM': adv = 8 + sp.instr.runs * 5; break;
        case 'W': adv = 8 + sp.instr.runs * 5; break;
        case 'ST': adv = 6 + sp.instr.runs * 3; break;
      }
      if (role !== 'GK') adv += (ti.mentality - 2) * 3.5;
      const widthShift = s.side === 'C' ? 0 : (ti.width - 1) * 6 * (s.side === 'L' ? -1 : 1);
      let axr = clamp(s.x + adv, 2, 94);
      let ayr = clamp(s.y + widthShift, 3, 97);
      let dxr = role === 'GK' ? s.x : clamp(s.x - 6 - (2 - ti.mentality) * 3 + (ti.closingDown - 1) * 4, 3, 85);
      let dyr = clamp(s.y + (50 - s.y) * 0.15, 3, 97);
      if (rt.idx === 1) { axr = 100 - axr; ayr = 100 - ayr; dxr = 100 - dxr; dyr = 100 - dyr; }
      sp.ax = axr; sp.ay = ayr; sp.dx = dxr; sp.dy = dyr;
      const free = sp.instr.freeRole ? 1.4 : 1;
      const sxA = 16 * free, syA = 20 * free;
      const sxD = role === 'GK' ? 8 : 15, syD = role === 'GK' ? 14 : 19;
      for (let b = 0; b < ZB; b++) {
        for (let l = 0; l < ZL; l++) {
          const z = b * ZL + l;
          const wa = Math.exp(-(((zoneX(b) - axr) ** 2) / (2 * sxA * sxA) + ((zoneY(l) - ayr) ** 2) / (2 * syA * syA)));
          if (wa > 0.06 && role !== 'GK') { rt.zAtt[z].push({ sp, w: wa }); rt.wAtt[z] += wa; }
          const wd = Math.exp(-(((zoneX(b) - dxr) ** 2) / (2 * sxD * sxD) + ((zoneY(l) - dyr) ** 2) / (2 * syD * syD)));
          if (wd > 0.06) { rt.zDef[z].push({ sp, w: wd * (sp.instr.tightMarking ? 1.1 : 1) }); rt.wDef[z] += wd; }
        }
      }
    }
    // Hvis ingen er i en zone (fx efter røde kort) – nærmeste fallback
    for (let z = 0; z < NZ; z++) {
      if (rt.zAtt[z].length === 0) {
        const near = rt.on.filter((s) => !s.off && slotRole(rt.tactic.slots[s.slot]) !== 'GK').sort((a, b) => dist(a.ax, a.ay, z) - dist(b.ax, b.ay, z))[0];
        if (near) rt.zAtt[z].push({ sp: near, w: 0.05 });
      }
      if (rt.zDef[z].length === 0) {
        const near = rt.on.filter((s) => !s.off).sort((a, b) => dist(a.dx, a.dy, z) - dist(b.dx, b.dy, z))[0];
        if (near) rt.zDef[z].push({ sp: near, w: 0.05 });
      }
    }
  }

  // ---------- hjælpere ----------

  private a(sp: SP, i: number): number {
    return sp.eff[i] * (0.68 + 0.32 * sp.cond);
  }
  private rb(team: number, z = this.zone): number {
    const b = Math.floor(z / ZL);
    return team === 0 ? b : ZB - 1 - b;
  }
  private zoneFor(team: number, rb: number, lane: number): number {
    const b = team === 0 ? rb : ZB - 1 - rb;
    const l = team === 0 ? lane : ZL - 1 - lane;
    return b * ZL + l;
  }
  private laneOf(team: number, z = this.zone): number {
    const l = z % ZL;
    return team === 0 ? l : ZL - 1 - l;
  }
  private pick(list: ZoneEntry[], weight?: (sp: SP) => number, exclude?: SP): SP | null {
    let total = 0;
    for (const e of list) if (!e.sp.off && e.sp !== exclude) total += e.w * (weight ? weight(e.sp) : 1);
    if (total <= 0) return list.find((e) => !e.sp.off)?.sp ?? null;
    let x = this.r.next() * total;
    for (const e of list) {
      if (e.sp.off || e.sp === exclude) continue;
      x -= e.w * (weight ? weight(e.sp) : 1);
      if (x <= 0) return e.sp;
    }
    return list[list.length - 1].sp;
  }
  private gk(t: TeamRT): SP {
    return t.on.find((s) => !s.off && t.tactic.slots[s.slot].pos === 'GK') ?? t.on.find((s) => !s.off)!;
  }
  private overload(z: number, att: TeamRT, def: TeamRT): number {
    return 0.5 * Math.log((att.wAtt[z] + 0.45) / (def.wDef[z] + 0.45));
  }
  private rate(sp: SP | null, d: number) {
    if (sp) sp.rating += d;
  }
  private line(k: string, a?: SP | null, b?: SP | null, hi = false) {
    if (!this.opts.commentary) return;
    this.commentary.push({ m: this.minute, k, a: a ? name(a.p) : undefined, b: b ? name(b.p) : undefined, t: a ? a.team : undefined, hi });
  }

  // Sammensatte evner
  private passQ(s: SP) { return 0.45 * this.a(s, A.passing) + 0.2 * this.a(s, A.decisions) + 0.15 * this.a(s, A.technique) + 0.2 * this.a(s, A.creativity); }
  private pressQ(s: SP, t: TeamRT) { return 0.3 * this.a(s, A.anticipation) + 0.3 * this.a(s, A.positioning) + 0.2 * this.a(s, A.workRate) * (0.85 + t.ti.closingDown * 0.1) + 0.2 * this.a(s, t.ti.marking === 'man' ? A.marking : A.tackling); }
  private dribQ(s: SP) { return 0.4 * this.a(s, A.dribbling) + 0.2 * this.a(s, A.pace) + 0.15 * this.a(s, A.acceleration) + 0.15 * this.a(s, A.agility) + 0.1 * this.a(s, A.flair); }
  private tackQ(s: SP, t: TeamRT) { return (0.45 * this.a(s, A.tackling) + 0.2 * this.a(s, A.positioning) + 0.15 * this.a(s, A.pace) + 0.2 * this.a(s, A.anticipation)) * (1 + (t.ti.tackling - 1) * 0.04); }
  private aerial(s: SP) { return 0.45 * this.a(s, A.heading) + 0.35 * this.a(s, A.jumping) + 0.2 * this.a(s, A.strength); }
  private finQ(s: SP) { return 0.62 * this.a(s, A.finishing) + 0.13 * this.a(s, A.technique) + 0.1 * this.a(s, A.decisions) + 0.15 * this.a(s, A.anticipation); }
  private gkQ(s: SP) { return 0.35 * this.a(s, A.reflexes) + 0.25 * this.a(s, A.handling) + 0.2 * this.a(s, A.positioning) + 0.2 * this.a(s, A.agility); }
  private gk1v1(s: SP) { return 0.5 * this.a(s, A.oneOnOnes) + 0.3 * this.a(s, A.reflexes) + 0.2 * this.a(s, A.anticipation); }
  private runQ(s: SP) { return 0.4 * this.a(s, A.offTheBall) + 0.3 * this.a(s, A.pace) + 0.3 * this.a(s, A.anticipation); }

  // ---------- simulering ----------

  /** Kør et moment. Returnerer false når kampen er slut. */
  step(): boolean {
    if (this.finished) return false;
    const regular = this.totalMoments;
    const etMoments = Math.round(regular / 3);
    const limit = this.extraTime ? regular + etMoments : regular;
    if (this.moment >= limit) {
      if (!this.extraTime && this.opts.needsWinner?.(this.teams[0].stats.goals, this.teams[1].stats.goals)) {
        this.extraTime = true;
        this.line('extratime');
        this.kickoff(1);
      } else {
        if (this.extraTime && this.opts.needsWinner?.(this.teams[0].stats.goals, this.teams[1].stats.goals)) this.penaltyShootout();
        this.finish();
        return false;
      }
    }
    const i = this.moment;
    const minute = i < regular ? Math.floor((i * 90) / regular) + 1 : 90 + Math.floor(((i - regular) * 30) / etMoments) + 1;
    if (i === Math.floor(regular / 2)) {
      this.line('halftime');
      this.half = 2;
      this.kickoff(1);
      this.recoverHalftime();
    }
    this.minute = minute;
    this.tickFatigue();
    if (i % 12 === 0) this.aiManage();
    this.play();
    this.moment++;
    // momentum pr. 5 minutter
    const bucket = Math.floor((minute - 1) / 5);
    if (bucket !== this.momentumBucket) {
      this.momentum[this.momentumBucket] = Math.round(this.bucketThreat * 100) / 100;
      this.momentumBucket = bucket;
      this.bucketThreat = 0;
    }
    return true;
  }

  runToEnd(): MatchReport {
    while (this.step());
    return this.report();
  }

  private kickoff(team: number) {
    this.poss = team;
    this.zone = 7;
    this.breakaway = null;
    this.rebound = null;
  }

  private recoverHalftime() {
    for (const t of this.teams) for (const s of t.on) s.cond = Math.min(1, s.cond + 0.04);
  }

  private tickFatigue() {
    for (const t of this.teams) {
      const tf = 1 + 0.15 * (t.ti.tempo - 1) + 0.12 * (t.ti.closingDown - 1);
      for (const s of t.on) {
        if (s.off) continue;
        const isGK = t.tactic.slots[s.slot].pos === 'GK';
        const drain = 0.00143 * (1.3 - s.p.attrs[A.stamina] / 36) * (isGK ? 0.25 : tf) * (1 + 0.06 * (s.p.attrs[A.workRate] - 10) / 10) * (1.1 - s.p.attrs[A.naturalFitness] / 100);
        s.cond = Math.max(0.2, s.cond - drain);
      }
    }
  }

  private play() {
    const T = this.teams[this.poss];
    const O = this.teams[1 - this.poss];
    const z = this.zone;
    T.stats.possession++;
    this.heat[T.idx][z]++;
    this.zoneTotal[z]++;
    if (T.idx === 0) this.zonePoss[z]++;
    const rb = this.rb(T.idx);
    this.bucketThreat += (T.idx === 0 ? 1 : -1) * (rb === 4 ? 0.6 : rb === 3 ? 0.25 : 0);

    // Retur / gennembrud fra forrige moment
    if (this.rebound) {
      const s = this.rebound;
      this.rebound = null;
      this.shoot(T, O, s, 'rebound');
      return;
    }
    if (this.breakaway) {
      const s = this.breakaway;
      this.breakaway = null;
      if (this.r.chance(0.55)) { this.shoot(T, O, s, 'oneOnOne'); return; }
    }

    const carrier = this.pick(T.zAtt[z]);
    if (!carrier) { this.turnover(null); return; }
    // Løbende dueller/frispark uden for de egentlige aktioner
    if (this.r.chance(0.11)) {
      const def = this.pick(O.zDef[z]);
      if (def && this.foulCheck(T, O, carrier, def, true)) return;
    }
    const lane = this.laneOf(T.idx);
    const wide = lane !== 1;
    const ins = carrier.instr;
    const ti = T.ti;
    const r = this.r.next();

    if (rb <= 1) {
      const longP = [0.06, 0.15, 0.36][ti.passing];
      if (r < longP) return this.longBall(T, O, carrier);
      if (r < longP + 0.05 + (ins.runWithBall ? 0.05 : 0)) return this.dribble(T, O, carrier);
      return this.pass(T, O, carrier, 0.72 + 0.07 * (ti.tempo - 1) + 0.04 * (ti.mentality - 2) - (ti.passing === 0 ? 0.08 : 0) + (ti.passing === 2 ? 0.06 : 0));
    }
    if (rb === 2) {
      const throughP = (ins.throughBalls ? 0.11 : 0.04) + (this.a(carrier, A.creativity) - 10) / 250;
      const longP = [0.02, 0.06, 0.16][ti.passing];
      const dribP = 0.07 + (ins.runWithBall ? 0.08 : 0) + this.a(carrier, A.flair) / 300;
      const lsP = 0.02 + ins.longShots * 0.015;
      if (r < throughP) return this.throughBall(T, O, carrier);
      if (r < throughP + longP) return this.longBall(T, O, carrier);
      if (r < throughP + longP + dribP) return this.dribble(T, O, carrier);
      if (r < throughP + longP + dribP + lsP) return this.shoot(T, O, carrier, 'long');
      return this.pass(T, O, carrier, 0.62 + 0.06 * (ti.tempo - 1) + 0.04 * (ti.mentality - 2));
    }
    if (rb === 3) {
      const crossP = wide ? 0.18 + 0.12 * ins.crossing + 0.05 * (ti.width - 1) : 0;
      const lsP = 0.13 + 0.05 * ins.longShots + (this.a(carrier, A.longShots) - 10) / 200;
      const throughP = (ins.throughBalls ? 0.16 : 0.08) + (this.a(carrier, A.creativity) - 10) / 250;
      const dribP = 0.1 + (ins.runWithBall ? 0.08 : 0) + this.a(carrier, A.flair) / 300;
      let acc = crossP;
      if (r < acc) return this.cross(T, O, carrier);
      if (r < (acc += lsP)) return this.shoot(T, O, carrier, 'long');
      if (r < (acc += throughP)) return this.throughBall(T, O, carrier);
      if (r < (acc += dribP)) return this.dribble(T, O, carrier);
      return this.pass(T, O, carrier, 0.58 + 0.04 * (ti.mentality - 2));
    }
    // rb 4: feltet
    if (wide) {
      if (r < 0.4) return this.cross(T, O, carrier);
      if (r < 0.62) return this.shoot(T, O, carrier, 'boxWide');
      if (r < 0.78) return this.dribble(T, O, carrier);
      return this.pass(T, O, carrier, 0.0, true);
    }
    if (r < 0.6) {
      // midtbanespillere der løber med ind i feltet afslutter også – ellers scorer angriberen næsten alt
      if (this.r.chance(0.3)) {
        const late = this.pick(T.zAtt[this.zoneFor(T.idx, 3, lane)], (x) => Math.sqrt(this.finQ(x)) * (x.instr.runs + 1), carrier);
        if (late) { this.lastPasser = carrier; this.lastPasserMoment = this.moment; return this.shoot(T, O, late, 'box'); }
      }
      return this.shoot(T, O, carrier, 'box');
    }
    if (r < 0.74) return this.dribble(T, O, carrier);
    return this.pass(T, O, carrier, 0.0, true);
  }

  private pass(T: TeamRT, O: TeamRT, s: SP, forwardP: number, cutback = false) {
    const rb = this.rb(T.idx);
    const lane = this.laneOf(T.idx);
    let trb = rb, tl = lane, base: number;
    if (cutback) {
      trb = 4; tl = 1; base = 0.62;
    } else if (this.r.chance(forwardP) && rb < 4) {
      trb = rb + 1;
      base = rb <= 1 ? 0.86 : rb === 2 ? 0.77 : 0.7;
      // banevalg: bred taktik søger kanterne
      const wideP = 0.25 + 0.15 * T.ti.width;
      tl = this.r.chance(0.55) ? lane : lane === 1 ? (this.r.chance(wideP) ? (this.r.chance(0.5) ? 0 : 2) : 1) : 1;
    } else {
      const back = rb > 0 && this.r.chance(0.3);
      trb = back ? rb - 1 : rb;
      tl = lane === 1 ? (this.r.chance(0.5) ? 0 : 2) : 1;
      base = 0.92;
    }
    if (T.ti.passing === 0) base += 0.035;
    if (T.ti.passing === 2) base -= 0.03;
    const tz = this.zoneFor(T.idx, trb, tl);
    const def = this.pick(O.zDef[tz]);
    T.stats.passes++;
    s.line.passes++;
    const dq = def ? this.pressQ(def, O) : 6;
    const p = logistic(logit(base) + (this.passQ(s) - dq) / 4.5 + this.overload(tz, T, O) * 0.8 - (O.ti.closingDown - 1) * 0.12);
    if (this.r.chance(p)) {
      T.stats.passesCompleted++;
      s.line.passesOk++;
      this.rate(s, trb > rb ? 0.025 : 0.008);
      this.zone = tz;
      this.lastPasser = s;
      this.lastPasserMoment = this.moment;
      if (cutback) {
        const shooter = this.pick(T.zAtt[tz], (x) => Math.sqrt(this.finQ(x)), s);
        if (shooter) { this.lastPasser = s; this.shoot(T, O, shooter, 'cutback'); }
      }
      if (trb >= 3 && this.r.chance(0.04)) this.line('pass-forward', s);
    } else {
      this.rate(s, -0.04);
      this.rate(def, 0.05);
      if (def) def.line.tackles++;
      this.zone = tz;
      this.turnover(def);
    }
  }

  private longBall(T: TeamRT, O: TeamRT, s: SP) {
    const rb = this.rb(T.idx);
    const trb = Math.min(4, rb + 2 + (this.r.chance(0.3) ? 1 : 0));
    const lane = this.r.chance(0.5) ? 1 : this.r.chance(0.5) ? 0 : 2;
    const tz = this.zoneFor(T.idx, Math.min(3, trb), lane);
    const recv = this.pick(T.zAtt[tz], (x) => this.aerial(x) ** 2, s);
    const def = this.pick(O.zDef[tz], (x) => this.aerial(x) ** 2);
    T.stats.passes++;
    s.line.passes++;
    if (!recv) { this.zone = tz; this.turnover(def); return; }
    const pq = this.a(s, A.passing) * 0.6 + this.a(s, A.technique) * 0.4;
    const p = logistic(logit(0.42) + (this.aerial(recv) - (def ? this.aerial(def) : 5)) / 4 + (pq - 10) / 12 + this.overload(tz, T, O) * 0.6);
    this.zone = tz;
    if (this.r.chance(p)) {
      T.stats.passesCompleted++;
      s.line.passesOk++;
      this.rate(recv, 0.04);
      this.lastPasser = s;
      this.lastPasserMoment = this.moment;
      if (this.r.chance(0.06)) this.line('longball', s, recv);
    } else {
      this.rate(def, 0.05);
      this.turnover(def);
    }
  }

  private dribble(T: TeamRT, O: TeamRT, s: SP) {
    const rb = this.rb(T.idx);
    const def = this.pick(O.zDef[this.zone], (x) => this.tackQ(x, O));
    const dq = def ? this.tackQ(def, O) : 5;
    const p = logistic(logit(0.5) + (this.dribQ(s) - dq) / 4 + this.overload(this.zone, T, O) * 0.6);
    if (this.r.chance(p)) {
      this.rate(s, 0.07);
      if (rb < 4) {
        this.zone = this.zoneFor(T.idx, rb + 1, this.laneOf(T.idx));
        if (rb + 1 >= 3 && this.r.chance(0.18)) this.line('dribble', s, def);
      } else {
        this.line('dribble-box', s, def);
        this.shoot(T, O, s, 'box', 0.04);
      }
      return;
    }
    if (def) { def.line.tackles++; this.rate(def, 0.07); }
    this.rate(s, -0.03);
    if (def && this.foulCheck(T, O, s, def)) return;
    this.turnover(def);
  }

  private throughBall(T: TeamRT, O: TeamRT, s: SP) {
    const rb = this.rb(T.idx);
    const lane = this.laneOf(T.idx);
    const tz = this.zoneFor(T.idx, Math.min(4, rb + 1), lane === 1 ? 1 : this.r.chance(0.6) ? 1 : lane);
    const runner = this.pick(T.zAtt[tz], (x) => this.runQ(x) * (x.instr.runs + 1), s);
    if (!runner) return this.pass(T, O, s, 0.5);
    const def = this.pick(O.zDef[tz], (x) => this.a(x, A.positioning));
    T.stats.passes++;
    s.line.passes++;
    // Offside-fælde
    if (O.ti.offside && this.r.chance(clamp(0.24 - (this.a(runner, A.anticipation) - 10) / 90, 0.08, 0.35))) {
      T.stats.offsides++;
      this.rate(runner, -0.05);
      this.line('offside', runner);
      this.zone = this.zoneFor(T.idx, Math.min(4, rb + 1), 1);
      this.turnover(null);
      return;
    }
    const tq = 0.5 * this.a(s, A.creativity) + 0.3 * this.a(s, A.passing) + 0.2 * this.a(s, A.decisions);
    const dq = def ? 0.35 * this.a(def, A.positioning) + 0.35 * this.a(def, A.anticipation) + 0.3 * this.a(def, A.pace) : 5;
    const p = logistic(logit(0.36) + (0.5 * tq + 0.5 * this.runQ(runner) - dq) / 4 + (O.ti.offside ? 0.35 : 0) + this.overload(tz, T, O) * 0.4);
    if (this.r.chance(p)) {
      T.stats.passesCompleted++;
      s.line.passesOk++;
      this.rate(s, 0.1);
      this.lastPasser = s;
      this.lastPasserMoment = this.moment;
      this.zone = this.zoneFor(T.idx, Math.min(4, rb + 1), 1);
      if (rb + 1 >= 3) {
        this.line('throughball', s, runner);
        this.breakaway = runner;
      }
    } else {
      this.rate(s, -0.03);
      this.rate(def, 0.05);
      this.zone = tz;
      this.turnover(def);
    }
  }

  private cross(T: TeamRT, O: TeamRT, s: SP, setPiece = false, bonus = 0) {
    const boxZ = this.zoneFor(T.idx, 4, 1);
    const blocker = this.pick(O.zDef[this.zone]);
    const cq = 0.7 * this.a(s, setPiece ? A.corners : A.crossing) + 0.3 * this.a(s, A.technique);
    const deliver = logistic(logit(setPiece ? 0.72 : 0.62) + (cq - (blocker ? this.a(blocker, A.positioning) : 5)) / 5 + bonus);
    if (!this.r.chance(deliver)) {
      this.rate(s, -0.03);
      if (!setPiece && this.r.chance(0.5)) return this.corner(T, O);
      this.zone = boxZ;
      this.turnover(blocker);
      return;
    }
    const target = this.pick(T.zAtt[boxZ], (x) => this.aerial(x) ** 1.3 * (x.instr.runs + 1), s);
    const marker = this.pick(O.zDef[boxZ], (x) => this.aerial(x) ** 2);
    if (!target) { this.zone = boxZ; this.turnover(marker); return; }
    const gk = this.gk(O);
    const claim = setPiece ? 0.12 : 0.08;
    if (this.r.chance(claim * (this.a(gk, A.handling) / 12))) {
      this.rate(gk, 0.05);
      this.zone = boxZ;
      this.line('gk-claims', gk);
      this.turnover(gk);
      return;
    }
    const p = logistic(logit(setPiece ? 0.42 : 0.5) + (this.aerial(target) - (marker ? this.aerial(marker) : 5)) / 3.5 + this.overload(boxZ, T, O) * 0.5);
    if (this.r.chance(p)) {
      this.rate(s, 0.05);
      this.lastPasser = s;
      this.lastPasserMoment = this.moment;
      this.zone = boxZ;
      if (this.opts.commentary && this.r.chance(0.5)) this.line(setPiece ? 'corner-in' : 'cross', s, target);
      this.shoot(T, O, target, 'header');
    } else {
      this.rate(marker, 0.05);
      this.zone = boxZ;
      if (this.r.chance(0.42)) return this.corner(T, O);
      this.turnover(marker);
    }
  }

  private corner(T: TeamRT, O: TeamRT) {
    T.stats.corners++;
    const takerId = T.tactic.corners;
    const taker = T.on.find((x) => x.p.id === takerId && !x.off) ?? this.pick(T.zAtt[this.zoneFor(T.idx, 3, 1)]) ?? T.on[0];
    this.zone = this.zoneFor(T.idx, 4, this.r.chance(0.5) ? 0 : 2);
    if (this.r.chance(0.3)) this.line('corner', taker);
    this.cross(T, O, taker, true);
  }

  private foulCheck(T: TeamRT, O: TeamRT, victim: SP, def: SP, forced = false): boolean {
    const dirt = def.p.attrs[A.dirtiness] + this.a(def, A.aggression);
    // en spiller med gult kort holder igen i tacklingerne
    if (def.yellow > 0 && !forced && this.r.chance(0.6)) return false;
    const fp = forced ? 1 + (O.ti.tackling - 1) * 0.25 + (dirt - 20) / 40 - 0.25 : 0.11 + (O.ti.tackling - 1) * 0.05 + (dirt - 20) / 220;
    if (!this.r.chance(clamp(fp, 0.03, forced ? 1 : 0.35))) return false;
    O.stats.fouls++;
    this.rate(def, -0.05);
    this.injuryCheck(victim);
    // Kort
    const yp = (0.13 + 0.1 * (def.p.attrs[A.dirtiness] / 20) + (O.ti.tackling === 2 ? 0.05 : 0) - (def.p.attrs[A.temperament] - 10) / 200) * (def.yellow > 0 ? 0.3 : 1);
    if (this.r.chance(0.0012 + def.p.attrs[A.dirtiness] / 9000)) this.sendOff(O, def, false);
    else if (this.r.chance(yp)) this.book(O, def);
    const rb = this.rb(T.idx);
    const lane = this.laneOf(T.idx);
    if (this.poss !== T.idx) return true; // røde kort kan ikke flytte bolden; sikkerhed
    // kun en del af frisparkene i feltet er straffespark (~0,3 pr. kamp); resten er frispark lige uden for
    if (rb === 4 && this.r.chance(0.3)) {
      this.line('penalty', victim, def, true);
      const takerId = T.tactic.penalties;
      const taker = T.on.find((x) => x.p.id === takerId && !x.off) ?? victim;
      this.shoot(T, O, taker, 'pen');
      return true;
    }
    if (rb >= 3) {
      this.line('freekick', victim, def);
      const takerId = T.tactic.freeKicks;
      const taker = T.on.find((x) => x.p.id === takerId && !x.off) ?? victim;
      if (lane === 1 && this.r.chance(0.55)) this.shoot(T, O, taker, 'fk');
      else this.cross(T, O, taker, true, 0.2);
      return true;
    }
    if (this.r.chance(0.08)) this.line('foul', def, victim);
    return true; // bolden forbliver hos angriberne
  }

  private book(t: TeamRT, sp: SP) {
    sp.yellow++;
    t.stats.yellows++;
    this.rate(sp, -0.3);
    if (sp.yellow >= 2) {
      this.sendOff(t, sp, true);
      return;
    }
    sp.line.yellow = 1;
    this.events.push({ m: this.minute, t: t.idx, k: 'yellow', p: sp.p.id });
    this.line('yellow', sp, null, true);
  }

  private sendOff(t: TeamRT, sp: SP, second: boolean) {
    sp.off = true;
    sp.line.red = true;
    sp.line.yellow = second ? 1 : sp.line.yellow;
    t.stats.reds++;
    this.rate(sp, -1.5);
    this.events.push({ m: this.minute, t: t.idx, k: 'red', p: sp.p.id });
    this.line(second ? 'second-yellow' : 'red', sp, null, true);
    sp.line.minutes = this.minute - sp.enteredAt;
    this.buildZones(t);
  }

  private injuryCheck(sp: SP) {
    const p = 0.013 * (0.35 + sp.p.attrs[A.injuryProneness] / 12) * (sp.cond < 0.55 ? 1.6 : 1);
    if (!this.r.chance(p)) return;
    sp.line.injured = true;
    const t = this.teams[sp.team];
    this.events.push({ m: this.minute, t: t.idx, k: 'injury', p: sp.p.id });
    this.line('injury', sp, null, true);
    if (t.subsLeft > 0 && t.benchIds.length) {
      this.autoSub(t, sp);
    } else {
      sp.cond = Math.min(sp.cond, 0.35);
    }
  }

  private shoot(T: TeamRT, O: TeamRT, s: SP, kind: string, bonus = 0) {
    const z = this.zone;
    const base: Record<string, number> = { box: 0.145, boxWide: 0.055, long: 0.035, header: 0.095, oneOnOne: 0.33, cutback: 0.21, pen: 0.76, fk: 0.055, rebound: 0.24 };
    let xg = (base[kind] ?? 0.08) + bonus;
    if (kind === 'box' || kind === 'boxWide' || kind === 'header' || kind === 'long' || kind === 'cutback') {
      xg *= clamp(1.28 - 0.16 * O.wDef[z], 0.55, 1.3);
    }
    xg = clamp(xg, 0.01, 0.8);
    T.stats.shots++;
    T.stats.xg += xg;
    s.line.shots++;
    this.bucketThreat += (T.idx === 0 ? 1 : -1) * xg * 4;
    const gk = this.gk(O);
    const q = kind === 'header' ? this.aerial(s) * 0.6 + this.a(s, A.heading) * 0.4
      : kind === 'long' ? 0.7 * this.a(s, A.longShots) + 0.3 * this.a(s, A.technique)
      : kind === 'pen' ? 0.6 * this.a(s, A.penalties) + 0.2 * this.a(s, A.technique) + 0.2 * s.p.attrs[A.pressure]
      : kind === 'fk' ? 0.7 * this.a(s, A.freeKicks) + 0.3 * this.a(s, A.technique)
      : this.finQ(s);
    const gq = kind === 'oneOnOne' ? this.gk1v1(gk) : this.gkQ(gk);
    const mult = (kind === 'pen' ? 1.04 : FINISH_SCALE) * Math.exp((q - gq) / 13);
    const goalP = clamp(xg * mult, 0.004, 0.92);
    const assister = this.lastPasser && this.lastPasser !== s && this.lastPasser.team === T.idx && this.moment - this.lastPasserMoment <= 2 ? this.lastPasser : null;
    const rec: ShotRecord = { m: this.minute, t: T.idx, zone: z, xg: Math.round(xg * 100) / 100, outcome: 'off', p: s.p.id, kind };
    this.shots.push(rec);
    // Blokering
    if ((kind === 'box' || kind === 'long' || kind === 'boxWide') && this.r.chance(clamp(0.1 + 0.05 * O.wDef[z], 0.08, 0.3))) {
      rec.outcome = 'blocked';
      const blk = this.pick(O.zDef[z]);
      this.rate(blk, 0.06);
      this.line('shot-blocked', s, blk);
      if (this.r.chance(0.55)) return this.corner(T, O);
      this.turnover(blk);
      return;
    }
    if (this.r.chance(goalP)) {
      rec.outcome = 'goal';
      T.stats.onTarget++;
      this.goal(T, O, s, assister, kind);
      return;
    }
    const onT = clamp(0.19 + q / 70 + (kind === 'oneOnOne' ? 0.12 : 0) + (kind === 'pen' ? 0.5 : 0), 0.2, 0.92);
    if (this.r.chance((onT - goalP) / (1 - goalP))) {
      rec.outcome = 'saved';
      T.stats.onTarget++;
      this.rate(s, 0.08);
      this.rate(gk, 0.22 + xg * 0.8);
      if (assister) this.rate(assister, 0.08);
      this.line(kind === 'pen' ? 'pen-saved' : kind === 'header' ? 'header-saved' : xg > 0.25 ? 'bigsave' : 'save', s, gk, kind === 'pen' || xg > 0.25);
      if (kind === 'pen') this.events.push({ m: this.minute, t: T.idx, k: 'pen-miss', p: s.p.id });
      const rr = this.r.next();
      if (rr < 0.12) { const fol = this.pick(T.zAtt[z], (x) => Math.sqrt(this.finQ(x))); if (fol) { this.rebound = fol; return; } }
      if (rr < 0.48) return this.corner(T, O);
      this.zone = this.zoneFor(O.idx, 0, 1);
      this.poss = O.idx;
      return;
    }
    rec.outcome = 'off';
    this.rate(s, kind === 'oneOnOne' || kind === 'pen' ? -0.35 : -0.05);
    this.line(kind === 'pen' ? 'pen-miss' : kind === 'header' ? 'header-wide' : kind === 'oneOnOne' ? 'miss-1v1' : kind === 'long' ? 'long-wide' : 'wide', s, null, kind === 'pen' || kind === 'oneOnOne');
    if (kind === 'pen') this.events.push({ m: this.minute, t: T.idx, k: 'pen-miss', p: s.p.id });
    this.zone = this.zoneFor(O.idx, 0, 1);
    this.poss = O.idx;
  }

  private goal(T: TeamRT, O: TeamRT, s: SP, assister: SP | null, kind: string) {
    T.stats.goals++;
    s.line.goals++;
    this.rate(s, 1.0);
    if (assister && kind !== 'pen' && kind !== 'fk') {
      assister.line.assists++;
      this.rate(assister, 0.5);
    }
    const gk = this.gk(O);
    this.rate(gk, -0.25);
    for (const e of O.zDef[this.zone]) if (e.w > 0.35) this.rate(e.sp, -0.08);
    this.events.push({ m: this.minute, t: T.idx, k: 'goal', p: s.p.id, p2: assister && kind !== 'pen' ? assister.p.id : undefined });
    const key = kind === 'pen' ? 'goal-pen' : kind === 'header' ? 'goal-header' : kind === 'fk' ? 'goal-fk' : kind === 'long' ? 'goal-long' : kind === 'oneOnOne' ? 'goal-1v1' : 'goal';
    this.line(key, s, assister, true);
    this.line('score', null, null, true);
    // moral-sving
    T.moraleMult = Math.min(1.06, T.moraleMult + 0.01);
    O.moraleMult = Math.max(0.94, O.moraleMult - 0.008);
    this.kickoff(O.idx);
  }

  private turnover(winner: SP | null) {
    const O = this.teams[1 - this.poss];
    this.poss = O.idx;
    this.lastPasser = null;
    // Kontra
    if (O.ti.counter) {
      const rb = this.rb(O.idx);
      if (rb <= 2 && this.r.chance(0.32)) {
        const T2 = this.teams[1 - O.idx];
        const runner = this.pick(O.zAtt[this.zoneFor(O.idx, Math.min(4, rb + 2), 1)], (x) => this.a(x, A.pace) ** 2);
        const chaser = this.pick(T2.zDef[this.zoneFor(O.idx, Math.min(4, rb + 2), 1)], (x) => this.a(x, A.pace));
        if (runner) {
          const p = logistic((this.a(runner, A.pace) + this.a(runner, A.acceleration) - (chaser ? this.a(chaser, A.pace) + this.a(chaser, A.acceleration) : 10)) / 6 + 0.3 * Math.log((T2.wDef[this.zoneFor(O.idx, 3, 1)] + 0.4) ** -1 + 1));
          if (this.r.chance(p * 0.55)) {
            this.zone = this.zoneFor(O.idx, Math.min(3, rb + 2), 1);
            this.line('counter', winner ?? runner, runner);
            if (this.r.chance(0.35)) this.breakaway = runner;
          }
        }
      }
    }
  }

  // ---------- udskiftninger ----------

  substitute(teamIdx: number, outId: number, inId: number): boolean {
    const t = this.teams[teamIdx];
    if (t.subsLeft <= 0) return false;
    const out = t.on.find((s) => s.p.id === outId && !s.off);
    const p = t.players.get(inId);
    if (!out || !p || !t.benchIds.includes(inId)) return false;
    const sp = this.makeSP(t, p, out.slot, this.minute);
    out.off = true;
    out.line.minutes = this.minute - out.enteredAt;
    t.on[t.on.indexOf(out)] = sp;
    t.benchIds = t.benchIds.filter((id) => id !== inId);
    t.subsLeft--;
    t.tactic = { ...t.tactic, lineup: t.tactic.lineup.map((id) => (id === outId ? inId : id)) };
    this.events.push({ m: this.minute, t: teamIdx, k: 'sub', p: inId, p2: outId });
    this.line('sub', sp, out);
    this.buildZones(t);
    return true;
  }

  setTactic(teamIdx: number, tactic: Tactic) {
    const t = this.teams[teamIdx];
    // Pladser kan være byttet om
    t.tactic = { ...tactic, lineup: t.tactic.lineup.slice(), bench: t.tactic.bench.slice() };
    t.ti = tactic.team;
    // omplacér spillere på banen efter ny opstilling
    tactic.lineup.forEach((id, slot) => {
      const sp = t.on.find((s) => s.p.id === id && !s.off);
      if (sp && sp.slot !== slot) {
        sp.slot = slot;
        const fit = fitFactor(slotFit(sp.p, tactic.slots[slot]));
        const oldFit = sp.eff[A.passing] / Math.max(0.01, sp.p.attrs[A.passing]);
        for (let i = 0; i < 36; i++) sp.eff[i] = (sp.eff[i] / oldFit) * fit;
      }
    });
    t.tactic.lineup = t.on.filter((s) => !s.off).reduce((arr, s) => { arr[s.slot] = s.p.id; return arr; }, tactic.slots.map(() => 0));
    this.buildZones(t);
    this.line('tactic-change', null, null);
  }

  private autoSub(t: TeamRT, out: SP) {
    const slot = t.tactic.slots[out.slot];
    const cands = t.benchIds.map((id) => t.players.get(id)!).filter(Boolean);
    if (!cands.length) return;
    const best = cands.sort((a, b) => fitFactor(slotFit(b, slot)) * b.ca - fitFactor(slotFit(a, slot)) * a.ca)[0];
    this.substitute(t.idx, out.p.id, best.id);
  }

  private aiManage() {
    if (this.minute < 46) return;
    for (const t of this.teams) if (this.opts.aiSubs?.[t.idx]) this.aiShift(t);
    if (this.minute < 55) return;
    for (const t of this.teams) {
      if (!this.opts.aiSubs?.[t.idx]) continue;
      if (t.subsLeft <= 0) continue;
      const chance = this.minute >= 80 ? 0.6 : this.minute >= 68 ? 0.45 : 0.3;
      if (!this.r.chance(chance)) continue;
      const cands = t.on.filter((s) => !s.off && t.tactic.slots[s.slot].pos !== 'GK');
      const worst = cands.sort((a, b) => a.cond * 10 + a.rating - (b.cond * 10 + b.rating))[0];
      if (worst && (worst.cond < 0.72 || worst.rating < 6.1)) this.autoSub(t, worst);
    }
  }

  /** AI-træneren reagerer på stillingen: jagter udligning eller lukker kampen */
  private aiShift(t: TeamRT) {
    const o = this.teams[1 - t.idx];
    const diff = t.stats.goals - o.stats.goals;
    const base = (t.baseMentality ??= t.ti.mentality);
    let want = base;
    if (diff < 0 && this.minute >= 55) want = Math.min(4, base + (this.minute >= 75 || diff <= -2 ? 2 : 1));
    else if (diff > 0 && this.minute >= 70) want = Math.max(0, base - (diff === 1 && this.minute >= 82 ? 2 : 1));
    if (want === t.ti.mentality) return;
    const chasing = want > base;
    const ti: TeamInstructions = { ...t.ti, mentality: want, counter: chasing ? false : want < base || t.ti.counter, tempo: chasing ? 2 : t.ti.tempo };
    t.ti = ti;
    t.tactic = { ...t.tactic, team: ti };
    this.buildZones(t);
    const capt = t.on.find((s) => !s.off && s.p.id === t.tactic.captain) ?? t.on.find((s) => !s.off) ?? null;
    this.line(chasing ? 'ai-push' : want < base ? 'ai-shut' : 'tactic-change', capt, null);
    // jagter: skift en ekstra angriber ind for den svageste midtbanespiller
    if (chasing && t.subsLeft > 0 && this.minute >= 60) {
      const bench = t.benchIds.map((id) => t.players.get(id)).filter((p): p is Player => !!p && p.pos[0] < 15);
      const att = bench.sort((a, b) => b.attrs[A.finishing] + b.attrs[A.offTheBall] - (a.attrs[A.finishing] + a.attrs[A.offTheBall]))[0];
      const out = t.on.filter((s) => !s.off && ['DM', 'M', 'WB'].includes(t.tactic.slots[s.slot].pos)).sort((a, b) => a.rating - b.rating)[0];
      if (att && out && att.attrs[A.finishing] >= 11) this.substitute(t.idx, out.p.id, att.id);
    }
  }

  // ---------- straffe ----------

  private penaltyShootout() {
    const score: [number, number] = [0, 0];
    const takers = this.teams.map((t) => t.on.filter((s) => !s.off).sort((a, b) => this.a(b, A.penalties) - this.a(a, A.penalties)));
    this.line('shootout', null, null, true);
    let round = 0;
    while (round < 30) {
      for (let ti = 0; ti < 2; ti++) {
        const t = this.teams[ti];
        const s = takers[ti][round % takers[ti].length];
        const gk = this.gk(this.teams[1 - ti]);
        const p = clamp(0.75 * Math.exp((0.7 * this.a(s, A.penalties) + 0.3 * s.p.attrs[A.pressure] - this.gkQ(gk)) / 22), 0.5, 0.92);
        const scored = this.r.chance(p);
        if (scored) score[ti]++;
        this.line(scored ? 'so-score' : 'so-miss', s, gk);
        void t;
      }
      round++;
      if (round >= 5 && score[0] !== score[1]) break;
      if (round < 5) {
        const left = 5 - round;
        if (score[0] > score[1] + left || score[1] > score[0] + left) break;
      }
    }
    this.pens = score;
    this.line('shootout-end', null, null, true);
  }

  // ---------- afslutning ----------

  private finish() {
    this.finished = true;
    this.momentum[this.momentumBucket] = Math.round(this.bucketThreat * 100) / 100;
    this.line('fulltime', null, null, true);
    const [h, a] = this.teams;
    const tot = h.stats.possession + a.stats.possession;
    h.stats.possession = Math.round((h.stats.possession / tot) * 100);
    a.stats.possession = 100 - h.stats.possession;
    h.stats.xg = Math.round(h.stats.xg * 100) / 100;
    a.stats.xg = Math.round(a.stats.xg * 100) / 100;
    const endMin = this.extraTime ? 120 : 90;
    for (const t of this.teams) {
      const opp = this.teams[1 - t.idx];
      const res = Math.sign(t.stats.goals - opp.stats.goals);
      for (const s of t.all) {
        if (!s.line.red && !s.off) s.line.minutes = endMin - s.enteredAt;
        else if (s.off && s.line.minutes === 0) s.line.minutes = Math.max(1, this.minute - s.enteredAt);
        let r = s.rating + res * 0.25;
        const role = slotRole(t.tactic.slots[s.slot]);
        if (opp.stats.goals === 0 && (role === 'GK' || role === 'CB' || role === 'FB') && s.line.minutes >= 60) r += 0.35;
        // korte indhop trækkes mod 6
        const w = Math.min(1, s.line.minutes / 60);
        r = 6.2 + (r - 6.2) * w;
        s.line.rating = Math.round(clamp(r, 1, 10) * 10) / 10;
        s.line.cond = Math.round(s.cond * 100);
      }
    }
  }

  report(): MatchReport {
    const all = [...this.teams[0].all, ...this.teams[1].all];
    const mom = all.slice().sort((a, b) => b.line.rating - a.line.rating)[0];
    return {
      fixture: this.opts.fixtureId ?? 0,
      home: this.teams[0].club,
      away: this.teams[1].club,
      stats: [this.teams[0].stats, this.teams[1].stats],
      players: all.map((s) => s.line),
      events: this.events,
      shots: this.shots,
      momentum: this.momentum.map((v) => v ?? 0),
      heat: this.heat,
      zoneControl: this.zonePoss.map((v, i) => (this.zoneTotal[i] ? Math.round((v / this.zoneTotal[i]) * 100) / 100 : 0.5)),
      mom: mom?.p.id ?? 0,
      commentary: this.commentary,
      et: this.extraTime || undefined,
      pens: this.pens,
      formations: [this.teams[0].tactic.formation, this.teams[1].tactic.formation],
    };
  }

  /** Aktuelle on-pitch spillere (til live UI) */
  live(teamIdx: number) {
    const t = this.teams[teamIdx];
    return {
      on: t.on.map((s) => ({ id: s.p.id, slot: s.slot, off: s.off, cond: Math.round(s.cond * 100), rating: Math.round(clamp(s.rating, 1, 10) * 10) / 10, yellow: s.yellow, injured: s.line.injured, goals: s.line.goals })),
      bench: t.benchIds.slice(),
      subsLeft: t.subsLeft,
      stats: t.stats,
      tactic: t.tactic,
    };
  }
}

function dist(x: number, y: number, z: number) {
  const b = Math.floor(z / ZL), l = z % ZL;
  return (zoneX(b) - x) ** 2 + (zoneY(l) - y) ** 2;
}

function name(p: Player) {
  return p.last || p.first;
}

/** Hurtig simulering uden kommentarer */
export function quickMatch(home: EngineTeam, away: EngineTeam, opts: Omit<EngineOptions, 'commentary'>, r: Rng): MatchReport {
  const sim = new MatchSim(home, away, { ...opts, commentary: false, aiSubs: opts.aiSubs ?? [true, true] }, r);
  return sim.runToEnd();
}

/** Zoneprofil for et hold – bruges af assistentens modstanderanalyse og den gennemsigtige motor */
export function zoneProfile(team: EngineTeam, asHome = true): { att: number[]; def: number[]; attQ: number[]; defQ: number[] } {
  const dummyRng = { next: () => 0.5, normal: (m: number) => m, chance: () => false } as unknown as Rng;
  const sim = new MatchSim(asHome ? team : team, team, { commentary: false, neutral: true }, dummyRng);
  const t = sim.teams[0];
  const q = (list: ZoneEntry[], f: (s: SP) => number) => {
    let s = 0, w = 0;
    for (const e of list) { s += f(e.sp) * e.w; w += e.w; }
    return w ? s / w : 0;
  };
  return {
    att: t.wAtt.map((v) => Math.round(v * 100) / 100),
    def: t.wDef.map((v) => Math.round(v * 100) / 100),
    attQ: t.zAtt.map((l) => Math.round(q(l, (s) => (s.eff[A.passing] + s.eff[A.dribbling] + s.eff[A.finishing] + s.eff[A.creativity]) / 4) * 10) / 10),
    defQ: t.zDef.map((l) => Math.round(q(l, (s) => (s.eff[A.tackling] + s.eff[A.marking] + s.eff[A.positioning] + s.eff[A.anticipation]) / 4) * 10) / 10),
  };
}

export const ZONES = { bands: ZB, lanes: ZL, count: NZ };
