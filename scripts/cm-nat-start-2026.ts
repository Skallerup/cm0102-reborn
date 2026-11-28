// 2026/27 i ægte tilstand ved spilstart: spillernes værdi i £ (Player.value · klubbens cmGbp – som cmSlMem.ts skriver dem i +0x52) pr. land/PL/
// Championship – sammenlign med oraklets save (fin2026, staff +0x52) – og et lands klubber (saldo £, omdømme, liga).
// npx tsx scripts/cm-nat-start-2026.ts [land …]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { cmGbp } from '../src/game/cmMoney';

const w = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData;
Object.assign(w, JSON.parse(readFileSync('public/data/world-cm.json', 'utf8')));
const eng = w.nations.findIndex((x) => x.name === 'England');
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Brentford' || c[2] === 'Brentford')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
const agg = new Map<string, number[]>();
for (const p of Object.values(g.players)) {
  const c = p.club ? g.clubs[p.club] : undefined;
  if (!c) continue;
  const k = c.league === 'CM7' ? 'PL' : c.league === 'CM8' ? 'Championship' : g.nations[c.nation]?.name ?? '?';
  const a = agg.get(k) ?? []; a.push((p.value ?? 0) * cmGbp(g, c.id)); agg.set(k, a);
}
const m = (v: number) => `${(v / 1e6).toFixed(2)}m`;
for (const [k, v] of [...agg.entries()].sort((a, b) => b[1].reduce((s, x) => s + x, 0) - a[1].reduce((s, x) => s + x, 0)).slice(0, 16)) {
  v.sort((a, b) => b - a);
  console.log(`${k} ${v.length} sum ${m(v.reduce((s, x) => s + x, 0))} top ${m(v[0])} median ${m(v[v.length >> 1])} top20 ${m(v.slice(0, 20).reduce((s, x) => s + x, 0))}`);
}
for (const nm of ['Haaland', 'Saka', 'Rice']) {
  const p = Object.values(g.players).find((x) => x.last === nm && x.club && g.clubs[x.club].league === 'CM7');
  if (p) console.log(`${p.first} ${p.last} €${m(p.value)} £${m(p.value * cmGbp(g, p.club!))} ca ${p.ca}`);
}
for (const nat of process.argv.slice(2)) {
  const n = g.nations.findIndex((x) => x.name === nat);
  const cs = Object.values(g.clubs).filter((c) => c.nation === n).sort((a, b) => b.rep - a.rep);
  console.log(`${nat}: ${cs.length} klubber`);
  for (const c of cs.slice(0, 25)) {
    const k = cmGbp(g, c.id);
    console.log(`  ${c.name} ${c.league} rep ${c.rep} saldo £${(c.balance * k / 1e6).toFixed(1)}m (k ${k.toFixed(4)}) fin ${g.cmFin?.[c.id] ? 'ja' : 'nej'} plan ${g.cmPlan?.[c.id] ? 'ja' : 'nej'}`);
  }
}
