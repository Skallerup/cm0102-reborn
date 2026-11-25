// K7: navngivne spillere i spillet ved spilstart (frø 1) – klub, klubbens land, nationalitet, CA/PA, værdi, og om de står i ønskelisternes
// hukommelse (memOf) og positionslisterne (loadedFilter).   WORLD=<world-dbs2.json> WHO="John Whelan,Danny Barton" npx tsx scripts/k7-who-ours.ts
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { buildSlMem } from '../src/game/cmShortlistGame';

const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
const WHO = new Set((process.env.WHO ?? '').split(','));
const S = buildSlMem(g);

const nat = (i: number | undefined) => (i === undefined ? '-' : g.nations?.[i]?.name ?? w.nations[i]?.name ?? String(i));
const found = new Set<string>();
for (const p of Object.values(g.players)) {
  const nm = `${p.first} ${p.last}`; if (!WHO.has(nm)) continue; found.add(nm);
  const c = g.clubs[p.club];
  console.log(`${nm} (${c?.name ?? '-'}, ${nat(c?.nation)}, nat ${nat(p.nation)}): CA ${p.ca} PA ${p.pa} værdi ${p.value} mem ${S.memOf.get(p.id) ?? '-'} +52 ${(() => { const st = S.M.W.staffOf(p); return st ? S.m.s32(st + 0x52) : '-'; })()}`);
}
for (const n of WHO) if (!found.has(n)) console.log(`${n}: findes ikke`);
