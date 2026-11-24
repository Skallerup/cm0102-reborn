// Formændene i vores nye spil (som fe-chair-oracle.ts): r.chair (Business, Resources) og g.cmChair[0] (Interference)
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { cmRand } from '../src/game/cmPlayerData';
const w = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world-original-normal.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
const user = w.clubs.find((c) => c[1] === 'Arsenal')![0];
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
const h: Record<string, number> = {}, hb: Record<string, number> = {}, hr: Record<string, number> = {};
let n = 0, nc = 0, ne = 0, nEng = 0;
const engNames: string[] = [];
const pick = (process.env.CLUBS ?? 'Arsenal,Everton,Sheffield United,Walsall,Sheffield Wednesday,Bury,Manchester United').split(',');
for (const c of Object.values(g.clubs)) {
  const r = g.cmFin?.[c.id]; if (!r) continue;
  nc++;
  const isEng = c.nation === eng && !!g.comps[c.league];
  if (isEng) nEng++;
  if (!r.chair) continue;
  n++; if (isEng) { ne++; engNames.push(c.name); }
  const i = g.cmChair?.[c.id]?.[0] ?? 'x';
  h[i] = (h[i] ?? 0) + 1; hb[r.chair[0]] = (hb[r.chair[0]] ?? 0) + 1; hr[r.chair[1]] = (hr[r.chair[1]] ?? 0) + 1;
  if (pick.includes(c.name)) console.log(`${c.name} int ${i} bus ${r.chair[0]} res ${r.chair[1]} pat ${g.cmChair?.[c.id]?.[1]}`);
}
console.log('klubber', nc, 'med formand', n, 'engelske ligaklubber', nEng, 'heraf med formand', ne);
if (process.env.NAMES) console.log(engNames.sort().join('|'));
console.log('interference', JSON.stringify(h));
console.log('business', JSON.stringify(hb));
console.log('resources', JSON.stringify(hr));
const rr = cmRand(1, 1, 2, 3);
console.log('rand(0) =', [rr(0), rr(0), rr(0)]);
