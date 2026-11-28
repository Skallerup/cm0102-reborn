// K7: make_club_bids 0x84a020 for alle engelske klubber (undtagen Arsenal) på dato D i spillet – spillets side af $S/k7j/o84.py (originalens
// 0x84a020 i unicorn på oraklets dagsbillede): blokkene 0x84a19f/0x84a697/0x84a6c2/0x84a713/0x84a71b/0x84a9d4/0x84aa05/0x84ab99 pr. købergruppe,
// build_bid 0x8e5d60 OK/FAIL (de sidste blokke), bud (0x84a728 → 0x8be300). Tvinger 0x5cccd0's betingelse for alle klubber (som o84.py).
//   WORLD=<world-dbs2.json> D=2001-09-08 OUT=<u.json> npx tsx scripts/k7-mcb-ours.ts
import { readFileSync, writeFileSync } from 'node:fs';
import type { WorldData } from '../src/game/newgame';
import { loadOrCreate } from './lib/snapshot';
import { buildSlMem, makeBids } from '../src/game/cmShortlistGame';
import { TRACE } from '../src/game/cmGen/x86';

const WF = process.env.WORLD!, w = JSON.parse(readFileSync(WF, 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
const D = process.env.D ?? '2001-09-08';
const TIER: Record<string, string> = { 'English Premier Division': 'P', 'English First Division': '1', 'English Second Division': '2', 'English Third Division': '3' };
const g = loadOrCreate({ world: w, worldFile: WF, club: 'Arsenal', date: D, seed: 1, mode: 'authentic', managerName: 'Test Smoke' });
const grp = (cid: number) => { const c = g.clubs[cid]; if (!c || c.nation !== eng) return 'X'; return TIER[g.comps[c.league]?.name ?? g.leagues[c.league]?.name ?? ''] ?? 'NL'; };
console.log('dato', g.date.slice(0, 10));
const S = buildSlMem(g);
const WATCH = new Set([0x84a19f, 0x84a697, 0x84a6c2, 0x84a713, 0x84a71b, 0x84a9d4, 0x84aa05, 0x84ab99]);
const blk: Record<string, Record<string, number>> = {}, fails: Record<string, Record<string, number>> = {};
const calls: unknown[] = [];
// pladsernes udgang: den sidste blok i 0x84a020 (0x84a020–0x84abab) før 0x84ab99, efter målet 0x84a19f
const exits: Record<string, Record<string, number>> = {};
let lastIn = 0, inSlot = false;
let G = '', inB = false, path: number[] = [], st = 0, buyer = '', last = 0;
const inc = (o: Record<string, number>, k: string) => { o[k] = (o[k] ?? 0) + 1; };
TRACE.on = true;
TRACE.f = (pc, R) => {
  if (!G || pc === last) return;
  last = pc;
  if (pc === 0x8e5d60 && !inB) { inB = true; path = []; st = R.m.u32((R.esp + 4) >>> 0); return; }
  if (inB && pc >= 0x8e5d60 && pc < 0x8e77d8) { if (pc !== 0x8e7761 && pc !== 0x8e77bd && pc !== 0x8e77bf) path.push(pc); return; }
  if (pc >= 0x84a020 && pc <= 0x84abab) {
    if (pc === 0x84a19f) inSlot = true;
    else if (pc === 0x84ab99) { if (inSlot) inc(exits[G] ??= {}, lastIn.toString(16)); inSlot = false; }
    lastIn = pc;
  }
  if (WATCH.has(pc)) inc(blk[G] ??= {}, pc.toString(16));
  if (pc === 0x84a71b) inc(blk[G], 'bids');
  if (inB && (pc === 0x84a71b || pc === 0x84a9d4)) {
    const ok = pc === 0x84a71b;
    if (!ok) inc(fails[G] ??= {}, path.slice(-4).map((x) => x.toString(16)).join('>'));
    calls.push({ buyer, g: G, st, ok });
    inB = false;
  }
};
const cids = Object.values(g.clubs).filter((c) => c.nation === eng && c.name !== 'Arsenal' && grp(c.id) !== 'X').map((c) => c.id).sort((a, b) => a - b);
for (const cid of cids) {
  G = grp(cid); buyer = g.clubs[cid].name; inB = false; last = 0; inSlot = false;
  makeBids(S, cid, (7 - (cid % 7)) % 7);
  G = '';
}
TRACE.on = false;
for (const k of ['P', '1', '2', '3', 'NL']) { console.log(k, JSON.stringify(blk[k] ?? {})); console.log('   FAIL', JSON.stringify(fails[k] ?? {})); console.log('   EXIT', JSON.stringify(Object.entries(exits[k] ?? {}).sort((a, b) => b[1] - a[1]))); }
if (process.env.OUT) writeFileSync(process.env.OUT, JSON.stringify({ blk, fails, calls, exits }));
