// 0x5cccd0 (hoveddagsløkken), tidspunkt 2 ([0xae2c88] = 2), 0x5cd423–0x5cd575: om tirsdagen (0x54a3f0(i dag) = 1; 0 = mandag) følger klubbens
// omdømme +0x80 ligaplaceringen. Løkken går over hukommelsens klubber ([0xae23b4], [0xae235c] · 0x245) før klubtabellen [0xae2d14]
// (0x5cd776 – cmPlayerData.ts clubGrievanceCounts) og ændrer kun klubber, hvor
//   divisionen +0x57 findes og har id ≠ −1, klubben ikke er et landshold (0x53b900), turneringen [0xadadfc][id] og dens tabel (+8) findes,
//   klubbens Comp_Stats-række 0x4a4850 findes, antal hold n = turneringens +0x3e ≠ 0, den bedst/dårligst mulige slutplacering +0x74 ≠ +0x75,
//   placeringen nu +0x73 ≠ udgangsplaceringen +0x72 og kampe +4 > 6 (byte, uden fortegn).
// Så (x87, double): x = 400 − kampe·300/(2n − 2), højst ned til 100; omdømme = ftol(omdømme · (1 + (+0x72 − +0x73)/(n·x))) som word – intet loft.
// Tabellens felter er spillets (engine/grid/gameTable.ts: +0x72 = den forudsagte placering 0x68a850 – x72, +0x73 placeringen, +0x74/+0x75 possiblePositions).
import type { GameState } from './types';
import { cmMediaOn } from './cmPlayerData';
import { possiblePositions, sorted, x72 as compStatsX72 } from './engine/grid/gameTable';

const s16 = (v: number) => (v << 16) >> 16;

/** ugedag for en ISO-dato som 0x54a3f0 (0 = mandag … 6 = søndag) */
const weekday = (iso: string) => (new Date(`${iso}T00:00:00Z`).getUTCDay() + 6) % 7;

/** 0x5cd4e5–0x5cd566: det nye omdømme af omdømmet, kampene (+4), antal hold n (+0x3e), udgangsplaceringen (+0x72) og placeringen nu (+0x73) */
export function repByPosition(rep: number, played: number, n: number, x72: number, pos: number): number {
  let x = 400 - ((played & 0xff) * 300) / (2 * s16(n) - 2);
  if (x < 100) x = 100;
  const f = 1 + ((x72 & 0xff) - (pos & 0xff)) / (s16(n) * x);
  return s16(Math.trunc(s16(rep) * f));
}

/** 0x5cd423–0x5cd575 for dagen g.date (sim.ts newDay – lige før 0x5ce2d0's klubtabel, cmContractDaily) */
export function cmClubRepWeekly(g: GameState): void {
  if (!cmMediaOn(g) || !g.cmClubRep || weekday(g.date) !== 1) return;
  const reps = g.cmClubRep;
  for (const [compId, comp] of Object.entries(g.comps)) {
    if (comp.type !== 'league' || g.leagues[compId]?.hidden) continue;
    const n = s16(comp.clubs.length);
    if (n === 0) continue;
    const rows = sorted(g, comp.table);
    if (!rows.some((r) => r.p > 0)) continue;                                       // før første kamp er +0x73..+0x75 = 0
    const total = (rows.length - 1) * (g.customRules?.[compId]?.rounds ?? 2);
    rows.forEach((r, i) => {
      const cid = r.club;
      if (g.clubs[cid]?.league !== compId || reps[cid] === undefined) return;       // klubbens division +0x57
      const [best, worst] = possiblePositions(rows, i, total);
      const pos = i + 1, x72 = compStatsX72(g, compId, cid);
      if (best === worst || pos === x72 || !((r.p & 0xff) > 6)) return;
      reps[cid] = repByPosition(reps[cid], r.p, n, x72, pos);
    });
  }
}
