// (17/11, MODERN_PARITY punkt 2) Premier League i spillet (ægte tilstand) med en CM-database – den originale 2001/02 eller 2026/27-opdateringen
// (world.json + world-cm.json) – på gittermotoren eller zonemotoren: mål, H/U/B, kort, skader og udskiftninger pr. kamp og tiden.
//   npx tsx scripts/grid-season-cm.ts <2001|2026> [frø = 1] [slutdato] [motor = original|zone] [klub]
// Standard: 2026 → slutdato 2026-12-31, klub Brentford FC; 2001 → 2001-12-31, Wrexham (begge ≈ halv sæson i Premier League).
import { existsSync, readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { unpackReport } from '../src/game/miniReport';
import type { MatchReport } from '../src/game/types';

const year = Number(process.argv[2] ?? 2026), seed = Number(process.argv[3] ?? 1);
const until = process.argv[4] || (year >= 2020 ? '2026-12-31' : '2001-12-31');
const engine = (process.argv[5] ?? 'original') as 'original' | 'zone';
const clubName = process.argv[6] ?? (year >= 2020 ? 'Brentford FC' : 'Wrexham');
const file = year >= 2020 ? 'public/data/world.json' : 'public/data/world-original.json';
const world = JSON.parse(readFileSync(file, 'utf8')) as WorldData & { cmRaw?: unknown };
// som ui/world.ts loadWorld: 2026/27's cmRaw ligger i world-cm.json
if (year >= 2020 && existsSync('public/data/world-cm.json') && !process.env.NO_CM) world.cmRaw = (JSON.parse(readFileSync('public/data/world-cm.json', 'utf8')) as { cmRaw: unknown }).cmRaw;
const eng = world.nations.findIndex((x) => x.name === 'England');
const t0 = Date.now();
createGame(world, { managerName: 'Lab', managerNation: eng, clubId: world.clubs.find((c) => c[1] === clubName)![0], activeNations: [eng], lang: 'en', masking: true, seed, mode: 'authentic' });
const g = gs();
g.options.engine = engine;
const t1 = Date.now();
let days = 0;
while (g.date < until) { const r = continueGame(); days++; if (r.match !== undefined) quickPlayUserMatch(); }
const t2 = Date.now();
const epl = Object.values(g.comps).find((c) => c.type === 'league' && c.tier === 1 && g.nations[c.nation]?.name === 'England')!;
const fx = Object.values(g.fixtures).filter((f) => f.comp === epl.id && f.result);
let goals = 0, hw = 0, dr = 0, yel = 0, red = 0, inj = 0, subs = 0, withRep = 0, hg = 0, ag = 0;
for (const f of fx) {
  const r = f.result!;
  goals += r.hg + r.ag; hg += r.hg; ag += r.ag;
  if (r.hg > r.ag) hw++; else if (r.hg === r.ag) dr++;
  const mini = g.miniReports?.[f.id];
  const rep: MatchReport | undefined = g.reports[f.id] ?? (mini ? unpackReport(mini, f.id, f.home, f.away) : undefined);
  if (!rep) continue;
  withRep++;
  for (const l of rep.players) { if (l.yellow) yel += Math.min(1, l.yellow); if (l.red) red++; if (l.injured) inj++; if (l.sub) subs++; }
}
const n = fx.length, pct = (x: number) => Math.round((100 * x) / Math.max(1, n)), per = (x: number) => (x / Math.max(1, withRep)).toFixed(2);
console.log(`${year} frø ${seed} motor ${engine} (${clubName}): ${n} Premier League-kampe til ${g.date} (rapporter ${withRep}) · mål ${(goals / Math.max(1, n)).toFixed(2)} (hjemme/ude ${(hg / n).toFixed(2)}/${(ag / n).toFixed(2)}) · H/U/B ${pct(hw)}/${pct(dr)}/${pct(n - hw - dr)}`);
console.log(`  pr. kamp: gule ${per(yel)} · røde ${per(red)} · skadet i kampen ${per(inj)} · indskiftede ${per(subs)}`);
console.log(`  tid: spilstart ${((t1 - t0) / 1000).toFixed(1)} s · ${days} dage ${((t2 - t1) / 1000).toFixed(0)} s (${((t2 - t1) / Math.max(1, days)).toFixed(0)} ms/dag)`);
