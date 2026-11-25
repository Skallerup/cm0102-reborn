// K7: make_club_bids 0x84a020 for pladser med et KLUBLØST mål (vores spil, frø 1, Arsenal på ferie, world bygget med CM_DBSIZE=2): hvilken blok
// forlader pladsen uden bud (sidste blok før 0x84ab99), pr. købergruppe (P/1/2/3/NL/X) og målets alder (<21 / 21+).
//   WORLD=<world-dbs2.json> TO=2001-08-31 npx tsx scripts/k7-freebid-trace.ts
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { SL_DIAG } from '../src/game/cmShortlistGame';
import { TRACE } from '../src/game/cmGen/x86';
import { getContract } from '../src/game/cmMem';

const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
const eng = w.nations.findIndex((n) => n.name === 'England');
createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
gs().manager.holiday = {};
const TO = process.env.TO ?? '2001-08-31';
const TIER: Record<string, string> = { 'English Premier Division': 'P', 'English First Division': '1', 'English Second Division': '2', 'English Third Division': '3' };
const grpOf = (m: { s32(a: number): number }, a: number) => { const c = gs().clubs[m.s32(a)]; if (!c || c.nation !== eng) return 'X'; const gg = gs(); return TIER[gg.comps[c.league]?.name ?? gg.leagues[c.league]?.name ?? ''] ?? 'NL'; };
const exits = new Map<string, Map<string, number>>();
let cur: { key: string; path: number[] } | null = null;
const close = (how: string) => {
  if (!cur) return;
  const e = exits.get(cur.key) ?? new Map(); exits.set(cur.key, e);
  const k = how === 'exit' ? cur.path.slice(-3).map((x) => x.toString(16)).join('>') : how;
  e.set(k, (e.get(k) ?? 0) + 1);
  cur = null;
};
SL_DIAG.after = () => {
  TRACE.on = true;
  TRACE.f = (pc, R) => {
    if (pc < 0x84a020 || pc > 0x84ad00) return;
    const m = R.m;
    if (pc === 0x84a19f) {
      close('?');
      const st = (m.u32(0xae23bc) + 0x6e * R.eax) >>> 0;
      if (getContract(m, st)) return;
      const age = m.u8(st + 0x18);
      cur = { key: `${grpOf(m, R.ebx)} ${age < 21 ? '<21' : '21+'}`, path: [] };
      return;
    }
    if (!cur) return;
    if (pc === 0x84ab99) { close('exit'); return; }
    cur.path.push(pc);
  };
};
SL_DIAG.end = () => { close('?'); TRACE.on = false; };
let g = gs();
while (g.date.slice(0, 10) < TO) { const r = continueGame(); if (r?.match) quickPlayUserMatch(); g = gs(); }
for (const [k, e] of [...exits].sort()) {
  const tot = [...e.values()].reduce((a, b) => a + b, 0);
  console.log(`${k}: ${tot}`);
  for (const [x, n] of [...e].sort((a, b) => b[1] - a[1]).slice(0, 12)) console.log(`   ${String(n).padStart(6)}  ${x}`);
}
