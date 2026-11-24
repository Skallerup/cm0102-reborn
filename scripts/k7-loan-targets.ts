// K7 leje: nye mål på ønskelisternes LEJEPLADSER (rolle 0xb, +0x24 bit 0) pr. dag – køberens og målets gruppe, målets alder, og hvor længe
// målet bliver på pladsen (dage, til +0xf skifter/ryddes). Oraklets dagsbilleder (s1-3.9.60-e1) mod spillet (frø 1, Arsenal på ferie).
// Modstykke til scripts/k7-newtargets.ts (alle pladser).
//   WORLD=<world-dbs2.json> [FROM=2001-07-14] [TO=2002-03-31] [ONLY_ORACLE=1] npx tsx scripts/k7-loan-targets.ts
import { readFileSync } from 'node:fs';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import { getContract, type SparseMem } from '../src/game/cmMem';
import type { WorldData } from '../src/game/newgame';

const FROM = process.env.FROM ?? '2001-07-14', TO = process.env.TO ?? '2002-03-31';
const TIER: Record<string, string> = { 'English Premier Division': 'P', 'English First Division': '1', 'English Second Division': '2', 'English Third Division': '3' };
const str = (m: SparseMem, a: number, n = 54) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const yrs = (date: string, dob: string) => (Date.parse(date) - Date.parse(dob)) / (365.25 * 86400000);
const ageB = (a: number) => (a < 19 ? '<19' : a < 21 ? '19-20' : a < 24 ? '21-23' : a < 28 ? '24-27' : '28+');
const days = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
interface T { buyer: string; tg: string; age: string; dur: number }
function report(tag: string, ts: T[]) {
  console.log(`== ${tag}: ${ts.length} nye lejemål`);
  const cnt = (f: (t: T) => string, r: T[]) => JSON.stringify(Object.fromEntries(Object.entries(r.reduce((o, t) => ({ ...o, [f(t)]: (o[f(t)] ?? 0) + 1 }), {} as Record<string, number>)).sort()));
  for (const b of ['P', '1', '2', '3', 'NL']) {
    const r = ts.filter((t) => t.buyer === b); if (!r.length) continue;
    const d = r.map((t) => t.dur).sort((x, y) => x - y);
    console.log(`  ${b}: ${r.length}  mål ${cnt((t) => t.tg, r)}  alder ${cnt((t) => t.age, r)}  varighed p25/50/75 ${d[d.length >> 2]}/${d[d.length >> 1]}/${d[(3 * d.length) >> 2]}`);
  }
}
type Cur = Map<string, { f: number; since: string; t: T }>;
function step(iso: string, cur: Cur, seen: Set<string>, out: T[], key: string, f: number, mk: () => T) {
  seen.add(key);
  const c = cur.get(key);
  if (c && c.f === f) return;
  if (c) { c.t.dur = days(c.since, iso); cur.delete(key); }
  if (f < 0) return;
  const t = mk(); t.dur = -1; cur.set(key, { f, since: iso, t });
  if (iso !== FROM) out.push(t);
}
const close = (iso: string, cur: Cur, seen: Set<string>) => { for (const [k, c] of cur) if (!seen.has(k)) { c.t.dur = days(c.since, iso); cur.delete(k); } };
{
  const ix = readDaySnapIndex(DEFAULT_DAYSNAP)!;
  const cur: Cur = new Map(), out: T[] = [];
  for (const e of ix.snaps.filter((x) => x.iso >= FROM && x.iso <= TO)) {
    const m = loadDaySnap(ix, e);
    const C = m.u32(0xae23b4), nc = m.s32(0xae235c), St = m.u32(0xae23bc);
    const grp = (cix: number) => { if (cix < 0 || cix >= nc) return '-'; const a = C + 0x245 * cix; if (str(m, m.u32(a + 0x53) + 4) !== 'England') return 'X'; const dv = m.u32(a + 0x57); return TIER[dv ? str(m, dv + 4) : ''] ?? 'NL'; };
    const slm = m.u32(m.u32(0xde1f54) + 0x856), seen = new Set<string>();
    for (let cix = 0; cix < nc; cix++) {
      const bg = grp(cix); if (bg === 'X') continue;
      const base = m.u32(m.u32(slm + 0xdc) + 9 * cix); if (!base) continue;
      for (let i = 0; i < 40; i++) {
        const s = base + 0x25 * i; if (m.u8(s) !== 0xb || !(m.u8(s + 0x24) & 1)) continue;
        const f = m.s32(s + 0xf), h = m.s32(s + 0x13);
        step(e.iso, cur, seen, out, `${cix}/${i}`, f === h ? -1 : f, () => {
          const st = St + 0x6e * f, k = getContract(m, st);
          const dob = new Date(Date.UTC(m.s16(st + 0x12), 0, 1 + m.s16(st + 0x10))).toISOString().slice(0, 10);
          return { buyer: bg, tg: k ? grp(m.s32(k + 4)) : '-', age: ageB(yrs(e.iso, dob)), dur: -1 };
        });
      }
    }
    close(e.iso, cur, seen);
  }
  report('ORAKLET', out);
}
if (!process.env.ONLY_ORACLE) {
  const { createGame } = await import('../src/game/newgame');
  const { continueGame, quickPlayUserMatch } = await import('../src/game/sim');
  const { gs } = await import('../src/game/state');
  const { fromRow } = await import('../src/game/cmSquadPlanGame');
  const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
  const eng = w.nations.findIndex((x) => x.name === 'England');
  createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  gs().manager.holiday = {};
  let g = gs();
  const grp = (cid: number) => { const c = g.clubs[cid]; if (!c) return '-'; if (c.nation !== eng) return 'X'; return TIER[g.comps[c.league]?.name ?? g.leagues[c.league]?.name ?? ''] ?? 'NL'; };
  const cur: Cur = new Map(), out: T[] = [];
  for (;;) {
    const iso = g.date.slice(0, 10), seen = new Set<string>();
    for (const c of Object.values(g.clubs)) {
      const bg = grp(c.id); if (bg === 'X') continue;
      const st = g.cmPlan?.[c.id]; if (!st) continue;
      st.s.map(fromRow).forEach((s, i) => {
        if (s.role !== 0xb || !(s.b24 & 1)) return;
        step(iso, cur, seen, out, `${c.id}/${i}`, s.f === s.s13 ? -1 : s.f, () => {
          const p = g.players[s.f];
          // målets klub i hukommelsen = hovedkontraktens (en udlejet: moderklubben)
          const home = p?.loan?.from ?? p?.club;
          return { buyer: bg, tg: home ? grp(home) : '-', age: p ? ageB(yrs(iso, p.dob)) : '?', dur: -1 };
        });
      });
    }
    close(iso, cur, seen);
    if (iso >= TO) break;
    const r = continueGame(); if (r?.match) quickPlayUserMatch(); g = gs();
  }
  report('VORES', out);
}
