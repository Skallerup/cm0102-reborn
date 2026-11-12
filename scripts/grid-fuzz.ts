// Gittermotorens adapter (GridSim) under menneskets indgreb: kampe med tilfældige taktikskift (formation, holdinstruktioner, løbepile),
// udskiftninger og læsninger af pitch()/live()/report() efter hvert tik – som kampskærmen gør. Fanger undtagelser med stakken.
//   npx tsx scripts/grid-fuzz.ts [kampe] [frø]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { continueGame, createLiveMatch, quickPlayUserMatch } from '../src/game/sim';
import { Rng } from '../src/game/rng';
import type { Tactic } from '../src/game/types';

const N = Number(process.argv[2] ?? 6), SEED = Number(process.argv[3] ?? 1);
const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((n) => n.name === 'England');
createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Manchester United')![0], activeNations: [eng], lang: 'en', masking: true, seed: SEED, mode: 'authentic' });
const g = gs();
g.options.engine = 'original';
const r = new Rng(SEED * 7919);
const FORMS = ['4-4-2', '4-3-3', '3-5-2', '4-5-1', '5-3-2', '4-2-3-1'];
let played = 0, errors = 0;
const totals = { passes: 0, tackles: 0, headers: 0, throwIns: 0 };
for (let i = 0; i < 2000 && played < N; i++) {
  const res = continueGame();
  if (res.match === undefined) continue;
  const f = g.fixtures[res.match];
  const me = f.home === g.userClub ? 0 : 1;
  const sim = createLiveMatch(f, { playByPlay: true });
  try {
    while (sim.step()) {
      sim.pitch(); sim.live(0); sim.live(1);
      if (r.next() < 0.01) sim.report();
      if (r.next() < 0.004) {
        const t = structuredClone(sim.teams[me].tactic) as Tactic;
        const k = r.int(0, 3);
        if (k === 0) t.formation = FORMS[r.int(0, FORMS.length - 1)];
        else if (k === 1) { const s = r.int(1, 10); t.individual[s] = { ...(t.individual[s] ?? {}), run: { x: r.int(10, 90), y: r.int(4, 96) } } as Tactic['individual'][number]; }
        else if (k === 2) (t as unknown as Record<string, unknown>).mentality = r.int(0, 4);
        else { const s = r.int(1, 10); const o = r.int(1, 10); [t.slots[s], t.slots[o]] = [t.slots[o], t.slots[s]]; }
        sim.setTactic(me, t);
      }
      if (r.next() < 0.003) {
        const v = sim.live(me);
        const out = v.on[r.int(0, v.on.length - 1)], inn = v.bench[r.int(0, Math.max(0, v.bench.length - 1))];
        if (out && inn) sim.substitute(me, out.id, inn);
      }
    }
    const rep = sim.report();
    const s = rep.stats[me];
    totals.passes += s.passes; totals.tackles += s.tackles ?? 0; totals.headers += s.headers ?? 0; totals.throwIns += s.throwIns ?? 0;
    console.log(`kamp ${played + 1}: ${g.clubs[f.home].short} ${rep.stats[0].goals}-${rep.stats[1].goals} ${g.clubs[f.away].short} · afl. ${s.passes}/${s.passesCompleted} · tackl. ${s.tacklesWon}/${s.tackles} · hovedst. ${s.headersWon}/${s.headers} · indkast ${s.throwIns} · besiddelse ${rep.stats[0].possession}/${rep.stats[1].possession}`);
  } catch (e) {
    errors++;
    console.error(`FEJL i kamp ${played + 1} (min ${sim.minute}, tik ${sim.moment}):`, (e as Error).stack);
  }
  quickPlayUserMatch();
  played++;
}
console.log(`${played} kampe, ${errors} fejl`, totals);
if (errors) process.exit(1);
