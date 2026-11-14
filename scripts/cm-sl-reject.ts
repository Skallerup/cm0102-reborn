// Hvor 0x83f3a0 (fill_shortlist_slot) afviser kandidaterne på spillets data: for de valgte klubber køres 0x83b6e0 med TRACE, og hoppene til
// 0x840a81 (næste kandidat) tælles efter stedet, de kom fra; ved 0x84013e logges 0x840d80's score mod tærsklen.
//   CLUBS="Aston Villa,Birmingham City" npx tsx scripts/cm-sl-reject.ts
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { buildSlMem, afterPlan, FR_STATS, FR_LAST } from '../src/game/cmShortlistGame';
import { fromRow } from '../src/game/cmSquadPlanGame';
import { TRACE } from '../src/game/cmGen/x86';
const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((n) => n.name === 'England');
createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
const S = buildSlMem(g);
const names = (process.env.CLUBS ?? 'Aston Villa,Birmingham City,Blackpool,Bolton Wanderers').split(',');
const hex = (v: number) => (v >>> 0).toString(16);
for (const nm of names) {
  const c = Object.values(g.clubs).find((x) => x.name === nm);
  if (!c || !g.cmPlan?.[c.id]) { console.log(nm, 'ingen plan'); continue; }
  const from = new Map<string, number>();
  let last = 0, cand = 0, evals = 0, calls = 0;
  const scores: string[] = [];
  const pcs = new Map<number, number>();
  let passed = false, trail: number[] = [], curId = -1, curScore = '';
  const top: string[] = [], prices: string[] = [], want: number[] = [], wages: string[] = [];
  let accepted = 0;
  const fromP = new Map<string, number>(), trails: string[] = [];
  TRACE.on = true;
  TRACE.f = (pc, R) => {
    if (pc === 0x840a81) {
      const k = hex(last); from.set(k, (from.get(k) ?? 0) + 1);
      if (passed) { fromP.set(k, (fromP.get(k) ?? 0) + 1); if (trails.length < +(process.env.NT ?? 6)) trails.push(trail.slice(-60).map(hex).join(' ')); }
      passed = false;
    }
    if (pc === 0x840159) { passed = true; trail = []; }
    if (passed) trail.push(pc);
    if (pc === 0x83fa25) { cand++; const m = R.m; curId = m.s32((R.edx >>> 0) + 12 * (R.ecx | 0)); curScore = ''; FR_LAST.k = -1; }
    if (pc === 0x84013e) curScore = `score ${R.ecx | 0}/${R.m.s32((R.esp >>> 0) + 0x68)} værdi ${R.m.s32((R.esp >>> 0) + 0x18)}`;
    if (pc === 0x8407a2) { const v = R.m.f64((R.esp >>> 0) + 0x34); want.push(v); }
    if (pc === 0x840930 && wages.length < 12) { const p = S.byMem.get(curId); wages.push(`${p ? `${p.last} CA ${p.ca}` : curId}: 1,2·maxløn ${(R.st[0] ?? NaN).toFixed(0)} ønskeløn ${R.m.f64((R.esp >>> 0) + 0x5c).toFixed(0)}`); }
    if (pc === 0x84093f) accepted++;
    if (pc === 0x84b0eb && prices.length < 12) { const p = S.byMem.get(curId); prices.push(`${p ? `${p.last} CA ${p.ca}` : curId}: pris ${R.esi | 0} bud ${R.m.s32((R.esp >>> 0) + 0x1c)}:${R.m.s32((R.esp >>> 0) + 0x20)} ${curScore}`); }
    if (pc === 0x840a81) { const p = S.byMem.get(curId); if (p && p.ca >= +(process.env.MINCA ?? 140)) top.push(`${p.first} ${p.last} CA ${p.ca} (${g.clubs[p.club]?.name ?? '-'}) afvist fra ${hex(last)}${last === 0x83fa25 ? ` grund ${FR_LAST.k}` : ''} ${curScore}`); }
    if (pc === 0x8400da) evals++;
    if (pc === 0x83f3a0) calls++;
    if (pc === 0x84013e && scores.length < +(process.env.NS ?? 15)) {
      const m = R.m, esp = R.esp >>> 0, st = R.esi >>> 0;
      const p = S.byMem.get(m.s32(st));
      scores.push(`${p ? `${p.first} ${p.last} CA ${p.ca}` : m.s32(st)}: score ${R.ecx | 0} tærskel ${m.s32(esp + 0x68)} [58] ${m.s32(esp + 0x58)} værdi ${m.s32(esp + 0x18)}`);
    }
    if (process.env.PCS) pcs.set(pc, (pcs.get(pc) ?? 0) + 1);
    last = pc;
  };
  for (const k of Object.keys(FR_STATS)) delete FR_STATS[+k];
  const t0 = performance.now();
  afterPlan(S, c.id, []);
  TRACE.on = false;
  const rows = g.cmPlan[c.id].s.map(fromRow).filter((s) => s.role === 0xb);
  console.log(`${nm}: ${Math.round(performance.now() - t0)} ms, 0x83f3a0 ${calls} kald, kandidater ${cand}, vurderet ${evals}, mål ${rows.filter((s) => s.f > -1 && s.f !== s.s13).length}`);
  console.log('  afvist fra: ' + [...from].sort((a, b) => b[1] - a[1]).slice(0, 25).map(([k, v]) => `${k}:${v}`).join(' '));
  for (const s of scores) console.log('  ' + s);
  for (const x of prices) console.log('   84af00 ' + x);
  want.sort((a, b) => b - a);
  console.log(`  0x846920: ${want.length} kald, ≥ 3,15: ${want.filter((v) => v >= 3.15).length}, største ${want.slice(0, 8).map((v) => v.toFixed(2)).join(' ')}; godkendt (0x84093f) ${accepted}`);
  for (const x of wages) console.log('   løn ' + x);
  console.log('  frasortering: ' + Object.entries(FR_STATS).map(([k, v]) => `${k}:${v}`).join(' '));
  const seen = new Set<string>();
  for (const t of top) { if (seen.has(t)) continue; seen.add(t); if (seen.size <= +(process.env.NTOP ?? 40)) console.log('   ' + t); }
  console.log('  efter scoren afvist fra: ' + [...fromP].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}`).join(' '));
  for (const t of trails) console.log('    spor: ' + t);
  if (process.env.PCS) { const tot = [...pcs.values()].reduce((a, b) => a + b, 0); const own = [...pcs].filter(([k]) => k >= 0x83f3a0 && k < 0x840c80).reduce((a, [, b]) => a + b, 0); const b6 = [...pcs].filter(([k]) => k >= 0x83b6e0 && k < 0x83c000).reduce((a, [, b]) => a + b, 0); console.log(`  instruktionsblokke ${tot}, i 0x83f3a0 ${own}, i 0x83b6e0 ${b6}; flest: ` + [...pcs].sort((a, b) => b[1] - a[1]).slice(0, 30).map(([k, v]) => `${hex(k)}:${v}`).join(' ')); }
  console.log('  pladser: ' + rows.map((s) => `${s.f}/${s.s13} +3 ${s.b3} +7 ${s.b7} +b ${s.bb} m${s.mask.toString(16)} g${s.b24.toString(16)}`).slice(0, 40).join(' | '));
}
