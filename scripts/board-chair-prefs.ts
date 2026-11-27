// Formandens præferencer (staff +0x65 +0x1c..+0x24 yndlinge / +0x28..+0x30 uvenner) mod klubbens manager i oraklets første dagsbillede –
// 0x547810/0x547840 i 0x697c40 §15 (+6 ≥ 4250 / ≤ 5250) og 0x69d1b0 (kandidatscoren).   npx tsx scripts/board-chair-prefs.ts
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import type { SparseMem } from '../src/game/cmMem';

const str = (m: SparseMem, a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const ix = readDaySnapIndex(DEFAULT_DAYSNAP)!;
const m = loadDaySnap(ix, ix.snaps[0]);
const C = m.u32(0xae23b4), nc = m.s32(0xae235c);
const nm = (p: number) => (p ? str(m, m.u32(p + 0xc)) || `${str(m, m.u32(p + 4))} ${str(m, m.u32(p + 8))}` : '');
let n = 0, fav = 0, dis = 0, any = 0;
for (let i = 0; i < nc; i++) {
  const a = C + 0x245 * i, ch = m.u32(a + 0xbf), mg = m.u32(a + 0xcf);
  if (!ch) continue;
  n++;
  const pr = m.u32(ch + 0x65);
  if (!pr) continue;
  const f = [0x1c, 0x20, 0x24].map((o) => m.u32(pr + o)), d = [0x28, 0x2c, 0x30].map((o) => m.u32(pr + o));
  if (f.some(Boolean) || d.some(Boolean)) any++;
  const land = str(m, m.u32(a + 0x53) + 4);
  if (mg && f.includes(mg)) { fav++; if (land === 'England') console.log('yndling', str(m, a + 4), nm(mg)); }
  if (mg && d.includes(mg)) { dis++; console.log('uven', str(m, a + 4), land, nm(mg), 'formand', nm(ch)); }
}
console.log({ formænd: n, medPræferencer: any, managerErYndling: fav, managerErUven: dis });
