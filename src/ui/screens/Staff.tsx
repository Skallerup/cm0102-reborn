import { useState, type ReactNode } from 'react';
import { ageOn } from '../../game/dates';
import { addNews, notify } from '../../game/state';
import type { Staff, StaffRole } from '../../game/types';
import { money, t } from '../../i18n';
import { Bar, Panel, Tabs } from '../components';
import { useGame } from '../core';
import { Head } from './common';

const ATTRS: (keyof Staff['attrs'])[] = ['coaching', 'judgingAbility', 'judgingPotential', 'physio', 'motivating', 'discipline', 'tactics'];
const LIMITS: Record<StaffRole, number> = { manager: 0, assistant: 1, coach: 7, physio: 3, scout: 6 };

export function StaffScreen() {
  const g = useGame()!;
  const [tab, setTab] = useState('mine');
  const [role, setRole] = useState<StaffRole>('coach');
  const mine = Object.values(g.staff).filter((s) => s.club === g.userClub);
  const free = Object.values(g.staff).filter((s) => !s.club && s.role === role).sort((a, b) => b.rep - a.rep).slice(0, 40);
  const club = g.clubs[g.userClub];
  const count = (r: StaffRole) => mine.filter((s) => s.role === r).length;

  const fire = (s: Staff) => {
    if (!confirm(t('staff.fireConfirm', { name: `${s.first} ${s.last}`, pay: money(s.wage * 12) }))) return;
    club.balance -= s.wage * 12;
    s.club = 0;
    s.assignment = null;
    notify();
  };
  const hire = (s: Staff) => {
    if (count(s.role) >= LIMITS[s.role]) { alert(t('staff.limit')); return; }
    s.club = g.userClub;
    s.expires = `${Number(g.date.slice(0, 4)) + 2}-06-30`;
    addNews({ cat: 'general', key: 'staff.hired', params: { name: `${s.first} ${s.last}`, role: t(`role.staff.${s.role}`) } });
    notify();
  };

  const table = (list: Staff[], action: (s: Staff) => ReactNode) => (
    <div className="table-wrap">
      <table className="grid">
        <thead><tr><th>{t('col.name')}</th><th>{t('staff.role')}</th><th className="num">{t('col.age')}</th>{ATTRS.map((a) => <th key={a} className="num" title={t(`staff.${a}`)}>{t(`staff.short.${a}`)}</th>)}<th className="num">{t('col.wage')}</th><th></th></tr></thead>
        <tbody>
          {list.map((s) => (
            <tr key={s.id}>
              <td>{s.first} {s.last}</td>
              <td>{t(`role.staff.${s.role}`)}</td>
              <td className="num">{ageOn(s.dob, g.date)}</td>
              {ATTRS.map((a) => <td key={a} className="num"><span className={`attr ${s.attrs[a] >= 16 ? 'a-top' : s.attrs[a] >= 13 ? 'a-good' : s.attrs[a] >= 9 ? 'a-mid' : 'a-low'}`}>{s.attrs[a]}</span></td>)}
              <td className="num">{money(s.wage)}</td>
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
        <Tabs tabs={[['mine', t('staff.mine')], ['hire', t('staff.hire')]]} value={tab} onChange={setTab} />
      </Head>
      {tab === 'mine' && (
        <Panel className="flush">
          {table(mine.sort((a, b) => a.role.localeCompare(b.role)), (s) => <button className="small danger" onClick={() => fire(s)}>{t('staff.fire')}</button>)}
        </Panel>
      )}
      {tab === 'hire' && (
        <Panel title={t('staff.available')} right={<select value={role} onChange={(e) => setRole(e.target.value as StaffRole)}>
          {(['assistant', 'coach', 'physio', 'scout'] as StaffRole[]).map((r) => <option key={r} value={r}>{t(`role.staff.${r}`)} ({count(r)}/{LIMITS[r]})</option>)}
        </select>} className="flush">
          {table(free, (s) => <button className="small primary" onClick={() => hire(s)}>{t('staff.hireBtn')}</button>)}
        </Panel>
      )}
      <p className="muted"><Bar value={mine.length} max={18} /> {t('staff.explain')}</p>
    </div>
  );
}
