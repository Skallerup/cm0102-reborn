// Klubbens historik som i CM 01/02 ("Man Utd History"): pr. sæson tilskuere, resultater, serier og topscorere.
// Den igangværende sæson regnes af kampprogrammet; afsluttede sæsoner gemmes ved sæsonskiftet (kun menneskeklubber –
// kampprogrammet ryddes hver sommer).
import { gs } from './state';
import type { Fixture } from './types';

export interface HistMatch { gf: number; ga: number; opp: number; home: boolean; comp: string; stage?: string; date: string }
// comp = turneringens navn (turneringerne ryddes hver sommer)
export interface HistSeq { n: number; from: string; to: string }
export interface SeasonRec {
  hiAtt?: { att: number; opp: number; comp: string; stage?: string; date: string };
  loAtt?: { att: number; opp: number; comp: string; stage?: string; date: string };
  avgAtt?: number;
  hiGate?: { gate: number; opp: number; comp: string; stage?: string; date: string };
  bigWin?: HistMatch; bigLeagueWin?: HistMatch; bigDefeat?: HistMatch; hiScore?: HistMatch; hiScoreLeague?: HistMatch;
  won?: HistSeq; lost?: HistSeq; unbeaten?: HistSeq; winless?: HistSeq;
  top?: { name: string; n: number }; topLeague?: { name: string; n: number };
}

const name = (pid: number) => { const p = gs().players[pid]; return p ? `${p.first} ${p.last}`.trim() : '?'; };

/** Sæsonens tal for en klub ud fra de spillede kampe */
export function seasonRec(cid: number, fixtures: Fixture[] = Object.values(gs().fixtures)): SeasonRec {
  const g = gs();
  const fx = fixtures.filter((f) => f.result && (f.home === cid || f.away === cid)).sort((a, b) => a.date.localeCompare(b.date));
  const r: SeasonRec = {};
  const league = (f: Fixture) => g.comps[f.comp]?.type === 'league';
  let attSum = 0, attN = 0;
  const run = { won: [] as Fixture[], lost: [] as Fixture[], unbeaten: [] as Fixture[], winless: [] as Fixture[] };
  const goals = new Map<number, number>(), lgGoals = new Map<number, number>();
  for (const f of fx) {
    const home = f.home === cid, res = f.result!;
    const gf = home ? res.hg : res.ag, ga = home ? res.ag : res.hg;
    const cname = g.comps[f.comp]?.name ?? f.comp;
    const m: HistMatch = { gf, ga, opp: home ? f.away : f.home, home, comp: cname, stage: f.stage, date: f.date };
    if (home && res.att) {
      const a = { att: res.att, opp: f.away, comp: cname, stage: f.stage, date: f.date };
      if (!r.hiAtt || a.att > r.hiAtt.att) r.hiAtt = a;
      if (!r.loAtt || a.att < r.loAtt.att) r.loAtt = a;
      attSum += res.att; attN++;
      if (res.gate && (!r.hiGate || res.gate > r.hiGate.gate)) r.hiGate = { gate: res.gate, opp: f.away, comp: cname, stage: f.stage, date: f.date };
    }
    const better = (a: HistMatch | undefined, k: (x: HistMatch) => number) => !a || k(m) > k(a) || (k(m) === k(a) && m.gf > a.gf);
    if (gf > ga && better(r.bigWin, (x) => x.gf - x.ga)) r.bigWin = m;
    if (gf > ga && league(f) && better(r.bigLeagueWin, (x) => x.gf - x.ga)) r.bigLeagueWin = m;
    if (ga > gf && (!r.bigDefeat || ga - gf > r.bigDefeat.ga - r.bigDefeat.gf)) r.bigDefeat = m;
    if (better(r.hiScore, (x) => x.gf + x.ga)) r.hiScore = m;
    if (league(f) && better(r.hiScoreLeague, (x) => x.gf + x.ga)) r.hiScoreLeague = m;
    // serier
    const step = (k: keyof typeof run, ok: boolean) => {
      if (ok) run[k].push(f); else run[k] = [];
      const cur = run[k];
      if (cur.length && (!r[k] || cur.length > r[k]!.n)) r[k] = { n: cur.length, from: cur[0].date, to: cur[cur.length - 1].date };
    };
    step('won', gf > ga); step('lost', gf < ga); step('unbeaten', gf >= ga); step('winless', gf <= ga);
    for (const s of res.scorers) {
      if (s[3] === 1 || s[1] !== (home ? 0 : 1)) continue;
      goals.set(s[2], (goals.get(s[2]) ?? 0) + 1);
      if (league(f)) lgGoals.set(s[2], (lgGoals.get(s[2]) ?? 0) + 1);
    }
  }
  if (attN) r.avgAtt = Math.round(attSum / attN);
  const best = (m: Map<number, number>) => { let b: [number, number] | undefined; for (const e of m) if (!b || e[1] > b[1]) b = e; return b ? { name: name(b[0]), n: b[1] } : undefined; };
  r.top = best(goals); r.topLeague = best(lgGoals);
  return r;
}

/** Ved sæsonskiftet (før kampprogrammet ryddes): gem sæsonen for menneskeklubberne */
export function storeSeasonRecords(human: (cid: number) => boolean) {
  const g = gs();
  for (const c of Object.values(g.clubs)) {
    if (!human(c.id)) continue;
    const rec = seasonRec(c.id);
    (c.seasonRecs ??= {})[g.season] = rec;
  }
}
