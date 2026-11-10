import { useEffect, useState } from 'react';
import { DraftLanding } from './DraftLanding';
import { DraftRoom, draftSeen } from './Draft';
import type { GameState, Lang } from '../game/types';
import { getLang, t } from '../i18n';
import { NavProvider, useGame, type Route } from './core';
import { applyTheme, getTheme, setTheme } from './theme';
import { hasGame, notify, previewInfo } from '../game/state';
import { forgetLast, loadGame } from '../game/save';
import { getLast } from '../game/last';
import { openSession, savedRooms, session } from '../online/client';
import { Shell } from './Shell';
import { Start } from './Start';
import { Landing } from './Landing';
import { PublicProfilePage } from './Achievements';
import { PublicCommunityPage } from './Community';
import { AdminPage } from './Admin';
import type { HubTab } from './CommunityHub';
import { loadLogos } from './logos';
import { ConsentBanner } from './ConsentBanner';
import { InAppBanner } from './InAppBanner';
import { ConfirmHost } from './confirm'; // bekræftelsesdialogerne bruges kun i spillet (og confirm.tsx trækker det klassiske tema med)
import '../online/cloudSync'; // gemte spil i skyen, når man er logget ind
import { useLoginLink } from './Login';
import { trackPage } from '../analytics';

void loadLogos().then(() => notify());

/** Spillet og alle de tunge sider – hentes af ui/App.tsx, når forsiden ikke er nok (lazy) */
export default function AppPage() {
  // login via linket i mailen (?login=…)
  const [toast, setToast] = useState('');
  useLoginLink((m) => { setToast(m); setTimeout(() => setToast(''), 6000); });
  return <><AppInner /><ConsentBanner /><InAppBanner /><ConfirmHost />{toast && <div className="acc-toast" role="status" onClick={() => setToast('')}>{toast}</div>}</>;
}

function AppInner() {
  const g = useGame();
  // temaet skifter, når et spil indlæses eller lukkes
  const inGame = !!g;
  useEffect(() => { applyTheme(); }, [inGame]);
  const [lang, setLangState] = useState<Lang>(getLang());
  // et sprog, der hentes efter et sprogskift: tegn alt igen, når teksterne er kommet
  const [, setLangTick] = useState(0);
  useEffect(() => {
    const on = () => { setLangTick((x) => x + 1); setLangState(getLang()); if (hasGame()) notify(); };
    window.addEventListener('cm-lang', on);
    return () => window.removeEventListener('cm-lang', on);
  }, []);
  // offentlig managerprofil (delt link: ?manager=<id>)
  const [managerParam, setManagerParam] = useState(() => new URLSearchParams(location.search).get('manager') ?? '');
  // draft-ligaens egen landingsside (?draft=1)
  const [draftPage, setDraftPage] = useState(() => new URLSearchParams(location.search).get('draft') === '1');
  const [adminParam, setAdminParam] = useState(() => new URLSearchParams(location.search).get('admin') === '1');
  // offentlig fællesskabsside (?community=1 eller ?suggestion=ID)
  const [communityParam, setCommunityParam] = useState(() => { const q = new URLSearchParams(location.search); return q.get('suggestion') ? Number(q.get('suggestion')) : q.get('community') || q.get('hall') ? 0 : -1; });
  // delt karriere i Hall of Fame (?hall=ID) og en bestemt fane (?community=1&tab=skins)
  const hallParam = Number(new URLSearchParams(location.search).get('hall')) || undefined;
  const tabParam = (new URLSearchParams(location.search).get('tab') ?? undefined) as HubTab | undefined;
  const [resuming, setResuming] = useState(() => !new URLSearchParams(location.search).get('room') && !!getLast());
  // forsiden vises for nye besøgende (ikke ved invitationslinks eller når man har trykket "Spil" i denne fane)
  const [landing, setLanding] = useState(() => {
    try { return !new URLSearchParams(location.search).get('room') && sessionStorage.getItem('cm0102.play') !== '1'; } catch { return true; }
  });
  const play = () => {
    try { sessionStorage.setItem('cm0102.play', '1'); } catch { /* ignorer */ }
    setLanding(false);
    window.scrollTo(0, 0);
  };
  const home = () => {
    try { sessionStorage.removeItem('cm0102.play'); } catch { /* ignorer */ }
    setLanding(true);
  };

  // Genoptag det seneste spil efter en genindlæsning
  useEffect(() => {
    if (!resuming) return;
    const last = getLast();
    (async () => {
      try {
        if (last?.kind === 'local') {
          if (!(await loadGame(last.id))) {
            forgetLast();
            // var det en lokal kopi af et online-spil, så åbn det seneste online-spil i stedet
            const room = savedRooms()[0];
            if (room) await openSession(room);
          }
        } else if (last?.kind === 'online') {
          const creds = savedRooms().find((r) => r.code === last.code);
          if (creds) await openSession(creds);
          else forgetLast();
        }
      } catch {
        forgetLast();
      }
      setResuming(false);
    })();
  }, [resuming]);

  // sidevisninger til statistik og canonical-link til søgemaskiner
  const ds = session();
  const page = adminParam ? '' : communityParam >= 0 ? 'community' : managerParam ? 'manager' : resuming && !g ? '' : ds?.room?.draft ? 'draft-room'
    : !g && draftPage ? 'draft' : !g && landing ? 'landing' : !g ? 'start' : 'game';
  const canonical = page === 'draft' ? '?draft=1' : page === 'community' ? '?community=1' : '';
  useEffect(() => { if (page) trackPage(page, canonical); }, [page, canonical]);

  if (adminParam) return <AdminPage onClose={() => { history.replaceState(null, '', location.pathname); setAdminParam(false); }} />;
  if (communityParam >= 0) return <PublicCommunityPage id={communityParam || undefined} hallId={hallParam} tab={tabParam} onClose={() => { history.replaceState(null, '', location.pathname); setCommunityParam(-1); }} />;
  if (managerParam) return <PublicProfilePage pid={managerParam} onClose={() => { history.replaceState(null, '', location.pathname); setManagerParam(''); }} />;
  if (resuming && !g) return <div className="progress"><div>{t('start.resuming')}</div></div>;
  // draft-liga: lobby, keepers og draft vises, indtil sæsonen er bygget
  if (ds?.room?.draft && (ds.room.draft.phase !== 'playing' || !g || !draftSeen(ds.creds.code, ds.room.draft.season))) return <DraftRoom />;
  if (!g && draftPage) return <DraftLanding key={lang} onLang={setLangState} onBack={() => { history.replaceState(null, '', location.pathname); setDraftPage(false); window.scrollTo(0, 0); }} onCreate={() => { history.replaceState(null, '', `${location.pathname}?newdraft=1`); setDraftPage(false); play(); }} />;
  if (!g && landing) return <Landing key={lang} onPlay={play} onLang={setLangState} onDraft={() => { history.replaceState(null, '', `${location.pathname}?draft=1`); setDraftPage(true); window.scrollTo(0, 0); }} />;
  if (!g) return <Start key={lang} onLang={setLangState} onHome={home} />;
  return (<>
    {previewInfo() && <PreviewBar />}
    <NavProvider key={`${g.id}-${g.lang}`} initial={{ name: g.pendingFixture ? 'match' : 'inbox', id: g.pendingFixture ?? undefined }}
      storageKey={`cm-nav:${g.id}`} valid={(r) => validRoute(g, r)}>
      <Shell />
    </NavProvider>
  </>);
}

/** Admin-preview af en spillers spil: altid synlig bjælke – intet gemmes; Exit genindlæser admin (preview-spillet forsvinder) */
function PreviewBar() {
  const p = previewInfo()!;
  const [, tick] = useState(0);
  const retro = getTheme() === 'retro';
  return (
    <div className="preview-bar" role="status">
      <b>👁 PREVIEW</b><span className="pv-label">{p.label}</span><span className="pv-note">not saved</span>
      <button onClick={() => { setTheme(retro ? 'club' : 'retro'); tick((x) => x + 1); notify(); }}>{retro ? 'Modern' : 'Classic'}</button>
      <button onClick={() => { location.href = `${location.pathname}?admin=1`; }}>✕ Exit</button>
    </div>
  );
}

/** Findes det, en gemt side peger på, stadig (fx efter at have indlæst et ældre gemt spil)? */
function validRoute(g: GameState, r: Route): boolean {
  const id = Number(r.id);
  if (r.name === 'player') return !!g.players[id];
  if (r.name === 'club') return !!g.clubs[id];
  if (r.name === 'report') return !!g.reports[id];
  if (r.name === 'match') return !!g.fixtures[id];
  return true;
}
