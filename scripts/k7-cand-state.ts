// K7: ønskelisternes topkandidater (par spiller/køber over tærsklen hos os eller oraklet 9/9 – k7-planrun-ours.ts / orun.py 'sc') – deres
// tilstand på datoen hos oraklet (dagsbilledet SNAP) og i spillet: CA, PA, omdømmet (staff → spiller +5/+7, kontrakt-klub), og scoren begge steder.
//   WORLD=<world-dbs2.json> SNAP=<o-0908.bin> TOP=<top.json> [D=2001-09-08] npx tsx scripts/k7-cand-state.ts
import { readFileSync } from 'node:fs';
import type { WorldData } from '../src/game/newgame';
import { loadOrCreate } from './lib/snapshot';
import { loadSnap } from './ct-snap';
import { G } from '../src/game/cmMem';

const WF = process.env.WORLD!, w = JSON.parse(readFileSync(WF, 'utf8')) as WorldData;
const top = JSON.parse(readFileSync(process.env.TOP!, 'utf8')) as [string, string, number, number, number, number][];
const m = loadSnap(process.env.SNAP!);
const cstr = (a: number) => { let s = ''; if (!a) return s; for (let i = 0; i < 50; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const STAFF = m.u32(G.STAFF), n = m.s32(G.STAFF_COUNT);
const oByName = new Map<string, { ca: number; pa: number }>();
for (let id = 0; id < n; id++) {
  const st = (STAFF + 0x6e * id) >>> 0, pr = m.u32(st + 0x61);
  if (!pr) continue;
  const nm = `${cstr(m.u32(st + 4))} ${cstr(m.u32(st + 8))}`.trim();
  if (!oByName.has(nm)) oByName.set(nm, { ca: m.s16(pr + 5), pa: m.s16(pr + 7) });
}
const g = loadOrCreate({ world: w, worldFile: WF, club: 'Arsenal', date: process.env.D ?? '2001-09-08', seed: 1, mode: 'authentic', managerName: 'Test Smoke' });
const uByName = new Map<string, { ca: number; pa: number }>();
for (const p of Object.values(g.players)) { const nm = `${p.first} ${p.last}`.trim(); if (!uByName.has(nm)) uByName.set(nm, { ca: p.ca, pa: p.pa }); }
let k = 0, sameCa = 0, dCa = 0, dSc = 0, both = 0, ups = 0, oOnly = 0, uOnly = 0;
const rows: string[] = [];
for (const [name, buyer, os, us, ot, ut] of top) {
  const o = oByName.get(name), u = uByName.get(name);
  if (!o || !u) continue;
  k++; if (o.ca === u.ca) sameCa++; dCa += u.ca - o.ca; dSc += us - os;
  const oo = os > ot, uu = us > ut; if (oo && uu) both++; else if (oo) oOnly++; else if (uu) uOnly++;
  if (oo && !uu && ups++ < 25) rows.push(`${name} (${buyer}) CA ${u.ca}/${o.ca} PA ${u.pa}/${o.pa} score ${us}/${os} thr ${ut}/${ot}`);
}
console.log(`par ${k}: CA ens ${sameCa}, ΔCA middel ${(dCa / k).toFixed(2)}, Δscore middel ${(dSc / k).toFixed(0)}; over tærsklen begge ${both}, kun oraklet ${oOnly}, kun os ${uOnly}`);
console.log('kun oraklet over (vores/orakel):'); for (const r of rows) console.log('  ' + r);
// ens CA: scoreforskellen alligevel?
let n2 = 0, d2 = 0, e2 = 0;
for (const [name, , os, us] of top) { const o = oByName.get(name), u = uByName.get(name); if (!o || !u || o.ca !== u.ca || o.pa !== u.pa) continue; n2++; d2 += us - os; if (us === os) e2++; }
console.log(`samme CA og PA: ${n2} par, score ens ${e2}, Δscore middel ${(d2 / Math.max(n2, 1)).toFixed(0)}`);
