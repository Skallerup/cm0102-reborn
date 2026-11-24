// K7: trupplanens spillerpladser (rolle 0xb) efter gruppe (+0x24) uge for uge – oraklets dagsbilleder mod spillet (frø 1, Arsenal på ferie):
// indehaveren (+0x13: CA, PA, alder), mål (+0xf), +3/+0xb. Skriver JSON til OUT (én række pr. plads og dato); analysen står til sidst.
//   WORLD=<world-dbs2.json> OUT=<fil.json> [DATES=2001-07-14,2001-08-04] [GROUPS=P] npx tsx scripts/k7-g5holders.ts
import { readFileSync, writeFileSync } from 'node:fs';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import type { SparseMem } from '../src/game/cmMem';
import type { WorldData } from '../src/game/newgame';

const DATES = (process.env.DATES ?? '2001-07-14,2001-07-28,2001-08-11,2001-08-25,2001-09-08,2001-09-29').split(',');
const TIER: Record<string, string> = { 'English Premier Division': 'P', 'English First Division': '1', 'English Second Division': '2', 'English Third Division': '3' };
const GROUPS = new Set((process.env.GROUPS ?? 'P').split(','));
const str = (m: SparseMem, a: number, n = 54) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
const yrs = (date: string, dob: string) => (Date.parse(date) - Date.parse(dob)) / (365.25 * 86400000);
const dayIso = (d: number, y: number) => (y > 1850 && y < 2100 ? new Date(Date.UTC(y, 0, 1 + d)).toISOString().slice(0, 10) : '');
export interface R { d: string; club: string; i: number; g: number; mask: number; b3: number; bb: number; tgt: boolean; h: string; ca: number; pa: number; age: number; hc: string; tc: string }
const out: { o: R[]; u: R[] } = { o: [], u: [] };
{
  const ix = readDaySnapIndex(DEFAULT_DAYSNAP)!;
  for (const d of DATES) {
    const e = ix.snaps.find((x) => x.iso === d); if (!e) continue;
    const m = loadDaySnap(ix, e);
    const C = m.u32(0xae23b4), nc = m.s32(0xae235c), St = m.u32(0xae23bc), nS = m.s32(0xae2364);
    const grp = (cix: number) => { const a = C + 0x245 * cix; if (str(m, m.u32(a + 0x53) + 4) !== 'England') return 'X'; const dv = m.u32(a + 0x57); return TIER[dv ? str(m, dv + 4) : ''] ?? 'NL'; };
    const who = (id: number) => {
      if (id < 0 || id >= nS) return { h: '-', ca: 0, pa: 0, age: 0, hc: '' };
      const st = St + 0x6e * id, pr = m.u32(st + 0x61);
      const dob = dayIso(m.s16(st + 0x10), m.u16(st + 0x12)) || `${m.s16(st + 0x18)}-07-01`;
      const cadr = m.u32(st + 0x39), cix = cadr ? (cadr - C) / 0x245 : -1;
      return { h: `${str(m, m.u32(st + 4))} ${str(m, m.u32(st + 8))}|${dob}`, ca: pr ? m.s16(pr + 5) : 0, pa: pr ? m.s16(pr + 7) : 0, age: yrs(d, dob), hc: cix >= 0 && cix < nc ? str(m, C + 0x245 * cix + 4) : '' };
    };
    const slm = m.u32(m.u32(0xde1f54) + 0x856);
    for (let cix = 0; cix < nc; cix++) {
      if (!GROUPS.has(grp(cix))) continue;
      const club = str(m, C + 0x245 * cix + 4);
      const base = m.u32(m.u32(slm + 0xdc) + 9 * cix); if (!base) continue;
      for (let i = 0; i < 40; i++) {
        const s = base + 0x25 * i; if (m.u8(s) !== 0xb) continue;
        const f = m.s32(s + 0xf), h = m.s32(s + 0x13), w = who(h);
        out.o.push({ d, club, i, g: (m.u8(s + 0x24) >> 1) & 0xf, mask: m.u16(s + 1), b3: m.s32(s + 3), bb: m.s32(s + 0xb), tgt: f >= 0 && f !== h, ...w, tc: f >= 0 && f !== h ? who(f).hc : '' });
      }
    }
  }
}
{
  const { createGame } = await import('../src/game/newgame');
  const { continueGame, quickPlayUserMatch } = await import('../src/game/sim');
  const { gs } = await import('../src/game/state');
  const { fromRow } = await import('../src/game/cmSquadPlanGame');
  const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
  const eng = w.nations.findIndex((x) => x.name === 'England');
  createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  let g = gs();
  const grp = (cid: number) => { const c = g.clubs[cid]; if (!c) return '-'; if (c.nation !== eng) return 'X'; return TIER[g.comps[c.league]?.name ?? g.leagues[c.league]?.name ?? ''] ?? 'NL'; };
  const last = DATES[DATES.length - 1];
  for (;;) {
    const d = g.date.slice(0, 10);
    if (DATES.includes(d)) {
      const who = (id: number) => { const p = g.players[id]; return p ? { h: `${p.first} ${p.last}|${p.dob}`, ca: p.ca, pa: p.pa, age: yrs(d, p.dob), hc: p.club ? g.clubs[p.club]?.name ?? '' : '' } : { h: '-', ca: 0, pa: 0, age: 0, hc: '' }; };
      for (const c of Object.values(g.clubs)) {
        if (!GROUPS.has(grp(c.id))) continue;
        const st = g.cmPlan?.[c.id]; if (!st) continue;
        st.s.map(fromRow).forEach((s, i) => {
          if (s.role !== 0xb) return;
          const tgt = s.f >= 0 && s.f !== s.s13;
          out.u.push({ d, club: c.name, i, g: (s.b24 >> 1) & 0xf, mask: s.mask, b3: s.b3 ?? 0, bb: s.bb ?? 0, tgt, ...who(s.s13), tc: tgt ? who(s.f).hc : '' });
        });
      }
    }
    if (d >= last) break;
    const r = continueGame(); if (r?.match) quickPlayUserMatch(); g = gs();
  }
}
writeFileSync(process.env.OUT!, JSON.stringify(out));
console.log(`skrev ${process.env.OUT}: orakel ${out.o.length}, vores ${out.u.length} rækker`);
