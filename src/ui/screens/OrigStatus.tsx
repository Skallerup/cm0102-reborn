// "Set Staff Transfer Status" (CM 01/02 0x8f6a10/0x8f7640) i det moderne udseende: udbudspris, trupstatus og transfer-/lejeliste/"efter eget ønske".
import { useState } from 'react';
import { act } from '../../game/actions';
import { gs } from '../../game/state';
import { SQUAD_STATUSES, statusAllowed, type SquadStatus } from '../../game/squadStatus';
import { cmStatusRows, statusNum } from '../../game/cmTransferList';
import { stepDown, stepUp } from '../../game/cmTransferBid';
import { cmGbp } from '../../game/cmMoney';
import { valueTarget } from '../../game/training';
import { currencySymbol, fromCurExact, getCurrency, money, moneyFull, t } from '../../i18n';
import { Modal } from '../components';

const PRICE_LIST = [0, 100_000, 250_000, 500_000, 1_000_000, 2_500_000, 5_000_000, 10_000_000, 15_000_000, 20_000_000];
const amountLabel = (a: number) => {
  const n = a >= 1_000_000 ? `${a / 1_000_000}M` : a >= 1000 ? `${a / 1000}K` : String(a);
  const c = getCurrency();
  return c === 'DKK' || c === 'SEK' || c === 'NOK' ? `${n} kr.` : `${currencySymbol()}${n}`;
};
const roundGbp = (v: number, k: number) => Math.round(Math.round(Math.round(v * k) / 1000) * 1000 / k);

export function OrigTransferStatus({ pid, onClose }: { pid: number; onClose: () => void }) {
  const g = gs();
  const p = g.players[pid];
  const [status, setStatus] = useState<SquadStatus | undefined>(p.squadStatus);
  const b4e = p.cmContract?.b4e ?? (p.listed ? 1 : 0) | (p.loanListed ? 2 : 0);
  const [listed, setListed] = useState(!!(b4e & 1));
  const [loan, setLoan] = useState(!!(b4e & 2));
  const [request, setRequest] = useState(!!(b4e & 8));
  const rows = cmStatusRows(p);
  const [price, setPrice] = useState<number>(p.value);
  const k = cmGbp(g, p.club);
  const name = `${p.first} ${p.last}`.trim();
  const save = () => { act({ t: 'cmTransferStatus', pid: p.id, status: statusNum(status), price: price !== p.value ? price : null, listed, loan, request }); onClose(); };
  return (
    <Modal title={t('cl.ts.title')} onClose={onClose}>
      <div className="col">
        <p>{t('cl.ts.valued', { player: name, value: moneyFull(p.value) })}</p>
        <div className="row" style={{ gap: 8, alignItems: 'center' }}>
          <span style={{ minWidth: 120 }}>{t('cl.ts.asking')}</span>
          <button className="small" disabled={price <= 0} onClick={() => setPrice(stepDown(price, k))} aria-label="-">−</button>
          <select value="" onChange={(e) => { if (e.target.value !== '') setPrice(Math.round(fromCurExact(Number(e.target.value)))); }}>
            <option value="">{money(price)}</option>
            {PRICE_LIST.map((a) => <option key={a} value={a}>{amountLabel(a)}</option>)}
          </select>
          <button className="small" onClick={() => setPrice(stepUp(price, k))} aria-label="+">+</button>
          <button className="small" onClick={() => setPrice(roundGbp(valueTarget(p), k))}>{t('cl.ts.auto')}</button>
        </div>
        <div className="muted">{t('cl.ts.squad')}</div>
        <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
          {SQUAD_STATUSES.map((s) => <button key={s} className={`small ${status === s ? 'primary' : ''}`} disabled={!statusAllowed(p, s, g.date)} onClick={() => setStatus(status === s ? undefined : s)}>{t(`cl.ts.s.${s}`)}</button>)}
        </div>
        <div className="muted">{t('cl.ts.transfer')}</div>
        <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
          <button className={`small ${listed ? 'primary' : ''}`} disabled={rows.listOff} onClick={() => { setListed(!listed); setLoan(false); setRequest(false); }}>{t('cl.ts.listed')}</button>
          <button className={`small ${loan ? 'primary' : ''}`} disabled={rows.listOff} onClick={() => { setLoan(!loan); setListed(false); setRequest(false); }}>{t('cl.ts.loan')}</button>
          <button className={`small ${request ? 'primary' : ''}`} disabled={rows.reqOff(request)} onClick={() => { setRequest(!request); setListed(false); setLoan(false); }}>{t('cl.ts.request')}</button>
        </div>
        <div className="row" style={{ justifyContent: 'flex-end' }}><button onClick={onClose}>{t('common.back')}</button><button className="primary" onClick={save}>{t('cl.ts.set')}</button></div>
      </div>
    </Modal>
  );
}
