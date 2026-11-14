// Ønskekontrakten ved klubskifte (cmContractGame.ts): for spillere i engelske computerklubber – løn hos egen klub, hos en anden klub i samme
// række (0x85fc50 og 0x4cda70) mod den nuværende løn.  npx tsx scripts/cm-want-move.ts [antal]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { cmAiTerms } from '../src/game/cmContractGame';
import { isHumanClub } from '../src/game/humans';

const N = +(process.argv[2] ?? 40);
const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((n) => n.name === 'England');
createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
const clubs = Object.values(g.clubs).filter((c) => c.nation === eng && !g.leagues[c.league]?.hidden && !isHumanClub(c.id));
let k = 0;
for (const p of Object.values(g.players)) {
  if (k >= N || !p.contract || p.loan || !clubs.some((c) => c.id === p.club)) continue;
  if (p.id % 37) continue;
  const own = g.clubs[p.club];
  const other = clubs.find((c) => c.id !== own.id && c.league === own.league)!;
  const a = cmAiTerms(g, p, own.id, { desired: true }), b = cmAiTerms(g, p, other.id, { desired: true }), o = cmAiTerms(g, p, other.id);
  console.log(`${p.first} ${p.last} (${own.name} → ${other.name}, CA ${p.ca}): nu £${Math.round(p.contract.wage * 0.86)}, krav hjemme £${a?.raw.wage} ude £${b?.raw.wage}, tilbud ${o?.offered ? '' : '(intet) '}£${o?.raw.wage} til ${o?.expires}`);
  k++;
}
if (process.env.TIME) {
  const { buildWantMem } = await import('../src/game/cmContractGame');
  const ps = Object.values(g.players).filter((p) => p.contract && !p.loan && clubs.some((c) => c.id === p.club)).slice(0, 200);
  let t0 = performance.now();
  for (const p of ps) buildWantMem(g, [p.club]);
  const tb = (performance.now() - t0) / ps.length;
  t0 = performance.now();
  for (const p of ps) cmAiTerms(g, p, p.club);
  console.log(`buildWantMem ${tb.toFixed(1)} ms, cmAiTerms i alt ${((performance.now() - t0) / ps.length).toFixed(1)} ms`);
}
