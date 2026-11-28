// 2026/27: computerklubbernes lejepladser (trupplanens rolle 0xb, +0x24 bit 0), lejemål pr. målets liga, lejebud og lejer pr. engelsk række
// (Test Smoke, Brentford, frø 1, England valgt – som cm-flow-2026.ts).   npx tsx scripts/cm-loan-2026.ts [til-dato] [hver-n-dag]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { entryOf } from '../src/game/cmSquadPlanGame';

const until = process.argv[2] ?? '2026-09-02', every = Number(process.argv[3] ?? 14);
const w = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world.json', 'utf8')) as WorldData;
if (!process.env.WORLD) Object.assign(w, JSON.parse(readFileSync('public/data/world-cm.json', 'utf8')));
const eng = w.nations.findIndex((x) => x.name === 'England');
const name = process.env.CLUB ?? (process.env.WORLD ? 'Arsenal' : 'Brentford');
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === name || c[2] === name)![0], activeNations: [eng], lang: 'en', masking: true,
  seed: 1, mode: 'authentic' });
const g = gs();
const lg = (cid: number | undefined) => { const c = cid ? g.clubs[cid] : undefined; if (!c) return '-'; const n = g.nations[c.nation]?.name; return n === 'England' ? (c.league ?? 'ENG?') : `${n}`; };
const lgName = (id: string) => g.leagues?.[id as never]?.['name' as never] ?? id;
console.log(`start ${g.date}; klubber ${Object.keys(g.clubs).length}, spillere ${Object.keys(g.players).length}, cmPlan ${!!g.cmPlan}`);
const startLoans = Object.values(g.players).filter((p) => p.loan).length;
console.log(`lejede ved start ${startLoans}`);
let last = g.date, days = 0;
const report = () => {
  const by: Record<string, Record<string, number>> = {};
  const add = (k: string, f: string, n = 1) => { const r = (by[k] ??= {}); r[f] = (r[f] ?? 0) + n; };
  for (const c of Object.values(g.clubs)) {
    if (g.nations[c.nation]?.name !== 'England') continue;
    const k = c.league ?? '?';
    add(k, 'klubber');
    if (!g.cmPlan?.[c.id]) continue;
    add(k, 'plan');
    for (const s of entryOf(g, c.id).slots) {
      if (s.role !== 0xb) continue;
      add(k, 'pl');
      if (s.b24 & 1) add(k, 'lejepl');
      if (s.f > -1 && (s.b24 & 1)) add(k, `lejemål:${lg(g.players[s.f]?.club)}`);
    }
  }
  for (const o of [...g.offers, ...(g.cmTmKept ?? [])]) { const k = lg(o.buyer); add(k, `${o.loan ? 'lejebud' : 'købsbud'}→${lg(g.players[o.player]?.club)}`); }
  for (const p of Object.values(g.players)) if (p.loan) add(lg(p.club), `lejet fra ${lg(p.loan.from)}`);
  const y = +g.date.slice(0, 4);
  for (const p of Object.values(g.players)) {
    const c = p.club ? g.clubs[p.club] : undefined; if (!c || g.nations[c.nation]?.name !== 'England' || p.loan) continue;
    const k = `${lg(p.club)}`; const age = y - +p.dob.slice(0, 4);
    add(k, 'trup'); if (age <= 21) add(k, 'trup≤21');
    if (p.loanListed) add(k, `LEJELISTET${age <= 21 ? '≤21' : ''}`);
    if (p.listed) add(k, 'TRANSFERLISTET');
    add(k, `st:${p.squadStatus ?? '-'}`);
  }
  console.log(`== ${g.date}`);
  for (const [k, r] of Object.entries(by).sort()) { if (!/^(CM|HN)/.test(k)) continue; console.log(`  ${k} ${String(lgName(k))}: ${Object.entries(r).sort().map(([a, b]) => `${a} ${b}`).join(', ')}`); }
};
report();
while (g.date < until && days++ < 400) {
  const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch();
  if ((Date.parse(g.date) - Date.parse(last)) / 864e5 >= every) { last = g.date; report(); }
}
report();
