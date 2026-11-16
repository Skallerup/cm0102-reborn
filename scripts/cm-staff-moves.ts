// Stabsskifterne (cmStaffMove.ts – trupplanens hale 0x83ebfb–0x83f32b, budgettet 0x83b6e0, buddene med kompensationen 0x8d0780): et spil startes
// som K2 (England, Arsenal, frø 1, ægte tilstand) og spilles til TIL; skifterne tælles pr. job, med kompensationen og nyhederne til mennesket.
// Kørsel: npx tsx scripts/cm-staff-moves.ts [til-dato]   (WORLD=<world-fil>, CLUB=<klub>)
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import type { GameState } from '../src/game/types';

const until = process.argv[2] ?? '2001-10-01';
const w = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world-original.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
const user = w.clubs.find((c) => c[1] === (process.env.CLUB ?? 'Arsenal'))![0];
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g: GameState = gs();
const pend0 = g.cmStaffMoves?.length ?? 0;
const t0 = Date.now();
const moves: string[] = [];
let last = new Map(Object.values(g.staff).map((s) => [s.id, s.club]));
let fees = 0;
while (g.date < until) {
  const r = continueGame();
  if (r?.match) quickPlayUserMatch();
  for (const s of Object.values(g.staff)) {
    const was = last.get(s.id);
    if (was !== undefined && was !== s.club && s.club && s.cmJoined === g.date) {
      moves.push(`${g.date} ${s.role.padEnd(9)} ${`${s.first} ${s.last}`.padEnd(24)} ${(g.clubs[was]?.name ?? '(ledig)').padEnd(22)} → ${g.clubs[s.club]?.name}`);
    }
  }
  last = new Map(Object.values(g.staff).map((s) => [s.id, s.club]));
}
const byRole: Record<string, number> = {};
for (const m of moves) { const k = m.split(/\s+/)[1]; byRole[k] = (byRole[k] ?? 0) + 1; }
console.log(`${((Date.now() - t0) / 1000).toFixed(0)} s; bud ved spilstart ${pend0}; skifter ${moves.length} ${JSON.stringify(byRole)}; fra en klub ${moves.filter((m) => !m.includes('(ledig)')).length}; ventende ${g.cmStaffMoves?.length ?? 0}`);
for (const m of moves.slice(0, 40)) console.log(m);
const news = g.news.filter((n) => n.key.startsWith('cm.stm.'));
console.log(`nyheder til mennesket: ${news.length}`, fees);
for (const n of news.slice(0, 10)) console.log(`  ${n.date} ${JSON.stringify(n.params)}`);
