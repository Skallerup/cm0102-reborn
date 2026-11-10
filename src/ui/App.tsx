import { Suspense, lazy, useEffect, useState } from 'react';
import type { Lang } from '../game/types';
import { getLang, t } from '../i18n';
import { getLast } from '../game/last';
import { Landing } from './Landing';
import { ConsentBanner } from './ConsentBanner';
import { InAppBanner } from './InAppBanner';
import { trackPage } from '../analytics';

// Forsiden for nye besøgende tegnes med det samme fra en lille bundle; selve spillet (motoren, alle skærme, draft,
// admin og fællesskabet – ui/AppPage.tsx) hentes først, når der trykkes Spil, eller når der er noget at genoptage.
// Det holder forsidens Core Web Vitals (LCP/INP) nede – den er sidens vigtigste indgang fra søgemaskinerne.
const AppPage = lazy(() => import('./AppPage'));
const loadAppPage = () => import('./AppPage');

/** Kan forsiden vises uden spillet? Ikke ved links med parametre (?room, ?login, ?draft, ?community …), et spil der skal genoptages, eller efter tryk på Spil i denne fane */
function fastLanding(): boolean {
  if (location.search) return false;
  try { if (sessionStorage.getItem('cm0102.play') === '1') return false; } catch { /* ignorer */ }
  return !getLast();
}

export default function App() {
  const [fast, setFast] = useState(fastLanding);
  const [lang, setLangState] = useState<Lang>(getLang());
  // spillet hentes i baggrunden, mens forsiden læses, så Spil åbner med det samme
  useEffect(() => {
    if (!fast) return;
    const id = window.setTimeout(() => { void loadAppPage(); }, 2500);
    return () => window.clearTimeout(id);
  }, [fast]);
  useEffect(() => { if (fast) trackPage('landing', ''); }, [fast]);
  if (!fast) return <Suspense fallback={<div className="progress"><div>{t('start.resuming')}</div></div>}><AppPage /></Suspense>;
  const play = () => {
    try { sessionStorage.setItem('cm0102.play', '1'); } catch { /* ignorer */ }
    setFast(false);
    window.scrollTo(0, 0);
  };
  const draft = () => { history.replaceState(null, '', `${location.pathname}?draft=1`); setFast(false); window.scrollTo(0, 0); };
  return <><Landing key={lang} onPlay={play} onLang={setLangState} onDraft={draft} /><ConsentBanner /><InAppBanner /></>;
}
