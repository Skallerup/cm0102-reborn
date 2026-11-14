// Udbudsprisen 0x4d1600 (cmShortlistGame.ts cmAskingPrice, oversat) mod spillets askingPrice for engelske spillere: npx tsx scripts/cm-asking.ts [antal]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { cmAskingPrice } from '../src/game/cmShortlistGame';
import { askingPrice } from '../src/game/transfers';
const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((n) => n.name === 'England');
createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
const ps = Object.values(g.players).filter((p) => p.club && g.clubs[p.club]?.nation === eng && !g.leagues[g.clubs[p.club].league]?.hidden && p.contract).sort((a, b) => b.value - a.value);
const n = +(process.argv[2] ?? 40);
const pick = ps.filter((_, i) => i % Math.max(1, Math.floor(ps.length / n)) === 0).slice(0, n);
const t0 = performance.now();
const rs: number[] = [];
for (const p of pick) {
  const a = cmAskingPrice(g, p);
  const v = Math.round(p.value * 0.86), o = Math.round(askingPrice(p) * 0.86);
  if (a !== null) rs.push(a / Math.max(1, v));
  console.log(`${p.first} ${p.last} (${g.clubs[p.club].name}, ${p.squadStatus ?? '-'}${p.listed ? ', listet' : ''}): værdi £${v}, 0x4d1600 £${a}, spillets £${o}`);
}
rs.sort((a, b) => a - b);
console.log(`${pick.length} spillere, ${Math.round((performance.now() - t0) / pick.length)} ms pr. kald; 0x4d1600/værdi 10/50/90 %: ${[0.1, 0.5, 0.9].map((q) => rs[Math.floor(q * (rs.length - 1))]?.toFixed(2)).join(' / ')}`);
