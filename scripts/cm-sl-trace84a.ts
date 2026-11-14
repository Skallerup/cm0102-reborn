// Hvilke blokke i make_club_bids 0x84a020 kører (antal pr. blokadresse) på dag N (efter spilstarten, CM_SL slået til) – til at se, hvor
// pladserne med et mål forlader løkken uden bud.   npx tsx scripts/cm-sl-trace84a.ts [dag] [fra-hex] [til-hex]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { SL_ON, SL_DIAG } from '../src/game/cmShortlistGame';
import { TRACE } from '../src/game/cmGen/x86';

SL_ON.on = true;
const day = +(process.argv[2] ?? 10);
const lo = parseInt(process.argv[3] ?? '84a020', 16), hi = parseInt(process.argv[4] ?? '84abc0', 16);
const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((n) => n.name === 'England');
createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
const cnt = new Map<number, number>();
let on = false;
SL_DIAG.after = () => { if (on) { TRACE.on = true; TRACE.f = (pc) => { if (pc >= lo && pc < hi) cnt.set(pc, (cnt.get(pc) ?? 0) + 1); }; } };
SL_DIAG.end = () => { TRACE.on = false; };
for (let d = 0; d <= day; d++) {
  on = d === day;
  const r = continueGame();
  if (r?.match) quickPlayUserMatch();
}
console.log(g.date);
for (const [a, n] of [...cnt].sort((x, y) => x[0] - y[0])) console.log(a.toString(16), n);
