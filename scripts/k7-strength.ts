// K7: 0x7bca90's inddata (klub +0x80 omdømme, +0x77, +0x64, divisionens +0x69, truppen 0x53c590, saldoen → 0x5986b0) og trupplanens T (pladsernes
// +3, største uden for målmanden) pr. klub og dato – oraklets dagsbilleder mod spillet (frø 1, Arsenal på ferie).
//   WORLD=<world-dbs2.json> CLUBS="Bolton Wanderers,Sunderland" [DATES=…] npx tsx scripts/k7-strength.ts
import { readFileSync } from 'node:fs';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import type { SparseMem } from '../src/game/cmMem';
import type { WorldData } from '../src/game/newgame';
import { financeStatus, clubStrength } from '../src/game/cmSquadPlan';

const DATES = (process.env.DATES ?? '2001-07-14,2001-07-21,2001-07-28,2001-08-04,2001-08-11,2001-08-25,2001-09-08,2001-09-29').split(',');
const CLUBS = (process.env.CLUBS ?? 'Bolton Wanderers,Sunderland,Chelsea,Tottenham Hotspur,Fulham').split(',');
const str = (m: SparseMem, a: number, n = 54) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
type Row = { eu?: number; sq2?: number; Tc?: number; rep: number; b77: number; st: number; dv: number; sq: number; bal: number; fin: number; T: number };
const O = new Map<string, Row>(), U = new Map<string, Row>();
{
  const ix = readDaySnapIndex(DEFAULT_DAYSNAP)!;
  for (const d of DATES) {
    const e = ix.snaps.find((x) => x.iso === d); if (!e) continue;
    const m = loadDaySnap(ix, e);
    const C = m.u32(0xae23b4), nc = m.s32(0xae235c), S = m.u32(0xae23bc), nS = m.s32(0xae2364);
    const slm = m.u32(m.u32(0xde1f54) + 0x856);
    const want = new Map<number, string>();
    for (let cix = 0; cix < nc; cix++) { const n = str(m, C + 0x245 * cix + 4); if (CLUBS.includes(n)) want.set(C + 0x245 * cix, n); }
    const sq = new Map<number, number>();
    for (let id = 0; id < nS; id++) { const st = S + 0x6e * id; if (!m.u32(st + 0x61)) continue; const c = m.u32(st + 0x39); if (want.has(c)) sq.set(c, (sq.get(c) ?? 0) + 1); }
    for (const [a, n] of want) {
      const cix = (a - C) / 0x245, rep = m.s16(a + 0x80), dvp = m.u32(a + 0x57);
      const f = m.u32(m.u32(0xae2a38)) + 0x167 * m.s32(a), bal = m.u32(f) + 4294967296 * m.s32(f + 4);
      const base = m.u32(m.u32(slm + 0xdc) + 9 * cix);
      let T = 0; if (base) for (let i = 0; i < 40; i++) { const s = base + 0x25 * i; if (m.u8(s) === 0xb && m.u16(s + 1) !== 1) T = Math.max(T, m.s32(s + 3)); }
      const eu = m.s32(a + 0x1db), euR = eu > -1 ? m.s16(m.u32(0xae23d0) + 0x6b * eu + 0x69) : -1;
      let sq2 = 0; for (let k = 0; k < 50; k++) { const p = m.u32(a + 0xd7 + 4 * k); if (p && m.s32(p) < nS) sq2++; }
      const b77 = m.s32(a + 0x77), dv = dvp ? m.s16(dvp + 0x69) : -1;
      const Tc = clubStrength({ rep, minAtt: b77, status: m.u8(a + 0x64), leagueRep: dv, leagueActive: true, euroRep: eu > -1 ? euR : null, squadCount: sq2, finance: financeStatus(bal, rep) }).T;
      O.set(`${n}|${d}`, { eu: euR, sq2, Tc, rep, b77, st: m.u8(a + 0x64), dv, sq: sq.get(a) ?? 0, bal, fin: financeStatus(bal, rep), T });
    }
  }
}
if (!process.env.ONLY_ORACLE) {
  const { createGame } = await import('../src/game/newgame');
  const { continueGame, quickPlayUserMatch } = await import('../src/game/sim');
  const { gs } = await import('../src/game/state');
  const { fromRow } = await import('../src/game/cmSquadPlanGame');
  const { clubRepMem } = await import('../src/game/cmPlayerData');
  const { clubDivRep } = await import('../src/game/cmPlayerData');
  const { cmGbp } = await import('../src/game/cmMoney');
  const { squad } = await import('../src/game/state');
  const { cmGenerated } = await import('../src/game/cmPlayerData');
  const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
  const eng = w.nations.findIndex((x) => x.name === 'England');
  createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  let g = gs();
  const last = DATES[DATES.length - 1];
  for (;;) {
    const d = g.date.slice(0, 10);
    if (DATES.includes(d)) for (const c of Object.values(g.clubs)) {
      if (!CLUBS.includes(c.name) || c.nation !== eng) continue;
      const rep = clubRepMem(g, c.id), bal = Math.round(c.balance * cmGbp(g, c.id));
      const [st, b77] = g.cmClubStat?.[c.id] ?? [1, 0];
      let T = 0; for (const s of (g.cmPlan?.[c.id]?.s ?? []).map(fromRow)) if (s.role === 0xb && s.mask !== 1) T = Math.max(T, s.b3 ?? 0);
      const sq = Object.values(g.players).filter((p) => p.club === c.id).length;
      const sq2 = squad(c.id).filter((p) => !cmGenerated(g, p)).length, lo = Object.values(g.players).filter((p) => p.loan?.from === c.id).length;
      const gen = squad(c.id).filter((p) => cmGenerated(g, p)).length;
      U.set(`${c.name}|${d}`, { eu: lo * 100 + gen, sq2, rep, b77, st, dv: clubDivRep(g, c.id) ?? -1, sq, bal, fin: financeStatus(bal, rep), T });
    }
    if (d >= last) break;
    const r = continueGame(); if (r?.match) quickPlayUserMatch(); g = gs();
  }
}
const f = (r?: Row) => (r ? `${r.sq2 !== undefined ? `eu ${r.eu} sq2 ${r.sq2} Tc ${r.Tc} ` : ''}rep ${r.rep} 77 ${r.b77} st ${r.st} dv ${r.dv} sq ${r.sq} fin ${r.fin} (£${(r.bal / 1e6).toFixed(2)}M) T ${r.T}` : '-');
for (const c of CLUBS) { console.log(`== ${c}`); for (const d of DATES) console.log(`  ${d} O ${f(O.get(`${c}|${d}`)).padEnd(62)} V ${f(U.get(`${c}|${d}`))}`); }
