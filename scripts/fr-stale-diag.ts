// Diagnose: uspillede venskabskampe (MODERN_PARITY H) – hvilke klubber/lande/datoer, og hvorfor de ikke spilles.
//   [ALL=1] [WORLD=original] npx tsx scripts/fr-stale-diag.ts [til-dato] [klub] [frø]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs, fixturesOn } from '../src/game/state';

const orig = process.env.WORLD === 'original';
const until = process.argv[2] ?? (orig ? '2001-09-30' : '2026-09-30');
const w = JSON.parse(readFileSync(orig ? 'public/data/world-original.json' : 'public/data/world.json', 'utf8')) as WorldData;
if (!orig) Object.assign(w, JSON.parse(readFileSync('public/data/world-cm.json', 'utf8')));
const eng = w.nations.findIndex((x) => x.name === 'England');
const name = process.argv[3] ?? (orig ? 'Arsenal' : 'Brentford');
const club = w.clubs.find((c) => c[1] === name || c[2] === name);
if (!club) throw new Error(`klub ${name}?`);
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: club[0], activeNations: process.env.ALL ? [...new Set(w.leagues.filter((l) => !l.hidden).map((l) => l.nation))] : [eng], lang: 'en', masking: true,
  seed: Number(process.argv[4] ?? 1), mode: 'authentic' });
const g = gs();
const start = g.date;
const fr0 = Object.values(g.fixtures).filter((f) => f.comp === 'FRIENDLY');
console.log(`start ${start} · venskabskampe ved start ${fr0.length} (før start: ${fr0.filter((f) => f.date < start).length}, heraf spillet i forkørslen ${fr0.filter((f) => f.date < start && f.result).length})`);
let days = 0;
while (g.date < until && days++ < 400) {
  const r = continueGame();
  if (r.match !== undefined) quickPlayUserMatch();
}
const fr = Object.values(g.fixtures).filter((f) => f.comp === 'FRIENDLY');
const stale = fr.filter((f) => !f.result && f.date < g.date);
console.log(`venskabskampe ${fr.length}, spillet ${fr.filter((f) => f.result).length}, uspillede før ${g.date}: ${stale.length}`);
const cnt = (xs: string[]) => { const o: Record<string, number> = {}; for (const x of xs) o[x] = (o[x] ?? 0) + 1; return Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, 25); };
console.log('pr. dato', JSON.stringify(cnt(stale.map((f) => f.date))));
console.log('før start', stale.filter((f) => f.date < start).length);
console.log('ikke i dagsindekset', stale.filter((f) => !fixturesOn(f.date).includes(f.id)).length);
const nat = (c: number) => g.nations[g.clubs[c]?.nation]?.name ?? `?${c}`;
console.log('hjemmeland', JSON.stringify(cnt(stale.map((f) => nat(f.home)))));
console.log('udeland', JSON.stringify(cnt(stale.map((f) => nat(f.away)))));
console.log('klub mangler', stale.filter((f) => !g.clubs[f.home] || !g.clubs[f.away]).length);
const dbl = (f: typeof stale[0]) => fixturesOn(f.date).some((id) => id !== f.id && [g.fixtures[id]?.home, g.fixtures[id]?.away].some((c) => c === f.home || c === f.away));
console.log('dobbeltbooket (samme dag)', stale.filter(dbl).length, '· blandt spillede', fr.filter((f) => f.result && dbl(f)).length);
for (const f of stale.slice(0, 12)) console.log(JSON.stringify({ id: f.id, d: f.date, h: g.clubs[f.home]?.name, a: g.clubs[f.away]?.name, hn: nat(f.home), an: nat(f.away), keys: Object.keys(f) }));
