// Originalens Offer Trial (cmTrial.ts): "Cannot trial X" (0x8f0e40 art 2), Trial Period 0x8f8be0 (− uger +, Back · Offer) og bekræftelsen
// 0x8fb6a0 ("Confirm offer to X" – "Offer a N week trial to X ?", No · Yes)
import { useState } from 'react';
import { act as dispatch } from '../game/actions';
import { cmHumanTrialCheck } from '../game/cmShortlistGame';
import { TRIAL_WEEKS } from '../game/cmTrial';
import { gs } from '../game/state';
import type { Player } from '../game/types';
import { t } from '../i18n';
import { askConfirm, askNotice } from './confirm';
import { CxPm, titleColors, useClassicDialog } from './classic';
import { Modal } from './components';

const nm = (p: Player) => `${p.first} ${p.last}`.trim();

/** Handlingen 0x8892fe: 0x8ce990 nej → beskeden; ja → dialogen (open) */
export function offerTrialClick(p: Player, open: () => void): void {
  const g = gs();
  const chk = cmHumanTrialCheck(g, p, g.userClub);
  if (chk && !chk.ok) { void askNotice(chk.msg ? t(chk.msg.key, chk.msg.params) : '', { head: t('cl.trial.cannot', { player: nm(p) }) }); return; }
  open();
}

/** Yes i 0x8fb6a0 → 0x8fb9e0 */
async function confirmTrial(p: Player, weeks: number): Promise<boolean> {
  const text = weeks === 1 ? t('cl.trial.q1', { player: nm(p) }) : t('cl.trial.qN', { n: weeks, player: nm(p) });
  if (!(await askConfirm(text, { head: t('cl.trial.confirm', { player: nm(p) }) }))) return false;
  return dispatch<string>({ t: 'cmTrial', pid: p.id, weeks }) === 'ok';
}

const weeksLabel = (w: number) => (w === 1 ? t('cl.trial.week1') : t('cl.trial.weeks', { n: w }));

/** Trial Period 0x8f8be0 i det klassiske tema (helskærmsboks som originalen) */
export function TrialPanel({ p, onClose }: { p: Player; onClose: () => void }) {
  useClassicDialog();
  const g = gs();
  const col = titleColors(g.userClub || undefined);
  const [w, setW] = useState(TRIAL_WEEKS.start);
  return (
    <div className="cx-dlg cx-confirm" role="dialog" data-trial="1">
      <div className="cx-title" style={{ background: col.bg, color: col.fg }}><h2>{g.clubs[g.userClub]?.name ?? ''}</h2></div>
      <div className="cx-subtitle">{t('cl.trial.head')}</div>
      <div className="cx-dlg-body center">
        <p className="cx-ts-intro">{t('cl.trial.offerTo', { player: nm(p) })}</p>
        <div className="cx-ts-price" style={{ justifyContent: 'center' }}>
          <CxPm disabled={w <= TRIAL_WEEKS.min} onClick={() => setW(w - 1)} aria-label="-">−</CxPm>
          <span className="cx-ts-val" data-weeks={w}>{weeksLabel(w)}</span>
          <CxPm disabled={w >= TRIAL_WEEKS.max} onClick={() => setW(w + 1)} aria-label="+">+</CxPm>
        </div>
      </div>
      <div className="cx-ts-buttons cx-dlg-foot">
        <button onClick={onClose}>{t('common.back')}</button>
        <button className="primary" data-trial-offer="1" onClick={async () => { if (await confirmTrial(p, w)) onClose(); }}>{t('cl.trial.offer')}</button>
      </div>
    </div>
  );
}

/** Samme dialog i det moderne tema */
export function TrialModal({ p, onClose }: { p: Player; onClose: () => void }) {
  const [w, setW] = useState(TRIAL_WEEKS.start);
  return (
    <Modal title={t('cl.trial.head')} onClose={onClose}>
      <div className="col">
        <p>{t('cl.trial.offerTo', { player: nm(p) })}</p>
        <div className="row" style={{ alignItems: 'center', gap: 8 }}>
          <button disabled={w <= TRIAL_WEEKS.min} onClick={() => setW(w - 1)}>−</button>
          <span>{weeksLabel(w)}</span>
          <button disabled={w >= TRIAL_WEEKS.max} onClick={() => setW(w + 1)}>+</button>
        </div>
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button onClick={onClose}>{t('common.back')}</button>
          <button className="primary" onClick={async () => { if (await confirmTrial(p, w)) onClose(); }}>{t('cl.trial.offer')}</button>
        </div>
      </div>
    </Modal>
  );
}
