// Realisme-benchmark: spil N hele sæsoner i de store ligaer og sammenlign med virkelige tal.
// Kør: npx tsx scripts/benchmark.ts [sæsoner] [world-fil]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, MODERN, quickPlayUserMatch } from '../src/game/sim';
// MODERN_JSON='{"finish":1.1,"squash":0.9}' prøver en anden kalibrering af den moderne profil
if (process.env.MODERN_JSON) Object.assign(MODERN, JSON.parse(process.env.MODERN_JSON));
import { gs, squad } from '../src/game/state';
import { squadStrength } from '../src/game/board';
import { finalOrder } from '../src/game/competitions';
import { ageOn } from '../src/game/dates';

const seasons = Number(process.argv[2] ?? 2);
const world = JSON.parse(readFileSync(process.argv[3] ?? 'public/data/world.json', 'utf8')) as WorldData;
const ni = (n: string) => world.nations.findIndex((x) => x.name === n);
const NATIONS = ['England', 'Spain', 'Germany', 'Italy', 'France', 'Denmark'];
const user = world.clubs.find((c) => c[2] === 'Brøndby')?.[0] ?? world.clubs[0][0];
createGame(world, { managerName: 'Bench', managerNation: ni('Denmark'), clubId: user, activeNations: NATIONS.map(ni).filter((i) => i >= 0), lang: 'da', masking: true, seed: 2026 });
const g = gs();

type Agg = { n: number; goals: number; hw: number; dr: number; scores: Record<string, number>; big: number; nil: number };
const agg: Agg = { n: 0, goals: 0, hw: 0, dr: 0, scores: {}, big: 0, nil: 0 };
const lines: string[] = [];
let spearSum = 0, spearN = 0, favChamp = 0, champs = 0, upsets = 0, upsetN = 0;
const champPts: number[] = [], lastPts: number[] = [], topScorer: number[] = [], spreadGD: number[] = [];
const ageDelta: Record<string, [number, number]> = {};
const startCA = new Map(Object.values(g.players).map((p) => [p.id, [p.ca, ageOn(p.dob, g.date)] as const]));

const spearman = (a: number[], b: number[]) => { const n = a.length; let d = 0; for (let i = 0; i < n; i++) d += (a[i] - b[i]) ** 2; return 1 - (6 * d) / (n * (n * n - 1)); };
let preRank: Record<string, number[]> = {};
const snapRanks = () => {
  preRank = {};
  for (const c of Object.values(g.comps)) if (c.type === 'league' && c.tier === 1 && NATIONS.includes(world.nations[c.nation]?.name ?? '')) {
    preRank[c.id] = c.clubs.slice().sort((x, y) => squadStrength(y) - squadStrength(x));
  }
};
snapRanks();
const end = g.season + seasons;
let days = 0;
while (g.season < end) {
  const r = continueGame();
  if (r.match !== undefined) quickPlayUserMatch();
  if (++days > 420 * seasons) break;
  if (g.date.endsWith('-07-10')) snapRanks(); // nye trupper og op-/nedrykkere
  if (!g.date.endsWith('-06-29')) continue;
  for (const [id, order0] of Object.entries(preRank)) {
    const c = g.comps[id]; if (!c?.finished) continue;
    const fin = finalOrder(c), tbl = Object.fromEntries(c.table.map((t) => [t.club, t]));
    const sR = order0.map((cl) => order0.indexOf(cl)), fR = order0.map((cl) => fin.indexOf(cl));
    spearSum += spearman(sR, fR); spearN++;
    champs++; if (order0.slice(0, 2).includes(fin[0])) favChamp++;
    champPts.push(tbl[fin[0]].pts); lastPts.push(tbl[fin.at(-1)!].pts);
    spreadGD.push(tbl[fin[0]].gf - tbl[fin[0]].ga);
    const pos = (cl: number) => order0.indexOf(cl);
    for (const f of Object.values(g.fixtures)) {
      if (f.comp !== id || !f.result) continue;
      const { hg, ag } = f.result;
      agg.n++; agg.goals += hg + ag; if (hg > ag) agg.hw++; else if (hg === ag) agg.dr++;
      const k = `${Math.max(hg, ag)}-${Math.min(hg, ag)}`; agg.scores[k] = (agg.scores[k] ?? 0) + 1;
      if (hg + ag >= 6) agg.big++; if (hg + ag === 0) agg.nil++;
      const top = pos(f.home) < 3 ? 0 : pos(f.away) < 3 ? 1 : -1, bot = pos(f.home) >= order0.length - 5 ? 0 : pos(f.away) >= order0.length - 5 ? 1 : -1;
      if (top >= 0 && bot >= 0 && top !== bot) { upsetN++; const tg = top === 0 ? hg : ag, bg = top === 0 ? ag : hg; if (bg > tg) upsets++; }
    }
    const sc = Object.values(g.players).filter((p) => c.clubs.includes(p.club!)).map((p) => p.stats.lgGoals).sort((a, b) => b - a)[0] ?? 0;
    topScorer.push(sc);
    lines.push(`${g.season} ${c.name.padEnd(26)} mester ${g.clubs[fin[0]].short} (${tbl[fin[0]].pts} p, favorit-rang ${order0.indexOf(fin[0]) + 1}) · sidst ${tbl[fin.at(-1)!].pts} p · topscorer ${sc} · rangkorrelation ${spearman(sR, fR).toFixed(2)}`);
  }
}
for (const p of Object.values(g.players)) {
  const s = startCA.get(p.id); if (!s) continue;
  const b = s[1] <= 19 ? '≤19' : s[1] <= 23 ? '20-23' : s[1] <= 28 ? '24-28' : s[1] <= 31 ? '29-31' : '32+';
  const a = (ageDelta[b] ??= [0, 0]); a[0] += p.ca - s[0]; a[1]++;
}
const pct = (x: number, n: number) => `${((x / n) * 100).toFixed(1)}%`;
const avg = (xs: number[]) => (xs.reduce((s, v) => s + v, 0) / Math.max(1, xs.length)).toFixed(1);
console.log(lines.join('\n'));
console.log(`\n${agg.n} ligakampe i topdivisionerne over ${seasons} sæsoner`);
console.log(`mål/kamp ${(agg.goals / agg.n).toFixed(2)} (virkelighed ~2,7) · hjemme ${pct(agg.hw, agg.n)} (~44) · uafgjort ${pct(agg.dr, agg.n)} (~25) · ude ${pct(agg.n - agg.hw - agg.dr, agg.n)} (~31)`);
console.log(`0-0 ${pct(agg.nil, agg.n)} (~7) · 6+ mål ${pct(agg.big, agg.n)} (~4)`);
console.log('hyppigste resultater:', Object.entries(agg.scores).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => `${k} ${pct(v, agg.n)}`).join(' · '), '(virkelighed: 1-0 ~18, 1-1 ~11, 2-1 ~11, 2-0 ~10, 0-0 ~7)');
console.log(`mesterpoint snit ${avg(champPts)} (PL ~88, 20 hold) · sidstepladsens point ${avg(lastPts)} (~22) · mesterens målforskel ${avg(spreadGD)} (~+55)`);
console.log(`topscorer snit ${avg(topScorer)} ligamål (~27) · en af de 2 stærkeste trupper vinder ${pct(favChamp, champs)} (~75)`);
console.log(`rangkorrelation trup→tabel ${(spearSum / spearN).toFixed(2)} (virkelighed ~0,75) · top-3 taber til bund-5 ${pct(upsets, upsetN)} (~12)`);
console.log('CA-ændring pr. alder over perioden:', Object.entries(ageDelta).map(([b, [s, n]]) => `${b}: ${(s / n).toFixed(1)}`).join(' · '));
console.log(`Spillere i alt ${Object.keys(g.players).length}, snit-trup ${avg(Object.values(g.clubs).slice(0, 300).map((c) => squad(c.id).length))}`);
