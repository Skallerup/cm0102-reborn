// 0x6e6340 (planScore.ts) og planlæggerens 0x6e2f20 med managerblokken 0x1000 (roleScore.ts) mod den instrumenterede originals spor
// (RECOMP_PS_TRACE, ~/cm0102-engine/tools/match_trace.c). tests/fixtures/ps-trace-sample.txt = 127 kald af 0x6e6340 (op til 3 pr. kaldested og
// flag, frø 1, 3.9.60, 330 dage – oracle/runs/ps3) og 60 af planlæggerens 0x6e2f20 (oracle/runs/ps1). De fulde spor tjekkes, hvis de findes.
import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { checkPs } from '../scripts/ps-trace-check';
import { managerBlock } from '../src/game/engine/grid/planScore';

describe('0x6e6340 / 0x6e2f20 0x1000', () => {
  it('stikprøven: alle kald ens', async () => {
    const r = await checkPs(`${__dirname}/fixtures/ps-trace-sample.txt`);
    expect(r.st.P.n).toBe(127);
    expect(r.st.Q.n).toBe(60);
    expect(r.st.P.ok).toBe(r.st.P.n);
    expect(r.st.Q.ok).toBe(r.st.Q.n);
  });
  it('managerblokken: driblebonussen for 0x20 kun i 0x6e6340', () => {
    const rec = new Array(0x46).fill(10); rec[0x26] = 40; rec[0x36] = 20; rec[0x1b] = 20;
    const np = new Array(0x48).fill(10);
    const m = { np, j59: 10, b59: 10, b5b: 10, rel: { d30: false, d60: false, m840: false, m810: false } };
    const plan = managerBlock(rec, 0x20, 0x20, 100, 25, m, true), role = managerBlock(rec, 0x20, 0x20, 100, 25, m, false);
    expect(plan).not.toBe(role);
  });
  const full = `${homedir()}/cm0102-engine/oracle/runs/ps3.txt`;
  it.skipIf(!existsSync(full))('hele sporet ps3 (75.752 kald, alle kaldere)', async () => {
    const r = await checkPs(full);
    expect(r.st.P.ok).toBe(r.st.P.n);
  }, 600000);
});
