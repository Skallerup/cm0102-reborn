import { useState } from 'react';
import { A, GROUPS, POSITIONS_LABEL } from '../../game/attributes';
import { attrRange, knowledgeOf, scoutStars } from '../../game/scouting';
import { avgRating } from '../../game/season';
import { gs } from '../../game/state';
import { SCHEDULES } from '../../game/training';
import { askingPrice, canPreContract, windowOpen } from '../../game/transfers';
import type { TransferOffer } from '../../game/types';
import { currencySymbol, dateFmt, fromCur, money, t, toCur } from '../../i18n';
import { AttrVal, Bar, ClubLink, Modal, Nat, Panel, Stars, age, posStr } from '../components';
import { useGame, useNav } from '../core';
import { act as dispatch } from '../../game/actions';
import { compareIds, toggleCompare } from '../compare';
import { Head } from './common';
import { NegotiationModal } from './Negotiation';
import { statusTags } from './Squad';

export function PlayerScreen({ id }: { id: number }) {
  const g = useGame()!;
  const { nav } = useNav();
  const p = g.players[id];
  const [bid, setBid] = useState(false);
  const [neg, setNeg] = useState<{ offer?: TransferOffer; renew?: number } | null>(null);
  const [msg, setMsg] = useState('');
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
                <div className="row">
                  <button onClick={() => dispatch({ t: 'listed', pid: p.id })}>{p.listed ? t('player.unlist') : t('player.list')}</button>
                  <button onClick={() => setNeg({ renew: p.id })}>{t('player.renew')}</button>
                  <button onClick={() => act(dispatch<string>({ t: 'loanOut', pid: p.id }))} disabled={!!p.loan}>{t('player.loanOut')}</button>
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
      <Panel title={t('player.attributes')} right={g.options.masking && k < 100 ? <span className="muted">{t('player.rangeHint')}</span> : undefined}>
        <div className="attr-groups">
          {(['technical', 'mental', 'physical', ...(p.pos[0] >= 15 ? ['goalkeeping'] : [])] as (keyof typeof GROUPS)[]).map((grp) => (
            <div key={grp}>
              <h4>{t(`group.${grp}`)}</h4>
              <div className="attr-list">
                {GROUPS[grp].filter((a) => p.pos[0] >= 15 || !['handling', 'oneOnOnes', 'reflexes'].includes(a)).map((a) => {
                  const [lo, hi] = attrRange(p, A[a], k);
                  return [<span key={a + 'l'}>{t(`attr.${a}`)}</span>, <AttrVal key={a + 'v'} lo={lo} hi={hi} />];
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
              <input type="number" value={toCur(fee)} step={toCur(step)} onChange={(e) => setFee(Math.max(0, fromCur(Number(e.target.value))))} style={{ width: 140 }} /> <span className="muted">{currencySymbol()}</span>
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
