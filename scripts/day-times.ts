// Tid pr. spilledag over flere sæsoner (ægte tilstand, den originale database, gittermotoren): ms/dag pr. måned (dage med og uden
// menneskets kamp), og ved hver sæsonstart gem-tid (serializeState = autogemmet), arbejderens rundtur (struktureret kopi frem og tilbage
// + setGame/indekser, som ui/dayRunner.ts), heap og JSON-størrelse pr. felt i GameState (hvad vokser?).
//   node --expose-gc --import tsx scripts/day-times.ts [world=public/data/world-original.json] [sæsoner=5] [klub=Manchester United] [frø=1]
//   PROF=1: CPU-profil af oktober i hver sæson (top 25 funktioner, egen tid) · SAVES=<mappe>: gemmet ved hver sæsonstart (til browsermålingen)
//   LOAD=<gem-fil> + UNTIL=<dato>: start fra et gemt spil (save.ts-format) og spil til datoen (før/efter-målinger på et sent spil)
import { readWorld } from './lib/world';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { serialize as v8s, deserialize as v8d } from 'node:v8';
import { createGame } from '../src/game/newgame';
import { gs, setGame, indexSnapshot, restoreIndexes, packCarry } from '../src/game/state';
import { rng } from '../src/game/rng';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { serializeState, deserializeState } from '../src/game/snapshot';
import { upgradeLoaded, ensureAllNumbers } from '../src/game/save';

const [file = 'public/data/world-original.json', seasonsS = '5', clubName = 'Manchester United', seedS = '1'] = process.argv.slice(2);
const seasons = Number(seasonsS), seed = Number(seedS);
const gc = (globalThis as { gc?: () => void }).gc ?? (() => {});
const PROF = process.env.PROF === '1', SAVES = process.env.SAVES;
if (SAVES) mkdirSync(SAVES, { recursive: true });

const t0 = performance.now();
if (process.env.LOAD) {
  setGame(await deserializeState(new Blob([readFileSync(process.env.LOAD)]))); upgradeLoaded(); ensureAllNumbers();
} else {
  const world = readWorld(file);
  const eng = world.nations.findIndex((x) => x.name === 'England');
  createGame(world, { managerName: 'Perf Tester', managerNation: eng, clubId: world.clubs.find((c) => c[1] === clubName)![0], activeNations: [eng], lang: 'en', masking: true, seed, mode: 'authentic' });
  gs().options.engine = 'original';
}
console.log(`start ${gs().date} (${((performance.now() - t0) / 1000).toFixed(1)} s)`);

const jsonLen = (v: unknown) => { try { return JSON.stringify(v)?.length ?? 0; } catch { return -1; } };
const mb = (n: number) => (n / 1e6).toFixed(1);

async function seasonReport(label: string) {
  const g = gs();
  gc();
  const heap = process.memoryUsage().heapUsed;
  // autogemmet
  const s0 = performance.now();
  const blob = await serializeState(g);
  const saveMs = performance.now() - s0;
  if (SAVES) writeFileSync(`${SAVES}/${label}-${g.date}.sav`, Buffer.from(await blob.arrayBuffer()));
  // arbejderens rundtur: kopi frem (postMessage), setGame/restoreIndexes i arbejderen, kopi tilbage, setGame/restoreIndexes i hovedtråden
  const w0 = performance.now();
  g.rng = rng.state; packCarry(g);
  const buf = v8s(g); delete g.cmCarry;
  const w1 = performance.now();
  const idx = indexSnapshot();
  const copy = v8d(buf) as typeof g;
  const w2 = performance.now();
  const carry = (copy as unknown as { cmCarry?: Record<string, unknown> }).cmCarry;
  const carryTop = carry ? Object.entries(carry).map(([k, v]) => [k, v8s(v).length] as const).sort((a, b) => b[1] - a[1]).slice(0, 10) : [];
  const w2b = performance.now();
  setGame(copy); restoreIndexes(idx);
  const w3 = performance.now() - (w2b - w2);
  // felterne i GameState
  const sizes = Object.keys(g).map((k) => [k, jsonLen((g as unknown as Record<string, unknown>)[k])] as const).sort((a, b) => b[1] - a[1]);
  const ps = Object.values(gs().players) as unknown as Record<string, unknown>[];
  const pf: Record<string, number> = {};
  for (const p of ps) for (const k of Object.keys(p)) pf[k] = (pf[k] ?? 0) + jsonLen(p[k]);
  const pTop = Object.entries(pf).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const cs = Object.values(gs().clubs) as unknown as Record<string, unknown>[];
  const cf: Record<string, number> = {};
  for (const c of cs) for (const k of Object.keys(c)) cf[k] = (cf[k] ?? 0) + jsonLen(c[k]);
  const cTop = Object.entries(cf).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const len = (k: string) => { const v = (gs() as unknown as Record<string, unknown>)[k]; return Array.isArray(v) ? v.length : v && typeof v === 'object' ? Object.keys(v).length : '-'; };
  console.log(`\n## ${label} ${g.date} · heap ${mb(heap)} MB · gem ${saveMs.toFixed(0)} ms ${mb(blob.size)} MB gz · rundtur v8 ${mb(buf.length)} MB: ser ${(w1 - w0).toFixed(0)} + deser ${(w2 - w1).toFixed(0)} + setGame ${(w3 - w2).toFixed(0)} ms`);
  console.log(`antal: spillere ${len('players')} klubber ${len('clubs')} fixtures ${len('fixtures')} news ${len('news')} offers ${len('offers')} transfers ${len('transfers')}`);
  console.log('GameState (JSON MB): ' + sizes.slice(0, 22).map(([k, n]) => `${k} ${mb(n)}`).join(' · '));
  console.log('Player-felter (MB): ' + pTop.map(([k, n]) => `${k} ${mb(n)}`).join(' · '));
  console.log('Club-felter (MB): ' + cTop.map(([k, n]) => `${k} ${mb(n)}`).join(' · '));
  if (carryTop.length) console.log('carry (v8 MB): ' + carryTop.map(([k, n]) => `${k} ${mb(n)}`).join(' · '));
}

let session: import('node:inspector/promises').Session | null = null;
async function profStart() {
  const { Session } = await import('node:inspector/promises');
  session = new Session(); session.connect();
  await session.post('Debugger.enable'); await session.post('Profiler.enable'); await session.post('Profiler.setSamplingInterval', { interval: 500 }); await session.post('Profiler.start');
}
async function profStop(label: string) {
  if (!session) return;
  const { profile } = await session.post('Profiler.stop') as { profile: { nodes: { id: number; callFrame: { functionName: string; url: string; lineNumber: number; columnNumber: number }; hitCount?: number; children?: number[] }[]; timeDeltas: number[]; samples: number[] } };
  // funktionernes plads i kildefilen (tsx' kode er én linje pr. modul: kildekortet i scriptet)
  const { SourceMapConsumer } = await import('source-map-js');
  const maps = new Map<string, InstanceType<typeof SourceMapConsumer> | null>();
  const where = async (cf: { scriptId?: string; url: string; lineNumber: number; columnNumber: number }) => {
    if (!cf.scriptId || !cf.url.includes('/src/')) return `${cf.url.split('/').slice(-2).join('/')}`;
    if (!maps.has(cf.scriptId)) {
      let m: InstanceType<typeof SourceMapConsumer> | null = null;
      try { const { scriptSource } = await session!.post('Debugger.getScriptSource', { scriptId: cf.scriptId }) as { scriptSource: string }; const b = scriptSource.match(/sourceMappingURL=data:application\/json;base64,([A-Za-z0-9+/=]+)/); if (b) m = new SourceMapConsumer(JSON.parse(Buffer.from(b[1], 'base64').toString())); } catch { m = null; }
      maps.set(cf.scriptId, m);
    }
    const m = maps.get(cf.scriptId);
    const o = m?.originalPositionFor({ line: cf.lineNumber + 1, column: cf.columnNumber });
    return `${cf.url.split('/src/')[1]}:${o?.line ?? '?'}`;
  };
  const keyOf = new Map<number, string>();
  for (const n of profile.nodes) keyOf.set(n.id, `${n.callFrame.functionName || '(anon)'} ${await where(n.callFrame as never)}`);
  session.disconnect(); session = null;
  const total = profile.timeDeltas.reduce((a, b) => a + b, 0) / 1000;
  const hits = profile.nodes.reduce((a, n) => a + (n.hitCount ?? 0), 0);
  const self = new Map<string, number>();
  for (const n of profile.nodes) { const k = keyOf.get(n.id)!; self.set(k, (self.get(k) ?? 0) + (n.hitCount ?? 0)); }
  // samlet tid (med kaldte funktioner) pr. funktion: hver prøve tæller én gang pr. funktion i stakken
  const parent = new Map<number, number>();
  for (const n of profile.nodes) for (const c of n.children ?? []) parent.set(c, n.id);
  const incl = new Map<string, number>();
  for (const sId of profile.samples) { const seen = new Set<string>(); for (let id: number | undefined = sId; id !== undefined; id = parent.get(id)) { const k = keyOf.get(id)!; if (!seen.has(k)) { seen.add(k); incl.set(k, (incl.get(k) ?? 0) + 1); } } }
  const ns = profile.samples.length;
  console.log(`samlet tid ${label}: ` + [...incl].filter(([k]) => k.includes('.ts')).sort((a, b) => b[1] - a[1]).slice(0, Number(process.env.INCL ?? 40)).map(([k, h]) => `\n  ${(h / ns * total / 1000).toFixed(2)} s ${k}`).join(''));
  // PARENT=navn: hvem kalder funktionen (egen tid fordelt på kaldernes kæde, 4 led)
  if (process.env.PARENT) {
    const par = new Map<number, number>(), byId = new Map(profile.nodes.map((n) => [n.id, n]));
    for (const n of profile.nodes) for (const c of n.children ?? []) par.set(c, n.id);
    const chains = new Map<string, number>();
    for (const n of profile.nodes) if (n.callFrame.functionName === process.env.PARENT && n.hitCount) {
      const ch: string[] = []; let id = par.get(n.id);
      while (id !== undefined && ch.length < 6) { const f = byId.get(id)!.callFrame; ch.push(`${f.functionName || '?'}@${f.url.split('/').pop()}:${f.columnNumber}`); id = par.get(id); }
      const k = ch.join(' < '); chains.set(k, (chains.get(k) ?? 0) + n.hitCount);
    }
    console.log(`kaldere af ${process.env.PARENT}: ` + [...chains].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, h]) => `\n  ${(h / hits * total / 1000).toFixed(2)} s ${k}`).join(''));
  }
  console.log(`prof ${label} (${(total / 1000).toFixed(1)} s): ` + [...self].sort((a, b) => b[1] - a[1]).slice(0, 25).map(([k, h]) => `\n  ${(h / hits * total / 1000).toFixed(2)} s ${k}`).join(''));
}

const startSeason = gs().season;
const end = process.env.UNTIL ?? null;
let season = 0, month = '', lastSeason = gs().season;
type B = { n: number; ms: number; mn: number; mms: number; max: number; maxD: string };
let bucket: B | null = null;
const flush = () => { if (bucket && month) console.log(`${month}  dage ${String(bucket.n).padStart(2)} ${(bucket.ms / Math.max(1, bucket.n)).toFixed(0).padStart(5)} ms/dag · kampdage ${bucket.mn} ${(bucket.mms / Math.max(1, bucket.mn)).toFixed(0).padStart(5)} ms · max ${bucket.max.toFixed(0)} (${bucket.maxD})`); };
await seasonReport(`S${season + 1}`);
const T = performance.now();
while (end ? gs().date < end : gs().season < startSeason + seasons) {
  const g = gs();
  const d = g.date;
  if (d.slice(0, 7) !== month) {
    flush();
    if (PROF && session) await profStop(month);
    month = d.slice(0, 7); bucket = { n: 0, ms: 0, mn: 0, mms: 0, max: 0, maxD: '' };
    if (PROF && month.endsWith(process.env.PROF_MONTH ?? '-10')) await profStart();
  }
  const a = performance.now();
  const r = continueGame();
  let human = false;
  if (r.match !== undefined) { quickPlayUserMatch(); human = true; }
  const ms = performance.now() - a;
  const b = bucket!;
  if (human) { b.mn++; b.mms += ms; } else { b.n++; b.ms += ms; }
  if (ms > b.max) { b.max = ms; b.maxD = d; }
  if (gs().season !== lastSeason) { lastSeason = gs().season; season++; flush(); month = ''; if (season < seasons) await seasonReport(`S${season + 1}`); }
}
flush();
if (session) await profStop(month);
await seasonReport('slut');
console.log(`\nialt ${((performance.now() - T) / 1000).toFixed(0)} s`);
