import { useEffect, useState } from 'react';
import { t } from '../i18n';
import { markInstallTip, runInstall, shouldShowInstallTip } from './installTip';

/** Lille besked nederst efter spillets første gem (hændelsen 'cm-saved' fra saveGame) – blokerer intet */
export function InstallTip() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => { if (shouldShowInstallTip()) { markInstallTip('shown'); setOpen(true); } };
    window.addEventListener('cm-saved', on);
    return () => window.removeEventListener('cm-saved', on);
  }, []);
  if (!open) return null;
  return (
    <div className="consent install-tip" role="status" aria-live="polite" data-testid="install-tip">
      <p>{t('tip.install.text')}</p>
      <div className="consent-btns">
        <button className="consent-no" onClick={() => setOpen(false)}>{t('tip.install.no')}</button>
        <button className="consent-yes" onClick={() => { markInstallTip('yes'); setOpen(false); runInstall(); }}>{t('tip.install.yes')}</button>
      </div>
    </div>
  );
}
