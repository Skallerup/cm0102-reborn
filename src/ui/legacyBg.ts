import { useEffect } from 'react';
import { getTheme, setStartSkin } from './theme';

/** Sider uden for spillet (editor, netværksspil, fællesskab): det klassiske skin og originalens baggrundsbillede som i startmenuen (klassen .cxl i classic.css) */
export function useLegacyBg() {
  useEffect(() => {
    document.documentElement.style.setProperty('--cx-photo', `url("${import.meta.env.BASE_URL}original-bg/324855.webp")`);
  }, []);
  // køres ved hver tegning: ClassicStart slår skinnet fra, når den forlades, mens Start stadig vises
  useEffect(() => {
    if (getTheme() !== 'retro') return;
    if (document.documentElement.dataset.skin !== 'retro') setStartSkin(true);
  });
  useEffect(() => () => setStartSkin(false), []);
}
