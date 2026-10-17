import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { addDays } from '../game/dates';
import { flushAutosave, forgetLast, saveGame, scheduleAutosave } from '../game/save';
import { continueGame, runUntil } from '../game/sim';
import { gs, hasGame, notify, setGame, subscribe } from '../game/state';
import { dateFmt, money, t } from '../i18n';
import { Crest, Modal } from './components';
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

const MENU: [ScreenName, string][] = [
  ['inbox', 'nav.inbox'], ['squad', 'nav.squad'], ['tactics', 'nav.tactics'], ['training', 'nav.training'],
  ['fixtures', 'nav.fixtures'], ['competitions', 'nav.competitions'], ['transfers', 'nav.transfers'], ['scouting', 'nav.scouting'],
  ['assistant', 'nav.assistant'], ['staff', 'nav.staff'], ['finance', 'nav.finance'], ['club', 'nav.club'],
];
const MENU2: [ScreenName, string][] = [['ranking', 'nav.ranking'], ['awards', 'nav.awards'], ['history', 'nav.history'], ['jobs', 'nav.jobs'], ['options', 'nav.options']];
const UNEMPLOYED: ScreenName[] = ['inbox', 'competitions', 'jobs', 'history', 'options', 'transfers', 'awards', 'ranking'];

export function Shell() {
  const g = useGame()!;
  const { route, nav } = useNav();
  const [menuOpen, setMenuOpen] = useState(false);
  const [running, setRunning] = useState<string | null>(null);
  const [holiday, setHoliday] = useState(false);
  const [toast, setToast] = useState('');
  const stopRef = useRef(false);
  const mainRef = useRef<HTMLElement>(null);
  useEffect(() => { setScrollElement(mainRef.current); return () => setScrollElement(null); }, []);
  useLayoutEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = route.scroll ?? 0;
  }, [route]);
  const club = session() && !session()!.inGame ? undefined : g.clubs[g.userClub];
  const unread = g.news.filter((n) => !n.read).length;

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(id);
  }, [toast]);

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
    else if (r.stop) nav({ name: 'inbox' });
  };

  // Fortsæt: læs først de ulæste beskeder én ad gangen (ældste først), derefter næste dag
  const onContinue = () => {
    if (g.pendingFixture) { nav({ name: 'match', id: g.pendingFixture }); return; }
    const next = g.news.filter((n) => !n.read).pop();
    if (next) {
      act({ t: 'read', ids: [next.id] });
      focusNews(next.id);
      if (route.name !== 'inbox') nav({ name: 'inbox' });
      return;
    }
    handle(continueGame());
  };

  const run = async (opts: Parameters<typeof runUntil>[0]) => {
    stopRef.current = false;
    setRunning(dateFmt(gs().date));
    const r = await runUntil({ ...opts, shouldStop: () => stopRef.current, onProgress: (d) => { setRunning(dateFmt(d)); } });
    setRunning(null);
    handle(r);
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
            <button onClick={() => setHoliday(true)}>{t('top.holiday')}</button>
            <button className="primary continue" onClick={onContinue} title={unread ? t('top.continueUnread', { n: unread }) : undefined}>{g.pendingFixture ? t('top.toTheMatch') : t('top.continue')}{!g.pendingFixture && unread > 0 && <span className="cont-badge">{unread}</span>}</button>
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
      {holiday && <HolidayModal onClose={() => setHoliday(false)} onGo={(date) => { setHoliday(false); void run({ untilDate: date, autoPlay: true }); }} />}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function HolidayModal({ onClose, onGo }: { onClose: () => void; onGo: (date: string) => void }) {
  const g = gs();
  const [date, setDate] = useState(addDays(g.date, 14));
  return (
    <Modal title={t('holiday.title')} onClose={onClose}>
      <div className="col">
        <div className="muted">{t('holiday.text')}</div>
        <div className="row">
          {[7, 14, 30, 60].map((d) => <button key={d} onClick={() => setDate(addDays(g.date, d))}>{t('holiday.days', { n: d })}</button>)}
          <button onClick={() => setDate(`${g.season + 1}-06-30`)}>{t('holiday.season')}</button>
        </div>
        <input type="date" value={date} min={addDays(g.date, 1)} onChange={(e) => setDate(e.target.value)} />
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button onClick={onClose}>{t('common.cancel')}</button>
          <button className="primary" onClick={() => onGo(date)}>{t('holiday.go')}</button>
        </div>
      </div>
    </Modal>
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
