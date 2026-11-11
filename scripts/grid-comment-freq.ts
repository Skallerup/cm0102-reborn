// Kommentarkøens kald (sub_6d6f70 add_event) pr. kamp: porten mod originalen. Tæller argumentets begivenheds-id ved hvert kald på øverste
// niveau (som match_trace.c's c-linjer med dybde 0; kombinationens/opfølgerens indlejrede kald tælles ikke) og trukne tilfældige tal i køen.
// Kør: npx tsx scripts/grid-comment-freq.ts [kampe=40] [frø=1] [originalens udtræk.json] [top=30]
//   udtrækket laves af ~/cm0102-engine/tools/cmt_extract.py <spor.txt> <ud.json> (spor fra match_trace.c med RECOMP_MATCH_TRACE_COMP=7).
//   SEQ=<kamp>: originalens kamp nr. <kamp> (samme hjemme-/udehold, M-linjen) spilles også i porten, og id-rækkefølgen pr. tik sammenlignes:
//   hvor mange tik i træk (fra afsparket) har nøjagtig samme kald, og hvor stor en del af alle tik med kald er ens (de skilles, så snart
//   kampens tilstand er en anden). Rækkefølgerne skrives til grid-comment-seq-{port,orig}.txt i arbejdsmappen.
import { readFileSync, writeFileSync } from 'node:fs';
import { createGame, type WorldData } from '../src/game/newgame';
import { gs, squad } from '../src/game/state';
import { Rng } from '../src/game/rng';
import { aiTactic } from '../src/game/sim';
import { GRID_UNKNOWN, createGridMatch, randOf } from '../src/game/engine/grid/gridMatch';
import { EVENT_NAMES } from '../src/game/engine/grid/eventTable';
import type { Player } from '../src/game/types';

const N = Number(process.argv[2] ?? 40), seed = Number(process.argv[3] ?? 1), origFile = process.argv[4], top = Number(process.argv[5] ?? 30);
if (process.env.GRID_JSON) Object.assign(GRID_UNKNOWN, JSON.parse(process.env.GRID_JSON));
const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8')) as WorldData;
const eng = world.nations.findIndex((x) => x.name === 'England');
createGame(world, { managerName: 'Lab', managerNation: eng, clubId: world.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 3, mode: 'authentic' });
const g = gs();
const epl = Object.values(g.comps).find((c) => c.type === 'league' && c.tier === 1 && world.nations[c.nation]?.name === 'England')!;
const fresh = (id: number) => squad(id).map((p) => ({ ...p, attrs: p.attrs.slice(), condition: 100, injury: null, banned: 0 }) as Player);
const fixtures: [number, number][] = [];
for (const h of epl.clubs) for (const a of epl.clubs) if (h !== a) fixtures.push([h, a]);
const rng = new Rng(seed);
const rand = randOf(() => rng.next());
const name = (id: number) => EVENT_NAMES[id - 8000] ?? String(id);
const seqAt = process.env.SEQ !== undefined ? Number(process.env.SEQ) : -1;

const portSeq = new Map<number, number[]>();                                             // SEQ: tik → id'er
const seqOrig = (() => {
  if (seqAt < 0 || !origFile) return null;
  const ms = JSON.parse(readFileSync(origFile, 'utf8')) as { M: string[]; calls: { tick: number; id: number }[] }[];
  const m = ms[seqAt]; if (!m) return null;
  // M-linjens klubber er spillets kørselstids-id'er: sorteret svarer de til databasens id'er (oracle/tools/extract.py) – og dermed til vores
  const rt = [...new Set(ms.flatMap((x) => [Number(x.M[0]), Number(x.M[1])]))].sort((x, y) => x - y), db = [...epl.clubs].sort((x, y) => x - y);
  if (rt.length !== db.length) throw new Error(`${rt.length} klubber i sporet, ${db.length} i ligaen`);
  return { ...m, home: db[rt.indexOf(Number(m.M[0]))], away: db[rt.indexOf(Number(m.M[1]))] };
})();
const port = new Map<number, number>();
let portCalls = 0, portDraws = 0;
const seqPort: string[] = [];
for (let i = 0; i < N; i++) {
  const [h, a] = i === seqAt && seqOrig ? [seqOrig.home, seqOrig.away] : fixtures[i % fixtures.length];
  let tk = 0;
  const mgr = (c: number) => { const st = g.staff[g.clubs[c]?.manager ?? -1]; return st?.tac ? { id: st.id, ca: st.rep * 2, tac: st.tac } : null; };
  const gm = createGridMatch({ players: fresh(h), tactic: aiTactic(h, a, true) }, { players: fresh(a), tactic: aiTactic(a, h, false) }, rand,
    { rep: [g.clubs[h].rep * 100, g.clubs[a].rep * 100], managers: [mgr(h), mgr(a)] });
  gm.events.onCall = (id, _p1, _s1, _p2, _s2, _x, depth) => {
    if (depth !== 0) return;
    portCalls++; port.set(id, (port.get(id) ?? 0) + 1);
    if (i === seqAt) { seqPort.push(`${tk} ${id} ${name(id)}`); const l = portSeq.get(tk) ?? []; l.push(id); portSeq.set(tk, l); }
  };
  while (gm.tick()) { tk++; }
  portDraws += gm.events.draws;
}

const orig = new Map<number, number>();
let origN = 0, origCalls = 0, origDraws = 0;
if (origFile) {
  type Node = { tick: number; id: number; z: unknown[]; k: Node[] };
  const ms: { M: string[]; calls: Node[] }[] = JSON.parse(readFileSync(origFile, 'utf8'));
  const draws = (n: Node): number => n.z.length + n.k.reduce((s, k) => s + draws(k), 0);
  ms.forEach((m, mi) => {
    origN++;
    for (const c of m.calls) {
      origCalls++; origDraws += draws(c); orig.set(c.id, (orig.get(c.id) ?? 0) + 1);
    }
    if (mi === seqAt) writeFileSync('grid-comment-seq-orig.txt', m.calls.map((c) => `${c.tick} ${c.id} ${name(c.id)}`).join('\n') + '\n');
  });
}
if (seqAt >= 0) writeFileSync('grid-comment-seq-port.txt', seqPort.join('\n') + '\n');
if (seqOrig) {
  // originalens tik: −1 (før afsparket) og derefter T-linjernes tæller; grupperne sammenlignes i rækkefølge (tik med kald)
  const og = new Map<number, number[]>();
  for (const c of seqOrig.calls) { const l = og.get(c.tick) ?? []; l.push(c.id); og.set(c.tick, l); }
  const A = [...og.entries()].sort((x, y) => x[0] - y[0]).map((e) => e[1].join(',')), B = [...portSeq.entries()].sort((x, y) => x[0] - y[0]).map((e) => e[1].join(','));
  let lead = 0; while (lead < A.length && lead < B.length && A[lead] === B[lead]) lead++;
  const same = A.filter((g, k) => B[k] === g).length;
  const fa = A.join(',').split(','), fb = B.join(',').split(',');
  let flat = 0; while (flat < fa.length && fa[flat] === fb[flat]) flat++;
  console.log(`SEQ kamp ${seqAt} (${g.clubs[seqOrig.home].name}–${g.clubs[seqOrig.away].name}): ${A.length} tik med kald i originalen, ${B.length} i porten; de første ${lead} ens i træk` +
    ` (originalens: ${A.slice(0, Math.min(lead + 2, 8)).join(' | ')}; porten: ${B.slice(0, Math.min(lead + 2, 8)).join(' | ')}); ens på samme plads ${same}; uden tik-grænser er de første ${flat} kald ens (originalen ${fa.slice(flat, flat + 3).join(',')}…, porten ${fb.slice(flat, flat + 3).join(',')}…)`);
}

const f1 = (x: number) => x.toFixed(1).padStart(7);
console.log(`porten: ${N} kampe, ${(portCalls / N).toFixed(0)} kald og ${(portDraws / N).toFixed(0)} tilfældige tal i køen pr. kamp` +
  (origN ? ` · originalen: ${origN} kampe, ${(origCalls / origN).toFixed(0)} kald og ${(origDraws / origN).toFixed(0)} tal pr. kamp` : ''));
const ids = [...new Set([...port.keys(), ...orig.keys()])].sort((a, b) => (orig.get(b) ?? 0) / Math.max(1, origN) + (port.get(b) ?? 0) / N - (orig.get(a) ?? 0) / Math.max(1, origN) - (port.get(a) ?? 0) / N);
console.log(`${'begivenhed'.padEnd(44)}   porten  original`);
for (const id of (origN ? [...orig.keys()].sort((a, b) => orig.get(b)! - orig.get(a)!) : ids).slice(0, top))
  console.log(`${(id + ' ' + name(id)).padEnd(44)}${f1((port.get(id) ?? 0) / N)}${origN ? f1((orig.get(id) ?? 0) / origN) : ''}`);
if (origN) {
  const missing = [...orig.keys()].filter((id) => !port.has(id)).sort((a, b) => orig.get(b)! - orig.get(a)!);
  const extra = [...port.keys()].filter((id) => !orig.has(id)).sort((a, b) => port.get(b)! - port.get(a)!);
  console.log(`\naldrig i porten (originalen pr. kamp): ${missing.slice(0, 40).map((id) => `${name(id)} ${((orig.get(id) ?? 0) / origN).toFixed(2)}`).join(', ')}`);
  console.log(`kun i porten (pr. kamp): ${extra.slice(0, 20).map((id) => `${name(id)} ${((port.get(id) ?? 0) / N).toFixed(2)}`).join(', ')}`);
}
