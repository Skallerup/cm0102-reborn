// Squad Numbers-beskeden som i CM 01/02 (målt i originalen 9/11-2026): 4/8 "… squad numbers to be decided" med Respond,
// Submit sætter numrene og giver "The list has been submitted."; svarer manageren ikke, sendes listen før første kamp.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { applyAction } from '../src/game/actions';
import { gs, squad } from '../src/game/state';
import { squadNumbersDue } from '../src/game/squadNumbers';

const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((n) => n.name === 'England');
const start = (seed: number) => createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Manchester United')![0], activeNations: [eng], lang: 'en', masking: true, seed, mode: 'authentic' });
const until = (stop: () => boolean) => { for (let i = 0; i < 400 && !stop(); i++) { const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); } };

describe('Squad Numbers-beskeden', () => {
  it('kommer den 4/8, og Submit sætter numrene', () => {
    start(7);
    const g = gs();
    until(() => g.date >= '2001-08-04');
    const n = g.news.find((x) => x.key === 'sqn.request');
    expect(n?.date).toBe('2001-08-04');
    expect(n?.params.club).toBe('Man Utd');
    expect(squadNumbersDue(g.userClub)).toBe(true);
    const sq = squad(g.userClub);
    const keane = sq.find((p) => p.last === 'Keane')!, veron = sq.find((p) => p.last === 'Verón')!;
    // Keane får 4, Verón intet nummer (som i målingen) – dubletter afvises
    expect(applyAction({ t: 'squadNumbers', nums: { [keane.id]: 4, [veron.id]: 4 } })).toBe('error');
    expect(applyAction({ t: 'squadNumbers', nums: { [keane.id]: 4, [veron.id]: 0 } })).toBe('ok');
    expect(keane.number).toBe(4);
    expect(veron.number).toBeUndefined();
    expect(squadNumbersDue(g.userClub)).toBe(false);
    expect(n?.params.done).toBe(1);
    const nums = squad(g.userClub).map((p) => p.number).filter(Boolean);
    expect(new Set(nums).size).toBe(nums.length);
  }, 120_000);
  it('sendes automatisk, hvis klubben skal spille, før der er svaret', () => {
    start(8);
    const g = gs();
    until(() => Object.values(g.fixtures).some((f) => f.result && (f.home === g.userClub || f.away === g.userClub)));
    expect(squadNumbersDue(g.userClub)).toBe(false);
    expect(g.news.find((x) => x.key === 'sqn.request')?.params.done).toBe(1);
  }, 120_000);
});
