import { Suspense, useEffect, useState } from 'react';
import type { Lang } from '../game/types';
import { getLang, t } from '../i18n';
import { getLast } from '../game/last';
import { Landing } from './Landing';
import { ConsentBanner } from './ConsentBanner';
import { InAppBanner } from './InAppBanner';
import { UpdateToast } from './UpdateToast';
import { trackPage } from '../analytics';
import { lazyRetry } from './lazyLoad';
import { markPlay, playMarked } from './playFlag';

// Forsiden for nye besøgende tegnes med det samme fra en lille bundle; selve spillet (motoren, alle skærme, draft,
// admin og fællesskabet – ui/AppPage.tsx) hentes først, når der trykkes Spil, eller når der er noget at genoptage.
// Det holder forsidens Core Web Vitals (LCP/INP) nede – den er sidens vigtigste indgang fra søgemaskinerne.
// Fejler hentningen (ny udgivelse, indbygget browser), genindlæses én gang eller vises en fejlskærm – se lazyLoad.ts.
const AppPage = lazyRetry(() => import('./AppPage'));
const loadAppPage = () => import('./AppPage');

/** Kan forsiden vises uden spillet? Ikke ved links med parametre (?room, ?login, ?draft, ?community …), et spil der skal genoptages,
 *  efter tryk på Spil i denne fane eller i det installerede spil (playFlag.ts) */
function fastLanding(): boolean {
  if (location.search) return false;
  if (playMarked()) return false;
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
    markPlay();
    setFast(false);
    window.scrollTo(0, 0);
  };
  return <><Landing key={lang} onPlay={play} onLang={setLangState} /><ConsentBanner /><InAppBanner /><UpdateToast /></>;
}
