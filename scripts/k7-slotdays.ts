// K7: ønskelisternes spillerpladser dag for dag for de engelske klubber – oraklets dagsbilleder mod spillet (frø 1, Arsenal på ferie):
// postens tilstand +4 og tæller +8, pladserne med budget (+7 > 0) og deres mål (+0xf ≠ indehaver), budmærke +0x17, +0xb, +7, gruppe (+0x24).
// Én JSON-linje pr. klub og dag i OUT – analysen (nye mål, levetid, slutning, tællerens forløb) står i --report.
//   ONLY_ORACLE=1 OUT=<o.jsonl> npx tsx scripts/k7-slotdays.ts        WORLD=<world-dbs2.json> OUT=<u.jsonl> npx tsx scripts/k7-slotdays.ts
//   npx tsx scripts/k7-slotdays.ts --report <o.jsonl> <u.jsonl>
import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import type { SparseMem } from '../src/game/cmMem';
import type { WorldData } from '../src/game/newgame';

const FROM = process.env.FROM ?? '2001-07-14', TO = process.env.TO ?? '2001-10-31';
const TIER: Record<string, string> = { 'English Premier Division': 'P', 'English First Division': '1', 'English Second Division': '2', 'English Third Division': '3' };
const str = (m: SparseMem, a: number, n = 54) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
// en plads: [i, b7, f, h, bm, bb, b3, b24]
interface Row { d: string; c: string; g: string; rep: number; st: number; n8: number; sl: number[][] }

if (process.argv[2] === '--report') {
  const load = (f: string) => readFileSync(f, 'utf8').trim().split('\n').map((l) => JSON.parse(l) as Row);
  const O = load(process.argv[3]), U = load(process.argv[4]);
  const mon = (d: string) => d.slice(0, 7);
  const q = (a: number[], p: number) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(p * (s.length - 1))] : 0; };
  function an(rows: Row[]) {
    const byClub = new Map<string, Row[]>();
    for (const r of rows) (byClub.get(r.c) ?? byClub.set(r.c, []).get(r.c)!).push(r);
    const R: Record<string, Record<string, number[]>> = {};
    const put = (g: string, k: string, v: number) => ((R[g] ??= {})[k] ??= []).push(v);
    for (const [, rs] of byClub) {
      rs.sort((a, b) => a.d.localeCompare(b.d));
      let prev: Row | undefined;
      const live = new Map<string, { since: string; bid: boolean }>();
      for (const r of rs) {
        const g = r.g, M = mon(r.d);
        put(g, `dage ${M}`, 1);
        put(g, `åbne ${M}`, r.sl.filter((s) => s[1] > 0).length);
        put(g, `mål ${M}`, r.sl.filter((s) => s[2] >= 0 && s[2] !== s[3]).length);
        put(g, `+8 ${M}`, r.n8);
        put(g, `st${r.st} ${M}`, 1);
        if (prev) {
          if (r.n8 < prev.n8) put(g, `+8 faldt ${M}`, 1);
          const pm = new Map(prev.sl.map((s) => [s[0], s]));
          for (const s of r.sl) {
            const p = pm.get(s[0]);
            const tg = s[2] >= 0 && s[2] !== s[3];
            const ptg = p && p[2] >= 0 && p[2] !== p[3];
            if (tg && (!ptg || p![2] !== s[2])) { put(g, `nye mål ${M}`, 1); put(g, `nyt +0xb ${M}`, s[5]); put(g, `nyt +7 ${M}`, s[1]); live.set(`${s[0]}`, { since: r.d, bid: s[4] >= 0 }); }
            if (tg && s[4] >= 0 && p && p[4] < 0 && p[2] === s[2]) put(g, `budmærke sat ${M}`, 1);
            if (ptg && (!tg || p![2] !== s[2])) {
              const L = live.get(`${s[0]}`);
              put(g, `mål slut ${M}`, 1);
              put(g, `mål slut med bud ${M}`, p![4] >= 0 ? 1 : 0);
              if (L) put(g, `levetid ${M}`, (Date.parse(r.d) - Date.parse(L.since)) / 864e5);
              live.delete(`${s[0]}`);
            }
            if (p && p[1] <= 0 && s[1] > 0) put(g, `ny budget ${M}`, 1);
          }
        }
        prev = r;
      }
    }
    return R;
  }
  const a = an(O), b = an(U);
  for (const g of ['P', '1', '2', '3', 'NL']) {
    console.log(`\n### ${g}`);
    const ks = [...new Set([...Object.keys(a[g] ?? {}), ...Object.keys(b[g] ?? {})])].sort((x, y) => x.slice(-7).localeCompare(y.slice(-7)) || x.localeCompare(y));
    for (const k of ks) {
      const x = a[g]?.[k] ?? [], y = b[g]?.[k] ?? [];
      const sum = (v: number[]) => v.reduce((s, z) => s + z, 0);
      const isSum = /^(dage|nye mål|mål slut|st\d|budmærke|ny budget|\+8 faldt)/.test(k) && !/med bud/.test(k);
      if (isSum) console.log(`${k.padEnd(28)} O ${sum(x)}  V ${sum(y)}`);
      else console.log(`${k.padEnd(28)} O snit ${(sum(x) / (x.length || 1)).toFixed(2)} p50 ${q(x, 0.5)}  V snit ${(sum(y) / (y.length || 1)).toFixed(2)} p50 ${q(y, 0.5)}`);
    }
  }
  process.exit(0);
}

const OUT = process.env.OUT!;
writeFileSync(OUT, '');
if (process.env.ONLY_ORACLE) {
  const ix = readDaySnapIndex(process.env.DIR ?? DEFAULT_DAYSNAP)!;
  for (const e of ix.snaps.filter((x) => x.iso >= FROM && x.iso <= TO)) {
    const m = loadDaySnap(ix, e);
    const C = m.u32(0xae23b4), nc = m.s32(0xae235c);
    const grp = (cix: number) => { const a = C + 0x245 * cix; if (str(m, m.u32(a + 0x53) + 4) !== 'England') return 'X'; const dv = m.u32(a + 0x57); return TIER[dv ? str(m, dv + 4) : ''] ?? 'NL'; };
    const slm = m.u32(m.u32(0xde1f54) + 0x856), L: string[] = [];
    for (let cix = 0; cix < nc; cix++) {
      const g = grp(cix); if (g === 'X') continue;
      const ent = m.u32(slm + 0xdc) + 9 * cix, base = m.u32(ent); if (!base) continue;
      const sl: number[][] = [];
      for (let i = 0; i < 40; i++) {
        const s = base + 0x25 * i; if (m.u8(s) !== 0xb) continue;
        sl.push([i, m.s32(s + 7), m.s32(s + 0xf), m.s32(s + 0x13), m.s32(s + 0x17), m.s32(s + 0xb), m.s32(s + 3), m.u8(s + 0x24)]);
      }
      L.push(JSON.stringify({ d: e.iso, c: str(m, C + 0x245 * cix + 4), g, rep: m.s16(C + 0x245 * cix + 0x80), st: m.u8(ent + 4), n8: m.u8(ent + 8), sl } satisfies Row));
    }
    appendFileSync(OUT, L.join('\n') + '\n');
    (m as { release?: () => void }).release?.();
  }
} else {
  const { createGame } = await import('../src/game/newgame');
  const { continueGame, quickPlayUserMatch } = await import('../src/game/sim');
  const { gs } = await import('../src/game/state');
  const { fromRow } = await import('../src/game/cmSquadPlanGame');
  const w = JSON.parse(readFileSync(process.env.WORLD!, 'utf8')) as WorldData;
  const eng = w.nations.findIndex((x) => x.name === 'England');
  createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: w.clubs.find((c) => c[1] === 'Arsenal')![0], activeNations: [eng], lang: 'en', masking: true, seed: 1, mode: 'authentic' });
  let g = gs();
  const grp = (cid: number) => { const c = g.clubs[cid]; if (!c || c.nation !== eng) return 'X'; return TIER[g.comps[c.league]?.name ?? g.leagues[c.league]?.name ?? ''] ?? 'NL'; };
  for (;;) {
    const iso = g.date.slice(0, 10);
    if (iso >= FROM) {
      const L: string[] = [];
      for (const c of Object.values(g.clubs)) {
        const gr = grp(c.id); if (gr === 'X') continue;
        const st = g.cmPlan?.[c.id]; if (!st) continue;
        const sl: number[][] = [];
        st.s.map(fromRow).forEach((s, i) => { if (s.role === 0xb) sl.push([i, s.b7 ?? 0, s.f, s.s13, s.s17, s.bb ?? 0, s.b3 ?? 0, s.b24]); });
        L.push(JSON.stringify({ d: iso, c: c.name, g: gr, rep: g.cmClubRep?.[c.id] ?? 0, st: st.st, n8: st.c, sl } satisfies Row));
      }
      appendFileSync(OUT, L.join('\n') + '\n');
    }
    if (iso >= TO) break;
    const r = continueGame(); if (r?.match) quickPlayUserMatch(); g = gs();
  }
}
