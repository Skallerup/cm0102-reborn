// Managerens History i klassisk tema som i CM 01/02: "Navn (Klub)", View (Achievements / Career) og en dateret liste
// med blå datoknap, klubben og præstationen i gult.
import { useState } from 'react';
import { compName, t } from '../../i18n';
import { CxDrop, classicDate } from '../classic';
import { useGame, useNav } from '../core';
import { Head } from './common';

export function ClassicManagerHistory() {
  const g = useGame()!;
  const { nav } = useNav();
  const [view, setView] = useState<'ach' | 'career'>('ach');
  const m = g.manager;
  const club = g.clubs[g.userClub];
  const rows: { d: string; club: number; text: string }[] = [];
  for (const tr of m.trophies ?? []) rows.push({ d: `${tr.season + 1}-05-31`, club: tr.club, text: t('cl.mh.won', { comp: compName(g.comps[tr.comp]?.name ?? tr.comp) }) });
  for (const sh of g.seasonHistory ?? []) for (const a of sh.monthAwards ?? []) if (a.managerName === m.name) rows.push({ d: `${a.month}-28`, club: a.manager, text: t('cl.mh.month', { comp: compName(g.comps[a.comp]?.name ?? a.comp), month: new Date(`${a.month}-15T12:00:00`).toLocaleDateString(t('cl.locale'), { month: 'long' }) }) });
  for (const a of g.monthAwards ?? []) if (a.managerName === m.name) rows.push({ d: `${a.month}-28`, club: a.manager, text: t('cl.mh.month', { comp: compName(g.comps[a.comp]?.name ?? a.comp), month: new Date(`${a.month}-15T12:00:00`).toLocaleDateString(t('cl.locale'), { month: 'long' }) }) });
  rows.sort((a, b) => b.d.localeCompare(a.d));
  const career = (m.history ?? []).slice().reverse();
  return (
    <div>
      <Head title={`${m.name}${club ? ` (${club.short})` : ''}`} />
      <div className="cx-tools">
        <CxDrop label={t('cl.sq.view')} items={[{ key: 'ach', label: t('cl.mh.ach'), checked: view === 'ach', onClick: () => setView('ach') }, { key: 'career', label: t('cl.mh.career'), checked: view === 'career', onClick: () => setView('career') }]} />
      </div>
      <div className="cx-subtitle">{t(view === 'ach' ? 'cl.mh.ach' : 'cl.mh.career')}</div>
      <div className="cx-tbl-wrap cx-panel"><table className="cx-tbl"><tbody>
        {view === 'ach' ? (rows.length ? rows.map((r, i) => (
          <tr key={i}><td className="btn-col"><span className="cx-rowbtn">{classicDate(r.d)[1]}</span></td>
            <td className="c-name"><span className="link" onClick={() => nav({ name: 'club', id: r.club })}>{g.clubs[r.club]?.short ?? ''}</span></td><td className="c-yel">{r.text}</td></tr>
        )) : <tr><td className="cx-empty">{t('common.none')}</td></tr>) : (career.length ? career.map((h, i) => (
          <tr key={i}><td className="btn-col"><span className="cx-rowbtn">{h.season}/{String((h.season + 1) % 100).padStart(2, '0')}</span></td>
            <td className="c-name"><span className="link" onClick={() => nav({ name: 'club', id: h.club })}>{g.clubs[h.club]?.short ?? ''}</span></td><td className="c-yel">{compName(g.leagues[h.league]?.name) ?? h.league} – {h.pos}.</td></tr>
        )) : <tr><td className="cx-empty">{t('common.none')}</td></tr>)}
      </tbody></table></div>
      <div className="cx-pl-pos">{t('cl.mh.manager')}</div>
    </div>
  );
}
