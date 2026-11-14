// Ønskelisterne i et kørende spil (CM_SL=1 slår dem til): spilstarten (0x83a1b0 → 0x83b6e0 for alle klubber) og de første dage – tid pr. dag,
// bud fra 0x84a020 og spillets handler.   CM_SL=1 npx tsx scripts/cm-shortlist-days.ts [dage]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { SL_ON, SL_STATS } from '../src/game/cmShortlistGame';

if (!SL_ON.on) console.log('NB: CM_SL=1 mangler – ønskelisterne er slået fra');
const days = +(process.argv[2] ?? 30);
const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((n) => n.name === 'England');
let t = performance.now();
createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
console.log(`nyt spil ${Math.round(performance.now() - t)} ms; par ${g.cmSlPairs?.length ?? 0}`);
const start = g.date;
const end = new Date(Date.parse(start + 'T00:00:00Z') + days * 86400000).toISOString().slice(0, 10);
t = performance.now();
let n = 0;
while (g.date < end) {
  const r = continueGame();
  if (r?.match) quickPlayUserMatch();
  n++;
}
const ms = performance.now() - t;
const moves = Object.values(g.players).flatMap((p) => (p.moves ?? []).filter((mv) => mv.date >= start));
const paid = moves.filter((mv) => (mv.fee ?? 0) > 0 && !mv.loan);
console.log(`${start} → ${g.date}: ${Math.round(ms)} ms i alt (${Math.round(ms / days)} ms pr. dag); ønskelisterne ${SL_STATS.days} dage, ${Math.round(SL_STATS.ms)} ms (${Math.round(SL_STATS.ms / Math.max(1, SL_STATS.days))} ms pr. dag), bud ${SL_STATS.bids}`);
console.log(`skifter ${moves.length} (betalte ${paid.length}, lejeaftaler ${moves.filter((mv) => mv.loan).length}); åbne bud ${g.offers.filter((o) => ['pending', 'negotiating', 'countered'].includes(o.status)).length}; par ${g.cmSlPairs?.length ?? 0}`);
void n;
