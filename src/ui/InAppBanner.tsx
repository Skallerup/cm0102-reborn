// Advarsel, når spillet er åbnet i en apps indbyggede browser (Facebook, Instagram, Discord, Messenger, TikTok …
// eller Android WebView): gemte spil kan forsvinde, når appen lukkes, og spillet kan ikke installeres derfra.
// Fejlen "Error invoking postMessage: Java object is gone" i admin kom fra netop den slags browsere (ejerens ønske 2026-11-10).
import { useEffect, useState } from 'react';
import { t } from '../i18n';
import { dismissNewGameInterrupted, newGameInterrupted } from '../online/errors';

const UA = typeof navigator === 'undefined' ? '' : navigator.userAgent;
/** Android WebView har "; wv)" i user agent; iOS-apps sætter deres eget navn */
export const inAppBrowser = (): boolean => /; wv\)|FBAN|FBAV|FB_IAB|Instagram|Messenger|Discord|Line\/|Twitter|TikTok|musical_ly|Snapchat|MicroMessenger|GSA\//i.test(UA);
const KEY = 'cm0102.inapp.seen';
const seen = () => { try { return Number(localStorage.getItem(KEY) ?? 0) > Date.now() - 7 * 86_400_000; } catch { return false; } };

/** "Installér som app" i en indbygget browser: installering er umulig dér – vis vejledningen (og knappen til den rigtige browser) igen */
export function showInAppHelp() { window.dispatchEvent(new Event('cm-inapp-help')); }

export function InAppBanner() {
  // (21/11) siden blev lukket under oprettelsen af et nyt spil (for lidt hukommelse – Facebooks browser på iPhone): sig det, i stedet for bare forsiden
  const [killed] = useState(() => newGameInterrupted());
  const [open, setOpen] = useState(() => killed || (inAppBrowser() && !seen()));
  useEffect(() => {
    const on = () => setOpen(true);
    window.addEventListener('cm-inapp-help', on);
    return () => window.removeEventListener('cm-inapp-help', on);
  }, []);
  if (!open) return null;
  const close = () => { dismissNewGameInterrupted(); try { localStorage.setItem(KEY, String(Date.now())); } catch { /* privat vindue */ } setOpen(false); };
  const android = /Android/i.test(UA);
  // Android: intent-link åbner siden i Chrome; iOS 17+: x-safari-https:// åbner den i Safari (ældre iOS: vejledningen om menuen)
  const chrome = `intent://${location.host}${location.pathname}#Intent;scheme=https;package=com.android.chrome;end`;
  const safari = `x-safari-https://${location.host}${location.pathname}`;
  return (
    <div className="consent inapp" role="dialog" aria-live="polite">
      {killed ? <p data-ng-killed><b>{t('inapp.killedTitle')}</b><br />{t('inapp.killedText')}</p>
        : <p><b>{t('inapp.title')}</b><br />{t(android ? 'inapp.textAndroid' : 'inapp.textIos')}</p>}
      <div className="consent-btns">
        <button className="consent-no" onClick={close}>{t('inapp.ok')}</button>
        {android
          ? <a className="consent-yes" href={chrome} onClick={close}>{t('inapp.openChrome')}</a>
          : /iPhone|iPad|iPod/i.test(UA) && <a className="consent-yes" href={safari} onClick={close}>{t('inapp.openSafari')}</a>}
      </div>
    </div>
  );
}
