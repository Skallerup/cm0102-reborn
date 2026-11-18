// 2026/27 i ægte tilstand (MODERN_PARITY 7): bestyrelse og managerjob over en sæson – managerskifter blandt computerklubberne (afgange,
// udnævnelser, ledige dage), menneskets tillid/forventning og bestyrelsens loft på budskærmen (0x598800 – cmBidBudget) mod transferbudgettet.
// npx tsx scripts/cm-board-2026.ts [til-dato] [klub] [frø]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { cmBidBudget } from '../src/game/cmBudget';

const until = process.argv[2] ?? '2027-06-30';
const w = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData & { cmRaw?: unknown };
Object.assign(w, JSON.parse(readFileSync('public/data/world-cm.json', 'utf8')));
const eng = w.nations.findIndex((x) => x.name === 'England');
const name = process.argv[3] ?? 'Brentford';
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === name || c[2] === name)![0], activeNations: [eng], lang: 'en', masking: true,
  seed: Number(process.argv[4] ?? 1), mode: 'authentic' });
const g = gs();
const me = g.userClub;
const m = (v: number) => `${(v / 1e6).toFixed(2)}m`;
const t0 = performance.now();
console.log(`start ${g.date} · cmBoard ${g.cmBoard ? 'ja' : 'nej'} · ${g.cmBoard ? Object.keys(g.cmBoard.rec).length + ' poster' : ''}`);
const shown = () => Object.values(g.clubs).filter((c) => g.activeNations.includes(c.nation) && g.comps[c.league]?.type === 'league' && !g.leagues[c.league]?.hidden);
const tier = (c: { league: string }) => g.leagues[c.league]?.tier ?? 9;
const npMgr = shown().filter((c) => c.id !== me && c.manager > 0 && g.staff[c.manager]?.cmNp).length;
console.log(`computerklubber i England: ${shown().length - 1}, managere med ikke-spillerpost ${npMgr}`);
let prev = new Map(shown().map((c) => [c.id, c.manager]));
const dep: Record<number, number> = {}, app: Record<number, number> = {};
let vacDays = 0, maxVac = 0;
const log: string[] = [];
const sname = (id: number) => (id === -1 ? 'mennesket' : id > 0 ? `${g.staff[id]?.first ?? ''} ${g.staff[id]?.last ?? '?'}`.trim() : '–');
function budgetLine(label: string) {
  const club = g.clubs[g.userClub];
  if (!club) { console.log(`${label}: uden klub`); return; }
  const others = Object.values(g.players).filter((p) => p.club && p.club !== g.userClub && g.clubs[p.club]?.nation === eng && tier(g.clubs[p.club]) <= 2)
    .sort((a, b) => b.value - a.value);
  const picks = [others[0], others[Math.floor(others.length * 0.1)], others[Math.floor(others.length * 0.5)]].filter(Boolean);
  const parts = picks.map((p) => { const b = cmBidBudget(g, p, g.userClub); return `${p.last} (værdi ${m(p.value)}) loft ${b ? `${m(b.budget)} niv ${b.level}${b.limited ? ' begr' : ''}` : `– (${m(club.transferBudget ?? 0)})`}`; });
  console.log(`${label} ${g.date}: tillid ${g.board.confidence} forv ${g.board.expectation}/${g.board.expectedPos} · saldo ${m(club.balance)} · transferbudget ${m(club.transferBudget ?? 0)} · ${parts.join(' · ')}`);
}
budgetLine('start');
let days = 0;
while (g.date < until && days++ < 420) {
  const r = continueGame();
  if (r.match !== undefined) quickPlayUserMatch();
  const now = shown();
  let vac = 0;
  for (const c of now) {
    if (c.id === me) continue;
    const a = prev.get(c.id) ?? 0, b = c.manager;
    if (b === 0) vac++;
    if (a !== b) {
      if (a !== 0) dep[tier(c)] = (dep[tier(c)] ?? 0) + 1;
      if (b !== 0) app[tier(c)] = (app[tier(c)] ?? 0) + 1;
      if (tier(c) <= 2) log.push(`${g.date} ${c.name}: ${sname(a)} → ${sname(b)}`);
    }
  }
  vacDays += vac; maxVac = Math.max(maxVac, vac);
  prev = new Map(now.map((c) => [c.id, c.manager]));
  if (g.date.endsWith('-01') && ['08', '10', '12', '02', '04', '06'].includes(g.date.slice(5, 7))) budgetLine('måned');
}
console.log(`--- slut ${g.date} (${Math.round((performance.now() - t0) / 1000)} s)`);
const sum = (o: Record<number, number>) => Object.values(o).reduce((a, b) => a + b, 0);
console.log(`afgange ${sum(dep)} (pr. række ${JSON.stringify(dep)}) · udnævnelser ${sum(app)} (${JSON.stringify(app)}) · ledige klubdage ${vacDays}, højst ${maxVac} ledige på én dag`);
console.log(`mennesket: klub ${g.clubs[g.userClub]?.name ?? 'ingen'} · fyret ${g.manager.sacked} · jobtilbud ${g.jobOffers.length} · tillid ${g.board.confidence}`);
for (const l of log) console.log('  ' + l);
