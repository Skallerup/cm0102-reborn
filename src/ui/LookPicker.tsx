import { useState } from 'react';
import { t } from '../i18n';
import { Panel } from './components';
import { shot } from './shots';
import { getTheme, setTheme } from './theme';

/** Valg af udseende (moderne/klassisk) med et billede af hvert – ved nyt spil og ny draft-liga */
export function LookPicker({ onPick }: { onPick?: (l: 'modern' | 'classic') => void } = {}) {
  const [look, setLook] = useState<'modern' | 'classic'>(() => (getTheme() === 'retro' ? 'classic' : 'modern'));
  const pick = (l: 'modern' | 'classic') => { setLook(l); setTheme(l === 'classic' ? 'retro' : getTheme() === 'retro' ? 'club' : getTheme()); onPick?.(l); };
  return (
    <Panel title={t('start.look')}>
      <div className="db-choice">
        {(['modern', 'classic'] as const).map((l) => (
          <button key={l} className={`db-opt ${look === l ? 'on' : ''}`} onClick={() => pick(l)}>
            <img className="look-shot" src={shot(`${l}-squad`)} alt="" loading="lazy" />
            <b>{t(`land.looks.${l}`)}</b><span>{t(l === 'modern' ? 'start.lookModernHint' : 'start.lookClassicHint')}</span>
          </button>
        ))}
      </div>
      <div className="look-note">🔄 {t('start.lookNote')}</div>
    </Panel>
  );
}
