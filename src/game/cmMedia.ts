// Originalens resterende moralskrivere (cm0102.exe 3.9.68, runde 12 – 13/11-2026): kontraktens underskrift og Staff_Records' sæsonslut.
// Kun den originale database i ægte tilstand (cmActive). Afkodningen: ~/cm0102-engine/notes/media-morale.md.
//
// Målt i oraklet (mediesporet md1/md2, frø 1, 3.9.60 – alle kald af staff_adjust_morale 0x544710 med returadresse):
//   45 dage (14/7–28/8):  0x5ce280 (0x5ce0b0) 19.784 · 0x5cf573 (0x5ce2d0) 15.780 · 0x6d319b (efter kampen) 11.990 · 0x4d004e (sign_contract)
//                         968 (sum +6.280) · 0x737182 (medierne 0x736c00) 155 (sum −37) · 0x4d875c/0x4d87c2 33.
//   For de 374 spillere i ls20's 20 første PL-kampe frem til 17/8: 0x4d004e 74 kald, +513 i alt (+1,37 pr. spiller) – den største manglende
//   skriver; medierne −12 (−0,03 pr. spiller). Kampstartens hul (13,4/13,6 mod 14,4/14,8) er altså kontrakterne, ikke medierne.
//   Hele sæsonen (330 dage): 0x737182 5.448 (−1.036), 0x737cc1 93, 0x737259 32, 0x7379ab 6, 0x737b80 2 (medierne); 0x4d004e 2.486 (+14.233);
//   Staff_Records 0x86a4c8 (nedrykning) 420 (−2.647), 0x8698cb (oprykning) 364 (+1.855), 0x86920c/0x8692ba (mester) 61/86.
//
// Porteret her:
//   sign_contract 0x4cf720 (0x4d0032–0x4d004e)   ny kontrakt af type 2 (+0x35 & 0x3f) med spillerpost → 0x544710(staff, +20, 0)
//   add_league_champions_record 0x868c50          klubomdømmet mod 500·ligaens omdømme (højst +750), tilskuertallets maksimum +20·omdømme,
//                                                  truppen: ligakampe > trunc((hold − 1)·runder·0,33) → moral +20 og kontrakt +0x44 +100,
//                                                  ellers +10 og +50
//   add_promotion_record 0x869480                  klubomdømmet +500 (højst 10000), maksimum +10·omdømme, truppen moral +15, +0x44 +75
//   add_relegation_record 0x86a1c0                 klubomdømmet −500 (mindst 750), truppen moral −15; omdømmet (+9/+0xb/+0xd) ×0,9
//                                                  (trupstatus 1–2) / ×0,95 (3–5)
//   add_cup_winners_record 0x86a800                klubomdømmet mod 500·turneringens omdømme (højst +750)
// Ikke porteret (se noten): managerens/formandens historik og omdømme i de fire Staff_Records-funktioner (0x58e340, +0x69's +8/+0xa/+0xc),
// stadionets +0x44 (mester), forlængelsestilbuddene 0x4cda70 (kontrakterne), mediesystemet 0x754a30/0x72c1f0/0x744240/0x733a60/0x735870/
// 0x741020/0x736c00/0x73e870/0x74b060, Fine::fine_player 0x5a5980, AWOL 0x4190d0/0x41a360/0x419840, skadernes nyheder 0x630ee0.
import type { Competition as Comp, GameState, Player } from './types';
import { cmActive, cmAdjustMorale, cmRand, repMemOf, statAvg, statusCode } from './cmPlayerData';
import { finalOrder, promotionOrder } from './competitions';
import { LEAGUE_RULES } from './leagues';
import { CM_COMP_ID } from './engine/grid/gameInputs';
import { signHooks } from './state';

const s8 = (v: number) => (v << 24) >> 24;
const s16 = (v: number) => (v << 16) >> 16;
const dayNum = (iso: string) => Math.round(Date.parse(iso + 'T00:00:00Z') / 86400000);
const clampRep = (v: number) => (v < 1 ? 1 : v > 10000 ? 10000 : v);
/** kontraktens +0x44 (byte): v + d > 100 → 100, < −100 → −100 (0x9c), ellers v + d */
const add44 = (v: number, d: number) => { const e = s8(v) + d; return e > 100 ? 100 : e < -100 ? -100 : s8(v + d); };

/** sign_contract 0x4cf720 (0x4d0032–0x4d004e): kontrakttypen (+0x35 & 0x3f) = 2 (almindelig) og spilleren har en spillerpost → 0x544710(staff,
 *  +20, 0). Kaldt for nye kontrakter (klubskifte uden leje, forlængelser). Spillets genererede spillere har ingen post (p.regen). */
export function cmSignContractMorale(g: GameState, p: Player): void {
  if (!cmActive(g) || p.regen || g.cmFitStart === undefined) return;
  cmAdjustMorale(p, 20, false, cmRand(g.seed ?? 0, p.id, dayNum(g.date), 0x4cf720));
}

signHooks.onSign = cmSignContractMorale;

/** turneringens omdømme (+0x69, word) */
const compRep = (g: GameState, id: string) => { const n = CM_COMP_ID(g, id); return s16(n >= 0 ? g.cmCompRep?.[n] ?? 0 : 0); };
/** club +0x80 */
const clubRep = (g: GameState, c: number) => s16(g.cmClubRep?.[c] ?? (g.clubs[c]?.rep ?? 50) * 100);
const setClubRep = (g: GameState, c: number, v: number) => { (g.cmClubRep ??= {})[c] = s16(v); };
/** truppens 50 pladser (+0xd7): personer med spillerpost og id < [0xae2364] (ikke genererede), ikke manageren (+0xcf – spillets spillere er
 *  aldrig managere) */
const squad50 = (squadOf: (c: number) => Player[], c: number) => squadOf(c).slice(0, 50).filter((p) => !p.regen);

/** 0x868cdb–0x868d36 / 0x86a852–0x86a8ad: mål = 500·omdømme; klubomdømmet under målet → + min(mål − omdømme, 750), 1..10000 */
function repTowards(g: GameState, c: number, rep: number): void {
  const target = 500 * rep, cur = clubRep(g, c);
  if (cur >= target) return;
  setClubRep(g, c, clampRep(s16(cur + Math.min(target - cur, 750))));
}
/** club +0x7b (tilskuertallets maksimum, cmCrowd[2]): under 150000 og under +0x73 + 500 → + k·omdømme */
function crowdMax(g: GameState, c: number, add: number): void {
  const cr = g.cmCrowd?.[c];
  if (!cr) return;
  if (cr[2] < 0x249f0 && cr[2] < cr[0] + 0x1f4) cr[2] = (cr[2] + add) | 0;
}

/** add_league_champions_record 0x868c50(klub, liga): omdømmet (0x868cdb), maksimum +20·omdømme (0x868d42, kun med division og stadion),
 *  grænsen trunc((hold − 1)·runder·0,33) (0x868d83, tabellens +0x3e/+0x3c), truppen (0x8690f5): spillere i klubben (+0x39) med ligakampe
 *  0x7c1e30(post, 2, 1, 6,5) > grænsen → 0x544710(+20, 1) og +0x44 +100, ellers (+10, 1) og +50. */
export function recChampions(g: GameState, club: number, comp: Comp, squadOf: (c: number) => Player[]): void {
  const rep = compRep(g, comp.id);
  repTowards(g, club, rep);
  if (g.clubs[club]?.league) crowdMax(g, club, 20 * rep);
  const legs = g.customRules?.[comp.id]?.rounds || 2;
  const thr = Math.trunc(Math.fround((comp.table.length - 1) * legs) * 0.33);
  const day = dayNum(g.date);
  for (const p of squad50(squadOf, club)) {
    if (p.club !== club) continue;
    const rand = cmRand(g.seed ?? 0, p.id, day, 0x868c50);
    const big = statAvg(p, 2, 1, 6.5) > thr;
    cmAdjustMorale(p, big ? 20 : 10, true, rand);
    if (p.contract && p.cmContract) p.cmContract.b44 = add44(p.cmContract.b44, big ? 100 : 50);
  }
}

/** add_promotion_record 0x869480(klub, liga, …): +500 (højst 10000), maksimum +10·omdømme (0x869518), truppen (0x869884) 0x544710(+15, 1) og
 *  kontraktens +0x44 +75 */
export function recPromotion(g: GameState, club: number, comp: Comp, squadOf: (c: number) => Player[]): void {
  const rep = compRep(g, comp.id);
  const v = s16(clubRep(g, club) + 500);
  setClubRep(g, club, v > 10000 ? 10000 : v);
  crowdMax(g, club, 10 * rep);
  const day = dayNum(g.date);
  for (const p of squad50(squadOf, club)) {
    cmAdjustMorale(p, 15, true, cmRand(g.seed ?? 0, p.id, day, 0x869480));
    if (p.contract && p.cmContract) p.cmContract.b44 = add44(p.cmContract.b44, 75);
  }
}

/** add_relegation_record 0x86a1c0(klub, liga): −500 (mindst 750), truppen (0x86a475) 0x544710(−15, 1) og efter trupstatus (+0x4f >> 4)
 *  omdømmet +0xb/+9/+0xd ×0,9 (1–2) eller ×0,95 (3–5), ftol */
export function recRelegation(g: GameState, club: number, _comp: Comp, squadOf: (c: number) => Player[]): void {
  let v = s16(clubRep(g, club) - 500);
  if (v < 0x2ee) v = 0x2ee;
  setClubRep(g, club, v);
  const day = dayNum(g.date);
  for (const p of squad50(squadOf, club)) {
    cmAdjustMorale(p, -15, true, cmRand(g.seed ?? 0, p.id, day, 0x86a1c0));
    if (!p.contract || !p.cmRepMem) continue;
    const st = statusCode(p);
    if (st < 1 || st > 5) continue;
    const f = st <= 2 ? 0.9 : 0.95;
    const r = p.cmRepMem;
    p.cmRepMem = [repMemOf(s16(Math.trunc(Math.round(r[0] * 50) * f))), repMemOf(s16(Math.trunc(Math.round(r[1] * 50) * f))),
      repMemOf(s16(Math.trunc(Math.round(r[2] * 50) * f)))];
  }
}

/** add_cup_winners_record 0x86a800(klub, finalen, …): klubomdømmet mod 500·turneringens omdømme (højst +750) – truppen røres ikke */
export function recCupWinners(g: GameState, club: number, comp: Comp): void {
  repTowards(g, club, compRep(g, comp.id));
}

/** Staff_Records ved turneringernes afslutning (dagligt efter dagens kampe): en færdig liga giver mesterskabet, nedrykningerne (de nederste
 *  LEAGUE_RULES.relegated, når der er en liga under) og oprykningerne fra ligaen under (promotionOrder); en færdig playoff giver vinderens
 *  oprykning, en færdig pokal/europæisk turnering pokalvinderen. Én gang pr. turnering og sæson (g.cmRecDone). */
export function cmRecordsDaily(g: GameState, squadOf: (c: number) => Player[]): void {
  if (!cmActive(g) || g.cmFitStart === undefined) return;
  const done = (g.cmRecDone ??= {});
  for (const comp of Object.values(g.comps)) {
    if (!comp?.finished || done[comp.id] === g.season) continue;
    done[comp.id] = g.season;
    if (comp.type === 'league') {
      if (!g.leagues[comp.id] || g.leagues[comp.id].hidden) continue;
      const order = finalOrder(comp);
      if (order[0]) recChampions(g, order[0], comp, squadOf);
      const rules = LEAGUE_RULES[comp.id];
      if (rules?.below && rules.relegated) for (const c of order.slice(order.length - rules.relegated)) recRelegation(g, c, comp, squadOf);
      if (rules?.promoted && Object.values(LEAGUE_RULES).some((r) => r.below === comp.id)) {
        for (const c of promotionOrder(comp).slice(0, rules.promoted)) recPromotion(g, c, comp, squadOf);
      }
    } else if (comp.type === 'playoff') {
      // oprykningsplayoff PO-<lavere liga> (playoffFor = ligaen over): vinderen rykker op fra den lavere liga (season.ts promotionRelegation)
      const from = comp.id.startsWith('PO-') ? comp.id.slice(3) : '';
      if (comp.winner && g.comps[from] && LEAGUE_RULES[comp.playoffFor ?? '']?.below === from) recPromotion(g, comp.winner, g.comps[from], squadOf);
    } else if ((comp.type === 'cup' || comp.type === 'continental') && comp.winner) recCupWinners(g, comp.winner, comp);
  }
}
