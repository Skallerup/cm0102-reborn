import { useState } from 'react';
import { exportSave, saveGame } from '../../game/save';
import { notify } from '../../game/state';
import { getLang, setLang, t } from '../../i18n';
import { Panel } from '../components';
import { useGame } from '../core';
import { Head } from './common';

export function Options() {
  const g = useGame()!;
  const [msg, setMsg] = useState('');
  return (
    <div>
      <Head title={t('nav.options')} />
      <div className="cols">
        <Panel title={t('opt.general')}>
          <div className="col">
            <label className="row">{t('opt.language')}
              <select value={getLang()} onChange={(e) => { setLang(e.target.value as 'da' | 'en'); g.lang = e.target.value as 'da' | 'en'; notify(); }}>
                <option value="da">Dansk</option><option value="en">English</option>
              </select>
            </label>
            <label className="row"><input type="checkbox" checked={g.options.autosave} onChange={(e) => { g.options.autosave = e.target.checked; notify(); }} />{t('opt.autosave')}</label>
            <label className="row"><input type="checkbox" checked={g.options.masking} onChange={(e) => { g.options.masking = e.target.checked; notify(); }} />{t('start.masking')}</label>
            <label className="col">{t('opt.speed')}
              <input type="range" min={60} max={1500} step={20} value={1560 - g.options.matchSpeed} onChange={(e) => { g.options.matchSpeed = 1560 - Number(e.target.value); notify(); }} />
            </label>
          </div>
        </Panel>
        <Panel title={t('opt.saves')}>
          <div className="col">
            <button onClick={async () => { await saveGame(); setMsg(t('top.saved')); }}>{t('nav.save')}</button>
            <button onClick={() => exportSave()}>{t('opt.export')}</button>
            <div className="muted">{t('opt.exportHint')}</div>
            <div className="kv"><span>{t('start.seed')}</span><span>{g.seed}</span></div>
            {msg && <div className="good">{msg}</div>}
          </div>
        </Panel>
        <Panel title={t('opt.about')}>
          <p>{t('opt.aboutText')}</p>
          <p className="muted">{t('opt.dataCredit')}</p>
        </Panel>
      </div>
    </div>
  );
}
