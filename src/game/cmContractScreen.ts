// Offer Contract-skærmens udløbsrække (CM 01/02 0x4e06e0 bygger, 0x4e2280 handlingerne, cm0102.exe 3.9.68): udløbet er måned/år (skærmparameter
// 0xb/0xc, måned 0..11), grænsen 9/0xa er hans nuværende udløb, når han er ansat i klubben (0x4defb7), ellers i dag + 32 dage (0x4df000).
// Kontraktens start (+0x25) er i dag.

/** [år, måned 0..11] */
export type YM = [number, number];
export const ymOf = (iso: string): YM => [Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1];

/** id 9 (+): år = i år + 1 og måned ≥ grænsens måned, eller senere år → et år frem; ellers en måned frem */
export function expUp([y, m]: YM, today: YM, min: YM): YM {
  if ((y === today[0] + 1 && m >= min[1]) || y > today[0] + 1) return [y + 1, m];
  return m + 1 > 11 ? [y + 1, 0] : [y, m + 1];
}
/** + er grå, når året − 10 ≥ i år ([0xa83608] = 10) */
export const expUpOff = ([y]: YM, today: YM): boolean => y - 10 >= today[0];

/** id 10 (−): år = startåret + 1 og måned efter startmåneden, eller senere år → et år tilbage; ellers en måned tilbage */
export function expDown([y, m]: YM, start: YM): YM {
  if ((y === start[0] + 1 && m > start[1]) || y > start[0] + 1) return [y - 1, m];
  return m - 1 < 0 ? [y - 1, 11] : [y, m - 1];
}
/** − er grå, når det næste er på/før grænsen (0x4e2bf4); ved udløbet én måned efter starten bliver − handlingen 0x1d (ikke porteret – grå her) */
export function expDownOff(cur: YM, start: YM, min: YM): boolean {
  const [y, m] = expDown(cur, start);
  if (y < min[0] || (y === min[0] && m <= min[1])) return true;
  return (cur[0] === start[0] && cur[1] === start[1] + 1) || (cur[0] === start[0] + 1 && cur[1] === 0 && start[1] === 11);
}

/** udløbsdatoen (0x4e0180): dag = startdagen, højst 28 */
export function expIso([y, m]: YM, today: string): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(Math.min(28, Number(today.slice(8, 10)))).padStart(2, '0')}`;
}

/** Kontraktskærmens rullelister (Offer Contract 0x4e06e0, spillere og stab): lønnen (ids 7/8 i 0x4e2280 – valget skriver kontraktens +0xc) og
 *  Signing On Fee (id 25 – valget skriver +8, højst skærmparameter 0x15). Listernes indhold (0x8040a0's kontrol) er ikke afkodet; samme trin
 *  som spillernes skærm, så de to er ens. */
const r50 = (v: number) => Math.max(0, Math.round(v / 50) * 50);
export function negWageOptions(demand: number, allow: number | null, cur: number): number[] {
  const xs = [...new Set([0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 1, 1.05, 1.1, 1.2, 1.3, 1.5, 1.75, 2].map((f) => r50(demand * f)).map((v) => (allow !== null && v > allow ? Math.floor(allow / 50) * 50 : v)))];
  return xs.includes(cur) ? xs : [...xs, cur].sort((a, b) => a - b);
}
export function negSignOnOptions(req: number, demand: number, max = Infinity, cur?: number): number[] {
  const xs = [...new Set([0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map((f) => Math.min(max, Math.round(Math.max(req, demand * 10) * f / 5000) * 5000)))];
  return cur === undefined || xs.includes(cur) ? xs : [...xs, cur].sort((a, b) => a - b);
}
