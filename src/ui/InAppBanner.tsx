// Advarsel, når spillet er åbnet i en apps indbyggede browser (Facebook, Instagram, Discord, Messenger, TikTok …
// eller Android WebView): gemte spil kan forsvinde, når appen lukkes, og spillet kan ikke installeres derfra.
// Fejlen "Error invoking postMessage: Java object is gone" i admin kom fra netop den slags browsere (ejerens ønske 2026-11-10).
import { useState } from 'react';
import { t } from '../i18n';

const UA = typeof navigator === 'undefined' ? '' : navigator.userAgent;
/** Android WebView har "; wv)" i user agent; iOS-apps sætter deres eget navn */
export const inAppBrowser = (): boolean => /; wv\)|FBAN|FBAV|FB_IAB|Instagram|Messenger|Discord|Line\/|Twitter|TikTok|musical_ly|Snapchat|MicroMessenger|GSA\//i.test(UA);
const KEY = 'cm0102.inapp.seen';
const seen = () => { try { return Number(localStorage.getItem(KEY) ?? 0) > Date.now() - 7 * 86_400_000; } catch { return false; } };

export function InAppBanner() {
  const [open, setOpen] = useState(() => inAppBrowser() && !seen());
  if (!open) return null;
  const close = () => { try { localStorage.setItem(KEY, String(Date.now())); } catch { /* privat vindue */ } setOpen(false); };
  const android = /Android/i.test(UA);
  // Android: intent-link åbner siden i Chrome; iOS har ingen tilsvarende vej – der står, hvor menuen er
  const chrome = `intent://${location.host}${location.pathname}#Intent;scheme=https;package=com.android.chrome;end`;
  return (
    <div className="consent inapp" role="dialog" aria-live="polite">
      <p><b>{t('inapp.title')}</b><br />{t(android ? 'inapp.textAndroid' : 'inapp.textIos')}</p>
      <div className="consent-btns">
        <button className="consent-no" onClick={close}>{t('inapp.ok')}</button>
        {android && <a className="consent-yes" href={chrome} onClick={close}>{t('inapp.openChrome')}</a>}
      </div>
    </div>
  );
}
