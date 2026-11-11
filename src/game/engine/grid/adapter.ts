// GridSim: gittermotoren (originalens kampmotor, gridMatch.ts) med LiveSim-fladen, så spillet (sim.ts makeMatch) og
// kampskærmene kan bruge den som zonemotoren. Registreres med setGridFactory (liveSim.ts) – kun når gridEngineOn(g).
//
// Ét step() = ét tik af originalens løkke (sub_6b98c0); minuttet = floor(tik/11) + 1 (990 tik ≈ 90 min, som m.clock).
// Begivenheder kommer fra GridListener (ingen tilfældige tal), så tallene er de samme som runGridMatch.
// *estimeret* (ikke originalens): assisten (den sidste medspiller, der afleverede), skadens grænse (kondition < 50 % efter et knock),
// straffesparkskonkurrencen ved uafgjort i en kamp, der skal have en vinder (originalens forlængede spilletid og straffe er ikke porteret),
// udskiftninger (gittermotoren har dem ikke: substitute() giver false, AI'en skifter ikke).

import type { Rng } from '../../rng';
import type { CommentaryLine, MatchEvent, MatchReport, MatchStatsSide, ShootoutKick, ShotRecord, Tactic } from '../../types';
import type { EngineOptions, EngineTeam } from '../match';
import type { LiveSim, LiveSimPlayer, LiveSimTeam, LiveTeamView, PitchSnap } from '../liveSim';
import { createGridMatch, randOf, type GP, type GridMatch, type GridSideStats } from './gridMatch';

const TICKS_PER_MIN = 11;
const TOTAL_TICKS = 990;

const emptyStats = (): MatchStatsSide => ({
  goals: 0, shots: 0, onTarget: 0, xg: 0, possession: 50, corners: 0, fouls: 0, yellows: 0, reds: 0, offsides: 0, passes: 0, passesCompleted: 0,
  throwIns: 0, tackles: 0, tacklesWon: 0, headers: 0, headersWon: 0,
});

const SHOT_OUT: Record<string, ShotRecord['outcome']> = {
  goal: 'goal', goalInOffWoodwork: 'goal', parried: 'saved', held: 'saved', tippedForCorner: 'saved', blocked: 'blocked', deflectedWide: 'blocked',
};

export class GridSim implements LiveSim {
  readonly engine = 'original' as const;
  readonly teams: [LiveSimTeam, LiveSimTeam];
  readonly opts: EngineOptions;
  minute = 0;
  half = 1;
  moment = 0;
  totalMoments = TOTAL_TICKS;
  finished = false;
  commentary: CommentaryLine[] = [];
  events: MatchEvent[] = [];
  shots: ShotRecord[] = [];
  highlights: LiveSim['highlights'] = [];
  corners: LiveSim['corners'] = [];
  shootout?: { score: [number, number]; kicks: ShootoutKick[] };
  private g: GridMatch;
  private byId = new Map<number, LiveSimPlayer>();
  private gpById = new Map<number, GP>();
  private injured = new Set<number>();
  private pens?: [number, number];
  private r: Rng;

  constructor(home: EngineTeam, away: EngineTeam, opts: EngineOptions, r: Rng) {
    this.opts = opts;
    this.r = r;
    const mk = (t: EngineTeam, idx: number): LiveSimTeam => {
      const all: LiveSimPlayer[] = [];
      t.tactic.lineup.forEach((id, slot) => {
        const p = t.players.get(id); if (!p) return;
        const sp: LiveSimPlayer = {
          p, slot, cond: Math.max(0.3, Math.min(1, (p.condition ?? 100) / 100)), rating: 6.1, enteredAt: 0,
          line: { id: p.id, team: idx, rating: 6.1, goals: 0, assists: 0, minutes: 0, yellow: 0, red: false, injured: false, sub: false, slot, shots: 0, tackles: 0, passes: 0, passesOk: 0, cond: p.condition ?? 100, tckA: 0, hea: 0, heaW: 0, on: 0 },
        };
        all.push(sp); this.byId.set(p.id, sp);
      });
      return { club: t.club, tactic: t.tactic, stats: emptyStats(), all };
    };
    this.teams = [mk(home, 0), mk(away, 1)];
    const rand = randOf(() => r.next());
    this.g = createGridMatch({ players: home.players, tactic: home.tactic }, { players: away.players, tactic: away.tactic }, rand, {
      ownGround: !opts.neutral,
      // computerstyret hold: sub_6c54a0 retter kun dem (menneskets taktik ændres aldrig af motoren)
      ai: opts.aiSubs ?? [true, true],
      on: {
        goal: (p, assister, pen) => {
          const s = this.byId.get(p.src.id), a = assister ? this.byId.get(assister.src.id) : undefined;
          if (s) s.line.goals++;
          if (a && !pen) a.line.assists++;
          this.events.push({ m: this.minute, t: p.side, k: 'goal', p: p.src.id, ...(a && !pen ? { p2: a.p.id } : {}), ...(pen ? { pen: true } : {}) });
          this.line(pen ? 'goal-pen' : 'goal', p, assister, true);
          this.line('score', null, null, true);
        },
        shot: (p, outcome) => {
          const s = this.byId.get(p.src.id); if (s) { s.line.shots++; if (outcome !== 'blocked' && outcome !== 'deflectedWide' && outcome !== 'wide' && outcome !== 'overBar') s.line.on = (s.line.on ?? 0) + 1; }
          const o = SHOT_OUT[outcome] ?? 'off';
          this.shots.push({ m: this.minute, t: p.side, zone: this.zoneOf(p.x, p.y), xg: 0, outcome: o, p: p.src.id, kind: 'normal' });
          if (o === 'saved') this.line('save', p, null); else if (o === 'off') this.line('wide', p, null); else if (o === 'blocked') this.line('shot-blocked', p, null);
        },
        card: (p, code) => {
          const s = this.byId.get(p.src.id);
          if (code === 2) { if (s) s.line.yellow++; this.events.push({ m: this.minute, t: p.side, k: 'yellow', p: p.src.id }); this.line('yellow', p, null); }
          else { if (s) s.line.red = true; this.events.push({ m: this.minute, t: p.side, k: 'red', p: p.src.id }); this.line('red', p, null); }
        },
        knock: (p) => { this.gpById.set(p.src.id, p); },
        corner: (side) => { this.corners.push({ m: this.minute, t: side, taker: 0, lane: 0, moment: this.moment }); this.commentary.push({ m: this.minute, k: 'corner', t: side }); },
        offside: (side) => { this.commentary.push({ m: this.minute, k: 'offside', t: side }); },
        halftime: () => { this.half = 2; this.line('halftime', null, null, true); },
      },
    });
    for (const p of this.g.m.gp) this.gpById.set(p.src.id, p);
    this.line('kickoff', null, null);
  }

  private line(k: string, a: GP | null, b: GP | null, hi = false) {
    if (!this.opts.commentary) return;
    this.commentary.push({ m: this.minute, k, a: a ? a.src.last || a.src.first : undefined, b: b ? b.src.last || b.src.first : undefined, t: a ? a.side : undefined, hi });
  }

  /** gitterets felt → zonemotorens 15 zoner (5 bånd langs banen fra hjemmeholdets mål × 3 baner) */
  private zoneOf(x: number, y: number): number {
    const b = Math.max(0, Math.min(4, Math.floor(((y + 0.5) / 12) * 5)));
    const l = Math.max(0, Math.min(2, Math.floor(x / 3)));
    return b * 3 + l;
  }

  /** gitterets tal og spillernes karakter/kondition → UI'ets genstande (de samme genstande hele kampen) */
  private sync() {
    const m = this.g.m;
    this.teams.forEach((t, i) => {
      const s: GridSideStats = m.stats[i];
      Object.assign(t.stats, { goals: s.goals, shots: s.shots, onTarget: s.onTarget, corners: s.corners, fouls: s.fouls, yellows: s.yellows, reds: s.reds, offsides: s.offsides, passes: s.passes, passesCompleted: s.passesCompleted });
    });
    const tot = m.stats[0].passes + m.stats[1].passes;
    if (tot > 0) { this.teams[0].stats.possession = Math.round((100 * m.stats[0].passes) / tot); this.teams[1].stats.possession = 100 - this.teams[0].stats.possession; }
    for (const p of m.gp) {
      const sp = this.byId.get(p.src.id); if (!sp) continue;
      sp.rating = Math.max(1, Math.min(10, p.rating / 1000));
      sp.cond = Math.max(0, Math.min(1, p.condition / 10000));
      sp.line.rating = Math.round(sp.rating * 10) / 10;
      sp.line.cond = Math.round(sp.cond * 100);
      if (p.active) sp.line.minutes = Math.min(90, this.minute);
      // skade (*estimeret*): et knock, der sender konditionen under 50 %, tæller som en skade i rapporten
      if (p.b1c && p.condition < 5000 && !this.injured.has(p.src.id)) {
        this.injured.add(p.src.id); sp.line.injured = true;
        this.events.push({ m: this.minute, t: p.side, k: 'injury', p: p.src.id });
        this.line('injury', p, null);
      }
    }
  }

  step(): boolean {
    if (this.finished) return false;
    const ok = this.g.tick();
    this.moment++;
    this.minute = Math.min(this.half === 1 ? 45 : 90, Math.floor(this.g.m.clock / TICKS_PER_MIN) + 1);
    if (this.g.m.period >= 1) this.half = 2;
    this.sync();
    if (!ok) this.end();
    return !this.finished;
  }

  private end() {
    this.minute = 90;
    this.sync();
    const [hg, ag] = [this.g.m.stats[0].goals, this.g.m.stats[1].goals];
    if (this.opts.needsWinner?.(hg, ag)) this.penalties();
    this.line('fulltime', null, null, true);
    this.finished = true;
  }

  /** *estimeret*: straffesparkskonkurrence (5 hver, så sudden death) – originalens (sub_6be710) er ikke porteret */
  private penalties() {
    const kicks: ShootoutKick[] = [];
    const score: [number, number] = [0, 0];
    const takers = this.teams.map((t) => t.all.filter((s) => this.gpById.get(s.p.id)?.active !== false).map((s) => s.p.id));
    for (let i = 0; i < 30; i++) {
      const t = i % 2, n = Math.floor(i / 2);
      const p = takers[t][n % Math.max(1, takers[t].length)] ?? 0;
      const goal = this.r.next() < 0.75;
      if (goal) score[t]++;
      kicks.push({ t, p, gk: 0, outcome: goal ? 'goal' : 'saved' });
      if (i % 2 === 1 && n >= 4 && score[0] !== score[1]) break;
      if (n < 5 && i % 2 === 1) {
        const left = 4 - n;
        if (score[0] > score[1] + left || score[1] > score[0] + left) break;
      }
    }
    this.pens = score;
    this.shootout = { score, kicks };
  }

  runToEnd(): MatchReport {
    while (this.step()) { /* tik */ }
    return this.report();
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
      momentum: Array(19).fill(0),
      heat: [Array(15).fill(0), Array(15).fill(0)],
      zoneControl: Array(15).fill(0.5),
      mom: mom?.p.id ?? 0,
      commentary: this.commentary,
      pens: this.pens,
      shootout: this.shootout?.kicks,
      weather: this.opts.weather,
      pitch: this.opts.pitch,
      referee: this.opts.referee,
      formations: [this.teams[0].tactic.formation, this.teams[1].tactic.formation],
      engine: 'original',
    };
  }

  pitch(): PitchSnap {
    const m = this.g.m;
    const last = this.shots.at(-1);
    const ax = (y: number) => ((y + 0.5) / 12) * 100, ay = (x: number) => ((x + 0.5) / 9) * 100;
    return {
      zone: this.zoneOf(Math.max(0, Math.min(8, m.ballX)), Math.max(0, Math.min(11, m.ballY))),
      poss: m.poss === 1 ? 1 : 0,
      holder: (m.carrier as GP | null)?.src.id ?? 0,
      moment: this.moment,
      shot: last && last.m === this.minute ? { team: last.t, outcome: last.outcome, zone: last.zone } : null,
      players: m.gp.filter((p) => p.active).map((p) => ({
        id: p.src.id, team: p.side, num: p.src.number ?? p.slot + 1, gk: p.isKeeper, ax: ax(p.y), ay: ay(p.x), dx: ax(p.y), dy: ay(p.x), name: p.src.last,
      })),
    };
  }

  live(teamIdx: number): LiveTeamView {
    const t = this.teams[teamIdx];
    return {
      on: t.all.map((s) => {
        const p = this.gpById.get(s.p.id);
        return { id: s.p.id, slot: s.slot, num: s.p.number, off: p ? !p.active : false, cond: Math.round(s.cond * 100), rating: Math.round(s.rating * 10) / 10, yellow: s.line.yellow, injured: s.line.injured, goals: s.line.goals, red: !!s.line.red, enteredAt: s.enteredAt };
      }),
      gone: [],
      bench: t.tactic.bench.slice(),
      subsLeft: 0,
      stats: t.stats,
      tactic: t.tactic,
    };
  }

  /** gittermotoren har ingen udskiftninger endnu (sub_6d0b60/sub_6c54a0 er ikke porteret) */
  substitute(_teamIdx: number, _outId: number, _inId: number): boolean { return false; }
  setTactic(teamIdx: number, tactic: Tactic) { this.teams[teamIdx].tactic = tactic; }
  applyTalk(_teamIdx: number, _boosts: Record<number, number>) { /* ikke i originalens motor */ }
}

/** fabrikken til setGridFactory (liveSim.ts) */
export const gridFactory = (home: EngineTeam, away: EngineTeam, opts: EngineOptions, r: Rng): LiveSim => new GridSim(home, away, opts, r);
