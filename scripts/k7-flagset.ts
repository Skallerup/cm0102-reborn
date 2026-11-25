// Hvornår en kontraktklage (+0x45-bit, FLAG=0x10 som standard) sættes – oraklet (dagsbillederne) mod vores spil (frø 1, Arsenal, world med
// CM_DBSIZE=2). Engelske klubbers spillere med kontrakt. Pr. ny sætning: dato, navn, trupstatus, alder, +0x44 før/efter, +0x3e, +0x3d.
// Til sidst antal pr. måned og pr. trupstatus.
//   FLAG=0x10 npx tsx scripts/k7-flagset.ts o
//   FLAG=0x10 WORLD=<world-dbs2.json> node scripts/measure.mjs -- npx tsx scripts/k7-flagset.ts u [slutdato]
import { readFileSync } from 'node:fs';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import type { WorldData } from '../src/game/newgame';
import type { GameState } from '../src/game/types';

interface R { name: string; st: number; age: number; b44: number; b45: number; b3e: number; b3d: number }
const FLAG = Number(process.env.FLAG ?? 0x10);
const side = process.argv[2] ?? 'o';
const str = (m: { u8(a: number): number }, a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const ix = readDaySnapIndex(process.env.DIR ?? DEFAULT_DAYSNAP)!;
const dates = ix.snaps.map((e) => e.iso).filter((d, i, a) => a.indexOf(d) === i).sort();
let prev: Map<string, R> | null = null;
const perMonth = new Map<string, number>(), perSt = new Map<number, number>();
function feed(iso: string, s: Map<string, R>) {
  if (prev) for (const [k, x] of s) {
    const y = prev.get(k); if (!y || (y.b45 & FLAG) || !(x.b45 & FLAG)) continue;
    console.log(`${iso} ${x.name.padEnd(26)} st ${x.st} alder ${x.age} +0x44 ${y.b44}→${x.b44} +0x3e ${y.b3e}→${x.b3e} +0x3d ${x.b3d} klager ${y.b45.toString(16)}→${x.b45.toString(16)}`);
    perMonth.set(iso.slice(0, 7), (perMonth.get(iso.slice(0, 7)) ?? 0) + 1); perSt.set(x.st, (perSt.get(x.st) ?? 0) + 1);
  }
  prev = s;
}
if (side === 'o') {
  for (const iso of dates) {
    const e = ix.snaps.find((x) => x.iso === iso)!;
    const m = loadDaySnap(ix, e);
    const S = m.u32(0xae23bc), n = m.s32(0xae2364), C = m.u32(0xae23b4), nc = m.s32(0xae235c), K = m.u32(m.u32(0xae1050));
    const eng = new Set<number>();
    for (let i = 0; i < nc; i++) if (str(m, m.u32(C + 0x245 * i + 0x53) + 4, 51) === 'England') eng.add(i);
    const s = new Map<string, R>();
    for (let id = 0; id < n; id++) {
      const st = S + 0x6e * id;
      if (!m.u32(st + 0x61)) continue;
      const cadr = m.u32(st + 0x39), cix = cadr ? (cadr - C) / 0x245 : -1;
      const row = m.u32(0xae2d0c) + 79 * id, ki = m.s32(row);
      if (!eng.has(cix) || ki < 0 || m.s32(row + 4) >= 0) continue;
      const k = K + 80 * ki;
      const name = `${str(m, m.u32(st + 4))} ${str(m, m.u32(st + 8))}`;
      s.set(`${id}:${ki}`, { name, st: m.u8(k + 0x4f) >> 4, age: m.s8(st + 0x18) || (2001 - m.s16(st + 0x10)), b44: m.s8(k + 0x44), b45: m.u32(k + 0x45), b3e: m.s8(k + 0x3e), b3d: m.s8(k + 0x3d) });
    }
    feed(iso, s);
  }
} else {
  const { createGame } = await import('../src/game/newgame');
  const { continueGame, quickPlayUserMatch } = await import('../src/game/sim');
  const { gs } = await import('../src/game/state');
  const { ageOn } = await import('../src/game/dates');
  const w = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world-original.json', 'utf8')) as WorldData;
  const eng = w.nations.findIndex((x) => x.name === 'England');
  const user = w.clubs.find((c) => c[1] === 'Arsenal')![0] as number;
  createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: Number(process.env.SEED ?? 1), mode: 'authentic' });
  const g: GameState = gs();
  const todo = dates.filter((d) => d <= (process.argv[3] ?? '2002-06-30'));
  let guard = 0;
  while (todo.length && guard++ < 100000) {
    if (g.date >= todo[0] && g.dayDone && !g.pendingFixture) {
      const iso = todo.shift()!;
      const s = new Map<string, R>();
      for (const p of Object.values(g.players)) {
        if (p.virtual || p.loan || !p.contract || !p.cmContract || g.clubs[p.club]?.nation !== eng) continue;
        const c = p.cmContract;
        s.set(`${p.id}:${p.contract.expires}:${p.club}`, { name: `${p.first} ${p.last}`, st: (c.b4f ?? 0) >> 4, age: ageOn(p.dob, g.date), b44: (c.b44 << 24) >> 24, b45: c.b45 >>> 0, b3e: c.b3e, b3d: c.b3d });
      }
      feed(iso, s);
      continue;
    }
    const r = continueGame(); if (r?.match) quickPlayUserMatch();
  }
}
console.log('pr. måned', [...perMonth].sort().map(([k, v]) => `${k}:${v}`).join(' '));
console.log('pr. trupstatus', [...perSt].sort((a, b) => a[0] - b[0]).map(([k, v]) => `${k}:${v}`).join(' '));
