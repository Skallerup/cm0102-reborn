// "Man Utd History" (CM 01/02): Competitions · Landmarks · Records · Positions · Attendances øverst og Results · Sequences ·
// Players · Transfers nederst. Records = klubbens bedste i den tid, spillet har kørt ("Modern Day"); de øvrige faner viser én
// rekord pr. sæson (vælges under View). Tallene kommer fra game/clubHistory.ts.
import { seasonRec, type HistMatch, type HistSeq, type SeasonRec } from '../../game/clubHistory';
import { leagueRows } from '../../game/competitions';
import { compName, money, t } from '../../i18n';
import { ClassicSub, CxDrop, classicDate } from '../classic';
import { useGame, useRouteState } from '../core';
import { Tabs } from '../components';
import { Head } from './common';
import { ordinal } from './Competitions';

type Tab = 'competitions' | 'landmarks' | 'records' | 'positions' | 'attendances' | 'results' | 'sequences' | 'players' | 'transfers';
const STATS: Partial<Record<Tab, string[]>> = {
  positions: ['hiPos', 'loPos'],
  attendances: ['hiAtt', 'loAtt', 'avgAtt', 'hiGate'],
  results: ['bigWin', 'bigLeagueWin', 'bigDefeat', 'hiScore', 'hiScoreLeague'],
  sequences: ['won', 'lost', 'unbeaten', 'winless'],
  players: ['top', 'topLeague'],
  transfers: ['feePaid', 'feeRecv'],
};

export function ClassicClubHistory({ cid }: { cid: number }) {
  const g = useGame()!;
  const c = g.clubs[cid];
  const [tab, setTab] = useRouteState<Tab>('htab', 'records');
  const [stat, setStat] = useRouteState<string>('hstat', '');
  if (!c) return null;
  const short = (id: number) => g.clubs[id]?.short ?? '?';
  const yr = (s: number) => `${s}/${String((s + 1) % 100).padStart(2, '0')}`;
  const d = (iso: string) => classicDate(iso)[1];
  // sæsonerne: den igangværende (live) og de gemte
  const cur = seasonRec(cid);
  const seasons: [number, SeasonRec][] = [[g.season, cur], ...Object.entries(c.seasonRecs ?? {}).map(([s, r]) => [Number(s), r] as [number, SeasonRec]).sort((a, b) => b[0] - a[0])];
  const lgPos = (): [number, string, number][] => {
    const out: [number, string, number][] = c.history.map((h) => [h.season, compName(g.leagues[h.league]?.name ?? g.comps[h.league]?.name) ?? h.league, h.pos]);
    const comp = g.comps[c.league];
    const k = comp?.type === 'league' ? leagueRows(comp).findIndex((r) => r.club === cid) : -1;
    if (k >= 0 && comp!.table.some((r) => r.p > 0)) out.push([g.season, compName(comp!.name) ?? '', k + 1]);
    return out.sort((a, b) => b[0] - a[0]);
  };
  const match = (m?: HistMatch) => (m ? `${m.gf}-${m.ga} v ${short(m.opp)} (${m.home ? 'H' : 'A'}) ${compName(m.comp)} ${d(m.date)}` : '-');
  const att = (a?: { att?: number; gate?: number; opp: number; comp: string; date: string }) => (a ? `${a.gate !== undefined ? money(a.gate) : a.att} v ${short(a.opp)} ${compName(a.comp)} ${d(a.date)}` : '-');
  const seq = (q?: HistSeq) => (q ? `${q.n} - ${d(q.from)} to ${d(q.to)}` : '-');
  const scorer = (x?: { name: string; n: number }) => (x ? `${x.name} - ${x.n}` : '-');
  // transfers pr. sæson fra spillernes skifter
  const fees = (season: number, dir: 'in' | 'out') => {
    let best: { name: string; fee: number } | undefined;
    for (const p of Object.values(g.players)) for (const m of p.moves ?? []) {
      if (m.season !== season || m.loan || !m.fee || (dir === 'in' ? m.to !== cid : m.from !== cid)) continue;
      if (!best || m.fee > best.fee) best = { name: `${p.first} ${p.last}`.trim(), fee: m.fee };
    }
    return best ? `${best.name} - ${money(best.fee)}` : '-';
  };
  const value = (k: string, s: number, r: SeasonRec): string => {
    switch (k) {
      case 'hiPos': case 'loPos': { const p = lgPos().find((x) => x[0] === s); return p ? `${ordinal(p[2])} in ${p[1]}` : '-'; }
      case 'hiAtt': return att(r.hiAtt);
      case 'loAtt': return att(r.loAtt);
      case 'avgAtt': return r.avgAtt ? String(r.avgAtt) : '-';
      case 'hiGate': return att(r.hiGate);
      case 'bigWin': case 'bigLeagueWin': case 'bigDefeat': case 'hiScore': case 'hiScoreLeague': return match(r[k]);
      case 'won': case 'lost': case 'unbeaten': case 'winless': return seq(r[k]);
      case 'top': case 'topLeague': return scorer(r[k]);
      case 'feePaid': return fees(s, 'in');
      case 'feeRecv': return fees(s, 'out');
    }
    return '-';
  };
  // Records ("Modern Day"): det bedste på tværs af sæsonerne
  const records = (): [string, string][] => {
    const pos = lgPos();
    const bestPos = pos.slice().sort((a, b) => a[2] - b[2])[0], worstPos = pos.slice().sort((a, b) => b[2] - a[2])[0];
    const pick = <T,>(get: (r: SeasonRec) => T | undefined, score: (x: T) => number, lowest = false) => {
      let b: [number, T] | undefined;
      for (const [s, r] of seasons) { const x = get(r); if (x !== undefined && (!b || (lowest ? score(x) < score(b[1]) : score(x) > score(b[1])))) b = [s, x]; }
      return b;
    };
    const avg = pick((r) => r.avgAtt, (x) => x);
    const top = pick((r) => r.top, (x) => x.n), topL = pick((r) => r.topLeague, (x) => x.n);
    return [
      ['hiPos', bestPos ? `${ordinal(bestPos[2])} in ${bestPos[1]} ${yr(bestPos[0])}` : '-'],
      ['loPos', worstPos ? `${ordinal(worstPos[2])} in ${worstPos[1]} ${yr(worstPos[0])}` : '-'],
      ['hiAtt', att(pick((r) => r.hiAtt, (x) => x.att)?.[1])],
      ['hiGate', att(pick((r) => r.hiGate, (x) => x.gate)?.[1])],
      ['loAtt', att(pick((r) => r.loAtt, (x) => x.att, true)?.[1])],
      ['avgAtt', avg ? `${avg[1]} - ${yr(avg[0])}` : '-'],
      ['bigWin', match(pick((r) => r.bigWin, (x) => (x.gf - x.ga) * 100 + x.gf)?.[1])],
      ['bigLeagueWin', match(pick((r) => r.bigLeagueWin, (x) => (x.gf - x.ga) * 100 + x.gf)?.[1])],
      ['bigDefeat', match(pick((r) => r.bigDefeat, (x) => (x.ga - x.gf) * 100 + x.ga)?.[1])],
      ['hiScore', match(pick((r) => r.hiScore, (x) => x.gf + x.ga)?.[1])],
      ['hiScoreLeague', match(pick((r) => r.hiScoreLeague, (x) => x.gf + x.ga)?.[1])],
      ['won', seq(pick((r) => r.won, (x) => x.n)?.[1])],
      ['lost', seq(pick((r) => r.lost, (x) => x.n)?.[1])],
      ['unbeaten', seq(pick((r) => r.unbeaten, (x) => x.n)?.[1])],
      ['winless', seq(pick((r) => r.winless, (x) => x.n)?.[1])],
      ['top', top ? `${scorer(top[1])} ${yr(top[0])}` : '-'],
      ['topLeague', topL ? `${scorer(topL[1])} ${yr(topL[0])}` : '-'],
    ];
  };
  // Competitions: vundne og tabte finaler/titler fra sæsonoversigterne (i den tid, spillet har kørt)
  const honours = () => {
    const by = new Map<string, { won: number[]; ru: number[] }>();
    for (const h of g.seasonHistory) for (const x of h.comps) {
      if (x.winner !== cid && x.runnerUp !== cid) continue;
      const e = by.get(x.name) ?? { won: [], ru: [] };
      (x.winner === cid ? e.won : e.ru).push(h.season + 1);
      by.set(x.name, e);
    }
    return [...by];
  };
  const landmarks = () => {
    const out: [string, string][] = [];
    for (const h of g.seasonHistory) for (const x of h.comps) {
      if (x.winner === cid) out.push([`${h.season + 1}-06-01`, t('cl.ch.winners', { comp: compName(x.name) ?? x.name })]);
      else if (x.runnerUp === cid) out.push([`${h.season + 1}-06-01`, t('cl.ch.runnersUp', { comp: compName(x.name) ?? x.name })]);
    }
    for (const s of Object.values(g.staff)) for (const k of s.career ?? []) {
      if (k.club !== cid) continue;
      out.push([k.from, t('cl.ch.hired', { name: `${s.first} ${s.last}`.trim() })]);
      if (k.to) out.push([k.to, t(k.why === 'sacked' ? 'cl.ch.sacked' : 'cl.ch.left', { name: `${s.first} ${s.last}`.trim() })]);
    }
    return out.sort((a, b) => b[0].localeCompare(a[0]));
  };
  const group = STATS[tab];
  const k = group?.includes(stat) ? stat : group?.[0] ?? '';
  const TOP: Tab[] = ['competitions', 'landmarks', 'records', 'positions', 'attendances'];
  const BOTTOM: Tab[] = ['results', 'sequences', 'players', 'transfers'];
  const viewItems = group ? group.map((x) => ({ key: x, label: t(`cl.ch.s.${x}`), checked: x === k, onClick: () => setStat(x) })) : [{ key: 'md', label: t('cl.ch.modern'), checked: true, onClick: () => {} }];
  return (
    <div className="cx-chist">
      <Head title={t('cl.ch.title', { club: c.short })} />
      <Tabs tabs={TOP.map((x) => [x, t(`cl.ch.t.${x}`)] as [string, string])} value={TOP.includes(tab) ? tab : ''} onChange={(v) => setTab(v as Tab)} />
      {tab !== 'landmarks' && <div className="cx-tools"><CxDrop label={t('cl.sq.view')} items={viewItems} /></div>}
      {tab === 'competitions' && <>
        <div className="cx-subtitle small">{t('cl.ch.honours')}</div>
        <div className="cx-chist-tbl">{honours().length ? honours().flatMap(([name, e]) => [
          ...(e.won.length ? [<div key={`${name}w`} className="cx-chist-row three"><span>{compName(name)}</span><span>{t('cl.ch.won')}</span><span className="v">{e.won.join(', ')}</span></div>] : []),
          ...(e.ru.length ? [<div key={`${name}r`} className="cx-chist-row three"><span>{e.won.length ? '' : compName(name)}</span><span>{t('cl.ch.ru')}</span><span className="v">{e.ru.join(', ')}</span></div>] : []),
        ]) : <div className="cx-empty">{t('common.none')}</div>}</div>
      </>}
      {tab === 'landmarks' && <div className="cx-chist-tbl">{landmarks().map(([dt, txt], i) => <div key={i} className="cx-chist-row date"><span className="cx-chist-btn">{classicDate(dt)[1]}</span><span className="v">{txt}</span></div>)}{!landmarks().length && <div className="cx-empty">{t('common.none')}</div>}</div>}
      {tab === 'records' && <>
        <div className="cx-subtitle small">{t('cl.ch.modern')}</div>
        <div className="cx-chist-tbl">{records().map(([key, v]) => <div key={key} className="cx-chist-row"><span>{t(`cl.ch.s.${key}`)}</span><span className="v">{v}</span></div>)}</div>
      </>}
      {group && <>
        <div className="cx-subtitle small">{t(`cl.ch.s.${k}`)}</div>
        <div className="cx-chist-tbl">{seasons.map(([s, r]) => <div key={s} className="cx-chist-row date"><span className="cx-chist-btn">{yr(s)}</span><span className="v">{value(k, s, r)}</span></div>)}</div>
      </>}
      <ClassicSub items={BOTTOM.map((x) => ({ key: x, label: t(`cl.ch.t.${x}`), on: tab === x, onClick: () => setTab(x) }))} />
    </div>
  );
}
