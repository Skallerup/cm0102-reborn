// Originalens hukommelse fra et øjebliksbillede (sporbinærens sn_trace.c: pre-/post-<dag>-<år>.bin) som SparseMem til portene i
// src/game/cmMem.ts – og loggen (log-<dag>-<år>.txt: rand R, kald E/C).
import { readFileSync } from 'node:fs';
import { SparseMem } from '../src/game/cmMem';

export function loadSnap(path: string): SparseMem {
  const b = readFileSync(path);
  const m = new SparseMem();
  let o = 0;
  while (o + 8 <= b.length) {
    const a = b.readUInt32LE(o), n = b.readUInt32LE(o + 4);
    o += 8;
    // sidevis kopi (hurtigere end bytevis)
    let i = 0;
    while (i < n) {
      const addr = a + i, pg = addr >>> 12, off = addr & 0xfff, len = Math.min(0x1000 - off, n - i);
      m.page(pg)!.set(b.subarray(o + i, o + i + len), off);
      i += len;
    }
    o += n;
  }
  return m;
}

export interface SnapCall { pre: boolean; adr: number; ret: number; ecx: number; args: number[]; eax?: number; st0?: number; out?: { k: number; hex: string }[] }
export interface SnapLog { day: number; year: number; slice: number; flag: number; datePtr: number; ecx: number; rands: { n: number; ret: number; r: number }[]; calls: SnapCall[]; seq: ({ k: 'R'; i: number } | { k: 'E' | 'C'; i: number })[] }

export function loadLog(path: string): SnapLog {
  const lines = readFileSync(path, 'utf8').split('\n');
  const L: SnapLog = { day: 0, year: 0, slice: 0, flag: 0, datePtr: 0, ecx: 0, rands: [], calls: [], seq: [] };
  for (const ln of lines) {
    const t = ln.split(' ');
    if (t[0] === 'A') { L.day = +t[1]; L.year = +t[2]; L.slice = +t[3]; L.flag = +t[4]; L.datePtr = parseInt(t[5], 16); L.ecx = parseInt(t[6], 16); }
    else if (t[0] === 'R') { L.seq.push({ k: 'R', i: L.rands.length }); L.rands.push({ n: +t[1], ret: parseInt(t[2], 16), r: +t[4] }); }
    else if (t[0] === 'E' || t[0] === 'C') {
      const c: SnapCall = { pre: t[0] === 'E', adr: parseInt(t[1], 16), ret: parseInt(t[2], 16), ecx: parseInt(t[3], 16), args: t.slice(4, 12).map((x) => parseInt(x, 16) >>> 0) };
      if (!c.pre) {
        c.eax = parseInt(t[13], 16) >>> 0; c.st0 = Number(t[14]);
        for (const x of t.slice(15)) { const [k, hex] = x.split(':'); if (hex) (c.out ??= []).push({ k: +k, hex }); }
      }
      L.seq.push({ k: t[0] as 'E' | 'C', i: L.calls.length }); L.calls.push(c);
    }
  }
  return L;
}
