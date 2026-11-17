// Finance::get_transfer_budget 0x598800 (cmBudget.ts) på originalens hukommelse ved spilstarten 14/7-2001 (fixturen fra scripts/cm-budget-check.ts
// FIXTURE=1): Funds for 11 engelske klubber som originalen – og managerens omdømme (+0xcf → +0xa), der var det manglende input for menneskets klub.
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { SparseMem, type CmCtx } from '../src/game/cmMem';
import { genCtx } from '../src/game/cmGen/impls';
import { GEN } from '../src/game/cmGen/index';
import { getClubFinance_5a0590 } from '../src/game/cmWage';
import { cmMemCall } from '../src/game/cmWageGame';

function load() {
  const fx = JSON.parse(gunzipSync(readFileSync('tests/fixtures/cm-budget-194-2001.json.gz')).toString()) as { runs: [number, string][]; cases: [string, number, number, number][] };
  const m = new SparseMem();
  for (const [a, h] of fx.runs) m.loadHex(a, h);
  const base: CmCtx = { m, rand: () => 0, call: (adr, ...a) => (adr === 0x5a0590 ? getClubFinance_5a0590(base, a[0]) : cmMemCall(base, adr, ...a)) };
  return { fx, m, c: genCtx(base) };
}

describe('0x598800 på originalens hukommelse (14/7-2001)', () => {
  it('Funds for 11 klubber er originalens', () => {
    const { fx, c } = load();
    for (const [name, , fin, tb] of fx.cases) expect([name, GEN[0x598800](c, fin, [0, 0, 0, 1, 0]) | 0]).toEqual([name, tb]);
  });
  it('menneskets lave omdømme sænker loftet (Arsenal: Smoke 5282 mod klubbens 9000)', () => {
    const { fx, m, c } = load();
    const [, club, fin, tb] = fx.cases.find((k) => k[0] === 'Arsenal')!;
    const np = m.u32(m.u32(club + 0xcf) + 0x69);
    expect(m.s16(np + 0xa)).toBe(5282);
    m.w16(np + 0xa, 9000);
    const full = GEN[0x598800](c, fin, [0, 0, 0, 1, 0]) | 0;
    // med fuldt omdømme ligger Arsenal over saldoen (som de computerstyrede storklubber); med mennesket ~0,69 af saldoen
    expect(full).toBeGreaterThan(tb * 1.4);
  });
});
