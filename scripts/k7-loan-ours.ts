// K7b-rest (a): vores lejeaftaler omkring sæsonslut (samme spil som k7-seasons.ts: Arsenal på ferie, frø 1, world med CM_DBSIZE=2) –
// slutdatoerne og hvor lejen kom fra. Modstykket til scripts/k7-loan-end.ts (oraklet).
//   WORLD=<world-dbs2.json> node scripts/measure.mjs -- npx tsx scripts/k7-loan-ours.ts [dato …]
import { readFileSync } from 'node:fs';
import type { WorldData } from '../src/game/newgame';
import { loadOrCreate } from './lib/snapshot';
import type { GameState } from '../src/game/types';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { applyAction } from '../src/game/actions';

const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
// som k7-expiry-s3.ts (advanceTag 'k7' – samme snapshots)
const advance = (g: GameState, until: string) => {
  let guard = 0;
  while ((g.date < until || !g.dayDone || g.pendingFixture) && guard++ < 100000) {
    if (!g.userClub) { const offer = g.jobOffers.find((id) => g.clubs[id]?.manager === 0); if (offer) applyAction({ t: 'acceptJob', club: offer }); else for (const id of g.vacancies.slice(0, 3)) applyAction({ t: 'applyJob', club: id }); }
    const r = continueGame(); if (r?.match) quickPlayUserMatch();
  }
};
const opts = { world: w, worldFile: process.env.WORLD, club: 'Arsenal', seed: 1, mode: 'authentic' as const, managerName: 'Test Smoke', advanceTag: 'k7', advance };
const dates = process.argv.slice(2).length ? process.argv.slice(2) : ['2002-06-01', '2002-06-29'];
for (const d of dates) {
  const g: GameState = loadOrCreate({ ...opts, date: d });
  const eng = g.nations.findIndex((x) => x.name === 'England');
  const loans = Object.values(g.players).filter((p) => p.loan && !p.virtual);
  const ends: Record<string, number> = {};
  for (const p of loans) ends[p.loan!.until] = (ends[p.loan!.until] ?? 0) + 1;
  const engL = loans.filter((p) => g.clubs[p.loan!.from]?.nation === eng);
  const top = Object.entries(ends).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => `${k}:${v}`).join(' ');
  console.log(`${g.date}: lejer ${loans.length} (fra engelske ${engL.length}) | slut ${top}`);
  const e30 = engL.filter((p) => p.loan!.until.slice(5) === '06-30');
  console.log(`  fra engelske med slut 30/6: ${e30.length}; med udløbet/udløbende hovedkontrakt ≤ 30/6: ${engL.filter((p) => (p.contract?.expires ?? '') <= `${d.slice(0, 4)}-06-30`).length}`);
}
