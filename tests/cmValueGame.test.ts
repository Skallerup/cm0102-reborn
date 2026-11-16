// Spillernes værdi som originalen (src/game/cmValueGame.ts: staff +0x52 = 0x4d0c60 som CONTRACT_MANAGER's 0x4c7ec5) – kun den originale database i
// ægte tilstand. (1) Den håndporterede 0x4d0c60 giver oraklets +0x52 bit for bit på originalens egne bytes (tests/fixtures/cm-value-oracle.json fra
// scripts/cm-value-fixture.ts: spilstarten 14/7-2001, frø 1, England/Arsenal). (2) Spillet bruger den: Player.value ved spilstarten og efter dagene.
import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { SparseMem, type CmCtx } from '../src/game/cmMem';
import { cmMemCall } from '../src/game/cmWageGame';
import { playerValue_4d0c60 } from '../src/game/cmValue';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { cmValuesGbp } from '../src/game/cmValueGame';
import type { GameState, Player } from '../src/game/types';

const GBP = 0.86;
const FIX = JSON.parse(readFileSync('tests/fixtures/cm-value-oracle.json', 'utf8')) as { name: string; st: number; club: number; human: number; v52: number; bytes: string }[];

describe('0x4d0c60 på oraklets bytes', () => {
  for (const f of FIX) {
    it(`${f.name}: £${f.v52.toLocaleString('en')}`, () => {
      const m = new SparseMem();
      for (const run of f.bytes.split(' ')) {
        const [a, h] = run.split(':');
        for (let i = 0; i < h.length / 2; i++) m.w8(parseInt(a, 16) + i, parseInt(h.slice(2 * i, 2 * i + 2), 16));
      }
      const c: CmCtx = { m, rand: () => { throw new Error('rand'); }, call: (adr, ...a) => cmMemCall(c, adr, ...a) };
      expect(playerValue_4d0c60(c, f.st, f.club, 0, -1, f.human) | 0).toBe(f.v52);
    });
  }
  it('fixturen har de fire navngivne', () => {
    for (const n of ['Stuart Edwards', 'David Beckham', 'Cherno Samba', 'Robert Pires']) expect(FIX.some((f) => f.name === n)).toBe(true);
  });
});

let g: GameState;
const find = (first: string, last: string, club?: string) => Object.values(g.players).find((p) => p.first === first && p.last === last && (!club || g.clubs[p.club]?.name === club)) as Player;
const gbp = (p: Player) => Math.round(p.value * GBP);

beforeAll(() => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((x) => x.name === 'England');
  createGame(world, { managerName: 'T', managerNation: eng, clubId: world.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  g = gs();
}, 600_000);

describe('Player.value = originalens +0x52 (spillets data)', () => {
  it('ved spilstarten: alle med kontrakt har 0x4d0c60-værdien', () => {
    const ps = ['David Beckham', 'Stuart Edwards', 'Cherno Samba', 'Maxim Tsigalko', 'Robert Pires'].map((n) => find(n.split(' ')[0], n.split(' ')[1]));
    const v = cmValuesGbp(g, ps);
    for (const p of ps) expect(Math.abs(gbp(p) - v.get(p.id)!)).toBeLessThanOrEqual(1);
  });
  it('oraklets værdier (inddata fra databasen: Beckham inden for 2 %; Edwards/Samba har tilfældigt PA – kun størrelsesordenen)', () => {
    // Beckham: originalen £18.834.344 (spillet før: den ældre formel)
    expect(gbp(find('David', 'Beckham')) / 18834344).toBeGreaterThan(0.98);
    expect(gbp(find('David', 'Beckham')) / 18834344).toBeLessThan(1.02);
    // Stuart Edwards (Leeds): originalen £80.500 – databasen mangler PA (0x536xxx trækker det; originalens træk gav 55, vores 97); før £1,3 mio.
    const se = gbp(find('Stuart', 'Edwards', 'Leeds United'));
    expect(se).toBeGreaterThan(40_000);
    expect(se).toBeLessThan(250_000);
    // Cherno Samba (PA −2 → tilfældigt): originalen £617.131
    const cs = gbp(find('Cherno', 'Samba'));
    expect(cs / 617131).toBeGreaterThan(0.5);
    expect(cs / 617131).toBeLessThan(2);
    // Tsigalko (Dinamo Minsk, PA −2): ikke i oraklets hukommelse (Hviderusland er ikke indlæst med databasestørrelse 2) – en værdi i hans liga
    const ts = gbp(find('Maxim', 'Tsigalko'));
    expect(ts).toBeGreaterThan(5_000);
    expect(ts).toBeLessThan(1_000_000);
  });
  it('dagene: menneskets spillere regnes hver dag, computerens på ulige dage (kontraktens restløbetid)', () => {
    for (let d = 0; d < 6; d++) { const r = continueGame(); if (r?.match) quickPlayUserMatch(); }
    const ps = ['David Beckham', 'Robert Pires', 'Stuart Edwards'].map((n) => find(n.split(' ')[0], n.split(' ')[1]));
    const v = cmValuesGbp(g, ps);
    // dagens dato kan være lige (computerens værdi er fra i går) – inden for 1 %
    for (const p of ps) expect(Math.abs(gbp(p) / v.get(p.id)! - 1)).toBeLessThan(0.01);
  }, 600_000);
});
