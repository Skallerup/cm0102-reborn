// Landsholdsfodbold: den aktuelle slutrunde (grupper og knockout), seneste landskampe og tidligere vindere.
import { useGame } from '../core';
import { dateFmt, natName, t } from '../../i18n';
import { Flag, Panel, Tabs } from '../components';
import { useRouteState } from '../core';
import { nationSquad, type IntlTournament } from '../../game/international';
import { act } from '../../game/actions';
import { PlayerLink } from '../components';
import { gs } from '../../game/state';
import type { JSX } from 'react';

export function International() {
  const g = useGame()!;
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

