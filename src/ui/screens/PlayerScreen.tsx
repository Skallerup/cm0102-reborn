import { useEffect, useState } from 'react';
import { Info } from '../help';
import { A, GROUPS, POSITIONS_LABEL } from '../../game/attributes';
import { attrRange, knowledgeOf, scoutRecommendation, scoutStars } from '../../game/scouting';
import { avgRating } from '../../game/season';
import { gs } from '../../game/state';
import { SCHEDULES } from '../../game/training';
import { askingPrice, canPreContract, interestedClubs, loanSuitors, preContractBlock, windowOpen } from '../../game/transfers';
import type { Contract, TransferOffer } from '../../game/types';
import { dateFmt, money, t } from '../../i18n';
import { ageOn, daysBetween } from '../../game/dates';
import { AttrVal, Bar, ClubLink, Modal, MoneyInput, Nat, Panel, RecTag, Stars, age, posStr } from '../components';
import { useGame, useNav } from '../core';
import { act as dispatch } from '../../game/actions';
import { compareIds, toggleCompare } from '../compare';
import { Head } from './common';
import { NegotiationModal } from './Negotiation';
import { AcceptCounterButton } from '../counterAccept';
import { Arrow, DevelopmentChart, DevelopmentList, attrDelta, totalDelta } from '../dev';
import { trainingAdvice } from '../../game/training';
import { GOOD_TRAITS, traits, type TalkKind } from '../../game/personality';
import { aiCall } from '../../ai/client';
import { guessIntent } from '../../ai/fallback';
import { useAiAvailable } from '../ai';
import { statusTags } from './Squad';
import { realCareer, type RealSeason } from '../careers';

export function PlayerScreen({ id }: { id: number }) {
  const g = useGame()!;
  const { nav } = useNav();
  const p = g.players[id];
  const [bid, setBid] = useState(false);
  const [neg, setNeg] = useState<{ offer?: TransferOffer; renew?: number } | null>(null);
  const [msg, setMsg] = useState('');
  const [loanOutOpen, setLoanOut] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  if (!p) return <div><Head title={t('player.gone')} /></div>;
  const mine = p.club === g.userClub && !!g.userClub;
  const k = knowledgeOf(p);
  const stars = scoutStars(p);
  const club = g.clubs[p.club];
  const shortlisted = g.shortlist.includes(p.id);
  const scouts = Object.values(g.staff).filter((s) => s.club === g.userClub && s.role === 'scout');

  const act = (r: TransferOffer | string) => {
    if (typeof r === 'string') { if (r !== 'ok') setMsg(t(r)); else setMsg(t('player.done')); }
    else if (r.status === 'negotiating') setNeg({ offer: r });
    else setMsg(t('player.bidSent'));
  };

  return (
    <div>
      <Head title={<>{p.first} {p.last} {statusTags(p, g.userClub)}</>}>
        <button className={compareIds.includes(p.id) ? 'primary' : ''} onClick={() => toggleCompare(p.id)}>{t('player.compare')} ({compareIds.length})</button>
        {compareIds.length >= 2 && <button onClick={() => nav({ name: 'compare' })}>{t('player.showCompare')}</button>}
      </Head>
      {msg && <div className="insight">{msg}</div>}
      {!mine && <MyOffer pid={p.id} onNegotiate={(o) => setNeg({ offer: o })} />}
      {mine && p.complaint && <Complaint pid={p.id} onMsg={setMsg} />}
      {mine && p.playPromise && <div className="insight warn" style={{ marginBottom: 12 }}>{t('complaint.promised', { date: dateFmt(p.playPromise.until) })}</div>}
      <div className="cols">
        <Panel title={t('player.info')}>
          <div className="kv">
            <span>{t('col.club')}</span><span>{p.club ? <ClubLink id={p.club} long /> : t('common.free')}{p.loan && <> ({t('tag.loan')} {t('common.from')} <ClubLink id={p.loan.from} />)</>}</span>
            <span>{t('col.age')}</span><span>{age(p)} ({dateFmt(p.dob)})</span>
            <span>{t('col.nat')}</span><span><Nat n={p.nation} /> {g.nations[p.nation]?.name}</span>
            <span>{t('col.pos')}</span><span>{posStr(p)}</span>
            <span>{t('player.foot')}</span><span>{t(`foot.${p.foot || 'R'}`)}</span>
            <span>{t('player.height')}</span><span>{p.height} cm</span>
            <span>{t('col.value')}</span><span>{money(p.value)}</span>
            {p.contract && <><span>{t('col.wage')}</span><span>{money(p.contract.wage)} / {t('common.week')}</span>
              <span>{t('col.expires')}</span><span>{dateFmt(p.contract.expires)}</span></>}
            {p.contract?.release && (mine || k >= 40) ? <><span>{t('clause.release')}</span><span>{money(p.contract.release)}</span></> : null}
            {mine && p.contract && clauseText(p.contract) && <><span>{t('clause.title')}</span><span>{clauseText(p.contract)}</span></>}
            {mine && p.sellOn && <><span>{t('clause.sellOn')}</span><span>{t('clause.sellOnTo', { pct: p.sellOn.pct, club: g.clubs[p.sellOn.club]?.name ?? '?' })}</span></>}
            {p.addOn && (mine || p.addOn.club === g.userClub) && <><span>{t('clause.addOnShort')}</span><span>{t('clause.addOnLeft', { fee: money(p.addOn.fee), club: g.clubs[p.addOn.club]?.name ?? '?', n: p.addOn.left })}</span></>}
            {p.contract?.futureClub && <><span>{t('player.nextClub')}</span><span><ClubLink id={p.contract.futureClub} /></span></>}
            <span>{t('player.caps')}</span><span>{p.caps} / {p.intGoals}</span>
            {!mine && p.club > 0 && <><span>{t('player.asking')}</span><span>{k >= 40 ? `≈ ${money(askingPrice(p))}` : t('player.unknown')}</span></>}
          </div>
        </Panel>
        <Panel title={t('player.status')}>
          <div className="kv">
            <span>{t('col.cond')}<Info topic="condition" /></span><span><Bar value={p.condition} /> {Math.round(p.condition)}%</span>
            <span>{t('col.morale')}<Info topic="morale" /></span><span>{t(`morale.${p.morale >= 16 ? 'superb' : p.morale >= 13 ? 'good' : p.morale >= 9 ? 'okay' : 'poor'}`)}</span>
            <span>{t('col.form')}</span><span>{p.form.length ? p.form.map((r) => r.toFixed(1)).join(' · ') : '-'}</span>
            {p.injury && <><span>{t('player.injury')}</span><span className="bad">{t(`injury.${p.injury.key}`)} ({p.injury.days} {t('common.days')})</span></>}
            {p.banned > 0 && <><span>{t('tag.ban')}</span><span className="bad">{p.banned}</span></>}
            {(mine || k >= 60) && traits(p).length > 0 && <><span>{t('pers.title')}</span><span>{traits(p).map((x) => <span key={x} className={`tag ${GOOD_TRAITS.has(x) ? 'good' : x === 'troublemaker' || x === 'lazy' || x === 'mercenary' ? 'bad' : 'warn'}`} title={t(`trait.${x}.desc`)}>{t(`trait.${x}`)}</span>)}</span></>}
            {p.promiseUntil && <><span>{t('pers.promise')}</span><span className="muted">{t('pers.promiseUntil', { date: dateFmt(p.promiseUntil) })}</span></>}
            <span>{t('player.ability')}</span><span><Stars range={stars.ability} /></span>
            <span>{t('player.potential')}</span><span><Stars range={stars.potential} /></span>
            {g.options.masking && !mine && <><span>{t('player.knowledge')}</span><span><Bar value={k} /> {Math.round(k)}%</span></>}
          </div>
        </Panel>
        <Panel title={t('player.actions')}>
          <div className="col">
            {mine && (
              <>
                <div className="row">
                  <label>{t('nav.training')}</label>
                  <select value={p.training} onChange={(e) => dispatch({ t: 'training', pid: p.id, key: e.target.value })}>
                    {SCHEDULES.map((s) => <option key={s.key} value={s.key}>{t(`train.${s.key}`)}</option>)}
                  </select>
                </div>
                <AdviceLine pid={p.id} />
                <div className="row">
                  {p.listed
                    ? <><button onClick={() => setListOpen(true)}>{t('list.changePrice')}</button><button onClick={() => dispatch({ t: 'listed', pid: p.id, price: null })}>{t('player.unlist')}</button></>
                    : <button onClick={() => setListOpen(true)}>{t('player.list')}</button>}
                  <button onClick={() => setNeg({ renew: p.id })}>{t('player.renew')}</button>
                  <button onClick={() => setLoanOut(true)} disabled={!!p.loan || !windowOpen()}>{t('player.loanOut')}</button>
                  <button className="danger" onClick={() => { if (confirm(t('player.releaseConfirm'))) { dispatch({ t: 'release', pid: p.id }); nav({ name: 'squad' }); } }}>{t('player.release')}</button>
                </div>
              </>
            )}
            {!mine && g.userClub > 0 && (
              <>
                <div className="row">
                  {p.club > 0 && <button className="primary" disabled={!windowOpen()} onClick={() => setBid(true)}>{t('player.bid')}</button>}
                  {!p.club && <button className="primary" onClick={() => act(dispatch<TransferOffer | string>({ t: 'bid', pid: p.id, fee: 0, loan: false }))}>{t('player.offerContract')}</button>}
                  {canPreContract(p) && <button onClick={() => act(dispatch<TransferOffer | string>({ t: 'preContract', pid: p.id }))}>{t('player.preContract')}</button>}
                  {(preContractBlock(p) === 'fromJanuary' || preContractBlock(p) === 'taken') && (
                    <div className="muted" style={{ fontSize: 12, flexBasis: '100%' }}>
                      {preContractBlock(p) === 'taken'
                        ? t('player.bosmanTaken', { club: g.clubs[p.contract!.futureClub!]?.name ?? '' })
                        : t('player.bosmanFromJan', { year: Number(p.contract!.expires.slice(0, 4)) })}
                    </div>
                  )}
                  <button onClick={() => dispatch({ t: 'shortlist', pid: p.id, on: !shortlisted })}>{shortlisted ? t('player.unshortlist') : t('player.shortlist')}</button>
                </div>
                {!windowOpen() && <div className="muted">{t('transfer.windowClosed')}</div>}
                {scouts.length > 0 && g.options.masking && k < 100 && (
                  <div className="row">
                    <select defaultValue="" onChange={(e) => {
                      const s = g.staff[Number(e.target.value)];
                      if (s) { dispatch({ t: 'scout', staffId: s.id, assignment: { kind: 'player', target: p.id } }); setMsg(t('player.scoutSent', { scout: `${s.first} ${s.last}` })); }
                    }}>
                      <option value="" disabled>{t('player.sendScout')}</option>
                      {scouts.map((s) => <option key={s.id} value={s.id}>{s.first} {s.last}</option>)}
                    </select>
                  </div>
                )}
              </>
            )}
            <label className="col">{t('player.notes')}
              <textarea rows={2} defaultValue={p.notes ?? ''} onBlur={(e) => { if (e.target.value !== (p.notes ?? '')) dispatch({ t: 'notes', pid: p.id, text: e.target.value }); }} />
            </label>
          </div>
        </Panel>
      </div>
      {mine && p.wantsAway && <WantsAway pid={p.id} onMsg={setMsg} />}
      {mine && <TalkPanel pid={p.id} />}
      {!mine && g.userClub > 0 && <ScoutReport pid={p.id} />}
      <InterestPanel pid={p.id} mine={mine} />
      <Panel title={t('player.attributes')} right={g.options.masking && k < 100 ? <span className="muted">{t('player.rangeHint')}</span> : undefined}>
        <div className="attr-groups">
          {(['technical', 'mental', 'physical', ...(p.pos[0] >= 15 ? ['goalkeeping'] : [])] as (keyof typeof GROUPS)[]).map((grp) => (
            <div key={grp}>
              <h4>{t(`group.${grp}`)}</h4>
              <div className="attr-list">
                {GROUPS[grp].filter((a) => p.pos[0] >= 15 || !['handling', 'oneOnOnes', 'reflexes'].includes(a)).map((a) => {
                  const [lo, hi] = attrRange(p, A[a], k);
                  return [<span key={a + 'l'}>{t(`attr.${a}`)}</span>, <span key={a + 'v'}>{mine && <Arrow d={attrDelta(p, A[a], 3)} small />}<AttrVal lo={lo} hi={hi} /></span>];
                })}
              </div>
            </div>
          ))}
          <div>
            <h4>{t('player.positions')}</h4>
            <div className="attr-list">
              {POSITIONS_LABEL.map(([lbl, i]) => [<span key={lbl + 'l'}>{lbl}</span>, <AttrVal key={lbl + 'v'} lo={p.pos[i]} hi={p.pos[i]} />])}
              {(['L', 'C', 'R'] as const).map((s, i) => [<span key={s + 'l'}>{t(`side.${s}`)}</span>, <AttrVal key={s + 'v'} lo={p.side[i]} hi={p.side[i]} />])}
            </div>
          </div>
        </div>
      </Panel>
      {p.dev && p.dev.length > 0 && (
        <div className="cols">
          <Panel title={t('dev.title')} right={<span className="muted">{t('dev.since', { date: dateFmt(p.dev[0].d) })}</span>}>
            <DevelopmentChart p={p} />
          </Panel>
          <Panel title={t('dev.changes')}>
            <DevelopmentList p={p} />
            <div className="muted" style={{ marginTop: 6 }}>{t('dev.total')}: <Arrow d={totalDelta(p, 999)} /></div>
          </Panel>
        </div>
      )}
      <div className="cols">
        <Panel title={t('player.thisSeason')}>
          <div className="kv">
            <span>{t('col.apps')}</span><span>{p.stats.apps} ({p.stats.subs})</span>
            <span>{t('col.goals')}</span><span>{p.stats.goals}</span>
            <span>{t('col.assists')}</span><span>{p.stats.assists}</span>
            <span>{t('player.mom')}</span><span>{p.stats.mom}</span>
            <span>{t('player.cards')}</span><span>{p.stats.yellows} / {p.stats.reds}</span>
            <span>{t('col.avr')}</span><span>{p.stats.ratingCount ? avgRating(p).toFixed(2) : '-'}</span>
          </div>
        </Panel>
        <CareerPanel pid={p.id} />
      </div>
      {bid && <BidModal pid={p.id} onClose={() => setBid(false)} onDone={(r) => { setBid(false); act(r); }} />}
      {listOpen && <ListModal pid={p.id} onClose={() => setListOpen(false)} />}
      {loanOutOpen && <LoanOutModal pid={p.id} onClose={() => setLoanOut(false)} onDone={(r) => { setLoanOut(false); act(r); }} />}
      {neg && <NegotiationModal offer={neg.offer} renewPid={neg.renew} onClose={() => setNeg(null)} />}
      {club && <div className="muted">{t('player.clubRep')}: {club.rep}</div>}
    </div>
  );
}

function BidModal({ pid, onClose, onDone }: { pid: number; onClose: () => void; onDone: (r: TransferOffer | string) => void }) {
  const g = gs();
  const p = g.players[pid];
  const budget = g.clubs[g.userClub].transferBudget;
  const [fee, setFee] = useState(Math.min(budget, Math.round(p.value / 50_000) * 50_000));
  const [loan, setLoan] = useState(false);
  const [sellOn, setSellOn] = useState(0);
  const [addOn, setAddOn] = useState(0);
  const step = fee >= 10_000_000 ? 500_000 : fee >= 1_000_000 ? 100_000 : 25_000;
  const release = p.contract?.release;
  return (
    <Modal title={t('bid.title', { player: `${p.first} ${p.last}` })} onClose={onClose}>
      <div className="col">
        <div className="kv">
          <span>{t('col.value')}</span><span>{money(p.value)}</span>
          <span>{t('top.budget')}</span><span>{money(budget)}</span>
        </div>
        <label className="row"><input type="checkbox" checked={loan} onChange={(e) => setLoan(e.target.checked)} /> {t('bid.loan')}</label>
        {!loan && (
          <>
            <label>{t('bid.fee')}: <b className="accent">{money(fee)}</b></label>
            <div className="row">
              <button onClick={() => setFee(Math.max(0, fee - step))}>−</button>
              <MoneyInput value={fee} onChange={setFee} width={140} />
              <button onClick={() => setFee(fee + step)}>+</button>
            </div>
            {release ? (
              <div className="insight row">
                <span className="grow">{t('clause.releaseKnown', { fee: money(release) })}</span>
                <button className="small" disabled={release > budget} onClick={() => { setFee(release); setSellOn(0); setAddOn(0); }}>{t('clause.payRelease')}</button>
              </div>
            ) : null}
            <div className="row">{t('clause.sellOn')}: {[0, 10, 15, 20, 30].map((v) => <button key={v} className={`small ${sellOn === v ? 'primary' : ''}`} onClick={() => setSellOn(v)}>{v ? `${v}%` : t('common.none')}</button>)}</div>
            <div className="row">{t('clause.addOn', { n: 25 })}: <MoneyInput value={addOn} onChange={setAddOn} width={130} /></div>
            {(sellOn > 0 || addOn > 0) && <div className="muted" style={{ fontSize: 12 }}>{t('clause.bidHint')}</div>}
          </>
        )}
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button onClick={onClose}>{t('common.cancel')}</button>
          <button className="primary" onClick={() => onDone(dispatch<TransferOffer | string>({ t: 'bid', pid, fee: loan ? 0 : fee, loan, sellOn: loan ? 0 : sellOn, addOn: loan ? 0 : addOn }))}>{t('bid.submit')}</button>
        </div>
      </div>
    </Modal>
  );
}

function LoanOutModal({ pid, onClose, onDone }: { pid: number; onClose: () => void; onDone: (r: string) => void }) {
  const g = gs();
  const p = g.players[pid];
  const wage = p.contract?.wage ?? 0;
  const suitors = loanSuitors(pid);
  const [share, setShare] = useState(100);
  const [fee, setFee] = useState(0);
  const [club, setClub] = useState(0);
  const willing = suitors.filter((s) => s.maxShare * 100 >= share - 0.01 && s.maxFee >= fee);
  return (
    <Modal title={t('loan.title', { player: `${p.first} ${p.last}` })} onClose={onClose} wide>
      <div className="col">
        <div className="muted">{t('loan.explain')}</div>
        <label>{t('loan.share')}: <b className="accent">{share}%</b> ({money(wage * share / 100)} / {t('common.week')} {t('loan.theyPay')}, {money(wage * (100 - share) / 100)} {t('loan.youPay')})
          <input type="range" min={0} max={100} step={5} value={share} onChange={(e) => { setShare(Number(e.target.value)); setClub(0); }} style={{ width: '100%' }} />
        </label>
        <label className="row">{t('loan.fee')}: <MoneyInput value={fee} onChange={(v) => { setFee(v); setClub(0); }} /></label>
        <div className="table-wrap" style={{ maxHeight: 320, overflowY: 'auto' }}>
          <table className="grid">
            <thead><tr><th>{t('col.club')}</th><th>{t('col.comp')}</th><th className="num">{t('loan.maxShare')}</th><th className="num">{t('loan.maxFee')}</th><th></th></tr></thead>
            <tbody>
              {suitors.length === 0 && <tr><td colSpan={5} className="muted">{t('transfer.noLoanClub')}</td></tr>}
              {suitors.map((s) => {
                const ok = willing.includes(s);
                return (
                  <tr key={s.club} className={`${ok ? 'clickable' : 'injured'} ${club === s.club ? 'me' : ''}`} onClick={() => ok && setClub(s.club)}>
                    <td><ClubLink id={s.club} /></td>
                    <td>{g.leagues[g.clubs[s.club]?.league]?.name}</td>
                    <td className="num">{Math.round(s.maxShare * 100)}%</td>
                    <td className="num">{money(s.maxFee)}</td>
                    <td>{ok ? <span className="tag good">{t('loan.accepts')}</span> : <span className="tag bad">{t('loan.declines')}</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <span className="muted">{willing.length} {t('loan.interested')}</span>
          <button onClick={onClose}>{t('common.cancel')}</button>
          <button className="primary" disabled={!club} onClick={() => onDone(dispatch<string>({ t: 'loanOut', pid, club, share: share / 100, fee }))}>{t('loan.agree')}</button>
        </div>
      </div>
    </Modal>
  );
}

function ListModal({ pid, onClose }: { pid: number; onClose: () => void }) {
  const g = gs();
  const p = g.players[pid];
  const [pct, setPct] = useState(p.listPrice ? Math.round((p.listPrice / Math.max(1, p.value)) * 100) : 100);
  const price = Math.max(10_000, Math.round((p.value * pct) / 100 / 10_000) * 10_000);
  const hint = pct <= 60 ? 'list.hintBargain' : pct <= 90 ? 'list.hintCheap' : pct <= 115 ? 'list.hintFair' : pct <= 150 ? 'list.hintHigh' : 'list.hintTooHigh';
  return (
    <Modal title={t('list.title', { player: `${p.first} ${p.last}` })} onClose={onClose}>
      <div className="col">
        <div className="kv">
          <span>{t('col.value')}</span><span>{money(p.value)}</span>
          {p.contract && <><span>{t('col.expires')}</span><span>{dateFmt(p.contract.expires)}</span></>}
        </div>
        <label>{t('list.price')}: <b className="accent">{money(price)}</b> ({pct}% {t('list.ofValue')})
          <input type="range" min={30} max={200} step={5} value={pct} onChange={(e) => setPct(Number(e.target.value))} style={{ width: '100%' }} />
        </label>
        <div className="row">
          {[50, 75, 100, 125, 150].map((v) => <button key={v} className={`small ${pct === v ? 'primary' : ''}`} onClick={() => setPct(v)}>{v}%</button>)}
        </div>
        <div className={`insight ${pct <= 90 ? 'good' : pct > 150 ? 'bad' : ''}`}>{t(hint)}</div>
        <div className="muted">{t('list.explain')}</div>
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button onClick={onClose}>{t('common.cancel')}</button>
          <button className="primary" onClick={() => { dispatch({ t: 'listed', pid, price }); onClose(); }}>{p.listed ? t('list.update') : t('player.list')}</button>
        </div>
      </div>
    </Modal>
  );
}

function AdviceLine({ pid }: { pid: number }) {
  const g = gs();
  const p = g.players[pid];
  const adv = trainingAdvice(p);
  const asst = Object.values(g.staff).find((s) => s.club === g.userClub && s.role === 'assistant');
  if (adv.key === p.training) return <div className="muted">✓ {t('adv.agrees', { coach: asst ? asst.last : t('role.staff.assistant') })}</div>;
  return (
    <div className="insight">
      {t('adv.suggest', { coach: asst ? `${asst.first} ${asst.last}` : t('role.staff.assistant'), schedule: t(`train.${adv.key}`) })}{' '}
      <span className="muted">{t(adv.reason, { attrs: adv.attrs.map((a) => t(`attr.${a}`)).join(` ${t('common.and')} `) })}</span>{' '}
      <button className="small primary" onClick={() => dispatch({ t: 'training', pid, key: adv.key })}>{t('adv.use')}</button>
    </div>
  );
}

function ScoutReport({ pid }: { pid: number }) {
  const g = gs();
  const p = g.players[pid];
  const rec = scoutRecommendation(p);
  const scouts = Object.values(g.staff).filter((s) => s.club === g.userClub && s.role === 'scout').sort((a, b) => b.attrs.judgingAbility - a.attrs.judgingAbility);
  const scout = scouts[0];
  return (
    <div className={`insight ${rec.level < 0 ? '' : rec.level <= 1 ? 'good' : rec.level >= 3 ? 'bad' : 'warn'}`}>
      <div className="row"><b>{t('rec.title', { scout: scout ? `${scout.first} ${scout.last}` : t('role.staff.scout') })}</b> <RecTag level={rec.level} /></div>
      <div style={{ marginTop: 4 }}>{t(rec.key)}{rec.reasons.length > 0 && ' '}{rec.reasons.map((r) => t(r.key, r.params)).join(' ')}</div>
    </div>
  );
}

function WantsAway({ pid, onMsg }: { pid: number; onMsg: (m: string) => void }) {
  const g = gs();
  const p = g.players[pid];
  return (
    <div className="insight bad">
      <b>{t('pers.wantsAwayTitle', { player: p.last })}</b>
      <div className="muted" style={{ margin: '4px 0 8px' }}>{t('pers.wantsAwayText')}</div>
      <div className="row">
        <button className="small primary" disabled={!!p.promiseUntil} onClick={() => onMsg(t(dispatch<string>({ t: 'talk', pid, choice: 'promise' })))}>{t('pers.talk.promise')}</button>
        <button className="small" onClick={() => onMsg(t(dispatch<string>({ t: 'talk', pid, choice: 'list' })))}>{t('pers.talk.list')}</button>
        <button className="small danger" onClick={() => onMsg(t(dispatch<string>({ t: 'talk', pid, choice: 'refuse' })))}>{t('pers.talk.refuse')}</button>
      </div>
    </div>
  );
}

/** Dit aktive bud på spilleren – med mulighed for at trække det tilbage */
function MyOffer({ pid, onNegotiate }: { pid: number; onNegotiate: (o: TransferOffer) => void }) {
  const g = gs();
  const o = g.offers.slice().reverse().find((x) => x.player === pid && x.buyer === g.userClub && ['pending', 'countered', 'negotiating'].includes(x.status));
  if (!o) return null;
  return (
    <div className="insight warn row">
      <span className="grow">
        <b>{t('myoffer.title')}</b> {o.loan ? t('tr.loan') : o.preContract ? t('neg.bosman') : money(o.fee)} · <span className="tag warn">{t(`offer.${o.status}`)}</span>
        {o.status === 'countered' && o.counter ? <> · {t('myoffer.theyWant', { fee: money(o.counter) })}</> : null}
      </span>
      {o.status === 'negotiating' && <button className="small primary" onClick={() => onNegotiate(o)}>{t('offer.negotiate')}</button>}
      {o.status === 'countered' && <AcceptCounterButton o={o} onOk={() => onNegotiate(o)} />}
      <button className="small danger" onClick={() => { if (confirm(t('neg.cancelConfirm'))) dispatch({ t: 'withdraw', pid }); }}>{t('offer.withdraw')}</button>
    </div>
  );
}

function TalkPanel({ pid }: { pid: number }) {
  const g = useGame()!;
  const p = g.players[pid];
  const [res, setRes] = useState<{ key: string; mood: string } | null>(null);
  const cooldown = p.lastTalk ? 10 - daysBetween(p.lastTalk, g.date) : 0;
  const form = p.form.slice(-3);
  const avgForm = form.length ? form.reduce((s, x) => s + x, 0) / form.length : null;
  const reason = p.lastRed && daysBetween(p.lastRed, g.date) <= 30 ? t('talk.reasonRed', { date: dateFmt(p.lastRed) })
    : p.lastIncident && daysBetween(p.lastIncident, g.date) <= 45 ? t('talk.reasonIncident', { date: dateFmt(p.lastIncident) }) : null;
  const ai = useAiAvailable();
  const [msgText, setMsgText] = useState('');
  const [convo, setConvo] = useState<{ me: string; reply: string; mood: string } | null>(null);
  const [thinking, setThinking] = useState(false);
  const doTalk = (kind: TalkKind): { key: string; mood: string } | null => {
    if ((kind === 'fine' || kind === 'fineHeavy' || kind === 'drop') && !reason && !confirm(t('talk.noReasonConfirm'))) return null;
    const r = dispatch<{ key: string; mood: string }>({ t: 'interact', pid, kind });
    setRes(r);
    setConvo(null);
    return r;
  };
  // fritekst: AI tolker hensigten, spillets regler afgør reaktionen, AI skriver spillerens svar
  const sendMessage = async () => {
    const text = msgText.trim().slice(0, 400);
    if (!text || thinking) return;
    setThinking(true);
    const allowed: TalkKind[] = ['praise', 'encourage', 'criticise', 'demand', 'fine', 'chat'];
    const r = await aiCall<{ intent: string }>('talkIntent', { message: text, allowed });
    const intent = (allowed.includes(r?.intent as TalkKind) ? r!.intent : guessIntent(text)) as TalkKind;
    const out = doTalk(intent);
    if (!out) { setThinking(false); return; }
    const outcome = t(out.key, { player: p.last });
    setConvo({ me: text, reply: outcome, mood: out.mood });
    setMsgText('');
    const reply = await aiCall<{ reply: string }>('talkReply', {
      player: `${p.first} ${p.last}`, age: ageOn(p.dob, g.date), traits: traits(p), morale: Math.round(p.morale), recentRatings: p.form,
      managerMessage: text, interpretedAs: intent, outcome, mood: out.mood,
    });
    if (reply?.reply) setConvo({ me: text, reply: reply.reply, mood: out.mood });
    setThinking(false);
  };
  const wage = p.contract?.wage ?? 0;
  return (
    <Panel title={t('talk.title', { player: p.last })}>
      <div className="col">
        <div className="kv">
          <span>{t('talk.form')}</span><span>{avgForm !== null ? `${avgForm.toFixed(1)} (${form.map((x) => x.toFixed(1)).join(' · ')})` : t('talk.noGames')}</span>
          <span>{t('col.morale')}</span><span><Bar value={p.morale} max={20} /></span>
          <span>{t('talk.discipline')}</span><span className={reason ? 'bad' : 'muted'}>{reason ?? t('talk.noReason')}</span>
        </div>
        <div className="row">
          <button disabled={cooldown > 0} onClick={() => doTalk('praise')}>👏 {t('talk.praise')}</button>
          <button disabled={cooldown > 0} onClick={() => doTalk('encourage')}>🤝 {t('talk.encourage')}</button>
          <button disabled={cooldown > 0} onClick={() => doTalk('criticise')}>☝️ {t('talk.criticise')}</button>
          <button className="danger" disabled={cooldown > 0} onClick={() => doTalk('fine')}>{t('talk.fine', { fee: money(wage) })}</button>
          <button className="danger" disabled={cooldown > 0} onClick={() => doTalk('fineHeavy')}>{t('talk.fineHeavy', { fee: money(wage * 2) })}</button>
          <button className="danger" disabled={cooldown > 0} onClick={() => doTalk('drop')}>{t('talk.drop')}</button>
        </div>
        <div className="row">
          <input style={{ flex: 1 }} maxLength={400} disabled={cooldown > 0 || thinking} placeholder={t('talk.freePlaceholder', { player: p.first || p.last })} value={msgText} onChange={(e) => setMsgText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }} />
          <button disabled={cooldown > 0 || thinking || !msgText.trim()} onClick={sendMessage}>{thinking ? '…' : t('talk.send')}</button>
        </div>
        {!ai && <div className="muted" style={{ fontSize: 12 }}>{t('talk.noAi')}</div>}
        {cooldown > 0 && !res && !convo && <div className="muted">{t('talk.cooldown', { n: cooldown })}</div>}
        {convo ? (
          <div className="chat">
            <div className="chat-me">{convo.me}</div>
            <div className={`chat-them insight ${convo.mood}`}><b>{p.last}:</b> {convo.reply}</div>
          </div>
        ) : res && <div className={`insight ${res.mood}`}>{t(res.key, { player: p.last })}</div>}
      </div>
    </Panel>
  );
}

/** Karriere: virkelige sæsoner før spilstart + sæsoner i spillet + den igangværende sæson */
function CareerPanel({ pid }: { pid: number }) {
  const g = useGame()!;
  const p = g.players[pid];
  const [real, setReal] = useState<RealSeason[] | null>(null);
  useEffect(() => { let alive = true; realCareer(pid).then((r) => { if (alive) setReal(r); }); return () => { alive = false; }; }, [pid]);
  if (!p) return null;
  type Row = { key: string; season: number; club: number; clubName?: string; apps: number; goals: number; assists: number; minutes?: number; avg?: number; loan?: boolean; real?: boolean; live?: boolean };
  const rows: Row[] = [
    ...(real ?? []).map((r, i) => ({ key: `r${i}`, ...r, real: true })),
    ...p.history.map((h, i) => ({ key: `h${i}`, ...h })),
  ];
  // den igangværende sæson (minus det der allerede er bogført på en tidligere klub)
  const b = p.split ?? { apps: 0, goals: 0, assists: 0, minutes: 0, ratingSum: 0, ratingCount: 0 };
  const liveApps = p.stats.apps + p.stats.subs - b.apps;
  if (liveApps > 0 && p.club) {
    const rc = p.stats.ratingCount - b.ratingCount;
    rows.push({ key: 'live', season: g.season, club: p.club, apps: liveApps, goals: p.stats.goals - b.goals, assists: p.stats.assists - b.assists, minutes: p.stats.minutes - b.minutes, avg: rc > 0 ? (p.stats.ratingSum - b.ratingSum) / rc : undefined, loan: !!p.loan, live: true });
  }
  rows.sort((x, y) => y.season - x.season || (x.live ? -1 : 0));
  const tot = rows.reduce((s, r) => ({ apps: s.apps + r.apps, goals: s.goals + r.goals, assists: s.assists + r.assists, minutes: s.minutes + (r.minutes ?? 0) }), { apps: 0, goals: 0, assists: 0, minutes: 0 });
  const seasonLabel = (s: number) => `${s}/${String(s + 1).slice(2)}`;
  return (
    <Panel title={t('player.career')} className="flush">
      {real === null && rows.length === 0 ? <div className="empty">{t('common.loading')}</div> : rows.length === 0 ? <div className="empty">{t('player.noHistory')}</div> : (
        <div className="table-wrap" style={{ maxHeight: 420, overflowY: 'auto' }}>
          <table className="grid">
            <thead><tr><th>{t('col.season')}</th><th>{t('col.club')}</th><th className="num">{t('col.apps')}</th><th className="num">{t('col.goals')}</th><th className="num">{t('col.assists')}</th><th className="num">{t('career.minutes')}</th><th className="num">{t('col.avr')}</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key} className={r.live ? 'me' : ''}>
                  <td className="nowrap">{seasonLabel(r.season)}{r.live && <span className="muted"> · {t('career.now')}</span>}</td>
                  <td className="nowrap">{gs().clubs[r.club] ? <ClubLink id={r.club} long /> : <span>{r.clubName ?? '?'}</span>}{r.loan && <span className="muted"> ({t('career.loan')})</span>}</td>
                  <td className="num">{r.apps}</td>
                  <td className="num">{r.goals}</td>
                  <td className="num">{r.assists}</td>
                  <td className="num">{r.minutes ? r.minutes.toLocaleString() : '–'}</td>
                  <td className="num">{r.avg ? r.avg.toFixed(2) : '–'}</td>
                </tr>
              ))}
              <tr className="career-total"><td colSpan={2}><b>{t('career.total')}</b></td><td className="num"><b>{tot.apps}</b></td><td className="num"><b>{tot.goals}</b></td><td className="num"><b>{tot.assists}</b></td><td className="num"><b>{tot.minutes ? tot.minutes.toLocaleString() : '–'}</b></td><td /></tr>
            </tbody>
          </table>
        </div>
      )}
      {real && real.length > 0 && <div className="muted" style={{ fontSize: 11.5, padding: '6px 12px 10px' }}>{t('career.source')}</div>}
    </Panel>
  );
}

/** Spilleren har bedt om en samtale – manageren svarer */
function Complaint({ pid, onMsg }: { pid: number; onMsg: (m: string) => void }) {
  const g = useGame()!;
  const p = g.players[pid];
  if (!p) return null;
  const kind = p.complaint?.kind ?? 'time';
  const choices: ('promise' | 'fight' | 'list' | 'listen')[] = kind === 'time' || kind === 'blocked' ? ['promise', 'fight', 'list', 'listen'] : ['listen', 'fight', 'list'];
  const label = (c: string, part: 'opt' | 'hint') => (kind === 'blocked' ? t(`complaint.${part}.blocked.${c}`) : t(`complaint.${part}.${c}`));
  const suitor = p.complaint?.club ? g.clubs[p.complaint.club]?.name ?? '' : '';
  return (
    <Panel title={t('complaint.title', { player: `${p.first} ${p.last}` })}>
      <p style={{ marginTop: 0, lineHeight: 1.5 }}>“{t(`complaint.says.${kind}`, { club: suitor })}”</p>
      <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
        {choices.map((c) => <button key={c} className={c === 'promise' ? 'primary' : ''} title={label(c, 'hint')} onClick={() => onMsg(`${p.last}: ${t(dispatch<string>({ t: 'complaint', pid, choice: c }), { player: p.last, club: suitor })}`)}>{label(c, 'opt')}</button>)}
      </div>
    </Panel>
  );
}

/** Kort tekst med kontraktens klausuler (uden frikøbsklausul) */
function clauseText(c: Contract): string {
  const parts: string[] = [];
  if (c.wageRise) parts.push(t('clause.sumRise', { n: c.wageRise }));
  if (c.appBonus) parts.push(t('clause.sumApp', { fee: money(c.appBonus) }));
  if (c.goalBonus) parts.push(t('clause.sumGoal', { fee: money(c.goalBonus) }));
  if (c.relegationCut) parts.push(t('clause.sumCut', { n: c.relegationCut }));
  return parts.join(' · ');
}

/** Hvilke klubber holder øje med spilleren (klubbernes shortlister) */
function InterestPanel({ pid, mine }: { pid: number; mine: boolean }) {
  const g = useGame()!;
  const p = g.players[pid];
  const [all, setAll] = useState(false);
  if (!p) return null;
  const list = interestedClubs(p);
  const onMine = !mine && g.shortlist.includes(p.id);
  const shown = all ? list : list.slice(0, 8);
  return (
    <Panel title={t('interest.title')} right={list.length ? <span className="muted">{t('interest.count', { n: list.length })}</span> : undefined}>
      {mine && list.length > 0 && <div className="insight warn" style={{ marginBottom: 8 }}>{t('interest.mine', { n: list.length })}</div>}
      {onMine && <div className="muted" style={{ marginBottom: 6 }}>{t('interest.onYourList')}</div>}
      {list.length === 0 ? <div className="muted">{t('interest.none')}</div> : (
        <div className="interest-list">
          {shown.map((x) => (
            <span key={x.club} className="interest-club">
              <ClubLink id={x.club} />
              {x.human && <span className="muted"> · {t('interest.humanList', { name: x.human })}</span>}
            </span>
          ))}
          {!all && list.length > 8 && <button className="small" onClick={() => setAll(true)}>{t('interest.more', { n: list.length - 8 })}</button>}
        </div>
      )}
    </Panel>
  );
}
