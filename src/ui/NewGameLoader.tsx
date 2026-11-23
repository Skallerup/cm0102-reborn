// Indlæsningsskærmen ved nyt spil i CM 01/02's stil: mørkeblå boks med titelbjælke, trinnets tekst og en segmenteret bjælke
// (createGame kører i en Web Worker og melder trinene – newgame.ts setNewGameProgress)
import { useEffect, useState } from 'react';
import { t } from '../i18n';

export interface NewGameProgress { step: string; frac: number }

const SEGMENTS = 24;

/** (23/11) true, når siden har været skjult, mens `active` (spillet oprettes): browserne sænker en skjult fanes prioritet – også dens Web Workers
 *  (målt i Chrome: trinene ~6× langsommere) – og fryser den helt (Chrome Android efter et stykke tid, iOS straks); oprettelsen fortsætter selv,
 *  når siden er synlig igen. Indlæsningen siger det (ng.bgHint). Nulstilles, når `active` bliver false. */
export function useHiddenWhile(active: boolean): boolean {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    if (!active) { setHidden(false); return; }
    if (typeof document === 'undefined') return;
    const vis = () => { if (document.visibilityState === 'hidden') setHidden(true); };
    vis();
    document.addEventListener('visibilitychange', vis);
    return () => document.removeEventListener('visibilitychange', vis);
  }, [active]);
  return hidden;
}

export function NewGameLoader({ label, progress }: { label: string; progress: NewGameProgress }) {
  const pct = Math.max(0, Math.min(100, Math.round(progress.frac * 100)));
  const lit = Math.round((pct / 100) * SEGMENTS);
  const bg = useHiddenWhile(true);
  return (
    <div className="ng-loader" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={label}>
      <div className="ng-box">
        <div className="ng-title">{label}</div>
        <div className="ng-body">
          <div className="ng-step">{t(`ng.step.${progress.step}`)}</div>
          <div className="ng-bar">{Array.from({ length: SEGMENTS }, (_, i) => <span key={i} className={i < lit ? 'on' : ''} />)}</div>
          <div className="ng-pct">{pct}%</div>
          {bg && <div className="ng-pct" data-ng-bg>{t('ng.bgHint')}</div>}
        </div>
      </div>
    </div>
  );
}
