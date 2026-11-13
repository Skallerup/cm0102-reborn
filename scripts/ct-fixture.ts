// Laver en lille testfixture til tests/cmContract.test.ts af et øjebliksbillede: porten 0x4c7ac0 køres på originalens hukommelse (afspillet
// som i ct-daily-check.ts), og kun de bytes, porten læser før den selv skriver dem, gemmes – sammen med den del af loggen, den bruger, og
// originalens kontrakter/+0x52 bagefter for de personer, originalen ændrede.
// Brug: npx tsx scripts/ct-fixture.ts <snap-mappe> <dag> <år> <ud.json.gz>
import { writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { loadLog, loadSnap } from './ct-snap';
import { Replay } from './ct-replay';
import { G, SparseMem } from '../src/game/cmMem';
import { contractDailyUpdate_4c7ac0 } from '../src/game/cmContract';

const [dir, day, year, out] = process.argv.slice(2);
const pre = loadSnap(`${dir}/pre-${day}-${year}.bin`), post = loadSnap(`${dir}/post-${day}-${year}.bin`);
const log = loadLog(`${dir}/log-${day}-${year}.txt`);
const read = new Map<number, number>(), written = new Set<number>(), wlog: number[] = [];
class Rec extends SparseMem {
  u8(a: number): number { a >>>= 0; const v = pre.u8(a); if (!written.has(a) && !read.has(a)) read.set(a, v); return super.u8(a); }
  w8(a: number, v: number): void { written.add(a >>> 0); wlog.push(a >>> 0); super.w8(a, v); }
}
const m = new Rec();
// arbejdskopien: originalens bytes indlæses dovent fra pre ved første læsning (Rec.u8 → super.u8 læser sin egen side, som fyldes her)
const base = SparseMem.prototype.u8;
Rec.prototype.u8 = function (this: Rec, a: number): number {
  a >>>= 0;
  if (!written.has(a)) { if (!read.has(a)) read.set(a, pre.u8(a)); return read.get(a)!; }
  return base.call(this, a);
};
const R = new Replay(m, log);
// det porten bruger: rand-svar og kaldenes svar (+ ud-parametrenes bytes, som afspilningen skrev)
const ev: (number | string)[][] = [];
const ctx = {
  m,
  rand: (n: number) => { const r = R.rand(n); ev.push([0, n, r]); return r; },
  call: (adr: number, ...a: number[]) => {
    const w0 = wlog.length;
    const r = R.call(adr, ...a);
    const outs: string[] = [];
    for (const x of a) { const p = x >>> 0; if (p >= 0x100000 && p < 0x400000 && wlog.indexOf(p, w0) >= 0) { let h = ''; for (let k = 0; k < 32; k++) h += m.u8(p + k).toString(16).padStart(2, '0'); outs.push(`${p.toString(16)}:${h}`); } }
    ev.push([1, adr, r, ...outs]); return r;
  },
};
contractDailyUpdate_4c7ac0(ctx, log.datePtr, log.slice, log.flag);
// kun de brugte logposter
// bytes som [start, hex]-løb
const addrs = [...read.keys()].sort((a, b) => a - b);
const runs: [number, string][] = [];
for (const a of addrs) {
  const last = runs[runs.length - 1];
  const h = read.get(a)!.toString(16).padStart(2, '0');
  if (last && last[0] + last[1].length / 2 === a) last[1] += h; else runs.push([a, h]);
}
// originalens kontrakter og +0x52 efter dagen for dem, der ændredes
const n = pre.s32(G.STAFF_COUNT), staff = pre.u32(G.STAFF), rows = pre.u32(G.ROWS), cm = pre.u32(pre.u32(G.CM));
// [id, kontraktens adresse, ændrede bytes [offset, værdi]…, +0x52 efter, +0x52 ændret]
const expect: [number, number, [number, number][], number, number][] = [];
for (let id = 0; id < n; id++) {
  const ix = post.s32(rows + 79 * id), a = (cm + 80 * ix) >>> 0, s = staff + 0x6e * id;
  const vch = post.s32(s + 0x52) !== pre.s32(s + 0x52) ? 1 : 0;
  const bytes: [number, number][] = [];
  if (ix >= 0) for (let k = 0; k < 80; k++) if (post.u8(a + k) !== pre.u8(a + k)) bytes.push([k, post.u8(a + k)]);
  if (vch || bytes.length) expect.push([id, ix >= 0 ? a : 0, bytes, post.s32(s + 0x52), vch]);
}
const fx = { day: log.day, year: log.year, slice: log.slice, flag: log.flag, datePtr: log.datePtr, runs, ev, expect };
writeFileSync(out, gzipSync(JSON.stringify(fx)));
console.log(`${runs.length} løb, ${addrs.length} bytes, ${ev.length} hændelser, ${expect.length} ændrede personer`);
