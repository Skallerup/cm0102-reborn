// K7: 0x83f3a0's kandidater efter købergruppe (P/1/2/3/NL) og kandidatens gruppe (hans klubs division, X = udland, - = klubløs): frasorteringens
// afvisningskode (FR_DIAG.rej – rækkefølgen i fastReject0), vurderet af 0x840d80 og over grænserne (+3 og bedste − 10000), og de valgte mål.
//   WORLD=<world-dbs2.json> [TO=2001-08-15] [B=P] CM_SL_SKIP=0 node scripts/measure.mjs -- npx tsx scripts/k7-slfilter.ts
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { FR_DIAG, SL_DIAG, type SlMem } from '../src/game/cmShortlistGame';
import { G, getContract, type CmMem } from '../src/game/cmMem';

const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
createGame(w, { managerName: 'T', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
const TO = process.env.TO ?? '2001-08-15', B = (process.env.B ?? 'P').split(',');
const TIER: Record<string, string> = { 'English Premier Division': 'P', 'English First Division': '1', 'English Second Division': '2', 'English Third Division': '3' };
const grpId = (cid: number) => { const g = gs(), c = g.clubs[cid]; if (!c) return '-'; if (c.nation !== eng) return 'X'; return TIER[g.comps[c.league]?.name ?? g.leagues[c.league]?.name ?? ''] ?? 'NL'; };
const clubGrp = (m: CmMem, club: number) => (club ? grpId(m.s32(club)) : '-');
const candGrp = (m: CmMem, st: number) => { const k = getContract(m, st); return k ? grpId(m.s32(k + 4)) : '-'; };
const rej: Record<string, Record<string, number>> = {}, ev: Record<string, number> = {}, ok: Record<string, number> = {};
const inc = (o: Record<string, number>, k: string) => { o[k] = (o[k] ?? 0) + 1; };
const sc: Record<string, number[]> = {};
let SM: SlMem | null = null;
SL_DIAG.after = (S) => { SM = S; };
const WHO = new Set((process.env.WHO ?? '').split(',').filter(Boolean));
const who = (m: CmMem, st: number) => { const p = SM?.byMem.get(m.s32(st)); return p && WHO.has(`${p.first} ${p.last}`) ? p : null; };
const wrows: string[] = [];
FR_DIAG.rej = (k, st) => {
  const m = FR_DIAG.m!; if (!B.includes(clubGrp(m, FR_DIAG.club))) return;
  inc(rej[candGrp(m, st)] ??= {}, String(k));
  const p = who(m, st); if (p && wrows.length < 400) wrows.push(`${gs().date.slice(0, 10)} ${gs().clubs[m.s32(FR_DIAG.club)]?.name} ← ${p.first} ${p.last}: afvist ${k}`);
};
FR_DIAG.ev = (st, score, thr, lim) => {
  const m = FR_DIAG.m!; if (!B.includes(clubGrp(m, FR_DIAG.club))) return;
  const cg = candGrp(m, st); inc(ev, cg);
  if (score >= thr && score >= lim) inc(ok, cg);
  const p = who(m, st); if (p && wrows.length < 400) wrows.push(`${gs().date.slice(0, 10)} ${gs().clubs[m.s32(FR_DIAG.club)]?.name} ← ${p.first} ${p.last} (CA ${p.ca} PA ${p.pa}): score ${score} +3 ${thr} grænse ${lim}`);
  (sc[cg] ??= []).push(score - thr);
};
let g = gs();
while (g.date.slice(0, 10) < TO) { const r = continueGame(); if (r?.match) quickPlayUserMatch(); g = gs(); }
const fmt = (o: Record<string, number>) => Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}`).join(' ');
const q = (a: number[], p: number) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(p * (s.length - 1))] : NaN; };
console.log(`købere ${B.join(',')} til ${TO}`);
for (const cg of ['P', '1', '2', '3', 'NL', 'X', '-']) {
  const r = rej[cg] ?? {}, tot = Object.values(r).reduce((a, b) => a + b, 0);
  console.log(`${cg}: afvist ${tot} (${fmt(r)}) | vurderet ${ev[cg] ?? 0}, over grænserne ${ok[cg] ?? 0}; score − +3 p50/p90 ${q(sc[cg] ?? [], 0.5)}/${q(sc[cg] ?? [], 0.9)}`);
}
for (const r of wrows) console.log(r);
void G;
