// Ejerens fejl 20/11: mange "Loa" og mange målmænd i danske klubber. Nyt spil (original DB, ægte tilstand), Danmark + England, menneske i
// Silkeborg, til en dato: pr. klub Loa (bit 2), målmænd, trupstørrelse; målmændenes ankomst (købt/fri/leje/ny).
//   npx tsx scripts/cm-loa-gk.ts [til-dato = 2002-05-05] [frø = 1] [nationer = Denmark,England]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs, squad } from '../src/game/state';
import { repairOldMarket } from '../src/game/save';

const until = process.argv[2] ?? '2002-05-05';
const seed = Number(process.argv[3] ?? 1);
const natNames = (process.argv[4] ?? 'Denmark,England').split(',');
const w = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const nats = natNames.map((n) => w.nations.findIndex((x) => x.name === n));
const den = w.nations.findIndex((x) => x.name === 'Denmark');
createGame(w, { managerName: 'Lab', managerNation: den, clubId: w.clubs.find((c) => c[2] === 'Silkeborg IF')![0], activeNations: nats, lang: 'en', masking: true, seed, mode: 'authentic' });
const g = gs();
g.options.engine = 'original';
if (process.env.NO_RSV === '1') { delete g.cmRsv; delete g.cmSlFix; } // som et spil startet før reservekampene (20/11)
const isGK = (p: { pos: number[] }) => p.pos[0] >= 15;
const where = new Map<number, number>();
for (const p of Object.values(g.players)) where.set(p.id, p.club);
const arrivals: Record<number, string[]> = {};
const watch = (cid: number) => g.clubs[cid]?.nation === den;
let lastWeek = '';
// SWITCH_AT=dato: som et spil spillet før cmSlMoved (CM_SL_MOVED=0) indtil datoen, derefter med rettelsen (REPAIR=1: + indlæsningens
// repairOldMarket – hængende pladser og, med NO_RSV=1, reservekampene slået til)
const switchAt = process.env.SWITCH_AT;
if (switchAt) process.env.CM_SL_MOVED = '0';
const hungCount = () => { let n = 0, gk = 0; for (const [k, e] of Object.entries(g.cmPlan ?? {})) for (const s of e.s) { const p = s[0] === 0xb && s[3] > -1 ? g.players[s[3]] : undefined; if (p && p.club === +k && (s[4] !== s[3] || s[5] > -1)) { n++; if (isGK(p)) gk++; } } return `${n} (GK ${gk})`; };
while (g.date < until) {
  if (switchAt && g.date >= switchAt && process.env.CM_SL_MOVED === '0') {
    delete process.env.CM_SL_MOVED;
    console.log(`${g.date} skift: hængende pladser ${hungCount()}${process.env.REPAIR === '1' ? ` · repairOldMarket → ${(delete g.cmSlFix, repairOldMarket(), hungCount())} · reservekampe ${!!g.cmRsv}` : ''}`);
  }
  const r = continueGame();
  if (r.match) quickPlayUserMatch();
  const wk = g.date.slice(0, 8) + Math.floor(Number(g.date.slice(8)) / 7);
  if (wk === lastWeek) continue;
  lastWeek = wk;
  for (const p of Object.values(g.players)) {
    const prev = where.get(p.id);
    if (p.club && p.club !== prev && isGK(p) && watch(p.club)) {
      const how = prev === undefined ? `ny(${p.regen ? 'regen' : p.virtual ? 'fyld' : 'andet'})` : prev === 0 ? 'fri' : p.loan ? `leje fra ${g.clubs[prev]?.name}` : `fra ${g.clubs[prev]?.name}`;
      (arrivals[p.club] ??= []).push(`${g.date} ${p.name} ${how} ca${p.ca}`);
    }
    where.set(p.id, p.club);
  }
}
console.log(`frø ${seed} til ${g.date} · hængende pladser ${hungCount()}`);
const sum: Record<string, number[]> = {};
for (const c of Object.values(g.clubs)) {
  const nn = g.nations[c.nation]?.name;
  if (!natNames.includes(nn) || !g.comps[c.league ?? '']) continue;
  const sq = squad(c.id).filter((p) => !p.virtual);
  const loa = sq.filter((p) => p.loanListed).length, gk = sq.filter(isGK).length, gkLoa = sq.filter((p) => isGK(p) && p.loanListed).length;
  const s = (sum[nn] ??= [0, 0, 0, 0, 0]); s[0]++; s[1] += loa; s[2] += gk; s[3] += sq.length; s[4] += gkLoa;
  if (nn === 'Denmark' || gk > 6 || loa > 8) console.log(`${nn.padEnd(8)} ${c.name.padEnd(28)} ${g.comps[c.league!]?.id ?? c.league} trup ${sq.length} Loa ${loa} GK ${gk} (Loa ${gkLoa}) virt ${squad(c.id).length - sq.length}`);
  if (nn === 'Denmark' && arrivals[c.id]) for (const a of arrivals[c.id]) console.log('    +GK', a);
}
for (const [n, s] of Object.entries(sum)) console.log(`SUM ${n}: klubber ${s[0]} · Loa/klub ${(s[1] / s[0]).toFixed(2)} · GK/klub ${(s[2] / s[0]).toFixed(2)} · trup/klub ${(s[3] / s[0]).toFixed(1)} · GK-Loa ${s[4]}`);
