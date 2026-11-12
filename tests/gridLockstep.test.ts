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
    ['lockstep-pl1', 300, 236000],  // 311–517, ls20 (sjette runde: optøjerne 0x716630/0x6d1210 – kommentar, holdets ophidselse, udvisning under optøjer)
    ['lockstep-pl0', 158, 119500],  // 299–1873, ls16 (fjerde runde: zonevalget ZP, samspillet RC/CP, sub_6ec010 MV)
    ['lockstep-pl2', 193, 150000],  // 794–538 (mål, landingens dom, modtagelsen ved boldhøjde 4, frispark)
    ['lockstep-pl3', 25, 19000],    // 981–1780 (ls12)
    ['lockstep-pl7', 820, 647000],  // 1349–1312, ls20: HELE kampen (sjette runde: forholdene staff+0x65 i afleveringsmulighederne, offside-hændelsen)
    ['lockstep-pl16', 468, 361000], // 1738–1689 (2. spillerunde: rødt kort og omrokering, kampværdierne i kampen; ls19: pausen, udskiftninger)
    ['lockstep-pl9', 529, 418000],  // 1689–1231 (ls19, femte runde: pausens restitution 0x6f5810/0x6ce460, genvalg med F-linjernes 0x6e2f20, hvile 0x710408)
    ['lockstep-pl10', 263, 204000], // 908–981 (ls19: hvile 0x710408, forsvar i eget felt 0x71590f)
    ['lockstep-pl12', 520, 406000], // 671–1349, ls20 (sjette runde: skudscoren med 1/3 som double-konstant, ikke division)
    ['lockstep-pl18', 700, 537000], // 981–538, ls20 (sjette runde: 6cdd50 regner ikke +0x37, målstregen ved bold i eget felt 0x71590f)
    ['lockstep-cup', 582, 477000],  // 11–1873 venskabsturnering 72 (cup4: dommerens turneringsbias 0x5c6710, 9 udskiftninger, 0x6ddab0 i kampen)
  ] as const) {
    it(`${name}: de første ${ticks} tik`, async () => {
      const r = await run(name, ticks);
      expect(r.at ?? '').toBe('');
      expect(r.ticks).toBe(ticks);
      expect(r.rands).toBeGreaterThan(rands);
    }, 120000);
  }
});
