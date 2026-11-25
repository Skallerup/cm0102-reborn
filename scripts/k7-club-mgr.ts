// K7: klubbernes manager (+0xcf) pr. land – oraklets dagsbillede mod ønskelisternes hukommelse i spillet (spilstart). Uden manager giver
// 0x5408c0 kendskab 4 (verdensomdømmet +0xd) i 0x4d0c60/0x5407e0 – med en manager klubbens eget (0: +0xb).
//   WORLD=<world-dbs2.json> [D=2001-07-14] [NATIONS=Scotland,Wales,…] npx tsx scripts/k7-club-mgr.ts
import { readFileSync } from 'node:fs';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import { G, type CmMem } from '../src/game/cmMem';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { buildSlMem } from '../src/game/cmShortlistGame';

const D = process.env.D ?? '2001-07-14';
const NAT = (process.env.NATIONS ?? 'England,Scotland,Wales,Republic of Ireland,Northern Ireland,Norway,Sweden,Denmark,Finland,Italy,Spain,France,Germany,Netherlands').split(',');
const str = (m: CmMem, a: number, n = 54) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
function count(m: CmMem, natOf?: (a: number) => string): Record<string, [number, number]> {
  const C = m.u32(G.CLUBS), nc = m.s32(0xae235c), r: Record<string, [number, number]> = {};
  for (let i = 0; i < nc; i++) {
    const a = C + 0x245 * i, n = natOf ? natOf(a) : str(m, m.u32(a + 0x53) + 4);
    if (!NAT.includes(n)) continue;
    const x = (r[n] ??= [0, 0]); x[0]++; if (m.u32(a + 0xcf)) x[1]++;
  }
  return r;
}
const ix = readDaySnapIndex(DEFAULT_DAYSNAP)!;
const O = count(loadDaySnap(ix, ix.snaps.find((x) => x.iso === D)!));
const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
const SM = buildSlMem(g).m;
const U = count(SM, (a) => { const c = g.clubs[SM.s32(a)]; return c ? w.nations[c.nation]?.name ?? '' : ''; });
const mem: Record<string, number> = {};
for (const c of Object.values(g.clubs)) { const s = g.staff[c.manager ?? -1]; if (s?.cmMem) { const n = w.nations[c.nation]?.name ?? ''; mem[n] = (mem[n] ?? 0) + 1; } }
for (const n of NAT) console.log(`${n.padEnd(22)} klubber m. manager: orakel ${O[n]?.[1] ?? 0}/${O[n]?.[0] ?? 0}  spil ${U[n]?.[1] ?? 0}/${U[n]?.[0] ?? 0}  (manager i hukommelsen, Staff.cmMem: ${mem[n] ?? 0}; cmStaffMem ${!!g.cmStaffMem})`);
