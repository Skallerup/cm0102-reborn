// Oraklets pokaldeltagere og -runder fra et dagsbillede: FA Cup'ens (EngFaCup) og Liga Cup'ens (EngCcCup) klubliste +0xa7 (6 bytes pr. klub:
// klubpost, +4 seed, +5 skæbne; +0x3e antal) og nøgle-id'erne 0x9cf5bc.. (divisioner/turneringer) – til kontrol af collect_entrants-porten.
//   npx tsx scripts/oracle-cup-entrants.ts [daysnap-mappe] [billede-nr=0] [turnering-id=351]
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';

const dir = process.argv[2] ?? DEFAULT_DAYSNAP;
const ix = readDaySnapIndex(dir)!;
const e = ix.snaps[Number(process.argv[3] ?? 0)];
const m = loadDaySnap(ix, e);
const COMP = Number(process.argv[4] ?? 351);
const str = (a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const C = m.u32(0xae23b4), nc = m.s32(0xae235c);
const clubIdx = (p: number) => (p - C) / 0x245;
const clubName = (p: number) => (p ? `${str(p + 4, 51)}#${m.s32(p)}` : '-');
console.log('billede', e.iso);
for (const a of [0x9cf2e4, 0x9cf5bc, 0x9cf5c0, 0x9cf5c4, 0x9cf5c8, 0x9cf69c, 0x9cf6a0, 0x9cf764, 0x9cf7bc]) console.log(a.toString(16), m.s32(a));
const comps = m.u32(0xadadfc);
const cp = m.u32(comps + 4 * COMP);
if (!cp) { console.log('ingen turnering', COMP); process.exit(0); }
const n = m.s16(cp + 0x3e), list = m.u32(cp + 0xa7);
console.log('turnering', COMP, 'år', m.u16(cp + 0x40), 'runder', m.s16(cp + 0x3c), 'deltagere', n, 'b2/b3/b4', m.u8(cp + 0xb2), m.u8(cp + 0xb3), m.u8(cp + 0xb4));
console.log("liste", list.toString(16), "a3", m.u32(cp + 0xa3).toString(16), "ad", m.u32(cp + 0xad).toString(16));
const rows: string[] = [];
for (let i = 0; i < n; i++) {
  const p = m.u32(list + 6 * i);
  const div = p ? m.u32(p + 0x57) : 0;
  rows.push(`${i} ${clubName(p)} idx=${p ? clubIdx(p) : -1} div=${div ? m.s32(div) : -1} seed=${m.u8(list + 6 * i + 4)} fate=${m.u8(list + 6 * i + 5)}`);
}
console.log(rows.join('\n'));
void nc;
