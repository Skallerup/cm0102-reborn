// Indlæsningsskærmen ved nyt spil i CM 01/02's stil: mørkeblå boks med titelbjælke, trinnets tekst og en segmenteret bjælke
// (createGame kører i en Web Worker og melder trinene – newgame.ts setNewGameProgress)
import { t } from '../i18n';

export interface NewGameProgress { step: string; frac: number }

const SEGMENTS = 24;

export function NewGameLoader({ label, progress }: { label: string; progress: NewGameProgress }) {
  const pct = Math.max(0, Math.min(100, Math.round(progress.frac * 100)));
  const lit = Math.round((pct / 100) * SEGMENTS);
  return (
    <div className="ng-loader" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={label}>
      <div className="ng-box">
        <div className="ng-title">{label}</div>
        <div className="ng-body">
          <div className="ng-step">{t(`ng.step.${progress.step}`)}</div>
          <div className="ng-bar">{Array.from({ length: SEGMENTS }, (_, i) => <span key={i} className={i < lit ? 'on' : ''} />)}</div>
          <div className="ng-pct">{pct}%</div>
        </div>
      </div>
    </div>
  );
}
