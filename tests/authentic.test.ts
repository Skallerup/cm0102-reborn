// Spiltilstanden "Ægte CM 01/02": kun originalens funktioner – uanset database.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs, squad } from '../src/game/state';
import { applyAction } from '../src/game/actions';
import { maxSubs } from '../src/game/rules';

describe('ægte CM 01/02', () => {
  it('ingen pressemøder, holdsnakke, træningslejre eller fanstemning – men Discipline Player virker', () => {
    const w = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData;
    const eng = w.nations.findIndex((n) => n.name === 'England');
    createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Brentford FC')![0], activeNations: [eng], lang: 'en', masking: true, seed: 5, mode: 'authentic' });
    const g = gs();
    expect(g.options.mode).toBe('authentic');
    expect(maxSubs()).toBe(3);
    for (let i = 0; i < 70; i++) { const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); }
    const keys = g.news.map((n) => n.key);
    expect(keys.some((k) => k.startsWith('press.invite'))).toBe(false);
    expect(keys.some((k) => k.startsWith('fans.mood'))).toBe(false);
    expect(applyAction({ t: 'teamTalk', kind: 'praise' })).toBe('authentic');
    expect(applyAction({ t: 'camp', dest: 'home', start: g.date })).toBe('authentic');
    const p = squad(g.userClub)[3];
    expect(applyAction({ t: 'interact', pid: p.id, kind: 'praise' })).toBe('authentic');
    expect(applyAction({ t: 'interact', pid: p.id, kind: 'warning', reason: 'none' })).not.toBe('authentic');
  }, 120_000);
});
