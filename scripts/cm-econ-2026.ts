// 2026/27 i ægte tilstand (MODERN_PARITY 1+4): økonomien over en sæson – klubber i minus, lønsum, transfers, klubløse – pr. førsteliga.
// npx tsx scripts/cm-econ-2026.ts [sæsoner] [klub] [authentic|extended]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs, squad } from '../src/game/state';
import { WANT_STATS } from '../src/game/cmContractGame';

const seasons = Number(process.argv[2] ?? 1);
const w = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData & { cmRaw?: unknown };
w.cmRaw = (JSON.parse(readFileSync('public/data/world-cm.json', 'utf8')) as { cmRaw?: unknown }).cmRaw;
const NATS = ['Denmark', 'England', 'Spain', 'Germany'];
const nats = NATS.map((n) => w.nations.findIndex((x) => x.name === n));
const name = process.argv[3] ?? 'Vejle Boldklub';
const mode = (process.argv[4] ?? 'authentic') as 'authentic' | 'extended';
createGame(w, { managerName: 'E', managerNation: nats[0], clubId: w.clubs.find((c) => c[1] === name)![0], activeNations: nats, lang: 'da', masking: true, seed: 3, mode });
const g = gs();
const m = (v: number) => `${(v / 1e6).toFixed(2)}m`;
const med = (xs: number[]) => { const s = xs.slice().sort((a, b) => a - b); return s[Math.floor(s.length / 2)] ?? 0; };
const t0 = performance.now();
function report(label: string) {
  console.log(`--- ${label} (${g.date})`);
  const since = `${Number(g.date.slice(0, 4)) - 1}${g.date.slice(4)}`;
  for (const lg of Object.values(g.comps).filter((c) => c.type === 'league' && c.tier === 1 && nats.includes(c.nation))) {
    const clubs = lg.clubs.map((id) => g.clubs[id]);
    const wb = clubs.map((c) => squad(c.id).reduce((s, p) => s + (p.contract?.wage ?? 0), 0));
    const ids = new Set(lg.clubs);
    const moves = Object.values(g.players).flatMap((p) => (p.moves ?? []).filter((mv) => mv.date > since && (ids.has(mv.to) || ids.has(mv.from))));
    const fees = moves.filter((mv) => (mv.fee ?? 0) > 0 && ids.has(mv.to)).map((mv) => mv.fee!);
    console.log(`${lg.name.slice(0, 26).padEnd(27)} minus ${clubs.filter((c) => c.balance < 0).length}/${clubs.length} · saldo(med) ${m(med(clubs.map((c) => c.balance)))} · lønsum/uge med ${m(med(wb))} i alt ${m(wb.reduce((a, b) => a + b, 0))} · trup(med) ${med(clubs.map((c) => squad(c.id).length))} · køb ${fees.length} for ${m(fees.reduce((a, b) => a + b, 0))} (med ${m(med(fees))}, max ${m(Math.max(0, ...fees))}) · skifter ${moves.length}`);
  }
  const free = Object.values(g.players).filter((p) => !p.club);
  console.log(`klubløse ${free.length} · aiTerms ${WANT_STATS.n} (tilbud ${WANT_STATS.offered}, ${Math.round(WANT_STATS.ms)} ms) · ${Math.round(performance.now() - t0)} ms`);
}
report('start');
const end = g.season + seasons;
let days = 0;
while (g.season < end && days++ < 420 * seasons) {
  const r = continueGame();
  if (r.match !== undefined) quickPlayUserMatch();
  if (g.date.endsWith('-01-15')) report('midt');
}
report('slut');
