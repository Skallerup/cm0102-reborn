// Kampdag i klassisk tema: dagens kampe pr. turnering (som originalens "Evening Fixtures"), én turnering ad gangen.
// Continue Game i venstre kolonne fører videre til ens egen kamp.
import type { Fixture } from '../../game/types';
import { compName, t } from '../../i18n';
import { useGame, useNav, useRouteState } from '../core';
import { CxLink, clubRoute } from '../classic';
import { Head } from './common';
import { stageLabel } from './Fixtures';

export function MatchDay({ id }: { id: number }) {
  const g = useGame()!;
  const { nav } = useNav();
  const mine = g.fixtures[id];
  const date = mine?.date ?? g.date;
  const today = Object.values(g.fixtures).filter((f) => f.date === date);
  // ens egen turnering først, derefter de øvrige
  const comps = [...new Set(today.map((f) => f.comp))].sort((a, b) => Number(b === mine?.comp) - Number(a === mine?.comp) || (compName(g.comps[a]?.name) ?? '').localeCompare(compName(g.comps[b]?.name) ?? ''));
  const [i, setI] = useRouteState('mdi', 0);
  const cid = comps[Math.min(i, comps.length - 1)];
  const comp = g.comps[cid];
  const list = today.filter((f) => f.comp === cid).sort((a, b) => Number(isMine(b)) - Number(isMine(a)) || (g.clubs[a.home]?.name ?? '').localeCompare(g.clubs[b.home]?.name ?? ''));
  function isMine(f: Fixture) { return f.home === g.userClub || f.away === g.userClub; }
  const stages = [...new Set(list.map((f) => stageLabel(f)))];
  const code = (club: number) => g.nations[g.clubs[club]?.nation]?.code ?? '';
  const name = (club: number) => <span className={club === g.userClub ? 'me' : ''}>{g.clubs[club] ? <CxLink to={clubRoute(club)}>{g.clubs[club].name}</CxLink> : '?'}</span>;
  const d = new Date(`${date}T12:00:00`).toLocaleDateString(t('cl.locale'), { weekday: 'long', day: 'numeric', month: 'long' });
  return (
    <div>
      <Head title={compName(comp?.name) ?? t('nav.fixtures')}>
        <button className="cx-greybtn" disabled={i <= 0} onClick={() => setI(i - 1)}>‹‹</button>
        <span className="cx-md-count">{t('cl.md.count', { n: Math.min(i, comps.length - 1) + 1, of: comps.length })}</span>
        <button className="cx-greybtn" disabled={i >= comps.length - 1} onClick={() => setI(i + 1)}>››</button>
        <span className="grow" />
        {comp && <button className="cx-greybtn" onClick={() => nav({ name: 'competitions', id: cid })}>{t('cl.md.competition')}</button>}
      </Head>
      <div className="cx-subtitle">{t('cl.md.title')}</div>
      <div className="cx-md-date">{d}</div>
      {stages.map((st) => (
        <div key={st} className="cx-md">
          <div className="cx-md-stage">{st}</div>
          {list.filter((f) => stageLabel(f) === st).map((f) => (
            <div key={f.id} className={`cx-md-row ${isMine(f) ? 'mine' : ''}`}>
              <span className="cx-md-code">{code(f.home)}</span>
              <span className="cx-md-home">{name(f.home)}</span>
              <span className="cx-md-v">v</span>
              <span className="cx-md-away">{name(f.away)}</span>
              <span className="cx-md-code">{code(f.away)}</span>
            </div>
          ))}
        </div>
      ))}
      {g.pendingFixture && <div className="cx-md-hint">{t('cl.md.hint')}</div>}
    </div>
  );
}
