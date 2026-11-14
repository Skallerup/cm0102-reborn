// Hvor mange spillere har interesserede klubber ved spilstart (den originale database, ægte tilstand)? npx tsx scripts/cm-interest-count.ts [klub]
// Originalen: 258 mål på 137 klubbers ønskelister i England (cm-shortlist-orig.ts).
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { interestedClubs } from '../src/game/transfers';
const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((n) => n.name === 'England');
const name = process.argv[2] ?? 'Bolton Wanderers';
createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === name)![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
const t0 = performance.now();
const ps = Object.values(g.players).filter((p) => p.club && g.clubs[p.club]?.nation === eng && !g.leagues[g.clubs[p.club].league]?.hidden);
let n = 0;
for (const p of ps) if (interestedClubs(p).length) n++;
const mine = Object.values(g.players).filter((p) => p.club === g.userClub);
console.log(`England: ${n} af ${ps.length} spillere har interesserede klubber (${Math.round(performance.now() - t0)} ms); ${name}: ${mine.filter((p) => interestedClubs(p).length).length} af ${mine.length}`);
