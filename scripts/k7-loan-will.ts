// K7c #3: viljen 0x846920 for udlejede og andre mod de 92 ligaklubber på oraklets dagsbillede (scripts/lib/willScan.ts; samme faste talrække
// som k7-loan-fields-ours.ts' WILL=1). DIR=<daysnap> [STEP=40] npx tsx scripts/k7-loan-will.ts [dato]
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import type { CmCtx, SparseMem } from '../src/game/cmMem';
import { genCtx } from '../src/game/cmGen/impls';
import { getClubFinance_5a0590 } from '../src/game/cmWage';
import { cmMemCall } from '../src/game/cmWageGame';
import { slCall, slmOf } from '../src/game/cmShortlist';
import { willScan, willReport } from './lib/willScan';

const ix = readDaySnapIndex(process.env.DIR ?? DEFAULT_DAYSNAP)!;
const str = (m: SparseMem, a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const e = ix.snaps.find((s) => s.iso === (process.argv[2] ?? '2001-08-25'))!;
const m = loadDaySnap(ix, e);
const S = m.u32(0xae23bc), n = m.s32(0xae2364), C = m.u32(0xae23b4), nc = m.s32(0xae235c), rows = m.u32(0xae2d0c);
let seed = 12345;
const miss = new Map<number, number>();
const base: CmCtx = {
  m,
  rand: (k) => { seed = (Math.imul(seed, 1103515245) + 12345) >>> 0; return k > 0 ? (seed >>> 8) % k : 0; },
  call: (adr, ...a) => {
    switch (adr) {
      case 0x5a0590: return getClubFinance_5a0590(base, a[0]);
      case 0x846920: case 0x849f00: case 0x844780: return slCall(c, adr, slmOf(m), ...a);
      case 0x8cca10: return slCall(c, adr, m.u32(0xde1f54), ...a);
    }
    try { return cmMemCall(base, adr, ...a); } catch { miss.set(adr, (miss.get(adr) ?? 0) + 1); return 0; }
  },
};
const c = genCtx(base);
const LEAGUE = /^English (Premier|First|Second|Third) Division/;
const clubs: number[] = [];
for (let i = 0; i < nc; i++) { const a = C + 0x245 * i, dv = m.u32(a + 0x57); if (dv && LEAGUE.test(str(m, dv + 4, 51))) clubs.push(i); }
const isLoan = (id: number) => m.s32(rows + 79 * id + 4) >= 0;
const eng = (id: number) => { const hi = m.s32(rows + 79 * id); if (hi < 0) return false; const K = m.u32(m.u32(0xae1050)); const ci = m.s32(K + 80 * hi + 4); return clubs.includes(ci); };
const STEP = +(process.env.STEP ?? 40);
const ids: number[] = [];
for (let id = 0; id < n; id++) {
  const st = S + 0x6e * id; if (!m.u32(st + 0x61) || m.u8(st + 0x3d) !== 0xb || !eng(id)) continue;
  if (isLoan(id) || id % STEP === 0) ids.push(id);
}
const r = willScan(c, m, ids, clubs, isLoan);
console.log(`oraklet ${e.iso}: ${clubs.length} klubber, ${ids.filter(isLoan).length} udlejede, ${ids.filter((x) => !isLoan(x)).length} andre; ikke porterede kald: ${[...miss].map(([a, k]) => `0x${a.toString(16)}×${k}`).join(' ') || 'ingen'}`);
for (const l of willReport(r, (id) => str(m, m.u32(S + 0x6e * id + 8)))) console.log(l);
