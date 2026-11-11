// Fordelsreglen sub_6bab90 (notes/advantage-knock.md §A) og at holdebolden/knock-tjekket kører i en hel kamp
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { GRID_DEBUG, advantagePending, randOf, runGridMatch, setGridDebug, type GP, type GridMatchState, type Incident } from '../src/game/engine/grid/gridMatch';
import { createGame, type WorldData } from '../src/game/newgame';
import { squad } from '../src/game/state';
import { Rng } from '../src/game/rng';
import { aiTactic } from '../src/game/sim';
import type { Player } from '../src/game/types';

const d = { side: 0 } as GP, victim = { side: 1 } as GP;
const inc = (y: number): Incident => ({ type: 42, d, p: victim, res: 1, x: 4, y, jC: 4, jB: 5, b: 0 });
const state = (o: Partial<GridMatchState>) => ({ carrier: null, ballY: 5, inc: inc(5), ...o }) as unknown as GridMatchState;

describe('fordelsreglen sub_6bab90', () => {
  it('ingen hændelse → nej; offerets hold uden bolden → venter', () => {
    expect(advantagePending(state({ inc: null }))).toBe(false);
    expect(advantagePending(state({}))).toBe(true);
    expect(advantagePending(state({ carrier: { side: 0 } as GP }))).toBe(true);    // synderens hold har bolden
  });
  it('offerets hold (side 1 angriber mod y = 0) har bolden: lige linje venter, forbi stedet glemmes', () => {
    const m = state({ carrier: { side: 1 } as GP, ballY: 5 });
    expect(advantagePending(m)).toBe(true);
    m.ballY = 4;
    expect(advantagePending(m)).toBe(false);
    expect(m.inc).toBeNull();
  });
});

describe('holdebolden og knock-tjekket i en kamp', () => {
  it('kører, er deterministisk og bruger holdebolden 0x70ec80', () => {
    const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
    const eng = w.nations.findIndex((x) => x.name === 'England');
    const id = (n: string) => w.clubs.find((c) => c[1] === n)![0];
    createGame(w, { managerName: 'T', managerNation: eng, clubId: id('Arsenal'), activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
    const fresh = (c: number) => squad(c).map((p) => ({ ...p, attrs: p.attrs.slice(), condition: 100, injury: null, banned: 0 }) as Player);
    const [h, a] = [id('Arsenal'), id('Chelsea')];
    const play = (seed: number) => { const rng = new Rng(seed); return runGridMatch({ players: fresh(h), tactic: aiTactic(h, a, true) }, { players: fresh(a), tactic: aiTactic(a, h, false) }, randOf(() => rng.next())); };
    setGridDebug(true);
    for (const k of Object.keys(GRID_DEBUG)) delete GRID_DEBUG[k];
    const r1 = play(11);
    expect(GRID_DEBUG['hold:keeps'] ?? 0).toBeGreaterThan(0);
    expect(play(11)).toEqual(r1);
  }, 60_000);
});
