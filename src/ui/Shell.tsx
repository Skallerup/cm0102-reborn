import { BoardScreen } from './screens/Board';
import type { GameState, HolidaySettings } from '../game/types';
import type { Route } from './core';
import { addDays } from '../game/dates';
import { International } from './screens/International';
import { stopVoice } from '../online/voice';
import { RoomChat } from './RoomChat';
import { draftRoundLabel } from './Draft';
import { DraftLeagueScreen } from './Draft';
import { refreshSupport, syncSupporterRegens } from '../online/support';
import { SupportPage } from './Support';
import { Head } from './screens/common';
import { ProfileScreen } from './screens/Profile';
import { BugReportButton } from './Community';
import { CommunityHub, type HubTab } from './CommunityHub';
import { cmDatabase } from '../game/newgame';
import { APP_VERSION } from './changelogData';
import { askConfirm, askNotice } from './confirm';
import { ClassicManagerHistory } from './screens/ManagerHistoryClassic';
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { flushAutosave, forgetLast, saveGame, scheduleAutosave } from '../game/save';
import { runUntil, watchedDay } from '../game/sim';
import { realCompName, setCompEra } from '../i18n/comps';
import { compLogoUrl } from './logos';
import { isOriginal2001 } from '../game/rules2001';
import { intlDayResults } from '../game/international';
import { gs, hasGame, notify, setGame, subscribe } from '../game/state';
import { compName, dateFmt, money, t } from '../i18n';
import { Crest } from './components';
import { Icon } from './icons';
import { Lobby, OnlineControls } from './Online';
import { closeSession, session } from '../online/client';
import { submitPending } from '../online/rank';
import { focusNews } from './inboxFocus';
import { act } from '../game/actions';
import { setScrollElement, useGame, useNav, type ScreenName } from './core';
import { Inbox } from './screens/Inbox';
import { Squad } from './screens/Squad';
import { PlayerScreen } from './screens/PlayerScreen';
import { Tactics } from './screens/Tactics';
import { ClubTacticsView } from './screens/TacticsClassic';
import { Training } from './screens/Training';
import { Fixtures } from './screens/Fixtures';
import { Competitions, UefaCoefficients } from './screens/Competitions';
import { Transfers } from './screens/Transfers';
import { Scouting } from './screens/Scouting';
import { StaffScreen } from './screens/Staff';
import { Finance } from './screens/Finance';
import { ClubScreen } from './screens/Club';
import { Assistant } from './screens/Assistant';
import { MatchScreen } from './screens/Match';
import { ReportScreen } from './screens/Report';
import { History } from './screens/History';
import { Awards } from './screens/Awards';
import { Jobs } from './screens/Jobs';
import { Options } from './screens/Options';
import { PressScreen } from './screens/Press';
import { RankingScreen } from './screens/Ranking';
import { ManagersScreen } from './screens/Managers';
import { unreadChat } from '../game/chat';
import { HelpScreen } from './help';
import { VersionButton } from './Changelog';
import { prefetchArticles } from './aiArticle';
import { applyTheme, isRetro, setThemeClub } from './theme';
import { backgroundUrl, clubBgUrl, compBgUrl, loadScreenBgs, loadStadiumBgs, matchdayBgUrl, miscBgUrl, nationBgUrl, stadiumBgUrl, sundayLeague } from './backgrounds';
import { CompetitionsMenu, NationsClubsMenu, FindMenu, GameOptionsMenu, ManagerMenu, bgChanges, modernBackgrounds, stadiumBackgrounds } from './classicOptions';
import { ClassicFind } from './screens/FindClassic';
import { ClassicNation } from './screens/NationClassic';
import { IntlDay, MatchDay } from './screens/MatchDayClassic';
import { ClassicClubHistory } from './screens/ClubHistoryClassic';
import { ClassicNations } from './screens/NationsClassic';
import { ClassicHallOfFame, ClassicManagerStatus, ClassicSelectedLeagues } from './screens/GameOptionsClassic';
import { ClassicSlotCtx, CxDrop, classicDate, setClassicAllowed, useClassicDialogOpen, useClassicMatchSideState, useClassicNextAction, titleColors, useClassicDialog, classicContinue, cxLongDate } from './classic';
import { canInstall, installApp, notifyAskable, notifyEnabled, notifyUser, onInstallChange, setNotify } from './notify';
import { newsTitle } from './screens/common';

/** Nyheder der giver en browser-notifikation */
const NOTIFY_KEYS = ['window.opened', 'window.deadlineDay', 'window.closingTomorrow', 'transfer.incomingBid', 'transfer.bidAccepted', 'transfer.bidCountered', 'auction.', 'signing.', 'staff.bid', 'job.invite', 'news.jobOffer', 'board.sacked', 'board.warning', 'jab.received', 'bet.proposed', 'chat.news', 'trophy.board', 'will.complain'];

const MENU: [ScreenName, string][] = [
  ['inbox', 'nav.inbox'], ['squad', 'nav.squad'], ['tactics', 'nav.tactics'], ['training', 'nav.training'],
  ['fixtures', 'nav.fixtures'], ['competitions', 'nav.competitions'], ['international', 'nav.international'], ['transfers', 'nav.transfers'], ['scouting', 'nav.scouting'],
  ['assistant', 'nav.assistant'], ['staff', 'nav.staff'], ['finance', 'nav.finance'], ['club', 'nav.club'], ['board', 'nav.board'],
];
const MENU2: [ScreenName, string][] = [['community', 'nav.community'], ['support', 'nav.support'], ['profile', 'nav.profile'], ['ranking', 'nav.ranking'], ['awards', 'nav.awards'], ['history', 'nav.history'], ['jobs', 'nav.jobs'], ['help', 'nav.help'], ['options', 'nav.options']];
/** Menuen i grupper (indbakken står altid øverst, hjælp og indstillinger nederst) */
const GROUPS: { key: string; items: ScreenName[] }[] = [
  { key: 'team', items: ['squad', 'tactics', 'training', 'assistant'] },
  { key: 'matches', items: ['draft', 'fixtures', 'competitions', 'international'] },
  { key: 'market', items: ['transfers', 'scouting'] },
  { key: 'club', items: ['club', 'board', 'finance', 'staff'] },
  { key: 'manager', items: ['profile', 'ranking', 'awards', 'history', 'jobs'] },
  { key: 'community', items: ['community', 'support'] },
];
const ALL_ITEMS = { ...Object.fromEntries([...MENU, ...MENU2]), draft: 'nav.draft' } as Record<ScreenName, string>;
const DRAFT_SCREENS: ScreenName[] = ['inbox', 'squad', 'tactics', 'assistant', 'draft', 'fixtures', 'competitions', 'community', 'support', 'help', 'options', 'managers'];
export const GROUP_KEY = 'cm-nav-closed';
// Standard: kun "Holdet" er foldet ud ved spilstart (resten huskes derefter)
export const NAV_CLOSED_DEFAULT = ['matches', 'market', 'club', 'manager', 'community'];
const UNEMPLOYED: ScreenName[] = ['find', 'support', 'community', 'profile', 'inbox', 'competitions', 'jobs', 'history', 'options', 'transfers', 'awards', 'ranking', 'help', 'managers', 'nation', 'international', 'coefficients', 'clubhistory', 'nations', 'mgrstatus', 'leagues'];

/** Spillere på holdet eller bænken, der ikke kan spille (CM 01/02 Team Selection) – teksten, eller null */
function selectionProblems(): string | null {
  const g = gs();
  const tac = g.tactic;
  if (!tac) return null;
  const ids = [...tac.lineup, ...tac.bench].filter(Boolean);
  const groups: [string, string[]][] = [['inj', []], ['ban', []], ['res', []]];
  for (const id of ids) {
    const p = g.players[id];
    if (!p || p.club !== g.userClub) continue;
    const nm = `${p.first} ${p.last}`.trim();
    if (p.injury) groups[0][1].push(nm); else if (p.banned > 0) groups[1][1].push(nm); else if (p.reserves) groups[2][1].push(nm);
  }
  const join = (n: string[]) => (n.length > 1 ? `${n.slice(0, -1).join(', ')} ${t('common.and')} ${n.at(-1)}` : n[0]);
  const lines = groups.filter(([, n]) => n.length).map(([k, n]) => t(`cl.mt.sel.${k}${n.length > 1 ? 'N' : '1'}`, { names: join(n) }));
  return lines.length ? lines.join(' ') : null;
}

export function Shell() {
  const g = useGame()!;
  // 2001-databasen: CM's egne turneringsnavne på engelsk, ellers de rigtige ("Premier League")
  setCompEra(isOriginal2001());
  const { route, nav, back, canBack, forward, canForward } = useNav();
  const cxNext = useClassicNextAction();
  // kampdage (optakt, kamp, rapport): hjemmeholdets stadion som baggrund, som i CM 01/02 – ikke ved finaler på neutral bane
  const [, setStadiumsReady] = useState(0);
  const venueFix = (route.name === 'match' || route.name === 'matchday' || route.name === 'report') ? g.fixtures?.[Number((route as { id?: number }).id)] : undefined;
  const venue = venueFix && venueFix.stage !== 'F' && stadiumBackgrounds() ? g.clubs[venueFix.home]?.stadium : undefined;
  useEffect(() => { if (venue) void loadStadiumBgs().then(() => setStadiumsReady((x) => x + 1)); }, [venue]);
  // på selve kampskærmen styres kampen derinde – "Til kampen"/"Næste kamp" giver ingen mening dér
  const inMatch = route.name === 'match' && !!g.pendingFixture && (route as { id?: number }).id === g.pendingFixture;
  const [menuOpen, setMenuOpen] = useState(false);
  const [running, setRunning] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [winNote, setWinNote] = useState<{ head: string; text: string } | null>(null);
  const stopRef = useRef(false);
  const onHolidayRef = useRef(false);
  const holidaySetRef = useRef<HolidaySettings>({ rejectAll: true });
  const mainRef = useRef<HTMLElement>(null);
  useEffect(() => { setScrollElement(mainRef.current); return () => setScrollElement(null); }, []);
  useLayoutEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = route.scroll ?? 0;
  }, [route]);
  const club = session() && !session()!.inGame ? undefined : g.clubs[g.userClub];
  const unread = g.news.filter((n) => !n.read).length;
  const chatUnread = (g.humans ? unreadChat() : 0) + (session()?.unreadChat() ?? 0);
  const unreadImportant = g.news.filter((n) => !n.read).length;
  // hvilke skærme er tilgængelige, og hvilke har et mærke (bruges af både sidemenuen og CM-navigationen)
  const allowed = (k: ScreenName) => (g.draft ? DRAFT_SCREENS.includes(k) : k !== 'draft' && (!!g.userClub || UNEMPLOYED.includes(k)));
  const badge = (k: ScreenName) => (k === 'inbox' && unread > 0 ? <span className="badge">{unread}</span>
    : k === 'transfers' && g.offers.some((o) => o.status === 'pending' && o.seller === g.userClub) ? <span className="badge">!</span>
    : k === 'jobs' && g.jobOffers.length > 0 ? <span className="badge">{g.jobOffers.length}</span> : null);
  // klassisk tema: fast venstre-kolonne, titelbjælke + faner pr. skærm og en bred Tilbage/Frem-bjælke
  // klassisk tema også som arbejdsløs (men ikke i online-lobbyen, hvor der endnu ikke er en verden)
  const cmNav = isRetro() && !g.draft && !(session() && !session()!.inGame);
  const dialogOpen = useClassicDialogOpen();
  const [holiday, setHoliday] = useState<boolean | null>(null);
  // bokse (bekræftelser, kontrakt …) ligger uden for main – de får samme baggrundsbillede via :root
  useEffect(() => { void Promise.all([loadScreenBgs(), loadStadiumBgs()]).then(() => setStadiumsReady((x) => x + 1)); }, []);
  const bgDay = bgChanges() ? g.date : '2001-07-01';
  const cxPhoto = cmNav ? (venue ? matchdayBgUrl(venue, venueFix?.date ?? g.date) : null) ?? screenBackground(g, route, bgDay) ?? backgroundUrl(bgDay, g.userClub) : null;
  useEffect(() => { if (cxPhoto) document.documentElement.style.setProperty('--cx-photo', `url("${cxPhoto}")`); }, [cxPhoto]);
  const matchSide = useClassicMatchSideState();
  // moderne udseende: dagens baggrundsfoto bag indholdet – på kampdage hjemmeholdets stadion
  const modernPhoto = !cmNav && !g.draft && g.userClub
    ? (venue ? matchdayBgUrl(venue, venueFix?.date ?? g.date) : null) ?? (modernBackgrounds() ? screenBackground(g, route, bgDay) ?? backgroundUrl(bgDay, g.userClub) : null)
    : null;
  setClassicAllowed(allowed);
  const [subSlot, setSubSlot] = useState<HTMLDivElement | null>(null);
  const [tabSlot, setTabSlot] = useState<HTMLElement | null>(null);
  // klubtema følger den klub, man styrer
  useEffect(() => { applyTheme(); }, [g.userClub]);
  // online-lobbyen: ens egen valgte klub, indtil man er med i spillet
  const lobbySess = session();
  const lobbyClub = lobbySess && !lobbySess.inGame ? lobbySess.me?.club : undefined;
  useEffect(() => { setThemeClub(lobbyClub); }, [lobbyClub]);
  // AI-artikler (kamprapporter m.m.) skrives i baggrunden, så de er klar når beskeden åbnes
  const newestNews = g.news[0]?.id;
  useEffect(() => { if (newestNews !== undefined) prefetchArticles(); }, [newestNews, g.userClub]);
  // supportere: status, præstationen "Patron of the game" og supporternes regen-navne
  useEffect(() => {
    refreshSupport().then((m) => { if (m?.tier && !gs().manager.ach?.patron) { act({ t: 'patron' }); } });
    void syncSupporterRegens();
  }, [g.id]); // eslint-disable-line react-hooks/exhaustive-deps
  // browser-notifikationer om vigtige nyheder, når fanen ikke er i fokus
  const notifiedUpTo = useRef(g.news[0]?.id ?? 0);
  useEffect(() => {
    const fresh = g.news.filter((n) => n.id > notifiedUpTo.current && !n.read);
    notifiedUpTo.current = Math.max(notifiedUpTo.current, g.news[0]?.id ?? 0);
    const imp = fresh.filter((n) => NOTIFY_KEYS.some((k) => n.key.startsWith(k)));
    if (imp.length) notifyUser(g.clubs[g.userClub]?.name ?? 'CM Reborn', imp.slice(0, 3).map((n) => newsTitle(n)).join('\n'), 'news');
    else if (fresh.length && session()) notifyUser(g.clubs[g.userClub]?.name ?? 'CM Reborn', t('mp.newTurn', { date: dateFmt(g.date) }), 'news');
  }, [newestNews]); // eslint-disable-line react-hooks/exhaustive-deps

  // kampdag: besked når ens kamp er klar, mens fanen ligger i baggrunden (især online, hvor dagene kører uden én)
  const pending = g.pendingFixture;
  useEffect(() => {
    if (!pending) return;
    const f = g.fixtures[pending];
    if (!f) return;
    const opp = g.clubs[f.home === g.userClub ? f.away : f.home]?.name ?? '';
    notifyUser(g.clubs[g.userClub]?.name ?? 'CM Reborn', t('notify.matchReady', { opp }), 'match');
  }, [pending]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(id);
  }, [toast]);

  // Mellemrum = Fortsæt, uanset hvor fokus er (undtagen når man skriver tekst).
  // Fanges før alt andet, så en fokuseret knap eller skærmens egne genveje ikke reagerer.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== ' ' || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      const typing = el?.isContentEditable || el?.tagName === 'TEXTAREA' || (el?.tagName === 'INPUT' && !['checkbox', 'radio', 'range', 'button', 'submit'].includes((el as HTMLInputElement).type));
      if (typing) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if (e.repeat) return;
      // skærmens egen Fortsæt (fx Kick-off eller Fortsæt efter kampen) går forud for topbjælkens
      // under en kamp: mellemrum starter og pauser kampen
      const btn = document.querySelector<HTMLButtonElement>('.main [data-space]:not(:disabled)') ?? document.querySelector<HTMLButtonElement>('.main .continue:not(:disabled)') ?? document.querySelector<HTMLButtonElement>('.topbar .continue:not(:disabled)');
      btn?.click();
    };
    // en fokuseret knap aktiveres af mellemrum ved keyup – det skal også stoppes
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key !== ' ' || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      const typing = el?.isContentEditable || el?.tagName === 'TEXTAREA' || (el?.tagName === 'INPUT' && !['checkbox', 'radio', 'range', 'button', 'submit'].includes((el as HTMLInputElement).type));
      if (typing) return;
      e.preventDefault();
      e.stopImmediatePropagation();
    };
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('keyup', onKeyUp, true);
    return () => { window.removeEventListener('keydown', onKey, true); window.removeEventListener('keyup', onKeyUp, true); };
  }, []);

  const online = session();
  // Autogem: kort efter enhver ændring (kun singleplayer – online gemmes på serveren)
  useEffect(() => {
    if (online) return;
    let lastSavedDate = hasGame() ? gs().date : '';
    const unsub = subscribe(() => {
      if (!hasGame()) return;
      const g2 = gs();
      const mode = g2.options.autosaveMode ?? (g2.options.autosave === false ? 'off' : 'changes');
      if (mode === 'off') return;
      if (mode === 'changes') { scheduleAutosave(); return; }
      const days = mode === 'daily' ? 1 : mode === 'weekly' ? 7 : 30;
      const since = lastSavedDate ? (Date.parse(g2.date) - Date.parse(lastSavedDate)) / 86400000 : days;
      if (since >= days) { lastSavedDate = g2.date; scheduleAutosave(800); }
    });
    const onHide = () => { if (document.visibilityState === 'hidden') void flushAutosave(); };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', onHide);
    return () => { unsub(); document.removeEventListener('visibilitychange', onHide); window.removeEventListener('pagehide', onHide); };
  }, [online]);
  // Ranglister: send nye sæsonscorer, når sæsonen skifter (og ved start)
  useEffect(() => {
    if (online) return;
    let season = hasGame() ? gs().season : 0;
    void submitPending();
    const unsub = subscribe(() => {
      if (!hasGame() || gs().season === season) return;
      season = gs().season;
      void submitPending();
    });
    return () => { unsub(); };
  }, [online]);
  const handle = (r: { match?: number; stop?: string }) => {
    notify();
    // klassisk tema: først dagens kampe (som i originalen) – Continue Game fører derefter til kampen
    if (r.match !== undefined) nav(cmNav ? { name: 'matchday', id: r.match } : { name: 'match', id: r.match });
    else if (r.stop === 'dayStart' || r.stop === 'dayEnd') { const id = watchedDay(gs().date); if (id !== undefined) nav({ name: 'matchday', id }); else if (intlDayResults(gs().date).length) nav({ name: 'intlday' }); }
    else if (r.stop) {
      nav({ name: 'inbox' });
      // vis den ældste uåbnede besked
      const next = gs().news.filter((n) => !n.read).pop();
      if (next) focusNews(next.id);
    }
  };

  // Fortsæt: læs først de ulæste beskeder én ad gangen (ældste først), derefter næste dag
  const showOldestUnread = (news: typeof g.news) => {
    const next = news.filter((n) => !n.read).pop();
    if (!next) return false;
    act({ t: 'read', ids: [next.id] });
    focusNews(next.id);
    if (route.name !== 'inbox') nav({ name: 'inbox' });
    return true;
  };
  const onContinue = () => {
    if (cmNav && classicContinue()) return;
    if (g.pendingFixture) {
      const pf = g.fixtures[g.pendingFixture];
      // gammel kamp fra en klub, man ikke længere styrer (efter jobskifte): spil den automatisk
      if (!pf || pf.result || (pf.home !== g.userClub && pf.away !== g.userClub)) act({ t: 'fixPending' });
      else {
        const go = g.pendingFixture;
        // klassisk (CM 01/02): "Please Confirm – Proceed to the match ?"
        // klassisk: en skadet/udelukket spiller på holdet stopper kampen (Team Selection, som i CM 01/02)
        if (cmNav) {
          const sel = selectionProblems();
          if (sel) { void askNotice(sel, { head: t('cl.mt.teamSel') }).then(() => nav({ name: 'tactics' })); return; }
        }
        if (cmNav) { void askConfirm(t('cl.mt.proceed'), { head: t('cl.mt.confirm') }).then((ok) => { if (ok) nav({ name: 'match', id: go }); }); return; }
        nav({ name: 'match', id: go }); return;
      }
    }
    // klassisk: en fulgt kampdag står på "Evening Fixtures" – Continue spiller dagen og viser resultaterne
    if (cmNav && !g.dayDone && !g.pendingFixture) { void run({ untilMatch: true, untilNews: true, maxDays: 60, watchDays: true }); return; }
    if (showOldestUnread(g.news)) return;
    // ingen ulæste: kør dage frem, indtil der sker noget (kamp, bud, ny besked …) – højst 60 dage
    void run({ untilMatch: true, untilNews: true, maxDays: 60, watchDays: cmNav }).then((r) => {
      if (r.match === undefined && r.stop !== 'dayStart' && r.stop !== 'dayEnd') showOldestUnread(gs().news);
    });
  };

  const run = async (opts: Parameters<typeof runUntil>[0]) => {
    stopRef.current = false;
    // fremdriften vises først, hvis kørslen tager mere end et øjeblik (ingen blink ved 1-2 dage)
    const t0 = Date.now();
    const r = await runUntil({ ...opts, shouldStop: () => stopRef.current, onProgress: (d) => { if (Date.now() - t0 > 300) setRunning(d); } });
    setRunning(null);
    if (r.stop === 'news') { notify(); return r; }
    handle(r);
    return r;
  };

  const [closed, setClosed] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem(GROUP_KEY) ?? JSON.stringify(NAV_CLOSED_DEFAULT)); } catch { return NAV_CLOSED_DEFAULT; } });
  const toggleGroup = (k: string) => { const n = closed.includes(k) ? closed.filter((x) => x !== k) : [...closed, k]; setClosed(n); try { localStorage.setItem(GROUP_KEY, JSON.stringify(n)); } catch { /* ignorer */ } };
  const nextMatch = club ? Object.values(g.fixtures).filter((f) => !f.result && (f.home === g.userClub || f.away === g.userClub)).sort((a, b) => a.date.localeCompare(b.date))[0] : undefined;


  return (
    <div className={`shell ${cmNav ? 'cx' : ''} ${cmNav && running ? 'cx-busy' : ''}`}>
      <div className="topbar">
        <button className="menu-toggle small" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        <div className="club">
          {club ? <><Crest id={club.id} size={34} /><span className="club-name">{club.name}</span></> : <span className="muted">{online && !online.inGame ? t('mp.lobby') : t('top.unemployed')}</span>}
        </div>
        {g.draft ? <div className="date">{draftRoundLabel()}</div> : <div className="date"><span className="date-long">{dateFmt(g.date, true)}</span><span className="date-short">{dateFmt(g.date)}</span></div>}
        {club && !g.draft && (
          <div className="money top-stats">
            <span className="top-stat"><small>{t('top.balance')}</small><b className={club.balance < 0 ? 'neg' : ''}>{money(club.balance)}</b></span>
            <span className="top-stat"><small>{t('top.budget')}</small><b>{money(club.transferBudget)}</b></span>
          </div>
        )}
        <div className="spacer" />
        <AppButtons onMsg={setToast} />
        <FullscreenButton />
        {nextMatch && !inMatch && (
          <span className="nowrap top-next top-stat">
            <small>{t('top.next')} · {g.draft ? t('dr.roundN', { n: nextMatch.round }) : dateFmt(nextMatch.date)}</small>
            <b><Crest id={nextMatch.home === g.userClub ? nextMatch.away : nextMatch.home} size={16} /> {g.clubs[nextMatch.home === g.userClub ? nextMatch.away : nextMatch.home]?.short}{nextMatch.home === g.userClub ? '' : ` (${t('week.away')})`}</b>
          </span>
        )}
        {online ? <OnlineControls /> : inMatch ? null : (
          <>
            <button onClick={() => run({ untilMatch: true })} title={t('top.toMatchHint')}>{t('top.toMatch')}</button>
            <button className="primary continue" onClick={onContinue} title={unreadImportant ? t('top.continueUnread', { n: unreadImportant }) : t('top.continueHint')}>{g.pendingFixture ? t('top.toTheMatch') : t('top.continue')}{!g.pendingFixture && unreadImportant > 0 && <span className="cont-badge">{unreadImportant}</span>}</button>
          </>
        )}
      </div>
      {cmNav && (() => {
        const [day, date] = classicDate(g.date);
        const quit = async () => {
          if (online) { if (await askConfirm(t('mp.leaveConfirm'))) { void stopVoice(); closeSession(); forgetLast(); setGame(null); } return; }
          if (await askConfirm(t('top.quitConfirm'))) { await saveGame({ cloud: true }).catch(() => {}); forgetLast(); setGame(null); }
        };
        // kampskærmen (CM 01/02): minuttet øverst og kampens knapper i stedet for de almindelige
        if (matchSide && route.name === 'match') {
          const ms = matchSide.s, ma = matchSide.a;
          return (
            <aside className="cx-side">
              <div className="cx-date cx-minute"><b>{ms.minute}</b></div>
              <div className="cx-arrows">
                <button disabled={!canBack || (ms.kicked && !ms.finished)} onClick={back} aria-label={t('cm.back')}>←</button>
                <button disabled={!canForward || (ms.kicked && !ms.finished)} onClick={forward} aria-label={t('cm.next')}>→</button>
              </div>
              {/* CM 01/02: under taktikken står Paused hvid og resten gråt; Cancel/Ok står nederst */}
              {ms.finished ? <button className="cx-sbtn cx-continue continue" onClick={ma.cont}>{t('cl.continue')}</button>
                : <button className={`cx-sbtn cx-continue ${ms.editing ? 'cx-keep' : ''}`} disabled={ms.editing} title={ms.kicked && ms.paused ? t('cl.mt.resume') : undefined} onClick={ms.kicked ? ma.pause : ma.kick}>{!ms.kicked ? t('cl.mt.kickoff') : ms.half ? t('cl.mt.restart') : ms.paused ? t('cl.mt.paused') : t('cl.mt.pause')}</button>}
              <button className="cx-sbtn" disabled={ms.editing} onClick={() => ma.tactics(0)}>{t('cl.mt.tactics', { club: ms.home })}</button>
              <button className="cx-sbtn" disabled={ms.editing} onClick={() => ma.tactics(1)}>{t('cl.mt.tactics', { club: ms.away })}</button>
              {<CxDrop className="cx-gameopt" fixed caret={false} label={t('cl.mt.speed')} btn={{ className: 'cx-sbtn', disabled: ms.editing }}
                items={[8, 4, 2, 1, 0.6, 0.35].map((n) => ({ key: String(n), label: t(`cl.mt.sp.${String(n).replace('.', '')}`), checked: ms.speed === n, onClick: () => ma.speed(n) }))} />}
              {/* turneringens logo og navn i den tomme del af sidebjælken (spillerønske – ikke i originalen) */}
              {ms.comp && g.comps[ms.comp] && <CompBadge id={ms.comp} />}
              <div className="cx-side-grow" />
            </aside>
          );
        }
        // på kampdagen står kampens to hold i datoboksen (som i originalen)
        const pf = g.pendingFixture ? g.fixtures[g.pendingFixture] : undefined;
        return (
          <aside className="cx-side">
            {pf && !pf.result ? <div className="cx-date cx-matchday" title={dateFmt(g.date, true)}><span>{g.clubs[pf.home]?.short} v {g.clubs[pf.away]?.short}</span></div>
              : <div className="cx-date" title={dateFmt(g.date, true)}><b>{day}</b><span>{date}</span></div>}
            <div className="cx-arrows">
              <button disabled={!canBack} onClick={back} aria-label={t('cm.back')}>←</button>
              <button disabled={!canForward} onClick={forward} aria-label={t('cm.next')}>→</button>
            </div>
            {online ? <div className="cx-online"><OnlineControls /></div> : !inMatch && (
              <button className="cx-sbtn cx-continue continue" disabled={dialogOpen} onClick={onContinue}>{g.pendingFixture ? t('top.toTheMatch') : t('cl.continue')}</button>
            )}
            {/* managerens navn → menu med klubbens og managerens skærme (som i originalen) */}
            <ManagerMenu allowed={(k) => allowed(k as ScreenName)} onRetire={quit} onHoliday={(untilMatch) => {
              // CM 01/02: "Your club has no match in the next 60 days." (lille vindue med Ok)
              const g2 = gs();
              const limit = addDays(g2.date, 60);
              if (untilMatch && !Object.values(g2.fixtures).some((f) => !f.result && f.date <= limit && (f.home === g2.userClub || f.away === g2.userClub))) { setWinNote({ head: t('cl.hol.untilNext'), text: t('cl.hol.noMatch') }); return; }
              setHoliday(untilMatch);
            }} />
            <CompetitionsMenu />
            <NationsClubsMenu />
            <FindMenu />
            <GameOptionsMenu online={!!online} allowed={(k) => allowed(k as ScreenName)} onQuit={quit}
              onSave={async () => { await saveGame({ cloud: true }); setToast(t('top.saved')); }} />
            <div className="cx-side-grow" />
            {unread > 0 && <button className="cx-news" onClick={() => nav({ name: 'inbox' })}>{t('cl.youHaveNews')}</button>}
          </aside>
        );
      })()}
      <nav className={`sidenav ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)}>
        {(() => {
          // draft-liga: kun holdet, kampene og ligaen (ingen økonomi, transfers, staff, bestyrelse eller jobs)
          const item = (k: ScreenName) => (
            <button key={k} className={route.name === k ? 'on' : ''} onClick={() => nav({ name: k })}>
              <Icon name={k} />{t(ALL_ITEMS[k])}{badge(k)}
            </button>
          );
          return (
            <>
              {item('inbox')}
              {g.humans && g.humans.length > 1 && (
                <button className={route.name === 'managers' ? 'on' : ''} onClick={() => nav({ name: 'managers' })}>
                  <Icon name="managers" />{t('nav.managers')}
                  {chatUnread > 0 && <span className="badge">{chatUnread}</span>}
                </button>
              )}
              {GROUPS.map((gr) => {
                const ks = gr.items.filter(allowed);
                if (!ks.length) return null;
                // menuen viser præcis det, manageren har foldet ud (huskes) – står man på en side i en lukket gruppe, fremhæves overskriften
                const active = ks.includes(route.name);
                const open = !closed.includes(gr.key);
                const hasBadge = !open && ks.some((k) => badge(k));
                return (
                  <div key={gr.key} className="nav-group">
                    <button className={`nav-head ${active && !open ? 'here' : ''}`} onClick={(e) => { e.stopPropagation(); toggleGroup(gr.key); }} aria-expanded={open}>
                      <span>{t(`navg.${gr.key}`)}</span>{hasBadge && <i className="nav-dot" />}<span className="nav-chev">{open ? '▾' : '▸'}</span>
                    </button>
                    {open && ks.map(item)}
                  </div>
                );
              })}
              <div className="sep" />
              {item('help')}
              {item('options')}
            </>
          );
        })()}
        <div className="sep" />
        {!online && <button onClick={async () => { await saveGame({ cloud: true }); setToast(t('top.saved')); }}><Icon name="save" />{t('nav.save')}</button>}
        {online && <div className="muted nav-note" title={t('mp.autosaveHint')}><Icon name="save" />{t('mp.autosave')}</div>}
        <button onClick={async () => {
          if (online) { if (await askConfirm(t('mp.leaveConfirm'))) { void stopVoice(); closeSession(); forgetLast(); setGame(null); } return; }
          if (await askConfirm(t('top.quitConfirm'))) { await saveGame({ cloud: true }).catch(() => {}); forgetLast(); setGame(null); }
        }}><Icon name="quit" />{t('nav.quit')}</button>
        <BugReportButton screen={route.name} version={APP_VERSION} date={g.date} />
        <VersionButton />
      </nav>
      {club && !cmNav && (
        <nav className="mobile-tabs">
          {(['inbox', 'squad', 'tactics', 'transfers'] as ScreenName[]).map((k) => (
            <button key={k} className={route.name === k ? 'on' : ''} onClick={() => nav({ name: k })}>
              <Icon name={k} /><span>{t(MENU.find(([x]) => x === k)?.[1] ?? k)}</span>
              {k === 'inbox' && unread > 0 && <i className="dot">{unread > 99 ? '99+' : unread}</i>}
            </button>
          ))}
          <button onClick={() => setMenuOpen(true)}><span className="burger">☰</span><span>{t('top.more')}</span></button>
        </nav>
      )}
      {menuOpen && <div className="menu-backdrop" onClick={() => setMenuOpen(false)} />}
      <ClassicSlotCtx.Provider value={cmNav ? { tabs: tabSlot, sub: subSlot, setTabs: setTabSlot } : null}>
        <main className={`main ${cmNav ? `cx-main cx-bg-${route.name}${stadiumBgUrl(venue, g.date) ? ' cx-stadium' : ''}` : modernPhoto ? `mbg${stadiumBgUrl(venue, venueFix?.date ?? g.date) ? ' mbg-stadium' : ''}` : ''}`} ref={mainRef}
          style={!cmNav && modernPhoto ? ({ '--m-photo': `url("${modernPhoto}")` } as CSSProperties) : cmNav && cxPhoto ? ({ '--cx-photo': `url("${cxPhoto}")` } as CSSProperties) : undefined}>
          {online && !online.inGame ? <Lobby /> : <Screen allowed={allowed} />}
          {online?.status === 'error' && <div className="toast">{online.error}</div>}
        </main>
      </ClassicSlotCtx.Provider>
      {cmNav && (
        <footer className="cx-foot">
          <div className="cx-sub" ref={setSubSlot} />
          {running ? (
            // simulering: én grå bjælke med datoen, der behandles (klik = stop)
            <button className="cx-running" onClick={() => {
              if (!onHolidayRef.current) { stopRef.current = true; return; }
              // på ferie: spørg først (kørslen fortsætter imens, som i originalen stopper den ved svaret)
              stopRef.current = true;
              void askConfirm(t('cl.hol.return'), { head: t('cl.mt.confirm') }).then((ok) => { if (!ok) { gs().manager.holiday = holidaySetRef.current; onHolidayRef.current = true; void run({ maxDays: 365, autoPlay: true }).finally(() => { onHolidayRef.current = false; gs().manager.holiday = undefined; notify(); }); } });
            }} title={t('common.stop')}>
              {/* CM 01/02: "Wednesday 29th May 2002" i den grå bjælke */}
              {cxLongDate(running)}
            </button>
          ) : (
            matchSide?.s.editing && route.name === 'match' && matchSide.s.lastView ? (
              // Last Match: kun Back (tilbage til taktikken), Next er grå
              <div className="cx-backnext">
                <button className="cx-back cx-mt-lastback" onClick={() => matchSide.a.back?.()}>{t('cm.back')}</button>
                <button className="cx-next" disabled>{t('cm.next')}</button>
              </div>
            ) : matchSide?.s.editing && route.name === 'match' ? (
              <div className="cx-backnext">
                <button className="cx-back cx-mt-cancel" disabled={dialogOpen} onClick={matchSide.a.cancel}>{t('common.cancel')}</button>
                <button className="cx-next cx-next-go cx-mt-ok" disabled={dialogOpen} onClick={matchSide.a.ok}>{t('common.ok')}</button>
              </div>
            ) : matchSide && route.name === 'match' && matchSide.s.venue ? (
              // kampskærmen (CM 01/02): stadion og by nederst i stedet for Back/Next
              // … og under kampen den seneste kommentar, når man står på en anden fane end Match Overview
              matchSide.s.line ? <div className={`cx-venue cx-foot-venue cx-foot-line ${matchSide.s.line.flash ? 'cx-goal-flash' : ''}`} style={matchSide.s.line.flash ? ({ '--g1': matchSide.s.line.background, '--g2': matchSide.s.line.color } as CSSProperties) : { background: matchSide.s.line.background, color: matchSide.s.line.color }}>{matchSide.s.line.text}</div>
                : <div className="cx-venue cx-foot-venue">{matchSide.s.venue}</div>
            ) : <div className="cx-backnext">
              {/* under en igangværende kamp kan man ikke gå væk fra kampen (som pilene i sidebjælken) */}
              <button className="cx-back" disabled={!canBack || (route.name === 'match' && !!matchSide?.s.kicked && !matchSide.s.finished)} onClick={back}>{t('cm.back')}</button>
              {cxNext ? <button className="cx-next cx-next-go" onClick={cxNext.run}>{cxNext.label}</button>
                : <button className="cx-next" disabled={!canForward} onClick={forward}>{t('cm.next')}</button>}
            </div>
          )}
        </footer>
      )}
      {/* med flere spillere viser simuleringsvisningen (Online.tsx) trækket – her kun ved indlæsning og alene-spil */}
      {online && (online.status === 'loading' || (online.status === 'processing' && (online.room?.players.length ?? 1) <= 1)) && (
        <div className="progress"><div>{online.status === 'processing' ? t('mp.processing') : t('mp.loading')}</div></div>
      )}
      {running && !cmNav && (
        <div className="progress">
          <div>{t('top.running')} {dateFmt(running)}</div>
          <button onClick={() => { stopRef.current = true; }}>{t('common.stop')}</button>
        </div>
      )}
      {holiday !== null && <HolidayPanel untilMatch={holiday} onClose={() => setHoliday(null)} onGo={(set) => {
        setHoliday(null);
        const g2 = gs();
        g2.manager.holiday = set;
        // CM 01/02: ferien varer, til man klikker på bjælken ("Return from holiday ?") – kampene spilles automatisk (højst et år)
        onHolidayRef.current = !holiday;
        holidaySetRef.current = set;
        void run(holiday ? { untilMatch: true, maxDays: 120 } : { maxDays: 365, autoPlay: true }).finally(() => { onHolidayRef.current = false; gs().manager.holiday = undefined; notify(); });
      }} />}
      {toast && <div className="toast">{toast}</div>}
      {winNote && <div className="cx-winbox-bg"><div className="cx-winbox" role="dialog"><div className="cx-winbox-head">{winNote.head}</div><p>{winNote.text}</p><button onClick={() => setWinNote(null)}>{t('common.ok')}</button></div></div>}
      {g.draft && online && <RoomChat />}
    </div>
  );
}

function Screen({ allowed }: { allowed: (k: ScreenName) => boolean }) {
  const { route, nav } = useNav();
  // en skærm man ikke længere har adgang til (fx bestyrelsen lige efter en opsigelse): videre til jobcentret/indbakken
  const g = useGame()!;
  const blocked = !g.draft && !g.userClub && !allowed(route.name) && route.name !== 'compare' && route.name !== 'player' && route.name !== 'club' && route.name !== 'match' && route.name !== 'report' && route.name !== 'matchday' && route.name !== 'intlday';
  useEffect(() => { if (blocked) nav({ name: allowed('jobs') ? 'jobs' : 'inbox' }); }, [blocked]); // eslint-disable-line react-hooks/exhaustive-deps
  if (blocked) return null;
  switch (route.name) {
    case 'inbox': return <Inbox />;
    case 'squad': return <Squad />;
    case 'player': return <PlayerScreen id={Number(route.id)} />;
    case 'tactics': return route.id !== undefined && Number(route.id) !== g.userClub && isRetro() ? <ClubTacticsView club={Number(route.id)} /> : <Tactics />;
    case 'training': return <Training />;
    case 'fixtures': return <Fixtures />;
    case 'competitions': return <Competitions id={route.id as string | undefined} />;
    case 'transfers': return <Transfers tab={route.tab} />;
    case 'find': return <ClassicFind tab={route.tab} />;
    case 'nation': return <ClassicNation id={route.id as number | undefined} tab={route.tab} />;
    case 'scouting': return <Scouting />;
    case 'staff': return <StaffScreen />;
    case 'finance': return <Finance />;
    case 'club': return <ClubScreen id={route.id as number | undefined} />;
    case 'board': return <BoardScreen />;
    case 'profile': return <ProfileScreen />;
    case 'draft': return <DraftLeagueScreen />;
    case 'support': return <div><Head title={t('sup.title')} /><SupportPage /></div>;
    case 'community': return <div><Head title={t('cm.title')} /><p className="muted" style={{ marginTop: 0 }}>{t('cm.intro')}</p>
      <CommunityHub defaultName={gs().manager.name} initialTab={route.tab as HubTab | undefined}
        onLegend={cmDatabase(gs()) === 'original' ? (id) => { if (gs().players[id]) nav({ name: 'player', id }); } : undefined} /></div>;
    case 'assistant': return <Assistant tab={route.tab} />;
    case 'compare': return <Assistant tab="compare" />;
    case 'benchmark': return <Assistant tab="bench" />;
    case 'match': return <MatchScreen id={Number(route.id)} />;
    case 'matchday': return <MatchDay id={Number(route.id)} />;
    case 'intlday': return <IntlDay />;
    case 'coefficients': return <UefaCoefficients />;
    case 'nations': return <ClassicNations />;
    case 'mgrstatus': return <ClassicManagerStatus />;
    case 'leagues': return <ClassicSelectedLeagues />;
    case 'clubhistory': return <ClassicClubHistory cid={Number(route.id ?? g.userClub)} />;
    case 'report': return <ReportScreen id={Number(route.id)} />;
    case 'history': return isRetro() ? <ClassicManagerHistory /> : <History />;
    case 'awards': return <Awards />;
    case 'international': return <International nation={route.id !== undefined ? Number(route.id) : undefined} />;
    case 'jobs': return <Jobs />;
    case 'options': return <Options />;
    case 'press': return <PressScreen />;
    case 'ranking': return isRetro() ? <ClassicHallOfFame fallback={<RankingScreen />} /> : <RankingScreen />;
    case 'managers': return <ManagersScreen />;
    case 'help': return <HelpScreen id={route.id as string | undefined} />;
  }
}

/** Klokken (slå notifikationer til) og "Installér app", kun når de er relevante */
function AppButtons({ onMsg }: { onMsg: (m: string) => void }) {
  const [notif, setNotif] = useState(notifyEnabled());
  const [inst, setInst] = useState(canInstall());
  useEffect(() => onInstallChange(() => setInst(canInstall())), []);
  return (
    <>
      {!notif && notifyAskable() && (
        <button className="small app-btn" title={t('top.notifyHint')} onClick={async () => {
          const ok = await setNotify(true);
          setNotif(ok);
          onMsg(t(ok ? 'top.notifyOn' : 'top.notifyDenied'));
        }}>🔔 <span className="app-btn-label">{t('top.notify')}</span></button>
      )}
      {inst && <button className="small app-btn" title={t('top.installHint')} onClick={async () => { if (await installApp()) onMsg(t('top.installed')); }}>⬇ <span className="app-btn-label">{t('top.install')}</span></button>}
    </>
  );
}

function FullscreenButton() {
  const [on, setOn] = useState(!!document.fullscreenElement);
  useEffect(() => {
    const h = () => setOn(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
  }, []);
  if (!document.fullscreenEnabled) return null;
  return (
    <button className="small fullscreen-btn" title={on ? t('top.exitFullscreen') : t('top.fullscreen')} aria-label={on ? t('top.exitFullscreen') : t('top.fullscreen')}
      onClick={() => { if (document.fullscreenElement) void document.exitFullscreen(); else void document.documentElement.requestFullscreen(); }}>
      {on ? '⤡' : '⛶'}
    </button>
  );
}

/** CM 01/02 "Go on holiday ?": indstillingerne slås til med et klik (hvid), No/Yes */
function HolidayPanel({ untilMatch, onClose, onGo }: { untilMatch: boolean; onClose: () => void; onGo: (s: HolidaySettings) => void }) {
  useClassicDialog();
  const g = gs();
  const col = titleColors(g.userClub || undefined);
  const [set, setSet] = useState<HolidaySettings>({ rejectAll: true, applyJobs: true });
  const keys: (keyof HolidaySettings)[] = ['rejectAll', 'rejectBelow', 'noBuy', 'applyJobs'];
  const toggle = (k: keyof HolidaySettings) => setSet((s) => {
    const x = { ...s, [k]: !s[k] };
    if (k === 'rejectAll' && x.rejectAll) x.rejectBelow = false;
    if (k === 'rejectBelow' && x.rejectBelow) x.rejectAll = false;
    return x;
  });
  return (
    <div className="cx-dlg cx-confirm" role="dialog">
      <div className="cx-title" style={{ background: col.bg, color: col.fg }}><h2>{g.manager.name}</h2></div>
      <div className="cx-subtitle">{t('cl.mt.confirm')}</div>
      <div className="cx-dlg-body">
        <p className="cx-ts-intro" style={{ alignSelf: 'center' }}>{t(untilMatch ? 'cl.hol.qMatch' : 'cl.hol.q')}</p>
        <p className="cx-ts-intro">{t('cl.hol.settings')}</p>
        {keys.map((k) => <button key={k} className={`cx-opt ${set[k] ? 'on' : ''}`} onClick={() => toggle(k)}>{t(`cl.hol.${k}`)}</button>)}
      </div>
      <div className="cx-ts-buttons cx-dlg-foot"><button onClick={onClose}>{t('common.no')}</button><button className="primary" onClick={() => onGo(set)}>{t('common.yes')}</button></div>
    </div>
  );
}

/**
 * Baggrunden til en skærm (som CM 01/02's pics.cfg): klubbens skærme = stadion udefra eller klubbens billede, turneringer =
 * turneringens billede, landshold = landets, træning/bestyrelse/transfer = deres egne og resten af ugen ens egen klub og
 * hverdagen (træningsbanen, bestyrelseslokalet). null = intet billede (så bruges den gamle Sunday League-pakke).
 */
function screenBackground(g: GameState, route: Route, iso: string): string | null {
  if (sundayLeague()) return null;
  const own = g.clubs[g.userClub];
  // ugens øvrige skærme (nyheder m.m.): skiftevis klubben, træningsbanen, transfermarkedet og bestyrelseslokalet
  const k = Math.floor(Date.parse(`${iso}T12:00:00Z`) / 86400000) % 4;
  const week = () => (k === 0 ? clubBgUrl(own, iso) : k === 1 ? miscBgUrl('training', iso, 3) : k === 2 ? miscBgUrl('transfer', iso, 1) : miscBgUrl('boardroom', iso)) ?? clubBgUrl(own, iso) ?? miscBgUrl('training', iso);
  return specificBackground(g, route, iso) ?? week();
}

function specificBackground(g: GameState, route: Route, iso: string): string | null {
  const id = (route as { id?: string | number }).id;
  const own = g.clubs[g.userClub];
  const clubOf = (n: number) => g.clubs[n];
  switch (route.name) {
    case 'club': case 'clubhistory': return clubBgUrl(clubOf(Number(id ?? g.userClub)), iso);
    case 'player': { const p = g.players[Number(id)]; return clubBgUrl(p?.club ? clubOf(p.club) : undefined, iso) ?? nationBgUrl(g.nations[p?.nation ?? -1]?.name, iso); }
    case 'competitions': case 'fixtures': {
      const c = id !== undefined ? g.comps[String(id)] : own ? g.comps[own.league] : undefined;
      return compBgUrl(c?.name, iso) ?? (c?.nation === -1 ? compBgUrl(c.id === 'CL' ? 'UEFA Champions League' : c.name.includes('Europa') ? 'UEFA Europa League' : c.name, iso) : null);
    }
    case 'international': case 'intlday': return id !== undefined ? nationBgUrl(g.nations[Number(id)]?.name, iso) : compBgUrl('FIFA World Cup', iso);
    case 'coefficients': return compBgUrl('UEFA Champions League', iso);
    case 'training': return miscBgUrl('training', iso);
    case 'board': case 'finance': return miscBgUrl('boardroom', iso) ?? clubBgUrl(own, iso);
    case 'transfers': case 'scouting': case 'find': return miscBgUrl('transfer', iso);
    case 'squad': case 'tactics': case 'assistant': return clubBgUrl(own, iso) ?? miscBgUrl('training', iso);
    default: return null;
  }
}

/** Turneringens logo og navn (kampens sidebjælke) */
function CompBadge({ id }: { id: string }) {
  const g = gs();
  const c = g.comps[id];
  const [failed, setFailed] = useState(false);
  const url = compLogoUrl(id, realCompName(c.name)) ?? (c.nation === -1 && /europa|uefa cup/i.test(c.name) ? compLogoUrl('UEFA', undefined) : null);
  return (
    <div className="cx-side-comp">
      {url && !failed && <img src={url} alt="" onError={() => setFailed(true)} />}
      <span>{compName(c.name)}</span>
    </div>
  );
}
