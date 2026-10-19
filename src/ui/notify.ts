// Browser-notifikationer: når det er ens tur i multiplayer, eller der sker noget vigtigt,
// mens fanen ikke er i fokus. Valget gemmes i browseren.
const KEY = 'cm-notify';

export function notifySupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function notifyEnabled(): boolean {
  try { return notifySupported() && Notification.permission === 'granted' && localStorage.getItem(KEY) === '1'; } catch { return false; }
}

/** Slå til (spørger browseren om lov) eller fra */
export async function setNotify(on: boolean): Promise<boolean> {
  try {
    if (!on) { localStorage.setItem(KEY, '0'); return false; }
    if (!notifySupported()) return false;
    const perm = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
    localStorage.setItem(KEY, perm === 'granted' ? '1' : '0');
    return perm === 'granted';
  } catch { return false; }
}

/** Vis en notifikation, hvis brugeren har slået det til, og fanen ikke er i fokus */
export function notifyUser(title: string, body: string, tag: string) {
  if (!notifyEnabled() || (document.visibilityState === 'visible' && document.hasFocus())) return;
  try {
    const n = new Notification(title, { body, tag, icon: `${import.meta.env.BASE_URL}icon-192.png` });
    n.onclick = () => { window.focus(); n.close(); };
  } catch { /* fx iOS uden PWA */ }
}
