// Kontrol: den håndporterede værdiformel 0x4d0c60 (src/game/cmValue.ts) mod den mekanisk oversatte (cmGen/f_4d0c60.ts) på ønskelisternes
// hukommelse – alle personer i hukommelsen, med kontraktens klub (som writeValues) og med en anden klub, flag 0/1, bedømmelse −1 og et fast tal.
// Sammenligner resultatet og [0xae1080].   npx tsx scripts/cm-value-check.ts [dage]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { SL_ON, SL_DIAG } from '../src/game/cmShortlistGame';
import { slCall } from '../src/game/cmShortlist';
import { playerValue_4d0c60 } from '../src/game/cmValue';
import { getContract, clubAt } from '../src/game/cmMem';

SL_ON.on = true;
const days = +(process.argv[2] ?? 3);
const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((n) => n.name === 'England');
let n = 0, bad = 0, tGen = 0, tTs = 0;
SL_DIAG.after = (S) => {
  const m = S.m, c = S.c;
  const clubs = Object.keys(S.g.clubs).map(Number).map((id) => S.clubAdr(id)).filter((a) => a);
  let i = 0;
  for (const [p, st] of S.M.W.players) {
    const k = getContract(m, st), own = k ? clubAt(m, m.s32(k + 4)) : 0;
    const other = clubs[(i++ * 7919) % clubs.length];
    const cases: [number, number, number, number][] = [];
    if (own && m.s32(own) === m.s32(k + 4)) cases.push([own, 0, -1, 1], [own, 0, -1, 0]);
    cases.push([other, 0, -1, 0], [other, 1, -1, 0], [own || other, 1, 0x1234, 0], [other, 0, 77, 1]);
    for (const [club, flag, judge, a5] of cases) {
      let t = performance.now();
      const a = slCall(c, 0x4d0c60, 0, st, club, flag, judge, a5) | 0; const ka = m.u32(0xae1080);
      tGen += performance.now() - t; t = performance.now();
      const b = playerValue_4d0c60(c, st, club, flag, judge, a5) | 0; const kb = m.u32(0xae1080);
      tTs += performance.now() - t;
      n++;
      if (a !== b || ka !== kb) { if (bad++ < 20) console.log('AFVIGER', p.id, p.name, { club: m.s32(club), flag, judge, a5, gen: a, ts: b, ka, kb }); }
    }
  }
  console.log(S.g.date, 'kald', n, 'afvigelser', bad, `oversat ${Math.round(tGen)} ms, TS ${Math.round(tTs)} ms`);
};
createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const g = gs();
for (let d = 0; d < days; d++) { const r = continueGame(); if (r?.match) quickPlayUserMatch(); }
console.log('i alt', n, 'kald,', bad, 'afvigelser', g.date);
