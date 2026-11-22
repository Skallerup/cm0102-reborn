// K7: trupplanerne (0x83cb40, Shortlist_Manager [[0xde1f54]+0x856] +0xdc) for engelske non-league-klubber (Conference og under) mod oraklet.
// Pr. klub: posten findes, tilstand +4, tæller +8, spillerpladser, mål (+0xf ≥ 0), mål uden for klubben, klubløse mål, budget +7, truppen.
//   ONLY_ORACLE=1 npx tsx scripts/k7-nl-plan.ts                        (kun oraklet)
//   WORLD=<world-dbs2.json> OUT=<fil.json> npx tsx scripts/k7-nl-plan.ts  (begge; DATES=2001-07-21,2002-09-08,2002-12-29)
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import { getContract } from '../src/game/cmMem';
import type { SparseMem } from '../src/game/cmMem';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { fromRow } from '../src/game/cmSquadPlanGame';
import { cmInMemory } from '../src/game/cmRetire';
import type { GameState } from '../src/game/types';
import { cmGbp } from '../src/game/cmMoney';

const DATES = (process.env.DATES ?? '2001-07-21,2002-09-08,2002-12-29').split(',');
const Y23 = `${homedir()}/cm0102-engine/oracle/daysnap/s1-3.9.60-y23-e14`;
const LEAGUE = new Set(['English Premier Division', 'English First Division', 'English Second Division', 'English Third Division']);
interface CRow { name: string; div: string; rep: number; entry: boolean; st: number; cnt: number; slots: number; tgt: number; ext: number; free: number; own: number; open: number; b7: number; sq: number; staffT: number; bal?: number; wb?: number; tb?: number }
const str = (m: SparseMem, a: number, n = 54) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };

function oracle(m: SparseMem): CRow[] {
  const C = m.u32(0xae23b4), nc = m.s32(0xae235c), S = m.u32(0xae23bc), n = m.s32(0xae2364);
  const slm = m.u32(m.u32(0xde1f54) + 0x856);
  const sq = new Map<number, number>();
  for (let id = 0; id < n; id++) {
    const st = S + 0x6e * id;
    if (!m.u32(st + 0x61) || m.u8(st + 0x3d) === 16) continue;
    const k = getContract(m, st);
    if (k) { const c = m.s32(k + 4); sq.set(c, (sq.get(c) ?? 0) + 1); }
  }
  const out: CRow[] = [];
  for (let ix = 0; ix < nc; ix++) {
    const a = C + 0x245 * ix;
    if (str(m, m.u32(a + 0x53) + 4) !== 'England') continue;
    const dv = m.u32(a + 0x57), div = dv ? str(m, dv + 4) : '';
    if (LEAGUE.has(div)) continue;
    const ent = m.u32(slm + 0xdc) + 9 * ix, base = m.u32(ent);
    const f = m.u32(m.u32(0xae2a38)) + 0x167 * ix;
    const r: CRow = { name: str(m, a + 4), div, rep: m.s16(a + 0x80), entry: !!base, st: m.u8(ent + 4), cnt: m.u8(ent + 8), slots: 0, tgt: 0, ext: 0, free: 0, own: 0, open: 0, b7: 0, sq: sq.get(ix) ?? 0, staffT: 0,
      bal: m.u32(f) + m.s32(f + 4) * 4294967296, wb: m.s32(f + 0xc) };
    if (base) for (let i = 0; i < 40; i++) {
      const s = base + 0x25 * i, role = m.u8(s);
      if (role === 0 || role === 0xff) continue;
      const t = m.s32(s + 0xf);
      if (role !== 0xb) { if (t >= 0) r.staffT++; continue; }
      r.slots++;
      r.b7 += m.s32(s + 7);
      if (t < 0) { if (m.s32(s + 0x13) < 0) r.open++; continue; }
      r.tgt++;
      const k = getContract(m, S + 0x6e * t);
      if (!k) r.free++;
      else if (m.s32(k + 4) !== ix) r.ext++;
      else r.own++;
    }
    out.push(r);
  }
  return out;
}
let g!: GameState;
function ours(): CRow[] {
  const eng = g.nations.findIndex((x) => x.name === 'England');
  const sq = new Map<number, number>();
  for (const p of Object.values(g.players)) if (!p.virtual && p.club && cmInMemory(g, p)) sq.set(p.club, (sq.get(p.club) ?? 0) + 1);
  const out: CRow[] = [];
  for (const c of Object.values(g.clubs)) {
    if (c.nation !== eng) continue;
    const lg = g.leagues[c.league];
    const div = lg?.hidden ? (lg?.name ?? '') : g.comps[c.league]?.name ?? lg?.name ?? '';
    if (LEAGUE.has(div)) continue;
    const st = g.cmPlan?.[c.id];
    const r: CRow = { name: c.name, div, rep: g.cmClubRep?.[c.id] ?? Math.round(c.rep * 100), entry: !!st, st: st?.st ?? 0, cnt: st?.c ?? 0, slots: 0, tgt: 0, ext: 0, free: 0, own: 0, open: 0, b7: 0, sq: sq.get(c.id) ?? 0, staffT: 0,
      bal: Math.round(c.balance * cmGbp(g, c.id)), wb: g.cmFin?.[c.id]?.wb ?? 0, tb: Math.round((c.transferBudget ?? 0) * cmGbp(g, c.id)) };
    if (st) for (const s of st.s.map(fromRow)) {
      if (s.role === 0 || s.role === 0xff) continue;
      if (s.role !== 0xb) { if (s.f >= 0) r.staffT++; continue; }
      r.slots++;
      r.b7 += s.b7 ?? 0;
      if (s.f < 0) { if (s.s13 < 0) r.open++; continue; }
      r.tgt++;
      const p = g.players[s.f];
      if (!p || !p.club) r.free++;
      else if (p.club !== c.id) r.ext++;
      else r.own++;
    }
    out.push(r);
  }
  return out;
}
function summary(tag: string, rows: CRow[]): string {
  const by = new Map<string, CRow[]>();
  for (const r of rows) (by.get(r.div) ?? by.set(r.div, []).get(r.div)!).push(r);
  const lines = [`${tag}: klubber ${rows.length}, med post ${rows.filter((r) => r.entry).length}`];
  for (const [div, rs] of [...by].sort((a, b) => b[1].length - a[1].length)) {
    const s = (f: (r: CRow) => number) => rs.reduce((x, r) => x + f(r), 0);
    lines.push(`  ${div || '(ingen)'}: n=${rs.length} post=${s((r) => +r.entry)} st0/1/2=${s((r) => +(r.st === 0))}/${s((r) => +(r.st === 1))}/${s((r) => +(r.st === 2))} pladser=${s((r) => r.slots)} mål=${s((r) => r.tgt)} (egen ${s((r) => r.own)} ude ${s((r) => r.ext)} klubløs ${s((r) => r.free)}) åbne=${s((r) => r.open)} stabsmål=${s((r) => r.staffT)} b7=${s((r) => r.b7)} trup=${s((r) => r.sq)} rep∅=${Math.round(s((r) => r.rep) / rs.length)} saldo∅=${Math.round(s((r) => r.bal ?? 0) / rs.length)} wb∅=${Math.round(s((r) => r.wb ?? 0) / rs.length)}`);
  }
  return lines.join('\n');
}
const res: Record<string, { o: CRow[]; u?: CRow[] }> = {};
const ix1 = readDaySnapIndex(DEFAULT_DAYSNAP)!, ix2 = readDaySnapIndex(Y23)!;
const ent = (iso: string) => { const e = ix1.snaps.find((x) => x.iso === iso); if (e) return loadDaySnap(ix1, e); const f = ix2.snaps.find((x) => x.iso === iso); if (!f) throw new Error(`intet billede ${iso}`); return loadDaySnap(ix2, f); };
if (!process.env.ONLY_ORACLE) {
  const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
  const eng = w.nations.findIndex((x) => x.name === 'England');
  createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  g = gs();
}
for (const d of DATES) {
  const o = oracle(ent(d));
  res[d] = { o };
  console.log(summary(`ORAKLET ${d}`, o));
  if (!process.env.ONLY_ORACLE) {
    const prev = new Date(Date.parse(d) - 86400000).toISOString().slice(0, 10);
    while (g.date <= prev || g.pendingFixture) { const r = continueGame(); if (r?.match) quickPlayUserMatch(); }
    res[d].u = ours();
    console.log(summary(`VORES ${g.date}`, res[d].u!));
  }
}
if (process.env.OUT) writeFileSync(process.env.OUT, JSON.stringify(res));
