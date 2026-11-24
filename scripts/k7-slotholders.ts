// K7: trupplanens spillerpladser pr. indehaver (navn) – oraklets dagsbillede mod spillet på samme dato: maske, gruppe (+0x24), +3, +0xb og den
// afledte værdi v (0x6e6340) af indehaveren, regnet baglæns af halen 0x83e9bd (gruppe 4: +0xb = 0,8·(g − v), 5: 0,5·(g − v), 2/3: omd·r + k·(g − v)).
//   WORLD=<world-dbs2.json> DATE=2001-07-14 CLUBS=Charlton Athletic,Aston Villa npx tsx scripts/k7-slotholders.ts
import { readFileSync } from 'node:fs';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import type { SparseMem } from '../src/game/cmMem';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { fromRow } from '../src/game/cmSquadPlanGame';

const DATE = process.env.DATE ?? '2001-07-14';
const TIER: Record<string, string> = { 'English Premier Division': 'P', 'English First Division': '1', 'English Second Division': '2', 'English Third Division': '3' };
const GROUPS = new Set((process.env.GROUPS ?? 'P').split(','));
const CLUBS = process.env.CLUBS ? new Set(process.env.CLUBS.split(',')) : null;
const str = (m: SparseMem, a: number, n = 54) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const K: Record<number, number> = { 1: 2.5, 2: 2, 3: 1.8 };
/** v baglæns af +0xb (ingen r-led: gruppe 2/3 løses med r i [0,5; 1]) */
function backV(g: number, thr: number, bb: number, rep: number): number {
  if (g === 4) return thr - bb / 0.8;
  if (g === 5) return thr - bb / 0.5;
  const k = K[g]; if (!k) return NaN;
  // bb = rep·r + k·(thr − v), r = klemt(1,25 − v/max(thr, 1000))
  for (let v = -10000; v <= 60000; v++) {
    let r = 1.25 - v / Math.max(thr, 1000); r = r > 1 ? 1 : r < 0.5 ? 0.5 : r;
    if (Math.abs(rep * r + k * (thr - v) - bb) < 1.5) return v;
  }
  return NaN;
}
interface Row { club: string; i: number; mask: number; g: number; b3: number; bb: number; name: string; f: number; tgt: boolean; v: number }
const ix = readDaySnapIndex(DEFAULT_DAYSNAP)!;
const m = loadDaySnap(ix, ix.snaps.find((x) => x.iso === DATE)!);
const C = m.u32(0xae23b4), nc = m.s32(0xae235c), St = m.u32(0xae23bc);
const pname = (id: number) => { if (id < 0) return '-'; const st = St + 0x6e * id; return str(m, m.u32(st + 0xc)) || `${str(m, m.u32(st + 4))} ${str(m, m.u32(st + 8))}`; };
const grpO = (cix: number) => { const a = C + 0x245 * cix; if (str(m, m.u32(a + 0x53) + 4) !== 'England') return 'X'; const dv = m.u32(a + 0x57); return TIER[dv ? str(m, dv + 4) : ''] ?? 'NL'; };
const O: Row[] = [];
const slm = m.u32(m.u32(0xde1f54) + 0x856);
for (let cix = 0; cix < nc; cix++) {
  if (!GROUPS.has(grpO(cix))) continue;
  const club = str(m, C + 0x245 * cix + 4); if (CLUBS && !CLUBS.has(club)) continue;
  const rep = m.s16(C + 0x245 * cix + 0x80);
  const base = m.u32(m.u32(slm + 0xdc) + 9 * cix); if (!base) continue;
  for (let i = 0; i < 40; i++) {
    const s = base + 0x25 * i; if (m.u8(s) !== 0xb) continue;
    const g = (m.u8(s + 0x24) >> 1) & 0xf, b3 = m.s32(s + 3), bb = m.s32(s + 0xb), h = m.s32(s + 0x13), f = m.s32(s + 0xf);
    O.push({ club, i, mask: m.u16(s + 1), g, b3, bb, name: pname(h), f, tgt: f >= 0 && f !== h, v: f === h && h >= 0 ? NaN : b3 ? backV(g, b3, bb, rep) : NaN });
  }
}
const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
let gg = gs();
while (gg.date.slice(0, 10) < DATE) { const r = continueGame(); if (r?.match) quickPlayUserMatch(); gg = gs(); }
const grpU = (cid: number) => { const c = gg.clubs[cid]; if (!c) return '-'; if (c.nation !== eng) return 'X'; return TIER[gg.comps[c.league]?.name ?? gg.leagues[c.league]?.name ?? ''] ?? 'NL'; };
const U: Row[] = [];
for (const c of Object.values(gg.clubs)) {
  if (!GROUPS.has(grpU(c.id)) || (CLUBS && !CLUBS.has(c.name))) continue;
  const st = gg.cmPlan?.[c.id]; if (!st) continue;
  const rep = gg.cmClubRep?.[c.id] ?? 0;
  st.s.map(fromRow).forEach((s, i) => {
    if (s.role !== 0xb) return;
    const p = gg.players[s.s13], g = (s.b24 >> 1) & 0xf, b3 = s.b3 ?? 0, bb = s.bb ?? 0;
    U.push({ club: c.name, i, mask: s.mask, g, b3, bb, name: p ? `${p.first} ${p.last}`.trim() : '-', f: s.f, tgt: s.f >= 0 && s.f !== s.s13, v: s.f === s.s13 && s.s13 >= 0 ? NaN : b3 ? backV(g, b3, bb, rep) : NaN });
  });
}
const fmt = (r?: Row) => (r ? `#${String(r.i).padStart(2)} m${r.mask.toString(16).padEnd(3)} g${r.g} ${r.tgt ? 'T' : r.f >= 0 ? '=' : ' '} bb ${String(r.bb).padStart(6)} v ${Number.isNaN(r.v) ? '     -' : String(Math.round(r.v)).padStart(6)}` : '-');
const clubs = [...new Set(O.map((r) => r.club))].sort();
const dv: number[] = [];
for (const cl of clubs) {
  console.log(`\n== ${cl}`);
  const o = O.filter((r) => r.club === cl), u = U.filter((r) => r.club === cl);
  const names = [...new Set([...o.map((r) => r.name), ...u.map((r) => r.name)])].filter((n) => n !== '-');
  for (const n of names) {
    const a = o.find((r) => r.name === n), b = u.find((r) => r.name === n);
    if (a && b && !Number.isNaN(a.v) && !Number.isNaN(b.v)) dv.push(b.v - a.v);
    console.log(`  ${n.padEnd(24)} O ${fmt(a).padEnd(46)} V ${fmt(b)}`);
  }
}
dv.sort((a, b) => a - b);
if (dv.length) console.log(`\nv(vores) − v(oraklet) for samme indehaver: n ${dv.length}  p10/25/50/75/90 ${[0.1, 0.25, 0.5, 0.75, 0.9].map((p) => Math.round(dv[Math.floor(p * (dv.length - 1))])).join('/')}  ens (|d| ≤ 2): ${dv.filter((d) => Math.abs(d) <= 2).length}`);
