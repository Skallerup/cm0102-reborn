// "Set Staff Transfer Status" (som i CM 01/02): udbudspris (− / + / Auto), status i truppen og transferstatus.
import { useState, type ReactNode } from 'react';
import { act } from '../../game/actions';
import type { DisciplineReason } from '../../game/personality';
import { SQUAD_STATUSES, statusAllowed, type SquadStatus } from '../../game/squadStatus';
import { askingPrice, knownEnquiry, swapCandidates, swapWorth } from '../../game/transfers';
import { ADDON_APPS } from '../../game/clauses';
import type { Player, TransferOffer } from '../../game/types';
import type { RejectReason } from '../../game/will';
import { ageOn } from '../../game/dates';
import { compName, money, moneyFull, t } from '../../i18n';
import { jobTerms } from '../../game/board';
import { useGame } from '../core';
import { CxDrop, useClassicDialog } from '../classic';

const round = (v: number) => Math.max(10_000, Math.round(v / 10_000) * 10_000);

export function TransferStatusPanel({ p, onClose }: { p: Player; onClose: () => void }) {
  const g = useGame()!;
  useClassicDialog();
  const [status, setStatus] = useState<SquadStatus | undefined>(p.squadStatus);
  const [listed, setListed] = useState(p.listed);
  const [loan, setLoan] = useState(!!p.loanListed);
  const [price, setPrice] = useState<number | undefined>(p.listPrice);
  const shown = price ?? askingPrice(p);
  const step = round(Math.max(p.value, 50_000) * 0.1);
  const name = `${p.first} ${p.last}`.trim();
  const save = () => {
    act({ t: 'squadStatus', pid: p.id, status: status ?? null, loanListed: loan });
    if (!listed) { if (p.listed) act({ t: 'listed', pid: p.id, price: null }); }
    else if (price !== undefined) act({ t: 'listed', pid: p.id, price });
    else {
      // Auto: på listen uden egen pris (slå til – og nulstil en tidligere pris)
      if (p.listed && p.listPrice) act({ t: 'listed', pid: p.id });
      if (!g.players[p.id].listed) act({ t: 'listed', pid: p.id });
    }
    onClose();
  };
  return (
    <div className="cx-tstatus">
      <div className="cx-subtitle">{t('cl.ts.title')}</div>
      <div className="cx-ts-body">
        <p className="cx-ts-intro">{t('cl.ts.valued', { player: name, value: money(p.value) })}</p>
        <div className="cx-ts-price">
          <span className="cx-ts-label">{t('cl.ts.asking')}</span>
          <button className="cx-pm" onClick={() => setPrice(round(shown - step))} aria-label="-">−</button>
          <span className="cx-ts-val">{money(shown)}</span>
          <button className="cx-pm" onClick={() => setPrice(round(shown + step))} aria-label="+">+</button>
          <button className={`cx-pm auto ${price === undefined ? 'on' : ''}`} onClick={() => setPrice(undefined)}>{t('cl.ts.auto')}</button>
        </div>
        <div className="cx-ts-head">{t('cl.ts.squad')}</div>
        {SQUAD_STATUSES.map((s) => {
          const ok = statusAllowed(p, s, g.date);
          return <button key={s} className={`cx-ts-opt ${status === s ? 'on' : ''}`} disabled={!ok} onClick={() => setStatus(status === s ? undefined : s)}>{t(`cl.ts.s.${s}`)}</button>;
        })}
        <div className="cx-ts-head">{t('cl.ts.transfer')}</div>
        <button className={`cx-ts-opt ${listed ? 'on' : ''}`} onClick={() => setListed(!listed)}>{t('cl.ts.listed')}</button>
        <button className={`cx-ts-opt ${loan ? 'on' : ''}`} onClick={() => setLoan(!loan)}>{t('cl.ts.loan')}</button>
        <button className={`cx-ts-opt ${p.wantsAway ? 'on' : ''}`} disabled>{t('cl.ts.request')}</button>
      </div>
      <div className="cx-ts-buttons">
        <button onClick={onClose}>{t('common.back')}</button>
        <button className="primary" onClick={save}>{t('cl.ts.set')}</button>
      </div>
    </div>
  );
}

const DISCIPLINE = ['warning', 'fine', 'fineHeavy'] as const;
const REASONS: DisciplineReason[] = ['none', 'unprofessional', 'dismissal', 'violent', 'poor'];

/** "Discipline Player" (som i CM 01/02): straf med − / + og en begrundelse */
export function DisciplinePanel({ p, onClose, onDone }: { p: Player; onClose: () => void; onDone: (msg: string) => void }) {
  useClassicDialog();
  const [i, setI] = useState(0);
  const [reason, setReason] = useState<DisciplineReason>('none');
  const kind = DISCIPLINE[i];
  const wage = p.contract?.wage ?? 0;
  const name = `${p.first} ${p.last}`.trim();
  const confirm = () => {
    const r = act<{ key: string }>({ t: 'interact', pid: p.id, kind, reason });
    onDone(t(r.key, { player: name }));
  };
  return (
    <div className="cx-tstatus">
      <div className="cx-subtitle">{t('cl.dp.title')}</div>
      <div className="cx-ts-body">
        <p className="cx-ts-intro">{t('cl.dp.intro', { player: name })}</p>
        <div className="cx-ts-price">
          <span className="cx-ts-label">{t('cl.dp.action')}</span>
          <button className="cx-pm" onClick={() => setI((i + DISCIPLINE.length - 1) % DISCIPLINE.length)} aria-label="-">−</button>
          <span className="cx-ts-val wide">{t(`cl.dp.k.${kind}`, { fee: money(kind === 'fine' ? wage : wage * 2) })}</span>
          <button className="cx-pm" onClick={() => setI((i + 1) % DISCIPLINE.length)} aria-label="+">+</button>
        </div>
        <div className="cx-ts-head">{t('cl.dp.reason')}</div>
        {REASONS.map((r) => <button key={r} className={`cx-ts-opt ${reason === r ? 'on' : ''}`} onClick={() => setReason(r)}>{t(`cl.dp.r.${r}`)}</button>)}
      </div>
      <div className="cx-ts-buttons">
        <button onClick={onClose}>{t('common.cancel')}</button>
        <button className="primary" onClick={confirm}>{t('cl.dp.confirm')}</button>
      </div>
    </div>
  );
}

/** "Approach To Buy/Loan" (CM 01/02 "Man Utd transfer bid for Inamoto"): beløb med − / + / =, klausuler, bytte og samlet værdi */
export function BidPanel({ p, loan, onClose, onSent }: { p: Player; loan: boolean; onClose: () => void; onSent: (o: TransferOffer) => void }) {
  const g = useGame()!;
  useClassicDialog();
  const me = g.clubs[g.userClub];
  const budget = me?.transferBudget ?? 0;
  const known = knownEnquiry(p.id);
  const step = round(Math.max(p.value, 100_000) * 0.05);
  const [fee, setFee] = useState(round(Math.min(budget, known?.fee ?? p.value)));
  const [sellOn, setSellOn] = useState(0);
  const [addOn, setAddOn] = useState(0);
  const [swap, setSwap] = useState<number[]>([]);
  const [err, setErr] = useState('');
  const cands = p.club ? swapCandidates(p.club, p.id).filter((x) => !swap.includes(x.id)) : [];
  const total = fee + swap.reduce((s, id) => s + swapWorth(id, p.club), 0);
  const seller = g.clubs[p.club]?.name ?? '';
  const name = `${p.first} ${p.last}`.trim();
  const submit = () => {
    setErr('');
    const r = act<TransferOffer | string>({ t: 'bid', pid: p.id, fee: loan ? 0 : fee, loan, sellOn: loan ? 0 : sellOn, addOn: loan ? 0 : addOn, swap: loan ? [] : swap });
    if (typeof r === 'string') setErr(t(r)); else onSent(r);
  };
  const row = (label: string, value: string, minus?: () => void, plus?: () => void, extra?: ReactNode) => (
    <div className={`cx-bid-row ${minus || plus ? '' : 'off'}`}>
      <span className="cx-bid-label">{label}</span>
      <button className="cx-pm" disabled={!minus} onClick={minus} aria-label="-">−</button>
      <span className="cx-bid-val">{value}</span>
      <button className="cx-pm" disabled={!plus} onClick={plus} aria-label="+">+</button>
      {extra}
    </div>
  );
  return (
    <div className="cx-tstatus cx-bid">
      <div className="cx-subtitle">{t(loan ? 'cl.bid.loanTitle' : 'cl.bid.title', { club: me?.short ?? '', player: p.last })}</div>
      <div className="cx-ts-body">
        <p className="cx-ts-intro">{t('cl.bid.valued', { club: seller, player: name, value: moneyFull(p.value) })}<br />{!loan && t('cl.bid.board', { fee: moneyFull(budget) })}</p>
        {!loan && <>
          {row(t('cl.bid.fee'), money(fee), () => setFee(round(Math.max(0, fee - step))), () => setFee(round(fee + step)),
            <button className="cx-pm" onClick={() => setFee(round(known?.fee ?? p.value))} title={t('cl.bid.feeEq')}>=</button>)}
          {row(t('cl.bid.install'), '-')}
          {row(t('cl.bid.sellOn'), sellOn ? `${sellOn}%` : '-', sellOn > 0 ? () => setSellOn(sellOn - 5) : undefined, sellOn < 50 ? () => setSellOn(sellOn + 5) : undefined)}
          {row(t('cl.bid.addOn', { n: ADDON_APPS }), addOn ? money(addOn) : '-', addOn > 0 ? () => setAddOn(round(Math.max(0, addOn - step))) : undefined, () => setAddOn(round(addOn + step)))}
          {row(t('cl.bid.intl'), '-')}
          <div className="cx-bid-row off"><span className="cx-bid-label">{t('cl.bid.public')}</span><span className="cx-bid-val wide">{t('common.no')}</span></div>
          <div className="cx-bid-tools">
            <CxDrop label={t('cl.bid.exchange')} items={cands.length ? cands.slice(0, 20).map((x) => ({ key: String(x.id), label: `${x.first} ${x.last} (${money(swapWorth(x.id, p.club))})`, onClick: () => setSwap([...swap, x.id]) })) : [{ key: 'none', label: t('common.none'), disabled: true, onClick: () => {} }]} />
            <button className="cx-greybtn" disabled={!swap.length} onClick={() => setSwap(swap.slice(0, -1))}>{t('cl.bid.remove')}</button>
          </div>
          {swap.map((id) => <div key={id} className="cx-bid-swap">{g.players[id]?.first} {g.players[id]?.last}<span>{money(swapWorth(id, p.club))}</span></div>)}
          <div className="cx-bid-total"><span>{t('cl.bid.total')}</span><b>{moneyFull(total)}</b></div>
        </>}
        {err && <div className="cx-bid-err">{err}</div>}
      </div>
      <div className="cx-ts-buttons">
        <button onClick={onClose}>{t('common.back')}</button>
        <button className="primary" onClick={submit}>{t('cl.bid.offer')}</button>
      </div>
    </div>
  );
}

/** Svar på et bud på egen spiller (CM 01/02 "Negotiate Arsenal bid for Butt"): Back · Reject · Delay · Accept – et ændret beløb er et modbud */
export function IncomingBidPanel({ offer, onClose }: { offer: TransferOffer; onClose: (msg?: string) => void }) {
  const g = useGame()!;
  useClassicDialog();
  const p = g.players[offer.player];
  const buyer = g.clubs[offer.buyer];
  const me = g.clubs[g.userClub];
  const step = round(Math.max(p?.value ?? 0, 100_000) * 0.05);
  const [fee, setFee] = useState(offer.fee);
  const [rejecting, setRejecting] = useState(false);
  // CM 01/02's begrundelser → vores (klubbens egne grunde – samme division, rival – siger intet til spilleren)
  const REASONS: [string, RejectReason][] = [['none', 'none'], ['indispensable', 'key'], ['important', 'key'], ['prospect', 'future'], ['division', 'none'], ['unacceptable', 'low'], ['rival', 'none']];
  const young = p ? ageOn(p.dob, g.date) <= 23 : false;
  const [why, setWhy] = useState(young ? 'prospect' : 'important');
  if (!p || !buyer) return null;
  const changed = fee !== offer.fee;
  const reply = (action: 'accept' | 'reject' | 'counter') => {
    const reason = REASONS.find(([k]) => k === why)?.[1] ?? 'none';
    const r = act<string | null>({ t: 'respond', pid: p.id, buyer: buyer.id, action, ...(action === 'counter' ? { counter: fee } : {}), ...(action === 'reject' ? { reason } : {}) });
    onClose(typeof r === 'string' && r !== 'ok' ? t(r) : undefined);
  };
  const name = `${p.first} ${p.last}`.trim();
  if (rejecting) return (
    <div className="cx-tstatus">
      <div className="cx-subtitle">{t('cl.bid.offerFor', { player: name })}</div>
      <div className="cx-ts-body">
        <p className="cx-ts-intro">{t('cl.bid.rejectQ', { player: name })}</p>
        <div className="cx-ts-head">{t('cl.bid.reason')}</div>
        {REASONS.map(([k]) => <button key={k} className={`cx-ts-opt ${why === k ? 'on' : ''}`} disabled={k === 'prospect' && !young} onClick={() => setWhy(k)}>{t(`cl.bid.why.${k}`)}</button>)}
      </div>
      <div className="cx-ts-buttons">
        <button onClick={() => setRejecting(false)}>{t('common.no')}</button>
        <button className="primary" onClick={() => reply('reject')}>{t('common.yes')}</button>
      </div>
    </div>
  );
  const row = (label: string, value: string, minus?: () => void, plus?: () => void, extra?: ReactNode) => (
    <div className={`cx-bid-row ${minus || plus ? '' : 'off'}`}>
      <span className="cx-bid-label">{label}</span>
      <button className="cx-pm" disabled={!minus} onClick={minus} aria-label="-">−</button>
      <span className="cx-bid-val">{value}</span>
      <button className="cx-pm" disabled={!plus} onClick={plus} aria-label="+">+</button>
      {extra}
    </div>
  );
  return (
    <div className="cx-tstatus cx-bid">
      <div className="cx-subtitle">{t('cl.bid.negotiate', { club: buyer.short, player: p.last })}</div>
      <div className="cx-ts-body">
        <p className="cx-ts-intro">{t('cl.bid.valued', { club: me?.short ?? '', player: `${p.first} ${p.last}`.trim(), value: moneyFull(p.value) })}</p>
        {offer.loan ? <p className="cx-ts-intro">{t('cl.bid.loanAsk')}</p> : <>
          {row(t('cl.bid.fee'), money(fee), () => setFee(round(Math.max(0, fee - step))), () => setFee(round(fee + step)),
            <button className="cx-pm" onClick={() => setFee(round(p.value))} title={t('cl.bid.feeEq')}>=</button>)}
          {row(t('cl.bid.install'), '-')}
          {row(t('cl.bid.sellOn'), offer.sellOn ? `${offer.sellOn}%` : '-')}
          {row(t('cl.bid.addOn', { n: ADDON_APPS }), offer.addOn ? money(offer.addOn) : '-')}
          {row(t('cl.bid.intl'), '-')}
          <div className="cx-bid-row off"><span className="cx-bid-label">{t('cl.bid.public')}</span><span className="cx-bid-val wide">{t('common.no')}</span></div>
          <div className="cx-bid-tools">
            <button className="cx-greybtn" disabled>{t('cl.bid.exchange')}</button>
            <button className="cx-greybtn" disabled>{t('cl.bid.remove')}</button>
            <span className="cx-grow" />
            <button className="cx-greybtn" disabled={!changed} onClick={() => setFee(offer.fee)}>{t('cl.bid.reset')}</button>
          </div>
          <div className="cx-bid-total"><span>{t('cl.bid.total')}</span><b>{moneyFull(fee)}</b></div>
        </>}
      </div>
      <div className="cx-ts-buttons cx-bid-answer">
        <button onClick={() => onClose()}>{t('common.back')}</button>
        <button onClick={() => setRejecting(true)}>{t('cl.bid.reject')}</button>
        <button onClick={() => onClose()}>{t('cl.bid.delay')}</button>
        <button className="primary" onClick={() => reply(changed ? 'counter' : 'accept')}>{t(changed ? 'cl.bid.counter' : 'cl.bid.accept')}</button>
      </div>
    </div>
  );
}

/** Jobtilbud (CM 01/02: nyheden har Respond → "Accept job at Leeds ?" med vilkårene og No/Yes) */
export function JobOfferPanel({ cid, onClose }: { cid: number; onClose: () => void }) {
  const g = useGame()!;
  useClassicDialog();
  const c = g.clubs[cid];
  if (!c) return null;
  const terms = jobTerms(cid);
  const accept = () => { act({ t: 'acceptJob', club: cid }); onClose(); };
  const decline = () => { act({ t: 'declineJob', club: cid }); onClose(); };
  return (
    <div className="cx-tstatus">
      <div className="cx-subtitle">{t('cl.job.title', { club: c.name })}</div>
      <div className="cx-ts-body">
        <p className="cx-ts-intro">{t('cl.job.intro', { club: c.name, league: compName(g.leagues[c.league]?.name) ?? '' })}</p>
        <div className="cx-kv big">
          <span>{t('club.expectation')}</span><span>{t(`exp.${terms.exp}`)}</span>
          <span>{t('top.budget')}</span><span>{moneyFull(terms.budget)}</span>
          <span>{t('jobs.wageBudget')}</span><span>{moneyFull(terms.wageBudget)} / {t('common.week')}</span>
        </div>
        <p className="cx-ts-intro">{t(g.userClub ? 'cl.job.qLeave' : 'cl.job.q', { club: c.short, own: g.clubs[g.userClub]?.short ?? '' })}</p>
      </div>
      <div className="cx-ts-buttons cx-bid-answer cx-job-answer">
        <button onClick={onClose}>{t('common.back')}</button>
        <button onClick={decline}>{t('cl.bid.reject')}</button>
        <button className="primary" onClick={accept}>{t('cl.bid.accept')}</button>
      </div>
    </div>
  );
}
