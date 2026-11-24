// Formændenes ikke-spillerpost i oraklets første dagsbillede (club +0xbf → staff +0x69 → np +0x0f Business, +0x16 Interference, +0x20 Resources)
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
const ix = readDaySnapIndex(process.argv[2] ?? DEFAULT_DAYSNAP)!;
const m = loadDaySnap(ix, ix.snaps[0]);
const C = m.u32(0xae23b4), nc = m.s32(0xae235c);
const h: Record<string, number> = {}, hb: Record<string, number> = {}, hr: Record<string, number> = {};
const str = (a: number) => { let s = ''; for (let i = 0; i < 51; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s; };
const s8 = (x: number) => (x << 24) >> 24;
let n = 0, ne = 0, nEng = 0;
const engNames: string[] = [];
const out: string[] = [];
const pick = (process.env.CLUBS ?? 'Arsenal,Everton,Sheffield United,Walsall,Sheffield Wednesday,Bury,Manchester United').split(',');
for (let k = 0; k < nc; k++) {
  const a = C + 0x245 * k, isEng = str(m.u32(a + 0x53) + 4) === 'England' && !!m.u32(a + 0x57);
  if (isEng) nEng++;
  const st = m.u32(a + 0xbf); if (!st) continue;
  const np = m.u32(st + 0x69); if (!np) continue;
  n++; if (isEng) { ne++; engNames.push(str(a + 4)); }
  const i = s8(m.u8(np + 0x16)), b = s8(m.u8(np + 0xf)), r = s8(m.u8(np + 0x20));
  h[i] = (h[i] ?? 0) + 1; hb[b] = (hb[b] ?? 0) + 1; hr[r] = (hr[r] ?? 0) + 1;
  if (pick.includes(str(a + 4))) out.push(`${str(a + 4)} int ${i} bus ${b} res ${r} pat ${s8(m.u8(np + 0x1d))}`);
}
console.log('klubber med formand', n, 'engelske ligaklubber', nEng, 'heraf med formand', ne);
if (process.env.NAMES) console.log(engNames.sort().join('|'));
console.log('interference', JSON.stringify(h));
console.log('business', JSON.stringify(hb));
console.log('resources', JSON.stringify(hr));
console.log(out.join('\n'));
