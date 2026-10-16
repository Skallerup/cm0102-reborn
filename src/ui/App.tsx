import { useState } from 'react';
import type { Lang } from '../game/types';
import { getLang } from '../i18n';
import { NavProvider, useGame } from './core';
import { notify } from '../game/state';
import { Shell } from './Shell';
import { Start } from './Start';
import { loadLogos } from './logos';

void loadLogos().then(() => notify());

export default function App() {
  const g = useGame();
  const [lang, setLangState] = useState<Lang>(getLang());
  if (!g) return <Start key={lang} onLang={setLangState} />;
  return (
    <NavProvider key={`${g.id}-${g.lang}`} initial={{ name: g.pendingFixture ? 'match' : 'inbox', id: g.pendingFixture ?? undefined }}>
      <Shell />
    </NavProvider>
  );
}
