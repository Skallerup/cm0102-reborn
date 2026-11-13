// Vores spils sæsontal for transfers/kontrakter (ægte tilstand, den originale database) – sammenlignes med originalens (scripts/ct-season.ts på
// sporbinærens øjebliksbillede 30/6-2002). Spiller en sæson fra spilstarten til 30/6 og tæller skifterne (Player.moves) og lønningerne (£).
// Brug: npx tsx scripts/ct-season-game.ts [world-fil]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';

const file = process.argv[2] ?? 'public/data/world-original.json';
const world = JSON.parse(readFileSync(file, 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
const user = world.clubs.find((c) => c[1] === 'Arsenal')?.[0] ?? world.clubs.find((c) => c[3] === eng)![0];
createGame(world, { managerName: 'Ct', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
const start = g.date;
while (g.date < `${Number(start.slice(0, 4)) + 1}-06-30`) {
  const r = continueGame();
  if (r?.match) quickPlayUserMatch();
}
const GBP = 0.86;
const ps = Object.values(g.players);
const engNat = g.clubs[user]?.nation;
const moves = ps.flatMap((p) => (p.moves ?? []).filter((mv) => mv.date >= start && g.clubs[mv.to]?.nation === engNat).map((mv) => ({ p, mv })));
const paid = moves.filter((x) => (x.mv.fee ?? 0) > 0), loans = moves.filter((x) => x.mv.loan), free = moves.filter((x) => !(x.mv.fee ?? 0) && !x.mv.loan);
const fees = paid.map((x) => x.mv.fee! * GBP).sort((a, b) => a - b);
console.log(`(engelske købere/klubber) ${start} → ${g.date}: skifter ${moves.length}: betalte ${paid.length} (sum £${(fees.reduce((a, b) => a + b, 0) / 1e6).toFixed(1)}m, median £${Math.round(fees[fees.length >> 1] ?? 0)}, max £${Math.round(fees[fees.length - 1] ?? 0)}), frie ${free.length}, lejeaftaler ${loans.length}`);
const wages = ps.filter((p) => p.club && p.contract && g.clubs[p.club]?.nation === engNat).map((p) => p.contract!.wage * GBP).sort((a, b) => a - b);
const q = (f: number) => Math.round(wages[Math.floor(f * (wages.length - 1))]);
console.log(`spillere ${ps.length}, med kontrakt ${wages.length}, uden klub ${ps.filter((p) => !p.club).length}; ugeløn £ median ${q(0.5)}, 90 % ${q(0.9)}, 99 % ${q(0.99)}, max ${q(1)}`);
