// Fejlsøgning: hvor mange personer bygger ønskelisternes hukommelse, og hvor mange af dem læser dagens kode (staff-poster pr. id)?
//   npx tsx scripts/cm-sl-count.ts [dage]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { SL_ON, SL_DIAG } from '../src/game/cmShortlistGame';
import { SparseMem } from '../src/game/cmMem';

SL_ON.on = true;
const days = +(process.argv[2] ?? 2);
const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((n) => n.name === 'England');
createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
const P = SparseMem.prototype as unknown as Record<string, (this: SparseMem, a: number, v?: number) => number>;
let cur: unknown = null;
const touched = new Set<number>();
for (const k of ['u8', 'u16', 'u32']) {
  const o = P[k];
  P[k] = function (a: number) { if (this === cur) { const x = (a >>> 0) - 0x10000000; if (x >= 0 && x < 0x10000000 && (process.env.OFF ? x % 0x6e === +process.env.OFF : true)) touched.add(Math.floor(x / 0x6e)); } return o.call(this, a); };
}
const active = new Set(g.activeNations);
SL_DIAG.after = (S) => {
  touched.clear(); cur = S.m;
  const cls: Record<string, number> = {};
  for (const [p] of S.M.W.players) {
    const home = p.loan?.from ?? p.club, c = g.clubs[home];
    const k = !home ? 'fri' : active.has(c?.nation ?? -1) ? 'aktivt land' : p.ca >= 150 || active.has(p.nation) ? 'udland, indlæst' : 'udland, ikke indlæst';
    cls[k] = (cls[k] ?? 0) + 1;
  }
  console.log('personer i hukommelsen', S.M.W.players.length, cls);
};
SL_DIAG.end = (S) => {
  cur = null;
  const cls: Record<string, number> = {};
  for (const [p, st] of S.M.W.players) {
    if (!touched.has((st - 0x10000000) / 0x6e)) continue;
    const home = p.loan?.from ?? p.club, c = g.clubs[home];
    const k = !home ? 'fri' : active.has(c?.nation ?? -1) ? 'aktivt land' : p.ca >= 150 || active.has(p.nation) ? 'udland, indlæst' : 'udland, ikke indlæst';
    cls[k] = (cls[k] ?? 0) + 1;
  }
  console.log(g.date, 'læste staff-poster', touched.size, cls);
};
for (let d = 0; d < days; d++) { const r = continueGame(); if (r?.match) quickPlayUserMatch(); }
