// Testfixturen til tests/cmValueGame.test.ts: værdiformlen 0x4d0c60 (cmValue.ts) køres på ORACLETS hukommelse ved spilstarten (pre-194-2001.bin,
// frø 1, England/Arsenal) for udvalgte spillere, og kun de bytes, den læser, gemmes – sammen med originalens +0x52 (hvad spillet viser).
//   npx tsx scripts/cm-value-fixture.ts [ud=tests/fixtures/cm-value-oracle.json]
import { writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { loadSnap } from './ct-snap';
import { type CmCtx, type CmMem, G, getContract, clubAt } from '../src/game/cmMem';
import { cmMemCall, humanClub_600a50 } from '../src/game/cmWageGame';
import { playerValue_4d0c60 } from '../src/game/cmValue';

const out = process.argv[2] ?? 'tests/fixtures/cm-value-oracle.json';
const MS = loadSnap(`${homedir()}/cm0102-engine/work-r3/snap-start/pre-194-2001.bin`);
const WANT = ['Stuart Edwards|1983', 'David Beckham|1975', 'Cherno Samba|1985', 'Robert Pires|1973', 'Carlos Edwards|1978', 'Rui Borges|1974', 'Sid Ahmed Bouziane|1984', 'Lee Dixon|1964'];
const str = (a: number, n = 52) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = MS.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s; };

let reads = new Map<number, number>();
const rec = (a: number, n: number) => { a >>>= 0; for (let i = 0; i < n; i++) if (!reads.has(a + i)) reads.set(a + i, MS.u8(a + i)); };
const R: CmMem = {
  u8: (a) => { rec(a, 1); return MS.u8(a); }, s8: (a) => { rec(a, 1); return MS.s8(a); },
  u16: (a) => { rec(a, 2); return MS.u16(a); }, s16: (a) => { rec(a, 2); return MS.s16(a); },
  u32: (a) => { rec(a, 4); return MS.u32(a); }, s32: (a) => { rec(a, 4); return MS.s32(a); },
  f32: (a) => { rec(a, 4); return MS.f32(a); }, f64: (a) => { rec(a, 8); return MS.f64(a); },
  w8: (a) => { throw new Error(`skriver ${a.toString(16)}`); }, w16: (a) => { throw new Error(`skriver ${a.toString(16)}`); },
  // [0xae1080] (den sidst slåede kontrakt) skrives af 0x4d0c60 og læses ikke
  w32: (a, v) => { if ((a >>> 0) !== 0xae1080) throw new Error(`skriver ${a.toString(16)}`); void v; }, wf32: () => { throw new Error('skriver'); }, wf64: () => { throw new Error('skriver'); },
};
const c: CmCtx = { m: R, rand: () => { throw new Error('rand'); }, call: (adr, ...a) => cmMemCall(c, adr, ...a) };

const S = MS.u32(G.STAFF), n = MS.s32(G.STAFF_COUNT);
const cases: { name: string; st: number; club: number; human: number; v52: number; bytes: string }[] = [];
for (let id = 0; id < n; id++) {
  const st = S + 0x6e * id;
  if (!MS.u32(st + 0x61)) continue;
  const name = `${str(MS.u32(st + 0xc)) || `${str(MS.u32(st + 4))} ${str(MS.u32(st + 8))}`}|${MS.u16(st + 0x12)}`;
  if (!WANT.includes(name)) continue;
  const k = getContract(MS, st), club = k ? clubAt(MS, MS.s32(k + 4)) : 0;
  reads = new Map();
  const human = humanClub_600a50(c, club) ? 1 : 0;
  const v = playerValue_4d0c60(c, st, club, 0, -1, human) | 0;
  const v52 = MS.s32(st + 0x52);
  if (v !== v52) { console.log(`${name}: 0x4d0c60 ${v} ≠ +0x52 ${v52} – springes over`); continue; }
  // de læste bytes som "adresse:hex" i sammenhængende stykker
  const as = [...reads.keys()].sort((x, y) => x - y);
  const runs: string[] = [];
  for (let i = 0; i < as.length;) { let j = i; let h = ''; while (j < as.length && as[j] === as[i] + (j - i)) { h += reads.get(as[j])!.toString(16).padStart(2, '0'); j++; } runs.push(`${as[i].toString(16)}:${h}`); i = j; }
  cases.push({ name: name.split('|')[0], st, club, human, v52, bytes: runs.join(' ') });
  console.log(`${name}: £${v52}, ${as.length} bytes`);
}
writeFileSync(out, JSON.stringify(cases, null, 1) + '\n');
console.log(`${cases.length} spillere -> ${out}`);
