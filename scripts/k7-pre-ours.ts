// Forkontrakterne (K7): vores computerbud på spillere i en klub (køb og forkontrakter) dag for dag fra FROM til UNTIL – pr. bud køberen,
// sidste tilstand (k = kontrakttilbud, F = aftalt fremtidigt skifte), tidsnibble, kontraktens udløb; JSON=fil. Spillet som oraklet (Arsenal, frø 1).
//   WORLD=<world-dbs2.json> FROM=2001-10-01 UNTIL=2002-01-06 JSON=<fil> node scripts/measure.mjs -- npx tsx scripts/k7-pre-ours.ts
import { readFileSync, writeFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { applyAction } from '../src/game/actions';
import { gs } from '../src/game/state';

const UNTIL = process.env.UNTIL ?? '2002-01-06', FROM = process.env.FROM ?? '2001-10-01';
const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
let g = gs();
interface Row { key: string; buyer: string; first: string; last: string; st: string; t?: number; fee: number; exp: string; club: string }
const seen = new Map<number, Row>();
let guard = 0;
while (g.date < UNTIL && guard++ < 40000) {
  if (!g.userClub) { const offer = g.jobOffers.find((id) => g.clubs[id]?.manager === 0); if (offer) applyAction({ t: 'acceptJob', club: offer }); else for (const id of g.vacancies.slice(0, 3)) applyAction({ t: 'applyJob', club: id }); }
  const r = continueGame(); if (r?.match) quickPlayUserMatch();
  g = gs();
  if (g.date < FROM) continue;
  for (const o of g.offers) {
    if (!o.cmAi || o.loan || !o.seller) continue;
    const p = g.players[o.player];
    if (!p || !p.club) continue;
    const s = seen.get(o.id) ?? { key: `${p.first} ${p.last}|${p.dob}`, buyer: g.clubs[o.buyer]?.name ?? '', first: g.date, last: g.date, st: '', fee: o.fee, exp: p.contract?.expires ?? '', club: g.clubs[p.club]?.name ?? '' };
    s.last = g.date; s.st = `${o.status}${o.cmK ? 'k' : ''}${o.cmFut ? 'F' : ''}`; s.t = o.cmTime; s.fee = o.fee;
    seen.set(o.id, s);
  }
}
const rows = [...seen.values()];
const fut = Object.values(g.players).filter((p) => p.contract?.futureClub).map((p) => ({ key: `${p.first} ${p.last}|${p.dob}`, to: g.clubs[p.contract!.futureClub!]?.name, exp: p.contract!.expires, club: g.clubs[p.club]?.name }));
console.log('bud', rows.length, 'fremtidige', fut.length);
if (process.env.JSON) writeFileSync(process.env.JSON, JSON.stringify({ rows, fut }));
