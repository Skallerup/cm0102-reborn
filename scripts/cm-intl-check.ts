// Landskampkalenderen i ægte tilstand (cmIntl.ts) mod oraklet (crowd1, frø 1, 3.9.60, England/Arsenal): venskabskampe pr. dato og U21-kampe dagen før.
// Brug: npx tsx scripts/cm-intl-check.ts [til-dato=2002-04-30] [frø=1]
import { readFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs } from '../src/game/state';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { addDays } from '../src/game/dates';

/** oraklet: [dato, venskabskampe mellem landshold (turnering 72), U21-kampe dagen før (401)] */
export const ORACLE: [string, number, number][] = [
  ['2001-07-22', 2, 3], ['2001-07-29', 4, 4], ['2001-08-15', 4, 4], ['2001-08-19', 2, 3], ['2001-09-01', 20, 20], ['2001-09-05', 4, 4], ['2001-09-12', 3, 3],
  ['2001-09-15', 3, 2], ['2001-09-30', 2, 3], ['2001-10-03', 3, 3], ['2001-10-06', 20, 20], ['2001-10-10', 4, 3], ['2001-10-20', 2, 3], ['2001-10-27', 1, 0],
  ['2001-11-14', 24, 24], ['2001-11-18', 3, 2], ['2001-12-01', 2, 0], ['2002-03-23', 20, 18], ['2002-04-24', 19, 17],
];

const until = process.argv[2] ?? '2002-04-30';
const seed = Number(process.argv[3] ?? 1);
const world = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world-original.json', 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
const club = world.clubs.find((c) => c[2] === 'Arsenal')![0];
const t0 = Date.now();
createGame(world, { managerName: 'T', managerNation: eng, clubId: club, activeNations: [eng], lang: 'en', masking: true, seed, mode: 'authentic' });
const g = gs();
// g.intl.results holder kun de seneste 150 – tæl hver ny undervejs
const seen = new WeakSet<object>(), res: { date: string; kind: string }[] = [];
const collect = () => { for (const r of g.intl?.results ?? []) if (!seen.has(r)) { seen.add(r); res.push(r); } };
collect();
while (g.date < until) { const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); collect(); }
const by = (kind: string) => { const m = new Map<string, number>(); for (const r of res) if (r.kind === kind) m.set(r.date, (m.get(r.date) ?? 0) + 1); return m; };
const fr = by('friendly'), u = by('u21');
const dates = [...new Set([...fr.keys(), ...ORACLE.map((x) => x[0])])].sort();
let tf = 0, tu = 0, of = 0, ou = 0;
console.log('dato        vores A  U21 | oraklet A  U21');
for (const d of dates) {
  const o = ORACLE.find((x) => x[0] === d);
  const a = fr.get(d) ?? 0, b = u.get(addDays(d, -1)) ?? 0;
  tf += a; tu += b; of += o?.[1] ?? 0; ou += o?.[2] ?? 0;
  console.log(`${d}  ${String(a).padStart(6)} ${String(b).padStart(4)} | ${String(o?.[1] ?? '-').padStart(9)} ${String(o?.[2] ?? '-').padStart(4)}`);
}
console.log(`i alt       ${String(tf).padStart(6)} ${String(tu).padStart(4)} | ${String(of).padStart(9)} ${String(ou).padStart(4)}   (${Math.round((Date.now() - t0) / 1000)} s; andre landskampe: ${[...new Set(res.map((r) => r.kind))].join(', ')})`);
