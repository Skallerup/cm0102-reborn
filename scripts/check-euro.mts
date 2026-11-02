// Diagnostik: verificér den nye UEFA-ligafase (CL/EL/Conference) på default-databasen.
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';

const world = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData;
const ni = (n: string) => world.nations.findIndex((x) => x.name === n);
const clubId = Number(process.argv[2] ?? 7023); // Man Utd i CM-data

createGame(world, {
  managerName: 'Test', managerNation: ni('England'), clubId,
  activeNations: ['England', 'Spain', 'Italy', 'Germany', 'France', 'Holland', 'Portugal'].map(ni),
  lang: 'da', masking: true, seed: 42,
});
const g = gs();

function describe(id: string) {
  const c = g.comps[id];
  if (!c) { console.log(id, 'FINDES IKKE'); return; }
  const fx = Object.values(g.fixtures).filter((f) => f.comp === id);
  const lp = fx.filter((f) => f.stage === 'LP');
  const perTeam = new Map<number, number>();
  for (const f of lp) { perTeam.set(f.home, (perTeam.get(f.home) ?? 0) + 1); perTeam.set(f.away, (perTeam.get(f.away) ?? 0) + 1); }
  const counts = [...perTeam.values()];
  const rounds = Math.max(0, ...lp.map((f) => f.round));
  console.log(`${id}: ${c.clubs.length} hold, tabel ${c.table.length} rækker, ${lp.length} ligafase-kampe over ${rounds} runder, kampe/hold ${Math.min(...counts)}-${Math.max(...counts)}, stage=${c.stage}`);
}
console.log('--- ved sæsonstart ---');
for (const id of ['CL', 'UEFA', 'UECL']) describe(id);

// simulér hele sæsonen
let days = 0;
const target = `${g.season + 1}-06-20`; // stop før sæsonskiftet 1. juli (ellers sættes nye turneringer op)
while (g.date < target && days < 2000) {
  const r = continueGame();
  if (r.match !== undefined) quickPlayUserMatch();
  days++;
}
console.log(`\n--- ved sæsonens slutning (dato ${g.date}, ${days} iterationer) ---`);
for (const id of ['CL', 'UEFA', 'UECL']) {
  const c = g.comps[id];
  if (!c) { console.log(id, 'mangler'); continue; }
  const stages = [...new Set(c.ties.map((t) => t.stage))];
  console.log(`${id}: færdig=${c.finished}, vinder=${c.winner ? g.clubs[c.winner]?.short : '-'}, pending=${c.pending}, knockout-stadier: ${stages.join(', ')}`);
}
