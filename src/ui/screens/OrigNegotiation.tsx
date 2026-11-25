// "Offer Contract" som i CM 01/02 i det moderne udseende: først Set Role At Club (trupstatus + job), derefter Basic · Bonuses · Clauses med − / værdi ▾ / + / =
// og "Offer contract to …?" før tilbuddet sendes. Reglerne ligger i game/ (cmTransferTalks, cmBudget, transfers) – her er kun tegningen.
import { useEffect, useMemo, useState } from 'react';
import { act } from '../../game/actions';
import { gs } from '../../game/state';
import { humanRenewDemand, preferredYears, renewalDemand, signOnDemand, wageDemand } from '../../game/transfers';
import type { ContractClauses, TransferOffer } from '../../game/types';
import { cmLogic } from '../../game/cmPlayerData';
import { cmBoardWageAllow } from '../../game/cmBudget';
import { cmGbp } from '../../game/cmMoney';
import { cashRound, cashStepEur, cashUnits, moneyCm, moneyFull, moneyWage, t } from '../../i18n';
import { SQUAD_STATUSES, expectedStatus, statusAllowed, type SquadStatus } from '../../game/squadStatus';
import { ageOn, year } from '../../game/dates';
import { authentic } from '../../game/rules';
import { cmNoInterest, cmOfferScreen, cmRoleExpected, cmTalksDemand } from '../../game/cmTransferTalks';
import { cmWhyText } from './common';
import { Modal } from '../components';

type Tab = 'basic' | 'bonuses' | 'clauses';
const r50 = (v: number) => Math.max(0, Math.round(v / 50) * 50);
const fee8 = (v: number) => moneyCm(v, 6, 8);
const bonus8 = (v: number) => moneyCm(v, 0xa, 8);

/** etiket · − · værdi ▾ · + · = ; en slået-fra række er grå, og et klik på etiketten slår den til */
function Row({ label, value, show, options, onSet, reset, on = true, onToggle, stepper, upOff, downOff }: {
  label: string; value: number; show: (v: number) => string; options: number[]; onSet: (v: number) => void; reset?: number;
  on?: boolean; onToggle?: () => void; stepper?: (d: 1 | -1) => number; upOff?: boolean; downOff?: boolean;
}) {
  const step = (d: 1 | -1) => {
    if (stepper) { onSet(stepper(d)); return; }
    const next = d > 0 ? options.find((o) => o > value) : [...options].reverse().find((o) => o < value);
    if (next !== undefined) onSet(next);
  };
  return (
    <div className="row" style={{ gap: 8, alignItems: 'center', opacity: on ? 1 : 0.55 }}>
      <button className="small" style={{ minWidth: 170, textAlign: 'left' }} onClick={onToggle} disabled={!onToggle}>{label}</button>
      <button className="small" disabled={!on || downOff} onClick={() => step(-1)} aria-label="-">−</button>
      <select disabled={!on} value={value} onChange={(e) => onSet(Number(e.target.value))} style={{ minWidth: 120 }}>
        {(options.includes(value) ? options : [...options, value].sort((a, b) => a - b)).map((o) => <option key={o} value={o}>{show(o)}</option>)}
      </select>
      <button className="small" disabled={!on || upOff} onClick={() => step(1)} aria-label="+">+</button>
      <button className="small" disabled={!on || reset === undefined} onClick={() => reset !== undefined && onSet(reset)}>=</button>
    </div>
  );
}

/** Set Role At Club: trupstatus (og for egen spiller jobbet) */
function RoleStep({ pid, own, expected, status0, job0, onClose, onSet }: {
  pid: number; own: boolean; expected: SquadStatus | undefined; status0?: SquadStatus; job0: 'player' | 'assistant' | 'coach'; onClose: () => void; onSet: (s: SquadStatus | undefined, job: 'player' | 'assistant' | 'coach') => void;
}) {
  const g = gs();
  const p = g.players[pid];
  const [status, setStatus] = useState<SquadStatus | undefined>(status0);
  const [job, setJob] = useState(job0);
  const age = ageOn(p.dob, g.date);
  const careerOk = age >= 33;
  const name = `${p.first} ${p.last}`.trim();
  return (
    <Modal title={`${name}${p.club ? ` (${g.clubs[p.club]?.short})` : ''} – ${t('cl.role.title')}`} onClose={onClose}>
      <div className="col">
        <div className="muted">{t('cl.ts.squad')}</div>
        <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
          {SQUAD_STATUSES.filter((x) => x !== 'surplus').map((x) => {
            const ok = statusAllowed(p, x, g.date);
            return <button key={x} className={`small ${status === x ? 'primary' : ''}`} disabled={!ok} onClick={() => setStatus(x)}>{x === expected ? '* ' : ok ? '' : '+ '}{t(`cl.ts.s.${x}`)}</button>;
          })}
        </div>
        {own && <>
          <div className="muted">{t('cl.role.job')}</div>
          <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
            {(['player', 'assistant', 'coach'] as const).map((j) => <button key={j} className={`small ${job === j ? 'primary' : ''}`} disabled={j !== 'player' && !careerOk} onClick={() => setJob(j)}>{j !== 'player' && !careerOk ? '+ ' : ''}{t(`cl.role.${j}`)}</button>)}
          </div>
        </>}
        <div className="muted" style={{ fontSize: 12 }}>* {t('cl.role.expected')}{own && !careerOk ? ` · + ${t('cl.role.notEnding')}` : ''}</div>
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button onClick={onClose}>{t('common.back')}</button>
          <button className="primary" onClick={() => onSet(status, job)}>{t('cl.ts.set')}</button>
        </div>
      </div>
    </Modal>
  );
}

export function OrigNegotiation({ offer, renewPid, onClose }: { offer?: TransferOffer; renewPid?: number; onClose: () => void }) {
  const g = gs();
  const pid = offer?.player ?? renewPid!;
  const p = g.players[pid];
  const club = g.clubs[g.userClub];
  const [cmWant] = useState(() => (offer?.cmTalks ? cmTalksDemand(offer, offer.cmRole) : null));
  const renewCm = !offer && cmLogic(g);
  const [rw, setRw] = useState(() => (renewCm ? humanRenewDemand(p, club) : null));
  const demand = r50(cmWant?.wage ?? rw?.wage ?? offer?.demand?.wage ?? (offer ? wageDemand(p, club) : renewalDemand(p, club)));
  const wantYears = cmWant ? Math.max(1, Number(cmWant.expires.slice(0, 4)) - year(g.date)) : rw ? rw.years : offer?.demand?.years ?? preferredYears(p);
  const [tab, setTab] = useState<Tab>('basic');
  const noRenew = !offer && authentic() && !!p.contract?.futureClub;
  // nyt kontrakttilbud (efter et accepteret bud, klubløs): Set Role At Club hos KØBEREN; lån: ingen rolle; forlængelse: egen spillers rolle og job
  const [roleStep, setRoleStep] = useState(!offer ? !noRenew : !offer.loan);
  const [wage, setWage] = useState(demand);
  const [years, setYears] = useState(wantYears);
  const signReq = cmWant ? Math.round(cmWant.signOn / 500) * 500 : rw ? Math.round(rw.signOn / 500) * 500 : signOnDemand(p, demand, !!offer && (!offer.fee || !!offer.preContract));
  const [cl, setCl] = useState<ContractClauses>(signReq ? { signOn: signReq } : {});
  const [ask, setAsk] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const name = `${p.first} ${p.last}`.trim();
  const bill = Object.values(g.players).filter((x) => x.club === club.id).reduce((s, x) => s + (x.contract?.wage ?? 0), 0);
  const cmAllow = useMemo(() => (roleStep ? null : cmBoardWageAllow(g, p, club.id, offer?.cmRole)), [roleStep]); // eslint-disable-line react-hooks/exhaustive-deps
  const allow = cmAllow ?? Math.max(0, club.wageBudget - bill + (offer ? 0 : p.contract?.wage ?? 0));
  useEffect(() => { if (cmAllow !== null && wage > cmAllow) setWage(Math.floor(cmAllow / 50) * 50); }, [cmAllow]); // eslint-disable-line react-hooks/exhaustive-deps
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
  const set = (k: keyof ContractClauses, v: number | undefined) => setCl((c) => ({ ...c, [k]: v || undefined }));
  const toggle = (k: keyof ContractClauses, def: number) => set(k, cl[k] ? undefined : def);
  const wageOpts = [...new Set([0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 1, 1.05, 1.1, 1.2, 1.3, 1.5, 1.75, 2].map((f) => r50(demand * f)).map((v) => (cmAllow !== null && v > cmAllow ? Math.floor(cmAllow / 50) * 50 : v)))];
  const bonusOpts = (base: number) => [...new Set([0.25, 0.5, 1, 1.5, 2, 3].map((f) => Math.max(10, Math.round(base * f / 10) * 10)))];
  const relBase = Math.max(100_000, p.value);
  const relOpts = [...new Set([0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 7.5, 10].map((f) => Math.round(relBase * f / 100_000) * 100_000))];

  if (roleStep) {
    const own = !offer;
    const exp = own ? expectedStatus(p, Object.values(g.players).filter((x) => x.club === p.club), g.date) : cmRoleExpected(g, p, offer!.buyer);
    return <RoleStep pid={pid} own={own} expected={exp} status0={own ? p.squadStatus : offer!.cmRole ?? exp} job0={p.jobRole ?? 'player'} onClose={onClose}
      onSet={(status, job) => {
        if (offer) act({ t: 'cmOfferRole', pid, role: status ?? exp });
        else {
          act({ t: 'squadStatus', pid, status: status ?? null, loanListed: !!p.loanListed }); p.jobRole = job;
          if (renewCm) { const d = humanRenewDemand(p, club), so = Math.round(d.signOn / 500) * 500; setRw(d); setWage(r50(d.wage)); setYears(d.years); setCl(so ? { signOn: so } : {}); }
        }
        setRoleStep(false);
      }} />;
  }

  const submit = () => {
    setAsk(false);
    if (!offer) { act({ t: 'renewLater', pid, wage, years, clauses: cl }); onClose(); return; }
    const res = act<string>({ t: 'negotiate', pid, wage, years, clauses: cl });
    if (res === 'cmSent') { onClose(); return; }
    if (res === 'accepted') { setMsg(t('cl.neg.accepted', { player: name })); setTimeout(onClose, 2200); }
    else if (res === 'pending') { setMsg(t('neg.pendingMp')); setTimeout(onClose, 3200); }
    else if (res === 'counter') {
      const d = r50(offer?.demand?.wage ?? wageDemand(p, club));
      setWage(d); setYears(offer?.demand?.years ?? preferredYears(p));
      setMsg(t('cl.neg.counter', { player: name, wage: moneyWage(d), until: end(offer?.demand?.years ?? preferredYears(p)) }));
    } else if (res === 'budget') setMsg(t('cl.neg.budget', { allow: moneyWage(allow) }));
    else { setMsg(t('cl.neg.refused', { player: name })); setTimeout(onClose, 2600); }
  };
  const bonus = (k: 'goalBonus' | 'appBonus' | 'cleanSheetBonus', base: number) => (
    <Row key={k} label={t(`cl.neg.${k}`)} value={cl[k] ?? Math.max(10, Math.round(base / 10) * 10)} show={bonus8} options={bonusOpts(base)}
      on={!!cl[k]} onToggle={() => toggle(k, Math.max(10, Math.round(base / 10) * 10))} onSet={(v) => set(k, v)} reset={Math.max(10, Math.round(base / 10) * 10)} />
  );
  return (
    <Modal title={`${name}${p.club ? ` (${g.clubs[p.club]?.short})` : ''} – ${t('cl.neg.title')}`} onClose={onClose} wide>
      {ask ? (
        <div className="col">
          <p>{t('cl.neg.confirm', { player: name })}</p>
          <div className="row" style={{ justifyContent: 'flex-end' }}><button onClick={() => setAsk(false)}>{t('common.no')}</button><button className="primary" onClick={submit}>{t('common.yes')}</button></div>
        </div>
      ) : (
        <div className="col">
          <div className="row" style={{ gap: 6 }}>
            {(['basic', 'bonuses', 'clauses'] as Tab[]).map((k) => <button key={k} className={`small ${tab === k ? 'primary' : ''}`} onClick={() => setTab(k)}>{t(`cl.neg.tab.${k}`)}</button>)}
          </div>
          {msg && <div className="insight warn">{msg}</div>}
          {tab === 'basic' && (
            <>
              <p>{noInt ? t(noInt.key, { player: name, reasons: noInt.reasons, club: club.name })
                : t(signReq ? 'cl.neg.wantsSign' : 'cl.neg.wants', { player: name, wage: moneyWage(demand), until: end(wantYears), fee: moneyFull(signReq) })}</p>
              <p className="muted">{t('cl.neg.allow', { allow: moneyWage(allow) })}</p>
              <Row label={t('cl.neg.wage')} value={wage} show={moneyWage} options={wageOpts} onSet={setWage} reset={demand}
                stepper={(d) => cashStepEur(wage, 8, d)} downOff={Math.round(wage * cmGbp(g, club.id)) <= 100}
                upOff={cmAllow !== null && cashRound(cashUnits(cashStepEur(wage, 8, 1)), 8) > cashRound(cashUnits(cmAllow), 8)} />
              <Row label={t('cl.neg.signOn')} value={cl.signOn ?? 0} show={fee8} options={[...new Set([0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map((f) => Math.round(Math.max(signReq, demand * 10) * f / 5000) * 5000))]} onSet={(v) => set('signOn', v)} reset={signReq} />
              <Row label={t('cl.neg.expires')} value={years} show={end} options={[1, 2, 3, 4, 5]} onSet={setYears} reset={wantYears} />
              <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                <span style={{ minWidth: 170 }}>{t('cl.neg.type')}</span>
                <button className="small" onClick={() => setCl((c) => ({ ...c, partTime: !c.partTime || undefined }))}>{t(cl.partTime ? 'cl.neg.partTime' : 'cl.neg.fullTime')}</button>
              </div>
            </>
          )}
          {tab === 'bonuses' && (
            <>
              <p className="muted">{t('cl.neg.bonusIntro')}</p>
              {bonus('goalBonus', demand * 0.1)}
              {bonus('appBonus', demand * 0.05)}
              {bonus('cleanSheetBonus', demand * 0.05)}
            </>
          )}
          {tab === 'clauses' && (
            <>
              <p className="muted">{t('cl.neg.clauseIntro')}</p>
              <button className={`small ${cl.release ? 'primary' : ''}`} style={{ alignSelf: 'flex-start' }} onClick={() => toggle('release', Math.round(relBase * 2.5 / 100_000) * 100_000)}>{t('cl.neg.release')}</button>
              <Row label={t('cl.neg.releaseFee')} value={cl.release ?? 0} show={fee8} options={relOpts} on={!!cl.release} onSet={(v) => set('release', v)} />
              <p className="muted">{t('cl.neg.nonRelease')}</p>
            </>
          )}
          <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}>
            <button onClick={onClose}>{t('common.cancel')}</button>
            <button className="primary" disabled={noInt?.key === 'cm.neg.noRenewNow'} onClick={() => setAsk(true)}>{t('cl.neg.offer')}</button>
          </div>
        </div>
      )}
    </Modal>
  );
}
