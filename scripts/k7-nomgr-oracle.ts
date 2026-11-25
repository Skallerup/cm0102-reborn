// Oraklets engelske ligaklubber uden manager (club +0xcf = 0) pr. billede og managerskifterne mellem billederne.
//   DIR=<daysnap> FROM=2001-07-14 TO=2002-06-30 npx tsx scripts/k7-nomgr-oracle.ts
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import type { SparseMem } from '../src/game/cmMem';
const DIVS = new Set(['English Premier Division', 'English First Division', 'English Second Division', 'English Third Division', 'English Football Conference']);
const ix = readDaySnapIndex(process.env.DIR ?? DEFAULT_DAYSNAP)!;
const FROM = process.env.FROM ?? '0000', TO = process.env.TO ?? '9999';
const str = (m: SparseMem, a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
let prev = new Map<string, string>();
for (const e of ix.snaps) {
  if (e.iso < FROM || e.iso > TO) continue;
  const m = loadDaySnap(ix, e);
  const C = m.u32(0xae23b4), nc = m.s32(0xae235c);
  const cur = new Map<string, string>(); const none: string[] = [];
  for (let i = 0; i < nc; i++) {
    const adr = C + 0x245 * i;
    if (str(m, m.u32(adr + 0x53) + 4, 51) !== 'England') continue;
    const dv = m.u32(adr + 0x57), div = dv ? str(m, dv + 4, 51) : '';
    if (!DIVS.has(div)) continue;
    const nm = str(m, adr + 4, 51), p = m.u32(adr + 0xcf);
    const mg = p ? (str(m, m.u32(p + 0xc)) || `${str(m, m.u32(p + 4))} ${str(m, m.u32(p + 8))}`).trim() : '';
    cur.set(nm, mg); if (!mg) none.push(nm);
  }
  for (const [k, v] of cur) if (prev.has(k) && prev.get(k) !== v) console.log(`${e.iso} ${k}: ${prev.get(k) || '–'} → ${v || '–'}`);
  console.log(`${e.iso} uden manager ${none.length}${none.length ? ': ' + none.join(', ') : ''}`);
  prev = cur;
}
