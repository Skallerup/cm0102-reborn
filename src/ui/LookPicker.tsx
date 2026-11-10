import { useEffect, useState } from 'react';
import { t } from '../i18n';
import { Panel } from './components';
import { shot } from './shots';
import { getTheme, setTheme } from './theme';

/** Ingen gemt temavalg endnu? Så starter et nyt spil i det klassiske CM 01/02-udseende */
export function initialLook(): 'modern' | 'classic' {
  try { if (!localStorage.getItem('cm-theme')) return 'classic'; } catch { /* privat vindue */ }
  return getTheme() === 'retro' ? 'classic' : 'modern';
}

/**
 * Valg af udseende (moderne/klassisk) med billeder af hvert – ved nyt spil og ny draft-liga.
 * `value` gør vælgeren styret udefra (startsiden skifter til klassisk, når man vælger ægte CM 01/02).
 */
export function LookPicker({ onPick, value }: { onPick?: (l: 'modern' | 'classic') => void; value?: 'modern' | 'classic' } = {}) {
  const [own, setOwn] = useState<'modern' | 'classic'>(initialLook);
  const look = value ?? own;
  const pick = (l: 'modern' | 'classic') => { setOwn(l); setTheme(l === 'classic' ? 'retro' : getTheme() === 'retro' ? 'club' : getTheme()); onPick?.(l); };
  // standardvalget skrives med det samme, så spillet starter i det udseende, der står valgt
  useEffect(() => { pick(look); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  return (
    <Panel title={t('start.look')}>
      <div className="db-choice">
        {(['classic', 'modern'] as const).map((l) => (
          <div key={l} role="button" tabIndex={0} className={`db-opt ${look === l ? 'on' : ''}`} onClick={() => pick(l)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') pick(l); }}>
            <ShotPreview names={[`${l}-squad`, `${l}-player`, `${l}-table`]} labels={[t('nav.squad'), t('start.prevPlayer'), t('start.prevTable')]} />
            <b>{t(`land.looks.${l}`)}</b><span>{t(l === 'modern' ? 'start.lookModernHint' : 'start.lookClassicHint')}</span>
          </div>
        ))}
      </div>
      <div className="look-note">🔄 {t('start.lookNote')}</div>
    </Panel>
  );
}

/** Lille billedfremviser: faner med skærmene under billedet, tryk på billedet = stort billede med pile */
export function ShotPreview({ names, labels }: { names: string[]; labels: string[] }) {
  const [i, setI] = useState(0);
  const [big, setBig] = useState(false);
  const step = (d: number) => setI((i + d + names.length) % names.length);
  useEffect(() => {
    if (!big) return;
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setBig(false); else if (e.key === 'ArrowRight') step(1); else if (e.key === 'ArrowLeft') step(-1); };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  });
  return (
    <div className="shot-prev">
      {/* et tryk på billedet vælger kortet (som før); ⤢ viser det stort */}
      <div className="shot-main">
        <img className="look-shot" src={shot(names[i])} alt={labels[i]} loading="lazy" />
        <button type="button" className="shot-zoom" aria-label={t('start.prevZoom')} title={t('start.prevZoom')} onClick={(e) => { e.stopPropagation(); setBig(true); }}>⤢</button>
      </div>
      <div className="shot-tabs">{labels.map((l, k) => <button type="button" key={k} className={k === i ? 'on' : ''} onClick={(e) => { e.stopPropagation(); setI(k); }}>{l}</button>)}</div>
      {big && (
        <div className="shot-box" onClick={(e) => { e.stopPropagation(); setBig(false); }}>
          <img src={shot(names[i])} alt={labels[i]} onClick={(e) => { e.stopPropagation(); step(1); }} />
          <div className="shot-box-bar" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => step(-1)}>‹</button>
            <span>{labels[i]} · {i + 1}/{names.length}</span>
            <button type="button" onClick={() => step(1)}>›</button>
            <button type="button" onClick={() => setBig(false)}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}
