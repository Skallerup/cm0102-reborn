// Kontraktklagerne +0x45 og tilfredsheden +0x44 uge for uge – oraklet (dagsbillederne) mod vores spil (frø 1, Arsenal, world med CM_DBSIZE=2).
// Pr. dato for de engelske klubbers spillere med kontrakt (ikke lejet): +0x44-snit, andelen med klager, nøglespillerne (trupstatus 1–3) med
// klager og pr. bit (ST=1: trupstatusfordelingen st:antal/+0x44-snit), og klubtabellen [0xae2d14]+6·klub+5 (klubber med utilfredse nøglespillere – blokerer 0x5cf8c8's +5).
//   npx tsx scripts/k7-grievances.ts o                       (oraklet, DIR=<daysnap> – standard s1-3.9.60-e1)
//   WORLD=<world-dbs2.json> node scripts/measure.mjs -- npx tsx scripts/k7-grievances.ts u [slutdato=2002-06-30]
import { readFileSync } from 'node:fs';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import type { WorldData } from '../src/game/newgame';
import type { GameState } from '../src/game/types';

interface Row { st: number; b44: number; b45: number }
interface Sample { iso: string; rows: Row[]; clubs: number; blocked: number }
const BITS = [0x1, 0x2, 0x4, 0x8, 0x10, 0x20, 0x40, 0x100, 0x200, 0x800, 0x1000, 0x2000, 0x10000, 0x100000, 0x10000000];
const side = process.argv[2] ?? 'o';
const str = (m: { u8(a: number): number }, a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const ix = readDaySnapIndex(process.env.DIR ?? DEFAULT_DAYSNAP)!;
const dates = ix.snaps.map((e) => e.iso).filter((d, i, a) => a.indexOf(d) === i).sort();
const samples: Sample[] = [];

function report(s: Sample) {
  const all = s.rows, key = all.filter((r) => r.st >= 1 && r.st <= 3);
  const m44 = all.reduce((a, r) => a + r.b44, 0) / Math.max(1, all.length);
  const share = all.filter((r) => r.b45).length / Math.max(1, all.length);
  const kc = key.filter((r) => r.b45).length;
  const bits = BITS.map((b) => [b, key.filter((r) => (r.b45 & b) >>> 0).length] as const).filter(([, n]) => n).map(([b, n]) => `${b.toString(16)}:${n}`).join(' ');
  const other = key.filter((r) => BITS.reduce((x, b) => (x & ~b) >>> 0, r.b45 >>> 0)).length;
  console.log(`${s.iso} | spillere ${all.length} +0x44 ${m44.toFixed(1)} klageandel ${share.toFixed(3)} | nøgle ${key.length} med klager ${kc} [${bits}${other ? ` øvrige:${other}` : ''}] | klubber ${s.clubs} blokeret ${s.blocked}${process.env.ST ? ` | trupstatus ${[0, 1, 2, 3, 4, 5, 6, 7].map((t) => { const x = all.filter((r) => r.st === t); return `${t}:${x.length}/${(x.reduce((a, r) => a + r.b44, 0) / Math.max(1, x.length)).toFixed(0)}`; }).join(' ')}` : ''}`);
}

if (side === 'o') {
  for (const iso of dates) {
    const e = ix.snaps.find((x) => x.iso === iso)!;
    const m = loadDaySnap(ix, e);
    const S = m.u32(0xae23bc), n = m.s32(0xae2364), C = m.u32(0xae23b4), nc = m.s32(0xae235c), K = m.u32(m.u32(0xae1050)), T = m.u32(0xae2d14);
    const eng = new Set<number>();
    for (let i = 0; i < nc; i++) if (str(m, m.u32(C + 0x245 * i + 0x53) + 4, 51) === 'England') eng.add(i);
    const rows: Row[] = [];
    for (let id = 0; id < n; id++) {
      const st = S + 0x6e * id;
      if (!m.u32(st + 0x61)) continue;
      const cadr = m.u32(st + 0x39), cix = cadr ? (cadr - C) / 0x245 : -1;
      const row = m.u32(0xae2d0c) + 79 * id, ki = m.s32(row);
      if (!eng.has(cix) || ki < 0 || m.s32(row + 4) >= 0) continue;
      const k = K + 80 * ki;
      rows.push({ st: m.u8(k + 0x4f) >> 4, b44: m.s8(k + 0x44), b45: m.u32(k + 0x45) });
    }
    let blocked = 0;
    for (const i of eng) if (m.u8(T + 6 * i + 5)) blocked++;
    samples.push({ iso, rows, clubs: eng.size, blocked });
    report(samples[samples.length - 1]);
  }
} else {
  const { createGame } = await import('../src/game/newgame');
  const { continueGame, quickPlayUserMatch } = await import('../src/game/sim');
  const { gs } = await import('../src/game/state');
  const w = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world-original.json', 'utf8')) as WorldData;
  const eng = w.nations.findIndex((x) => x.name === 'England');
  const user = w.clubs.find((c) => c[1] === 'Arsenal')![0] as number;
  createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  const g: GameState = gs();
  const end = process.argv[3] ?? '2002-06-30';
  const todo = dates.filter((d) => d <= end);
  let guard = 0;
  while (todo.length && guard++ < 100000) {
    if (g.date >= todo[0] && g.dayDone && !g.pendingFixture) {
      const iso = todo.shift()!;
      const rows: Row[] = [];
      for (const p of Object.values(g.players)) {
        if (p.virtual || p.loan || !p.contract || !p.cmContract || g.clubs[p.club]?.nation !== eng) continue;
        const c = p.cmContract;
        rows.push({ st: (c.b4f ?? 0) >> 4, b44: (c.b44 << 24) >> 24, b45: c.b45 >>> 0 });
      }
      const clubs = Object.values(g.clubs).filter((c) => c.nation === eng);
      samples.push({ iso, rows, clubs: clubs.length, blocked: clubs.filter((c) => (g.cmClubUnhappy?.[c.id] ?? 0) > 0).length });
      report(samples[samples.length - 1]);
      continue;
    }
    const r = continueGame(); if (r?.match) quickPlayUserMatch();
  }
}
