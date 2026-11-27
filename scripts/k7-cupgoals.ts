// K7: mål pr. kamp og H/U/B i pokal- og Europakampene (og venskabskampene) – spillet (2001, ægte tilstand, Wrexham) mod oraklets kampprogram
// (fixtures_<år>.tmp i daysnap-kørslen: +0 turnering, +40 år, +42 dag, +67/+68 mål) til slutdatoen.
//   node scripts/measure.mjs -- npx tsx scripts/k7-cupgoals.ts [slutdato = 2001-12-31] [frø = 1]
//   ONLY_ORACLE=1: kun oraklets side
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { DEFAULT_DAYSNAP } from './oracle-days';

const until = process.argv[2] ?? '2001-12-31', seed = Number(process.argv[3] ?? 1);
// club_comp.dat-id → spillets turnering
const COMPS: [number, string, string][] = [[326, 'CL', 'Champions League'], [328, 'UEFA', 'UEFA Cup'], [330, 'UIC', 'Intertoto'], [329, 'ESC', 'Super Cup'],
  [351, 'CUP-60', 'FA Cup'], [352, 'LC-60', 'League Cup'], [353, 'CS-60', 'Charity Shield'], [72, 'FRIENDLY', 'Friendly']];
type Acc = { n: number; g: number; h: number; d: number; a: number };
const acc = () => ({ n: 0, g: 0, h: 0, d: 0, a: 0 });
const add = (x: Acc, hg: number, ag: number) => { x.n++; x.g += hg + ag; if (hg > ag) x.h++; else if (hg === ag) x.d++; else x.a++; };

const oracle = new Map<number, Acc>();
const files = join(DEFAULT_DAYSNAP, 'files');
for (const f of existsSync(files) ? readdirSync(files).filter((x) => /^fixtures_\d{4}\.tmp$/.test(x)) : []) {
  const b = readFileSync(join(files, f)), v = new DataView(b.buffer, b.byteOffset, b.byteLength), n = v.getInt32(0, true);
  for (let k = 0; k < n && 4 + (k + 1) * 79 <= b.byteLength; k++) {
    const o = 4 + k * 79, id = v.getInt32(o, true); if (!COMPS.some((c) => c[0] === id)) continue;
    const hg = v.getUint8(o + 67), ag = v.getUint8(o + 68); if (hg === 0xff || ag === 0xff) continue;
    const date = new Date(Date.UTC(v.getUint16(o + 40, true), 0, 1) + v.getUint16(o + 42, true) * 864e5).toISOString().slice(0, 10);
    if (date < '2001-07-14' || date >= until) continue;
    add(oracle.get(id) ?? oracle.set(id, acc()).get(id)!, hg, ag);
  }
}
const ours = new Map<number, Acc>();
if (!process.env.ONLY_ORACLE) {
  const { createGame } = await import('../src/game/newgame');
  const { gs } = await import('../src/game/state');
  const { continueGame, quickPlayUserMatch } = await import('../src/game/sim');
  const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8'));
  const eng = world.nations.findIndex((x: { name: string }) => x.name === 'England');
  createGame(world, { managerName: 'Lab', managerNation: eng, clubId: world.clubs.find((c: unknown[]) => c[1] === 'Wrexham')[0], activeNations: [eng], lang: 'en', masking: true, seed, mode: 'authentic' });
  const g = gs();
  while (g.date < until) { const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch(); }
  for (const f of Object.values(g.fixtures)) {
    const c = COMPS.find((x) => x[1] === f.comp); if (!c || !f.result || f.date >= until) continue;
    add(ours.get(c[0]) ?? ours.set(c[0], acc()).get(c[0])!, f.result.hg, f.result.ag);
  }
}
const fmt = (x?: Acc) => (!x || !x.n ? '—'.padEnd(26) : `${String(x.n).padStart(4)} ${(x.g / x.n).toFixed(2)} ${[x.h, x.d, x.a].map((y) => Math.round((100 * y) / x.n)).join('/')}`.padEnd(26));
console.log(`til ${until}, frø ${seed}         spillet: n mål/kamp H/U/B%      oraklet`);
const tot = (m: Map<number, Acc>, ids: number[]) => ids.reduce((t, id) => { const x = m.get(id); if (x) { t.n += x.n; t.g += x.g; t.h += x.h; t.d += x.d; t.a += x.a; } return t; }, acc());
for (const [id, , name] of COMPS) console.log(`${name.padEnd(18)} ${fmt(ours.get(id))} ${fmt(oracle.get(id))}`);
const cups = COMPS.filter((c) => c[0] !== 72).map((c) => c[0]);
console.log(`${'pokal+Europa'.padEnd(18)} ${fmt(tot(ours, cups))} ${fmt(tot(oracle, cups))}`);
