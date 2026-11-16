// Landsholdenes udtagelse, nyheder og FIFA-rangliste i ægte tilstand (cmIntlSquad.ts, cmFifa.ts): spiller en ny karriere (3.9.60, frø 1)
// til en dato og viser truppen for et par lande, menneskets landsholdsnyheder og FIFA-toppen.
// Brug: npx tsx scripts/cm-intl-squads.ts [til-dato=2001-09-02] [klub=Man Utd]   (NATIONS=England,Argentina …)
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { cmSquadOf } from '../src/game/cmIntlSquad';
import { cmFifaRanking } from '../src/game/cmFifa';

const until = process.argv[2] ?? '2001-09-02';
const clubName = process.argv[3] ?? 'Man Utd';
const world = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world-original.json', 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
const club = world.clubs.find((c) => c[2] === clubName)![0];
const t0 = Date.now();
createGame(world, { managerName: 'T', managerNation: eng, clubId: club, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
const t1 = Date.now();
while (g.date < until) { const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); }
console.log(`spilstart ${Math.round((t1 - t0) / 100) / 10} s, til ${until}: ${Math.round((Date.now() - t1) / 100) / 10} s`);
for (const nm of (process.env.NATIONS ?? 'England,Argentina,France,Scotland').split(',')) {
  const n = g.nations.findIndex((x) => x.name === nm);
  const q = cmSquadOf(g, n, 0);
  console.log(`${nm} (${q?.from} → ${q?.until}, ${q?.ids.length}):`, q?.ids.map((id) => `${g.players[id].last}/${g.clubs[g.players[id].club]?.short ?? '-'}`).join(', '));
}
for (const x of g.news.filter((x) => x.key.startsWith('cmint.')).slice(0, 12)) console.log(x.date, x.key, JSON.stringify(x.params));
console.log('FIFA:', cmFifaRanking(g).slice(0, 12).map((r) => `${r.pos}. ${g.nations[r.n].name} ${r.pts.toFixed(2)}`).join(' | '));
