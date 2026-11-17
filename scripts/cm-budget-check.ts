// Finance::get_transfer_budget 0x598800 (cmBudget.ts, cmGen/f_598800.ts) på originalens hukommelse ved spilstarten 14/7-2001 (oraklet, frø 1,
// 3.9.60, England/Arsenal med mennesket "Smoke"): Funds-kaldet 0x598800(0, 0, 0, 1, 0) for en række klubber med inddataene (saldo, ugens lønsum
// +0xc, +0x1c, formandens Business, managerens omdømme). FIXTURE=1 → tests/fixtures/cm-budget-194-2001.json.gz (tests/cmBudget.test.ts).
//   npx tsx scripts/cm-budget-check.ts [snap.bin]
import { writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { homedir } from 'node:os';
import { loadSnap } from './ct-snap';
import type { CmCtx } from '../src/game/cmMem';
import { genCtx } from '../src/game/cmGen/impls';
import { GEN } from '../src/game/cmGen/index';
import { getClubFinance_5a0590 } from '../src/game/cmWage';
import { cmMemCall } from '../src/game/cmWageGame';

const file = process.argv[2] ?? `${homedir()}/cm0102-engine/work-r3/snap-start/pre-194-2001.bin`;
const m = loadSnap(file);
const read = new Set<number>(), wrote = new Set<number>();
if (process.env.FIXTURE) {
  const u8 = m.u8.bind(m), w8 = m.w8.bind(m);
  m.u8 = (a: number) => { a >>>= 0; if (!wrote.has(a)) read.add(a); return u8(a); };
  m.w8 = (a: number, v: number) => { a >>>= 0; wrote.add(a); w8(a, v); };
  // u16/u32 har hurtige veje uden om u8 – læsningerne registreres bytevis
  const u16 = m.u16.bind(m), u32 = m.u32.bind(m);
  m.u16 = (a: number) => { for (let k = 0; k < 2; k++) { const b = (a + k) >>> 0; if (!wrote.has(b)) read.add(b); } return u16(a); };
  m.u32 = (a: number) => { for (let k = 0; k < 4; k++) { const b = (a + k) >>> 0; if (!wrote.has(b)) read.add(b); } return u32(a); };
  const w16 = m.w16.bind(m), w32 = m.w32.bind(m);
  m.w16 = (a: number, v: number) => { for (let k = 0; k < 2; k++) wrote.add((a + k) >>> 0); w16(a, v); };
  m.w32 = (a: number, v: number) => { for (let k = 0; k < 4; k++) wrote.add((a + k) >>> 0); w32(a, v); };
}
const base: CmCtx = { m, rand: () => 0, call: (adr, ...a) => (adr === 0x5a0590 ? getClubFinance_5a0590(base, a[0]) : cmMemCall(base, adr, ...a)) };
const c = genCtx(base);
const str = (a: number, n = 51) => { let s = ''; for (let i = 0; i < n; i++) { const b = m.u8(a + i); if (!b) break; s += String.fromCharCode(b); } return s; };
const C = m.u32(0xae23b4), nc = m.s32(0xae235c);
const want = 'Manchester United,Arsenal,Liverpool,Bolton Wanderers,Crewe Alexandra,Newcastle United,Fulham,Middlesbrough,Bury,Chelsea,Leeds United'.split(',');
const cases: [string, number, number, number][] = [];
for (let i = 0; i < nc; i++) {
  const cl = C + 0x245 * i, name = str(cl + 4);
  if (!want.includes(name)) continue;
  const fin = getClubFinance_5a0590(base, cl);
  const bal = m.u32(fin) + m.s32(fin + 4) * 4294967296;
  const tb = GEN[0x598800](c, fin, [0, 0, 0, 1, 0]) | 0;
  const mg = m.u32(cl + 0xcf), np = mg ? m.u32(mg + 0x69) : 0, ch = m.u32(cl + 0xbf), chn = ch ? m.u32(ch + 0x69) : 0;
  cases.push([name, cl, fin, tb]);
  console.log(`${name.padEnd(20)} saldo £${bal} Funds £${tb} (${(tb / bal).toFixed(3)}) · +0xc ${m.s32(fin + 0xc)} +0x1c ${m.s32(fin + 0x1c)} · Business ${chn ? m.u8(chn + 0xf) : '-'} · manager ${np ? m.s16(np + 0xa) : '-'}/${m.s16(cl + 0x80)}`);
}
if (process.env.FIXTURE) {
  const as = [...read].sort((a, b) => a - b), runs: [number, string][] = [];
  for (let i = 0; i < as.length;) {
    let j = i; while (j + 1 < as.length && as[j + 1] - as[j] <= 8) j++;
    let h = ''; for (let a = as[i]; a <= as[j]; a++) h += m.u8(a).toString(16).padStart(2, '0');
    runs.push([as[i], h]); i = j + 1;
  }
  const out = 'tests/fixtures/cm-budget-194-2001.json.gz';
  writeFileSync(out, gzipSync(JSON.stringify({ snap: 'pre-194-2001.bin', runs, cases })));
  console.log(`${out}: ${cases.length} klubber, ${runs.length} stykker, ${as.length} bytes`);
}
