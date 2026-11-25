// Regler fra 2001/02, der kun gælder den originale database (ejerens ønske: den moderne database berøres ikke).
import { addNews, gs, onGameSwitch, squad } from './state';
import { rng } from './rng';
import { econ } from './econ';
import { cmActive, cmLogic } from './cmPlayerData';
import { cmNeedsPermit, cmPermitOn, cmWorkPermit, type PermitOffer } from './cmPermit';
import { asOwner, isHumanClub } from './humans';
import type { Club, Player } from './types';
import { cmWindowOpen } from './cmOfferCheck';

/** Spilles der med den originale 2001/02-database? */
// (samme regel som cmDatabase i newgame.ts – ikke importeret derfra, så filen ikke trækker hele newgame med og skaber
// cirkulære imports via scouting/transfers)
export const isOriginal2001 = () => {
  const g = gs();
  if (g.dbKind !== 'cm0102') return false;
  return (g.dbYear ?? g.seasonHistory?.[0]?.season ?? g.season) < 2020;
};

/** "Recall from loan" (originalens "… recalled from loan"): den originale database og (20/11, "Altid som originalen") alle CM-databaser i ægte
 *  tilstand – også 2026/27 (cmLogic). Udvidet tilstand med den moderne database: ikke. */
export const loanRecallOn = () => isOriginal2001() || cmLogic(gs());

/** EU (15 lande i 2001) + EØS – spillere herfra behøver ingen arbejdstilladelse i Storbritannien */
export const EU_EEA = new Set(['England', 'Scotland', 'Wales', 'Northern Ireland', 'Republic of Ireland', 'France', 'Germany', 'Italy', 'Spain',
  'Portugal', 'Holland', 'Belgium', 'Luxembourg', 'Denmark', 'Sweden', 'Finland', 'Austria', 'Greece', 'Norway', 'Iceland', 'Liechtenstein']);
const UK = new Set(['England', 'Scotland', 'Wales', 'Northern Ireland']);

/** Skal spilleren have arbejdstilladelse for at spille for klubben? (britisk klub, spiller uden for EU/EØS) */
export function needsWorkPermit(p: Player, club: Club): boolean {
  const g = gs();
  // spil startet med 0x8c7950-porten (en CM-database i ægte tilstand – også 2026/27): originalens 0x8c7560 med databasens nation.dat
  if (cmPermitOn(g)) return cmNeedsPermit(g, p, club.id, true);
  if (!isOriginal2001()) return false;
  // ægte tilstand: originalens 0x8c7560 (britiske øer/Irland, EU-borger efter nation +0x7f og andet statsborgerskab, Schweiz) – cmPermit.ts
  if (cmActive(g)) return cmNeedsPermit(g, p, club.id, true);
  return UK.has(g.nations[club.nation]?.name ?? '') && !EU_EEA.has(g.nations[p.nation]?.name ?? '');
}

/**
 * Får han tilladelsen? Spil startet med porten: originalens 0x8c7950 (cmPermit.ts cmWorkPermit – uden tilbud og uden tilfældighed, som 0x84b180).
 * Ellers (gamle spil og udvidet tilstand) CM Reborns regel: den rigtige regel (1999-2002): 75 % af landets tællende landskampe de seneste to år og landet i
 * top 70 på FIFA-ranglisten – ellers en appel for "særligt talent". Databasen har kun det samlede antal landskampe,
 * så reglen er *estimeret*: etableret landsholdsspiller (15+ kampe), stort navn (omdømme 70+) eller landsholdsspiller
 * af høj klasse (5+ kampe og CA 140+).
 */
export function workPermitGranted(p: Player, offer?: PermitOffer): boolean {
  const g = gs();
  if (cmPermitOn(g)) return cmWorkPermit(g, p, offer ?? null, null);
  return p.caps >= 15 || p.rep >= 70 || (p.caps >= 5 && p.ca >= 140);
}

/** CM 01/02: "Man Utd are not allowed to loan non-EU players." – britiske klubber må ikke leje spillere uden for EU/EØS */
export const loanBlocked = (p: Player, club: Club) => needsWorkPermit(p, club);

const ENGLAND = (g: { nations: { name: string }[] }, c?: Club) => !!c && g.nations[c.nation]?.name === 'England';
const isoMonth = (iso: string) => Number(iso.slice(5, 7)) - 1;
/** det seneste 20/6 (ENGLAND_RULES::daily_update 0x57a020 nulstiller sæsonens lejetal) */
const lastJune20 = (iso: string) => { const y = Number(iso.slice(0, 4)); return iso.slice(5) >= '06-20' ? `${y}-06-20` : `${y - 1}-06-20`; };
/** sidste torsdag i marts (vinduets slutning – ENGLAND_RULES 0x579b30: "a Thursday in late March", *estimeret* som den sidste) */
const lastThursdayOfMarch = (y: number) => { const d = new Date(Date.UTC(y, 2, 31)); d.setUTCDate(31 - ((d.getUTCDay() + 3) % 7)); return d.toISOString().slice(0, 10); };

// sæsonens og de nuværende lejeaftaler pr. klub – regnet én gang pr. dag (og talt op, når en leje gennemføres: noteLoan)
let LC: { date: string; g: object; season: Map<number, number>; now: Map<number, number> } | null = null;
onGameSwitch(() => { LC = null; });
function loanCounts(g: ReturnType<typeof gs>) {
  if (LC && LC.date === g.date && LC.g === g) return LC;
  const since = lastJune20(g.date), season = new Map<number, number>(), now = new Map<number, number>();
  for (const q of Object.values(g.players)) {
    if (q.loan) now.set(q.club, (now.get(q.club) ?? 0) + 1);
    if (q.moves) for (const mv of q.moves) if (mv.loan && mv.date >= since) season.set(mv.to, (season.get(mv.to) ?? 0) + 1);
  }
  return (LC = { date: g.date, g, season, now });
}
/** en lejeaftale er gennemført i dag (record_loan 0x579fd0) – kaldes efter at spilleren er skiftet */
export function noteLoan(buyer: number) { if (LC && LC.date === gs().date) { LC.season.set(buyer, (LC.season.get(buyer) ?? 0) + 1); LC.now.set(buyer, (LC.now.get(buyer) ?? 0) + 1); } }
/** en lejeaftale er slut (spilleren tilbage) */
export function noteLoanEnd(club: number) { if (LC && LC.date === gs().date) LC.now.set(club, Math.max(0, (LC.now.get(club) ?? 0) - 1)); }

/** ENGLAND_RULES::can_loan_player 0x579d60 (TRANSFER_MANAGER::can_loan_player 0x8d0040 kalder køberlandets regler): en engelsk klub må ikke
 *  leje fra en klub i samme liga, når ligaen er Premier League (0x9cf5bc), ikke mere end 5 lejeaftaler pr. sæson (+0x91c, talt af record_loan
 *  0x579fd0, nulstillet 20/6), ikke have 2 lejede spillere (0x4cf6d0) i truppen, og kun inden for vinduet (0x8e8e50: start juni – sidste torsdag i
 *  marts). Andre landes regler (TRANSFER_RULES +0x8ac) er ikke porteret. true = afvist. */
export function englandLoanRefused(p: Player, buyer: Club): boolean {
  const g = gs();
  if (!ENGLAND(g, buyer)) return false;
  const home = g.clubs[p.loan?.from ?? p.club];
  if (!home) return false;
  if (home.league === buyer.league && g.leagues[buyer.league]?.tier === 1) return true;
  const L = loanCounts(g);
  if ((L.season.get(buyer.id) ?? 0) >= 5 || (L.now.get(buyer.id) ?? 0) >= 2) return true;
  const y = Number(g.date.slice(0, 4)), mo = isoMonth(g.date);
  if (mo === 3 || mo === 4) return true;                                       // april–maj: uden for vinduet
  return mo === 2 && g.date > lastThursdayOfMarch(y);
}

/** TRANSFER_MANAGER::can_loan_player 0x8d0040 (efter kontrakten, lejen, jobbet og can_club_bid_for_player 0x8ce990 – cmShortlistGame.ts): køberlandets
 *  TRANSFER_RULES +0x20 (objektet, hvis nation +0xa = køberens, 28 objekter i TM +0x8ac; ingen = må). Der er INGEN arbejdstilladelse i lejereglerne
 *  (før afviste loanBlocked/needsWorkPermit alle ikke-EU-lejer til britiske klubber – originalen lejede fx 6 australiere og 6 andre ikke-EU-spillere
 *  til England i 2001/02). England 0x579d60: samme division som kontraktklubben (+0x57), og den er Premier Division (0x9cf5bc) → nej (0x1d); ≥ 5
 *  lejer i sæsonen (+0x91c) → nej (0x1e); > 1 lejet ind i truppen (+0xd7, 0x4cf6d0, kontraktklub ≠ køberen) → nej (0x26); i dag i intet vindue
 *  (0x8e8e50) → nej (9). Skotland 0x7f6650: kun samme division, når den er Premier Division (0x9cf5dc). Australien, Frankrig, Rusland 0x412dd0,
 *  Tyrkiet, USA 0x902240 og Holland/Norge 0x794760: kun vinduet. Finland 0x5a9af0: vinduet, og en computerklub kun dag 90–300. Grundreglen 0x40a600, Kroatien/Grækenland/Polen 0x5ed060, Danmark/Nordirland/Wales/Sydkorea 0x793900: må.
 *  Ikke porteret (*estimeret*: må): Irland 0x63c3d0, Italien 0x661770, Spanien 0x859630 – og sælgerlandets
 *  +0x24 pr. lejemåned (Finland 0x5a9ba0, Frankrig 0x5c1ed0, Tyskland 0x5e0210, Irland 0x63c530, Italien 0x6618f0; de øvrige 0x40a610 = må). */
export function cmLoanRulesOk(buyer: Club, home: Club | undefined): boolean {
  const g = gs();
  const nat = g.nations[buyer.nation]?.name ?? '';
  const sameTop = () => !!home && home.league === buyer.league && g.leagues[buyer.league]?.tier === 1;
  switch (nat) {
    case 'England': {
      if (sameTop()) return false;
      const L = loanCounts(g);
      if ((L.season.get(buyer.id) ?? 0) >= 5 || (L.now.get(buyer.id) ?? 0) > 1) return false;
      return cmWindowOpen(g, buyer, g.date);
    }
    case 'Scotland': return !sameTop();
    case 'Australia': case 'France': case 'Russia': case 'Turkey': case 'United States': case 'Holland': case 'Norway': return cmWindowOpen(g, buyer, g.date);
    case 'Finland': {
      // 0x5a9af0: vinduet; en computerklub (0x600a50(klub, 1, 1) = 0) kun på dag 90–300 i året (0xae2c90, 0 = 1/1) – uden grund
      if (!cmWindowOpen(g, buyer, g.date)) return false;
      if (isHumanClub(buyer.id)) return true;
      const d = Math.round((Date.parse(g.date.slice(0, 10) + 'T00:00:00Z') - Date.UTC(Number(g.date.slice(0, 4)), 0, 1)) / 86400000);
      return d >= 90 && d <= 300;
    }
    default: return true;
  }
}

/** Kan klubben hente ham (ingen tilladelse nødvendig, eller den gives)? */
export const permitOk = (p: Player, club: Club, offer?: PermitOffer) => !needsWorkPermit(p, club) || workPermitGranted(p, offer);

/**
 * Spillere, der udebliver (CM 01/02: awol.cpp – "[spiller] goes AWOL"): en utilfreds spiller kan forsvinde i 3-10 dage.
 * Han kan ikke spilles imens (registreres som fravær), og manageren kan bagefter straffe ham (Discipline Player →
 * "unprofessional"). Hyppigheden er *estimeret*. Kaldes den 1. i hver måned.
 */
export function awolMonthly() {
  if (!isOriginal2001()) return;
  const g = gs();
  if (cmActive(g)) return; // ægte tilstand: originalens udeblivelse er cmFine.ts
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
  if (cmActive(g)) return; // ægte tilstand: *estimeret* uden modstykke i originalen
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
 * Det udvidede spils egen anke af et rødt kort (CM Reborn – ikke originalens regler: dem har ægte tilstand i cmDiscipline.ts, 0x6ab800).
 * Forbundet frafalder karantænen, stadfæster den eller forlænger den med én kamp for en grundløs anke.
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
