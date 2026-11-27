// Låsetrin for hurtigkampen quick_simulate_match 0x6beeb0 (src/game/engine/grid/quickSim.ts) mod originalen kørt i unicorn på oraklets
// dagsbilleder (qrun.py: 0x90d2f0 fyldspillerne → init_match(fixture, 1, 0, 0) 0x6b7f20 → run_match_steps 0x6b98c0). Inddata pr. kamp: de 40
// MATCH_PLAYER-blokke (0x1be bytes) + spillerposterne (+0x6d, 0x46 bytes), pladsernes positionsord (engine+0x8ebc + 4·side), holdblokkene
// engine+0xf5bc (54 bytes pr. side), fixture-felterne og klubbernes omdømme +0x80. Porten får originalens tilfældige tal i samme rækkefølge
// (kald fra 0x6beeb0–0x6c2b00; kald inde i kommentaren/skaden/udvisningen springes over), og n skal være originalens ved hvert kald.
// Bagefter sammenlignes stillingen, minuttet, holdblokkene og spillernes karakter/mål/kort/plads/kondition med originalens.
//
//   npx tsx scripts/quick-lockstep.ts <q.jsonl[.gz]> [kamp-indeks]
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { quickSimulate, type QuickFixture } from '../src/game/engine/grid/quickSim';
import type { GP, GridMatchState } from '../src/game/engine/grid/gridMatch';

export interface QRec {
  h: string; a: string; comp: number; rep: [number, number]; posw: number[][];
  qf: Omit<QuickFixture, 'rep'>;
  EN: string; EN1: string; FX1: string;
  P: { side: number; i: number; mp: string; rec: string; staff: number }[]; P1: string[];
  rand: [number, number, number][];
  /** efter hvert 0x6c0c60: [antal rand før, side, T0..T6] */
  T?: number[][];
}
// MATCH_PLAYER-floats +0x71 + 4·i (scripts/lockstep.ts MATCH_FLOATS)
const MATCH_FLOATS = ['acceleration', 'aggression', 'agility', 'anticipation', 'balance', 'bravery', 'corners', 'crossing', 'decisions', 'dribbling',
  'finishing', 'flair', 'freeKicks', 'handling', 'heading', 'jumping', 'longShots', 'marking', 'offTheBall', 'oneOnOnes', 'pace', 'passing', 'penalties',
  'positioning', 'reflexes', 'stamina', 'strength', 'tackling', 'teamwork', 'technique', 'throwIns', 'versatility', 'creativity', 'workRate'] as const;
const OWN = (ret: number) => ret >= 0x6beeb0 && ret < 0x6c2b00;
const WORDS = new Set([0x26, 0x28, 0x2a, 0x2c, 0x2e, 0x30]);
const dv = (b: Uint8Array) => new DataView(b.buffer, b.byteOffset, b.byteLength);
const hex = (h: string) => Uint8Array.from(Buffer.from(h, 'hex'));

export function readQ(file: string): QRec[] {
  const raw = readFileSync(file);
  const txt = (file.endsWith('.gz') ? gunzipSync(raw) : raw).toString('utf8');
  return txt.split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l) as QRec);
}

interface Q { side: number; k: number; slot: number; pos: number; f: Record<string, number>; condition: number; rating: number; temperCount: number; agitation: number;
  yellows: number; b23: number; goals: number; pensTaken: number; penGoals: number; penGoalsWon: number; b0f: number; matchCA: number; b1b: number; rec: Int8Array }
function player(r: QRec, side: number, k: number, mpHex: string): Q {
  const mp = hex(mpHex), v = dv(mp), p = r.P[20 * side + k];
  const rec = p.rec ? new Int8Array(hex(p.rec).buffer) : new Int8Array(0x46);
  const slot = v.getInt8(0x19);
  const f: Record<string, number> = {};
  MATCH_FLOATS.forEach((x, i) => { f[x] = v.getFloat32(0x71 + 4 * i, true); });
  return { side, k, slot, pos: slot >= 0 && slot <= 10 ? r.posw[side][slot] : 0, f, condition: v.getFloat32(0x4d, true), rating: v.getInt16(0x35, true),
    temperCount: v.getInt8(0xff), agitation: v.getFloat32(0x1a2, true), yellows: v.getUint8(0x24), b23: v.getUint8(0x23), goals: v.getUint8(0xc),
    pensTaken: v.getUint8(0xd), penGoals: v.getUint8(0xe), penGoalsWon: v.getUint8(0x10), b0f: v.getUint8(0xf), matchCA: v.getInt16(0x3b, true),
    b1b: v.getUint8(0x1b), rec };
}

export interface QResult { ok: boolean; rands: number; skipped: number; at?: string; diff: string[]; goals: [number, number]; origGoals: [number, number] }
export function runQuick(r: QRec): QResult {
  const EN = hex(r.EN), E = dv(EN), EN1 = hex(r.EN1), E1 = dv(EN1);
  const sides = [0, 1].map((s) => Array.from({ length: 20 }, (_, k) => player(r, s, k, r.P[20 * s + k].mp)));
  const blk = [0, 1].map((s) => Array.from({ length: 54 }, (_, o) => (WORDS.has(o) ? E.getUint16(0xf5bc + 54 * s + o, true) : E.getUint8(0xf5bc + 54 * s + o))));
  const m = { goals: [E.getUint8(0xf5bd), E.getUint8(0xf5f3)] } as unknown as GridMatchState;
  let fi = 0, rands = 0, skipped = 0, fail: string | undefined;
  const feed = r.rand;
  const hist: string[] = [];
  const rand = (n: number): number => {
    const k = Math.trunc(n);
    while (fi < feed.length && !OWN(feed[fi][1])) { fi++; skipped++; }
    const e = feed[fi++];
    if (!e) { fail ??= `porten trækker rand(${k}) nr. ${rands}, men originalen har ikke flere`; throw new Error('lockstep'); }
    if (e[0] !== k) {
      fail ??= `rand nr. ${rands}: porten rand(${k}) ≠ originalens rand(${e[0]}) fra 0x${e[1].toString(16)}\n  før: ${hist.slice(-10).join(' ')}\n  efter: ${feed.slice(fi, fi + 8).map((x) => `${x[0]}@${x[1].toString(16)}=${x[2]}`).join(' ')}\n  ${new Error().stack?.split('\n').slice(2, 6).map((x) => x.trim()).join(' < ')}`;
      throw new Error('lockstep');
    }
    rands++;
    hist.push(`${e[0]}@${e[1].toString(16)}=${e[2]}`); if (hist.length > 12) hist.shift();
    return e[2];
  };
  let knocks = E.getUint8(0xf639), ti = 0;
  const knockList = new Map<Q, [number, number]>();
  /** tal fra originalens kald uden for 0x6beeb0–0x6c2b00 (her: skaden 0x6d0980) – kommentarens springes over */
  const foreign = (n: number): number => {
    while (fi < feed.length && (OWN(feed[fi][1]) || feed[fi][1] < 0x6d0980 || feed[fi][1] >= 0x6d0c00)) { if (OWN(feed[fi][1])) break; fi++; skipped++; }
    const e = feed[fi];
    if (!e || OWN(e[1]) || e[0] !== Math.trunc(n)) { fail ??= `skaden: porten rand(${Math.trunc(n)}), originalen ${e ? `${e[0]}@${e[1].toString(16)}` : 'slut'}`; throw new Error('lockstep'); }
    fi++; return e[2];
  };
  const diff: string[] = [];
  try {
    quickSimulate({
      m, rand, sides: sides as unknown as [GP[], GP[]], blk,
      rec: (q, o) => (q as unknown as Q).rec[o], ca: (q) => { const R = (q as unknown as Q).rec; return (R[5] & 0xff) | (R[6] << 8); },
      fx: { ...r.qf, rep: r.rep },
      sendOff: (q) => { (q as unknown as Q).slot = -3; },
      // 0x6d0980 (gridMatch.ts injure): kun konditionen bruges af hurtigkampen bagefter (0x6c03f6) – originalens tal fra kaldene i 0x6d0980
      injure: (kind0, sev0, q0) => {
        const q = q0 as unknown as Q, s8 = (v: number) => (v << 24) >> 24, kind = s8(kind0);
        let sev = s8(sev0);
        if (knocks > 3 && foreign(knocks) !== 0 && foreign(500) !== 0) return;
        if (knocks > 6) return;
        if (kind > -1) {                                                                       // 0x62be00: dagens liste (flettet sværhed)
          const n = knockList.get(q);
          if (!n) knockList.set(q, [kind, sev]);
          else { if (n[0] === kind) n[1] = sev + n[1] > 100 ? 100 : s8(sev + n[1]); else if (sev > n[1]) { n[1] = sev; n[0] = kind; } sev = n[1]; }
        }
        let Lc = 0, out = false;
        if (sev > 50) q.condition = Math.fround(q.condition - sev * sev);
        else { Lc = foreign(Math.trunc(sev * sev * 0.5)); q.condition = Math.fround(q.condition - Lc); foreign(Math.trunc(Lc * 0.5)); }
        if (q.condition < 5000 || q.condition < (q.rec[0x2d] * 25 + 7100)) out = true;
        else if (Lc >= 500 && sev > 50) out = true;
        q.condition = Math.fround(Math.max(1, Math.min(10000, q.condition)));
        if (out) knocks++;
      },
      comment: () => {},
      onStrengths: (T, s) => {
        const o = r.T?.[ti++];
        if (!o || fail) return;
        const mine = T.map((x) => x[s]);
        if (o[1] !== s || mine.some((v, k) => v !== o[2 + k])) { fail = `0x6c0c60 kald ${ti - 1} (rand ${rands}): side ${s} T ${mine.join(',')} ≠ originalens side ${o[1]} T ${o.slice(2).join(',')}`; throw new Error('lockstep'); }
      },
    });
  } catch (e) {
    if ((e as Error).message !== 'lockstep') { fail ??= (e as Error).stack; }
  }
  while (fi < feed.length && !OWN(feed[fi][1])) { fi++; skipped++; }
  if (!fail && fi < feed.length) fail = `originalen har ${feed.length - fi} tal mere (næste ${feed[fi][0]}@${feed[fi][1].toString(16)})`;
  const og: [number, number] = [E1.getUint8(0xf5bd), E1.getUint8(0xf5f3)];
  if (!fail) {
    if (m.goals[0] !== og[0] || m.goals[1] !== og[1]) diff.push(`stilling ${m.goals.join('-')} ≠ ${og.join('-')}`);
    for (const s of [0, 1]) for (let o = 0; o < 54; o++) {
      const ov = WORDS.has(o) ? E1.getUint16(0xf5bc + 54 * s + o, true) : E1.getUint8(0xf5bc + 54 * s + o);
      if (WORDS.has(o - 1)) continue;
      if (blk[s][o] !== ov) diff.push(`blk[${s}][0x${o.toString(16)}] ${blk[s][o]} ≠ ${ov}`);
    }
    for (const s of [0, 1]) for (let k = 0; k < 20; k++) {
      const q = sides[s][k], o = player(r, s, k, r.P1[20 * s + k]);
      for (const key of ['rating', 'b1b', 'goals', 'yellows', 'pensTaken', 'penGoals', 'penGoalsWon', 'b0f', 'condition'] as const)
        if (q[key] !== o[key] && !(key === 'condition' && Math.abs(q[key] - o[key]) < 1e-3)) diff.push(`${s}/${k} ${key} ${q[key]} ≠ ${o[key]}`);
      if ((q.slot < 0) !== (o.slot < 0)) diff.push(`${s}/${k} slot ${q.slot} ≠ ${o.slot}`);
    }
  }
  return { ok: !fail && !diff.length, rands, skipped, at: fail, diff, goals: [m.goals[0], m.goals[1]], origGoals: og };
}

if (process.argv[1]?.endsWith('quick-lockstep.ts')) {
  const recs = readQ(process.argv[2]);
  const only = process.argv[3] !== undefined ? +process.argv[3] : -1;
  let ok = 0;
  recs.forEach((r, i) => {
    if (only >= 0 && i !== only) return;
    const x = runQuick(r);
    if (x.ok) ok++;
    console.log(`${i} ${r.h} - ${r.a}: ${x.ok ? 'OK' : 'AFVIGER'} (rand ${x.rands}, sprunget over ${x.skipped}) port ${x.goals.join('-')} orig ${x.origGoals.join('-')}`);
    if (x.at) console.log('  ' + x.at);
    if (x.diff.length) console.log('  ' + x.diff.slice(0, 12).join('\n  '));
  });
  console.log(`${ok}/${only >= 0 ? 1 : recs.length} ens`);
}
