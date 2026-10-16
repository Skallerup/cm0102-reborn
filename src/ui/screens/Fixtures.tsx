import { gs } from '../../game/state';
import type { Fixture } from '../../game/types';
import { dateFmt, t } from '../../i18n';
import { ClubLink, Panel } from '../components';
import { useGame, useNav } from '../core';
import { Head } from './common';

export function stageLabel(f: Fixture): string {
  if (!f.stage) return `${t('fix.round')} ${f.round}`;
  if (f.stage.startsWith('G')) return `${t('fix.group')} ${f.stage.slice(1)}`;
  if (f.stage === 'champ' || f.stage === 'releg') return t(`fix.${f.stage}`);
  return t(`stage.${f.stage}`) + (f.leg === 2 ? ` (${t('fix.leg2')})` : f.tieId && gs().comps[f.comp]?.ties.find((x) => x.id === f.tieId)?.legs === 2 ? ` (${t('fix.leg1')})` : '');
}

export function resultStr(f: Fixture) {
  if (!f.result) return '-';
  const r = f.result;
  let s = `${r.hg} - ${r.ag}`;
  if (r.pens) s += ` (${r.pens[0]}-${r.pens[1]} ${t('fix.pens')})`;
  else if (r.et) s += ` ${t('fix.aet')}`;
  return s;
}

export function Fixtures() {
  const g = useGame()!;
  const { nav } = useNav();
  const list = Object.values(g.fixtures).filter((f) => f.home === g.userClub || f.away === g.userClub).sort((a, b) => a.date.localeCompare(b.date));
  return (
    <div>
      <Head title={t('nav.fixtures')} />
      <Panel className="flush">
        <table className="grid">
          <thead><tr><th>{t('col.date')}</th><th>{t('col.comp')}</th><th>{t('fix.stage')}</th><th>{t('fix.venue')}</th><th>{t('fix.opponent')}</th><th className="center">{t('fix.result')}</th><th></th></tr></thead>
          <tbody>
            {list.map((f) => {
              const home = f.home === g.userClub;
              const opp = home ? f.away : f.home;
              const r = f.result;
              const my = r ? (home ? r.hg : r.ag) : 0, their = r ? (home ? r.ag : r.hg) : 0;
              const cls = !r ? '' : my > their || (r.pens && (home ? r.pens[0] > r.pens[1] : r.pens[1] > r.pens[0])) ? 'good' : my === their ? '' : 'bad';
              return (
                <tr key={f.id} className={g.reports[f.id] ? 'clickable' : ''} onClick={() => g.reports[f.id] && nav({ name: 'report', id: f.id })}>
                  <td>{dateFmt(f.date)}</td>
                  <td>{g.comps[f.comp]?.name}</td>
                  <td className="muted">{stageLabel(f)}</td>
                  <td>{f.stage === 'F' ? t('fix.neutral') : home ? t('fix.home') : t('fix.away')}</td>
                  <td><ClubLink id={opp} /></td>
                  <td className={`center ${cls}`}><b>{r ? `${home ? r.hg : r.ag} - ${home ? r.ag : r.hg}` : '-'}</b>{r?.pens ? ` (${t('fix.pens')})` : r?.et ? ` ${t('fix.aet')}` : ''}</td>
                  <td>{g.reports[f.id] && <span className="muted">{t('fix.report')} ›</span>}{f.id === g.pendingFixture && <button className="small primary" onClick={() => nav({ name: 'match', id: f.id })}>{t('top.toTheMatch')}</button>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
