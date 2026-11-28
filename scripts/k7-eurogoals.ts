// K7: Europas målniveau kamp for kamp – CL (326) og UEFA Cup (328) i spillet mod oraklet (daysnap s1-3.9.60-e1, Arsenal, frø 1, størrelse 2).
// Pr. kamp og hold: de 11 startende (oraklet: match_stats_matches.tmp's spillerblokke H+0x74; vores: motorens holdark), hvor mange af dem er
// genererede fyldspillere (oraklet: staff-id ≥ [0xae2364]; vores: Player.virtual), de rigtiges snit-CA (oraklet: dagsbilledet ≤ kampdatoen),
// skud/på mål/mål. Tabellen grupperer kampene efter antal fyldspillere (0 / 1–5 / 6–11 pr. hold) og viser mål pr. kamp i hver gruppe.
//   WORLD=<world-dbs2.json> node scripts/measure.mjs -- npx tsx scripts/k7-eurogoals.ts [slutdato = 2001-12-31] [frø = 1]
//   ONLY_ORACLE=1: kun oraklets side.  JSON=<fil>: alle kampe.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import type { SparseMem } from '../src/game/cmMem';

const until = process.argv[2] ?? '2001-12-31', SEED = Number(process.argv[3] ?? 1);
const COMPS: Record<number, string> = { 326: 'CL', 328: 'UEFA' };
interface T { club: string; fill: number; ca: number; shots: number; on: number; goals: number; ids?: number[] }
interface M { comp: string; date: string; h: T; a: T; hg: number; ag: number; q?: number }

const strOf = (m: SparseMem, a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const iso = (y: number, d: number) => new Date(Date.UTC(y, 0, 1) + d * 864e5).toISOString().slice(0, 10);

// engine+0 pr. oraklets kamp (unicorn: qrun.py REAL=1 på dagsbillederne – OQ=<mappe med real<dato>.jsonl>)
const OQ = new Map<string, number>();
if (process.env.OQ) for (const f of readdirSync(process.env.OQ).filter((x) => /^real2001-.*\.jsonl$/.test(x))) for (const l of readFileSync(join(process.env.OQ, f), 'utf8').split('\n')) {
  if (!l) continue; const r = JSON.parse(l) as { FX0: string; q: number }; const x = Buffer.from(r.FX0, 'hex');
  OQ.set(`${x.readUInt16LE(0x28)}|${x.readUInt16LE(0x2a)}|${x.readInt32LE(0xc)}|${x.readInt32LE(0x10)}`, r.q);
}
function oracleSide(): M[] {
  const ix = readDaySnapIndex(DEFAULT_DAYSNAP)!;
  const ks = ix.snaps.filter((e) => e.kind === 'k' && e.iso < until);
  const snaps: { iso: string; ca: Map<number, number>; n: number }[] = [];
  const idName = new Map<number, string>();
  for (const e of ks.filter((_, i) => i % 4 === 0)) {
    const m = loadDaySnap(ix, e);
    const S = m.u32(0xae23bc), n = m.s32(0xae2364), C = m.u32(0xae23b4), nc = m.s32(0xae235c);
    const ca = new Map<number, number>();
    for (let id = 0; id < n; id++) { const pr = m.u32(S + 0x6e * id + 0x61); if (pr) ca.set(id, m.s16(pr + 5)); }
    if (!idName.size) for (let i = 0; i < nc; i++) { const adr = C + 0x245 * i; idName.set(m.s32(adr), strOf(m, adr + 4, 51)); }
    snaps.push({ iso: e.iso, ca, n });
  }
  const files = join(DEFAULT_DAYSNAP, 'files');
  const fx = new Map<string, [number, string]>();
  for (const f of readdirSync(files).filter((x) => /^fixtures_\d{4}\.tmp$/.test(x))) {
    const b = readFileSync(join(files, f)), v = new DataView(b.buffer, b.byteOffset, b.byteLength), n = v.getInt32(0, true);
    for (let k = 0; k < n && 4 + (k + 1) * 79 <= b.byteLength; k++) {
      const o = 4 + k * 79, c = v.getInt32(o, true); if (!COMPS[c]) continue;
      const d = iso(v.getUint16(o + 40, true), v.getUint16(o + 42, true)); if (d < '2001-07-14' || d >= until) continue;
      fx.set(`${v.getUint16(o + 40, true)}|${v.getUint16(o + 42, true)}|${v.getInt32(o + 12, true)}|${v.getInt32(o + 16, true)}`, [c, d]);
    }
  }
  const out: M[] = [];
  const b = readFileSync(join(files, 'match_stats_matches.tmp'));
  for (let o = 0; o + 3450 <= b.byteLength; o += 3450) {
    const y = b.readUInt16LE(o + 10); if (!y) continue;
    const hit = fx.get(`${y}|${b.readUInt16LE(o + 8)}|${b.readInt32LE(o)}|${b.readInt32LE(o + 4)}`); if (!hit) continue;
    const [c, d] = hit, sn = [...snaps].reverse().find((s) => s.iso <= d) ?? snaps[0];
    const side = (t: number): T => {
      const H = o + 0x11c + t * 1573; let fill = 0; const cas: number[] = [], ids: number[] = [];
      for (let k = 0; k < 11; k++) {
        const id = b.readInt32LE(H + 0x74 + k * 73); ids.push(id);
        if (id >= sn.n) fill++; else { const x = sn.ca.get(id); if (x !== undefined) cas.push(x); }
      }
      return { club: idName.get(b.readInt32LE(o + 4 * t)) ?? '?', fill, ca: cas.length ? cas.reduce((s, x) => s + x, 0) / cas.length : NaN, shots: b[H + 0x0b], on: b[H + 0x0c], goals: b[H + 3], ids };
    };
    const h = side(0), a = side(1);
    out.push({ comp: COMPS[c], date: d, h, a, hg: h.goals, ag: a.goals, q: OQ.get(`${y}|${b.readUInt16LE(o + 8)}|${b.readInt32LE(o)}|${b.readInt32LE(o + 4)}`) });
  }
  return out;
}

async function ourSide(): Promise<M[]> {
  const { createGame } = await import('../src/game/newgame');
  const { continueGame, quickPlayUserMatch } = await import('../src/game/sim');
  const { gs } = await import('../src/game/state');
  const { getGridFactory, setGridFactory } = await import('../src/game/engine/liveSim');
  type LS = ReturnType<NonNullable<ReturnType<typeof getGridFactory>>>;
  const live = new Map<number, { ls: LS; t: { fill: number; ca: number }[] }>();
  let wrapped = false, cur = -1;
  const quick = new Set<number>();
  (globalThis as { cmQuickTap?: unknown }).cmQuickTap = () => { quick.add(cur); };
  const wrap = () => {
    const f0 = getGridFactory(); if (!f0 || wrapped) return; wrapped = true;
    setGridFactory((h, a, o, r) => {
      const x = f0(h, a, o, r);
      cur = o.fixtureId ?? -1;
      if (o.fixtureId !== undefined) {
        const t = [h, a].map((e, k) => {
          const ps = x.teams[k].tactic.lineup.slice(0, 11).map((id) => e.players.get(id) ?? gs().players[id]).filter(Boolean);
          const real = ps.filter((p) => !p!.virtual);
          return { fill: ps.length - real.length + (11 - ps.length), ca: real.length ? real.reduce((s, p) => s + p!.ca, 0) / real.length : NaN };
        });
        live.set(o.fixtureId, { ls: x, t });
      }
      return x;
    });
  };
  const w = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world-original.json', 'utf8'));
  const eng = w.nations.findIndex((x: { name: string }) => x.name === 'England');
  const user = w.clubs.find((c: unknown[]) => c[1] === 'Arsenal')[0];
  createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: SEED, mode: 'authentic' });
  const g = gs();
  const out: M[] = [], seen = new Set<number>();
  let guard = 0;
  while (g.date < until && guard++ < 100000) {
    wrap();
    const r = continueGame(); if (r?.match) quickPlayUserMatch();
    for (const f of Object.values(g.fixtures)) {
      if ((f.comp !== 'CL' && f.comp !== 'UEFA') || !f.result || seen.has(f.id)) continue;
      seen.add(f.id);
      const lv = live.get(f.id);
      const side = (k: 0 | 1, club: number, goals: number): T => ({ club: g.clubs[club]?.name ?? '?', fill: lv?.t[k].fill ?? -1, ca: lv?.t[k].ca ?? NaN,
        shots: lv?.ls.teams[k].stats.shots ?? -1, on: lv?.ls.teams[k].stats.onTarget ?? -1, goals });
      out.push({ comp: f.comp, date: f.date, h: side(0, f.home, f.result.hg), a: side(1, f.away, f.result.ag), hg: f.result.hg, ag: f.result.ag, q: quick.has(f.id) ? 1 : 0 });
    }
    live.clear();
  }
  return out;
}

const cls = (t: T) => (t.fill <= 0 ? '0' : t.fill <= 5 ? '1-5' : '6-11');
function table(label: string, ms: M[]) {
  console.log(`\n## ${label} (${ms.length} kampe)`);
  for (const comp of ['CL', 'UEFA', 'alle']) {
    const xs = ms.filter((m) => comp === 'alle' || m.comp === comp);
    const avg = (f: (m: M) => number, ys = xs) => (ys.length ? (ys.reduce((s, m) => s + f(m), 0) / ys.length).toFixed(2) : '—');
    console.log(`${comp.padEnd(5)} n ${String(xs.length).padStart(3)}  mål ${avg((m) => m.hg + m.ag)}  hjemme ${avg((m) => m.hg)} ude ${avg((m) => m.ag)}  skud ${avg((m) => m.h.shots + m.a.shots)} på mål ${avg((m) => m.h.on + m.a.on)}  0-0 ${Math.round((100 * xs.filter((m) => !m.hg && !m.ag).length) / Math.max(1, xs.length))}%  fyld/hold ${avg((m) => (m.h.fill + m.a.fill) / 2)}  CA(rigtige) ${avg((m) => ((m.h.ca || 0) + (m.a.ca || 0)) / 2)}`);
  }
  for (const comp of ['CL', 'UEFA']) for (const q of [0, 1]) {
    const xs = ms.filter((m) => m.comp === comp && m.q === q); if (!xs.length) continue;
    const avg = (f: (m: M) => number) => (xs.reduce((s, m) => s + f(m), 0) / xs.length).toFixed(2);
    console.log(`  ${comp} engine+0=${q}: n ${xs.length} mål ${avg((m) => m.hg + m.ag)} skud ${avg((m) => m.h.shots + m.a.shots)} på mål ${avg((m) => m.h.on + m.a.on)} fyld/hold ${avg((m) => (m.h.fill + m.a.fill) / 2)}`);
  }
  const groups = new Map<string, M[]>();
  for (const m of ms) { const k = [cls(m.h), cls(m.a)].join(' mod '); (groups.get(k) ?? groups.set(k, []).get(k)!).push(m); }
  for (const [k, xs] of [...groups].sort()) {
    const avg = (f: (m: M) => number) => (xs.reduce((s, m) => s + f(m), 0) / xs.length).toFixed(2);
    console.log(`  fyld ${k.padEnd(14)} n ${String(xs.length).padStart(3)}  mål ${avg((m) => m.hg + m.ag)} (${avg((m) => m.hg)}–${avg((m) => m.ag)})  skud ${avg((m) => m.h.shots)}–${avg((m) => m.a.shots)}  CA ${avg((m) => m.h.ca || 0)}–${avg((m) => m.a.ca || 0)}`);
  }
}

const O = oracleSide();
table(`oraklet til ${until}`, O);
let U: M[] = [];
if (!process.env.ONLY_ORACLE) { U = await ourSide(); table(`spillet frø ${SEED} til ${until}`, U); }
if (process.env.JSON) writeFileSync(process.env.JSON, JSON.stringify({ oracle: O, ours: U }));
