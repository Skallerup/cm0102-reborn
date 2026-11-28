// Nye skader i engelske ligaklubber efter KILDE mod oraklets dagsbilleder (3.9.60, frø 1, Arsenal, world med CM_DBSIZE=2).
// Oraklet: skadeposten +0x1a ≠ 0xff = kampens data (0x7e4750), type 0–2 = sygdom, ellers træning/andet. Vores: FIT_TRACE (kamp/træning/sygdom/behandling).
// Oraklet aflæses dagligt (ONLY_ORACLE=1; nøgle = spiller|startdag|type), vores side tæller hver ny skade (FIT_TRACE).
//   WORLD=<world-dbs2.json> [SEED=1] [FROM=2001-08-01] [TO=2001-12-31] [ONLY_ORACLE=1] npx tsx scripts/inj-src.ts
import { readFileSync } from 'node:fs';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import type { SparseMem } from '../src/game/cmMem';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { applyAction } from '../src/game/actions';
import { gs } from '../src/game/state';
import { dayNum, FIT_TRACE, INJ_TYPES } from '../src/game/cmFitness';
import type { GameState } from '../src/game/types';

const FROM = process.env.FROM ?? '2001-08-01', TO = process.env.TO ?? '2001-12-31';
const SEED = Number(process.env.SEED ?? 1);
const ENG = /^(English )?(Premier|First|Second|Third) Division$/;
const str = (m: SparseMem, a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
type Rec = { src: string; t: number; d: number; age: number };
const days: string[] = [];
for (let d = dayNum(FROM); d <= dayNum(TO); d++) days.push(new Date(d * 86400000).toISOString().slice(0, 10));
const lo = dayNum(FROM);

function oracleDay(m: SparseMem, seen: Map<string, Rec>): void {
  const S = m.u32(0xae23bc), n = m.s32(0xae2364), C = m.u32(0xae23b4), nc = m.s32(0xae235c);
  const IB = m.u32(0xb63d28); if (!IB) return;
  const injBase = m.u32(IB), tab = m.u32(IB + 4);
  const today = Date.UTC(m.s16(0xae2c92), 0, 1 + m.s16(0xae2c90)) / 86400000;
  for (let id = 0; id < n; id++) {
    const st = S + 0x6e * id;
    if (!m.u32(st + 0x61) || m.u8(st + 0x3d) === 16) continue;
    const ix = m.s32(injBase + 31 * id + 0xe); if (ix < 0) continue;
    const cadr = m.u32(st + 0x39), cix = cadr ? (cadr - C) / 0x245 : -1;
    if (!(cix >= 0 && cix < nc)) continue;
    const adr = C + 0x245 * cix, dv = m.u32(adr + 0x57);
    if (str(m, m.u32(adr + 0x53) + 4, 51) !== 'England' || !ENG.test(dv ? str(m, dv + 4, 51) : '')) continue;
    const e = tab + 0x30 * ix, t = m.u8(e), d = Date.UTC(m.u16(e + 0x22), 0, 1 + m.s16(e + 0x20)) / 86400000;
    if (d < lo) continue;
    const key = `${id}|${d}|${t}`;
    if (seen.has(key)) continue;
    const by = m.u16(st + 0x12), age = by > 1850 ? (today - Date.UTC(by, 0, 1 + m.s16(st + 0x10)) / 86400000) / 365.25 : 25;
    seen.set(key, { src: m.u8(e + 0x1a) !== 0xff ? 'match' : t <= 2 ? 'ill' : 'other', t, d, age });
  }
}

function report(name: string, recs: Rec[]): void {
  const by = (f: (r: Rec) => string) => { const o: Record<string, number> = {}; for (const r of recs) { const k = f(r); o[k] = (o[k] ?? 0) + 1; } return o; };
  console.log(`== ${name}: ${recs.length} nye skader`);
  console.log('  kilde:', JSON.stringify(by((r) => r.src)));
  for (const s of ['match', 'train', 'other', 'ill', 'treat']) {
    const rs = recs.filter((r) => r.src === s); if (!rs.length) continue;
    const c: Record<number, number> = {}; for (const r of rs) { const k = INJ_TYPES[r.t]?.[0] ?? -1; c[k] = (c[k] ?? 0) + 1; }
    const a: Record<string, number> = {}; for (const r of rs) { const k = r.age < 23 ? '<23' : r.age < 30 ? '23-29' : r.age < 33 ? '30-32' : '33+'; a[k] = (a[k] ?? 0) + 1; }
    console.log(`  ${s} kat:`, JSON.stringify(c), 'alder:', JSON.stringify(a));
  }
  const mo = by((r) => new Date(r.d * 86400000).toISOString().slice(0, 7));
  console.log('  måned:', JSON.stringify(mo));
  const wd = by((r) => r.src + ':' + ['ma', 'ti', 'on', 'to', 'fr', 'lø', 'sø'][(new Date(r.d * 86400000).getUTCDay() + 6) % 7]);
  console.log('  ugedag:', JSON.stringify(wd));
}

if (process.env.ONLY_ORACLE) {                                                     // (oraklet for sig: flere samtidige kørsler deler billedernes cache)
  const ix = readDaySnapIndex(DEFAULT_DAYSNAP)!;
  const oseen = new Map<string, Rec>();
  for (const iso of days) { const e = ix.snaps.find((s) => s.iso === iso); if (e) oracleDay(loadDaySnap(ix, e), oseen); }
  report('orakel', [...oseen.values()]);
}

if (!process.env.ONLY_ORACLE) {
  const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
  const eng = w.nations.findIndex((x) => x.name === 'England');
  const user = w.clubs.find((c) => c[1] === 'Arsenal')![0];
  createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: SEED, mode: 'authentic' });
  const g: GameState = gs();
  const engLeague = (cid: number) => { const c = g.clubs[cid]; if (!c || g.nations[c.nation]?.name !== 'England') return false; return ENG.test(g.comps[c.league]?.name ?? g.leagues[c.league]?.name ?? ''); };
  const direct: Rec[] = [];
  FIT_TRACE.on = (p, t, _fx, src) => {
    const d = dayNum(g.date); if (d < lo || d > dayNum(TO) || !engLeague(p.club)) return;
    direct.push({ src, t, d, age: (Date.parse(g.date) - Date.parse(p.dob)) / (365.25 * 86400000) });
  };
  let guard = 0;
  while (g.date <= TO && guard++ < 20000) {
    if (!g.userClub) {
      const offer = g.jobOffers.find((id) => g.clubs[id]?.manager === 0);
      if (offer) applyAction({ t: 'acceptJob', club: offer });
      else for (const id of g.vacancies.slice(0, 3)) applyAction({ t: 'applyJob', club: id });
    }
    const r = continueGame(); if (r?.match) quickPlayUserMatch();
  }
  report(`vores (frø ${SEED}, alle via FIT_TRACE)`, direct);
  // som oraklet: kun skader, der stadig står ved dagens slut (≥ 1 dag) – samme filter som dagsbillederne
  report(`vores (frø ${SEED}, ≥ 1 dag)`, direct.filter((r) => INJ_TYPES[r.t][2] > 0));
}
