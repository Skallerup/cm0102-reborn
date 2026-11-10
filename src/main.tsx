import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './ui/App';
import './styles.css';
import { applyTheme } from './ui/theme';
import { ensureLang, getLang, t } from './i18n';
import './ui/notify'; // fanger browserens "kan installeres"-signal tidligt
import { startPresence } from './online/notify';
import { startErrorReport } from './online/errors';
import { ErrorBoundary } from './ui/ErrorBoundary';

// kun i udvikling: adgang til spiltilstanden fra konsollen/Playwright-tests (advance spoler dage frem)
// (motoren hentes dynamisk, så forsidens bundle ikke indeholder den – se ui/App.tsx; t findes med det samme)
if (import.meta.env.DEV) {
  const cm: Record<string, unknown> = { t };
  (window as unknown as { __cm: unknown }).__cm = cm;
  void Promise.all([import('./game/state'), import('./game/sim'), import('./game/dates'), import('./game/press')]).then(([{ gs, notify }, { runUntil }, { addDays }, { invitePress }]) => {
    Object.assign(cm, { gs, notify, advance: (days: number) => runUntil({ untilDate: addDays(gs().date, days), autoPlay: true }).then(() => notify()), invitePress });
  });
}

applyTheme();
registerSW({ immediate: true });
startPresence(); // "online" i admin
startErrorReport(); // fejl i browseren → admin (Errors)

// hent det valgte sprogs tekster (spansk, fransk … ligger i egne filer), før siden tegnes
void ensureLang(getLang()).finally(() => createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary><App /></ErrorBoundary>
  </StrictMode>,
));
