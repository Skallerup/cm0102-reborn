// Oraklets aftalte fremtidige skifter (TRANSFER_MANAGER +0x920/+0x928, 12 byte: dato, +8 buddets indeks) og de åbne bud pr. billede: tidsnibble
// (+0x30 & 0xf), kontrakttilbud (+0x2f), beløb (+0x1b), køber (+8) – til forkontrakt-/juni-analysen (K7). Kun oraklet, ingen spilkørsel.
//   npx tsx scripts/k7-future-oracle.ts [fra=2002-01-01] [til=2002-07-14]   (DIR=daysnap-mappe, standard s1-3.9.60-e1; JSON=fil)
import { writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import type { SparseMem } from '../src/game/cmMem';

const DIR = process.env.DIR ?? DEFAULT_DAYSNAP;
const FROM = process.argv[2] ?? '2002-01-01', TO = process.argv[3] ?? '2002-07-14';
const STEP = Number(process.env.STEP ?? 7);
const dayIso = (d: number, y: number) => (y > 1850 && y < 2100 ? new Date(Date.UTC(y, 0, 1 + d)).toISOString().slice(0, 10) : '?');
const str = (m: SparseMem, a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const ix = readDaySnapIndex(DIR)!;
const snaps = ix.snaps.filter((e) => e.kind === 'k' && e.iso >= FROM && e.iso <= TO).filter((_, i) => i % STEP === 0);
const out: unknown[] = [];
for (const e of snaps) {
  const m = loadDaySnap(ix, e);
  const tm = m.u32(0xde1f54), C = m.u32(0xae23b4), nc = m.s32(0xae235c);
  const cNat = (ix: number) => (ix >= 0 && ix < nc ? str(m, m.u32(C + 0x245 * ix + 0x53) + 4, 51) : '');
  const offers = m.u32(tm), nOff = m.s32(tm + 4);
  const fut = m.u32(tm + 0x920), nf = m.s32(tm + 0x928);
  const nib: Record<string, number> = {}, futD: Record<string, number> = {};
  let eng = 0;
  const rows: unknown[] = [];
  for (let i = 0; i < nf; i++) {
    const f = fut + 12 * i, d = dayIso(m.s16(f), m.s16(f + 2)), oi = m.s32(f + 8);
    const o = m.u32(offers + 4 * oi);
    if (!o) continue;
    const t = m.u8(o + 0x30) & 0xf, k = m.u8(o + 0x2f), fee = m.s32(o + 0x1b), buyer = m.s32(o + 8);
    const key = `n${t}${k ? 'k' : ''}${fee ? '$' : '0'}`;
    nib[key] = (nib[key] ?? 0) + 1;
    if (cNat(buyer) === 'England') { eng++; futD[d] = (futD[d] ?? 0) + 1; }
    rows.push({ d, t, k, fee, buyer, st: m.s32(o + 0xc), state: m.u8(o + 0x2c) });
  }
  // åbne bud pr. tilstand (+0x2c) og nibble
  const open: Record<string, number> = {};
  let used = 0;
  for (let i = 0; i < nOff; i++) { const o = m.u32(offers + 4 * i); if (!o) continue; used++; const key = `s${m.u8(o + 0x2c)}n${m.u8(o + 0x30) & 0xf}${m.u8(o + 0x2f) ? 'k' : ''}`; open[key] = (open[key] ?? 0) + 1; }
  console.log(e.iso, `fremtidige ${nf} (eng købere ${eng})`, JSON.stringify(nib), JSON.stringify(Object.fromEntries(Object.entries(futD).sort())));
  console.log("   bud", nOff, "brugt", used, JSON.stringify(Object.fromEntries(Object.entries(open).sort((a, b) => b[1] - a[1]).slice(0, 14))));
  out.push({ iso: e.iso, nf, rows });
}
if (process.env.JSON) writeFileSync(process.env.JSON, JSON.stringify(out));
void homedir;
