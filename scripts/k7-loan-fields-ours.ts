// K7c #3: modstykket til scripts/k7-loan-fields.ts – vores spil (frø 1, Arsenal på ferie, WORLD = world med CM_DBSIZE=2) til D: ønskelisternes
// frasortering 0x83fa25 for udlejede mod andre (FR_DIAG: afvisningskode pr. kandidat, 0x840d80's score mod grænserne) og de udlejedes felter i
// ønskelisternes hukommelse på D.
//   WORLD=<world-dbs2.json> [D=2001-08-25] [FROM=2001-07-14] CM_SL_SKIP=0 node scripts/measure.mjs -- npx tsx scripts/k7-loan-fields-ours.ts
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { applyAction } from '../src/game/actions';
import { gs } from '../src/game/state';
import { buildSlMem, FR_DIAG } from '../src/game/cmShortlistGame';
import { G, type CmMem } from '../src/game/cmMem';
import { TRACE } from '../src/game/cmGen/x86';

const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
const D = process.env.D ?? '2001-08-25', FROM = process.env.FROM ?? '2001-07-14';
const isLoan = (m: CmMem, st: number) => { const id = m.s32(st); return m.s32((m.u32(G.ROWS) + 79 * id + 4) >>> 0) >= 0; };
const rejL: Record<number, number> = {}, rejO: Record<number, number> = {};
const perL = new Map<number, Record<string, number>>();
let evL = 0, evO = 0, passL = 0, passO = 0;
const evDiff: number[] = [];
FR_DIAG.rej = (k, st) => {
  if (g.date < FROM) return;
  const m = FR_DIAG.m!;
  if (isLoan(m, st)) { rejL[k] = (rejL[k] ?? 0) + 1; const id = m.s32(st); const r = perL.get(id) ?? {}; r[k] = (r[k] ?? 0) + 1; perL.set(id, r); }
  else rejO[k] = (rejO[k] ?? 0) + 1;
};
FR_DIAG.ev = (st, score, thr, lim) => {
  if (g.date < FROM) return;
  const m = FR_DIAG.m!, ok = score >= thr && score >= lim;
  if (isLoan(m, st)) { evL++; if (ok) { passL++; tr.on = true; tr.last = 0; tr.prev = 0; tr.cls = 'L'; TRACE.on = true; } evDiff.push(score - thr); const id = m.s32(st); const r = perL.get(id) ?? {}; r[ok ? 'ok' : 'ev'] = (r[ok ? 'ok' : 'ev'] ?? 0) + 1; perL.set(id, r); }
  else { evO++; if (ok) { passO++; if (passO % 10 === 0) { tr.on = true; tr.last = 0; tr.prev = 0; tr.cls = 'O'; TRACE.on = true; } } }
};
// efter grænserne (0x840159 →): hvor en udlejet afvises (blokken før 0x840a81) eller godkendes (0x84093f)
const tr = { on: false, last: 0, prev: 0, cls: 'L' }; const after: Record<string, number> = {}; const will: Record<string, number[]> = { L: [], O: [] };
const hx = (v: number) => (v >>> 0).toString(16);
TRACE.f = (pc, R) => {
  if (!tr.on) return;
  if (pc === 0x8407a2) will[tr.cls].push(R.m.f64((R.esp >>> 0) + 0x34));
  if (pc === 0x840a81) { const k = tr.cls + hx(tr.last) + '<' + hx(tr.prev); after[k] = (after[k] ?? 0) + 1; tr.on = false; TRACE.on = false; return; }
  if (pc === 0x84093f) { after[tr.cls + 'godkendt'] = (after[tr.cls + 'godkendt'] ?? 0) + 1; tr.on = false; TRACE.on = false; return; }
  if (pc === 0x83fa25 || pc === 0x840a99) { after[tr.cls + '?' + hx(pc)] = (after[tr.cls + '?' + hx(pc)] ?? 0) + 1; tr.on = false; TRACE.on = false; return; }
  if (pc >= 0x83f3a0 && pc < 0x840c80 && pc !== tr.last) { tr.prev = tr.last; tr.last = pc; }
};
let bidsL = 0; const seenO = new Set<unknown>();
let guard = 0;
while ((g.date < D || !g.dayDone || g.pendingFixture) && guard++ < 5000) {
  if (!g.userClub) {
    const offer = g.jobOffers.find((id) => g.clubs[id]?.manager === 0);
    if (offer) applyAction({ t: 'acceptJob', club: offer }); else for (const id of g.vacancies.slice(0, 3)) applyAction({ t: 'applyJob', club: id });
    for (const id of Object.keys(g.manager.jobTalks ?? {})) if (g.manager.jobTalks![Number(id)].stage === 'offer') applyAction({ t: 'acceptJob', club: Number(id) });
  }
  const r = continueGame(); if (r?.match) quickPlayUserMatch();
  for (const o of g.offers) { if (seenO.has(o)) continue; seenO.add(o); const p = g.players[o.player]; if (p?.loan && !o.loan && o.buyer !== p.loan.from) { bidsL++; console.log(`bud ${g.date} ${g.clubs[o.buyer]?.name} på udlejet ${p.last} (${g.clubs[p.loan.from]?.name} → ${g.clubs[p.club]?.name}) ${o.fee} ${o.status}`); } }
}
const fmt = (o: Record<number | string, number>) => Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}`).join(' ');
console.log(`frasortering ${FROM}–${g.date}`);
console.log(`  udlejede: ${fmt(rejL)} | vurderet ${evL}, over grænserne ${passL}`);
console.log(`  andre:    ${fmt(rejO)} | vurderet ${evO}, over grænserne ${passO}`);
evDiff.sort((a, b) => b - a);
console.log(`  efter grænserne (L = udlejede, O = hver 10. andre): ${fmt(after)} | bud på udlejede ${bidsL}`);
for (const k of ['L', 'O'] as const) { const v = will[k].sort((a, b) => a - b); console.log(`  0x846920 ${k}: ${v.length} kald, ≥ 3,15: ${v.filter((x) => x >= 3.15).length}, median ${v[v.length >> 1]?.toFixed(2)}, største ${v.slice(-6).map((x) => x.toFixed(2)).join(' ')}`); }
console.log(`  udlejede score − grænse (største): ${evDiff.slice(0, 20).join(' ')}`);
const S = buildSlMem(g), m = S.m;
const st0 = m.u32(G.STAFF), rows = m.u32(G.ROWS), K = m.u32(m.u32(0xae1050)), C = m.u32(G.CLUBS);
const tm86e = m.u32(m.u32(0xde1f54) + 0x86e);
const dayIso = (d: number, y: number) => (y > 1850 && y < 2100 ? new Date(Date.UTC(y, 0, 1 + d)).toISOString().slice(0, 10) : `?${y}`);
const cn = (a: number) => (a ? g.clubs[(a - C) / 0x245]?.name ?? `?${a}` : '-');
const kf = (x: number) => `+4 ${g.clubs[m.s32(x + 4)]?.name ?? m.s32(x + 4)} +35 ${m.u8(x + 0x35).toString(16)} +45 ${m.u32(x + 0x45).toString(16)} +4e ${m.u8(x + 0x4e).toString(16)} +4f ${m.u8(x + 0x4f).toString(16)} +25 ${dayIso(m.s16(x + 0x25), m.u16(x + 0x27))} +2d ${dayIso(m.s16(x + 0x2d), m.u16(x + 0x2f))} +c ${m.s32(x + 0xc)}`;
let n = 0;
for (const p of Object.values(g.players)) {
  if (!p.loan || p.virtual || g.clubs[p.loan.from]?.nation !== eng) continue;
  const id = S.memOf.get(p.id); if (id === undefined) continue;
  const st = (st0 + 0x6e * id) >>> 0;
  const hi = m.s32(rows + 79 * id), li = m.s32(rows + 79 * id + 4);
  const fr = perL.get(id);
  console.log(`${id} ${p.last} LEJE +39 ${cn(m.u32(st + 0x39))} +3e ${dayIso(m.s16(st + 0x3e), m.u16(st + 0x40))} +52 ${m.s32(st + 0x52)} +24 ${m.u32(st + 0x24).toString(16)} +28 ${m.u8(st + 0x28)}`
    + ` | row+b ${m.u8(rows + 79 * id + 0xb).toString(16)} tm86e ${m.u8(tm86e + 8 * id).toString(16)}`
    + (hi >= 0 ? ` | K ${kf(K + 80 * hi)}` : ' | ingen K') + (li >= 0 ? ` | L ${kf(K + 80 * li)}` : ' | ingen L') + (fr ? ` | fr ${fmt(fr)}` : ' | fr -'));
  if (++n >= +(process.env.N ?? 60)) break;
}
// WILLSCAN=1: viljen 0x846920 mod de 92 ligaklubber på vores hukommelse (scripts/lib/willScan.ts – modstykket til k7-loan-will.ts)
if (process.env.WILLSCAN) {
  const { willScan, willReport } = await import('./lib/willScan');
  const LEAGUE = /^English (Premier|First|Second|Third) Division/;
  const clubs = Object.values(g.clubs).filter((c) => c.nation === eng && LEAGUE.test(g.comps[c.league]?.name ?? g.leagues[c.league]?.name ?? '')).map((c) => c.id);
  const ids: number[] = [];
  const STEP = +(process.env.STEP ?? 200);
  for (const p of Object.values(g.players)) {
    if (p.virtual || !p.contract) continue;
    const home = p.loan?.from ?? p.club;
    if (!clubs.includes(home)) continue;
    const id = S.memOf.get(p.id); if (id === undefined) continue;
    if (p.loan || id % STEP === 0) ids.push(id);
  }
  const isL = (id: number) => m.s32(rows + 79 * id + 4) >= 0;
  const r = willScan(S.c, m, ids, clubs, isL);
  console.log(`vores ${g.date}: ${clubs.length} klubber, ${ids.filter(isL).length} udlejede, ${ids.filter((x) => !isL(x)).length} andre`);
  for (const l of willReport(r, (id) => S.byMem.get(id)?.last ?? String(id))) console.log(l);
}
