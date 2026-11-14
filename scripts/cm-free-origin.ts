// Hvor kommer originalens klubløse spillere ved spilstarten fra? Sammenligner øjebliksbilledet før forkørslen (pre-0-2001.bin, 1/1-2001) med
// spilstarten (pre-194-2001.bin, 14/7-2001): for hver klubløs spiller den 14/7 – klub, kontraktens udløb/type og alder den 1/1.
//   npx tsx scripts/cm-free-origin.ts
import { homedir } from 'node:os';
import { loadSnap } from './ct-snap';

const dir = `${homedir()}/cm0102-engine/work-r3/snap-start`;
const A = loadSnap(`${dir}/pre-0-2001.bin`), B = loadSnap(`${dir}/pre-194-2001.bin`);
const str = (m: typeof A, a: number) => { let s = ''; for (let i = 0; i < 54 && a; i++) { const ch = m.u8(a + i); if (!ch) break; s += String.fromCharCode(ch); } return s; };
const info = (m: typeof A) => ({ n: m.s32(0xae2364), staff: m.u32(0xae23bc), rows: m.u32(0xae2d0c), cm: m.u32(m.u32(0xae1050)), clubs: m.u32(0xae23b4) });
const IA = info(A), IB = info(B);
console.log('personer 1/1:', IA.n, ' 14/7:', IB.n);
const contract = (m: typeof A, I: typeof IA, id: number) => { const ix = m.s32(I.rows + 79 * id); return ix < 0 ? 0 : (I.cm + 80 * ix) >>> 0; };
const clubName = (m: typeof A, I: typeof IA, cid: number) => cid < 0 ? '-' : str(m, I.clubs + 0x245 * cid + 4) || `#${cid}`;
const cat: Record<string, number> = {}, ex: string[] = [];
let free = 0;
const byYear: Record<number, number> = {};
for (let id = 0; id < IB.n; id++) {
  const st = IB.staff + 0x6e * id, rec = B.u32(st + 0x61);
  if (!rec || B.u32(st + 0x39)) continue;
  free++;
  const y = B.s16(st + 0x12); byYear[y] = (byYear[y] ?? 0) + 1;
  let k: string;
  if (id >= IA.n) k = 'ny (id ≥ antallet 1/1)';
  else {
    const sa = IA.staff + 0x6e * id, ca = A.u32(sa + 0x39);
    const kA = contract(A, IA, id);
    if (!A.u32(sa + 0x61)) k = '1/1: ingen spillerpost';
    else if (!ca) k = '1/1: også klubløs';
    else {
      const exp = kA ? `${A.s16(kA + 0x2d)}/${A.u16(kA + 0x2f)}` : '-';
      k = `1/1: i klub, kontrakt til ${kA ? A.u16(kA + 0x2f) : '-'}`;
      if (ex.length < 30) ex.push(`${id} ${str(B, B.u32(st + 4))} ${str(B, B.u32(st + 8))} f.${y} 1/1: ${clubName(A, IA, A.s32(ca))} udløb ${exp} type ${kA ? A.u8(kA + 0x35) & 0x3f : '-'} +0x49 ${kA ? A.u8(kA + 0x49) : '-'} status ${kA ? A.u8(kA + 0x3d) : '-'}`);
    }
  }
  cat[k] = (cat[k] ?? 0) + 1;
}
console.log('klubløse 14/7:', free, cat);
console.log('fødselsår', byYear);
console.log(ex.join('\n'));
// og de klubløse 1/1
let freeA = 0;
for (let id = 0; id < IA.n; id++) { const st = IA.staff + 0x6e * id; if (A.u32(st + 0x61) && !A.u32(st + 0x39)) freeA++; }
console.log('klubløse 1/1:', freeA);
// prøver: navn, fødsel, land, CA/PA, omdømme (DUMP=1)
if (process.env.DUMP) {
  let k = 0;
  for (let id = 0; id < IB.n; id++) {
    const st = IB.staff + 0x6e * id, rec = B.u32(st + 0x61);
    if (!rec || B.u32(st + 0x39)) continue;
    if (k++ % 9) continue;
    console.log(id, JSON.stringify(str(B, B.u32(st + 4))), JSON.stringify(str(B, B.u32(st + 8))), JSON.stringify(str(B, B.u32(st + 0xc))), 'f.', B.s16(st + 0x10), B.s16(st + 0x12),
      'land', str(B, B.u32(st + 0x1a) + 4), 'CA', B.s16(rec + 5), 'PA', B.s16(rec + 7), 'omd.', B.s16(rec + 0xb), 'ptr', B.u32(st + 4).toString(16), B.u32(st + 8).toString(16));
  }
}
