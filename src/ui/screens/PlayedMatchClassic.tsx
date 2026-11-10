// En spillet kamp vist som kampskærmen efter slutfløjt (klassisk tema, brugerønske 2026-11-10): samme faner
// (Match Overview, Match Stats, Action Zones, Match Report), samme underfaner (Team Stats, Player Ratings, Latest Scores,
// League Table) og samme sidebjælke – bygget af kamprapporten (MatchReport), ikke af en kørende simulering.
// Sidebjælkens taktikknapper viser holdets Team Stats (rapporten gemmer ikke taktikken), Continue går tilbage.
import { useEffect, useState } from 'react';
import { ZONES } from '../../game/engine/match';
import { fixturesOn } from '../../game/state';
import { compName, t } from '../../i18n';
import { useClassicMatchSide } from '../classic';
import { commentaryText } from '../commentary';
import { Tabs } from '../components';
import { ClassicSub } from '../classic';
import { useGame, useNav, useRouteState } from '../core';
import { loadMatchTexts } from '../matchTexts';
import { Head } from './common';
import { CmScoreboard, CxLiveTable, CxMatchStats, CxOverview, CxRatings, CxReport, CxScores, CxTeamStats, CxZones, aggText, cxRowsReport, teamColors } from './Match';

export function PlayedMatchClassic({ id }: { id: number }) {
  const g = useGame()!;
  const { back } = useNav();
  const f = g.fixtures[id];
  const rep = g.reports[id];
  // originalens kommentarlinjer (CM 01/02) – tegn igen, når de er hentet
  const [, setTexts] = useState(0);
  useEffect(() => { void loadMatchTexts().then(() => setTexts((x) => x + 1)); }, []);
  const [tab, setTab] = useRouteState('tab', 'overview');
  const me: 0 | 1 = f && f.away === g.userClub ? 1 : 0;
  const home = f ? g.clubs[f.home]?.short ?? '?' : '', away = f ? g.clubs[f.away]?.short ?? '?' : '';
  const minute = rep?.et ? 120 : 90;
  useClassicMatchSide(f && rep ? {
    minute: String(minute), venue: `${g.clubs[f.home]?.stadium ?? ''}${g.clubs[f.home]?.short ? `, ${g.clubs[f.home].short}` : ''}`, comp: f.comp,
    kicked: true, paused: false, finished: true, home, away, me, speed: 1,
  } : null, {
    kick: () => {}, pause: () => {}, speed: () => {}, ok: () => {}, cancel: () => {},
    tactics: (side) => setTab(side === 0 ? 'hstats' : 'astats'),
    cont: back,
  });
  if (!f || !rep) return <Head title={t('report.missing')} />;
  const colors = teamColors(f.home, f.away, me);
  const st = rep.stats;
  const ctx = { home, away, score: `${home} ${st[0].goals}-${st[1].goals} ${away}`, ref: rep.referee?.name };
  // kommentaren som på kampskærmen (spil-for-spil-linjerne "pl-…" vises ikke i Match Overview)
  const lines = rep.commentary.map((l, i) => ({ l, i })).filter(({ l }) => !l.k.startsWith('pl-'))
    .map(({ l, i }) => ({ text: commentaryText(l, ctx, i), cls: l.k.startsWith('goal') && l.k !== 'goal-offside' ? 'goal' : l.hi ? 'hi' : '', m: l.m, k: l.k, t: l.t, ci: i }));
  const others = fixturesOn(f.date).map((fid) => g.fixtures[fid]).filter((x) => x && x.id !== id && x.result && x.comp === f.comp);
  // Action Zones: hvor bolden var (tredjedele) fra rapportens varmekort – samme inddeling som den kørende kamp
  const z: [number, number, number] = [0, 0, 0];
  const zp: [number, number][] = [[0, 0], [0, 0], [0, 0]];
  rep.heat.forEach((h, side) => h.forEach((v, zone) => { const band = Math.floor(zone / ZONES.lanes); const zi = band <= 1 ? 0 : band === 2 ? 1 : 2; z[zi] += v; zp[zi][side] += v; }));
  const goals = rep.events.filter((e) => e.k === 'goal');
  const ht: [number, number] = [goals.filter((e) => e.t === 0 && e.m <= 45).length, goals.filter((e) => e.t === 1 && e.m <= 45).length];
  const rows = [cxRowsReport(rep, 0), cxRowsReport(rep, 1)] as const;
  return (
    <div className="match-screen">
      <CmScoreboard home={f.home} away={f.away} hg={st[0].goals} ag={st[1].goals} colors={colors} classic minute={t('match.ft')} agg={aggText(f, st[0].goals, st[1].goals)} />
      <Tabs tabs={[['overview', t('match.overview')], ['stats', t('cl.mt.stats')], ['zones', t('cl.mt.zones')], ['report', t('cl.mt.report')]]} value={tab} onChange={setTab} />
      {tab === 'overview' && (
        <CxOverview f={f} colors={colors} line={lines.at(-1)} poss={[]} half={t('match.ft')} ht={ht} quiet flash={false}
          injuries={rep.events.filter((e) => e.k === 'injury' && e.p).map((e) => ({ t: e.t, p: e.p!, m: e.m }))}
          reds={rep.events.filter((e) => e.k === 'red' && e.p).map((e) => ({ t: e.t, p: e.p!, m: e.m }))}
          shootout={rep.shootout} goals={goals.map((e) => ({ t: e.t, p: e.p ?? 0, m: e.m, og: e.og, pen: e.pen }))} />
      )}
      {tab === 'stats' && <CxMatchStats st={st} />}
      {tab === 'zones' && <CxZones z={z} zp={zp} st={st} colors={colors} />}
      {tab === 'report' && <CxReport lines={lines} commentary={rep.commentary} finished ctx={ctx} />}
      {tab === 'hstats' && <CxTeamStats rows={rows[0]} />}
      {tab === 'astats' && <CxTeamStats rows={rows[1]} />}
      {tab === 'ratings' && <CxRatings rows={rows} mom={rep.mom} />}
      {tab === 'table' && <CxLiveTable f={f} live={[st[0].goals, st[1].goals]} others={others} minute={minute} finished kicked />}
      {tab === 'scores' && <CxScores own={{ f, scorers: goals.map((e) => [e.m, e.t, e.og ? undefined : e.p] as [number, number, number?]) }} others={others} minute={minute} finished title={t('cl.mt.latest', { comp: compName(g.comps[f.comp]?.name) })} />}
      <ClassicSub items={[['hstats', t('cl.mt.teamStats', { club: home })], ['ratings', t('match.ratings')], ['scores', t('cl.mt.scores')], ...(g.comps[f.comp]?.type === 'league' ? [['table', t('cl.mt.leagueTable')]] : []), ['astats', t('cl.mt.teamStats', { club: away })]].map(([k, l]) => ({ key: k, label: l, on: tab === k, onClick: () => setTab(k) }))} />
    </div>
  );
}
