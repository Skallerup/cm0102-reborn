// Diskret forslag om at installere spillet som app, efter første gem (CM Reborns eget – ikke en del af originalens skærme).
// Vises højst én gang pr. enhed; "Ikke nu" (eller ignoreret) tidligst igen efter 30 dage. Ingen motor-imports (forsidens bundle).
import { t } from '../i18n';
import { askNotice } from './confirm';
import { inAppBrowser, showInAppHelp } from './InAppBanner';
import { canInstall, installApp } from './notify';

const KEY = 'cm0102.installtip';
export const INSTALL_TIP_DAYS = 30;
type Rec = { a: 'shown' | 'yes'; t: number };

const read = (): Rec | null => { try { const r = JSON.parse(localStorage.getItem(KEY) ?? 'null'); return r && typeof r.t === 'number' ? r : null; } catch { return null; } };
export const markInstallTip = (a: Rec['a']): void => { try { localStorage.setItem(KEY, JSON.stringify({ a, t: Date.now() })); } catch { /* privat vindue */ } };

export const isStandalone = (): boolean => { try { return window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true; } catch { return false; } };
export const isIos = (): boolean => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
/** Kan spillet installeres (eller vejledes installeret) herfra? */
export const installPossible = (): boolean => !isStandalone() && (canInstall() || isIos() || inAppBrowser());

/** Skal forslaget vises nu? (ikke installeret, installation mulig, ikke vist før / "ikke nu" for over 30 dage siden) */
export function shouldShowInstallTip(now = Date.now()): boolean {
  if (!installPossible()) return false;
  const r = read();
  return !r || (r.a === 'shown' && now - r.t > INSTALL_TIP_DAYS * 86_400_000);
}

/** Samme handling som Game Options → Installér som app (inkl. iOS-vejledningen og in-app-browser-hjælpen) */
export function runInstall(): void {
  if (inAppBrowser()) showInAppHelp();
  else if (canInstall()) void installApp();
  else void askNotice(t('cl.go.installIos'), { head: t('cl.go.install') });
}
