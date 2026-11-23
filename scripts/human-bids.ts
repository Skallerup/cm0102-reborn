// Computerklubbernes bud på menneskets spillere i vores spil (frø, 3.9.60-world, England): beløb mod spillerens viste værdi og
// asking price – til sammenligning med oraklet (scripts/oracle-human-bids.ts).
//   npx tsx scripts/human-bids.ts <world.json> <til-dato> [klub=Arsenal] [frø=1] [ferie=0]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { askingPrice } from '../src/game/transfers';
import { GBP } from '../src/game/cmContractInit';

const [worldFile, until, clubArg = 'Arsenal', seedArg = '1', holArg = '0'] = process.argv.slice(2);
const w = JSON.parse(readFileSync(worldFile, 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
const user = w.clubs.find((c) => c[1] === clubArg)![0];
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: +seedArg, mode: 'authentic' });
const g = gs();
if (holArg === '1') (g as unknown as { manager: { holiday?: unknown } }).manager.holiday = { until: '2002-07-01' };
const seen = new Set<number>();
const rows: { r: number; ra: number }[] = [];
const L = (x: number) => Math.round(x * GBP);
let guard = 0;
while ((g.date < until || !g.dayDone || g.pendingFixture) && guard++ < 40000) {
  const r = continueGame(); if (r?.match) quickPlayUserMatch();
  for (const o of g.offers) {
    if (seen.has(o.id) || o.seller !== g.userClub || o.loan) continue;
    seen.add(o.id);
    const p = g.players[o.player]; if (!p) continue;
    const ask = askingPrice(p), b = g.clubs[o.buyer];
    rows.push({ r: o.fee / Math.max(1, p.value), ra: o.fee / Math.max(1, ask) });
    console.log(`${g.date.slice(0, 10)} ${p.first} ${p.last} ca${p.ca} <- ${b?.name} fee £${L(o.fee)} værdi £${L(p.value)} forhold ${(o.fee / Math.max(1, p.value)).toFixed(2)} asking £${L(ask)} (${(o.fee / Math.max(1, ask)).toFixed(2)}) maxFee £${L(o.maxFee ?? 0)} budget £${L(b?.transferBudget ?? 0)} rater ${o.months ?? 0} cmAi ${o.cmAi ? 1 : 0}`);
  }
}
const med = (a: number[]) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
console.log(`bud: ${rows.length}, forhold bud/værdi median ${med(rows.map((x) => x.r)).toFixed(2)} snit ${(rows.reduce((t, x) => t + x.r, 0) / Math.max(1, rows.length)).toFixed(2)}, bud/asking median ${med(rows.map((x) => x.ra)).toFixed(2)}`);
