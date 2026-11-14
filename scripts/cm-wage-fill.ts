// Spilstartens udfyldte lønninger (0x83a1b0 → 0x862720 → 0x5968d0; src/game/cmWageFill.ts) mod originalens øjebliksbillede ved spilstarten
// 14/7-2001 (~/cm0102-engine/work-r3/snap-start/pre-194-2001.bin, frø 1, 3.9.60): portene kører på originalens egen hukommelse for hver
// engelsk spiller, hvis databaseløn (staff +0x4e) 0x85e960 forkaster (0 eller > 15 · omdømmet), og lønnen +0xc sammenlignes.
//   npx tsx scripts/cm-wage-fill.ts [snap]            FIXTURE=1 skriver tests/fixtures/cm-wage-fill-194-2001.json.gz (hver 4. ens spiller,
//                                                      kun de bytes, portene læser)
import { writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { homedir } from 'node:os';
import { loadSnap } from './ct-snap';
import { G, getContract, SparseMem, type CmCtx } from '../src/game/cmMem';
import { cmMemCall } from '../src/game/cmWageGame';
import { fillUnsetWage_83a1b0 } from '../src/game/cmWageFill';

const snap = process.argv[2] ?? `${homedir()}/cm0102-engine/work-r3/snap-start/pre-194-2001.bin`;
const m = loadSnap(snap);
/** de læste bytes i det aktuelle kald (kun dem, kaldet ikke selv har skrevet først) */
const read = new Set<number>(), wrote = new Set<number>(), keepRead = new Set<number>();
class Rec extends SparseMem {
  constructor(private base: SparseMem) { super(); }
  override u8(a: number): number { a >>>= 0; if (!wrote.has(a)) read.add(a); return this.base.u8(a); }
  override w8(a: number, v: number): void { a >>>= 0; wrote.add(a); this.base.w8(a, v); }
}
const c: CmCtx = { m: new Rec(m), rand: () => { throw new Error('rand'); }, call: (adr, ...a) => cmMemCall(c, adr, ...a) };
const eng = m.s32(0x9cf2e4);
const nStaff = m.s32(G.STAFF_COUNT);
let n = 0, eq = 0, near = 0;
const bad: string[] = [], cases: [number, number][] = [];
for (let id = 0; id < nStaff; id++) {
  const st = (m.u32(G.STAFF) + 0x6e * id) >>> 0;
  if (m.u8(st + 0x3d) !== 0xb || !m.u32(st + 0x61)) continue;
  const club = m.u32(st + 0x39);
  if (!club || !m.u32(club + 0x53) || m.s32(m.u32(club + 0x53)) !== eng) continue;
  const k = getContract(m, st);
  if (!k) continue;
  const d = m.s32(st + 0x4e), rep = m.s16(m.u32(st + 0x61) + 0xb);
  if (d && d <= rep * 15) continue;
  const orig = m.s32(k + 0xc);
  read.clear(); wrote.clear();
  m.w32(k + 0xc, -1);
  const v = fillUnsetWage_83a1b0(c, st);
  m.w32(k + 0xc, orig);
  n++;
  if (v === orig) {
    eq++;
    if (process.env.FIXTURE && eq % 4 === 1) { cases.push([st, orig]); for (const a of read) keepRead.add(a); }
  } else if (v !== null && Math.abs(v - orig) <= Math.max(2, orig * 0.02)) near++;
  else if (bad.length < 25) bad.push(`${id}: ${v} mod ${orig} (status ${m.u8(k + 0x4f) >> 4}, db ${d}, omd ${rep})`);
}
console.log(`engelske spillere med udfyldt løn: ${n}, ens ${eq}, inden for 2 % ${near}`);
for (const b of bad) console.log('  ' + b);
if (process.env.FIXTURE) {
  // de læste bytes som sammenhængende stykker [adresse, hex]
  const as = [...keepRead].sort((a, b) => a - b), runs: [number, string][] = [];
  for (let i = 0; i < as.length;) {
    let j = i; while (j + 1 < as.length && as[j + 1] - as[j] <= 8) j++;
    let h = ''; for (let a = as[i]; a <= as[j]; a++) h += m.u8(a).toString(16).padStart(2, '0');
    runs.push([as[i], h]); i = j + 1;
  }
  const out = 'tests/fixtures/cm-wage-fill-194-2001.json.gz';
  writeFileSync(out, gzipSync(JSON.stringify({ snap: 'pre-194-2001.bin', runs, cases })));
  console.log(`${out}: ${cases.length} spillere, ${runs.length} stykker, ${as.length} bytes`);
}
