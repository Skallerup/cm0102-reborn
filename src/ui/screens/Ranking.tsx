import { useEffect, useState } from 'react';
import { careerPoints, computeSeasonScore, leagueWeight, type SeasonScore } from '../../game/rating';
import { isMultiplayer } from '../../game/humans';
import { createProfile, fetchBoard, getProfile, rankingAvailable, submitPending, type Board, type RankRow } from '../../online/rank';
import { t } from '../../i18n';
import { Panel, Tabs } from '../components';
import { useGame, useRouteState } from '../core';
import { Head } from './common';

const lineText = (key: string, params?: Record<string, string | number>) => t(`score.${key}`, params?.stage ? { ...params, stage: t(`rank.stage.${params.stage}`) } : params);

function ScoreTable({ s }: { s: SeasonScore }) {
  return (
    <table className="grid">
      <tbody>
        {s.lines.map((l, i) => (
          <tr key={i}><td>{lineText(l.key, l.params)}</td><td className={`num ${l.pts > 0 ? 'good' : l.pts < 0 ? 'bad' : ''}`}>{l.pts > 0 ? '+' : ''}{l.pts}</td></tr>
        ))}
        <tr className="me"><td><b>{t('rank.total')}</b></td><td className="num"><b>{s.points}</b></td></tr>
      </tbody>
    </table>
  );
}

export function RankingScreen() {
  const g = useGame()!;
  const [tab, setTab] = useRouteState('tab', 'mine');
  return (
    <div>
      <Head title={t('nav.ranking')}>
        <Tabs tabs={[['mine', t('rank.mine')], ['boards', t('rank.boards')], ['how', t('rank.how')]]} value={tab} onChange={setTab} />
      </Head>
      {tab === 'mine' && <Mine />}
      {tab === 'boards' && (isMultiplayer(g) ? <div className="empty">{t('rank.singleOnly')}</div> : <Boards />)}
      {tab === 'how' && <How />}
    </div>
  );
}

function Mine() {
  const g = useGame()!;
  const live = computeSeasonScore(true);
  const past = (g.manager.scores ?? []).slice().reverse();
  return (
    <div className="cols">
      <Panel title={t('rank.liveTitle', { season: `${g.season}/${String(g.season + 1).slice(2)}` })}>
        {live ? <ScoreTable s={live} /> : <div className="muted">{t('rank.noLive')}</div>}
        <p className="muted" style={{ fontSize: 12 }}>{t('rank.liveHint')}</p>
      </Panel>
      <Panel title={t('rank.career', { pts: careerPoints() })} className="flush">
        {past.length === 0 ? <div className="empty">{t('rank.noSeasons')}</div> : (
          <table className="grid">
            <tbody>
              {past.map((s) => (
                <tr key={s.season}>
                  <td>{s.season}/{String(s.season + 1).slice(2)}</td>
                  <td>{s.clubName}</td>
                  <td className="muted">{s.leagueName}</td>
                  <td className="num"><b>{s.points}</b></td>
                  <td className="muted">{s.submitted ? '✓' : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
      {past[0] && (
        <Panel title={t('rank.lastSeason', { season: `${past[0].season}/${String(past[0].season + 1).slice(2)}` })}>
          <ScoreTable s={past[0]} />
        </Panel>
      )}
    </div>
  );
}

function Boards() {
  const g = useGame()!;
  const [profile, setProfile] = useState(getProfile());
  const [board, setBoard] = useRouteState<Board>('board', 'career');
  const [data, setData] = useState<{ rows: RankRow[]; me: { rank: number; points: number } | null; total: number } | null | 'loading'>('loading');
  const [name, setName] = useState(g.manager.name);
  const [err, setErr] = useState('');
  const myLeague = g.clubs[g.userClub]?.league ?? '';
  useEffect(() => {
    if (!rankingAvailable()) { setData(null); return; }
    let alive = true;
    setData('loading');
    submitPending().then(() => fetchBoard(board, myLeague)).then((d) => { if (alive) setData(d); });
    return () => { alive = false; };
  }, [board, profile]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!rankingAvailable()) return <div className="empty">{t('rank.offline')}</div>;

  const create = async () => {
    setErr('');
    const r = await createProfile(name);
    if (typeof r === 'string') setErr(t(`rank.err.${r}`));
    else setProfile(r);
  };
  const share = async () => {
    const me = data && data !== 'loading' ? data.me : null;
    const text = me ? t('rank.shareText', { rank: me.rank, pts: me.points, board: t(`rank.board.${board}`) }) : t('rank.shareInvite');
    const url = location.origin;
    try {
      if (navigator.share) await navigator.share({ title: 'CM 01/02 Reborn', text, url });
      else { await navigator.clipboard.writeText(`${text} ${url}`); setErr(t('rank.copied')); }
    } catch { /* afbrudt */ }
  };

  return (
    <div>
      {!profile ? (
        <Panel title={t('rank.createTitle')}>
          <p className="muted" style={{ marginTop: 0 }}>{t('rank.createHint')}</p>
          <div className="row">
            <input value={name} maxLength={24} onChange={(e) => setName(e.target.value)} placeholder={t('rank.namePlaceholder')} />
            <button className="primary" onClick={create}>{t('rank.create')}</button>
          </div>
          {err && <div className="bad" style={{ marginTop: 6 }}>{err}</div>}
        </Panel>
      ) : (
        <div className="row" style={{ marginBottom: 12, justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <span>{t('rank.youAre', { name: profile.name })}{data && data !== 'loading' && data.me ? <> · <b className="accent">{t('rank.position', { rank: data.me.rank, total: data.total })}</b></> : null}</span>
          <button onClick={share}>{t('rank.share')}</button>
        </div>
      )}
      {err && profile && <div className="muted">{err}</div>}
      <Tabs tabs={[['career', t('rank.board.career')], ['season', t('rank.board.season')], ['month', t('rank.board.month')], ...(myLeague ? [['league', t('rank.board.league', { league: g.leagues[myLeague]?.name ?? myLeague })] as [string, string]] : [])]} value={board} onChange={(v) => setBoard(v as Board)} />
      <Panel className="flush" style={{ marginTop: 12 }}>
        {data === 'loading' ? <div className="empty">{t('rank.loading')}</div> : !data ? <div className="empty">{t('rank.error')}</div> : data.rows.length === 0 ? <div className="empty">{t('rank.empty')}</div> : (
          <div className="table-wrap">
            <table className="grid">
              <thead><tr><th className="num">#</th><th>{t('rank.manager')}</th><th>{t('rank.club')}</th><th>{t('col.comp')}</th>{board === 'career' ? <th className="num">{t('rank.seasons')}</th> : <th>{t('rank.season')}</th>}<th className="num">{t('rank.points')}</th></tr></thead>
              <tbody>
                {data.rows.map((r, i) => {
                  const mine = board === 'career' ? r.id === g.id : r.id.startsWith(`${g.id}:`);
                  return (
                    <tr key={r.id} className={mine ? 'me' : ''}>
                      <td className="num">{i + 1}</td>
                      <td>{r.name}</td>
                      <td>{r.club}</td>
                      <td className="muted">{r.league}</td>
                      {board === 'career' ? <td className="num">{r.seasons ?? ''}</td> : <td>{r.season ? `${r.season}/${String(r.season + 1).slice(2)}` : ''}</td>}
                      <td className="num"><b>{r.points}</b></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      <p className="muted" style={{ fontSize: 12 }}>{t('rank.fairness')}</p>
    </div>
  );
}

function How() {
  const g = useGame()!;
  const lw = g.clubs[g.userClub] ? leagueWeight(g.clubs[g.userClub].league) : 1;
  return (
    <Panel title={t('rank.how')}>
      <p style={{ marginTop: 0, lineHeight: 1.55 }}>{t('rank.howIntro')}</p>
      <ul style={{ lineHeight: 1.7 }}>
        {['position', 'expectation', 'title', 'promotion', 'relegation', 'cup', 'cl', 'uefa', 'board', 'sacked', 'finance', 'youth'].map((k) => <li key={k}>{t(`rank.howLine.${k}`)}</li>)}
      </ul>
      <p className="muted">{t('rank.howWeight', { w: lw.toFixed(2) })}</p>
    </Panel>
  );
}
