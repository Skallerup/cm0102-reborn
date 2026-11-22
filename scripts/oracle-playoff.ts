// Oraklets engelske play-off-kampe (fixtures_<år>.tmp i en daysnap-kørsels files/) med klubnavne fra et dagsbillede (klub-array 0xae23b4,
// 0x245 bytes pr. klub; fixture-postens hold = indekset). Brug: npx tsx scripts/oracle-playoff.ts [daysnap-mappe] [fra-dag-i-året] [billede-nr]
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import type { SparseMem } from '../src/game/cmMem';

const dir = process.argv[2] ?? DEFAULT_DAYSNAP;
const FROM = Number(process.argv[3] ?? 110);
const ix = readDaySnapIndex(dir)!;
const m: SparseMem = loadDaySnap(ix, ix.snaps[Number(process.argv[4] ?? ix.snaps.length - 1)]);
const str = (a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const C = m.u32(0xae23b4), nc = m.s32(0xae235c);
const name = (i: number) => (i >= 0 && i < nc ? str(C + 0x245 * i + 4, 51) : `#${i}`);
const files = join(dir, 'files');
for (const f of readdirSync(files).filter((x) => /^fixtures_\d{4}\.tmp$/.test(x)).sort()) {
  const b = readFileSync(join(files, f)); const v = new DataView(b.buffer, b.byteOffset, b.byteLength); const n = v.getInt32(0, true);
  for (let k = 0; k < n; k++) {
    const o = 4 + k * 79; const comp = v.getInt32(o, true); const day = v.getUint16(o + 42, true); const yr = v.getUint16(o + 40, true);
    if (![8, 9, 10].includes(comp) || day < FROM || day > 200) continue;
    const h = v.getInt32(o + 12, true), a = v.getInt32(o + 16, true);
    const d = new Date(Date.UTC(yr, 0, 1) + day * 864e5).toISOString().slice(0, 10);
    const hex = [...b.subarray(o + 0x2c, o + 0x4f)].map((x) => x.toString(16).padStart(2, '0')).join('');
    console.log(f, comp, d, name(h), '-', name(a), v.getUint8(o + 67), v.getUint8(o + 68), v.getUint8(o + 71), v.getUint8(o + 72), hex);
  }
}
// tabellerne (Comp_Stats-rækken 0x76 bytes: +0 klub-id, +4 kampe, +0x73 placering) for de tre divisioner på billedets dato
const byId = new Map<number, number>(); for (let i = 0; i < nc; i++) byId.set(m.s32(C + 0x245 * i), i);
console.log('billede', ix.snaps[Number(process.argv[4] ?? ix.snaps.length - 1)].iso);
for (const comp of [8, 9, 10]) {
  const cp = m.u32(m.u32(0xadadfc) + 4 * comp), sp = cp ? m.u32(cp + 8) : 0;
  if (!sp) continue;
  const rows = m.u32(sp + 0xc), nr = m.s32(sp + 0x14);
  const t: [number, string, number][] = [];
  for (let i = 0; i < nr && i < 200; i++) { const r = rows + 0x76 * i; t.push([m.u8(r + 0x73), name(byId.get(m.s32(r)) ?? -1), m.u8(r + 4)]); }
  t.sort((a, b) => a[0] - b[0]);
  console.log(comp, t.slice(0, 8).map((x) => `${x[0]}.${x[1]}(${x[2]})`).join(' | '));
}
