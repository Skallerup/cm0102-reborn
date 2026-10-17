
import { Select } from '../select';
import { nationRanking, sortTable } from '../../game/competitions';
import { CL_SPOTS, LEAGUE_RULES, UEFA_SPOTS } from '../../game/leagues';
import { gs, squad } from '../../game/state';
import type { Competition, TableRow } from '../../game/types';
import { dateFmt, t } from '../../i18n';
import { ClubLink, Panel, PlayerLink, Tabs } from '../components';
import { useGame, useNav, useRouteState } from '../core';
import { Head } from './common';
import { resultStr, stageLabel } from './Fixtures';

export function Competitions({ id }: { id?: string }) {
  const g = useGame()!;
  const userComp = g.clubs[g.userClub]?.league;
  const comps = Object.values(g.comps);
  const [cid, setCid] = useRouteState<string>('cid', id ?? userComp ?? comps[0]?.id ?? '');
  const [tab, setTab] = useRouteState('tab', 'table');
  const comp = g.comps[id && id !== cid ? id : cid] ?? g.comps[cid];
  const ordered = comps.slice().sort((a, b) => order(a) - order(b) || a.name.localeCompare(b.name));
  return (
    <div>
      <Head title={comp?.name ?? t('nav.competitions')}>
        <Select value={comp?.id ?? ''} onChange={(v) => { setCid(v); setTab('table'); }} width={260}
          options={ordered.map((c) => ({ value: c.id, label: c.name, group: c.nation >= 0 ? g.nations[c.nation]?.name : t('comp.europe') }))} />
      </Head>
      {comp && (
        <>
          <Tabs tabs={[['table', comp.type === 'league' ? t('comp.table') : t('comp.overview')], ['fixtures', t('comp.fixtures')], ['scorers', t('comp.scorers')], ['history', t('comp.history')]]} value={tab} onChange={setTab} />
          {tab === 'table' && (comp.type === 'league' ? <LeagueTables comp={comp} /> : <CupView comp={comp} />)}
          {tab === 'fixtures' && <CompFixtures comp={comp} />}
          {tab === 'scorers' && <Scorers comp={comp} />}
          {tab === 'history' && <CompHistory comp={comp} />}
        </>
      )}
    </div>
  );
}

function order(c: Competition) {
  const g = gs();
  const user = g.clubs[g.userClub];
  if (user && c.id === user.league) return 0;
  if (user && c.nation === user.nation) return 1 + c.tier;
  if (c.id === 'CL') return 5;
  if (c.id === 'UEFA') return 6;
  return 10 + c.tier;
}

export function LeagueTable({ rows, comp, compact }: { rows: TableRow[]; comp: Competition; compact?: boolean }) {
  const g = gs();
  const { nav } = useNav();
  const sorted = sortTable(rows.slice());
  const rules = LEAGUE_RULES[comp.id];
  const n = sorted.length;
  const rank = nationRanking().indexOf(comp.nation);
  const cl = comp.tier === 1 && rank >= 0 ? CL_SPOTS[rank] ?? 0 : 0;
  const uefa = comp.tier === 1 && rank >= 0 ? UEFA_SPOTS[rank] ?? 0 : 0;
  const cls = (i: number, club: number) => {
    const c: string[] = [];
    if (club === g.userClub) c.push('me');
    if (rules?.promoted && i < rules.promoted) c.push('promo');
    else if (rules?.playoff && rules.playoff.seeds.some(([lg, pos]) => lg === comp.id && pos === i + 1)) c.push('playoff');
    else if (rules?.relegated && i >= n - rules.relegated) c.push('releg');
    else if (i < cl + uefa && !rules?.promoted) c.push('euro');
    return c.join(' ');
  };
  return (
    <table className="grid">
      <thead><tr><th className="num">#</th><th>{t('col.club')}</th><th className="num">{t('tbl.p')}</th>{!compact && <><th className="num">{t('tbl.w')}</th><th className="num">{t('tbl.d')}</th><th className="num">{t('tbl.l')}</th><th className="num">{t('tbl.gf')}</th><th className="num">{t('tbl.ga')}</th></>}<th className="num">{t('tbl.gd')}</th><th className="num">{t('tbl.pts')}</th>{!compact && <th>{t('col.form')}</th>}</tr></thead>
      <tbody>
        {sorted.map((r, i) => (
          <tr key={r.club} className={`clickable ${cls(i, r.club)}`} onClick={() => nav({ name: 'club', id: r.club })}>
            <td className="num">{i + 1}</td>
            <td><ClubLink id={r.club} /></td>
            <td className="num">{r.p}</td>
            {!compact && <><td className="num">{r.w}</td><td className="num">{r.d}</td><td className="num">{r.l}</td><td className="num">{r.gf}</td><td className="num">{r.ga}</td></>}
            <td className="num">{r.gf - r.ga > 0 ? '+' : ''}{r.gf - r.ga}</td>
            <td className="num"><b>{r.pts}</b></td>
            {!compact && <td className="muted">{r.form}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function LeagueTables({ comp }: { comp: Competition }) {
  if (comp.groups && comp.splitDone) {
    return (
      <div className="cols2">
        <Panel title={t('fix.champ')} className="flush"><LeagueTable rows={comp.groups.champ ?? []} comp={comp} /></Panel>
        <Panel title={t('fix.releg')} className="flush"><LeagueTable rows={comp.groups.releg ?? []} comp={{ ...comp, id: comp.id + '-rel' }} /></Panel>
      </div>
    );
  }
  return (
    <Panel className="flush">
      <LeagueTable rows={comp.table} comp={comp} />
      <div className="legend" style={{ padding: 8 }}>
        <span><i style={{ background: 'var(--accent2)' }} />{t('tbl.europe')}</span>
        <span><i style={{ background: 'var(--good)' }} />{t('tbl.promotion')}</span>
        <span><i style={{ background: 'var(--mid)' }} />{t('tbl.playoff')}</span>
        <span><i style={{ background: 'var(--bad)' }} />{t('tbl.relegation')}</span>
      </div>
    </Panel>
  );
}

function CupView({ comp }: { comp: Competition }) {
  const g = useGame()!;
  const stages = [...new Set(comp.ties.map((x) => x.stage))].reverse();
  return (
    <div>
      {comp.winner && <div className="insight good">{t('comp.winner')}: <ClubLink id={comp.winner} long /></div>}
      {comp.groups && (
        <div className="cols">
          {Object.entries(comp.groups).map(([k, rows]) => (
            <Panel key={k} title={`${t('fix.group')} ${k}`} className="flush"><LeagueTable rows={rows} comp={{ ...comp, tier: 9 }} compact /></Panel>
          ))}
        </div>
      )}
      {stages.map((s) => (
        <Panel key={s} title={t(`stage.${s}`)} className="flush">
          <table className="grid">
            <tbody>
              {comp.ties.filter((x) => x.stage === s).map((tie) => {
                const fx = tie.fx.map((id) => g.fixtures[id]).filter(Boolean);
                return (
                  <tr key={tie.id}>
                    <td className={tie.winner === tie.a ? 'good' : ''}><ClubLink id={tie.a} /></td>
                    <td className="center">{fx.map((f) => (f.result ? `${f.home === tie.a ? f.result.hg : f.result.ag}-${f.home === tie.a ? f.result.ag : f.result.hg}` : dateFmt(f.date))).join(' / ')}{fx.some((f) => f.result?.pens) ? ` (${t('fix.pens')})` : ''}</td>
                    <td className={tie.winner === tie.b ? 'good' : ''}><ClubLink id={tie.b} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>
      ))}
    </div>
  );
}

function CompFixtures({ comp }: { comp: Competition }) {
  const g = useGame()!;
  const { nav } = useNav();
  const list = Object.values(g.fixtures).filter((f) => f.comp === comp.id).sort((a, b) => a.date.localeCompare(b.date));
  const dates = [...new Set(list.map((f) => f.date))];
  const next = dates.find((d) => d >= g.date) ?? dates[dates.length - 1];
  const [date, setDate] = useRouteState(`date:${comp.id}`, next);
  const shown = list.filter((f) => f.date === date);
  const idx = dates.indexOf(date);
  return (
    <Panel title={date ? dateFmt(date, true) : ''} right={<div className="row">
      <button className="small" disabled={idx <= 0} onClick={() => setDate(dates[idx - 1])}>‹</button>
      <select value={date} onChange={(e) => setDate(e.target.value)}>{dates.map((d) => <option key={d} value={d}>{dateFmt(d)}</option>)}</select>
      <button className="small" disabled={idx >= dates.length - 1} onClick={() => setDate(dates[idx + 1])}>›</button>
    </div>} className="flush">
      <table className="grid">
        <tbody>
          {shown.map((f) => (
            <tr key={f.id} className={g.reports[f.id] ? 'clickable' : ''} onClick={() => g.reports[f.id] && nav({ name: 'report', id: f.id })}>
              <td className="muted">{stageLabel(f)}</td>
              <td className="right"><ClubLink id={f.home} /></td>
              <td className="center"><b>{resultStr(f)}</b></td>
              <td><ClubLink id={f.away} /></td>
              <td className="muted">{f.result?.scorers.slice(0, 4).map(([m, , pid]) => `${g.players[pid]?.last ?? '?'} ${m}'`).join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}

function Scorers({ comp }: { comp: Competition }) {
  const g = useGame()!;
  const clubs = comp.type === 'league' ? comp.clubs : comp.clubs;
  // Ligaer: ligamål. Pokaler: tæl fra kampenes målscorere
  let rows: { pid: number; goals: number }[];
  if (comp.type === 'league') {
    rows = clubs.flatMap((c) => squad(c)).filter((p) => p.stats.lgGoals > 0).map((p) => ({ pid: p.id, goals: p.stats.lgGoals }));
  } else {
    const m = new Map<number, number>();
    for (const f of Object.values(g.fixtures)) if (f.comp === comp.id && f.result) for (const [, , pid] of f.result.scorers) m.set(pid, (m.get(pid) ?? 0) + 1);
    rows = [...m.entries()].map(([pid, goals]) => ({ pid, goals }));
  }
  rows.sort((a, b) => b.goals - a.goals);
  return (
    <Panel className="flush">
      <table className="grid">
        <thead><tr><th className="num">#</th><th>{t('col.name')}</th><th>{t('col.club')}</th><th className="num">{t('col.goals')}</th></tr></thead>
        <tbody>
          {rows.slice(0, 25).map((r, i) => (
            <tr key={r.pid}><td className="num">{i + 1}</td><td><PlayerLink p={g.players[r.pid]} /></td><td>{g.players[r.pid] ? <ClubLink id={g.players[r.pid].club} /> : '-'}</td><td className="num"><b>{r.goals}</b></td></tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}

function CompHistory({ comp }: { comp: Competition }) {
  const g = useGame()!;
  const rows = g.seasonHistory.flatMap((s) => s.comps.filter((c) => c.id === comp.id).map((c) => ({ season: s.season, ...c }))).reverse();
  if (!rows.length) return <div className="empty">{t('comp.noHistory')}</div>;
  return (
    <Panel className="flush">
      <table className="grid">
        <thead><tr><th>{t('col.season')}</th><th>{t('comp.winner')}</th><th>{t('comp.runnerUp')}</th><th>{t('comp.topScorer')}</th><th>{t('comp.best')}</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.season}>
              <td>{r.season}/{String(r.season + 1).slice(2)}</td>
              <td><ClubLink id={r.winner} /></td>
              <td>{r.runnerUp ? <ClubLink id={r.runnerUp} /> : '-'}</td>
              <td>{r.topScorer ? <>{g.players[r.topScorer[0]] ? <PlayerLink p={g.players[r.topScorer[0]]} /> : '?'} ({r.topScorer[1]})</> : '-'}</td>
              <td>{r.best && g.players[r.best] ? <PlayerLink p={g.players[r.best]} /> : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}
