// Oraklets bud fra computerklubber på menneskets spillere (TRANSFER_MANAGER [0xde1f54], posten 0x41 bytes – notes/transfer-bid.md) i
// dagsbillederne: beløb +0x1b mod spillerens værdi staff +0x52.   npx tsx scripts/oracle-human-bids.ts [daysnap-mappe] [klub] [hver n'te dag]
import { readDaySnapIndex, loadDaySnap, DEFAULT_DAYSNAP } from './oracle-days';
import type { SparseMem } from '../src/game/cmMem';

const [dir = DEFAULT_DAYSNAP, clubArg = 'Arsenal', everyArg = '1'] = process.argv.slice(2);
const ix = readDaySnapIndex(dir)!;
const str = (m: SparseMem, a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const seen = new Map<string, string>();
const snaps = ix.snaps.filter((_e, i) => i % +everyArg === 0);
for (const e of snaps) {
  const m = loadDaySnap(ix, e);
  const S = m.u32(0xae23bc), C = m.u32(0xae23b4), nc = m.s32(0xae235c);
  let home = -1; for (let i = 0; i < nc; i++) if (str(m, C + 0x245 * i + 4, 51) === clubArg) { home = i; break; }
  const tm = m.u32(0xde1f54), tab = m.u32(tm), n = m.s32(tm + 4);
  for (let i = 0; i < n && i < 200000; i++) {
    const r = m.u32(tab + 4 * i);
    if (!r) continue;
    const pid = m.s32(r + 0xc), st = S + 0x6e * pid, cl = m.u32(st + 0x39);
    if (!cl || (cl - C) / 0x245 !== home) continue;
    const buyer = m.s32(r + 8), fee = m.s32(r + 0x1b), loan = m.u8(r + 0x1f), state = m.u8(r + 0x2c);
    const key = `${pid}|${buyer}|${fee}|${loan}`;
    if (seen.has(key)) continue;
    const name = str(m, m.u32(st + 0xc)) || `${str(m, m.u32(st + 4))} ${str(m, m.u32(st + 8))}`;
    const val = m.s32(st + 0x52);
    const line = `${e.iso} ${name} <- ${str(m, C + 0x245 * buyer + 4, 51)} fee ${fee} værdi ${val} forhold ${val ? (fee / val).toFixed(2) : '-'} leje ${loan} tilst ${state} timing ${m.u8(r + 0x11)} rater ${(m.u8(r + 0x40) << 24) >> 24} runder ${m.u8(r + 0x2e)}`;
    seen.set(key, line); console.log(line);
  }
}
console.log(`bud i alt: ${seen.size}`);
