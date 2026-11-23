// K7 leje: hvordan står en udlejet i oraklets hukommelse? (+0x39, hovedkontrakt/lejekontrakt, hvilke klubbers trupliste +0xd7 og pladsen)  npx tsx scripts/k7-loan-memrep.ts [dato]
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import type { SparseMem } from '../src/game/cmMem';
const ix = readDaySnapIndex(process.env.DIR ?? DEFAULT_DAYSNAP)!;
const str = (m: SparseMem, a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const e = ix.snaps.find((s) => s.iso === (process.argv[2] ?? '2001-09-01'))!;
const m = loadDaySnap(ix, e);
const S = m.u32(0xae23bc), n = m.s32(0xae2364), C = m.u32(0xae23b4), nc = m.s32(0xae235c), K = m.u32(m.u32(0xae1050)), rows = m.u32(0xae2d0c);
const cName = (i: number) => (i >= 0 && i < nc ? str(m, C + 0x245 * i + 4, 51) : String(i));
const inList = new Map<number, number[]>();
for (let c = 0; c < nc; c++) { const a = C + 0x245 * c; for (let i = 0; i < 50; i++) { const st = m.u32(a + 0xd7 + 4 * i); if (!st) continue; const id = (st - S) / 0x6e; const l = inList.get(id) ?? []; l.push(c * 1000 + i); inList.set(id, l); } }
let shown = 0;
for (let id = 0; id < n && shown < 12; id++) {
  const st = S + 0x6e * id; if (!m.u32(st + 0x61)) continue;
  const li = m.s32(rows + 79 * id + 4), hi = m.s32(rows + 79 * id); if (li < 0) continue;
  shown++;
  const c39 = m.u32(st + 0x39);
  const k = K + 80 * hi, kl = K + 80 * li;
  console.log(str(m, m.u32(st + 8)), '+0x39', c39 ? cName((c39 - C) / 0x245) : '-', '| hoved +4', cName(m.s32(k + 4)), 'type', m.u8(k + 0x35) & 0x3f, '+0x4e', m.u8(k + 0x4e), '| leje +4', cName(m.s32(kl + 4)), 'type', m.u8(kl + 0x35) & 0x3f, '+0x4e', m.u8(kl + 0x4e),
    '| truplister', (inList.get(id) ?? []).map((x) => { const c = Math.floor(x / 1000); let len = 0; for (let i = 0; i < 50; i++) if (m.u32(C + 0x245 * c + 0xd7 + 4 * i)) len = i + 1; return `${cName(c)}#${x % 1000}/${len}`; }).join(','), '| row+0xb', m.u8(rows + 79 * id + 0xb).toString(16));
}
