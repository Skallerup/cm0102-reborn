// Landstrænerjob i ægte tilstand: fyr en landstræner (afgang type 1), lad mennesket (klubmanager) søge, kør dage frem og vis forløbet.
//   npx tsx scripts/nat-job-repro.ts [land=Brazil] [dage=30] [klub=Man Utd]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { natClub, nationalManager } from '../src/game/cmVirtual';
import { applyForJob } from '../src/game/board';
import { answerNationalOffer } from '../src/game/international';
import { boardEnv } from '../src/game/cmBoardGame';
import { scoreStaffForJob } from '../src/game/cmBoard';

const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const idx = (nm: string) => w.nations.findIndex((x) => x.name === nm);
const eng = idx('England');
const land = idx(process.argv[2] ?? 'Brazil');
const days = Number(process.argv[3] ?? 30);
const club = w.clubs.find((c) => c[2] === (process.argv[4] ?? 'Man Utd'))!;
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: club[0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
const c = natClub(land);
const name = (id?: number) => (id === undefined ? '-' : `${g.staff[id]?.first} ${g.staff[id]?.last} (${id})`);
const step = () => { const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); };
while (g.date < '2001-08-20') step();
const st = g.cmBoard!;
console.log(`${g.date} ${g.nations[land].name} manager ${name(st.nm?.[land])} · rep ${g.manager.cmRep} · cmRep`);
st.dep.push({ type: 1, reason: 0, club: c });
step();
console.log(`${g.date} efter fyring: manager ${name(st.nm?.[land])} · vac ${JSON.stringify(st.vac.filter((v) => v.club === c))}`);
console.log(`apply: ${applyForJob(c)} · score mennesket ${scoreStaffForJob(boardEnv(g), boardEnv(g).persons().find((p) => p.human)!, c, 5)}`);
console.log(`vac efter ansøgning ${JSON.stringify(st.vac.filter((v) => v.club === c))}`);
for (let i = 0; i < days; i++) {
  step();
  if (g.manager.nationalOffer !== undefined) { console.log(`${g.date} TILBUD: nationalOffer ${g.manager.nationalOffer}`); break; }
  if (st.nm?.[land] !== undefined) { console.log(`${g.date} ansat: ${name(st.nm[land])}`); break; }
}
console.log(`vac nu ${JSON.stringify(st.vac.filter((v) => v.club === c))} · nationalManager ${nationalManager(g, land)?.last ?? '-'} · info.coach ${g.intl?.info?.[land]?.coach}`);
for (const n of g.news) if (n.date >= '2001-08-20' && (JSON.stringify(n).includes(g.nations[land].name) || /job/.test(n.key))) console.log(`  news ${n.date} ${n.key} ${JSON.stringify(n.params).slice(0, 300)}`);
if (process.argv[5] === 'accept' && g.manager.nationalOffer !== undefined) console.log(`accept: ${answerNationalOffer(true)} · national ${g.manager.national?.nation}`);
