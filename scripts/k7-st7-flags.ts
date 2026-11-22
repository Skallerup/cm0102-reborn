// K7b-rest (b): kontraktbytes for de engelske klubbers spillere pr. trupstatus (+0x4f>>4) – +0x45 (dword: klagerne), +0x4e (bit 1 listet),
// +0x49 (sat fri), type (+0x35) – oraklet (DIR/dato) eller vores spil (WORLD + dato, snapshots som k7-expiry-s3.ts).
//   DIR=~/cm0102-engine/oracle/daysnap/s1-3.9.60-y23-e14 npx tsx scripts/k7-st7-flags.ts o 2003-06-29
//   WORLD=<world-dbs2.json> node scripts/measure.mjs -- npx tsx scripts/k7-st7-flags.ts u 2003-06-28
import { readFileSync } from 'node:fs';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import type { WorldData } from '../src/game/newgame';
import { loadOrCreate } from './lib/snapshot';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { applyAction } from '../src/game/actions';
import { cmCmScope } from '../src/game/cmContractManager';
import type { GameState } from '../src/game/types';

const side = process.argv[2], date = process.argv[3];
interface R { st: number; type: number; b45: number; b4e: number; b49: number; exp: string; loy: number }
const rows: R[] = [];
const dayIso = (d: number, y: number) => (y > 1850 && y < 2100 ? new Date(Date.UTC(y, 0, 1 + d)).toISOString().slice(0, 10) : '');
const str = (m: { u8(a: number): number }, a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
if (side === 'o') {
  const ix = readDaySnapIndex(process.env.DIR ?? DEFAULT_DAYSNAP)!;
  const m = loadDaySnap(ix, ix.snaps.find((e) => e.iso === date)!);
  const S = m.u32(0xae23bc), n = m.s32(0xae2364), C = m.u32(0xae23b4), nc = m.s32(0xae235c), K = m.u32(m.u32(0xae1050));
  const cEng = (ix: number) => ix >= 0 && ix < nc && str(m, m.u32(C + 0x245 * ix + 0x53) + 4, 51) === 'England';
  for (let id = 0; id < n; id++) {
    const st = S + 0x6e * id;
    if (!m.u32(st + 0x61) || m.u8(st + 0x3d) === 16) continue;
    const cadr = m.u32(st + 0x39), cix = cadr ? (cadr - C) / 0x245 : -1;
    const row = m.u32(0xae2d0c) + 79 * id, ki = m.s32(row);
    if (!cEng(cix) || ki < 0 || m.s32(row + 4) >= 0) continue;
    const k = K + 80 * ki;
    rows.push({ st: m.u8(k + 0x4f) >> 4, type: m.u8(k + 0x35) & 0x3f, b45: m.u32(k + 0x45), b4e: m.u8(k + 0x4e), b49: m.u8(k + 0x49), exp: dayIso(m.s16(k + 0x2d), m.u16(k + 0x2f)), loy: m.s8 ? m.s8(st + 0x59) : m.u8(st + 0x59) });
  }
} else {
  const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
  const advance = (g: GameState, until: string) => {
    let guard = 0;
    while ((g.date < until || !g.dayDone || g.pendingFixture) && guard++ < 100000) {
      if (!g.userClub) { const offer = g.jobOffers.find((id) => g.clubs[id]?.manager === 0); if (offer) applyAction({ t: 'acceptJob', club: offer }); else for (const id of g.vacancies.slice(0, 3)) applyAction({ t: 'applyJob', club: id }); }
      const r = continueGame(); if (r?.match) quickPlayUserMatch();
    }
  };
  const g = loadOrCreate({ world: w, worldFile: process.env.WORLD, club: 'Arsenal', seed: 1, mode: 'authentic', managerName: 'Test Smoke', advanceTag: 'k7', advance, date });
  const eng = g.nations.findIndex((x) => x.name === 'England');
  let out = 0;
  for (const p of Object.values(g.players)) {
    if (p.virtual || p.loan || !p.contract || g.clubs[p.club]?.nation !== eng) continue;
    if (!cmCmScope(g, p)) out++;
    const c = p.cmContract;
    rows.push({ st: (c?.b4f ?? 0) >> 4, type: p.contract.cmType ?? 2, b45: c?.b45 ?? 0, b4e: c?.b4e ?? 0, b49: p.contract.cmB49 ?? 0, exp: p.contract.expires.slice(0, 10), loy: 0 });
  }
  console.log(`uden for CONTRACT_MANAGER-porten: ${out}`);
}
const by = new Map<string, { n: number; f45: number; f45lo: number; f45hi: number; l1: number; b49: number; exp: number }>();
for (const r of rows) {
  const key = `st ${r.st} type ${r.type}`;
  const x = by.get(key) ?? { n: 0, f45: 0, f45lo: 0, f45hi: 0, l1: 0, b49: 0, exp: 0 };
  x.n++; if (r.b45) x.f45++; if (r.b45 & 0xff) x.f45lo++; if (r.b45 & ~0xff) x.f45hi++; if (r.b4e & 1) x.l1++; if (r.b49) x.b49++; if (r.exp <= date) x.exp++;
  by.set(key, x);
}
console.log(`${side} ${date}: ${rows.length} spillere i engelske klubber (ikke lejet)`);
for (const [k, x] of [...by].sort()) console.log(`${k}: ${x.n} | +0x45≠0 ${x.f45} (lav byte ${x.f45lo}, høje bytes ${x.f45hi}) | +0x4e&1 ${x.l1} | +0x49 ${x.b49} | udløbet ${x.exp}`);
// bitfordelingen af +0x45 for trupstatus 7 (type 1 og 2)
for (const t of [1, 2]) {
  const bits = new Map<number, number>();
  for (const r of rows) if (r.st === 7 && r.type === t) for (let b = 0; b < 32; b++) if (r.b45 & (1 << b)) bits.set(1 << b, (bits.get(1 << b) ?? 0) + 1);
  console.log(`st 7 type ${t} +0x45-bits: ${[...bits].sort((a, b) => a[0] - b[0]).map(([k, v]) => `0x${(k >>> 0).toString(16)}:${v}`).join(' ')}`);
}
