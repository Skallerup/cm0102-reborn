// Oraklets TRANSFER_RULES-objekter (TM +0x8ac, 28 stk.): nationen, nation +0x11c (indlæst) og vtabellens +0x20 (can_loan) / +0x24 (sælgerens lejemåned).
//   npx tsx scripts/k7-loan-rules-oracle.ts
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
const ix = readDaySnapIndex(DEFAULT_DAYSNAP)!;
const m = loadDaySnap(ix, ix.snaps.find((s) => s.iso >= '2002-04-01')!);
const str = (a: number, n = 40) => { let s = ''; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s; };
const tm = m.u32(0xde1f54);
for (let i = 0; i < 28; i++) {
  const o = m.u32(tm + 0x8ac + 4 * i);
  if (!o) continue;
  const vt = m.u32(o), nat = m.u32(o + 0xa);
  console.log(i, str(nat + 4), '+0x11c', m.u8(nat + 0x11c), 'vt', vt.toString(16), '+0x20', m.u32(vt + 0x20).toString(16), '+0x24', m.u32(vt + 0x24).toString(16));
}
