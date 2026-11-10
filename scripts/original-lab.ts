// Kalibrering af den originale 2001/02-database mod det originale CM 01/02: spil hele sæsoner med England aktiv
// og sammenlign Premier League med originalens egen sæson (scripts/original-stats.ts på en ferie-sæson 2001/02).
// Kør: npx tsx scripts/original-lab.ts [sæsoner] [finish] [homeAdv] [finSlope] [squash] [squashAtt] [ease] [squashDef] [seed] [close] [closeSlope]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { ORIGINAL, continueGame, labHooks, quickPlayUserMatch } from '../src/game/sim';
import { naturalRole } from '../src/game/attributes';
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
if (process.env.SPREAD) (ORIGINAL as { shotSpread?: number }).shotSpread = Number(process.env.SPREAD);
if (process.env.ONEK) (ORIGINAL as { oneOnOneK?: number }).oneOnOneK = Number(process.env.ONEK);
if (process.env.SQ_ATT) ORIGINAL.squashAtt = Number(process.env.SQ_ATT);
const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
// brugerens klub: en lille klub uden for de fire ligaer påvirker ikke Premier League
const user = world.clubs.find((c) => world.nations[c[1] as number] && c[2] === 'Brøndby')?.[0] ?? world.clubs.at(-1)![0];
createGame(world, { managerName: 'Lab', managerNation: eng, clubId: user, activeNations: [eng, world.nations.findIndex((x) => x.name === 'Denmark')], lang: 'da', masking: true, seed });
const g = gs();
// sæsonskiftet laver nye turneringsobjekter – find Premier League igen hver dag
const findPl = () => Object.values(g.comps).find((c) => c.type === 'league' && c.tier === 1 && c.nation === eng)!;
let pl = findPl();

// målscorerfordelingen (trin 15): mål/skud pr. spiller i PL og skudtyperne bag målene
const sc = new Map<number, { goals: number; shots: number; pens: number; club: number }>();
const ss = new Map<number, { goals: number; shots: number; club: number }>();
const kindBy = new Map<number, Record<string, number>>();
const seasonSc: { n20: number; n15: number; n10: number; r: number[]; top: string; topShots: number; conv10: number; convAll: number }[] = [];
const kinds: Record<string, number> = {};
let plIdRef = '';
labHooks.report = (f, rep) => {
  if (f.comp !== plIdRef) return;
  for (const s of rep.shots) {
    const e = sc.get(s.p) ?? { goals: 0, shots: 0, pens: 0, club: s.t === 0 ? f.home : f.away }; e.shots++;
    if (s.outcome === 'goal' && !s.og) { e.goals++; if (s.kind === 'pen') e.pens++; kinds[s.kind] = (kinds[s.kind] ?? 0) + 1; }
    sc.set(s.p, e);
    const kk = kindBy.get(s.p) ?? {}; kk[s.kind] = (kk[s.kind] ?? 0) + 1; kindBy.set(s.p, kk);
    const q = ss.get(s.p) ?? { goals: 0, shots: 0, club: e.club }; q.shots++; if (s.outcome === 'goal' && !s.og) q.goals++; ss.set(s.p, q);
  }
};
const a = { n: 0, goals: 0, hw: 0, dr: 0, nil: 0, y: 0, r: 0, sh: 0, sot: 0, cor: 0, off: 0, fouls: 0, scores: {} as Record<string, number>, champ: [] as number[], last: [] as number[], top: [] as number[] };
const end = g.season + seasons;
const tops: string[] = [];
const shares: number[] = [];
const gfs: number[] = [], gas: number[] = [];
let days = 0;
while (g.season < end && days++ < 420 * seasons) {
  plIdRef = pl.id;
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
  {
    const all = [...ss.values()].sort((x, y) => y.goals - x.goals), t10 = all.slice(0, 10);
    const byClub = new Map<number, number[]>();
    for (const e of all) byClub.set(e.club, [...(byClub.get(e.club) ?? []), e.goals]);
    const r = [0, 1, 2].map((k) => [...byClub.values()].reduce((s2, v) => s2 + (v[k] ?? 0), 0) / byClub.size);
    seasonSc.push({ n20: all.filter((e) => e.goals >= 20).length, n15: all.filter((e) => e.goals >= 15).length, n10: all.filter((e) => e.goals >= 10).length, r,
      top: all.slice(0, 5).map((e) => `${e.goals}/${e.shots}`).join(' · '), topShots: all[0]?.shots ?? 0,
      conv10: t10.reduce((s2, e) => s2 + e.goals, 0) / t10.reduce((s2, e) => s2 + e.shots, 0), convAll: all.reduce((s2, e) => s2 + e.goals, 0) / all.reduce((s2, e) => s2 + e.shots, 0) });
    ss.clear();
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

{
  const all = [...sc.entries()].map(([id, e]) => ({ id, ...e, p: g.players[id] })).sort((x, y) => y.goals - x.goals);
  const tot = all.reduce((s, e) => s + e.goals, 0), per = seasons;
  const role: Record<string, number> = {};
  for (const e of all) { const r = e.p ? naturalRole(e.p) : '?'; role[r] = (role[r] ?? 0) + e.goals; }
  const top10 = all.slice(0, 10 * per);
  const m = (f: (x: typeof seasonSc[0]) => number) => (seasonSc.reduce((s2, x) => s2 + f(x), 0) / seasonSc.length);
  void top10;
  console.log(`\nmålscorere pr. sæson (snit af ${seasonSc.length}): 20+/15+/10+ mål ${m((x) => x.n20).toFixed(1)}/${m((x) => x.n15).toFixed(1)}/${m((x) => x.n10).toFixed(1)} (orig 5/8/27) · holdets nr. 1/2/3 ${m((x) => x.r[0]).toFixed(1)}/${m((x) => x.r[1]).toFixed(1)}/${m((x) => x.r[2]).toFixed(1)} (orig 14,7/8,6/7,0)`);
  console.log(`  mål pr. skud: top 10 ${m((x) => x.conv10).toFixed(3)} (orig 0,214) · alle ${m((x) => x.convAll).toFixed(3)} (orig 0,165) · topscorerens skud ${m((x) => x.topShots).toFixed(0)} (orig 93) · top 5 mål/skud: ${seasonSc.map((x) => x.top).join(' | ')}`);
  console.log(`  mål pr. rolle: ${Object.entries(role).sort((x, y) => y[1] - x[1]).map(([k, v]) => `${k} ${(100 * v / tot).toFixed(0)} %`).join(' · ')} (orig pladser: angreb 46 + plads 10 8 · midtbane 30 · forsvar 12 · indskiftere 4)`);
  console.log(`  skud pr. kamp ${(all.reduce((s, e) => s + e.shots, 0) / a.n).toFixed(1)} (orig 17,2)`);
  console.log(`  skudtyper bag målene: ${Object.entries(kinds).sort((x, y) => y[1] - x[1]).map(([k, v]) => `${k} ${(100 * v / tot).toFixed(1)} %`).join(' · ')} · straffe ${(all.reduce((s, e) => s + e.pens, 0) / a.n).toFixed(3)} pr. kamp`);
}

if (process.env.KINDS) {
  const all = [...sc.entries()].sort((x, y) => y[1].shots - x[1].shots);
  const sum = (ids: number[]) => { const t: Record<string, number> = {}; let n = 0; for (const id of ids) for (const [k, v] of Object.entries(kindBy.get(id) ?? {})) { t[k] = (t[k] ?? 0) + v; n += v; } return Object.entries(t).sort((x, y) => y[1] - x[1]).map(([k, v]) => `${k} ${(100 * v / n).toFixed(0)}%`).join(' · '); };
  console.log('top 10 skytter:', sum(all.slice(0, 10).map((x) => x[0])));
  console.log('alle:', sum(all.map((x) => x[0])));
}
