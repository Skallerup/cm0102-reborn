import { useState } from 'react';
import { exportSave, saveGame } from '../../game/save';
import { notify } from '../../game/state';
import { CURRENCIES, getCurrency, getLang, setCurrency, setLang, t, type Currency } from '../../i18n';
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
            <label className="row">{t('opt.currency')}
              <select value={getCurrency()} onChange={(e) => { setCurrency(e.target.value as Currency); notify(); }}>
                {CURRENCIES.map((c) => <option key={c} value={c}>{t(`cur.${c}`)}</option>)}
              </select>
            </label>
            <label className="row">{t('opt.autosave')}
              <select value={g.options.autosaveMode ?? (g.options.autosave === false ? 'off' : 'changes')} onChange={(e) => { g.options.autosaveMode = e.target.value as 'changes'; g.options.autosave = e.target.value !== 'off'; notify(); }}>
                {(['changes', 'daily', 'weekly', 'monthly', 'off'] as const).map((m) => <option key={m} value={m}>{t(`opt.save.${m}`)}</option>)}
              </select>
            </label>
            <div className="muted">{t(`opt.save.${g.options.autosaveMode ?? 'changes'}.hint`)}</div>
            <label className="row">{t('opt.news')}
              <select value={g.options.newsScope ?? 'nation'} onChange={(e) => { g.options.newsScope = e.target.value as 'nation'; notify(); }}>
                {(['league', 'nation', 'world'] as const).map((m) => <option key={m} value={m}>{t(`opt.news.${m}`)}</option>)}
              </select>
            </label>
            <label className="row">{t('opt.transferNews')}
              <select value={g.options.transferNews ?? 'big'} onChange={(e) => { g.options.transferNews = e.target.value as 'big'; notify(); }}>
                {(['own', 'big', 'all'] as const).map((m) => <option key={m} value={m}>{t(`opt.transferNews.${m}`)}</option>)}
              </select>
            </label>
            <label className="row"><input type="checkbox" checked={g.options.ai !== false} onChange={(e) => { g.options.ai = e.target.checked; notify(); }} />{t('opt.ai')}</label>
            <div className="muted">{t('opt.ai.hint')}</div>
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
