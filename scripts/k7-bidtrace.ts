// K7: hvor forlader pladserne med et mål make_club_bids 0x84a020 uden bud (vores spil, frø 1, Arsenal på ferie, world bygget med CM_DBSIZE=2)
// – pr. omdømmegruppe: blokke efter målet (0x84a19f) og budtærsklen ved 0x84a697 (X = [esp+0x10] mod 2·omdømme + 1000).
//   WORLD=<world-dbs2.json> TO=2001-08-18 npx tsx scripts/k7-bidtrace.ts
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { SL_DIAG } from '../src/game/cmShortlistGame';
import { TRACE } from '../src/game/cmGen/x86';

const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
const eng = w.nations.findIndex((n) => n.name === 'England');
createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const TO = process.env.TO ?? '2001-08-18';
const TIER: Record<string, string> = { 'English Premier Division': 'P', 'English First Division': '1', 'English Second Division': '2', 'English Third Division': '3' };
// engelske klubber efter division (klub +0 = spillets klub-id), ellers X
const grpOf = (m: { s32(a: number): number }, a: number) => { const c = gs().clubs[m.s32(a)]; if (!c || c.nation !== eng) return 'X'; const gg = gs(); return TIER[gg.comps[c.league]?.name ?? gg.leagues[c.league]?.name ?? ''] ?? 'NL'; };
const cnt: Record<string, Map<number, number>> = {};
const X: Record<string, { x: number; t: number; bb: number }[]> = {};
const WATCH = new Set([0x84a19f, 0x84a1e7, 0x84a28e, 0x84a2ac, 0x84a2c2, 0x84a2d7, 0x84a2e8, 0x84a301, 0x84a310, 0x84a334, 0x84a349, 0x84a35e, 0x84a559,
  0x84a697, 0x84a6c2, 0x84a713, 0x84a71b, 0x84a9d4, 0x84aa05, 0x84ab99]);
SL_DIAG.after = () => {
  TRACE.on = true;
  TRACE.f = (pc, R) => {
    if (!WATCH.has(pc)) return;
    const m = R.m;
    const rep = (m.u16(R.ebx + 0x80) << 16) >> 16, g = grpOf(m, R.ebx);
    (cnt[g] ??= new Map()).set(pc, (cnt[g].get(pc) ?? 0) + 1);
    if (pc === 0x84a697) {
      const sl = m.u32(m.u32(R.esp + 0x18)) + m.u32(R.esp + 0x1c);
      const x = m.s32(R.esp + 0x10);
      (X[g] ??= []).push({ x, t: 2 * rep + 1000, bb: m.s32(sl + 0xb) });
      if (process.env.DETAIL && g === process.env.DETAIL) console.log(gs().date.slice(0, 10), 'X', x, 'bb', m.s32(sl + 0xb), 'f', m.s32(sl + 0xf), 'h', m.s32(sl + 0x13), 'b24', m.u8(sl + 0x24).toString(16), 'b3', m.s32(sl + 3), 'b7', m.s32(sl + 7), 'cnt', m.u8(R.esp + 0xf), 'rep', rep);
    }
  };
};
SL_DIAG.end = () => { TRACE.on = false; };
let g = gs();
while (g.date.slice(0, 10) < TO) { const r = continueGame(); if (r?.match) quickPlayUserMatch(); g = gs(); }
const q = (a: number[], p: number) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(p * (s.length - 1))] : 0; };
for (const k of ['P', '1', '2', '3', 'NL', 'X']) {
  const c = cnt[k]; if (!c) continue;
  console.log(k, [...c].sort((a, b) => a[0] - b[0]).map(([a, n]) => `${a.toString(16)}:${n}`).join(' '));
  const xs = X[k] ?? [];
  console.log(`   X p25/50/75 ${q(xs.map((x) => x.x), 0.25)}/${q(xs.map((x) => x.x), 0.5)}/${q(xs.map((x) => x.x), 0.75)}  bb p50 ${q(xs.map((x) => x.bb), 0.5)}  2rep+1000 p50 ${q(xs.map((x) => x.t), 0.5)}  X/t p50 ${q(xs.map((x) => x.x / x.t), 0.5).toFixed(2)}`);
}
