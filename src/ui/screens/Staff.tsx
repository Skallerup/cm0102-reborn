import { useState, type ReactNode } from 'react';
import { ClubScreen } from './Club';
import { CxLink, clubRoute } from '../classic';
import { isRetro } from '../theme';
import { askConfirm } from '../confirm';
import { gs } from '../../game/state';
import { ageOn } from '../../game/dates';
import { poachFee, staffCount, staffDemand, STAFF_LIMITS, willJoin } from '../../game/staff';
import { isMultiplayer } from '../../game/humans';
import { act } from '../../game/actions';
import type { Staff, StaffRole } from '../../game/types';
import { dateFmt, money, natName, t } from '../../i18n';
import { repWord } from './NationClassic';
import { ActionMenu } from './PlayerClassic';
import type { DropItem } from '../classic';
import { ClubLink, Modal, Panel, Tabs } from '../components';
import { useGame, useNav, useRouteState } from '../core';
import { Head } from './common';
import { ClassicStaffProfile } from './StaffClassic';
import { cmActive } from '../../game/cmPlayerData';

const ATTRS: (keyof Staff['attrs'])[] = ['coaching', 'judgingAbility', 'judgingPotential', 'physio', 'motivating', 'discipline', 'tactics'];
const ROLES: StaffRole[] = ['assistant', 'coach', 'physio', 'scout'];
const KEY_ATTR: Record<StaffRole, keyof Staff['attrs']> = { manager: 'tactics', assistant: 'coaching', coach: 'coaching', physio: 'physio', scout: 'judgingAbility' };

export function StaffScreen() {
  const { route } = useNav();
  // klassisk udseende med den originale database i ægte tilstand: originalens stabsprofil (StaffClassic.tsx)
  if (route.id !== undefined && gs().staff[Number(route.id)]) return isRetro() && cmActive(gs()) ? <ClassicStaffProfile id={Number(route.id)} /> : <StaffProfile id={Number(route.id)} />;
  // CM 01/02 har ingen samlet stabsliste – klubbens General Info (Non-Playing Staff) er stedet
  if (isRetro() && cmActive(gs())) return <ClubScreen id={gs().userClub} />;
  return <StaffList />;
}

function StaffList() {
  const g = useGame()!;
  const [tab, setTab] = useRouteState('tab', useNav().route.tab ?? 'mine');
  const [role, setRole] = useRouteState<StaffRole>('role', 'coach');
  const [source, setSource] = useRouteState<'free' | 'clubs'>('source', 'free');
  const [onlyWilling, setOnlyWilling] = useRouteState('onlyWilling', true);
  const [msg, setMsg] = useState<{ text: string; tone: string } | null>(null);
  const [offerFor, setOfferFor] = useState<Staff | null>(null);
  const mine = Object.values(g.staff).filter((s) => s.club === g.userClub);
  const club = g.clubs[g.userClub];
  const sortKey = KEY_ATTR[role];
  const market = Object.values(g.staff)
    .filter((s) => s.role === role && !s.cmExtra && (source === 'free' ? !s.club : s.club && s.club !== g.userClub && (!onlyWilling || willJoin(s))))
    .sort((a, b) => b.attrs[sortKey] - a.attrs[sortKey] || b.rep - a.rep)
    .slice(0, 60);

  const fire = async (s: Staff) => {
    if (!(await askConfirm(t('staff.fireConfirm', { name: `${s.first} ${s.last}`, pay: money(s.wage * 12) })))) return;
    act({ t: 'fireStaff', id: s.id });
    setMsg({ text: t('staff.fired', { name: `${s.first} ${s.last}` }), tone: 'neutral' });
  };
  const hire = (s: Staff) => setOfferFor(s);
  const sendOffer = async (s: Staff, wage: number) => {
    if (s.club && !(await askConfirm(t('staff.poachConfirm', { name: `${s.first} ${s.last}`, club: g.clubs[s.club]?.name ?? '', fee: money(poachFee(s)) })))) return;
    const r = act<string>({ t: 'hireStaff', id: s.id, wage });
    setOfferFor(null);
    setMsg({ text: t(`staff.result.${r}`, { name: `${s.first} ${s.last}`, wage: money(staffDemand(s)) }), tone: r === 'ok' ? 'good' : r === 'pending' ? 'warn' : 'bad' });
  };

  const table = (list: Staff[], action: (s: Staff) => ReactNode, showClub = false) => (
    <div className="table-wrap">
      <table className="grid">
        <thead><tr><th>{t('col.name')}</th><th>{t('staff.role')}</th>{showClub && <th>{t('col.club')}</th>}<th className="num">{t('col.age')}</th>{ATTRS.map((a) => <th key={a} className="num" title={t(`staff.${a}`)}>{t(`staff.short.${a}`)}</th>)}<th className="num">{t('col.wage')}</th>{showClub && <th className="num">{t('staff.fee')}</th>}<th></th></tr></thead>
        <tbody>
          {list.length === 0 && <tr><td colSpan={12} className="muted">{t('common.none')}</td></tr>}
          {list.map((s) => (
            <tr key={s.id}>
              <td>{s.first} {s.last}{s.exPlayer && <span className={`tag ${s.exPlayer.legendOf ? 'good' : ''}`} style={{ marginLeft: 6 }} title={s.exPlayer.legendOf ? t('recb.legendOf', { club: gs().clubs[s.exPlayer.legendOf]?.name ?? '' }) : undefined}>{s.exPlayer.legendOf ? `⭐ ${t('recb.legend')}` : t('recb.exPlayer')}</span>}</td>
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
      {offerFor && <StaffOfferModal s={offerFor} onClose={() => setOfferFor(null)} onSend={(w) => sendOffer(offerFor, w)} />}
      <p className="muted">{t('staff.explain')} {t('staff.explain2')}</p>
    </div>
  );
}

/** En stabspersons profil (som i CM 01/02): job, klub, alder, omdømme, kontrakt og egenskaber – ansæt eller fyr herfra */
function StaffProfile({ id }: { id: number }) {
  const g = useGame()!;
  const s = g.staff[id];
  const { nav } = useNav();
  const [offer, setOffer] = useState(false);
  const [msg, setMsg] = useState<{ text: string; tone: string } | null>(null);
  const mine = s.club === g.userClub && !!g.userClub;
  const name = `${s.first} ${s.last}`.trim();
  const role = s.role === 'manager' ? null : s.role;
  const full = role ? staffCount(role) >= STAFF_LIMITS[role] : true;
  const send = async (wage: number) => {
    if (s.club && !(await askConfirm(t('staff.poachConfirm', { name, club: g.clubs[s.club]?.name ?? '', fee: money(poachFee(s)) })))) return;
    const r = act<string>({ t: 'hireStaff', id: s.id, wage });
    setOffer(false);
    setMsg({ text: t(`staff.result.${r}`, { name, wage: money(staffDemand(s)) }), tone: r === 'ok' ? 'good' : r === 'pending' ? 'warn' : 'bad' });
  };
  const fire = async () => {
    if (!(await askConfirm(t('staff.fireConfirm', { name, pay: money(s.wage * 12) })))) return;
    act({ t: 'fireStaff', id: s.id });
    setMsg({ text: t('staff.fired', { name }), tone: 'neutral' });
  };
  // Action-menuen i titelbjælken (som på spillerprofilen og i CM 01/02)
  const items: DropItem[] = [];
  if (mine) items.push({ key: 'fire', label: t('staff.fire'), danger: true, onClick: fire });
  else if (g.userClub) {
    const broke = s.club > 0 && (g.clubs[g.userClub]?.balance ?? 0) < poachFee(s);
    items.push({ key: 'hire', label: s.club ? t('staff.buyOut') : t('staff.hireBtn'), disabled: !role || full || broke,
      title: !role ? t('staff.noManagerHire') : full ? t('staff.limit') : broke ? t('staff.noMoney') : undefined, onClick: () => setOffer(true) });
  }
  if (s.club) items.push({ key: 'club', label: t('staff.viewClub', { club: g.clubs[s.club]?.short ?? '' }), onClick: () => nav(s.club === g.userClub ? { name: 'squad' } : { name: 'club', id: s.club }) });
  const action = items.length ? <ActionMenu items={items} clubId={s.club || undefined} /> : null;
  return (
    <div>
      <Head title={`${name}${s.club ? ` (${g.clubs[s.club]?.short ?? ''})` : ''}`} action={action} />
      {msg && <div className={`insight ${msg.tone}`}>{msg.text}</div>}
      {isRetro() ? (
        // klassisk (CM 01/02): fødselsdag og land som overskrift, oplysninger og egenskaber i to kolonner uden kort
        <>
          <div className="cx-subtitle cx-born">{t('cl.sf.born', { date: dateFmt(s.dob), age: ageOn(s.dob, g.date), nation: natName(g.nations[s.nation]?.name) })}</div>
          <div className="cx-staff-cols">
            <div className="cx-kv">
              <span>{t('cl.sf.job')}</span><span>{t(`role.staff.${s.role}`)}</span>
              <span>{t('col.club')}</span><span>{s.club ? <CxLink to={clubRoute(s.club)}>{g.clubs[s.club]?.name}</CxLink> : t('common.free')}</span>
              <span>{t('cl.st.rep')}</span><span>{repWord(s.rep)}</span>
              {s.club > 0 && <><span>{t('col.wage')}</span><span>{money(s.wage)} {t('cl.sf.pw')}</span></>}
              {s.club > 0 && s.expires && <><span>{t('col.expires')}</span><span>{dateFmt(s.expires)}</span></>}
              {!mine && s.club > 0 && <><span>{t('staff.fee')}</span><span>{money(poachFee(s))}</span></>}
              {!mine && <><span>{t('staff.demand')}</span><span>{money(staffDemand(s))} {t('cl.sf.pw')}</span></>}
            </div>
            <table className="cx-tbl cx-staff-attrs"><thead><tr><th>{t('staff.attrs')}</th><th /></tr></thead>
              <tbody>{ATTRS.map((a) => <tr key={a}><td>{t(`staff.${a}`)}</td><td className={`c-num ${s.attrs[a] >= 15 ? 'c-yel' : s.attrs[a] >= 10 ? 'c-cyan' : 'c-pos'}`}>{s.attrs[a]}</td></tr>)}</tbody></table>
          </div>
        </>
      ) : (
      <div className="cols2">
        <Panel title={t(`role.staff.${s.role}`)}>
          <div className="kv">
            <span>{t('col.club')}</span><span>{s.club ? <ClubLink id={s.club} /> : t('common.free')}</span>
            <span>{t('col.age')}</span><span>{ageOn(s.dob, g.date)}</span>
            <span>{t('cl.fd.nation')}</span><span>{natName(g.nations[s.nation]?.name)}</span>
            <span>{t('cl.st.rep')}</span><span>{repWord(s.rep)}</span>
            {s.club > 0 && <><span>{t('col.wage')}</span><span>{money(s.wage)} / {t('common.week')}</span></>}
            {s.club > 0 && s.expires && <><span>{t('col.expires')}</span><span>{dateFmt(s.expires)}</span></>}
            {!mine && s.club > 0 && <><span>{t('staff.fee')}</span><span>{money(poachFee(s))}</span></>}
            {!mine && <><span>{t('staff.demand')}</span><span>{money(staffDemand(s))} / {t('common.week')}</span></>}
          </div>
        </Panel>
        <Panel title={t('staff.attrs')} className="flush">
          <table className="grid">
            <tbody>
              {ATTRS.map((a) => <tr key={a}><td>{t(`staff.${a}`)}</td><td className="num"><span className={`attr ${s.attrs[a] >= 16 ? 'a-top' : s.attrs[a] >= 13 ? 'a-good' : s.attrs[a] >= 9 ? 'a-mid' : 'a-low'}`}>{s.attrs[a]}</span></td></tr>)}
            </tbody>
          </table>
        </Panel>
      </div>
      )}
      {offer && <StaffOfferModal s={s} onClose={() => setOffer(false)} onSend={send} />}
    </div>
  );
}

/** Kontrakttilbud til en ansat: lønnen kan forhandles – i multiplayer vinder det bedste tilbud */
function StaffOfferModal({ s, onClose, onSend }: { s: Staff; onClose: () => void; onSend: (wage: number) => void }) {
  const g = useGame()!;
  const demand = staffDemand(s);
  const [wage, setWage] = useState(demand);
  const mp = isMultiplayer(g);
  const pct = Math.round((wage / Math.max(1, demand)) * 100);
  return (
    <Modal title={t('staff.offerTitle', { name: `${s.first} ${s.last}` })} onClose={onClose}>
      <div className="col">
        <div className="kv">
          <span>{t('staff.demand')}</span><span>{money(demand)} / {t('common.week')}</span>
          {s.club > 0 && <><span>{t('staff.fee')}</span><span>{money(poachFee(s))}</span></>}
        </div>
        <label>{t('neg.wage')}: <b className="accent">{money(wage)}</b> / {t('common.week')} ({pct}%)
          <input type="range" min={Math.round(demand * 0.8 / 50) * 50} max={Math.round(demand * 2 / 50) * 50} step={50} value={wage} onChange={(e) => setWage(Number(e.target.value))} style={{ width: '100%' }} />
        </label>
        <div className={`insight ${wage < demand * 0.95 ? 'bad' : ''}`}>{t(wage < demand * 0.95 ? 'staff.offerLow' : mp ? 'staff.offerMp' : 'staff.offerOk')}</div>
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button onClick={onClose}>{t('common.cancel')}</button>
          <button className="primary" disabled={wage < demand * 0.95} onClick={() => onSend(wage)}>{t('staff.sendOffer')}</button>
        </div>
      </div>
    </Modal>
  );
}
