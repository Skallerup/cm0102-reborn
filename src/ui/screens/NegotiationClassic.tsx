// "Offer Contract" som i CM 01/02: fanerne Basic · Bonuses · Clauses, rækker med − / værdi ▾ / + / =, et klik på en
// bonus eller klausul slår den til (hvid tekst), og "Offer contract to …?" med No/Yes før tilbuddet sendes.
import { useState } from 'react';
import { act } from '../../game/actions';
import { gs } from '../../game/state';
import { preferredYears, renewalDemand, signOnDemand, wageDemand } from '../../game/transfers';
import type { ContractClauses, StaffRole, TransferOffer } from '../../game/types';
import { cmStaffDemand, cmStaffInterestedIn } from '../../game/cmStaff';
import { poachFee } from '../../game/staff';
import { money, t } from '../../i18n';
import { CxDrop, titleColors, useClassicDialog } from '../classic';
import { SQUAD_STATUSES, expectedStatus, statusAllowed, type SquadStatus } from '../../game/squadStatus';
import { ageOn, year } from '../../game/dates';
import { cmTalksDemand } from '../../game/cmTransferTalks';

type Tab = 'basic' | 'bonuses' | 'clauses';
const r50 = (v: number) => Math.max(0, Math.round(v / 50) * 50);

/** En række: etiket · − · værdi ▾ (grøn liste) · + · = (tilbage til spillerens krav) */
function Row({ label, value, show, options, onSet, reset, on = true, onToggle, star }: {
  label: string; value: number; show: (v: number) => string; options: number[]; onSet: (v: number) => void; reset?: number;
  on?: boolean; onToggle?: () => void; star?: boolean;
}) {
  // − / +: den næste mulighed under eller over den nuværende værdi
  const step = (d: number) => {
    const next = d > 0 ? options.find((o) => o > value) : [...options].reverse().find((o) => o < value);
    if (next !== undefined) onSet(next);
  };
  return (
    <div className={`cx-neg-row ${on ? '' : 'off'}`}>
      <button className={`cx-neg-label ${onToggle ? 'toggle' : ''}`} onClick={onToggle} disabled={!onToggle}>{star && <span className="cx-neg-star">* </span>}{label}</button>
      <button className="cx-pm" disabled={!on} onClick={() => step(-1)}>−</button>
      <CxDrop className="cx-green cx-neg-val" caret label={show(value)} btn={{ disabled: !on }}
        items={options.map((o) => ({ key: String(o), label: show(o), checked: o === value, onClick: () => onSet(o) }))} />
      <button className="cx-pm" disabled={!on} onClick={() => step(1)}>+</button>
      <button className="cx-pm" disabled={!on || reset === undefined} onClick={() => reset !== undefined && onSet(reset)}>=</button>
    </div>
  );
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
  const demand = r50(cmStaffDemand(s));
  const [wage, setWage] = useState(demand);
  const [years, setYears] = useState(2);
  const [signOn, setSignOn] = useState(0);
  const [pub, setPub] = useState(false);
  const [ask, setAsk] = useState(false);
  const name = `${s.first} ${s.last}`.trim();
  const interested = cmStaffInterestedIn(g, s, role);
  const bill = Object.values(g.players).filter((x) => x.club === club.id).reduce((a, x) => a + (x.contract?.wage ?? 0), 0);
  // *estimeret* (spillernes regel): lønbudgettet minus truppens lønsum
  const allow = Math.max(0, club.wageBudget - bill);
  const end = (y: number) => `${t('cl.neg.jun')} ${g.season + y}`;
  const from = s.club ? g.clubs[s.club] : undefined;
  const col = titleColors(s.club || undefined);
  const wageOpts = [...new Set([0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 1, 1.05, 1.1, 1.2, 1.3, 1.5, 1.75, 2].map((f) => r50(demand * f)))];
  const send = () => { act({ t: 'cmStaffOffer', id: s.id, role, wage, years, signOn }); onClose(true); };
  return (
    <div className="cx-dlg cx-staff-neg">
      <div className="cx-title" style={{ background: col.bg, color: col.fg }}><h2>{name}{from ? ` (${from.short || from.name})` : ''}</h2></div>
      <div className="cx-subtitle">{t('cl.neg.title')}</div>
      {ask ? (
        <div className="cx-dlg-body"><p className="cx-ts-intro">{t('cl.neg.confirm', { player: name })}</p>
          {from && <p className="cx-ts-intro">{t('cm.neg.comp', { club: from.short || from.name, fee: money(poachFee(s)) })}</p>}</div>
      ) : (
        <div className="cx-dlg-body">
          <p className="cx-ts-intro">{interested ? t('cl.neg.wants', { player: name, wage: money(demand), until: end(2), fee: '' }) : t('cm.neg.noInterest', { name })}</p>
          <p className="cx-ts-intro">{t('cl.neg.allow', { allow: money(allow) })}</p>
          <Row label={t('cl.neg.wage')} value={wage} show={money} options={wageOpts.includes(wage) ? wageOpts : [...wageOpts, wage].sort((a, b) => a - b)} onSet={setWage} reset={demand} />
          <Row label={t('cl.neg.signOn')} value={signOn} show={money} options={[0, 5000, 10000, 25000, 50000, 100000, 250000]} onSet={setSignOn} reset={0} />
          <Row label={t('cl.neg.expires')} value={years} show={end} options={[1, 2, 3, 4, 5]} onSet={setYears} reset={2} />
          <div className="cx-neg-row"><span className="cx-neg-label">{t('cl.neg.type')}</span><span /><span className="cx-neg-static cx-neg-type">{t('cl.neg.fullTime')}</span></div>
          <div className="cx-neg-row"><span className="cx-neg-label">{t('cm.neg.public')}</span><span />
            <button className="cx-neg-static cx-neg-type cx-neg-public" onClick={() => setPub(!pub)}>{t(pub ? 'common.yes' : 'common.no')}</button></div>
        </div>
      )}
      <div className="cx-ts-buttons cx-dlg-foot">
        {ask ? <><button onClick={() => setAsk(false)}>{t('common.no')}</button><button className="primary" onClick={send}>{t('common.yes')}</button></>
          : <><button onClick={() => onClose(false)}>{t('common.cancel')}</button><button className="primary" onClick={() => setAsk(true)}>{t('cl.neg.offer')}</button></>}
      </div>
    </div>
  );
}

export function ClassicNegotiation({ offer, renewPid, onClose }: { offer?: TransferOffer; renewPid?: number; onClose: () => void }) {
  useClassicDialog();
  const g = gs();
  const pid = offer?.player ?? renewPid!;
  const p = g.players[pid];
  const club = g.clubs[g.userClub];
  // CM 01/02 efter et accepteret bud: spillerens krav 0x85fc50 (cmTransferTalks.ts)
  const [cmWant] = useState(() => (offer?.cmTalks ? cmTalksDemand(offer) : null));
  const demand = r50(cmWant?.wage ?? offer?.demand?.wage ?? (offer ? wageDemand(p, club) : renewalDemand(p, club)));
  const wantYears = cmWant ? Math.max(1, Number(cmWant.expires.slice(0, 4)) - year(g.date)) : offer?.demand?.years ?? preferredYears(p);
  const [tab, setTab] = useState<Tab>('basic');
  // egen spiller (CM 01/02): først "Set Role At Club" – status i truppen og jobbeskrivelse
  const [roleStep, setRoleStep] = useState(!offer);
  const [status, setStatus] = useState<SquadStatus | undefined>(p.squadStatus);
  const [job, setJob] = useState<'player' | 'assistant' | 'coach'>(p.jobRole ?? 'player');
  const [wage, setWage] = useState(demand);
  const [years, setYears] = useState(wantYears);
  const signReq = cmWant ? Math.round(cmWant.signOn / 500) * 500 : signOnDemand(p, demand, !!offer && (!offer.fee || !!offer.preContract));
  const [cl, setCl] = useState<ContractClauses>(signReq ? { signOn: signReq } : {});
  const [ask, setAsk] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const name = `${p.first} ${p.last}`.trim();
  const bill = Object.values(g.players).filter((x) => x.club === club.id).reduce((s, x) => s + (x.contract?.wage ?? 0), 0);
  const allow = Math.max(0, club.wageBudget - bill + (offer ? 0 : p.contract?.wage ?? 0));
  const end = (y: number) => `${t('cl.neg.jun')} ${g.season + y}`;
  const col = titleColors(p.club || undefined);
  const set = (k: keyof ContractClauses, v: number | undefined) => setCl((c) => ({ ...c, [k]: v || undefined }));
  const toggle = (k: keyof ContractClauses, def: number) => set(k, cl[k] ? undefined : def);
  const wageOpts = [...new Set([0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 1, 1.05, 1.1, 1.2, 1.3, 1.5, 1.75, 2].map((f) => r50(demand * f)))];
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
      setMsg(t('cl.neg.counter', { player: name, wage: money(d), until: end(offer?.demand?.years ?? preferredYears(p)) }));
    } else if (res === 'budget') setMsg(t('cl.neg.budget', { allow: money(allow) }));
    else { setMsg(t('cl.neg.refused', { player: name })); setTimeout(onClose, 2600); }
  };
  const bonus = (k: 'goalBonus' | 'appBonus' | 'cleanSheetBonus', base: number) => (
    <Row key={k} label={t(`cl.neg.${k}`)} value={cl[k] ?? Math.max(10, Math.round(base / 10) * 10)} show={money} options={bonusOpts(base)}
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
          <button className="primary" onClick={() => { act({ t: 'squadStatus', pid, status: status ?? null, loanListed: !!p.loanListed }); p.jobRole = job; setRoleStep(false); }}>{t('cl.ts.set')}</button></div>
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
            {tab === 'basic' && (
              <>
                <p className="cx-ts-intro">{t(signReq ? 'cl.neg.wantsSign' : 'cl.neg.wants', { player: name, wage: money(demand), until: end(wantYears), fee: money(signReq) })}</p>
                <p className="cx-ts-intro">{t('cl.neg.allow', { allow: money(allow) })}</p>
                <Row label={t('cl.neg.wage')} value={wage} show={money} options={wageOpts.includes(wage) ? wageOpts : [...wageOpts, wage].sort((a, b) => a - b)} onSet={setWage} reset={demand} />
                <Row label={t('cl.neg.signOn')} value={cl.signOn ?? 0} show={money} options={[...new Set([0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map((f) => Math.round(Math.max(signReq, demand * 10) * f / 5000) * 5000))]} onSet={(v) => set('signOn', v)} reset={signReq} />
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
                <Row label={t('cl.neg.releaseFee')} value={cl.release ?? 0} show={money} options={relOpts} on={!!cl.release} onSet={(v) => set('release', v)} />
                <p className="cx-ts-intro">{t('cl.neg.nonRelease')}</p>
                <button className={`cx-opt ${cl.wageRise ? 'on' : ''}`} onClick={() => toggle('wageRise', 10)}>{t('cl.neg.wageRise', { n: cl.wageRise ?? 10 })}</button>
                <button className={`cx-opt ${cl.relegationCut ? 'on' : ''}`} onClick={() => toggle('relegationCut', 25)}>{t('cl.neg.relegationCut', { n: cl.relegationCut ?? 25 })}</button>
                <button className={`cx-opt ${cl.promotionRise ? 'on' : ''}`} onClick={() => toggle('promotionRise', 25)}>{t('cl.neg.promotionRise', { n: cl.promotionRise ?? 25 })}</button>
              </>
            )}
          </div>
        </>
      )}
      <div className="cx-ts-buttons cx-dlg-foot">
        {ask ? <><button onClick={() => setAsk(false)}>{t('common.no')}</button><button className="primary" onClick={submit}>{t('common.yes')}</button></>
          : <><button onClick={onClose}>{t('common.cancel')}</button><button className="primary" onClick={() => setAsk(true)}>{t('cl.neg.offer')}</button></>}
      </div>
    </div>
  );
}
