// 0x601a40/0x6146b0: originalens navngivne klubber (globale 0x9d00a4..0x9d0524, klubindeks) i oraklets billede 14/7-01 – efter klubtrimmet
// 0x5267c0 (0x60ba80 beholder dem altid og skriver det nye indeks). Udskriver navnene (JSON) til kontrol af cm0102.ts' SPECIAL_CLUBS.
//   npx tsx scripts/club-special-oracle.ts
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import type { SparseMem } from '../src/game/cmMem';

const str = (m: SparseMem, a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const ix = readDaySnapIndex(process.env.DAYSNAP ?? DEFAULT_DAYSNAP)!;
const m = loadDaySnap(ix, ix.snaps.find((e) => e.iso === (process.env.DATE ?? '2001-07-14'))!);
const C = m.u32(0xae23b4), nc = m.s32(0xae235c);
const out: [string, number, string][] = [];
for (let g = 0x9d00a4; g <= 0x9d0524; g += 4) {
  const i = m.s32(g);
  out.push([g.toString(16), i, i >= 0 && i < nc ? str(m, C + 0x245 * i + 4, 51) : '']);
}
console.log(JSON.stringify(out));
