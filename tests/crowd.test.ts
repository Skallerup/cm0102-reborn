// (runde 9) Tilskuertallet sub_85cba0 (src/game/engine/grid/crowd.ts) mod originalen: 86 kald fra oraklets sæson (crowd1.txt – alle
// turneringstyper, ligarækker med stimer/placeringer, tilfældige byer), med originalens indgange og tilfældige tal.
// Hele sporet: npx tsx scripts/crowd-check.ts (3.689/3.689 ens).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseCase } from '../scripts/crowd-check';
import { crowd85cba0, type CrowdCity } from '../src/game/engine/grid/crowd';
import { possiblePositions } from '../src/game/engine/grid/gameTable';

const fx = JSON.parse(readFileSync('tests/fixtures/crowd-cases.json', 'utf8')) as { nCities: number; cities: Record<string, [number, number]>; cases: { K: string; Kr: string[]; KO: string }[] };
const cityObjs = new Map<number, CrowdCity>();
const cityOf = (id: number): CrowdCity | null => {
  if (id < 0) return null;
  let c = cityObjs.get(id);
  if (!c) { const v = fx.cities[String(id)] ?? [0, 0]; c = { id, c23: v[0], c2b: v[1] }; cityObjs.set(id, c); }
  return c;
};

describe('tilskuertallet sub_85cba0', () => {
  it('giver originalens i alt/hjemme/ude og kapacitet med originalens tal', () => {
    let ok = 0;
    for (const c of fx.cases) {
      const cs = parseCase(c.K, c.Kr, c.KO, cityOf);
      let ri = 0;
      const r = crowd85cba0(cs.F, { cities: fx.nCities, cityAt: (i) => cityOf(i)!, row: () => cs.row,
        rand: (m) => { const e = cs.rands[ri++]; expect(e?.[0]).toBe(m); return e[2]; } });
      expect(ri).toBe(cs.rands.length);
      expect([r.total, r.home, r.away, cs.F.stadium ? cs.F.stadium.cap : -1]).toEqual(cs.out);
      ok++;
    }
    expect(ok).toBe(fx.cases.length);
  });
});

describe('0x684ef7–0x6850dc: bedst/dårligst mulige placering', () => {
  it('to runder tilbage (6 point): et hold 7 point foran kan ikke nås', () => {
    const rows = [{ p: 36, pts: 80 }, { p: 36, pts: 73 }, { p: 36, pts: 72 }, { p: 36, pts: 40 }];
    expect(possiblePositions(rows, 0, 38)).toEqual([1, 1]);   // ingen kan nå 80 (højst 79)
    expect(possiblePositions(rows, 1, 38)).toEqual([2, 3]);   // 79 < 80; nr. 3 kan nå 78 ≥ 73
    expect(possiblePositions(rows, 3, 38)).toEqual([4, 4]);
    // færdige hold: lige point tæller kun med flaget +0xe6
    expect(possiblePositions([{ p: 38, pts: 70 }, { p: 38, pts: 70 }], 1, 38)).toEqual([2, 2]);
    expect(possiblePositions([{ p: 38, pts: 70 }, { p: 38, pts: 70 }], 1, 38, 3, true)).toEqual([1, 2]);
  });
});
