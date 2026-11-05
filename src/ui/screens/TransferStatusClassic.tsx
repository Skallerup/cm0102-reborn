// "Set Staff Transfer Status" (som i CM 01/02): udbudspris (− / + / Auto), status i truppen og transferstatus.
import { useState } from 'react';
import { act } from '../../game/actions';
import { SQUAD_STATUSES, statusAllowed, type SquadStatus } from '../../game/squadStatus';
import { askingPrice } from '../../game/transfers';
import type { Player } from '../../game/types';
import { money, t } from '../../i18n';
import { useGame } from '../core';

const round = (v: number) => Math.max(10_000, Math.round(v / 10_000) * 10_000);

export function TransferStatusPanel({ p, onClose }: { p: Player; onClose: () => void }) {
  const g = useGame()!;
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
