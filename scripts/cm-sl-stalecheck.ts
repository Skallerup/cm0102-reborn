// Kontrol af de udskudte spillerposter (cmShortlistGame.ts staleOk/touchClub, cmSlMem.ts `stale`/refreshClub): dagens hukommelse (med gårsdagens
// poster for udlandets spillere, skrevet igen når klubben kører) mod en frisk skygge (alle poster skrevet ved dagens start). Dagens skrivninger
// (undtagen refreshClub's) skrives også i skyggen, og hver læsning sammenlignes med skyggens byte.   npx tsx scripts/cm-sl-stalecheck.ts [dage]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { SL_ON, STALECHECK } from '../src/game/cmShortlistGame';
import { SparseMem } from '../src/game/cmMem';
import { SLMEM_STATS, SLMEM_DEFER } from '../src/game/cmSlMem';

SL_ON.on = true;
STALECHECK.on = true;
const days = +(process.argv[2] ?? 21);
const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((n) => n.name === 'England');
let hits = 0, reads = 0;
const first: string[] = [];
const P = SparseMem.prototype as unknown as Record<string, (this: SparseMem, a: number, v?: number) => number>;
const u8 = P.u8;
for (const [k, n] of [['u8', 1], ['u16', 2], ['u32', 4]] as const) {
  const o = P[k];
  P[k] = function (a: number) {
    if (this === STALECHECK.mem && STALECHECK.shadow && !SLMEM_DEFER.inRefresh) {
      reads++;
      for (let i = 0; i < n; i++) {
        const x = u8.call(this, a + i), y = u8.call(STALECHECK.shadow, a + i);
        if (x !== y) { hits++; if (first.length < 10) first.push(`${gs().date} ${((a + i) >>> 0).toString(16)} ${x}≠${y}`); break; }
      }
    }
    return o.call(this, a);
  };
}
for (const k of ['w8', 'w16', 'w32']) {
  const o = P[k];
  P[k] = function (a: number, v?: number) {
    if (this === STALECHECK.mem && STALECHECK.shadow && !SLMEM_DEFER.inRefresh) o.call(STALECHECK.shadow, a, v);
    return o.call(this, a, v);
  };
}
createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
for (let d = 0; d < days; d++) { const r = continueGame(); if (r?.match) quickPlayUserMatch(); }
console.log(`${g.date}: ${STALECHECK.days} dage, ${reads} læsninger, udskudte ${SLMEM_STATS.stale} (skrevet igen ${SLMEM_STATS.deferredWritten}), afvigende læsninger ${hits}`, first);
if (hits) process.exitCode = 1;
