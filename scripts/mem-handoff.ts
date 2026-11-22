// Spilstartens overdragelser mellem trin-arbejderne (ui/newGameWorker.ts): størrelsen (v8.serialize ≈ structuredClone) af spillet pr. felt efter hvert trin.
// Brug: [PREVIEW=1] [PH=fitness,plan] npx tsx scripts/mem-handoff.ts [world-fil] [land=England]
import { readFileSync } from 'node:fs';
import { serialize } from 'node:v8';
import { createGameBase, createGamePhase, type NewGamePhase, type WorldData } from '../src/game/newgame';
import { gs, packCarry } from '../src/game/state';
const [file = 'public/data/world-original-normal.json', nat = 'England'] = process.argv.slice(2);
const w = JSON.parse(readFileSync(file, 'utf8')) as WorldData;
const act = w.nations.findIndex((x) => x.name === nat);
const eng = w.nations.findIndex((x) => x.name === 'England');
const ctx = createGameBase(w, { managerName: 'S', managerNation: eng, clubId: w.clubs.find((c) => c[3] === act)![0], activeNations: [act], lang: 'en', masking: true, seed: 1, mode: 'authentic', ...(process.env.PREVIEW === '1' ? { preview: true } : {}) });
const MB = (n: number) => (n / 1048576).toFixed(1);
const report = (lbl: string) => {
  const g = gs() as unknown as Record<string, unknown>;
  packCarry(gs());
  console.log(lbl, 'i alt', MB(serialize({ game: g, ctx }).length), 'MB');
  for (const [k, n] of Object.keys(g).map((k) => [k, serialize(g[k]).length] as const).sort((a, b) => b[1] - a[1]).slice(0, 14)) console.log(MB(n).padStart(7), k);
  const carry = g.cmCarry as Record<string, unknown> | undefined;
  if (carry) for (const [k, n] of Object.keys(carry).map((k) => [k, serialize(carry[k]).length] as const).sort((a, b) => b[1] - a[1]).slice(0, 10)) console.log('   carry', MB(n).padStart(7), k);
};
report('base');
for (const ph of (process.env.PH ?? '').split(',').filter(Boolean)) { createGamePhase(ph as NewGamePhase, ctx); report(ph); }
