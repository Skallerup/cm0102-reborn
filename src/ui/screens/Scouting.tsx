import { useMemo } from 'react';
import { act } from '../../game/actions';
import { dateFmt, money, t } from '../../i18n';
import { scoutRecommendation, scoutStars } from '../../game/scouting';
import { addDays, ageOn } from '../../game/dates';
import { Bar, ClubLink, Panel, PlayerLink, RecTag, Stars, posStr } from '../components';
import { useGame, useRouteState } from '../core';
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
                      <>{t('scout.watching')} <PlayerLink p={g.players[a.target as number]} /> <button className="small" onClick={() => act({ t: 'scout', staffId: s.id, assignment: null })}>×</button></>
                    ) : (
                      <select value={value} onChange={(e) => {
                        const v = e.target.value;
                        act({ t: 'scout', staffId: s.id, assignment: !v ? null : v.startsWith('n:') ? { kind: 'nation', target: Number(v.slice(2)) } : { kind: 'league', target: v.slice(2) } });
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
      <Panel title={t('scout.found')} right={<span className="muted">{t('scout.foundHint')}</span>} className="flush">
        <ScoutFinds />
      </Panel>
    </div>
  );
}

function ScoutFinds() {
  const g = useGame()!;
  const finds = g.scoutFinds ?? {};
  const [onlyFinds, setOnlyFinds] = useRouteState('onlyFinds', true);
  const rows = Object.entries(g.knowledge)
    .filter(([id, k]) => k >= 60 && g.players[Number(id)] && g.players[Number(id)].club !== g.userClub && (!onlyFinds || finds[Number(id)]))
    .map(([id]) => g.players[Number(id)])
    .map((p) => ({ p, st: scoutStars(p), found: finds[p.id] ?? '' }))
    .sort((a, b) => b.found.localeCompare(a.found) || b.st.potential[0] + b.st.ability[0] - (a.st.potential[0] + a.st.ability[0]))
    .slice(0, 80);
  const recent = addDays(g.date, -14);
  const toggle = <label className="row" style={{ padding: '10px 14px' }}><input type="checkbox" checked={onlyFinds} onChange={(e) => setOnlyFinds(e.target.checked)} />{t('scout.onlyFinds')}</label>;
  if (!rows.length) return <>{toggle}<div className="empty">{t('scout.noFinds')}</div></>;
  return (
    <>
    {toggle}
    <table className="grid">
      <thead><tr><th>{t('scout.foundDate')}</th><th>{t('col.name')}</th><th>{t('col.pos')}</th><th className="num">{t('col.age')}</th><th>{t('col.club')}</th><th>{t('player.ability')}</th><th>{t('player.potential')}</th><th>{t('rec.col')}</th><th className="num">{t('col.value')}</th></tr></thead>
      <tbody>
        {rows.map(({ p, st, found }) => (
          <tr key={p.id}>
            <td className="muted">{found ? dateFmt(found) : '–'}{found >= recent && <span className="tag good">{t('scout.new')}</span>}</td>
            <td><PlayerLink p={p} /></td>
            <td>{posStr(p)}</td>
            <td className="num">{ageOn(p.dob, g.date)}</td>
            <td>{p.club ? <ClubLink id={p.club} /> : t('common.free')}</td>
            <td><Stars range={st.ability} /></td>
            <td><Stars range={st.potential} /></td>
            <td>{(() => { const r = scoutRecommendation(p); return <span title={r.reasons.map((x) => t(x.key, x.params)).join(' ')}><RecTag level={r.level} /></span>; })()}</td>
            <td className="num">{money(p.value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
    </>
  );
}
