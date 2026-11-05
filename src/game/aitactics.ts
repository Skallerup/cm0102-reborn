// Taktisk modspil (AI-trænere): analysér modstanderens opstilling og vælg et modtræk.
// Bedre taktikere (staff.attrs.tactics) tilpasser sig oftere og mere præcist.
import { hash01 } from './rng';
import { gs, squad } from './state';
import { A } from './attributes';
import { ownerOf, withHuman } from './humans';
import type { Player, Tactic, TeamInstructions } from './types';

export interface Shape {
  forwards: number; // angribere og offensive kantspillere
  wide: number; // spillere på kanterne
  centralMid: number; // centrale midtbanefolk
  mentality: number;
}

export function shapeOf(t: Tactic): Shape {
  let forwards = 0, wide = 0, centralMid = 0;
  for (const s of t.slots) {
    if (s.pos === 'ST' || (s.pos === 'AM' && s.side !== 'C')) forwards++;
    if (s.side !== 'C' && s.pos !== 'D') wide++;
    if (s.side === 'C' && (s.pos === 'M' || s.pos === 'DM' || s.pos === 'AM')) centralMid++;
  }
  return { forwards, wide, centralMid, mentality: t.team.mentality };
}

/** Modstanderens taktik som AI-træneren kan "scoute" den: menneskets aktuelle opsætning eller AI-trænerens stil */
export function scoutedTactic(oppId: number): Tactic | null {
  const g = gs();
  const owner = ownerOf(oppId);
  if (oppId === g.userClub && g.userClub) return g.tactic;
  if (owner) return withHuman(owner, () => gs().tactic);
  return null;
}

/** Snit af de bedste spillere på en plads (efter CA) for en egenskab */
function unitAvg(ps: Player[], posIdx: number[], n: number, f: (p: Player) => number): number {
  const xs = ps.filter((p) => !p.injury && posIdx.some((i) => p.pos[i] >= 15)).sort((a, b) => b.ca - a.ca).slice(0, n);
  return xs.length ? xs.reduce((s, p) => s + f(p), 0) / xs.length : 10;
}
const speed = (p: Player) => (p.attrs[A.pace] + p.attrs[A.acceleration]) / 2;
const air = (p: Player) => 0.45 * p.attrs[A.heading] + 0.35 * p.attrs[A.jumping] + 0.2 * p.attrs[A.strength];

/** Læs modstanderens svagheder ud fra spillerne: langsom bagkæde, svage i luften, meget offensiv stil */
export function weaknessPlan(clubId: number, oppId: number): CounterPlan {
  const g = gs();
  const mine = squad(clubId), theirs = squad(oppId);
  const fwd = [5, 6]; // AM, ST
  const pace = unitAvg(mine, fwd, 3, speed) - unitAvg(theirs, [2, 7], 4, speed);
  const aerial = unitAvg(mine, [6], 2, air) - unitAvg(theirs.filter((p) => p.side[1] >= 15), [2, 1], 2, air);
  const oppStyle = g.staff[g.clubs[oppId]?.manager]?.style?.mentality ?? 2;
  const team: Partial<TeamInstructions> = {};
  let reason: string | undefined;
  if (pace >= 2.5) { team.counter = true; team.tempo = 2; reason = 'vsSlowDefence'; }
  if (aerial >= 2.5) { team.width = 2; reason ??= 'vsWeakInAir'; }
  if (oppStyle >= 3 && team.counter === undefined) { team.counter = true; reason ??= 'vsAttacking'; }
  return { team, reason };
}

export interface CounterPlan {
  formation?: string;
  team: Partial<TeamInstructions>;
  /** nøgle til forklaring (vises i kampoptakt/assistent) */
  reason?: string;
}

/**
 * Modtræk mod modstanderens form. diff = egen styrke minus modstanderens (+ hjemmebane).
 * Rent deterministisk (hash af klub/dato), så multiplayer-afvikling giver samme resultat.
 */
export function counterPlan(clubId: number, oppId: number, diff: number, formation: string, mentality: number): CounterPlan {
  const g = gs();
  const club = g.clubs[clubId];
  const mgr = club ? g.staff[club.manager] : undefined;
  const skill = mgr?.attrs.tactics ?? 10;
  // ikke alle trænere tilpasser sig – de taktisk dygtige gør det oftest
  if (hash01(clubId, oppId, Number(g.date.replace(/-/g, ''))) > 0.25 + skill / 30) return { team: {} };
  const shape = shapePlan(clubId, oppId, diff, formation, mentality, skill);
  // læs også spillerne: formens modtræk først, svaghederne udfylder resten
  const weak = weaknessPlan(clubId, oppId);
  return { ...shape, team: { ...weak.team, ...shape.team }, reason: shape.reason ?? weak.reason };
}

function shapePlan(_clubId: number, oppId: number, diff: number, formation: string, mentality: number, skill: number): CounterPlan {
  const opp = scoutedTactic(oppId);
  if (!opp) {
    // AI mod AI: klar underdog parkerer bussen, klar favorit presser
    if (diff < -14 && mentality >= 1) return { team: { mentality: Math.max(0, mentality - 1), counter: true, closingDown: 0 }, reason: 'underdog' };
    if (diff > 14) return { team: { closingDown: 2, tempo: 2 }, reason: 'favourite' };
    return { team: {} };
  }
  const s = shapeOf(opp);
  // Mange angribere eller meget offensiv modstander: lav blok og kontra
  if (s.forwards >= 3 || s.mentality >= 3) {
    return {
      formation: diff < 0 && skill >= 12 ? (formation.startsWith('3') ? '5-3-2' : '4-5-1') : undefined,
      team: { mentality: Math.max(0, Math.min(mentality, 2) - (diff < 0 ? 1 : 0)), counter: true, offside: false, width: 1 },
      reason: 'vsAttacking',
    };
  }
  // Smal modstander (diamant, 4-3-1-2): angrib kanterne
  if (s.wide <= 2) return { team: { width: 2, passing: 1 }, reason: 'vsNarrow' };
  // Overtal på midten hos modstanderen: kom tættere på og pres
  if (s.centralMid >= 4) return { team: { closingDown: 2, width: 1, tempo: 1 }, reason: 'vsMidfield' };
  // Defensiv modstander (lav blok): tålmodighed og bredde
  if (s.mentality <= 1) return { team: { mentality: Math.min(4, mentality + 1), width: 2, tempo: 1, counter: false }, reason: 'vsDefensive' };
  return { team: {} };
}
