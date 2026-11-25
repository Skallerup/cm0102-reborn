// (fejlsøgning) Mål-dage pr. sælgerklub: hvor mange af de andre klubbers pladser (trupplanen r[3]) har en spiller fra klubben som mål, summeret
// over dagene, og parrene (cmSlPairs) – for menneskets klub og nogle sammenlignelige. Frø 1.
//   WORLD=<world-dbs2.json> CLUB="Manchester United" HOLIDAY=0 FROM=2001-08-01 UNTIL=2002-02-01 npx tsx scripts/k7-target-count.ts
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { FR_DIAG } from '../src/game/cmShortlistGame';
import { getContract } from '../src/game/cmMem';

const FROM = process.env.FROM ?? '2001-08-01', UNTIL = process.env.UNTIL ?? '2002-02-01', CLUB = process.env.CLUB ?? 'Arsenal';
const CMP = (process.env.CMP ?? 'Manchester United,Arsenal,Liverpool,Chelsea,Leeds United,Newcastle United').split(',');
const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === CLUB)![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
if (process.env.HOLIDAY !== '0') gs().manager.holiday = {};
let g = gs();
const ids = new Map(CMP.map((n) => [w.clubs.find((c) => c[1] === n)![0], n]));
const tdays: Record<string, number> = {}, pdays: Record<string, number> = {}, exp: Record<string, number> = {};
const rej: Record<string, Record<number, number>> = {};
const tally = (k: number, st: number) => { const m = FR_DIAG.m; if (!m) return; const kk = getContract(m, st); if (!kk) return; const n = ids.get(m.s32(kk + 4)); if (!n) return; const r = rej[n] ??= {}; r[k] = (r[k] ?? 0) + 1; };
if (process.env.FRDIAG) { FR_DIAG.rej = tally; FR_DIAG.ev = (st, o, e68, lim) => { tally(200, st); tally(o < e68 ? 201 : o < lim ? 202 : 203, st); if (o === -1) tally(204, st); if (o === 0) tally(205, st); }; }
let guard = 0;
while (g.date < UNTIL && guard++ < 40000) {
  const r = continueGame(); if (r?.match) quickPlayUserMatch();
  g = gs();
  if (g.date < FROM) continue;
  for (const [cid, pl] of Object.entries(g.cmPlan ?? {})) for (const s of pl.s) {
    if (s[0] !== 0xb || s[3] < 0 || +cid === g.players[s[3]]?.club) continue;
    const p = g.players[s[3]], n = p ? ids.get(p.club) : undefined;
    if (!n) continue;
    tdays[n] = (tdays[n] ?? 0) + 1;
    if (p!.contract && p!.contract.expires <= '2002-06-30') exp[n] = (exp[n] ?? 0) + 1;
  }
  for (const [pid, c] of g.cmSlPairs ?? []) { const p = g.players[pid], n = p ? ids.get(p.club) : undefined; if (n && c !== p!.club) pdays[n] = (pdays[n] ?? 0) + 1; }
}
console.log('mål-dage', JSON.stringify(tdays));
console.log('heraf udløb ≤ 30/6-02', JSON.stringify(exp));
console.log('par-dage', JSON.stringify(pdays));
if (process.env.FRDIAG) for (const [n, r] of Object.entries(rej)) console.log('afvist', n, JSON.stringify(r));
