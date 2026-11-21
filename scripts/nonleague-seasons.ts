// Sæsonskiftets udskiftning mellem den nederste kørende liga og en inaktiv division (cmNonLeague.ts) over flere sæsonskifter – sanity uden orakel:
// klubber pr. division før/efter hvert skifte, op/ned pr. liga, ingen klub i to ligaer.
//   NATION=Denmark CLUB=Silkeborg UNTIL=2003-08-01 SEED=1 npx tsx scripts/nonleague-seasons.ts [world-fil]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';

const worldFile = process.argv[2] ?? 'public/data/world-original.json';
const NATION = process.env.NATION ?? 'Denmark', CLUB = process.env.CLUB ?? 'Silkeborg', UNTIL = process.env.UNTIL ?? '2003-08-01', SEED = Number(process.env.SEED ?? 1);
const world = JSON.parse(readFileSync(worldFile, 'utf8')) as WorldData;
const nat = world.nations.findIndex((x) => x.name === NATION);
const club = world.clubs.find((c) => c[3] === nat && String(c[1]).includes(CLUB)) ?? world.clubs.find((c) => c[3] === nat)!;
createGame(world, { managerName: 'Lab', managerNation: nat, clubId: club[0] as number, activeNations: [nat], lang: 'en', masking: true, seed: SEED, mode: 'authentic' });
gs().options.engine = 'original';
const g = gs();
const snap = () => {
  const m = new Map<number, string>();
  for (const c of Object.values(g.clubs)) if (c.nation === nat) m.set(c.id, c.league);
  return m;
};
const lname = (id: string) => `${g.leagues[id]?.name ?? id}${g.leagues[id]?.hidden ? ' (skjult)' : ''}`;
const count = (m: Map<number, string>) => { const n: Record<string, number> = {}; for (const l of m.values()) n[l] = (n[l] ?? 0) + 1; return n; };
let prev = snap(), season = g.season, bad = 0;
console.log(`${NATION}: ${club[1]}, start ${g.date}`, Object.entries(count(prev)).map(([l, n]) => `${lname(l)} ${n}`).join(' · '));
while (g.date < UNTIL) {
  const r = continueGame();
  if (r.match !== undefined) quickPlayUserMatch();
  if (gs().season !== season) {
    const cur = snap();
    const moves: Record<string, number> = {};
    for (const [id, l] of cur) { const p = prev.get(id); if (p && p !== l) { const k = `${lname(p)} → ${lname(l)}`; moves[k] = (moves[k] ?? 0) + 1; } }
    console.log(`\n== sæsonskifte ${season} → ${gs().season} (${gs().date})`);
    for (const [k, n] of Object.entries(moves)) console.log(`  ${n} ${k}`);
    console.log('  efter:', Object.entries(count(cur)).filter(([l]) => !g.leagues[l]?.hidden).map(([l, n]) => `${lname(l)} ${n}`).join(' · '));
    for (const [id, l] of Object.entries(count(prev))) if (!g.leagues[id]?.hidden && count(cur)[id] !== l) { console.log(`  FEJL: ${lname(id)} ${l} → ${count(cur)[id]}`); bad++; }
    // ingen klub i to ligaer: hver klub står i præcis én turnerings klubliste blandt landets ligaer
    const seen = new Map<number, string>();
    for (const [id, comp] of Object.entries(g.comps)) {
      if (!g.leagues[id] || g.leagues[id].nation !== nat || comp.type !== 'league') continue;
      for (const c of comp.clubs) { if (seen.has(c)) { console.log(`  FEJL: klub ${c} i ${seen.get(c)} og ${id}`); bad++; } seen.set(c, id); if (g.clubs[c]?.league !== id) { console.log(`  FEJL: klub ${c} i ${id}s liste, men league ${g.clubs[c]?.league}`); bad++; } }
    }
    prev = cur; season = gs().season;
  }
}
console.log(`\nslut ${g.date}, fejl ${bad}`);
