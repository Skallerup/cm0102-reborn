// Økonomien over flere sæsoner: hænger penge, værdier og transfers sammen? Sammenlign den originale database
// (2001-priser, econ.ts) med standarddatabasen – forholdstallene bør ligne hinanden.
// Kør: npx tsx scripts/econ-run.ts [sæsoner] [world-fil]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs, squad } from '../src/game/state';
import { econ } from '../src/game/econ';
import { monthlyFigures } from '../src/game/finance';

const seasons = Number(process.argv[2] ?? 3);
const world = JSON.parse(readFileSync(process.argv[3] ?? 'public/data/world-original.json', 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
const user = world.clubs.find((c) => c[1] === 'Brøndby IF')?.[0] ?? world.clubs.at(-1)![0];
createGame(world, { managerName: 'E', managerNation: eng, clubId: user, activeNations: [eng], lang: 'da', masking: true, seed: 3 });
const g = gs();
const m = (v: number) => `${(v / 1e6).toFixed(1)}m`;
const med = (xs: number[]) => { const s = xs.slice().sort((a, b) => a - b); return s[Math.floor(s.length / 2)] ?? 0; };
const pl = () => Object.values(g.comps).find((c) => c.type === 'league' && c.tier === 1 && c.nation === eng)!;
function report(label: string) {
  const clubs = pl().clubs.map((id) => g.clubs[id]);
  const sv = clubs.map((c) => squad(c.id).reduce((s, p) => s + p.value, 0));
  const wages = clubs.map((c) => squad(c.id).reduce((s, p) => s + (p.contract?.wage ?? 0), 0) * 52);
  const income = clubs.map((c) => { const f = monthlyFigures(c); return (f.tv + f.sponsor + f.merch) * 12; });
  const fees = Object.values(g.players).flatMap((p) => (p.moves ?? []).filter((mv) => mv.date.slice(0, 4) >= String(g.season - 1) && (mv.fee ?? 0) > 0).map((mv) => mv.fee!));
  const best = Object.values(g.players).filter((p) => p.club && pl().clubs.includes(p.club)).sort((a, b) => b.value - a.value)[0];
  console.log(`${label} econ ${econ()} · PL median: trupværdi ${m(med(sv))} · saldo ${m(med(clubs.map((c) => c.balance)))} (saldo/trup ${(med(clubs.map((c) => c.balance)) / med(sv)).toFixed(2)}) · løn/år ${m(med(wages))} · faste indtægter/år ${m(med(income))} (løn/indtægt ${(med(wages) / med(income)).toFixed(2)}) · transferbudget ${m(med(clubs.map((c) => c.transferBudget)))}`);
  console.log(`   dyreste spiller ${best?.last} ${m(best?.value ?? 0)} · transfers seneste år: ${fees.length}, median ${m(med(fees))}, max ${m(Math.max(0, ...fees))} (max/trupmedian ${(Math.max(0, ...fees) / med(sv)).toFixed(2)}) · klubber i minus ${clubs.filter((c) => c.balance < 0).length}`);
}
report('start');
const end = g.season + seasons;
let days = 0;
while (g.season < end && days++ < 420 * seasons) {
  const r = continueGame();
  if (r.match !== undefined) quickPlayUserMatch();
  if (g.date.endsWith('-06-29')) report(String(g.season));
}
