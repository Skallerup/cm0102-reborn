// K7: rensningen af de klubløse dag 80 (find_new_retirements 0x7a5790 → 0x7a7310/0x7a8050) – hvem overlever? Oraklet 23/3 → 30/3-02 mod
// spillet dagen før og efter: klubløse efter alder, klubløs siden (+0x3e), omdømme (+0x61 → +0xb), på ønskelisternes par.
//   ONLY_ORACLE=1 npx tsx scripts/k7-unemp.ts      |      WORLD=<world-dbs2.json> npx tsx scripts/k7-unemp.ts
import { readFileSync } from 'node:fs';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import { getContract, type SparseMem } from '../src/game/cmMem';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { cmInMemory } from '../src/game/cmRetire';
import { playerRecordInto } from '../src/game/engine/grid/aiTeam';
const REC: number[] = new Array(0x46).fill(0);

const A = process.env.A ?? '2002-03-21', B = process.env.B ?? '2002-03-23';
const str = (m: SparseMem, a: number, n = 54) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const dayIso = (d: number, y: number) => (y > 1850 && y < 2100 ? new Date(Date.UTC(y, 0, 1 + d)).toISOString().slice(0, 10) : '');
const yrs = (date: string, dob: string) => (Date.parse(date) - Date.parse(dob)) / (365.25 * 86400000);
interface F { key: string; age: number; since: string; rep: number; listed: boolean; ca: number }
function oracle(m: SparseMem, iso: string): Map<string, F> {
  const S = m.u32(0xae23bc), n = m.s32(0xae2364);
  const slm = m.u32(m.u32(0xde1f54) + 0x856), pa = m.u32(slm), pn = m.s32(slm + 0x10);
  const lst = new Set<number>(); for (let i = 0; i < pn && i < 200000; i++) lst.add(m.s32(pa + 8 * i));
  const out = new Map<string, F>();
  for (let id = 0; id < n; id++) {
    const st = S + 0x6e * id, pr = m.u32(st + 0x61);
    if (!pr || m.u8(st + 0x3d) === 16 || m.u32(st + 0x39) || getContract(m, st)) continue;
    const common = str(m, m.u32(st + 0xc), 60), f = str(m, m.u32(st + 4), 60), l = str(m, m.u32(st + 8), 60);
    const dob = dayIso(m.s16(st + 0x10), m.u16(st + 0x12)) || `${m.s16(st + 0x18)}-07-01`;
    const key = `${common || f + ' ' + l}|${dob}`;
    out.set(key, { key, age: yrs(iso, dob), since: dayIso(m.s16(st + 0x3e), m.u16(st + 0x40)), rep: m.s16(pr + 0xb), listed: lst.has(m.s32(st)), ca: m.s16(pr + 5) });
  }
  return out;
}
function ours(): Map<string, F> {
  const g = gs();
  const lst = new Set((g.cmSlPairs ?? []).map(([p]) => p));
  const out = new Map<string, F>();
  for (const p of Object.values(g.players)) {
    if (p.virtual || p.club || !cmInMemory(g, p)) continue;
    const key = `${p.first} ${p.last}|${p.dob}`;
    const r = playerRecordInto(p, REC), rep = ((r[0xb] | (r[0xc] << 8)) << 16) >> 16;
    out.set(key, { key, age: yrs(g.date, p.dob), since: (p.cmFreeSince ?? p.joined ?? p.cmJoined ?? '').slice(0, 10), rep, listed: lst.has(p.id), ca: p.ca });
  }
  return out;
}
let a: Map<string, F>, b: Map<string, F>;
if (process.env.ONLY_ORACLE) {
  const ix = readDaySnapIndex(DEFAULT_DAYSNAP)!;
  a = oracle(loadDaySnap(ix, ix.snaps.find((e) => e.iso === A)!), A);
  b = oracle(loadDaySnap(ix, ix.snaps.find((e) => e.iso === B)!), B);
} else {
  const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
  const eng = w.nations.findIndex((x) => x.name === 'England');
  createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  const g = gs(); g.manager.holiday = {};
  const go = (iso: string) => { let n = 0; while ((gs().date < iso || !gs().dayDone || gs().pendingFixture) && n++ < 20000) { const r = continueGame(); if (r?.match) quickPlayUserMatch(); } };
  go(A); a = ours(); go(B); b = ours();
  if (process.env.DUMP) { const p = Object.values(gs().players).find((x) => !x.club && !x.virtual); console.log(JSON.stringify(p).slice(0, 1500)); }
}
const band = (x: F) => (x.age < 21 ? '<21' : x.age < 30 ? '21-29' : '30+');
const rows = new Map<string, number[]>();
for (const x of a.values()) {
  const k = `${band(x)} ${x.listed ? 'på par' : 'ikke på par'} ${x.since <= `${Number(A.slice(0, 4)) - 1}${A.slice(4)}` ? '>1 år' : '<1 år'}`;
  const r = rows.get(k) ?? [0, 0, 0]; r[0]++; if (b.has(x.key)) r[1]++; r[2] += x.rep; rows.set(k, r);
}
console.log(`klubløse ${A}: ${a.size}, tilbage ${B}: ${[...a.keys()].filter((k) => b.has(k)).length}`);
for (const [k, r] of [...rows].sort()) console.log(`${k.padEnd(28)} ${String(r[0]).padStart(4)} → ${String(r[1]).padStart(4)}  omd gns ${(r[2] / r[0]).toFixed(0)}`);
// (SINCE=1) klubløs siden (+0x3e) pr. fødselsår for de unge
if (process.env.SINCE) {
  const t = new Map<string, number>();
  for (const x of a.values()) if (x.age < 21) { const k = `${x.key.split('|')[1].slice(0, 4)} siden ${x.since.slice(0, 7)} ${b.has(x.key) ? 'blev' : 'væk'}`; t.set(k, (t.get(k) ?? 0) + 1); }
  for (const [k, v] of [...t].sort()) console.log(k, v);
}
