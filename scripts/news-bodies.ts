// Nyheder uden brødtekst: spil DAYS dage (fast frø) og vis hver nyhedstype, hvis brødtekst (newsBody i src/ui/screens/common.tsx) er tom.
// Kør via tests/newsBodiesAudit.test.ts: NEWS_BODIES=1 [MODE=authentic] [DAYS=180] [WORLD=…] [CLUB=…] [JSON=ud.json] node scripts/test.mjs run --dir tests tests/newsBodiesAudit.test.ts --force
import { writeFileSync } from 'node:fs';
import { readWorld } from './lib/world';
import { createGame } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { applyAction } from '../src/game/actions';
import { gs } from '../src/game/state';
import { newsBody } from '../src/ui/screens/common';
import type { NewsItem } from '../src/game/types';

const file = process.env.WORLD ?? 'public/data/world.json';
const world = readWorld(file);
const eng = world.nations.findIndex((x) => x.name === 'England');
const user = (process.env.CLUB && world.clubs.find((c) => c[1] === process.env.CLUB)?.[0]) || world.clubs.find((c) => c[3] === eng)![0];
createGame(world, { managerName: 'News', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', seed: 11, mode: process.env.MODE === 'authentic' ? 'authentic' : 'extended' } as Parameters<typeof createGame>[1]);
const g = gs();
const seen = new Map<string, { n: NewsItem; count: number }>();
const ids = new Set<number>();
const collect = () => {
  for (const n of [...g.news, ...(g.humans ?? []).flatMap((h) => h.news)]) {
    if (ids.has(n.id)) continue;
    ids.add(n.id);
    const s = seen.get(n.key);
    if (s) s.count++; else seen.set(n.key, { n: structuredClone(n), count: 1 });
  }
};
collect();
const DAYS = Number(process.env.DAYS ?? 180);
for (let d = 0; d < DAYS; d++) {
  if (!g.userClub) {
    const offer = g.jobOffers.find((id) => g.clubs[id]?.manager === 0);
    if (offer) applyAction({ t: 'acceptJob', club: offer });
    else if (d % 7 === 0) for (const id of g.vacancies.slice(0, 3)) applyAction({ t: 'applyJob', club: id });
  }
  const r = continueGame();
  if (r.match !== undefined) quickPlayUserMatch();
  collect();
}
const empty: string[] = [];
for (const [k, { n, count }] of [...seen].sort()) {
  let b = '';
  try { b = newsBody(n); } catch (e) { b = `!! ${(e as Error).message}`; }
  if (!b.trim()) empty.push(`${k} ×${count}`);
}
console.log(`${g.date}: ${seen.size} nyhedstyper, ${empty.length} uden brødtekst`);
for (const e of empty) console.log('  ' + e);
if (process.env.JSON) writeFileSync(process.env.JSON, JSON.stringify({ date: g.date, types: [...seen.keys()], empty, samples: Object.fromEntries([...seen].map(([k, v]) => [k, v.n])) }, null, 1));
