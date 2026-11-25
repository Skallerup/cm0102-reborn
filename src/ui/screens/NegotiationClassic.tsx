// "Offer Contract" som i CM 01/02: fanerne Basic · Bonuses · Clauses, rækker med − / værdi ▾ / + / =, et klik på en
// bonus eller klausul slår den til (hvid tekst), og "Offer contract to …?" med No/Yes før tilbuddet sendes.
import { useEffect, useMemo, useState } from 'react';
import { act } from '../../game/actions';
import { gs } from '../../game/state';
import { humanRenewDemand, preferredYears, renewalDemand, signOnDemand, wageDemand } from '../../game/transfers';
import type { ContractClauses, StaffRole, TransferOffer } from '../../game/types';
import { cmRolesFor, cmStaffCompensation, cmStaffDemand, cmStaffInterestedIn, JOB_CODE } from '../../game/cmStaff';
import { cmStaffOfferCheck } from '../../game/cmContractGame';
import { cmLogic, cmStaffOn } from '../../game/cmPlayerData';
import { cmBoardStaffWageAllow, cmBoardWageAllow, cmTransferBudgetRaw } from '../../game/cmBudget';
import { cmGbp } from '../../game/cmMoney';
import { poachFee } from '../../game/staff';
import { cashRound, cashStepEur, cashUnits, moneyCm, moneyFull, moneyWage, t } from '../../i18n';

// kontraktskærmen 0x4e06e0/0x4deac0/0x4e30f0 (0x441c10): løn via 0x85e750 fuldt (flag 0xA); Signing On Fee og Clause Release Fee flag 6,
// bonusserne flag 0xA – begge over 8 tegn forkortet (5/9); kompensationen (0x4e4820) og kravet i teksten flag 6
const fee8 = (v: number) => moneyCm(v, 6, 8);
const bonus8 = (v: number) => moneyCm(v, 0xa, 8);
import { CxDrop, CxPm, titleColors, useClassicDialog } from '../classic';
import { SQUAD_STATUSES, expectedStatus, statusAllowed, type SquadStatus } from '../../game/squadStatus';
import { addDays, ageOn, year } from '../../game/dates';
import { expDown, expDownOff, expIso, expUp, expUpOff, ymOf, type YM } from '../../game/cmContractScreen';
import { authentic } from '../../game/rules';
import { cmNoInterest, cmOfferScreen, cmRoleExpected, cmTalksDemand } from '../../game/cmTransferTalks';
import { cmWhyText } from './common';

type Tab = 'basic' | 'bonuses' | 'clauses';
const r50 = (v: number) => Math.max(0, Math.round(v / 50) * 50);

/** En række: etiket · − · værdi ▾ (grøn liste) · + · = (tilbage til spillerens krav) */
function Row({ label, value, show, options, onSet, reset, on = true, onToggle, star, stepper, upOff, downOff }: {
  label: string; value: number; show: (v: number) => string; options: number[]; onSet: (v: number) => void; reset?: number;
  on?: boolean; onToggle?: () => void; star?: boolean;
  /** originalens trin (fx Cash::step_up/step_down 0x43f4e0/0x43f580) i stedet for listens næste mulighed, med skærmens grå knapper */
  stepper?: (d: 1 | -1) => number; upOff?: boolean; downOff?: boolean;
}) {
  // − / +: originalens trin, ellers den næste mulighed under eller over den nuværende værdi
  const step = (d: 1 | -1) => {
    if (stepper) { onSet(stepper(d)); return; }
    const next = d > 0 ? options.find((o) => o > value) : [...options].reverse().find((o) => o < value);
    if (next !== undefined) onSet(next);
  };
  return (
    <div className={`cx-neg-row ${on ? '' : 'off'}`}>
      <button className={`cx-neg-label ${onToggle ? 'toggle' : ''}`} onClick={onToggle} disabled={!onToggle}>{star && <span className="cx-neg-star">* </span>}{label}</button>
      <CxPm disabled={!on || downOff} onClick={() => step(-1)}>−</CxPm>
      <CxDrop className="cx-green cx-neg-val" caret fixed label={show(value)} btn={{ disabled: !on }}
        items={options.map((o) => ({ key: String(o), label: show(o), checked: o === value, onClick: () => onSet(o) }))} />
      <CxPm disabled={!on || upOff} onClick={() => step(1)}>+</CxPm>
      <button className="cx-pm" disabled={!on || reset === undefined} onClick={() => reset !== undefined && onSet(reset)}>=</button>
    </div>
  );
}

/** En række som originalens kontraktskærm (0x4e06e0/0x4e2280): etiket · − · værdi · + · = – grå knapper efter skærmens regler */
function StepRow({ label, text, onDown, onUp, onEq, downOff, upOff }: {
  label: string; text: string; onDown: () => void; onUp: () => void; onEq: () => void; downOff?: boolean; upOff?: boolean;
}) {
  return (
    <div className="cx-neg-row">
      <span className="cx-neg-label">{label}</span>
      <CxPm disabled={downOff} onClick={onDown}>−</CxPm>
      <span className="cx-neg-static cx-neg-val">{text}</span>
      <CxPm disabled={upOff} onClick={onUp}>+</CxPm>
      <button className="cx-pm" onClick={onEq}>=</button>
    </div>
  );
}

/** måned som originalens 0x54d210 ("Aug") */
const EN_MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function monthShort(m: number): string {
  const loc = t('cl.locale');
  if (!loc || loc.startsWith('en') || loc === 'cl.locale') return EN_MON[m];
  try { return new Date(Date.UTC(2001, m, 15)).toLocaleDateString(loc, { month: 'short', timeZone: 'UTC' }); } catch { return EN_MON[m]; }
}

/** "Offer Contract" til en stabsperson (CM 01/02, original DB i ægte tilstand – cmStaff.ts): samme skærm som spillernes uden fanerne –
 *  "X has no interest in negotiating terms for this position." (0x9b0450) eller kravet, "Your board will allow wages up to …" (0x9b0324),
 *  Weekly Wage · Signing On Fee · Contract Expires · Contract Type · Make offer public, og "Offer contract to X ?" med kompensationen
 *  (0x5b0fb8). Svaret kommer som nyhed næste dag. */
export function ClassicStaffNegotiation({ staffId, role, onClose }: { staffId: number; role: StaffRole; onClose: (sent: boolean) => void }) {
  useClassicDialog();
  const g = gs();
  const s = g.staff[staffId];
  const club = g.clubs[g.userClub];
  // originalens krav 0x85fc50 (0x4deac0, cmStaffOfferCheck) i ægte tilstand; ellers spillets eget
  const [chk] = useState(() => (cmRolesFor(s, g.date).includes(role) ? cmStaffOfferCheck(g, s, g.userClub, JOB_CODE[role]) : null));
  const demand = r50(chk?.wage ?? cmStaffDemand(s, role));
  const [signOn, setSignOn] = useState(0);
  const [pub, setPub] = useState(false);
  const [ask, setAsk] = useState(false);
  const name = `${s.first} ${s.last}`.trim();
  // 0x4e06e0: uden interesse står "no interest"-teksten i stedet for kravet; loftet, rækkerne og Offer er der altid (grenene mødes i 0x4e11b5) –
  // svaret afgøres af 0x4ce4e0 (cmStaffContractAnswer), så en god løn kan vende det
  const interested = chk ? chk.interested : cmStaffInterestedIn(g, s, role);
  const bill = Object.values(g.players).filter((x) => x.club === club.id).reduce((a, x) => a + (x.contract?.wage ?? 0), 0);
  // CM 01/02 (ægte tilstand, original DB): bestyrelsens loft for jobbet 0x597db0 (cmBudget.ts); ellers lønbudgettet minus truppens lønsum
  const [cmAllow] = useState(() => cmBoardStaffWageAllow(g, s, role, club.id));
  const allow = cmAllow ?? Math.max(0, club.wageBudget - bill);
  // 0x4e1329: tilbuddet starter på min(kravet, loftet)
  const [wage, setWage] = useState(() => (cmAllow !== null && demand > cmAllow ? cmAllow : demand));
  // Signing On Fee: loftet = skærmparameter 0x15 = transferbudgettet 0x598800 klemt til 0..£5.000.000 (0x4de3a6; egen klubs folk kendes fuldt)
  const [signMax] = useState(() => { const b = cmTransferBudgetRaw(g, club.id); return b === null ? Infinity : Math.min(5_000_000, Math.max(0, b)) / cmGbp(g, club.id); });
  const signReq = Math.min(chk?.signOn ?? 0, signMax);
  // Contract Expires: måned/år (skærmparameter 0xb/0xc) – startværdien kravets udløb (0x4df090); grænsen (9/0xa) = hans nuværende udløb, når han er
  // ansat i klubben (0x4defb7), ellers i dag + 32 dage (0x4df000)
  const today = ymOf(g.date);
  const wantExp = chk?.expires ?? `${g.season + 2}-06-30`;
  const own = !!s.club && s.club === g.userClub;
  const min = ymOf(own && s.expires ? s.expires : addDays(g.date, 32));
  const [exp, setExp] = useState<YM>(() => ymOf(wantExp));
  const expTxt = ([y, m]: YM) => `${monthShort(m)} ${y}`;
  const from = s.club ? g.clubs[s.club] : undefined;
  // egen stab (Offer New Contract): ingen kompensation, og uden vilje "does not wish to negotiate a new contract at the current time" (0x9b0964)
  // 0x4e4b55: kompensationen 0x8d0780 – vises kun, når den er over 0
  const comp = from && !own ? (cmStaffOn(g) ? cmStaffCompensation(g, s) : poachFee(s)) : 0;
  const col = titleColors(s.club || undefined);
  // 0x4e2280: løn + (id 4) = Contract 0x867b70 (Cash::step_up 0x43f4e0, flag 8 – ugeløn), grå når det næste trin (0x43f460 flag 8) er over loftet
  // (parameter 0x18); − (5) 0x867c50, grå ved £100 eller derunder; = (6) kravets løn. Signing On: + (23) step_up flag 4, grå over parameter 0x15;
  // − (24) step_down flag 4, grå ved 0; = (22) kravets, højst 0x15. Værdicellerne har ingen handling (ingen liste).
  const k = cmGbp(g, club.id);
  const wUp = cashStepEur(wage, 8, 1), wDown = cashStepEur(wage, 8, -1);
  const wUpOff = cmAllow !== null && cashRound(cashUnits(wUp), 8) > cashRound(cashUnits(cmAllow), 8);
  const sUp = cashStepEur(signOn, 4, 1);
  const send = () => { act({ t: 'cmStaffOffer', id: s.id, role, wage, years: Math.max(1, exp[0] - today[0]), signOn, expires: expIso(exp, g.date) }); onClose(true); };
  return (
    <div className="cx-dlg cx-staff-neg">
      <div className="cx-title" style={{ background: col.bg, color: col.fg }}><h2>{name}{from ? ` (${from.short || from.name})` : ''}</h2></div>
      <div className="cx-subtitle">{t('cl.neg.title')}</div>
      {ask ? (
        <div className="cx-dlg-body"><p className="cx-ts-intro">{t('cl.neg.confirm', { player: name })}</p>
          {from && comp > 0 && <p className="cx-ts-intro">{t('cm.neg.comp', { club: from.short || from.name, fee: moneyFull(comp) })}</p>}</div>
      ) : (
        <div className="cx-dlg-body">
          <p className="cx-ts-intro">{interested ? t('cl.neg.wants', { player: name, wage: moneyWage(demand), until: expTxt(ymOf(wantExp)), fee: '' }) : own ? t('cm.neg.noRenewNow', { player: name }) : t('cm.neg.noInterest', { name })}</p>
          <p className="cx-ts-intro">{t('cl.neg.allow', { allow: moneyWage(allow) })}</p>
          {<>
          <StepRow label={t('cl.neg.wage')} text={moneyWage(wage)} onDown={() => setWage(wDown)} downOff={Math.round(wage * k) <= 100}
            onUp={() => setWage(wUp)} upOff={wUpOff} onEq={() => setWage(demand)} />
          <StepRow label={t('cl.neg.signOn')} text={fee8(signOn)} onDown={() => setSignOn(cashStepEur(signOn, 4, -1))} downOff={signOn <= 0}
            onUp={() => setSignOn(sUp)} upOff={Math.round(sUp * k) > Math.round(signMax * k)} onEq={() => setSignOn(signReq)} />
          <StepRow label={t('cl.neg.expires')} text={expTxt(exp)} onDown={() => setExp(expDown(exp, today))} downOff={expDownOff(exp, today, min)}
            onUp={() => setExp(expUp(exp, today, min))} upOff={expUpOff(exp, today)} onEq={() => setExp(ymOf(wantExp))} />
          <div className="cx-neg-row"><span className="cx-neg-label">{t('cl.neg.type')}</span><span /><span className="cx-neg-static cx-neg-type">{t('cl.neg.fullTime')}</span></div>
          <div className="cx-neg-row"><span className="cx-neg-label">{t('cm.neg.public')}</span><span />
            <button className="cx-neg-static cx-neg-type cx-neg-public" onClick={() => setPub(!pub)}>{t(pub ? 'common.yes' : 'common.no')}</button></div>
          </>}
        </div>
      )}
      <div className="cx-ts-buttons cx-dlg-foot">
        {ask ? <><button onClick={() => setAsk(false)}>{t('common.no')}</button><button className="primary" onClick={send}>{t('common.yes')}</button></>
          : <><button onClick={() => onClose(false)}>{t('common.cancel')}</button><button className="primary" onClick={() => setAsk(true)}>{t('cl.neg.offer')}</button></>}
      </div>
    </div>
  );
}

/** Offer Contract efter et accepteret bud / til en klubløs (CM 01/02 0x4dd0f0): først Set Role At Club – trupstatus hos KØBEREN med forvalget "* expected
 *  by the player" (hans plads i købers trup) – derefter Offer Contract, hvor kravet 0x85fc50 og viljen 0x4e06e0 afhænger af den valgte rolle. */
export function ClassicNegotiation({ offer, renewPid, onClose }: { offer?: TransferOffer; renewPid?: number; onClose: () => void }) {
  const [rolePicked, setRolePicked] = useState(!offer || offer.loan);
  if (!rolePicked && offer) return <OfferRoleStep offer={offer} onClose={onClose} onSet={() => setRolePicked(true)} />;
  return <NegotiationBody offer={offer} renewPid={renewPid} onClose={onClose} />;
}

function OfferRoleStep({ offer, onClose, onSet }: { offer: TransferOffer; onClose: () => void; onSet: () => void }) {
  useClassicDialog();
  const g = gs();
  const p = g.players[offer.player];
  const exp = cmRoleExpected(g, p, offer.buyer);
  const [status, setStatus] = useState<SquadStatus>(offer.cmRole ?? exp);
  const col = titleColors(p.club || undefined);
  const name = `${p.first} ${p.last}`.trim();
  return (
    <div className="cx-dlg cx-offer-role">
      <div className="cx-title" style={{ background: col.bg, color: col.fg }}><h2>{name}{p.club ? ` (${g.clubs[p.club]?.short})` : ''}</h2></div>
      <div className="cx-subtitle">{t('cl.role.title')}</div>
      <div className="cx-dlg-body">
        <p className="cx-ts-intro">{t('cl.ts.squad')}</p>
        {SQUAD_STATUSES.filter((x) => x !== 'surplus').map((x) => {
          const ok = statusAllowed(p, x, g.date);
          return <button key={x} className={`cx-opt ${status === x ? 'sel' : ok ? 'on' : ''}`} disabled={!ok} onClick={() => setStatus(x)}>{x === exp ? '* ' : ok ? '' : '+ '}{t(`cl.ts.s.${x}`)}</button>;
        })}
        <p className="cx-ts-intro">* {t('cl.role.expected')}</p>
      </div>
      <div className="cx-ts-buttons cx-dlg-foot"><button onClick={onClose}>{t('common.back')}</button>
        <button className="primary" onClick={() => { act({ t: 'cmOfferRole', pid: p.id, role: status }); onSet(); }}>{t('cl.ts.set')}</button></div>
    </div>
  );
}

function NegotiationBody({ offer, renewPid, onClose }: { offer?: TransferOffer; renewPid?: number; onClose: () => void }) {
  useClassicDialog();
  const g = gs();
  const pid = offer?.player ?? renewPid!;
  const p = g.players[pid];
  const club = g.clubs[g.userClub];
  // CM 01/02 efter et accepteret bud: spillerens krav 0x85fc50 (cmTransferTalks.ts)
  const [cmWant] = useState(() => (offer?.cmTalks ? cmTalksDemand(offer, offer.cmRole) : null));
  // forlængelse (CM 01/02, en CM-database i ægte tilstand): Offer Contract til egen spiller viser samme krav 0x85fc50, som 0x4ce4e0 afgør tilbuddet
  // med – for egen klub med trupstatussen fra Set Role At Club (genberegnes, når rollen er sat)
  const renewCm = !offer && cmLogic(g);
  const [rw, setRw] = useState(() => (renewCm ? humanRenewDemand(p, club) : null));
  const demand = r50(cmWant?.wage ?? rw?.wage ?? offer?.demand?.wage ?? (offer ? wageDemand(p, club) : renewalDemand(p, club)));
  const wantYears = cmWant ? Math.max(1, Number(cmWant.expires.slice(0, 4)) - year(g.date)) : rw ? rw.years : offer?.demand?.years ?? preferredYears(p);
  const [tab, setTab] = useState<Tab>('basic');
  // egen spiller (CM 01/02): først "Set Role At Club" – status i truppen og jobbeskrivelse
  // ægte CM 01/02: et aftalt skifte (Next club) – Offer Contract viser kun "… does not wish to negotiate a new contract at the current time." (0x9b0964)
  const noRenew = !offer && authentic() && !!p.contract?.futureClub;
  const [roleStep, setRoleStep] = useState(!offer && !noRenew);
  const [status, setStatus] = useState<SquadStatus | undefined>(p.squadStatus);
  const [job, setJob] = useState<'player' | 'assistant' | 'coach'>(p.jobRole ?? 'player');
  const [wage, setWage] = useState(demand);
  const [years, setYears] = useState(wantYears);
  const signReq = cmWant ? Math.round(cmWant.signOn / 500) * 500 : rw ? Math.round(rw.signOn / 500) * 500 : signOnDemand(p, demand, !!offer && (!offer.fee || !!offer.preContract));
  const [cl, setCl] = useState<ContractClauses>(signReq ? { signOn: signReq } : {});
  const [ask, setAsk] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const name = `${p.first} ${p.last}`.trim();
  const bill = Object.values(g.players).filter((x) => x.club === club.id).reduce((s, x) => s + (x.contract?.wage ?? 0), 0);
  // CM 01/02 (ægte tilstand, original DB): "Your board will allow wages up to …" = Finance::get_max_wage 0x5968d0 for spilleren (cmBudget.ts) –
  // efter Set Role At Club, så egen spillers nye trupstatus tæller med
  const cmAllow = useMemo(() => (roleStep ? null : cmBoardWageAllow(g, p, club.id, offer?.cmRole)), [roleStep]); // eslint-disable-line react-hooks/exhaustive-deps
  const allow = cmAllow ?? Math.max(0, club.wageBudget - bill + (offer ? 0 : p.contract?.wage ?? 0));
  // 0x4e1329: originalen klemmer kontraktens løn til loftet – tilbuddet starter på min(kravet, loftet), og listen går ikke over loftet
  useEffect(() => { if (cmAllow !== null && wage > cmAllow) setWage(Math.floor(cmAllow / 50) * 50); }, [cmAllow]); // eslint-disable-line react-hooks/exhaustive-deps
  // CM 01/02 Offer Contract-skærmen 0x4e06e0 (0x4e0ad5): et krav på mindst 1,5 × det, bestyrelsen tillader (skærmparameter 0x18), giver
  // "X has no interest in negotiating terms …" efter trupstatussen (0x4e0ff9: 1–2 uden tilføjelse, 3 rotation, 4 backup, 5 hot prospect,
  // 6 youngster) med grundene 0x8e4ae0, når interessen (0x846920) er over 1,25 – og intet tilbud kan gives. Det fanger også 0x85fc50's
  // spærre (kravet sat til 250.000 p/w). Forlængelser; tilbud til en anden klubs spiller / en klubløs følger hele 0x4e06e0 (cmOfferScreen, parameter 0x16 = 0x4ce450).
  const noInt = useMemo(() => {
    if (noRenew) return { key: 'cm.neg.noRenewNow', reasons: '' };
    if ((!cmWant && !rw) || roleStep) return null;
    // tilbud efter et accepteret bud / til en klubløs: hele grenstrukturen i 0x4e06e0 (cmOfferScreen)
    if (cmWant && offer) { const o = cmOfferScreen(g, p, offer.buyer, offer.cmRole); return o ? { key: o.key, reasons: o.why ? cmWhyText(o.why) : '' } : null; }
    if (demand < 1.5 * allow) return null;
    const r = cmNoInterest(g, p, club.id, offer ? offer.cmRole : p.squadStatus);
    return { key: r.key, reasons: r.why ? cmWhyText(r.why) : '' };
  }, [roleStep, rw]); // eslint-disable-line react-hooks/exhaustive-deps
  const end = (y: number) => `${t('cl.neg.jun')} ${g.season + y}`;
  const col = titleColors(p.club || undefined);
  const set = (k: keyof ContractClauses, v: number | undefined) => setCl((c) => ({ ...c, [k]: v || undefined }));
  const toggle = (k: keyof ContractClauses, def: number) => set(k, cl[k] ? undefined : def);
  const wageOpts = [...new Set([0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 1, 1.05, 1.1, 1.2, 1.3, 1.5, 1.75, 2].map((f) => r50(demand * f)).map((v) => (cmAllow !== null && v > cmAllow ? Math.floor(cmAllow / 50) * 50 : v)))];
  const bonusOpts = (base: number) => [...new Set([0.25, 0.5, 1, 1.5, 2, 3].map((f) => Math.max(10, Math.round(base * f / 10) * 10)))];
  const relBase = Math.max(100_000, p.value);
  const relOpts = [...new Set([0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 7.5, 10].map((f) => Math.round(relBase * f / 100_000) * 100_000))];
  const submit = () => {
    setAsk(false);
    // egen spiller (CM 01/02): tilbuddet sendes, man er straks tilbage på profilen, og svaret kommer som nyhed i morgen
    if (!offer) { act({ t: 'renewLater', pid, wage, years, clauses: cl }); onClose(); return; }
    const res = offer ? act<string>({ t: 'negotiate', pid, wage, years, clauses: cl }) : act<string>({ t: 'renew', pid, wage, years, clauses: cl });
    // CM 01/02: tilbuddet er sendt – svaret kommer som nyhed om 1–5 dage
    if (res === 'cmSent') { onClose(); return; }
    if (res === 'accepted') { setMsg(t('cl.neg.accepted', { player: name })); setTimeout(onClose, 2200); }
    else if (res === 'pending') { setMsg(t('neg.pendingMp')); setTimeout(onClose, 3200); }
    else if (res === 'counter') {
      const d = r50(offer?.demand?.wage ?? (offer ? wageDemand(p, club) : renewalDemand(p, club)));
      setWage(d); setYears(offer?.demand?.years ?? preferredYears(p));
      setMsg(t('cl.neg.counter', { player: name, wage: moneyWage(d), until: end(offer?.demand?.years ?? preferredYears(p)) }));
    } else if (res === 'budget') setMsg(t('cl.neg.budget', { allow: moneyWage(allow) }));
    else { setMsg(t('cl.neg.refused', { player: name })); setTimeout(onClose, 2600); }
  };
  const bonus = (k: 'goalBonus' | 'appBonus' | 'cleanSheetBonus', base: number) => (
    <Row key={k} label={t(`cl.neg.${k}`)} value={cl[k] ?? Math.max(10, Math.round(base / 10) * 10)} show={bonus8} options={bonusOpts(base)}
      on={!!cl[k]} onToggle={() => toggle(k, Math.max(10, Math.round(base / 10) * 10))} onSet={(v) => set(k, v)} reset={Math.max(10, Math.round(base / 10) * 10)} />
  );
  if (roleStep) {
    const exp = expectedStatus(p, Object.values(g.players).filter((x) => x.club === p.club), g.date);
    const age = ageOn(p.dob, g.date);
    const careerOk = age >= 33; // *estimeret*: yngre spillere vil ikke stoppe karrieren
    return (
      <div className="cx-dlg">
        <div className="cx-title" style={{ background: col.bg, color: col.fg }}><h2>{name}</h2></div>
        <div className="cx-subtitle">{t('cl.role.title')}</div>
        <div className="cx-dlg-body">
          <p className="cx-ts-intro">{t('cl.ts.squad')}</p>
          {SQUAD_STATUSES.filter((x) => x !== 'surplus').map((x) => {
            const ok = statusAllowed(p, x, g.date);
            return <button key={x} className={`cx-opt ${status === x ? 'sel' : ok ? 'on' : ''}`} disabled={!ok} onClick={() => setStatus(x)}>{x === exp ? '* ' : ok ? '' : '+ '}{t(`cl.ts.s.${x}`)}</button>;
          })}
          <p className="cx-ts-intro">{t('cl.role.job')}</p>
          {(['player', 'assistant', 'coach'] as const).map((j) => <button key={j} className={`cx-opt ${job === j ? 'sel' : 'on'}`} disabled={j !== 'player' && !careerOk} onClick={() => setJob(j)}>{j !== 'player' && !careerOk ? '+ ' : ''}{t(`cl.role.${j}`)}</button>)}
          <p className="cx-ts-intro">* {t('cl.role.expected')}</p>
          {!careerOk && <p className="cx-ts-intro">+ {t('cl.role.notEnding')}</p>}
        </div>
        <div className="cx-ts-buttons cx-dlg-foot"><button onClick={onClose}>{t('common.back')}</button>
          <button className="primary" onClick={() => { act({ t: 'squadStatus', pid, status: status ?? null, loanListed: !!p.loanListed }); p.jobRole = job;
            if (renewCm) { const d = humanRenewDemand(p, club), so = Math.round(d.signOn / 500) * 500; setRw(d); setWage(r50(d.wage)); setYears(d.years); setCl(so ? { signOn: so } : {}); }
            setRoleStep(false); }}>{t('cl.ts.set')}</button></div>
      </div>
    );
  }
  return (
    <div className="cx-dlg">
      <div className="cx-title" style={{ background: col.bg, color: col.fg }}><h2>{name}{p.club ? ` (${g.clubs[p.club]?.short})` : ''}</h2></div>
      <div className="cx-subtitle">{t('cl.neg.title')}</div>
      {ask ? (
        <div className="cx-dlg-body center"><p className="cx-ts-intro">{t('cl.neg.confirm', { player: name })}</p></div>
      ) : (
        <>
          <div className="cx-tabrow cx-neg-tabs">
            {(['basic', 'bonuses', 'clauses'] as Tab[]).map((k) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{t(`cl.neg.tab.${k}`)}</button>)}
          </div>
          <div className="cx-dlg-body">
            {msg && <p className="cx-ts-intro cx-neg-msg">{msg}</p>}
            {/* 0x4e06e0: "no interest" er kun teksten i stedet for kravet – grenene mødes i 0x4e11b5, så loftet, rækkerne og Offer er der altid;
                svaret afgøres af 0x4ce4e0 (cmContractAnswer) */}
            {tab === 'basic' && (
              <>
                <p className="cx-ts-intro">{noInt ? t(noInt.key, { player: name, reasons: noInt.reasons, club: club.name })
                  : t(signReq ? 'cl.neg.wantsSign' : 'cl.neg.wants', { player: name, wage: moneyWage(demand), until: end(wantYears), fee: moneyFull(signReq) })}</p>
                <p className="cx-ts-intro">{t('cl.neg.allow', { allow: moneyWage(allow) })}</p>
                <Row label={t('cl.neg.wage')} value={wage} show={moneyWage} options={wageOpts.includes(wage) ? wageOpts : [...wageOpts, wage].sort((a, b) => a - b)} onSet={setWage} reset={demand}
                  stepper={(d) => cashStepEur(wage, 8, d)} downOff={Math.round(wage * cmGbp(g, club.id)) <= 100}
                  upOff={cmAllow !== null && cashRound(cashUnits(cashStepEur(wage, 8, 1)), 8) > cashRound(cashUnits(cmAllow), 8)} />
                <Row label={t('cl.neg.signOn')} value={cl.signOn ?? 0} show={fee8} options={[...new Set([0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map((f) => Math.round(Math.max(signReq, demand * 10) * f / 5000) * 5000))]} onSet={(v) => set('signOn', v)} reset={signReq} />
                <Row label={t('cl.neg.expires')} value={years} show={end} options={[1, 2, 3, 4, 5]} onSet={setYears} reset={wantYears} />
                <div className="cx-neg-row"><span className="cx-neg-label">{t('cl.neg.type')}</span><span />
                  <button className="cx-neg-static cx-neg-type" onClick={() => setCl((c) => ({ ...c, partTime: !c.partTime || undefined }))}>{t(cl.partTime ? 'cl.neg.partTime' : 'cl.neg.fullTime')}</button></div>
              </>
            )}
            {tab === 'bonuses' && (
              <>
                <p className="cx-ts-intro">{t('cl.neg.bonusIntro')}</p>
                {bonus('goalBonus', demand * 0.1)}
                {bonus('appBonus', demand * 0.05)}
                {bonus('cleanSheetBonus', demand * 0.05)}
              </>
            )}
            {tab === 'clauses' && (
              <>
                <p className="cx-ts-intro">{t('cl.neg.clauseIntro')}</p>
                <button className={`cx-opt ${cl.release ? 'on' : ''}`} onClick={() => toggle('release', Math.round(relBase * 2.5 / 100_000) * 100_000)}>{t('cl.neg.release')}</button>
                <Row label={t('cl.neg.releaseFee')} value={cl.release ?? 0} show={fee8} options={relOpts} on={!!cl.release} onSet={(v) => set('release', v)} />
                <p className="cx-ts-intro">{t('cl.neg.nonRelease')}</p>
                {!authentic() && (
                <>
                  <button className={`cx-opt ${cl.wageRise ? 'on' : ''}`} onClick={() => toggle('wageRise', 10)}>{t('cl.neg.wageRise', { n: cl.wageRise ?? 10 })}</button>
                <button className={`cx-opt ${cl.relegationCut ? 'on' : ''}`} onClick={() => toggle('relegationCut', 25)}>{t('cl.neg.relegationCut', { n: cl.relegationCut ?? 25 })}</button>
                <button className={`cx-opt ${cl.promotionRise ? 'on' : ''}`} onClick={() => toggle('promotionRise', 25)}>{t('cl.neg.promotionRise', { n: cl.promotionRise ?? 25 })}</button>
                </>
              )}
              </>
            )}
          </div>
        </>
      )}
      <div className="cx-ts-buttons cx-dlg-foot">
        {ask ? <><button onClick={() => setAsk(false)}>{t('common.no')}</button><button className="primary" onClick={submit}>{t('common.yes')}</button></>
          : <><button onClick={onClose}>{t('common.cancel')}</button><button className="primary" disabled={noInt?.key === 'cm.neg.noRenewNow'} onClick={() => setAsk(true)}>{t('cl.neg.offer')}</button></>}
      </div>
    </div>
  );
}
