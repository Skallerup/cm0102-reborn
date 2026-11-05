// Taktik-laboratorium: hvor meget betyder formation, instruktioner, spillervalg og at udnytte
// modstanderens svagheder? To jævnbyrdige hold på neutral bane; hver variant spilles fra begge
// sider, så holdenes styrkeforskel går ud. Effekt = point pr. kamp i forhold til grundopstillingen.
// Kør: npx tsx scripts/tactics-lab.ts [kampe pr. variant] [afsnit: form,matrix,instr,players,weak – standard alle]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { squadStrength } from '../src/game/board';
import { quickMatch, type EngineTeam } from '../src/game/engine/match';
import { Rng } from '../src/game/rng';
import { A } from '../src/game/attributes';
import { autoSelect, changeFormation, FORMATIONS, newTactic } from '../src/game/tactics';
import type { Player, Tactic } from '../src/game/types';

const N = Number(process.argv[2] ?? 1500);
const ONLY = process.argv[3]?.split(',');
const on = (k: string) => !ONLY || ONLY.includes(k);
const world = JSON.parse(readFileSync('public/data/world.json', 'utf8')) as WorldData;
const ni = (n: string) => world.nations.findIndex((x) => x.name === n);
createGame(world, { managerName: 'Lab', managerNation: ni('England'), clubId: world.clubs.find((c) => c[2] === 'Brøndby')?.[0] ?? world.clubs[0][0], activeNations: [ni('England'), ni('Denmark')], lang: 'da', masking: true, seed: 5 });
const g = gs();
const epl = Object.values(g.comps).find((c) => c.type === 'league' && c.tier === 1 && world.nations[c.nation]?.name === 'England')!;
const ranked = epl.clubs.slice().sort((a, b) => squadStrength(b) - squadStrength(a));
const [H, O] = [ranked[9], ranked[10]]; // to midterhold
const fresh = (id: number) => squad(id).map((p) => ({ ...p, attrs: p.attrs.slice(), condition: 100, injury: null, banned: 0 }) as Player);
console.log(`Hold: ${g.clubs[H].name} (${squadStrength(H).toFixed(0)}) vs ${g.clubs[O].name} (${squadStrength(O).toFixed(0)}), ${N} kampe pr. side pr. variant\n`);

type Side = { ps: Player[]; t: Tactic };
const side = (id: number, formation = '4-4-2', mod?: (s: Side) => void): Side => {
  const ps = fresh(id);
  const s = { ps, t: autoSelect(newTactic(formation), ps, false) };
  mod?.(s);
  return s;
};
const et = (club: number, s: Side): EngineTeam => ({ club, tactic: s.t, players: new Map(s.ps.map((p) => [p.id, p])) });
const rng = new Rng(11);
/** point pr. kamp og målforskel for "mig" (variant) mod "dem" – spillet fra begge sider (hold A og B bytter) */
function run(me: (id: number) => Side, them: (id: number) => Side, reps = N) {
  let pts = 0, gd = 0, gf = 0, n = 0;
  for (const [a, b] of [[H, O], [O, H]] as const) {
    for (let i = 0; i < reps; i++) {
      const home = i % 2 === 0;
      const m = et(a, me(a)), o = et(b, them(b));
      const r = quickMatch(home ? m : o, home ? o : m, { neutral: true }, rng);
      const mine = home ? r.stats[0].goals : r.stats[1].goals, theirs = home ? r.stats[1].goals : r.stats[0].goals;
      pts += mine > theirs ? 3 : mine === theirs ? 1 : 0; gd += mine - theirs; gf += mine; n++;
    }
  }
  return { ppg: pts / n, gd: gd / n, gf: gf / n };
}
// grundlinjen spilles 4 gange så mange gange, så den ikke selv bidrager med støj
const base = run((id) => side(id), (id) => side(id), N * 4);
const se = 1.25 / Math.sqrt(2 * N);
console.log(`Grundopstilling 4-4-2 vs 4-4-2: ${base.ppg.toFixed(2)} p/kamp (statistisk usikkerhed ±${(2 * se).toFixed(2)})`);
const show = (label: string, r: ReturnType<typeof run>) => {
  const d = r.ppg - base.ppg;
  console.log(`${label.padEnd(52)} ${d >= 0 ? '+' : ''}${d.toFixed(2)} p/kamp  (~${d >= 0 ? '+' : ''}${Math.round(d * 38)} point/sæson)  mål for ${r.gf.toFixed(2)}`);
};

if (on('form')) console.log('\n— Formation (mod 4-4-2) —');
if (on('form')) for (const f of FORMATIONS) if (f !== '4-4-2') show(f, run((id) => side(id, f), (id) => side(id)));

if (on('matrix')) {
console.log('\n— Formation mod formation (sten-saks-papir?) —');
const FS = ['4-4-2', '4-3-3', '4-2-3-1', '3-5-2', '5-3-2', '4-5-1', '4-4-2 Diamond'];
console.log('mig \\ dem'.padEnd(10) + FS.map((f) => f.replace('4-4-2 Diamond', 'Diamant').padStart(9)).join(''));
for (const a of FS) {
  const row = FS.map((b) => (a === b ? '        –' : run((id) => side(id, a), (id) => side(id, b)).ppg.toFixed(2).padStart(9)));
  console.log(a.replace('4-4-2 Diamond', 'Diamant').padEnd(10) + row.join(''));
}
}

if (on('instr')) console.log('\n— Holdinstruktioner (4-4-2 vs 4-4-2) —');
const ti = (patch: Partial<Tactic['team']>) => (id: number) => side(id, '4-4-2', (s) => { s.t = { ...s.t, team: { ...s.t.team, ...patch } }; });
for (const [l, p] of [['Mentalitet meget defensiv (0)', { mentality: 0 }], ['Mentalitet defensiv (1)', { mentality: 1 }], ['Mentalitet offensiv (3)', { mentality: 3 }], ['Mentalitet meget offensiv (4)', { mentality: 4 }],
  ['Pres højt (closingDown 2)', { closingDown: 2 }], ['Pres lavt (closingDown 0)', { closingDown: 0 }], ['Korte afleveringer', { passing: 0 }], ['Lange afleveringer', { passing: 2 }],
  ['Højt tempo', { tempo: 2 }], ['Lavt tempo', { tempo: 0 }], ['Bredt', { width: 2 }], ['Smalt', { width: 0 }], ['Offsidefælde', { offside: true }], ['Kontra', { counter: true }],
  ['Mandsopdækning', { marking: 'man' }], ['Hårde tacklinger', { tackling: 2 }]] as [string, Partial<Tactic['team']>][]) if (on('instr')) show(l, run(ti(p), (id) => side(id)));

if (on('players')) {
console.log('\n— Spillervalg —');
const misfit = (fn: (s: Side) => void) => (id: number) => side(id, '4-4-2', fn);
const swap = (s: Side, i: number, j: number) => { const l = s.t.lineup.slice(); [l[i], l[j]] = [l[j], l[i]]; s.t = { ...s.t, lineup: l }; };
show('Angriber og midtstopper byttet om', run(misfit((s) => swap(s, 2, 9)), (id) => side(id)));
show('Venstre back og højre kant byttet om', run(misfit((s) => swap(s, 1, 8)), (id) => side(id)));
show('Målmand og angriber byttet om', run(misfit((s) => swap(s, 0, 9)), (id) => side(id)));
show('Svageste 11 i truppen i stedet for bedste', run((id) => side(id, '4-4-2', (s) => {
  const rest = s.ps.filter((p) => !s.t.lineup.includes(p.id));
  s.t = autoSelect(newTactic('4-4-2'), rest.length >= 11 ? rest : s.ps, false);
}), (id) => side(id)));
show('Alle egne spillere +1 i alle egenskaber', run((id) => side(id, '4-4-2', (s) => s.ps.forEach((p) => { p.attrs = p.attrs.map((v) => Math.min(20, v + 1)); })), (id) => side(id)));

}
if (on('weak')) {
console.log('\n— Udnyt modstanderens svaghed —');
// modstanderens backs er langsomme: gør det noget at spille bredt med hurtige kanter?
const slowBacks = (id: number) => side(id, '4-4-2', (s) => [1, 4].forEach((k) => { const p = s.ps.find((x) => x.id === s.t.lineup[k])!; p.attrs[A.pace] = 5; p.attrs[A.acceleration] = 5; }));
const baseSlow = run((id) => side(id), slowBacks);
console.log(`Mod langsomme backs, normal taktik: ${(baseSlow.ppg - base.ppg >= 0 ? '+' : '')}${(baseSlow.ppg - base.ppg).toFixed(2)} p/kamp`);
show('  … og vi spiller bredt + indlæg + kontra', run(ti({ width: 2, counter: true }), slowBacks));
show('  … og vi spiller smalt (forkert svar)', run(ti({ width: 0 }), slowBacks));
// modstanderens midtstoppere er små: gør høje indlæg en forskel?
const shortCBs = (id: number) => side(id, '4-4-2', (s) => [2, 3].forEach((k) => { const p = s.ps.find((x) => x.id === s.t.lineup[k])!; p.attrs[A.heading] = 5; p.attrs[A.jumping] = 5; p.height = 172; }));
const baseShort = run((id) => side(id), shortCBs);
console.log(`Mod små midtstoppere, normal taktik: ${(baseShort.ppg - base.ppg >= 0 ? '+' : '')}${(baseShort.ppg - base.ppg).toFixed(2)} p/kamp`);
show('  … og vi spiller bredt med mange indlæg', run((id) => side(id, '4-4-2', (s) => { s.t = { ...s.t, team: { ...s.t.team, width: 2 }, individual: s.t.individual.map((x) => ({ ...x, crossing: 2 })) }; }), shortCBs));
// modstanderen spiller højt forsvar med offside: hurtige angribere og gennembrud
const highLine = (id: number) => side(id, '4-4-2', (s) => { s.t = { ...s.t, team: { ...s.t.team, offside: true, mentality: 3 } }; });
const baseHigh = run((id) => side(id), highLine);
console.log(`Mod højt forsvar med offsidefælde, normal taktik: ${(baseHigh.ppg - base.ppg >= 0 ? '+' : '')}${(baseHigh.ppg - base.ppg).toFixed(2)} p/kamp`);
show('  … og vi spiller gennembrud + kontra + lange bolde', run((id) => side(id, '4-4-2', (s) => { s.t = { ...s.t, team: { ...s.t.team, counter: true, passing: 2 }, individual: s.t.individual.map((x) => ({ ...x, throughBalls: true, runs: 2 })) }; }), highLine));
}
if (on('cond')) {
  console.log('\n— Instruktioner afhænger af modstanderen —');
  const opp = (patch: Partial<Tactic['team']>) => (id: number) => side(id, '4-4-2', (s) => { s.t = { ...s.t, team: { ...s.t.team, ...patch } }; });
  for (const [l, mine, theirs] of [
    ['Kontra mod meget offensiv modstander', { counter: true }, { mentality: 4 }],
    ['Kontra mod meget defensiv modstander', { counter: true }, { mentality: 0 }],
    ['Korte afl. mod højt pres', { passing: 0 }, { closingDown: 2 }],
    ['Korte afl. mod lavt pres', { passing: 0 }, { closingDown: 0 }],
    ['Lange afl. mod højt pres + offensiv', { passing: 2 }, { closingDown: 2, mentality: 3 }],
    ['Lange afl. mod lav blok', { passing: 2 }, { closingDown: 0, mentality: 1 }],
    ['Højt pres mod korte afleveringer', { closingDown: 2 }, { passing: 0 }],
    ['Højt pres mod lange afleveringer', { closingDown: 2 }, { passing: 2 }],
  ] as [string, Partial<Tactic['team']>, Partial<Tactic['team']>][]) {
    const ref = run(opp({}), opp(theirs));
    const r = run(opp(mine), opp(theirs));
    console.log(`${l.padEnd(52)} ${r.ppg - ref.ppg >= 0 ? '+' : ''}${(r.ppg - ref.ppg).toFixed(2)} p/kamp (~${Math.round((r.ppg - ref.ppg) * 38)} point/sæson)`);
  }
}
