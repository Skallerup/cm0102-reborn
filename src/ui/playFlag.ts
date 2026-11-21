// "Spil er trykket i denne fane" (forsiden → spillets menu). Ligger i sessionStorage, men med en hukommelseskopi: i indbyggede browsere
// (Facebook, Instagram …) og private vinduer kan sessionStorage kaste – så viste spillet forsiden igen efter tryk på Spil (21/11).
// Et installeret spil (hjemmeskærm/app-vindue) springer forsiden over: det åbner direkte i spillets menu. Ingen motor-imports (forsidens bundle).
const KEY = 'cm0102.play';
let mem = false;

/** Kører spillet som installeret app (iOS hjemmeskærm / Chrome app-vindue)? */
export function standaloneApp(): boolean {
  try { return window.matchMedia?.('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true; } catch { return false; }
}

export function playMarked(): boolean {
  if (mem || standaloneApp()) return true;
  try { return sessionStorage.getItem(KEY) === '1'; } catch { return false; }
}

export function markPlay() {
  mem = true;
  try { sessionStorage.setItem(KEY, '1'); } catch { /* hukommelseskopien gælder */ }
}

export function clearPlay() {
  mem = false;
  try { sessionStorage.removeItem(KEY); } catch { /* ignorer */ }
}
