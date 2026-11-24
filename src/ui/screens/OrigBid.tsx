// Originalens (CM 01/02) bud-dialoger i det moderne udseende: eget bud (køb og leje), Change Transfer Bid og svar på et bud på egen spiller
// (Accept / Reject / Delay / Negotiate). Spillets regler ligger i game/cmTransferBid.ts, cmLoan.ts og transfers.ts – her er kun tegningen.
import { useMemo, useState } from 'react';
import { act } from '../../game/actions';
import { gs } from '../../game/state';
import type { Player, TransferOffer } from '../../game/types';
import { BID_AMOUNTS_GBP, MAX_SWAP, addSwap, bidAct, clauseAtMin, feeAtMax, feeEquals, newTerms, reasonForStatus, rejectReasonValid, removeSwap, sameTerms, termsOf,
  type BidAct, type BidTerms, type RejectKey } from '../../game/cmTransferBid';
import { cmBidBudget, cmBoardLine, cmBoardWageAllow } from '../../game/cmBudget';
import { cmLoanPeriod, loanDate } from '../../game/cmLoan';
import { cmGbp } from '../../game/cmMoney';
import { statusCode } from '../../game/cmPlayerData';
import { isHumanClub } from '../../game/humans';
import { exchangeList, knownEnquiry, myPendingBid } from '../../game/transfers';
import { ageOn } from '../../game/dates';
import { money, moneyFull, t } from '../../i18n';
import { Modal, posStr } from '../components';

/** − [beløb ▾] + – en række i budskærmen; grå = slået fra (et klik på etiketten slår til) */
function Row({ label, on = true, onLabel, minusOff, plusOff, onMinus, onPlus, children, extra }: {
  label: React.ReactNode; on?: boolean; onLabel?: () => void; minusOff?: boolean; plusOff?: boolean; onMinus: () => void; onPlus: () => void; children: React.ReactNode; extra?: React.ReactNode;
}) {
  return (
    <div className={`row bid-row ${on ? '' : 'muted'}`} style={{ alignItems: 'center', gap: 8 }}>
      <button className="small bid-label" style={{ minWidth: 190, textAlign: 'left', opacity: on ? 1 : 0.6 }} disabled={!onLabel} onClick={onLabel}>{label}</button>
      <button className="small" disabled={minusOff} onClick={onMinus} aria-label="-">−</button>
      <span style={{ minWidth: 110, textAlign: 'center' }}>{children}</span>
      <button className="small" disabled={plusOff} onClick={onPlus} aria-label="+">+</button>
      {extra}
    </div>
  );
}

/** Rækkerne på originalens budskærm: Transfer Fee, Monthly Installments, Percentage of Next Sale, Fee after N League/International Apps., Make bid public,
 *  Exchange/Remove, bytte-spillere og Total Value */
function BidRows({ terms, set, value, budget, k, kv, onExchange, reset }: {
  terms: BidTerms; set: (t: BidTerms) => void; value: number; budget?: number; k: number; kv: number; onExchange: () => void; reset?: () => void;
}) {
  const g = gs();
  const swapValue = (id: number) => g.players[id]?.value ?? 0;
  const act2 = (a: BidAct) => set(bidAct(terms, a, value, k, kv));
  const fromGbp = (gbp: number) => Math.round(gbp / k);
  const amountSelect = (cur: number, put: (eur: number) => void) => (
    <select value="" onChange={(e) => { if (e.target.value !== '') put(fromGbp(Number(e.target.value))); }} style={{ minWidth: 110 }}>
      <option value="">{cur > 0 ? money(cur) : '-'}</option>
      {BID_AMOUNTS_GBP.map((a) => <option key={a} value={a}>{money(fromGbp(a))}</option>)}
    </select>
  );
  const clauseLabel = (n: number, one: string, many: string, cycle: BidAct) => {
    const [a, b] = (n === 1 ? t(one) : t(many, { n: '\u0000' })).split('\u0000');
    return <>{a}{b !== undefined && <u role="link" onClick={(e) => { e.stopPropagation(); act2(cycle); }} style={{ cursor: 'pointer' }}>{n}</u>}{b ?? ''}</>;
  };
  const total = terms.fee + Math.max(0, terms.lgFee) + Math.max(0, terms.intFee) + terms.swap.reduce((x, id) => x + swapValue(id), 0);
  const over = budget !== undefined && terms.fee > budget;
  const [removing, setRemoving] = useState(false);
  return (
    <div className="col" style={{ gap: 6 }}>
      <Row label={t('cl.bid.fee')} onMinus={() => act2('feeDown')} onPlus={() => act2('feeUp')} minusOff={terms.fee <= 0} plusOff={feeAtMax(terms.fee, k)}
        extra={<button className="small" onClick={() => set({ ...terms, fee: feeEquals(value, terms.swap.map(swapValue), budget) })} title={t('cl.bid.feeEq')}>=</button>}>
        <span className={over ? 'bad' : ''}>{amountSelect(terms.fee, (v) => set({ ...terms, fee: v }))}</span>
      </Row>
      <Row label={t('cl.bid.install')} on={terms.months > 0} onLabel={() => act2('inst')} onMinus={() => act2('instDown')} onPlus={() => act2('instUp')} minusOff={terms.months === 6} plusOff={terms.months >= 24}>
        {terms.months > 0 ? t('cl.bid.months', { n: terms.months }) : '-'}
      </Row>
      <Row label={t('cl.bid.sellOn')} on={terms.sellOn > 0} onLabel={() => act2('sell')} onMinus={() => act2('sellDown')} onPlus={() => act2('sellUp')} minusOff={terms.sellOn === 5} plusOff={terms.sellOn >= 25}>
        {terms.sellOn > 0 ? `${terms.sellOn}%` : '-'}
      </Row>
      <Row label={clauseLabel(terms.lgApps, 'cl.bid.lg1', 'cl.bid.lgN', 'lgN')} on={terms.lgFee > 0} onLabel={() => act2('lg')} onMinus={() => act2('lgDown')} onPlus={() => act2('lgUp')}
        minusOff={terms.lgFee > 0 && clauseAtMin(terms.lgFee, k)} plusOff={terms.lgFee > 0 && feeAtMax(terms.lgFee, k)}>
        {amountSelect(terms.lgFee, (v) => set({ ...terms, lgFee: v }))}
      </Row>
      <Row label={clauseLabel(terms.intApps, 'cl.bid.int1', 'cl.bid.intN', 'intN')} on={terms.intFee > 0} onLabel={() => act2('int')} onMinus={() => act2('intDown')} onPlus={() => act2('intUp')}
        minusOff={terms.intFee > 0 && clauseAtMin(terms.intFee, k)} plusOff={terms.intFee > 0 && feeAtMax(terms.intFee, k)}>
        {amountSelect(terms.intFee, (v) => set({ ...terms, intFee: v }))}
      </Row>
      <div className="row" style={{ gap: 8, alignItems: 'center' }}>
        <span style={{ minWidth: 190 }}>{t('cl.bid.public')}</span>
        <button className="small" disabled={terms.pub === 1} onClick={() => act2('pub')}>{t(terms.pub ? 'common.yes' : 'common.no')}</button>
      </div>
      <div className="row" style={{ gap: 8 }}>
        <button className="small" disabled={terms.swap.length >= MAX_SWAP} onClick={onExchange}>{t('cl.bid.exchange')}</button>
        <button className={`small ${removing ? 'primary' : ''}`} disabled={!terms.swap.length} onClick={() => setRemoving(!removing)}>{t('cl.bid.remove')}</button>
        <div className="grow" />
        {reset && <button className="small" onClick={reset}>{t('cl.bid.reset')}</button>}
      </div>
      {terms.swap.map((id) => (
        <div key={id} className="kv">
          <span>+ {g.players[id]?.first} {g.players[id]?.last}</span>
          <span>{moneyFull(swapValue(id))} {removing && <button className="small danger" onClick={() => { set(removeSwap(terms, id, swapValue(id))); setRemoving(false); }}>{t('cl.bid.remove')}</button>}</span>
        </div>
      ))}
      <div className="kv"><b>{t('cl.bid.total')}</b><b>{moneyFull(total)}</b></div>
    </div>
  );
}

/** Exchange: giverens spillere, som modtageren vil tage (0x47c180) */
function Exchange({ giver, receiver, p, taken, onPick, onBack }: { giver: number; receiver: number; p: Player; taken: number[]; onPick: (pid: number) => void; onBack: () => void }) {
  const g = gs();
  const ex = useMemo(() => exchangeList(giver, receiver, p.id), []); // eslint-disable-line react-hooks/exhaustive-deps
  const ids = ex.ids.filter((id) => !taken.includes(id));
  const rc = g.clubs[receiver], gc = g.clubs[giver];
  const empty = ex.note === 'refused' ? t('cl.bid.notInterested', { club: rc?.short ?? '' }) : ex.note === 'noPlayers' ? t('cl.bid.exNoPlayers', { giver: gc?.short ?? '', club: rc?.short ?? '' }) : undefined;
  return (
    <div className="col">
      <div className="muted">{t('cl.bid.addTitle', { player: p.last })}</div>
      {ids.length === 0 && <div className="insight">{empty ?? t('common.none')}</div>}
      <div className="col" style={{ gap: 4, maxHeight: 320, overflowY: 'auto' }}>
        {ids.map((id) => { const x = g.players[id]; return <button key={id} className="row" style={{ justifyContent: 'space-between' }} onClick={() => onPick(id)}><span>{x.first} {x.last}</span><span className="muted">{posStr(x)} · {money(x.value)}</span></button>; })}
      </div>
      <div className="row" style={{ justifyContent: 'flex-end' }}><button onClick={onBack}>{t('common.back')}</button></div>
    </div>
  );
}

/** Eget bud (CM 01/02 "{klub} transfer bid for {spiller}") og lejebud (Loan bid) – Change Transfer Bid åbner det ventende bud */
export function OrigBidModal({ pid, loan, change, onClose, onSent }: { pid: number; loan?: boolean; change?: boolean; onClose: () => void; onSent: (o: TransferOffer) => void }) {
  const g = gs();
  const p = g.players[pid];
  const me = g.clubs[g.userClub];
  const [bb] = useState(() => (loan ? null : cmBidBudget(g, p, g.userClub)));
  const budget = bb?.budget ?? me?.transferBudget ?? 0;
  const known = knownEnquiry(pid);
  const pend = change ? myPendingBid(pid) : undefined;
  const counter = g.offers.slice().reverse().find((o) => o.player === pid && o.buyer === g.userClub && o.status === 'countered' && o.cmCounter);
  const [terms, setTerms] = useState<BidTerms>(() => pend ? termsOf(pend) : counter?.cmCounter ? { ...counter.cmCounter, swap: [...counter.cmCounter.swap] } : newTerms(g, p, g.userClub, Math.min(budget, known?.fee ?? p.value)));
  const [exch, setExch] = useState(false);
  const [ask, setAsk] = useState(false);
  const [err, setErr] = useState('');
  // leje: udløbsdato, lønandel, afkrydsninger (cmLoan.ts)
  const [per] = useState(() => (loan ? cmLoanPeriod(g, g.userClub, p) : null));
  const [cur, setCur] = useState(() => ({ m: per?.sm ?? 0, y: per?.sy ?? g.season }));
  const [share, setShare] = useState(0);
  const [cup, setCup] = useState(true);
  const [against, setAgainst] = useState(true);
  const seller = g.clubs[p.club]?.short || g.clubs[p.club]?.name || '';
  const name = `${p.first} ${p.last}`.trim();
  const wage = p.contract?.wage ?? 0;
  const allow = useMemo(() => (loan ? cmBoardWageAllow(g, p, g.userClub) ?? 0 : 0), []); // eslint-disable-line react-hooks/exhaustive-deps
  const swapValue = (id: number) => g.players[id]?.value ?? 0;
  const submit = () => {
    setErr(''); setAsk(false);
    const r = loan
      ? act<TransferOffer | string>({ t: 'bid', pid, fee: 0, loan: true, loanUntil: loanDate(g.date, cur.m, cur.y), loanShare: share / 100, loanNoCup: !cup, loanNoAgainst: !against })
      : act<TransferOffer | string>({ t: 'bid', pid, fee: terms.fee, loan: false, swap: terms.swap, terms, change: !!pend });
    if (typeof r === 'string') setErr(t(r)); else onSent(r);
  };
  const title = loan ? t('cl.bid.loanFor', { player: p.last }) : t('cl.bid.title', { club: me?.short ?? '', player: p.last });
  if (exch) return (
    <Modal title={title} onClose={onClose}>
      <Exchange giver={g.userClub} receiver={p.club} p={p} taken={terms.swap} onBack={() => setExch(false)} onPick={(id) => { setTerms(addSwap(terms, id, swapValue(id))); setExch(false); }} />
    </Modal>
  );
  if (ask) return (
    <Modal title={t('cl.bid.offerFor', { player: name })} onClose={onClose}>
      <div className="col">
        <p>{t('cl.bid.submitQ', { player: name, club: seller })}</p>
        <div className="row" style={{ justifyContent: 'flex-end' }}><button onClick={() => setAsk(false)}>{t('common.no')}</button><button className="primary" onClick={submit}>{t('common.yes')}</button></div>
      </div>
    </Modal>
  );
  if (loan && per) {
    const d = new Date(`${loanDate(g.date, cur.m, cur.y)}T00:00:00Z`);
    const dateLbl = d.toLocaleDateString(t('cl.locale'), { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
    const minus = !(cur.y === per.sy && cur.m <= per.sm), plus = !(cur.y === per.ey && cur.m >= per.em);
    const step = (kk: number) => setCur(({ m, y }) => { m += kk; if (m < 0) { m = 11; y--; } else if (m > 11) { m = 0; y++; } return { m, y }; });
    const amount = Math.trunc(share * wage / 100);
    return (
      <Modal title={title} onClose={onClose}>
        <div className="col">
          <p>{t('cl.bid.loanWage', { player: name, wage: money(wage), club: seller })} {t('cl.neg.allow', { allow: money(allow) })}</p>
          <Row label={t('cl.bid.loanExpiry')} onMinus={() => step(-1)} onPlus={() => step(1)} minusOff={!minus} plusOff={!plus}>{dateLbl}</Row>
          <Row label={t('cl.bid.loanShare')} onMinus={() => setShare(share - 10)} onPlus={() => setShare(share + 10)} minusOff={share <= 0} plusOff={share >= 100}>{share}% <span className={amount > allow ? 'bad' : 'muted'}>({money(amount)})</span></Row>
          <label className="row"><input type="checkbox" checked={cup} onChange={(e) => setCup(e.target.checked)} /> {t('cl.bid.loanCup')}</label>
          <label className="row"><input type="checkbox" checked={against} onChange={(e) => setAgainst(e.target.checked)} /> {t('cl.bid.loanAgainst', { club: seller })}</label>
          {err && <div className="insight bad">{err}</div>}
          <div className="row" style={{ justifyContent: 'flex-end' }}><button onClick={onClose}>{t('common.back')}</button><button className="primary" onClick={submit}>{t('cl.bid.offer')}</button></div>
        </div>
      </Modal>
    );
  }
  return (
    <Modal title={title} onClose={onClose} wide>
      <div className="col">
        <p>
          {t('cl.bid.valued', { club: seller, player: name, value: moneyFull(p.value) })}<br />
          {t(bb ? cmBoardLine(bb) : 'cl.bid.board', { fee: money(budget) })}
        </p>
        <BidRows terms={terms} set={setTerms} value={p.value} budget={budget} k={cmGbp(g, g.userClub)} kv={cmGbp(g, p.club)} onExchange={() => setExch(true)} />
        {err && <div className="insight bad">{err}</div>}
        <div className="row" style={{ justifyContent: 'flex-end' }}><button onClick={onClose}>{t('common.back')}</button><button className="primary" onClick={() => setAsk(true)}>{t('cl.bid.offer')}</button></div>
      </div>
    </Modal>
  );
}

const CM_REASONS: RejectKey[] = ['none', 'indispensable', 'important', 'prospect', 'division', 'rival'];

/** Bud på egen spiller (CM 01/02 "Negotiate {klub} bid for {spiller}"): alle rækker kan ændres; Reject · Delay · Accept/Negotiate */
export function OrigIncomingBidModal({ offer, onClose }: { offer: TransferOffer; onClose: (msg?: string) => void }) {
  const g = gs();
  const p = g.players[offer.player];
  const buyer = g.clubs[offer.buyer];
  const me = g.clubs[g.userClub];
  const orig = (): BidTerms => { const x = termsOf(offer); return { ...x, pub: x.pub || 2 }; };
  const [terms, setTerms] = useState<BidTerms>(orig);
  const [exch, setExch] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [ask, setAsk] = useState<'counter' | 'accept' | 'delay' | null>(null);
  const age = p ? ageOn(p.dob, g.date) : 30;
  const sameLeague = !!buyer && !!me && buyer.league === me.league;
  const rv = (a: number, b: number) => !!g.cmCrowd?.[a]?.slice(6, 9).includes(b);
  const rivals = !!buyer && !!me && (isHumanClub(buyer.id) || rv(me.id, buyer.id) || rv(buyer.id, me.id));
  const [why, setWhy] = useState<RejectKey>('none');
  if (!p || !buyer) return null;
  const swapValue = (id: number) => g.players[id]?.value ?? 0;
  const changed = !sameTerms(terms, orig(), cmGbp(g, buyer.id));
  const others = g.offers.filter((o) => o.player === p.id && o.seller === g.userClub && o.status === 'pending').length;
  const send = (action: 'accept' | 'reject' | 'counter', all = false) => {
    const r = act<string | null>({ t: 'respond', pid: p.id, buyer: buyer.id, action, terms, rejectKey: why, changed, all });
    onClose(typeof r === 'string' && r !== 'ok' ? t(r) : undefined);
  };
  const name = `${p.first} ${p.last}`.trim();
  const title = t('cl.bid.negotiate', { club: buyer.short, player: p.last });
  if (exch) return (
    <Modal title={title} onClose={() => onClose()}>
      <Exchange giver={buyer.id} receiver={g.userClub} p={p} taken={terms.swap} onBack={() => setExch(false)} onPick={(id) => { setTerms(addSwap(terms, id, swapValue(id))); setExch(false); }} />
    </Modal>
  );
  if (rejecting) return (
    <Modal title={t('cl.bid.offerFor', { player: name })} onClose={() => onClose()}>
      <div className="col">
        <p>{t('cl.bid.rejectQ', { player: name })}</p>
        <div className="muted">{t('cl.bid.reason')}</div>
        <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
          {CM_REASONS.map((k) => <button key={k} className={`small ${why === k ? 'primary' : ''}`} disabled={!rejectReasonValid(k, age, sameLeague, rivals)} onClick={() => setWhy(k)}>{t(`cl.bid.why.${k}`)}</button>)}
        </div>
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button onClick={() => setRejecting(false)}>{t('common.no')}</button>
          {others > 1 && <button onClick={() => send('reject', true)}>{t('cl.bid.rejectAll')}</button>}
          <button className="danger" onClick={() => send('reject')}>{t('common.yes')}</button>
        </div>
      </div>
    </Modal>
  );
  if (ask) return (
    <Modal title={t('cl.bid.offerFor', { player: name })} onClose={() => onClose()}>
      <div className="col">
        <p>{ask === 'counter' ? t('cl.bid.negotiateQ', { player: name }) : ask === 'accept' ? t('cl.bid.acceptQ', { player: name }) : t('cl.bid.delayQ', { player: name, club: buyer.short || buyer.name })}</p>
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button onClick={() => setAsk(null)}>{t('common.no')}</button>
          <button className="primary" onClick={() => (ask === 'delay' ? onClose() : send(ask))}>{t('common.yes')}</button>
        </div>
      </div>
    </Modal>
  );
  return (
    <Modal title={title} onClose={() => onClose()} wide>
      <div className="col">
        <p>{t('cl.bid.valued', { club: me?.short ?? '', player: name, value: moneyFull(p.value) })}</p>
        <BidRows terms={terms} set={setTerms} value={p.value} k={cmGbp(g, buyer.id)} kv={cmGbp(g, p.club)} onExchange={() => setExch(true)} reset={changed ? () => setTerms(orig()) : undefined} />
        <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={() => onClose()}>{t('common.back')}</button>
          <button className="danger" onClick={() => { setWhy(reasonForStatus(statusCode(p))); setRejecting(true); }}>{t('cl.bid.reject')}</button>
          <button onClick={() => setAsk('delay')}>{t('cl.bid.delay')}</button>
          <button className="primary" onClick={() => setAsk(changed ? 'counter' : 'accept')}>{t(changed ? 'cl.bid.negotiateBtn' : 'cl.bid.accept')}</button>
        </div>
      </div>
    </Modal>
  );
}
