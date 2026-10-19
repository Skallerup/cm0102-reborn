import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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

const MENU: [ScreenName, string][] = [
  ['inbox', 'nav.inbox'], ['squad', 'nav.squad'], ['tactics', 'nav.tactics'], ['training', 'nav.training'],
  ['fixtures', 'nav.fixtures'], ['competitions', 'nav.competitions'], ['transfers', 'nav.transfers'], ['scouting', 'nav.scouting'],
  ['assistant', 'nav.assistant'], ['staff', 'nav.staff'], ['finance', 'nav.finance'], ['club', 'nav.club'],
];
const MENU2: [ScreenName, string][] = [['ranking', 'nav.ranking'], ['awards', 'nav.awards'], ['history', 'nav.history'], ['jobs', 'nav.jobs'], ['help', 'nav.help'], ['options', 'nav.options']];
const UNEMPLOYED: ScreenName[] = ['inbox', 'competitions', 'jobs', 'history', 'options', 'transfers', 'awards', 'ranking', 'help', 'managers'];

export function Shell() {
  const g = useGame()!;
  const { route, nav } = useNav();
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

  // AI-artikler (kamprapporter m.m.) skrives i baggrunden, så de er klar når beskeden åbnes
  const newestNews = g.news[0]?.id;
  useEffect(() => { if (newestNews !== undefined) prefetchArticles(); }, [newestNews, g.userClub]);

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
      const btn = document.querySelector<HTMLButtonElement>('.main .continue:not(:disabled)') ?? document.querySelector<HTMLButtonElement>('.topbar .continue:not(:disabled)');
      btn?.click();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
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
    if (r.match !== undefined) nav({ name: 'match', id: r.match });
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
    if (g.pendingFixture) { nav({ name: 'match', id: g.pendingFixture }); return; }
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
    const r = await runUntil({ ...opts, shouldStop: () => stopRef.current, onProgress: (d) => { if (Date.now() - t0 > 300) setRunning(dateFmt(d)); } });
    setRunning(null);
    if (r.stop === 'news') { notify(); return r; }
    handle(r);
    return r;
  };

  const items = MENU.filter(([k]) => g.userClub || UNEMPLOYED.includes(k));
  const nextMatch = club ? Object.values(g.fixtures).filter((f) => !f.result && (f.home === g.userClub || f.away === g.userClub)).sort((a, b) => a.date.localeCompare(b.date))[0] : undefined;

  return (
    <div className="shell">
      <div className="topbar">
        <button className="menu-toggle small" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        <div className="club">
          {club ? <><Crest id={club.id} size={22} />{club.name}</> : <span className="muted">{online && !online.inGame ? t('mp.lobby') : t('top.unemployed')}</span>}
        </div>
        <div className="date">{dateFmt(g.date, true)}</div>
        {club && <div className="money">{t('top.balance')}: {money(club.balance)} · {t('top.budget')}: {money(club.transferBudget)}</div>}
        <div className="spacer" />
        <FullscreenButton />
        {nextMatch && <span className="muted nowrap">{t('top.next')}: {g.clubs[nextMatch.home === g.userClub ? nextMatch.away : nextMatch.home]?.short} ({dateFmt(nextMatch.date)})</span>}
        {online ? <OnlineControls /> : (
          <>
            <button onClick={() => run({ untilMatch: true })} title={t('top.toMatchHint')}>{t('top.toMatch')}</button>
            <button className="primary continue" onClick={onContinue} title={unreadImportant ? t('top.continueUnread', { n: unreadImportant }) : t('top.continueHint')}>{g.pendingFixture ? t('top.toTheMatch') : t('top.continue')}{!g.pendingFixture && unreadImportant > 0 && <span className="cont-badge">{unreadImportant}</span>}</button>
          </>
        )}
      </div>
      <nav className={`sidenav ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)}>
        {items.map(([k, label]) => (
          <button key={k} className={route.name === k ? 'on' : ''} onClick={() => nav({ name: k })}>
            <Icon name={k} />{t(label)}
            {k === 'inbox' && unread > 0 && <span className="badge">{unread}</span>}
            {k === 'transfers' && g.offers.some((o) => o.status === 'pending' && o.seller === g.userClub) && <span className="badge">!</span>}
          </button>
        ))}
        <div className="sep" />
        {g.humans && g.humans.length > 1 && (
          <button className={route.name === 'managers' ? 'on' : ''} onClick={() => nav({ name: 'managers' })}>
            <Icon name="managers" />{t('nav.managers')}
            {chatUnread > 0 && <span className="badge">{chatUnread}</span>}
          </button>
        )}
        {MENU2.map(([k, label]) => (
          <button key={k} className={route.name === k ? 'on' : ''} onClick={() => nav({ name: k })}>
            <Icon name={k} />{t(label)}
            {k === 'jobs' && g.jobOffers.length > 0 && <span className="badge">{g.jobOffers.length}</span>}
          </button>
        ))}
        <div className="sep" />
        {!online && <button onClick={async () => { await saveGame(); setToast(t('top.saved')); }}><Icon name="save" />{t('nav.save')}</button>}
        <button onClick={async () => {
          if (online) { if (confirm(t('mp.leaveConfirm'))) { closeSession(); forgetLast(); setGame(null); } return; }
          if (confirm(t('top.quitConfirm'))) { await saveGame(); forgetLast(); setGame(null); }
        }}><Icon name="quit" />{t('nav.quit')}</button>
        <VersionButton />
      </nav>
      <main className="main" ref={mainRef}>
        {online && !online.inGame ? <Lobby /> : <Screen />}
        {online?.status === 'error' && <div className="toast">{online.error}</div>}
      </main>
      {online && (online.status === 'processing' || online.status === 'loading') && (
        <div className="progress"><div>{online.status === 'processing' ? t('mp.processing') : t('mp.loading')}</div></div>
      )}
      {running && (
        <div className="progress">
          <div>{t('top.running')} {running}</div>
          <button onClick={() => { stopRef.current = true; }}>{t('common.stop')}</button>
        </div>
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function Screen() {
  const { route } = useNav();
  switch (route.name) {
    case 'inbox': return <Inbox />;
    case 'squad': return <Squad />;
    case 'player': return <PlayerScreen id={Number(route.id)} />;
    case 'tactics': return <Tactics />;
    case 'training': return <Training />;
    case 'fixtures': return <Fixtures />;
    case 'competitions': return <Competitions id={route.id as string | undefined} />;
    case 'transfers': return <Transfers tab={route.tab} />;
    case 'scouting': return <Scouting />;
    case 'staff': return <StaffScreen />;
    case 'finance': return <Finance />;
    case 'club': return <ClubScreen id={route.id as number | undefined} />;
    case 'assistant': return <Assistant tab={route.tab} />;
    case 'compare': return <Assistant tab="compare" />;
    case 'benchmark': return <Assistant tab="bench" />;
    case 'match': return <MatchScreen id={Number(route.id)} />;
    case 'report': return <ReportScreen id={Number(route.id)} />;
    case 'history': return <History />;
    case 'awards': return <Awards />;
    case 'jobs': return <Jobs />;
    case 'options': return <Options />;
    case 'press': return <PressScreen />;
    case 'ranking': return <RankingScreen />;
    case 'managers': return <ManagersScreen />;
    case 'help': return <HelpScreen id={route.id as string | undefined} />;
  }
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
    <button className="small" title={on ? t('top.exitFullscreen') : t('top.fullscreen')} aria-label={on ? t('top.exitFullscreen') : t('top.fullscreen')}
      onClick={() => { if (document.fullscreenElement) void document.exitFullscreen(); else void document.documentElement.requestFullscreen(); }}>
      {on ? '⤡' : '⛶'}
    </button>
  );
}
