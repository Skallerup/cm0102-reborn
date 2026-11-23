// Oraklets budstrøm (K7, lukket vindue): hvert bud i TRANSFER_MANAGER's tabel følges dag for dag (nøgle: køber, spiller, buddets dato) –
// nye bud pr. uge efter købers land (England/andre), art (køb/leje/klubløs/forkontrakt) og deres sidst sete tilstand (+0x2c).
//   npx tsx scripts/k7-bidflow-oracle.ts [fra=2002-01-01] [til=2002-06-10]   (DIR=daysnap-mappe)
import { writeFileSync } from 'node:fs';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import type { SparseMem } from '../src/game/cmMem';

const DIR = process.env.DIR ?? DEFAULT_DAYSNAP;
const FROM = process.argv[2] ?? '2002-01-01', TO = process.argv[3] ?? '2002-06-10';
const dayIso = (d: number, y: number) => (y > 1850 && y < 2100 ? new Date(Date.UTC(y, 0, 1 + d)).toISOString().slice(0, 10) : '?');
const str = (m: SparseMem, a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const ix = readDaySnapIndex(DIR)!;
const snaps = ix.snaps.filter((e) => e.iso >= FROM && e.iso <= TO);
interface B { pkey: string; bname: string; exp: string; iso: string; buyer: number; eng: boolean; player: number; loan: number; fee: number; k: number; t: number; states: number[]; hasClub: boolean; firstSeen: string }
const all = new Map<string, B>();
for (const e of snaps) {
  const m = loadDaySnap(ix, e);
  const tm = m.u32(0xde1f54), C = m.u32(0xae23b4), nc = m.s32(0xae235c);
  const cNat = (i: number) => (i >= 0 && i < nc ? str(m, m.u32(C + 0x245 * i + 0x53) + 4, 51) : '');
  const offers = m.u32(tm), nOff = m.s32(tm + 4);
  const S = m.u32(0xae23bc);
  for (let i = 0; i < nOff; i++) {
    const o = m.u32(offers + 4 * i); if (!o) continue;
    const buyer = m.s32(o + 8), pl = m.s32(o + 0xc), iso = dayIso(m.s16(o + 0x12), m.s16(o + 0x14));
    const key = process.env.BP ? `${buyer}/${pl}` : `${buyer}/${pl}/${iso}`;
    let b = all.get(key);
    const st = m.u8(o + 0x2c);
    if (!b) {
      // spillerens klub: staff +0x39 (klub-id) – staff-størrelse 0x6e
      const sa = S + 0x6e * pl;
      const club = m.u32(sa + 0x39);
      const common = str(m, m.u32(sa + 0xc)), f = str(m, m.u32(sa + 4)), l = str(m, m.u32(sa + 8));
      const dob = dayIso(m.s16(sa + 0x10), m.u16(sa + 0x12)) || `${m.s16(sa + 0x18)}-07-01`;
      const row = m.u32(0xae2d0c) + 79 * pl, kix = m.s32(row), k = kix < 0 ? 0 : m.u32(m.u32(0xae1050)) + 80 * kix;
      b = { pkey: `${common || f + ' ' + l}|${dob}`, bname: buyer >= 0 && buyer < nc ? str(m, C + 0x245 * buyer + 4, 51) : '', exp: k ? dayIso(m.s16(k + 0x2d), m.u16(k + 0x2f)) : '', iso, buyer, eng: cNat(buyer) === 'England', player: pl, loan: m.u8(o + 0x1f), fee: m.s32(o + 0x1b), k: m.u8(o + 0x2f), t: m.u8(o + 0x30) & 0xf, states: [], hasClub: club !== 0, firstSeen: e.iso };
      all.set(key, b);
    }
    if (b.states[b.states.length - 1] !== st) b.states.push(st);
    b.t = m.u8(o + 0x30) & 0xf; b.fee = m.s32(o + 0x1b);
  }
}
const wk = (iso: string) => { const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7)); return d.toISOString().slice(0, 10); };
const rows = new Map<string, Record<string, number>>();
for (const b of all.values()) {
  if (b.iso < FROM || !b.eng) continue;
  const kind = b.loan ? 'leje' : !b.hasClub ? 'fri' : 'køb';
  const w = wk(b.iso);
  const r = rows.get(w) ?? {}; rows.set(w, r);
  const last = b.states[b.states.length - 1];
  const path = b.states.map((s) => s.toString(16)).join('>');
  r[`${kind}`] = (r[kind] ?? 0) + 1;
  if (kind === 'køb') r[`køb:${path}:n${b.t}`] = (r[`køb:${path}:n${b.t}`] ?? 0) + 1;
  void last;
}
if (process.env.JSON) writeFileSync(process.env.JSON, JSON.stringify([...all.values()]));
for (const [w, r] of [...rows].sort()) console.log(w, JSON.stringify(Object.fromEntries(Object.entries(r).sort((a, b) => b[1] - a[1]))));
