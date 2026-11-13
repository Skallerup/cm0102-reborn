// Turneringens historik som i CM 01/02 ("FA Premier League History"): rekorder pr. sæson og for alle tider.
// En sæsons tal regnes af de spillede kampe (g.fixtures) og spillernes sæsonstatistik. Kampprogrammet ryddes hver
// sommer, så `storeCompRecords` gemmer sæsonen i `g.compRecs` lige før statistikken nulstilles (kun ligaer/pokaler i
// menneskeklubbernes lande og turneringer med en menneskeklub – ellers vokser gemte spil for meget).
import { ageOn } from './dates';
import { gs } from './state';
import type { Competition, Fixture, GameState } from './types';

export interface HMatch { hg: number; ag: number; home: number; away: number; date: string }
export interface HSeq { club: number; n: number; from: string; to: string }
export interface HPlayer { name: string; club: number; n: number }
export interface CompSeasonRec {
  pts?: { club: number; n: number };
  gf?: { club: number; n: number };
  ga?: { club: number; n: number };
  disc?: { club: number; y: number; r: number };
  hiAtt?: { att: number; home: number; away: number; date: string };
  loAtt?: { att: number; home: number; away: number; date: string };
  avgAtt?: { club: number; n: number };
  bigWin?: HMatch;
  hiScore?: HMatch;
  won?: HSeq; lost?: HSeq; unbeaten?: HSeq; winless?: HSeq;
  top?: HPlayer;
  matchGoals?: HPlayer & { opp: number; away: boolean; date: string };
  assists?: HPlayer;
  rating?: HPlayer; // n = karaktersnit
  mom?: HPlayer;
  pdisc?: HPlayer & { y: number; r: number };
  young?: HPlayer; // n = alder
  old?: HPlayer;
}

const full = (pid: number) => { const p = gs().players[pid]; return p ? `${p.first} ${p.last}`.trim() : '?'; };
/** "R.Giggs" som i originalens rekordlister */
export const initialName = (n: string) => { const parts = n.split(' '); return parts.length > 1 ? `${parts[0][0]}.${parts.slice(1).join(' ')}` : n; };

export function compFixtures(comp: Competition, g: GameState = gs()): Fixture[] {
  return Object.values(g.fixtures).filter((f) => f.comp === comp.id && f.result).sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id);
}

/** Sæsonens rekorder for en turnering */
export function compSeasonRec(comp: Competition, g: GameState = gs()): CompSeasonRec {
  const fx = compFixtures(comp, g);
  const r: CompSeasonRec = {};
  const pts = new Map<number, number>(), gf = new Map<number, number>(), ga = new Map<number, number>();
  const att = new Map<number, [number, number]>();
  const per = new Map<number, Fixture[]>();
  const goals = new Map<number, { n: number; club: number }>();
  const best = (m: Map<number, number>) => { let b: [number, number] | undefined; for (const e of m) if (!b || e[1] > b[1]) b = e; return b ? { club: b[0], n: b[1] } : undefined; };
  const add = (m: Map<number, number>, k: number, v: number) => m.set(k, (m.get(k) ?? 0) + v);
  for (const f of fx) {
    const res = f.result!;
    const m: HMatch = { hg: res.hg, ag: res.ag, home: f.home, away: f.away, date: f.date };
    const diff = Math.abs(res.hg - res.ag);
    const bw = r.bigWin;
    if (diff > 0 && (!bw || diff > Math.abs(bw.hg - bw.ag) || (diff === Math.abs(bw.hg - bw.ag) && Math.max(res.hg, res.ag) > Math.max(bw.hg, bw.ag)))) r.bigWin = m;
    if (!r.hiScore || res.hg + res.ag > r.hiScore.hg + r.hiScore.ag) r.hiScore = m;
    add(pts, f.home, res.hg > res.ag ? 3 : res.hg === res.ag ? 1 : 0); add(pts, f.away, res.ag > res.hg ? 3 : res.hg === res.ag ? 1 : 0);
    add(gf, f.home, res.hg); add(gf, f.away, res.ag); add(ga, f.home, res.ag); add(ga, f.away, res.hg);
    if (res.att) {
      const a = { att: res.att, home: f.home, away: f.away, date: f.date };
      if (!r.hiAtt || a.att > r.hiAtt.att) r.hiAtt = a;
      if (!r.loAtt || a.att < r.loAtt.att) r.loAtt = a;
      const e = att.get(f.home) ?? [0, 0]; att.set(f.home, [e[0] + res.att, e[1] + 1]);
    }
    for (const c of [f.home, f.away]) { const l = per.get(c) ?? []; l.push(f); per.set(c, l); }
    const inMatch = new Map<number, { n: number; club: number }>();
    for (const s of res.scorers) {
      if (s[3] === 1) continue;
      const club = s[1] === 0 ? f.home : f.away;
      const im = inMatch.get(s[2]) ?? { n: 0, club }; im.n++; inMatch.set(s[2], im);
      const e = goals.get(s[2]) ?? { n: 0, club }; e.n++; e.club = club; goals.set(s[2], e);
    }
    for (const [pid, e] of inMatch) {
      if (!r.matchGoals || e.n > r.matchGoals.n) r.matchGoals = { name: full(pid), club: e.club, n: e.n, opp: e.club === f.home ? f.away : f.home, away: e.club !== f.home, date: f.date };
    }
  }
  r.pts = best(pts); r.gf = best(gf); r.ga = best(ga);
  let ab: { club: number; n: number } | undefined;
  for (const [c, [sum, n]] of att) { const v = Math.round(sum / n); if (n >= 2 && (!ab || v > ab.n)) ab = { club: c, n: v }; }
  r.avgAtt = ab;
  // serier pr. hold
  const seqOf = (k: 'won' | 'lost' | 'unbeaten' | 'winless', ok: (gfor: number, gag: number) => boolean) => {
    let b: HSeq | undefined;
    for (const [c, list] of per) {
      let run: Fixture[] = [];
      for (const f of list) {
        const res = f.result!, a = f.home === c ? res.hg : res.ag, d = f.home === c ? res.ag : res.hg;
        if (ok(a, d)) { run.push(f); if (!b || run.length > b.n) b = { club: c, n: run.length, from: run[0].date, to: f.date }; } else run = [];
      }
    }
    r[k] = b;
  };
  seqOf('won', (a, d) => a > d); seqOf('lost', (a, d) => a < d); seqOf('unbeaten', (a, d) => a >= d); seqOf('winless', (a, d) => a <= d);
  let tg: [number, { n: number; club: number }] | undefined;
  for (const e of goals) if (!tg || e[1].n > tg[1].n) tg = e;
  if (tg) r.top = { name: full(tg[0]), club: tg[1].club, n: tg[1].n };
  // spillerne (ligaens sæsonstatistik; pokaler har ikke egne tal pr. spiller)
  if (comp.type === 'league') {
    const clubs = new Set(comp.clubs);
    const pl = Object.values(g.players).filter((p) => p.club && clubs.has(p.club) && (p.stats.lgApps > 0 || p.stats.apps > 0));
    const bestBy = (get: (p: (typeof pl)[number]) => number, min = 1) => {
      let b: (typeof pl)[number] | undefined, bv = 0;
      for (const p of pl) { const v = get(p); if (v >= min && (!b || v > bv)) { b = p; bv = v; } }
      return b ? { p: b, v: bv } : undefined;
    };
    const hp = (x: { p: (typeof pl)[number]; v: number } | undefined): HPlayer | undefined => (x ? { name: full(x.p.id), club: x.p.club!, n: x.v } : undefined);
    r.assists = hp(bestBy((p) => p.stats.lgAssists ?? 0));
    r.mom = hp(bestBy((p) => p.stats.lgMom ?? 0));
    const rt = bestBy((p) => ((p.stats.lgRatingCount ?? 0) >= 10 ? (p.stats.lgRatingSum ?? 0) / p.stats.lgRatingCount! : 0), 0.01);
    if (rt) r.rating = { name: full(rt.p.id), club: rt.p.club!, n: Math.round(rt.v * 100) / 100 };
    const ds = bestBy((p) => p.stats.reds * 3 + p.stats.yellows);
    if (ds) r.pdisc = { name: full(ds.p.id), club: ds.p.club!, n: ds.v, y: ds.p.stats.yellows, r: ds.p.stats.reds };
    const aged = pl.filter((p) => p.stats.lgApps > 0).map((p) => [p, ageOn(p.dob, g.date)] as const);
    const yo = aged.slice().sort((a, b) => a[1] - b[1])[0], ol = aged.slice().sort((a, b) => b[1] - a[1])[0];
    if (yo) r.young = { name: full(yo[0].id), club: yo[0].club!, n: yo[1] };
    if (ol) r.old = { name: full(ol[0].id), club: ol[0].club!, n: ol[1] };
    // holdets disciplin: gule/røde kort for spillerne på holdet
    const cards = new Map<number, [number, number]>();
    for (const p of pl) { const e = cards.get(p.club!) ?? [0, 0]; cards.set(p.club!, [e[0] + p.stats.yellows, e[1] + p.stats.reds]); }
    let wd: { club: number; y: number; r: number } | undefined;
    for (const [c, [y, rd]] of cards) if (y + rd * 3 > 0 && (!wd || y + rd * 3 > wd.y + wd.r * 3)) wd = { club: c, y, r: rd };
    r.disc = wd;
  }
  return r;
}

/** Ved sæsonskiftet, FØR spillernes statistik nulstilles og kampprogrammet ryddes */
export function storeCompRecords() {
  const g = gs();
  const nations = new Set<number>();
  for (const c of Object.values(g.clubs)) if (c.manager === -1) nations.add(c.nation);
  for (const comp of Object.values(g.comps)) {
    if (comp.type === 'playoff') continue;
    const mine = (comp.nation >= 0 && nations.has(comp.nation)) || comp.clubs.some((c) => g.clubs[c]?.manager === -1);
    if (!mine) continue;
    const rec = compSeasonRec(comp, g);
    if (!Object.keys(rec).length) continue;
    ((g.compRecs ??= {})[comp.id] ??= {})[g.season] = rec;
  }
}
