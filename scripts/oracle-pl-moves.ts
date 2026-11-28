// Oraklets dagsbilleder (2001, frø 1): spillere i en PL-klub på første dag – hvor står de (klub +0x39, division +0x57) på en senere dag, og er de lejet
// (lejekontrakt: klubben ≠ hovedkontraktens klub)? Sammenlignes med cm-flow-2026.ts' sidste tabel.   npx tsx scripts/oracle-pl-moves.ts [til-dato]
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import type { SparseMem } from '../src/game/cmMem';

const until = process.argv[2] ?? '2002-06-09';
const ix = readDaySnapIndex(process.env.DAYSNAP ?? DEFAULT_DAYSNAP)!;
const e0 = ix.snaps[0], e1 = [...ix.snaps].reverse().find((e) => e.iso <= until)!;
const str = (m: SparseMem, a: number, n = 51) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
type V = Map<number, { club: string; div: string; nat: string; pl: boolean }>;
function view(m: SparseMem): V {
  const S = m.u32(0xae23bc), n = m.s32(0xae2364);
  const out: V = new Map();
  for (let id = 0; id < n; id++) {
    const st = S + 0x6e * id;
    if (!m.u32(st + 0x61)) continue;                 // spillerpost
    const ca = m.u32(st + 0x39);
    const div = ca ? str(m, m.u32(ca + 0x57) + 4) : '';
    out.set(id, { club: ca ? str(m, ca + 4) : '', div, nat: ca ? str(m, m.u32(ca + 0x53) + 4) : '', pl: div === 'English Premier Division' });
  }
  return out;
}
const A = view(loadDaySnap(ix, e0)), B = view(loadDaySnap(ix, e1));
console.log(`${e0.iso} → ${e1.iso}`);
const cnt = new Map<string, number>(); let n0 = 0;
for (const [id, a] of A) {
  if (!a.pl) continue; n0++;
  const b = B.get(id);
  if (!b || b.club === a.club) continue;
  const k = !b.club ? 'klubløs' : b.pl ? 'PL' : b.nat === 'England' ? `ENG ${b.div}` : b.nat;
  cnt.set(k, (cnt.get(k) ?? 0) + 1);
}
console.log(`PL-spillere ved start ${n0}; i en anden klub ${[...cnt.values()].reduce((x, y) => x + y, 0)}`);
for (const [k, v] of [...cnt].sort((x, y) => y[1] - x[1])) console.log(`  ${k} ${v}`);
