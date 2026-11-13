// European Squad som i CM 01/02 (målt i originalen 9/11-2026, testspil 3.9.60, Man Utd): fredag 31/8 om aftenen kommer
// "Man Utd to register players for next phase" – "Man Utd may register 25 players to be eligible for the first group stage of the
// UEFA Champions League." med Respond → "Man Utd European Squad" (In/ud, "25 Players Selected", Auto = de 25 bedste, Clear) →
// Submit → "Submit the current European squad ?" → beskeden får "25 players were registered.". Kun tilmeldte spillere kan spille
// i turneringen. Senere faser åbner tilmeldingen igen (vi bruger 1/2, *estimeret*). Svarer manageren ikke, tilmelder assistenten
// de 25 bedste før første kamp (originalen holder Continue Game tilbage).
import { addNews, gs, squad } from './state';
import { forEachHuman } from './humans';
import { naturalRole } from './attributes';
import type { Competition } from './types';

export const EURO_MAX = 25;
const WINDOWS: Record<string, 'first' | 'next'> = { '08-31': 'first', '02-01': 'next' };

/** Klubbens europæiske turnering i år (den første, der ikke er slut) */
export function euroComp(cid: number): Competition | undefined {
  return Object.values(gs().comps).find((c) => c.type === 'continental' && !c.finished && c.clubs.includes(cid));
}

/** Venter klubben på at tilmelde sin europæiske trup? */
export const euroDue = (cid: number) => !!cid && gs().clubs[cid]?.euroDue === gs().season;

/** De tilmeldte spillere i år – null, hvis klubben ikke har tilmeldt nogen (så kan alle spille) */
export function euroRegistered(cid: number): Set<number> | null {
  const e = gs().clubs[cid]?.euroSquad;
  return e && e.season === gs().season ? new Set(e.ids) : null;
}

/** Auto (som originalens knap): de tre bedste målmænd og de 22 bedste markspillere */
export function autoEuroSquad(cid: number): number[] {
  const sq = squad(cid).sort((a, b) => b.ca - a.ca);
  const gk = sq.filter((p) => naturalRole(p) === 'GK').slice(0, 3);
  const out = sq.filter((p) => naturalRole(p) !== 'GK').slice(0, EURO_MAX - gk.length);
  return [...gk, ...out].map((p) => p.id);
}

/** Dagligt: beskeden 31/8 (og 1/2) – og den automatiske tilmelding, hvis klubben skal spille i Europa først */
export function euroSquadDaily() {
  const g = gs();
  forEachHuman(() => {
    const c = g.clubs[g.userClub];
    if (!c) return;
    const comp = euroComp(c.id);
    const phase = WINDOWS[g.date.slice(5)];
    if (comp && phase && c.euroDue !== g.season) {
      c.euroDue = g.season;
      addNews({ cat: 'general', key: 'eur.request', params: { club: c.short, comp: comp.name, n: EURO_MAX, phase } });
    }
    if (c.euroDue === g.season && (g.manager.holiday || Object.values(g.fixtures).some((f) => f.date === g.date && g.comps[f.comp]?.type === 'continental' && (f.home === c.id || f.away === c.id)))) submitEuroSquad(c.id);
  });
}

/** Submit: de valgte spillere (højst 25) tilmeldes; uden liste tilmelder assistenten de 25 bedste */
export function submitEuroSquad(cid: number, ids?: number[]): 'ok' | 'error' {
  const g = gs();
  const c = g.clubs[cid];
  if (!c) return 'error';
  const mine = new Set(squad(cid).map((p) => p.id));
  const list = ids ?? autoEuroSquad(cid);
  if (list.length > EURO_MAX || new Set(list).size !== list.length || list.some((id) => !mine.has(id))) return 'error';
  c.euroSquad = { season: g.season, ids: list.slice() };
  if (c.euroDue !== undefined) {
    c.euroDue = undefined;
    for (const n of g.news) if (n.key === 'eur.request' && n.params.done === undefined) n.params = { ...n.params, done: list.length };
  }
  return 'ok';
}
