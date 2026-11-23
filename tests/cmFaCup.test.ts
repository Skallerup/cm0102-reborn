// (22/11) FA Cup'en som originalen (cmCups.ts): EngFaCup::collect_entrants 0x56fab0's liste og Cup::randomize_round_teams 0x51e220.
// Oraklet (s1-3.9.60-e1, billede 14/10-01 – scripts/oracle-cup-entrants.ts): 37 ikke-ligaklubber (Isthmian/Southern/Northern), 21 Conference,
// Canvey Island (FA Trophy-vinder, Isthmian) og Forest Green (nr. 2, Conference) på plads 58/59, så Third, Second, First og Premier – 152.
import { describe, expect, it } from 'vitest';
import { FA_ENTRANTS, cmCupDrawDate, cmCupRound, cmCupRoundShape, cmFaCupEntrants, cmRandomizeRound } from '../src/game/cmCups';
import { cmRand } from '../src/game/cmPlayerData';
import type { Club, GameState } from '../src/game/types';

const DIVS: [string, string, number][] = [['CM7', 'English Premier Division', 20], ['CM8', 'English First Division', 24], ['CM9', 'English Second Division', 24], ['CM10', 'English Third Division', 24]];

function world(): GameState {
  const clubs: Record<number, Club> = {};
  const fin: Record<number, number[]> = {};
  let id = 1;
  const add = (league: string, div: number, nation = 60) => { clubs[id] = { id, name: `K${id}`, nation, league, rep: 20 } as Club; fin[id] = [div, 0, 0, 0]; return id++; };
  for (const [lg, , n] of DIVS) for (let i = 0; i < n; i++) add(lg, +lg.slice(2));
  const conf: number[] = []; for (let i = 0; i < 22; i++) conf.push(add('HN60', 93));
  const other: number[] = []; for (let i = 0; i < 66; i++) other.push(add('HN60', 358 + (i % 3)));
  for (let i = 0; i < 40; i++) add('HN60', 357);       // "A Lower Division" springes over
  add('HN61', 358, 61);                                 // anden nation uden for ligaerne springes over
  const leagues = Object.fromEntries([...DIVS.map(([lg, name]) => [lg, { name, nation: 60, tier: +lg.slice(2) - 6 }]), ['HN60', { name: 'England', nation: 60, tier: 9, hidden: true }]]);
  return { clubs, leagues, cmFinRaw: fin, cmLowerDiv: 357, cmConfDiv: 93, cmCompHist: { 'cup:English FA Trophy': [[2001, other[5], conf[3]], [2000, conf[0], conf[1]]] }, meta: { conf, other } } as unknown as GameState;
}

describe('FA Cup – collect_entrants 0x56fab0', () => {
  it('152 deltagere i originalens rækkefølge (2001: FA Trophy-vinderen og nr. 2 fra historikken)', () => {
    const g = world();
    const { conf, other } = (g as unknown as { meta: { conf: number[]; other: number[] } }).meta;
    const e = cmFaCupEntrants(g, 60, 2001, cmRand(1, 2, 3));
    expect(e.length).toBe(FA_ENTRANTS);
    expect(new Set(e).size).toBe(FA_ENTRANTS);
    // 37 andre (vinderen er "anden"), 21 Conference (nr. 2 er Conference), så vinderen og nr. 2
    expect(e.slice(0, 37).every((c) => other.includes(c))).toBe(true);
    expect(e.slice(37, 58).every((c) => conf.includes(c))).toBe(true);
    expect(e.slice(58, 60)).toEqual([other[5], conf[3]]);
    const lg = (c: number) => g.clubs[c].league;
    expect(e.slice(60, 84).every((c) => lg(c) === 'CM10')).toBe(true);
    expect(e.slice(84, 108).every((c) => lg(c) === 'CM9')).toBe(true);
    expect(e.slice(108, 132).every((c) => lg(c) === 'CM8')).toBe(true);
    expect(e.slice(132).every((c) => lg(c) === 'CM7')).toBe(true);
    // Third/Second/Premier i klubtabellens rækkefølge, First blandet (60 ombytninger)
    expect(e.slice(60, 84)).toEqual([...e.slice(60, 84)].sort((a, b) => a - b));
    expect(e.slice(132)).toEqual([...e.slice(132)].sort((a, b) => a - b));
  });
  it('andre år: ingen FA Trophy-klubber (klub 0 er ikke i Conference) – 38 andre + 22 Conference', () => {
    const g = world();
    const { conf, other } = (g as unknown as { meta: { conf: number[]; other: number[] } }).meta;
    const e = cmFaCupEntrants(g, 60, 2002, cmRand(4));
    expect(e.length).toBe(FA_ENTRANTS);
    expect(e.slice(0, 38).every((c) => other.includes(c))).toBe(true);
    expect(e.slice(38, 60).every((c) => conf.includes(c))).toBe(true);
  });
});

describe('FA Cup – rundetabellen og lodtrækningen', () => {
  it('runderne som oraklets tabel 2001 (kampdatoer, lodtrækningsdatoer, hold/kampe/nye/første)', () => {
    const dates = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((r) => cmCupRound('ENG', 2001, r, 9, true)!.date);
    expect(dates).toEqual(['2001-10-13', '2001-11-17', '2001-12-08', '2002-01-05', '2002-01-26', '2002-02-16', '2002-03-09', '2002-04-07', '2002-05-11']);
    expect(cmCupDrawDate('ENG', 2001, 1)).toBe('2001-10-06');
    expect(cmCupDrawDate('ENG', 2001, 2)).toBe('2001-10-14');
    expect([1, 2, 3, 4].map((r) => cmCupRoundShape('ENG', 2001, r))).toEqual([[56, 28, 56, 0], [80, 40, 52, 56], [40, 20, 0, 108], [64, 32, 44, 108]]);
  });
  it('randomize_round_teams: hvert hold i præcis én kamp', () => {
    const teams = Array.from({ length: 80 }, (_, i) => i + 1);
    const pairs = cmRandomizeRound(teams, 40, cmRand(9));
    expect(pairs.length).toBe(40);
    expect(new Set(pairs.flat()).size).toBe(80);
  });
  it('randomize_round_teams med tomme pladser (2026/27: 44 deltagere): rundens faste antal kampe, ulige antal kaster ikke', () => {
    for (const n of [11, 22, 40, 21]) {
      const teams = Array.from({ length: n }, (_, i) => i + 1);
      const alone: number[] = [];
      const pairs = cmRandomizeRound(teams, 20, cmRand(n), alone);
      expect(pairs.length * 2 + alone.length).toBe(n);
      expect(new Set([...pairs.flat(), ...alone]).size).toBe(n);
      // første gennemgang fylder kampe uden hold: færre hold end kampe → ingen kampe
      if (n <= 20) expect(pairs.length).toBe(0);
      else expect(pairs.length).toBe(n - 20);
    }
    expect(() => cmRandomizeRound([1, 2, 3], 1, cmRand(1))).toThrow();
  });
});
