import { useEffect, useState } from 'react';
import type { GameState, Lang } from '../game/types';
import { getLang, t } from '../i18n';
import { NavProvider, useGame, type Route } from './core';
import { applyTheme } from './theme';
import { notify } from '../game/state';
import { getLast, forgetLast, loadGame } from '../game/save';
import { openSession, savedRooms } from '../online/client';
import { Shell } from './Shell';
import { Start } from './Start';
import { Landing } from './Landing';
import { loadLogos } from './logos';

void loadLogos().then(() => notify());

export default function App() {
  const g = useGame();
  // temaet skifter, når et spil indlæses eller lukkes
  const inGame = !!g;
  useEffect(() => { applyTheme(); }, [inGame]);
  const [lang, setLangState] = useState<Lang>(getLang());
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

  if (resuming && !g) return <div className="progress"><div>{t('start.resuming')}</div></div>;
  if (!g && landing) return <Landing key={lang} onPlay={play} onLang={setLangState} />;
  if (!g) return <Start key={lang} onLang={setLangState} onHome={home} />;
  return (
    <NavProvider key={`${g.id}-${g.lang}`} initial={{ name: g.pendingFixture ? 'match' : 'inbox', id: g.pendingFixture ?? undefined }}
      storageKey={`cm-nav:${g.id}`} valid={(r) => validRoute(g, r)}>
      <Shell />
    </NavProvider>
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
