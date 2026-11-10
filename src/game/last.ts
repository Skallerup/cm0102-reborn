// Det seneste spil (så en genindlæsning fortsætter hvor man slap). Ligger for sig selv, uden spilmotoren,
// så forsiden kan afgøre, om der skal genoptages, uden at hente hele spillet (se ui/App.tsx).
export type LastGame = { kind: 'local'; id: string } | { kind: 'online'; code: string };
const LAST_KEY = 'cm0102.last';

export function rememberLast(l: LastGame) {
  try { localStorage.setItem(LAST_KEY, JSON.stringify(l)); } catch { /* ignore */ }
}

export function getLast(): LastGame | null {
  try { return JSON.parse(localStorage.getItem(LAST_KEY) ?? 'null') as LastGame | null; } catch { return null; }
}

export function forgetLast() {
  try { localStorage.removeItem(LAST_KEY); } catch { /* ignore */ }
}
