import { useMemo, useState } from 'react';
import { Info } from '../help';
import { Select } from '../select';
import { act } from '../../game/actions';
import { dateFmt, money, t } from '../../i18n';
import { scoutRecommendation, scoutStars } from '../../game/scouting';
import { addDays, ageOn } from '../../game/dates';
import type { ScoutAssignment, Staff } from '../../game/types';
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
      <Head title={<>{t('nav.scouting')}<Info topic="scouting" /></>} />
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
            {scouts.map((s) => <ScoutRow key={s.id} s={s} nations={nations} />)}
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

/** Én scout: send ud med mål, varighed og fokus – eller kald hjem */
function ScoutRow({ s, nations }: { s: Staff; nations: number[] }) {
  const g = useGame()!;
  const a = s.assignment;
  const [target, setTarget] = useState(`l:${g.clubs[g.userClub]?.league ?? ''}`);
  const [months, setMonths] = useState(3);
  const [focus, setFocus] = useState<'any' | 'young' | 'prime'>('any');
  const targetName = (x: ScoutAssignment) => x.kind === 'nation' ? g.nations[x.target as number]?.name : x.kind === 'league' ? `${g.nations[g.leagues[x.target as string]?.nation]?.name ?? ''} – ${g.leagues[x.target as string]?.name ?? x.target}` : '';
  const send = () => {
    const kind = target.startsWith('n:') ? 'nation' : 'league';
    const tgt = kind === 'nation' ? Number(target.slice(2)) : target.slice(2);
    const until = months ? (() => { const d = new Date(g.date + 'T00:00:00Z'); d.setUTCMonth(d.getUTCMonth() + months); return d.toISOString().slice(0, 10); })() : undefined;
    act({ t: 'scout', staffId: s.id, assignment: { kind, target: tgt, since: g.date, until, focus, found: [] } });
  };
  const recall = () => act({ t: 'scout', staffId: s.id, assignment: null });
  return (
    <tr>
      <td>{s.first} {s.last}</td>
      <td><Bar value={s.attrs.judgingAbility} max={20} /> {s.attrs.judgingAbility}</td>
      <td><Bar value={s.attrs.judgingPotential} max={20} /> {s.attrs.judgingPotential}</td>
      <td>
        {a?.kind === 'player' ? (
          <div className="row">{t('scout.watching')} <PlayerLink p={g.players[a.target as number]} /> <button className="small" onClick={recall}>{t('scout.recall')}</button></div>
        ) : a ? (
          <div className="col" style={{ gap: 4 }}>
            <div className="row"><b>{targetName(a)}</b>{a.focus && a.focus !== 'any' && <span className="tag">{t(`scout.focus.${a.focus}`)}</span>}<button className="small danger" onClick={recall}>{t('scout.recall')}</button></div>
            <span className="muted" style={{ fontSize: 12 }}>{t('scout.status', { since: a.since ? dateFmt(a.since) : '–', n: a.found?.length ?? 0, until: a.until ? t('scout.until', { date: dateFmt(a.until) }) : '' })}</span>
          </div>
        ) : (
          <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
            <span className="muted" style={{ width: '100%', fontSize: 12 }}>{t('scout.home')}</span>
            <Select value={target} onChange={setTarget} width={240} options={[
              ...g.leagueOrder.filter((l) => g.leagues[l]).map((l) => ({ value: `l:${l}`, label: `${g.leagues[l].name}`, hint: g.nations[g.leagues[l].nation]?.code, group: t('scout.leagues') })),
              ...nations.map((n) => ({ value: `n:${n}`, label: g.nations[n].name, hint: g.nations[n].code, group: t('scout.nations') })),
            ]} />
            <select value={months} onChange={(e) => setMonths(Number(e.target.value))} title={t('scout.duration')}>
              {[1, 3, 6, 0].map((m) => <option key={m} value={m}>{t(`scout.dur.${m}`)}</option>)}
            </select>
            <select value={focus} onChange={(e) => setFocus(e.target.value as 'any')} title={t('scout.focus')}>
              {(['any', 'young', 'prime'] as const).map((f) => <option key={f} value={f}>{t(`scout.focus.${f}`)}</option>)}
            </select>
            <button className="small primary" onClick={send}>{t('scout.send')}</button>
          </div>
        )}
      </td>
    </tr>
  );
}
