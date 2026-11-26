// K7 leje: nordiske klubbers lejepladser (rolle 0xb, +0x24 bit 0), mål (og målets klubland) og åbne bud – oraklet mod spillet (frø 1, Arsenal på ferie).
//   WORLD=<world-dbs2.json> [FROM=2002-01-05] [UNTIL=2002-06-29] [EVERY=14] node scripts/measure.mjs -- npx tsx scripts/k7-loan-nordic.ts
import { readFileSync } from 'node:fs';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import type { SparseMem } from '../src/game/cmMem';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { applyAction } from '../src/game/actions';
import { gs } from '../src/game/state';
import { entryOf } from '../src/game/cmSquadPlanGame';
import type { GameState } from '../src/game/types';

const NATS = ['Sweden', 'Norway', 'Finland'];
const FROM = process.env.FROM ?? '2002-01-05', UNTIL = process.env.UNTIL ?? '2002-06-29', EVERY = Number(process.env.EVERY ?? 14);
const str = (m: SparseMem, a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
type R = Record<string, number>;
function oracle(m: SparseMem): Record<string, R> {
  const C = m.u32(0xae23b4), nc = m.s32(0xae235c), S = m.u32(0xae23bc);
  const nat = (ix: number) => (ix >= 0 && ix < nc ? str(m, m.u32(C + 0x245 * ix + 0x53) + 4, 51) : '');
  const out: Record<string, R> = {};
  const slm = m.u32(m.u32(0xde1f54) + 0x856), ents = m.u32(slm + 0xdc);
  for (let ix = 0; ix < nc; ix++) {
    const n = nat(ix); if (!NATS.includes(n)) continue;
    const r = (out[n] ??= {}); r.klubber = (r.klubber ?? 0) + 1;
    const base = m.u32(ents + 9 * ix);
    if (!base) continue;
    r.plan = (r.plan ?? 0) + 1;
    for (let i = 0; i < 40; i++) {
      const s = base + 37 * i;
      if (m.u8(s) !== 0xb) continue;
      r.spl = (r.spl ?? 0) + 1;
      const loan = m.u8(s + 0x24) & 1;
      if (loan) r.lejepl = (r.lejepl ?? 0) + 1;
      const f = m.s32(s + 0xf);
      if (f > -1) {
        const ca = m.u32(S + 0x6e * f + 0x39), tn = ca ? nat((ca - C) / 0x245) : '-';
        const k = `${loan ? 'lejemål' : 'mål'}:${tn === n ? 'eget' : tn}`;
        r[k] = (r[k] ?? 0) + 1;
      }
    }
  }
  const tm = m.u32(0xde1f54), tab = m.u32(tm), nb = m.s32(tm + 4);
  for (let i = 0; i < nb; i++) { const o = m.u32(tab + 4 * i); if (!o) continue; const n = nat(m.s32(o + 8)); if (!NATS.includes(n)) continue; const k = m.u8(o + 0x1f) ? 'lejebud' : 'købsbud'; out[n][k] = (out[n][k] ?? 0) + 1; }
  return out;
}
let g!: GameState;
function ours(): Record<string, R> {
  const out: Record<string, R> = {};
  const nat = (cid: number) => g.nations[g.clubs[cid]?.nation ?? -1]?.name ?? '-';
  for (const c of Object.values(g.clubs)) {
    const n = nat(c.id); if (!NATS.includes(n)) continue;
    const r = (out[n] ??= {}); r.klubber = (r.klubber ?? 0) + 1;
    if (!g.cmPlan?.[c.id]) continue;
    r.plan = (r.plan ?? 0) + 1;
    for (const s of entryOf(g, c.id).slots) {
      if (s.role !== 0xb) continue;
      r.spl = (r.spl ?? 0) + 1;
      const loan = s.b24 & 1;
      if (loan) r.lejepl = (r.lejepl ?? 0) + 1;
      if (s.f > -1) { const p = g.players[s.f]; const tn = p?.club ? nat(p.club) : '-'; const k = `${loan ? 'lejemål' : 'mål'}:${tn === n ? 'eget' : tn}`; r[k] = (r[k] ?? 0) + 1; }
    }
  }
  for (const o of [...g.offers, ...(g.cmTmKept ?? [])]) { const n = nat(o.buyer); if (!NATS.includes(n)) continue; const k = o.loan ? 'lejebud' : 'købsbud'; out[n][k] = (out[n][k] ?? 0) + 1; }
  return out;
}
const ix1 = readDaySnapIndex(DEFAULT_DAYSNAP)!;
const t0 = Date.parse(FROM);
const snaps = ix1.snaps.filter((e) => e.iso >= FROM && e.iso <= UNTIL && ((Date.parse(e.iso) - t0) / 86400000) % EVERY === 0);
const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
const eng = w.nations.findIndex((x) => x.name === 'England');
createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
g = gs();
const fmt = (r: R) => Object.entries(r).sort().map(([k, v]) => `${k} ${v}`).join(', ');
for (const s of snaps) {
  const prev = new Date(Date.parse(s.iso) - 86400000).toISOString().slice(0, 10);
  let guard = 0;
  while ((g.date < prev || !g.dayDone || g.pendingFixture) && guard++ < 5000) {
    if (!g.userClub) { const offer = g.jobOffers.find((id) => g.clubs[id]?.manager === 0); if (offer) applyAction({ t: 'acceptJob', club: offer }); else for (const id of g.vacancies.slice(0, 3)) applyAction({ t: 'applyJob', club: id }); }
    const r = continueGame(); if (r?.match) quickPlayUserMatch();
  }
  const o = oracle(loadDaySnap(ix1, s)), u = ours();
  for (const n of NATS) console.log(`${s.iso} ${n}\n  O: ${fmt(o[n] ?? {})}\n  V: ${fmt(u[n] ?? {})}`);
}
