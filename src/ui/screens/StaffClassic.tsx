// Stabsprofilen som i CM 01/02 (klassisk udseende, original DB i ægte tilstand – cmActive): fanerne Profile · Injuries & Bans (grå) ·
// Contract · Transfer · History, fødselslinjen "Born 12.3.67 (Age 34). Finnish (7 caps/1 goal).", egenskaberne i to kolonner med
// Coaching Style, Preferred Formation/Style/Other, jobbet i bunden – og Action ▾ Approach To Sign · Set Nickname · — · Create Manager Note.
// Approach To Sign → Set Role At Club (job efter 0x4cb990) → Offer Contract (ClassicStaffNegotiation). Reglerne: game/cmStaff.ts.
import { useState, type ReactNode } from 'react';
import { act } from '../../game/actions';
import { ageOn } from '../../game/dates';
import { nationLanguage } from '../../game/languages';
import { fireStaff } from '../../game/staff';
import { cmCapsLine, cmCoachingStyle, cmJobKey, cmStaffClub, cmOtherStyles, cmPrefFormation, cmPrefStyle, cmRolesFor, cmStaffAttrList, cmStaffInterested } from '../../game/cmStaff';
import type { Staff, StaffRole } from '../../game/types';
import { dateFmt, getLang, money, natName, t } from '../../i18n';
import { CxDrop, classicDate, titleColors, useClassicDialog, type DropItem } from '../classic';
import { DEMONYM } from '../demonyms';
import { askConfirm } from '../confirm';
import { Tabs } from '../components';
import { useGame, useNav, useRouteState } from '../core';
import { Head } from './common';
import { ActionMenu } from './PlayerClassic';
import { ClassicStaffNegotiation } from './NegotiationClassic';

type Tab = 'profile' | 'injuries' | 'contract' | 'transfer' | 'history';
const ROWS = 12;

export const staffName = (s: Staff) => (s.nick || `${s.first} ${s.last}`).trim();

/** "Born 12.3.67 (Age 34). Finnish (7 caps/1 goal)." (0x874e6a) */
function BornLine({ s }: { s: Staff }) {
  const g = useGame()!;
  const nat = g.nations[s.nation]?.name ?? '';
  const nation = getLang() === 'en' ? DEMONYM[nat] ?? nat : natName(nat) ?? nat;
  const c = cmCapsLine(s.cmHid?.[8] ?? 0, undefined);
  return <div className="cx-pl-born">{t('cm.born', { date: classicDate(s.dob)[1], age: ageOn(s.dob, g.date), nation, caps: c ? ` ${t(c.key, { caps: c.caps, goals: c.goals })}` : '' })}</div>;
}

/** en liniet tabel med etiket/værdi i to kolonner (Profile) eller én (de øvrige faner), fyldt op til 12 linjer */
function Ruled({ rows, cols = 1 }: { rows: [ReactNode, ReactNode, string?][]; cols?: 1 | 2 }) {
  const per = cols === 2 ? Math.ceil(rows.length / 2) : rows.length;
  const lines = Math.max(ROWS, per);
  const cell = (r: [ReactNode, ReactNode, string?] | undefined, k: string) => [<span key={`l${k}`}>{r?.[0]}</span>, <span key={`v${k}`} className={r?.[2] ?? ''}>{r?.[1]}</span>];
  return (
    <div className={`cx-kv cx-ruled ${cols === 2 ? 'cx-st-two' : ''}`}>
      {Array.from({ length: lines }, (_, i) => cols === 2 ? [...cell(rows[i < per ? i : -1], `a${i}`), ...cell(i < per ? rows[per + i] : undefined, `b${i}`)] : cell(rows[i], `a${i}`))}
    </div>
  );
}

function ProfileTab({ s }: { s: Staff }) {
  const top: [ReactNode, ReactNode, string?][] = [
    ...cmStaffAttrList(s).map(({ k, v }): [ReactNode, ReactNode, string?] => [t(`cm.sa.${k}`), v, 'c-center']),
    [t('cm.sa.coachingStyle'), t(`cm.cstyle.${cmCoachingStyle(s)}`), 'c-center c-orange'],
  ];
  const other = cmOtherStyles(s);
  const rest: [ReactNode, ReactNode][] = [
    [t('cm.prefFormation'), cmPrefFormation(s) ?? '-'],
    [t('cm.prefStyle'), t(`cm.style.${cmPrefStyle(s)}`)],
    ...(other.length ? other.map((k, i): [ReactNode, ReactNode] => [i === 0 ? t('cm.otherStyle') : '', t(`cm.other.${k}`)]) : [[t('cm.otherStyle'), '-'] as [ReactNode, ReactNode]]),
  ];
  const per = Math.ceil(top.length / 2);
  return (
    <>
      <div className="cx-kv cx-ruled cx-st-two">
        {Array.from({ length: per }, (_, i) => [top[i], top[per + i]].flatMap((r, j) => [<span key={`l${i}${j}`}>{r?.[0]}</span>, <span key={`v${i}${j}`} className={r?.[2] ?? ''}>{r?.[1]}</span>]))}
      </div>
      <div className="cx-kv cx-ruled cx-st-rest">
        {[...rest, ...Array.from({ length: Math.max(0, ROWS - per - rest.length) }, (): [ReactNode, ReactNode] => ['', ''])].flatMap(([l, v], i) => [<span key={`l${i}`}>{l}</span>, <span key={`v${i}`}>{v}</span>])}
      </div>
    </>
  );
}

function ContractTab({ s }: { s: Staff }) {
  const on = s.club > 0;
  return <Ruled rows={[
    [t('cm.ct.type'), on ? t('cm.ct.fullTime') : t('cm.ct.na')],
    [t('cm.ct.wages'), on ? `${money(s.wage)} ${t('cl.sf.pw')}` : '-'],
    [t('cm.ct.expires'), on && s.expires ? dateFmt(s.expires) : '-'],
    [t('cm.ct.bonuses'), t('cm.ct.none')],
    [t('cm.ct.clauses'), t('cm.ct.none')],
    [t('cm.ct.notes'), s.notes || '-'],
  ]} />;
}

function TransferTab({ s }: { s: Staff }) {
  const g = useGame()!;
  const lang = (code: string | undefined) => { if (!code) return ''; try { const n = new Intl.DisplayNames([t('cl.locale')], { type: 'language' }).of(code) ?? code; return n.charAt(0).toUpperCase() + n.slice(1); } catch { return code; } };
  // *estimeret*: modersmålet og klubbens lands sprog (originalens sprogliste pr. person er ikke i world-filerne)
  const fluent = [...new Set([nationLanguage(g, s.nation), s.club ? nationLanguage(g, g.clubs[s.club]?.nation ?? s.nation) : undefined].filter(Boolean))].map((c) => lang(c as string));
  const offers = (g.cmStaffOffers ?? []).filter((o) => o.staff === s.id).map((o) => g.clubs[o.club]?.short ?? '');
  const interested = cmStaffInterested(g, s).map((c) => g.clubs[c]?.short || g.clubs[c]?.name || '');
  const and = (xs: string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} ${t('common.and')} ${xs[xs.length - 1]}` : xs[0] ?? '');
  return <Ruled rows={[
    [t('cl.pl.availability'), t('cm.tr.unknown')],
    [t('cl.pl.languages'), fluent.length ? and(fluent) : '-'],
    [t('cm.tr.basicLang'), '-'],
    [t('cl.pl.offers'), offers.length ? offers.join(', ') : t('cm.ct.none')],
    [t('cl.pl.interested'), interested.length ? interested.join(', ') : t('cm.ct.none')],
    [t('cl.pl.future'), '-'],
  ]} />;
}

function HistoryTab() {
  const [filter, setFilter] = useRouteState<'all' | 'comps' | 'awards'>('sthf', 'all');
  return (
    <>
      <div className="cx-tools cx-tools-inline">
        <CxDrop className="cx-green" label={t('cl.sq.view')} items={[{ key: 'ach', label: t('cl.pl.hv.achievements'), checked: true, onClick: () => {} }]} />
        <CxDrop className="cx-green" label={t('cm.hist.filter')} items={(['all', 'comps', 'awards'] as const).map((k) => ({ key: k, label: t(`cm.hist.${k}`), checked: filter === k, onClick: () => setFilter(k) }))} />
      </div>
      <div className="cx-subtitle small">{t('cl.pl.hv.achievements')}</div>
      <Ruled rows={[]} />
    </>
  );
}

/** Set Role At Club (0x4dd0f0): "Job Description" og de job, personen kan få (0x4cb990) – Back / Set */
function SetRolePanel({ s, onBack, onSet }: { s: Staff; onBack: () => void; onSet: (r: StaffRole) => void }) {
  useClassicDialog();
  const g = useGame()!;
  const roles = cmRolesFor(s, g.date);
  const [sel, setSel] = useState<StaffRole | undefined>(roles.includes(s.role) && s.club ? s.role : roles[0]);
  const col = titleColors(s.club || undefined);
  return (
    <div className="cx-dlg">
      <div className="cx-title" style={{ background: col.bg, color: col.fg }}><h2>{staffName(s)}</h2></div>
      <div className="cx-subtitle">{t('cl.role.title')}</div>
      <div className="cx-dlg-body">
        <p className="cx-ts-intro">{t('cl.role.job')}</p>
        {roles.map((r) => <button key={r} className={`cx-opt cx-st-role ${sel === r ? 'sel' : 'on'}`} onClick={() => setSel(r)}>{t(`cm.role.${r}`)}</button>)}
      </div>
      <div className="cx-ts-buttons cx-dlg-foot"><button onClick={onBack}>{t('common.back')}</button>
        <button className="primary" disabled={!sel} onClick={() => sel && onSet(sel)}>{t('cl.ts.set')}</button></div>
    </div>
  );
}

/** Set Nickname / Create Manager Note (som spillernes) */
function TextPanel({ title, value, area, onSave, onRemove, onClose }: { title: string; value: string; area?: boolean; onSave: (v: string) => void; onRemove?: () => void; onClose: () => void }) {
  useClassicDialog();
  const [v, setV] = useState(value);
  return (
    <div className="cx-tstatus">
      <div className="cx-subtitle">{title}</div>
      <div className="cx-ts-body center">{area
        ? <textarea className="cx-nick cx-note" autoFocus value={v} maxLength={500} onChange={(e) => setV(e.target.value)} />
        : <input className="cx-nick" autoFocus value={v} maxLength={30} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && v.trim()) onSave(v); }} />}</div>
      <div className="cx-ts-buttons cx-dlg-foot">
        <button onClick={onClose}>{t('common.cancel')}</button>
        {onRemove && <button disabled={!value} onClick={onRemove}>{t('cl.pl.nickRemove')}</button>}
        <button className="primary" disabled={!area && !v.trim()} onClick={() => onSave(v)}>{t('common.ok')}</button>
      </div>
    </div>
  );
}

export function ClassicStaffProfile({ id }: { id: number }) {
  const g = useGame()!;
  const { nav } = useNav();
  const s = g.staff[id];
  const [tab, setTab] = useRouteState<Tab>('sttab', 'profile');
  // Negotiate i indbakken åbner kontrakttilbuddet direkte (route-state stoffer = jobbet)
  const [offerRole, setOfferRole] = useRouteState<StaffRole | ''>('stoffer', '');
  const [panel, setPanel] = useState<'role' | 'nick' | 'note' | null>(null);
  const [msg, setMsg] = useState('');
  if (!s) return <div><Head menu={false} title={t('player.gone')} /></div>;
  const mine = !!g.userClub && s.club === g.userClub;
  const name = staffName(s);
  const club = cmStaffClub(g, s);
  const title = `${name}${club ? ` (${club.name})` : ''}`;
  if (offerRole) return <div><ClassicStaffNegotiation staffId={s.id} role={offerRole} onClose={(sent) => { setOfferRole(''); if (sent) setMsg(t('cm.neg.sent', { name })); }} /></div>;
  if (panel === 'role') return <div><SetRolePanel s={s} onBack={() => setPanel(null)} onSet={(r) => { setPanel(null); setOfferRole(r); }} /></div>;
  if (panel === 'nick') return <div><Head menu={false} title={title} /><TextPanel title={t('cl.pl.nickTitle')} value={s.nick ?? ''} onClose={() => setPanel(null)}
    onSave={(v) => { act({ t: 'staffNote', id: s.id, nick: v }); setPanel(null); }} onRemove={() => { act({ t: 'staffNote', id: s.id, nick: null }); setPanel(null); }} /></div>;
  if (panel === 'note') return <div><Head menu={false} title={title} /><TextPanel area title={t('cl.pl.note')} value={s.notes ?? ''} onClose={() => setPanel(null)}
    onSave={(v) => { act({ t: 'staffNote', id: s.id, notes: v }); setPanel(null); }} /></div>;
  // Action (CM 01/02, ejerens billede 52): Approach To Sign · Set Nickname · — · Create Manager Note
  const items: DropItem[] = [];
  if (!mine && g.userClub) items.push({ key: 'approach', label: t('cm.st.approach'), disabled: !cmRolesFor(s, g.date).length, onClick: () => setPanel('role') });
  if (mine) items.push({ key: 'fire', label: t('staff.fire'), danger: true, onClick: async () => {
    if (!(await askConfirm(t('staff.fireConfirm', { name, pay: money(s.wage * 12) })))) return;
    fireStaff(s.id); nav({ name: 'club', id: g.userClub, state: { cview: 'info' } }); // CM 01/02: tilbage til klubbens General Info (Non-Playing Staff)
  } });
  items.push({ key: 'nick', label: t('cl.pl.setNick'), onClick: () => setPanel('nick') }, { key: 'sep', sep: true });
  if (g.userClub) items.push({ key: 'note', label: t('cl.pl.note'), onClick: () => setPanel('note') });
  const tabs: [Tab, string][] = [['profile', t('cl.pl.profile')], ['injuries', t('cl.pl.injuries')], ['contract', t('cl.pl.contract')], ['transfer', t('cl.pl.transfer')], ['history', t('cl.pl.history')]];
  return (
    <div className="cx-staffp">
      <Head title={title} action={<ActionMenu items={items} clubId={s.club || undefined} />} />
      {/* Injuries & Bans er grå for stab uden spillerpost (som i originalen) */}
      <Tabs tabs={tabs} value={tab} onChange={(v) => setTab(v as Tab)} disabled={['injuries']} />
      {msg && <div className="insight">{msg}</div>}
      <div className="cx-pl">
        {tab !== 'history' && <BornLine s={s} />}
        {tab === 'profile' && <ProfileTab s={s} />}
        {tab === 'contract' && <ContractTab s={s} />}
        {tab === 'transfer' && <TransferTab s={s} />}
        {tab === 'history' && <HistoryTab />}
        <div className="cx-st-job">{t(cmJobKey(s))}</div>
      </div>
    </div>
  );
}
