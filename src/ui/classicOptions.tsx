// Klassisk tema: "Game Options"-menuen i venstre kolonne og dialogen "Game Settings" (som i originalen).
import { useState } from 'react';
import { act } from '../game/actions';
import { notify } from '../game/state';
import type { GameState } from '../game/types';
import { CURRENCIES, getCurrency, getLang, setCurrency, setLang, t, type Currency } from '../i18n';
import { APP_VERSION } from './changelogData';
import { CxDrop, type DropItem } from './classic';
import { askConfirm } from './confirm';
import { useGame, useNav } from './core';
import { notifyEnabled, notifySupported, setNotify } from './notify';
import { getTheme, setTheme, type Theme } from './theme';

// ---------- små visningsindstillinger (kun i denne browser) ----------

const PREF = { bg: 'cm-bg-change', flash: 'cm-flash', pixel: 'cm-pixel', font: 'cm-futuristic' } as const;
const read = (k: string, def: boolean) => { try { const v = localStorage.getItem(k); return v === null ? def : v === 'on'; } catch { return def; } };
const write = (k: string, on: boolean) => { try { localStorage.setItem(k, on ? 'on' : 'off'); } catch { /* ignorér */ } };
/** Skifter baggrunden hver dag? (ellers samme billede hele karrieren) */
export const bgChanges = () => read(PREF.bg, true);
export const flashingText = () => read(PREF.flash, true);
/** Pixeleret udseende (tekst uden udglatning, baggrunde med synlige pixels) og den "futuristiske" skrift */
export type PixelLevel = 'off' | 'light' | 'strong';
export const pixelLook = (): PixelLevel => { try { const v = localStorage.getItem(PREF.pixel); return v === 'off' || v === 'strong' ? v : 'light'; } catch { return 'light'; } };
export const futuristicFont = () => read(PREF.font, true);
function applyFlash() {
  try {
    const el = document.documentElement;
    el.dataset.flash = flashingText() ? 'on' : 'off';
    el.dataset.pixel = pixelLook();
    el.dataset.cxfont = futuristicFont() ? 'futuristic' : 'standard';
    // skriften hentes først, når den bruges
    if (futuristicFont() && !document.getElementById('cx-font')) {
      const l = document.createElement('link');
      l.id = 'cx-font'; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=Saira+Semi+Condensed:wght@500;600;700;800&display=swap';
      document.head.appendChild(l);
    }
  } catch { /* ignorér */ }
}
applyFlash();

// ---------- Game Options-menuen ----------

export function GameOptionsMenu({ onSave, onQuit, online, allowed }: { onSave: () => void; onQuit: () => void; online: boolean; allowed: (k: string) => boolean }) {
  const { nav } = useNav();
  const [settings, setSettings] = useState(false);
  const go = (k: string) => () => nav({ name: k as never });
  const items: DropItem[] = [];
  if (!online) items.push({ key: 'save', label: t('cl.go.save'), onClick: onSave });
  const add = (k: string, label: string) => { if (allowed(k)) items.push({ key: k, label, onClick: go(k) }); };
  add('profile', t('cl.go.status'));
  items.push({ key: 'settings', label: t('cl.go.settings'), onClick: () => setSettings(true) });
  add('ranking', t('cl.go.hall'));
  add('awards', t('nav.awards'));
  add('help', t('nav.help'));
  add('community', t('nav.community'));
  add('support', t('cl.go.web'));
  add('options', t('cl.go.all'));
  items.push({ key: 'sep', sep: true }, { key: 'quit', label: t('cl.go.exit'), onClick: onQuit });
  return (
    <>
      <CxDrop className="cx-gameopt" fixed caret={false} label={t('cl.options')} items={items} btn={{ className: 'cx-sbtn cx-opt' }} />
      {settings && <GameSettings onClose={() => setSettings(false)} />}
    </>
  );
}

// ---------- Game Settings ----------

type Draft = { lang: 'da' | 'en'; cur: Currency; theme: Theme; bg: boolean; flash: boolean; pixel: PixelLevel; font: boolean; save: string; notif: boolean };

export function Seg<T extends string | boolean>({ value, opts, onChange }: { value: T; opts: [T, string][]; onChange: (v: T) => void }) {
  return <div className="cx-set-seg">{opts.map(([v, l]) => <button key={String(v)} className={v === value ? 'on' : ''} onClick={() => onChange(v)}>{l}</button>)}</div>;
}

function GameSettings({ onClose }: { onClose: () => void }) {
  const g = useGame()! as GameState;
  const initial: Draft = {
    lang: getLang() as 'da' | 'en', cur: getCurrency(), theme: getTheme(), bg: bgChanges(), flash: flashingText(), pixel: pixelLook(), font: futuristicFont(),
    save: g.options.autosaveMode ?? (g.options.autosave === false ? 'off' : 'changes'), notif: notifyEnabled(),
  };
  const [d, setD] = useState<Draft>(initial);
  const up = (x: Partial<Draft>) => setD({ ...d, ...x });
  const onOff = (v: boolean, on: (b: boolean) => void) => <Seg value={v} opts={[[true, t('cl.set.on')], [false, t('cl.set.off')]]} onChange={on} />;
  const ok = async () => {
    if (d.lang !== initial.lang) { setLang(d.lang); g.lang = d.lang; }
    if (d.cur !== initial.cur) setCurrency(d.cur);
    if (d.save !== initial.save) { g.options.autosaveMode = d.save as 'changes'; g.options.autosave = d.save !== 'off'; }
    write(PREF.bg, d.bg); write(PREF.flash, d.flash); try { localStorage.setItem(PREF.pixel, d.pixel); } catch { /* ignorér */ } write(PREF.font, d.font); applyFlash();
    if (d.notif !== initial.notif) await setNotify(d.notif);
    notify();
    if (d.theme !== initial.theme) setTheme(d.theme);
    onClose();
  };
  const row = (label: string, ctl: React.ReactNode) => <><span>{label}</span><div>{ctl}</div></>;
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal cx-settings" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head"><span>{t('cl.go.settings')}</span><button className="x" onClick={onClose}>×</button></div>
        <div className="modal-body">
          <div className="cx-set-top">
            <span>{t('cl.set.version', { v: APP_VERSION })}</span>
            <button className="cx-greybtn" onClick={() => setD({ ...initial, bg: true, flash: true, pixel: 'light', font: true })}>{t('cl.set.reset')}</button>
          </div>
          <div className="cx-set-grid">
            {row(t('opt.language'), <Seg value={d.lang} opts={[['en', 'English'], ['da', 'Dansk']]} onChange={(v) => up({ lang: v })} />)}
            {row(t('opt.currency'), <Seg value={d.cur} opts={CURRENCIES.map((c) => [c, t(`cur.${c}`)] as [Currency, string])} onChange={(v) => up({ cur: v })} />)}
            {row(t('cl.set.skin'), <Seg value={d.theme} opts={[['retro', t('cl.set.classic')], ['club', t('opt.theme.club')], ['dark', t('opt.theme.dark')], ['light', t('opt.theme.light')]]} onChange={(v) => up({ theme: v })} />)}
            {row(t('cl.set.fonts'), <Seg value={d.font} opts={[[true, t('cl.set.futuristic')], [false, t('cl.set.standard')]]} onChange={(v) => up({ font: v })} />)}
            {row(t('cl.set.pixel'), <Seg value={d.pixel} opts={[['off', t('cl.set.off')], ['light', t('cl.set.light')], ['strong', t('cl.set.strong')]]} onChange={(v) => up({ pixel: v })} />)}
            {row(t('cl.set.bg'), onOff(d.bg, (v) => up({ bg: v })))}
            {row(t('cl.set.flash'), onOff(d.flash, (v) => up({ flash: v })))}
            {row(t('opt.autosave'), <Seg value={d.save} opts={(['changes', 'daily', 'weekly', 'monthly', 'off'] as const).map((m) => [m, t(`cl.set.save.${m}`)] as [string, string])} onChange={(v) => up({ save: v })} />)}
            {notifySupported() && row(t('opt.notify'), onOff(d.notif, (v) => up({ notif: v })))}
          </div>
        </div>
        <div className="modal-foot cx-set-foot">
          <button onClick={onClose}>{t('common.cancel')}</button>
          <button className="primary" onClick={ok}>{t('common.ok')}</button>
        </div>
      </div>
    </div>
  );
}

// ---------- managerens menu (klik på navnet i sidebaren) ----------

/** Pop op-menuen bag managerens navn: klubbens skærme øverst, managerens egne nedenunder (som i CM 01/02) */
export function ManagerMenu({ onRetire, allowed }: { onRetire: () => void; allowed: (k: string) => boolean }) {
  const g = useGame()! as GameState;
  const { nav } = useNav();
  const club = g.clubs[g.userClub];
  const items: DropItem[] = [];
  const add = (k: string, label: string, tab?: string) => { if (allowed(k)) items.push({ key: `${k}${tab ?? ''}`, label, onClick: () => nav({ name: k as never, tab }) }); };
  if (club) {
    add('squad', t('cl.mm.squad', { club: club.short }));
    add('board', t('cl.mm.board'));
    items.push({ key: 'resign', label: t('cl.mm.resign'), onClick: async () => {
      if (await askConfirm(t('jobs.resignConfirm', { club: club.name }))) act({ t: 'resign' });
    } });
    items.push({ key: 'sep1', sep: true });
  }
  add('inbox', t('cl.mm.news'));
  add('transfers', t('cl.tr.title'), 'search');
  add('compare', t('cl.mm.compare'));
  add('profile', t('cl.mm.stats'));
  add('jobs', t('cl.mm.jobs'));
  add('transfers', t('nav.transfers'), 'deals');
  add('history', t('nav.history'));
  items.push({ key: 'sep2', sep: true }, { key: 'retire', label: t('cl.mm.retire'), onClick: onRetire });
  return <CxDrop className="cx-gameopt" fixed caret={false} label={g.manager.name} items={items} btn={{ className: 'cx-sbtn cx-mgr' }} />;
}
