// Kontrol: giver en kopi af spillet (v8-klon eller spillets eget gem/indlæs) midt i et forløb præcis det samme som at spille videre uden afbrydelse?
//   npx tsx scripts/snap-verify.ts <til-dato> <punkt,punkt,…> [inproc|fresh|save|save-fresh]
// Et "skridt" = ét continueGame-kald eller én quickPlayUserMatch (så et punkt også kan ligge midt i en kampdag: før ens egen kamp).
// Punkt = skridtnummer eller dato (første skridt den dag). Referencen kører fra newgame i ét stræk og udskriver fingeraftryk pr. skridt;
// ved hvert punkt gemmes en kopi. Bagefter (inproc/save): kopien sættes ind i SAMME proces (motorens modulhukommelse er "snavset" af resten
// af referencekørslen – som at indlæse et spil i samme fane) og spilles frem; fresh/save-fresh: kopien fortsættes i en ny proces (som at
// genindlæse siden). Første afvigende skridt og hvilke dele af GameState, der afviger, udskrives.
// WORLD=fil, CLUB=navn (Wrexham), SEED=n (1). Udskriver "OK <punkt>" eller "DIFF <punkt> skridt <n> …". Afslutningskode 1 ved afvigelse.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { serialize, deserialize } from 'node:v8';
import { createHash } from 'node:crypto';
import { captureCarry } from '../src/game/carry';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import type { WorldData } from '../src/game/newgame';
import { createGame } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { gs, setGame, packCarry } from '../src/game/state';
import { rng } from '../src/game/rng';
import { serializeState, deserializeState } from '../src/game/snapshot';
import { ensureAllNumbers, upgradeLoaded } from '../src/game/save';
import type { GameState } from '../src/game/types';

const args = process.argv.slice(2);
/** DUMP=<præfiks> DUMPSTEP=n: hele tilstanden efter skridt n (reference og kopi) som JSON – til scratchpad/jdiff.mjs */
const DUMP = process.env.DUMP ?? '', DUMPSTEP = DUMP ? +(process.env.DUMPSTEP ?? -1) : -1;
const childFile = process.env.SNAPV_CHILD;
const worldFile = process.env.WORLD ?? 'public/data/world-original.json';

/** RTRACE=n: talrækkens tilstande under skridt n (reference) – kopiens første afvigende træk udskrives med stakken (kun inproc) */
const RTRACE = +(process.env.RTRACE ?? -1);
let trace: { on: boolean; rec: string[] | null; ref: string[] | null; n: number; hit: string | null } = { on: false, rec: null, ref: null, n: 0, hit: null };
const site = () => { const l = Error.stackTraceLimit; Error.stackTraceLimit = 9; const st = new Error().stack!; Error.stackTraceLimit = l; return st.split('\n').slice(3, 9).map((x) => x.trim().replace(/\(.*\/src\//, '(')).join(' < '); };
{
  let st = rng.state;
  Object.defineProperty(rng, 'state', {
    get: () => st,
    set: (v: number) => {
      st = v;
      if (!trace.on) return;
      // mulberry32's tilstand går altid samme vej – det er kaldestedet (hvem der trækker), der kan afvige
      if (trace.rec) trace.rec.push(site());
      else if (trace.ref && !trace.hit) {
        const k = trace.n++, here = site();
        if (trace.ref[k] !== here) trace.hit = `træk ${k} af ${trace.ref.length}:\n  ref:   ${trace.ref[k]}\n  kopi:  ${here}\n  før:   ${trace.ref[k - 1]}`;
      }
    },
  });
}
function step(): string {
  const g = gs();
  if (g.pendingFixture) { quickPlayUserMatch(); return 'match'; }
  const r = continueGame();
  return r.match !== undefined ? 'pause' : r.stop ?? 'day';
}

interface Snap { kind: 'v8' | 'save'; buf: Buffer; at: number; date: string }
async function take(kind: Snap['kind'], at: number): Promise<Snap> {
  const g = gs();
  g.rng = rng.state;
  if (kind === 'v8') { packCarry(g); try { return { kind, buf: serialize(g), at, date: g.date }; } finally { delete g.cmCarry; } }
  const blob = await serializeState(g);
  return { kind, buf: Buffer.from(await blob.arrayBuffer()), at, date: g.date };
}
async function restore(s: Snap): Promise<void> {
  if (s.kind === 'v8') { setGame(deserialize(s.buf) as GameState); return; }   // indeksernes rækkefølge følger med i cmCarry
  // som save.ts' loadGame: setGame + upgradeLoaded (indeksernes rækkefølge gemmes ikke i spillets eget format)
  setGame(await deserializeState(new Blob([s.buf])));
  upgradeLoaded();
  ensureAllNumbers();
}

/** fingeraftryk af GameState + indeksernes rækkefølge + modulernes tilstand (carry.ts, pr. modul) */
/** gemformatet (JSON) bevarer ikke rækkefølgen af felter, der har været undefined – ved save-tilstandene sammenlignes med sorterede felter */
const canonFp = (process.argv[4] ?? '').startsWith('save') || process.env.SNAPV_CANON === '1';
process.env.SNAPV_CANON = canonFp ? '1' : '0';   // barnet (ny proces) sammenligner på samme måde
const canonRepl = (_k: string, v: unknown) => {
  if (typeof v === 'number') return !Number.isFinite(v) ? String(v) : Object.is(v, -0) ? '-0' : v;
  if (!canonFp || !v || typeof v !== 'object' || Array.isArray(v)) return v;
  const o = v as Record<string, unknown>, out: Record<string, unknown> = {};
  for (const k of Object.keys(o).sort()) out[k] = o[k];
  return out;
};
function fpAll(): { fp: string; parts: Record<string, string> } {
  const g0 = gs(); g0.rng = rng.state;
  const parts: Record<string, string> = Object.fromEntries(Object.entries({ ...g0, id: 0 }).map(([k, v]) => [k, createHash('sha1').update(JSON.stringify(v, canonRepl) ?? 'u').digest('hex').slice(0, 10)]));
  const h = (x: unknown) => createHash('sha1').update(JSON.stringify(x) ?? 'u').digest('hex').slice(0, 10);
  for (const [k, v] of Object.entries(captureCarry())) parts[`carry:${k}`] = h(v);
  return { fp: h(parts), parts };
}
function diffParts(a: Record<string, string>, b: Record<string, string>) {
  return Object.keys({ ...a, ...b }).filter((k) => a[k] !== b[k]);
}

if (childFile) {
  // ny proces: indlæs kopien og spil de angivne skridt; udskriv fingeraftryk pr. skridt som JSON
  const s = deserialize(readFileSync(childFile)) as Snap & { n: number; want: string[] };
  await restore(s);
  const out: { fp: string; parts: Record<string, string> }[] = [];
  for (let i = 0; i < s.n; i++) { step(); out.push(fpAll()); if (out[i].fp !== s.want[i]) break; }   // stop ved første afvigelse
  writeFileSync(childFile + ".out.json", JSON.stringify(out));
  process.exit(0);
}

const [until = '2001-08-15', pointsArg = '2001-07-20', mode = 'inproc'] = args;
const world = JSON.parse(readFileSync(worldFile, 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
const club = world.clubs.find((c) => c[1] === (process.env.CLUB ?? 'Wrexham'))![0];
createGame(world, { managerName: 'Lab', managerNation: eng, clubId: club, activeNations: [eng], lang: 'en', masking: true, seed: +(process.env.SEED ?? 1), mode: 'authentic' });
gs().options.engine = 'original';

const pts = pointsArg.split(',').filter(Boolean);
const kind: Snap['kind'] = mode.startsWith('save') ? 'save' : 'v8';
const snaps: Snap[] = [];
const ref: { fp: string; parts: Record<string, string>; date: string; what: string }[] = [];
const t0 = Date.now();
const want = (i: number, date: string, prevDate: string | null) => pts.some((p) => (/^\d+$/.test(p) ? +p === i : p === date && prevDate !== date));
if (want(0, gs().date, null)) snaps.push(await take(kind, 0));
let prev = gs().date;
for (let i = 1; gs().date < until || gs().pendingFixture; i++) {
  if (i === RTRACE) trace = { on: true, rec: [], ref: null, n: 0, hit: null };
  const what = step();
  if (i === RTRACE) trace = { on: false, rec: null, ref: trace.rec, n: 0, hit: null };
  ref.push({ ...fpAll(), date: gs().date, what });
  if (DUMPSTEP === i) writeFileSync(`${DUMP}.ref.json`, JSON.stringify({ ...gs(), id: 0 }, (_k, v) => (typeof v === "number" && !Number.isFinite(v) ? String(v) : Object.is(v, -0) ? "-0" : v)));
  if (want(i, gs().date, prev)) snaps.push(await take(kind, i));
  prev = gs().date;
}
console.log(`reference: ${ref.length} skridt til ${gs().date} på ${((Date.now() - t0) / 1000).toFixed(0)} s; punkter ${snaps.map((s) => `${s.at}(${s.date})`).join(' ')}`);

let bad = 0;
for (const s of snaps) {
  const n = ref.length - s.at;
  let got: { fp: string; parts: Record<string, string> }[];
  const t1 = Date.now();
  if (mode.endsWith('fresh')) {
    const dir = join(tmpdir(), 'snapv'); mkdirSync(dir, { recursive: true });
    const f = join(dir, `s${process.pid}-${s.at}.v8`);
    writeFileSync(f, serialize({ ...s, n, want: ref.slice(s.at).map((x) => x.fp) }));
    const r = spawnSync(process.execPath, [...process.execArgv, process.argv[1]], { env: { ...process.env, SNAPV_CHILD: f }, maxBuffer: 1 << 28, encoding: 'utf8' });
    if (r.status !== 0) { console.log(`FEJL i barnet: ${r.stderr.slice(-2000)}`); process.exit(2); }
    got = JSON.parse(readFileSync(f + ".out.json", "utf8"));
  } else {
    await restore(s);
    if (s.at > 0) { const d = diffParts(ref[s.at - 1].parts, fpAll().parts); if (d.length) console.log(`  indlæst ≠ reference ved punktet: ${d.join(', ')}`); }
    got = [];
    for (let i = 0; i < n; i++) {
      if (s.at + i + 1 === RTRACE) { trace.on = true; trace.n = 0; trace.hit = null; }
      step();
      if (s.at + i + 1 === RTRACE) { trace.on = false; console.log(trace.hit ?? `talrækken ens i skridt ${RTRACE} (${trace.n} træk)`); } got.push(fpAll());
      if (DUMPSTEP === s.at + i + 1) writeFileSync(`${DUMP}.${s.at}.json`, JSON.stringify({ ...gs(), id: 0 }, (_k, v) => (typeof v === "number" && !Number.isFinite(v) ? String(v) : Object.is(v, -0) ? "-0" : v)));
    }
  }
  const k = got.length < n && got.every((x, i) => x.fp === ref[s.at + i].fp) ? got.length : got.findIndex((x, i) => x.fp !== ref[s.at + i].fp);
  if (k < 0) console.log(`OK ${s.at}(${s.date}) ${n} skridt (${((Date.now() - t1) / 1000).toFixed(0)} s)`);
  else {
    bad++;
    const r = ref[s.at + k];
    console.log(`DIFF ${s.at}(${s.date}) skridt ${s.at + k + 1} (${r.date} ${r.what}): ${diffParts(r.parts, got[k].parts).join(', ')}`);
  }
}
process.exit(bad ? 1 : 0);
