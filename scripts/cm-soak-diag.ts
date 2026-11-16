// Fejlsøgning af langtidsfundene (udløbne kontrakter og klubber i minus) i ægte tilstand med den originale database.
// Kør: MODE=authentic ENGINE=original npx tsx scripts/cm-soak-diag.ts <til-dato> [world-fil] [klub]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { cmCmScope } from '../src/game/cmContractManager';

const until = process.argv[2] ?? '2002-08-15';
const file = process.argv[3] ?? 'public/data/world-original.json';
const clubName = process.argv[4] ?? 'Manchester United';
const world = JSON.parse(readFileSync(file, 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
const user = world.clubs.find((c) => c[1] === clubName)![0];
createGame(world, { managerName: 'Soak', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: 11, mode: 'authentic' });
const g = gs();
if (process.env.ENGINE === 'original') g.options.engine = 'original';
const bal0 = new Map(Object.values(g.clubs).map((c) => [c.id, c.balance]));
const m = (v: number) => `${(v / 1e6).toFixed(2)}m`;
function report(label: string) {
  const cat: Record<string, number> = {};
  const ex: string[] = [];
  for (const p of Object.values(g.players)) {
    if (!(p.club && p.contract && p.contract.expires < g.date && !p.loan)) continue;
    const c = g.clubs[p.club];
    const k = `${cmCmScope(g, p) ? (g.activeNations?.includes(c.nation) ? "scope" : "scopeF") : g.leagues[c.league]?.hidden ? "hidden" : g.activeNations?.includes(c.nation) ? "active-other" : "inactive"}${p.contract.cmType ? ':t' + p.contract.cmType : ''}`;
    cat[k] = (cat[k] ?? 0) + 1;
    if (k.startsWith('scopeF') && ex.length < 8) ex.push(`${p.first} ${p.last} (${c.name}, ${p.contract.expires}, ${Math.floor((Date.parse(g.date) - Date.parse(p.dob)) / 3.15576e10)} år, st ${p.cmContract?.b4f ? p.cmContract.b4f >> 4 : '?'}, ca ${p.ca})`);
  }
  const neg: Record<string, number> = {};
  for (const c of Object.values(g.clubs)) if (c.balance < 0) {
    const k = `${g.leagues[c.league]?.hidden ? 'H ' : ''}${g.nations[c.nation]?.name}`;
    neg[k] = (neg[k] ?? 0) + 1;
  }
  const nneg = Object.values(neg).reduce((a, b) => a + b, 0);
  console.log(`${label} ${g.date}: udløbne ${JSON.stringify(cat)} · minus ${nneg} ${JSON.stringify(Object.entries(neg).sort((a, b) => b[1] - a[1]).slice(0, 10))}`);
  for (const e of ex) console.log('   ', e);
}
report('start');
const worst = () => Object.values(g.clubs).filter((c) => c.balance < 0 && !g.activeNations!.includes(c.nation)).sort((a, b) => (a.balance - bal0.get(a.id)!) - (b.balance - bal0.get(b.id)!)).slice(0, 6);
let last = g.season;
for (let i = 0; i < 1000 && g.date < until; i++) {
  const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch();
  if (g.date.slice(5) === '06-29' || g.season !== last) {
    last = g.season;
    report('dag');
    for (const c of worst()) console.log(`    ${c.name} (${g.nations[c.nation]?.name}${g.leagues[c.league]?.hidden ? ', skjult' : ''}) ${m(bal0.get(c.id)!)} → ${m(c.balance)} fin ${JSON.stringify(Object.fromEntries(Object.entries(c.finance).filter(([, v]) => v)))}`);
  }
}
report('slut');
