// Måling: størrelsen af ønskelisternes portionstilstand (SlResume) efter portion 0 af n og tiden for portion 1 (samme proces).
// Brug: npx tsx scripts/sl-part-size.ts [world-fil] [n=6]
import { readFileSync } from 'node:fs';
import { createGameBase, createGamePhase, type NewGamePhase, type WorldData } from '../src/game/newgame';

const [file = 'public/data/world-original-normal.json', nS = '6'] = process.argv.slice(2);
const w = JSON.parse(readFileSync(file, 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
const ctx = createGameBase(w, { managerName: 'M', managerNation: eng, clubId: w.clubs.find((c) => c[3] === eng)![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
createGamePhase('fitness', ctx); createGamePhase('plan', ctx);
const mb = (n: number) => (n / 1048576).toFixed(1);
for (let k = 0; k < Number(nS); k++) {
  const t = performance.now();
  createGamePhase(`shortlists:${k}/${nS}` as NewGamePhase, ctx);
  const r = ctx.sl;
  console.log(`portion ${k}: ${((performance.now() - t) / 1000).toFixed(1)} s` + (r ? `  P ${mb(r.want.P.data.length)} MB  m ${mb(r.want.m.data.length)} MB  v ${mb(r.values.v.byteLength)} lazy ${mb(r.values.lazy.byteLength)} hændelser ${r.events.length}` : ''));
}
