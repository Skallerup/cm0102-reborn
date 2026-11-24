// K7: nye mål pr. dag på ønskelisterne (pladsens +0xf skifter til en ny spiller i en anden klub), efter køberens og målets gruppe – oraklets
// dagsbilleder mod spillet (frø 1, Arsenal på ferie), med pladsens +0xb, +7 og maske, da målet kom.
//   WORLD=<world-dbs2.json> TO=2001-08-31 npx tsx scripts/k7-newtargets.ts      (ONLY_ORACLE=1: kun oraklet)
import { readFileSync } from 'node:fs';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import { getContract, type SparseMem } from '../src/game/cmMem';
import type { WorldData } from '../src/game/newgame';

const FROM = process.env.FROM ?? '2001-07-14', TO = process.env.TO ?? '2001-08-31';
const TIER: Record<string, string> = { 'English Premier Division': 'P', 'English First Division': '1', 'English Second Division': '2', 'English Third Division': '3' };
const str = (m: SparseMem, a: number, n = 54) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
interface T { buyer: string; tg: string; bb: number; b7: number; mask: number; g: number }
const q = (a: number[], p: number) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(p * (s.length - 1))] : 0; };
function report(tag: string, ts: T[]) {
  console.log(`== ${tag}: ${ts.length} nye mål`);
  for (const b of ['P', '1', '2', '3', 'NL']) {
    const r = ts.filter((t) => t.buyer === b); if (!r.length) continue;
    const by: Record<string, number> = {}; for (const t of r) by[t.tg] = (by[t.tg] ?? 0) + 1;
    const gk = r.filter((t) => t.mask === 1).length;
    console.log(`  ${b}: ${r.length}  mål ${JSON.stringify(by)}  målmand ${gk}  +0xb p25/50/75 ${q(r.map((t) => t.bb), 0.25)}/${q(r.map((t) => t.bb), 0.5)}/${q(r.map((t) => t.bb), 0.75)}  +7 p50 ${q(r.map((t) => t.b7), 0.5)}  gruppe ${JSON.stringify(r.reduce((o, t) => ({ ...o, [t.g]: (o[t.g] ?? 0) + 1 }), {} as Record<number, number>))}`);
  }
}
{
  const ix = readDaySnapIndex(DEFAULT_DAYSNAP)!;
  const prev = new Map<string, number>(), out: T[] = [];
  for (const e of ix.snaps.filter((x) => x.iso >= FROM && x.iso <= TO)) {
    const m = loadDaySnap(ix, e);
    const C = m.u32(0xae23b4), nc = m.s32(0xae235c), St = m.u32(0xae23bc);
    const grp = (cix: number) => { if (cix < 0 || cix >= nc) return '-'; const a = C + 0x245 * cix; if (str(m, m.u32(a + 0x53) + 4) !== 'England') return 'X'; const dv = m.u32(a + 0x57); return TIER[dv ? str(m, dv + 4) : ''] ?? 'NL'; };
    const slm = m.u32(m.u32(0xde1f54) + 0x856);
    const wk = { built: 0, budget: 0, n: 0 };
    for (let cix = 0; cix < nc; cix++) {
      const bg = grp(cix); if (bg === 'X') continue;
      const base = m.u32(m.u32(slm + 0xdc) + 9 * cix); if (!base) continue;
      if (bg === 'NL') { wk.n++; let pl = 0, bu = 0; for (let i = 0; i < 40; i++) { const s = base + 0x25 * i; if (m.u8(s) === 0xb) { pl++; if (m.s32(s + 7) > 0) bu++; } } if (pl === 25) wk.built++; if (bu) wk.budget++; }
      for (let i = 0; i < 40; i++) {
        const s = base + 0x25 * i; if (m.u8(s) !== 0xb) continue;
        const f = m.s32(s + 0xf), h = m.s32(s + 0x13), key = `${cix}/${i}`;
        if (f < 0 || f === h) { prev.delete(key); continue; }
        if (prev.get(key) === f) continue;
        prev.set(key, f);
        if (e.iso === FROM) continue;
        const k = getContract(m, St + 0x6e * f);
        out.push({ buyer: bg, tg: k ? grp(m.s32(k + 4)) : '-', bb: m.s32(s + 0xb), b7: m.s32(s + 7), mask: m.u16(s + 1), g: (m.u8(s + 0x24) >> 1) & 0xf });
      }
    }
    if (new Date(e.iso).getUTCDay() === 6) console.log(`O ${e.iso} NL-klubber ${wk.n}: plan bygget ${wk.built}, med budget ${wk.budget}`);
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
  let g = gs();
  const grp = (cid: number) => { const c = g.clubs[cid]; if (!c) return '-'; if (c.nation !== eng) return 'X'; return TIER[g.comps[c.league]?.name ?? g.leagues[c.league]?.name ?? ''] ?? 'NL'; };
  const prev = new Map<string, number>(), out: T[] = [];
  for (;;) {
    const iso = g.date.slice(0, 10);
    const wk = { built: 0, budget: 0, n: 0 };
    for (const c of Object.values(g.clubs)) {
      const bg = grp(c.id); if (bg === 'X') continue;
      const st = g.cmPlan?.[c.id]; if (!st) continue;
      if (bg === 'NL') { wk.n++; const sl = st.s.map(fromRow); if (sl.filter((s) => s.role === 0xb).length === 25) wk.built++; if (sl.some((s) => s.role === 0xb && (s.b7 ?? 0) > 0)) wk.budget++; }
      st.s.map(fromRow).forEach((s, i) => {
        if (s.role !== 0xb) return;
        const key = `${c.id}/${i}`;
        if (s.f < 0 || s.f === s.s13) { prev.delete(key); return; }
        if (prev.get(key) === s.f) return;
        prev.set(key, s.f);
        if (iso === FROM) return;
        const p = g.players[s.f];
        out.push({ buyer: bg, tg: p?.club ? grp(p.club) : '-', bb: s.bb ?? 0, b7: s.b7 ?? 0, mask: s.mask, g: (s.b24 >> 1) & 0xf });
      });
    }
    if (new Date(iso).getUTCDay() === 6) console.log(`V ${iso} NL-klubber ${wk.n}: plan bygget ${wk.built}, med budget ${wk.budget}`);
    if (iso >= TO) break;
    const r = continueGame(); if (r?.match) quickPlayUserMatch(); g = gs();
  }
  report('VORES', out);
}
