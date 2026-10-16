import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { addDays } from '../game/dates';
import { saveGame } from '../game/save';
import { continueGame, runUntil } from '../game/sim';
import { gs, notify, setGame } from '../game/state';
import { dateFmt, money, t } from '../i18n';
import { Crest, Modal } from './components';
import { Lobby, OnlineControls } from './Online';
import { closeSession, session } from '../online/client';
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
import { Jobs } from './screens/Jobs';
import { Options } from './screens/Options';

const MENU: [ScreenName, string][] = [
  ['inbox', 'nav.inbox'], ['squad', 'nav.squad'], ['tactics', 'nav.tactics'], ['training', 'nav.training'],
  ['fixtures', 'nav.fixtures'], ['competitions', 'nav.competitions'], ['transfers', 'nav.transfers'], ['scouting', 'nav.scouting'],
  ['assistant', 'nav.assistant'], ['staff', 'nav.staff'], ['finance', 'nav.finance'], ['club', 'nav.club'],
];
const MENU2: [ScreenName, string][] = [['history', 'nav.history'], ['jobs', 'nav.jobs'], ['options', 'nav.options']];
const UNEMPLOYED: ScreenName[] = ['inbox', 'competitions', 'jobs', 'history', 'options', 'transfers'];

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
  const lastSaveMonth = useRef(g.date.slice(0, 7));

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(id);
  }, [toast]);

  const online = session();
  const autosave = async () => {
    if (online) return;
    const month = gs().date.slice(0, 7);
    if (gs().options.autosave && month !== lastSaveMonth.current) {
      lastSaveMonth.current = month;
      await saveGame();
    }
  };

  const handle = (r: { match?: number; stop?: string }) => {
    notify();
    if (r.match !== undefined) nav({ name: 'match', id: r.match });
    else if (r.stop) nav({ name: 'inbox' });
    void autosave();
  };

  const onContinue = () => {
    if (g.pendingFixture) { nav({ name: 'match', id: g.pendingFixture }); return; }
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
            <button className="primary continue" onClick={onContinue}>{g.pendingFixture ? t('top.toTheMatch') : t('top.continue')}</button>
          </>
        )}
      </div>
      <nav className={`sidenav ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)}>
        {items.map(([k, label]) => (
          <button key={k} className={route.name === k ? 'on' : ''} onClick={() => nav({ name: k })}>
            {t(label)}
            {k === 'inbox' && unread > 0 && <span className="badge">{unread}</span>}
            {k === 'transfers' && g.offers.some((o) => o.status === 'pending' && o.seller === g.userClub) && <span className="badge">!</span>}
          </button>
        ))}
        <div className="sep" />
        {MENU2.map(([k, label]) => (
          <button key={k} className={route.name === k ? 'on' : ''} onClick={() => nav({ name: k })}>
            {t(label)}
            {k === 'jobs' && g.jobOffers.length > 0 && <span className="badge">{g.jobOffers.length}</span>}
          </button>
        ))}
        <div className="sep" />
        {!online && <button onClick={async () => { await saveGame(); setToast(t('top.saved')); }}>{t('nav.save')}</button>}
        <button onClick={async () => {
          if (online) { if (confirm(t('mp.leaveConfirm'))) { closeSession(); setGame(null); } return; }
          if (confirm(t('top.quitConfirm'))) { await saveGame(); setGame(null); }
        }}>{t('nav.quit')}</button>
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
    case 'jobs': return <Jobs />;
    case 'options': return <Options />;
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
