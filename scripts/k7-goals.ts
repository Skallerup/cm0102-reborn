// K7c #6: mål pr. kamp i de engelske divisioner – kommer afvigelsen fra holdenes styrker eller fra kampene?
// Oraklet: kampprogrammernes resultater (fixtures_<år>.tmp i daysnap-kørslernes files/, 79 bytes pr. kamp: +0 turnering, +12/+16 hjemme-/udeklub-id,
// +40 år, +42 dag, +67/+68 mål) + holdenes styrke fra dagsbillederne (gns. CA for klubbens 11 bedste, hver 14. dag). Vores side: samme opsætning
// som k7-seasons.ts (frø SEED, Arsenal på ferie, world med CM_DBSIZE=2), resultaterne fra g.fixtures og styrken på de samme datoer.
//   WORLD=<world-dbs2.json> JSON=<ud.json> node scripts/measure.mjs -- npx tsx scripts/k7-goals.ts [sæsoner = 1] [frø = 1]
//   ONLY_ORACLE=1: kun oraklets side.  CMP=<a.json,b.json,…>: udskriv kun tabellen fra gemte kørsler (ingen simulering).
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { DEFAULT_DAYSNAP, loadDaySnap, readDaySnapIndex } from './oracle-days';
import type { SparseMem } from '../src/game/cmMem';

const E = `${homedir()}/cm0102-engine`;
const Y23 = process.env.Y23 ?? `${E}/oracle/daysnap/s1-3.9.60-y23-e14`;
// argumenterne [sæsoner] [frø] går foran miljøet (measure.mjs' genbrug ser på kommandolinjen, ikke miljøet)
const SEASONS = Number(process.argv[2] ?? process.env.SEASONS ?? 1);
const SEED = Number(process.argv[3] ?? process.env.SEED ?? 1);
const DIVS = ['English Premier Division', 'English First Division', 'English Second Division', 'English Third Division'];
const COMP: Record<number, string> = { 7: DIVS[0], 8: DIVS[1], 9: DIVS[2], 10: DIVS[3] };
const seasonOf = (iso: string) => (+iso.slice(5, 7) >= 7 ? +iso.slice(0, 4) : +iso.slice(0, 4) - 1);

interface M { s: number; div: string; date: string; h: string; a: string; hg: number; ag: number }
interface Side { label: string; matches: M[]; str: Record<string, Record<string, number[]>>; cond?: Record<string, number[][]>; endCond?: Record<string, number[]>; shots?: Record<string, number[][]> }   // shots[sæson|div] = [skud, på mål, mål] pr. hold pr. kamp   // endCond[sæson|div] = konditionen ved slutfløjt (%) for 24–32-årige, der spillede hele kampen   // cond[sæson|div] = [Fitness, kampkondition, moral, skadet] for klubbens 14 bedste   // str[sæson|div][klub] = styrkeprøver

// ------------------------------------------------------------------ oraklet
const strOf = (m: SparseMem, a: number, n = 60) => { let s = ''; if (!a) return s; for (let i = 0; i < n; i++) { const c = m.u8(a + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
function oracleStrength(m: SparseMem, iso: string, side: Side, idName: Map<number, string>) {
  const S = m.u32(0xae23bc), n = m.s32(0xae2364), C = m.u32(0xae23b4), nc = m.s32(0xae235c);
  const cas = new Map<number, number[]>(), pl = new Map<number, number[][]>();
  const injBase = m.u32(0xb63d28) ? m.u32(m.u32(0xb63d28)) : 0;
  for (let id = 0; id < n; id++) {
    const st = S + 0x6e * id, pr = m.u32(st + 0x61);
    if (!pr || m.u8(st + 0x3d) === 16) continue;
    const cadr = m.u32(st + 0x39); if (!cadr) continue;
    const ix = (cadr - C) / 0x245; (cas.get(ix) ?? cas.set(ix, []).get(ix)!).push(m.s16(pr + 5));
    const rec = injBase ? injBase + 31 * id : 0;
    const gap = (Date.parse(iso) - Date.UTC(m.u16(rec + 2), 0, 1 + m.s16(rec))) / 864e5;
    if (rec) (pl.get(ix) ?? pl.set(ix, []).get(ix)!).push([m.s16(pr + 5), m.u16(rec + 8), m.u16(rec + 0xa), m.s8(pr + 0x45), m.s32(rec + 0xe) !== -1 ? 1 : 0, gap, m.s16(rec + 0xc)]);
  }
  for (let ix = 0; ix < nc; ix++) {
    const adr = C + 0x245 * ix, name = strOf(m, adr + 4, 51);
    idName.set(m.s32(adr), name);
    const dv = m.u32(adr + 0x57), div = dv ? strOf(m, dv + 4, 51) : '';
    if (!DIVS.includes(div)) continue;
    addStr(side, seasonOf(iso), div, name, cas.get(ix) ?? []);
    addCond(side, seasonOf(iso), div, pl.get(ix) ?? []);
  }
}
/** klubbens 14 bedste (CA) – gns. Fitness, kampkondition, moral, andel skadede */
function addCond(side: Side, s: number, div: string, ps: number[][]) {
  const top = [...ps].sort((a, b) => b[0] - a[0]).slice(0, 14);
  ((side.cond ??= {})[`${s}|${div}`] ??= []).push(...top.map((x) => x.slice(1)));
}
const top11 = (xs: number[]) => { const s = [...xs].sort((a, b) => b - a).slice(0, 11); return s.reduce((t, x) => t + x, 0) / Math.max(1, s.length); };
function addStr(side: Side, s: number, div: string, club: string, cas: number[]) {
  const k = `${s}|${div}`; const d = (side.str[k] ??= {}); (d[club] ??= []).push(top11(cas));
}
function oracleSide(): Side {
  const side: Side = { label: 'oraklet', matches: [], str: {} };
  const idName = new Map<number, string>();
  const ix1 = readDaySnapIndex(DEFAULT_DAYSNAP)!, ix2 = readDaySnapIndex(Y23);
  const t0 = Date.parse('2001-07-14');
  const es = [...ix1.snaps.filter((e) => ((Date.parse(e.iso) - t0) / 864e5) % 14 === 0).map((e) => [ix1, e] as const),
    ...(ix2 ? ix2.snaps.map((e) => [ix2, e] as const) : [])].filter(([, e]) => seasonOf(e.iso) < 2001 + SEASONS && true);
  for (const [ix, e] of es) {
    const mo = +e.iso.slice(5, 7); if (mo === 7) continue;             // august → maj (styrken i ligasæsonen)
    oracleStrength(loadDaySnap(ix, e), e.iso, side, idName);
  }
  const seen = new Set<string>();
  for (const dir of [DEFAULT_DAYSNAP, Y23]) {
    const files = join(dir, 'files'); if (!existsSync(files)) continue;
    for (const f of readdirSync(files).filter((x) => /^fixtures_\d{4}\.tmp$/.test(x))) {
      const b = readFileSync(join(files, f)), v = new DataView(b.buffer, b.byteOffset, b.byteLength), n = v.getInt32(0, true);
      for (let k = 0; k < n && 4 + (k + 1) * 79 <= b.byteLength; k++) {
        const o = 4 + k * 79, div = COMP[v.getInt32(o, true)]; if (!div) continue;
        const hg = v.getUint8(o + 67), ag = v.getUint8(o + 68); if (hg === 0xff || ag === 0xff) continue;
        const date = new Date(Date.UTC(v.getUint16(o + 40, true), 0, 1) + v.getUint16(o + 42, true) * 864e5).toISOString().slice(0, 10);
        const s = seasonOf(date); if (s >= 2001 + SEASONS) continue;
        const h = idName.get(v.getInt32(o + 12, true)) ?? String(v.getInt32(o + 12, true)), a = idName.get(v.getInt32(o + 16, true)) ?? String(v.getInt32(o + 16, true));
        const key = `${date}|${h}|${a}`; if (seen.has(key)) continue; seen.add(key);
        side.matches.push({ s, div, date, h, a, hg, ag });
      }
    }
  }
  // slutkonditionen i oraklets kampstatistik (match_stats_matches.tmp, 3450 bytes pr. kamp; spillerblokkene H+0x74, 73 bytes: +0x16 fødselsår,
  // +0x1d position (0xfe skadet ud, 0xfd udvist, 0xff ikke brugt), +0x20 kondition til sidst, +0x30 minut skiftet ud) – kun de detaljerede
  const fxComp = new Map<string, [string, string]>();
  for (const dir of [DEFAULT_DAYSNAP, Y23]) {
    const files = join(dir, 'files'); if (!existsSync(files)) continue;
    for (const f of readdirSync(files).filter((x) => /^fixtures_\d{4}\.tmp$/.test(x))) {
      const b = readFileSync(join(files, f)), v = new DataView(b.buffer, b.byteOffset, b.byteLength), n = v.getInt32(0, true);
      for (let k = 0; k < n && 4 + (k + 1) * 79 <= b.byteLength; k++) {
        const o = 4 + k * 79, div = COMP[v.getInt32(o, true)]; if (!div) continue;
        const date = new Date(Date.UTC(v.getUint16(o + 40, true), 0, 1) + v.getUint16(o + 42, true) * 864e5).toISOString().slice(0, 10);
        fxComp.set(`${v.getUint16(o + 40, true)}|${v.getUint16(o + 42, true)}|${v.getInt32(o + 12, true)}|${v.getInt32(o + 16, true)}`, [div, date]);
      }
    }
    const msf = join(files, 'match_stats_matches.tmp'); if (!existsSync(msf)) continue;
    const b = readFileSync(msf);
    for (let o0 = 0; o0 + 17250000 <= b.byteLength + 17250000 && o0 < b.byteLength; o0 += 17250000) for (let i = 0; i < 5000; i++) {
      const o = o0 + i * 3450; if (o + 3450 > b.byteLength) break;
      const year = b.readUInt16LE(o + 10); if (!year) break;
      const hit = fxComp.get(`${year}|${b.readUInt16LE(o + 8)}|${b.readInt32LE(o)}|${b.readInt32LE(o + 4)}`); if (!hit) continue;
      const [div, date] = hit, s = seasonOf(date); if (s >= 2001 + SEASONS) continue;
      for (let t = 0; t < 2; t++) { const H = o + 0x11c + t * 1573; ((side.shots ??= {})[`${s}|${div}`] ??= []).push([b[H + 0x0b], b[H + 0x0c], b[H + 3]]); }
      for (let t = 0; t < 2; t++) for (let k = 0; k < 11; k++) {
        const q = o + 0x11c + t * 1573 + 0x74 + k * 73, pos = b[q + 0x1d];
        if (pos >= 0xfd || b[q + 0x30] !== 0xff) continue;
        const age = +date.slice(0, 4) - b.readUInt16LE(q + 0x16); if (age < 25 || age > 32) continue;
        ((side.endCond ??= {})[`${s}|${div}`] ??= []).push(b[q + 0x20]);
      }
    }
  }
  return side;
}

// ------------------------------------------------------------------ vores spil
async function ourSide(): Promise<Side> {
  const { createGame } = await import('../src/game/newgame');
  const { continueGame, quickPlayUserMatch } = await import('../src/game/sim');
  const { gs } = await import('../src/game/state');
  const { getGridFactory, setGridFactory } = await import('../src/game/engine/liveSim');
  type LS = ReturnType<NonNullable<ReturnType<typeof getGridFactory>>>;
  const live = new Map<number, LS>();
  let wrapped = false;
  const wrap = () => { const f0 = getGridFactory(); if (!f0 || wrapped) return; wrapped = true; setGridFactory((h, a, o, r) => { const x = f0(h, a, o, r); if (o.fixtureId !== undefined) live.set(o.fixtureId, x); return x; }); };
  const side: Side = { label: `frø ${SEED}`, matches: [], str: {} };
  const w = JSON.parse(readFileSync(process.env.WORLD ?? 'public/data/world-original.json', 'utf8'));
  const eng = w.nations.findIndex((x: { name: string }) => x.name === 'England');
  const user = w.clubs.find((c: unknown[]) => c[1] === 'Arsenal')[0];
  createGame(w, { managerName: 'Test Smoke', managerNation: eng, clubId: user, activeNations: [eng], lang: 'en', masking: true, seed: SEED, mode: 'authentic' });
  const g = gs();
  const seen = new Set<string>();
  const end = process.env.END ?? `${2001 + SEASONS}-06-30`;
  let next = Date.parse('2001-07-28'); const t0 = Date.now();   // 14/7 + 14
  const harvest = () => {
    for (const f of Object.values(g.fixtures)) {
      const div = COMP[Number(/^CM(\d+)$/.exec(f.comp)?.[1])]; if (!div || !f.result) continue;
      const h = g.clubs[f.home]?.name ?? '', a = g.clubs[f.away]?.name ?? '', key = `${f.date}|${h}|${a}`;
      if (seen.has(key)) continue; seen.add(key);
      side.matches.push({ s: seasonOf(f.date), div, date: f.date, h, a, hg: f.result.hg, ag: f.result.ag });
      const ls = live.get(f.id);
      if (ls) { for (const t of ls.teams) ((side.shots ??= {})[`${seasonOf(f.date)}|${div}`] ??= []).push([t.stats.shots, t.stats.onTarget, t.stats.goals]); }
    }
  };
  let guard = 0;
  while (g.date < end && guard++ < 100000) {
    // billederne tages på lørdage (14/7 + 14·k) «pre 0x4c7ac0(dato, 2, 1)» – efter dagens kampe (MATCH_DAY kører før 0x4c7ac0 på hvert
    // tidspunkt, notes/calendar-prerun.md): vi måler, når lørdagen er færdigspillet
    const day = new Date(next).toISOString().slice(0, 10);
    if (g.date >= day && g.dayDone && !g.pendingFixture) {
      const iso = new Date(next).toISOString().slice(0, 10), mo = +iso.slice(5, 7);
      next += 14 * 864e5;
      if (mo !== 7) {
        const cas = new Map<number, number[]>(), pl = new Map<number, number[][]>();
        for (const p of Object.values(g.players)) if (!p.virtual && p.club) {
          (cas.get(p.club) ?? cas.set(p.club, []).get(p.club)!).push(p.ca);
          if (p.cmFit) (pl.get(p.club) ?? pl.set(p.club, []).get(p.club)!).push([p.ca, p.cmFit.f, p.cmFit.mc, Math.round(p.morale), p.cmFit.inj ? 1 : 0, Date.parse(iso) / 864e5 - p.cmFit.d, p.cmFit.fat]);
        }
        for (const c of Object.values(g.clubs)) {
          if (c.nation !== eng) continue;
          const div = g.comps[c.league]?.name ?? ''; if (!DIVS.includes(div)) continue;
          addStr(side, seasonOf(iso), div, c.name, cas.get(c.id) ?? []);
          addCond(side, seasonOf(iso), div, pl.get(c.id) ?? []);
        }
      }
      console.log(`  ${iso}: ${side.matches.length} ligakampe (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    }
    // slutkonditionen: 0x62c080 sætter kampkonditionen = konditionen ved slutfløjt og trætheden += (10000 − den)/100 + minutterne
    // (24–32-årige: ingen faktor) – minutterne = Δtræthed + dagens restitution (≤ 13) − (10000 − mc)/100
    const today = g.date, pre = new Map<number, [number, number, string]>();
    const playing = new Map<number, string>();
    const tomorrow = new Date(Date.parse(today) + 864e5).toISOString().slice(0, 10);   // dayDone: continueGame går først til næste dag
    for (const f of Object.values(g.fixtures)) if ((f.date === today || f.date === tomorrow) && !f.result) { const dv = COMP[Number(/^CM(\d+)$/.exec(f.comp)?.[1])]; if (dv) { playing.set(f.home, dv); playing.set(f.away, dv); } }
    if (playing.size) for (const p of Object.values(g.players)) {
      const dv = playing.get(p.club); if (!dv || !p.cmFit) continue;
      const age = (Date.parse(today) - Date.parse(p.dob)) / (365.25 * 864e5); if (age < 24 || age >= 33) continue;
      pre.set(p.id, [p.cmFit.fat, p.cmFit.mc, dv]);
    }
    wrap();
    const r = continueGame(); if (r?.match) quickPlayUserMatch();
    harvest(); live.clear();
    for (const [id, [fat0, , dv]] of pre) {
      const p = g.players[id]; if (!p?.cmFit) continue;
      const mins = p.cmFit.fat - fat0 - (10000 - p.cmFit.mc) / 100;
      // 90 minutter − restitutionen 13 = 77
      if (mins >= 75 && mins <= 100 && !p.cmFit.inj) ((side.endCond ??= {})[`${seasonOf(today)}|${dv}`] ??= []).push(Math.round(p.cmFit.mc / 100));
    }
  }
  return side;
}

// ------------------------------------------------------------------ tabellen
const mean = (xs: number[]) => (xs.length ? xs.reduce((t, x) => t + x, 0) / xs.length : NaN);
const sd = (xs: number[]) => { const m = mean(xs); return Math.sqrt(mean(xs.map((x) => (x - m) ** 2))); };
function stats(side: Side, s: number, div: string) {
  const ms = side.matches.filter((m) => m.s === s && m.div === div);
  const str = side.str[`${s}|${div}`] ?? {};
  const inDiv = new Set(ms.flatMap((m) => [m.h, m.a]));   // billedet 30/6 har allerede næste sæsons divisioner
  const st = Object.fromEntries(Object.entries(str).filter(([c]) => inDiv.has(c)).map(([c, xs]) => [c, mean(xs)]));
  const vals = Object.values(st), mu = mean(vals);
  const n = ms.length;
  const out: Record<string, number> = {
    kampe: n, 'mål/kamp': mean(ms.map((m) => m.hg + m.ag)), hjemmemål: mean(ms.map((m) => m.hg)), udemål: mean(ms.map((m) => m.ag)),
    'H %': 100 * ms.filter((m) => m.hg > m.ag).length / n, 'U %': 100 * ms.filter((m) => m.hg === m.ag).length / n, 'B %': 100 * ms.filter((m) => m.hg < m.ag).length / n,
    '0–0 %': 100 * ms.filter((m) => m.hg + m.ag === 0).length / n, '≥5 mål %': 100 * ms.filter((m) => m.hg + m.ag >= 5).length / n,
    'styrke gns.': mu, 'styrke sd': sd(vals),
  };
  // mål pr. kamp efter styrkeforskel |hjemme − ude| (top-11 CA) og efter samlet styrke
  const sOf = (c: string) => st[c];
  const withS = ms.filter((m) => sOf(m.h) !== undefined && sOf(m.a) !== undefined);
  const dif = withS.map((m) => Math.abs(sOf(m.h) - sOf(m.a)));
  const cut = [...dif].sort((a, b) => a - b)[Math.floor(dif.length / 2)];
  out['mål/kamp lige hold'] = mean(withS.filter((m, i) => dif[i] <= cut).map((m) => m.hg + m.ag));
  out['mål/kamp skæve hold'] = mean(withS.filter((m, i) => dif[i] > cut).map((m) => m.hg + m.ag));
  // regression: målforskel pr. kamp (hjemme − ude) mod styrkeforskellen; mål for/imod pr. kamp mod egen styrke − snit
  const xs = withS.map((m) => sOf(m.h) - sOf(m.a)), ys = withS.map((m) => m.hg - m.ag);
  const mx = mean(xs), my = mean(ys);
  out['hældning mf/styrke'] = xs.reduce((t, x, i) => t + (x - mx) * (ys[i] - my), 0) / xs.reduce((t, x) => t + (x - mx) ** 2, 0);
  // top-3 / bund-3 efter styrke: mål for/imod pr. kamp
  const clubs = Object.keys(st).sort((a, b) => st[b] - st[a]);
  const per = (cs: string[], f: boolean) => mean(cs.map((c) => { const mm = ms.filter((m) => m.h === c || m.a === c); return mean(mm.map((m) => (m.h === c) === f ? m.hg : m.ag)); }));
  out['top3 styrke'] = mean(clubs.slice(0, 3).map((c) => st[c])); out['top3 mål for'] = per(clubs.slice(0, 3), true); out['top3 mål imod'] = per(clubs.slice(0, 3), false);
  out['bund3 styrke'] = mean(clubs.slice(-3).map((c) => st[c])); out['bund3 mål for'] = per(clubs.slice(-3), true); out['bund3 mål imod'] = per(clubs.slice(-3), false);
  // tabellens top/bund
  const pts = new Map<string, { p: number; gf: number; ga: number; n: number }>();
  for (const m of ms) for (const [c, f, a] of [[m.h, m.hg, m.ag], [m.a, m.ag, m.hg]] as const) {
    const r = pts.get(c) ?? { p: 0, gf: 0, ga: 0, n: 0 }; r.n++; r.gf += f; r.ga += a; r.p += f > a ? 3 : f === a ? 1 : 0; pts.set(c, r);
  }
  const tab = [...pts.values()].sort((a, b) => b.p - a.p || (b.gf - b.ga) - (a.gf - a.ga));
  out['mester point'] = tab[0]?.p ?? NaN; out['mester mål for'] = tab[0]?.gf ?? NaN; out['nr. 1-3 mf/kamp'] = mean(tab.slice(0, 3).map((r) => (r.gf - r.ga) / r.n));
  const cd = side.cond?.[`${s}|${div}`] ?? [];
  out['Fitness (14 bedste)'] = mean(cd.map((x) => x[0])); out['kampkondition'] = mean(cd.map((x) => x[1])); out['moral'] = mean(cd.map((x) => x[2])); out['skadet %'] = 100 * mean(cd.map((x) => x[3]));
  // kampkonditionen bragt op til i dag (0x62cd1e for en rask spiller i sæsonen: +500 pr. dag, rate efter trætheden +0xc)
  const fit = cd.filter((x) => !x[3] && x[4] !== undefined);
  const now = (x: number[]) => { const rate = x[5] > 1000 ? Math.min(1, 1.4 - x[5] * 0.0004) : 1; return Math.min(10000, x[1] + Math.trunc(500 * x[4] * rate)); };
  out['dage siden opdatering'] = mean(fit.map((x) => x[4])); out['kampkondition i dag'] = mean(fit.map(now)); out['træthed +0xc'] = mean(fit.map((x) => x[5]));
  out['kampkond. i dag < 9000 %'] = 100 * mean(fit.map((x) => (now(x) < 9000 ? 1 : 0)));
  const ec = side.endCond?.[`${s}|${div}`] ?? [];
  out['slutkondition hele kampen (n)'] = ec.length; out['slutkondition gns. %'] = mean(ec); out['slutkondition < 80 %'] = 100 * mean(ec.map((x) => (x < 80 ? 1 : 0)));
  const sh = side.shots?.[`${s}|${div}`] ?? [];
  out['skud pr. hold (n)'] = sh.length; out['skud pr. hold'] = mean(sh.map((x) => x[0])); out['på mål pr. hold'] = mean(sh.map((x) => x[1]));
  out['mål pr. skud på mål'] = sh.reduce((t, x) => t + x[2], 0) / sh.reduce((t, x) => t + x[1], 0); out['mål pr. hold (disse kampe)'] = mean(sh.map((x) => x[2]));
  out['sidste 3 mf/kamp'] = mean(tab.slice(-3).map((r) => (r.gf - r.ga) / r.n)); out['point sd'] = sd(tab.map((r) => r.p / r.n));
  return out;
}
function report(sides: Side[]) {
  const lines: string[] = [];
  for (let s = 2001; s < 2001 + SEASONS; s++) for (const div of DIVS) {
    const rows = sides.map((x) => stats(x, s, div));
    lines.push(`\n### ${s}/${String(s + 1).slice(2)} ${div}\n| mål | ${sides.map((x) => x.label).join(' | ')} |\n|---|${sides.map(() => '---|').join('')}`);
    for (const k of Object.keys(rows[0])) lines.push(`| ${k} | ${rows.map((r) => (Number.isFinite(r[k]) ? (Math.abs(r[k]) >= 100 ? r[k].toFixed(0) : r[k].toFixed(2)) : '–')).join(' | ')} |`);
  }
  return lines.join('\n');
}

async function main() {
  if (process.env.CMP) {
    const sides = process.env.CMP.split(',').flatMap((f) => JSON.parse(readFileSync(f, 'utf8')) as Side[]);
    console.log(report(sides)); return;
  }
  const sides: Side[] = [];
  if (!process.env.ONLY_ORACLE) sides.push(await ourSide());
  sides.push(oracleSide());
  if (process.env.JSON) writeFileSync(process.env.JSON, JSON.stringify(sides));
  console.log(report(sides));
}
main();
