// CM 01/02's transferrygter og mediesvaret "Select Media Response" (cm0102.exe 3.9.68, afkodet med ~/cm0102-engine/tools/cmdis.py 16/11-2026).
// Den originale database og nye 2026/27-spil i ægte tilstand (cmMediaOn) – det udvidede spil har stadig media.ts' weeklyRumours ("Column:").
//
// Mediets kø [0xb6b7c8]+0xc (poster à 0x19 bytes, antal +0x14, sorteret med 0x757ea0):
//   +0 staff-id (spilleren), +4 klub-id (den interesserede), +8 dato, +0x10 tilstand (0 ny, 1 rygtet, 2 "concerned"), +0x11 beløb (højst
//   £50.000.000 = 0x2faf080), +0x15 ftol(viljen 0x846920 · 100).
//   0x754740 add_rumour(staff, klub, beløb, vilje): findes parret allerede (bsearch), sker intet. Kaldt fra computerens ønskeliste 0x83f3a0
//   (0x840c4b/0x84079d), spejderrapporten 0x7b62a0 (0x7b6e86, ved mindst 3 stjerner: samme vej, viljen 0x846920(…, 1, 0, 1, 0) ≥ 3,15 og som rygtets vilje –
//   cmScoutAddRumour i cmScout.ts) og menneskets "Add Player To Shortlist" → Yes 0x8f48b0
//   (0x8f4c07: udbudsprisen 0x4d1600/0x4d42d0, kun hvis budgettet 0x598800 eller saldoen ≥ 0,75 · prisen, vilje 0 – cmShortlistAddRumour).
//   Menneskets bud (0x8be300) giver INTET rygte – før 27/11 gav hvert bud fra mennesket et rygte med spillets skønnede askingPrice.
//   Computerens rygter kommer KUN fra ønskelisternes mål 0x83f3a0 (adapteren
//   0x754740 i cmShortlistGame.ts → transfers.ts cmShortlistApply): spillerplads, rand(37 − nuv. omdømme/300) = 0 og nuv. omdømme > 5000 +
//   rand(2000) eller spilleren er menneskets (0x840ac2–0x840c4b; 0x84079d menneskets spiller) – ikke hvert bud. (Før 18/11 kom hvert computerbud
//   i køen, så ukendte spillere i ikke-valgte lande – fx Atlante om Shanghais Wei Du – gav rygter, originalen ikke har.)
//   0x7549b0 (fra kontrakten 0x4ce4e0): alle poster for spilleren fjernes, når han skriver under – her: når han skifter klub.
//   0x754a30 daily_update (0x5cccd0 → 0x5cdd8f), for hver post:
//     – fjernes efter 31 dage (0x54c5b0(+8, 0x1f) < i dag), eller når spillerens klub (kontrakt 0x4cf5a0) mangler manager (+0xcf), eller han
//       ikke længere er spiller (+0x61)
//     – TRANSFER_MANAGER 0x8ce990(staff, klub, 0, 0) (kan handlen ske nu) – ikke porteret; i stedet transfervinduet for den interesserede klub
//       (cmOfferCheck.ts cmWindowOpen, samme regel som 0x8e8800's vindue)
//     – tilstand 0 og rand(25) = 0: rygtet. Klubberne: posten + op til 4 andre poster for samme spiller med tilstand 0 (alle sættes til 1;
//       en anden post med tilstand ≠ 0 → intet rygte, posten står som 1). Nyheden 0xfbc, pladserne: 0 staff-id, 1–3 navnene, 4 klubben (eller −1),
//       5 varianten: Professionalism (+0x5b) < 15, Loyalty (+0x59) < 15, rand(12500) < verdensomdømmet (spillerpost +0xd) og
//       500 + 12,5·Loyalty < viljen·100 → 0x24 ("han har afsløret …"), ellers rand(3); 6 beløbet; 7 svaret for en computerklub
//       (0x735870(manager, staff, 0x1f) – menneskets klub (0x600a50) 0 = Respond); 8–9 spillertypen; 10–13 managerens id/navn; 14 transferlistet
//       (0x544520: kontrakt +0x4e & 9); 15 antal klubber; 16– klubberne sorteret efter omdømme +0x80 (størst først).
//       Modtagerne: 0x8d1da0(staff, 0xda, …) – spillerens klub og menneskene med ham på ønskelisten – og løkken 0x75504d over de 16 menneskelige
//       managere: deres klub er i samme division (+0x57) som en interesseret klub, eller i samme land (+0x53) og den interesserede har omdømme
//       − 3000 > deres. (0x8d1da0's øvrige flag 0x10/0x40/0x80 – omdømme og divisioner – er ikke porteret.)
//       Variant 0x24: 0x755340 (spillerens forhold til klubberne og fansene) er ikke porteret.
//       Computerklubben: 0x758010 (holdkammeraternes usikkerhed, historien 0x25 – ikke porteret) og 0x741020(staff, klub, 0x1f, svar).
//     – tilstand 1: nyheden 0xfbe "<player> concerned by transfer rumour" (0x587600) – ikke porteret.
//   Nyhedens tekst 0x755860 (overskrift og brødtekst, se cmRumText i ui/screens/common.tsx): mediets land vælges af (plads 10 + antal +
//   variant + klub + staff-id) % 6 (1–2 klubbens land, 3 spillerens nationalitet når landets omdømme +0x8e ≥ 6000, 4–5 den første interesserede
//   klubs land, 0 intet); er det modtagerens klubs land (eller intet), står der "Newspaper reports …", ellers "The <Danish> media …" /
//   "Newspaper reports in <land> …". Plads 10 (managerens staff-id) findes ikke for spillets egne managere – her klubbens id.
//
// Svaret (Respond → "Select Media Response" 0x7423c0, Ok 0x742de0): 0x741020(staff, klub, 0x1f, svar) med 1 Deny rumour, 2 Confirm rumour,
// 3 No Comment (0x735160 type 0x1f), og 0x786d30 skriver svaret i nyhedens plads 7. 0x741020 type 0x1f (0x7414f3–0x741b4a), truppens 50 pladser:
//   No Comment: hver spiller i truppen (id < [0xae2364]) får moral rand(5) − rand(5), spilleren selv rand(8) − rand(8) (0x544710(…, 1)).
//   Deny:    spilleren – klubben kan lide ham (0x547790): bestyrelsens +8 +200, +6 +100; kan ikke lide (0x5477d0): −100/−100; formanden kan
//            lide ham (0x547810(staff, +0xbf)) +6 +250, ikke (0x547840) −250 (alle 1..10000, MANAGER_MANAGER [0xb67a44]-posten);
//            vil han væk (0x866f60): moral −10, og rand(Loyalty) < rand(25) → Loyalty −1 ved rand(Loyalty) = 0 (> 1), uven med manageren
//            (0x547af0(staff, manager, 1)), klagen 8 og ved rand(Pressure) = 0 også 0x2000 (0x867700); ellers moral +10.
//            Holdkammeraterne: kan lide ham +10, kan ikke lide ham −5, ellers rand(5) − rand(5).
//   Confirm: spilleren – klubben kan lide ham: +8 −500, +6 −200; kan ikke lide: +8 +500, +6 +200; formanden kan lide ham +6 −500, ikke +6 +200;
//            vil han væk: moral +10; ellers moral −10 og som ovenfor Loyalty/uven (ingen klage).
//            Holdkammeraterne: kan lide ham trunc(Professionalism/2) − 15, kan ikke lide ham +10, ellers rand(Ambition) > rand(20) og
//            rand(Professionalism) < rand(20) → −5.
//   Computerens svar 0x735870 type 0x1f (0x7366c4): transferlistet → Confirm; kontrakt +0x3d > rand(100), vil ikke væk og +0x49 = 0 →
//   rand(3) ≠ 0 Deny, ellers No Comment.
// Formanden har ingen forhold hos os (cmRelations.ts), og menneskets manager har ingen staffpost – de led er altid falske.
// Tilfældige tal: egne talrækker (cmRand) – spillets rng røres ikke.
import type { GameState, Player } from './types';
import { ATTRS, naturalRole } from './attributes';
import { addNews, squad } from './state';
import { forEachHuman, isHumanClub } from './humans';
import { cmGenerated, cmMediaOn, cmAdjustMorale, cmContractOf, cmFlagSet, cmRand, curRep, wantsToLeave, withFlagCtx } from './cmPlayerData';
import { addDisPerson, clubDislikes, clubFavours, managerStaff, personKey } from './cmRelations';
import { newRec } from './cmBoard';
import { windowOpen } from './transfers';
import { cmGbp } from './cmMoney';
import { cmDayWill } from './cmAiBid';

const s8 = (v: number) => (v << 24) >> 24;
const s16 = (v: number) => (v << 16) >> 16;
const dayNum = (iso: string) => Math.round(Date.parse(iso + 'T00:00:00Z') / 86400000);
const sh = (p: Player, k: string) => s8(Math.round(p.attrs[ATTRS.indexOf(k as never)] || 10));
const worldRep = (p: Player) => Math.round((p.cmRepMem ?? p.cmRep ?? [p.rep * 2, p.rep * 2, p.rep * 2])[2] * 50);
const clubRep = (g: GameState, c: number) => s16(g.cmClubRep?.[c] ?? (g.clubs[c]?.rep ?? 50) * 100);
const cl10k = (v: number) => (v < 1 ? 1 : v > 10000 ? 10000 : v);
/** £50.000.000 (0x2faf080) i spillets penge for den interesserede klub (cmMoney: 2001 £ = € · 0,86, 2026/27 ligaens faktor) */
const feeCap = (g: GameState, club: number) => Math.round(50_000_000 / cmGbp(g, club));

export interface RumEntry { p: number; c: number; d: string; st: number; amt: number; will: number; from: number }
export interface CmRumState { q: RumEntry[]; last: number }
const stateOf = (g: GameState): CmRumState => (g.cmRum ??= { q: [], last: lastOfferId(g) });
const lastOfferId = (g: GameState) => g.offers.reduce((m, o) => Math.max(m, o.id), 0);

/** 0x754740: posten (spiller, klub) – findes parret, sker intet */
export function cmRumourAdd(g: GameState, p: Player, club: number, amt: number, will: number): void {
  const st = stateOf(g);
  if (st.q.some((e) => e.p === p.id && e.c === club)) return;
  st.q.push({ p: p.id, c: club, d: g.date, st: 0, amt: Math.max(0, Math.min(Math.round(amt), feeCap(g, club))), will, from: p.club || 0 });
  st.q.sort((a, b) => a.p - b.p || a.c - b.c);
}

/** menneskets "Add Player To Shortlist" → Yes (0x8f48b0 → 0x8f4c07): rygtet med udbudsprisen 0x4d1600 (cmShortlistGame.ts
 *  cmShortlistAddRumour – null = intet rygte); beløbet i £ → køberens penge (cmMoney). Menneskets bud giver intet rygte (0x8be300 kalder kun 0x7f75f0). */
export function cmRumourHumanShortlist(g: GameState, p: Player, buyer: number, price: () => number | null): void {
  if (!cmMediaOn(g)) return;
  const gbp = price();
  if (gbp === null) return;
  cmRumourAdd(g, p, buyer, gbp / cmGbp(g, buyer), 0);
}

/** 0x735870(manager, staff, 0x1f) for en computerklub: 2 Confirm (listet), 1 Deny, 3 No Comment */
export function cmRumourAiAnswer(p: Player, rand: (n: number) => number): number {
  const c = cmContractOf(p);
  if (((c.b4e ?? (p.listed ? 1 : 0)) & 9) !== 0) return 2;
  if (s8(c.b3d) > rand(100) && !leaves(p) && !(p.contract?.cmB49 ?? 0)) return rand(3) !== 0 ? 1 : 3;
  return 3;
}
/** 0x866f60 for spilleren */
function leaves(p: Player): boolean {
  return wantsToLeave({ id: p.id, loy: sh(p, 'loyalty'), pres: sh(p, 'pressure'), prof: sh(p, 'professionalism'), temp: sh(p, 'temperament'),
    amb: sh(p, 'ambition'), repCur: curRep(p), b40: 0 }, cmContractOf(p));
}

/** MANAGER_MANAGER-postens +6/+8 for klubben (1..10000) */
function board(g: GameState, club: number, d6: number, d8: number): void {
  if (!g.cmBoard) return;
  const R = (g.cmBoard.rec[club] ??= newRec());
  if (d8) R.w8 = cl10k(s16(R.w8) + d8);
  if (d6) R.w6 = cl10k(s16(R.w6) + d6);
}

/** 0x741020(staff, klub, 0x1f, svar): svarets følger for spilleren, holdkammeraterne og bestyrelsen */
export function cmRumourAnswerEffects(g: GameState, p: Player, club: number, ans: number, rand: (n: number) => number): void {
  const c = g.clubs[club];
  if (!c || p.club !== club || !p.contract) return;
  const key = personKey(p);
  const mates = squad(club).slice(0, 50).filter((q) => !cmGenerated(g, q));
  const mgr = managerStaff(g, club);
  const meFavours = (q: Player) => !!q.cmRel && [6, 7, 8].some((i) => q.cmRel![i] === key);
  const meDislikes = (q: Player) => !!q.cmRel && [9, 10, 11].some((i) => q.cmRel![i] === key);
  const upset = (flags: boolean) => {
    cmAdjustMorale(p, -10, true, rand);
    if (rand(sh(p, 'loyalty')) < rand(25)) {
      const loy = sh(p, 'loyalty');
      if (loy > 1 && rand(loy) === 0) { const i = ATTRS.indexOf('loyalty' as never); if (i >= 0) p.attrs[i] = loy - 1; }
      if (mgr) addDisPerson(p, personKey(mgr), true, rand);
      if (flags) {
        const k = cmContractOf(p), r = rand(sh(p, 'pressure'));
        withFlagCtx(g, p, rand, () => { cmFlagSet(k, 8); if (r === 0) cmFlagSet(k, 0x2000); });
      }
    }
  };
  for (const q of mates) {
    if (q.id === p.id) {
      if (ans === 3) { cmAdjustMorale(p, s8(rand(8) - rand(8)), true, rand); continue; }
      const fav = clubFavours(c, key), dis = !fav && clubDislikes(c, key);
      if (ans === 1) {
        if (fav) board(g, club, 100, 200); else if (dis) board(g, club, -100, -100);
        if (leaves(p)) upset(true); else cmAdjustMorale(p, 10, true, rand);
      } else {
        if (fav) board(g, club, -200, -500); else if (dis) board(g, club, 200, 500);
        if (leaves(p)) cmAdjustMorale(p, 10, true, rand); else upset(false);
      }
      continue;
    }
    if (ans === 3) { cmAdjustMorale(q, s8(rand(5) - rand(5)), true, rand); continue; }
    if (ans === 1) {
      if (meFavours(q)) cmAdjustMorale(q, 10, true, rand);
      else if (meDislikes(q)) cmAdjustMorale(q, -5, true, rand);
      else cmAdjustMorale(q, s8(rand(5) - rand(5)), true, rand);
    } else if (meFavours(q)) cmAdjustMorale(q, s8(Math.trunc(sh(q, 'professionalism') / 2) - 15), true, rand);
    else if (meDislikes(q)) cmAdjustMorale(q, 10, true, rand);
    else if (rand(sh(q, 'ambition')) > rand(20) && rand(sh(q, 'professionalism')) < rand(20)) cmAdjustMorale(q, -5, true, rand);
  }
}

/** mediets land (0x7559ed–0x755a6e): nationsindeks eller −1 */
function mediaNation(g: GameState, p: Player, cur: number, first: number, n: number, v: number): number {
  if (!cur) return -1;
  const mgr = managerStaff(g, cur), s10 = mgr?.cmId ?? cur;
  const k = (s10 + n + v + cur + p.id) % 6;
  if (k === 1 || k === 2) return g.clubs[cur]?.nation ?? -1;
  if (k === 3) return (g.cmNationRep?.[p.nation] ?? 0) >= 6000 ? p.nation : -1;
  if (k === 4 || k === 5) return g.clubs[first]?.nation ?? -1;
  return -1;
}

/** overskriften (0x756e51–0x756fb0): variant 0x24 – ingen klub (og en interesseret) "eyes … move", ellers ulige id "fuels transfer talk" /
 *  lige "unsettled"; ellers id % 3: 0 "transfer speculation", 1 "rumours"/"rumour", 2 "lead chase for"/"linked with"/"rumour" */
function headline(id: number, v: number, n: number, cur: number): string {
  if (v === 0x24) return !cur && n > 0 ? 'eyes' : id % 2 ? 'fuels' : 'unsettled';
  const k = id % 3;
  if (k === 0) return 'spec';
  if (k === 1) return n > 1 ? 'rumours' : 'rumour';
  return n > 1 ? 'lead' : n === 1 ? 'linked' : 'rumour';
}

/** 0x754a30 for dagen */
export function cmRumoursDaily(g: GameState): void {
  if (!cmMediaOn(g)) return;
  const st = stateOf(g);
  if (!st.q.length) return;
  const today = dayNum(g.date);
  const drop = new Set<RumEntry>();
  for (const e of st.q) {
    if (drop.has(e)) continue;
    const p = g.players[e.p], club = g.clubs[e.c];
    if (!p || !club || (p.club || 0) !== e.from || today > dayNum(e.d) + 31) { drop.add(e); continue; }
    // 0x8ce990 (ikke porteret): den interesserede klubs transfervindue – 2001: landets vindue (cmOfferCheck.ts cmWindowOpen), 2026/27: spillets
    if (!windowOpen(g.date, club.id)) continue;
    if (e.st !== 0) continue;
    const rand = cmRand(g.seed ?? 0, today, e.p, e.c, 0x754a30);
    if (rand(25) !== 0) continue;
    e.st = 1;
    const clubs = [e.c];
    let blocked = false;
    for (const o of st.q) {
      if (o === e || o.p !== e.p || drop.has(o)) continue;
      if (clubs.length >= 5) break;
      if (o.st !== 0) { blocked = true; break; }
      clubs.push(o.c); o.st = 1;
    }
    if (blocked) continue;
    // plads 5: varianten
    let v = rand(3);
    if (sh(p, 'professionalism') < 15 && sh(p, 'loyalty') < 15 && rand(0x30d4) < worldRep(p)) {
      if (e.will < 0) e.will = Math.trunc(cmDayWill(g, p, e.c) * 100);
      if (e.will > 500 + 12.5 * sh(p, 'loyalty')) v = 0x24;
    }
    const cur = p.club || 0;
    const ai = cur && !isHumanClub(cur) ? cmRumourAiAnswer(p, rand) : 0;
    // klubberne efter omdømme (0x754e99–0x754f33)
    for (let i = 0; i < clubs.length - 1; i++) for (let j = i + 1; j < clubs.length; j++) if (clubRep(g, clubs[j]) > clubRep(g, clubs[i])) [clubs[i], clubs[j]] = [clubs[j], clubs[i]];
    const listed = ((cmContractOf(p).b4e ?? (p.listed ? 1 : 0)) & 9) !== 0 ? 1 : 0;
    const mn = mediaNation(g, p, cur, clubs[0], clubs.length, v);
    const base = { player: `${p.first} ${p.last}`.trim(), pid: p.id, cur, clubs: clubs.join('|'), n: clubs.length, v, amt: e.amt, ai, listed, mn,
      h: headline(p.id, v, clubs.length, cur), ptype: naturalRole(p) };
    deliver(g, p, cur, clubs, mn, (own, local) => addNews({ cat: 'transfer', key: 'cm.rum', params: { ...base, own: own ? 1 : 0, local: local ? 1 : 0, ...(own && !ai ? {} : { ans: ai }) }, link: { kind: 'player', id: p.id } }));
    if (ai) cmRumourAnswerEffects(g, p, cur, ai, rand);
  }
  if (drop.size) st.q = st.q.filter((e) => !drop.has(e));
}

/** modtagerne: spillerens klub og ønskelisterne (0x8d1da0) og divisions-/landsløkken 0x75504d; `local` = mediets land er modtagerens klubs */
function deliver(g: GameState, p: Player, cur: number, clubs: number[], mn: number, fn: (own: boolean, local: boolean) => void): void {
  const done = new Set<number>();
  forEachHuman(() => {
    const me = g.clubs[g.userClub];
    if (!me || done.has(me.id)) return;
    const own = !!cur && cur === me.id;
    const listed = (g.shortlist ?? []).includes(p.id);
    const near = clubs.some((c) => { const x = g.clubs[c]; return !!x && (x.league === me.league || (x.nation === me.nation && clubRep(g, c) - 3000 > clubRep(g, me.id))); });
    if (!own && !listed && !near) return;
    done.add(me.id);
    // 0x755a72: modtagerens klubs land (uden klub: managerens nationalitet) = mediets land, eller intet land
    fn(own, mn < 0 || me.nation === mn);
  });
}

/** Respond åbner "Select Media Response": spillerens klub er menneskets, intet svar endnu */
export function cmRumourOpen(g: GameState, n: { key: string; params: Record<string, string | number> } | undefined): boolean {
  if (!n || n.key !== 'cm.rum' || !n.params.own || n.params.ans) return false;
  const p = g.players[Number(n.params.pid)];
  return !!p && p.club === g.userClub && p.club === Number(n.params.cur);
}

/** menneskets svar (0x742de0): 1 Deny, 2 Confirm, 3 No Comment */
export function cmRumourAnswer(g: GameState, newsId: number, ans: number): 'ok' | 'error' {
  const n = g.news.find((x) => x.id === newsId);
  if (!cmRumourOpen(g, n) || ![1, 2, 3].includes(ans)) return 'error';
  const p = g.players[Number(n!.params.pid)];
  n!.params = { ...n!.params, ans };
  cmRumourAnswerEffects(g, p, p.club, ans, cmRand(g.seed ?? 0, dayNum(g.date), p.id, 0x742de0));
  return 'ok';
}

