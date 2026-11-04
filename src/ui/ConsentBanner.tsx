import { useEffect, useState } from 'react';
import { t } from '../i18n';
import { analyticsEnabled, getConsent, setConsent } from '../analytics';

/** Samtykke til statistik-cookies – vises, indtil den besøgende har valgt (og igen via "Cookie-indstillinger") */
export function ConsentBanner() {
  const [open, setOpen] = useState(() => analyticsEnabled() && getConsent() === null);
  useEffect(() => {
    const on = () => setOpen(analyticsEnabled() && getConsent() === null);
    window.addEventListener('cm-consent', on);
    return () => window.removeEventListener('cm-consent', on);
  }, []);
  if (!open) return null;
  return (
    <div className="consent" role="dialog" aria-live="polite">
      <p>{t('consent.text')}</p>
      <div className="consent-btns">
        <button className="consent-no" onClick={() => setConsent('denied')}>{t('consent.decline')}</button>
        <button className="consent-yes" onClick={() => setConsent('granted')}>{t('consent.accept')}</button>
      </div>
    </div>
  );
}

/** Link, der åbner samtykke-banneret igen */
export function ConsentLink() {
  if (!analyticsEnabled()) return null;
  return <a className="link" href="#" onClick={(e) => { e.preventDefault(); try { localStorage.removeItem('cm-consent'); } catch { /* ignorer */ } window.dispatchEvent(new Event('cm-consent')); }}>{t('consent.settings')}</a>;
}
