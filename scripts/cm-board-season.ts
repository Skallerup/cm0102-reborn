// Bestyrelse og managerjob over en sæson i vores spil (den originale database i ægte tilstand) mod oraklet (scripts/cm-board-oracle.py).
// Som oraklet: nyt spil med England, Arsenal, 330 dage fra spillets start (≈ 6/6-2002). Udskriver managerskifterne (dato, klub, gammel → ny),
// bestyrelsens tillid (+6) pr. klub ved slutningen og – med ORACLE=<json fra cm-board-oracle.py --compare> – en sammenligning.
// Kør: npx tsx scripts/cm-board-season.ts [frø] [dage] [world-fil]     (JSON=<fil> skriver resultatet)
import { readFileSync, writeFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';

const seed = Number(process.argv[2] ?? 1), days = Number(process.argv[3] ?? 330);
const file = process.argv[4] ?? 'public/data/world-original.json';
const world = JSON.parse(readFileSync(file, 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
const ars = world.clubs.find((c) => c[1] === 'Arsenal')![0];
createGame(world, { managerName: 'Test Smoke', managerNation: eng, clubId: ars, activeNations: [eng], lang: 'en', masking: true, seed, mode: 'authentic' });
const g = gs();
if (process.env.ENGINE) g.options.engine = process.env.ENGINE as never;
if (process.env.NOBOARD) delete g.cmBoard;
const name = (id: number) => { const s = g.staff[id]; return id === -1 ? 'HUMAN' : s ? `${s.first} ${s.last}`.trim() : '-'; };
const engClubs = Object.values(g.clubs).filter((c) => c.nation === eng && g.comps[c.league]);
const start = new Map(engClubs.map((c) => [c.id, c.manager]));
let cur = new Map(start);
const changes: { date: string; club: string; from: string; to: string }[] = [];
const t0 = Date.now();
const end = new Date(Date.parse(g.date) + days * 86400000).toISOString().slice(0, 10);
let n = 0;
while (g.date < end && n++ < 2000) {
  const r = continueGame();
  if (r.match !== undefined) quickPlayUserMatch();
  for (const c of engClubs) {
    const m = c.manager;
    if (m !== cur.get(c.id)) {
      if (m !== 0) changes.push({ date: g.date, club: c.name, from: name(start.get(c.id) ?? 0), to: name(m) });
      cur.set(c.id, m);
    }
  }
}
const vacant = engClubs.filter((c) => c.manager === 0).map((c) => c.name);
console.log(`${changes.length} nye managere i ${engClubs.length} engelske ligaklubber på ${Math.round((Date.now() - t0) / 1000)} s (til ${g.date}); ledige: ${vacant.length}`);
for (const x of changes) console.log(`${x.date}  ${x.club.padEnd(26)} ${x.from} → ${x.to}`);
const rec = g.cmBoard?.rec ?? {};
const conf = engClubs.map((c) => [c.name, rec[c.id]?.w6 ?? 0] as const).sort((a, b) => a[1] - b[1]);
console.log('laveste tillid:', conf.slice(0, 8).map(([a, b]) => `${a} ${b}`).join(', '));
console.log('afgange i kø:', g.cmBoard?.dep.length, 'ledige poster:', g.cmBoard?.vac.length);
if (process.env.JSON) writeFileSync(process.env.JSON, JSON.stringify({ seed, days, date: g.date, changes, vacant, conf }, null, 1));
