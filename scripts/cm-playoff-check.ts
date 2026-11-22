// De engelske divisioners play-off i spillet (competitions.ts setupCmPlayoff) – kamplisten maj og op-/nedrykningen efter sæsonskiftet, til
// sammenligning med oraklet (scripts/oracle-playoff.ts). Spillet startes som oraklet (England, Arsenal, frø, ægte tilstand).
//   WORLD=<world CM_DBSIZE=2> [SEED=1] [SEASONS=1] node scripts/measure.mjs -- npx tsx scripts/cm-playoff-check.ts
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { applyAction } from '../src/game/actions';
import { gs } from '../src/game/state';
import { finalOrder } from '../src/game/competitions';
import type { GameState } from '../src/game/types';

const SEASONS = Number(process.env.SEASONS ?? 1);
const w = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world-original.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
const user = w.clubs.find((c) => c[1] === 'Arsenal')![0];
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: Number(process.env.SEED ?? 1), mode: 'authentic' });
let g: GameState = gs();
const playTo = (iso: string) => {
  let guard = 0;
  while ((g.date < iso || !g.dayDone || g.pendingFixture) && guard++ < 20000) {
    if (!g.userClub) {
      const offer = g.jobOffers.find((id) => g.clubs[id]?.manager === 0);
      if (offer) applyAction({ t: 'acceptJob', club: offer }); else for (const id of g.vacancies.slice(0, 3)) applyAction({ t: 'applyJob', club: id });
    }
    const r = continueGame(); if (r?.match) quickPlayUserMatch();
    g = gs();
  }
};
const N = (c: number) => g.clubs[c]?.name ?? `#${c}`;
const DIVS = ['CM7', 'CM8', 'CM9', 'CM10'];
for (let s = 0; s < SEASONS; s++) {
  const y = 2002 + s;
  playTo(`${y}-05-09`);
  for (const id of DIVS.slice(1)) {
    const c = g.comps[id];
    if (!c) continue;
    console.log(`${y} ${c.name}: ${finalOrder(c).slice(0, 8).map((x, i) => `${i + 1}.${N(x)}`).join(' | ')}`);
  }
  const before = new Map(Object.values(g.clubs).filter((c) => DIVS.includes(c.league)).map((c) => [c.id, c.league]));
  playTo(`${y}-06-15`);   // før sæsonskiftet 20/6
  for (const id of DIVS.slice(1).map((d) => `PO-${d}`)) {
    const c = g.comps[id];
    if (!c) { console.log(`${y} ${id}: ingen`); continue; }
    console.log(`${y} ${c.name} → ${c.playoffFor}: vinder ${c.winner !== undefined ? N(c.winner) : '-'}`);
    for (const f of Object.values(g.fixtures).filter((x) => x.comp === id).sort((a, b) => a.date.localeCompare(b.date)))
      console.log(`  ${f.date} ${f.stage}${f.leg ? ` ben ${f.leg}` : ''} slot ${f.slot ?? '-'} ${N(f.home)} - ${N(f.away)} ${f.result ? `${f.result.hg}-${f.result.ag}${f.result.pens ? ` (str. ${f.result.pens.join('-')})` : ''}` : ''} w30 ${f.cm?.w30} f38 ${f.cm?.f38} b3c ${f.cm?.b3c}`);
  }
  playTo(`${y}-07-10`);
  const moved = [...before].filter(([c, l]) => g.clubs[c].league !== l).map(([c, l]) => `${N(c)} ${l}→${g.clubs[c].league}`);
  console.log(`${y} op/ned: ${moved.join(', ')}`);
}
