import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { guessIntent } from '../src/ai/fallback';
import { counterPlan } from '../src/game/aitactics';
import { createGame, type WorldData } from '../src/game/newgame';
import { applyPress, invitePress } from '../src/game/press';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs, squad } from '../src/game/state';
import { clubStrategy } from '../src/game/strategy';
import { newTactic } from '../src/game/tactics';
import { cliques } from '../src/game/will';
import { SCORE_LIMITS, computeSeasonScore } from '../src/game/rating';

let world: WorldData;
beforeAll(() => {
  world = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData;
  const ni = (n: string) => world.nations.findIndex((x) => x.name === n);
  createGame(world, { managerName: 'Test', managerNation: ni('Denmark'), clubId: 190, activeNations: [ni('Denmark'), ni('England')], lang: 'da', masking: true, seed: 5 });
});

describe('fritekst uden AI', () => {
  it('gætter hensigten ud fra nøgleord', () => {
    expect(guessIntent('Flot kamp i går, godt gået!')).toBe('praise');
    expect(guessIntent('Det var skuffende og ikke godt nok')).toBe('criticise');
    expect(guessIntent('Du får en bøde for det her')).toBe('fine');
    expect(guessIntent('Hvordan har familien det?')).toBe('chat');
  });
});

describe('taktisk modspil', () => {
  it('modstanderens offensive opstilling giver lav blok og kontra (når træneren tilpasser sig)', () => {
    const g = gs();
    g.tactic = newTactic('4-2-4', 4);
    const me = g.userClub;
    const ai = Object.values(g.clubs).find((c) => c.league === g.clubs[me].league && c.id !== me && c.manager > 0)!;
    let adapted = 0, counters = 0;
    // hash pr. dato: prøv en række datoer – en del af trænerne tilpasser sig
    for (let d = 1; d <= 28; d++) {
      g.date = `2025-08-${String(d).padStart(2, '0')}`;
      const plan = counterPlan(ai.id, me, -5, '4-4-2', 2);
      if (Object.keys(plan.team).length) { adapted++; if (plan.team.counter) counters++; }
    }
    expect(adapted).toBeGreaterThan(5);
    expect(counters).toBe(adapted);
  });
});

describe('klubstrategier og omklædningsrum', () => {
  it('storklubber er "big", danske klubber udvikler/sælger', () => {
    const g = gs();
    const top = Object.values(g.clubs).sort((a, b) => b.rep - a.rep)[0];
    expect(clubStrategy(top)).toBe('big');
    const dk = g.clubs[g.userClub];
    expect(['develop', 'seller']).toContain(clubStrategy(dk));
  });

  it('grupperinger har en leder blandt medlemmerne', () => {
    const g = gs();
    for (const c of cliques(g.userClub)) {
      expect(c.members.length).toBeGreaterThanOrEqual(3);
      expect(c.members).toContain(c.leader);
    }
  });
});

describe('pressemøder', () => {
  it('inviterer, anvender effekter deterministisk og rydder op', () => {
    const g = gs();
    g.date = '2025-07-20';
    // spil frem til første kamp er færdig og find et pressemøde
    let guard = 0;
    while (!g.press && guard++ < 120) {
      const r = continueGame();
      if (r.match !== undefined) quickPlayUserMatch();
    }
    if (!g.press) {
      const f = Object.values(g.fixtures).find((x) => x.result && (x.home === g.userClub || x.away === g.userClub))!;
      invitePress(f, 'post');
      if (!g.press) g.press = { fixture: f.id, phase: 'post', opp: f.home === g.userClub ? f.away : f.home, date: g.date, expires: g.date, topics: [{ id: 'board', kind: 'board', params: { conf: 30 } }] };
    }
    const pc = g.press!;
    const before = squad(g.userClub).reduce((s, p) => s + p.morale, 0);
    const res = applyPress(pc.topics.map((tp) => ({ topic: tp.id, tone: tp.kind === 'starPlayer' || tp.kind === 'slump' || tp.kind === 'unsettled' ? 'backPlayer' : 'confident' })), 'Overskrift', 'Brødtekst');
    expect(res).toBe('ok');
    expect(g.press).toBeNull();
    expect(g.news[0].key).toBe('press.report');
    expect(squad(g.userClub).reduce((s, p) => s + p.morale, 0)).toBeGreaterThanOrEqual(before);
  }, 60_000);
});

describe('Manager Score', () => {
  it('prognosen holder sig inden for grænserne, og summen passer', () => {
    const s = computeSeasonScore(true)!;
    expect(s).toBeTruthy();
    for (const l of s.lines) {
      const [lo, hi] = SCORE_LIMITS[l.key];
      expect(l.pts).toBeGreaterThanOrEqual(lo);
      expect(l.pts).toBeLessThanOrEqual(hi);
    }
    expect(s.lines.reduce((a, l) => a + l.pts, 0)).toBe(s.points);
  });

  it('serverens grænser er de samme som spillets', () => {
    const src = readFileSync('api/rank.ts', 'utf8');
    for (const [k, [lo, hi]] of Object.entries(SCORE_LIMITS)) expect(src).toContain(`${k}: [${lo}, ${hi}]`);
  });
});
