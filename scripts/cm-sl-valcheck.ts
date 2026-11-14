// Kontrol af de udskudte værdier (cmShortlistGame.ts writeValues/lazyValues): læser dagens kode +0x52 hos en spiller, hvis værdi endnu ikke er regnet,
// og giver de udskudte værdier det samme som de straks regnede?   npx tsx scripts/cm-sl-valcheck.ts [dage]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { SL_ON, SL_DIAG, VALCHECK } from '../src/game/cmShortlistGame';
import { SparseMem } from '../src/game/cmMem';

SL_ON.on = true;
VALCHECK.on = true;
const days = +(process.argv[2] ?? 21);
const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((n) => n.name === 'England');
let hits = 0, cur: unknown = null;
const P = SparseMem.prototype as unknown as Record<string, (this: SparseMem, a: number) => number>;
for (const [k, w2] of [['u8', 1], ['u16', 2], ['u32', 4]] as const) {
  const o = P[k];
  P[k] = function (a: number) {
    if (this === cur && VALCHECK.pending.size) {
      const x = (a >>> 0) - 0x10000000;
      if (x >= 0 && x < 0x10000000) {
        const off = x % 0x6e, st = (a >>> 0) - off;
        if (off + w2 > 0x52 && off < 0x56 && VALCHECK.pending.has(st)) hits++;
      }
    }
    return o.call(this, a);
  };
}
SL_DIAG.after = (S) => { cur = S.m; };
SL_DIAG.end = () => { cur = null; VALCHECK.pending.clear(); VALCHECK.eager.clear(); };
createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
for (let d = 0; d < days; d++) { const r = continueGame(); if (r?.match) quickPlayUserMatch(); }
console.log(`${g.date}: udskudte værdier ${VALCHECK.lazyTotal}, regnet i refreshClub ${VALCHECK.lazyN} (afviger ${VALCHECK.lazyDiff}), læst før de var regnet ${hits}`);
if (hits || VALCHECK.lazyDiff) process.exitCode = 1;
