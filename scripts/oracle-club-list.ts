// Oraklets dagsbillede: klubber med et navn (delstreng) – indeks, division, trupliste +0xd7 (navn, nuværende klub +0x39) og manager +0xcf.
//   DAYSNAP=<mappe> npx tsx scripts/oracle-club-list.ts <navn> [dato]
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import type { SparseMem } from '../src/game/cmMem';

const ix = readDaySnapIndex(process.env.DAYSNAP ?? DEFAULT_DAYSNAP)!;
const e = ix.snaps.find((x) => x.iso === process.argv[3]) ?? ix.snaps[0];
const m = loadDaySnap(ix, e);
const str = (a: number, n = 51) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const C = m.u32(0xae23b4), nc = m.s32(0xae235c);
const who = (st: number) => `${str(m.u32(st + 4))} ${str(m.u32(st + 8))}${str(m.u32(st + 0xc)) ? ` (${str(m.u32(st + 0xc))})` : ''} @${str(m.u32(st + 0x39) + 4)}`;
console.log(`${e.iso}: ${nc} klubber`);
for (let i = 0; i < nc; i++) {
  const ca = C + 0x245 * i, nm = str(ca + 4);
  if (!nm.includes(process.argv[2])) continue;
  const list: string[] = [];
  for (let j = 0; j < 50; j++) { const st = m.u32(ca + 0xd7 + 4 * j); if (st) list.push(who(st)); }
  console.log(`[${i}] ${nm} · ${str(m.u32(ca + 0x57) + 4)} · ${list.length} i truplisten: ${list.join('; ')}`);
}
void (0 as unknown as SparseMem);
