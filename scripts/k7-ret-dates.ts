// Vores pensionsliste (g.cmRet) ved spilstarten som oraklets (scratch: ret.ts): stabens poster (årsag 0x20) i engelske klubber – melding/stop.
//   WORLD=<world-dbs2.json> npx tsx scripts/k7-ret-dates.ts
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';

const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
const user = w.clubs.find((c) => c[1] === 'Arsenal')![0];
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
const L = (g.cmRet as unknown as { list: { id: number; club: number; a: number; r: number; why: number; ann: number }[] }).list;
const stops: number[] = [];
for (const e of L) {
  const s = g.staff[e.id];
  if (!s || e.why !== 0x20) continue;
  const c = g.clubs[e.club];
  if (c?.nation !== eng) continue;
  stops.push(e.r % 1000);
  console.log(`${s.first} ${s.last} ${s.role} ${c.name} f.${s.dob} melding ${e.a} stop ${e.r}`);
}
console.log('stopdage', stops.sort((a, b) => a - b).join(' '));
