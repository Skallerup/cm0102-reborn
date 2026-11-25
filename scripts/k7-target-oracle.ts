// (fejlsøgning) Hvem har en navngiven spiller som mål på ønskelisterne (pladsens +0xf) i oraklets dagsbilleder, plus parrene (ROWS +0xb),
// værdien +0x52 og kontraktens +0x3d/+0x4e.   WHO="Alex Manninger" FROM=2001-12-01 UNTIL=2002-01-10 npx tsx scripts/k7-target-oracle.ts
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import { getContract, G, type CmMem } from '../src/game/cmMem';
const WHO = process.env.WHO ?? 'Alex Manninger', FROM = process.env.FROM ?? '2001-12-01', UNTIL = process.env.UNTIL ?? '2002-01-10';
const str = (m: CmMem, a: number, n = 54) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const ix = readDaySnapIndex(DEFAULT_DAYSNAP)!;
let id = -1;
for (const e of ix.snaps.filter((x) => x.iso >= FROM && x.iso <= UNTIL).sort((a, b) => a.iso.localeCompare(b.iso))) {
  const m = loadDaySnap(ix, e) as unknown as CmMem;
  const C = m.u32(G.CLUBS), S = m.u32(G.STAFF), n = m.s32(G.STAFF_COUNT), nc = m.s32(0xae235c);
  if (id < 0) for (let i = 0; i < n; i++) { const st = S + 0x6e * i; if (`${str(m, m.u32(st + 4))} ${str(m, m.u32(st + 8))}` === WHO) { id = i; break; } }
  const st = S + 0x6e * id, k = getContract(m, st), tm = m.u32(0xde1f54), slm = m.u32(tm + 0x856);
  const tgt: string[] = [];
  for (let cix = 0; cix < nc; cix++) {
    const base = m.u32(m.u32(slm + 0xdc) + 9 * cix); if (!base) continue;
    for (let i = 0; i < 40; i++) { const s = base + 0x25 * i; if (m.u8(s) === 0xb && m.s32(s + 0xf) === id) tgt.push(`${str(m, C + 0x245 * cix + 4)}(b7 ${m.s32(s + 7)} bm ${m.s32(s + 0x17)})`); }
  }
  const rows = m.u32(G.ROWS);
  console.log(e.iso, 'id', id, '+52', m.s32(st + 0x52), 'k3d', k ? m.u8(k + 0x3d) : '-', 'k4e', k ? m.u8(k + 0x4e).toString(16) : '-', 'k35', k ? m.u8(k + 0x35).toString(16) : '-', 'rowB', m.u8(rows + 79 * id + 0xb).toString(16), 'mål hos', tgt.join(', '));
  (m as { release?: () => void }).release?.();
}
