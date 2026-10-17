// Spillernes egen vilje: kontraktkrav efter gode perioder, utilfredshed der lækkes til pressen,
// og grupperinger i omklædningsrummet med deres egne ledere.
import { A } from './attributes';
import { ageOn, daysBetween } from './dates';
import { wageFor } from './data/generate';
import { asOwner, isHumanClub } from './humans';
import { rulesFor } from './leagues';
import { rng } from './rng';
import { addNews, gs, squad } from './state';
import type { Player } from './types';

const pname = (p: Player) => `${p.first} ${p.last}`.trim();
const avgForm = (p: Player) => (p.form.length ? p.form.reduce((s, x) => s + x, 0) / p.form.length : 0);

export interface Clique {
  key: 'nation' | 'veterans' | 'youngsters';
  nation?: number;
  members: number[];
  leader: number;
  mood: number; // gennemsnitlig moral 1-20
}

/** Grupperinger i truppen: udlændinge fra samme land, veteraner og de unge */
export function cliques(clubId: number): Clique[] {
  const g = gs();
  const sq = squad(clubId).filter((p) => !p.loan || p.club === clubId);
  const club = g.clubs[clubId];
  const out: Clique[] = [];
  const make = (key: Clique['key'], ps: Player[], nation?: number) => {
    if (ps.length < 3) return;
    const leader = ps.slice().sort((a, b) => b.attrs[A.influence] + b.attrs[A.determination] / 2 - (a.attrs[A.influence] + a.attrs[A.determination] / 2))[0];
    out.push({ key, nation, members: ps.map((p) => p.id), leader: leader.id, mood: ps.reduce((s, p) => s + p.morale, 0) / ps.length });
  };
  const byNation = new Map<number, Player[]>();
  for (const p of sq) if (p.nation !== club?.nation) byNation.set(p.nation, [...(byNation.get(p.nation) ?? []), p]);
  for (const [n, ps] of byNation) make('nation', ps, n);
  make('veterans', sq.filter((p) => ageOn(p.dob, g.date) >= 30));
  make('youngsters', sq.filter((p) => ageOn(p.dob, g.date) <= 21));
  return out;
}

/** Månedligt for menneskestyrede klubber */
export function monthlyWill() {
  const g = gs();
  for (const c of Object.values(g.clubs)) {
    if (!isHumanClub(c.id)) continue;
    const wealth = rulesFor(c.league, 20).wealth;
    for (const p of squad(c.id)) {
      if (p.loan || !p.contract) continue;
      // 1) kontraktkrav: underbetalt spiller i topform
      if (!p.demand) {
        const market = wageFor(p.value, wealth);
        const games = p.stats.apps + p.stats.subs;
        const settled = !p.joined || daysBetween(p.joined, g.date) > 180;
        const longDeal = p.contract.expires > `${Number(g.date.slice(0, 4)) + 1}-06-30`;
        if (settled && longDeal && games >= 8 && avgForm(p) >= 6.9 && p.contract.wage < market * 0.75 && p.attrs[A.ambition] >= 11 && rng.chance(0.35)) {
          p.demand = { since: g.date, wage: Math.round(market / 50) * 50 };
          asOwner(c.id, () => addNews({ cat: 'contract', key: 'will.contractDemand', params: { player: pname(p), wage: p.demand!.wage }, link: { kind: 'player', id: p.id } }));
        }
      } else {
        const days = daysBetween(p.demand.since, g.date);
        // 2) ignoreret: utilfredsheden lækkes til pressen …
        if (days >= 30 && !p.demand.leaked) {
          p.demand.leaked = true;
          p.morale = Math.max(1, p.morale - 2);
          asOwner(c.id, () => addNews({ cat: 'general', key: 'will.leak', params: { player: pname(p), club: c.name }, link: { kind: 'player', id: p.id } }));
        } else if (days >= 75) {
          // … og til sidst vil han væk
          p.demand = undefined;
          p.wantsAway = true;
          p.morale = Math.max(1, p.morale - 3);
          asOwner(c.id, () => addNews({ cat: 'contract', key: 'will.demandWantsAway', params: { player: pname(p) }, link: { kind: 'player', id: p.id } }));
        }
      }
    }
    // 3) grupperinger: lederens humør smitter
    for (const cl of cliques(c.id)) {
      const leader = g.players[cl.leader];
      if (!leader) continue;
      const unhappy = leader.wantsAway || leader.morale < 8;
      for (const id of cl.members) {
        const m = g.players[id];
        if (!m || m === leader) continue;
        if (unhappy) m.morale = Math.max(1, m.morale - 0.8);
        else if (leader.morale >= 15) m.morale = Math.min(20, m.morale + 0.4);
      }
      if (unhappy && (!leader.cliqueAlert || daysBetween(leader.cliqueAlert, g.date) > 60)) {
        leader.cliqueAlert = g.date;
        asOwner(c.id, () => addNews({ cat: 'general', key: `will.cliqueUnrest.${cl.key}`, params: { player: pname(leader), n: cl.members.length - 1, nation: cl.nation !== undefined ? g.nations[cl.nation]?.name ?? '' : '' }, link: { kind: 'player', id: leader.id } }));
      }
    }
  }
}
