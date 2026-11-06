import { BoardScreen } from './screens/Board';
import type { HolidaySettings } from '../game/types';
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
import { askConfirm } from './confirm';
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { flushAutosave, forgetLast, saveGame, scheduleAutosave } from '../game/save';
import { runUntil } from '../game/sim';
import { gs, hasGame, notify, setGame, subscribe } from '../game/state';
import { dateFmt, money, t } from '../i18n';
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
import { Training } from './screens/Training';
import { Fixtures } from './screens/Fixtures';
import { Competitions } from './screens/Competitions';
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
import { backgroundUrl, loadStadiumBgs, stadiumBgUrl } from './backgrounds';
import { CompetitionsMenu, FindMenu, GameOptionsMenu, ManagerMenu, bgChanges, modernBackgrounds, stadiumBackgrounds } from './classicOptions';
import { ClassicFind } from './screens/FindClassic';
import { ClassicNation } from './screens/NationClassic';
import { MatchDay } from './screens/MatchDayClassic';
import { ClassicSlotCtx, CxDrop, classicDate, setClassicAllowed, useClassicDialogOpen, useClassicMatchSideState, useClassicNextAction, titleColors, useClassicDialog } from './classic';
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
const UNEMPLOYED: ScreenName[] = ['find', 'support', 'community', 'profile', 'inbox', 'competitions', 'jobs', 'history', 'options', 'transfers', 'awards', 'ranking', 'help', 'managers', 'nation', 'international'];

export function Shell() {
  const g = useGame()!;
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
  const stopRef = useRef(false);
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
  const cxPhoto = cmNav ? stadiumBgUrl(venue, venueFix?.date ?? g.date) ?? backgroundUrl(bgChanges() ? g.date : '2001-07-01', g.userClub) : null;
  useEffect(() => { if (cxPhoto) document.documentElement.style.setProperty('--cx-photo', `url("${cxPhoto}")`); }, [cxPhoto]);
  const matchSide = useClassicMatchSideState();
  // moderne udseende: dagens baggrundsfoto bag indholdet – på kampdage hjemmeholdets stadion
  const modernPhoto = !cmNav && !g.draft && g.userClub
    ? stadiumBgUrl(venue, venueFix?.date ?? g.date) ?? (modernBackgrounds() ? backgroundUrl(bgChanges() ? g.date : '2001-07-01', g.userClub) : null)
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
    if (g.pendingFixture) {
      const pf = g.fixtures[g.pendingFixture];
      // gammel kamp fra en klub, man ikke længere styrer (efter jobskifte): spil den automatisk
      if (!pf || pf.result || (pf.home !== g.userClub && pf.away !== g.userClub)) act({ t: 'fixPending' });
      else {
        const go = g.pendingFixture;
        // klassisk (CM 01/02): "Please Confirm – Proceed to the match ?"
        if (cmNav) { void askConfirm(t('cl.mt.proceed'), { head: t('cl.mt.confirm') }).then((ok) => { if (ok) nav({ name: 'match', id: go }); }); return; }
        nav({ name: 'match', id: go }); return;
      }
    }
    if (showOldestUnread(g.news)) return;
    // ingen ulæste: kør dage frem, indtil der sker noget (kamp, bud, ny besked …) – højst 60 dage
    void run({ untilMatch: true, untilNews: true, maxDays: 60 }).then((r) => {
      if (r.match === undefined) showOldestUnread(gs().news);
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
        const side = (k: ScreenName | null, label: string, cls = '', onClick?: () => void) => (
          <button className={`cx-sbtn ${cls} ${k && route.name === k ? 'on' : ''}`} onClick={onClick ?? (() => k && nav({ name: k }))}>{label}</button>
        );
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
              {ms.editing ? <><button className="cx-sbtn cx-continue" onClick={ma.ok}>{t('common.ok')}</button><button className="cx-sbtn" onClick={ma.cancel}>{t('common.cancel')}</button></>
                : ms.finished ? <button className="cx-sbtn cx-continue continue" onClick={ma.cont}>{t('cl.continue')}</button>
                : <button className="cx-sbtn cx-continue" onClick={ms.kicked ? ma.pause : ma.kick}>{!ms.kicked ? t('cl.mt.kickoff') : ms.paused ? t('cl.mt.resume') : t('cl.mt.pause')}</button>}
              {!ms.editing && <button className="cx-sbtn" onClick={() => ma.tactics(0)}>{t('cl.mt.tactics', { club: ms.home })}</button>}
              {!ms.editing && <button className="cx-sbtn" onClick={() => ma.tactics(1)}>{t('cl.mt.tactics', { club: ms.away })}</button>}
              {!ms.finished && !ms.editing && <CxDrop className="cx-gameopt" fixed caret={false} label={t('cl.mt.speed')} btn={{ className: 'cx-sbtn' }}
                items={[8, 4, 2, 1, 0.6, 0.35].map((n) => ({ key: String(n), label: t(`cl.mt.sp.${String(n).replace('.', '')}`), checked: ms.speed === n, onClick: () => ma.speed(n) }))} />}
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
            <ManagerMenu allowed={(k) => allowed(k as ScreenName)} onRetire={quit} onHoliday={(untilMatch) => setHoliday(untilMatch)} />
            <CompetitionsMenu />
            {club ? side('club', t('cl.nations')) : side('find', t('cl.nations'), '', () => nav({ name: 'find', tab: 'club', state: { ftab: 'club' } }))}
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
          style={!cmNav && modernPhoto ? ({ '--m-photo': `url("${modernPhoto}")` } as CSSProperties) : cmNav ? ({ '--cx-photo': `url("${stadiumBgUrl(venue, venueFix?.date ?? g.date) ?? backgroundUrl(bgChanges() ? g.date : '2001-07-01', g.userClub)}")` } as CSSProperties) : undefined}>
          {online && !online.inGame ? <Lobby /> : <Screen allowed={allowed} />}
          {online?.status === 'error' && <div className="toast">{online.error}</div>}
        </main>
      </ClassicSlotCtx.Provider>
      {cmNav && (
        <footer className="cx-foot">
          <div className="cx-sub" ref={setSubSlot} />
          {running ? (
            // simulering: én grå bjælke med datoen, der behandles (klik = stop)
            <button className="cx-running" onClick={() => { stopRef.current = true; }} title={t('common.stop')}>
              <span className="cx-ball" aria-hidden>⚽</span>
              {new Date(`${running}T12:00:00`).toLocaleDateString(t('cl.locale'), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </button>
          ) : (
            <div className="cx-backnext">
              <button className="cx-back" disabled={!canBack} onClick={back}>{t('cm.back')}</button>
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
        // ferie: 14 dage (*estimeret*) med kampene spillet automatisk, eller indtil næste kamp
        void run(holiday ? { untilMatch: true, maxDays: 120 } : { untilDate: addDays(g2.date, 14), autoPlay: true }).finally(() => { gs().manager.holiday = undefined; notify(); });
      }} />}
      {toast && <div className="toast">{toast}</div>}
      {g.draft && online && <RoomChat />}
    </div>
  );
}

function Screen({ allowed }: { allowed: (k: ScreenName) => boolean }) {
  const { route, nav } = useNav();
  // en skærm man ikke længere har adgang til (fx bestyrelsen lige efter en opsigelse): videre til jobcentret/indbakken
  const g = useGame()!;
  const blocked = !g.draft && !g.userClub && !allowed(route.name) && route.name !== 'compare' && route.name !== 'player' && route.name !== 'club' && route.name !== 'match' && route.name !== 'report' && route.name !== 'matchday';
  useEffect(() => { if (blocked) nav({ name: allowed('jobs') ? 'jobs' : 'inbox' }); }, [blocked]); // eslint-disable-line react-hooks/exhaustive-deps
  if (blocked) return null;
  switch (route.name) {
    case 'inbox': return <Inbox />;
    case 'squad': return <Squad />;
    case 'player': return <PlayerScreen id={Number(route.id)} />;
    case 'tactics': return <Tactics />;
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
    case 'report': return <ReportScreen id={Number(route.id)} />;
    case 'history': return <History />;
    case 'awards': return <Awards />;
    case 'international': return <International nation={route.id !== undefined ? Number(route.id) : undefined} />;
    case 'jobs': return <Jobs />;
    case 'options': return <Options />;
    case 'press': return <PressScreen />;
    case 'ranking': return <RankingScreen />;
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
