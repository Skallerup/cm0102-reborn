// Oraklets Europa-deltagere ved spilstart (dagsbilledet 14/7-01, daysnap s1-3.9.60-e1): klubbens +0x1db (turneringens post-id) og +0x1df (kode:
// UEFA Cup 1 = 1. runde, 2 = kvalifikation, 3 = opfyldning i build_entrants 0x902b90; Intertoto 1–3 = runde), landet og landets +0x11c (indlæst).
//   npx tsx scripts/oracle-euro-entrants.ts [UEFA|CL|UIC] [--tsv]
import { loadDaySnap, readDaySnapIndex } from './oracle-days';

const want = (process.argv[2] ?? 'UEFA').toUpperCase();
const ix = readDaySnapIndex();
if (!ix) throw new Error('ingen dagsbilleder');
const m = loadDaySnap(ix, ix.snaps[0]);
const str = (a: number, n = 51) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const C = m.u32(0xae23b4), N = m.u32(0xae235c);
const ids: Record<string, number> = { CL: m.u32(0x9cf6e8), UEFA: m.u32(0x9cf6f0), UIC: m.u32(0x9cf6f8) };
const rows: [string, string, number, number, number][] = [];
for (let i = 0; i < N; i++) {
  const a = C + 0x245 * i;
  if (m.u32(a + 0x1db) !== ids[want]) continue;
  const nat = m.u32(a + 0x53);
  rows.push([str(nat + 4), str(a + 4), m.u8(a + 0x1df), m.u8(nat + 0x11c), m.u16(a + 0x80)]);
}
rows.sort((x, y) => x[0].localeCompare(y[0]) || x[2] - y[2] || x[1].localeCompare(y[1]));
if (process.argv.includes('--tsv')) { for (const r of rows) console.log(r.join('\t')); process.exit(0); }
const by = new Map<string, number[]>();
for (const r of rows) { const v = by.get(r[0]) ?? [0, 0, 0, r[3]]; v[r[2] === 1 ? 0 : r[2] === 2 ? 1 : 2]++; by.set(r[0], v); }
console.log(`${want}: ${rows.length} klubber`);
for (const [n, v] of [...by].sort()) console.log(`${n}\tR1 ${v[0]}\tQ ${v[1]}\tandet ${v[2]}\tflag ${v[3]}\t${rows.filter((r) => r[0] === n).map((r) => `${r[1]}(${r[2]})`).join(', ')}`);
