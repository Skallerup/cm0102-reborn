// Originalens kommentarkø (grid/matchEvents.ts: add_event 0x6d6f70, kombinationen 0x6d60b0, vejret 0x6d5d80, opfølgerne) mod
// 500 kald fra den instrumenterede original (tests/fixtures/grid-commentary-trace.json, ~/cm0102-engine/tools/match_trace.c c/z/C-linjer):
// med originalens egne tilfældige tal skal porten trække de samme rand(n), lave de samme indlejrede kald og ende i samme kø-tilstand.
// Og gittermotoren sender originalens begivenheder til live-kommentaren (adapter → CommentaryLine.ev/v → ui/matchTexts.ts).
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { MatchEvents, type MatchEventsEngine } from '../src/game/engine/grid/matchEvents';
import { EVENT_NAMES, EVENT_TABLE } from '../src/game/engine/grid/eventTable';
import { createGridMatch, randOf } from '../src/game/engine/grid/gridMatch';
import { createGame, type WorldData } from '../src/game/newgame';
import { squad } from '../src/game/state';
import { Rng } from '../src/game/rng';
import { aiTactic } from '../src/game/sim';
import type { Player } from '../src/game/types';

type Call = [number, number, number, number, number, number, number[], [number, number][], Call[], number[]];
const trace: { calls: Call[] } = JSON.parse(readFileSync('tests/fixtures/grid-commentary-trace.json', 'utf8'));

describe('Match_Events (originalens kommentarkø)', () => {
  it('trækker de samme tilfældige tal og ender i samme kø som originalen (500 kald)', () => {
    const eng: MatchEventsEngine = { ballX: 0, ballY: 0, b8eab: 0, shootout: 0, clock: 0, periodEnd: 0, shotMinute: -1, shotSide: 0 };
    const W = { lo: 0, hi: 0, pitch: 0, gate: true };
    let feed: [number, number][] = [], fi = 0;
    const asked: number[] = [], want: number[] = [];
    const me = new MatchEvents((n) => { asked.push(n); const e = feed[fi++]; return e ? e[1] : 0; }, eng, W);
    const flat = (c: Call, out: [number, number][]) => { for (const z of c[7]) out.push(z); for (const k of c[8]) flat(k, out); return out; };
    const kids = (c: Call): string => c[8].map((k) => `${k[0]}(${kids(k)})`).join(',');
    let got: string[] = [];
    const orig = me.add.bind(me);
    let depth = 0;
    me.add = (id, p1, s1, p2 = -1, s2 = -1, x = 0) => { if (depth > 0) got.push(`${id}@${depth}`); depth++; orig(id, p1, s1, p2, s2, x); depth--; };
    let states = 0, nested = 0, combos = 0;
    for (const c of trace.calls) {
      const e = c[6];
      Object.assign(eng, { ballX: e[0], ballY: e[1], b8eab: e[2], shootout: e[3], clock: e[4], periodEnd: e[5], shotMinute: e[6], shotSide: e[7] });
      Object.assign(W, { lo: e[10] & 0xff, hi: (e[10] >>> 8) & 0xff, pitch: e[9], gate: e[11] === 1 });
      me.b0 = e[12];
      feed = flat(c, []); fi = 0; got = [];
      for (const z of feed) want.push(z[0]);
      me.add(c[0], c[1], c[2], c[3], c[4], c[5]);
      expect(fi).toBe(feed.length);
      if (c[8].length) { nested++; expect(got.length).toBeGreaterThan(0); }
      if (kids(c)) combos++;
      const C = c[9];
      if (C.length) { expect([me.w6, me.w8, me.wa, me.we, me.b1, me.b2, me.b4, me.b5]).toEqual(C.slice(2, 10)); states++; }
    }
    expect(asked).toEqual(want);
    expect(states).toBe(trace.calls.length);
    expect(nested).toBeGreaterThan(10);   // kombinationer (add_event_at_front) og opfølgere (8639/8640/8675) er med
    expect(combos).toBe(nested);
  });

  it('tabellen har originalens 677 begivenheder og vægte (eff = floor(10·max/w))', () => {
    expect(EVENT_TABLE.length).toBe(677);
    expect(EVENT_NAMES[0x1f78 - 8000]).toBe('RESTART_OFFSIDE');
    expect(EVENT_TABLE[0][4].reduce((a, b) => a + b, 0)).toBe(70);       // WAIT: rand(70)
    const texts = JSON.parse(readFileSync('src/ui/data/matchTexts.json', 'utf8')) as Record<string, unknown[]>;
    EVENT_NAMES.forEach((n, i) => expect(texts[n]?.length, n).toBe(EVENT_TABLE[i][4].length));
  });
});

describe('gittermotorens kommentar', () => {
  it('sender originalens begivenheder (afspark, indkast, pausen, slutfløjt …) – samme tal med og uden at læse dem', () => {
    const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
    const eng = w.nations.findIndex((x) => x.name === 'England');
    const id = (n: string) => w.clubs.find((c) => c[1] === n)![0];
    createGame(w, { managerName: 'T', managerNation: eng, clubId: id('Arsenal'), activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
    const fresh = (c: number) => squad(c).map((p) => ({ ...p, attrs: p.attrs.slice(), condition: 100, injury: null, banned: 0 }) as Player);
    const [h, a] = [id('Manchester United'), id('Liverpool')];
    const run = (read: boolean) => {
      const rng = new Rng(11);
      const g = createGridMatch({ players: fresh(h), tactic: aiTactic(h, a, true) }, { players: fresh(a), tactic: aiTactic(a, h, false) }, randOf(() => rng.next()));
      const seen: string[] = [];
      const take = () => { const d = g.events.drain(); if (read) for (const e of d) seen.push(`${EVENT_NAMES[e.id - 8000]}:${e.variant}`); };
      while (g.tick()) take();
      take();
      return { seen, res: g.result(), draws: g.events.draws };
    };
    const r1 = run(true), r2 = run(false);
    expect(r1.res).toEqual(r2.res);
    expect(r1.draws).toBe(r2.draws);
    expect(r1.seen[0]).toMatch(/^START_MATCH:/);
    for (const k of ['RESTART_THROW_IN', 'HALF_TIME_WHISTLE', 'FINAL_WHISTLE', 'KICK_OFF']) expect(r1.seen.some((s) => s.startsWith(k + ':')), k).toBe(true);
    expect(r1.draws).toBeGreaterThan(50);
  }, 120_000);
});
