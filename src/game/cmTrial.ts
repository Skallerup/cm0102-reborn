// CM 01/02: Offer Trial – en klubløs spiller på prøve (cm0102.exe 3.9.68, disassembleret 28/11-2026 med ~/cm0102-engine/tools/cmdis.py).
//
// Menuen (spillerprofilens Action-menu 0x870650 @0x8724a3, "Offer Trial" 0xa854e4, kommando 0x17): kun når spilleren er klubløs (staff +0x39 = 0),
//   managerens klub findes, intet aftalt skifte (0x8cca10), intet kontrakttilbud fra klubben (0x4cc9e0), spillerdata (+0x61) og 0x7a7eb0 ≠ 2.
// Handlingen 0x888260 @0x8892fe: can_club_bid_for_player 0x8ce990 nej → "Cannot trial {spiller}" (0x8f0e40 art 2, cmShortlistGame.ts
//   cmHumanTrialCheck); ja → Trial Period 0x8f8be0: "Offer trial to {spiller}", ugerne − [2] + (1..4; "1 week" / "%d weeks"), Back · Offer
//   → 0x8fb530 → bekræftelsen 0x8fb6a0 "Confirm offer to {spiller}" / "Offer a N week trial to {spiller} ?" (No · Yes).
// Yes (0x8fb9e0): kontrakten 0x85e480(staff, klub, uger) – løn +0xc = 200 (£), signing-on +8 = 0, start i dag, slut i dag + uger, type 5 – og
//   add_contract_offer 0x4cc490(k, −1, −1, job 0xb, 0, planlæg 1, 0): beslutningen om rand(5) + 1 dage (0x4cd230; den klubløse har ingen kontrakt,
//   så hverken svartid eller 180-dagesreglen gælder).
// Svaret resolve_contract_offers 0x4ce4e0: type 5 → viljen 0x846920(staff, klub, 0, 1, 8, 0) (cmContractGame.ts cmTrialWill); ja, når den er over
//   2,75 og ikke under 3,15. Ja → TRANSFER_MANAGER 0x8c38b0: arbejdstilladelsen (0x8c7560(staff, klub, 1) → 0x8c7950), sign_contract 0x4cf720
//   type 5: truppen 0x53c590 + 1 > 50 → 0x4dade0 "{spiller} trial cancelled" (ingen accept-nyhed); ellers ind i klubben (0x53bd10), slut = i dag +
//   (slut − start), +0x4f = (lav nibble) | 0x80 – trupstatus 8 "This player is on trial" (0xa82638) – og nyheden 0x4d49a0 → 0x4d4fb0
//   "{efternavn} accepts trial offer" / "… has accepted the offer of a trial with {klub}.\n\nThe trial will end on {dato}." Nej → 0x4d49a0
//   "{efternavn} rejects trial offer" / "… has rejected the offer of a trial with {klub}.".
// Slutningen 0x4c7ac0 (0x4c9b76): kontrakten af type 5 udløber i dag → 0x4da590(staff, 5, 0) → 0x4daa00 "{spiller}'s trial finishes" /
//   "{spiller} has completed his trial period and leaves the club.", karrierelinjen 0x7c5fe0, kontrakten fjernes, ud af klubben (0x53c190).
//   En ny kontrakt undervejs (Offer New Contract til egen spiller) erstatter prøvekontrakten (transfers.ts renewContract).
// Kampene: 0x8cf5e0 → grundreglen 0x8e8a60 – kode 3 uden for reserve- og venskabskampe (cmEligibility.ts).
// Computerens klubber tilbyder aldrig prøvetid: 0x85e480's eneste kalder er menneskets skærm 0x8fb9e0.
import type { GameState, Player } from './types';
import { addDays, daysBetween } from './dates';
import { addNews, gs, setClub, squad, recordFreeTransfer } from './state';
import { asOwner, isHumanClub } from './humans';
import { cmLogic, cmRand, cmInDeal, cmContractOf } from './cmPlayerData';
import { cmTrialWill } from './cmContractGame';
import { cmGbp } from './cmMoney';
import { cmNeedsPermit, cmPermitOn, cmWorkPermit } from './cmPermit';

/** et åbent prøvetidstilbud (CONTRACT_MANAGER-tilbuddet af type 5): spilleren, klubben, ugerne, dagen det blev givet og beslutningsdagen */
export interface CmTrialOffer { pid: number; club: number; weeks: number; made: string; due: string }

/** prøvekontraktens løn (0x85e480: +0xc = 200 £ om ugen) */
export const TRIAL_WAGE_GBP = 200;
/** Trial Period-dialogens uger (0x8f8c30: start 2, 0x8f9188 − til 1, + til 4) */
export const TRIAL_WEEKS = { min: 1, max: 4, start: 2 };

/** originalens Offer Trial findes i spil med originalens logik (en CM-database i ægte tilstand) */
export const cmTrialOn = (g: GameState) => cmLogic(g) && !g.draft;

const pname = (p: Player) => `${p.first} ${p.last}`.trim();
const short = (g: GameState, c: number) => g.clubs[c]?.short || g.clubs[c]?.name || '';

/** spilleren er på prøve (kontrakttype 5) */
export const onTrial = (p: Player) => !!p.club && !p.loan && p.contract?.cmType === 5;

/** 0x8724a3–0x872538: menupunktet Offer Trial vises for spilleren (klubløs, klubben har ikke allerede et tilbud til ham, intet aftalt skifte) */
export function cmCanOfferTrial(g: GameState, p: Player, club = g.userClub): boolean {
  if (!cmTrialOn(g) || !club || !g.clubs[club]) return false;
  if (p.club || p.loan || p.virtual) return false;                          // staff +0x39 = 0 (0x4cb960: job 1–4 med klub)
  if (cmInDeal(g, p)) return false;                                         // 0x8cca10: et aftalt skifte
  // 0x4cc9e0: et kontrakttilbud fra klubben – prøvetiden (og et kontrakttilbud til den klubløse er et bud fra klubben, cmInDeal)
  if ((g.cmTrials ?? []).some((o) => o.pid === p.id && o.club === club)) return false;
  return true;
}

/** Yes i bekræftelsen (0x8fb9e0): tilbuddet gemmes, svaret om rand(5) + 1 dage (0x4cd230) */
export function cmOfferTrial(g: GameState, pid: number, weeks: number, club = g.userClub): 'ok' | 'refused' {
  const p = g.players[pid];
  if (!p || !cmCanOfferTrial(g, p, club)) return 'refused';
  const w = Math.max(TRIAL_WEEKS.min, Math.min(TRIAL_WEEKS.max, Math.trunc(weeks)));
  const r = cmRand(g.seed ?? 0, pid, club, daysBetween('2000-01-01', g.date), w, 0x4cd230);
  (g.cmTrials ??= []).push({ pid, club, weeks: w, made: g.date, due: addDays(g.date, r(5) + 1) });
  return 'ok';
}

/** de åbne tilbud til spilleren fra klubben (Contract-fanen/menuen) */
export const cmTrialOffer = (g: GameState, pid: number, club = g.userClub) => (g.cmTrials ?? []).find((o) => o.pid === pid && o.club === club);

/** Dagligt (efter kontrakternes dag): de forfaldne svar (0x4ce4e0) og prøvekontrakterne, der udløber i dag (0x4c9b76) */
export function cmTrialDaily(g: GameState = gs()): void {
  if (!cmTrialOn(g)) return;
  // 0x4c9b76: prøvekontrakten udløber i dag → nyheden, ud af klubben
  // (kun menneskets klubber kan have prøvespillere – 0x85e480's eneste kalder er menneskets skærm)
  const humans = Object.values(g.clubs).filter((c) => isHumanClub(c.id));
  for (const p of humans.flatMap((c) => squad(c.id))) {
    if (!onTrial(p) || p.contract!.expires > g.date) continue;
    const club = p.club;
    asOwner(club, () => addNews({ cat: 'contract', key: 'cmTrial.finishes', params: { player: pname(p) }, link: { kind: 'player', id: p.id } }));
    recordFreeTransfer(g, p);
    p.contract = null;
    setClub(p, 0);
    p.cmFreeSince = g.date;                                                  // 0x53c190: staff +0x3e/+0x40 = i dag
  }
  const list = g.cmTrials;
  if (!list?.length) return;
  const keep: CmTrialOffer[] = [];
  for (const o of list) {
    if (g.date < o.due) { keep.push(o); continue; }
    const p = g.players[o.pid];
    const c = g.clubs[o.club];
    // *usikker*: han er skrevet under et andet sted før svaret – 0x4ce4e0 fjerner ikke type 5-tilbud (0x4ce9ad), men sign_contract fra en klub
    // til en anden kræver handlen; her bortfalder tilbuddet uden nyhed
    if (!p || !c || p.club) continue;
    resolveTrial(g, p, o);
  }
  if (keep.length) g.cmTrials = keep; else delete g.cmTrials;
}

/** 0x4ce4e0 for prøvetidstilbuddet og, ved ja, 0x8c38b0 → sign_contract 0x4cf720 (type 5) */
function resolveTrial(g: GameState, p: Player, o: CmTrialOffer): void {
  const v = cmTrialWill(g, p, o.club);
  const params = { player: pname(p), last: p.last || pname(p), club: short(g, o.club) };
  const news = (key: string, extra: Record<string, string | number> = {}) =>
    asOwner(o.club, () => addNews({ cat: 'contract', key, params: { ...params, ...extra }, link: { kind: 'player', id: p.id } }));
  // 0x4ce9f4: v > best (2,75) og ikke v < 3,15
  if (v === null || !(v > 2.75) || v < 3.15) { news('cmTrial.rejects'); return; }
  // 0x8c38b0: 0x8c7560(staff, klub, 1) → 0x8c7950 med prøvekontrakten; afslag → 0x8e4290 (*usikker*: ingen nyhed porteret)
  const end = addDays(g.date, o.weeks * 7);
  if (cmPermitOn(g) && cmNeedsPermit(g, p, o.club, true)
    && !cmWorkPermit(g, p, { club: o.club, wageGbp: TRIAL_WAGE_GBP, expires: end }, null)) return;
  // sign_contract 0x4cf835: truppen (0x53c590) + 1 > 50 → 0x4dade0 "trial cancelled"
  if (squad(o.club).filter((x) => !x.virtual).length + 1 > 50) { news('cmTrial.cancelled'); return; }
  setClub(p, o.club);
  p.cmFreeSince = undefined;
  p.joined = g.date;
  // 0x85e480: løn 200 £ (+0xc), ingen signing-on (+8), type 5; sign_contract: slut = i dag + (slut − start)
  p.contract = { wage: Math.round(TRIAL_WAGE_GBP / cmGbp(g, o.club)), expires: end, cmType: 5, cmStart: g.date };
  // 0x4cf8de: +0x4f = (lav nibble – sproget, cmContractOf) | 0x80 → trupstatus 8
  const k = cmContractOf(p);
  k.b4f = ((k.b4f ?? 0) & 0xf) | 0x80;
  p.squadStatus = undefined;
  news('cmTrial.accepts', { date: end });
}
