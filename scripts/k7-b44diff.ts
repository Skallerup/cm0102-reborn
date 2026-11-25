// Kontrakttilfredsheden +0x44 dag for dag: hvilke ændringer (delta pr. spiller) sker hvor ofte – oraklet (dagsbillederne) mod vores spil
// (frø 1, Arsenal, world med CM_DBSIZE=2). Engelske klubbers spillere med kontrakt (ikke lejet), samme kontrakt begge dage.
// Pr. måned: sum af deltaer pr. spiller og de hyppigste deltaværdier (værdi:antal) – deltaværdien peger på stedet i koden.
//   npx tsx scripts/k7-b44diff.ts o                    (oraklet, DIR=<daysnap>)
//   WORLD=<world-dbs2.json> node scripts/measure.mjs -- npx tsx scripts/k7-b44diff.ts u [slutdato]
//   DOW=1: deltaerne pr. ugedag i stedet for pr. måned.
import { readFileSync } from 'node:fs';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import type { WorldData } from '../src/game/newgame';
import type { GameState } from '../src/game/types';

type Snap = Map<string, { v: number; st: number }>;
const side = process.argv[2] ?? 'o';
const str = (m: { u8(a: number): number }, a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const ix = readDaySnapIndex(process.env.DIR ?? DEFAULT_DAYSNAP)!;
const dates = ix.snaps.map((e) => e.iso).filter((d, i, a) => a.indexOf(d) === i).sort();
const byKey = new Map<string, { n: number; sum: number; hist: Map<number, number>; days: number }>();
let prev: Snap | null = null, prevIso = '';

function feed(iso: string, s: Snap) {
  if (prev) {
    const d0 = new Date(prevIso), d1 = new Date(iso);
    const gap = Math.round((+d1 - +d0) / 864e5);
    const k = process.env.DOW ? `${gap === 1 ? 'dow' : 'gap'}${d1.getUTCDay()}` : iso.slice(0, 7);
    let b = byKey.get(k); if (!b) byKey.set(k, b = { n: 0, sum: 0, hist: new Map(), days: 0 });
    b.days++;
    for (const [id, x] of s) {
      const y = prev.get(id); if (!y) continue;
      b.n++;
      const dv = x.v - y.v; if (!dv) continue;
      b.sum += dv; b.hist.set(dv, (b.hist.get(dv) ?? 0) + 1);
    }
  }
  prev = s; prevIso = iso;
}
function out() {
  for (const [k, b] of [...byKey].sort()) {
    const top = [...b.hist].sort((a, c) => c[1] - a[1]).slice(0, 14).map(([v, n]) => `${v}:${n}`).join(' ');
    const per = b.n / Math.max(1, b.days);
    console.log(`${k} dage ${b.days} spillere ${per.toFixed(0)} | sum/spiller ${(b.sum / per).toFixed(2)} | ${top}`);
  }
}

if (side === 'o') {
  for (const iso of dates) {
    const e = ix.snaps.find((x) => x.iso === iso)!;
    const m = loadDaySnap(ix, e);
    const S = m.u32(0xae23bc), n = m.s32(0xae2364), C = m.u32(0xae23b4), nc = m.s32(0xae235c), K = m.u32(m.u32(0xae1050));
    const eng = new Set<number>();
    for (let i = 0; i < nc; i++) if (str(m, m.u32(C + 0x245 * i + 0x53) + 4, 51) === 'England') eng.add(i);
    const s: Snap = new Map();
    for (let id = 0; id < n; id++) {
      const st = S + 0x6e * id;
      if (!m.u32(st + 0x61)) continue;
      const cadr = m.u32(st + 0x39), cix = cadr ? (cadr - C) / 0x245 : -1;
      const row = m.u32(0xae2d0c) + 79 * id, ki = m.s32(row);
      if (!eng.has(cix) || ki < 0 || m.s32(row + 4) >= 0) continue;
      const k = K + 80 * ki;
      s.set(`${id}:${ki}:${cix}`, { v: m.s8(k + 0x44), st: m.u8(k + 0x4f) >> 4 });
    }
    feed(iso, s);
  }
} else {
  const { createGame } = await import('../src/game/newgame');
  const { continueGame, quickPlayUserMatch } = await import('../src/game/sim');
  const { gs } = await import('../src/game/state');
  const w = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world-original.json', 'utf8')) as WorldData;
  const eng = w.nations.findIndex((x) => x.name === 'England');
  const user = w.clubs.find((c) => c[1] === 'Arsenal')![0] as number;
  createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: Number(process.env.SEED ?? 1), mode: 'authentic' });
  const g: GameState = gs();
  const end = process.argv[3] ?? '2002-06-30';
  const todo = dates.filter((d) => d <= end);
  let guard = 0;
  while (todo.length && guard++ < 100000) {
    if (g.date >= todo[0] && g.dayDone && !g.pendingFixture) {
      const iso = todo.shift()!;
      const s: Snap = new Map();
      for (const p of Object.values(g.players)) {
        if (p.virtual || p.loan || !p.contract || !p.cmContract || g.clubs[p.club]?.nation !== eng) continue;
        const c = p.cmContract;
        s.set(`${p.id}:${p.contract.expires}:${p.contract.wage}:${p.club}`, { v: (c.b44 << 24) >> 24, st: (c.b4f ?? 0) >> 4 });
      }
      feed(iso, s);
      continue;
    }
    const r = continueGame(); if (r?.match) quickPlayUserMatch();
  }
}
out();
