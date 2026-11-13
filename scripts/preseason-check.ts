// Forsæsonen i den originale database (ægte tilstand): skadede ved spilstart og venskabskampe.
//   npx tsx scripts/preseason-check.ts [klub] [frø]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { cmFitRead } from '../src/game/cmFitnessGame';

const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
const clubName = process.argv[2] || 'Man Utd';
const seed = Number(process.argv[3] || 1);
const t0 = Date.now();
createGame(world, { managerName: 'T', managerNation: eng, clubId: world.clubs.find((c) => c[1] === clubName || c[2] === clubName)![0], activeNations: [eng], lang: 'en', masking: true, seed, mode: 'authentic' });
const ms = Date.now() - t0;
const g = gs();
const rd = cmFitRead(g);
const plIds = new Set(g.comps['CM7']?.clubs ?? []);
let inj = 0, any = 0;
const rows: string[] = [];
for (const p of Object.values(g.players)) {
  if (!p.club || !plIds.has(p.club) || p.regen) continue;
  const e = rd.injury(p);
  if (p.injury) any++;
  if (e) { inj++; rows.push(`${g.clubs[p.club].name}: ${p.first} ${p.last} w28=${e.w28}`); }
}
console.log(`nyt spil ${ms} ms, dato ${g.date}, PL-klubber ${plIds.size}, skadede (cmFit) ${inj}, p.injury ${any}`);
console.log(rows.slice(0, 40).join('\n'));
const me = g.userClub;
const fr = Object.values(g.fixtures).filter((f) => (f.home === me || f.away === me) && f.date < '2001-08-18').sort((a, b) => a.date.localeCompare(b.date));
console.log('egne kampe før 18/8:\n' + fr.map((f) => `${f.date} ${f.comp} ${g.clubs[f.home]?.name}-${g.clubs[f.away]?.name}`).join('\n'));
if (process.env.PL_IDS) console.log('PL', [...plIds].join(','));
const frs = Object.values(g.fixtures).filter((f) => f.comp === 'FRIENDLY');
console.log(`venskabskampe ved start: ${frs.length}, ventende: ${g.cmFrPending?.length ?? 0}`);
for (const c of [...plIds]) {
  const l = frs.filter((f) => f.home === c || f.away === c).sort((a, b) => a.date.localeCompare(b.date));
  const opp = (f: (typeof l)[number]) => g.clubs[f.home === c ? f.away : f.home];
  console.log(g.clubs[c].short, l.length, l.map((f) => `${f.date.slice(5)} ${f.home === c ? 'H' : 'A'} ${opp(f).short} (${g.nations[opp(f).nation]?.code})`).join(', '));
}
if (process.env.RUN) {
  const { continueGame, quickPlayUserMatch } = await import('../src/game/sim');
  const t1 = Date.now(); let n = 0;
  while (g.date < '2001-08-18' && n < 80) { const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); n++; }
  const all = Object.values(g.fixtures).filter((f) => f.comp === 'FRIENDLY');
  console.log(`Continue til ${g.date}: ${Date.now() - t1} ms (${n} kald), venskabskampe ${all.length}, spillet ${all.filter((f) => f.result).length}`);
  const inj = Object.values(g.players).filter((p) => p.club && plIds.has(p.club) && p.injury).length;
  console.log(`PL skadede ${g.date}: ${inj}`);
}
