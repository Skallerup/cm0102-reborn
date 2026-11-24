// Game Settings: den ene samlede indstillingsskærm (klassisk og moderne udseende). Alle indstillinger virker med det samme og gemmes
// på de samme steder som før (localStorage-nøglerne i classicOptions.tsx og g.options).
import { AccountBar, CloudStatus } from '../Login';
import { useState } from 'react';
import { exportSave, saveGame } from '../../game/save';
import { notify } from '../../game/state';
import { act } from '../../game/actions';
import { legacyExtended } from '../../game/rules';
import { session } from '../../online/client';
import type { Lang } from '../../game/types';
import { LANGS, CURRENCIES, getCurrency, getLang, natName, setCurrency, setLang, t, type Currency } from '../../i18n';
import { Panel } from '../components';
import { useGame, useNav } from '../core';
import { Head } from './common';
import { getTheme, isRetro, setTheme, type Theme } from '../theme';
import { notifyEnabled, notifySupported, setNotify } from '../notify';
import { CX_FONTS, GOAL_FLASH_MS, Seg, bgChanges, classicFont, flashingText, goalFlashMs, modernBackgrounds, pixelLook, setDisplayPref, setModernBackgrounds, setStadiumBackgrounds, showRealism, stadiumBackgrounds, titleLogo, type CxFont, type PixelLevel } from '../classicOptions';
import { bgPack, bgSet, setBgPack, setBgSet, type BgSet } from '../backgrounds';
import { REBORN_KEYS, rebornOn } from '../reborn';
import { APP_VERSION } from '../changelogData';
import { matchSound, setMatchSound } from '../matchSound';
import { addableNations } from '../../game/sim';
import { addNation } from './GameOptionsClassic';
import { SendToDev } from '../SendToDev';
import { GameInfoTable } from '../GameInfoPanel';
import { rankingAvailable } from '../../online/rank';
import { SupportBox } from '../SupportBox';

/** Én indstilling: navn, ⓘ (forklaringen vises under rækken ved tryk/klik – virker også på mobil) og kontrollen */
function Row({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="gs-row">
      <div className="gs-label">
        <span>{label}</span>
        {help && <button type="button" className={`gs-i ${open ? 'on' : ''}`} aria-label={t('gs.help')} aria-expanded={open} title={help} onClick={() => setOpen(!open)}>i</button>}
      </div>
      <div className="gs-ctl">{children}</div>
      {help && open && <div className="gs-help" role="note">{help}</div>}
    </div>
  );
}

const Group = ({ title, children }: { title: string; children: React.ReactNode }) => <Panel title={title} className="gs-panel"><div className="gs-list">{children}</div></Panel>;

export function Options() {
  const g = useGame()!;
  const retro = isRetro();
  const [msg, setMsg] = useState('');
  const [, setTick] = useState(0);
  const bump = () => { setTick((x) => x + 1); notify(); };
  const [pack, setPack] = useState(bgPack());
  const { nav } = useNav();
  const theme = getTheme();
  const onOff = (v: boolean, on: (b: boolean) => void) => <Seg value={v} opts={[[true, t('cl.set.on')], [false, t('cl.set.off')]]} onChange={(b) => { on(b); bump(); }} />;
  const notHost = !!g.humans && !session()?.isHost;
  const autosave = g.options.autosaveMode ?? (g.options.autosave === false ? 'off' : 'changes');
  const reset = () => {
    for (const [k, v] of [['bg', true], ['flash', true], ['goalFlash', 5500], ['pixel', 'light'], ['fontKind', 'futuristic'], ['logo', true], ['stadium', true]] as const) setDisplayPref(k, v);
    setMatchSound(true); setBgSet('original'); setModernBackgrounds(true); bump();
  };
  return (
    <div className="gs">
      <Head title={t('cl.go.settings')}>
        <span className="gs-ver">{t('cl.set.version', { v: APP_VERSION })}</span>
        <button className="small" onClick={reset}>{t('gs.reset')}</button>
      </Head>
      <div className="gs-cols">
        <Group title={t('gs.g.game')}>
          <Row label={t('opt.language')} help={t('gs.h.lang')}>
            <Seg value={getLang()} opts={LANGS.map(([k, , full]) => [k, full] as [Lang, string])} onChange={(v) => { setLang(v); g.lang = v; bump(); }} />
          </Row>
          <Row label={t('opt.currency')} help={t('gs.h.cur')}>
            <Seg value={getCurrency()} opts={CURRENCIES.map((c) => [c, t(`cur.${c}`).match(/\(([^)]+)\)/)?.[1] ?? c] as [Currency, string])} onChange={(v) => { setCurrency(v); bump(); }} />
          </Row>
          <Row label={t('opt.autosave')} help={`${t('gs.h.autosave')} ${t(`opt.save.${autosave}.hint`)}`}>
            <Seg value={autosave as string} opts={(['changes', 'daily', 'weekly', 'monthly', 'off'] as const).map((m) => [m, t(`cl.set.save.${m}`)] as [string, string])} onChange={(v) => { g.options.autosaveMode = v as 'changes'; g.options.autosave = v !== 'off'; bump(); }} />
          </Row>
          {notifySupported() && <Row label={t('opt.notify')} help={`${t('gs.h.notif')} ${t('opt.notify.hint')}`}>
            <Seg value={notifyEnabled()} opts={[[true, t('cl.set.on')], [false, t('cl.set.off')]]} onChange={async (v) => { await setNotify(v); bump(); }} />
          </Row>}
          <Row label={t('opt.speed')} help={t('gs.h.speed')}>
            <div className="gs-range"><small>{t('gs.speed.slow')}</small><input type="range" min={60} max={1500} step={20} value={1560 - g.options.matchSpeed} onChange={(e) => { g.options.matchSpeed = 1560 - Number(e.target.value); bump(); }} /><small>{t('gs.speed.fast')}</small></div>
          </Row>
          <Row label={t('opt.ai')} help={t('opt.ai.hint')}>{onOff(g.options.ai !== false, (v) => { g.options.ai = v; })}</Row>
          {!g.draft && <Row label={t('start.masking')} help={`${t('gs.h.masking')} ${t('start.maskingHint')}`}>{onOff(!!g.options.masking, (v) => { g.options.masking = v; })}</Row>}
          {g.humans && <Row label={t('opt.h2hTime')} help={t('gs.h.h2h')}>
            <select value={g.options.h2hHalfMinutes ?? 3} disabled={notHost} title={notHost ? t('opt.hostOnly') : undefined} onChange={(e) => { act({ t: 'setH2hTime', minutes: Number(e.target.value) }); bump(); }}>
              {[1, 2, 3, 4, 5, 7, 10].map((m) => <option key={m} value={m}>{t('opt.h2hMin', { n: m })}</option>)}
            </select>
          </Row>}
          {/* (docs/ALWAYS_ORIGINAL.md) reglerne og vinduerne er logik: kun i gamle udvidede spil – originale spil får dem fra spilstarten */}
          {!g.draft && legacyExtended(g) && <>
            <Row label={t('opt.rules')} help={`${t('opt.rules.hint')} ${t('mode.legacy')} ${t('mode.extendedHint')}`}>
              <Seg value={g.options.rules ?? 'modern'} opts={(['modern', 'classic'] as const).map((m) => [m, t(`opt.rules.${m}`)] as ['modern' | 'classic', string])} onChange={(v) => { if (!notHost) { act({ t: 'setRules', rules: v }); bump(); } }} />
            </Row>
            <Row label={t('opt.windows')} help={t('gs.h.windows')}>
              <Seg value={g.options.transferWindows ?? 'real'} opts={(['real', 'classic'] as const).map((m) => [m, t(`opt.windows.${m}`)] as ['real' | 'classic', string])} onChange={(v) => { if (!notHost) { act({ t: 'setWindows', mode: v }); bump(); } }} />
            </Row>
          </>}
        </Group>

        <Group title={t('gs.g.look')}>
          <Row label={t('cl.set.skin')} help={`${t('gs.h.theme')} ${theme === 'club' || theme === 'clubDark' ? t('opt.theme.clubHint') : theme === 'retro' ? t('opt.theme.retroHint') : ''}`}>
            <Seg value={theme} opts={[['retro', t('cl.set.classic')], ['club', t('opt.theme.club')], ['clubDark', t('opt.theme.clubDark')], ['dark', t('opt.theme.dark')], ['light', t('opt.theme.light')]] as [Theme, string][]} onChange={(v) => { setTheme(v); bump(); }} />
          </Row>
          {theme !== 'retro' && <Row label={t('opt.bgPhotos')} help={t('gs.h.modernBg')}>{onOff(modernBackgrounds(), setModernBackgrounds)}</Row>}
          <Row label={t('cl.set.stadium')} help={t('gs.h.stadium')}>{onOff(stadiumBackgrounds(), setStadiumBackgrounds)}</Row>
        </Group>

        {retro && <Group title={t('gs.g.classic')}>
          <Row label={t('cl.set.fonts')} help={t('gs.h.font')}>
            <Seg value={classicFont()} opts={CX_FONTS.map((f) => [f, t(`cl.set.font.${f}`)] as [CxFont, string])} onChange={(v) => { setDisplayPref('fontKind', v); bump(); }} />
          </Row>
          <Row label={t('cl.set.logo')} help={t('gs.h.logo')}>{onOff(titleLogo(), (v) => setDisplayPref('logo', v))}</Row>
          <Row label={t('cl.set.pixel')} help={t('gs.h.pixel')}>
            <Seg value={pixelLook()} opts={[['off', t('cl.set.off')], ['light', t('cl.set.light')], ['strong', t('cl.set.strong')]] as [PixelLevel, string][]} onChange={(v) => { setDisplayPref('pixel', v); bump(); }} />
          </Row>
          <Row label={t('cl.set.flash')} help={t('gs.h.flash')}>{onOff(flashingText(), (v) => setDisplayPref('flash', v))}</Row>
          <Row label={t('cl.set.goalFlash')} help={t('gs.h.goalFlash')}>
            <Seg value={goalFlashMs()} opts={GOAL_FLASH_MS.map((ms) => [ms, `${ms / 1000} s`.replace('.5', '½')] as [number, string])} onChange={(v) => { setDisplayPref('goalFlash', v); bump(); }} />
          </Row>
          <Row label={t('cl.set.bgset')} help={t('gs.h.bgset')}>
            <Seg value={bgSet()} opts={[['original', t('cl.set.bgset.original')], ['screens', t('cl.set.bgset.screens')], ['sunday', t('cl.set.bgset.sunday')]] as [BgSet, string][]} onChange={(v) => { setBgSet(v); bump(); }} />
          </Row>
          <Row label={t('cl.set.bg')} help={t('gs.h.bgDaily')}>{onOff(bgChanges(), (v) => setDisplayPref('bg', v))}</Row>
          <Row label={t('hub.skins.setting')} help={t('gs.h.pack')}>
            <div className="cx-set-seg">
              <button className={!pack ? 'on' : ''} onClick={() => { setBgPack(null); setPack(null); }}>{t('hub.skins.default')}</button>
              {pack && <button className="on">{pack.title}</button>}
              <button onClick={() => nav({ name: 'community', tab: 'skins' })}>{t('hub.skins.more')}</button>
            </div>
          </Row>
        </Group>}

        <Group title={t('gs.g.sound')}>
          <Row label={t('cl.set.sound')} help={t('gs.h.sound')}>{onOff(matchSound(), setMatchSound)}</Row>
        </Group>

        <Group title={t('gs.g.reborn')}>
          <div className="gs-note">{t('gs.reborn.note')}</div>
          <Row label={t('cl.set.realism')} help={t('gs.h.realism')}>{onOff(showRealism(), (v) => setDisplayPref('realism', v))}</Row>
          <Row label={t('cl.rb.modernSubs')} help={t('gs.h.modernSubs')}>{onOff(!!g.options.modernSubs, (v) => { g.options.modernSubs = v; })}</Row>
          <Row label={t('cl.rb.bgMatch')} help={t('gs.h.bgMatch')}>{onOff(!!g.options.bgMatch, (v) => { g.options.bgMatch = v; })}</Row>
          {REBORN_KEYS.map((k) => <Row key={k} label={t(`cl.rb.${k}`)} help={t(`gs.h.${k}`)}>{onOff(rebornOn(k), (v) => { g.options.reborn = { ...g.options.reborn, [k]: v }; })}</Row>)}
        </Group>

        {!g.draft && <PlayableNations />}

        <Group title={t('gs.g.account')}>
          <AccountBar />
          <CloudStatus />
          <div className="gs-btns">
            {!g.humans?.length && <button onClick={async () => { try { await saveGame({ cloud: true }); setMsg(t('top.saved')); } catch { /* fællesspil gemmes på serveren */ } }}>{t('nav.save')}</button>}
            <button onClick={() => exportSave()}>{t('opt.export')}</button>
          </div>
          <div className="muted">{t('opt.exportHint')}</div>
          <Row label={t('start.seed')} help={t('gs.h.seed')}><span>{g.seed}</span></Row>
          {msg && <div className="good">{msg}</div>}
          {rankingAvailable() && !g.humans?.length && <SendToDev />}
        </Group>

        <Group title={t('gs.g.about')}>
          <GameInfoTable route="options" />
          <SupportBox full />
          <p>{t('opt.aboutText')}</p>
          <p className="muted">{t('opt.dataCredit')}</p>
        </Group>
      </div>
    </div>
  );
}

/** Spilbare lande – flere kan tilføjes undervejs (kun eget spil) */
function PlayableNations() {
  const g = useGame()!;
  const [pick, setPick] = useState(-1);
  const mp = !!g.humans?.length;
  const name = (n: number) => natName(g.nations[n]?.name);
  const addable = mp ? [] : addableNations().sort((a, b) => name(a).localeCompare(name(b)));
  const active = g.activeNations.slice().sort((a, b) => name(a).localeCompare(name(b)));
  return (
    <Group title={t('lg.title')}>
      <div className="tags">{active.map((n) => <span key={n} className="tag">{name(n)}</span>)}</div>
      <div className="muted">{t(mp ? 'lg.mpOff' : 'lg.hint')}</div>
      {!mp && addable.length > 0 && (
        <label className="row">
          <select value={pick} onChange={(e) => setPick(Number(e.target.value))}>
            <option value={-1}>{t('lg.pick')}</option>
            {addable.map((n) => <option key={n} value={n}>{name(n)}</option>)}
          </select>
          <button disabled={pick < 0} onClick={async () => { await addNation(pick); setPick(-1); }}>{t('lg.add')}</button>
        </label>
      )}
    </Group>
  );
}
