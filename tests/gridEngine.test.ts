// Gittermotoren (src/game/engine/grid, Bosman-prompten opgave 5): en kamp kører færdig, er deterministisk og giver fornuftige tal
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { Rng } from '../src/game/rng';
import { aiTactic } from '../src/game/sim';
import { randOf, runGridMatch } from '../src/game/engine/grid/gridMatch';
import type { Player } from '../src/game/types';

describe('gittermotoren', () => {
  it('spiller en kamp færdig, deterministisk med samme frø', () => {
    const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
    const eng = w.nations.findIndex((x) => x.name === 'England');
    const id = (n: string) => w.clubs.find((c) => c[1] === n)![0];
    createGame(w, { managerName: 'T', managerNation: eng, clubId: id('Arsenal'), activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
    void gs();
    const fresh = (c: number) => squad(c).map((p) => ({ ...p, attrs: p.attrs.slice(), condition: 100, injury: null, banned: 0 }) as Player);
    const [h, a] = [id('Manchester United'), id('Liverpool')];
    const play = (seed: number) => { const rng = new Rng(seed); return runGridMatch({ players: fresh(h), tactic: aiTactic(h, a, true) }, { players: fresh(a), tactic: aiTactic(a, h, false) }, randOf(() => rng.next())); };
    const r1 = play(7), r2 = play(7);
    expect(r1).toEqual(r2);
    expect(r1.ticks).toBeGreaterThanOrEqual(990);
    expect(r1.ticks).toBeLessThan(2000);
    for (const s of [r1.home, r1.away]) for (const v of Object.values(s)) { expect(Number.isFinite(v)).toBe(true); expect(v).toBeGreaterThanOrEqual(0); }
    expect(r1.home.passes + r1.away.passes).toBeGreaterThan(100);
    expect(r1.home.passesCompleted).toBeLessThanOrEqual(r1.home.passes);
  }, 60_000);
});
