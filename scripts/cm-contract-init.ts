// Spilstartens kontrakter 0x85e960 (src/game/cmContractInit.ts): originalens tal ved spilstarten 14/7-2001 (øjebliksbilledet
// ~/cm0102-engine/work-r3/snap-start/pre-194-2001.bin, frø 1, 3.9.60, England spilbart) mod vores nye spil (samme database, England).
//   npx tsx scripts/cm-contract-init.ts [snap] [frø]
// Tæller de engelske klubbers spillere med mål-/assist-/clean sheet-bonus, klausulerne +0x1c..+0x20 og deltid (+0x35 bit 7).
import { readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { loadSnap } from './ct-snap';
import { G, getContract } from '../src/game/cmMem';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';

const snap = process.argv[2] ?? `${homedir()}/cm0102-engine/work-r3/snap-start/pre-194-2001.bin`;
const seed = +(process.argv[3] ?? 1);
const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((n) => n.name === 'England');
const engClubs = new Set(w.clubs.filter((c) => c[3] === eng).map((c) => String(c[1])));

interface Row { wage: number; b: [number, number, number]; cl: number[]; pt: boolean; club: string }
const sum = (name: string, rows: Row[]) => {
  const n = rows.length, pct = (k: number) => `${k} (${((100 * k) / Math.max(1, n)).toFixed(1)} %)`;
  const med = (a: number[]) => { a.sort((x, y) => x - y); return a.length ? a[Math.floor(a.length / 2)] : 0; };
  console.log(`${name}: ${n} spillere, ugeløn median £${med(rows.map((r) => r.wage))}, målscorernes løn median £${med(rows.filter((r) => r.b[0] > 0).map((r) => r.wage))}`);
  console.log(`  målbonus ${pct(rows.filter((r) => r.b[0] > 0).length)} median £${med(rows.filter((r) => r.b[0] > 0).map((r) => r.b[0]))} · assist ${pct(rows.filter((r) => r.b[1] > 0).length)} · clean sheet ${pct(rows.filter((r) => r.b[2] > 0).length)} · deltid ${pct(rows.filter((r) => r.pt).length)}`);
  console.log(`  klausuler: ${['Non Promotion', 'Min Fee', 'Non Playing', 'Relegation', 'Manager Job'].map((s, i) => `${s} ${rows.filter((r) => r.cl[i]).length}`).join(' · ')}`);
  if (tierOf) console.log(`  pr. række (Non Promotion/Relegation): ${[1, 2, 3, 4, 9].map((t) => `${t}: ${rows.filter((r) => tierOf!(r.club) === t && r.cl[0]).length}/${rows.filter((r) => tierOf!(r.club) === t && r.cl[3]).length}`).join(' · ')}`);
};
let tierOf: ((club: string) => number) | null = null;

let origRows: Row[] | null = null;
if (existsSync(snap)) {
  const m = loadSnap(snap);
  const nStaff = m.s32(G.STAFF_COUNT), rows: Row[] = [];
  for (let id = 0; id < nStaff; id++) {
    const st = (m.u32(G.STAFF) + 0x6e * id) >>> 0;
    if (m.u8(st + 0x3d) !== 0xb || !m.u32(st + 0x61)) continue;
    const club = m.u32(st + 0x39);
    if (!club) continue;
    let nm = ''; for (let i = 4; i < 4 + 50; i++) { const c = m.u8(club + i); if (!c) break; nm += String.fromCharCode(c); }
    if (!engClubs.has(nm)) continue;
    const k = getContract(m, st);
    if (!k) continue;
    rows.push({ wage: m.s32(k + 0xc), b: [m.s32(k + 0x10), m.s32(k + 0x14), m.s32(k + 0x18)], cl: [0, 1, 2, 3, 4].map((i) => m.u8(k + 0x1c + i)), pt: (m.u8(k + 0x35) & 0x80) !== 0, club: nm });
  }
  origRows = rows;
} else console.log(`(intet øjebliksbillede: ${snap})`);

createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed, mode: 'authentic' });
const g = gs();
const byName = new Map(Object.values(g.clubs).map((c) => [c.name, c]));
tierOf = (nm) => { const c = byName.get(nm); return c ? g.leagues[c.league]?.hidden ? 9 : g.leagues[c.league]?.tier ?? 9 : 9; };
const ours: Row[] = Object.values(g.players).filter((p) => p.contract && !p.regen && g.clubs[p.loan?.from ?? p.club]?.nation === eng).map((p) => {
  const c = p.contract!;
  return { wage: Math.round(c.wage * 0.86), b: c.cmBonusGbp ?? [-1, -1, -1], cl: c.cmClauses ?? [0, 0, 0, 0, 0], pt: !!c.partTime, club: g.clubs[p.loan?.from ?? p.club].name };
});
sum('vores spil', ours);
if (origRows) sum('originalen 14/7-2001', origRows);
if (process.env.DBW) {
  const F = Object.fromEntries(w.playerFields.map((f, i) => [f, i]));
  const ids = new Set(Object.values(g.players).filter((p) => p.contract && !p.regen && g.clubs[p.loan?.from ?? p.club]?.nation === eng).map((p) => p.id));
  const a = w.players.filter((r) => ids.has(r[F.id] as number)).map((r) => (r[F.wage] as number) || 0);
  const nz = a.filter((x) => x > 0).sort((x, y) => x - y);
  console.log(`databasens løn: ${nz.length}/${a.length} sat, median £${nz[Math.floor(nz.length / 2)]}`);
  if (origRows) { const o = origRows.map((r) => r.wage).sort((x, y) => x - y); console.log(`originalen: løn −1: ${o.filter((x) => x < 0).length}, 10/50/90 %: ${[0.1, 0.5, 0.9].map((q) => o[Math.floor(q * o.length)]).join('/')}`); }
  const our = [...ids].map((id) => Math.round(g.players[id].contract!.wage * 0.86)).sort((x, y) => x - y);
  console.log(`vores 10/50/90 %: ${[0.1, 0.5, 0.9].map((q) => our[Math.floor(q * our.length)]).join('/')}, databasens 10/50/90 %: ${[0.1, 0.5, 0.9].map((q) => nz[Math.floor(q * nz.length)]).join('/')}`);
}
