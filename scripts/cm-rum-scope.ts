// Rygter og transfernyheder om klubber uden for de valgte lande (ejerens spørgsmål 18/11: Atlante/Wei Du i en dansk karriere).
//   npx tsx scripts/cm-rum-scope.ts [frø = 1] [slutdato = 2001-12-31] [klub = Vejle] [land = Denmark]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';

const seed = Number(process.argv[2] ?? 1), until = process.argv[3] ?? '2001-12-31', short = process.argv[4] ?? 'Vejle', nat = process.argv[5] ?? 'Denmark';
const world = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world-original.json', 'utf8')) as WorldData;
const n0 = world.nations.findIndex((x) => x.name === nat);
createGame(world, { managerName: 'Lab', managerNation: n0, clubId: world.clubs.find((c) => c[2] === short)![0], activeNations: [n0], lang: 'en', masking: true, seed, mode: 'authentic' });
const g = gs();
const act = new Set([n0]);
const seen = new Set<number>();
const club0 = new Map(Object.values(g.players).map((p) => [p.id, p.club]));
let rum = 0, rumForeign = 0, tr = 0, trForeign = 0;
const ex: string[] = [];
const foreign = (c: number) => !!g.clubs[c] && !act.has(g.clubs[c].nation);
while (g.date < until) {
  const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch();
  for (const n of g.news) {
    if (seen.has(n.id)) continue; seen.add(n.id);
    if (n.key === 'cm.rum') {
      rum++;
      const cl = String(n.params.clubs).split('|').map(Number), cur = Number(n.params.cur);
      const pc = g.players[Number(n.params.pid)];
      if (cl.some(foreign) && (!cur || foreign(cur))) { rumForeign++; if (ex.length < 8) ex.push(`${n.date} ${n.params.player} (${g.clubs[cur]?.short ?? '-'}) ← ${cl.map((c) => g.clubs[c]?.short).join(', ')} omd ${pc?.cmRepMem?.[1] ?? '?'}`); }
    } else if (n.cat === 'transfer') {
      tr++;
      if (n.link?.kind === 'player') { const p = g.players[Number(n.link.id)]; if (p && foreign(p.club)) trForeign++; }
    }
  }
}
const done = g.offers.filter((o) => o.status === 'completed' && !o.loan);
const ff = done.filter((o) => foreign(o.buyer) && (!o.seller || foreign(o.seller)));
console.log(`rygter ${rum}, heraf kun om klubber uden for ${nat} (spillerens klub og en interesseret): ${rumForeign}`);
for (const e of ex) console.log('  ' + e);
console.log(`andre transfernyheder ${tr}, om spillere i udenlandske klubber ${trForeign}`);
console.log(`gennemførte køb ${done.length}, mellem to klubber uden for valgte lande ${ff.length}`);
