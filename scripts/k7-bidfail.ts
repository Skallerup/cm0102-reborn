// K7: hvorfor fejler build_bid 0x8e5d60 fra make_club_bids 0x84a020 (kaldet 0x84a70e) – de sidste blokke før udgangen pr. købergruppe.
//   WORLD=<world-dbs2.json> TO=2001-08-18 npx tsx scripts/k7-bidfail.ts
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
const grpOf = (m: { s32(a: number): number }, a: number) => { const c = gs().clubs[m.s32(a)]; if (!c || c.nation !== eng) return 'X'; const gg = gs(); return TIER[gg.comps[c.league]?.name ?? gg.leagues[c.league]?.name ?? ''] ?? 'NL'; };
const res: Record<string, Map<string, number>> = {};
let inCall = false, grp = '', path: number[] = [], bp = '', sid = 0;
const rows: string[] = [];
const IN = (pc: number) => pc >= 0x8e5d60 && pc < 0x8e77d8;
SL_DIAG.after = () => {
  TRACE.on = true;
  TRACE.f = (pc, R) => {
    // argumenterne (staff, klub, plads, +7, 0, &ud): klubben ligger på [esp+8] ved indgangen
    if (pc === 0x8e5d60 && !inCall) { inCall = true; path = []; grp = grpOf(R.m, R.m.u32(R.esp + 8)); sid = R.m.s32(R.m.u32(R.esp + 4)); return; }
    if (!inCall) return;
    if (pc === 0x8e70ad) bp = `B ${R.ebx} p ${R.m.s32(R.esi + 0x1b)} r ${(R.m.s32(R.esi + 0x1b) / Math.max(1, R.ebx)).toFixed(2)}`;
    if (IN(pc)) { if (pc !== 0x8e7761 && pc !== 0x8e77bd && pc !== 0x8e77bf) path.push(pc); return; }
    if (pc === 0x84a71b || pc === 0x84a9d4) {
      const key = pc === 0x84a71b ? 'OK' : 'FAIL ' + path.slice(-Number(process.env.N ?? 4)).map((x) => x.toString(16)).join('>');
      (res[grp] ??= new Map()).set(key, (res[grp].get(key) ?? 0) + 1);
      if (grp === (process.env.G ?? 'P')) rows.push(`${gs().date.slice(0, 10)} ${key.slice(0, 4)} ${bp} sid ${sid}`);
      inCall = false; bp = '';
    }
  };
};
SL_DIAG.end = () => { TRACE.on = false; inCall = false; };
let g = gs();
while (g.date.slice(0, 10) < TO) { const r = continueGame(); if (r?.match) quickPlayUserMatch(); g = gs(); }
for (const k of ['P', '1', '2', '3', 'NL', 'X']) {
  const c = res[k]; if (!c) continue;
  console.log(k); for (const [a, n] of [...c].sort((x, y) => y[1] - x[1]).slice(0, 12)) console.log('  ', n, a);
}
for (const r of rows) console.log(r);
