// Klausulerne i originalens åbne bud (TRANSFER_MANAGER [0xde1f54]: +0 pegertabel, +4 antal; posten 0x41 bytes) i øjebliksbillederne –
// til sammenligning med cm-aibid.ts (build_bid 0x8e5d60).   npx tsx scripts/cm-aibid-orig.ts [fil …]
import { homedir } from 'node:os';
import { loadSnap } from './ct-snap';

const files = process.argv.slice(2).length ? process.argv.slice(2) : ['work-r3/snap-start/post-194-2001.bin', 'oracle/runs/xfer3-snap/post-200-2001.bin', 'oracle/runs/xfer3-snap/post-31-2002.bin', 'oracle/runs/xfer3-snap/post-180-2002.bin'];
for (const f of files) {
  const m = loadSnap(f.startsWith('/') ? f : `${homedir()}/cm0102-engine/${f}`);
  const tm = m.u32(0xde1f54), tab = m.u32(tm), n = m.s32(tm + 4);
  const t = { n: 0, loan: 0, rates: 0, sell: 0, lg: 0, int: 0, pub: 0, any: 0 };
  const rows: string[] = [];
  for (let i = 0; i < n && i < 200000; i++) {
    const r = m.u32(tab + 4 * i);
    if (!r || m.u8(r + 0x11) !== 0xb) continue;
    const loan = m.u8(r + 0x1f) === 1, fee = m.s32(r + 0x1b), mo = (m.u8(r + 0x40) << 24) >> 24, so = (m.u8(r + 0x3f) << 24) >> 24;
    const lg = m.s32(r + 0x35), it = m.s32(r + 0x3a), pub = m.u8(r + 0x2d);
    t.n++; if (loan) t.loan++;
    if (mo > 0) t.rates++; if (so > 0) t.sell++; if (lg > 0) t.lg++; if (it > 0) t.int++; if (pub) t.pub++;
    if (mo > 0 || so > 0 || lg > 0 || it > 0) { t.any++; if (rows.length < 6) rows.push(`fee ${fee} rater ${mo} videresalg ${so}% lg ${lg}/${m.u8(r + 0x39)} int ${it}/${m.u8(r + 0x3e)} state ${m.u8(r + 0x2c)}`); }
  }
  console.log(f, JSON.stringify(t));
  for (const x of rows) console.log('   ', x);
}
