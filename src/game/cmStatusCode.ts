// CM 01/02: spillerens mærke i truplisterne – get_player_status_code 0x4849f0 (club_screens.cpp; args spiller, klub, kamp) og strengopslaget i
// trupskærmen 0x456900 (0x45b0fc–0x45b7b7, strengene 0x98e8e0–0x98e9c8). Funktionen returnerer den FØRSTE kode, der passer; 0x19 = intet mærke.
//
//   kode → streng            betingelse (klubben sat; i originalens rækkefølge)
//   0x15 Abs                 udeblevet 0x418f60 (AWOL – ikke på et landsholds trup 0x53b900) eller skadetype 0x51 "Holiday" (0x631550 → 0x62ed70)
//   1    Wpm                 0x8c7560(spiller, klub, 0): klubbens land +0x76 = 0xe, spilleren ikke EU (0x53d740), og ikke (hovedkontrakt type 2 +
//                            en post i arbejdstilladelseshistorikken – +0x86e bit 0x20 / +0x93a)
//   2/3  Cup / Ine           0x8cf5e0(spiller, kamp) = 1 eller 0xa → Cup, 0xb eller andet ≠ 0 → Ine (kun med kamp)
//   4    Int                 0x7757d0 (landsholdstruppen)
//   5    Sus                 0x55d270 (udelukket i kampens turnering)
//   6    Inj                 0x62c400 = 2 (skadet)
//   7    Fgn                 kampens udlændingeregel 0x8cf6b0 + 0x53d980 (ikke porteret – se nedenfor)
//   8    Inj                 0x62c400 = 1 (genoptræner)
//   9    Fgn                 kampens ikke-EU-regel (0x53d980 og ikke 0x53d740 – ikke porteret)
//   0x16 Tir                 kondition 0x62c590(spiller, 1) under 0x41 (65 %)
//   0x17 Sct                 0x7f8d70(spiller, 0, 0): menneskets klub har en spejderanmodning på ham (cmScout.ts hasScoutRequest)
//   0xa  Yel                 0x55d360 (kampens turnering: ét gult kort fra karantæne)
//   0x18 Trn                 0x8cca10(spiller, 0): aftalt skifte
//   0xb  Bid                 0x8cde70(spiller, 1): under bud
//   0xc  Wnt                 0x842180 (Interested-listen er ikke tom)
//   0xd  Req                 0x544600: transferlistet efter eget ønske (kontrakt +0x4e bit 8)
//   0xe  Lst                 0x5444a0: transferlistet af klubben (+0x4e bit 1)
//   0xf  Loa                 0x544590: lejelistet (+0x4e bit 2)
//   0x10 Ctr                 0x85fa20 på kontrakten med klubben (0x4cf5f0 – eller lejekontrakten 0x4cf6d0, når lejeklubben er klubben):
//                            type (+0x35 & 0x3f) = 1 = "Full Time Monthly Contract", udløbet "Rolling" (0x87cf38/0x85fbe1)
//   0x11 Ret                 0x7a7eb0 (pensioneringen er meldt) og alder (staff +0x18) over 30
//   0x12 Bos                 kontraktens +0x49 ≠ 0
//   0x13 Unh                 kontraktens klager +0x45 ≠ 0 eller begivenheder +0x40 ≠ 0 (0x8676f0)
//   0x14 Fut                 kontrakttype 2, trupstatus (+0x4f >> 4) = 0 og spillerpost (staff +0x61)
// Fgn/Sct/Trn/Bid/Wnt/Req/Lst/Loa/Ctr/Ret og Wpm's undtagelse kræver en af databasens personer (staff-id < [0xae2364] – ikke de genererede
// fyldspillere); Abs/Wpm/Trn/Bid/Wnt/Req/Lst/Loa/Ctr springes over, når klubben er et landshold (0x53b900). Uden klub (0x485161–0x485466):
// Trn, Bid, Wnt, Sct, Req, Lst, Loa, Ctr, Ret (uden aldersgrænsen), Bos, Unh, Fut, Inj (2), Inj (1).
//
// 0x8cf5e0 er cmEligibility.ts cmIneligible (pokalbundne 1, Europas tilmelding 8, lejeklausulerne 0xa/0xb).
// Ikke porteret (mangler i modellen): udlændingereglerne for kampen (7/9 Fgn – 0x8cf6b0 findes ikke hos os), genoptræningen 0x62c400 = 1 (vores
// skade dækker begge) og kontraktens begivenheder +0x40.
import type { Fixture, GameState, Player } from './types';
import { isInternational } from './international';
import { interestedClubs } from './transfers';
import { hasScoutRequest } from './cmScout';
import { underOffer } from './cmRetire';
import { cmLoanBar } from './cmLoan';
import { cmIneligible } from './cmEligibility';
import { cmNeedsPermit, cmPermitOn } from './cmPermit';
import { ageOn } from './dates';
import { onGameSwitch } from './state';

export type StatusTag = 'Abs' | 'Wpm' | 'Cup' | 'Ine' | 'Int' | 'Sus' | 'Inj' | 'Tir' | 'Sct' | 'Yel' | 'Trn' | 'Bid' | 'Wnt' | 'Req' | 'Lst' | 'Lon'
  | 'Ctr' | 'Ret' | 'Bos' | 'Unh' | 'Fut';

/** 0x8cca10: et aftalt skifte – et accepteret bud med dato (add_future_transfer 0x8cb9a0) eller en forhåndsaftale (Player.contract.futureClub) */
export function arrangedMove(g: GameState, p: Player): { club: number; date: string } | null {
  const o = g.offers.find((x) => x.player === p.id && x.status === 'accepted' && x.cmFut);
  if (o) return { club: o.buyer, date: o.cmFut! };
  const f = p.contract?.futureClub;
  return f ? { club: f, date: p.contract!.expires } : null;
}

/** kontraktens +0x4e: originalens bits, ellers spillets egne flag */
const b4e = (p: Player) => p.cmContract?.b4e ?? ((p.listed ? 1 : 0) | (p.loanListed ? 2 : 0));

/** 0x8c7560(spiller, klub, 0) */
function needsPermit(g: GameState, p: Player, club: number): boolean {
  return cmPermitOn(g) && cmNeedsPermit(g, p, club, false);
}

/** klubbens næste kamp (0x456900's kampargument) – én søgning pr. dag og klub */
let fxG: GameState | null = null, fxKey = '', fxMemo: Fixture | undefined;
// (hukommelse 26/11) holdt nyt-spil-forløbets midlertidige verden (Select Team) i live under hele Take Control – heap-snapshot: det eneste spil
// i hovedtråden dér hang i fxG. Tømmes ved et skifte (nøglen er spilobjektet, så intet resultat ændres).
onGameSwitch(() => { fxG = null; fxKey = ''; fxMemo = undefined; });
function nextFixture(g: GameState, club: number): Fixture | undefined {
  const key = `${g.date}|${club}`;
  if (g === fxG && key === fxKey) return fxMemo;
  let best: Fixture | undefined;
  for (const f of Object.values(g.fixtures)) {
    if (f.result || f.date < g.date || (f.home !== club && f.away !== club)) continue;
    if (!best || f.date < best.date) best = f;
  }
  fxG = g; fxKey = key; fxMemo = best;
  return best;
}

/** kontrakten med klubben (0x4cf5f0/0x4cf6d0): hovedkontrakten – i lejeklubben lejekontrakten, som vi kun kender som lejen (type 6/7, ingen
 *  +0x45/+0x49); moderklubben (udlejet spiller i dens trup) ser hovedkontrakten */
const mainContract = (p: Player, club: number) => (p.loan && p.club === club ? null : p.contract ?? null);

/** Unh: kontraktens klager +0x45 (cmPlayerData.ts) – spil uden originalens kontraktdata har kun spillets egen utilfredshed */
const unhappy = (p: Player) => (p.cmContract ? p.cmContract.b45 !== 0 : (p.unhappy ?? 0) > 60 || !!p.wantsAway);

/** Fut: kontrakttype 2 og trupstatus 0 i +0x4f (kun når kontraktens +0x4f er kendt) */
const futStatus = (p: Player, club: number) => {
  const c = mainContract(p, club);
  return !!c && (c.cmType ?? 2) === 2 && p.cmContract?.b4f !== undefined && ((p.cmContract.b4f >> 4) & 0xf) === 0;
};

/** get_player_status_code 0x4849f0 → mærket (null = 0x19). `club` = klubben, hvis trup vises (0 = ingen klub). */
export function playerStatusTag(g: GameState, p: Player, club = p.club): StatusTag | null {
  const real = !p.virtual;
  const injured = !!p.injury && p.injury.key !== 'awol' && p.injury.key !== 'cm81';
  const k = mainContract(p, club);
  if (!club) {
    if (real && arrangedMove(g, p)) return 'Trn';
    if (real && underOffer(g, p)) return 'Bid';
    if (real && interestedClubs(p).length) return 'Wnt';
    if (real && g.userClub && hasScoutRequest(g, p.id, g.userClub, false)) return 'Sct';
    if (real && b4e(p) & 8) return 'Req';
    if (real && b4e(p) & 1) return 'Lst';
    if (real && b4e(p) & 2) return 'Lon';
    if (real && k?.cmType === 1) return 'Ctr';
    if (real && p.cmRetire) return 'Ret';
    if (k?.cmB49) return 'Bos';
    if (k && unhappy(p)) return 'Unh';
    if (futStatus(p, club)) return 'Fut';
    return injured ? 'Inj' : null;
  }
  // landsholdenes trupper (0x53b900) er ikke klubber hos os – de har deres eget mærke (SquadClassic.tsx nationalTag)
  if (p.injury?.key === 'awol') return 'Abs';                                   // 0x418f60
  if (p.injury?.key === 'cm81') return 'Abs';                                   // 0x631550: skadetype 0x51
  if (needsPermit(g, p, club)) return 'Wpm';                                    // 0x8c7560
  const f = nextFixture(g, club);
  if (f) { const bar = cmIneligible(g, p, f) || cmLoanBar(g, p, f); if (bar === 1 || bar === 0xa) return 'Cup'; if (bar) return 'Ine'; }   // 0x484c20–0x484cb4
  if (isInternational(p)) return 'Int';                                         // 0x7757d0
  if (p.banned > 0) return 'Sus';                                               // 0x55d270
  if (injured) return 'Inj';                                                    // 0x62c400 = 2 (og 1)
  if (p.condition < 65) return 'Tir';                                           // 0x62c590 < 0x41
  if (real && g.userClub && hasScoutRequest(g, p.id, g.userClub, false)) return 'Sct';
  if (p.yellowCount === 4) return 'Yel';                                        // 0x55d360
  if (!real) return null;                                                      // genererede: ingen kontrakt (0x484b0f)
  if (arrangedMove(g, p)) return 'Trn';                                         // 0x8cca10
  if (underOffer(g, p)) return 'Bid';                                           // 0x8cde70
  if (interestedClubs(p).length) return 'Wnt';                                  // 0x842180
  if (b4e(p) & 8) return 'Req';                                                 // 0x544600
  if (b4e(p) & 1) return 'Lst';                                                 // 0x5444a0
  if (b4e(p) & 2) return 'Lon';                                                 // 0x544590
  if (k?.cmType === 1) return 'Ctr';                                            // 0x85fa20
  if (p.cmRetire && ageOn(p.dob, g.date) > 30) return 'Ret';                    // 0x7a7eb0, staff +0x18 > 0x1e
  if (!k) return null;
  if (k.cmB49) return 'Bos';                                                    // +0x49
  if (unhappy(p)) return 'Unh';                                                 // +0x45 / +0x40
  if (futStatus(p, club)) return 'Fut';                                               // 0x14
  return null;
}
