import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './ui/App';
import './styles.css';
import { gs, notify } from './game/state';

// kun i udvikling: adgang til spiltilstanden fra konsollen/Playwright-tests
if (import.meta.env.DEV) (window as unknown as { __cm: unknown }).__cm = { gs, notify };

registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
