// K7: 0x6e86d0 (bedømmelsen) og 0x5407e0 (det sete omdømme) som cmValue.ts regner dem på oraklets hukommelse – for de engelske klubbers
// vurderingsmænd (manageren +0xcf og trænerne +0x1b3) mod et udsnit af spillerne. Originalens side: $S/k7j/ojudge-snap.py (samme kald i unicorn).
//   SNAP=<o-0908.bin> [N=3000] OUT=<u.json> npx tsx scripts/k7-judge-snap.ts
import { writeFileSync } from 'node:fs';
import { loadSnap } from './ct-snap';
import { type CmCtx, G } from '../src/game/cmMem';
import { judge_6e86d0, seenRep_5407e0 } from '../src/game/cmValue';
import { cmMemCall } from '../src/game/cmWageGame';

const m = loadSnap(process.env.SNAP!);
const c: CmCtx = { m, rand: () => 0, call: (adr, ...a) => cmMemCall(c, adr, ...a) };
const N = +(process.env.N ?? 3000);
const STAFF = m.u32(G.STAFF), n = m.s32(G.STAFF_COUNT), CLUBS = m.u32(G.CLUBS);
const judges: [number, number][] = [];
for (let i = 0; i < 300; i++) {
  const club = (CLUBS + 0x245 * i) >>> 0;
  const mg = m.u32(club + 0xcf);
  if (mg && m.u32(mg + 0x69)) judges.push([mg, club]);
  for (let k = 0; k < 7; k++) { const t = m.u32(club + 0x1b3 + 4 * k); if (t && m.u32(t + 0x69)) judges.push([t, club]); }
}
const players: number[] = [];
for (let id = 0; id < n; id++) { const st = (STAFF + 0x6e * id) >>> 0; if (m.u32(st + 0x61)) players.push(st); }
const out: number[][] = [];
let s = 12345;
const rnd = (k: number) => { s = (Math.imul(s, 1103515245) + 12345) >>> 0; return s % k; };
for (let i = 0; i < N; i++) {
  const [J, club] = judges[rnd(judges.length)], st = players[rnd(players.length)];
  const kind = 1 + rnd(2), hint = rnd(3) === 0 ? -1 : rnd(10000);
  out.push([J, st, club, kind, hint, judge_6e86d0(c, J, st, club, kind, hint) & 0xffff, seenRep_5407e0(c, st, J, 0) & 0xffff]);
}
writeFileSync(process.env.OUT!, JSON.stringify(out));
console.log('vurderingsmænd', judges.length, 'spillere', players.length, 'kald', out.length);
