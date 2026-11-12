// (runde 9) Spillets egne inddata for de samme kampe som et kampspor (klubberne på navnet i CL-linjerne), S frø pr. kamp – sammenlign med
// scripts/grid-free.ts (originalens kampstart, samme kampe). npx tsx scripts/grid-game20.ts [frø pr. kamp = 30]
import { readFileSync } from 'node:fs';
import { readMatches } from './lockstep';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { Rng } from '../src/game/rng';
import { aiTactic } from '../src/game/sim';
import { GRID_UNKNOWN, randOf, runGridMatch } from '../src/game/engine/grid/gridMatch';
import { gameInputsCtx } from '../src/game/engine/grid/gameInputs';
import type { Player } from '../src/game/types';
if (process.env.GRID_JSON) Object.assign(GRID_UNKNOWN, JSON.parse(process.env.GRID_JSON));
const S = Number(process.argv[2] ?? 30);
const trs = await readMatches(`${process.env.HOME}/cm0102-engine/oracle/runs/ls20.txt`, Array.from({ length: 20 }, (_, i) => i), 1);
const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
createGame(world, { managerName: 'Lab', managerNation: eng, clubId: world.clubs.find((c) => c[1] === 'Wrexham')![0], activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
const g = gs();
const epl = Object.values(g.comps).find((c) => c.type === 'league' && c.tier === 1 && world.nations[c.nation]?.name === 'England')!;
const nm = (b: Uint8Array) => Buffer.from(b.slice(4, 55)).toString('latin1').split('\0')[0];
const cid = (b: Uint8Array) => Object.values(g.clubs).find((c) => c.name === nm(b))!.id;
const fresh = (id: number) => squad(id).map((p) => ({ ...p, attrs: p.attrs.slice(), condition: 100, injury: null, banned: 0 }) as Player);
let goals = 0, hw = 0, dr = 0, n = 0, hg = 0;
for (const [k, tr] of trs.entries()) {
  const h = cid(tr.CL[0]), a = cid(tr.CL[1]);
  let mg = 0;
  for (let s = 0; s < S; s++) {
    const rng = new Rng(1000 * k + s + 1), rand = randOf(() => rng.next());
    const mgr = (c: number) => { const st = g.staff[g.clubs[c]?.manager ?? -1]; return st?.tac ? { id: st.id, ca: st.rep * 2, tac: st.tac } : null; };
    const r = runGridMatch({ players: fresh(h), tactic: aiTactic(h, a, true) }, { players: fresh(a), tactic: aiTactic(a, h, false) }, rand,
      { rep: [g.clubs[h].rep * 100, g.clubs[a].rep * 100], managers: [mgr(h), mgr(a)], ...gameInputsCtx(h, a, { compId: epl.id, human: [false, false] }) });
    goals += r.home.goals + r.away.goals; mg += r.home.goals + r.away.goals; hg += r.home.goals; n++;
    if (r.home.goals > r.away.goals) hw++; else if (r.home.goals === r.away.goals) dr++;
  }
  console.log(`kamp ${k} ${g.clubs[h].name}–${g.clubs[a].name}: ${(mg / S).toFixed(2)}`);
}
console.log(`${n} kampe: mål ${(goals / n).toFixed(2)} hjemme ${(hg / n).toFixed(2)} · H/U/B ${Math.round(100 * hw / n)}/${Math.round(100 * dr / n)}/${Math.round(100 * (n - hw - dr) / n)}`);
