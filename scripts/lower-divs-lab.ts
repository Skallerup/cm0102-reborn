// Hurtig måling af zonemotoren i de engelske rækker (uden resten af spillet): opret et spil med den originale database i ægte tilstand
// og spil alle ligakampe i Premier League + Division 1-3 direkte med simulateFixture (zonemotoren – gittermotoren slås fra).
//   npx tsx scripts/lower-divs-lab.ts [frø = 11] [gentagelser = 1]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { prepareMatch, simulateFixture } from '../src/game/sim';
import { matchLevel } from '../src/game/engine/match';
const lv: Record<number, number[]> = {};

const seed = Number(process.argv[2] ?? 11), reps = Number(process.argv[3] ?? 1);
const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
const out: Record<number, number[][]> = {};
for (let k = 0; k < reps; k++) {
  createGame(world, { managerName: 'Lab', managerNation: eng, clubId: world.clubs.find((c) => c[2] === 'Man Utd')![0], activeNations: [eng], lang: 'en', masking: true, seed: seed + k, mode: 'authentic' });
  const g = gs();
  g.options.engine = 'zone';
  for (const tier of [1, 2, 3, 4]) {
    const lg = Object.values(g.comps).find((c) => c.type === 'league' && c.tier === tier && g.nations[c.nation]?.name === 'England')!;
    for (const f of Object.values(g.fixtures).filter((x) => x.comp === lg.id).sort((a, b) => a.date.localeCompare(b.date))) {
      // uden dagene imellem: frisk kondition før hver kamp (ellers spiller holdene 46 kampe i træk og bliver mere og mere trætte)
      for (const c of [f.home, f.away]) for (const p of squad(c)) p.condition = 100;
      g.date = f.date;
      if (process.env.LEVELS) { const m = prepareMatch(f); (lv[tier] ??= []).push(matchLevel(m.home, m.away)); }
      const r = simulateFixture(f);
      (out[tier] ??= []).push([r.stats[0].goals, r.stats[1].goals]);
    }
  }
}
for (const tier of [1, 2, 3, 4]) {
  const res = out[tier], n = res.length, tot = res.map(([h, a]) => h + a);
  const pct = (x: number) => ((100 * x) / n).toFixed(0), pct2 = (x: number) => ((100 * x) / n).toFixed(2);
  console.log(`tier ${tier} ${n} kampe · mål ${(tot.reduce((s, x) => s + x, 0) / n).toFixed(2)} · H/U/B ${pct(res.filter(([h, a]) => h > a).length)}/${pct(res.filter(([h, a]) => h === a).length)}/${pct(res.filter(([h, a]) => h < a).length)}`
    + (lv[tier] ? ` · niveau ${(lv[tier].reduce((a, b) => a + b, 0) / lv[tier].length).toFixed(2)}` : '')
    + ` · 7+ ${pct2(tot.filter((x) => x >= 7).length)} % · 10+ ${pct2(tot.filter((x) => x >= 10).length)} % · max ${Math.max(...tot)}`);
}
{
  const all = [2, 3, 4].flatMap((t) => out[t]);
  const tot: Record<number, number> = {}, diff: Record<number, number> = {};
  for (const [h, a] of all) { tot[h + a] = (tot[h + a] ?? 0) + 1; diff[Math.abs(h - a)] = (diff[Math.abs(h - a)] ?? 0) + 1; }
  console.log(`Division 1–3, ${all.length} kampe · mål i alt`, JSON.stringify(tot), '· målforskel', JSON.stringify(diff));
}
console.log('10+:', [1, 2, 3, 4].flatMap((t) => out[t].filter(([h, a]) => h + a >= 10).map(([h, a]) => `T${t} ${h}-${a}`)).join(', '));
