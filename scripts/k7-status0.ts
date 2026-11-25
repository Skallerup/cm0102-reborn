// Trupstatus 0 (kontrakt +0x4f >> 4) hos de engelske klubbers spillere med kontrakt (ikke lejet) pr. dato – hvordan kom de til klubben?
// (sidste skifte: ingen = databasens kontrakt, køb med beløb, gratis fra klub, klubløs, nyankommen ungdom/regen). Frø 1, Arsenal.
//   WORLD=<world-dbs2.json> node scripts/measure.mjs -- npx tsx scripts/k7-status0.ts [datoer=2001-12-31,2002-06-30]
import { readFileSync } from 'node:fs';
import type { WorldData } from '../src/game/newgame';
import type { GameState, Player } from '../src/game/types';
const { createGame } = await import('../src/game/newgame');
const { continueGame, quickPlayUserMatch } = await import('../src/game/sim');
const { gs } = await import('../src/game/state');
const w = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world-original.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
const user = w.clubs.find((c) => c[1] === 'Arsenal')![0] as number;
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g: GameState = gs();
const todo = (process.argv[2] ?? '2001-12-31,2002-06-30').split(',');
const kind = (p: Player) => {
  const mv = p.moves?.filter((m) => m.to === p.club && !m.loan).pop();
  if (!mv) return p.joined && p.joined > '2001-07-14' ? 'ny uden skifte' : 'database';
  return mv.from === 0 ? 'klubløs' : mv.fee > 0 ? 'køb' : mv.swap ? 'bytte' : 'gratis fra klub';
};
let guard = 0;
while (todo.length && guard++ < 100000) {
  if (g.date >= todo[0] && g.dayDone && !g.pendingFixture) {
    const iso = todo.shift()!;
    const by: Record<string, { n: number; s44: number; ss: number }> = {};
    const dist: number[] = Array(16).fill(0);
    for (const p of Object.values(g.players)) {
      if (p.virtual || p.loan || !p.contract || !p.cmContract || g.clubs[p.club]?.nation !== eng) continue;
      const st = (p.cmContract.b4f ?? 0) >> 4; dist[st]++;
      if (st) continue;
      const k = kind(p) + (g.clubs[p.club].manager === -1 ? ' (menneske)' : '');
      const b = (by[k] ??= { n: 0, s44: 0, ss: 0 }); b.n++; b.s44 += (p.cmContract.b44 << 24) >> 24; if (p.squadStatus) b.ss++;
    }
    console.log(`${iso} trupstatus ${dist.slice(0, 8).map((n, i) => `${i}:${n}`).join(' ')}`);
    for (const [k, b] of Object.entries(by).sort((a, c) => c[1].n - a[1].n)) console.log(`  0 ← ${k}: ${b.n} (+0x44 ${(b.s44 / b.n).toFixed(0)}, squadStatus sat ${b.ss})`);
    continue;
  }
  const r = continueGame(); if (r?.match) quickPlayUserMatch();
}
