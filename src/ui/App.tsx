import { useEffect, useState } from 'react';
import type { Lang } from '../game/types';
import { getLang, t } from '../i18n';
import { NavProvider, useGame } from './core';
import { notify } from '../game/state';
import { getLast, forgetLast, loadGame } from '../game/save';
import { openSession, savedRooms } from '../online/client';
import { Shell } from './Shell';
import { Start } from './Start';
import { loadLogos } from './logos';

void loadLogos().then(() => notify());

export default function App() {
  const g = useGame();
  const [lang, setLangState] = useState<Lang>(getLang());
  const [resuming, setResuming] = useState(() => !new URLSearchParams(location.search).get('room') && !!getLast());

  // Genoptag det seneste spil efter en genindlæsning
  useEffect(() => {
    if (!resuming) return;
    const last = getLast();
    (async () => {
      try {
        if (last?.kind === 'local') {
          if (!(await loadGame(last.id))) forgetLast();
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
  if (!g) return <Start key={lang} onLang={setLangState} />;
  return (
    <NavProvider key={`${g.id}-${g.lang}`} initial={{ name: g.pendingFixture ? 'match' : 'inbox', id: g.pendingFixture ?? undefined }}>
      <Shell />
    </NavProvider>
  );
}
