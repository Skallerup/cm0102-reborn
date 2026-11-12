// GridSim: gittermotoren (originalens kampmotor, gridMatch.ts) med LiveSim-fladen, så spillet (sim.ts makeMatch) og
// kampskærmene kan bruge den som zonemotoren. Registreres med setGridFactory (liveSim.ts) – kun når gridEngineOn(g).
//
// Ét step() = ét tik af originalens løkke (sub_6b98c0); minuttet = floor(tik/11) + 1 (990 tik ≈ 90 min, som m.clock), højst 45/90/105/120.
// Begivenheder kommer fra GridListener (ingen tilfældige tal), så tallene er de samme som runGridMatch.
// Udskiftninger (matchSubs.ts): computeren skifter selv (opts.aiSubs), menneskets substitute() sker ved næste dødbold; skadede bæres ud
// (sub_6d0b60). Forlænget spilletid og straffesparkskonkurrence som originalen (sub_6bd930, sub_6be710 – shootout.ts), når opts.needsWinner.
// *estimeret* (ikke originalens): assisten (den sidste medspiller, der afleverede); holdsnak findes ikke i originalen (applyTalk gør intet).
// Kommentaren: originalens kommentarkø (Match_Events, matchEvents.ts) kører inde i motoren ved originalens kaldsteder og trækker dens tilfældige
// tal; efter hvert tik læses de nye poster (drain) og bliver til linjer med begivenheden og varianten (CommentaryLine.ev/v), som UI'et viser
// uden eget valg (ui/matchTexts.ts). Begivenheder, hvis kaldsted endnu ikke er porteret (skud/mål, kort, frispark, udskiftninger, skader,
// straffesparkskonkurrencen), får stadig de *estimerede* linjetyper via MAP – se ENGINE_PORT_PLAN.md.

import type { Rng } from '../../rng';
import type { CommentaryLine, MatchEvent, MatchReport, MatchStatsSide, Player, ShootoutKick, ShotRecord, Tactic } from '../../types';
import type { EngineOptions, EngineTeam } from '../match';
import type { LiveSim, LiveSimPlayer, LiveSimTeam, LiveTeamView, PitchSnap } from '../liveSim';
import { createGridMatch, randOf, type GP, type GridManager, type GridMatch, type GridSideStats } from './gridMatch';
import { gs } from '../../state';
import { aiPickCtx, type AiPickCtx } from './aiTeam';
import { EVENT_NAMES } from './eventTable';

/** originalens begivenheder → UI'ets linjetype (fremhævning/lyd/mål-blink); resten er spil-for-spil ('pl-o', kun klassisk + playByPlay) */
const SEM: Record<string, { k: string; hi?: boolean }> = {
  START_MATCH: { k: 'kickoff', hi: true }, HALF_TIME_WHISTLE: { k: 'halftime', hi: true }, FINAL_WHISTLE: { k: 'fulltime', hi: true },
  END_OF_NINETY_MINUTES: { k: 'extratime', hi: true }, TIME_ADDED_ON: { k: 'added-time' }, RESTART_OFFSIDE: { k: 'offside' },
  RESTART_CORNER: { k: 'corner' }, PLAYER_KNACKERED: { k: 'knackered' }, KICK_OFF: { k: 'kick-off' },
  // kortene fra de forseelser, der er koblet til køen (sub_6f09f0, sub_716e10, sub_716c90) og computerens udskiftninger (sub_6e1090)
  YELLOW_CARD: { k: 'yellow' }, SECOND_YELLOW_CARD: { k: 'red' }, SENT_OFF: { k: 'red' }, SENT_OFF_FOR_PROFESSIONAL_FOUL: { k: 'red' },
  SUBSTITUTION: { k: 'sub' }, REPLACING_INJURED_PLAYER: { k: 'sub' },
  // skuddet sub_702050 (takeShot.ts): målet, redningerne, afbrænderne og blokeringerne står i køen – adapterens *estimerede* linjer er væk
  GOAL_SCORED: { k: 'goal', hi: true }, ILLEGAL_GOAL_ONE: { k: 'goal-offside', hi: true }, ILLEGAL_GOAL_TWO: { k: 'goal-offside', hi: true },
  GOAL_DISALLOWED: { k: 'goal-offside', hi: true },
  GOALKEEPER_PARRY: { k: 'save' }, GOALKEEPER_TIPPED: { k: 'save' }, GOALKEEPER_HELD: { k: 'save' }, GOOD_SAVE_HELD: { k: 'save' },
  GOOD_SAVE_NOT_HELD: { k: 'save' }, GREAT_SAVE_HELD: { k: 'save' }, GREAT_SAVE_NOT_HELD: { k: 'save' }, SAVES_PENALTY: { k: 'pen-saved', hi: true },
  MISSED_PENALTY: { k: 'pen-miss', hi: true },
  SHOT_WIDE: { k: 'wide' }, SHOT_WELL_WIDE: { k: 'wide' }, SHOT_JUST_WIDE: { k: 'wide' }, SHOT_OVER: { k: 'wide' }, SHOT_WELL_OVER: { k: 'wide' },
  SHOT_JUST_OVER: { k: 'wide' }, SHOT_OVER_WIDE: { k: 'wide' }, SHOT_WELL_OVER_WIDE: { k: 'wide' }, SHOT_WELL_OVER_HEADER: { k: 'wide' },
  SHOT_HITS_POST: { k: 'wide' }, SHOT_HITS_BAR: { k: 'wide' }, SHOT_CLIPS_POST: { k: 'wide' }, SHOT_CLIPS_BAR: { k: 'wide' },
  BLOCK_SHOT: { k: 'shot-blocked' }, BLOCK_SHOT_HEADER: { k: 'shot-blocked' }, RICHOCHET_SHOT: { k: 'shot-blocked' }, RICHOCHET_SHOT_HEADER: { k: 'shot-blocked' },
  WIN_THE_SHOOTOUT: { k: 'shootout-end', hi: true },
  WALL_BLOCKS_SHOT: { k: 'shot-blocked' }, WALL_DEFLECTS_SHOT: { k: 'shot-blocked' }, CLEARED_OFF_LINE: { k: 'shot-blocked' }, BLOCKED_ON_LINE: { k: 'shot-blocked' },
};

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
  /** spillerne på banen pr. plads (som MatchSim's t.on – en udskiftet erstattes af den nye) */
  private on: [LiveSimPlayer[], LiveSimPlayer[]] = [[], []];
  private off = new Set<number>();
  private bench: [number[], number[]] = [[], []];
  private pens?: [number, number];
  private extra = false;
  /** ctx.ai – samme array hele kampen, så UI'ets ændring af opts.aiSubs (fællesspil) når motoren */
  private ai: [boolean, boolean];
  private byIdx: [GP[], GP[]] = [[], []];

  constructor(home: EngineTeam, away: EngineTeam, opts: EngineOptions, r: Rng) {
    this.opts = opts;
    const mk = (t: EngineTeam, idx: number): LiveSimTeam => {
      const all: LiveSimPlayer[] = [];
      t.tactic.lineup.forEach((id, slot) => {
        const p = t.players.get(id); if (!p) return;
        const sp = this.makeSP(p, idx, slot, 0);
        all.push(sp); this.on[idx].push(sp);
      });
      return { club: t.club, tactic: t.tactic, stats: emptyStats(), all };
    };
    this.teams = [mk(home, 0), mk(away, 1)];
    const rand = randOf(() => r.next());
    this.ai = [opts.aiSubs?.[0] ?? true, opts.aiSubs?.[1] ?? true];
    const subs = opts.subs ?? 3;
    this.g = createGridMatch({ players: home.players, tactic: home.tactic }, { players: away.players, tactic: away.tactic }, rand, {
      ownGround: !opts.neutral,
      // klubbernes omdømme (originalens skala 0–10000; vores 0–100 ×100 – *estimeret*) og managerne fra den originale database (Staff.tac)
      rep: [home.club, away.club].map((c) => (gs().clubs[c]?.rep ?? 50) * 100) as [number, number],
      managers: [home.club, away.club].map((c) => { const st = gs().staff[gs().clubs[c]?.manager ?? -1]; return st?.tac ? { id: st.id, ca: st.ca ?? st.rep * 2, tac: st.tac } : null; }) as [GridManager | null, GridManager | null],
      // computerens holdudtagelse (aiTeam.ts): dato, spillets frø [0xdd7120] og managerens bedømmelse (viste Judging Ability/Potential)
      pick: [home.club, away.club].map((c) => aiPickCtx(c)) as [AiPickCtx | null, AiPickCtx | null],
      // computerstyret hold: sub_6c54a0 retter og skifter kun dem (menneskets hold ændres aldrig af motoren)
      ai: this.ai,
      subs: [subs, subs],
      needsWinner: opts.needsWinner,
      // engine+0x8ebb: originalen sætter den kun for kampen på kampskærmen (init_match's 4. argument fra match_screens.cpp, 0x6b53ba) –
      // her menneskets kamp med kommentar (den, der vises live); computerens kampe og laboratoriet kører som oraklet (0)
      watched: !!opts.commentary,
      date: gs().date,
      on: {
        goal: (p, assister, pen) => {
          const s = this.byId.get(p.src.id), a = assister ? this.byId.get(assister.src.id) : undefined;
          if (s) s.line.goals++;
          if (a && !pen) a.line.assists++;
          this.events.push({ m: this.minute, t: p.side, k: 'goal', p: p.src.id, ...(a && !pen ? { p2: a.p.id } : {}), ...(pen ? { pen: true } : {}) });
          // målets kommentar er originalens (GOAL_SCORED/GOAL_ONE/SCORED_PENALTY i køen, sub_702050) – kun stillingslinjen (UI'et) står her
          this.line('score', null, null, true);
        },
        shot: (p, outcome) => {
          const s = this.byId.get(p.src.id); if (s) { s.line.shots++; if (outcome !== 'blocked' && outcome !== 'deflectedWide' && outcome !== 'wide' && outcome !== 'overBar') s.line.on = (s.line.on ?? 0) + 1; }
          const o = SHOT_OUT[outcome] ?? 'off';
          this.shots.push({ m: this.minute, t: p.side, zone: this.zoneOf(p.x, p.y), xg: 0, outcome: o, p: p.src.id, kind: 'normal' });
          // redningen/afbrænderen/blokeringen står i køen (sub_702050, sub_70dfd0) – ingen *estimeret* linje oveni
        },
        card: (p, code, commented) => {
          const s = this.byId.get(p.src.id);
          // commented: originalens kortkommentar står i køen (originalLines) – ingen *estimeret* linje oveni
          if (code === 2) { if (s) s.line.yellow++; this.events.push({ m: this.minute, t: p.side, k: 'yellow', p: p.src.id }); if (!commented) this.line('yellow', p, null); }
          else { if (s) s.line.red = true; this.events.push({ m: this.minute, t: p.side, k: 'red', p: p.src.id }); if (!commented) this.line('red', p, null); }
        },
        // hjørnet, offside, pausen og forlænget spilletid: kommentaren er originalens (RESTART_CORNER/RESTART_OFFSIDE/HALF_TIME_WHISTLE/END_OF_NINETY_MINUTES)
        corner: (side) => { this.corners.push({ m: this.minute, t: side, taker: 0, lane: 0, moment: this.moment }); },
        extraTime: () => { this.extra = true; },
        // computerens udskiftninger (menneskets er registreret ved substitute())
        sub: (inn, out, auto) => { if (auto) this.recordSub(inn.side, out.src.id, inn.src.id, false); },   // SUBSTITUTION står i køen (0x6e18b9)
        // sub_6d0b60: båret ud skadet – rapportens skade (spillet giver ham en skade ud fra linjen)
        carriedOff: (p) => {
          const sp = this.byId.get(p.src.id); if (!sp || sp.line.injured) return;
          sp.line.injured = true;
          this.events.push({ m: this.minute, t: p.side, k: 'injury', p: p.src.id });
          this.line('injury', p, null);
        },
        penKick: (k, st) => {
          if (!this.shootout) { this.shootout = { score: [0, 0], kicks: [] }; this.line('shootout', null, null, true); }
          const out: ShootoutKick['outcome'] = k.goal ? 'goal' : SHOT_OUT[k.outcome] === 'saved' ? 'saved' : 'off';
          this.shootout.kicks.push({ t: k.side, p: k.taker.src.id, gk: k.keeper?.src.id ?? 0, outcome: out });
          this.shootout.score = [st.score[0], st.score[1]];
          // sparkets kommentar er originalens (sub_702050 med param 3 og sub_6be710's 0x2005/0x2006) – ingen *estimeret* linje
        },
      },
    });
    for (const p of this.g.m.gp) this.gpById.set(p.src.id, p);
    this.bench = [0, 1].map((s) => this.g.m.gp.filter((q) => q.side === s && q.slot === -1).map((q) => q.src.id)) as [number[], number[]];
    // spillerne efter indeks på holdet (MATCH_PLAYER+0x2e) – samme rækkefølge som gridMatch's idxOf
    this.byIdx = [0, 1].map((s) => this.g.m.gp.filter((q) => q.side === s)) as [GP[], GP[]];
  }

  private makeSP(p: Player, team: number, slot: number, enteredAt: number): LiveSimPlayer {
    const sp: LiveSimPlayer = {
      p, slot, cond: Math.max(0.3, Math.min(1, (p.condition ?? 100) / 100)), rating: 6.1, enteredAt,
      line: { id: p.id, team, rating: 6.1, goals: 0, assists: 0, minutes: 0, yellow: 0, red: false, injured: false, sub: enteredAt > 0, slot, shots: 0, tackles: 0, passes: 0, passesOk: 0, cond: p.condition ?? 100, tckA: 0, hea: 0, heaW: 0, on: 0 },
    };
    this.byId.set(p.id, sp);
    return sp;
  }

  /** en udskiftning i UI'ets lister (on/all/bænk/opstilling), begivenheden 'sub' og kommentaren */
  private recordSub(team: number, outId: number, inId: number, withLine = true) {
    const t = this.teams[team];
    const out = this.byId.get(outId), q = this.gpById.get(inId);
    if (!q) return;
    const slot = out?.slot ?? Math.max(0, q.slot);
    const sp = this.makeSP(q.src, team, slot, Math.max(1, this.minute));
    t.all.push(sp);
    const i = this.on[team].findIndex((s) => s.p.id === outId);
    if (i >= 0) this.on[team][i] = sp; else this.on[team].push(sp);
    if (out) out.line.minutes = Math.max(1, this.minute - out.enteredAt);
    this.off.add(outId);
    this.bench[team] = this.bench[team].filter((id) => id !== inId);
    t.tactic = { ...t.tactic, lineup: t.tactic.lineup.map((id) => (id === outId ? inId : id)), bench: t.tactic.bench.filter((id) => id !== inId) };
    this.events.push({ m: this.minute, t: team, k: 'sub', p: inId, p2: outId });
    if (withLine) this.line('sub', q, out ? this.gpById.get(outId) ?? null : null);
  }

  private line(k: string, a: GP | null, b: GP | null, hi = false) {
    if (!this.opts.commentary) return;
    this.commentary.push({ m: this.minute, k, a: a ? a.src.last || a.src.first : undefined, b: b ? b.src.last || b.src.first : undefined, t: a ? a.side : undefined, hi });
  }

  /** originalens kommentarposter fra tikket (Match_Events, læst passivt) → linjer med begivenhed og variant. Minuttet: uret ved tikkets start,
   *  højst periodens sidste minut (45/90/105/120) – pausens fløjt og et afspark i samme tik står begge på 45. */
  private originalLines(pe0: number) {
    const ents = this.g.events.drain();
    if (!this.opts.commentary) return;
    const cap0 = pe0 === 495 ? 45 : pe0 === 990 || pe0 === 0 ? 90 : pe0 === 1155 ? 105 : 120;
    const name = (side: number, idx: number) => { const q = idx >= 0 && (side === 0 || side === 1) ? this.byIdx[side][idx] : undefined; return q ? q.src.last || q.src.first : undefined; };
    for (const e of ents) {
      const ev = EVENT_NAMES[e.id - 8000];
      if (!ev) continue;
      const sem = SEM[ev];
      if (!sem && !this.opts.playByPlay) continue;
      this.commentary.push({
        m: Math.min(cap0, Math.floor(e.tick / TICKS_PER_MIN) + 1), k: sem?.k ?? 'pl-o', a: name(e.s1, e.p1), b: name(e.s2 >= 0 ? e.s2 : e.s1, e.p2), t: e.s1,
        ...(e.s2 >= 0 ? { t2: e.s2 } : {}), ...(e.extra ? { x: e.extra } : {}), ev, v: e.variant, ...(sem?.hi ? { hi: true } : {}),
      });
    }
  }

  /** gitterets felt → zonemotorens 15 zoner (5 bånd langs banen fra hjemmeholdets mål × 3 baner) */
  private zoneOf(x: number, y: number): number {
    const b = Math.max(0, Math.min(4, Math.floor(((y + 0.5) / 12) * 5)));
    const l = Math.max(0, Math.min(2, Math.floor(x / 3)));
    return b * 3 + l;
  }

  /** minuttet spilleren er ude af kampen (skiftet ud/udvist/båret ud), ellers det nuværende */
  private minutesOf(p: GP, sp: LiveSimPlayer): number {
    const st = this.g.subState(p);
    const end = st && !p.active ? [st.minuteOff, st.minuteRed, st.minuteInjured].filter((x) => x >= 0).sort((a, b) => a - b)[0] : undefined;
    const now = Math.min(this.extra ? 120 : 90, this.minute);
    // menneskets udskiftning bestilles straks, men sker først ved næste dødbold (0x6c54a0): motorens minuteOn tæller
    const start = st && st.minuteOn >= 0 ? st.minuteOn : sp.enteredAt;
    return Math.max(0, (end !== undefined ? Math.max(end, start) : now) - start);
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
      sp.line.minutes = this.minutesOf(p, sp);
    }
  }

  step(): boolean {
    if (this.finished) return false;
    this.ai[0] = this.opts.aiSubs?.[0] ?? true; this.ai[1] = this.opts.aiSubs?.[1] ?? true;
    const pe0 = this.g.m.periodEnd;
    const ok = this.g.tick();
    this.moment++;
    const m = this.g.m;
    this.half = m.period === 0 ? 1 : 2;
    const cap = m.periodEnd === 495 ? 45 : m.periodEnd === 990 || m.periodEnd === 0 ? 90 : m.periodEnd === 1155 ? 105 : 120;
    this.minute = Math.min(cap, Math.floor(m.clock / TICKS_PER_MIN) + 1);
    this.originalLines(pe0);
    if (this.extra) this.totalMoments = Math.max(this.totalMoments, this.moment + (m.shootout ? 1 : Math.max(0, 1320 - m.clock)));
    this.sync();
    if (!ok) this.end();
    return !this.finished;
  }

  private end() {
    this.minute = this.extra ? 120 : 90;
    this.sync();
    if (this.shootout) {
      this.pens = [this.shootout.score[0], this.shootout.score[1]];
      // WIN_THE_SHOOTOUT (0x2004, sub_6be710 0x6bee52) står i køen – ingen *estimeret* slutlinje
    }
    this.finished = true;
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
      et: this.extra || undefined,
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
    const r1 = (s: LiveSimPlayer) => Math.round(s.rating * 10) / 10;
    return {
      on: this.on[teamIdx].map((s) => {
        const p = this.gpById.get(s.p.id);
        // ude: udvist eller båret ud (en ventende udskiftning tæller allerede som sket)
        const out = p ? !p.active && !this.isPendingIn(s.p.id) : false;
        return { id: s.p.id, slot: s.slot, num: s.p.number, off: out, cond: Math.round(s.cond * 100), rating: r1(s), yellow: s.line.yellow, injured: s.line.injured, goals: s.line.goals, red: !!s.line.red, enteredAt: s.enteredAt };
      }),
      gone: t.all.filter((s) => !this.on[teamIdx].includes(s)).map((s) => ({ id: s.p.id, slot: s.slot, num: s.p.number, rating: r1(s), yellow: s.line.yellow, goals: s.line.goals, enteredAt: s.enteredAt })),
      bench: this.bench[teamIdx].slice(),
      subsLeft: this.g.subsLeft(teamIdx as 0 | 1),
      stats: t.stats,
      tactic: t.tactic,
    };
  }

  /** spilleren er skiftet ind, men motoren har endnu ikke haft en dødbold */
  private isPendingIn(id: number): boolean {
    const p = this.gpById.get(id);
    return !!p && p.slot === -1 && this.events.some((e) => e.k === 'sub' && e.p === id);
  }

  /** menneskets udskiftning: originalens grænser (udskiftninger tilbage, bænken, spilleren på banen eller båret ud); sker ved næste dødbold */
  substitute(teamIdx: number, outId: number, inId: number): boolean {
    if (this.finished || this.off.has(outId)) return false;
    if (!this.g.substitute(teamIdx as 0 | 1, outId, inId)) return false;
    this.recordSub(teamIdx, outId, inId);
    return true;
  }

  /** menneskets taktik: motorens taktik ændres ved næste dødbold (positionstabellen, instruktionerne, holdflagene) */
  setTactic(teamIdx: number, tactic: Tactic) {
    const t = this.teams[teamIdx];
    const lineup = this.on[teamIdx].map((s) => s.p.id);
    // pladserne i den nye opstilling for dem på banen (bænken og udskiftningerne styres af substitute)
    const slotOf = new Map(tactic.lineup.map((id, i) => [id, i] as [number, number]));
    for (const s of this.on[teamIdx]) { const i = slotOf.get(s.p.id); if (i !== undefined) { s.slot = i; s.line.slot = i; } }
    const lu = tactic.slots.map(() => 0); for (const s of this.on[teamIdx]) if (s.slot < lu.length) lu[s.slot] = s.p.id;
    t.tactic = { ...tactic, lineup: lineup.length ? lu : tactic.lineup.slice(), bench: t.tactic.bench.slice() };
    this.g.setTactic(teamIdx as 0 | 1, t.tactic);
    this.line('tactic-change', null, null);
  }

  /** holdsnak findes ikke i originalens motor (CM 01/02 har ingen) – ingen virkning */
  applyTalk(_teamIdx: number, _boosts: Record<number, number>) { /* ikke i originalens motor */ }
}

/** fabrikken til setGridFactory (liveSim.ts) */
export const gridFactory = (home: EngineTeam, away: EngineTeam, opts: EngineOptions, r: Rng): LiveSim => new GridSim(home, away, opts, r);
