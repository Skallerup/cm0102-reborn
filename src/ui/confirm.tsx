// Spillets egen bekræftelses-popup (i stedet for browserens confirm()).
import { useEffect, useState } from 'react';
import { t } from '../i18n';
import { isRetro } from './theme';
import { gs, hasGame } from '../game/state';
import { titleColors, useClassicDialog } from './classic';

interface Req { text: string; ok?: string; danger?: boolean; head?: string; notice?: boolean; title?: string; resolve: (v: boolean) => void }
let push: ((r: Req) => void) | null = null;

/** Spørg brugeren og vent på svaret (Enter = OK, Esc = Annuller) */
export function askConfirm(text: string, opts?: { ok?: string; danger?: boolean; head?: string; notice?: boolean; title?: string }): Promise<boolean> {
  return new Promise((resolve) => {
    if (!push) { if (opts?.notice) { window.alert(text); resolve(true); } else resolve(window.confirm(text)); return; }
    push({ text, ...opts, resolve });
  });
}

/** En besked med kun Ok (klassisk: originalens helskærm, fx Team Selection) */
export function askNotice(text: string, opts?: { head?: string }): Promise<void> {
  return askConfirm(text, { ...opts, notice: true } ).then(() => undefined);
}

/** Monteres én gang øverst i appen */
export function ConfirmHost() {
  const [req, setReq] = useState<Req | null>(null);
  useEffect(() => { push = setReq; return () => { push = null; }; }, []);
  useClassicDialog(!!req);
  useEffect(() => {
    if (!req) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); answer(false); }
      else if (e.key === 'Enter') { e.preventDefault(); e.stopImmediatePropagation(); answer(true); }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  });
  if (!req) return null;
  const answer = (v: boolean) => { req.resolve(v); setReq(null); };
  // klassisk tema i et kørende spil: en hel skærm med teksten i midten og No/Yes i bunden (som CM 01/02)
  if (isRetro() && hasGame()) {
    const g = gs();
    const col = titleColors(g.userClub || undefined);
    return (
      <div className="cx-dlg cx-confirm" role="alertdialog" aria-modal="true">
        {req.title ? <div className="cx-title cx-title-plain"><h2>{req.title}</h2></div>
          : <div className="cx-title" style={{ background: col.bg, color: col.fg }}><h2>{g.clubs[g.userClub]?.name ?? g.manager?.name ?? ''}</h2></div>}
        <div className="cx-subtitle">{req.head ?? t('cl.mt.confirm')}</div>
        <div className="cx-dlg-body center"><p className="cx-ts-intro">{req.text}</p></div>
        {req.notice ? <div className="cx-ts-buttons cx-dlg-foot single"><button className="primary" autoFocus onClick={() => answer(true)}>{t('common.ok')}</button></div> : <div className="cx-ts-buttons cx-dlg-foot">
          <button onClick={() => answer(false)}>{t('common.no')}</button>
          <button className="primary" autoFocus onClick={() => answer(true)}>{req.ok ?? t('common.yes')}</button>
        </div>}
      </div>
    );
  }
  return (
    <div className="modal-bg confirm-bg" onClick={() => answer(false)}>
      <div className="modal confirm-box" role="alertdialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <p>{req.text}</p>
        <div className="row confirm-btns">
          {!req.notice && <button onClick={() => answer(false)}>{t('common.cancel')}</button>}
          <button className={req.danger ? 'danger primary' : 'primary'} autoFocus onClick={() => answer(true)}>{req.ok ?? t('common.ok')}</button>
        </div>
      </div>
    </div>
  );
}
