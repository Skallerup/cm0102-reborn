// Hvilke nyheder om andre klubber får manageren? Spiller N dage (standard 60) med den originale database i ægte tilstand og tæller
// transfer- og managernyhederne efter købers/klubbens land og liga. Sammenlign med originalen (oraklets news.dat, cmNewsScope.ts).
// Kør: npx tsx scripts/news-scope.ts [dage] [klub] [frø]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';

const days = +(process.argv[2] ?? 60), clubName = process.argv[3] ?? 'Manchester United', seed = +(process.argv[4] ?? 3);
const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((n) => n.name === 'England');
createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === clubName)![0], activeNations: [eng], lang: 'en', masking: true, seed, mode: 'authentic' });
const g = gs();
const start = g.date;
const end = new Date(Date.parse(g.date) + days * 86400000).toISOString().slice(0, 10);
for (let i = 0; i < 1000 && g.date < end; i++) { const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); }
const me = g.clubs[g.userClub];
const byShort = new Map(Object.values(g.clubs).map((c) => [c.short, c]));
const tally: Record<string, number> = {};
const lines: string[] = [];
for (const n of g.news) {
  if (n.date < start) continue;
  const k = n.key ?? '';
  if (!/^transfer\.o|^news\.cmAppoint|^news\.managerSacked/.test(k)) continue;
  const c = byShort.get(String(n.params?.to ?? n.params?.club ?? '')) ?? Object.values(g.clubs).find((x) => x.name === n.params?.club);
  const where = !c ? '?' : c.nation !== me.nation ? 'abroad' : c.league === me.league ? 'own league' : `${g.comps[c.league]?.name ?? c.league}`;
  const t = `${k.replace(/\.\d$/, '')} – ${where}`;
  tally[t] = (tally[t] ?? 0) + 1;
  lines.push(`${n.date} ${k} ${n.params?.to ?? n.params?.club} ${n.params?.player ?? n.params?.manager ?? ''} ${n.params?.fee ?? ''}`);
}
console.log(`${clubName}, ${start} → ${g.date}`);
console.log(Object.entries(tally).sort().map(([k, v]) => `${v.toString().padStart(4)}  ${k}`).join('\n'));
if (process.env.LIST) console.log(lines.join('\n'));
