// Klassisk tema: "Game Options"-menuen i venstre kolonne og dialogen "Game Settings" (som i originalen).
import { AccountBar } from './Login';
import { useState } from 'react';
import { act } from '../game/actions';
import { regionOf } from '../game/leagues';
import { notify } from '../game/state';
import type { GameState, Lang } from '../game/types';
import { LANGS, CURRENCIES, compName, getCurrency, getLang, natName, setCurrency, setLang, t, type Currency } from '../i18n';
import { APP_VERSION } from './changelogData';
import { ChangelogModal, seenVersion } from './Changelog';
import { ProfileGate, WriteModal } from './Community';
import { Modal } from './components';
import { createPortal } from 'react-dom';
import { communityAvailable } from '../online/community';
import { getProfile } from '../online/rank';
import { gs } from '../game/state';
import { CxDrop, type DropItem } from './classic';
import { bgPack, setBgPack, setSundayLeague, sundayLeague } from './backgrounds';
import { askConfirm } from './confirm';
import { useGame, useNav } from './core';
import { notifyEnabled, notifySupported, setNotify } from './notify';
import { getTheme, setTheme, type Theme } from './theme';
import { matchSound, setMatchSound } from './matchSound';

// ---------- små visningsindstillinger (kun i denne browser) ----------

const PREF = { bg: 'cm-bg-change', flash: 'cm-flash', pixel: 'cm-pixel', font: 'cm-futuristic', fontKind: 'cm-font', logo: 'cm-title-logo', stadium: 'cm-stadium-bg', modernBg: 'cm-modern-bg' } as const;
const read = (k: string, def: boolean) => { try { const v = localStorage.getItem(k); return v === null ? def : v === 'on'; } catch { return def; } };
const write = (k: string, on: boolean) => { try { localStorage.setItem(k, on ? 'on' : 'off'); } catch { /* ignorér */ } };
/** Skifter baggrunden hver dag? (ellers samme billede hele karrieren) */
export const bgChanges = () => read(PREF.bg, true);
export const flashingText = () => read(PREF.flash, true);
/** Pixeleret udseende (tekst uden udglatning, baggrunde med synlige pixels) og den "futuristiske" skrift */
export type PixelLevel = 'off' | 'light' | 'strong';
export const pixelLook = (): PixelLevel => { try { const v = localStorage.getItem(PREF.pixel); return v === 'off' || v === 'strong' ? v : 'light'; } catch { return 'light'; } };
/** Skrifttypen i det klassiske tema (fællesskabets ønske: flere skrifter fra æraen) */
export const CX_FONTS = ['futuristic', 'standard', 'verdana', 'exo'] as const;
export type CxFont = (typeof CX_FONTS)[number];
const FONT_URL: Partial<Record<CxFont, string>> = {
  futuristic: 'https://fonts.googleapis.com/css2?family=Saira+Semi+Condensed:wght@500;600;700;800&display=swap',
  exo: 'https://fonts.googleapis.com/css2?family=Exo+2:wght@500;600;700;800&display=swap',
};
export const classicFont = (): CxFont => {
  try { const v = localStorage.getItem(PREF.fontKind); if ((CX_FONTS as readonly string[]).includes(v ?? '')) return v as CxFont; } catch { /* ignorér */ }
  return read(PREF.font, true) ? 'futuristic' : 'standard';
};
export const futuristicFont = () => classicFont() === 'futuristic';
/** Klubbens logo i titelbjælken */
export const titleLogo = () => read(PREF.logo, true);
/** Hjemmeholdets stadion som baggrund på kampdage (som [STADIUMS] i CM 01/02) */
export const stadiumBackgrounds = () => read(PREF.stadium, true);
export const setStadiumBackgrounds = (on: boolean) => write(PREF.stadium, on);
/** Moderne udseende: daglige baggrundsfotos bag indholdet */
export const modernBackgrounds = () => read(PREF.modernBg, true);
export const setModernBackgrounds = (on: boolean) => write(PREF.modernBg, on);
function applyFlash() {
  try {
    const el = document.documentElement;
    el.dataset.flash = flashingText() ? 'on' : 'off';
    el.dataset.pixel = pixelLook();
    const f = classicFont();
    el.dataset.cxfont = f;
    el.dataset.cxlogo = titleLogo() ? 'on' : 'off';
    // skriften hentes først, når den bruges
    const url = FONT_URL[f];
    if (url && !document.getElementById(`cx-font-${f}`)) {
      const l = document.createElement('link');
      l.id = `cx-font-${f}`; l.rel = 'stylesheet'; l.href = url;
      document.head.appendChild(l);
    }
  } catch { /* ignorér */ }
}
applyFlash();

// ---------- Game Options-menuen ----------

export function GameOptionsMenu({ onSave, onQuit, online, allowed }: { onSave: () => void; onQuit: () => void; online: boolean; allowed: (k: string) => boolean }) {
  const { nav, route } = useNav();
  const [settings, setSettings] = useState(false);
  const [show, setShow] = useState<'changelog' | 'bug' | 'suggest' | null>(null);
  const go = (k: string) => () => nav({ name: k as never });
  const items: DropItem[] = [];
  if (!online) items.push({ key: 'save', label: t('cl.go.save'), onClick: onSave });
  const add = (k: string, label: string) => { if (allowed(k)) items.push({ key: k, label, onClick: go(k) }); };
  // CM 01/02: Save Game · Manager Status · Game Settings · (Edition) Options · Hall of Fame · Game Credits · Web Sites · Restart · Exit
  items.push({ key: 'mstatus', label: t('cl.go.status'), onClick: () => nav({ name: 'mgrstatus' }) });
  items.push({ key: 'settings', label: t('cl.go.settings'), onClick: () => setSettings(true) });
  add('options', t('cl.go.all'));
  items.push({ key: 'leagues', label: t('cl.sl.title'), onClick: () => nav({ name: 'leagues' }) });
  add('ranking', t('cl.go.hall'));
  add('awards', t('nav.awards'));
  add('community', t('cl.go.credits'));
  add('support', t('cl.go.web'));
  add('help', t('nav.help'));
  // som i det moderne tema: hvad er nyt, fejlrapport og feedback (sendes til fællesskabets forslag)
  const fresh = seenVersion() !== APP_VERSION;
  items.push({ key: 'sep0', sep: true }, { key: 'news', label: `${t('cl.go.whatsNew', { v: APP_VERSION })}${fresh ? ' ★' : ''}`, onClick: () => { try { localStorage.setItem('cm0102.seenVersion', APP_VERSION); } catch { /* ignorer */ } setShow('changelog'); } });
  if (communityAvailable()) items.push({ key: 'bug', label: `🐞 ${t('cm.reportBug')}`, onClick: () => setShow('bug') }, { key: 'idea', label: `💡 ${t('cl.go.feedback')}`, onClick: () => setShow('suggest') });
  items.push({ key: 'sep', sep: true }, { key: 'restart', label: t('cl.go.restart'), onClick: onQuit }, { key: 'quit', label: t('cl.go.exit'), onClick: onQuit });
  return (
    <>
      <CxDrop className="cx-gameopt" fixed caret={false} label={t('cl.options')} items={items} btn={{ className: 'cx-sbtn cx-gopt' }} />
      {settings && <GameSettings onClose={() => setSettings(false)} />}
      {show === 'changelog' && createPortal(<ChangelogModal onClose={() => setShow(null)} />, document.body)}
      {(show === 'bug' || show === 'suggest') && createPortal(getProfile()
        ? <WriteModal kind={show} meta={show === 'bug' ? `v${APP_VERSION} · ${route.name} · ${gs().date} · ${window.innerWidth}×${window.innerHeight} · classic` : undefined} onClose={() => setShow(null)} />
        : <Modal title={t(show === 'bug' ? 'cm.reportBug' : 'cl.go.feedback')} onClose={() => setShow(null)}><ProfileGate onDone={() => setShow(null)} /></Modal>, document.body)}
    </>
  );
}

// ---------- Game Settings ----------

type Draft = { lang: Lang; cur: Currency; theme: Theme; bg: boolean; flash: boolean; pixel: PixelLevel; font: CxFont; logo: boolean; stadium: boolean; sound: boolean; sunday: boolean; save: string; notif: boolean };

export function Seg<T extends string | boolean>({ value, opts, onChange }: { value: T; opts: [T, string][]; onChange: (v: T) => void }) {
  return <div className="cx-set-seg">{opts.map(([v, l]) => <button key={String(v)} className={v === value ? 'on' : ''} onClick={() => onChange(v)}>{l}</button>)}</div>;
}

function GameSettings({ onClose }: { onClose: () => void }) {
  const g = useGame()! as GameState;
  const { nav } = useNav();
  const [pack, setPack] = useState(bgPack());
  const initial: Draft = {
    lang: getLang(), cur: getCurrency(), theme: getTheme(), bg: bgChanges(), flash: flashingText(), pixel: pixelLook(), font: classicFont(), logo: titleLogo(), stadium: stadiumBackgrounds(), sound: matchSound(), sunday: sundayLeague(),
    save: g.options.autosaveMode ?? (g.options.autosave === false ? 'off' : 'changes'), notif: notifyEnabled(),
  };
  const [d, setD] = useState<Draft>(initial);
  const up = (x: Partial<Draft>) => setD({ ...d, ...x });
  const onOff = (v: boolean, on: (b: boolean) => void) => <Seg value={v} opts={[[true, t('cl.set.on')], [false, t('cl.set.off')]]} onChange={on} />;
  const ok = async () => {
    if (d.lang !== initial.lang) { setLang(d.lang); g.lang = d.lang; }
    if (d.cur !== initial.cur) setCurrency(d.cur);
    if (d.save !== initial.save) { g.options.autosaveMode = d.save as 'changes'; g.options.autosave = d.save !== 'off'; }
    write(PREF.bg, d.bg); write(PREF.flash, d.flash); try { localStorage.setItem(PREF.pixel, d.pixel); } catch { /* ignorér */ } try { localStorage.setItem(PREF.fontKind, d.font); } catch { /* ignorér */ } write(PREF.logo, d.logo); write(PREF.stadium, d.stadium); setMatchSound(d.sound); setSundayLeague(d.sunday); applyFlash();
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
          <AccountBar />
          <div className="cx-set-top">
            <span>{t('cl.set.version', { v: APP_VERSION })}</span>
            <button className="cx-greybtn" onClick={() => setD({ ...initial, bg: true, flash: true, pixel: 'light', font: 'futuristic', logo: true, stadium: true, sound: true, sunday: false })}>{t('cl.set.reset')}</button>
          </div>
          <div className="cx-set-grid">
            {row(t('opt.language'), <Seg value={d.lang} opts={LANGS.map(([k, , full]) => [k, full] as [Lang, string])} onChange={(v) => up({ lang: v })} />)}
            {row(t('opt.currency'), <Seg value={d.cur} opts={CURRENCIES.map((c) => [c, t(`cur.${c}`)] as [Currency, string])} onChange={(v) => up({ cur: v })} />)}
            {row(t('cl.set.skin'), <Seg value={d.theme} opts={[['retro', t('cl.set.classic')], ['club', t('opt.theme.club')], ['dark', t('opt.theme.dark')], ['light', t('opt.theme.light')]]} onChange={(v) => up({ theme: v })} />)}
            {row(t('cl.set.fonts'), <Seg value={d.font} opts={CX_FONTS.map((f) => [f, t(`cl.set.font.${f}`)] as [CxFont, string])} onChange={(v) => up({ font: v })} />)}
            {row(t('cl.set.logo'), onOff(d.logo, (v) => up({ logo: v })))}
            {row(t('cl.set.stadium'), onOff(d.stadium, (v) => up({ stadium: v })))}
            {row(t('cl.set.sound'), onOff(d.sound, (v) => up({ sound: v })))}
            {row(t('cl.set.sunday'), onOff(d.sunday, (v) => up({ sunday: v })))}
            {row(t('cl.set.pixel'), <Seg value={d.pixel} opts={[['off', t('cl.set.off')], ['light', t('cl.set.light')], ['strong', t('cl.set.strong')]]} onChange={(v) => up({ pixel: v })} />)}
            {row(t('cl.set.bg'), onOff(d.bg, (v) => up({ bg: v })))}
            {row(t('hub.skins.setting'), <div className="cx-set-seg">
              <button className={!pack ? 'on' : ''} onClick={() => { setBgPack(null); setPack(null); }}>{t('hub.skins.default')}</button>
              {pack && <button className="on">{pack.title}</button>}
              <button onClick={() => { onClose(); nav({ name: 'community', tab: 'skins' }); }}>{t('hub.skins.more')}</button>
            </div>)}
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
export function ManagerMenu({ onRetire, allowed, onHoliday }: { onRetire: () => void; allowed: (k: string) => boolean; onHoliday?: (untilMatch: boolean) => void }) {
  const g = useGame()! as GameState;
  const { nav } = useNav();
  const club = g.clubs[g.userClub];
  const items: DropItem[] = [];
  const add = (k: string, label: string, tab?: string) => { if (allowed(k)) items.push({ key: `${k}${tab ?? ''}`, label, onClick: () => nav({ name: k as never, tab }) }); };
  if (club) {
    add('squad', t('cl.mm.squad', { club: club.short }));
    add('squad', t('cl.res.title', { club: club.short }), 'reserves');
    add('board', t('cl.mm.board'));
    items.push({ key: 'resign', label: t('cl.mm.resign'), onClick: async () => {
      if (await askConfirm(t('jobs.resignConfirm', { club: club.name }))) act({ t: 'resign' });
    } });
    items.push({ key: 'sep1', sep: true });
  }
  add('inbox', t('cl.mm.news'));
  add('transfers', t('cl.tr.title'), 'search');
  add('compare', t('cl.mm.compare'));
  // Manager Stats, Job Information og Transfers: landets skærme (som i originalen)
  const nat = (tab: string, label: string) => { if (allowed('nation')) items.push({ key: `nation${tab}`, label, onClick: () => nav({ name: 'nation', tab, state: { ntab: tab } }) }); };
  nat('managers', t('cl.mm.stats'));
  nat('jobs', t('cl.mm.jobs'));
  nat('transfers', t('nav.transfers'));
  add('history', t('nav.history'));
  if (club && onHoliday) items.push({ key: 'hol', label: t('cl.hol.go'), onClick: () => onHoliday(false) }, { key: 'hol2', label: t('cl.hol.match'), onClick: () => onHoliday(true) });
  items.push({ key: 'sep2', sep: true }, { key: 'retire', label: t('cl.mm.retire'), onClick: onRetire });
  return <CxDrop className="cx-gameopt" fixed caret={false} label={g.manager.name} items={items} btn={{ className: 'cx-sbtn cx-mgr' }} />;
}

// ---------- Find (sidebaren) ----------

/** "Find" i sidebaren: grøn menu med Nation · Klub · Stab · Spiller */
export function FindMenu() {
  const { nav } = useNav();
  // CM 01/02: Nation · Club · Non-Player · Player · — · Written History
  const items: DropItem[] = [
    ...(['nation', 'club', 'staff', 'player'] as const).map((k) => ({ key: k, label: t(`cl.fd.${k}`), onClick: () => nav({ name: 'find', tab: k, state: { ftab: k } }) })),
    { key: 'sep', sep: true as const },
    { key: 'wh', label: t('cl.fd.written'), onClick: () => nav({ name: 'awards' }) },
  ];
  return <CxDrop className="cx-gameopt" fixed caret={false} label={t('cl.find')} items={items} btn={{ className: 'cx-sbtn cx-findbtn' }} />;
}

// ---------- Competitions (sidebaren) ----------

/** Rækkefølgen i en nations undermenu: ligaerne efter række, så pokaler og playoff */
const compOrder = (c: { type: string; tier: number }) => (c.type === 'league' ? c.tier : c.type === 'cup' ? 50 + c.tier : 80);

/**
 * "Competitions" i sidebaren som i CM 01/02: World Cup ▸ · International ▸ · European ▸ og hver nation med spillede
 * turneringer ▸ (ligaer, pokaler og landsholdet).
 */
export function CompetitionsMenu() {
  const g = useGame()! as GameState;
  const { nav } = useNav();
  const intl = (state: Record<string, string>) => () => nav({ name: 'international', state });
  const past = new Set((g.intl?.past ?? []).map((p) => p.c));
  const items: DropItem[] = [];
  const awards = { key: 'awards', label: t('cl.cm.awards'), onClick: () => nav({ name: 'awards' }) };
  const fifa = { key: 'fifa', label: t('cl.cm.fifa'), onClick: intl({ itab: 'fifa' }) };
  const sep = (k: string) => ({ key: k, sep: true as const });
  const hist = (c: string) => intl({ itab: 'history', ihist: c });
  // CM 01/02: World Cup ▸ · International ▸ · Worldwide Club ▸ · European ▸ · nationerne ▸
  items.push({ key: 'wc', label: t('cl.cm.worldCup'), sub: [
    { key: 'wcT', label: t('cl.cm.fifaWc'), onClick: intl({ itab: 'tournament' }) },
    ...(['CAF', 'AFC', 'CONCACAF', 'UEFA', 'OFC', 'CONMEBOL'].map((r) => ({ key: `q${r}`, label: t('cl.cm.wcq', { r }), onClick: intl({ itab: 'qual' }) }))),
    sep('s1'), awards, fifa,
  ] });
  items.push({ key: 'intl', label: t('cl.cm.international'), sub: [
    { key: 'olympic', label: t('cl.cm.olympic'), disabled: !past.has('olympic'), onClick: hist('olympic') },
    { key: 'euro', label: t('cl.cm.euro'), onClick: hist('euro') },
    { key: 'euroq', label: t('cl.cm.euroq'), onClick: intl({ itab: 'qual' }) },
    { key: 'afcon', label: t('cl.cm.afcon'), onClick: hist('afcon') },
    { key: 'copa', label: t('intl.name.copa'), onClick: hist('copa') },
    { key: 'ofc', label: t('cl.cm.ofc'), disabled: !past.has('ofc'), onClick: hist('ofc') },
    { key: 'asian', label: t('cl.cm.asian'), onClick: hist('asian') },
    { key: 'confed', label: t('cl.cm.confed'), disabled: !past.has('confed'), onClick: hist('confed') },
    sep('s2'), awards, fifa,
  ] });
  // klubturneringer på verdensplan findes ikke i spillet (grå som i en database uden dem)
  items.push({ key: 'ww', label: t('cl.cm.worldwide'), sub: [
    { key: 'cwc', label: t('cl.cm.cwc'), disabled: true, onClick: () => {} },
    { key: 'ic', label: t('cl.cm.intercont'), disabled: true, onClick: () => {} },
    { key: 'ci', label: t('cl.cm.interam'), disabled: true, onClick: () => {} },
  ] });
  const euro = Object.values(g.comps).filter((c) => c.nation < 0);
  if (euro.length) items.push({ key: 'eu', label: t('cl.cm.european'), sub: [
    // CM 01/02: "UEFA Champions League", "UEFA Cup" – UEFA foran de europæiske turneringer
    ...euro.map((c) => { const n = compName(c.name) ?? c.name; return { key: c.id, label: /^UEFA\b/i.test(n) ? n : `UEFA ${n}`, onClick: () => nav({ name: 'competitions', id: c.id }) }; }),
    sep('s3'), awards,
    { key: 'coef', label: t('cl.cm.coeff'), onClick: () => nav({ name: 'coefficients' }) },
  ] });
  // nationerne: ens egen først, så i ligaernes rækkefølge
  const own = g.clubs[g.userClub]?.nation;
  const nations: number[] = [];
  for (const id of g.leagueOrder) { const l = g.leagues[id]; if (l && !l.hidden && g.comps[id] && !nations.includes(l.nation)) nations.push(l.nation); }
  nations.sort((a, b) => (a === own ? -1 : b === own ? 1 : 0));
  for (const n of nations) {
    const comps = Object.values(g.comps).filter((c) => c.nation === n && !g.leagues[c.id]?.hidden).sort((a, b) => compOrder(a) - compOrder(b));
    items.push({ key: `n${n}`, label: natName(g.nations[n]?.name), sub: [
      ...comps.map((c) => ({ key: c.id, label: compName(c.name), onClick: () => nav({ name: 'competitions', id: c.id }) })),
      { key: 'sep', sep: true as const },
      { key: 'aw', label: t('cl.cm.awards'), onClick: () => nav({ name: 'awards' }) },
      { key: 'nt', label: t('cl.cm.nationalTeam'), onClick: () => nav({ name: 'international', id: n }) },
    ] });
  }
  return <CxDrop className="cx-gameopt" fixed caret={false} label={t('nav.competitions')} items={items} btn={{ className: 'cx-sbtn' }} />;
}

// ---------- Nations & Clubs (sidebaren) ----------

const OCEANIA = new Set(['Australia', 'New Zealand', 'Fiji', 'Papua New Guinea', 'Solomon Islands', 'Tahiti', 'Vanuatu', 'New Caledonia', 'Samoa', 'Tonga', 'American Samoa', 'Cook Islands']);
export const REGIONS = ['africa', 'asia', 'europe', 'northAmerica', 'oceania', 'southAmerica'] as const;
export type UiRegion = (typeof REGIONS)[number];
export const regionOfNation = (name: string | undefined): UiRegion => (name && OCEANIA.has(name) ? 'oceania' : regionOf(name));

/**
 * "Nations & Clubs" i sidebaren som i CM 01/02: Nations ▸ · Under-21s ▸ · Major Clubs ▸ · League ▸ · Non-League ▸ · Other ▸,
 * hver med verdensdelene ▸ (Africa, Asia, Europe, North America, Oceania, South America) og derunder lande eller klubber.
 */
export function NationsClubsMenu() {
  const g = useGame()! as GameState;
  const { nav } = useNav();
  const clubs = Object.values(g.clubs);
  const nationsWithClubs = new Set(clubs.map((c) => c.nation));
  const byRegion = <T,>(list: T[], region: (x: T) => UiRegion, item: (x: T) => DropItem): DropItem[] =>
    REGIONS.map((r) => ({ r, xs: list.filter((x) => region(x) === r) })).filter((x) => x.xs.length).map(({ r, xs }) => ({ key: r, label: t(`cl.region.${r}`), sub: xs.map(item) }));
  const natSort = (a: number, b: number) => natName(g.nations[a]?.name).localeCompare(natName(g.nations[b]?.name), t('cl.locale'));
  const nations = [...nationsWithClubs].filter((n) => g.nations[n]).sort(natSort);
  const natRegion = (n: number) => regionOfNation(g.nations[n]?.name);
  const visibleLeague = (id: string) => g.leagues[id] && !g.leagues[id].hidden && g.comps[id];
  const leagueNations = nations.filter((n) => Object.keys(g.leagues).some((id) => g.leagues[id].nation === n && visibleLeague(id)));
  const hiddenClubs = clubs.filter((c) => g.leagues[c.league]?.hidden);
  const major = clubs.filter((c) => c.rep >= 75 && !g.leagues[c.league]?.hidden).sort((a, b) => b.rep - a.rep);
  const clubItem = (c: (typeof clubs)[number]): DropItem => ({ key: `c${c.id}`, label: c.name, onClick: () => nav({ name: 'club', id: c.id }) });
  const byNatThenClubs = (list: typeof clubs) => byRegion([...new Set(list.map((c) => c.nation))].sort(natSort), natRegion, (n) => ({
    key: `n${n}`, label: natName(g.nations[n]?.name), sub: list.filter((c) => c.nation === n).sort((a, b) => b.rep - a.rep).slice(0, 30).map(clubItem),
  }));
  // CM 01/02: verdensdelen åbner en hel skærm ("European Nations", "Major European Clubs" …)
  const regionItems = (tab: string, has: (r: UiRegion) => boolean): DropItem[] => REGIONS.filter(has).map((r) => ({ key: `${tab}${r}`, label: t(`cl.region.${r}`), onClick: () => nav({ name: 'nations', state: { nctab: tab, ncreg: r } }) }));
  const natHas = (r: UiRegion) => nations.some((n) => natRegion(n) === r);
  const items: DropItem[] = [
    { key: 'nat', label: t('cl.nc.nations'), sub: regionItems('nations', natHas) },
    { key: 'u21', label: t('cl.nc.u21'), sub: regionItems('u21', natHas) },
    { key: 'major', label: t('cl.nc.major'), sub: regionItems('major', (r) => major.some((c) => natRegion(c.nation) === r)) },
    { key: 'league', label: t('cl.nc.league'), sub: byRegion(leagueNations, natRegion, (n) => ({
      key: `l${n}`, label: natName(g.nations[n]?.name),
      onClick: () => nav({ name: 'nations', state: { nctab: 'league', ncnat: n } }),
    })) },
    { key: 'nonleague', label: t('cl.nc.nonLeague'), sub: hiddenClubs.length ? byNatThenClubs(hiddenClubs) : [{ key: 'none', label: t('common.none'), disabled: true, onClick: () => {} }] },
    { key: 'other', label: t('cl.nc.other'), sub: [
      ...regionItems('other', (r) => clubs.some((c) => natRegion(c.nation) === r && c.rep < 75 && !g.leagues[c.league]?.hidden)),
      { key: 'sepo', sep: true },
      { key: 'find', label: t('cl.find'), onClick: () => nav({ name: 'find', tab: 'club', state: { ftab: 'club' } }) },
      { key: 'own', label: g.clubs[g.userClub]?.name ?? '', disabled: !g.userClub, onClick: () => nav({ name: 'club', id: g.userClub }) },
    ] },
  ];
  return <CxDrop className="cx-gameopt" fixed caret={false} label={t('cl.nations')} items={items} btn={{ className: 'cx-sbtn' }} />;
}
