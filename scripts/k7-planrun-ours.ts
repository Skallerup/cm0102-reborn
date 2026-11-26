// K7: trupplanen tvunget for alle klubber i grupperne på dato D (spillets side af $S/k7i/orun.py – originalens 0x83a730 i unicorn på oraklets
// dagsbillede): cmSquadPlanClub + afterPlan (0x83b6e0 → 0x83f3a0) pr. klub, tragten i 0x83f3a0 med de oversatte instruktioner (PC_HOOK 0x83fa25 slået fra efter D):
// blokken før 0x840a81 (afvist), 0x8400da (vurderet), 0x840159 (over grænserne), 0x84093f (godkendt) pr. plads; pladserne efter. JSON som orun.py.
//   WORLD=<world-dbs2.json> D=2001-09-08 [G=P,1] [CLUBS=…] OUT=<u.json> npx tsx scripts/k7-planrun-ours.ts
import { readFileSync, writeFileSync } from 'node:fs';
import type { WorldData } from '../src/game/newgame';
import { loadOrCreate } from './lib/snapshot';
import { slCall } from '../src/game/cmShortlist';
import { buildSlMem, afterPlan, PV_STATS } from '../src/game/cmShortlistGame';
import { cmSquadPlanClub, fromRow } from '../src/game/cmSquadPlanGame';
import { TRACE, PC_HOOK } from '../src/game/cmGen/x86';
import { EVAL_DIAG } from '../src/game/cmSlEval';

const WF = process.env.WORLD!, w = JSON.parse(readFileSync(WF, 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
const D = process.env.D ?? '2001-09-08', GR = (process.env.G ?? 'P,1').split(','), ONLY = new Set((process.env.CLUBS ?? '').split(',').filter(Boolean));
const TIER: Record<string, string> = { 'English Premier Division': 'P', 'English First Division': '1', 'English Second Division': '2', 'English Third Division': '3' };
const g = loadOrCreate({ world: w, worldFile: WF, club: 'Arsenal', date: process.env.D ?? '2001-09-08', seed: 1, mode: 'authentic', managerName: 'Test Smoke' });
const grp = (cid: number) => { const c = g.clubs[cid]; if (!c || c.nation !== eng) return 'X'; return TIER[g.comps[c.league]?.name ?? g.leagues[c.league]?.name ?? ''] ?? 'NL'; };
console.log('dato', g.date.slice(0, 10));
interface Fill { slot: number; i: number; rej: Record<string, number>; cand: number; ev: number; pass: number; acc: number; blk: Record<string, number>; will: number[] }
const S = buildSlMem(g);
// frasorteringen (PC_HOOK 0x83fa25, kun hastighed) af: tragten ses i de oversatte blokke
delete PC_HOOK[0x83fa25];
let F: Fill[] | null = null, last = 0;
const PB: Record<string, number> = {};
const SC: number[][] = [];
const PV: number[][] = [];
const JU: { name: string; kind: number; hint: number; v: number; ca: number; pa: number }[] = [];
PV_STATS.judge = (p, kind, hint, v) => { if (F) JU.push({ name: `${p.first} ${p.last}`, kind, hint, v, ca: p.ca, pa: p.pa }); };
EVAL_DIAG.pv = (st, a1, mask, club, a4, v18, o) => { if (F) PV.push([st, club, a1 & 0xffff, mask, a4, v18, o]); };
const WL: { st: number; buyer: number; w: number }[] = [];
const DBG: { st: number; club: number; b24: number; self: number; w: number }[] = [];
TRACE.on = true;
TRACE.f = (pc, R) => {
  if (!F || pc < 0x83f3a0 || pc >= 0x840c80) return;
  if (pc === 0x83f3a0) F.push({ slot: R.m.u32((R.esp + 4) >>> 0), i: -1, rej: {}, cand: 0, ev: 0, pass: 0, acc: 0, blk: {}, will: [] });
  else if (F.length) {
    const f = F[F.length - 1];
    if (pc === last) return;                                                    // (en blok ved kædegrænsen spores to gange)
    const bk = '0x' + pc.toString(16); f.blk[bk] = (f.blk[bk] ?? 0) + 1;
    if (R.m.u8(R.m.u32((R.ebp + 8) >>> 0)) === 0xb) PB[bk] = (PB[bk] ?? 0) + 1;
    if (pc === 0x8407a2) f.will.push(R.m.f64((R.esp + 0x34) >>> 0));
    if (pc === 0x84013e && R.m.u8(R.m.u32((R.ebp + 8) >>> 0)) === 0xb) { const e = R.esp >>> 0, sl = R.m.u32((R.ebp + 8) >>> 0); SC.push([R.esi >>> 0, R.m.u32((R.ebp + 0xc) >>> 0), R.m.u8(sl + 0x24), R.ecx | 0, R.m.s32(e + 0x68), R.m.s32(e + 0x58)]); }
    if (pc === 0x840642 && R.m.u8(R.m.u32((R.ebp + 8) >>> 0)) === 0xb) WL.push({ st: R.esi >>> 0, buyer: R.m.u32((R.ebp + 0xc) >>> 0), w: NaN });
    if (pc === 0x840687 && WL.length && isNaN(WL[WL.length - 1].w)) WL[WL.length - 1].w = R.st[0];
    if (pc === 0x840642 && DBG.length < 8) DBG.push({ st: R.esi >>> 0, club: R.m.u32((R.ebp + 0xc) >>> 0), b24: R.m.u8((R.m.u32((R.ebp + 8) >>> 0) + 0x24) >>> 0), self: R.m.u32((R.esp + 0x10) >>> 0), w: NaN });
    if (pc === 0x840687 && DBG.length && isNaN(DBG[DBG.length - 1].w)) DBG[DBG.length - 1].w = R.st[0];
    if (pc === 0x840a81) { const k = '0x' + last.toString(16); f.rej[k] = (f.rej[k] ?? 0) + 1; }
    else if (pc === 0x83fa25 || pc === 0x83fa1a) f.cand++;
    else if (pc === 0x8400da) f.ev++;
    else if (pc === 0x840159) f.pass++;
    else if (pc === 0x84093f) f.acc++;
  }
  last = pc;
};
const res: unknown[] = [];
const clubs = Object.values(g.clubs).filter((c) => c.name !== 'Arsenal' && GR.includes(grp(c.id)) && (!ONLY.size || ONLY.has(c.name)) && g.cmPlan?.[c.id]).sort((a, b) => a.name.localeCompare(b.name));
for (const c of clubs) {
  const st = g.cmPlan![c.id];
  const pl = () => st.s.map(fromRow).map((s, i) => ({ ...s, i })).filter((s) => s.role === 0xb);
  const before = pl().filter((s) => s.f > -1 && s.f !== s.s13).length;
  const n8 = st.c, st4 = st.st;
  F = [];
  const r = cmSquadPlanClub(g, c.id, true, false);
  if (r) afterPlan(S, c.id, r.dropped);
  const fills = F; F = null;
  const club = S.clubAdr(c.id), base = club ? S.m.u32(S.m.u32(S.slm + 0xdc) + 9 * S.m.s32(club)) : 0;
  for (const f of fills) f.i = base ? Math.round((f.slot - base) / 0x25) : -1;
  const after = pl();
  const row = { club: c.name, g: grp(c.id), rep: g.cmClubRep?.[c.id] ?? 0, n8, st: st4, err: r ? null : 'ingen plan', fills,
    targets: after.filter((s) => s.f > -1 && s.f !== s.s13).length, budget: after.filter((s) => (s.b7 ?? 0) > 0).length,
    slots: after.map((s) => ({ i: s.i, role: s.role, b3: s.b3 ?? 0, b7: s.b7 ?? 0, bb: s.bb ?? 0, f: s.f, h: s.s13, bm: s.s17, g: s.b24 })), before };
  res.push(row);
  const sum = (k: 'cand' | 'ev' | 'pass' | 'acc') => fills.reduce((a, f) => a + f[k], 0);
  console.log(c.name, row.g, 'n8', n8, 'mål', before, '->', row.targets, 'budget', row.budget, 'kald', fills.length, 'kand', sum('cand'), 'vurd', sum('ev'), 'over', sum('pass'), 'godk', sum('acc'));
}
TRACE.on = false;
for (const d of DBG) console.log('DBG', d, 'slm', S.slm, 'slCall', slCall(S.c, 0x846920, d.self, d.st, d.club, 1, d.b24 & 1, (d.b24 >> 1) & 0xf, 0));
{
  const m = S.m, nm = (a: number) => { let s = ''; for (let i = 0; i < 50; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
  const who = WL.map((x) => { const sc = m.u32(x.st + 0x39); const p = S.byMem.get(m.s32(x.st)); return { name: p ? `${p.first} ${p.last}` : '?', age: m.u8(x.st + 0x18), id: m.s32(x.st), rep: m.u32(x.st + 0x61) ? m.s16(m.u32(x.st + 0x61) + 0xd) : 0, club: p ? g.clubs[p.club]?.name ?? '-' : '-', buyerName: g.clubs[m.s32(x.buyer)]?.name, sc, w: x.w }; });
  const sc = SC.map(([st, b, gg, v, t, bst]) => { const p = S.byMem.get(m.s32(st)); return { name: p ? `${p.first} ${p.last}` : '?', club: p ? g.clubs[p.club]?.name ?? '-' : '-', age: m.u8(st + 0x18), buyer: g.clubs[m.s32(b)]?.name, g: gg, sc: v, thr: t, best: bst, v52: m.s32(st + 0x52) }; });
  const smi = (S.M as unknown as { staffMemId?: (sid: number) => number | undefined }).staffMemId, sByMem = new Map<number, string>();
  if (smi) for (const s of Object.values(g.staff)) { const id = smi(s.id); if (id !== undefined) sByMem.set(id, `${s.first ?? ''} ${s.last ?? s.name ?? ''}`.trim() + `/${g.clubs[s.club ?? -1]?.manager === s.id ? 'mgr' : s.role ?? s.job ?? '?'}`); }
  const pn = (st: number) => { const p = S.byMem.get(m.s32(st)); return p ? `${p.first} ${p.last}` : st ? sByMem.get(m.s32(st)) ?? `#${m.s32(st)}` : '-'; };
  const pv = PV.map(([st, cl, pos, mask, a4, v18, o]) => ({ name: pn(st), buyer: g.clubs[m.s32(cl)]?.name, pos, mask, a4, ass: pn(v18 >>> 0), assJob: v18 ? m.u8((v18 >>> 0) + 0x3d) : -1, o }));
  writeFileSync(process.env.OUT!, JSON.stringify({ res, who, pb: PB, sc, pv, ju: JU }));
}
