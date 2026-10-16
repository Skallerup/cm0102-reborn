import { useState } from 'react';
import { gs } from '../../game/state';
import { act } from '../../game/actions';
import { preferredYears, wageDemand } from '../../game/transfers';
import type { TransferOffer } from '../../game/types';
import { money, t } from '../../i18n';
import { Modal } from '../components';

/** Kontraktforhandling – både nye spillere (via tilbud) og forlængelser */
export function NegotiationModal({ offer, renewPid, onClose }: { offer?: TransferOffer; renewPid?: number; onClose: () => void }) {
  const g = gs();
  const pid = offer?.player ?? renewPid!;
  const p = g.players[pid];
  const club = g.clubs[g.userClub];
  const demand = offer?.demand?.wage ?? wageDemand(p, club);
  const [wage, setWage] = useState(Math.round(demand / 50) * 50);
  const [years, setYears] = useState(offer?.demand?.years ?? preferredYears(p));
  const [msg, setMsg] = useState<{ text: string; tone: string } | null>(null);
  const bill = Object.values(g.players).filter((x) => x.club === club.id).reduce((s, x) => s + (x.contract?.wage ?? 0), 0);

  const submit = () => {
    const res = offer ? act<string>({ t: 'negotiate', pid, wage, years }) : act<string>({ t: 'renew', pid, wage, years });
    if (res === 'accepted') { setMsg({ text: t('neg.accepted'), tone: 'good' }); setTimeout(onClose, 900); }
    else if (res === 'counter') {
      const d = offer?.demand?.wage ?? wageDemand(p, club);
      setWage(Math.round(d / 50) * 50);
      setYears(offer?.demand?.years ?? preferredYears(p));
      setMsg({ text: t('neg.counter', { wage: money(d), years: offer?.demand?.years ?? preferredYears(p) }), tone: 'warn' });
    } else if (res === 'budget') setMsg({ text: t('neg.overWageBudget', { budget: money(club.wageBudget), bill: money(bill) }), tone: 'bad' });
    else { setMsg({ text: t('neg.refused'), tone: 'bad' }); setTimeout(onClose, 1400); }
  };

  return (
    <Modal title={t('neg.title', { player: `${p.first} ${p.last}` })} onClose={onClose}>
      <div className="col">
        <div className="kv">
          <span>{t('neg.currentWage')}</span><span>{money(p.contract?.wage ?? 0)} / {t('common.week')}</span>
          <span>{t('neg.agentHint')}</span><span>≈ {money(demand)} / {t('common.week')}, {preferredYears(p)} {t('common.years')}</span>
          <span>{t('neg.wageBill')}</span><span>{money(bill)} / {money(club.wageBudget)}</span>
          {offer && !offer.preContract && offer.fee > 0 && <><span>{t('neg.fee')}</span><span>{money(offer.fee)}</span></>}
          {offer?.preContract && <><span>{t('neg.type')}</span><span>{t('neg.bosman')}</span></>}
        </div>
        <label>{t('neg.wage')}: <b className="accent">{money(wage)}</b> / {t('common.week')}
          <input type="range" min={Math.round(demand * 0.5)} max={Math.round(demand * 1.6)} step={50} value={wage} onChange={(e) => setWage(Number(e.target.value))} style={{ width: '100%' }} />
        </label>
        <label>{t('neg.years')}:
          <select value={years} onChange={(e) => setYears(Number(e.target.value))} style={{ marginLeft: 8 }}>
            {[1, 2, 3, 4, 5].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </label>
        {msg && <div className={`insight ${msg.tone}`}>{msg.text}</div>}
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button onClick={onClose}>{t('common.close')}</button>
          <button className="primary" onClick={submit}>{t('neg.offer')}</button>
        </div>
      </div>
    </Modal>
  );
}
