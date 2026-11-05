// Squad Numbers: trøjenumrene fra CM-databasen, unikke pr. trup, og et klubskifte beholder nummeret, hvis det er ledigt.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, setClub, squad } from '../src/game/state';
import { act } from '../src/game/actions';

describe('trøjenumre', () => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((x) => x.name === 'England');
  const mu = world.clubs.find((c) => c[1] === 'Manchester United')![0];
  createGame(world, { managerName: 'T', managerNation: eng, clubId: mu, activeNations: [eng], lang: 'da', masking: true, seed: 1 });
  const g = gs();
  const by = (last: string, club = mu) => squad(club).find((p) => p.last === last)!;

  it('bruger originalens numre (Beckham 7, Keane 16)', () => {
    expect(by('Beckham').number).toBe(7);
    expect(by('Keane').number).toBe(16);
  });
  it('alle klubber har unikke numre 1-99 til hele truppen', () => {
    for (const c of Object.values(g.clubs)) {
      const nums = squad(c.id).map((p) => p.number);
      expect(nums.every((n) => n !== undefined && n >= 1 && n <= 99)).toBe(true);
      expect(new Set(nums).size).toBe(nums.length);
    }
  });
  it('et nyt nummer bytter med holdkammeraten', () => {
    const beck = by('Beckham'), keane = by('Keane');
    act({ t: 'squadNumber', pid: keane.id, n: 7 });
    expect(keane.number).toBe(7);
    expect(beck.number).toBe(16);
  });
  it('klubskifte: nummeret følger med, hvis det er ledigt – ellers et andet ledigt', () => {
    const other = Object.values(g.clubs).find((c) => c.id !== mu && c.league === g.clubs[mu].league)!.id;
    const beck = by('Beckham');
    const taken = new Set(squad(other).map((p) => p.number));
    setClub(beck, other);
    if (!taken.has(16)) expect(beck.number).toBe(16);
    expect(squad(other).filter((p) => p.number === beck.number).length).toBe(1);
  });
});
