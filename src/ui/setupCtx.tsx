// Nyt spil i det klassiske udseende: fælles sidebjælke og forbindelsen mellem ClassicStart.tsx og spillets egne skærme (Shell/ClassicHead),
// når Select Team viser klubbens ægte trup (se inSetup() i game/state.ts).
import { createContext, useContext } from 'react';
import { t } from '../i18n';

export interface SetupApi {
  version: string;
  /** Take Control (knappen i klubskærmens titelbjælke) → Please Confirm */
  takeControl: () => void;
  /** Back fra klubbens første skærm → Select Team */
  leave: () => void;
  restart: () => void;
  hist: { back: boolean; fwd: boolean };
  onHist: (d: -1 | 1) => void;
}
export const SetupCtx = createContext<SetupApi | null>(null);
export const useSetup = () => useContext(SetupCtx);

/** Spillets egen sidebjælke (.cx-side: datoboksen, pilene og .cx-sbtn) med startforløbets knapper: Version, ←/→, Add Manager, Restart Game, Exit Game */
export function SetupSide({ version, canBack, canFwd, onBack, onFwd, onRestart, onExit, atMenu, busy }: {
  version: string; canBack: boolean; canFwd: boolean; onBack: () => void; onFwd: () => void; onRestart: () => void; onExit?: () => void; atMenu: boolean; busy: boolean;
}) {
  return (
    <aside className="cx-side cxs-side">
      <div className="cx-date"><b>{t('cxs.version')}</b><span>{version}</span></div>
      <div className="cx-arrows">
        <button aria-label={t('cxs.back')} disabled={busy || !canBack} onClick={onBack}>←</button>
        <button aria-label={t('cxs.next')} disabled={busy || !canFwd} onClick={onFwd}>→</button>
      </div>
      <button className="cx-sbtn" disabled>{t('cxs.addManager')}</button>
      <button className="cx-sbtn" disabled={atMenu || busy} onClick={onRestart}>{t('cxs.restart')}</button>
      <button className="cx-sbtn" disabled={!onExit || !atMenu || busy} onClick={onExit}>{t('cxs.exit')}</button>
    </aside>
  );
}
