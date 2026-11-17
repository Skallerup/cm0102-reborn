// Tidsmåling: nyt spil med den originale database (forkørslen spiller landskampe – international.ts playNation). `npx tsx scripts/cm-intl-time.ts [dage]`
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import * as intl from '../src/game/international';
import { runUntil } from '../src/game/sim';

const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
const clubId = world.clubs.find((c) => c[2] === 'Wrexham')![0];
let nMatch = 0, msMatch = 0;
const orig = intl.playNation;
void orig;
const t0 = Date.now();
createGame(world, { managerName: 'T', managerNation: eng, clubId, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
console.log(`nyt spil ${Date.now() - t0} ms; landskampe ${g.intl!.results.length}; Copa ${g.intl!.results.filter((r) => r.kind === 'copa').length}; ` +
  `Oceanien ${g.intl!.results.filter((r) => r.kind === 'wcq').length}`);
const days = +(process.argv[2] ?? 0);
if (days) {
  const t1 = Date.now();
  const until = new Date(Date.parse(g.date) + days * 86400000).toISOString().slice(0, 10);
  await runUntil({ untilDate: until, autoPlay: true });
  console.log(`${days} dage ${Date.now() - t1} ms → ${gs().date}; landskampe ${gs().intl!.results.length}`);
  const st = gs().intl!;
  for (const t of [st.tournament, ...(st.cont ?? [])]) if (t) console.log(t.name, t.year, t.stage, t.winner !== undefined ? g.nations[t.winner]?.name : '', t.cm ? t.cm.sched.length : '-');
}
void nMatch; void msMatch;
