// (runde 9) En hel sæson i SPILLET med gittermotoren (Options.engine = 'original', ægte tilstand, den originale database, England): alle
// kampe går gennem adapteren og spillets egne inddata (gameInputs.ts – tilskuertallet, tabellen, staffState …). Til sidst Premier Leagues tal.
//   npx tsx scripts/grid-season.ts [frø = 1] [slutdato = 2002-05-20] [klub = Wrexham]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';

const seed = Number(process.argv[2] ?? 1), until = process.argv[3] ?? '2002-05-20', clubName = process.argv[4] ?? 'Wrexham';
const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
createGame(world, { managerName: 'Lab', managerNation: eng, clubId: world.clubs.find((c) => c[1] === clubName)![0], activeNations: [eng], lang: 'en', masking: true, seed, mode: 'authentic' });
const g = gs();
g.options.engine = 'original';
const t0 = Date.now();
while (g.date < until) { const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); }
const epl = Object.values(g.comps).find((c) => c.type === 'league' && c.tier === 1 && g.nations[c.nation]?.name === 'England')!;
const res = Object.values(g.fixtures).filter((f) => f.comp === epl.id && f.result).map((f) => f.result!);
const n = res.length, goals = res.reduce((s, r) => s + r.hg + r.ag, 0);
const hw = res.filter((r) => r.hg > r.ag).length, dr = res.filter((r) => r.hg === r.ag).length;
const pct = (x: number) => Math.round((100 * x) / Math.max(1, n));
console.log(`frø ${seed}: ${n} Premier League-kampe til ${g.date} (${((Date.now() - t0) / 1000).toFixed(0)} s): mål ${(goals / Math.max(1, n)).toFixed(2)} · H/U/B ${pct(hw)}/${pct(dr)}/${pct(n - hw - dr)} · hjemme/ude ${(res.reduce((s, r) => s + r.hg, 0) / n).toFixed(2)}/${(res.reduce((s, r) => s + r.ag, 0) / n).toFixed(2)}`);
