// Lønnen for kontrakter uden løn (0x83a1b0 → 0x862720 → Finance::get_max_wage 0x5968d0) mod originalen: fixturen har de bytes af originalens
// hukommelse ved spilstarten 14/7-2001 (frø 1, 3.9.60, øjebliksbilledet pre-194-2001.bin), portene læser for hver 4. engelske spiller, hvis
// udfyldte løn porten rammer (scripts/cm-wage-fill.ts FIXTURE=1 – 2.510 af 2.608 engelske spillere er ens; resten har fået ny kontrakt eller
// ny trupstatus i forkørslen 1/1–14/7).
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { getContract, SparseMem, type CmCtx } from '../src/game/cmMem';
import { cmMemCall } from '../src/game/cmWageGame';
import { fillUnsetWage_83a1b0, foreignCap_83a2d0 } from '../src/game/cmWageFill';

const fx = JSON.parse(gunzipSync(readFileSync(new URL('./fixtures/cm-wage-fill-194-2001.json.gz', import.meta.url))).toString()) as { runs: [number, string][]; cases: [number, number][] };

describe('0x83a1b0 → 0x862720 mod originalen (14/7-2001)', () => {
  it('den udfyldte ugeløn er originalens for alle spillerne i fixturen', () => {
    const m = new SparseMem();
    for (const [a, h] of fx.runs) m.loadHex(a, h);
    const c: CmCtx = { m, rand: () => { throw new Error('rand'); }, call: (adr, ...a) => cmMemCall(c, adr, ...a) };
    const bad: string[] = [];
    for (const [st, want] of fx.cases) {
      const k = getContract(m, st);
      m.w32(k + 0xc, -1);
      const v = fillUnsetWage_83a1b0(c, st);
      if (v !== want) bad.push(`${st.toString(16)}: ${v} ≠ ${want}`);
      m.w32(k + 0xc, want);
    }
    expect(fx.cases.length).toBeGreaterThan(500);
    expect(bad).toEqual([]);
  });
});

describe('0x83a2d0: udlændingenes bløde loft efter klubbens land', () => {
  const mk = (natId: number, global: number, status = 1, rep = 5000) => {
    const m = new SparseMem();
    const club = 0x1000, nat = 0x2000, other = 0x3000, staff = 0x4000;
    m.w32(nat, natId); m.w32(global, natId); m.w32(club + 0x53, nat); m.w8(club + 0x64, status); m.w16(club + 0x80, rep);
    m.w32(staff + 0x1a, other);
    return { m, club, staff, nat };
  };
  it('Sydkorea: over 1000 halveres, derefter over 2500 halveres igen', () => {
    const { m, club, staff } = mk(7, 0x9cf484);
    expect(foreignCap_83a2d0(m, staff, club, 900)).toBe(900);
    expect(foreignCap_83a2d0(m, staff, club, 3000)).toBe(2000);
    expect(foreignCap_83a2d0(m, staff, club, 9000)).toBe(3750);                       // 5000 → (5000 − 2500)·0,5 + 2500
  });
  it('England: intet loft; et ukendt land: over 25000 · 0,25; Belgien: gulvet 5·L²', () => {
    const e = mk(7, 0x9cf2e4);
    expect(foreignCap_83a2d0(e.m, e.staff, e.club, 90000)).toBe(90000);
    const o = mk(7, 0x9cf218 + 0x400);
    expect(foreignCap_83a2d0(o.m, o.staff, o.club, 45000)).toBe(30000);
    const b = mk(7, 0x9cf244, 1, 5000);                                                 // L = 11 → gulv 605
    expect(foreignCap_83a2d0(b.m, b.staff, b.club, 100)).toBe(Math.trunc((605 - 500) * 0.2 + 500));
  });
  it('landsmænd røres ikke', () => {
    const { m, club, staff, nat } = mk(7, 0x9cf484);
    m.w32(staff + 0x1a, nat);
    expect(foreignCap_83a2d0(m, staff, club, 9000)).toBe(9000);
  });
});
