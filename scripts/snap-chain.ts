// Bevis for src/game/carry.ts: en hel periode spillet i stykker, hvert stykke i en NY proces (som spillets Web Workers: nyt spil i én, dagene i
// en anden – frisk modulhukommelse hver gang), med spillet sendt videre som v8-kopi (cmCarry med) eller spillets eget gemformat. Udskriver de
// samme linjer som scripts/perf-fingerprint.ts (ugens hash + "samlet") – ens = stykvis spil er bit for bit det uafbrudte spil.
//   npx tsx scripts/snap-chain.ts [slutdato = 2002-05-20] [dage pr. stykke = 14] [v8|save]   (frø 1, Wrexham, den originale database)
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { serialize, deserialize } from 'node:v8';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, packCarry, setGame } from '../src/game/state';
import { rng } from '../src/game/rng';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { serializeState, deserializeState } from '../src/game/snapshot';
import { ensureAllNumbers, upgradeLoaded } from '../src/game/save';
import { addDays } from '../src/game/dates';
import type { GameState } from '../src/game/types';

const child = process.env.SNAPCHAIN_CHILD;
type Hand = { file: string | null; stale: number; until: string; days: number; kind: 'v8' | 'save'; lastWeek: string; out: string };

// som scripts/perf-fingerprint.ts
// CANON=1: felterne i hvert objekt sorteret (spillets JSON-gem bevarer ikke rækkefølgen af felter, der har været sat til undefined, fx
// p.cmContract = undefined ved et klubskifte – kun rækkefølgen, ikke værdierne)
const CANON = process.env.CANON === '1';
const sortKeys = (v: unknown): unknown => {
  if (!CANON || !v || typeof v !== 'object' || Array.isArray(v) || v instanceof Map || v instanceof Set) return v;
  const o = v as Record<string, unknown>, out: Record<string, unknown> = {};
  for (const k of Object.keys(o).sort()) out[k] = v === gs() && k === 'id' ? 0 : o[k];   // (id: som rep)
  return out;
};
const rep = function (this: unknown, k: string, v: unknown) { return this === gs() && k === 'id' ? 0 : v instanceof Map ? { __map: [...v] } : v instanceof Set ? { __set: [...v] } : sortKeys(v); };
const hash = () => createHash('sha256').update(`${rng.state}\n`).update(JSON.stringify(gs(), rep)).digest('hex').slice(0, 16);

if (child) {
  const h = JSON.parse(readFileSync(child, 'utf8')) as Hand;
  const lines: string[] = [];
  if (!h.file) {
    const world = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world-original.json', 'utf8')) as WorldData;
    const eng = world.nations.findIndex((x) => x.name === 'England');
    createGame(world, { managerName: 'Lab', managerNation: eng, clubId: world.clubs.find((c) => c[1] === 'Wrexham')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
    gs().options.engine = 'original';
    lines.push(`start ${gs().date} ${hash()}`);
  } else if (h.kind === 'v8') setGame(deserialize(readFileSync(h.file)) as GameState);
  else { setGame(await deserializeState(new Blob([readFileSync(h.file)]))); upgradeLoaded(); ensureAllNumbers(); }
  // g.rng = talrækken ved seneste notify (perf-fingerprint's hash tager feltet med): kopien havde den rigtige, så den gamle værdi tilbage
  if (h.file) gs().rng = h.stale;
  let lastWeek = h.lastWeek;
  const to = addDays(gs().date, h.days), until = to < h.until ? to : h.until;
  while (gs().date < until) {
    const r = continueGame(); if (r.match !== undefined) quickPlayUserMatch();
    const d = gs().date, wk = d.slice(0, 8) + String(Math.floor(+d.slice(8, 10) / 7));
    if (wk !== lastWeek) { lastWeek = wk; lines.push(`${d} ${hash()}`); }
  }
  const g = gs();
  const stale = g.rng;
  g.rng = rng.state;
  if (h.kind === 'v8') { packCarry(g); writeFileSync(h.out, serialize(g)); delete g.cmCarry; }
  else writeFileSync(h.out, Buffer.from(await (await serializeState(g)).arrayBuffer()));
  g.rng = stale;
  writeFileSync(child + '.res', JSON.stringify({ lines, lastWeek, date: g.date, end: hash(), stale }));
  process.exit(0);
}

const until = process.argv[2] ?? '2002-05-20', step = +(process.argv[3] ?? 14), kind = (process.argv[4] ?? 'v8') as Hand['kind'];
const dir = join(tmpdir(), `snapchain-${process.pid}`);
mkdirSync(dir, { recursive: true });
const all = createHash('sha256');
let file: string | null = null, stale = 0, lastWeek = '', date = '', i = 0, end = '';
const t0 = Date.now();
while (!date || date < until) {
  const hand: Hand = { file, stale, until, days: step, kind, lastWeek, out: join(dir, `s${i}.bin`) };
  const hf = join(dir, `h${i}.json`);
  writeFileSync(hf, JSON.stringify(hand));
  const r = spawnSync(process.execPath, [...process.execArgv, process.argv[1]], { env: { ...process.env, SNAPCHAIN_CHILD: hf }, stdio: ['ignore', 'ignore', 'inherit'] });
  if (r.status !== 0) { console.error(`stykke ${i} fejlede`); process.exit(2); }
  const res = JSON.parse(readFileSync(hf + '.res', 'utf8')) as { lines: string[]; lastWeek: string; date: string; end: string; stale: number };
  stale = res.stale;
  for (const l of res.lines) { console.log(l); all.update(l.split(' ').pop()!); }
  end = res.end;
  if (file) rmSync(file);
  file = hand.out; lastWeek = res.lastWeek; date = res.date; i++;
}
console.log(`slut ${date} ${end}`);
all.update(end);
console.log(`samlet ${all.digest('hex').slice(0, 16)}`);
console.error(`${i} stykker (${kind}) på ${Math.round((Date.now() - t0) / 1000)} s`);
rmSync(dir, { recursive: true, force: true });
