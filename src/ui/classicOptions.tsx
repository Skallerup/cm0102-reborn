// Klassisk tema: "Game Options"-menuen i venstre kolonne og dialogen "Game Settings" (som i originalen).
import { useEffect, useState } from 'react';
import type { GameState } from '../game/types';
import { rebornOn } from './reborn';
import { onInstallChange } from './notify';
import { act } from '../game/actions';
import { regionOf } from '../game/leagues';
import { compName, natName, t } from '../i18n';
import { APP_VERSION } from './changelogData';
import { ChangelogModal, markChangelogSeen, useChangelogFresh } from './Changelog';
import { ProfileGate, WriteModal } from './Community';
import { GameInfoTable } from './GameInfoPanel';
import { gameInfoMeta } from './gameInfo';
import { Modal } from './components';
import { CreditsTab } from './CommunityHub';
import { SupportBox } from './SupportBox';
import { createPortal } from 'react-dom';
import { communityAvailable } from '../online/community';
import { getProfile } from '../online/rank';
import { CxDrop, type DropItem } from './classic';
import { askConfirm, askNotice } from './confirm';
import { LoginModal } from './Login';
import { getAccount } from '../online/account';
import { saveGame } from '../game/save';
import { useGame, useNav } from './core';
import { installPossible, runInstall } from './installTip';
import { authentic } from '../game/rules';
import { bTeamOf, hasReserveTeam } from '../game/cmBTeam';
import { cmAwardNations, cmAwOn } from '../game/cmAwards';

// ---------- små visningsindstillinger (kun i denne browser) ----------

const PREF = { bg: 'cm-bg-change', flash: 'cm-flash', pixel: 'cm-pixel', font: 'cm-futuristic', fontKind: 'cm-font', logo: 'cm-title-logo', stadium: 'cm-stadium-bg', modernBg: 'cm-modern-bg', goalFlash: 'cm-goal-flash', realism: 'cm-realism' } as const;
const read = (k: string, def: boolean) => { try { const v = localStorage.getItem(k); return v === null ? def : v === 'on'; } catch { return def; } };
const write = (k: string, on: boolean) => { try { localStorage.setItem(k, on ? 'on' : 'off'); } catch { /* ignorér */ } };
/** Skifter baggrunden hver dag? (ellers samme billede hele karrieren) */
export const bgChanges = () => read(PREF.bg, true);
export const flashingText = () => read(PREF.flash, true);
/** Kolonnen "Realism" i spillersøgningen (og dens filter): findes ikke i originalen – slået fra i ægte CM 01/02, til i det udvidede spil;
 *  kan slås til under Spilindstillinger (ejerens ønske 2026-11-13) */
export const showRealism = () => read(PREF.realism, !authentic());
/** Hvor længe et mål blinker på kampskærmen (ms) – Spilindstillinger (brugerønske 2026-11-10) */
export const GOAL_FLASH_MS = [2000, 5500, 8000, 12000] as const;
export const goalFlashMs = (): number => { try { const v = Number(localStorage.getItem(PREF.goalFlash)); return (GOAL_FLASH_MS as readonly number[]).includes(v) ? v : 5500; } catch { return 5500; } };
/** Pixeleret udseende (tekst uden udglatning, baggrunde med synlige pixels) og den "futuristiske" skrift */
export type PixelLevel = 'off' | 'light' | 'strong';
export const pixelLook = (): PixelLevel => { try { const v = localStorage.getItem(PREF.pixel); return v === 'off' || v === 'strong' ? v : 'light'; } catch { return 'light'; } };
/** Skrifttypen i det klassiske tema (fællesskabets ønske: flere skrifter fra æraen) */
export const CX_FONTS = ['futuristic', 'original', 'standard', 'verdana', 'exo'] as const;
export type CxFont = (typeof CX_FONTS)[number];
const FONT_URL: Partial<Record<CxFont, string>> = {
  futuristic: 'https://fonts.googleapis.com/css2?family=Saira+Semi+Condensed:wght@500;600;700;800&display=swap',
  exo: 'https://fonts.googleapis.com/css2?family=Exo+2:wght@500;600;700;800&display=swap',
  // originalens Eras Demi/Handel Gothic, hvis de findes på maskinen – ellers den futuristiske som reserve
  original: 'https://fonts.googleapis.com/css2?family=Saira+Semi+Condensed:wght@500;600;700;800&display=swap',
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
  const [show, setShow] = useState<'changelog' | 'feedback' | 'info' | 'support' | 'credits' | null>(null);
  const fresh = useChangelogFresh();
  const go = (k: string) => () => nav({ name: k as never });
  const [, setInst] = useState(0);
  useEffect(() => onInstallChange(() => setInst((x) => x + 1)), []);
  const [login, setLogin] = useState(false);
  const cloudSave = async () => {
    try { await saveGame({ cloud: true }); await askNotice(t('cl.go.cloudSaved'), { head: t('cl.go.cloud') }); }
    catch (e) { if ((e as Error).name === 'StorageFullError') return; await askNotice(t('cl.go.cloudFail', { err: String((e as Error).message ?? e) }), { head: t('cl.go.cloud') }); }
  };
  const items: DropItem[] = [];
  if (!online) items.push({ key: 'save', label: t('cl.go.save'), onClick: onSave });
  const add = (k: string, label: string) => { if (allowed(k)) items.push({ key: k, label, onClick: go(k) }); };
  // CM 01/02: Save Game · Manager Status · Game Settings · (Edition) Options · Hall of Fame · Game Credits · Web Sites · Restart · Exit
  items.push({ key: 'mstatus', label: t('cl.go.status'), onClick: () => nav({ name: 'mgrstatus' }) });
  items.push({ key: 'settings', label: t('cl.go.settings'), onClick: () => nav({ name: 'options' }) });
  items.push({ key: 'leagues', label: t('cl.sl.title'), onClick: () => nav({ name: 'leagues' }) });
  items.push({ key: 'info', label: t('info.title'), onClick: () => setShow('info') });
  add('ranking', t('cl.go.hall'));
  // ægte CM 01/02 har hverken Awards eller Help i Game Options (Awards ligger under Manager Stats/History)
  if (rebornOn('menus')) add('awards', t('nav.awards'));
  if (allowed('community')) items.push({ key: 'community', label: t('cl.go.credits'), onClick: () => setShow('credits') });
  if (rebornOn('menus')) add('help', t('nav.help'));
  // som i det moderne tema: hvad er nyt, fejlrapport og feedback (sendes til fællesskabets forslag)
  items.push({ key: 'sep0', sep: true }, { key: 'news', label: <>{t('cl.go.whatsNew', { v: APP_VERSION })}{fresh && <i className="cx-dot" data-testid="cx-news-dot" />}</>, onClick: () => { markChangelogSeen(); setShow('changelog'); } });
  if (communityAvailable()) items.push({ key: 'feedback', label: t('cm.feedbackBug'), onClick: () => setShow('feedback') }); // feedback og fejl i én formular
  // CM Reborns egne punkter (ikke i originalen): installér som app, gem i skyen (ikke i fællesspil – det gemmes allerede online)
  // i en indbygget browser (Facebook, Instagram …) kan spillet ikke installeres: knappen viser vejledningen med "Åbn i Safari/Chrome"
  const canInst = installPossible();
  items.push({ key: 'sepR', sep: true });
  items.push({ key: 'support', label: <>♥ {t('sb.menu')}</>, onClick: () => setShow('support') });
  if (canInst) items.push({ key: 'install', label: <span title={t('cl.go.installWhy')}>{t('cl.go.install')}</span>, onClick: runInstall });
  if (!online) items.push({ key: 'cloud', label: t('cl.go.cloud'), onClick: () => { if (getAccount()) void cloudSave(); else setLogin(true); } });
  items.push({ key: 'sep', sep: true }, { key: 'restart', label: t('cl.go.restart'), onClick: onQuit }, { key: 'quit', label: t('cl.go.exit'), onClick: onQuit });
  return (
    <>
      <CxDrop className="cx-gameopt" fixed caret={false} label={<>{t('cl.options')}{fresh && <i className="cx-dot" data-testid="cx-opt-dot" />}</>} items={items} btn={{ className: 'cx-sbtn cx-gopt' }} />
      {login && createPortal(<LoginModal onClose={() => setLogin(false)} onDone={() => { setLogin(false); void cloudSave(); }} />, document.body)}
      {show === 'changelog' && createPortal(<ChangelogModal onClose={() => setShow(null)} />, document.body)}
      {show === 'support' && createPortal(<Modal title={t('sb.menu')} onClose={() => setShow(null)}><SupportBox full /></Modal>, document.body)}
      {show === 'credits' && createPortal(<Modal title={t('cl.go.credits')} onClose={() => setShow(null)}><div data-testid="cx-credits"><CreditsTab /></div></Modal>, document.body)}
      {show === 'info' &&createPortal(<Modal title={t('info.title')} onClose={() => setShow(null)}><GameInfoTable route={route.name} /></Modal>, document.body)}
      {show === 'feedback' && createPortal(getProfile()
        ? <WriteModal kind="suggest" pick meta={gameInfoMeta(route.name)} onClose={() => setShow(null)} />
        : <Modal title={t('cm.feedbackBug')} onClose={() => setShow(null)}><ProfileGate onDone={() => setShow(null)} /></Modal>, document.body)}
    </>
  );
}

// ---------- Game Settings (den samlede skærm ligger i screens/Options.tsx) ----------

export function Seg<T extends string | boolean | number>({ value, opts, onChange }: { value: T; opts: [T, string][]; onChange: (v: T) => void }) {
  return <div className="cx-set-seg">{opts.map(([v, l]) => <button key={String(v)} className={v === value ? 'on' : ''} onClick={() => onChange(v)}>{l}</button>)}</div>;
}

/** Gemmer en visningsindstilling (samme nøgler som før) og anvender den med det samme */
export function setDisplayPref(k: keyof typeof PREF, v: boolean | string | number) {
  try { localStorage.setItem(PREF[k], typeof v === 'boolean' ? (v ? 'on' : 'off') : String(v)); } catch { /* ignorér */ }
  applyFlash();
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
    // CM 01/02 (managermenuen 0x75eade–0x75ecb8): "{klub} Reserves" og "Control Reserve Team"/"Control Senior Team Only" kun for en klub med
    // reservehold (0x542740), og B-holdets trup, når klubben har et (0x540a50) – cmBTeam.ts
    if (hasReserveTeam(g, club.id)) {
      add('squad', t('cl.res.title', { club: club.short }), 'reserves');
      if (authentic()) {
        const on = !!g.manager.ctrlRes;
        items.push({ key: 'ctrlRes', label: t(on ? 'cl.mm.ctrlSenior' : 'cl.mm.ctrlRes'), onClick: async () => {
          if (await askConfirm(t(on ? 'cl.mm.ctrlSeniorQ' : 'cl.mm.ctrlResQ', { club: club.short }))) act({ t: 'ctrlRes', on: !on });
        } });
      }
    }
    const b = bTeamOf(g, club.id);
    if (b !== null && g.clubs[b]) items.push({ key: 'bteam', label: t('cl.mm.squad', { club: g.clubs[b].short }), onClick: () => nav({ name: 'club', id: b, state: { cview: 'squad' } }) });
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
  if (club && onHoliday) items.push({ key: 'hol', label: t('cl.hol.go'), onClick: () => onHoliday(false) }, ...(authentic() ? [] : [{ key: 'hol2', label: t('cl.hol.match'), onClick: () => onHoliday(true) }]));
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
  // CM 01/02: World Cup/International ▸ Awards = "International Awards", en nations ▸ Awards = "{nationality} Awards" (0x414c20)
  const awards = { key: 'awards', label: t('cl.cm.awards'), onClick: () => nav({ name: 'awards', state: { awScope: 'intl' } }) };
  const fifa = { key: 'fifa', label: t('cl.cm.fifa'), onClick: intl({ itab: 'fifa' }) };
  const sep = (k: string) => ({ key: k, sep: true as const });
  const hist = (c: string) => intl({ itab: 'history', ihist: c });
  // CM 01/02: World Cup ▸ · International ▸ · Worldwide Club ▸ · European ▸ · nationerne ▸
  items.push({ key: 'wc', label: t('cl.cm.worldCup'), sub: [
    { key: 'wcT', label: t('cl.cm.fifaWc'), onClick: intl({ itour: 'wc' }) },
    ...(['CAF', 'AFC', 'CONCACAF', 'UEFA', 'OFC', 'CONMEBOL'].map((r) => ({ key: `q${r}`, label: t('cl.cm.wcq', { r }), onClick: intl({ itab: 'qual' }) }))),
    sep('s1'), awards, fifa,
  ] });
  items.push({ key: 'intl', label: t('cl.cm.international'), sub: [
    { key: 'olympic', label: t('cl.cm.olympic'), onClick: intl({ itour: 'olympic' }) },
    { key: 'euro', label: t('cl.cm.euro'), onClick: intl({ itour: 'euro' }) },
    { key: 'euroq', label: t('cl.cm.euroq'), onClick: intl({ itab: 'qual' }) },
    { key: 'afcon', label: t('cl.cm.afcon'), onClick: intl({ itour: 'afcon' }) },
    { key: 'copa', label: t('intl.name.copa'), onClick: intl({ itour: 'copa' }) },
    { key: 'ofc', label: t('cl.cm.ofc'), disabled: !past.has('ofc'), onClick: hist('ofc') },
    { key: 'asian', label: t('cl.cm.asian'), onClick: intl({ itour: 'asian' }) },
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
    // UEFA-koefficienterne findes ikke som skærm i originalen (ingen tekst i exe'en) – kun i det udvidede spil
    ...(!rebornOn('menus') ? [] : [{ key: 'coef', label: t('cl.cm.coeff'), onClick: () => nav({ name: 'coefficients' }) }]),
  ] });
  // nationerne: ens egen først, så i ligaernes rækkefølge
  const own = g.clubs[g.userClub]?.nation;
  const nations: number[] = [];
  for (const id of g.leagueOrder) { const l = g.leagues[id]; if (l && !l.hidden && g.comps[id] && !nations.includes(l.nation)) nations.push(l.nation); }
  nations.sort((a, b) => (a === own ? -1 : b === own ? 1 : 0));
  // 0x75f891: Awards kun for et land med et NationAwards-objekt (0x414340 – indlæst land med priser); åbner landets første pris
  const awNats = cmAwOn(g) ? cmAwardNations(g) : null;
  for (const n of nations) {
    const comps = Object.values(g.comps).filter((c) => c.nation === n && !g.leagues[c.id]?.hidden).sort((a, b) => compOrder(a) - compOrder(b));
    const nm = g.nations[n]?.name ?? '';
    items.push({ key: `n${n}`, label: natName(g.nations[n]?.name), sub: [
      ...comps.map((c) => ({ key: c.id, label: compName(c.name), onClick: () => nav({ name: 'competitions', id: c.id }) })),
      { key: 'sep', sep: true as const },
      ...(awNats && !awNats.includes(nm) ? [] : [{ key: 'aw', label: t('cl.cm.awards'), onClick: () => nav({ name: 'awards', state: { awNat: nm } }) }]),
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
