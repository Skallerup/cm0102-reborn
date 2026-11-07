// Regler fra 2001/02, der kun gælder den originale database (ejerens ønske: den moderne database berøres ikke).
import { addNews, gs, squad } from './state';
import { rng } from './rng';
import { econ } from './econ';
import { asOwner, isHumanClub } from './humans';
import type { Club, Player } from './types';

/** Spilles der med den originale 2001/02-database? */
// (samme regel som cmDatabase i newgame.ts – ikke importeret derfra, så filen ikke trækker hele newgame med og skaber
// cirkulære imports via scouting/transfers)
export const isOriginal2001 = () => {
  const g = gs();
  if (g.dbKind !== 'cm0102') return false;
  return (g.dbYear ?? g.seasonHistory?.[0]?.season ?? g.season) < 2020;
};

/** EU (15 lande i 2001) + EØS – spillere herfra behøver ingen arbejdstilladelse i Storbritannien */
const EU_EEA = new Set(['England', 'Scotland', 'Wales', 'Northern Ireland', 'Republic of Ireland', 'France', 'Germany', 'Italy', 'Spain',
  'Portugal', 'Holland', 'Belgium', 'Luxembourg', 'Denmark', 'Sweden', 'Finland', 'Austria', 'Greece', 'Norway', 'Iceland', 'Liechtenstein']);
const UK = new Set(['England', 'Scotland', 'Wales', 'Northern Ireland']);

/** Skal spilleren have arbejdstilladelse for at spille for klubben? (britisk klub, spiller uden for EU/EØS) */
export function needsWorkPermit(p: Player, club: Club): boolean {
  if (!isOriginal2001()) return false;
  const g = gs();
  return UK.has(g.nations[club.nation]?.name ?? '') && !EU_EEA.has(g.nations[p.nation]?.name ?? '');
}

/**
 * Får han tilladelsen? Den rigtige regel (1999-2002): 75 % af landets tællende landskampe de seneste to år og landet i
 * top 70 på FIFA-ranglisten – ellers en appel for "særligt talent". Databasen har kun det samlede antal landskampe,
 * så reglen er *estimeret*: etableret landsholdsspiller (15+ kampe), stort navn (omdømme 70+) eller landsholdsspiller
 * af høj klasse (5+ kampe og CA 140+).
 */
export function workPermitGranted(p: Player): boolean {
  return p.caps >= 15 || p.rep >= 70 || (p.caps >= 5 && p.ca >= 140);
}

/** CM 01/02: "Man Utd are not allowed to loan non-EU players." – britiske klubber må ikke leje spillere uden for EU/EØS */
export const loanBlocked = (p: Player, club: Club) => needsWorkPermit(p, club);

/** Kan klubben hente ham (ingen tilladelse nødvendig, eller den gives)? */
export const permitOk = (p: Player, club: Club) => !needsWorkPermit(p, club) || workPermitGranted(p);

/**
 * Spillere, der udebliver (CM 01/02: awol.cpp – "[spiller] goes AWOL"): en utilfreds spiller kan forsvinde i 3-10 dage.
 * Han kan ikke spilles imens (registreres som fravær), og manageren kan bagefter straffe ham (Discipline Player →
 * "unprofessional"). Hyppigheden er *estimeret*. Kaldes den 1. i hver måned.
 */
export function awolMonthly() {
  if (!isOriginal2001()) return;
  const g = gs();
  for (const c of Object.values(g.clubs)) {
    if (!isHumanClub(c.id)) continue;
    for (const p of squad(c.id)) {
      if (p.injury || p.loan || !((p.unhappy ?? 0) >= 70 || p.wantsAway)) continue;
      if (!rng.chance(p.attrs[45] <= 8 ? 0.08 : 0.03)) continue; // professionalisme (45) lav: oftere
      const days = rng.int(3, 10);
      p.injury = { key: 'awol', days, total: days };
      p.lastIncident = g.date;
      asOwner(c.id, () => addNews({ cat: 'injury', key: 'awol.gone', params: { player: `${p.first} ${p.last}`.trim(), days }, link: { kind: 'player', id: p.id } }));
    }
  }
}

/**
 * Bestyrelsens pengebegivenheder ved sæsonstart (CM 01/02: "[beløb] Cash Injection", "[klub] become a PLC", ny ejer).
 * Kun den originale database og kun menneskestyrede klubber; sandsynlighederne er *estimeret*.
 */
export function boardEventsSeason() {
  if (!isOriginal2001()) return;
  const g = gs();
  for (const c of Object.values(g.clubs)) {
    if (!isHumanClub(c.id)) continue;
    const k = econ(c.league);
    if (c.balance < 0 && rng.chance(0.3)) {
      const amount = Math.round((-c.balance * 0.5 + 2_000_000 * k) / 100_000) * 100_000;
      c.balance += amount;
      asOwner(c.id, () => addNews({ cat: 'finance', key: 'board.cashInjection', params: { club: c.name, amount }, link: { kind: 'club', id: c.id } }));
    } else if (!c.plc && c.rep >= 60 && rng.chance(0.04)) {
      c.plc = true;
      const amount = Math.round((10_000_000 + rng.int(0, 10_000_000)) * k / 100_000) * 100_000;
      c.balance += amount;
      c.transferBudget += Math.round(amount * 0.5);
      asOwner(c.id, () => addNews({ cat: 'finance', key: 'board.plc', params: { club: c.name, amount }, link: { kind: 'club', id: c.id } }));
    } else if (rng.chance(0.02)) {
      const amount = Math.round(c.transferBudget * 0.3 / 50_000) * 50_000 + Math.round(3_000_000 * k / 50_000) * 50_000;
      c.transferBudget += amount;
      asOwner(c.id, () => addNews({ cat: 'board', key: 'board.takeover', params: { club: c.name, amount }, link: { kind: 'club', id: c.id } }));
    }
  }
}

/**
 * Anke af et rødt kort (CM 01/02: knappen "Appeal" på nyheden om karantænen – kun den originale database). Forbundet
 * frafalder karantænen, stadfæster den eller forlænger den med én kamp for en grundløs anke. Fordelingen er *estimeret*.
 */
export function appealBan(pid: number): 'won' | 'lost' | 'extended' | 'error' {
  const g = gs();
  const p = g.players[pid];
  if (!isOriginal2001() || !p || p.banned <= 0 || p.appealed || !isHumanClub(p.club)) return 'error';
  p.appealed = true;
  const r = rng.next();
  const out = r < 0.3 ? 'won' : r < 0.8 ? 'lost' : 'extended';
  if (out === 'won') p.banned = 0;
  if (out === 'extended') p.banned += 1;
  asOwner(p.club, () => addNews({ cat: 'injury', key: `ban.appeal.${out}`, params: { player: `${p.first} ${p.last}`.trim(), n: p.banned }, link: { kind: 'player', id: p.id } }));
  return out;
}
