// Nedbrud aa97721d7bdd7bc0: hvilke klubber stiller et hold uden spillere (engineTeam tom eller opstillingen uden for truppen)?
// Ny karriere (ægte tilstand, England valgt), en kunstig venskabskamp mod hver klub.  npx tsx scripts/repro-empty-scan.ts [klub] [world-fil]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { prepareMatch } from '../src/game/sim';
import { gs, squad } from '../src/game/state';
import type { Fixture } from '../src/game/types';

const w = JSON.parse(readFileSync(process.argv[3] ?? 'public/data/world.json', 'utf8')) as WorldData;
if (!process.argv[3]) Object.assign(w, JSON.parse(readFileSync('public/data/world-cm.json', 'utf8')));
const eng = w.nations.findIndex((x) => x.name === 'England');
const name = process.argv[2] ?? 'Blackburn';
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === name || c[2] === name)![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
const tpl = Object.values(g.fixtures).find((f) => f.comp === 'FRIENDLY') ?? Object.values(g.fixtures)[0];
console.log('skabelon', tpl.comp, JSON.stringify(tpl).slice(0, 200));
let bad = 0, n = 0;
for (const c of Object.values(g.clubs)) {
  if (c.id === g.userClub) continue;
  n++;
  const f: Fixture = { ...tpl, id: 9_999_999, home: g.userClub, away: c.id, date: g.date, result: undefined } as Fixture;
  g.fixtures[f.id] = f;
  try {
    const m = prepareMatch(f);
    const hit = m.away.tactic.lineup.filter((id) => id && m.away.players.has(id)).length;
    if (m.away.players.size < 11 || hit < 11) { bad++; if (bad <= 40) console.log(`${c.name} (${g.nations[c.nation]?.name}, liga ${c.league}): trup ${squad(c.id).length}, holdet ${m.away.players.size}, opstilling ${hit}/11`); }
  } catch (e) { console.log(`${c.name}: FEJL ${(e as Error).message}`); }
  delete g.fixtures[f.id];
}
console.log(`klubber ${n}, under 11: ${bad}`);
