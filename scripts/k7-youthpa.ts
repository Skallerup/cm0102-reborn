// K7: unge spilleres CA/PA (spillerposten +5/+7) i de engelske divisioner ved spilstart – oraklets dagsbillede mod spillet (createGame, frø 1).
// DB'ens tilfældige PA (−1/−2/…) trækkes ved spilstart; afviger fordelingen, vurderer ønskelisterne (0x840d80 → 0x6e6340/0x6e86d0) de unge anderledes.
//   WORLD=<world-dbs2.json> [D=2001-07-14] [AGE=21] npx tsx scripts/k7-youthpa.ts
import { readFileSync } from 'node:fs';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import { getContract, G, type CmMem } from '../src/game/cmMem';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';

const D = process.env.D ?? '2001-07-14', AGE = +(process.env.AGE ?? 21);
const TIER: Record<string, string> = { 'English Premier Division': 'P', 'English First Division': '1', 'English Second Division': '2', 'English Third Division': '3' };
const str = (m: CmMem, a: number, n = 54) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
type R = { ca: number; pa: number };
const O: Record<string, R[]> = {}, U: Record<string, R[]> = {};
{
  const ix = readDaySnapIndex(DEFAULT_DAYSNAP)!;
  const e = ix.snaps.find((x) => x.iso === D)!;
  const m = loadDaySnap(ix, e);
  const C = m.u32(G.CLUBS), S = m.u32(G.STAFF), n = m.s32(G.STAFF_COUNT), y = +D.slice(0, 4);
  for (let id = 0; id < n; id++) {
    const st = S + 0x6e * id, rec = m.u32(st + 0x61); if (!rec) continue;
    const k = getContract(m, st); if (!k) continue;
    const cl = C + 0x245 * m.s32(k + 4);
    if (str(m, m.u32(cl + 0x53) + 4) !== 'England') continue;
    const dv = m.u32(cl + 0x57), gr = TIER[dv ? str(m, dv + 4) : ''] ?? 'NL';
    const age = y - m.u16(st + 0x12);
    if (age > AGE) continue;
    (O[gr] ??= []).push({ ca: m.s16(rec + 5), pa: m.s16(rec + 7) });
  }
}
{
  const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
  const eng = w.nations.findIndex((x) => x.name === 'England');
  createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  const g = gs(), y = +D.slice(0, 4);
  for (const p of Object.values(g.players)) {
    const cid = p.loan?.from ?? p.club; const c = g.clubs[cid]; if (!c || c.nation !== eng || !p.contract) continue;
    const gr = TIER[g.comps[c.league]?.name ?? g.leagues[c.league]?.name ?? ''] ?? 'NL';
    if (y - +p.dob.slice(0, 4) > AGE) continue;
    (U[gr] ??= []).push({ ca: p.ca, pa: p.pa });
  }
}
const q = (a: number[], p: number) => { const s = [...a].sort((x, z) => x - z); return s.length ? s[Math.floor(p * (s.length - 1))] : NaN; };
const f = (a: R[] = []) => `n ${a.length} CA p50 ${q(a.map((x) => x.ca), 0.5)} PA p25/50/75/90 ${[0.25, 0.5, 0.75, 0.9].map((p) => q(a.map((x) => x.pa), p)).join('/')} PA−CA p50 ${q(a.map((x) => x.pa - x.ca), 0.5)} PA≥120 ${a.filter((x) => x.pa >= 120).length} PA=CA ${a.filter((x) => x.pa === x.ca).length} PA≤CA+5 ${a.filter((x) => x.pa <= x.ca + 5).length}`;
for (const gr of ['P', '1', '2', '3', 'NL']) console.log(`${gr}: orakel ${f(O[gr])}\n   spil   ${f(U[gr])}`);
