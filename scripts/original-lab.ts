// Kalibrering af den originale 2001/02-database mod det originale CM 01/02: spil hele sæsoner med England aktiv
// og sammenlign Premier League med originalens egen sæson (scripts/original-stats.ts på en ferie-sæson 2001/02).
// Kør: npx tsx scripts/original-lab.ts [sæsoner] [finish] [homeAdv] [finSlope] [squash] [squashAtt] [ease] [squashDef] [seed] [close] [closeSlope]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { ORIGINAL, continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs } from '../src/game/state';
import { finalOrder } from '../src/game/competitions';

const [seasons = 1, finish, homeAdv, finSlope, squash, squashAtt, ease, squashDef, seed = 2001, close, closeSlope] = process.argv.slice(2).map(Number);
const P = ORIGINAL as typeof ORIGINAL & { close?: number; closeSlope?: number };
if (close !== undefined) P.close = close;
if (closeSlope) P.closeSlope = closeSlope;
if (squashDef) ORIGINAL.squashDef = squashDef;
if (ease) ORIGINAL.ease = ease;
if (squash) ORIGINAL.squash = squash;
if (squashAtt) ORIGINAL.squashAtt = squashAtt;
if (squash && !squashAtt) ORIGINAL.squashAtt = squash;
if (squash && !squashDef) ORIGINAL.squashDef = squash;
if (finish) ORIGINAL.finish = finish;
if (homeAdv) ORIGINAL.homeAdv = homeAdv;
if (finSlope) ORIGINAL.finSlope = finSlope;
const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
// brugerens klub: en lille klub uden for de fire ligaer påvirker ikke Premier League
const user = world.clubs.find((c) => world.nations[c[1] as number] && c[2] === 'Brøndby')?.[0] ?? world.clubs.at(-1)![0];
createGame(world, { managerName: 'Lab', managerNation: eng, clubId: user, activeNations: [eng, world.nations.findIndex((x) => x.name === 'Denmark')], lang: 'da', masking: true, seed });
const g = gs();
// sæsonskiftet laver nye turneringsobjekter – find Premier League igen hver dag
const findPl = () => Object.values(g.comps).find((c) => c.type === 'league' && c.tier === 1 && c.nation === eng)!;
let pl = findPl();

const a = { n: 0, goals: 0, hw: 0, dr: 0, nil: 0, y: 0, r: 0, sh: 0, sot: 0, cor: 0, off: 0, fouls: 0, scores: {} as Record<string, number>, champ: [] as number[], last: [] as number[], top: [] as number[] };
const end = g.season + seasons;
const tops: string[] = [];
const shares: number[] = [];
const gfs: number[] = [], gas: number[] = [];
let days = 0;
while (g.season < end && days++ < 420 * seasons) {
  const r = continueGame();
  if (r.match !== undefined) quickPlayUserMatch();
  pl = findPl();
  if (!g.date.endsWith('-06-29') || !pl.finished) continue;
  const fin = finalOrder(pl), tbl = Object.fromEntries(pl.table.map((t) => [t.club, t]));
  a.champ.push(tbl[fin[0]].pts); a.last.push(tbl[fin.at(-1)!].pts);
  // de bedste målscorere: mål, straffe, holdets mål og kampe
  tops.push(Object.values(g.players).filter((p) => pl.clubs.includes(p.club!)).sort((x, y) => y.stats.lgGoals - x.stats.lgGoals).slice(0, 5)
    .map((p) => `${p.last} (${g.clubs[p.club!]?.short}) ${p.stats.lgGoals}/${tbl[p.club!]?.gf} i ${p.stats.apps}`).join(' · '));
  for (const t of pl.table) { gfs.push(t.gf); gas.push(t.ga); }
  // hvert holds bedste målscorers andel af holdets ligamål (originalen: 31-43 % for de fem bedste)
  for (const club of pl.clubs) {
    const best = Object.values(g.players).filter((p) => p.club === club).reduce((m, p) => Math.max(m, p.stats.lgGoals), 0);
    if (tbl[club]?.gf) shares.push(best / tbl[club].gf);
  }
  a.top.push(Object.values(g.players).filter((p) => pl.clubs.includes(p.club!)).map((p) => p.stats.lgGoals).sort((x, y) => y - x)[0] ?? 0);
  for (const f of Object.values(g.fixtures)) {
    if (f.comp !== pl.id || !f.result) continue;
    const { hg, ag } = f.result;
    a.n++; a.goals += hg + ag; if (hg > ag) a.hw++; else if (hg === ag) a.dr++; if (hg + ag === 0) a.nil++;
    const k = `${Math.max(hg, ag)}-${Math.min(hg, ag)}`; a.scores[k] = (a.scores[k] ?? 0) + 1;
    const rep = g.reports[f.id];
    if (rep) for (const st of rep.stats) { a.y += st.yellows; a.r += st.reds; a.sh += st.shots; a.sot += st.onTarget; a.cor += st.corners; a.off += st.offsides; a.fouls += st.fouls; }
  }
}
const pct = (x: number) => `${((x / a.n) * 100).toFixed(1)}%`;
const avg = (xs: number[]) => (xs.reduce((s, v) => s + v, 0) / Math.max(1, xs.length)).toFixed(1);
const reps = Object.values(g.fixtures).filter((f) => f.comp === pl.id && g.reports[f.id]).length || 1;
console.log(`profil ${JSON.stringify(ORIGINAL)} · ${a.n} PL-kampe over ${seasons} sæson(er)`);
console.log(`mål/kamp ${(a.goals / a.n).toFixed(2)} (orig 2,87) · H/U/B ${pct(a.hw)} / ${pct(a.dr)} / ${pct(a.n - a.hw - a.dr)} (orig 51,1 / 22,6 / 26,3) · 0-0 ${pct(a.nil)} (orig 5,3)`);
console.log('resultater:', Object.entries(a.scores).sort((x, y) => y[1] - x[1]).slice(0, 8).map(([k, v]) => `${k} ${pct(v)}`).join(' · '), '(orig 2-1 15,5 · 2-0 15,5 · 1-0 14,7 · 1-1 10,3 · 3-1 8,2 · 3-0 6,8 · 2-2 5,8 · 3-2 5,5)');
console.log(`mester ${avg(a.champ)} p (orig 84) · sidst ${avg(a.last)} p (orig 25) · topscorer ${avg(a.top)} (orig 23)`);
console.log(`pr. kamp (${reps} rapporter): skud ${(a.sh / reps).toFixed(1)} (orig 17,2) · på mål ${(a.sot / reps).toFixed(1)} (10,3) · hjørnespark ${(a.cor / reps).toFixed(1)} (5,0) · offside ${(a.off / reps).toFixed(1)} (7,4) · frispark begået ${(a.fouls / reps).toFixed(1)} (~8,6) · gule ${(a.y / reps).toFixed(2)} (1,70) · røde ${(a.r / reps).toFixed(3)} (0,139)`);
console.log('topscorere (mål/holdets mål i kampe):\n  ' + tops.join('\n  '));
shares.sort((x, y) => x - y);
console.log(`bedste målscorers andel af holdets mål: snit ${(avg(shares.map((x) => x * 100)))} % · median ${(shares[Math.floor(shares.length / 2)] * 100).toFixed(0)} % · max ${(shares.at(-1)! * 100).toFixed(0)} % · over 50 %: ${shares.filter((x) => x > 0.5).length} af ${shares.length}`);
const sd = (xs: number[]) => { const m = xs.reduce((s, v) => s + v, 0) / xs.length; return Math.sqrt(xs.reduce((s, v) => s + (v - m) ** 2, 0) / xs.length).toFixed(1); };
console.log(`scorede mål pr. hold: max ${Math.max(...gfs)} · min ${Math.min(...gfs)} · sd ${sd(gfs)} (orig 68/40/9,0) · indladte: max ${Math.max(...gas)} · min ${Math.min(...gas)} · sd ${sd(gas)} (orig 88/22/…)`);
