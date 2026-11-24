// Ægte CM 01/02 med den originale database: originalens model for nye spillere (Bosman-projektets player_regen.cpp) –
// hver spiller, der forlader fodbolden, genfødes som én regen med samme PA, og der er ingen ungdomsårgange.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { ageOn } from '../src/game/dates';
import { spawnDueRegens, youthIntake } from '../src/game/season';
import { cmRetireDaily } from '../src/game/cmRetire';
import { addDays } from '../src/game/dates';

describe('regens som i originalen', () => {
  it('pensionerede genfødes med samme PA, ingen ungdomsårgang', () => {
    const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
    const eng = w.nations.findIndex((n) => n.name === 'England');
    createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
    const g = gs();
    const before = new Set(Object.keys(g.players).map(Number));
    // 40 spillere på PLAYER_REGEN's liste med stopdato i går (cmRetire.ts – dagen efter stopper de); regen'erne kommer inden for 65 dage
    const old = Object.values(g.players).filter((p) => p.club && p.pa > 0 && !g.cmRet!.list.some((e) => e.id === p.id)).slice(0, 40);
    for (const p of old) { p.dob = `${Number(g.date.slice(0, 4)) - 42}-01-01`; g.cmRet!.list.push({ id: p.id, club: p.club, a: 2001001, r: 2001100, why: 1, ann: 1 }); }
    cmRetireDaily(g);
    g.date = addDays(g.date, 70);
    spawnDueRegens();
    const gone = [...before].filter((id) => !g.players[id]);
    const fresh = Object.values(g.players).filter((p) => !before.has(p.id));
    expect(gone.length).toBeGreaterThanOrEqual(40);
    for (const p of old) expect(g.players[p.id]).toBeUndefined();
    // hver forsvundet spiller har en regen (aiFillSquads kan lægge udfyldninger oveni) – undtagen dem, der samme dag stopper fra startlisten
    // og bliver stab med deres ikke-spillerpost (0x7a62c2: samme person, ingen regen – hvem det er, afhænger af world-filen)
    const toStaff = new Set(Object.values(g.staff).map((s) => s.exPlayer?.pid).filter((x): x is number => x !== undefined));
    expect(fresh.length).toBeGreaterThanOrEqual(gone.filter((id) => !toStaff.has(id)).length);
    const pas = fresh.map((p) => p.pa);
    for (const p of old) { const i = pas.indexOf(Math.max(20, p.pa)); // makePlayer: PA mindst 20
      expect(i).toBeGreaterThanOrEqual(0); pas.splice(i, 1); }
    expect(g.regenQueue ?? []).toHaveLength(0);
    // (24/11) ≤ 27: et ikke-indlæst land med under 350 spillere i hukommelsen (0x7abea0, sti 1: rand(5) + 23) – med 0x524d70 for alle lande har
    // udlandet kun hukommelsens spillere, så stien bruges som i originalen
    for (const p of fresh) { expect(ageOn(p.dob, g.date)).toBeLessThanOrEqual(27); expect(p.ca).toBeLessThanOrEqual(p.pa); }
    // ingen årgang i marts
    const n = Object.keys(g.players).length;
    youthIntake();
    expect(Object.keys(g.players).length).toBe(n);
  }, 120_000);
});
