// Målfordelingen i de engelske rækker (Premier League + Division 1-3) i en spillet sæson med den originale database i ægte tilstand,
// og tiden pr. Continue Game-uge. Sammenlign med originalen (oraklets fixtures_<år>.tmp: Div 1 3,10 · Div 2 2,89 · Div 3 3,12 mål).
//   npx tsx scripts/lower-divs.ts [frø = 11] [klub = Man Utd] [slutdato = 2002-05-20]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';

const seed = Number(process.argv[2] ?? 11), clubName = process.argv[3] ?? 'Man Utd', until = process.argv[4] ?? '2002-05-20';
const world = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world-original.json', 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
const club = world.clubs.find((c) => c[1] === clubName || c[2] === clubName)![0];
createGame(world, { managerName: 'Lab', managerNation: eng, clubId: club, activeNations: [eng], lang: 'en', masking: true, seed, mode: 'authentic' });
const g = gs();
const t0 = Date.now();
const weeks: number[] = [];
let wk = Date.now(), wkStart = g.date;
while (g.date < until) {
  const r = continueGame();
  if (r.match !== undefined) quickPlayUserMatch();
  if (Date.parse(g.date) - Date.parse(wkStart) >= 7 * 864e5) { weeks.push(Date.now() - wk); wk = Date.now(); wkStart = g.date; }
}
const secs = (Date.now() - t0) / 1000;
weeks.sort((a, b) => a - b);
console.log(`frø ${seed}, ${clubName}: ${g.date} på ${secs.toFixed(0)} s · uge median ${weeks[weeks.length >> 1]} ms, 90 % ${weeks[Math.floor(weeks.length * 0.9)]} ms, max ${weeks[weeks.length - 1]} ms`);
for (const tier of [1, 2, 3, 4]) {
  const lg = Object.values(g.comps).find((c) => c.type === 'league' && c.tier === tier && g.nations[c.nation]?.name === 'England');
  if (!lg) continue;
  const res = Object.values(g.fixtures).filter((f) => f.comp === lg.id && f.result).map((f) => f.result!);
  const n = res.length, tot = res.map((r) => r.hg + r.ag);
  const pct = (x: number) => ((100 * x) / Math.max(1, n)).toFixed(0);
  const pct2 = (x: number) => ((100 * x) / Math.max(1, n)).toFixed(2);
  console.log(`${lg.name.padEnd(28)} ${String(n).padStart(4)} kampe · mål ${(tot.reduce((s, x) => s + x, 0) / Math.max(1, n)).toFixed(2)} · H/U/B ${pct(res.filter((r) => r.hg > r.ag).length)}/${pct(res.filter((r) => r.hg === r.ag).length)}/${pct(res.filter((r) => r.hg < r.ag).length)}`
    + ` · 7+ ${pct2(tot.filter((x) => x >= 7).length)} % · 10+ ${pct2(tot.filter((x) => x >= 10).length)} % · max ${Math.max(...tot)}`);
}
