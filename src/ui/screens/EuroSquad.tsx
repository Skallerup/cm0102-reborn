// Klassisk: originalens "<klub> European Squad" (målt 9/11-2026). Spillerne i to kolonner; klik det blå felt for at tilmelde ("In")
// eller fjerne en spiller, højst 25. Nederst "25 Players Selected". Auto = de 25 bedste (3 målmænd + 22), Clear, Back, Submit.
import { useState } from 'react';
import { act } from '../../game/actions';
import { EURO_MAX, autoEuroSquad, euroRegistered } from '../../game/euroSquad';
import { POSITIONS, type Player } from '../../game/types';
import { squad } from '../../game/state';
import { t } from '../../i18n';
import { PlayerLink, posStr } from '../components';
import { askConfirm, askNotice } from '../confirm';
import { useGame } from '../core';

const POS_ORDER = (p: Player) => {
  const order = ['GK', 'SW', 'D', 'WB', 'DM', 'M', 'AM', 'ST'];
  const best = Math.max(...p.pos);
  return Math.min(...POSITIONS.map((k, i) => (p.pos[i] >= Math.min(15, best) ? order.indexOf(k) : 99)));
};

export function ClassicEuroSquad({ onClose }: { onClose: () => void }) {
  const g = useGame()!;
  const players = squad(g.userClub).filter((p) => !p.reserves).sort((a, b) => POS_ORDER(a) - POS_ORDER(b) || b.ca - a.ca);
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
    <div className="cx-sqn cx-eur">
      <div className="cx-subtitle">{t('sqn.please')}</div>
      <div className="cx-sqn-bar">
        <span className="cx-grow" />
        <button className="cx-grey" onClick={() => setSel(new Set(autoEuroSquad(g.userClub)))}>{t('sqn.auto')}</button>
        <button className="cx-grey" onClick={() => setSel(new Set())}>{t('sqn.clear')}</button>
      </div>
      <div className="cx-sqn-list">
        {players.map((p) => (
          <div key={p.id} className="cx-sqn-row">
            <span className="cx-sqn-box" data-pid={p.id} role="button" tabIndex={0} onClick={() => toggle(p.id)}>{sel.has(p.id) ? t('eur.in') : ''}</span>
            <span className="cx-sqn-tag">{p.injury ? <i className="inj">{t('cl.tag.Inj')}</i> : null}</span>
            <PlayerLink p={p} />
            <span className="cx-sqn-pos">{posStr(p)}</span>
          </div>
        ))}
      </div>
      <div className="cx-eur-count">{n === 0 ? t('eur.sel0') : n === 1 ? t('eur.sel1') : t('eur.selN', { n })}</div>
      <div className="cx-ts-buttons">
        <button onClick={onClose}>{t('common.back')}</button>
        <button className="primary" onClick={() => void submit()}>{t('sqn.submit')}</button>
      </div>
    </div>
  );
}
