import { act } from '../../game/actions';
import { managerRegion } from '../../game/board';
import { regionOf } from '../../game/leagues';
import { t } from '../../i18n';
import { ClubLink, Panel } from '../components';
import { useGame, useRouteState } from '../core';
import { Head } from './common';

export function Jobs() {
  const g = useGame()!;
  const [scope, setScope] = useRouteState<'region' | 'world'>('scope', 'region');
  const region = managerRegion();
  const vac = g.vacancies.map((id) => g.clubs[id]).filter((c) => c && c.manager === 0)
    .filter((c) => scope === 'world' || regionOf(g.nations[c.nation]?.name) === region)
    .sort((a, b) => b.rep - a.rep);
  return (
    <div>
      <Head title={t('nav.jobs')} />
      <div className="cols2">
        <Panel title={t('jobs.offers')} className="flush">
          <table className="grid">
            <tbody>
              {g.jobOffers.length === 0 && <tr><td className="muted">{t('common.none')}</td></tr>}
              {g.jobOffers.map((id) => (
                <tr key={id}>
                  <td><ClubLink id={id} long /></td>
                  <td>{g.leagues[g.clubs[id]?.league]?.name}</td>
                  <td><button className="small primary" onClick={() => { if (confirm(t('jobs.acceptConfirm', { club: g.clubs[id].name }))) { act({ t: 'acceptJob', club: id }); } }}>{t('jobs.accept')}</button>
                    <button className="small" onClick={() => act({ t: 'declineJob', club: id })}>{t('jobs.decline')}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <Panel title={t('jobs.vacancies')} className="flush" right={
          <select value={scope} onChange={(e) => setScope(e.target.value as 'region')}>
            <option value="region">{t('jobs.myRegion', { region: t(`region.${region}`) })}</option>
            <option value="world">{t('jobs.world')}</option>
          </select>
        }>
          <table className="grid">
            <tbody>
              {vac.length === 0 && <tr><td className="muted">{t('common.none')}</td></tr>}
              {vac.map((c) => (
                <tr key={c.id}>
                  <td><ClubLink id={c.id} long /></td>
                  <td>{g.leagues[c.league]?.name}</td>
                  <td className="num">{c.rep}</td>
                  <td><button className="small" onClick={() => act({ t: 'applyJob', club: c.id })}>{t('jobs.apply')}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
      <p className="muted">{t('jobs.explain', { rep: Math.round(g.manager.rep) })}</p>
    </div>
  );
}
