// Computerens bud med originalens vilkår (cmAiBid.ts, build_bid 0x8e5d60): fordelingen af klausuler for spillerne i en klub.
//   npx tsx scripts/cm-aibid.ts [klub] [antal købere]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { cmBuildBid } from '../src/game/cmAiBid';

const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((n) => n.name === 'England');
createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === (process.argv[2] ?? 'Arsenal'))![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
const lg = g.clubs[g.userClub!].league;
const all = Object.values(g.clubs).filter((c) => c.id !== g.userClub && !g.leagues[c.league]?.hidden);
const buyers = all.filter((_c, i) => i % Math.max(1, Math.floor(all.length / +(process.argv[3] ?? 5))) === 0);
void lg;
const mine = Object.values(g.players).filter((p) => p.club === g.userClub);
const tally = { n: 0, none: 0, rates: 0, sell: 0, lg: 0, int: 0, pub: 0 };
const t0 = performance.now();
for (const p of mine) for (const b of buyers) {
  const r = cmBuildBid(g, p, b.id, Math.round((p.value / 0.86) * 1.1));
  if (!r) { tally.none++; continue; }
  tally.n++; if (r.months) tally.rates++; if (r.sellOn) tally.sell++; if (r.lgFee) tally.lg++; if (r.intFee) tally.int++; if (r.pub) tally.pub++;
  if (tally.n <= 8) console.log(p.name, '<-', b.name, JSON.stringify(r), 'value', Math.round(p.value));
}
console.log(tally, Math.round(performance.now() - t0), 'ms');
