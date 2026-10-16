import { acceptJob, applyForJob } from '../../game/board';
import { notify } from '../../game/state';
import { t } from '../../i18n';
import { ClubLink, Panel } from '../components';
import { useGame } from '../core';
import { Head } from './common';

export function Jobs() {
  const g = useGame()!;
  const vac = g.vacancies.map((id) => g.clubs[id]).filter((c) => c && c.manager === 0);
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
                  <td><button className="small primary" onClick={() => { if (confirm(t('jobs.acceptConfirm', { club: g.clubs[id].name }))) { acceptJob(id); notify(); } }}>{t('jobs.accept')}</button>
                    <button className="small" onClick={() => { g.jobOffers = g.jobOffers.filter((x) => x !== id); notify(); }}>{t('jobs.decline')}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <Panel title={t('jobs.vacancies')} className="flush">
          <table className="grid">
            <tbody>
              {vac.length === 0 && <tr><td className="muted">{t('common.none')}</td></tr>}
              {vac.map((c) => (
                <tr key={c.id}>
                  <td><ClubLink id={c.id} long /></td>
                  <td>{g.leagues[c.league]?.name}</td>
                  <td className="num">{c.rep}</td>
                  <td><button className="small" onClick={() => { applyForJob(c.id); notify(); }}>{t('jobs.apply')}</button></td>
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
