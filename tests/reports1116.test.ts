// Spillerrapporter #20–#27 (0.27.0): accepterede bud i ægte tilstand med 2026/27-databasen, nyindkøbte reserver, supercuppen/pokalens navn,
// moderne karakterer for mål/assists.
import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, setClub } from '../src/game/state';
import { makeBid, negotiate } from '../src/game/transfers';
import { cmActive } from '../src/game/cmPlayerData';
import { cmCupName, cmLeagueRules } from '../src/game/cmCalendar';
import { continueGame } from '../src/game/sim';
import type { GameState } from '../src/game/types';

describe('#20/#21/#24: 2026/27-databasen i ægte tilstand – accepteret bud → kontrakt', { timeout: 300_000 }, () => {
  const world = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData;
  let g: GameState;
  beforeAll(() => {
    const eng = world.nations.findIndex((n) => n.name === 'England');
    const everton = (world.clubs.find((c) => c[1] === 'Everton') ?? world.clubs[0])[0];
    createGame(world, { managerName: 'T', managerNation: eng, clubId: everton, activeNations: [eng], lang: 'en', masking: false, seed: 5, mode: 'authentic' });
    g = gs();
  }, 300_000);

  it('originalens forløb (cmActive) er ikke tændt – det gamle forløb med nyhed og Offer Contract gælder', () => {
    expect(cmActive(g)).toBe(false);
  });

  it('et accepteret bud giver en nyhed med link til buddet, og forhandlingen kan føres til ende', () => {
    // en spiller fra en anden klub i landet, budt generøst
    const target = Object.values(g.players).filter((p) => p.club && p.club !== g.userClub && g.clubs[p.club]?.nation === g.clubs[g.userClub].nation && !p.loan)
      .sort((a, b) => a.value - b.value)[Math.floor(Object.keys(g.players).length / 200)];
    const res = makeBid(target.id, Math.round(target.value * 4));
    expect(typeof res).toBe('object');
    for (let i = 0; i < 12 && g.offers.every((o) => o.status === 'pending'); i++) continueGame();
    const o = g.offers.find((x) => x.player === target.id && x.buyer === g.userClub)!;
    expect(['negotiating', 'countered', 'rejected', 'completed']).toContain(o.status);
    if (o.status === 'negotiating') {
      expect(g.news.some((n) => (n.key === 'transfer.bidAccepted' || n.key === 'transfer.releaseMet') && n.link?.kind === 'offer' && n.link.id === o.id)).toBe(true);
      const r = negotiate(o.id, Math.round((o.demand?.wage ?? target.contract?.wage ?? 10000) * 1.5), 3);
      expect(['accepted', 'counter', 'budget']).toContain(r);
    }
  });
});

describe('#26/#27: pokalen er ikke supercuppen', () => {
  it('databasens Portuguese Super Cup som landets pokal bliver til Portuguese Cup', () => {
    expect(cmCupName('Portuguese Super Cup')).toBe('Portuguese Cup');
    expect(cmCupName('English FA Cup')).toBe('English FA Cup');
    const r = cmLeagueRules({ CM46: { rounds: 2, wealth: 1, cup: 'Portuguese Super Cup' }, CM7: { rounds: 2, wealth: 1, cup: 'English FA Cup' } });
    expect(r.CM46.cup).toBe('Portuguese Cup');
    expect(r.CM7.cup).toBe('English FA Cup');
  });
});

describe('#25: en nyindkøbt reservespiller kommer på førsteholdet', () => {
  it('setClub til menneskets klub fjerner reserve-mærket (ikke til computerklubber)', () => {
    const world = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData;
    const eng = world.nations.findIndex((n) => n.name === 'England');
    createGame(world, { managerName: 'T', managerNation: eng, clubId: world.clubs.find((c) => c[1] === 'Everton')![0], activeNations: [eng], lang: 'en', masking: false, seed: 6, mode: 'authentic' });
    const g = gs();
    const res = Object.values(g.players).find((p) => p.reserves && p.club && p.club !== g.userClub)!;
    expect(res).toBeTruthy();
    const other = Object.values(g.clubs).find((c) => c.id !== g.userClub && c.id !== res.club && c.manager !== -1)!;
    setClub(res, other.id);
    expect(res.reserves).toBe(true);
    setClub(res, g.userClub);
    expect(res.reserves).toBeUndefined();
  });
});
