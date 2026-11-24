// Originalens klubside (CM 01/02 "Finances & Info"/klubben) i det moderne udseende: Info (Nation · Status · Finances · Stadium · Facilities · Training Ground + stab),
// Squad, Transfers (Players In/Out, Loans, Staff, Future), Next Match, Fixtures samt Stats · Finances · Income · Expenditure.
import { Fragment, useState } from 'react';
import { futureTransfers } from '../../game/futureTransfers';
import { squad } from '../../game/state';
import { compName, dateFmt, money, natName, t } from '../../i18n';
import { Crest, Panel, PlayerLink, Tabs } from '../components';
import { useGame, useNav, useRouteState } from '../core';
import { Head } from './common';
import { SquadTable } from './Squad';
import { ClassicFinanceBody } from './Finance';
import { stageLabel } from './Fixtures';
import { origNextMatchRows } from './NextMatchClassic';

type Mv = { season: number; date: string; from: number; to: number; fee: number; loan?: boolean; swap?: boolean };
type CtView = 'in' | 'out' | 'future' | 'loansIn' | 'loansOut' | 'staffIn' | 'staffOut';
const CT_VIEWS: CtView[] = ['in', 'out', 'future', 'loansIn', 'loansOut', 'staffIn', 'staffOut'];

function Transfers({ cid }: { cid: number }) {
  const g = useGame()!;
  const { nav } = useNav();
  const [season, setSeason] = useState(g.season);
  const [dir, setDir] = useState<CtView>('in');
  type Row = { who: number; staff: boolean; date: string; from: number; to: number; fee: number; loan?: boolean; swap?: boolean };
  const all: Row[] = [];
  let first = g.season;
  const take = (who: number, staff: boolean, moves?: Mv[]) => {
    for (const m of moves ?? []) {
      if (m.from !== cid && m.to !== cid) continue;
      first = Math.min(first, m.season);
      if (m.season === season) all.push({ who, staff, date: m.date, from: m.from, to: m.to, fee: m.fee, loan: m.loan, swap: m.swap });
    }
  };
  for (const p of Object.values(g.players)) take(p.id, false, p.moves);
  for (const s of Object.values(g.staff)) take(s.id, true, s.moves);
  const incoming = dir === 'in' || dir === 'loansIn' || dir === 'staffIn';
  const future = dir === 'future';
  const rows = future ? [] : all.filter((r) => (dir.startsWith('staff') ? r.staff : !r.staff) && !!r.loan === dir.startsWith('loans') && (incoming ? r.to === cid : r.from === cid)).sort((a, b) => b.date.localeCompare(a.date));
  const frows = future ? futureTransfers(g, cid) : [];
  let total = rows.reduce((a, r) => a + r.fee, 0);
  if (future) { const seen = new Set<number>(); total = 0; for (const r of frows) { if (seen.has(r.pid)) continue; seen.add(r.pid); total += r.out ? r.fee : -r.fee; } }
  const club = (id: number) => (id > 0 ? <a className="link" onClick={() => nav({ name: 'club', id })}>{g.clubs[id]?.short ?? '?'}</a> : <>{t('cl.ct.freeTransfer')}</>);
  const person = (id: number, staff: boolean) => {
    if (staff) { const s = g.staff[id]; return s ? <a className="link" onClick={() => nav({ name: 'staff', id })}>{s.last}{s.first ? `, ${s.first}` : ''}</a> : '?'; }
    const p = g.players[id];
    return p ? <PlayerLink p={p} /> : '?';
  };
  const feeCell = (fee: number, kind: 'free' | 'exch' | 'bos' | 'loan') => (fee > 0 ? (kind === 'exch' ? t('cl.ct.px', { fee: money(fee) }) : money(fee)) : t(`cl.ct.k.${kind}`));
  const yr = `${season}/${String((season + 1) % 100).padStart(2, '0')}`;
  return (
    <Panel title={future ? t('cl.ct.v.future') : t('cl.ct.title', { title: t(`cl.ct.v.${dir}`), season: yr })} className="flush"
      right={<b className={total < 0 ? 'bad' : 'good'}>{total < 0 ? `-${money(-total)}` : money(total)}</b>}>
      <div className="row" style={{ padding: 10, gap: 8 }}>
        <button className="small" disabled={season <= first || future} onClick={() => setSeason(season - 1)}>{t('cl.ct.prev')}</button>
        <button className="small" disabled={season >= g.season || future} onClick={() => setSeason(season + 1)}>{t('cl.ct.next')}</button>
        <div className="grow" />
        <select value={dir} onChange={(e) => setDir(e.target.value as CtView)}>{CT_VIEWS.map((k) => <option key={k} value={k}>{t(`cl.ct.v.${k}`)}</option>)}</select>
      </div>
      <table className="grid"><tbody>
        {future && frows.map((r, i) => (
          <tr key={i}><td>{r.status === 6 ? dateFmt(r.date ?? g.date) : t(`cl.ct.st.${r.status}`)}</td><td>{person(r.pid, false)}</td><td>{club(r.other)}</td><td className="num">{feeCell(r.fee, r.kind === 1 ? 'exch' : r.kind === 4 ? 'bos' : 'free')}</td></tr>
        ))}
        {!future && rows.map((r, i) => (
          <tr key={i}><td>{dateFmt(r.date)}</td><td>{person(r.who, r.staff)}</td><td>{club(incoming ? r.from : r.to)}</td><td className="num">{feeCell(r.fee, r.swap ? 'exch' : r.loan ? 'loan' : 'free')}</td></tr>
        ))}
        {!future && rows.length === 0 && <tr><td className="muted">{t('common.none')}</td></tr>}
      </tbody></table>
    </Panel>
  );
}

function Fixtures({ cid }: { cid: number }) {
  const g = useGame()!;
  const { nav } = useNav();
  const list = Object.values(g.fixtures).filter((f) => f.home === cid || f.away === cid).sort((a, b) => a.date.localeCompare(b.date));
  return (
    <Panel className="flush">
      <table className="grid"><tbody>
        {list.map((f) => {
          const home = f.home === cid, opp = home ? f.away : f.home, r = f.result;
          return (
            <tr key={f.id} className={g.reports[f.id] ? 'clickable' : ''} onClick={() => g.reports[f.id] && nav({ name: 'report', id: f.id })}>
              <td>{dateFmt(f.date)}</td><td>{f.comp === 'FRIENDLY' ? t('cl.fx.friendly') : compName(g.comps[f.comp]?.name)}</td><td className="muted">{stageLabel(f)}</td>
              <td>{f.stage === 'F' ? t('fix.neutral') : home ? t('fix.home') : t('fix.away')}</td>
              <td><a className="link" onClick={(e) => { e.stopPropagation(); nav({ name: 'club', id: opp }); }}>{g.clubs[opp]?.name}</a></td>
              <td className="num"><b>{r ? `${home ? r.hg : r.ag} - ${home ? r.ag : r.hg}` : '-'}</b></td>
            </tr>
          );
        })}
      </tbody></table>
    </Panel>
  );
}

export function OrigNextMatch({ cid }: { cid: number }) {
  const g = useGame()!;
  const { nav } = useNav();
  const mine = cid === g.userClub;
  const list = Object.values(g.fixtures).filter((f) => f.home === cid || f.away === cid).sort((a, b) => a.date.localeCompare(b.date));
  const upcoming = list.filter((f) => !f.result);
  const [i, setI] = useState(0);
  const [past, setPast] = useState(false);
  const next = upcoming[Math.min(i, upcoming.length - 1)];
  if (!next) return <Panel><div className="muted">{t('cl.cn.none')}</div></Panel>;
  const home = next.home === cid, opp = home ? next.away : next.home;
  if (!mine) {
    const recent = list.filter((f) => f.result).slice(-5).reverse();
    const form = recent.map((f) => { const h = f.home === cid, r = f.result!; const my = h ? r.hg : r.ag, th = h ? r.ag : r.hg; return my > th ? t('cl.cn.w') : my < th ? t('cl.cn.l') : t('cl.cn.d'); }).join(' ');
    return (
      <Panel><div className="kv">
        <span>{t('col.date')}</span><span>{dateFmt(next.date)}</span>
        <span>{t('fix.opponent')}</span><span><a className="link" onClick={() => nav({ name: 'club', id: opp })}>{g.clubs[opp]?.name ?? '?'}</a></span>
        <span>{t('fix.venue')}</span><span>{next.stage === 'F' ? t('fix.neutral') : home ? t('fix.home') : t('fix.away')}</span>
        <span>{t('col.comp')}</span><span>{compName(g.comps[next.comp]?.name) ?? ''}</span>
        {form && <><span>{t('cl.cn.form')}</span><span>{form}</span></>}
      </div></Panel>
    );
  }
  // egen klub: originalens Next Match (dato, stadion, regler, sidste opgør, vejr, bane, dommer, klubnyt) med << Date / Date >> og Past Meetings
  const { rows, meetings, score } = origNextMatchRows(g, next);
  return (
    <Panel title={`${g.clubs[opp]?.short ?? ''} (${t(home ? 'cl.nm.home' : 'cl.nm.away')}) – ${compName(g.comps[next.comp]?.name) ?? ''}`}
      right={<span className="row">
        <button className="small" disabled={i <= 0} onClick={() => setI(i - 1)}>{t('cl.nm.prev')}</button>
        <button className="small" disabled={i >= upcoming.length - 1} onClick={() => setI(i + 1)}>{t('cl.nm.next')}</button>
        <button className={`small ${past ? 'primary' : ''}`} onClick={() => setPast(!past)}>{t('cl.nm.past')}</button>
      </span>}>
      <div className="kv">
        {past
          ? (meetings.length ? meetings.slice(0, 12).map((x) => <Fragment key={x.id}><span /><span>{score(x)}</span></Fragment>) : <><span /><span className="muted">{t('common.none')}</span></>)
          : rows.map(([l, v]) => (Array.isArray(v) ? v : [v]).map((x, k) => <Fragment key={`${l}${k}`}><span>{k === 0 ? l : ''}</span><span>{x}</span></Fragment>))}
      </div>
    </Panel>
  );
}

export function OrigClub({ id }: { id?: number }) {
  const g = useGame()!;
  const { nav } = useNav();
  const cid = id ?? g.userClub;
  const c = g.clubs[cid];
  const mine = cid === g.userClub;
  const showMoney = mine || !g.options.masking;
  const [view, setView] = useRouteState('cview', mine ? 'info' : 'squad');
  if (!c) return null;
  const tabs: [string, string][] = [
    ['info', t('cl.ci.v.info')], ...(mine ? [] : [['squad', t('nav.squad')] as [string, string]]), ['transfers', t('nav.transfers')],
    ['next', t('cl.nextMatch')], ['fixtures', t('nav.fixtures')], ['stats', t('cl.ci.v.stats')],
    ...(showMoney ? (['finances', 'income', 'expenditure'] as const).map((k) => [k, t(`cl.ci.v.${k}`)] as [string, string]) : []),
  ];
  const v = tabs.some(([k]) => k === view) ? view : 'info';
  const staff = Object.values(g.staff).filter((x) => x.club === cid && x.id !== c.manager).sort((a, b) => ['assistant', 'coach', 'physio', 'scout'].indexOf(a.role) - ['assistant', 'coach', 'physio', 'scout'].indexOf(b.role));
  const mgr = c.manager === -1 ? (mine ? g.manager.name : '') : g.staff[c.manager] ? `${g.staff[c.manager].first} ${g.staff[c.manager].last}` : t('club.vacant');
  return (
    <div>
      <Head title={<><Crest id={c.id} size={40} /> {c.name}</>} />
      <Tabs tabs={tabs} value={v} onChange={setView} />
      {v === 'info' && (
        <div className="cols">
          <Panel title={t('cl.ci.v.info')}><div className="kv">
            <span>{t('cl.ci.nation')}</span><span><a className="link" onClick={() => nav({ name: 'nation', id: c.nation })}>{natName(g.nations[c.nation]?.name)}</a></span>
            <span>{t('cl.ci.status')}</span><span>{t((g.leagues[c.league]?.tier ?? 9) <= 2 || c.rep >= 50 ? 'cl.ci.pro' : 'cl.ci.semipro')}</span>
            {showMoney && <><span>{t('cl.ci.finances')}</span><span>{t(c.balance >= 0 ? 'cl.ci.fin.ok' : c.balance > -5_000_000 ? 'cl.ci.fin.stretched' : 'cl.ci.fin.debt')}</span></>}
            <span>{t('club.stadium')}</span><span>{c.stadium}</span>
            <span>{t('cl.ci.facilitiesRow')}</span><span>{t('cl.ci.seats', { n: c.seats })}</span>
            <span>{t('cl.ci.trainingGround')}</span><span>{t(`cl.ci.tg.${c.facilities >= 16 ? (c.youth >= 14 ? 5 : 4) : c.facilities >= 12 ? 3 : c.facilities >= 8 ? 2 : c.facilities >= 4 ? 1 : 0}`)}</span>
          </div></Panel>
          <Panel title={t('cl.ci.staff')}><div className="kv">
            <span>{c.manager !== -1 && g.staff[c.manager] ? <a className="link" onClick={() => nav({ name: 'staff', id: c.manager })}>{mgr}</a> : mgr}</span><span>{t('role.staff.manager')}</span>
            {staff.map((x) => [<span key={`n${x.id}`}><a className="link" onClick={() => nav({ name: 'staff', id: x.id })}>{x.first} {x.last}</a></span>, <span key={`r${x.id}`}>{t(`role.staff.${x.role}`)}</span>])}
          </div></Panel>
        </div>
      )}
      {v === 'squad' && <SquadTable players={squad(cid)} view="general" userClub={g.userClub} />}
      {v === 'transfers' && <Transfers cid={cid} />}
      {v === 'next' && <OrigNextMatch cid={cid} />}
      {v === 'fixtures' && <Fixtures cid={cid} />}
      {['stats', 'finances', 'income', 'expenditure'].includes(v) && <ClassicFinanceBody view={v as 'stats'} clubId={cid} modern />}
    </div>
  );
}
