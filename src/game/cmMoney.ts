// Pengene mellem spillet (€) og originalens poster (£) – MODERN_PARITY pengeprincip B (ejerens beslutning 17/11).
// Den originale database (2001/02): spillet gemmer databasens pund som € med den faste kurs £ = € · 0,86 (newgame.ts) – uændret.
// 2026/27-databasen i ægte tilstand (cmLogic): spillet beholder de moderne beløb (econ26.ts), og originalens formler regner i databasens
// enheder: faktoren pr. liga = medianen over ligaens klubber af (databasens ugelønninger, staff.dat, £) / (spillets ugelønninger, €) for de
// spillere, begge har – målt ved spilstart som g.econ for den originale database. Beløb ind i posterne ganges med faktoren for den klub,
// pengene tilhører; svarene (løn, bonusser, gebyrer) deles med køberens faktor. Ligaer uden måling får `k` (medianen af de øverste rækker).
import type { GameState, Player } from './types';

/** £ = € · 0,86 (newgame.ts) */
export const GBP_2001 = 0.86;

/** € → £-faktoren for klubben (uden klub: den fælles) */
export function cmGbp(g: GameState, clubId?: number): number {
  const f = g.cmGbp;
  if (!f) return GBP_2001;
  const lg = clubId !== undefined ? g.clubs[clubId]?.league : undefined;
  return (lg !== undefined ? f.leagues[lg] : undefined) ?? f.k;
}

/** spillerens klub (lejede: moderklubben – den betaler kontrakten) */
export const payClub = (p: Player): number | undefined => p.loan?.from ?? (p.club || undefined);

/** spilstarten (newgame.ts): faktoren pr. liga af databasens lønninger (£) og spillets (€). `dbWage`: spiller-id → databasens ugeløn. */
export function cmGbpMeasure(g: GameState, dbWage: Map<number, number>): NonNullable<GameState['cmGbp']> {
  const perClub = new Map<number, [number, number, number]>();
  for (const p of Object.values(g.players)) {
    const w = dbWage.get(p.id), c = p.club;
    if (!c || p.loan || !w || !(p.contract?.wage && p.contract.wage > 0)) continue;
    const r = perClub.get(c) ?? [0, 0, 0];
    r[0] += w; r[1] += p.contract.wage; r[2]++;
    perClub.set(c, r);
  }
  const per: Record<string, number[]> = {};
  for (const [cid, [db, eur, n]] of perClub) if (n >= 11) (per[g.clubs[cid].league] ??= []).push(db / eur);
  const med = (xs: number[]) => xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)];
  const leagues: Record<string, number> = {};
  for (const [l, xs] of Object.entries(per)) leagues[l] = Math.round(med(xs) * 10000) / 10000;
  const tops = Object.keys(leagues).filter((l) => g.leagues[l]?.tier === 1).map((l) => leagues[l]);
  const k = tops.length ? med(tops) : Object.keys(leagues).length ? med(Object.values(leagues)) : GBP_2001;
  return { k, leagues };
}
