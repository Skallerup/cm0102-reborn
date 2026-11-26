// K7: som scripts/k7-planhop-oracle.ts i spillet (frø 1, Arsenal på ferie): klubbens kontrakter (spillerens kontraktklub – ved leje moderklubben)
// og lejespillere dagen før mod dagen, og trupplanens tæller +8 (g.cmPlan[klub].c). ALL=1: alle ændringer, ellers kun spring til 100.
//   WORLD=<world-dbs2.json> CLUBS="Bradford City,..." FROM=2001-07-31 TO=2001-10-31 npx tsx scripts/k7-planhop-ours.ts
import { readFileSync } from 'node:fs';
import type { WorldData } from '../src/game/newgame';
import type { GameState } from '../src/game/types';

const FROM = process.env.FROM ?? '2001-07-31', TO = process.env.TO ?? '2001-10-31';
const CLUBS = new Set((process.env.CLUBS ?? 'Bradford City').split(','));
const { createGame } = await import('../src/game/newgame');
const { continueGame, quickPlayUserMatch } = await import('../src/game/sim');
const { gs } = await import('../src/game/state');
const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
let g: GameState = gs();
const want = new Map<number, string>(Object.values(g.clubs).filter((c) => CLUBS.has(c.name)).map((c) => [c.id, c.name]));
type Day = { n8: Map<number, number>; squad: Map<number, Set<number>>; loan: Map<number, Set<number>> };
const snap = (): Day => {
  const d: Day = { n8: new Map(), squad: new Map(), loan: new Map() };
  for (const cid of want.keys()) { d.n8.set(cid, g.cmPlan?.[cid]?.c ?? 0); d.squad.set(cid, new Set()); d.loan.set(cid, new Set()); }
  for (const p of Object.values(g.players)) {
    const kc = p.loan ? p.loan.from : p.club;
    d.squad.get(kc)?.add(p.id);
    if (p.loan) d.loan.get(p.club)?.add(p.id);
  }
  return d;
};
let prev: Day | undefined;
const nm = (id: number) => { const p = g.players[id]; return p ? `${p.first} ${p.last}` : String(id); };
for (;;) {
  const iso = g.date.slice(0, 10);
  if (iso >= FROM) {
    const day = snap();
    if (prev) for (const [cid, n] of want) {
      const a = prev.n8.get(cid) ?? 0, b = day.n8.get(cid) ?? 0;
      const ps = prev.squad.get(cid)!, ds = day.squad.get(cid)!, pl = prev.loan.get(cid)!, dl = day.loan.get(cid)!;
      const ind = [...ds].filter((x) => !ps.has(x)), out = [...ps].filter((x) => !ds.has(x));
      const lin = [...dl].filter((x) => !pl.has(x)), lout = [...pl].filter((x) => !dl.has(x));
      if (b >= 90 && b - a > 50 || process.env.ALL && (ind.length || out.length || lin.length || lout.length))
        console.log(`${iso} ${n.padEnd(20)} +8 ${a}→${b}  ind [${ind.map(nm)}] ud [${out.map(nm)}] leje ind [${lin.map(nm)}] leje ud [${lout.map(nm)}]`);
    }
    prev = day;
  }
  if (iso >= TO) break;
  const r = continueGame(); if (r?.match) quickPlayUserMatch(); g = gs();
}
