// Nedbrud aa97721d7bdd7bc0 (28/11): pickTaker → undefined i gittermotorens genstart. Ny 2026/27-karriere (ægte tilstand, England valgt),
// spil til TIL (standard 2026-07-20) og vis hver menneskekamps trupper før kampen.
// npx tsx scripts/repro-empty-side.ts [klub] [frø] [til]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, prepareMatch, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';

const w = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world.json', 'utf8')) as WorldData;
if (!process.env.WORLD) Object.assign(w, JSON.parse(readFileSync('public/data/world-cm.json', 'utf8')));
const eng = w.nations.findIndex((x) => x.name === (process.env.NAT ?? 'England'));
const name = process.argv[2] ?? 'Blackburn';
const until = process.argv[4] ?? '2026-07-20';
const [s0, s1] = (process.argv[3] ?? '1').split('-').map(Number);
for (let seed = s0; seed <= (s1 ?? s0); seed++) {
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === name || c[2] === name)![0], activeNations: [eng], lang: 'en', masking: true,
  seed, mode: 'authentic' });
const g = gs();
console.log('frø', seed);
let days = 0;
while (g.date < until && days++ < 120) {
  const r = continueGame();
  if (r.match !== undefined) {
    const f = g.fixtures[g.pendingFixture!];
    const m = prepareMatch(f);
    const opp = f.home === g.userClub ? f.away : f.home;
    console.log(`${g.date} ${g.clubs[f.home]?.name} - ${g.clubs[f.away]?.name} (${f.comp}): hjemme ${m.home.players.size}/${m.home.tactic.lineup.filter(Boolean).length}, ude ${m.away.players.size}/${m.away.tactic.lineup.filter(Boolean).length}; modstander ${g.clubs[opp]?.name} land ${g.nations[g.clubs[opp]?.nation]?.name}`);
    try { quickPlayUserMatch(); } catch (e) { console.log('NEDBRUD', (e as Error).stack?.split('\n').slice(0, 6).join('\n')); process.exit(1); }
  }
}
console.log('slut', g.date);
}
