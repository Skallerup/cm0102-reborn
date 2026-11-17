// Hvad ændrer spillets eget gemformat (src/game/snapshot.ts: JSON med tal rundet til 2 decimaler) ved GameState? Feltstierne (med tal-id'er
// samlet som *) og antal, for (1) gemformatet, (2) samme JSON uden afrunding, og (3) hvad indlæsningen (upgradeLoaded) ændrer bagefter.
//   npx tsx scripts/save-diff.ts [dato = 2001-07-20]   (startpunkt fra scripts/lib/snapshot.ts)
import { readFileSync } from 'node:fs';
import type { WorldData } from '../src/game/newgame';
import { gs, packCarry, setGame } from '../src/game/state';
import { rng } from '../src/game/rng';
import { upgradeLoaded } from '../src/game/save';
import { loadOrCreate } from './lib/snapshot';

const date = process.argv[2] ?? '2001-07-20';
const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
loadOrCreate({ world, worldFile: 'public/data/world-original.json', club: 'Wrexham', date, seed: 1, mode: 'authentic', engine: 'original' });
const g = gs();
g.rng = rng.state;
packCarry(g);

const round = (_k: string, v: unknown) => (typeof v === 'number' && !Number.isInteger(v) ? Math.round(v * 100) / 100 : v);
function paths(a: unknown, b: unknown, p: string, out: Map<string, { n: number; ex: string }>) {
  if (Object.is(a, b)) return;
  const ta = a === null ? 'null' : typeof a, tb = b === null ? 'null' : typeof b;
  if (ta !== 'object' || tb !== 'object' || Array.isArray(a) !== Array.isArray(b) || a instanceof Map || a instanceof Set) {
    const k = p.replace(/\.\d+(?=\.|$)/g, '.*');
    const e = out.get(k) ?? { n: 0, ex: `${String(a instanceof Map ? 'Map' : a instanceof Set ? 'Set' : JSON.stringify(a))?.slice(0, 40)} → ${JSON.stringify(b)?.slice(0, 40)}` };
    e.n++; out.set(k, e);
    return;
  }
  const A = a as Record<string, unknown>, B = b as Record<string, unknown>;
  for (const k of new Set([...Object.keys(A), ...Object.keys(B)])) {
    if (A[k] === undefined && !(k in B)) continue;   // undefined-felter falder ud af JSON (samme fingeraftryk)
    paths(A[k], B[k], `${p}.${k}`, out);
  }
}
const show = (title: string, m: Map<string, { n: number; ex: string }>) => {
  console.log(`\n${title}: ${m.size} feltstier, ${[...m.values()].reduce((s, x) => s + x.n, 0)} værdier`);
  for (const [k, v] of [...m].sort((x, y) => y[1].n - x[1].n).slice(0, 60)) console.log(`  ${String(v.n).padStart(7)}  ${k}   (fx ${v.ex})`);
};
const rounded = JSON.parse(JSON.stringify(g, round));
const exact = JSON.parse(JSON.stringify(g));
const m1 = new Map(), m2 = new Map(), m3 = new Map();
paths(g, rounded, '', m1);
paths(g, exact, '', m2);
show('gemformatet (2 decimaler)', m1);
show('JSON uden afrunding', m2);
// indlæsningen: setGame + upgradeLoaded (save.ts loadGame – uden repairStadiums/ensureAllNumbers' netværk) på den eksakte JSON
const before = JSON.parse(JSON.stringify(exact));
setGame(exact);
upgradeLoaded();
delete (gs() as { cmCarry?: unknown }).cmCarry;
delete before.cmCarry;
paths(before, JSON.parse(JSON.stringify(gs())), '', m3);
show('upgradeLoaded ændrer', m3);
// størrelsen (gzip) med og uden afrunding
{
  const { gzipSync } = await import('node:zlib');
  const r = gzipSync(JSON.stringify(gs(), round)).length, e = gzipSync(JSON.stringify(gs())).length;
  console.log(`\ngzip: rundet ${(r / 1e6).toFixed(2)} MB, uden afrunding ${(e / 1e6).toFixed(2)} MB (+${Math.round((e / r - 1) * 100)} %)`);
}
