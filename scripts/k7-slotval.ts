// K7: ønskelisternes spillerpladser (Shortlist_Manager +0xdc, 0x25 bytes) – +3 grænsen, +7 budgettet, +0xb pladsens værdi, +0x24 flag – for
// engelske klubber efter division, oraklet mod spillet på de samme datoer (make_club_bids 0x84a020's budtærskel: rand(+0xb·…) > rand(2·omdømme + 1000)).
//   WORLD=<world-dbs2.json> DATES=2001-07-14,2001-07-21 [OUT=fil.json] npx tsx scripts/k7-slotval.ts   (ONLY_ORACLE=1: kun oraklet)
import { readFileSync, writeFileSync } from 'node:fs';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import { getContract, type SparseMem } from '../src/game/cmMem';
import type { WorldData } from '../src/game/newgame';
import type { GameState } from '../src/game/types';

const DATES = (process.env.DATES ?? '2001-07-14,2001-07-21,2001-08-18').split(',');
const TIER: Record<string, string> = { 'English Premier Division': 'P', 'English First Division': '1', 'English Second Division': '2', 'English Third Division': '3' };
interface S { club: string; g: string; rep: number; i: number; mask: number; b3: number; b7: number; bb: number; f: number; h: number; m17: number; b24: number; tg: string }
const str = (m: SparseMem, a: number, n = 54) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };

function oracle(m: SparseMem): S[] {
  const C = m.u32(0xae23b4), nc = m.s32(0xae235c), St = m.u32(0xae23bc);
  const grp = (cix: number) => { if (cix < 0 || cix >= nc) return '-'; const a = C + 0x245 * cix; if (str(m, m.u32(a + 0x53) + 4) !== 'England') return 'X'; const dv = m.u32(a + 0x57); return TIER[dv ? str(m, dv + 4) : ''] ?? 'NL'; };
  const slm = m.u32(m.u32(0xde1f54) + 0x856), out: S[] = [];
  for (let cix = 0; cix < nc; cix++) {
    const g = grp(cix); if (g === 'X') continue;
    const ent = m.u32(slm + 0xdc) + 9 * cix, base = m.u32(ent); if (!base) continue;
    for (let i = 0; i < 40; i++) {
      const s = base + 0x25 * i; if (m.u8(s) !== 0xb) continue;
      const f = m.s32(s + 0xf), h = m.s32(s + 0x13);
      const k = f >= 0 ? getContract(m, St + 0x6e * f) : 0;
      out.push({ club: str(m, C + 0x245 * cix + 4), g, rep: m.s16(C + 0x245 * cix + 0x80), i, mask: m.u16(s + 1), b3: m.s32(s + 3), b7: m.s32(s + 7), bb: m.s32(s + 0xb), f, h, m17: m.s32(s + 0x17), b24: m.u8(s + 0x24), tg: f < 0 ? '' : k ? grp(m.s32(k + 4)) : '-' });
    }
  }
  return out;
}
let g!: GameState;
async function ours(): Promise<S[]> {
  const { fromRow } = await import('../src/game/cmSquadPlanGame');
  const eng = g.nations.findIndex((x) => x.name === 'England');
  const grp = (cid: number) => { const c = g.clubs[cid]; if (!c) return '-'; if (c.nation !== eng) return 'X'; return TIER[g.comps[c.league]?.name ?? g.leagues[c.league]?.name ?? ''] ?? 'NL'; };
  const out: S[] = [];
  for (const c of Object.values(g.clubs)) {
    const gr = grp(c.id); if (gr === 'X') continue;
    const st = g.cmPlan?.[c.id]; if (!st) continue;
    st.s.map(fromRow).forEach((s, i) => {
      if (s.role !== 0xb) return;
      out.push({ club: c.name, gr, g: gr, rep: g.cmClubRep?.[c.id] ?? 0, i, mask: s.mask, b3: s.b3 ?? 0, b7: s.b7 ?? 0, bb: s.bb ?? 0, f: s.f, h: s.s13, m17: s.s17, b24: s.b24, tg: s.f < 0 ? '' : g.players[s.f]?.club ? grp(g.players[s.f].club) : '-' } as S);
    });
  }
  return out;
}
const q = (a: number[], p: number) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(p * (s.length - 1))] : 0; };
function summary(tag: string, rows: S[]): string {
  const L = [tag];
  for (const gr of ['P', '1', '2', '3', 'NL']) {
    const rs = rows.filter((r) => r.g === gr);
    const tg = rs.filter((r) => r.f >= 0 && r.f !== r.h), open = rs.filter((r) => r.b7 > 0);
    L.push(`  ${gr}: pladser ${rs.length} budget>0 ${open.length} mål ${tg.length} (bud ${tg.filter((r) => r.m17 >= 0).length})  bb alle p50/p90 ${q(rs.map((r) => r.bb), 0.5)}/${q(rs.map((r) => r.bb), 0.9)}  bb mål p25/50/75 ${q(tg.map((r) => r.bb), 0.25)}/${q(tg.map((r) => r.bb), 0.5)}/${q(tg.map((r) => r.bb), 0.75)}  b7 mål p50 ${q(tg.map((r) => r.b7), 0.5)}  b3 mål p50 ${q(tg.map((r) => r.b3), 0.5)}  b24-bits mål ${[...new Set(tg.map((r) => r.b24.toString(16)))].join(',')}  målets gruppe ${JSON.stringify(tg.reduce((o, r) => ({ ...o, [r.tg]: (o[r.tg] ?? 0) + 1 }), {} as Record<string, number>))}`);
  }
  return L.join('\n');
}
const ix = readDaySnapIndex(DEFAULT_DAYSNAP)!;
const res: Record<string, { o: S[]; u?: S[] }> = {};
if (!process.env.ONLY_ORACLE) {
  const { createGame } = await import('../src/game/newgame');
  const { gs } = await import('../src/game/state');
  const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
  const eng = w.nations.findIndex((x) => x.name === 'England');
  createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  g = gs();
}
for (const d of DATES) {
  const e = ix.snaps.find((x) => x.iso === d)!;
  const o = oracle(loadDaySnap(ix, e));
  res[d] = { o };
  console.log(summary(`ORAKLET ${d}`, o));
  if (!process.env.ONLY_ORACLE) {
    const { continueGame, quickPlayUserMatch } = await import('../src/game/sim');
    const { gs } = await import('../src/game/state');
    while (g.date.slice(0, 10) < d) { const r = continueGame(); if (r?.match) quickPlayUserMatch(); g = gs(); }
    res[d].u = await ours();
    console.log(summary(`VORES ${g.date}`, res[d].u!));
  }
}
if (process.env.OUT) writeFileSync(process.env.OUT, JSON.stringify(res));
