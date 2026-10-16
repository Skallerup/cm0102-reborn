import { useState, type ReactNode } from 'react';
import { ageOn } from '../../game/dates';
import { fireStaff, hireStaff, poachFee, staffCount, STAFF_LIMITS, willJoin } from '../../game/staff';
import { notify } from '../../game/state';
import type { Staff, StaffRole } from '../../game/types';
import { money, t } from '../../i18n';
import { ClubLink, Panel, Tabs } from '../components';
import { useGame } from '../core';
import { Head } from './common';

const ATTRS: (keyof Staff['attrs'])[] = ['coaching', 'judgingAbility', 'judgingPotential', 'physio', 'motivating', 'discipline', 'tactics'];
const ROLES: StaffRole[] = ['assistant', 'coach', 'physio', 'scout'];
const KEY_ATTR: Record<StaffRole, keyof Staff['attrs']> = { manager: 'tactics', assistant: 'coaching', coach: 'coaching', physio: 'physio', scout: 'judgingAbility' };

export function StaffScreen() {
  const g = useGame()!;
  const [tab, setTab] = useState('mine');
  const [role, setRole] = useState<StaffRole>('coach');
  const [source, setSource] = useState<'free' | 'clubs'>('free');
  const [onlyWilling, setOnlyWilling] = useState(true);
  const [msg, setMsg] = useState<{ text: string; tone: string } | null>(null);
  const mine = Object.values(g.staff).filter((s) => s.club === g.userClub);
  const club = g.clubs[g.userClub];
  const sortKey = KEY_ATTR[role];
  const market = Object.values(g.staff)
    .filter((s) => s.role === role && (source === 'free' ? !s.club : s.club && s.club !== g.userClub && (!onlyWilling || willJoin(s))))
    .sort((a, b) => b.attrs[sortKey] - a.attrs[sortKey] || b.rep - a.rep)
    .slice(0, 60);

  const fire = (s: Staff) => {
    if (!confirm(t('staff.fireConfirm', { name: `${s.first} ${s.last}`, pay: money(s.wage * 12) }))) return;
    fireStaff(s.id);
    setMsg({ text: t('staff.fired', { name: `${s.first} ${s.last}` }), tone: 'neutral' });
    notify();
  };
  const hire = (s: Staff) => {
    if (s.club && !confirm(t('staff.poachConfirm', { name: `${s.first} ${s.last}`, club: g.clubs[s.club]?.name ?? '', fee: money(poachFee(s)) }))) return;
    const r = hireStaff(s.id);
    setMsg({ text: t(`staff.result.${r}`, { name: `${s.first} ${s.last}` }), tone: r === 'ok' ? 'good' : 'bad' });
    notify();
  };

  const table = (list: Staff[], action: (s: Staff) => ReactNode, showClub = false) => (
    <div className="table-wrap">
      <table className="grid">
        <thead><tr><th>{t('col.name')}</th><th>{t('staff.role')}</th>{showClub && <th>{t('col.club')}</th>}<th className="num">{t('col.age')}</th>{ATTRS.map((a) => <th key={a} className="num" title={t(`staff.${a}`)}>{t(`staff.short.${a}`)}</th>)}<th className="num">{t('col.wage')}</th>{showClub && <th className="num">{t('staff.fee')}</th>}<th></th></tr></thead>
        <tbody>
          {list.length === 0 && <tr><td colSpan={12} className="muted">{t('common.none')}</td></tr>}
          {list.map((s) => (
            <tr key={s.id}>
              <td>{s.first} {s.last}</td>
              <td>{t(`role.staff.${s.role}`)}</td>
              {showClub && <td><ClubLink id={s.club} /></td>}
              <td className="num">{ageOn(s.dob, g.date)}</td>
              {ATTRS.map((a) => <td key={a} className="num"><span className={`attr ${s.attrs[a] >= 16 ? 'a-top' : s.attrs[a] >= 13 ? 'a-good' : s.attrs[a] >= 9 ? 'a-mid' : 'a-low'}`}>{s.attrs[a]}</span></td>)}
              <td className="num">{money(s.wage)}</td>
              {showClub && <td className="num">{money(poachFee(s))}</td>}
              <td>{action(s)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      <Head title={t('nav.staff')}>
        <Tabs tabs={[['mine', `${t('staff.mine')} (${mine.length})`], ['hire', t('staff.hire')]]} value={tab} onChange={(v) => { setTab(v); setMsg(null); }} />
      </Head>
      {msg && <div className={`insight ${msg.tone}`}>{msg.text}</div>}
      {tab === 'mine' && (
        <Panel className="flush">
          {table(mine.sort((a, b) => a.role.localeCompare(b.role)), (s) => <button className="small danger" onClick={() => fire(s)}>{t('staff.fire')}</button>)}
        </Panel>
      )}
      {tab === 'hire' && (
        <Panel title={source === 'free' ? t('staff.available') : t('staff.otherClubs')} right={
          <div className="row">
            <select value={source} onChange={(e) => setSource(e.target.value as 'free' | 'clubs')}>
              <option value="free">{t('staff.sourceFree')}</option>
              <option value="clubs">{t('staff.sourceClubs')}</option>
            </select>
            <select value={role} onChange={(e) => setRole(e.target.value as StaffRole)}>
              {ROLES.map((r) => <option key={r} value={r}>{t(`role.staff.${r}`)} ({staffCount(r)}/{STAFF_LIMITS[r]})</option>)}
            </select>
            {source === 'clubs' && <label className="row"><input type="checkbox" checked={onlyWilling} onChange={(e) => setOnlyWilling(e.target.checked)} />{t('staff.onlyWilling')}</label>}
          </div>
        } className="flush">
          {table(market, (s) => (
            <button className="small primary" disabled={staffCount(s.role) >= STAFF_LIMITS[s.role] || (s.club > 0 && club.balance < poachFee(s))} onClick={() => hire(s)}>
              {s.club ? t('staff.buyOut') : t('staff.hireBtn')}
            </button>
          ), source === 'clubs')}
        </Panel>
      )}
      <p className="muted">{t('staff.explain')} {t('staff.explain2')}</p>
    </div>
  );
}
