// Udbudsprisen 0x4d1600 håndporteret (src/game/cmAskingPrice.ts) mod den mekanisk oversatte (cmGen/f_4d1600.ts) på spillets egen hukommelse
// (buildWantMem, original database, England, frø 1): samme pris, samme ud-felt (&ud +0/+1) og samme efterladte stak for de engelske spillere med
// og uden køber. Det store tjek over spillets dage: `CM_SL_ASK=check npx tsx scripts/day-worker-check.ts` (+ CM_SL_ASKDUMP=1: alle kald i alle
// dybder).
import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { buildWantMem } from '../src/game/cmContractGame';
import { G } from '../src/game/cmMem';
import { slCall } from '../src/game/cmShortlist';
import { cmRand } from '../src/game/cmPlayerData';
import { askingPrice_4d1600 } from '../src/game/cmAskingPrice';
import { STACK_TOP } from '../src/game/cmGen/x86';
import type { GameState } from '../src/game/types';

let g: GameState;
beforeAll(() => {
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
  const eng = world.nations.findIndex((x) => x.name === 'England');
  createGame(world, { managerName: 'T', managerNation: eng, clubId: world.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  g = gs();
}, 240_000);

describe('0x4d1600 håndporteret = oversat', () => {
  it('engelske spillere i 12 klubber × (ingen køber, to købere), med og uden &ud', () => {
    const clubs = Object.values(g.clubs).filter((c) => g.nations[c.nation]?.name === 'England' && !g.leagues[c.league]?.hidden).slice(0, 12);   // ligaklubberne (de skjulte non-league-klubber har få spillere)
    const OUT = 0x5ff00000;
    let n = 0, nz = 0;
    for (const cl of clubs) {
      const buyers = [0, clubs[(clubs.indexOf(cl) + 3) % clubs.length].id, clubs[(clubs.indexOf(cl) + 7) % clubs.length].id];
      const M = buildWantMem(g, [cl.id, ...buyers.filter(Boolean)]);
      const m = M.c.m;
      const lo = STACK_TOP - 0x2000;
      const snap = () => { const b = new Uint8Array(0x2000); for (let i = 0; i < b.length; i++) b[i] = m.u8(lo + i); return b; };
      for (const p of Object.values(g.players).filter((q) => q.club === cl.id).slice(0, 18)) {
        const st = M.W.staffOf(p);
        if (!st) continue;
        for (const b of buyers) {
          for (const out of [0, OUT]) {
            const args = [M.W.clubOf(cl.id), b ? M.W.clubOf(b) : 0, st, out, 1, 1];
            const run = (f: () => number) => {
              M.setRand(cmRand(1, p.id, b, 0x4d1600));
              if (out) m.w32(OUT, 0x12345678);
              const s0 = snap();
              const v = f() | 0;
              const r = { v, o: out ? m.u32(OUT) : 0, s: snap() };
              for (let i = 0; i < s0.length; i++) m.w8(lo + i, s0[i]);
              return r;
            };
            const a = run(() => slCall(M.c, 0x4d1600, m.u32(G.CM), ...args));
            const c = run(() => askingPrice_4d1600(M.c, m.u32(G.CM), args));
            expect(c.v, `${p.first} ${p.last} → ${b}`).toBe(a.v);
            expect(c.o).toBe(a.o);
            expect(Buffer.from(c.s).equals(Buffer.from(a.s))).toBe(true);
            n++; if (a.v) nz++;
          }
        }
      }
    }
    expect(n).toBeGreaterThan(500);
    expect(nz).toBeGreaterThan(100);
  }, 240_000);
});
