// Bestyrelsens fyringer i oraklet: manageren pr. klub (club +0xcf) og bestyrelsens tillid (MANAGER_MANAGER [0xb67a44] +0x49·klub: +6 w6)
// for hver dag i dagsbillederne (frø 1, 3.9.60, England aktivt, Arsenal) → JSON til scripts/board-sack-ours.ts (sammenligningen).
//   node scripts/measure.mjs --oracle -- npx tsx scripts/board-sack-oracle.ts <ud.json>
import { writeFileSync } from 'node:fs';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import type { SparseMem } from '../src/game/cmMem';

const out = process.argv[2];
if (!out) throw new Error('brug: board-sack-oracle.ts <ud.json>');
const ix = readDaySnapIndex(process.env.DAYSNAP ?? DEFAULT_DAYSNAP)!;
const str = (m: SparseMem, a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
interface Club { name: string; nation: string; div: string }
const clubs: Club[] = [];
const days: { d: string; mgr: number[]; w6: number[] }[] = [];
const staffName = new Map<number, string>();
for (const e of ix.snaps) {
  const m = loadDaySnap(ix, e);
  const S = m.u32(0xae23bc), C = m.u32(0xae23b4), nc = m.s32(0xae235c), MM = m.u32(0xb67a44);
  if (!clubs.length) for (let i = 0; i < nc; i++) {
    const a = C + 0x245 * i, dv = m.u32(a + 0x57);
    clubs.push({ name: str(m, a + 4, 51), nation: str(m, m.u32(a + 0x53) + 4, 51), div: dv ? str(m, dv + 4, 51) : '' });
  }
  const mgr: number[] = [], w6: number[] = [];
  for (let i = 0; i < nc; i++) {
    const p = m.u32(C + 0x245 * i + 0xcf), id = p ? (p - S) / 0x6e : -1;
    mgr.push(id);
    if (id >= 0 && !staffName.has(id)) { const c = str(m, m.u32(p + 0xc)); staffName.set(id, c || `${str(m, m.u32(p + 4))} ${str(m, m.u32(p + 8))}`.trim()); }
    w6.push(MM ? m.s16(m.u32(MM) + 0x49 * i + 6) : 0);
  }
  days.push({ d: e.iso, mgr, w6 });
  if (days.length % 30 === 1) console.log(e.iso, nc);
}
writeFileSync(out, JSON.stringify({ clubs, days, staff: Object.fromEntries(staffName) }));
console.log('skrevet', out, days.length);
