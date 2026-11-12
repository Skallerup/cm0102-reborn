// Originalens spilstart for ikke-spillerposten (sub_535a80 0x537d59–0x5388cf, 0x538a70 og 0x539490 – cmStaffInit.ts) og sprogtabellen /
// kontraktens sprognibble (0x7bfd50, 0x7c6930, 0x7c6830 – cmLanguage.ts). Forventningerne er originalens hukommelse ved kampstarten i
// ~/cm0102-engine/oracle/runs/ls20.txt (MG-linjerne): de to managere i Premier League med alle 21 egenskaber i databasen.
import { describe, expect, it } from 'vitest';
import { npFromWorld, rebalance539490, staffConvert, staffInitRecord, gridTacOf, npShown, NP_START } from '../src/game/cmStaffInit';
import { nativePoints, languageDay } from '../src/game/cmLanguage';

const noRand = () => { throw new Error('ingen tilfældige tal ventet'); };
// databasens rå +0x0e..+0x22 (staff.dat 3.9.60) og originalens hukommelse (ls20, kampstarten 18/8-2001)
const CASES = [
  { name: 'Claudio Ranieri', nation: 'Italy', ca: 165, pa: 170, f43: 6, club: 8250,
    raw: [9, 12, 16, 16, 8, 12, 16, 5, 10, 16, 15, 18, 16, 17, 7, 13, 11, 14, 10, 17, 18],
    mem: [9, 12, -4, -4, 8, 12, 16, 5, 10, -4, -9, 5, 16, 0, 7, 13, -29, 14, 10, 0, 18], memF43: 6 },
  { name: 'Walter Smith', nation: 'Scotland', ca: 159, pa: 162, f43: 3, club: 7400,
    raw: [13, 15, 15, 2, 15, 10, 20, 14, 1, 18, 18, 8, 11, 19, 6, 1, 1, 14, 1, 10, 5],
    mem: [13, 15, -3, -69, 15, 10, 20, 14, 1, 11, 11, -38, 11, 16, 6, 1, -74, 14, 1, -28, 5], memF43: 2 },
];

describe('ikke-spillerposten ved spilstarten (sub_535a80)', () => {
  for (const c of CASES) {
    it(`${c.name}: hele posten som i originalens hukommelse`, () => {
      const np = npFromWorld(c.ca, [c.pa, ...c.raw, 5], c.f43);
      const job = staffInitRecord({ np, job: 5, nation: c.nation, clubRep: c.club, name: c.name, hasPlayer: false }, [], noRand);
      staffConvert(np, job);
      expect(np.a).toEqual(c.mem);
      expect(np.f43).toBe(c.memF43);
      expect(np.ca).toBe(c.ca);
      expect(np.pa).toBe(c.pa);
    });
  }

  it('managerens felter i hukommelsens form (låsetrinets GridManager.tac) og den viste Tactics 0x544410', () => {
    const c = CASES[0];
    const st = { tac: [9, 12, 5, 16, 7, 14, 17, 6], ca: c.ca, cmNp: [...c.mem, c.memF43] };
    expect(gridTacOf(st)).toEqual([9, 12, 5, 16, 7, 14, 0, 6]);
    expect(npShown(st, 0x21)).toBe(17);
    expect(gridTacOf({ tac: [1, 2, 3, 4, 5, 6, 7, 8] })).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);   // uden cmNp: som før
  });

  it('manglende egenskaber: skabelonen af puljen, ellers rand(7) + CA/10 − 3; navnelisten (0x5386fd) og jobløse (0x538867)', () => {
    const np = npFromWorld(120, [0, ...new Array(21).fill(0), 0], 0);
    const seq = [5, 3, 4, 2, 6, 1, 0, 3, 5, 2, 4, 6, 1, 3, 2, 5, 4, 0, 6, 1, 2, 3, 4, 5, 6, 0];
    let i = 0;
    const job = staffInitRecord({ np, job: 0, nation: null, clubRep: null, name: 'Jim Smith', hasPlayer: false }, [], (n) => seq[i++ % seq.length] % n);
    expect(np.pa).toBeGreaterThanOrEqual(np.ca);                                    // PA 0 → max(CA, rand(200) + 1)
    for (const v of np.a) { expect(v).toBeGreaterThanOrEqual(1); expect(v).toBeLessThanOrEqual(20); }
    expect(np.f43).toBe(2);
    expect([5, 6, 8, 9, 10]).toContain(job);
  });

  it('0x539490: gruppen inden for ±40 flyttes til snit −5; fysioterapeuter ≤ −80 og Physiotherapy ≥ 0', () => {
    const list = new Array(21).fill(0);
    const v = [10, 20, 0, -10, 30, 0, 0, 10];                                        // indeks 13..20
    v.forEach((x, k) => { list[NP_START + k] = x; });
    rebalance539490(list, 5);
    const mean = list.slice(NP_START).reduce((a, b) => a + b, 0) / 8;
    expect(Math.round(mean)).toBe(-5);
    const ph = new Array(21).fill(0);
    [10, 20, 0, -10, 30, 0, 50, 10].forEach((x, k) => { ph[NP_START + k] = x; });
    rebalance539490(ph, 10);
    ph.slice(NP_START).forEach((x, k) => { if (NP_START + k === 19) expect(x).toBeGreaterThanOrEqual(0); else expect(x).toBeLessThanOrEqual(-80); });
  });
});

describe('sprogene (0x7c6930, 0x5d2fb3)', () => {
  const N = (name: string, lang: number[]) => ({ name, lang });
  it('de indfødte point: +0x78 500, +0x79 300, nøglelandene, anden nationalitet 300/100', () => {
    const belgium = N('Belgium', [10, 7, 8]), sweden = N('Sweden', [30, 8, 22]), cameroon = N('Cameroon', [10, 0, 8]), france = N('France', [10, 0, 0]);
    expect(nativePoints(belgium, undefined, 7)).toBe(1000);
    expect(nativePoints(belgium, undefined, 8)).toBe(300);
    expect(nativePoints(sweden, undefined, 0x20)).toBe(500);                        // dansk
    expect(nativePoints(sweden, undefined, 8)).toBe(500);
    expect(nativePoints(cameroon, undefined, 8)).toBe(300);
    expect(nativePoints(france, undefined, 10)).toBe(0);                            // hovedsproget giver 0 (0x7c6830 svarer 10 for det)
    expect(nativePoints(france, cameroon, 8)).toBe(100);
    expect(nativePoints(france, belgium, 7)).toBe(500);
  });

  it('den daglige indlæring: nibble + 1 ved rand(100 − 3,5·Adaptability) = 0, højst 10', () => {
    const g = { nations: [{ name: 'England', lang: [8, 0, 0] }], clubs: { 1: { nation: 0 } } } as never;
    const p = { club: 1, attrs: new Array(60).fill(10) } as never as Parameters<typeof languageDay>[1];
    const c = { b4f: (2 << 4) | 9 };
    languageDay(g, p, c, () => 0);
    expect(c.b4f).toBe((2 << 4) | 10);
    languageDay(g, p, c, () => 0);
    expect(c.b4f).toBe((2 << 4) | 10);
    expect(p.cmLang?.[8]).toBe(1);                                                   // improve_language uden post = add_language(L, 1)
  });
});
