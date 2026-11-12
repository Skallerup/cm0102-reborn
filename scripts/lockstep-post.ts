// Låsetrin efter slutfløjt: kamprapporten 0x6d1cc0 (0x6d26b0 pr. spiller, 0x7172d0, 0x6d3610, 0x6d3de0) og dommerkarakteren 0x6d4a20
// (src/game/engine/grid/postMatch.ts) mod oraklets PM-linjer (runde 9c – en egen binær med RECOMP_MATCH_TRACE_WATCH=-9,0,0,1, se
// ENGINE_PORT_PLAN.md) – tal for tal: hvert rand-kald (n og rækkefølge) og alle resultater (moral, omdømme +0x47/+0x49/+0x4b, managerens
// +0/+2/+4, klubbens engine+0x1d6, begivenhederne til [0xb67dc8], dommerens post).
//
//   npx tsx scripts/lockstep-post.ts <post-fil> [kamp|all]                         – rapporten af oraklets egne inddata (PMA/PMC/PMT0/PMG)
//   npx tsx scripts/lockstep-post.ts <post-fil> <kamp> <spor> [kampnr. i sporet]    – HELE kampen i låsetrin (lockstep.ts), så rapporten af
//                                                                                     portens slutfløjt (GP → PmPlayer, adapterens kobling)
// <post-fil> = tests/fixtures/post-ls20.txt.gz / post-pen1.txt.gz (~/cm0102-engine/tools/post_extract.py + post_trim.py: "#K <k> <M-linje>", E-linjen
// og PM-linjerne med rapportens rand-kald); <spor> = lockstep-fixturen (tests/fixtures/lockstep-pl7.txt.gz …, kamp 0) eller ls20.txt/pen1.txt.
import { createReadStream } from 'node:fs';
import { createGunzip } from 'node:zlib';
import { createInterface } from 'node:readline';
import { matchReport6d1cc0, refereeReport6d4a20, type PmClub, type PmComp, type PmEnv, type PmFixture, type PmItem, type PmManager, type PmMatch, type PmPlayer, type PmStaff } from '../src/game/engine/grid/postMatch';
import { Mem } from './lockstep';
import type { GP } from '../src/game/engine/grid/gridMatch';

const hex = (h: string) => Uint8Array.from(Buffer.from(h, 'hex'));

export interface PostDump {
  k: number; M: number[];
  E: number[];
  G: { b0: number; avg: [number, number, number, number]; b74318: number; ae2350: number; ae235c: number; staffLimit: number; ae2378: number; specialComp: number;
    majors: number[]; list: number; gn: number; ln: number; fx: Uint8Array; comp: Uint8Array | null; home: Uint8Array; away: Uint8Array } | null;
  trials: Uint8Array[];
  A: { side: number; idx: number; st: number; own: number; opp: number; f: number; a7: number; a8: number; staff: Uint8Array; rec: Uint8Array; prefs: Uint8Array | null; mp: Uint8Array }[];
  B: { side: number; idx: number; morale: number; w47: number; w49: number; w4b: number }[];
  C: Map<string, Uint8Array | null>;
  T0: { side: number; own: number; opp: number; f: number; m: number; np: Uint8Array | null; staff: Uint8Array | null }[];
  T1: { side: number; w0: number; w2: number; w4: number }[];
  K0: { side: number; f: number }[]; K1: { side: number; v: number }[];
  N: Uint8Array[];
  F: number[] | null; R: Uint8Array | null; Z: number | null;
  /** rand-kaldene fra 0x6d1cc0's indgang (PMG) til efter 0x6d4a20 (PMR / næste ikke-rapport-linje): [n, returadresse, resultat] */
  rands: [number, number, number][];
  /** rand-kaldene efter rapporten (spillets egne) – kun de første */
  after: [number, number, number][];
}

export async function readPost(file: string): Promise<PostDump[]> {
  const raw = createReadStream(file);
  const rl = createInterface({ input: file.endsWith('.gz') ? raw.pipe(createGunzip()) : raw, crlfDelay: Infinity });
  const out: PostDump[] = [];
  let d: PostDump | null = null, phase = 0;                                   // 0 før PMG, 1 i rapporten, 2 efter PMR
  for await (const l of rl) {
    if (l.startsWith('#K ')) {
      const f = l.split(' ');
      d = { k: +f[1], M: f.slice(3).map(Number), E: [], G: null, trials: [], A: [], B: [], C: new Map(), T0: [], T1: [], K0: [], K1: [], N: [], F: null, R: null, Z: null, rands: [], after: [] };
      out.push(d); phase = 0; continue;
    }
    if (!d) continue;
    const f = l.split(' ');
    switch (f[0]) {
      case 'E': d.E = f.slice(1).map(Number); continue;
      case 'r': { const e: [number, number, number] = [+f[1], parseInt(f[2], 16), +f[4]]; if (phase === 1) d.rands.push(e); else if (phase === 2 && d.after.length < 12) d.after.push(e); continue; }
      case 'PMG': {
        phase = 1;
        const n = f.slice(1);
        d.G = { b0: +n[0], avg: [+n[1], +n[2], +n[3], +n[4]], b74318: +n[5], ae2350: +n[6], ae235c: +n[7], staffLimit: +n[8], ae2378: +n[9], specialComp: +n[10],
          majors: n.slice(11, 20).map(Number), list: +n[20], gn: +n[21], ln: +n[22], fx: hex(n[25]), comp: n[26] === '-' ? null : hex(n[26]), home: hex(n[27]), away: hex(n[28]) };
        continue;
      }
      case 'PML0': d.trials.push(hex(f[1])); continue;
      case 'PMA': d.A.push({ side: +f[1], idx: +f[2], st: +f[3], own: +f[4], opp: +f[5], f: +f[6], a7: +f[7], a8: +f[8], staff: hex(f[9]), rec: hex(f[10]), prefs: f[11] === '-' ? null : hex(f[11]), mp: hex(f[12]) }); continue;
      case 'PMB': d.B.push({ side: +f[1], idx: +f[2], morale: +f[3], w47: +f[4], w49: +f[5], w4b: +f[6] }); continue;
      case 'PMC': d.C.set(`${f[1]} ${f[2]} ${f[3]}`, f[4] === '-' ? null : hex(f[4])); continue;
      case 'PMT0': d.T0.push({ side: +f[1], own: +f[2], opp: +f[3], f: +f[4], m: +f[5], np: f[6] === '-' ? null : hex(f[6]), staff: f[7] === '-' ? null : hex(f[7]) }); continue;
      case 'PMT1': d.T1.push({ side: +f[1], w0: +f[2], w2: +f[3], w4: +f[4] }); continue;
      case 'PMK0': d.K0.push({ side: +f[1], f: +f[2] }); continue;
      case 'PMK1': d.K1.push({ side: +f[1], v: +f[2] }); continue;
      case 'PMN': d.N.push(hex(f[2])); continue;
      case 'PMZ': d.Z = +f[1]; continue;
      case 'PMF': d.F = f.slice(1).map(Number); continue;
      case 'PMR': d.R = hex(f[1]); phase = 2; continue;
      default: if (phase === 1 && d.F) phase = 2;
    }
  }
  return out;
}

// ---------------------------------------------------------------- dumpene → postMatch.ts' strukturer

export function clubOf(b: Uint8Array, key: number, G: NonNullable<PostDump['G']>): PmClub {
  const M = new Mem(b), id = M.u32(0);
  return { key, id, rep: M.s16(0x80), nation: M.u32(0x53), ground: M.u32(0x69), disStaff: [M.u32(0x9b), M.u32(0x9f), M.u32(0xa3)],
    favStaff: [M.u32(0xa7), M.u32(0xab), M.u32(0xaf)], rivals: [M.u32(0xb3), M.u32(0xb7), M.u32(0xbb)], cf: M.u32(0xcf),
    national: id >= G.ae235c - 2 * G.ae2350, manager: null };
}
export function fixtureOf(G: NonNullable<PostDump['G']>): PmFixture {
  const F = new Mem(G.fx), compPtr = F.u32(0x14);
  let comp: PmComp | null = null;
  if (compPtr && G.comp) {
    const C = new Mem(G.comp), id = C.u32(0);
    comp = { rep: C.s16(0x69), nation: C.u32(0x5d), major: G.b74318 !== 0 && G.majors.includes(id), special: compPtr === G.specialComp || id >= G.ae2378 - 0x7f };
  }
  return { id: F.s32(0), comp, ground: F.u32(0x18), home: clubOf(G.home, F.u32(0x1c), G), away: clubOf(G.away, F.u32(0x20), G),
    w30: F.s16(0x30), w32: F.s16(0x32), b3a: F.u8(0x3a), b40: F.u8(0x40), goals: [F.u8(0x43), F.u8(0x44)] };
}
export function staffOf(key: number, sb: Uint8Array, rb: Uint8Array | null, pb: Uint8Array | null): PmStaff {
  const S = new Mem(sb), R = rb ? new Mem(rb) : null, P = pb ? new Mem(pb) : null;
  return { key, id: S.u32(0), age: S.s8(0x18), nation: S.u32(0x1a), ambition: S.s8(0x57), determination: S.s8(0x58), pressure: S.s8(0x5a),
    professionalism: S.s8(0x5b), temperament: S.s8(0x5d),
    rec: R ? { ca: R.s16(5), r9: R.s16(9), rb: R.s16(0xb), rd: R.s16(0xd) } : null,
    prefs: P ? { disClubs: [P.u32(4), P.u32(8), P.u32(0xc)], favClubs: [P.u32(0x10), P.u32(0x14), P.u32(0x18)] } : null };
}
/** MATCH_PLAYER-dumpet (0x1be) → PmPlayer */
export function playerOfMp(mp: Uint8Array, staff: PmStaff | null): PmPlayer & { slot: number } {
  const P = new Mem(mp);
  return { staff, recRb: P.u32(0x6d) && staff?.rec ? staff.rec.rb : null, goals: P.u8(0xc), pensTaken: P.u8(0xd), penGoals: P.u8(0xe), b10: P.u8(0x10),
    morale: P.s8(0x17), ratingByte: P.s8(0x1b), minOn: P.s8(0x1f), minOff: P.s8(0x20), minRed: P.s8(0x21), minInj: P.s8(0x22), reds: P.u8(0x23),
    yellows: P.u8(0x24), w31: P.s16(0x31), rating: P.s16(0x35), condition: P.f32(0x4d), agitation: P.f32(0x1a2), slot: P.s8(0x19) };
}
export function itemOf(b: Uint8Array): PmItem {
  const M = new Mem(b);
  return { staff: M.u32(0), club: M.u32(4), d8: M.u32(8), b0c: M.u8(0xc), b0d: M.u8(0xd), b0e: M.u8(0xe), d0f: M.s32(0xf), type: M.s16(0x13), rest: [...b.slice(0x15, 0x19)] };
}
const itemHex = (it: PmItem) => {
  const b = Buffer.alloc(25);
  b.writeUInt32LE(it.staff >>> 0, 0); b.writeUInt32LE(it.club >>> 0, 4); b.writeUInt32LE(it.d8 >>> 0, 8); b[0xc] = it.b0c; b[0xd] = it.b0d; b[0xe] = it.b0e;
  b.writeInt32LE(it.d0f | 0, 0xf); b.writeInt16LE(it.type, 0x13); (it.rest ?? [0xff, 0xff, 0xff, 0xff]).forEach((x, i) => { b[0x15 + i] = x; });
  return b.toString('hex');
};

/** miljøet af PMG/PMC: kontrakterne efter (staff, klub) */
export function envOf(d: PostDump, clock: number, momSet: boolean): PmEnv {
  const G = d.G!;
  return {
    b0: G.b0, avg: G.avg, clock, momSet, staffLimit: G.staffLimit, list: G.list !== 0,
    trials: G.ln >= 0 ? d.trials.map(itemOf) : null,
    contract: (st, club) => {
      let c: Uint8Array | null | undefined;
      for (const [k, v] of d.C) { const [, s, cl] = k.split(' '); if (+s === st.key && +cl === club.key) { c = v; break; } }
      if (c === undefined) throw new Error(`ingen PMC-linje for staff ${st.key} klub ${club.key}`);
      return c ? { b3d: (c[0x3d] << 24) >> 24, b4f: c[0x4f] } : null;
    },
  };
}

/** uret ved rapporten: E-linjens +0x8ed0; med en ventende straffesparkskonkurrence (+0x8eb3 ≠ 0) runder 0x6ba9cf det ned til hele 30 */
export const endClock = (d: PostDump) => (d.E[2] ? Math.trunc(d.E[6] / 30) * 30 : d.E[6]);

export interface PostCheck { ok: boolean; rands: number; msgs: string[]; next?: string }

/** kør rapporten med de givne spillere og sammenlign med dumpet (tal for tal) */
export function checkReport(d: PostDump, players: [(PmPlayer | null)[], (PmPlayer | null)[]], env: PmEnv, ref: { mark: number; reds: [number, number]; yellows: [number, number] } | null,
  feedIn?: [number, number, number][]): PostCheck {
  const fx = fixtureOf(d.G!);
  const managers = [0, 1].map((s) => {
    const t = d.T0.find((x) => x.side === s);
    if (!t || !t.np || !t.staff) return null;
    const N = new Mem(t.np), S = new Mem(t.staff);
    return { nation: S.u32(0x1a), w8: N.s16(8), wa: N.s16(0xa), wc: N.s16(0xc) } as PmManager;
  }) as [PmManager | null, PmManager | null];
  const feed = feedIn ?? d.rands;
  let fi = 0, fail: string | null = null;
  const msgs: string[] = [];
  const rand = (n: number) => {
    const k = Math.trunc(n);
    if (fail) return 0;
    const e = feed[fi++];
    if (!e) { fail = `porten trækker rand(${k}) – originalen har ikke flere`; throw new Error('post'); }
    if (e[0] !== k) { fail = `rand nr. ${fi - 1}: porten rand(${k}) ≠ originalens rand(${e[0]}) fra 0x${e[1].toString(16)}`; throw new Error('post'); }
    return e[2];
  };
  const M: PmMatch = { fx, players, managers };
  let res;
  try {
    res = matchReport6d1cc0(M, env, rand);
    const refIn = d.F && ref ? { ref: d.F[0] === -2 ? null : d.F[0], comp: fx.comp, ...ref } : null;
    const rr = refIn ? refereeReport6d4a20(refIn, rand) : null;
    if (d.R) {
      const R = new Mem(d.R), want = `${R.s32(0)} ${R.u8(4)} ${R.u8(5)} ${(R.u8(6) << 24) >> 24}`;
      const got = rr ? `${rr.ref} ${rr.reds} ${rr.yellows} ${rr.score}` : '-';
      if (want !== got) msgs.push(`dommeren 0x6d4a20: originalen ${want} – porten ${got}`);
    } else if (rr) msgs.push(`dommeren: porten ${JSON.stringify(rr)}, originalen ingen post`);
  } catch (e) { if ((e as Error).message !== 'post') { fail = `undtagelse: ${(e as Error).stack}`; } }
  if (fail) msgs.unshift(fail);
  if (res) {
    for (const b of d.B) {
      const p = players[b.side][b.idx];
      const got = p ? `${p.morale} ${p.w47} ${p.w49} ${p.w4b}` : '-', want = `${b.morale} ${b.w47} ${b.w49} ${b.w4b}`;
      if (got !== want) msgs.push(`spiller ${b.side},${b.idx}: moral/+0x47/+0x49/+0x4b originalen ${want} – porten ${got}`);
    }
    for (const t of d.T1) { const o = res.managers[t.side]; const got = o ? `${o.w0} ${o.w2} ${o.w4}` : '-'; if (got !== `${t.w0} ${t.w2} ${t.w4}`) msgs.push(`manager ${t.side} (0x6d3610): originalen ${t.w0} ${t.w2} ${t.w4} – porten ${got}`); }
    for (const t of d.T0) if (Math.fround(res.teamAvg[t.side]) !== Math.fround(t.f)) msgs.push(`holdets snit ${t.side}: originalen ${t.f} – porten ${res.teamAvg[t.side]}`);
    for (const k of d.K1) if (res.clubRep[k.side] !== k.v) msgs.push(`klub ${k.side} (0x6d3de0): originalen ${k.v} – porten ${res.clubRep[k.side]}`);
    const wantN = d.N.map((b) => Buffer.from(b).toString('hex')), gotN = res.items.map(itemHex);
    if (wantN.join() !== gotN.join()) msgs.push(`[0xb67dc8]: originalen ${wantN.join(' ') || '(ingen)'} – porten ${gotN.join(' ') || '(ingen)'}`);
  }
  if (!fail && fi !== feed.length && !feedIn) msgs.push(`porten brugte ${fi} af originalens ${feed.length} tal i rapporten`);
  const nx = feedIn ? feed[fi] : d.after[0];
  return { ok: msgs.length === 0, rands: fi, msgs, next: nx ? `${nx[0]}@${nx[1].toString(16)}` : undefined };
}

/** rapporten af oraklets egne inddata (PMA-dumpene af MATCH_PLAYER ved 0x6d26b0's indgang) */
export function unitCheck(d: PostDump): PostCheck {
  const G = d.G!;
  const players: [(PmPlayer | null)[], (PmPlayer | null)[]] = [Array(20).fill(null), Array(20).fill(null)];
  for (const a of d.A) players[a.side][a.idx] = playerOfMp(a.mp, staffOf(a.st, a.staff, a.rec, a.prefs));
  const clock = endClock(d);
  const ref = d.F ? { mark: d.F[1], reds: [d.F[2], d.F[4]] as [number, number], yellows: [d.F[3], d.F[5]] as [number, number] } : null;
  void G;
  return checkReport(d, players, envOf(d, clock, true), ref);
}

const MP_FIELDS = ['goals', 'pensTaken', 'penGoals', 'b10', 'morale', 'ratingByte', 'minOn', 'minOff', 'minRed', 'minInj', 'reds', 'yellows', 'w31', 'rating', 'condition', 'agitation', 'recRb'] as const;

/** HELE kampen: låsetrinnet (lockstep.ts) til slutfløjtet, så rapporten af portens spillere (pmPlayerOf – adapterens kobling) med originalens
 *  resterende tal; staff-/klub-/kontraktdata fra PM-dumpet. Felterne sammenlignes først med oraklets MATCH_PLAYER-dump. */
export async function fullCheck(d: PostDump, trace: string, kInTrace: number): Promise<PostCheck & { lock: string }> {
  const { readAiModeCalls, readMatch, runLockstep } = await import('./lockstep');
  const { pmPlayerOf, refereeInputs } = await import('../src/game/engine/grid/postMatchInputs');
  const tr = await readMatch(trace, kInTrace);
  if (tr.M.join() !== d.M.join()) throw new Error(`sporets kamp ${tr.M.join(' ')} ≠ rapportens ${d.M.join(' ')}`);
  const aimode = readAiModeCalls(trace.replace(/\.txt(\.gz)?$/, '-aimode.txt'), tr.M[0], tr.M[1]);
  const r = runLockstep(tr, { aimode });
  const lock = `${r.ok ? 'ens' : 'afviger'} – ${r.ticks} tik, ${r.rands} tal${r.finished ? ', kampen slut' : ''}`;
  if (!r.end) return { ok: false, rands: 0, msgs: [`låsetrinnet nåede ikke slutfløjtet: ${r.at ?? ''}`], lock };
  const { g, side, ix, rest } = r.end;
  const msgs: string[] = [];
  const players: [(PmPlayer | null)[], (PmPlayer | null)[]] = [Array(20).fill(null), Array(20).fill(null)];
  for (const s of [0, 1]) side[s].forEach((q, i) => {
    const a = d.A.find((x) => x.side === s && x.idx === i);
    const p = pmPlayerOf(g, q, a ? staffOf(a.st, a.staff, a.rec, a.prefs) : null);
    players[s][i] = p;
    if (a) {
      const o = playerOfMp(a.mp, null) as unknown as Record<string, number>;
      const bad = MP_FIELDS.filter((k) => k !== 'recRb' && Math.fround(o[k]) !== Math.fround((p as unknown as Record<string, number>)[k])).map((k) => `${k} ${o[k]}/${(p as unknown as Record<string, number>)[k]}`);
      if (bad.length) msgs.push(`MATCH_PLAYER ${s},${i} (orig/port): ${bad.join(' ')}`);
    }
  });
  const ref = refereeInputs(g, side as [GP[], GP[]]);   // adapterens inddata (postMatchInputs.ts)
  void ix;
  if (d.F && `${d.F[1]} ${d.F[2]} ${d.F[3]} ${d.F[4]} ${d.F[5]}` !== `${ref.mark} ${ref.reds[0]} ${ref.yellows[0]} ${ref.reds[1]} ${ref.yellows[1]}`)
    msgs.push(`dommerens inddata +0xf5ba/+0xf5cb/+0xf5cc/+0xf601/+0xf602 (orig/port): ${d.F.slice(1).join(' ')} / ${ref.mark} ${ref.reds[0]} ${ref.yellows[0]} ${ref.reds[1]} ${ref.yellows[1]}`);
  if (s16(g.m.clock) !== endClock(d)) msgs.push(`uret +0x8ed0 (orig/port): ${endClock(d)}/${g.m.clock}`);
  // originalens resterende tal efter sidste tik = rapportens tal (dumpet) og så spillets
  const want = d.rands.map((e) => e.join()).join(' '), got = rest.slice(0, d.rands.length).map((e) => e.join()).join(' ');
  if (want !== got) msgs.push('sporets resterende tal efter slutfløjtet ≠ rapportens (PM-sporet)');
  const c = checkReport(d, players, envOf(d, g.m.clock, !!g.manOfTheMatch()), ref, rest);
  return { ...c, ok: c.ok && msgs.length === 0, msgs: [...msgs, ...c.msgs], lock };
}
const s16 = (v: number) => (v << 16) >> 16;

if (process.argv[1]?.endsWith('lockstep-post.ts')) {
  const [file, which = 'all', trace, kt] = process.argv.slice(2);
  const ds = await readPost(file);
  if (trace) {
    const d = ds.find((x) => x.k === +which);
    if (!d) throw new Error(`kamp ${which} findes ikke i ${file}`);
    const r = await fullCheck(d, trace, kt !== undefined ? +kt : +which);
    console.log(`kamp ${d.k} (${d.M.join(' ')}): låsetrin ${r.lock}; rapporten ${r.ok ? 'ens' : 'afviger'} – ${r.rands} tal${r.next ? ` – originalens næste tal ${r.next}` : ''}`);
    for (const m of r.msgs.slice(0, 20)) console.log('  ' + m);
    if (!r.ok) process.exitCode = 1;
    process.exit();
  }
  let bad = 0;
  for (const d of ds) {
    if (which !== 'all' && d.k !== +which) continue;
    if (!d.G) { console.log(`kamp ${d.k} (${d.M.join(' ')}): ingen rapport (PMG)`); continue; }
    const r = unitCheck(d);
    if (!r.ok) bad++;
    console.log(`kamp ${d.k} (${d.M.join(' ')}): ${r.ok ? 'ens' : 'afviger'} – ${r.rands} tal, ${d.B.length} spillere${r.next ? ` – spillets næste tal ${r.next}` : ''}`);
    for (const m of r.msgs.slice(0, 12)) console.log('  ' + m);
  }
  if (bad) process.exitCode = 1;
}
