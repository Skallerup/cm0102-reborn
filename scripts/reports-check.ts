// Kontrol af spillernes fejlrapporter (#6 assists, #7/#15/#16 egenskaber 20/1):
// MODE=authentic ENGINE=original npx tsx scripts/reports-check.ts <sæsoner> <world-fil>
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { ageOn } from '../src/game/dates';
import { naturalRole, A } from '../src/game/attributes';

const seasons = Number(process.argv[2] ?? 3);
const world = JSON.parse(readFileSync(process.argv[3] ?? 'public/data/world-original.json', 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
const user = world.clubs.find((c) => c[3] === eng)![0];
createGame(world, { managerName: 'R', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: 11, mode: process.env.MODE === 'authentic' ? 'authentic' : undefined });
const g = gs();
if (process.env.ENGINE === 'original') g.options.engine = 'original';
const PHYS = ['acceleration', 'agility', 'balance', 'jumping', 'naturalFitness', 'pace', 'stamina', 'strength'] as const;
const userLeague = g.clubs[user].league;

function attrReport(label: string) {
  const ps = Object.values(g.players).filter((p) => p.club && !(g.clubs[p.club] as any)?.hidden);
  const age = (p: (typeof ps)[0]) => ageOn(p.dob, g.date);
  const old = ps.filter((p) => age(p) >= 33 && age(p) <= 35);
  const low = (p: (typeof ps)[0], t: number) => PHYS.filter((k) => p.attrs[A[k]] <= t).length;
  const pace1 = old.filter((p) => p.attrs[A.pace] <= 1.5).length;
  const avgPace = old.reduce((s, p) => s + p.attrs[A.pace], 0) / Math.max(1, old.length);
  const avgPhysLow = old.reduce((s, p) => s + low(p, 3), 0) / Math.max(1, old.length);
  const pc = old.filter((p) => low(p, 1.5) >= 4).length;
  const mid = ps.filter((p) => age(p) >= 29 && age(p) <= 31);
  const midPace = mid.reduce((s, p) => s + p.attrs[A.pace], 0) / Math.max(1, mid.length);
  const top = ps.filter((p) => p.ca >= 140);
  const t20 = (p: (typeof ps)[0], ks: string[]) => ks.filter((k) => p.attrs[(A as any)[k]] >= 19.5).length;
  const defs = top.filter((p) => /^(CB|FB|DM)$/.test(String(naturalRole(p))));
  const mids = top.filter((p) => /^(CM|AM|WM|W)$/.test(String(naturalRole(p))));
  const d3 = defs.filter((p) => t20(p, ['tackling', 'heading', 'marking']) >= 2).length;
  const m3 = mids.filter((p) => t20(p, ['dribbling', 'technique', 'passing']) >= 2).length;
  console.log(`${label} ATTR 33-35: n=${old.length} pace<=1,5: ${pace1} · snit pace ${avgPace.toFixed(1)} · snit antal fysiske ≤3: ${avgPhysLow.toFixed(2)} · >=4 fysiske ≤1,5: ${pc} | 29-31 snit pace ${midPace.toFixed(1)} | CA140+ forsvar ${defs.length}: >=2 af tackl/hoved/mark =20: ${d3} · midt ${mids.length}: >=2 af drib/tekn/afl =20: ${m3} (roller ${[...new Set(top.map((p) => String(naturalRole(p))))].join(',')})`);
}
function assistReport(season: number) {
  const byClub: Record<number, { a: number; g: number; top: number }> = {};
  let maxA = 0, maxName = '';
  for (const p of Object.values(g.players)) {
    const h = p.history.find((l) => l.season === season && l.club);
    if (!h) continue;
    const e = (byClub[h.club] ??= { a: 0, g: 0, top: 0 });
    e.a += h.assists; e.g += h.goals;
    if (h.assists > e.top) e.top = h.assists;
    if (h.assists > maxA) { maxA = h.assists; maxName = `${p.first} ${p.last} (${h.apps} k, ${h.goals} mål)`; }
  }
  const rows = Object.entries(byClub).filter(([id]) => g.clubs[Number(id)]?.league === userLeague);
  const shares = rows.map(([, e]) => e.top / Math.max(1, e.g));
  const tops = rows.map(([, e]) => e.top).sort((a, b) => a - b);
  const sa = rows.reduce((s, [, e]) => s + e.a, 0), sg = rows.reduce((s, [, e]) => s + e.g, 0);
  console.log(`ASSIST sæson ${season}: max ${maxA} ${maxName} · ligahold: topassister median ${tops[tops.length >> 1]} max ${tops[tops.length - 1]} · topassister/holdets mål gns ${(shares.reduce((a, b) => a + b, 0) / Math.max(1, shares.length)).toFixed(2)} max ${Math.max(0, ...shares).toFixed(2)} · assists/mål ${(sa / Math.max(1, sg)).toFixed(2)}`);
}
attrReport('start');
let last = g.season, days = 0;
const end = g.season + seasons;
while (g.season < end && days++ < 400 * seasons) {
  const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch();
  if (g.season !== last) { assistReport(last); last = g.season; attrReport(`s${g.season}`); }
}
