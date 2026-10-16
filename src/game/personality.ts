// Spillerpersonligheder, holdkemi og stjerner der vil sælges (forslag #8).
import { A } from './attributes';
import { ageOn, addDays, daysBetween } from './dates';
import { finalOrder, sortTable } from './competitions';
import { asOwner, isHumanClub } from './humans';
import { rng } from './rng';
import { clubLevel } from './scouting';
import { addNews, gs, squad } from './state';
import type { Player, Tactic } from './types';

export type Trait = 'leader' | 'professional' | 'troublemaker' | 'ambitious' | 'loyal' | 'mercenary' | 'bigGame' | 'lazy' | 'temperamental';

/** Personlighed afledt af de skjulte attributter (højst tre træk) */
export function traits(p: Player): Trait[] {
  const a = p.attrs;
  const out: [Trait, number][] = [];
  if (a[A.influence] >= 15 && a[A.determination] >= 13) out.push(['leader', a[A.influence]]);
  if (a[A.professionalism] >= 16) out.push(['professional', a[A.professionalism]]);
  if (a[A.temperament] <= 6 || (a[A.sportsmanship] <= 5 && a[A.aggression] >= 14)) out.push(['troublemaker', 20 - a[A.temperament]]);
  else if (a[A.temperament] <= 8) out.push(['temperamental', 18 - a[A.temperament]]);
  if (a[A.ambition] >= 16) out.push(['ambitious', a[A.ambition]]);
  if (a[A.loyalty] >= 16) out.push(['loyal', a[A.loyalty]]);
  else if (a[A.loyalty] <= 5 && a[A.ambition] >= 13) out.push(['mercenary', 20 - a[A.loyalty]]);
  if (a[A.importantMatches] >= 16) out.push(['bigGame', a[A.importantMatches]]);
  if (a[A.professionalism] <= 6 && a[A.workRate] <= 9) out.push(['lazy', 20 - a[A.professionalism]]);
  return out.sort((x, y) => y[1] - x[1]).slice(0, 3).map(([t]) => t);
}

export const GOOD_TRAITS = new Set<Trait>(['leader', 'professional', 'loyal', 'bigGame']);

/** Har spilleren været i klubben længe? (ingen ankomstdato = var der ved spilstart) */
function tenureYears(p: Player): number {
  const g = gs();
  if (!p.joined) return 2 + (ageOn(p.dob, g.date) > 24 ? 1 : 0);
  return Math.max(0, daysBetween(p.joined, g.date) / 365);
}

export interface Chemistry {
  score: number; // 0-100
  parts: { key: string; value: number; params?: Record<string, string | number> }[];
}

/** Holdkemi for en startopstilling */
export function chemistry(players: Player[], captainId?: number): Chemistry {
  const xi = players.filter(Boolean);
  if (!xi.length) return { score: 50, parts: [] };
  const parts: Chemistry['parts'] = [];
  // fælles nationalitet: par af spillere fra samme land
  const byNation = new Map<number, number>();
  for (const p of xi) byNation.set(p.nation, (byNation.get(p.nation) ?? 0) + 1);
  let pairs = 0;
  for (const n of byNation.values()) pairs += (n * (n - 1)) / 2;
  const nat = Math.min(14, pairs * 0.7);
  parts.push({ key: 'chem.nation', value: Math.round(nat), params: { n: Math.max(...byNation.values()) } });
  // tid sammen i klubben
  const tenure = xi.reduce((s, p) => s + Math.min(4, tenureYears(p)), 0) / xi.length;
  const ten = Math.round(Math.min(18, tenure * 6) - 6);
  parts.push({ key: 'chem.tenure', value: ten, params: { years: tenure.toFixed(1) } });
  // nye spillere skal lige falde til
  const newcomers = xi.filter((p) => tenureYears(p) < 0.25).length;
  if (newcomers) parts.push({ key: 'chem.newcomers', value: -newcomers * 2.5, params: { n: newcomers } });
  // ledere og problembørn
  const all = xi.map(traits);
  const leaders = all.filter((t) => t.includes('leader')).length;
  if (leaders) parts.push({ key: 'chem.leaders', value: Math.min(10, leaders * 4), params: { n: leaders } });
  const captain = xi.find((p) => p.id === captainId);
  if (captain && traits(captain).includes('leader')) parts.push({ key: 'chem.captain', value: 4 });
  const trouble = all.filter((t) => t.includes('troublemaker')).length;
  if (trouble) parts.push({ key: 'chem.trouble', value: -trouble * 5, params: { n: trouble } });
  const away = xi.filter((p) => p.wantsAway).length;
  if (away) parts.push({ key: 'chem.wantsAway', value: -away * 4, params: { n: away } });
  const pros = all.filter((t) => t.includes('professional')).length;
  if (pros >= 3) parts.push({ key: 'chem.pros', value: 4 });
  const score = Math.max(0, Math.min(100, Math.round(50 + parts.reduce((s, x) => s + x.value, 0))));
  return { score, parts };
}

/** Kemi → moral-bonus i matchmotoren (-1..1, ca. ±3 % på evnerne) */
export function chemistryMorale(tactic: Tactic): number {
  const g = gs();
  const xi = tactic.lineup.map((id) => g.players[id]).filter(Boolean);
  return (chemistry(xi, tactic.captain).score - 50) / 50;
}

// ---------- stjerner der vil sælges og problembørn ----------

/** Månedligt for menneskestyrede klubber */
export function monthlyPersonality() {
  const g = gs();
  for (const c of Object.values(g.clubs)) {
    if (!isHumanClub(c.id)) continue;
    const comp = g.comps[c.league];
    const pos = comp ? sortTable(comp.table.slice()).findIndex((r) => r.club === c.id) + 1 : 99;
    const level = clubLevel(c.id);
    const won = c.history.slice(-2).some((h) => h.pos === 1);
    for (const p of squad(c.id)) {
      const t = traits(p);
      // løfter der ikke blev holdt
      if (p.promiseUntil && g.date >= p.promiseUntil) {
        p.promiseUntil = undefined;
        if (pos > 3 && !won) {
          p.wantsAway = true;
          p.morale = Math.max(1, p.morale - 6);
          asOwner(c.id, () => addNews({ cat: 'contract', key: 'pers.brokenPromise', params: { player: `${p.first} ${p.last}` }, link: { kind: 'player', id: p.id } }));
          continue;
        }
      }
      // ambitiøse stjerner vil videre hvis klubben ikke vinder
      const star = p.ca >= level + 8 && (t.includes('ambitious') || t.includes('mercenary'));
      if (star && !p.wantsAway && !p.promiseUntil && !p.listed && pos > 2 && !won && g.date.slice(5, 7) !== '07' && rng.chance(t.includes('mercenary') ? 0.12 : 0.06)) {
        p.wantsAway = true;
        p.morale = Math.max(1, p.morale - 4);
        asOwner(c.id, () => addNews({ cat: 'contract', key: 'pers.wantsAway', params: { player: `${p.first} ${p.last}` }, link: { kind: 'player', id: p.id } }));
      }
      if (p.wantsAway) p.morale = Math.min(p.morale, 8);
      // problembørn laver ballade
      if (t.includes('troublemaker') && rng.chance(0.12)) {
        const incident = rng.pick(['late', 'fight', 'nightclub', 'media']);
        p.morale = Math.max(1, p.morale - 2);
        for (const mate of squad(c.id)) if (mate !== p) mate.morale = Math.max(1, mate.morale - 0.3);
        asOwner(c.id, () => addNews({ cat: 'general', key: `pers.incident.${incident}`, params: { player: `${p.first} ${p.last}` }, link: { kind: 'player', id: p.id } }));
      }
      // ledere løfter omklædningsrummet
      if (t.includes('leader') && p.form.length && p.form[p.form.length - 1] >= 7) {
        for (const mate of squad(c.id)) mate.morale = Math.min(20, mate.morale + 0.15);
      }
    }
  }
}

/** Manageren taler med en utilfreds stjerne */
export function talkToPlayer(pid: number, choice: 'promise' | 'list' | 'refuse'): string {
  const g = gs();
  const p = g.players[pid];
  if (!p || p.club !== g.userClub || !p.wantsAway) return 'error';
  if (choice === 'promise') {
    if (p.promiseUntil) return 'pers.talk.noMorePromises';
    p.wantsAway = false;
    p.promiseUntil = addDays(g.date, 240);
    p.morale = Math.min(20, p.morale + 4);
    return 'pers.talk.promised';
  }
  if (choice === 'list') {
    p.listed = true;
    p.wantsAway = false;
    p.morale = Math.min(20, p.morale + 3);
    return 'pers.talk.listed';
  }
  // nægt: risiko for at han bliver endnu mere sur, men han kan også acceptere
  if (traits(p).includes('loyal') || rng.chance(0.3)) {
    p.wantsAway = false;
    p.morale = Math.min(20, p.morale + 1);
    return 'pers.talk.accepted';
  }
  p.morale = Math.max(1, p.morale - 4);
  for (const mate of squad(g.userClub)) if (mate !== p) mate.morale = Math.max(1, mate.morale - 0.5);
  return 'pers.talk.furious';
}

export { finalOrder };
