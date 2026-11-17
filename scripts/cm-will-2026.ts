// 2026/27 i ægte tilstand (MODERN_PARITY 1+4): pengefaktoren cmGbp, Player Search "Interested" (0x807450/0x846920) og kontraktkravene
// (0x85fc50) for kendte spillere. npx tsx scripts/cm-will-2026.ts [klub] [authentic|extended] [--no-count]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { playerInterest } from '../src/game/transfers';
import * as SI from '../src/game/cmSearchInterest';
const { cmSearchInterested } = SI;
import { cmTalkDemand, cmMoveInterest } from '../src/game/cmContractGame';
import { cmGbp } from '../src/game/cmMoney';

const WORLD = process.env.WORLD ?? 'public/data/world.json';
const w = JSON.parse(readFileSync(WORLD, 'utf8')) as WorldData & { cmRaw?: unknown };
if (!w.cmRaw) w.cmRaw = (JSON.parse(readFileSync('public/data/world-cm.json', 'utf8')) as { cmRaw?: unknown }).cmRaw;
const name = process.argv[2] ?? 'Vejle';
const mode = (process.argv[3] ?? 'authentic') as 'authentic' | 'extended';
const nat = (n: string) => w.nations.findIndex((x) => x.name === n);
const cid = w.clubs.find((c) => c[1] === name || c[2] === name)![0];
const t0 = performance.now();
createGame(w, { managerName: 'T', managerNation: nat('Denmark'), clubId: cid, activeNations: ['Denmark', 'Spain', 'England', 'Germany'].map(nat), lang: 'da', masking: true, seed: 1, mode });
const g = gs();
console.log(`${name} (${mode}): spillet bygget på ${Math.round(performance.now() - t0)} ms`);
const lg = (n: string) => Object.values(g.clubs).find((c) => c.name === n)?.league;
for (const c of ['Manchester City', 'Vejle', 'Brøndby IF', 'Brøndby', 'Bayern München', 'Valencia', 'Real Madrid']) {
  const l = lg(c);
  if (l) console.log(`  cmGbp ${c} (${l}): ${cmGbp(g, Object.values(g.clubs).find((x) => x.name === c)!.id).toFixed(4)}`);
}
console.log(`  cmGbp k: ${g.cmGbp?.k ?? '-'}`);
const me = g.clubs[g.userClub];
if (!process.argv.includes('--no-count')) {
  const t1 = performance.now();
  let n = 0, all = 0;
  const hist = new Map<string, number>();
  for (const p of Object.values(g.players)) {
    if (p.club === me.id) continue;
    all++;
    if (cmSearchInterested(g, p, me.id) ?? playerInterest(p, me) === 'yes') n++;
    const { cmSearchInterestValue } = SI;
    const x = cmSearchInterestValue(g, p, me.id);
    const b = x === null ? 'null' : x < 0 ? '-1' : x === 0 ? '0' : x < 1 ? '<1' : x < 2 ? '1-2' : x < 3.15 ? '2-3.15' : x < 4 ? '3.15-4' : '4+';
    hist.set(b, (hist.get(b) ?? 0) + 1);
  }
  console.log(`  Interested: ${n} af ${all} (${Math.round(performance.now() - t1)} ms); 0x846920: ${[...hist].map(([k, v]) => `${k}:${v}`).join(' ')}`);
}
const find = (first: string, last: string) => Object.values(g.players).find((p) => p.first === first && p.last === last);
const eur = (v: number) => `€${Math.round(v).toLocaleString('da-DK')}`;
for (const [f, l] of [['Javi', 'Guerra'], ['Kobbie', 'Mainoo'], ['Sacha', 'Boey'], ['Erling', 'Haaland'], ['Jonas', 'Wind'], ['Mikkel', 'Damsgaard']]) {
  const p = find(f, l);
  if (!p) { console.log(`  ${f} ${l}: findes ikke`); continue; }
  const d = cmTalkDemand(g, p, me.id);
  const x = cmMoveInterest(g, p, me.id);
  const fi = cmSearchInterested(g, p, me.id);
  console.log(`  ${f} ${l} (${g.clubs[p.club]?.name ?? 'klubløs'}, CA ${p.ca}): løn nu ${eur(p.contract?.wage ?? 0)}/uge; krav hos ${me.name} ${d ? eur(d.wage) + '/uge til ' + d.expires + (d.signOn ? ', signing-on ' + eur(d.signOn) : '') : '-'}; 0x846920(skifte) ${x?.toFixed(2) ?? '-'}; Interested ${fi ?? playerInterest(p, me)}`);
}
