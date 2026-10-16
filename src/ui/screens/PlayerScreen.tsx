import { useState } from 'react';
import { A, GROUPS, POSITIONS_LABEL } from '../../game/attributes';
import { attrRange, knowledgeOf, scoutRecommendation, scoutStars } from '../../game/scouting';
import { avgRating } from '../../game/season';
import { gs } from '../../game/state';
import { SCHEDULES } from '../../game/training';
import { askingPrice, canPreContract, loanSuitors, windowOpen } from '../../game/transfers';
import type { TransferOffer } from '../../game/types';
import { dateFmt, money, t } from '../../i18n';
import { AttrVal, Bar, ClubLink, Modal, MoneyInput, Nat, Panel, RecTag, Stars, age, posStr } from '../components';
import { useGame, useNav } from '../core';
import { act as dispatch } from '../../game/actions';
import { compareIds, toggleCompare } from '../compare';
import { Head } from './common';
import { NegotiationModal } from './Negotiation';
import { Arrow, DevelopmentChart, DevelopmentList, attrDelta, totalDelta } from '../dev';
import { trainingAdvice } from '../../game/training';
import { statusTags } from './Squad';

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
            {p.contract?.futureClub && <><span>{t('player.nextClub')}</span><span><ClubLink id={p.contract.futureClub} /></span></>}
            <span>{t('player.caps')}</span><span>{p.caps} / {p.intGoals}</span>
            {!mine && p.club > 0 && <><span>{t('player.asking')}</span><span>{k >= 40 ? `≈ ${money(askingPrice(p))}` : t('player.unknown')}</span></>}
          </div>
        </Panel>
        <Panel title={t('player.status')}>
          <div className="kv">
            <span>{t('col.cond')}</span><span><Bar value={p.condition} /> {Math.round(p.condition)}%</span>
            <span>{t('col.morale')}</span><span>{t(`morale.${p.morale >= 16 ? 'superb' : p.morale >= 13 ? 'good' : p.morale >= 9 ? 'okay' : 'poor'}`)}</span>
            <span>{t('col.form')}</span><span>{p.form.length ? p.form.map((r) => r.toFixed(1)).join(' · ') : '-'}</span>
            {p.injury && <><span>{t('player.injury')}</span><span className="bad">{t(`injury.${p.injury.key}`)} ({p.injury.days} {t('common.days')})</span></>}
            {p.banned > 0 && <><span>{t('tag.ban')}</span><span className="bad">{p.banned}</span></>}
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
      {!mine && g.userClub > 0 && <ScoutReport pid={p.id} />}
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
        <Panel title={t('player.career')}>
          {p.history.length === 0 ? <div className="muted">{t('player.noHistory')}</div> : (
            <table className="grid">
              <thead><tr><th>{t('col.season')}</th><th>{t('col.club')}</th><th className="num">{t('col.apps')}</th><th className="num">{t('col.goals')}</th><th className="num">{t('col.avr')}</th></tr></thead>
              <tbody>{p.history.slice().reverse().map((h) => (
                <tr key={h.season + '-' + h.club}><td>{h.season}/{String(h.season + 1).slice(2)}</td><td><ClubLink id={h.club} /></td><td className="num">{h.apps}</td><td className="num">{h.goals}</td><td className="num">{h.avg.toFixed(2)}</td></tr>
              ))}</tbody>
            </table>
          )}
        </Panel>
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
  const step = fee >= 10_000_000 ? 500_000 : fee >= 1_000_000 ? 100_000 : 25_000;
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
          </>
        )}
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button onClick={onClose}>{t('common.cancel')}</button>
          <button className="primary" onClick={() => onDone(dispatch<TransferOffer | string>({ t: 'bid', pid, fee: loan ? 0 : fee, loan }))}>{t('bid.submit')}</button>
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
