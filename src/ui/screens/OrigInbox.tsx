// Originalens (CM 01/02) svar-knapper i indbakken og dialogerne bag dem – i det moderne udseende: Respond på bud/rygter/transferønsker, Confirm Transfer Offer,
// Offer Contract/Negotiate, European Squad, Squad Numbers, jobtilbud, Delay Transfer Offer, Appeal og Ultimatum. Reglerne ligger i game/ (de samme funktioner
// som det klassiske tema bruger).
import { useState } from 'react';
import { act } from '../../game/actions';
import { gs } from '../../game/state';
import { squad } from '../../game/state';
import type { NewsItem, TransferOffer } from '../../game/types';
import { POSITIONS, type Player } from '../../game/types';
import { money, t } from '../../i18n';
import { Modal, PlayerLink, posStr } from '../components';
import { askConfirm, askNotice } from '../confirm';
import { useGame, useNav } from '../core';
import { cmMarketOn } from '../../game/cmPlayerData';
import { cmRumourOpen } from '../../game/cmRumours';
import { requestOpen } from '../../game/cmTransferList';
import { cmConfirmOpen, cmConfirmScreen, cmSwapOpen, cmSwapView, cmTalksOpen } from '../../game/cmTransferTalks';
import { cmAppealAsk, cmAppealOpen } from '../../game/cmDiscipline';
import { cmActive, cmRejectStaff, cmStaffDelayOpen, cmStaffOn } from '../../game/cmStaff';
import { cmUltimatumReq } from '../../game/cmBoardGame';
import { ultimatumConfirm } from '../../game/cmBoardText';
import { cmSquadAnswerOpen, cmSquadAsk } from '../../game/cmIntlSquad';
import { squadNumbersDue } from '../../game/squadNumbers';
import { EURO_MAX, autoEuroSquad, euroDue, euroRegistered } from '../../game/euroSquad';
import { authentic } from '../../game/rules';
import { friendlyAnswer, friendlyProposalOpen } from './FriendlyClassic';
import { OrigIncomingBidModal } from './OrigBid';
import { OrigNegotiation } from './OrigNegotiation';
import { newsBody } from './common';

/** European Squad: tilmeld højst 25 spillere (Auto = de 25 bedste, Clear, Submit) */
function EuroSquadModal({ onClose }: { onClose: () => void }) {
  const g = useGame()!;
  const order = ['GK', 'SW', 'D', 'WB', 'DM', 'M', 'AM', 'ST'];
  const posOrder = (p: Player) => { const best = Math.max(...p.pos); return Math.min(...POSITIONS.map((k, i) => (p.pos[i] >= Math.min(15, best) ? order.indexOf(k) : 99))); };
  const players = squad(g.userClub).sort((a, b) => posOrder(a) - posOrder(b) || b.ca - a.ca);
  const [sel, setSel] = useState<Set<number>>(() => euroRegistered(g.userClub) ?? new Set());
  const toggle = (id: number) => {
    const next = new Set(sel);
    if (next.has(id)) next.delete(id);
    else if (next.size >= EURO_MAX) { void askNotice(t('eur.max', { n: EURO_MAX })); return; }
    else next.add(id);
    setSel(next);
  };
  const submit = async () => {
    if (!(await askConfirm(t('eur.confirm'), { head: t('eur.confirmHead') }))) return;
    act({ t: 'euroSquad', ids: [...sel] });
    onClose();
  };
  const n = sel.size;
  return (
    <Modal title={t('eur.titleClub', { club: g.clubs[g.userClub]?.short ?? '' })} onClose={onClose} wide>
      <div className="col">
        <div className="row" style={{ gap: 8 }}>
          <b className="grow">{n === 0 ? t('eur.sel0') : n === 1 ? t('eur.sel1') : t('eur.selN', { n })}</b>
          <button className="small" onClick={() => setSel(new Set(autoEuroSquad(g.userClub)))}>{t('sqn.auto')}</button>
          <button className="small" onClick={() => setSel(new Set())}>{t('sqn.clear')}</button>
        </div>
        <div className="col" style={{ gap: 2, maxHeight: 380, overflowY: 'auto' }}>
          {players.map((p) => (
            <label key={p.id} className="row" style={{ gap: 8, alignItems: 'center' }}>
              <input type="checkbox" checked={sel.has(p.id)} onChange={() => toggle(p.id)} />
              <span className="grow"><PlayerLink p={p} />{p.injury ? <span className="tag bad" style={{ marginLeft: 6 }}>{t('cl.tag.Inj')}</span> : null}</span>
              <span className="muted">{posStr(p)}</span>
            </label>
          ))}
        </div>
        <div className="row" style={{ justifyContent: 'flex-end' }}><button onClick={onClose}>{t('common.back')}</button><button className="primary" onClick={() => void submit()}>{t('sqn.submit')}</button></div>
      </div>
    </Modal>
  );
}

/** Select Media Response (rygte om egen spiller): Deny / Confirm / No Comment */
function MediaResponseModal({ news, onClose }: { news: NewsItem; onClose: () => void }) {
  const g = useGame()!;
  const [ans, setAns] = useState(3);
  const p = g.players[Number(news.params.pid)];
  if (!p) return null;
  return (
    <Modal title={t('cm.rum.sel.title')} onClose={onClose}>
      <div className="col">
        <p>{t('cm.rum.sel.text', { player: `${p.first} ${p.last}`.trim() })}</p>
        <p>{t('cm.rum.sel.ask')}</p>
        <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>{[1, 2, 3].map((k) => <button key={k} className={`small ${ans === k ? 'primary' : ''}`} onClick={() => setAns(k)}>{t(`cm.rum.sel.${k}`)}</button>)}</div>
        <div className="row" style={{ justifyContent: 'flex-end' }}><button onClick={onClose}>{t('common.cancel')}</button><button className="primary" onClick={() => { act({ t: 'cmRumour', news: news.id, answer: ans }); onClose(); }}>{t('common.ok')}</button></div>
      </div>
    </Modal>
  );
}

/** Transfer Request: "Put X on the transfer list at his own request ?" */
function TransferRequestModal({ news, onClose }: { news: NewsItem; onClose: () => void }) {
  const g = useGame()!;
  const p = news.link ? g.players[Number(news.link.id)] : undefined;
  if (!p) return null;
  const answer = (grant: boolean) => { act({ t: 'cmRequest', news: news.id, grant }); onClose(); };
  return (
    <Modal title={t('cm.req.title')} onClose={onClose}>
      <div className="col">
        <p>{t('cm.req.ask', { player: `${p.first} ${p.last}`.trim() })}</p>
        <div className="row" style={{ justifyContent: 'flex-end' }}><button onClick={onClose}>{t('common.back')}</button><button onClick={() => answer(false)}>{t('common.no')}</button><button className="primary" onClick={() => answer(true)}>{t('common.yes')}</button></div>
      </div>
    </Modal>
  );
}

/** Confirm Transfer Offer (Back · No · Delay · Yes) og Delay Transfer Offer (Back · Cancel · Delay) */
function ConfirmModal({ title, text, cancelLabel, yes, backOnly, onBack, onAnswer }: { title: string; text: string; cancelLabel: string; yes?: boolean; backOnly?: boolean; onBack: () => void; onAnswer: (a: 'yes' | 'no' | 'delay') => void }) {
  return (
    <Modal title={title} onClose={onBack}>
      <div className="col">
        <p>{text}</p>
        <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}>
          <button className={backOnly ? 'primary' : ''} onClick={onBack}>{t('common.back')}</button>
          {!backOnly && <>
            <button onClick={() => onAnswer('no')}>{cancelLabel}</button>
            <button className={yes ? '' : 'primary'} onClick={() => onAnswer('delay')}>{t('cl.delay')}</button>
            {yes && <button className="primary" onClick={() => onAnswer('yes')}>{t('common.yes')}</button>}
          </>}
        </div>
      </div>
    </Modal>
  );
}

/** 0x7798c0/0x77a140: landsholdets trupudtagelse – Confirm Squad Selection eller Squad Invalid */
async function squadRespond(item: NewsItem, nav: (r: { name: 'international'; id: number }) => void): Promise<void> {
  const g = gs();
  const a = cmSquadAsk(g, item);
  if (!a) return;
  if (a.ok) {
    const yes = await askConfirm(t('cmint.ask.q', { squad: a.nation }), { head: t('cmint.ask.head'), ok: t('common.yes'), cancel: t('common.no') });
    if (yes) act({ t: 'cmSquadConfirm', news: item.id });
    return;
  }
  const one = a.count === 1;
  const text = a.min === a.max ? t(one ? 'cmint.ask.eq1' : 'cmint.ask.eq', { squad: a.nation, n: a.max, c: a.count })
    : t(one ? 'cmint.ask.rng1' : 'cmint.ask.rng', { squad: a.nation, min: a.min, max: a.max, c: a.count });
  await askNotice(text, { head: t('cmint.ask.invalid') });
  const n = g.manager.national?.nation;
  if (n !== undefined) nav({ name: 'international', id: n });
}

/** Knapperne under en nyhed i et originalt spil (moderne udseende) – de samme betingelser som det klassiske indbakke-skærmbillede */
export function OrigNewsActions({ item }: { item: NewsItem }) {
  const g = useGame()!;
  const { nav } = useNav();
  const [modal, setModal] = useState<'bid' | 'eur' | 'rum' | 'req' | 'delay' | 'confirm' | 'talk' | 'swap' | 'renew' | null>(null);
  const offerOf = item.link?.kind === 'offer' ? g.offers.find((o) => o.id === Number(item.link!.id)) : undefined;
  const pendingBid = offerOf && offerOf.status === 'pending' && offerOf.seller === g.userClub ? offerOf : undefined;
  const jobOffer = item.link?.kind === 'club' && g.jobOffers.includes(Number(item.link.id)) ? Number(item.link.id) : undefined;
  const ultReq = cmUltimatumReq(g, item);
  const rejStaff = cmStaffOn(g) ? cmRejectStaff(g, item) : null;
  const delayOpen = cmStaffOn(g) && cmStaffDelayOpen(g, item);
  const talk = (item.key === 'transfer.cmTalks' || item.key === 'transfer.cmRejects') && offerOf ? offerOf : undefined;
  const talkOffer = talk && cmTalksOpen(g, talk) ? talk : undefined;
  const acceptedBid = !cmActive(g) && (item.key === 'transfer.bidAccepted' || item.key === 'transfer.releaseMet') && offerOf && offerOf.status === 'negotiating' && offerOf.buyer === g.userClub ? offerOf : undefined;
  const swapTalk = item.key === 'transfer.cmSwapTalks' ? offerOf : undefined;
  const swapPid = Number(item.params?.pid ?? -1);
  const swapOffer = swapTalk && cmSwapOpen(g, swapTalk, swapPid) ? swapTalk : undefined;
  const agreeOffer = item.key === 'transfer.cmAgrees' && offerOf && cmConfirmOpen(g, offerOf) ? offerOf : undefined;
  const rejPid = item.key === 'contract.offerRejected' && item.link?.kind === 'player' ? Number(item.link.id) : undefined;
  const rejPlayer = rejPid !== undefined && authentic() && g.players[rejPid]?.club === g.userClub && !g.pendingRenewals?.some((r) => r.pid === rejPid) ? rejPid : undefined;
  const respond = t('cl.bid.respond');
  const close = () => setModal(null);
  const btns: React.ReactNode[] = [];
  const add = (key: string, label: string, onClick: () => void, primary = true) => btns.push(<button key={key} className={primary ? 'primary' : ''} onClick={onClick}>{label}</button>);
  if (pendingBid) add('bid', respond, () => (cmMarketOn(g) && !pendingBid.loan ? setModal('bid') : nav({ name: 'transfers', tab: 'offers' } as never)));
  if (friendlyProposalOpen(g, item)) add('fr', respond, () => void friendlyAnswer(g, item));
  if (item.key === 'sqn.request' && squadNumbersDue(g.userClub)) add('sqn', respond, () => nav({ name: 'squad', state: { view: 'numbers' } } as never));
  if (item.key === 'eur.request' && euroDue(g.userClub)) add('eur', respond, () => setModal('eur'));
  if (cmRumourOpen(g, item)) add('rum', respond, () => setModal('rum'));
  if (requestOpen(g, item)) add('req', respond, () => setModal('req'));
  if (jobOffer !== undefined) add('job', respond, () => nav({ name: 'jobs' } as never));
  if (delayOpen) add('delay', respond, () => setModal('delay'));
  if (rejStaff) add('rejs', t('cl.negotiate'), () => nav({ name: 'staff', id: rejStaff.id, state: { stoffer: String(item.params.role ?? rejStaff.role) } } as never));
  if (talkOffer) add('talk', t(item.key === 'transfer.cmTalks' ? 'cl.offerContract' : 'cl.negotiate'), () => setModal('talk'));
  if (swapOffer) add('swap', t('cl.offerContract'), () => setModal('swap'));
  if (acceptedBid) add('acc', t('cl.offerContract'), () => setModal('talk'));
  if (agreeOffer) add('agree', respond, () => setModal('confirm'));
  if (rejPlayer !== undefined) add('renew', t('cl.negotiate'), () => setModal('renew'));
  if (cmAppealOpen(g, item)) add('appeal', t('cmban.appeal'), () => {
    const id = item.id, ask = cmAppealAsk(item);
    void askConfirm(t(ask.key, { n: ask.n, player: ask.player }), { head: t('cl.mt.confirm') }).then((ok) => { if (ok) act({ t: 'cmAppeal', news: id }); });
  });
  if (ultReq !== null) add('ult', t('cl.ultimatum'), () => {
    const id = item.id;
    void askConfirm(ultimatumConfirm(g.clubs[g.userClub]?.short || g.clubs[g.userClub]?.name || '', ultReq), { head: t('cl.mt.confirm') }).then((ok) => { if (ok) act({ t: 'ultimatum', news: id }); });
  });
  if (cmSquadAnswerOpen(g, item)) add('sq', respond, () => void squadRespond(item, nav));
  const offer = (talkOffer ?? acceptedBid) as TransferOffer | undefined;
  const confirmScreen = agreeOffer ? cmConfirmScreen(g, agreeOffer) : null;
  return (
    <>
      {btns.length > 0 && <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>{btns}</div>}
      {modal === 'bid' && pendingBid && <OrigIncomingBidModal offer={pendingBid} onClose={(msg) => { close(); if (msg) void askNotice(msg); }} />}
      {modal === 'eur' && <EuroSquadModal onClose={close} />}
      {modal === 'rum' && <MediaResponseModal news={item} onClose={close} />}
      {modal === 'req' && <TransferRequestModal news={item} onClose={close} />}
      {modal === 'delay' && <ConfirmModal title={t('cm.staffNoRoom')} text={newsBody(item)} cancelLabel={t('common.cancel')} onBack={close} onAnswer={(a) => { act({ t: 'staffDelay', news: item.id, delay: a === 'delay' }); close(); }} />}
      {modal === 'talk' && offer && <OrigNegotiation offer={offer} onClose={close} />}
      {modal === 'swap' && swapOffer && <OrigNegotiation key={`sw${swapPid}`} offer={cmSwapView(swapOffer, swapPid)} onClose={close} />}
      {modal === 'renew' && rejPlayer !== undefined && <OrigNegotiation renewPid={rejPlayer} onClose={close} />}
      {modal === 'confirm' && agreeOffer && confirmScreen && (
        <ConfirmModal title={confirmScreen.code === 2 ? t('cm.confirm.cancelled') : confirmScreen.code === 1 ? t('cm.staffNoRoom') : t('cm.confirm.title')}
          text={confirmScreen.key ? t(confirmScreen.key, { ...confirmScreen.params, fee: money(agreeOffer.fee) }) : ''} backOnly={confirmScreen.code === 2}
          cancelLabel={confirmScreen.code === 1 ? t('common.cancel') : t('common.no')} yes={confirmScreen.code === 0} onBack={close}
          onAnswer={(a) => { close(); act({ t: 'cmConfirm', offer: agreeOffer.id, answer: a }); }} />
      )}
    </>
  );
}
