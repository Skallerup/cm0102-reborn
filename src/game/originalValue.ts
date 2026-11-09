// Spillerværdier som i originalen (kun den originale database): tilpasset 3.134 spilleres værdier fra originalens
// egen Player Search (ejerens CM 01/02, 3.9.60, 14/7-01 – "Famous players in your region"). Originalen sætter værdien ud
// fra evne, alder, klubbens omdømme, lønnen, spillerens omdømme (databasens hjemme/nuværende/verdens-omdømme) og ligaen –
// ikke kun evnen (Duff i Blackburn £6M, Zamora i Brighton £350K). Spredningen omkring formlen er ca. ×1,7 (log-rms 0,51;
// vores gamle kurve: 0,94) – resten er individuelt og kendes ikke. *estimeret* for ligaer uden målinger.

import { ATTRS } from './attributes';

/** ligaens tillæg (log) i forhold til Premier League; nøgle = landets navn (1. række) eller "<land>-low"/"England<række>" */
const LEAGUE: Record<string, number> = {
  England2: -0.21, England3: -0.988, England4: -1.574,
  Argentina: -0.46, Austria: -0.188, Belgium: -0.203, Brazil: -0.398, Croatia: -1.085, 'Czech Republic': -1.536,
  Denmark: -0.407, France: -0.322, Germany: 0.028, Greece: -0.559, Holland: -0.037, Italy: 0.078, Japan: -0.314,
  Mexico: -0.708, Norway: -0.552, Poland: -1.335, Portugal: -0.69, Russia: -1.307, Scotland: -0.144,
  'South Korea': -2.165, Spain: 0.055, Turkey: -0.087, 'United States': -0.205, 'Germany-low': -0.189,
  'Hungary-low': -1.92, 'Israel-low': -1.176, 'Italy-low': -0.301, 'Romania-low': -1.655, 'Scotland-low': -2.644,
  'South Africa-low': -0.394, 'Spain-low': -0.528, 'Ukraine-low': -1.614, 'Yugoslavia-low': -1.005,
};

/**
 * Værdien i pund. `nation` = klubbens land, `tier` = ligaens række (uden klub: 9), `clubRep` 0-100, `wageGbp` = ugeløn,
 * `rep` = databasens omdømme [hjemme, nuværende, verden] (0-200). Ukendte ligaer: de sjældne ligaer i målingen samlet.
 */
export function originalValueGbp(ca: number, age: number, clubRep: number, wageGbp: number, nation: string | undefined, tier: number, rep: [number, number, number]): number {
  const key = tier === 1 ? nation ?? '' : nation === 'England' ? `England${tier}` : `${nation ?? ''}-low`;
  const lg = nation === 'England' && tier === 1 ? 0 : LEAGUE[key] ?? (tier === 1 ? -1.654 : -1.491);
  const ln = 12.86889 + 0.01346 * ca - 0.08142 * age - 0.01159 * (age - 27) ** 2 + 0.01249 * clubRep
    + 0.0756 * Math.log(Math.max(100, wageGbp)) + 0.00348 * rep[0] + 0.00085 * rep[1] + 0.00231 * rep[2] + lg;
  return Math.exp(ln);
}

/** Uden databasens omdømme (fx nye spillere): ud fra spillerens omdømme i spillet (0-100) */
export const repTriple = (rep: number): [number, number, number] => [rep * 2, rep * 2, rep * 1.6];

const AT = (k: string) => ATTRS.indexOf(k as never);
const I = { flair: AT('flair'), fin: AT('finishing'), cre: AT('creativity'), pace: AT('pace'), lead: AT('influence'), inj: AT('injuryProneness') };
/** aldersfaktoren (tabellen ved 0x9a7f30), indeks = toppunktsalder − alder (+ landskampe) + 10 */
const AGE_F = [10, 15, 20, 35, 50, 70, 80, 90, 95, 100, 100, 98, 96, 92, 88, 84, 79, 75, 70, 65];

/**
 * Originalens værdiformel sub_4d0c60 (læst i koden – Bosman-projektets identical/5_player_generation §9 og
 * src/player_gen.rs), i pund. Originalen kører den for alle spillere ved nyt spil (sub_4c7560) og overskriver databasens
 * værdi. `pos` = [GK SW D DM M AM F WB] (efter positionsreparationen), `attrs` = de viste egenskaber, `rep` = databasens
 * omdømme [hjemme, nuværende, verden] (×50 i spillet), `vc` = WorldData.valueClub for klubben.
 * Ikke porteret (*ukendt*): den globale værdi [0xdd7120] i frøet (0 her), ikke-spillerens afbalancering sub_539490,
 * nation +0x85 for klubber uden division og flag-reglen ved 0x4d12e3.
 */
export function formulaValueGbp(o: { pa: number; age: number; pos: number[]; attrs: number[]; rep: [number, number, number]; caps: number; staffId: number; clubId: number; vc: [number, number, number, number] }): number {
  const { pos, age, vc } = o;
  const at = (i: number) => o.attrs[i] || 10;
  let base: number, peak: number; // 0x4d0cea
  if (pos[6] >= 15) { base = 13e6; peak = 28; } else if (pos[5] >= 15) { base = 11e6; peak = 29; } else if (pos[4] >= 15) { base = 10e6; peak = 29; }
  else if (pos[3] >= 15) { base = 9e6; peak = 29; } else if (pos[0] === 20) { base = 6e6; peak = 33; } else { base = 8e6; peak = 29; }
  const d = peak - age;
  let x = d; if (x > 5) x = 8 - 0.5 * x;
  let m = 1 + x * Math.abs(Math.trunc(x)) / 36; // 0x4d0dae
  if (pos[0] < 15) m *= (1 + (at(I.flair) - 15) * 0.0133333) * (1 + at(I.fin) * 0.005) * (1 + (at(I.cre) - 15) * 0.00333333) * (1 + (at(I.pace) - 15) * 0.0133333) * (1 + (at(I.lead) - 15) * 0.0133333);
  m *= 1.33 - at(I.inj) ** 2 * 0.0017;
  const [home, cur, world] = o.rep.map((r) => r * 50);
  m = m < 0.01 ? 0.01 : Math.min(m, Math.max(1.1, home / 3000 + 0.17));
  // omdømmet, klubbens manager ser (sub_5407e0): nuværende, uden manager verdens-omdømmet
  const hasMgr = vc[3] >= 0;
  const rep = hasMgr ? cur : world;
  // managerens bud på talentet (sub_6e86d0): vurderingsevnen × fast faktor pr. spiller; frø = staff-id + klub-id
  const seed = ((o.staffId + o.clubId) % 2147483647 + 2147483647) % 2147483647;
  let judge = 1;
  if (hasMgr && vc[2] > 0) { const f = (seed % 101) * 0.01; judge = seed % 10 === 0 ? Math.trunc(f * 20 + 0.5) : Math.min(20, Math.trunc(vc[2] * f + 0.5)); }
  judge = Math.max(1, judge);
  let r = Math.trunc(rep / 100); const over = age - (pos[0] === 20 ? 26 : 23); if (over > 0) r -= over * over;
  const span = Math.max(1, 2 * (21 - judge)), noise = (seed % span) + judge - 21, w = Math.trunc(judge / 2) + 10;
  const j = Math.trunc(((o.pa + noise) * w + (20 - w) * r) / 20);
  let ab = Math.max(1, Math.min(12000, Math.trunc((50 * Math.max(0, j) + rep + Math.min(rep, 5000) * m) / 3)));
  if (world > 5000 && age < peak + 4) { ab = Math.max(ab, Math.trunc(ab / 2) + world - 2500); if (world > 8000 && age <= peak) ab = Math.trunc(Math.max(ab, world * 2.25 + Math.trunc(ab / 2) - 12500)); }
  let val = ab * ab * base * 1e-8; // 0x4d1062
  let eff = age; // landskampe gør spilleren "ældre" (0x4d108b)
  if (o.caps > 0) eff += Math.max(0, Math.min(Math.max(0, d), Math.trunc(vc[1] * o.caps / 18)));
  val *= AGE_F[Math.max(0, Math.min(19, peak - eff + 10))] * 0.01;
  const cf = vc[0] > 0 ? vc[0] : 2; // klub uden land: originalen bruger rand(3)+1 – her midten
  val *= Math.max(0.1, Math.min(1.1, 1 - 0.004 * (20 - cf) ** 2));
  if (65000 * cf * cf < val) val = val / 4 + 32500 * cf * cf;
  return Math.trunc(Math.max(val, 5000 * cf * cf));
}
