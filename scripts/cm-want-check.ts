// Ønskekontrakten 0x85fc50 (src/game/cmContractWant.ts, kaldte funktioner fra cmGen/) på originalens hukommelse ved spilstarten 14/7-2001
// (~/cm0102-engine/work-r3/snap-start/pre-194-2001.bin + log-194-2001.txt, frø 1, 3.9.60, England):
//   (1) de 0x85fc50-kald, 0x4c7ac0 laver den dag (forlængelsestilbuddene 0x4cda70) – med loggens argumenter; returværdien mod loggens.
//   (2) OUT=<fil>: ønskekontrakten (staff, egen klub, −1, 0xff, 0xb) for alle spillere i engelske klubber → JSON (nøgle = klub|fødselsdag|år|CA)
//       til scripts/cm-want-game.ts.
//   npx tsx scripts/cm-want-check.ts [snap-mappe]
import { writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { homedir } from 'node:os';
import { loadSnap, loadLog } from './ct-snap';
import { G, getContract, type CmCtx } from '../src/game/cmMem';
import { setToDesiredContract_85fc50 } from '../src/game/cmContractWant';
import { genCtx } from '../src/game/cmGen/impls';
import { getClubFinance_5a0590 } from '../src/game/cmWage';
import { cmMemCall } from '../src/game/cmWageGame';
import { slCall, slmOf } from '../src/game/cmShortlist';

const dir = process.argv[2] ?? `${homedir()}/cm0102-engine/work-r3/snap-start`;
const m = loadSnap(`${dir}/pre-194-2001.bin`);
const log = loadLog(`${dir}/log-194-2001.txt`);
const miss = new Map<number, number>();
let rnd: number[] = [];
const base: CmCtx = {
  m,
  rand: (n) => { const v = rnd.shift(); if (v === undefined) throw new Error(`rand(${n})`); return v; },
  call: (adr, ...a) => {
    switch (adr) {
      case 0x5a0590: return getClubFinance_5a0590(base, a[0]);
      case 0x8cf470: return 0;
      case 0x846920: case 0x849f00: case 0x844780: return slCall(c, adr, slmOf(m), ...a);
      case 0x8cca10: return slCall(c, adr, m.u32(0xde1f54), ...a);
    }
    try { return cmMemCall(base, adr, ...a); } catch { miss.set(adr, (miss.get(adr) ?? 0) + 1); return 0; }
  },
};
const c = genCtx(base);
const L = 0x00310000;
// FIXTURE=1: de bytes, del (1) læser (før de skrives), og kaldene → tests/fixtures/cm-want-194-2001.json.gz (tests/cmContractGame.test.ts)
const read = new Set<number>(), wrote = new Set<number>(), cases: number[][] = [];
if (process.env.FIXTURE) {
  const u8 = m.u8.bind(m), w8 = m.w8.bind(m);
  m.u8 = (a: number) => { a >>>= 0; if (!wrote.has(a)) read.add(a); return u8(a); };
  m.w8 = (a: number, v: number) => { a >>>= 0; wrote.add(a); w8(a, v); };
}
// (1) loggens kald: rand(0x1c) – loggens R-linje lige efter E 85fc50
let n = 0, eq = 0;
for (let i = 0; i < log.seq.length; i++) {
  const s = log.seq[i];
  if (s.k !== 'E' || log.calls[s.i].adr !== 0x85fc50) continue;
  const e = log.calls[s.i];
  let ret: number | undefined; rnd = [];
  for (let j = i + 1; j < log.seq.length; j++) {
    const t = log.seq[j];
    if (t.k === 'R') rnd.push(log.rands[t.i].r);
    if (t.k === 'C' && log.calls[t.i].adr === 0x85fc50) { ret = log.calls[t.i].eax; break; }
  }
  const rnd0 = rnd.slice();
  // kontrakten L ligger på oraklets stak – her et skrabeområde
  for (let k = 0; k < 0x50; k++) m.w8(L + k, 0);
  const v = setToDesiredContract_85fc50(c, L, e.args[0], e.args[1], e.args[2] | 0, e.args[3] & 0xff, e.args[4] & 0xff, e.args[5] | 0, e.args[6]);
  n++;
  cases.push([...e.args.slice(0, 7), ret ?? -1, m.s32(L + 0xc), m.u16(L + 0x2f), ...rnd0]);
  if ((v >>> 0) === ret) eq++;
  else console.log(`  staff ${e.args[0].toString(16)}: ${v} mod ${ret} (løn ${m.s32(L + 0xc)})`);
}
console.log(`0x85fc50 på dag 194: ${eq}/${n} ens returværdier; ikke porterede kald: ${[...miss].map(([a, k]) => `0x${a.toString(16)}×${k}`).join(' ') || 'ingen'}`);

if (process.env.FIXTURE) {
  const as = [...read].sort((a, b) => a - b), runs: [number, string][] = [];
  for (let i = 0; i < as.length;) {
    let j = i; while (j + 1 < as.length && as[j + 1] - as[j] <= 8) j++;
    let h = ''; for (let a = as[i]; a <= as[j]; a++) h += m.u8(a).toString(16).padStart(2, '0');
    runs.push([as[i], h]); i = j + 1;
  }
  const out = 'tests/fixtures/cm-want-194-2001.json.gz';
  writeFileSync(out, gzipSync(JSON.stringify({ snap: 'pre-194-2001.bin', runs, cases })));
  console.log(`${out}: ${cases.length} kald, ${runs.length} stykker, ${as.length} bytes`);
  process.exit(0);
}
// (2) alle spillere i engelske klubber
if (process.env.OUT) {
  const eng = m.s32(0x9cf2e4), out: Record<string, number[]> = {};
  const nStaff = m.s32(G.STAFF_COUNT);
  let k = 0;
  miss.clear();
  // FIELDS=1: hvilke felter læses (pr. posttype og offset) – grundlaget for postbyggeren i cmContractGame.ts
  const hits = new Map<string, Set<number>>(), glob = new Map<number, number>();
  if (process.env.FIELDS) {
    const staff0 = m.u32(G.STAFF), clubs0 = m.u32(G.CLUBS), nClubs = m.s32(0xae235c), rows0 = m.u32(G.ROWS), cm0 = m.u32(m.u32(G.CM)), fin0 = m.u32(m.u32(0xae2a38));
    const regions: [string, number, number, number][] = [['staff', staff0, 0x6e, nStaff], ['club', clubs0, 0x245, nClubs], ['row', rows0, 79, nStaff], ['contract', cm0, 80, 40000], ['finance', fin0, 0x167, nClubs]];
    const ptr = new Map<number, string>();
    for (let i = 0; i < nStaff; i++) { const st = staff0 + 0x6e * i; for (const [o, kk] of [[0x61, 'player'], [0x69, 'nonplayer'], [0x65, 'prefs'], [0x1a, 'nation']] as const) { const q = m.u32(st + o); if (q) ptr.set(q, kk); } }
    for (let i = 0; i < nClubs; i++) { const cc = clubs0 + 0x245 * i; for (const [o, kk] of [[0x53, 'nation'], [0x57, 'division'], [0x5b, 'division'], [0x65, 'clubprefs']] as const) { const q = m.u32(cc + o); if (q) ptr.set(q, kk); } }
    const sz: Record<string, number> = { player: 0x46, nonplayer: 0x40, prefs: 0x40, nation: 0x100, division: 0x100, clubprefs: 0x40 };
    const ps = [...ptr.keys()].sort((a, b) => a - b);
    const u8 = m.u8.bind(m);
    m.u8 = (a: number) => {
      a >>>= 0;
      if (a < 0x400000) return u8(a);
      let done = false;
      for (const [kk, b, z, nn] of regions) if (a >= b && a < b + z * nn) { (hits.get(kk) ?? hits.set(kk, new Set()).get(kk)!).add((a - b) % z); done = true; break; }
      if (!done) {
        let lo = 0, hi = ps.length - 1, best = -1;
        while (lo <= hi) { const mid = (lo + hi) >> 1; if (ps[mid] <= a) { best = mid; lo = mid + 1; } else hi = mid - 1; }
        if (best >= 0 && a - ps[best] < sz[ptr.get(ps[best])!]) { const kk = ptr.get(ps[best])!; (hits.get(kk) ?? hits.set(kk, new Set()).get(kk)!).add(a - ps[best]); }
        else glob.set(a, (glob.get(a) ?? 0) + 1);
      }
      return u8(a);
    };
  }
  for (let id = 0; id < nStaff; id++) {
    const st = (m.u32(G.STAFF) + 0x6e * id) >>> 0;
    if (m.u8(st + 0x3d) !== 0xb || !m.u32(st + 0x61)) continue;
    const club = m.u32(st + 0x39);
    if (!club || !m.u32(club + 0x53) || m.s32(m.u32(club + 0x53)) !== eng || !getContract(m, st)) continue;
    let nm = ''; for (let i = 4; i < 54; i++) { const ch = m.u8(club + i); if (!ch) break; nm += String.fromCharCode(ch); }
    for (let q = 0; q < 0x50; q++) m.w8(L + q, 0);
    rnd = [14];
    const v = setToDesiredContract_85fc50(c, L, st, club, -1, 0xff, 0xb, 0, 0);
    const key = `${nm}|${m.s16(st + 0x10)}|${m.u16(st + 0x12)}|${m.s16(m.u32(st + 0x61) + 5)}`;
    out[key] = [v, m.s32(L + 8), m.s32(L + 0xc), m.s32(L + 0x10), m.s32(L + 0x14), m.s32(L + 0x18), m.u16(L + 0x2f), m.u8(L + 0x1c), m.u8(L + 0x1d), m.u8(L + 0x1e), m.u8(L + 0x1f), m.u8(L + 0x20), m.s32(L + 0x21), m.s32(getContract(m, st) + 0xc)];
    k++;
  }
  writeFileSync(process.env.OUT, JSON.stringify(out));
  for (const [kk, set] of [...hits].sort()) console.log(`${kk}: ${[...set].sort((a, b) => a - b).map((x) => x.toString(16)).join(' ')}`);
  if (glob.size) {
    // globalerne som sammenhængende stykker
    const as = [...glob.keys()].sort((a, b) => a - b), runs: string[] = [];
    for (let i = 0; i < as.length;) { let j = i; while (j + 1 < as.length && as[j + 1] - as[j] <= 4) j++; runs.push(`${as[i].toString(16)}+${as[j] - as[i] + 1}`); i = j + 1; }
    console.log(`andre: ${runs.join(' ')}`);
  }
  console.log(`${process.env.OUT}: ${k} spillere; ikke porterede kald: ${[...miss].map(([a, x]) => `0x${a.toString(16)}×${x}`).join(' ') || 'ingen'}`);
}
