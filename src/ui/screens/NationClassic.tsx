// En nations skærme i klassisk tema (som i CM 01/02, via ▸-menuen ved en klub → nationen):
// Manager Stats (managernes omdømme i landet), Job Information (ledige stillinger) og Transfers (handler pr. måned).
import { useEffect, useMemo, useState } from 'react';
import type { GameState } from '../../game/types';
import { compName, money, natName, t } from '../../i18n';
import { useGame, useRouteState } from '../core';
import { CxDrop, CxLink, clubRoute } from '../classic';
import { Head } from './common';
import { Pager } from './TransfersClassic';

const PAGE = 16;
export const NATION_TABS = ['managers', 'jobs', 'transfers'] as const;
type NationTab = (typeof NATION_TABS)[number];

/** Omdømme (0-100) som ord, som i originalens managerliste */
const REP_BANDS: [number, string][] = [[85, 'superb'], [75, 'excellent'], [65, 'vgood'], [55, 'good'], [42, 'fair'], [30, 'average'], [18, 'poor'], [0, 'vpoor']];
export const repWord = (rep: number) => t(`cl.na.rep.${REP_BANDS.find(([min]) => rep >= min)![1]}`);

/** "17th" på engelsk, "17." ellers */
function ordinal(n: number): string {
  if (!t('cl.locale').startsWith('en')) return `${n}.`;
  const s = new Intl.PluralRules('en', { type: 'ordinal' }).select(n);
  return `${n}${({ one: 'st', two: 'nd', few: 'rd' } as Record<string, string>)[s] ?? 'th'}`;
}

/** Landets klubber med en liga (ellers ingen klubber i landet) */
const inNation = (g: GameState, club: number, nation: number) => g.clubs[club]?.nation === nation;

export function ClassicNation({ id, tab: initial }: { id?: number; tab?: string }) {
  const g = useGame()!;
  const nation = id ?? g.clubs[g.userClub]?.nation ?? 0;
  const [tab] = useRouteState<NationTab>('ntab', (NATION_TABS as readonly string[]).includes(initial ?? '') ? initial as NationTab : 'managers');
  const name = natName(g.nations[nation]?.name);
  return (
    <div>
      {/* CM 01/02: ingen faner – skærmene åbnes fra managermenuen (Manager Stats, Job Information, Transfers) */}
      <Head title={t(`cl.na.title.${tab}`)} />
      {tab === 'managers' && <ManagerStats nation={nation} name={name} />}
      {tab === 'jobs' && <JobInfo nation={nation} name={name} />}
      {tab === 'transfers' && <MonthTransfers nation={nation} name={name} />}
    </div>
  );
}

function ManagerStats({ nation, name }: { nation: number; name: string }) {
  const g = useGame()!;
  const [pg, setPg] = useState(0);
  const rows = useMemo(() => {
    const out = Object.values(g.staff).filter((s) => s.role === 'manager' && s.club && s.club !== g.userClub && inNation(g, s.club, nation))
      .map((s) => ({ key: `s${s.id}`, name: `${s.first} ${s.last}`.trim(), club: s.club, rep: s.rep, me: false }));
    if (g.userClub && inNation(g, g.userClub, nation)) out.push({ key: 'me', name: g.manager.name, club: g.userClub, rep: g.manager.rep, me: true });
    return out.sort((a, b) => b.rep - a.rep || a.name.localeCompare(b.name));
  }, [g, nation]);
  // start på siden med ens egen plads (som i originalen)
  useEffect(() => { const i = rows.findIndex((r) => r.me); setPg(i >= 0 ? Math.floor(i / PAGE) : 0); }, [nation]); // eslint-disable-line react-hooks/exhaustive-deps
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const p = Math.min(pg, pages - 1);
  return (
    <>
      <div className="cx-subtitle">{t('cl.na.repIn', { nation: name })}</div>
      <Pager desc="" pg={p} pages={pages} setPg={setPg} />
      <div className="cx-ntab">
        {rows.slice(p * PAGE, (p + 1) * PAGE).map((r, i) => (
          <div key={r.key} className={`cx-nrow ${r.me ? 'me' : ''}`}>
            <span className="cx-nrank">{ordinal(p * PAGE + i + 1)}</span>
            <span className="cx-nname">{r.name}</span>
            <span className="cx-nclub"><CxLink to={clubRoute(r.club)}>{g.clubs[r.club]?.short}</CxLink></span>
            <span className="cx-nval">{repWord(r.rep)}</span>
          </div>
        ))}
        {!rows.length && <div className="cx-empty">{t('cl.na.noManagers')}</div>}
      </div>
    </>
  );
}

function JobInfo({ nation, name }: { nation: number; name: string }) {
  const g = useGame()!;
  const [scope, setScope] = useRouteState<'nation' | 'all'>('nscope', 'nation');
  const vac = g.vacancies.map((cid) => g.clubs[cid]).filter((c) => c && c.manager === 0 && !g.leagues[c.league]?.hidden && (scope === 'all' || c.nation === nation))
    .sort((a, b) => (g.leagues[a.league]?.tier ?? 9) - (g.leagues[b.league]?.tier ?? 9) || b.rep - a.rep);
  return (
    <>
      <div className="cx-subtitle">{scope === 'all' ? t('cl.na.allNations') : name}</div>
      <div className="cx-tools cx-tools-inline">
        <CxDrop label={t('cl.sq.view')} items={[
          { key: 'nation', label: name, checked: scope === 'nation', onClick: () => setScope('nation') },
          { key: 'all', label: t('cl.na.allNations'), checked: scope === 'all', onClick: () => setScope('all') },
        ]} />
      </div>
      <div className="cx-ntab">
        {vac.map((c) => (
          <div key={c.id} className="cx-nrow job">
            <span className="cx-nname dim">{t('cl.na.noManager')}</span>
            <span className="cx-nclub"><CxLink to={clubRoute(c.id)}>{c.short}</CxLink></span>
            <span className="cx-nnat">{natName(g.nations[c.nation]?.name)}</span>
            <span className="cx-ndiv">{compName(g.leagues[c.league]?.name)}</span>
            <span className="cx-nval">{t('cl.na.available')}</span>
          </div>
        ))}
        {!vac.length && <div className="cx-empty">{t('cl.na.noJobs')}</div>}
      </div>
    </>
  );
}

function MonthTransfers({ nation, name }: { nation: number; name: string }) {
  const g = useGame()!;
  const [view, setView] = useRouteState<'all' | 'nation'>('nview', 'all');
  const [month, setMonth] = useRouteState('nmonth', g.date.slice(0, 7));
  const [pg, setPg] = useState(0);
  const rows = useMemo(() => {
    const out: { key: string; pid: number; name: string; from: number; to: number; fee: number; loan?: boolean; date: string }[] = [];
    for (const p of Object.values(g.players)) {
      for (const [i, m] of (p.moves ?? []).entries()) {
        if (!m.date.startsWith(month)) continue;
        if (view === 'nation' && !inNation(g, m.from, nation) && !inNation(g, m.to, nation)) continue;
        out.push({ key: `${p.id}-${i}`, pid: p.id, name: `${p.last}${p.first ? `, ${p.first.charAt(0)}` : ''}`, from: m.from, to: m.to, fee: m.fee, loan: m.loan, date: m.date });
      }
    }
    return out.sort((a, b) => b.fee - a.fee || b.date.localeCompare(a.date));
  }, [g, month, view, nation]);
  useEffect(() => setPg(0), [month, view]);
  const shift = (d: number) => {
    const [y, m] = month.split('-').map(Number);
    const x = new Date(y, m - 1 + d, 1);
    const next = `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}`;
    if (next <= g.date.slice(0, 7)) setMonth(next);
  };
  const label = new Date(`${month}-15T12:00:00`).toLocaleDateString(t('cl.locale'), { month: 'long', year: 'numeric' });
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const p = Math.min(pg, pages - 1);
  const noClub = t('cl.fd.noClub');
  return (
    <>
      <div className="cx-subtitle cx-subtitle-nav">
        <span>{label.charAt(0).toUpperCase() + label.slice(1)}</span>
        <span className="cx-month-nav">
          <button onClick={() => shift(-1)} aria-label="previous">‹</button>
          <button onClick={() => shift(1)} disabled={month >= g.date.slice(0, 7)} aria-label="next">›</button>
        </span>
      </div>
      <div className="cx-tools cx-tools-inline">
        <CxDrop label={t('cl.sq.view')} items={[
          { key: 'all', label: t('cl.na.allTransfers'), checked: view === 'all', onClick: () => setView('all') },
          { key: 'nation', label: name, checked: view === 'nation', onClick: () => setView('nation') },
        ]} />
      </div>
      {rows.length > PAGE && <Pager desc="" pg={p} pages={pages} setPg={setPg} />}
      <div className="cx-ntab">
        {rows.slice(p * PAGE, (p + 1) * PAGE).map((r) => (
          <div key={r.key} className="cx-nrow tr">
            <span className="cx-nname"><CxLink to={{ name: 'player', id: r.pid }}>{r.name}</CxLink></span>
            <span className="cx-nclub">{r.from ? <CxLink to={clubRoute(r.from)}>{g.clubs[r.from]?.short}</CxLink> : noClub}</span>
            <span className="cx-nnat">{g.clubs[r.to] ? <CxLink to={clubRoute(r.to)}>{g.clubs[r.to].short}</CxLink> : noClub}</span>
            <span className="cx-nval">{r.loan ? t('tr.loan') : r.fee > 0 ? money(r.fee) : t('cl.na.free')}</span>
          </div>
        ))}
        {!rows.length && <div className="cx-empty cx-empty-mid">{t('cl.na.noTransfers')}</div>}
      </div>
    </>
  );
}
