// Afspiller originalens kommentarkald (match_trace.c's c/z/C-linjer, udtrukket med ~/cm0102-engine/tools/cmt_extract.py) gennem
// porten af Match_Events (src/game/engine/grid/matchEvents.ts) med originalens egne tilfældige tal og sammenligner: argumenterne til
// hvert rand-kald, de indlejrede kald (kombination/opfølger), postens id og variant og køens tilstand bagefter.
// Brug: npx tsx scripts/grid-comment-replay.ts <udtræk.json>
import { readFileSync } from 'node:fs';
import { MatchEvents, type MatchEventsEngine } from '../src/game/engine/grid/matchEvents';

interface Node { tick: number; d: number; ret: number; id: number; p1: number; s1: number; p2: number; s2: number; x: number; q: number[]; z: [number, number, number][]; k: Node[]; env: number[]; C?: number[] }
const matches: { M: string[]; calls: Node[] }[] = JSON.parse(readFileSync(process.argv[2], 'utf8'));

let skipped = 0, calls = 0, okCalls = 0, draws = 0, badDraw = 0, badEntry = 0, badState = 0, badKids = 0, used = 0;
const ex: string[] = [];
const flat = (n: Node, out: [number, number][]) => { for (const z of n.z) out.push([z[0], z[2]]); for (const k of n.k) flat(k, out); return out; };
const kidsOf = (n: Node): string => n.k.map((k) => `${k.id}(${kidsOf(k)})`).join(',');

for (const m of matches) {
  if (!m.calls.length || m.calls[0].q[0] !== 0 || m.calls[0].q[1] !== 0) continue;
  used++;
  const eng: MatchEventsEngine = { ballX: 0, ballY: 0, b8eab: 0, shootout: 0, clock: 0, periodEnd: 0, shotMinute: -1, shotSide: 0 };
  const W = { lo: 0, hi: 0, pitch: 0, gate: true };
  let feed: [number, number][] = [], fi = 0, fail = '';
  const rand = (n: number) => {
    const e = feed[fi++];
    if (!e) { fail ||= `ekstra rand(${n})`; return 0; }
    if (e[0] !== n) fail ||= `rand(${n}) ≠ originalens rand(${e[0]})`;
    return e[1];
  };
  const me = new MatchEvents(rand, eng, W);
  // de indlejrede kald porten laver
  let got: { id: number; kids: unknown[] }[] = [];
  let stack: { id: number; kids: unknown[] }[] = [];
  const orig = me.add.bind(me);
  me.add = (id, p1, s1, p2 = -1, s2 = -1, extra = 0) => {
    const node = { id: id, kids: [] as unknown[] };
    if (stack.length) stack[stack.length - 1].kids.push(node); else got.push(node);
    stack.push(node);
    orig(id, p1, s1, p2, s2, extra);
    stack.pop();
  };
  const kidStr = (n: { id: number; kids: unknown[] }): string => (n.kids as { id: number; kids: unknown[] }[]).map((k) => `${k.id}(${kidStr(k)})`).join(',');
  let checked = false;
  for (const c of m.calls) {
    // kaldene før afsparket (tick −1) er ikke altid komplette i sporet – kampen springes over, hvis køen afviger ved første tik
    if (!checked && c.tick >= 0) { checked = true; if (me.w8 !== c.q[1] || me.w6 !== c.q[0]) { skipped++; break; } }
    calls++;
    const e = c.env;
    Object.assign(eng, { ballX: e[0], ballY: e[1], b8eab: e[2], shootout: e[3], clock: e[4], periodEnd: e[5], shotMinute: e[6], shotSide: e[7] });
    me.b0 = e[12];
    Object.assign(W, { lo: e[10] & 0xff, hi: (e[10] >>> 8) & 0xff, pitch: e[9], gate: e[11] === 1 });
    feed = flat(c, []); fi = 0; fail = '';
    got = []; stack = [];
    const q8 = me.w8;
    me.add(c.id, c.p1, c.s1, c.p2, c.s2, c.x);
    draws += feed.length;
    if (fail || fi !== feed.length) { badDraw++; if (ex.length < 12) ex.push(`tik ${c.tick} ${c.id} @${c.ret.toString(16)}: ${fail || `trak ${fi} af ${feed.length}`}`); }
    const gk = got[0] ? kidStr(got[0]) : '', ok = kidsOf(c);
    if (gk !== ok) { badKids++; if (ex.length < 12) ex.push(`tik ${c.tick} ${c.id}: kald ${gk} ≠ ${ok}`); }
    const C = c.C;
    let good = !fail && fi === feed.length && gk === ok;
    if (C) {
      const ent = me.q[q8];
      if (ent.id !== C[1] || ent.variant !== C[2]) { badEntry++; good = false; if (ex.length < 0) ex.push(`tik ${c.tick} ${c.id}: post ${ent.id}/${ent.variant} ≠ ${C[1]}/${C[2]}`); }
      const st = [me.w6, me.w8, me.wa, me.we, me.b1, me.b2, me.b4, me.b5];
      const want = C.slice(3, 11);
      if (st.join() !== want.join()) { badState++; good = false; if (ex.length < 12) ex.push(`tik ${c.tick} ${c.id}: tilstand ${st} ≠ ${want}`); }
    }
    if (good) okCalls++;
  }
}
console.log(`kampe ${used} (heraf ${skipped} sprunget over: forspillet ufuldstændigt i sporet), kald ${calls}, helt ens ${okCalls} (${((100 * okCalls) / Math.max(1, calls)).toFixed(2)} %), tal ${draws}`);
console.log(`afvigelser: rand ${badDraw}, indlejrede ${badKids}, post ${badEntry}, tilstand ${badState}`);
for (const s of ex) console.log('  ' + s);
