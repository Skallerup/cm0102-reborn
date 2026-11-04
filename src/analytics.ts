// Google Analytics 4 – indlæses først, når den besøgende har sagt ja til statistik-cookies (GDPR).
// Kun på cm0102reborn.com (ikke lokalt eller på kopierne); VITE_GA_ID kan overstyre ved build.
const GA_ID = (import.meta.env.VITE_GA_ID as string | undefined)?.trim()
  || (typeof location !== 'undefined' && location.hostname === 'cm0102reborn.com' ? 'G-J9R8HSHLBE' : '');
const KEY = 'cm-consent';

type Consent = 'granted' | 'denied';
type Gtag = (...args: unknown[]) => void;
const w = window as unknown as { dataLayer?: unknown[]; gtag?: Gtag };

let loaded = false;
let current = '';

export const analyticsEnabled = () => !!GA_ID;

export function getConsent(): Consent | null {
  try { const v = localStorage.getItem(KEY); return v === 'granted' || v === 'denied' ? v : null; } catch { return null; }
}

export function setConsent(c: Consent) {
  try { localStorage.setItem(KEY, c); } catch { /* ingen storage */ }
  if (c === 'granted') { load(); if (current) pageView(current); }
  else if (loaded) {
    w.gtag?.('consent', 'update', { analytics_storage: 'denied' });
    // fjern GA's cookies, når samtykket trækkes tilbage
    for (const name of document.cookie.split(';').map((s) => s.split('=')[0].trim()).filter((n) => n.startsWith('_ga'))) {
      document.cookie = `${name}=; Max-Age=0; path=/; domain=.${location.hostname}`;
      document.cookie = `${name}=; Max-Age=0; path=/`;
    }
  }
  window.dispatchEvent(new Event('cm-consent'));
}

function load() {
  if (loaded || !GA_ID) return;
  loaded = true;
  w.dataLayer = w.dataLayer || [];
  // gtag skal skubbe selve arguments-objektet
  // eslint-disable-next-line prefer-rest-params
  w.gtag = function gtag() { w.dataLayer!.push(arguments); };
  w.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  w.gtag('js', new Date());
  w.gtag('config', GA_ID, { send_page_view: false, anonymize_ip: true });
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
}

if (GA_ID && getConsent() === 'granted') load();

function pageView(page: string) {
  w.gtag?.('event', 'page_view', { page_title: document.title, page_location: location.origin + location.pathname + location.search, page_path: `/${page}` });
}

/** En "side" i appen er skiftet (forside, draft, fællesskab, spil …): sæt canonical og send et sidevisning */
export function trackPage(page: string, canonical?: string) {
  if (canonical !== undefined) {
    const link = document.querySelector<HTMLLinkElement>('link[rel=canonical]');
    if (link) link.href = `https://cm0102reborn.com/${canonical}`;
  }
  if (page === current) return;
  current = page;
  if (loaded) pageView(page);
}

/** Hændelse til GA (fx start_game) – kun hvis der er givet samtykke */
export function track(event: string, params?: Record<string, string | number | boolean | undefined>) {
  if (loaded) w.gtag?.('event', event, params ?? {});
}
