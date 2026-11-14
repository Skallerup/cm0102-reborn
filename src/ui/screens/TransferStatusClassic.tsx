// "Set Staff Transfer Status" (som i CM 01/02): udbudspris (− / + / Auto), status i truppen og transferstatus.
import { useState, type ReactNode } from 'react';
import { act } from '../../game/actions';
import type { DisciplineReason } from '../../game/personality';
import { SQUAD_STATUSES, statusAllowed, type SquadStatus } from '../../game/squadStatus';
import { askingPrice, knownEnquiry, swapCandidates, swapWorth } from '../../game/transfers';
import { ADDON_APPS } from '../../game/clauses';
import type { CoachArea, NewsItem, Player, TransferOffer } from '../../game/types';
import { statusNum } from '../../game/cmTransferList';
import { valueTarget } from '../../game/training';
import type { RejectReason } from '../../game/will';
import { ageOn } from '../../game/dates';
import { compName, currencySymbol, fromCurExact, getCurrency, money, moneyFull, t } from '../../i18n';
import { posStr } from '../components';
import { jobTerms } from '../../game/board';
import { useGame } from '../core';
import { CxDrop, useClassicDialog, ClassicFoot } from '../classic';
import { cmActive, statusCode } from '../../game/cmPlayerData';
import { isHumanClub } from '../../game/humans';
import { exchangeOk } from '../../game/transfers';
import { BID_AMOUNTS_GBP, MAX_SWAP, addSwap, bidAct, clauseAtMin, feeAtMax, feeEquals, fromGbp, toGbp, newTerms, stepDown, stepUp, reasonForStatus, rejectReasonValid, removeSwap, sameTerms, termsOf,
  type BidAct, type BidTerms, type RejectKey } from '../../game/cmTransferBid';
import { ClassicFirstSquad } from './SquadClassic';

/** "£0", "£100K", "£2.5M" (originalens beløbsliste, i spillerens valuta) */
const amountLabel = (a: number) => {
  const n = a >= 1_000_000 ? `${a / 1_000_000}M` : a >= 1000 ? `${a / 1000}K` : String(a);
  const c = getCurrency();
  return c === 'DKK' || c === 'SEK' || c === 'NOK' ? `${n} kr.` : `${currencySymbol()}${n}`;
};
/** originalens beløbsliste ved transferbeløb og udbudspris */
const PRICE_LIST = [0, 100_000, 250_000, 500_000, 1_000_000, 2_500_000, 5_000_000, 10_000_000, 15_000_000, 20_000_000];
const round = (v: number) => Math.max(10_000, Math.round(v / 10_000) * 10_000);

export function TransferStatusPanel({ p, onClose }: { p: Player; onClose: () => void }) {
  const g = useGame()!;
  if (cmActive(g)) return <CmTransferStatusPanel p={p} onClose={onClose} />;
  return <OwnTransferStatusPanel p={p} onClose={onClose} />;
}

/** Den originale database i ægte tilstand: Set Staff Transfer Status som originalen (0x8f6a10/0x8f7640) – udbudsprisen er værdien +0x52 (sat
 *  uafhængigt af listen; "=" → formlen 0x4d0c60), trupstatus, transfer-/lejeliste og "listed by request"; OK → 0x8f7f08 (cmTransferList.ts) */
function CmTransferStatusPanel({ p, onClose }: { p: Player; onClose: () => void }) {
  const g = useGame()!;
  useClassicDialog();
  const [status, setStatus] = useState<SquadStatus | undefined>(p.squadStatus);
  const b4e = p.cmContract?.b4e ?? (p.listed ? 1 : 0) | (p.loanListed ? 2 : 0);
  const [listed, setListed] = useState(!!(b4e & 1));
  const [loan, setLoan] = useState(!!(b4e & 2));
  const [request, setRequest] = useState(!!(b4e & 8));
  const [price, setPrice] = useState<number>(p.value);
  // Cash::step_up 0x43f4e0 / step_down 0x43f580 (0x8f7c78 / 0x8f7aca)
  const step = (dir: 1 | -1) => setPrice(dir > 0 ? stepUp(price) : stepDown(price));
  const name = `${p.first} ${p.last}`.trim();
  const save = () => {
    act({ t: 'cmTransferStatus', pid: p.id, status: statusNum(status), price: price !== p.value ? price : null, listed, loan, request });
    onClose();
  };
  return (
    <div className="cx-tstatus">
      <div className="cx-subtitle">{t('cl.ts.title')}</div>
      <div className="cx-ts-body">
        <p className="cx-ts-intro">{t('cl.ts.valued', { player: name, value: money(p.value) })}</p>
        <div className="cx-ts-price">
          <span className="cx-ts-label">{t('cl.ts.asking')}</span>
          <button className="cx-pm" disabled={price <= 0} onClick={() => step(-1)} aria-label="-">−</button>
          <CxDrop className="cx-bid-amt cx-ts-val" label={money(price)} fixed items={PRICE_LIST.map((a) => ({ key: String(a), label: amountLabel(a), checked: false, onClick: () => setPrice(Math.round(fromCurExact(a))) }))} />
          <button className="cx-pm" onClick={() => step(1)} aria-label="+">+</button>
          {/* originalens knap hedder Auto (ejerens billede 13/11): formelværdien 0x4d0c60 */}
          <button className="cx-pm auto" onClick={() => setPrice(roundGbp(valueTarget(p)))}>{t('cl.ts.auto')}</button>
        </div>
        <div className="cx-ts-head">{t('cl.ts.squad')}</div>
        {SQUAD_STATUSES.map((s) => {
          const ok = statusAllowed(p, s, g.date);
          return <button key={s} className={`cx-ts-opt ${status === s ? 'on' : ''}`} disabled={!ok} onClick={() => setStatus(status === s ? undefined : s)}>{t(`cl.ts.s.${s}`)}</button>;
        })}
        <div className="cx-ts-head">{t('cl.ts.transfer')}</div>
        <button className={`cx-ts-opt ${listed ? 'on' : ''}`} onClick={() => setListed(!listed)}>{t('cl.ts.listed')}</button>
        <button className={`cx-ts-opt ${loan ? 'on' : ''}`} onClick={() => setLoan(!loan)}>{t('cl.ts.loan')}</button>
        <button className={`cx-ts-opt ${request ? 'on' : ''}`} onClick={() => setRequest(!request)}>{t('cl.ts.request')}</button>
      </div>
      <ClassicFoot cols="3fr 1fr">
        <button onClick={onClose}>{t('common.back')}</button>
        <button className="primary" onClick={save}>{t('cl.ts.set')}</button>
      </ClassicFoot>
    </div>
  );
}
const roundGbp = (v: number) => fromGbp(Math.round(toGbp(v) / 1000) * 1000);

/** "Transfer Request" (0x4dcb30/0x4dcd70): "Put X on the transfer list at his own request ?" – Back, No, Yes */
export function TransferRequestPanel({ news, onClose }: { news: NewsItem; onClose: () => void }) {
  const g = useGame()!;
  useClassicDialog();
  const p = news.link ? g.players[Number(news.link.id)] : undefined;
  if (!p) return null;
  const answer = (grant: boolean) => { act({ t: 'cmRequest', news: news.id, grant }); onClose(); };
  return (
    <div className="cx-tstatus cx-treq">
      <div className="cx-subtitle">{t('cm.req.title')}</div>
      <div className="cx-ts-body">
        <p className="cx-ts-intro">{t('cm.req.ask', { player: `${p.first} ${p.last}`.trim() })}</p>
      </div>
      <ClassicFoot cols="2fr 1fr 1fr" className="cx-bid-answer cx-treq-answer">
        <button onClick={onClose}>{t('common.back')}</button>
        <button onClick={() => answer(false)}>{t('common.no')}</button>
        <button className="primary" onClick={() => answer(true)}>{t('common.yes')}</button>
      </ClassicFoot>
    </div>
  );
}

function OwnTransferStatusPanel({ p, onClose }: { p: Player; onClose: () => void }) {
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
          {/* CM 01/02: pilen ved prisen åbner originalens beløbsliste (£0 … £20M) */}
          <CxDrop className="cx-bid-amt cx-ts-val" label={money(shown)} fixed items={PRICE_LIST.map((a) => ({ key: String(a), label: amountLabel(a), checked: false, onClick: () => setPrice(Math.round(fromCurExact(a))) }))} />
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
      <ClassicFoot cols="3fr 1fr">
        <button onClick={onClose}>{t('common.back')}</button>
        <button className="primary" onClick={save}>{t('cl.ts.set')}</button>
      </ClassicFoot>
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
    // den originale database i ægte tilstand (cmFine.ts): ingen besked – spillerens reaktion kommer som en nyhed
    onDone(r?.key ? t(r.key, { player: name }) : '');
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
      <ClassicFoot cols="3fr 1fr">
        <button onClick={onClose}>{t('common.cancel')}</button>
        <button className="primary" onClick={confirm}>{t('cl.dp.confirm')}</button>
      </ClassicFoot>
    </div>
  );
}

/** "Approach To Buy/Loan" (CM 01/02 "Man Utd transfer bid for Inamoto"): beløb med − / + / =, klausuler, bytte og samlet værdi */
export function BidPanel(props: { p: Player; loan: boolean; onClose: () => void; onSent: (o: TransferOffer) => void }) {
  const g = useGame()!;
  // den originale database i ægte tilstand: originalens budskærm (cmTransferBid.ts); ellers spillets egen
  return cmActive(g) && !props.loan ? <CmBidPanel {...props} /> : <OldBidPanel {...props} />;
}

function OldBidPanel({ p, loan, onClose, onSent }: { p: Player; loan: boolean; onClose: () => void; onSent: (o: TransferOffer) => void }) {
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
  const [exch, setExch] = useState(false);
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
  // "Add Player To <spiller> Transfer Bid" (CM 01/02, Exchange): egne spillere, sælgeren vil tage i bytte (swapCandidates – spillets regel);
  // vil de ingen, står originalens tekst midt i listen
  if (exch) return (
    <div className="cx-tstatus cx-bid cx-exch">
      <div className="cx-subtitle cx-orig-band">{t('cl.bid.addTitle', { player: p.last })}</div>
      <div className="cx-sq-head cx-exch-head"><span>{t('cl.sq.positions')}</span></div>
      <div className="cx-exch-list">
        {cands.length ? (
          <div className="cx-sq-cols">
            {[0, 1].map((k) => <div key={k} className="cx-sq-col">{cands.filter((_, i) => i % 2 === k).map((x) => (
              <div key={x.id} className="cx-sq-row">
                <button className="cx-selbtn cx-orig" onClick={() => { setSwap([...swap, x.id]); setExch(false); }}> </button>
                <span className="cx-sq-tag" />
                <button className="cx-sq-name" onClick={() => { setSwap([...swap, x.id]); setExch(false); }}>{x.last}{x.first ? `, ${x.first[0]}` : ''}</button>
                <span className="cx-sq-info">{posStr(x)}</span>
              </div>
            ))}</div>)}
          </div>
        ) : <div className="cx-exch-none">{t('cl.bid.notInterested', { club: g.clubs[p.club]?.short ?? seller })}</div>}
      </div>
      <ClassicFoot cols="3fr 1fr">
        <button onClick={() => setExch(false)}>{t('common.back')}</button>
        <button className="primary" disabled>{t('top.next')}</button>
      </ClassicFoot>
    </div>
  );
  // CM 01/02: pilen ved beløbet åbner en liste med faste beløb (i spillerens valuta)
  const AMOUNTS = [0, 100_000, 250_000, 500_000, 1_000_000, 2_500_000, 5_000_000, 10_000_000, 15_000_000, 20_000_000];
  return (
    <div className="cx-tstatus cx-bid">
      <div className="cx-subtitle">{t(loan ? 'cl.bid.loanTitle' : 'cl.bid.title', { club: me?.short ?? '', player: p.last })}</div>
      <div className="cx-ts-body">
        <p className="cx-ts-intro">{t('cl.bid.valued', { club: seller, player: name, value: moneyFull(p.value) })}<br />{!loan && t('cl.bid.board', { fee: moneyFull(budget) })}</p>
        {!loan && <>
          <div className="cx-bid-row">
            <span className="cx-bid-label">{t('cl.bid.fee')}</span>
            <button className="cx-pm" onClick={() => setFee(round(Math.max(0, fee - step)))} aria-label="-">−</button>
            <CxDrop className="cx-bid-amt" label={money(fee)} fixed items={AMOUNTS.map((a) => { const v = Math.round(fromCurExact(a)); return { key: String(a), label: amountLabel(a), checked: false, onClick: () => setFee(v) }; })} />
            <button className="cx-pm" onClick={() => setFee(round(fee + step))} aria-label="+">+</button>
            <button className="cx-pm" onClick={() => setFee(round(known?.fee ?? p.value))} title={t('cl.bid.feeEq')}>=</button>
          </div>
          {row(t('cl.bid.install'), '-')}
          {row(t('cl.bid.sellOn'), sellOn ? `${sellOn}%` : '-', sellOn > 0 ? () => setSellOn(sellOn - 5) : undefined, sellOn < 50 ? () => setSellOn(sellOn + 5) : undefined)}
          {row(t('cl.bid.addOn', { n: ADDON_APPS }), addOn ? money(addOn) : '-', addOn > 0 ? () => setAddOn(round(Math.max(0, addOn - step))) : undefined, () => setAddOn(round(addOn + step)))}
          {row(t('cl.bid.intl'), '-')}
          <div className="cx-bid-row off"><span className="cx-bid-label">{t('cl.bid.public')}</span><span className="cx-bid-val wide">{t('common.no')}</span></div>
          <div className="cx-bid-tools">
            <button className="cx-greybtn" onClick={() => setExch(true)}>{t('cl.bid.exchange')}</button>
            <button className="cx-greybtn" disabled={!swap.length} onClick={() => setSwap(swap.slice(0, -1))}>{t('cl.bid.remove')}</button>
          </div>
          {swap.map((id) => <div key={id} className="cx-bid-swap">{g.players[id]?.first} {g.players[id]?.last}<span>{money(swapWorth(id, p.club))}</span></div>)}
          <div className="cx-bid-total"><span>{t('cl.bid.total')}</span><b>{moneyFull(total)}</b></div>
        </>}
        {err && <div className="cx-bid-err">{err}</div>}
      </div>
      <ClassicFoot cols="3fr 1fr">
        <button onClick={onClose}>{t('common.back')}</button>
        <button className="primary" onClick={submit}>{t('cl.bid.offer')}</button>
      </ClassicFoot>
    </div>
  );
}

/** Svar på et bud på egen spiller (CM 01/02 "Negotiate Arsenal bid for Butt"): Back · Reject · Delay · Accept – et ændret beløb er et modbud */
export function IncomingBidPanel(props: { offer: TransferOffer; onClose: (msg?: string) => void }) {
  const g = useGame()!;
  return cmActive(g) && !props.offer.loan ? <CmIncomingBidPanel {...props} /> : <OldIncomingBidPanel {...props} />;
}

function OldIncomingBidPanel({ offer, onClose }: { offer: TransferOffer; onClose: (msg?: string) => void }) {
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
      <ClassicFoot cols="3fr 1fr">
        <button onClick={() => setRejecting(false)}>{t('common.no')}</button>
        <button className="primary" onClick={() => reply('reject')}>{t('common.yes')}</button>
      </ClassicFoot>
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
      <ClassicFoot cols="3fr 1fr 1fr 1fr" className="cx-bid-answer">
        <button onClick={() => onClose()}>{t('common.back')}</button>
        <button onClick={() => setRejecting(true)}>{t('cl.bid.reject')}</button>
        <button onClick={() => onClose()}>{t('cl.bid.delay')}</button>
        <button className="primary" onClick={() => reply(changed ? 'counter' : 'accept')}>{t(changed ? 'cl.bid.negotiateBtn' : 'cl.bid.accept')}</button>
      </ClassicFoot>
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
      <ClassicFoot cols="2fr 1fr 1fr" className="cx-bid-answer cx-job-answer">
        <button onClick={onClose}>{t('common.back')}</button>
        <button onClick={decline}>{t('cl.bid.reject')}</button>
        <button className="primary" onClick={accept}>{t('cl.bid.accept')}</button>
      </ClassicFoot>
    </div>
  );
}

const AREAS: CoachArea[] = ['fitness', 'tactics', 'shooting', 'skills', 'goalkeeping'];
/** "Coaches" (CM 01/02 træning): grøn boks med trænerne og deres områder – et gult felt = træneren står for området */
export function CoachesPanel({ onClose }: { onClose: () => void }) {
  const g = useGame()!;
  useClassicDialog();
  const coaches = Object.values(g.staff).filter((s) => s.club === g.userClub && (s.role === 'coach' || s.role === 'assistant')).sort((a, b) => b.attrs.coaching - a.attrs.coaching);
  const [sel, setSel] = useState<Record<number, CoachArea[]>>(() => Object.fromEntries(coaches.map((c) => [c.id, c.coachAreas ?? AREAS])));
  const toggle = (id: number, a: CoachArea) => setSel((x) => ({ ...x, [id]: x[id].includes(a) ? x[id].filter((y) => y !== a) : [...x[id], a] }));
  const ok = () => { for (const c of coaches) act({ t: 'coachAreas', id: c.id, areas: sel[c.id].length === AREAS.length ? null : sel[c.id] }); onClose(); };
  return (
    <div className="cx-tidlg cx-coaches" role="dialog">
      <div className="cx-tidlg-head">{t('cl.tn.coaches')}</div>
      <div className="cx-coach-grid">
        {coaches.map((c) => (
          <div key={c.id} className="cx-coach-row">
            <span className="cx-coach-name">{c.first} {c.last} <em>{c.attrs.coaching}</em></span>
            {AREAS.map((a) => <button key={a} className={`cx-tich ${sel[c.id].includes(a) ? 'on' : ''}`} onClick={() => toggle(c.id, a)}>{t(`cl.coach.${a}`)}</button>)}
          </div>
        ))}
        {!coaches.length && <div className="cx-empty">{t('common.none')}</div>}
      </div>
      <div className="cx-ts-buttons cx-tidlg-foot"><button onClick={onClose}>{t('common.cancel')}</button><button className="primary" onClick={ok}>{t('common.ok')}</button></div>
    </div>
  );
}

// ================================================================ CM 01/02's budskærm (cm0102.exe 0x8e9760/0x8ec420 – cmTransferBid.ts)

/** Rækkerne på originalens budskærm: Transfer Fee (− ▾ + =), Monthly Installments, Percentage of Next Sale, Fee after N League/International
 *  Apps. (− ▾ +), Make transfer bid public, Exchange/Remove(/Reset), bytte-linjerne og Total Value. Grå etiket = slået fra (klik slår til). */
function CmBidRows({ terms, set, value, budget, swapValue, onExchange, reset }: {
  terms: BidTerms; set: (t: BidTerms) => void; value: number; budget?: number; swapValue: (id: number) => number;
  onExchange: () => void; reset?: () => void;
}) {
  const g = useGame()!;
  const [removing, setRemoving] = useState(false);
  const act2 = (a: BidAct) => set(bidAct(terms, a, value));
  const amounts = (put: (eur: number) => void) => BID_AMOUNTS_GBP.map((a) => ({ key: String(a), label: money(fromGbp(a)), checked: false, onClick: () => put(fromGbp(a)) }));
  // "Fee after <N> …": N er et link for sig (0xe/0x13: 1 → 10 → … → 50 → 1); resten af etiketten slår klausulen til/fra (0xd/0x12)
  const clauseLabel = (n: number, one: string, many: string, toggle: BidAct, cycle: BidAct) => {
    const [a, b] = (n === 1 ? t(one) : t(many, { n: '\u0000' })).split('\u0000');
    return <button className="cx-bid-label cx-bid-tog" onClick={() => act2(toggle)}>{a}{b !== undefined && <span className="cx-bid-n" role="link" onClick={(e) => { e.stopPropagation(); act2(cycle); }}>{n}</span>}{b ?? ''}</button>;
  };
  const row = (on: boolean, label: ReactNode, minus: BidAct, mid: ReactNode, plus: BidAct, minusOff: boolean, plusOff: boolean, extra?: ReactNode) => (
    <div className={`cx-bid-row ${on ? '' : 'off'}`}>
      {label}
      <button className="cx-pm" disabled={minusOff} onClick={() => act2(minus)} aria-label="-">−</button>
      {mid}
      <button className="cx-pm" disabled={plusOff} onClick={() => act2(plus)} aria-label="+">+</button>
      {extra ?? <span />}
    </div>
  );
  const total = terms.fee + Math.max(0, terms.lgFee) + Math.max(0, terms.intFee) + terms.swap.reduce((x, id) => x + swapValue(id), 0);
  const over = budget !== undefined && terms.fee > budget;
  return <>
    {row(true, <span className="cx-bid-label">{t('cl.bid.fee')}</span>, 'feeDown',
      <CxDrop className={`cx-bid-amt ${over ? 'over' : ''}`} label={money(terms.fee)} fixed items={amounts((v) => set({ ...terms, fee: v }))} />,
      'feeUp', terms.fee <= 0, feeAtMax(terms.fee),
      <button className="cx-pm" onClick={() => set({ ...terms, fee: feeEquals(value, terms.swap.map(swapValue), budget) })} title={t('cl.bid.feeEq')}>=</button>)}
    {row(terms.months > 0, <button className="cx-bid-label cx-bid-tog" onClick={() => act2('inst')}>{t('cl.bid.install')}</button>, 'instDown',
      <span className="cx-bid-val">{terms.months > 0 ? t('cl.bid.months', { n: terms.months }) : '-'}</span>, 'instUp', terms.months === 6, terms.months >= 24)}
    {row(terms.sellOn > 0, <button className="cx-bid-label cx-bid-tog" onClick={() => act2('sell')}>{t('cl.bid.sellOn')}</button>, 'sellDown',
      <span className="cx-bid-val">{terms.sellOn > 0 ? `${terms.sellOn}%` : '-'}</span>, 'sellUp', terms.sellOn === 5, terms.sellOn >= 25)}
    {row(terms.lgFee > 0, clauseLabel(terms.lgApps, 'cl.bid.lg1', 'cl.bid.lgN', 'lg', 'lgN'), 'lgDown',
      <CxDrop className="cx-bid-amt" label={terms.lgFee > 0 ? money(terms.lgFee) : '-'} fixed items={amounts((v) => set({ ...terms, lgFee: v }))} />,
      'lgUp', terms.lgFee > 0 && clauseAtMin(terms.lgFee), terms.lgFee > 0 && feeAtMax(terms.lgFee))}
    {row(terms.intFee > 0, clauseLabel(terms.intApps, 'cl.bid.int1', 'cl.bid.intN', 'int', 'intN'), 'intDown',
      <CxDrop className="cx-bid-amt" label={terms.intFee > 0 ? money(terms.intFee) : '-'} fixed items={amounts((v) => set({ ...terms, intFee: v }))} />,
      'intUp', terms.intFee > 0 && clauseAtMin(terms.intFee), terms.intFee > 0 && feeAtMax(terms.intFee))}
    <div className={`cx-bid-row ${terms.pub === 1 ? 'off' : ''}`}>
      <button className="cx-bid-label cx-bid-tog" disabled={terms.pub === 1} onClick={() => act2('pub')}>{t('cl.bid.public')}</button>
      <button className="cx-bid-val wide cx-bid-yn" disabled={terms.pub === 1} onClick={() => act2('pub')}>{t(terms.pub ? 'common.yes' : 'common.no')}</button>
    </div>
    <div className="cx-bid-tools">
      <button className="cx-greybtn" disabled={terms.swap.length >= MAX_SWAP} onClick={onExchange}>{t('cl.bid.exchange')}</button>
      <button className={`cx-greybtn ${removing ? 'on' : ''}`} disabled={!terms.swap.length} onClick={() => setRemoving(!removing)}>{t('cl.bid.remove')}</button>
      <span className="cx-grow" />
      {reset && <button className="cx-greybtn" onClick={reset}>{t('cl.bid.reset')}</button>}
    </div>
    {terms.swap.map((id) => (
      <button key={id} className={`cx-bid-swap ${removing ? 'removing' : ''}`} disabled={!removing}
        onClick={() => { set(removeSwap(terms, id, swapValue(id))); setRemoving(false); }}>
        <span>+ {g.players[id]?.first ? `${g.players[id].first} ${g.players[id].last}` : g.players[id]?.last}</span><span>{moneyFull(swapValue(id))}</span>
      </button>
    ))}
    <div className="cx-bid-total"><span>{t('cl.bid.total')}</span><b>{moneyFull(total)}</b></div>
  </>;
}

/** "Add Player To {spiller} Transfer Bid" (0x47c180): giverens trupskærm; Exchange-knappen trykkes ned, og et klik på en tilladt spiller tager ham med */
function CmExchange({ giver, receiver, p, onPick, onBack }: { giver: number; receiver: number; p: Player; onPick: (pid: number) => void; onBack: () => void }) {
  const [armed, setArmed] = useState(false);
  return (
    <div className="cx-tstatus cx-bid cx-exch">
      <div className="cx-exch-top">
        <div className="cx-subtitle cx-orig-band">{t('cl.bid.addTitle', { player: p.last })}</div>
        <button className={`cx-exch-btn ${armed ? 'on' : ''}`} onClick={() => setArmed(!armed)} title={t('cl.bid.exPick')}>{t('cl.bid.exchange')}</button>
      </div>
      <ClassicFirstSquad key={`ex${giver}`} cid={giver} pick={{ armed, ok: (x) => exchangeOk(x, receiver, p.id), onPick }} />
      <ClassicFoot cols="3fr 1fr">
        <button onClick={onBack}>{t('common.back')}</button>
        <button className="primary" disabled>{t('top.next')}</button>
      </ClassicFoot>
    </div>
  );
}

/** Eget bud (CM 01/02 "{klub} transfer bid for {spiller}") */
function CmBidPanel({ p, onClose, onSent }: { p: Player; loan: boolean; onClose: () => void; onSent: (o: TransferOffer) => void }) {
  const g = useGame()!;
  useClassicDialog();
  const me = g.clubs[g.userClub];
  const budget = me?.transferBudget ?? 0;
  const known = knownEnquiry(p.id);
  // et modbud fra sælgeren står i skærmen, når man byder igen (0x8f1830 "Respond" på modbuddet)
  const live = g.offers.slice().reverse().find((o) => o.player === p.id && o.buyer === g.userClub && o.status === 'countered' && o.cmCounter);
  const [terms, setTerms] = useState<BidTerms>(() => live?.cmCounter ? { ...live.cmCounter, swap: [...live.cmCounter.swap] } : newTerms(g, p, g.userClub, Math.min(budget, known?.fee ?? p.value)));
  const [exch, setExch] = useState(false);
  const [err, setErr] = useState('');
  const seller = g.clubs[p.club]?.name ?? '';
  const name = `${p.first} ${p.last}`.trim();
  const swapValue = (id: number) => g.players[id]?.value ?? 0;
  if (exch) return <CmExchange giver={g.userClub} receiver={p.club} p={p} onBack={() => setExch(false)}
    onPick={(id) => { setTerms(addSwap(terms, id, swapValue(id))); setExch(false); }} />;
  const submit = () => {
    setErr('');
    const r = act<TransferOffer | string>({ t: 'bid', pid: p.id, fee: terms.fee, loan: false, swap: terms.swap, terms });
    if (typeof r === 'string') setErr(t(r)); else onSent(r);
  };
  return (
    <div className="cx-tstatus cx-bid">
      <div className="cx-subtitle">{t('cl.bid.title', { club: me?.short ?? '', player: p.last })}</div>
      <div className="cx-ts-body">
        <p className="cx-ts-intro">{t('cl.bid.valued', { club: seller, player: name, value: moneyFull(p.value) })}<br />{t('cl.bid.board', { fee: moneyFull(budget) })}</p>
        <CmBidRows terms={terms} set={setTerms} value={p.value} budget={budget} swapValue={swapValue} onExchange={() => setExch(true)} />
        {err && <div className="cx-bid-err">{err}</div>}
      </div>
      <ClassicFoot cols="3fr 1fr">
        <button onClick={onClose}>{t('common.back')}</button>
        <button className="primary" onClick={submit}>{t('cl.bid.offer')}</button>
      </ClassicFoot>
    </div>
  );
}

const CM_REASONS: RejectKey[] = ['none', 'indispensable', 'important', 'prospect', 'division', 'rival'];

/** Bud på egen spiller (CM 01/02 "Negotiate {klub} bid for {spiller}"): alle rækker kan ændres; Back · Reject · Delay · Accept/Negotiate */
function CmIncomingBidPanel({ offer, onClose }: { offer: TransferOffer; onClose: (msg?: string) => void }) {
  const g = useGame()!;
  useClassicDialog();
  const p = g.players[offer.player];
  const buyer = g.clubs[offer.buyer];
  const me = g.clubs[g.userClub];
  // 0x8e9550: et eksisterende bud åbnes med "Make transfer bid public" = Yes
  const orig = (): BidTerms => { const x = termsOf(offer); return { ...x, pub: x.pub || 2 }; };
  const [terms, setTerms] = useState<BidTerms>(orig);
  const [exch, setExch] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const age = p ? ageOn(p.dob, g.date) : 30;
  const sameLeague = !!buyer && !!me && buyer.league === me.league;
  // rival (0x8c5560): køberen styres af et menneske, eller klubberne står som rivaler (klub +0xb3/+0xb7/+0xbb = club.dat 179–187, cmCrowd[6..8]);
  // ligasammenstødet comp_util_get_league_clash_type 0x4b02e0 er ikke porteret
  const rv = (a: number, b: number) => !!g.cmCrowd?.[a]?.slice(6, 9).includes(b);
  const rivals = !!buyer && !!me && (isHumanClub(buyer.id) || rv(me.id, buyer.id) || rv(buyer.id, me.id));
  const valid = (k: RejectKey) => rejectReasonValid(k, age, sameLeague, rivals);
  const [why, setWhy] = useState<RejectKey>('none');
  if (!p || !buyer) return null;
  const swapValue = (id: number) => g.players[id]?.value ?? 0;
  const changed = !sameTerms(terms, orig());
  const others = g.offers.filter((o) => o.player === p.id && o.seller === g.userClub && o.status === 'pending').length;
  const send = (action: 'accept' | 'reject' | 'counter', all = false) => {
    const r = act<string | null>({ t: 'respond', pid: p.id, buyer: buyer.id, action, terms, rejectKey: why, changed, all });
    onClose(typeof r === 'string' && r !== 'ok' ? t(r) : undefined);
  };
  const name = `${p.first} ${p.last}`.trim();
  if (exch) return <CmExchange giver={buyer.id} receiver={g.userClub} p={p} onBack={() => setExch(false)}
    onPick={(id) => { setTerms(addSwap(terms, id, swapValue(id))); setExch(false); }} />;
  if (rejecting) return (
    <div className="cx-tstatus">
      <div className="cx-subtitle">{t('cl.bid.offerFor', { player: name })}</div>
      <div className="cx-ts-body">
        <p className="cx-ts-intro">{t('cl.bid.rejectQ', { player: name })}</p>
        <div className="cx-ts-head">{t('cl.bid.reason')}</div>
        {CM_REASONS.map((k) => <button key={k} className={`cx-ts-opt ${why === k ? 'on' : ''}`} disabled={!valid(k)} onClick={() => setWhy(k)}>{t(`cl.bid.why.${k}`)}</button>)}
      </div>
      <ClassicFoot cols={others > 1 ? '2fr 1fr 1fr' : '3fr 1fr'}>
        <button onClick={() => setRejecting(false)}>{t('common.no')}</button>
        {others > 1 && <button onClick={() => send('reject', true)}>{t('cl.bid.rejectAll')}</button>}
        <button className="primary" onClick={() => send('reject')}>{t('common.yes')}</button>
      </ClassicFoot>
    </div>
  );
  return (
    <div className="cx-tstatus cx-bid">
      <div className="cx-subtitle">{t('cl.bid.negotiate', { club: buyer.short, player: p.last })}</div>
      <div className="cx-ts-body">
        <p className="cx-ts-intro">{t('cl.bid.valued', { club: me?.short ?? '', player: name, value: moneyFull(p.value) })}</p>
        <CmBidRows terms={terms} set={setTerms} value={p.value} swapValue={swapValue} onExchange={() => setExch(true)} reset={changed ? () => setTerms(orig()) : undefined} />
      </div>
      <ClassicFoot cols="3fr 1fr 1fr 1fr" className="cx-bid-answer">
        <button onClick={() => onClose()}>{t('common.back')}</button>
        <button onClick={() => { setWhy(reasonForStatus(statusCode(p))); setRejecting(true); }}>{t('cl.bid.reject')}</button>
        <button onClick={() => onClose()}>{t('cl.bid.delay')}</button>
        <button className="primary" onClick={() => send(changed ? 'counter' : 'accept')}>{t(changed ? 'cl.bid.negotiateBtn' : 'cl.bid.accept')}</button>
      </ClassicFoot>
    </div>
  );
}
