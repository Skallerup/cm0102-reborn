// Konverteringen af gamle gemte spil (src/game/cmConvert.ts) på et simuleret gammelt spil: et spil med den originale database i udvidet tilstand
// spilles DAYS dage, originalens lag fjernes og egenskaberne pustes op (tests/helpers/legacySave.ts), spillet konverteres og spilles SEASONS sæsoner
// i ægte tilstand. Kør: DAYS=300 SEASONS=3 npx tsx scripts/convert-soak.ts [world-fil] [klub]   (exit 1 ved fejl)
import { readFileSync, writeFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs, setGame } from '../src/game/state';
import { convertOptions, convertOriginal, convertProblems } from '../src/game/cmConvert';
import { saveKindOf } from '../src/game/saveKind';
import type { CMWorld } from '../src/game/data/cm0102';
import { makeLegacy } from '../tests/helpers/legacySave';

const file = process.argv[2] ?? 'public/data/world-original.json';
const clubName = process.argv[3] ?? 'Arsenal';
const DAYS = Number(process.env.DAYS ?? 300), SEASONS = Number(process.env.SEASONS ?? 3);
const world = JSON.parse(readFileSync(file, 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
const club = world.clubs.find((c) => c[1] === clubName)![0];
let probs: string[] = [];
if (process.env.LOAD_FROM) setGame(JSON.parse(readFileSync(process.env.LOAD_FROM, 'utf8')));
else {
  const t0 = Date.now();
  createGame(world, { managerName: 'Old Save', managerNation: eng, clubId: club, activeNations: [eng], lang: 'en', masking: true, seed: 7, mode: 'extended' });
  const play = (n: number) => { for (let i = 0; i < n; i++) { const r = continueGame(); if (r?.match) quickPlayUserMatch(); } };
  play(DAYS);
  const old = makeLegacy(gs());
  console.log(`gammelt spil ${old.date} (${((Date.now() - t0) / 1000).toFixed(0)} s), slags: ${saveKindOf(old)}`);
  const t1 = Date.now();
  createGame(world, convertOptions(old, world as CMWorld, 'en'));
  const rep = convertOriginal(old, gs(), world as CMWorld);
  console.log(`konverteret (${((Date.now() - t1) / 1000).toFixed(1)} s):`, JSON.stringify(rep), 'slags:', saveKindOf(gs()));
  probs = convertProblems(gs());
  console.log(`konsistens: ${probs.length} problemer`, probs.slice(0, 10));
  if (process.env.SAVE_TO) writeFileSync(process.env.SAVE_TO, JSON.stringify(gs()));
}
// som et gemt spil: JSON frem og tilbage
setGame(JSON.parse(JSON.stringify(gs())));
const errors: string[] = [];
const g0 = gs();
const endSeason = g0.season + SEASONS;
let days = 0;
const t2 = Date.now();
try {
  while (gs().season < endSeason && days < (+(process.env.MAXDAYS ?? 400 * SEASONS))) {
    const r = continueGame();
    if (r?.match) quickPlayUserMatch();
    days++;
    if (days % (+(process.env.EVERY ?? 60)) === 0) console.log(`  ${gs().date} (${((Date.now() - t2) / days).toFixed(0)} ms/dag)`);
  }
} catch (e) { errors.push(`${gs().date}: ${(e as Error).stack}`); }
const g = gs();
for (const p of Object.values(g.players)) {
  if (p.virtual) continue;
  if (p.attrs.some((v) => !Number.isFinite(v) || v < 1 || v > 20)) { errors.push(`${p.id} ${p.last}: egenskaber uden for 1..20`); if (errors.length > 20) break; }
  if (p.pa >= 1 && p.ca > p.pa + 0.5) errors.push(`${p.id} ${p.last}: CA ${p.ca} > PA ${p.pa}`);
}
const tables = Object.values(g.comps).filter((c) => c.type === 'league' && g.activeNations.includes(c.nation));
console.log(`efter ${days} dage: ${g.date}, sæson ${g.season}, ligaer ${tables.length}, klubbens saldo ${Math.round(g.clubs[g.userClub]?.balance ?? 0)}, manager i ${g.clubs[g.userClub]?.name ?? '–'}`);
if (probs.length) errors.push(`${probs.length} konsistensproblemer efter konverteringen`);
if (errors.length) { console.log('FEJL:\n' + errors.slice(0, 30).join('\n')); process.exit(1); }
console.log('OK');
