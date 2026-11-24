// Bestyrelsens kampreaktion (0x138c, cmBoard.ts afterMatch → MATCH_TEXT): nyt spil (ægte tilstand, frø 1), én sæson, alle nyhederne til
// menneskets klub med dato, overskrift og brødtekst – til sammenligning med oraklets 0x138c (s1-3.9.60-e1: 19 i sæson 1 med Arsenal).
//   WORLD=<world.json> npx tsx scripts/board-match-news.ts [klub=Arsenal] [til=2002-06-30]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { boardCmText } from '../src/game/cmBoardText';

const CLUB = process.argv[2] ?? 'Arsenal', TO = process.argv[3] ?? '2002-06-30';
const w = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world-original.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === CLUB)![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
const seen = new Set<unknown>();
let n = 0;
while (g.date < TO) {
  const r = continueGame(); if (r?.match) quickPlayUserMatch();
  for (const x of g.news) {
    if (seen.has(x)) continue;
    seen.add(x);
    if (x.key !== 'board.cm' || typeof x.params.bd !== 'string' || !x.params.bd.includes('"k":"m"')) continue;
    const d = JSON.parse(x.params.bd as string);
    const t = boardCmText(d);
    n++;
    console.log(`${x.date} 0x${d.f.toString(16)} ${t.title} | ${t.body}`);
  }
}
console.log(`i alt ${n} kampreaktioner (${CLUB}, til ${TO})`);
