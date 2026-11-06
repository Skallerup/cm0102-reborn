// Landsholdsfodbold: den aktuelle slutrunde (grupper og knockout), seneste landskampe og tidligere vindere.
import { useGame } from '../core';
import { dateFmt, natName, t } from '../../i18n';
import { Flag, Panel, Tabs } from '../components';
import { useRouteState } from '../core';
import { nationSquad, type IntlTournament } from '../../game/international';
import { act } from '../../game/actions';
import { ClubLink, PlayerLink } from '../components';
import { useNav } from '../core';
import { compName } from '../../i18n';
import { naturalRole } from '../../game/attributes';
import { ageOn } from '../../game/dates';
import type { Player } from '../../game/types';
import { gs } from '../../game/state';
import type { JSX } from 'react';

export function International({ nation }: { nation?: number }) {
  const g = useGame()!;
  if (nation !== undefined && g.nations[nation]) return <NationTeam n={nation} />;
  const [tab, setTab] = useRouteState('itab', 'tournament');
  const st = g.intl;
  const N = (n: number) => <span className="row" style={{ gap: 6, display: 'inline-flex' }}><Flag name={g.nations[n]?.name} />{natName(g.nations[n]?.name)}</span>;
  const tour = st?.tournament;
  return (
    <div>
      <h2>{t('intl.title')}</h2>
      {g.manager.nationalOffer !== undefined && (
        <div className="insight good row">
          <span className="grow">{t('intl.offerText', { nation: natName(g.nations[g.manager.nationalOffer]?.name) })}</span>
          <button className="primary" onClick={() => act({ t: 'nationalOffer', accept: true })}>{t('intl.accept')}</button>
          <button onClick={() => act({ t: 'nationalOffer', accept: false })}>{t('intl.decline')}</button>
        </div>
      )}
      {g.manager.national && (
        <Panel title={t('intl.myTeam', { nation: natName(g.nations[g.manager.national.nation]?.name) })} right={<button className="small danger" onClick={() => act({ t: 'resignNational' })}>{t('intl.resign')}</button>}>
          <div className="muted" style={{ marginBottom: 6 }}>{t('intl.myRecord', { since: dateFmt(g.manager.national.since), played: g.manager.national.played, won: g.manager.national.won })}</div>
          <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>{nationSquad(g.manager.national.nation).map((p) => <PlayerLink key={p.id} p={p} />)}</div>
        </Panel>
      )}
      <Tabs tabs={[['tournament', t('intl.tab.tournament')], ['results', t('intl.tab.results')], ['history', t('intl.tab.history')]]} value={tab} onChange={setTab} />
      {tab === 'tournament' && (!tour ? <Panel><div className="muted">{t('intl.none')}</div></Panel> : <Tournament t={tour} N={N} />)}
      {tab === 'results' && (
        <Panel className="flush">
          {!st?.results.length ? <div className="muted" style={{ padding: 12 }}>{t('intl.noResults')}</div> : (
            <table className="grid"><tbody>{st.results.slice(0, 60).map((r, i) => (
              <tr key={i}><td className="muted">{dateFmt(r.date)}</td><td>{N(r.home)}</td><td className="num"><b>{r.hg}-{r.ag}</b></td><td>{N(r.away)}</td><td className="muted">{t(`intl.kind.${r.kind}`)}{r.stage ? ` · ${t(`stage.${r.stage}`)}` : ''}</td></tr>
            ))}</tbody></table>
          )}
        </Panel>
      )}
      {tab === 'history' && (
        <Panel className="flush">
          {!st?.history.length ? <div className="muted" style={{ padding: 12 }}>{t('intl.noHistory')}</div> : (
            <table className="grid"><tbody>{st.history.map((h, i) => (
              <tr key={i}><td>{h.year}</td><td>{t(`intl.name.${h.name}`)}</td><td>🏆 {N(h.winner)}</td><td className="muted">{t('intl.runnerUp')}: {N(h.runnerUp)}</td></tr>
            ))}</tbody></table>
          )}
        </Panel>
      )}
    </div>
  );
}

function Tournament({ t: tour, N }: { t: IntlTournament; N: (n: number) => JSX.Element }) {
  const rows = (grp: number[]) => grp.map((n) => tour.table[n]).sort((a, b) => b.pts - a.pts || b.gf - b.ga - (a.gf - a.ga) || b.gf - a.gf);
  return (
    <div className="col">
      <Panel title={`${t(`intl.name.${tour.name}`)} ${tour.year}${tour.winner !== undefined ? ` – 🏆 ${natName(gs().nations[tour.winner]?.name)}` : ''}`}>
        <div className="grid-choices" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {tour.groups.map((grp, i) => (
            <div key={i}>
              <b>{t('intl.group', { g: String.fromCharCode(65 + i) })}</b>
              <table className="grid"><thead><tr><th /><th className="num">K</th><th className="num">+/-</th><th className="num">P</th></tr></thead>
                <tbody>{rows(grp).map((r) => <tr key={r.n}><td>{N(r.n)}</td><td className="num">{r.p}</td><td className="num">{r.gf}-{r.ga}</td><td className="num"><b>{r.pts}</b></td></tr>)}</tbody></table>
            </div>
          ))}
        </div>
      </Panel>
      {tour.ko.length > 0 && (
        <Panel title={t('intl.knockout')} className="flush">
          <table className="grid"><tbody>{tour.ko.map((k, i) => (
            <tr key={i}><td className="muted">{t(`stage.${k.stage}`)}</td><td>{N(k.a)}</td><td className="num"><b>{k.hg !== undefined ? `${k.hg}-${k.ag}${k.pens ? ` (${t('intl.pens')})` : ''}` : '–'}</b></td><td>{N(k.b)}</td></tr>
          ))}</tbody></table>
        </Panel>
      )}
    </div>
  );
}


/** Et lands landshold: de udtagne spillere, landets resultater og vej til landets liga */
function NationTeam({ n }: { n: number }) {
  const g = useGame()!;
  const { nav } = useNav();
  const squad = nationSquad(n);
  const results = (g.intl?.results ?? []).filter((r) => r.home === n || r.away === n).slice(0, 12);
  const top = g.leagueOrder.find((l) => g.leagues[l]?.nation === n && g.comps[l]);
  const coach = g.manager.national?.nation === n ? g.manager.name : '';
  const pos = ['GK', 'DEF', 'MID', 'ATT'];
  const grp = (p: Player) => { const r = naturalRole(p); return r === 'GK' ? 0 : ['CB', 'FB'].includes(r) ? 1 : ['DM', 'CM', 'WM', 'AM'].includes(r) ? 2 : 3; };
  return (
    <div>
      <h2 className="row" style={{ gap: 10 }}><Flag name={g.nations[n]?.name} />{natName(g.nations[n]?.name)}</h2>
      <div className="row" style={{ marginBottom: 8, gap: 8 }}>
        {top && <button className="small" onClick={() => nav({ name: 'competitions', id: top })}>{compName(g.leagues[top]?.name)}</button>}
        <button className="small" onClick={() => nav({ name: 'nation', id: n, tab: 'managers' })}>{t('intl.nationInfo')}</button>
        <button className="small" onClick={() => nav({ name: 'international' })}>{t('intl.title')}</button>
        {coach && <span className="tag">{t('intl.yourTeam')}</span>}
      </div>
      <Panel title={t('intl.squad', { n: squad.length })} className="flush">
        {!squad.length ? <div className="muted" style={{ padding: 12 }}>{t('intl.noSquad')}</div> : (
          <table className="grid"><thead><tr><th>{t('col.pos')}</th><th>{t('col.name')}</th><th>{t('col.club')}</th><th className="num">{t('col.age')}</th><th className="num">{t('intl.caps')}</th><th className="num">{t('intl.goals')}</th></tr></thead>
            <tbody>{squad.slice().sort((a, b) => grp(a) - grp(b) || b.ca - a.ca).map((p) => (
              <tr key={p.id}><td className="muted">{pos[grp(p)]}</td><td><PlayerLink p={p} /></td><td>{p.club ? <ClubLink id={p.club} /> : '–'}</td><td className="num">{ageOn(p.dob, g.date)}</td><td className="num">{p.caps}</td><td className="num">{p.intGoals}</td></tr>
            ))}</tbody></table>
        )}
      </Panel>
      {results.length > 0 && (
        <Panel title={t('intl.tab.results')} className="flush">
          <table className="grid"><tbody>{results.map((r, i) => (
            <tr key={i}><td className="muted">{dateFmt(r.date)}</td><td>{natName(g.nations[r.home]?.name)}</td><td className="num"><b>{r.hg}-{r.ag}</b></td><td>{natName(g.nations[r.away]?.name)}</td><td className="muted">{t(`intl.kind.${r.kind}`)}</td></tr>
          ))}</tbody></table>
        </Panel>
      )}
    </div>
  );
}
