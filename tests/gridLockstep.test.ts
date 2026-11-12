// Låsetrin mod den instrumenterede original (scripts/lockstep.ts): Premier League-kampe (orakel frø 1, 3.9.60), startet med originalens
// tilstand i toppen af tik 0 og fodret med originalens tilfældige tal. Sporene er klippet (tests/fixtures, uden XE-dumpene); *-aimode.txt er
// 0x6df460's indgange fra samme kørsel (tools/aimode_trace.c). Hver rettet oversættelsesfejl flytter afvigelsen senere – testene kræver de
// tik, der i dag er identiske (tal, T-linjer, turene sub_7103e0, 0x6df460's motorfelter).
import { describe, expect, it } from 'vitest';
import { readAiModeCalls, readMatch, runLockstep } from '../scripts/lockstep';

const run = async (name: string, ticks: number) => {
  const file = `tests/fixtures/${name}.txt.gz`;
  const tr = await readMatch(file, 0);
  const aimode = readAiModeCalls(`tests/fixtures/${name}-aimode.txt`, tr.M[0], tr.M[1]);
  return runLockstep(tr, { maxTicks: ticks, aimode });
};

describe('gittermotoren i låsetrin med originalen', () => {
  // [fixtur, identiske tik, mindst så mange tal]
  for (const [name, ticks, rands] of [
    ['lockstep-pl1', 11, 8500],   // 299–1873, sporet ls7 (tik 0–10)
    ['lockstep-pl0', 158, 119500],  // 299–1873, ls16 (fjerde runde: zonevalget ZP, samspillet RC/CP, sub_6ec010 MV)
    ['lockstep-pl2', 193, 150000],  // 794–538 (mål, landingens dom, modtagelsen ved boldhøjde 4, frispark)
    ['lockstep-pl3', 25, 19000],    // 981–1780 (ls12)
    ['lockstep-pl7', 158, 122000],  // 1349–1312 (to mål, afsparket efter mål, sub_6ec010 efter moralændringer)
    ['lockstep-pl16', 236, 180500], // 1738–1689 (2. spillerunde: rødt kort og omrokering, kampværdierne i kampen)
  ] as const) {
    it(`${name}: de første ${ticks} tik`, async () => {
      const r = await run(name, ticks);
      expect(r.at ?? '').toBe('');
      expect(r.ticks).toBe(ticks);
      expect(r.rands).toBeGreaterThan(rands);
    }, 120000);
  }
});
