// En sæson med CM 01/02's ønskelister slået til (ægte tilstand, den originale database) – tallene, K2 sammenligner med oraklet
// (docs/ORIGINAL_PARITY.md: originalen 621 køb, 226 lejeaftaler, 95 klubløse skriver under, 65 frigivne – England, Arsenal, frø 1, størrelse 2).
// Brug: npx tsx scripts/sl-season.ts [world-fil]   (DAYS=n: kun n dage; CLUB=navn, standard Arsenal)
// Tæller som scripts/cm-day-lockstep.ts (skifterne Player.moves med en engelsk klub i én af enderne), buddene på menneskets spillere,
// tid pr. dag (i alt og ønskelisterne), og økonomien (de engelske klubbers saldo, klubber i minus) – og fanger nedbrud.
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { SL_STATS, SL_ON } from '../src/game/cmShortlistGame';
import { CM_AIAI } from '../src/game/transfers';

const file = process.argv[2] ?? 'public/data/world-original.json';
const world = JSON.parse(readFileSync(file, 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
const clubName = process.env.CLUB ?? 'Arsenal';
const user = world.clubs.find((c) => c[1] === clubName)![0];
let t = performance.now();
createGame(world, { managerName: 'Sl', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
console.log(`${file}: SL_ON ${SL_ON.on}, createGame ${Math.round(performance.now() - t)} ms (ønskelisternes start ${Math.round(SL_STATS.startMs)} ms), ${g.date}`);
const start = g.date;
const stop = process.env.DAYS ? new Date(Date.parse(start) + +process.env.DAYS * 86400000).toISOString().slice(0, 10) : `${Number(start.slice(0, 4)) + 1}-06-30`;
const GBP = 0.86;
const engClub = (cid: number) => !!cid && g.clubs[cid]?.nation === eng;
const engClubs = () => Object.values(g.clubs).filter((c) => c.nation === eng && !g.leagues[c.league]?.hidden);
const bal0 = engClubs().reduce((s, c) => s + c.balance, 0), neg0 = engClubs().filter((c) => c.balance < 0).length;
const seenBid = new Set<number>();
let bidsHuman = 0, loanBidsHuman = 0, days = 0, maxDay = 0, sumDay = 0;
const slowest: [number, string][] = [];
try {
  while (g.date < stop) {
    t = performance.now();
    const r = continueGame();
    if (r?.match) quickPlayUserMatch();
    const ms = performance.now() - t;
    days++; sumDay += ms; maxDay = Math.max(maxDay, ms);
    slowest.push([ms, g.date]); slowest.sort((a, b) => b[0] - a[0]); slowest.length = Math.min(slowest.length, 5);
    for (const o of g.offers) if (o.seller === g.userClub && !seenBid.has(o.id)) { seenBid.add(o.id); if (o.loan) loanBidsHuman++; else bidsHuman++; }
    // menneskets bud besvares ikke her (de ligger og udløber) – som en manager, der ikke svarer
    if (days % 30 === 0) console.log(`  ${g.date}: ${Math.round(sumDay / days)} ms/dag (ønskelisterne ${Math.round(SL_STATS.ms / Math.max(1, SL_STATS.days))}), bud ${SL_STATS.bids}`);
  }
} catch (e) {
  console.log(`NEDBRUD ${g.date}:`, e);
}
const kinds: Record<string, number> = {};
let feeSum = 0;
for (const p of Object.values(g.players)) for (const mv of p.moves ?? []) {
  if (mv.date < start || (!engClub(mv.from) && !engClub(mv.to))) continue;
  const kind = mv.loan ? 'leje' : !mv.to ? 'kontrakt udløbet (fri)' : !mv.from ? 'klubløs skriver under' : mv.fee > 0 ? 'køb med sum' : 'køb uden sum';
  kinds[kind] = (kinds[kind] ?? 0) + 1;
  if (kind === 'køb med sum') feeSum += mv.fee * GBP;
}
console.log(`${start} → ${g.date} (${days} dage): England (køber eller sælger):`, JSON.stringify(kinds), `sum £${(feeSum / 1e6).toFixed(1)}M`);
console.log(`  originalen (K2, størrelse 2): køb med sum 621, leje 226, klubløs skriver under 95, kontrakt udløbet (fri) 65`);
const pairsMine = (g.cmSlPairs ?? []).filter(([pid]) => g.players[pid]?.club === g.userClub).length;
console.log(`ønskelisternes par (spiller, klub) med ${clubName}s spillere nu: ${pairsMine} af ${(g.cmSlPairs ?? []).length}`);
console.log(`bud på ${clubName}s spillere: ${bidsHuman} køb, ${loanBidsHuman} leje; computer → computer:`, JSON.stringify(CM_AIAI));
const bal1 = engClubs().reduce((s, c) => s + c.balance, 0), neg1 = engClubs().filter((c) => c.balance < 0).length;
console.log(`økonomi (engelske ligaklubber): saldo i alt £${(bal0 * GBP / 1e6).toFixed(0)}M → £${(bal1 * GBP / 1e6).toFixed(0)}M, i minus ${neg0} → ${neg1}; max saldo £${(Math.max(...engClubs().map((c) => c.balance)) * GBP / 1e6).toFixed(1)}M, min £${(Math.min(...engClubs().map((c) => c.balance)) * GBP / 1e6).toFixed(1)}M`);
const sq = engClubs().map((c) => Object.values(g.players).filter((p) => p.club === c.id && !p.virtual).length).sort((a, b) => a - b);
console.log(`trupper (engelske ligaklubber): min ${sq[0]}, median ${sq[sq.length >> 1]}, max ${sq[sq.length - 1]}; klubløse i alt ${Object.values(g.players).filter((p) => !p.club && !p.virtual).length}`);
console.log(`tid: ${Math.round(sumDay / Math.max(1, days))} ms/dag i snit (ønskelisterne ${Math.round(SL_STATS.ms / Math.max(1, SL_STATS.days))} ms/dag), langsomste ${slowest.map(([ms, d]) => `${d} ${Math.round(ms)}`).join(', ')}`);
