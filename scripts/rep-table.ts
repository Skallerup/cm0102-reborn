// Oraklets ligatabeller (Comp_Stats +4 kampe, +0x72 udgangsplacering, +0x73 nu, +0x74/+0x75 bedst/dårligst) og klubomdømmet på en billeddato.
//   npx tsx scripts/rep-table.ts 2002-04-13 [klub …]
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import { homedir } from 'node:os';
import type { SparseMem } from '../src/game/cmMem';
const [iso, ...only] = process.argv.slice(2);
const ixs = [readDaySnapIndex(DEFAULT_DAYSNAP)!, readDaySnapIndex(`${homedir()}/cm0102-engine/oracle/daysnap/s1-3.9.60-y23-e14`)!];
const ix = ixs.find((x) => x.snaps.some((e) => e.iso === iso))!;
const m: SparseMem = loadDaySnap(ix, ix.snaps.find((e) => e.iso === iso)!);
const str = (a: number, n = 51) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const C = m.u32(0xae23b4), nc = m.s32(0xae235c);
const out: string[] = [];
for (let ix2 = 0; ix2 < nc; ix2++) {
  const adr = C + 0x245 * ix2, name = str(adr + 4);
  if (only.length && !only.includes(name)) continue;
  const dv = m.u32(adr + 0x57); if (!dv) continue;
  const cp = m.u32(m.u32(0xadadfc) + 4 * m.s32(dv)), sp = cp ? m.u32(cp + 8) : 0;
  if (!sp) continue;
  const rows = m.u32(sp + 0xc), nr = m.s32(sp + 0x14);
  for (let i = 0; i < nr && i < 200; i++) if (m.s32(rows + 0x76 * i) === m.s32(adr)) {
    const r = rows + 0x76 * i;
    out.push(`${str(dv + 4).padEnd(26)} ${String(m.u8(r + 0x73)).padStart(2)} ${name.padEnd(26)} p=${m.u8(r + 4)} x72=${m.u8(r + 0x72)} best=${m.u8(r + 0x74)} worst=${m.u8(r + 0x75)} n=${m.s16(cp + 0x3e)} rep=${m.s16(adr + 0x80)}`);
  }
}
console.log(out.sort().join('\n'));
