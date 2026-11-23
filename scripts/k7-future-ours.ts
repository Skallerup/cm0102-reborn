// Vores side af k7-future-oracle.ts: de aftalte fremtidige skifter (computer → computer, status 'accepted' + cmFut – add_future_transfer
// 0x8cb9a0) pr. uge med tidsnibble (cmTime), kontrakttilbud (cmK uden beløb) og beløb, plus CM_AIAI-tællerne. Spillet som oraklet (Arsenal, frø 1).
//   WORLD=<world-dbs2.json> UNTIL=2002-07-10 STEP=49 node scripts/measure.mjs -- npx tsx scripts/k7-future-ours.ts
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { applyAction } from '../src/game/actions';
import { gs } from '../src/game/state';
import { CM_AIAI } from '../src/game/transfers';

const UNTIL = process.env.UNTIL ?? '2002-07-10', STEP = Number(process.env.STEP ?? 49);
const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
let g = gs();
const add = (iso: string, n: number) => new Date(Date.parse(iso) + n * 86400000).toISOString().slice(0, 10);
const dates: string[] = [];
for (let d = '2001-07-14'; d <= UNTIL; d = add(d, STEP)) dates.push(d);
for (const d of ['2002-03-02', '2002-04-20', '2002-06-08']) if (d <= UNTIL && !dates.includes(d)) dates.push(d);
dates.sort();
let seen = { ...CM_AIAI };
for (const iso of dates) {
  const prev = add(iso, -1);
  let guard = 0;
  while ((g.date < prev || !g.dayDone || g.pendingFixture) && guard++ < 20000) {
    if (!g.userClub) { const offer = g.jobOffers.find((id) => g.clubs[id]?.manager === 0); if (offer) applyAction({ t: 'acceptJob', club: offer }); else for (const id of g.vacancies.slice(0, 3)) applyAction({ t: 'applyJob', club: id }); }
    const r = continueGame(); if (r?.match) quickPlayUserMatch();
    g = gs();
  }
  const fut = g.offers.filter((o) => o.cmAi && o.status === 'accepted' && o.cmFut);
  const nib: Record<string, number> = {}, futD: Record<string, number> = {};
  let engN = 0;
  for (const o of fut) {
    const key = `n${o.cmTime ?? 0}${o.cmK && !o.fee ? 'k' : ''}${o.fee ? '$' : '0'}`;
    nib[key] = (nib[key] ?? 0) + 1;
    if (g.nations[g.clubs[o.buyer]?.nation ?? -1]?.name === 'England') { engN++; futD[o.cmFut!] = (futD[o.cmFut!] ?? 0) + 1; }
  }
  const open: Record<string, number> = {};
  for (const o of g.offers) if (o.cmAi) { const k = `${o.status}n${o.cmTime ?? '-'}`; open[k] = (open[k] ?? 0) + 1; }
  const delta = Object.fromEntries(Object.entries(CM_AIAI).map(([k, v]) => [k, v - (seen as Record<string, number>)[k]]).filter(([, v]) => v));
  seen = { ...CM_AIAI };
  console.log(iso, `fremtidige ${fut.length} (eng købere ${engN})`, JSON.stringify(nib), JSON.stringify(Object.fromEntries(Object.entries(futD).sort())));
  console.log('   bud', JSON.stringify(open), ' AIAI', JSON.stringify(delta));
}
