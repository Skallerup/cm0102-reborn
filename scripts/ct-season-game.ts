// Vores spils sæsontal for transfers/kontrakter (ægte tilstand, den originale database) – sammenlignes med originalens (scripts/ct-season.ts på
// sporbinærens øjebliksbillede 30/6-2002). Spiller en sæson fra spilstarten til 30/6 og tæller skifterne (Player.moves) og lønningerne (£).
// Brug: npx tsx scripts/ct-season-game.ts [world-fil]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { WANT_STATS } from '../src/game/cmContractGame';
import { SL_STATS } from '../src/game/cmShortlistGame';
import { CM_AIAI } from '../src/game/transfers';

const file = process.argv[2] ?? 'public/data/world-original.json';
const world = JSON.parse(readFileSync(file, 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
const user = world.clubs.find((c) => c[1] === 'Arsenal')?.[0] ?? world.clubs.find((c) => c[3] === eng)![0];
createGame(world, { managerName: 'Ct', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
const start = g.date;
// DAYS=n: kun n dage; CLUB=navn: klubbens skifter (begge veje) listet til sidst
const stop = process.env.DAYS ? new Date(Date.parse(start) + +process.env.DAYS * 86400000).toISOString().slice(0, 10) : `${Number(start.slice(0, 4)) + 1}-06-30`;
while (g.date < stop) {
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
// pr. engelsk køber: skifter, med sum, summen (£m)
const byClub: Record<string, { n: number; paid: number; fee: number }> = {};
for (const { mv } of moves) { const k = g.clubs[mv.to]!.name, c = (byClub[k] ??= { n: 0, paid: 0, fee: 0 }); c.n++; if ((mv.fee ?? 0) > 0) { c.paid++; c.fee += mv.fee! * GBP; } }
const bc = Object.entries(byClub).sort((a, b) => b[1].n - a[1].n);
console.log(`engelske købere: ${bc.length} klubber; skifter pr. klub (med sum, £m):`);
console.log(bc.slice(0, 25).map(([k, v]) => `${k} ${v.n} (${v.paid}, ${(v.fee / 1e6).toFixed(1)})`).join(' · '));
const mean = fees.length ? fees.reduce((a, b) => a + b, 0) / fees.length : 0;
console.log(`gennemsnitspris £${Math.round(mean)}; ønskelisterne ${SL_STATS.days} dage, ${Math.round(SL_STATS.ms / Math.max(1, SL_STATS.days))} ms pr. dag, bud ${SL_STATS.bids}`);
console.log('computer → computer-buddene', JSON.stringify(CM_AIAI), `åbne i snit ${(CM_AIAI.open / Math.max(1, CM_AIAI.openDays)).toFixed(1)}`);
const wages = ps.filter((p) => p.club && p.contract && g.clubs[p.club]?.nation === engNat).map((p) => p.contract!.wage * GBP).sort((a, b) => a - b);
const q = (f: number) => Math.round(wages[Math.floor(f * (wages.length - 1))]);
console.log(`spillere ${ps.length}, med kontrakt ${wages.length}, uden klub ${ps.filter((p) => !p.club).length}; ugeløn £ median ${q(0.5)}, 90 % ${q(0.9)}, 99 % ${q(0.99)}, max ${q(1)}`);
console.log(`ønskekontrakten (cmContractGame): ${WANT_STATS.n} kontrakter (${WANT_STATS.offered} som klubbens tilbud 0x4cda70), ${(WANT_STATS.ms / Math.max(1, WANT_STATS.n)).toFixed(1)} ms pr. stk.`);
const rs = WANT_STATS.moves.map(([a, b]) => b / Math.max(1, a)).sort((a, b) => a - b);
if (rs.length) console.log(`ny/gammel ugeløn ved klubskifte (${rs.length}): 10/50/90 % ${[0.1, 0.5, 0.9].map((f) => rs[Math.floor(f * (rs.length - 1))].toFixed(2)).join('/')}`);
if (process.env.CLUB) {
  const cl = Object.values(g.clubs).find((c) => c.name === process.env.CLUB)!;
  const rows = ps.flatMap((p) => (p.moves ?? []).filter((mv) => mv.date >= start && (mv.to === cl.id || mv.from === cl.id)).map((mv) => `${mv.date} ${p.first ?? ''} ${p.last} (${p.dob.slice(0, 4)}, CA ${p.ca}) ${g.clubs[mv.from]?.name ?? '-'} → ${g.clubs[mv.to]?.name ?? '-'} €${mv.fee}${mv.loan ? ' leje' : ''}`)).sort();
  console.log(`${cl.name}: ${rows.length}\n  ` + rows.join('\n  '));
}
