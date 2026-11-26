// K7: spillerens vilje 0x846920(staff, klub, 1, 0, gruppe, 0) – som 0x83f3a0 @0x840668 – for alle spillere i de engelske P/1-klubber mod
// køberen KLUB på dato D, og hvor 0x846920 forlader sig (den sidste blok før ret) for 0-svarene. Spillets side af $S/k7i/owill.py.
//   WORLD=<world-dbs2.json> D=2001-09-08 KLUB="Aston Villa" [GRP=4] OUT=<u.json> npx tsx scripts/k7-will-probe.ts
import { readFileSync, writeFileSync } from 'node:fs';
import type { WorldData } from '../src/game/newgame';
import { loadOrCreate } from './lib/snapshot';
import { buildSlMem } from '../src/game/cmShortlistGame';
import { slCall } from '../src/game/cmShortlist';
import { TRACE } from '../src/game/cmGen/x86';
import { G } from '../src/game/cmMem';

const WF = process.env.WORLD!, w = JSON.parse(readFileSync(WF, 'utf8')) as WorldData;
const D = process.env.D ?? '2001-09-08', KLUB = process.env.KLUB ?? 'Aston Villa', GRP = +(process.env.GRP ?? 4);
const g = loadOrCreate({ world: w, worldFile: WF, club: 'Arsenal', date: D, seed: 1, mode: 'authentic', managerName: 'Test Smoke' });
console.log('dato', g.date.slice(0, 10));
const S = buildSlMem(g), m = S.m;
const TIER = new Set(['English Premier Division', 'English First Division']);
const buyer = Object.values(g.clubs).find((c) => c.name === KLUB)!;
const club = S.clubAdr(buyer.id);
const str = (a: number, n = 54) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const rows: { name: string; club: string; v: number; exit: string }[] = [];
let last = 0, prev = 0;
TRACE.on = true;
TRACE.f = (pc) => { if (pc >= 0x846920 && pc < 0x849c50 && pc !== last) { prev = last; last = pc; } };
const STAFF = m.u32(G.STAFF), n = m.s32(G.STAFF_COUNT);
for (let id = 0; id < n; id++) {
  const st = (STAFF + 0x6e * id) >>> 0;
  if (!m.u32(st + 0x61) || m.u8(st + 0x3d) !== 0xb) continue;
  const sc = m.u32(st + 0x39); if (!sc || sc === club) continue;
  const gc = g.clubs[m.s32(sc)]; if (!gc || !TIER.has(g.comps[gc.league]?.name ?? g.leagues[gc.league]?.name ?? '')) continue;
  last = 0; prev = 0;
  const v = slCall(S.c, 0x846920, S.slm, st, club, 1, 0, GRP, 0);
  rows.push({ name: `${str(m.u32(st + 4) + 4)} ${str(m.u32(st + 8) + 4)}`.trim(), club: str(sc + 4), v, exit: `${prev.toString(16)}>${last.toString(16)}` });
}
TRACE.on = false;
const ex = new Map<string, number>();
for (const r of rows) if (r.v === 0) ex.set(r.exit, (ex.get(r.exit) ?? 0) + 1);
const vs = rows.map((r) => r.v).sort((a, b) => a - b), q = (p: number) => vs[Math.floor(p * (vs.length - 1))];
console.log(`${KLUB}: ${rows.length} spillere, 0: ${vs.filter((x) => x === 0).length}, ≥3,15: ${vs.filter((x) => x >= 3.15).length}, p50/p90 ${q(0.5)}/${q(0.9)}`);
console.log('0-udgange:', [...ex].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, v]) => `${k}:${v}`).join(' '));
if (process.env.OUT) writeFileSync(process.env.OUT, JSON.stringify(rows));
