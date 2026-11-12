// (runde 9) Kampstartens tilstand (toppen af tik 0) pr. side: originalen (sporets MATCH_PLAYER-blokke, R-linjerne) mod spillets egne inddata
// for de samme kampe (klubberne på navnet) – snit over de 11 på banen af kamp-CA +0x3b, moralen +0x17, motivationen +0x100, konditionen +0x4d,
// formRoll +0x118, dårlig dag +0x119 og kampfloats (snit af de 34). Viser, hvilket inddata der skiller (fx kun udeholdet).
//   npx tsx scripts/grid-kickoff-diff.ts [spor = ls20.txt] [kampe = 20]
import { readFileSync } from 'node:fs';
import { readMatches, Mem, MATCH_FLOATS } from './lockstep';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { Rng } from '../src/game/rng';
import { aiTactic, continueGame, quickPlayUserMatch } from '../src/game/sim';
import { createGridMatch, randOf, type GP } from '../src/game/engine/grid/gridMatch';
import { gameInputsCtx } from '../src/game/engine/grid/gameInputs';
import type { Player } from '../src/game/types';

const file = process.argv[2] ?? `${process.env.HOME}/cm0102-engine/oracle/runs/ls20.txt`;
const N = Number(process.argv[3] ?? 20);
const trs = await readMatches(file, Array.from({ length: N }, (_, i) => i), 1);
const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
createGame(world, { managerName: 'Lab', managerNation: eng, clubId: world.clubs.find((c) => c[1] === 'Wrexham')![0], activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
const g = gs();
if (process.env.ADVANCE) { const until = process.env.ADVANCE.length === 10 ? process.env.ADVANCE : '2001-08-18'; while (g.date < until) { const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); } }
const epl = Object.values(g.comps).find((c) => c.type === 'league' && c.tier === 1 && world.nations[c.nation]?.name === 'England')!;
const nm = (b: Uint8Array) => Buffer.from(b.slice(4, 55)).toString('latin1').split('\0')[0];
const cid = (b: Uint8Array) => Object.values(g.clubs).find((c) => c.name === nm(b))!.id;
const fresh = (id: number) => squad(id).map((p) => ({ ...p, attrs: p.attrs.slice(), condition: process.env.ADVANCE || process.env.KEEP_COND ? p.condition : 100, injury: null, banned: 0 }) as Player);
type Acc = Record<string, number[]>;
const acc: [Acc, Acc][] = [[{}, {}], [{}, {}]];   // [orig, spil][side]
const add = (a: Acc, k: string, v: number) => { (a[k] ??= []).push(v); };
const S = Number(process.env.SEEDS ?? 3);
for (const tr of trs) {
  for (const r of tr.R) {
    const p = new Mem(r.mp); if (p.s8(0x19) < 0 || p.s8(0x19) > 10) continue;
    const a = acc[0][r.side];
    add(a, 'CA', p.s16(0x3b)); add(a, 'moral', p.s8(0x17)); add(a, 'motiv', p.s8(0x100)); add(a, 'kond', p.f32(0x4d)); add(a, 'formRoll', p.s8(0x118)); add(a, 'badDay', p.s8(0x119));
    add(a, 'floats', MATCH_FLOATS.reduce((s, _, j) => s + p.f32(0x71 + 4 * j), 0) / MATCH_FLOATS.length); add(a, 'rawCA', new Mem(r.rec).s16(5));
  }
  const h = cid(tr.CL[0]), aw = cid(tr.CL[1]);
  for (let s = 0; s < S; s++) {
    const rng = new Rng(77 + s), rand = randOf(() => rng.next());
    const mgr = (c: number) => { const st = g.staff[g.clubs[c]?.manager ?? -1]; return st?.tac ? { id: st.id, ca: st.ca ?? st.rep * 2, tac: st.tac } : null; };
    let done = false;
    const m = createGridMatch({ players: fresh(h), tactic: aiTactic(h, aw, true) }, { players: fresh(aw), tactic: aiTactic(aw, h, false) }, rand,
      { rep: [g.clubs[h].rep * 100, g.clubs[aw].rep * 100], managers: [mgr(h), mgr(aw)], ...gameInputsCtx(h, aw, { compId: epl.id, human: [false, false] }),
        onTop: (st) => {
          if (done) return; done = true;
          for (const q of st.gp as GP[]) {
            if (!q.active) continue;
            const a = acc[1][q.side];
            add(a, 'CA', q.matchCA); add(a, 'moral', q.morale); add(a, 'motiv', q.motivation); add(a, 'kond', q.condition); add(a, 'formRoll', q.formRoll); add(a, 'badDay', q.badDay);
            add(a, 'floats', MATCH_FLOATS.reduce((x, k) => x + (q.f[k] ?? 0), 0) / MATCH_FLOATS.length); add(a, 'rawCA', q.src.ca);
          }
        } });
    m.tick();
  }
}
const mean = (x: number[] | undefined) => (x && x.length ? x.reduce((a, b) => a + b, 0) / x.length : NaN);
for (const k of ['rawCA', 'CA', 'floats', 'moral', 'motiv', 'kond', 'formRoll', 'badDay'])
  console.log(`${k.padEnd(9)} hjemme orig ${mean(acc[0][0][k]).toFixed(2).padStart(8)} spil ${mean(acc[1][0][k]).toFixed(2).padStart(8)} | ude orig ${mean(acc[0][1][k]).toFixed(2).padStart(8)} spil ${mean(acc[1][1][k]).toFixed(2).padStart(8)}`);
