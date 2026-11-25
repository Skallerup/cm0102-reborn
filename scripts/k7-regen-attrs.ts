// K7: regenernes egenskaber i hukommelsen – spillerpostens bytes +0x16..+0x45 (som ønskelisterne/0x6e86d0 læser dem) og staff +0x57..+0x5b
// for de unge (< 21) i hukommelsen, oraklet (y23-e14) mod spillet på samme dato (spillet til D−1). Gruppe: klubløse / med klub, CA 20–80.
//   ONLY_ORACLE=1 DATE=2002-09-08 npx tsx scripts/k7-regen-attrs.ts        WORLD=<world-dbs2.json> DATE=… npx tsx scripts/k7-regen-attrs.ts
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { loadDaySnap, readDaySnapIndex } from './oracle-days';
import { getContract, type SparseMem } from '../src/game/cmMem';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { cmInMemory } from '../src/game/cmRetire';
import { recOf } from '../src/game/cmTraining';
import { ATTRS } from '../src/game/attributes';

const DATE = process.env.DATE ?? '2002-09-08';
const ix = readDaySnapIndex(`${homedir()}/cm0102-engine/oracle/daysnap/s1-3.9.60-y23-e14`)!;
type Row = { free: boolean; ca: number; b: number[] };
const s8 = (v: number) => (v << 24) >> 24;
function oracle(m: SparseMem): Row[] {
  const S = m.u32(0xae23bc), n = m.s32(0xae2364), out: Row[] = [];
  for (let id = 0; id < n; id++) {
    const st = S + 0x6e * id, pr = m.u32(st + 0x61);
    if (!pr || m.u8(st + 0x3d) === 16 || m.u8(st + 0x18) >= 21) continue;
    const b: number[] = [];
    for (let o = 0x16; o < 0x46; o++) b.push(s8(m.u8(pr + o)));
    for (let o = 0x57; o <= 0x5b; o++) b.push(m.u8(st + o));
    out.push({ free: !getContract(m, st), ca: m.s16(pr + 5), b });
  }
  return out;
}
function ours(): Row[] {
  const g = gs(), out: Row[] = [];
  for (const p of Object.values(g.players)) {
    if (p.virtual || !cmInMemory(g, p)) continue;
    const age = (Date.parse(g.date) - Date.parse(p.dob)) / (365.25 * 86400000);
    if (age >= 21) continue;
    const r = recOf(p).b, b: number[] = [];
    for (let o = 0x16; o < 0x46; o++) b.push(s8(r[o] | 0));
    for (const k of ['ambition', 'determination', 'loyalty', 'pressure', 'professionalism']) b.push(Math.round(p.attrs[ATTRS.indexOf(k as never)] ?? 0));
    out.push({ free: !p.club, ca: p.ca, b });
  }
  return out;
}
const rep = (name: string, rows: Row[]) => {
  for (const free of [true, false]) {
    const R = rows.filter((r) => r.free === free && r.ca >= 20 && r.ca <= 80);
    if (!R.length) continue;
    const mean = (i: number) => R.reduce((s, r) => s + (r.b[i] ?? 0), 0) / R.length;
    const ca = R.reduce((s, r) => s + r.ca, 0) / R.length;
    console.log(`${name} ${free ? 'klubløse' : 'med klub'} n=${R.length} CA∅ ${ca.toFixed(1)}`);
    const L: string[] = [];
    for (let i = 0; i < R[0].b.length; i++) L.push(`${(i < 0x30 ? 0x16 + i : 0x57 + i - 0x30).toString(16)}:${mean(i).toFixed(1)}`);
    console.log('  ' + L.join(' '));
  }
};
const snap = ix.snaps.find((s) => s.iso === DATE)!;
rep('oraklet', oracle(loadDaySnap(ix, snap)));
if (!process.env.ONLY_ORACLE) {
  const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
  const eng = w.nations.findIndex((x) => x.name === 'England');
  createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  gs().manager.holiday = {};
  const prev = new Date(Date.parse(DATE) - 86400000).toISOString().slice(0, 10);
  let g = gs(), guard = 0;
  while ((g.date < prev || !g.dayDone || g.pendingFixture) && guard++ < 5000) { const r = continueGame(); if (r?.match) quickPlayUserMatch(); g = gs(); }
  rep('vores', ours());
}
