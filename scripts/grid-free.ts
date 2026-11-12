// (runde 9) Originalens kampstart med egne tilfældige tal: hver kamp i sporet startes med originalens præcise tilstand i toppen af tik 0
// (som låsetrinet) og spilles færdig S gange med forskellige frø. Da motoren er låsetrin-identisk, er snittet det, originalen ville give for
// de samme kampe med de samme inddata – forskellen til spillets inddata (grid-stats.ts) er inddataenes betydning.
//   npx tsx scripts/grid-free.ts [spor = ls20.txt] [kampe = 20] [frø pr. kamp = 20]
import { readAiModeCalls, readMatches, runLockstep } from './lockstep';
import { Rng } from '../src/game/rng';
import { randOf } from '../src/game/engine/grid/gridMatch';

const file = process.argv[2] ?? `${process.env.HOME}/cm0102-engine/oracle/runs/ls20.txt`;
const N = Number(process.argv[3] ?? 20), S = Number(process.argv[4] ?? 20);
const trs = await readMatches(file, Array.from({ length: N }, (_, i) => i), 1);
const amFile = file.replace(/\.txt(\.gz)?$/, '-aimode.txt');
let goals = 0, hg = 0, ag = 0, hw = 0, dr = 0, n = 0, shots = 0, ot = 0;
const t0 = Date.now();
for (const [k, tr] of trs.entries()) {
  const aimode = readAiModeCalls(amFile, tr.M[0], tr.M[1]);
  let mg = 0;
  for (let s = 0; s < S; s++) {
    const rng = new Rng(1000 * k + s + 1);
    runLockstep(tr, { aimode, free: randOf(() => rng.next()), onGame: (g) => {
      const r = g.result();
      goals += r.home.goals + r.away.goals; mg += r.home.goals + r.away.goals; hg += r.home.goals; ag += r.away.goals; n++;
      shots += r.home.shots + r.away.shots; ot += r.home.onTarget + r.away.onTarget;
      if (r.home.goals > r.away.goals) hw++; else if (r.home.goals === r.away.goals) dr++;
    } });
  }
  console.log(`kamp ${k} (${tr.M.slice(0, 2).join('–')}): mål ${(mg / S).toFixed(2)}`);
}
console.log(`${n} kampe (${((Date.now() - t0) / 1000).toFixed(0)} s): mål ${(goals / n).toFixed(2)} (hjemme ${(hg / n).toFixed(2)} / ude ${(ag / n).toFixed(2)}) · H/U/B ${Math.round(100 * hw / n)}/${Math.round(100 * dr / n)}/${Math.round(100 * (n - hw - dr) / n)} · skud ${(shots / n).toFixed(1)} · på mål ${(ot / n).toFixed(1)}`);
