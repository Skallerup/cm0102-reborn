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
import { A } from '../src/game/attributes';
import { boardAsk, boardAskInfo } from '../src/game/board';
import { planIntake } from '../src/game/season';
import { retireIntoStaff } from '../src/game/records';
import { ACHIEVEMENTS, unlock } from '../src/game/achievements';
import { interact, monthlyPersonality, reformFactors, traits } from '../src/game/personality';
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

describe('problembørn', () => {
  it('kan rehabiliteres over tid med gode forhold', () => {
    const g = gs();
    const p = squad(g.userClub).find((x) => g.tactic!.lineup.includes(x.id))!;
    p.attrs[A.temperament] = 5;
    p.attrs[A.professionalism] = 14;
    p.morale = 15;
    p.lastIncident = undefined;
    p.wantsAway = false;
    expect(traits(p)).toContain('troublemaker');
    const gain = reformFactors(p, g.userClub).reduce((s, f) => s + f.value, 0);
    expect(gain).toBeGreaterThan(0);
    // en fair bøde efter en episode rykker rehabiliteringen
    p.lastIncident = g.date;
    p.lastTalk = undefined;
    const before = p.reform ?? 0;
    interact(p.id, 'fine');
    expect(p.reform).toBeGreaterThan(before);
    // nok måneder: han falder til ro og er ikke længere et problembarn
    for (let m = 0; m < 60 && traits(p).includes('troublemaker'); m++) { p.morale = 15; p.lastIncident = undefined; monthlyPersonality(); }
    expect(p.attrs[A.temperament]).toBeGreaterThan(5);
    expect(traits(p)).not.toContain('troublemaker');
  });
});

describe('bestyrelsesønsker', () => {
  it('ungdomsrekruttering giver en større og bedre årgang', () => {
    const g = gs();
    const c = g.clubs[g.userClub];
    const before = planIntake(c);
    c.balance = 50_000_000;
    g.board.confidence = 70;
    expect(boardAsk('youthDrive')).toBe('yes');
    const after = planIntake(c);
    expect(after.length).toBe(before.length + 1);
    expect(Math.max(...after.map((s) => s.pa))).toBeGreaterThanOrEqual(Math.max(...before.map((s) => s.pa)));
    // samme ønske to gange i samme sæson går ikke
    expect(boardAsk('youthDrive')).toBe('blocked');
  });
  it('tillidserklæring kan kun bedes om, når tilliden er lav', () => {
    const g = gs();
    g.board.confidence = 80;
    expect(boardAskInfo('confidenceVote').blocked).toBe('ba.blocked.notNeeded');
    g.board.confidence = 30;
    expect(boardAskInfo('confidenceVote').blocked).toBeUndefined();
  });
});

describe('rekordbog og legender', () => {
  it('fører kampe og mål for klubben, og en legende kan blive træner', () => {
    const g = gs();
    for (let i = 0; i < 40 && !g.clubs[g.userClub].records; i++) {
      continueGame();
      if (g.pendingFixture) quickPlayUserMatch();
    }
    const r = g.clubs[g.userClub].records!;
    expect(r).toBeDefined();
    const entries = Object.values(r.players);
    expect(entries.some((e) => e.apps > 0)).toBe(true);
    // gør en spiller til legende og lad ham stoppe
    const [pid, e] = Object.entries(r.players)[0];
    e.legend = true;
    const s = retireIntoStaff(g.players[Number(pid)]);
    expect(s).not.toBeNull();
    expect(s!.exPlayer?.legendOf).toBe(g.userClub);
    expect(['coach', 'assistant', 'scout']).toContain(s!.role);
  });
});

describe('præstationer', () => {
  it('serveren kender de samme præstationer som spillet', () => {
    const src = readFileSync('api/rank.ts', 'utf8');
    for (const a of ACHIEVEMENTS) expect(src).toContain(`'${a.id}'`);
  });
  it('låses op undervejs og kun én gang', () => {
    const g = gs();
    for (let i = 0; i < 60 && !g.manager.ach?.firstWin; i++) {
      const r = continueGame();
      if (r.match !== undefined) quickPlayUserMatch();
    }
    expect(g.manager.ach?.firstWin).toBeDefined();
    const n = g.news.filter((x) => x.key === 'ach.unlocked').length;
    unlock('firstWin');
    expect(g.news.filter((x) => x.key === 'ach.unlocked').length).toBe(n);
  });
});

describe('transfervinduet', () => {
  it('giver besked ved åbning, nedtælling, deadline day og lukning', () => {
    const g = gs();
    const keys = new Set<string>();
    const start = g.news.length;
    for (let i = 0; i < 200; i++) {
      const r = continueGame();
      if (r.match !== undefined) quickPlayUserMatch();
      for (const n of g.news.slice(0, Math.max(0, g.news.length - start))) if (n.key.startsWith('window.')) keys.add(n.key);
      if (keys.has('window.closed') && keys.has('window.deadlineDay')) break;
    }
    for (const k of ['window.closing', 'window.closingTomorrow', 'window.deadlineDay', 'window.closed']) expect(keys.has(k)).toBe(true);
  });
});
