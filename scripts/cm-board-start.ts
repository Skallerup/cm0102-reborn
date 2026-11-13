// Managerne i de engelske ligaklubber ved spillets start (efter forkørslen) – til sammenligning med oraklets dag 1 (runs/bj-d1).
// Kør: npx tsx scripts/cm-board-start.ts [frø] [world-fil] > ud.json
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { boardPrerun } from '../src/game/cmBoardGame';

if (process.env.NOPRERUN) boardPrerun.on = false;

const seed = Number(process.argv[2] ?? 1);
const world = JSON.parse(readFileSync(process.argv[3] ?? 'public/data/world-original.json', 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
const ars = world.clubs.find((c) => c[1] === 'Arsenal')![0];
const t0 = Date.now();
createGame(world, { managerName: 'Test Smoke', managerNation: eng, clubId: ars, activeNations: [eng], lang: 'en', masking: true, seed, mode: 'authentic' });
const g = gs();
const out: Record<string, string> = {};
for (const c of Object.values(g.clubs)) {
  if (c.nation !== eng || !g.comps[c.league]) continue;
  const s = g.staff[c.manager];
  out[c.name] = c.manager === -1 ? 'Test Smoke' : s ? `${s.first} ${s.last}`.trim() : '';
}
console.log(JSON.stringify(out));
console.error('createGame', Date.now() - t0, 'ms');
