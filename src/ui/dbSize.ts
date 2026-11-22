// Originalens databasestørrelse (Preferences → " Database": knapperne Normal / Minimum / Maximum 0x8248c2–0x824a80 sætter game.cfg +4 = 1 / 2 / 4;
// 0x524d70 database_trim beholder færre personer i hukommelsen ved 1/2 – 2 = Minimum springer reglerne 0x5257cd–0x525852 over og er den mindste).
// CM Reborn har Minimum (størrelse 2 – den, oraklet kører med; id 'normal' og world-original-normal.json af historiske grunde, vist som "Minimum")
// og Maximum (ejerens CM 01/02); originalens Normal (1) er ikke porteret. (Hukommelse, iPhone 22/11) Telefoner og apps' indbyggede browsere starter med Minimum – og en browser, der har lukket
// siden under et nyt spil (online/errors.ts NewGameInterrupted), får Minimum næste gang (den mindste – ingen mindre at falde tilbage til). Kun den
// originale 3.9.60-database findes i Minimum.
// (Ingen motor-imports: forsiden og errors.ts bruger modulet.)
export type DbSize = 'normal' | 'maximum';
export const DB_SIZES: DbSize[] = ['normal', 'maximum'];
const KEY = 'cm0102.dbsize', WHY = 'cm0102.dbsize.why';

const UA = typeof navigator === 'undefined' ? '' : navigator.userAgent;
/** telefon/tablet, en apps indbyggede browser eller lidt hukommelse (navigator.deviceMemory ≤ 4 GB) */
export function smallDevice(): boolean {
  if (/iPhone|iPad|iPod|Android|Mobile|; wv\)|FBAN|FBAV|FB_IAB|Instagram|Messenger|Discord|TikTok|Snapchat|MicroMessenger|GSA\//i.test(UA)) return true;
  // iPadOS viser sig som Mac
  if (typeof navigator !== 'undefined' && /Macintosh/.test(UA) && (navigator.maxTouchPoints ?? 0) > 1) return true;
  const dm = typeof navigator !== 'undefined' ? (navigator as { deviceMemory?: number }).deviceMemory : undefined;
  return dm !== undefined && dm <= 4;
}

const get = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const set = (k: string, v: string | null) => { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch { /* ingen lagring */ } };

/** den valgte størrelse – uden valg: Normal på små enheder, ellers Maximum */
export function readDbSize(): DbSize {
  const v = get(KEY);
  if (v === 'normal' || v === 'maximum') return v;
  return smallDevice() ? 'normal' : 'maximum';
}
/** spilleren vælger selv (Preferences) */
export function writeDbSize(s: DbSize): void { set(KEY, s); set(WHY, null); }
/** hvorfor Normal er valgt for spilleren: 'interrupted' (browseren lukkede et nyt spil), 'device' (telefon/indbygget browser) – null = eget valg/Maximum */
export function dbSizeReason(): 'interrupted' | 'device' | null {
  if (readDbSize() !== 'normal') return null;
  if (get(WHY) === 'interrupted') return 'interrupted';
  return get(KEY) === null && smallDevice() ? 'device' : null;
}
/** browseren lukkede siden under et nyt spil: næste spil med Normal (spørger ikke – undgår at spilleren genindlæser i en løkke) */
export function dbSizeAfterInterrupt(): void { set(KEY, 'normal'); set(WHY, 'interrupted'); }
