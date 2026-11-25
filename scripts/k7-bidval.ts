// K7: build_bid 0x8e5d60's beløbstjek for ønskelisternes mål – oraklets dagsbilleder mod spillet på de samme datoer.
// For hver spillerplads (rolle 0xb) med et mål ≠ indehaver hos en engelsk klub: A = udbudsprisen 0x4d1600(sælger, køber, staff, 0, 1, 1),
// B0 = købers vurdering 0x840d80(køber, staff, plads, &ud, −1, 1), v = staff +0x52; B = min(B0, v), B = A hvis A < B (0x8e66bf, computersælger).
// Buddet opgives (0x8e70ef → 0x8e7272/0x8e754e → 0x8e77bd), når B ≤ 0,75·A.
//   WORLD=<world-dbs2.json> DATES=2001-07-21,2001-08-04 [G=P] npx tsx scripts/k7-bidval.ts      (ONLY_ORACLE=1: kun oraklet)
import { readFileSync } from 'node:fs';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import { G as GA, getContract, type CmCtx, type CmMem } from '../src/game/cmMem';
import type { WorldData } from '../src/game/newgame';
import { genCtx } from '../src/game/cmGen/impls';
import { getClubFinance_5a0590 } from '../src/game/cmWage';
import { cmMemCall } from '../src/game/cmWageGame';
import { slCall, slmOf } from '../src/game/cmShortlist';

const DATES = (process.env.DATES ?? '2001-07-21,2001-08-04,2001-08-18,2001-09-01').split(',');
const GRP = (process.env.G ?? 'P').split(',');
const TIER: Record<string, string> = { 'English Premier Division': 'P', 'English First Division': '1', 'English Second Division': '2', 'English Third Division': '3' };
const str = (m: CmMem, a: number, n = 54) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
type Row = { d: string; buyer: string; sg: string; name: string; A: number; B0: number; v: number; B: number; fail: boolean; bb: number };

function scan(m: CmMem, c: CmCtx, d: string, human: number): Row[] {
  const C = m.u32(0xae23b4), nc = m.s32(0xae235c), S = m.u32(GA.STAFF);
  const slm = slmOf(m);
  const grp = (a: number) => { if (!a) return '-'; if (str(m, m.u32(a + 0x53) + 4) !== 'England') return 'X'; const dv = m.u32(a + 0x57); return TIER[dv ? str(m, dv + 4) : ''] ?? 'NL'; };
  const rows: Row[] = [];
  for (let cix = 0; cix < nc; cix++) {
    const club = C + 0x245 * cix;
    if (club === human || !GRP.includes(grp(club))) continue;
    const base = m.u32(m.u32(slm + 0xdc) + 9 * cix);
    if (!base) continue;
    for (let i = 0; i < 40; i++) {
      const s = base + 0x25 * i;
      if (m.u8(s) !== 0xb) continue;
      const t = m.s32(s + 0xf), h = m.s32(s + 0x13);
      if (t < 0 || t === h) continue;
      const st = S + 0x6e * t, k = getContract(m, st);
      if (!k) continue;
      const seller = C + 0x245 * m.s32(k + 4);
      if (seller === club || seller === human) continue;
      const out = 0x5f0f2000; m.w32(out, 0);
      const A = slCall(c, 0x4d1600, m.u32(GA.CM), seller, club, st, 0, 1, 1) | 0;
      const B0 = slCall(c, 0x840d80, slm, club, st, s, out, -1, 1) | 0;
      const v = m.s32(st + 0x52);
      let B = Math.min(B0, v); if (A < B) B = A;
      rows.push({ d, buyer: str(m, club + 4), sg: grp(seller), name: `${str(m, m.u32(st + 4) + 4)} ${str(m, m.u32(st + 8) + 4)}`.trim(), A, B0, v, B, fail: B <= 0.75 * A, bb: m.s32(s + 0xb) });
    }
  }
  return rows;
}
const MISS = new Map<number, number>();
const rnd = (n: number) => (n > 1 ? Math.floor(n / 2) : 0);
function summary(tag: string, rows: Row[]) {
  const q = (a: number[], p: number) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(p * (s.length - 1))] : NaN; };
  for (const d of DATES) {
    const r = rows.filter((x) => x.d === d);
    console.log(`${tag} ${d}: mål ${r.length}, opgives ${r.filter((x) => x.fail).length}; A/v p25/50/75 ${[0.25, 0.5, 0.75].map((p) => q(r.map((x) => x.A / Math.max(1, x.v)), p).toFixed(2)).join('/')}; B0/v ${[0.25, 0.5, 0.75].map((p) => q(r.map((x) => x.B0 / Math.max(1, x.v)), p).toFixed(2)).join('/')}; B/A ${[0.25, 0.5, 0.75].map((p) => q(r.map((x) => x.B / Math.max(1, x.A)), p).toFixed(2)).join('/')}`);
    if (process.env.ROWS) for (const x of r) console.log(`   ${x.fail ? 'FAIL' : 'ok  '} ${x.buyer} ← ${x.name} (${x.sg}) A ${x.A} B0 ${x.B0} v ${x.v} bb ${x.bb}`);
  }
}
{
  const ix = readDaySnapIndex(DEFAULT_DAYSNAP)!;
  const rows: Row[] = [];
  for (const d of DATES) {
    const e = ix.snaps.find((x) => x.iso === d); if (!e) { console.log('intet billede', d); continue; }
    const m = loadDaySnap(ix, e);
    const ob: CmCtx = {
      m, rand: rnd,
      call: (adr, ...a) => {
        switch (adr) {
          case 0x5a0590: return getClubFinance_5a0590(ob, a[a.length - 1]);
          case 0x846920: case 0x849f00: case 0x844780: return slCall(oc, adr, slmOf(m), ...a);
          case 0x8cca10: return slCall(oc, adr, m.u32(0xde1f54), ...a);
        }
        try { return cmMemCall(ob, adr, ...a); } catch (e) { if (process.env.DBG) MISS.set(adr, (MISS.get(adr) ?? 0) + 1); return 0; }
      },
    };
    const oc = genCtx(ob);
    // menneskets klub (Arsenal i oraklets kørsel)
    const C = m.u32(0xae23b4), nc = m.s32(0xae235c);
    let human = 0; for (let i = 0; i < nc; i++) if (str(m, C + 0x245 * i + 4) === 'Arsenal') human = C + 0x245 * i;
    rows.push(...scan(m, oc, d, human));
    (m as { release?: () => void }).release?.();
  }
  summary('orakel', rows);
  if (process.env.DBG) console.log('mangler', [...MISS].map(([a, n]) => `${a.toString(16)}:${n}`).join(' '));
}
if (!process.env.ONLY_ORACLE) {
  const { createGame } = await import('../src/game/newgame');
  const { continueGame, quickPlayUserMatch } = await import('../src/game/sim');
  const { gs } = await import('../src/game/state');
  const { SL_DIAG } = await import('../src/game/cmShortlistGame');
  const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
  const eng = w.nations.findIndex((n) => n.name === 'England');
  createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  const rows: Row[] = [];
  // dagsbilledet D (før dagens 0x4c7ac0) ~ ønskelisterne, når spillet kører dag D: scan før dagens løkke
  let want = '';
  SL_DIAG.after = (S) => {
    const d = gs().date.slice(0, 10);
    if (!DATES.includes(d) || want === d) return;
    want = d;
    const M = S.M, m = M.c.m, human = M.W.clubOf(gs().userClub!);
    M.setRand(rnd);
    rows.push(...scan(m, M.c, d, human));
  };
  let g = gs();
  const last = DATES[DATES.length - 1];
  while (g.date.slice(0, 10) <= last) { const r = continueGame(); if (r?.match) quickPlayUserMatch(); g = gs(); }
  summary('spil', rows);
}
