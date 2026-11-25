// (fejlsøgning) Som scripts/k7-target-oracle.ts i spillet: hvilke klubber har en navngiven spiller som mål (trupplanens plads r[3]), parrene
// (cmSlPairs) og bud – frø 1, Arsenal på ferie.   WORLD=<world-dbs2.json> WHO="Alex Manninger" FROM=2001-12-01 UNTIL=2002-01-06 npx tsx scripts/k7-target-ours.ts
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';

const WHO = process.env.WHO ?? 'Alex Manninger', FROM = process.env.FROM ?? '2001-12-01', UNTIL = process.env.UNTIL ?? '2002-01-06', CLUB = process.env.CLUB ?? 'Arsenal';
const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === CLUB)![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
if (process.env.HOLIDAY !== '0') gs().manager.holiday = {};
let g = gs();
const p0 = Object.values(g.players).find((p) => `${p.first} ${p.last}` === WHO)!;
let guard = 0;
while (g.date < UNTIL && guard++ < 40000) {
  const r = continueGame(); if (r?.match) quickPlayUserMatch();
  g = gs();
  if (g.date < FROM) continue;
  const p = g.players[p0.id];
  const tg: string[] = [];
  for (const [cid, pl] of Object.entries(g.cmPlan ?? {})) for (const s of pl.s) if (s[0] === 0xb && s[3] === p0.id) tg.push(`${g.clubs[+cid]?.name}(b7? ${s.slice(5, 7).join('/')})`);
  const pairs = (g.cmSlPairs ?? []).filter(([pid]) => pid === p0.id).map(([, c]) => g.clubs[c]?.name);
  const bids = g.offers.filter((o) => o.player === p0.id).map((o) => `${g.clubs[o.buyer]?.name}:${o.status}${o.cmK ? 'k' : ''}`);
  console.log(g.date.slice(0, 10), 'ca', p?.ca, 'exp', p?.contract?.expires, 'sq', p?.contract?.squadStatus ?? '', 'value', p?.value, 'mål hos', tg.join(', '), '| par', pairs.join(','), '| bud', bids.join(','));
}
