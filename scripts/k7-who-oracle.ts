// K7: navngivne spilleres felter i oraklets dagsbillede (staff +0x18 alder, +0x52 værdi; spillerposten +5 CA, +7 PA, +9/+0xb/+0xd omdømme)
// til sammenligning med spillet.   WHO="Christian Fox,Michael Jack" [D=2001-07-21] npx tsx scripts/k7-who-oracle.ts
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import { getContract, G, type CmMem } from '../src/game/cmMem';

const IDS = new Set((process.env.IDS ?? '').split(',').filter(Boolean).map(Number));
const D = process.env.D ?? '2001-07-21', WHO = new Set((process.env.WHO ?? '').split(','));
const str = (m: CmMem, a: number, n = 54) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const ix = readDaySnapIndex(DEFAULT_DAYSNAP)!;
const m = loadDaySnap(ix, ix.snaps.find((x) => x.iso === D)!);
const C = m.u32(G.CLUBS), S = m.u32(G.STAFF), n = m.s32(G.STAFF_COUNT);
for (let id = 0; id < n; id++) {
  const st = S + 0x6e * id, rec = m.u32(st + 0x61); if (!rec) continue;
  const nm = `${str(m, m.u32(st + 4))} ${str(m, m.u32(st + 8))}`;
  if (!WHO.has(nm) && !IDS.has(id)) continue;
  const k = getContract(m, st), cl = k ? C + 0x245 * m.s32(k + 4) : 0;
  console.log(`${id} ${nm} (${cl ? str(m, cl + 4) : '-'}, ${cl ? str(m, m.u32(cl + 0x53) + 4) : '-'}, nat ${str(m, m.u32(st + 0x1a) + 4)}): alder ${(m.u8(st + 0x18) << 24) >> 24} CA ${m.s16(rec + 5)} PA ${m.s16(rec + 7)} omd ${m.s16(rec + 9)}/${m.s16(rec + 0xb)}/${m.s16(rec + 0xd)} +52 ${m.s32(st + 0x52)}`);
}
