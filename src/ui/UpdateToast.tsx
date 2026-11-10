// "Ny version klar": service workeren er i prompt-tilstand (vite.config.ts), så siden aldrig genindlæser af sig selv –
// før genindlæste autoUpdate siden lige efter åbning, første gang efter hver udgivelse (ejerens fejlmelding 2026-11-10).
// Den nye version tages i brug ved næste besøg; her kan man vælge at genindlæse med det samme.
import { useEffect, useState } from 'react';
import { t } from '../i18n';

let pending: ((reload?: boolean) => Promise<void>) | null = null;
/** main.tsx: en ny service worker venter – vis knappen */
export function swUpdateReady(update: (reload?: boolean) => Promise<void>) {
  pending = update;
  window.dispatchEvent(new Event('cm-sw-update'));
}

export function UpdateToast() {
  const [ready, setReady] = useState(() => !!pending);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const on = () => setReady(true);
    window.addEventListener('cm-sw-update', on);
    return () => window.removeEventListener('cm-sw-update', on);
  }, []);
  if (!ready || hidden || !pending) return null;
  return (
    <div className="acc-toast sw-toast" role="status">
      {t('update.ready')}{' '}
      <button className="small primary" onClick={() => { void pending?.(true); }}>{t('update.reload')}</button>{' '}
      <button className="small" onClick={() => setHidden(true)} aria-label={t('common.close')}>×</button>
    </div>
  );
}
