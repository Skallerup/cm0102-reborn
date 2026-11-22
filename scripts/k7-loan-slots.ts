// K7 leje: ønskelisternes lejepladser (slot +0x24 bit 1, rolle 0xb) og åbne lejebud pr. engelsk division – oraklet mod spillet på billeddatoerne.
// Shortlist_Manager [[0xde1f54]+0x856]: +0xdc klubposter (9 bytes: +0 pladserne, 37 bytes × 40), TRANSFER_MANAGER [0xde1f54] +0/+8 buddene (+0x1f leje).
//   WORLD=<world-dbs2.json> UNTIL=2003-06-30 EVERY=28 npx tsx scripts/k7-loan-slots.ts
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import type { SparseMem } from '../src/game/cmMem';
import { createGame, type WorldData } from '../src/game/newgame';
import { continueGame, quickPlayUserMatch } from '../src/game/sim';
import { applyAction } from '../src/game/actions';
import { gs } from '../src/game/state';
import { entryOf } from '../src/game/cmSquadPlanGame';
import { clubRepMem } from '../src/game/cmPlayerData';
import type { GameState } from '../src/game/types';

const E = `${homedir()}/cm0102-engine`;
const UNTIL = process.env.UNTIL ?? '2003-06-30', EVERY = Number(process.env.EVERY ?? 28), ONLY_ORACLE = !!process.env.ONLY_ORACLE;
const TIER: Record<string, string> = { 'English Premier Division': 'PL', 'English First Division': 'D1', 'English Second Division': 'D2', 'English Third Division': 'D3' };
const TIERS = ['PL', 'D1', 'D2', 'D3', 'NL'];
type Row = Record<string, number[]>;   // tier → [klubber, lejepladser, med mål, åbne lejebud (køber), åbne købsbud (køber), spillere]
const str = (m: SparseMem, a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };

function oracle(m: SparseMem): Row & { b64: Record<string, Record<number, number>> } {
  const C = m.u32(0xae23b4), nc = m.s32(0xae235c);
  const tierOf = new Map<number, string>();
  const b64: Record<string, Record<number, number>> = {};
  for (let ix = 0; ix < nc; ix++) {
    const a = C + 0x245 * ix;
    if (str(m, m.u32(a + 0x53) + 4, 51) !== 'England') continue;
    const dv = m.u32(a + 0x57), t = TIER[dv ? str(m, dv + 4, 51) : ''] ?? 'NL';
    tierOf.set(ix, t);
    const v = m.u8(a + 0x64); (b64[t] ??= {})[v] = (b64[t][v] ?? 0) + 1;
  }
  const r: Row = Object.fromEntries(TIERS.map((t) => [t, [0, 0, 0, 0, 0, 0]]));
  const slm = m.u32(m.u32(0xde1f54) + 0x856), ents = m.u32(slm + 0xdc);
  for (const [ix, t] of tierOf) {
    r[t][0]++;
    const base = m.u32(ents + 9 * ix);
    if (!base) continue;
    for (let i = 0; i < 40; i++) {
      const s = base + 37 * i;
      if (m.u8(s) !== 0xb || !(m.u8(s + 0x24) & 1)) continue;
      r[t][1]++; if (m.s32(s + 0xf) > -1) r[t][2]++;
    }
  }
  const tm = m.u32(0xde1f54), tab = m.u32(tm), n = m.s32(tm + 8);
  for (let i = 0; i < n && i < 20000; i++) {
    const o = m.u32(tab + 4 * i); if (!o) continue;
    const cix = m.s32(o + 8);   // klubbens id (init_loan_offer: +8 = club +0)
    const t = tierOf.get(cix); if (!t) continue;
    r[t][m.u8(o + 0x1f) ? 3 : 4]++;
  }
  const S = m.u32(0xae23bc), ns = m.s32(0xae2364);
  for (let id = 0; id < ns; id++) { const st = S + 0x6e * id; if (!m.u32(st + 0x61) || m.u8(st + 0x3d) === 16) continue; const ca = m.u32(st + 0x39); if (!ca) continue; const t = tierOf.get((ca - C) / 0x245); if (t) r[t][5]++; }
  return Object.assign(r, { b64 });
}

let g!: GameState;
function ours(): Row {
  const eng = g.nations.findIndex((x) => x.name === 'England');
  const tierOf = new Map<number, string>();
  for (const c of Object.values(g.clubs)) if (c.nation === eng) tierOf.set(c.id, TIER[g.comps[c.league]?.name ?? ''] ?? 'NL');
  const r: Row = Object.fromEntries(TIERS.map((t) => [t, [0, 0, 0, 0, 0, 0]]));
  for (const [cid, t] of tierOf) {
    r[t][0]++;
    if (!g.cmPlan?.[cid]) continue;
    for (const s of entryOf(g, cid).slots) if (s.role === 0xb && s.b24 & 1) { r[t][1]++; if (s.f > -1) r[t][2]++; }
  }
  // TRANSFER_MANAGER's tabel = spillets bud + de lukkede, originalen endnu har (cmTmKept)
  for (const o of [...g.offers, ...(g.cmTmKept ?? [])]) { const t = tierOf.get(o.buyer); if (t) r[t][o.loan ? 3 : 4]++; }
  for (const p of Object.values(g.players)) { if (p.virtual || !p.club) continue; const t = tierOf.get(p.club); if (t) r[t][5]++; }
  return r;
}

const ix1 = readDaySnapIndex(DEFAULT_DAYSNAP)!, ix2 = readDaySnapIndex(`${E}/oracle/daysnap/s1-3.9.60-y23-e14`);
const t0 = Date.parse('2001-07-14');
const snaps = [...ix1.snaps.filter((e) => ((Date.parse(e.iso) - t0) / 86400000) % EVERY === 0).map((e) => ({ iso: e.iso, ix: ix1, e })),
  ...(ix2 ? ix2.snaps.filter((e) => ((Date.parse(e.iso) - Date.parse('2002-07-14')) / 86400000) % EVERY === 0).map((e) => ({ iso: e.iso, ix: ix2, e })) : [])]
  .filter((s) => s.iso <= UNTIL).sort((a, b) => a.iso.localeCompare(b.iso));
if (!ONLY_ORACLE) {
  const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
  const eng = w.nations.findIndex((x) => x.name === 'England');
  createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  g = gs();
}
let first = true;
for (const s of snaps) {
  if (!ONLY_ORACLE) {
    const prev = new Date(Date.parse(s.iso) - 86400000).toISOString().slice(0, 10);
    let guard = 0;
    if (s.iso !== '2001-07-14') while ((g.date < prev || !g.dayDone || g.pendingFixture) && guard++ < 5000) {
      if (!g.userClub) { const offer = g.jobOffers.find((id) => g.clubs[id]?.manager === 0); if (offer) applyAction({ t: 'acceptJob', club: offer }); else for (const id of g.vacancies.slice(0, 3)) applyAction({ t: 'applyJob', club: id }); }
      const r = continueGame(); if (r?.match) quickPlayUserMatch();
    }
  }
  const o = oracle(loadDaySnap(s.ix, s.e));
  if (first) { console.log('oraklet club +0x64 pr. division:', JSON.stringify(o.b64)); first = false; }
  const u = ONLY_ORACLE ? null : ours();
  if (process.env.DUMP === s.iso) dump(loadDaySnap(s.ix, s.e));
  console.log(`${s.iso}  ` + TIERS.map((t) => `${t}: pl ${u ? u[t][1] : '-'}/${o[t][1]} mål ${u ? u[t][2] : '-'}/${o[t][2]} lejebud ${u ? u[t][3] : '-'}/${o[t][3]} købsbud ${u ? u[t][4] : '-'}/${o[t][4]} spl ${u ? u[t][5] : '-'}/${o[t][5]}`).join(' | '));
}

// DUMP=<billeddato>: pr. engelsk non-league-klub begge siders spillerpladser (gruppe, leje, +3/+7/+0xb, mål), omdømme +0x80, status +0x64
function dump(m: SparseMem): void {
  const C = m.u32(0xae23b4), nc = m.s32(0xae235c), ents = m.u32(m.u32(m.u32(0xde1f54) + 0x856) + 0xdc);
  const eng = g.nations.findIndex((x) => x.name === 'England');
  const byName = new Map(Object.values(g.clubs).filter((c) => c.nation === eng).map((c) => [c.name, c]));
  const fmt = (gr: number, loan: number, b3: number, b7: number, bb: number, f: number) => `${gr}${loan ? 'L' : ''}:${b3}/${b7}/${bb}${f > -1 ? '*' : ''}`;
  const sm = { o: 0, u: 0 };
  for (let ix = 0; ix < nc; ix++) {
    const a = C + 0x245 * ix;
    if (str(m, m.u32(a + 0x53) + 4, 51) !== 'England') continue;
    const dv = m.u32(a + 0x57); if (TIER[dv ? str(m, dv + 4, 51) : '']) continue;
    const name = str(m, a + 4, 51), c = byName.get(name);
    const base = m.u32(ents + 9 * ix), os: string[] = [];
    let ol = 0;
    if (base) for (let i = 0; i < 25; i++) { const q = base + 37 * i; if (m.u8(q) !== 0xb) continue; const b24 = m.u8(q + 0x24); if (b24 & 1) ol++; if (((b24 >> 1) & 0xf) === 0xf) continue; os.push(fmt((b24 >> 1) & 0xf, b24 & 1, m.s32(q + 3), m.s32(q + 7), m.s32(q + 0xb), m.s32(q + 0xf))); }
    const us: string[] = [];
    let ul = 0;
    if (c && g.cmPlan?.[c.id]) for (const q of entryOf(g, c.id).slots.slice(0, 25)) { if (q.role !== 0xb) continue; if (q.b24 & 1) ul++; if (((q.b24 >> 1) & 0xf) === 0xf) continue; us.push(fmt((q.b24 >> 1) & 0xf, q.b24 & 1, q.b3 ?? 0, q.b7 ?? 0, q.bb ?? 0, q.f)); }
    sm.o += ol; sm.u += ul;
    console.log(`${name.padEnd(28)} rep ${m.s16(a + 0x80)}/${c ? clubRepMem(g, c.id) : '-'} st ${m.u8(a + 0x64)}/${c ? (g.cmFin?.[c.id]?.status ?? g.cmClubStat?.[c.id]?.[0] ?? '?') : '-'} ent ${base ? m.u8(ents + 9 * ix + 4) : '-'}/${c ? g.cmPlan?.[c.id]?.st : '-'} leje ${ol}/${ul}\n   O ${os.join(' ')}\n   U ${us.join(' ')}`);
  }
  console.log('lejepladser i alt', sm);
}
