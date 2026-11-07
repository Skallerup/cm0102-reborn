import { useEffect, useRef } from 'react';

import { Select } from '../select';
import { nationRanking, sortTable } from '../../game/competitions';
import { CL_SPOTS, CONF_SPOTS, LEAGUE_RULES, UEFA_SPOTS } from '../../game/leagues';
import { isOriginal2001 } from '../../game/rules2001';
import { gs, squad } from '../../game/state';
import type { Club, Competition, Player, TableRow } from '../../game/types';
import { compName, dateFmt, t, natName } from '../../i18n';
import { ClubLink, Panel, PlayerLink, Rating, Table, Tabs, type Col } from '../components';
import { useGame, useNav, useRouteState } from '../core';
import { Head } from './common';
import { isRetro } from '../theme';
import { resultStr, stageLabel } from './Fixtures';
import { ClassicCup } from './CupClassic';
import { ClassicSub, cxShortDate } from '../classic';

export function Competitions({ id }: { id?: string }) {
  const g = useGame()!;
  const { nav } = useNav();
  const userComp = g.clubs[g.userClub]?.league;
  const comps = Object.values(g.comps);
  const [cid, setCid] = useRouteState<string>('cid', id ?? userComp ?? comps[0]?.id ?? '');
  const [tab, setTab] = useRouteState('tab', 'table');
  // åbnes skærmen med en ny turnering (link/menu), skifter den dertil – men valget i listen gælder bagefter
  const lastId = useRef(id);
  useEffect(() => { if (id && id !== lastId.current) { lastId.current = id; setCid(id); } }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  const comp = g.comps[cid] ?? (id ? g.comps[id] : undefined);
  const ordered = comps.slice().sort((a, b) => order(a) - order(b) || a.name.localeCompare(b.name));
  return (
    <div>
      <Head title={compName(comp?.name) ?? t('nav.competitions')}>
        <Select value={comp?.id ?? ''} onChange={(v) => { setCid(v); setTab('table'); }} width={260}
          options={ordered.map((c) => ({ value: c.id, label: compName(c.name), group: g.draft ? t('dr.title') : c.nation >= 0 ? natName(g.nations[c.nation]?.name) : t('comp.europe') }))} />
      </Head>
      {comp && isRetro() && comp.type !== 'league' && <ClassicCup comp={comp} />}
      {/* klassisk liga (CM 01/02): Table · Results · Fixtures · Schedule øverst; Team Stats · Player Stats · Referee Stats · Awards ▸ · History ▸ nederst */}
      {comp && isRetro() && comp.type === 'league' && (
        <>
          <Tabs tabs={[['table', t('comp.table')], ['results', t('cl.lg.results')], ['fixtures', t('comp.fixtures')], ['schedule', t('cl.lg.schedule')]]} value={['table', 'results', 'fixtures', 'schedule'].includes(tab) ? tab : ''} onChange={setTab} />
          {tab === 'table' && <><div className="cx-subtitle">{t('cl.lg.table')}</div><LeagueTables comp={comp} /></>}
          {tab === 'results' && <CompFixtures comp={comp} mode="results" />}
          {tab === 'fixtures' && <CompFixtures comp={comp} mode="fixtures" />}
          {tab === 'schedule' && <CompSchedule comp={comp} onPick={() => setTab('fixtures')} />}
          {tab === 'stats' && <LeagueStats comp={comp} />}
          {tab === 'scorers' && <Scorers comp={comp} />}
          {tab === 'history' && <CompHistory comp={comp} />}
          <ClassicSub items={[
            { key: 'stats', label: t('cl.lg.teamStats'), on: tab === 'stats', onClick: () => setTab('stats') },
            { key: 'scorers', label: t('cl.lg.playerStats'), on: tab === 'scorers', onClick: () => setTab('scorers') },
            { key: 'ref', label: t('cl.lg.refStats'), disabled: true },
            { key: 'awards', label: t('cl.cm.awards'), arrow: true, onClick: () => nav({ name: 'awards' }) },
            { key: 'history', label: t('comp.history'), arrow: true, on: tab === 'history', onClick: () => setTab('history') },
          ]} />
        </>
      )}
      {comp && !isRetro() && (
        <>
          <Tabs tabs={[['table', comp.type === 'league' ? t('comp.table') : t('comp.overview')], ['fixtures', t('comp.fixtures')], ['scorers', t('comp.scorers')], ...(comp.type === 'league' ? [['stats', t('comp.stats')] as [string, string]] : []), ['history', t('comp.history')]]} value={tab} onChange={setTab} />
          {tab === 'table' && (comp.type === 'league' ? <LeagueTables comp={comp} /> : <CupView comp={comp} />)}
          {tab === 'fixtures' && <CompFixtures comp={comp} />}
          {tab === 'scorers' && <Scorers comp={comp} />}
          {tab === 'stats' && comp.type === 'league' && <LeagueStats comp={comp} />}
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
  if (c.id === 'UECL') return 7;
  return 10 + c.tier;
}

/** "1st", "2nd" … på engelsk, "1." på dansk */
export function ordinal(n: number): string {
  if (t('cl.locale').startsWith('da')) return `${n}.`;
  const s = n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th';
  return `${n}${s}`;
}

export function LeagueTable({ rows, comp, compact, offset = 0, zones }: { rows: TableRow[]; comp: Competition; compact?: boolean; offset?: number; zones?: (i: number) => string }) {
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
    else if (g.clubs[club]?.manager === -1) c.push('rival');
    // kontinental ligafase: kvalifikationszoner sættes udefra
    if (zones) { const z = zones(i); if (z) c.push(z); return c.join(' '); }
    if (rules?.promoted && i < rules.promoted) c.push('promo');
    else if (rules?.playoff && rules.playoff.seeds.some(([lg, pos]) => lg === comp.id && pos === i + 1)) c.push('playoff');
    else if (rules?.relegated && i >= n - rules.relegated) c.push('releg');
    else if (i < cl + uefa && !rules?.promoted) c.push('euro');
    return c.join(' ');
  };
  if (isRetro() && !compact) {
    // klassisk tema: placering som blå knap, klubnavn i stort, grå kolonneknapper, point i lilla –
    // og en stiplet gul linje hvor en zone (op-/nedrykning, Europa) slutter
    const zone = (i: number) => cls(i, -1).split(' ').filter((x) => x !== 'me' && x !== 'rival').join(' ');
    return (
      <div className="cx-tbl-wrap">
        <table className="cx-tbl cx-league">
          <thead><tr><th className="btn-col" /><th className="btn-col" />{['cl.lg.pld', 'cl.lg.won', 'cl.lg.drn', 'cl.lg.lst', 'cl.lg.for', 'cl.lg.ag', 'cl.lg.pts'].map((k) => <th key={k} className="c-num">{t(k)}</th>)}</tr></thead>
          <tbody>
            {sorted.map((r, i) => (
              <tr key={r.club} className={`${i > 0 && zone(i) !== zone(i - 1) ? 'zone-start' : ''} ${zone(i)}`}>
                <td className="btn-col"><span className="cx-lg-pos">{ordinal(i + 1 + offset)}</span></td>
                <td className={`cx-lg-club ${r.club === g.userClub ? 'me' : ''}`} onClick={() => nav({ name: 'club', id: r.club })}>{g.clubs[r.club]?.short}</td>
                <td className="c-num">{r.p}</td><td className="c-num">{r.w}</td><td className="c-num">{r.d}</td><td className="c-num">{r.l}</td>
                <td className="c-num">{r.gf}</td><td className="c-num">{r.ga}</td><td className="c-val">{r.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return (
    <table className="grid">
      <thead><tr><th className="num">#</th><th>{t('col.club')}</th><th className="num">{t('tbl.p')}</th>{!compact && <><th className="num">{t('tbl.w')}</th><th className="num">{t('tbl.d')}</th><th className="num">{t('tbl.l')}</th><th className="num">{t('tbl.gf')}</th><th className="num">{t('tbl.ga')}</th></>}<th className="num">{t('tbl.gd')}</th><th className="num">{t('tbl.pts')}</th>{!compact && <th>{t('col.form')}</th>}</tr></thead>
      <tbody>
        {sorted.map((r, i) => (
          <tr key={r.club} className={`clickable ${cls(i, r.club)}`} onClick={() => nav({ name: 'club', id: r.club })}>
            <td className="num">{i + 1 + offset}</td>
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

export function LeagueTables({ comp }: { comp: Competition }) {
  if (comp.groups && comp.splitDone) {
    return (
      <div className="cols2">
        <Panel title={t('fix.champ')} className="flush"><LeagueTable rows={comp.groups.champ ?? []} comp={comp} /></Panel>
        <Panel title={t('fix.releg')} className="flush"><LeagueTable rows={comp.groups.releg ?? []} comp={{ ...comp, id: comp.id + '-rel' }} offset={comp.groups.champ?.length ?? 0} /></Panel>
      </div>
    );
  }
  return (
    <Panel className="flush">
      <LeagueTable rows={comp.table} comp={comp} />
      {!gs().draft && <div className="legend" style={{ padding: 8 }}>
        <span><i style={{ background: 'var(--accent2)' }} />{t('tbl.europe')}</span>
        <span><i style={{ background: 'var(--good)' }} />{t('tbl.promotion')}</span>
        <span><i style={{ background: 'var(--mid)' }} />{t('tbl.playoff')}</span>
        <span><i style={{ background: 'var(--bad)' }} />{t('tbl.relegation')}</span>
      </div>}
    </Panel>
  );
}

function CupView({ comp }: { comp: Competition }) {
  const g = useGame()!;
  const stages = [...new Set(comp.ties.map((x) => x.stage))].reverse();
  return (
    <div>
      {comp.winner && <div className="insight good">{t('comp.winner')}: <ClubLink id={comp.winner} long /></div>}
      {comp.type === 'continental' && comp.table.length > 0 && (
        <Panel title={t('stage.LP')} className="flush">
          <LeagueTable rows={comp.table} comp={comp} zones={(i) => (i < 8 ? 'euro' : i < 24 ? 'playoff' : 'releg')} />
          <div className="legend" style={{ padding: 8 }}>
            <span><i style={{ background: 'var(--accent2)' }} />{t('cl.toR16')}</span>
            <span><i style={{ background: 'var(--mid)' }} />{t('cl.toPlayoff')}</span>
            <span><i style={{ background: 'var(--bad)' }} />{t('cl.out')}</span>
          </div>
        </Panel>
      )}
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

/** Schedule (CM 01/02): alle spilledage med antal kampe – et klik viser dagens kampe */
function CompSchedule({ comp, onPick }: { comp: Competition; onPick: () => void }) {
  const g = useGame()!;
  const list = Object.values(g.fixtures).filter((f) => f.comp === comp.id);
  const days = [...new Set(list.map((f) => f.date))].sort();
  const [, setDate] = useRouteState(`date:${comp.id}`, days[0]);
  return (
    <div className="cx-tbl-wrap"><table className="cx-tbl"><tbody>{days.map((d) => {
      const n = list.filter((f) => f.date === d).length, played = list.filter((f) => f.date === d && f.result).length;
      return <tr key={d} className="clickable" onClick={() => { setDate(d); onPick(); }}><td className="btn-col"><span className="cx-rowbtn">{cxShortDate(d)}</span></td><td className="c-name">{t('cl.lg.games', { n })}</td><td className="c-yel">{played === n ? t('cl.lg.played') : played ? `${played}/${n}` : ''}</td></tr>;
    })}</tbody></table></div>
  );
}

function CompFixtures({ comp, mode }: { comp: Competition; mode?: 'results' | 'fixtures' }) {
  const g = useGame()!;
  const { nav } = useNav();
  const all = Object.values(g.fixtures).filter((f) => f.comp === comp.id).sort((a, b) => a.date.localeCompare(b.date));
  // Results: kun spillede dage, Fixtures: kun kommende (klassisk)
  const list = mode === 'results' ? all.filter((f) => f.result) : mode === 'fixtures' ? all.filter((f) => !f.result) : all;
  const dates = [...new Set(list.map((f) => f.date))];
  const next = mode === 'results' ? dates[dates.length - 1] : dates.find((d) => d >= g.date) ?? dates[dates.length - 1];
  const [date0, setDate] = useRouteState(`date:${comp.id}`, next);
  const date = dates.includes(date0) ? date0 : next;
  if (!dates.length) return <div className="cx-empty">{t(mode === 'results' ? 'cl.lg.noResults' : 'cl.lg.noFixtures')}</div>;
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
              <td className="muted">{f.result?.scorers.slice(0, 4).map(([m, , pid, og]) => `${g.players[pid]?.last ?? '?'}${og ? ` (${t('match.og')})` : ''} ${m}'`).join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}

export function Scorers({ comp }: { comp: Competition }) {
  const g = useGame()!;
  const clubs = comp.type === 'league' ? comp.clubs : comp.clubs;
  // Ligaer: ligamål. Pokaler: tæl fra kampenes målscorere
  let rows: { pid: number; goals: number }[];
  if (comp.type === 'league') {
    rows = clubs.flatMap((c) => squad(c)).filter((p) => p.stats.lgGoals > 0).map((p) => ({ pid: p.id, goals: p.stats.lgGoals }));
  } else {
    const m = new Map<number, number>();
    for (const f of Object.values(g.fixtures)) if (f.comp === comp.id && f.result) for (const [, , pid, og] of f.result.scorers) if (!og) m.set(pid, (m.get(pid) ?? 0) + 1);
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

/** Ligaens statistik: spillernes toplister og holdenes kampstatistik */
function LeagueStats({ comp }: { comp: Competition }) {
  const g = useGame()!;
  const ps = comp.clubs.flatMap((c) => squad(c));
  const maxPlayed = Math.max(1, ...comp.table.map((r) => r.p));
  const avg = (p: Player) => p.stats.ratingSum / Math.max(1, p.stats.ratingCount);
  const top = (list: Player[], v: (p: Player) => number) => list.filter((p) => v(p) > 0).sort((a, b) => v(b) - v(a)).slice(0, 10);
  const boards: { key: string; list: Player[]; val: (p: Player) => string; rating?: true }[] = [
    { key: 'rating', list: top(ps.filter((p) => p.stats.ratingCount >= Math.max(3, maxPlayed * 0.4)), avg), val: (p) => avg(p).toFixed(2), rating: true as const },
    { key: 'assists', list: top(ps, (p) => p.stats.assists), val: (p) => String(p.stats.assists) },
    { key: 'ga', list: top(ps, (p) => p.stats.goals + p.stats.assists), val: (p) => `${p.stats.goals}+${p.stats.assists}` },
    { key: 'mom', list: top(ps, (p) => p.stats.mom), val: (p) => String(p.stats.mom) },
    { key: 'cards', list: top(ps, (p) => p.stats.yellows + p.stats.reds * 3), val: (p) => `${p.stats.yellows}/${p.stats.reds}` },
  ];
  const clubs = comp.clubs.map((id) => g.clubs[id]).filter((c): c is Club => !!c && !!c.lgStats?.n);
  const per = (c: Club, v: number) => v / Math.max(1, c.lgStats!.n);
  const cols: Col<Club>[] = [
    { key: 'club', label: t('col.club'), render: (c) => <ClubLink id={c.id} />, sort: (c) => c.name },
    { key: 'n', label: t('col.apps'), render: (c) => c.lgStats!.n, sort: (c) => c.lgStats!.n, className: 'num' },
    { key: 'xg', label: 'xG', render: (c) => c.lgStats!.xg.toFixed(1), sort: (c) => c.lgStats!.xg, className: 'num' },
    { key: 'xga', label: 'xGA', render: (c) => c.lgStats!.xga.toFixed(1), sort: (c) => -c.lgStats!.xga, className: 'num', title: t('stats.xgaHint') },
    { key: 'xgd', label: t('stats.xgd'), render: (c) => { const d = c.lgStats!.xg - c.lgStats!.xga; return <span className={d >= 0 ? 'good' : 'bad'}>{d >= 0 ? '+' : ''}{d.toFixed(1)}</span>; }, sort: (c) => c.lgStats!.xg - c.lgStats!.xga, className: 'num' },
    { key: 'shots', label: t('stats.shots'), render: (c) => per(c, c.lgStats!.shots).toFixed(1), sort: (c) => per(c, c.lgStats!.shots), className: 'num' },
    { key: 'sot', label: t('stats.sot'), render: (c) => per(c, c.lgStats!.sot).toFixed(1), sort: (c) => per(c, c.lgStats!.sot), className: 'num' },
    { key: 'poss', label: t('stats.poss'), render: (c) => `${Math.round(per(c, c.lgStats!.poss))}%`, sort: (c) => per(c, c.lgStats!.poss), className: 'num' },
    { key: 'cs', label: t('stats.cs'), render: (c) => c.lgStats!.cs, sort: (c) => c.lgStats!.cs, className: 'num' },
    { key: 'cards', label: t('stats.cards'), render: (c) => `${c.lgStats!.yel}${c.lgStats!.red ? ` / ${c.lgStats!.red}` : ''}`, sort: (c) => c.lgStats!.yel + c.lgStats!.red * 3, className: 'num' },
  ];
  return (
    <div className="col">
      <Panel title={t('stats.teams')} className="flush">
        {clubs.length ? <div className="table-wrap"><Table rows={clubs} cols={cols} rowKey={(c) => c.id} initialSort="xgd" rowClass={(c) => (c.id === g.userClub ? 'me' : '')} /></div>
          : <div className="muted" style={{ padding: 12 }}>{t('stats.noTeamStats')}</div>}
      </Panel>
      <div className="cols3">
        {boards.map((b) => (
          <Panel key={b.key} title={t(`stats.${b.key}`)} className="flush">
            <table className="grid">
              <tbody>
                {b.list.length === 0 && <tr><td className="muted">{t('common.none')}</td></tr>}
                {b.list.map((p, i) => (
                  <tr key={p.id} className={p.club === g.userClub ? 'me' : ''}><td className="num">{i + 1}</td><td><PlayerLink p={p} /></td><td><ClubLink id={p.club} /></td><td className="num nowrap"><b>{b.rating ? <Rating r={avg(p)} digits={2} /> : b.val(p)}</b></td></tr>
                ))}
              </tbody>
            </table>
          </Panel>
        ))}
      </div>
      <div className="muted" style={{ fontSize: 12 }}>{t('stats.note')}</div>
    </div>
  );
}

export function CompHistory({ comp }: { comp: Competition }) {
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

/**
 * UEFA Coefficients (CM 01/02): landene i rækkefølge med pladser i Champions League (ECC), UEFA Cup og den tredje turnering
 * (INTER = Intertoto i 2001, ellers Conference League) og koefficienten. Koefficienten er *estimeret*: et grundtal ud fra de
 * fem bedste klubbers omdømme (de foregående sæsoner) plus sæsonens europæiske point (sejr 2, uafgjort 1) pr. deltagende klub.
 */
export function UefaCoefficients() {
  const g = gs();
  const { nav } = useNav();
  const ranking = nationRanking();
  const reps = new Map<number, number[]>();
  for (const c of Object.values(g.clubs)) if (g.leagues[c.league]?.tier === 1) reps.set(c.nation, [...(reps.get(c.nation) ?? []), c.rep]);
  const pts = new Map<number, number>(), clubs = new Map<number, Set<number>>();
  for (const f of Object.values(g.fixtures)) {
    if (!f.result || g.comps[f.comp]?.nation !== -1) continue;
    for (const [club, gf, ga] of [[f.home, f.result.hg, f.result.ag], [f.away, f.result.ag, f.result.hg]] as const) {
      const n = g.clubs[club]?.nation;
      if (n === undefined) continue;
      pts.set(n, (pts.get(n) ?? 0) + (gf > ga ? 2 : gf === ga ? 1 : 0));
      clubs.set(n, (clubs.get(n) ?? new Set()).add(club));
    }
  }
  const coef = (n: number) => {
    const top = (reps.get(n) ?? []).sort((a, b) => b - a).slice(0, 5);
    const base = Math.max(0, (top.reduce((s, v) => s + v, 0) / Math.max(1, top.length) - 40) * 1.4);
    return base + (pts.get(n) ?? 0) / Math.max(1, clubs.get(n)?.size ?? 1);
  };
  const old = isOriginal2001();
  return (
    <div>
      <Head title={t('cl.cm.coeff')} />
      <div className="cx-subtitle">{g.season}/{old ? String(g.season + 1).slice(3) : String(g.season + 1).slice(2)}</div>
      <div className="cx-tbl-wrap cx-coef">
        <table className="cx-tbl cx-league">
          <thead><tr><th className="btn-col" /><th className="btn-col" /><th className="c-num">ECC</th><th className="c-num">UEFA</th><th className="c-num">{old ? 'INTER' : 'UECL'}</th><th className="c-num">{t('cl.coef.coef')}</th></tr></thead>
          <tbody>{ranking.map((n, i) => (
            <tr key={n}>
              <td className="btn-col"><span className="cx-lg-pos">{ordinal(i + 1)}</span></td>
              <td className="cx-lg-club" onClick={() => nav({ name: 'international', id: n })}>{natName(g.nations[n]?.name)}</td>
              <td className="c-num c-yel">{CL_SPOTS[i] ?? 0}</td><td className="c-num c-yel">{UEFA_SPOTS[i] ?? 0}</td><td className="c-num c-yel">{CONF_SPOTS[i] ?? 0}</td>
              <td className="c-val">{coef(n).toFixed(2)}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
