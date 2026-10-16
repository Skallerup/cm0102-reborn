import { useMemo } from 'react';
import { notify } from '../../game/state';
import { t } from '../../i18n';
import { Bar, Panel, PlayerLink } from '../components';
import { useGame } from '../core';
import { Head } from './common';

export function Scouting() {
  const g = useGame()!;
  const scouts = Object.values(g.staff).filter((s) => s.club === g.userClub && s.role === 'scout');
  const nations = useMemo(() => [...new Set(Object.values(g.clubs).map((c) => c.nation))].sort((a, b) => g.nations[a].name.localeCompare(g.nations[b].name)), [g]);
  const known = Object.values(g.knowledge).filter((k) => k >= 80).length;
  return (
    <div>
      <Head title={t('nav.scouting')} />
      {!g.options.masking && <div className="insight">{t('scout.maskingOff')}</div>}
      <div className="cols">
        <Panel title={t('scout.overview')}>
          <div className="kv">
            <span>{t('scout.scouts')}</span><span>{scouts.length}</span>
            <span>{t('scout.wellKnown')}</span><span>{known}</span>
          </div>
          <p className="muted">{t('scout.explain')}</p>
        </Panel>
      </div>
      <Panel title={t('scout.assignments')} className="flush">
        <table className="grid">
          <thead><tr><th>{t('col.name')}</th><th>{t('staff.judgingAbility')}</th><th>{t('staff.judgingPotential')}</th><th>{t('scout.assignment')}</th></tr></thead>
          <tbody>
            {scouts.map((s) => {
              const a = s.assignment;
              const value = !a ? '' : a.kind === 'player' ? `p:${a.target}` : a.kind === 'nation' ? `n:${a.target}` : `l:${a.target}`;
              return (
                <tr key={s.id}>
                  <td>{s.first} {s.last}</td>
                  <td><Bar value={s.attrs.judgingAbility} max={20} /> {s.attrs.judgingAbility}</td>
                  <td><Bar value={s.attrs.judgingPotential} max={20} /> {s.attrs.judgingPotential}</td>
                  <td>
                    {a?.kind === 'player' ? (
                      <>{t('scout.watching')} <PlayerLink p={g.players[a.target as number]} /> <button className="small" onClick={() => { s.assignment = null; notify(); }}>×</button></>
                    ) : (
                      <select value={value} onChange={(e) => {
                        const v = e.target.value;
                        if (!v) s.assignment = null;
                        else if (v.startsWith('n:')) s.assignment = { kind: 'nation', target: Number(v.slice(2)) };
                        else s.assignment = { kind: 'league', target: v.slice(2) };
                        notify();
                      }}>
                        <option value="">{t('scout.ownLeague')}</option>
                        <optgroup label={t('scout.leagues')}>
                          {g.leagueOrder.filter((l) => g.leagues[l]).map((l) => <option key={l} value={`l:${l}`}>{g.nations[g.leagues[l].nation]?.name} – {g.leagues[l].name}</option>)}
                        </optgroup>
                        <optgroup label={t('scout.nations')}>
                          {nations.map((n) => <option key={n} value={`n:${n}`}>{g.nations[n].name}</option>)}
                        </optgroup>
                      </select>
                    )}
                  </td>
                </tr>
              );
            })}
            {scouts.length === 0 && <tr><td colSpan={4} className="muted">{t('scout.none')}</td></tr>}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
