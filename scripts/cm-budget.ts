// Transferbudgettet 0x598800 på spillets hukommelse for udvalgte klubber: npx tsx scripts/cm-budget.ts [klub,klub…]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { cmTransferBudget } from '../src/game/cmBudget';

const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((n) => n.name === 'England');
createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
const names = (process.argv[2] ?? 'Manchester United,Arsenal,Liverpool,Bolton Wanderers,Newcastle United,Fulham,Middlesbrough,Crewe Alexandra,Bury').split(',');
for (const n of names) {
  const c = Object.values(g.clubs).find((x) => x.name === n);
  if (!c) { console.log(n, 'findes ikke'); continue; }
  console.log(n.padEnd(22), 'saldo', Math.round(c.balance * 0.86), 'nu', Math.round(c.transferBudget * 0.86), 'port', cmTransferBudget(g, c.id));
}
