// 2026/27 i ægte tilstand (MODERN_PARITY 3): computerklubbernes marked over en sæson – transfers mellem computerklubber, gebyrer pr. liga,
// klubløse, saldo efter sæsonen. Spillet startes som K2 på 2026/27 (England, Brentford, frø 1, ægte tilstand).
// npx tsx scripts/cm-market-2026.ts [til-dato] [klub] [frø]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs, squad } from '../src/game/state';
import { isHumanClub } from '../src/game/humans';

const until = process.argv[2] ?? '2027-06-30';
const w = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData & { cmRaw?: unknown };
Object.assign(w, JSON.parse(readFileSync('public/data/world-cm.json', 'utf8')));
const eng = w.nations.findIndex((x) => x.name === 'England');
const name = process.argv[3] ?? 'Brentford';
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === name || c[2] === name)![0], activeNations: [eng], lang: 'en', masking: true,
  seed: Number(process.argv[4] ?? 1), mode: 'authentic' });
const g = gs();
const m = (v: number) => `${(v / 1e6).toFixed(2)}m`;
const med = (xs: number[]) => { const s = xs.slice().sort((a, b) => a - b); return s[Math.floor(s.length / 2)] ?? 0; };
const start = g.date, t0 = performance.now();
const bal0 = new Map(Object.values(g.clubs).map((c) => [c.id, c.balance]));
console.log(`start ${start} · cmPlan ${g.cmPlan ? Object.keys(g.cmPlan).length : 0} klubber`);
if (g.cmGbp) console.log(`€→£ k ${g.cmGbp.k} · ` + Object.entries(g.cmGbp.leagues).filter(([l]) => g.leagues[l]?.tier === 1).map(([l, v]) => `${g.leagues[l].name.slice(0, 14)} ${v}`).join(' · '));
function report(label: string) {
  console.log(`--- ${label} (${g.date})`);
  const moves = Object.values(g.players).flatMap((p) => (p.moves ?? []).filter((mv) => mv.date >= start).map((mv) => ({ ...mv, p })));
  const ai = moves.filter((mv) => !mv.loan && mv.from && mv.to && !isHumanClub(mv.from) && !isHumanClub(mv.to) && g.clubs[mv.from] && g.clubs[mv.to]);
  console.log(`skifter ${moves.length} · computer→computer ${ai.length} (med gebyr ${ai.filter((x) => (x.fee ?? 0) > 0).length}) · fri→klub ${moves.filter((x) => !x.from && x.to).length} · klub→fri ${moves.filter((x) => x.from && !x.to).length}`);
  const lgs = Object.values(g.comps).filter((c) => c.type === 'league' && !g.leagues[c.id]?.hidden && c.clubs.length);
  for (const lg of lgs) {
    const ids = new Set(lg.clubs), clubs = lg.clubs.map((id) => g.clubs[id]);
    const buys = ai.filter((mv) => ids.has(mv.to) && (mv.fee ?? 0) > 0).map((mv) => mv.fee!);
    const sells = ai.filter((mv) => ids.has(mv.from) && (mv.fee ?? 0) > 0).length;
    const d = clubs.map((c) => c.balance - (bal0.get(c.id) ?? 0));
    console.log(`${lg.name.slice(0, 26).padEnd(27)} køb ${String(buys.length).padStart(3)} for ${m(buys.reduce((a, b) => a + b, 0)).padStart(8)} (med ${m(med(buys))}, max ${m(Math.max(0, ...buys))}) · salg ${sells} · minus ${clubs.filter((c) => c.balance < 0).length}/${clubs.length} · saldo(med) ${m(med(clubs.map((c) => c.balance)))} · Δsaldo(med) ${m(med(d))} · trup(med) ${med(clubs.map((c) => squad(c.id).length))}`);
  }
  const all = Object.values(g.clubs).filter((c) => !g.leagues[c.league]?.hidden);
  console.log(`alle synlige klubber: minus ${all.filter((c) => c.balance < 0).length}/${all.length} · klubløse ${Object.values(g.players).filter((p) => !p.club).length} · ${Math.round(performance.now() - t0)} ms`);
  const top = ai.filter((x) => (x.fee ?? 0) > 0).sort((a, b) => b.fee! - a.fee!).slice(0, 8);
  for (const x of top) console.log(`  ${x.date} ${x.p.first} ${x.p.last} ${g.clubs[x.from!]?.name} → ${g.clubs[x.to!]?.name} ${m(x.fee!)}`);
}
report('start');
let days = 0;
while (g.date < until && days++ < 420) {
  const r = continueGame();
  if (r.match !== undefined) quickPlayUserMatch();
  if (g.date.endsWith('-09-01') || g.date.endsWith('-02-01')) report('vindue');
}
report('slut');
