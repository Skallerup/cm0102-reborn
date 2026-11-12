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
    ['lockstep-pl2', 781, 618000],  // 794–538, ls20: HELE kampen (syvende runde: skuddets presserliste er kopier – 0x705c86 er aldrig lig markøren)
    ['lockstep-pl3', 768, 607000],  // 981–1780, ls20: HELE kampen (syvende runde: alene med keeperen – Finishing-rullet trækkes først 0x711884)
    ['lockstep-pl7', 820, 647000],  // 1349–1312, ls20: HELE kampen (sjette runde: forholdene staff+0x65 i afleveringsmulighederne, offside-hændelsen)
    ['lockstep-pl16', 748, 576000], // 1738–1689, ls20: HELE kampen (rødt kort og omrokering; syvende runde: slutvendingen 0x6f4143 mod skridtets felt)
    ['lockstep-pl6', 762, 592000],  // 1256–674, ls20: HELE kampen (syvende runde: keeperens nærmeste modstander 0x6c3950 – det rigtige hold)
    ['lockstep-pl14', 790, 618000], // 1231–1138, ls20: HELE kampen (syvende runde: boldholderens løbemål med frit løb som flag 1, 0x7122a2)
    ['lockstep-pl19', 806, 635000], // 1138–1738, ls20: HELE kampen (syvende runde: keeperens hovedstødsdyst 0x6c8c8e – grænsen er 16 bit)
    ['lockstep-pl9', 529, 418000],  // 1689–1231 (ls19, femte runde: pausens restitution 0x6f5810/0x6ce460, genvalg med F-linjernes 0x6e2f20, hvile 0x710408)
    ['lockstep-pl10', 263, 204000], // 908–981 (ls19: hvile 0x710408, forsvar i eget felt 0x71590f)
    ['lockstep-pl12', 520, 406000], // 671–1349, ls20 (sjette runde: skudscoren med 1/3 som double-konstant, ikke division)
    ['lockstep-pl18', 700, 537000], // 981–538, ls20 (sjette runde: 6cdd50 regner ikke +0x37, målstregen ved bold i eget felt 0x71590f)
    ['lockstep-pen', 1078, 846000], // 1311–574 turnering 352 (pen1): HELE kampen med forlænget spilletid OG straffesparkskonkurrence (syvende runde:
                                    // 0x6bd930's 990/1155/1320-grene, sub_6ce460(0/1), PENALTY_SHOOT_OUT 0x2002, One on Ones fra spillerposten)
    ['lockstep-cup', 775, 637000],  // 11–1873 venskabsturnering 72, cup4: HELE kampen (dommerens turneringsbias, 9 udskiftninger; syvende runde: Free Role
                                    // +0x1a i positionstilpasningen, klubbens land 0x708e1f)
  ] as const) {
    it(`${name}: de første ${ticks} tik`, async () => {
      const r = await run(name, ticks);
      expect(r.at ?? '').toBe('');
      expect(r.ticks).toBe(ticks);
      expect(r.rands).toBeGreaterThan(rands);
      // hele kampe: alle motorens tal er brugt – originalens næste tal er kamprapportens sub_6d26b0 (0x6d26b0–0x6d360f) efter slutfløjtet
      if (r.finished) expect(parseInt((r.next ?? '0@0').split('@')[1].split(' ')[0], 16)).toBeGreaterThanOrEqual(0x6d26b0);
      if (r.finished) expect(parseInt((r.next ?? '0@0').split('@')[1].split(' ')[0], 16)).toBeLessThan(0x6d3610);
    }, 120000);
  }
});
