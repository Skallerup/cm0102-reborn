// 2026/27 i ægte tilstand: spillere, der skifter klub flere gange kort efter hinanden (videresalg af nyligt købte) – sideopgave til MODERN_PARITY 3.
// npx tsx scripts/cm-resale-2026.ts [til-dato] [frø] [db: 2026|2001]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { daysBetween } from '../src/game/dates';

const until = process.argv[2] ?? '2026-09-01';
const db = process.argv[4] ?? '2026';
const w = (db === '2001' ? JSON.parse(readFileSync('public/data/world-original.json', 'utf8'))
  : Object.assign(JSON.parse(readFileSync('public/data/world.json', 'utf8')), JSON.parse(readFileSync('public/data/world-cm.json', 'utf8')))) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
const name = process.argv[5] ?? (db === '2001' ? 'Bradford City' : 'Brentford');
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === name || c[2] === name)![0], activeNations: [eng], lang: 'en', masking: true,
  seed: Number(process.argv[3] ?? 1), mode: 'authentic' });
const g = gs();
const start = g.date;
let days = 0;
while (g.date < until && days++ < 420) {
  const r = continueGame();
  if (r.match !== undefined) quickPlayUserMatch();
}
const moves = (p: (typeof g.players)[number]) => (p.moves ?? []).filter((m) => m.date >= start && !m.loan && m.from && m.to);
const multi = Object.values(g.players).map((p) => ({ p, mv: moves(p) })).filter((x) => x.mv.length >= 2);
let fast = 0;
for (const { mv } of multi) if (Math.min(...mv.slice(1).map((m, i) => daysBetween(mv[i].date, m.date))) <= 60) fast++;
const all = Object.values(g.players).reduce((s, p) => s + moves(p).length, 0);
console.log(`${start} → ${g.date}: klub→klub ${all} · spillere med ≥2 skifter ${multi.length} · heraf ≤60 dage imellem ${fast}`);
for (const { p, mv } of multi.slice(0, 25)) console.log(`  ${p.first} ${p.last}: ` + mv.map((m) => `${m.date} ${g.clubs[m.from!]?.short ?? m.from}→${g.clubs[m.to!]?.short ?? m.to} ${((m.fee ?? 0) / 1e6).toFixed(1)}m`).join(' | '));
