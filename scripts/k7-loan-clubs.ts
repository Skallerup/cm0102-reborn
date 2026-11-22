// K7 leje: hvilke engelske klubber har en trupplan (g.cmPlan – deltager i ønskelisterne 0x5cccd0) efter newgame, pr. division/liga.
//   WORLD=<world-dbs2.json> npx tsx scripts/k7-loan-clubs.ts
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';

const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
const by = new Map<string, { n: number; plan: number; mem: number; players: number }>();
for (const c of Object.values(g.clubs)) {
  if (c.nation !== eng) continue;
  const k = g.comps[c.league]?.name ?? g.leagues[c.league]?.name ?? `league=${String(c.league)}`;
  const e = by.get(k) ?? { n: 0, plan: 0, mem: 0, players: 0 };
  e.n++; if (g.cmPlan?.[c.id]) e.plan++;
  e.players += Object.values(g.players).filter((p) => p.club === c.id).length;
  by.set(k, e);
}
for (const [k, e] of [...by].sort((a, b) => b[1].n - a[1].n)) console.log(`${k.padEnd(50)} klubber ${e.n} plan ${e.plan} spillere ${e.players}`);
