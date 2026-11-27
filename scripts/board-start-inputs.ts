// Bestyrelsens starttillid (0x68f130) – inddata pr. engelsk ligaklub ved spilstarten 14/7-01, vores mod oraklets dagsbillede: klubbens
// omdømme (club +0x80), managerens omdømme (np +8/+0xa/+0xc), w6..wc (MANAGER_MANAGER +0x49·klub +6..+0xc) og managerens ansættelsesdato.
//   WORLD=public/data/world-original-normal.json npx tsx scripts/board-start-inputs.ts
import { readFileSync } from 'node:fs';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import type { SparseMem } from '../src/game/cmMem';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { clubRepMem } from '../src/game/cmPlayerData';
import { clubDislikes, clubFavours, personKey } from '../src/game/cmRelations';

const str = (m: SparseMem, a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const ix = readDaySnapIndex(DEFAULT_DAYSNAP)!;
const m = loadDaySnap(ix, ix.snaps[0]);
const C = m.u32(0xae23b4), nc = m.s32(0xae235c), MM = m.u32(0xb67a44);
const O = new Map<string, number[]>();
for (let i = 0; i < nc; i++) {
  const a = C + 0x245 * i, p = m.u32(a + 0xcf), np = p ? m.u32(p + 0x69) : 0, rb = m.u32(MM) + 0x49 * i;
  O.set(str(m, a + 4, 51), [m.s16(a + 0x80), np ? m.s16(np + 8) : -1, np ? m.s16(np + 0xa) : -1, np ? m.s16(np + 0xc) : -1, m.s16(rb + 6), m.s16(rb + 8), m.s16(rb + 0xa), m.s16(rb + 0xc), p && [0x9b, 0x9f, 0xa3].some((o) => m.u32(a + o) === p) ? 1 : 0, p && [0xa7, 0xab, 0xaf].some((o) => m.u32(a + o) === p) ? 1 : 0]);
}
const w = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world-original-normal.json', 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: Number(process.env.SEED ?? 1), mode: 'authentic' });
const g = gs();
const sum: Record<string, number[][]> = {};
for (const c of Object.values(g.clubs)) {
  if (c.nation !== eng || c.id === g.userClub) continue;
  const dv = g.comps[c.league]?.name ?? '';
  if (!/Premier|First Division|Second Division|Third Division/.test(dv)) continue;
  const o = O.get(c.name); if (!o) continue;
  const s = g.staff[c.manager], R = g.cmBoard?.rec[c.id];
  const u = [clubRepMem(g, c.id), ...(s?.cmRep ?? [-1, -1, -1]), R?.w6 ?? 0, R?.w8 ?? 0, R?.wa ?? 0, R?.wc ?? 0, s && clubFavours(c, personKey(s)) ? 1 : 0, s && clubDislikes(c, personKey(s)) ? 1 : 0];
  (sum[dv] ??= []).push(u.map((x, k) => x - o[k]));
  if (process.env.V) console.log(c.name.padEnd(26), 'vores', u.join(' '), '| orakel', o.join(' '));
}
console.log('gns. forskel vores − oraklet: klubomdømme, np+8, np+0xa, np+0xc, w6, w8, wa, wc, klubbens yndling, uven');
for (const [dv, rs] of Object.entries(sum)) console.log(dv.padEnd(26), rs.length, rs[0].map((_, k) => Math.round(rs.reduce((t, r) => t + r[k], 0) / rs.length)).join('  '));
