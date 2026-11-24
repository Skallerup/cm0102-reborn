// "Offer Contract" til en stabsperson (CM 01/02, cmStaff.ts) i det moderne udseende: Set Role At Club (job) og derefter løn, Signing On Fee, udløb,
// Contract Type og Make offer public – "Offer contract to X ?" med kompensationen. Svaret kommer som nyhed næste dag.
import { useState } from 'react';
import { act } from '../../game/actions';
import { gs } from '../../game/state';
import type { StaffRole } from '../../game/types';
import { cmExpectedRole, cmRolesFor, cmStaffCompensation, cmStaffDemand, cmStaffInterestedIn, JOB_CODE } from '../../game/cmStaff';
import { cmStaffOfferCheck } from '../../game/cmContractGame';
import { cmStaffOn } from '../../game/cmPlayerData';
import { cmBoardStaffWageAllow, cmTransferBudgetRaw } from '../../game/cmBudget';
import { cmGbp } from '../../game/cmMoney';
import { poachFee } from '../../game/staff';
import { cashRound, cashStepEur, cashUnits, moneyCm, moneyFull, moneyWage, t } from '../../i18n';
import { addDays } from '../../game/dates';
import { expDown, expDownOff, expIso, expUp, expUpOff, ymOf, type YM } from '../../game/cmContractScreen';
import { Modal } from '../components';

const r50 = (v: number) => Math.max(0, Math.round(v / 50) * 50);
const fee8 = (v: number) => moneyCm(v, 6, 8);
const EN_MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function monthShort(m: number): string {
  const loc = t('cl.locale');
  if (!loc || loc.startsWith('en') || loc === 'cl.locale') return EN_MON[m];
  try { return new Date(Date.UTC(2001, m, 15)).toLocaleDateString(loc, { month: 'short', timeZone: 'UTC' }); } catch { return EN_MON[m]; }
}

function StepRow({ label, text, onDown, onUp, onEq, downOff, upOff }: { label: string; text: string; onDown: () => void; onUp: () => void; onEq: () => void; downOff?: boolean; upOff?: boolean }) {
  return (
    <div className="row" style={{ gap: 8, alignItems: 'center' }}>
      <span style={{ minWidth: 170 }}>{label}</span>
      <button className="small" disabled={downOff} onClick={onDown} aria-label="-">−</button>
      <span style={{ minWidth: 120, textAlign: 'center' }}>{text}</span>
      <button className="small" disabled={upOff} onClick={onUp} aria-label="+">+</button>
      <button className="small" onClick={onEq}>=</button>
    </div>
  );
}

/** Set Role At Club for en stabsperson (Job Description) */
export function OrigStaffRole({ staffId, onBack, onSet }: { staffId: number; onBack: () => void; onSet: (r: StaffRole) => void }) {
  const g = gs();
  const s = g.staff[staffId];
  const roles = cmRolesFor(s, g.date);
  const [sel, setSel] = useState<StaffRole | undefined>(() => cmExpectedRole(s, g.date) ?? undefined);
  return (
    <Modal title={`${s.first} ${s.last} – ${t('cl.role.title')}`} onClose={onBack}>
      <div className="col">
        <div className="muted">{t('cl.role.job')}</div>
        <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
          {roles.map((r) => <button key={r} className={`small ${sel === r ? 'primary' : ''}`} onClick={() => setSel(r)}>{t(`cm.role.${r}`)}</button>)}
        </div>
        <div className="row" style={{ justifyContent: 'flex-end' }}><button onClick={onBack}>{t('common.back')}</button><button className="primary" disabled={!sel} onClick={() => sel && onSet(sel)}>{t('cl.ts.set')}</button></div>
      </div>
    </Modal>
  );
}

export function OrigStaffNegotiation({ staffId, role, onClose }: { staffId: number; role: StaffRole; onClose: (sent: boolean) => void }) {
  const g = gs();
  const s = g.staff[staffId];
  const club = g.clubs[g.userClub];
  const [chk] = useState(() => (cmRolesFor(s, g.date).includes(role) ? cmStaffOfferCheck(g, s, g.userClub, JOB_CODE[role]) : null));
  const demand = r50(chk?.wage ?? cmStaffDemand(s, role));
  const [signOn, setSignOn] = useState(0);
  const [pub, setPub] = useState(false);
  const [ask, setAsk] = useState(false);
  const name = `${s.first} ${s.last}`.trim();
  const interested = chk ? chk.interested : cmStaffInterestedIn(g, s, role);
  const bill = Object.values(g.players).filter((x) => x.club === club.id).reduce((a, x) => a + (x.contract?.wage ?? 0), 0);
  const [cmAllow] = useState(() => cmBoardStaffWageAllow(g, s, role, club.id));
  const allow = cmAllow ?? Math.max(0, club.wageBudget - bill);
  const [wage, setWage] = useState(() => (cmAllow !== null && demand > cmAllow ? cmAllow : demand));
  const [signMax] = useState(() => { const b = cmTransferBudgetRaw(g, club.id); return b === null ? Infinity : Math.min(5_000_000, Math.max(0, b)) / cmGbp(g, club.id); });
  const signReq = Math.min(chk?.signOn ?? 0, signMax);
  const today = ymOf(g.date);
  const wantExp = chk?.expires ?? `${g.season + 2}-06-30`;
  const own = !!s.club && s.club === g.userClub;
  const min = ymOf(own && s.expires ? s.expires : addDays(g.date, 32));
  const [exp, setExp] = useState<YM>(() => ymOf(wantExp));
  const expTxt = ([y, m]: YM) => `${monthShort(m)} ${y}`;
  const from = s.club ? g.clubs[s.club] : undefined;
  const comp = from && !own ? (cmStaffOn(g) ? cmStaffCompensation(g, s) : poachFee(s)) : 0;
  const k = cmGbp(g, club.id);
  const wUp = cashStepEur(wage, 8, 1), wDown = cashStepEur(wage, 8, -1);
  const wUpOff = cmAllow !== null && cashRound(cashUnits(wUp), 8) > cashRound(cashUnits(cmAllow), 8);
  const sUp = cashStepEur(signOn, 4, 1);
  const send = () => { act({ t: 'cmStaffOffer', id: s.id, role, wage, years: Math.max(1, exp[0] - today[0]), signOn, expires: expIso(exp, g.date) }); onClose(true); };
  return (
    <Modal title={`${name}${from ? ` (${from.short || from.name})` : ''} – ${t('cl.neg.title')}`} onClose={() => onClose(false)} wide>
      {ask ? (
        <div className="col">
          <p>{t('cl.neg.confirm', { player: name })}</p>
          {from && comp > 0 && <p>{t('cm.neg.comp', { club: from.short || from.name, fee: moneyFull(comp) })}</p>}
          <div className="row" style={{ justifyContent: 'flex-end' }}><button onClick={() => setAsk(false)}>{t('common.no')}</button><button className="primary" onClick={send}>{t('common.yes')}</button></div>
        </div>
      ) : (
        <div className="col">
          <p>{interested ? t('cl.neg.wants', { player: name, wage: moneyWage(demand), until: expTxt(ymOf(wantExp)), fee: '' }) : own ? t('cm.neg.noRenewNow', { player: name }) : t('cm.neg.noInterest', { name })}</p>
          <p className="muted">{t('cl.neg.allow', { allow: moneyWage(allow) })}</p>
          <StepRow label={t('cl.neg.wage')} text={moneyWage(wage)} onDown={() => setWage(wDown)} downOff={Math.round(wage * k) <= 100} onUp={() => setWage(wUp)} upOff={wUpOff} onEq={() => setWage(demand)} />
          <StepRow label={t('cl.neg.signOn')} text={fee8(signOn)} onDown={() => setSignOn(cashStepEur(signOn, 4, -1))} downOff={signOn <= 0}
            onUp={() => setSignOn(sUp)} upOff={Math.round(sUp * k) > Math.round(signMax * k)} onEq={() => setSignOn(signReq)} />
          <StepRow label={t('cl.neg.expires')} text={expTxt(exp)} onDown={() => setExp(expDown(exp, today))} downOff={expDownOff(exp, today, min)}
            onUp={() => setExp(expUp(exp, today, min))} upOff={expUpOff(exp, today)} onEq={() => setExp(ymOf(wantExp))} />
          <div className="row" style={{ gap: 8, alignItems: 'center' }}><span style={{ minWidth: 170 }}>{t('cl.neg.type')}</span><span>{t('cl.neg.fullTime')}</span></div>
          <div className="row" style={{ gap: 8, alignItems: 'center' }}><span style={{ minWidth: 170 }}>{t('cm.neg.public')}</span><button className="small" onClick={() => setPub(!pub)}>{t(pub ? 'common.yes' : 'common.no')}</button></div>
          <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}><button onClick={() => onClose(false)}>{t('common.cancel')}</button><button className="primary" onClick={() => setAsk(true)}>{t('cl.neg.offer')}</button></div>
        </div>
      )}
    </Modal>
  );
}
