// Spillerens forløb 20/11 (iPad: "kan ikke komme forbi juni 2002, 36/38 ligakampe"): Man Utd, den originale database, ægte tilstand, menneske-
// manager – hele sæsonen dag for dag med Continue-flowet (egne kampe som quickPlayUserMatch) til en slutdato. Måler pr. dag den levende heap
// (efter gc) og toppen undervejs (prøver i ønskelisternes klubløkke), tid pr. dag, fanger exceptions, og viser til sidst egne uspillede ligakampe.
// Brug: node --expose-gc --import tsx scripts/season-end-check.ts [slut=2002-07-15] [frø=1] [world-fil]
//   SAVE=<dato>:<fil>  gem tilstanden (v8) ved datoen; LOAD=<fil> start derfra. FROM=<dato> skriv kun dage fra datoen. CLONE=1 som dagens Worker
//   (kopi frem/tilbage pr. Continue-kørsel). HOLIDAY=<dato> tag på ferie fra datoen (assistenten, autoPlay) til slutdatoen.
import { readFileSync, writeFileSync } from 'node:fs';
import { serialize, deserialize } from 'node:v8';
import { gunzipSync, gzipSync } from 'node:zlib';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs, setGame, indexSnapshot, restoreIndexes, packCarry, notify } from '../src/game/state';
import { rng } from '../src/game/rng';
import { SL_PROGRESS } from '../src/game/cmShortlistGame';

const until = process.argv[2] ?? '2002-07-15';
const seed = Number(process.argv[3] ?? 1);
const file = process.argv[4] ?? 'public/data/world-original.json';
const gc = (globalThis as { gc?: () => void }).gc ?? (() => {});
const MB = (v: number) => (v / 1048576).toFixed(0);
let peak = 0;
const sample = () => { const u = process.memoryUsage(); peak = Math.max(peak, u.heapUsed + u.arrayBuffers); };
SL_PROGRESS.cb = sample;

if (process.env.LOAD) {
  const s = deserialize(gunzipSync(readFileSync(process.env.LOAD))) as { game: Parameters<typeof setGame>[0]; idx: Parameters<typeof restoreIndexes>[0]; rng: number };
  setGame(s.game); restoreIndexes(s.idx); rng.state = s.rng;
} else {
  const world = JSON.parse(readFileSync(file, 'utf8')) as WorldData;
  const eng = world.nations.findIndex((x) => x.name === 'England');
  const mu = world.clubs.find((c) => c[1] === (process.env.CLUB ?? 'Manchester United'))![0];
  createGame(world, { managerName: 'Richard Daubney', managerNation: eng, clubId: mu, activeNations: [eng], lang: 'en', masking: true, seed, mode: 'authentic' });
}
const g0 = gs();
console.log(`start ${g0.date} engine ${g0.options.engine}`);
const [saveDate, saveFile] = (process.env.SAVE ?? ':').split(':');
const from = process.env.FROM ?? '';
// (function ownLeague is hoisted)
const holiday = process.env.HOLIDAY ?? '';
const CLONE = process.env.CLONE === '1';

function oneDay(): void {
  const g = gs(), start = g.date;
  for (let i = 0; i < 50; i++) {
    const r = continueGame();
    if (r?.match !== undefined) quickPlayUserMatch();
    if (g.date !== start && g.dayDone && !g.pendingFixture) return;
  }
  throw new Error(`dagen ${start} kommer ikke videre (date ${g.date} dayDone ${g.dayDone} pending ${g.pendingFixture})`);
}
function cloneRound(): void {
  gs().rng = rng.state; packCarry(gs());
  const msg = structuredClone({ game: gs(), idx: indexSnapshot() });
  delete gs().cmCarry;
  sample();
  setGame(msg.game); restoreIndexes(msg.idx);
  oneDay();
  notify(); packCarry(gs());
  const back = structuredClone({ game: gs(), idx: indexSnapshot() });
  sample();
  setGame(back.game); restoreIndexes(back.idx);
}

let worst = { mb: 0, date: '' };
while (gs().date < until) {
  const g = gs();
  if (holiday && g.date >= holiday && !g.manager.holiday) g.manager.holiday = {};
  // egne kampe, hvis dato er passeret uden resultat (sim.ts playMissedUserFixtures redder dem – her ses, om det overhovedet sker)
  for (const f of Object.values(g.fixtures)) if (!f.result && f.date < g.date && f.comp !== 'FRIENDLY' && (f.home === g.userClub || f.away === g.userClub) && g.comps[f.comp] && !g.comps[f.comp].finished) console.log(`SPRUNGET OVER ${f.id} ${f.comp} ${f.date} ${g.clubs[f.home]?.name} - ${g.clubs[f.away]?.name}`);
  peak = 0;
  const t0 = Date.now();
  try {
    if (CLONE) cloneRound(); else oneDay();
  } catch (e) {
    console.log(`EXCEPTION ${gs().date}: ${(e as Error).stack}`);
    process.exit(1);
  }
  sample();
  gc();
  const u = process.memoryUsage();
  if (peak > worst.mb) worst = { mb: peak, date: gs().date };
  if (gs().date >= from) console.log(`${gs().date} ${String(Date.now() - t0).padStart(6)} ms  levende ${MB(u.heapUsed)}+${MB(u.arrayBuffers)} MB  top ${MB(peak)} MB  nyheder ${gs().news.length}`);
  if (gs().date === (process.env.CHECK ?? '2002-06-19')) ownLeague(gs().date);
  if (saveFile && gs().date === saveDate) {
    gs().rng = rng.state; packCarry(gs());
    writeFileSync(saveFile, gzipSync(serialize({ game: gs(), idx: indexSnapshot(), rng: rng.state })));
    delete gs().cmCarry;
    console.log(`gemt ${saveFile}`);
  }
}
function ownLeague(label: string) {
  const g = gs();
  const lg = g.clubs[g.userClub]?.league;
  if (!lg) return;
  const mine = Object.values(g.fixtures).filter((f) => f.comp === lg && (f.home === g.userClub || f.away === g.userClub));
  const unplayed = mine.filter((f) => !f.result);
  console.log(`${label}: egne ligakampe ${mine.length - unplayed.length}/${mine.length} spillet`);
  for (const f of unplayed) console.log(`  uspillet ${f.id} ${f.date} ${g.clubs[f.home]?.name} - ${g.clubs[f.away]?.name}`);
}
const g = gs();
console.log(`største top ${MB(worst.mb)} MB (${worst.date})`);
ownLeague('slut');
const lg = g.clubs[g.userClub].league;
const comp = g.comps[lg];
const allLeague = Object.values(g.fixtures).filter((f) => f.comp === lg);
console.log(`hele ligaen: ${allLeague.filter((f) => f.result).length}/${allLeague.length} spillet (comp ${comp?.name ?? lg})`);
