// Måler computerkampenes kompakte rapporter (g.miniReports, miniReport.ts) i det gemte spils størrelse.
// Kør: npx tsx scripts/mini-report-size.ts [til-dato] [world-fil]   (ægte tilstand, England, Man Utd)
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { unpackReport } from '../src/game/miniReport';

const world = JSON.parse(readFileSync(process.argv[3] ?? 'public/data/world-original.json', 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
const user = world.clubs.find((c) => c[1] === 'Manchester United')?.[0] ?? world.clubs.find((c) => c[3] === eng)![0];
createGame(world, { managerName: 'M', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: 11, mode: 'authentic' });
const g = gs();
const stopAt = process.argv[2] ?? `${g.season + 1}-06-29`;
const t0 = Date.now();
let n = 0;
while (g.date < stopAt && n++ < 800) { const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); }
const mini = g.miniReports ?? {};
const ids = Object.keys(mini).map(Number);
const all = JSON.stringify(g);
const without = JSON.stringify({ ...g, miniReports: undefined });
const mj = JSON.stringify(mini);
const mb = (x: number) => (x / 1e6).toFixed(2);
console.log(`dato ${g.date} · ${Math.round((Date.now() - t0) / 1000)} s · kampe med resultat ${Object.values(g.fixtures).filter((f) => f.result).length} · kompakte rapporter ${ids.length} · fulde ${Object.keys(g.reports).length}`);
console.log(`gemt spil: uden ${mb(gzipSync(without).length)} MB gzip (${mb(without.length)} MB rå) · med ${mb(gzipSync(all).length)} MB gzip (${mb(all.length)} MB rå)`);
console.log(`miniReports: ${mb(gzipSync(mj).length)} MB gzip · ${mb(mj.length)} MB rå · ${Math.round(mj.length / Math.max(1, ids.length))} B/kamp rå · ${Math.round(gzipSync(mj).length / Math.max(1, ids.length))} B/kamp gzip`);
const id = ids.find((i) => mini[i].p[0].length + mini[i].p[1].length >= 26) ?? ids[0];
if (id !== undefined) {
  const f = g.fixtures[id];
  const rep = unpackReport(mini[id], id, f.home, f.away);
  console.log(`eksempel: ${g.clubs[f.home].name} ${f.result!.hg}-${f.result!.ag} ${g.clubs[f.away].name} · linjer ${rep.players.length} · ubrugte ${rep.bench!.map((b) => b.length)} · begivenheder ${rep.events.length} · mom ${rep.mom}`);
}
const per: Record<string, number> = {};
for (const i of ids) { const c = g.fixtures[i]?.comp ?? '?'; per[c] = (per[c] ?? 0) + 1; }
console.log(Object.entries(per).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([k, v]) => `${g.comps[k]?.name ?? k} ${v}`).join(' · '));
