// Ægte CM 01/02 med den originale database: originalens model for nye spillere (Bosman-projektets player_regen.cpp) –
// hver spiller, der forlader fodbolden, genfødes som én regen med samme PA, og der er ingen ungdomsårgange.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { ageOn } from '../src/game/dates';
import { seasonRollover, youthIntake } from '../src/game/season';

describe('regens som i originalen', () => {
  it('pensionerede genfødes med samme PA, ingen ungdomsårgang', () => {
    const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
    const eng = w.nations.findIndex((n) => n.name === 'England');
    createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
    const g = gs();
    const before = new Set(Object.keys(g.players).map(Number));
    // 40 spillere når 41 år (sikker pension)
    const old = Object.values(g.players).filter((p) => p.club && p.pa > 0).slice(0, 40);
    for (const p of old) p.dob = `${Number(g.date.slice(0, 4)) - 42}-01-01`;
    seasonRollover();
    const gone = [...before].filter((id) => !g.players[id]);
    const fresh = Object.values(g.players).filter((p) => !before.has(p.id));
    expect(gone.length).toBeGreaterThanOrEqual(40);
    // hver forsvundet spiller har en regen (aiFillSquads kan lægge udfyldninger oveni)
    expect(fresh.length).toBeGreaterThanOrEqual(gone.length);
    const pas = fresh.map((p) => p.pa);
    for (const p of old) { const i = pas.indexOf(Math.max(20, p.pa)); // makePlayer: PA mindst 20
      expect(i).toBeGreaterThanOrEqual(0); pas.splice(i, 1); }
    expect(g.regenQueue ?? []).toHaveLength(0);
    for (const p of fresh) { expect(ageOn(p.dob, g.date)).toBeLessThanOrEqual(26); expect(p.ca).toBeLessThanOrEqual(p.pa); }
    // ingen årgang i marts
    const n = Object.keys(g.players).length;
    youthIntake();
    expect(Object.keys(g.players).length).toBe(n);
  }, 120_000);
});
