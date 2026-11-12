// Kampværdierne sub_6ec010 (src/game/engine/grid/matchValues.ts) mod originalen: MV/MVr/MVO-linjerne i kampsporet fra den instrumenterede
// original (~/cm0102-engine/tools/match_trace.c, RECOMP_MATCH_TRACE_RAND=1). Hvert kald (kampstart = tik −1 og midt i kampen) regnes med
// inputtene fra MV-linjen og originalens tilfældige tal fra MVr-linjerne; kamp-CA'en +0x3b og alle 34 floats skal være bit for bit ens
// (sammenlignet med MATCH_PLAYER-hex'en efter kaldet).
//   npx tsx scripts/mv-check.ts <spor> [vis = 8]
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { matchValues6ec010, MV_FLOATS, type MatchValuesEnv, type MatchValuesPlayer } from '../src/game/engine/grid/matchValues';

const hex = (s: string) => Uint8Array.from(s.match(/../g)!.map((x) => parseInt(x, 16)));
const s8 = (b: Uint8Array, o: number) => (b[o] << 24) >> 24;
const s16 = (b: Uint8Array, o: number) => (((b[o] | (b[o + 1] << 8)) << 16) >> 16);
const f32 = (b: Uint8Array, o: number) => new DataView(b.buffer, b.byteOffset).getFloat32(o, true);
const u32 = (b: Uint8Array, o: number) => new DataView(b.buffer, b.byteOffset).getUint32(o, true);

export interface MvCase { line: number; head: string; kv: Record<string, string>; rand: [number, number, number][]; out: Uint8Array; outCA: number }

/** MV … / MVr … / MVO … i rækkefølge (andre linjer springes over) */
export function parseMv(text: string): MvCase[] {
  const res: MvCase[] = [];
  let cur: MvCase | null = null;
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l.startsWith('MV ')) {
      const t = l.split(' '), kv: Record<string, string> = {};
      for (const x of t.slice(5)) { const j = x.indexOf('='); kv[x.slice(0, j)] = x.slice(j + 1); }
      cur = { line: i + 1, head: t.slice(0, 5).join(' '), kv, rand: [], out: new Uint8Array(0), outCA: 0 };
    } else if (l.startsWith('MVr ') && cur) {
      const t = l.split(' ');                                          // MVr <n> <retur> = <resultat>
      cur.rand.push([+t[1], parseInt(t[2], 16), +t[4]]);
    } else if (l.startsWith('MVO ') && cur) {
      const t = l.split(' ');
      cur.outCA = +t[4];
      cur.out = hex(t.find((x) => x.startsWith('mp='))!.slice(3));
      res.push(cur); cur = null;
    }
  }
  return res;
}

/** MV-linjen → spilleren og omgivelserne (MatchValuesEnv) */
export function caseInput(c: MvCase): { q: MatchValuesPlayer; env: MatchValuesEnv } {
  const kv = c.kv, rec = hex(kv.rec), st = hex(kv.st), mp = hex(kv.mp);
  const nums = (s: string) => s.split(',').map(Number);
  const f: Record<string, number> = {};
  MV_FLOATS.forEach((k, i) => { f[k] = f32(mp, 0x71 + 4 * i); });
  const q: MatchValuesPlayer = {
    side: s8(mp, 0x27), pos: +kv.pos, posAttack: +kv.posA, morale: s8(mp, 0x17), w31: s16(mp, 0x31), w33: s16(mp, 0x33),
    motivation: s8(mp, 0x100), formRoll: s8(mp, 0x118), badDay: s8(mp, 0x119), matchCA: s16(mp, 0x3b), f,
    rec: (o) => s8(rec, o), recW: (o) => s16(rec, o), staff: (o) => s8(st, o),
  };
  const cap = kv.cok === '1' ? {
    influence: +kv.cinf, pos: +kv.cpos, ca: +kv.cca, r39: +kv.c39, r44: +kv.c44, s18: +kv.cs18, s59: +kv.cs59, s5b: +kv.cs5b, days: +kv.cdays,
  } : null;
  const ct = kv.ct === '-' ? null : nums(kv.ct);
  const mg = kv.mgr === '-' ? null : nums(kv.mgr);
  const rl = kv.rel === '-' ? '0000000000' : kv.rel, b = (k: number) => rl[k] === '1';
  const p2 = kv.p2 === '-' ? null : nums(kv.p2);
  const keys = nums(kv.keys), tw = [nums(kv.tw0), nums(kv.tw1)];
  const env: MatchValuesEnv = {
    engByte0: +kv.e0, engByte1: +kv.e1, crowd: +kv.crowd, cohesion: +kv.coh, fx40: +kv.fx40, fx3a: +kv.fx3a,
    comp: kv.comp === '-' ? null : { rep: +kv.comp, mls: kv.mls === '1' }, homeLeagueIsComp: kv.hlc === '1', ownClubRep: +kv.crep,
    captain: cap, natOwn: kv.natOwn === '1', natF9: kv.natF9 === '1',
    contract: ct ? { b44: ct[0], flags: ct[1], d0c: ct[2], d10: ct[3], d14: ct[4] } : null,
    contractMod: +kv.cmod, inDb: kv.indb === '1', staffState: kv.s0a === undefined ? 0 : +kv.s0a, human: kv.human === '1',
    manager: mg ? { n0e: mg[0], rating: mg[1] } : null,
    rel: { dislikesOpp: b(0), favoursOpp: b(1), oppMgrDislikes: b(2), oppMgrFavours: b(3), favoursOwn: b(4), dislikesOwn: b(5),
      ownMgrDislikes: b(6), ownMgrFavours: b(7), capDislikes: b(8), capFavours: b(9) },
    player61: p2 ? { b44: p2[1], w0b: p2[2], w0d: p2[3] } : null,
    nation: kv.nat === '-' ? null : +kv.nat, keys: { us: keys[0], can: keys[1], mex: keys[2] },
    tactics: [{ prim: tw[0].slice(0, 11), sec: tw[0].slice(11) }, { prim: tw[1].slice(0, 11), sec: tw[1].slice(11) }],
  };
  return { q, env };
}

const bits = (v: number) => { const d = new DataView(new ArrayBuffer(4)); d.setFloat32(0, v, true); return d.getUint32(0, true); };

/** regner ét kald og giver afvigelserne ('' = ens) */
export function runCase(c: MvCase): string {
  const { q, env } = caseInput(c);
  let k = 0, bad = '';
  const RET = [0x6ee2ed, 0x6ee5a3, 0x6ee6b4], N = [0x32, 0x14, 0x19];
  const rand = (n: number) => {
    const x = c.rand[k++];
    if (!x) { bad ||= `rand(${n}) uden spor`; return 0; }
    if (x[0] !== n && !bad) bad = `rand #${k} n ${n}≠${x[0]}`;
    if (!bad && N.indexOf(n) !== RET.indexOf(x[1])) bad = `rand #${k} retur ${x[1].toString(16)}`;
    return x[2];
  };
  matchValues6ec010(q, env, rand);
  const df: string[] = [];
  if (bad) df.push(bad);
  if (k !== c.rand.length) df.push(`rand ${k}/${c.rand.length}`);
  if (q.matchCA !== s16(c.out, 0x3b) || q.matchCA !== c.outCA) df.push(`CA ${q.matchCA}≠${s16(c.out, 0x3b)}`);
  MV_FLOATS.forEach((n, i) => {
    const want = u32(c.out, 0x71 + 4 * i), got = bits(q.f[n]);
    if (want !== got) df.push(`${n} ${q.f[n]}≠${f32(c.out, 0x71 + 4 * i)}`);
  });
  return df.join(' ');
}

export function checkMv(text: string, show = 8, log: (s: string) => void = console.log) {
  const cases = parseMv(text);
  let ok = 0, shown = 0, pre = 0, rands = 0;
  for (const c of cases) {
    const d = runCase(c);
    if (c.head.split(' ')[1] === '-1') pre++;
    rands += c.rand.length;
    if (!d) ok++;
    else if (shown < show) { shown++; log(`linje ${c.line} ${c.head}: ${d}`); }
  }
  return { n: cases.length, ok, pre, rands, withRand: cases.filter((c) => c.rand.length).length };
}

if (process.argv[1]?.endsWith('mv-check.ts')) {
  const [file, showArg = '8'] = process.argv.slice(2);
  const raw = readFileSync(file);
  const text = (file.endsWith('.gz') ? gunzipSync(raw) : raw).toString('utf8');
  const r = checkMv(text, +showArg);
  console.log(`sub_6ec010: ${r.ok}/${r.n} kald bit for bit ens (${r.pre} ved kampstart, ${r.n - r.pre} midt i kampen; ${r.withRand} med rand, ${r.rands} rand-kald)`);
}
