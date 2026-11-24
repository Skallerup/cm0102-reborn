// "Ny version klar": service workeren er i prompt-tilstand (vite.config.ts), så siden aldrig genindlæser af sig selv –
// før genindlæste autoUpdate siden lige efter åbning, første gang efter hver udgivelse (ejerens fejlmelding 2026-11-10).
// Den nye version tages i brug ved næste besøg; her kan man vælge at genindlæse med det samme.
import { useEffect, useState } from 'react';
import { t } from '../i18n';
import { allowSelfReload } from '../online/newGameTrace';

let pending: ((reload?: boolean) => Promise<void>) | null = null;
let stale = false;
/** en fil fra en ældre udgivelse findes ikke mere (fx dayWorker-scriptet i en fane åben over en deploy): vis "ny version – genindlæs" */
export function staleBuildNotice() {
  stale = true;
  window.dispatchEvent(new Event('cm-sw-update'));
}
/** main.tsx: en ny service worker venter – vis knappen */
export function swUpdateReady(update: (reload?: boolean) => Promise<void>) {
  pending = update;
  window.dispatchEvent(new Event('cm-sw-update'));
}

/** Genindlæs med den nye version. updateSW(true) genindlæser først, når den ventende service worker tager over – er den allerede
 *  aktiveret (fx i en anden fane) eller væk, sker der intet. Derfor: bed den ventende om at tage over, og genindlæs selv efter kort tid. */
function reloadNow() {
  allowSelfReload('updateToast', true); // spilleren trykkede selv – skrives i nyt-spil-sporet
  try { void pending?.(true); } catch { /* falder tilbage nedenfor */ }
  try {
    void navigator.serviceWorker?.getRegistration().then((r) => r?.waiting?.postMessage({ type: 'SKIP_WAITING' }));
  } catch { /* ingen service worker */ }
  setTimeout(() => location.reload(), 1500);
}

export function UpdateToast() {
  const [ready, setReady] = useState(() => !!pending || stale);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const on = () => setReady(true);
    window.addEventListener('cm-sw-update', on);
    return () => window.removeEventListener('cm-sw-update', on);
  }, []);
  if (!ready || hidden || (!pending && !stale)) return null;
  return (
    <div className="acc-toast sw-toast" role="status">
      {t('update.ready')}{' '}
      <button className="small primary" onClick={reloadNow}>{t('update.reload')}</button>{' '}
      <button className="small" onClick={() => setHidden(true)} aria-label={t('common.close')}>×</button>
    </div>
  );
}
