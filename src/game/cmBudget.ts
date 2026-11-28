// CM 01/02: Finance::get_transfer_budget 0x598800 (mekanisk oversat, cmGen/f_598800.ts) på spillets hukommelse – klubbens Transfer Funds i ægte
// tilstand med den originale database. Originalen gemmer intet budget: Funds-knappen (0x808ee4) og View Finances (0x463af8) kalder 0x598800(0, 0,
// 0, 1, 0) hver gang (negativ → 0). Hos os: Club.transferBudget = det samme kald ved spilstarten, når mennesket overtager en klub, hver dag for
// menneskets klub(ber) og den 1. i måneden for alle klubber (cmRefreshTransferBudgets) – og efter økonomiens begivenheder (cmFinEvents.ts).
//
// Inddata ud over lønportenes hukommelse (buildWantMem): træningsanlægget +0x7f, +0x6d (0 for "Bright…"/"Wimble…"), stadionets kapacitet +0x3c,
// den europæiske turnering +0x1db (cmClubEuro), sæsonblokkens Bought/Sold +0x110/+0x118 (nettokøb over £8M trækkes fra og sænker loftet) og
// menneskets manager (+0xcf): ikke-spillerposten med hans omdømme +0x8/+0xa/+0xc. Det sidste var det manglende input (16/11): 0x599039 skalerer
// loftet T = budget/2 med (managerens omdømme/klubbens)² (forholdet klemt til 0,5..1), og alt over T tæller kun 10 % – uden manager-post regnede vi
// alle menneskeklubber som Ferguson (Man Utd 33,6M mod originalens 24,0M). Oraklets spilstart (pre-194-2001, 0x598800 på originalens egen
// hukommelse): Arsenal med mennesket (5282/9000) 0,69 af saldoen, de computerstyrede 0,75–1,6 (Newcastle over saldoen, Fulham/Middlesbrough under).
// Mangler: +0x1c (lejeaftalernes lønandel ·2/3 – spillet har ingen post for den lejende klubs lønbidrag; 0) og argument 4 (menneskets igangværende
// handler – bruges ikke af Funds/View Finances).
import type { GameState, Player } from './types';
import { buildWantMem, cmTalkStatus, roleCode, type WantMem } from './cmContractGame';
import { GEN } from './cmGen/index';
import { ensureImpls } from './cmGen/impls';
import { cmActive, cmBoardLogic, cmLogic, cmStaffOn } from './cmPlayerData';
import { cmGbp } from './cmMoney';
import { cmKnowLevel } from './cmKnow';
import { cmClubEuro } from './cmFitnessGame';
import { getMaxWage_5968d0, maxStaffWage_597db0 } from './cmMaxWage';
import { cmFinOn, K } from './cmFinance';

/** skrabeområde til menneskenes ikke-spillerposter (én pr. klub i kaldet) */
const MNP0 = 0x6a100000;

/** menneskets omdømme [hjemme, aktuel, verden] for en menneskeklub (null = computerens klub eller ukendt) */
function humanRep(g: GameState, cid: number): [number, number, number] | null {
  if (g.clubs[cid]?.manager !== -1) return null;
  if (cid === g.userClub) return g.manager.cmRep ?? null;
  return g.humans?.find((h) => h.userClub === cid)?.manager.cmRep ?? null;
}

/** felterne, 0x598800 læser ud over lønportenes */
function prepClub(g: GameState, M: WantMem, cid: number, k: number): void {
  const club = M.W.clubOf(cid), fin = M.W.finOf(cid), m = M.c.m, cl = g.clubs[cid], cr = g.cmCrowd?.[cid];
  if (!club || !fin) return;
  m.w8(club + 0x7f, cl.facilities);
  m.w8(club + 0x6d, /^(Bright|Wimble)/.test(cl.name) ? 0 : 1);
  const sa = m.u32(club + 0x69);
  if (sa && cr && cr[3] >= 0) m.w32(sa + 0x3c, cr[5]);
  m.w32(club + 0x1db, cmClubEuro(g, cid));
  // sæsonblokken +0x110: Bought (i64) og +0x118 Sold (i64) – Finance::add_bought/add_sold (cmFinance.ts bookBlock)
  const ty = g.cmFin?.[cid]?.ty;
  const w64 = (a: number, v: number) => { const x = Math.round(v); m.w32(a, x >>> 0); m.w32(a + 4, Math.floor(x / 4294967296)); };
  w64(fin + 0x110, ty?.[K.bought] ?? 0);
  w64(fin + 0x118, ty?.[K.sold] ?? 0);
  // MANAGER_MANAGER-posten +0x28 (0x599239): bestyrelsens ekstra transferpenge efter en anmodning (cmBoardGame.ts, R.d28)
  const mm = m.u32(0xb67a44), d28 = (g.cmBoard?.rec[cid] as { d28?: number } | undefined)?.d28;
  if (mm && m.u32(mm)) m.w32(m.u32(mm) + 73 * m.u32(club) + 0x28, d28 ?? 0);
  // menneskets manager (+0xcf er en tom person i buildWageMem): ikke-spillerposten med omdømmet
  const rep = humanRep(g, cid), ms = m.u32(club + 0xcf);
  if (rep && ms && !m.u32(ms + 0x69)) {
    const np = MNP0 + 0x100 * k;
    m.w32(ms + 0x69, np);
    m.w16(np + 0x8, rep[0]); m.w16(np + 0xa, rep[1]); m.w16(np + 0xc, rep[2]);
  }
}

/** transferbudgettet i £ for en klub (null uden for ægte tilstand/uden finansposten) – 64 bit i originalen, her de nederste 32 + fortegn */
export function cmTransferBudget(g: GameState, cid: number): number | null {
  const v = cmTransferBudgetRaw(g, cid);
  return v === null ? null : Math.max(0, v);
}
/** som cmTransferBudget, men med originalens fortegn (negativ i gæld) – begivenhederne 0x59ed70 vælger nyhedens tekst efter det */
export function cmTransferBudgetRaw(g: GameState, cid: number): number | null {
  // (MODERN_PARITY 4) også 2026/27 med originalens økonomi (cmFinOn)
  if (!(cmActive(g) || cmFinOn(g)) || !g.clubs[cid]) return null;
  return budgetsOf(g, [cid]).get(cid) ?? null;
}

/** 0x598800(0, 0, 0, 1, 0) for flere klubber på én hukommelse */
function budgetsOf(g: GameState, cids: number[]): Map<number, number> {
  const out = new Map<number, number>();
  if (!cids.length) return out;
  const M = buildWantMem(g, cids);
  ensureImpls();
  cids.forEach((cid, k) => {
    const fin = M.W.finOf(cid);
    if (!fin) return;
    prepClub(g, M, cid, k);
    out.set(cid, GEN[0x598800](M.c, fin, [0, 0, 0, 1, 0]) | 0);
  });
  return out;
}

/** i spillets valuta (€) */
export function cmTransferFunds(g: GameState, cid: number): number | null {
  const v = cmTransferBudget(g, cid);
  return v === null ? null : v / cmGbp(g, cid);
}

/** transferbudgettet på dagen i € – originalen gemmer intet budget, men kalder 0x598800 hver gang (bestyrelsen 0x6a8810/0x6a4f80, pengeprøven
 *  0x8cfc90, 0x8c0810's vurdering): med originalens økonomi (cmFinOn) det levende kald, ellers det gemte Club.transferBudget */
export function cmFundsNow(g: GameState, cid: number): number {
  return cmTransferFunds(g, cid) ?? g.clubs[cid]?.transferBudget ?? 0;
}

/** efter en handel (saldoen og sæsonblokkens Bought/Sold er bogført): det gemte Funds = 0x598800 for køber og sælger – originalen regner
 *  budgettet af saldoen; et fast fradrag/tillæg af summen findes ikke (true = gjort; false uden originalens økonomi) */
export function cmFundsAfterDeal(g: GameState, ids: (number | undefined)[]): boolean {
  if (!cmFinOn(g)) return false;
  cmRefreshTransferBudgets(g, [...new Set(ids.filter((x): x is number => !!x && !!g.clubs[x]))]);
  return true;
}

/** Club.transferBudget = originalens Funds (0x598800, negativ → 0) for klubberne (standard: alle) – originalens økonomi (cmFinOn: den originale
 *  database og nye 2026/27-spil; beløbet i klubbens £ → € med cmMoney-faktoren) */
export function cmRefreshTransferBudgets(g: GameState, cids?: number[]): void {
  if (!cmFinOn(g)) return;
  // standard: klubberne i de valgte lande (og menneskenes) – de andres Funds vises ikke (originalens skærme skjuler andre klubbers økonomi) og
  // bruges ikke af computerens handler (ønskelisterne kalder 0x598800 selv); ~1,5 ms pr. klub
  const act = new Set(g.activeNations ?? []), hum = new Set(humanClubIds(g));
  const ids = (cids ?? Object.keys(g.cmFin!).map(Number).filter((cid) => hum.has(cid) || act.has(g.clubs[cid]?.nation))).filter((cid) => g.clubs[cid]);
  // i bidder, så hukommelsen ikke vokser over alle klubber på én gang
  for (let i = 0; i < ids.length; i += 400) {
    for (const [cid, v] of budgetsOf(g, ids.slice(i, i + 400))) g.clubs[cid].transferBudget = Math.max(0, v) / cmGbp(g, cid);
  }
}

/** menneskenes klubber (den aktive + de andre i et fællesspil) */
export function humanClubIds(g: GameState): number[] {
  const s = new Set<number>();
  if (g.userClub && g.clubs[g.userClub]?.manager === -1) s.add(g.userClub);
  for (const h of g.humans ?? []) if (h.userClub && g.clubs[h.userClub]?.manager === -1) s.add(h.userClub);
  return [...s];
}

/** Offer Contract-skærmens loft "Your board will allow wages up to …" (skærmparameter 0x18): 0x4de1f0/0x4de5d0 → Finance::get_max_wage
 *  0x5968d0(klubbens finanspost, spilleren, −1) – for menneskets egen spiller læser 0x5968d0 trupstatussen i kontrakten (+0x4f, sat af Set Role
 *  At Club); for en spiller fra en anden klub den rolle, han er tilbudt (`role`; uden rolle hans forventede plads – som ønskekontrakten, cmTalkStatus). Ugeløn i € (null uden for ægte tilstand). */
export function cmBoardWageAllow(g: GameState, p: Player, clubId: number, role?: import('./squadStatus').SquadStatus): number | null {
  const w = cmBoardWageAllowGbp(g, p, clubId, role);
  return w === null ? null : w / cmGbp(g, clubId);
}

/** Finance +0x14 (£): lønloftet 0x5968d0(fin, 0, −1) fra klubbens seneste 0x598370 – eller bestyrelsens forhøjelse 0x598340 (CmFinRec.cap14), til
 *  næste 0x598370. Bestyrelsens anmodning 4 (0x6a8e60) og ultimatummet 0x6aca50 læser det. 0 uden finanspost. */
export function cmFinCap14(g: GameState, clubId: number): number {
  if (!g.clubs[clubId]) return 0;
  const M = buildWantMem(g, [clubId]);
  const fin = M.W.finOf(clubId);
  return fin ? M.c.m.s32(fin + 0x14) : 0;
}

/** Finance::adjust_max_wage(fin, pct) 0x598340: +0x14 = ftol((pct + 100) · 0,01 · +0x14) – pct er en byte med fortegn (R +5) */
export function cmAdjustMaxWage(g: GameState, clubId: number, pct: number): void {
  const r = g.cmFin?.[clubId];
  if (!r) return;
  const cur = cmFinCap14(g, clubId);
  r.cap14 = Math.trunc(((((pct << 24) >> 24) + 100) * 0.01) * cur);
}

/** som cmBoardWageAllow, i £ (skærmparameterens heltal) */
export function cmBoardWageAllowGbp(g: GameState, p: Player, clubId: number, role?: import('./squadStatus').SquadStatus): number | null {
  if (!cmLogic(g) || !g.clubs[clubId]) return null;
  const M = buildWantMem(g, p.club && p.club !== clubId ? [clubId, p.club] : [clubId]);
  const fin = M.W.finOf(clubId);
  if (!fin) return null;
  let st = M.W.staffOf(p);
  if (!st) st = M.W.addGenerated(p, 0);
  ensureImpls();
  // et tilbud efter Set Role At Club: originalens forhandling har den valgte rolle i kontraktposten (+0x4f), som 0x5968d0 læser for menneskets klub
  const status = p.club === clubId ? (role ? roleCode(role) : -1) : cmTalkStatus(g, p, clubId, role);
  const w = getMaxWage_5968d0(M.c, fin, st, status);
  return Math.max(0, w);
}

/** stabens Offer Contract (0x4de1f0/0x4de5d0 med et stabsjob): Finance::max_staff_wage 0x597db0(finansposten, jobbet) – og for en, der allerede
 *  er ansat i klubben, mindst hans nuværende løn (0x4d0c20). Ugeløn i € (null uden for ægte tilstand). */
const JOB: Record<string, number> = { manager: 5, assistant: 6, coach: 8, scout: 9, physio: 10 };
export function cmBoardStaffWageAllow(g: GameState, s: { club: number; wage?: number }, role: string, clubId: number): number | null {
  // (MODERN_PARITY §0 E) originalens stab (cmStaffOn – også nye 2026/27-spil i ægte tilstand); beløbene i klubbens £ (cmGbp)
  if (!cmStaffOn(g) || !g.clubs[clubId]) return null;
  const M = buildWantMem(g, [clubId]);
  const fin = M.W.finOf(clubId);
  if (!fin) return null;
  ensureImpls();
  let w = maxStaffWage_597db0(M.c, fin, JOB[role] ?? 8);
  if (s.club === clubId && s.wage) w = Math.max(w, Math.round(s.wage * cmGbp(g, clubId)));
  return Math.max(0, w) / cmGbp(g, clubId);
}

/** Budskærmens bestyrelseslinje (transfer_screens 0x8e9760, 0x8ea28e–0x8ea3d5): 0x598800(spiller, 0, &begrænset, 1, 0) – med attribute masking
 *  trækker 0x598800 (0x5994c0–0x5997d8) budgettet ned for en spiller, menneskets manager ikke kender fuldt: kendskabet 0x5b02f0 (cmKnow.ts – 0 intet,
 *  1 meget lidt, 2 noget, 3 fuldt) giver et loft af klubbens omdømme (+0x80)² × 0,01/0,02/0,04 (niveau 0/1/2; 0,005/0,01 for 0/1, når landets
 *  +0x85 < 9 og omdømmet under 4250), ganget med managerens omdømme/klubbens (ikke-spillerpost +0xa, klemt til 0,1..1) og landets +0x85 × 0,05
 *  (klemt til 0,25..1); budgettet bliver loftet + 1/8 af resten (højst 1,75 × loftet, fra £125.000). Niveau 3 = hele budgettet. Linjen vælges af
 *  niveauet alene (0x8ea327): 1 "know very little", 2 "only allow", 3 "will allow", 0 "don't know anything"; beløbet 0 → free-transfer-teksterne
 *  (0xa9e5e4/0xa9e6d0/0xa9e7b8). Beløbet i linjen er 0x598800's svar. */
export interface CmBidBudget { budget: number; level: number; limited: boolean }
export function cmKnowledgeLevel(g: GameState, p: Player): number {
  return cmKnowLevel(g, p);
}
export function cmBidBudget(g: GameState, p: Player, buyer: number): CmBidBudget | null {
  // (MODERN_PARITY 7) også 2026/27 i ægte tilstand med originalens bestyrelse (cmBoardLogic) – beløbet i køberens £ (cmMoney)
  if (!(cmActive(g) || cmBoardLogic(g)) || !g.clubs[buyer] || !p.club) return null;
  const r = staffBudget(g, p, buyer, 0);
  return r && { budget: Math.max(0, r.v) / cmGbp(g, buyer), level: r.level, limited: r.limited };
}

/** 0x598800(staff, a2, &begrænset, 1, 0) for køberen i £ med fortegn (de nederste 32 bit) – a2 ≠ 0: + værdien +0x52 af klubbens ikke-listede
 *  spillere (0x59884a). Menneskets "Add Player To Shortlist" (0x8f4b23/0x8f4bd0) kalder den med (staff, 1, 0, 1, 0). */
export function cmStaffBudget(g: GameState, p: Player, buyer: number, a2: number): number | null {
  if (!g.clubs[buyer]) return null;
  return staffBudget(g, p, buyer, a2)?.v ?? null;
}
function staffBudget(g: GameState, p: Player, buyer: number, a2: number): { v: number; level: number; limited: boolean } | null {
  const level = cmKnowledgeLevel(g, p);
  const KOBJ = 0x6a000000, OUTF = 0x6a000100;
  const M = buildWantMem(g, p.club ? [buyer, p.club] : [buyer], {
    useLog: (adr) => adr === 0x600a50 || adr === 0x849f00 || adr === 0x5afde0 || adr === 0x5b02f0,
    call: (adr) => (adr === 0x5afde0 ? KOBJ : adr === 0x5b02f0 ? level : undefined),
  });
  const fin = M.W.finOf(buyer);
  let st = M.W.staffOf(p);
  if (!st) st = M.W.addGenerated(p, 0);
  if (!fin || !st) return null;
  const m = M.c.m;
  prepClub(g, M, buyer, 0);
  const old = m.u32(0xae2a60);
  m.w32(0xae2a60, KOBJ); m.w32(OUTF, 0);
  ensureImpls();
  let v: number;
  try { v = GEN[0x598800](M.c, fin, [st, a2, OUTF, 1, 0]) | 0; } finally { m.w32(0xae2a60, old); }
  return { v, level, limited: m.u32(OUTF) === 1 };
}

/** bestyrelseslinjen på budskærmen (0x8ea327–0x8ea3c8): kendskabet vælger teksten, beløbet 0 free-transfer-varianten */
export function cmBoardLine(b: CmBidBudget): string {
  const zero = b.budget < 1;
  if (b.level === 3) return zero ? 'cl.bid.boardFree' : 'cl.bid.board';
  if (b.level === 2) return zero ? 'cl.bid.boardFree' : 'cl.bid.boardOnly';
  if (b.level === 1) return zero ? 'cl.bid.boardFreeLittle' : 'cl.bid.boardLittle';
  return zero ? 'cl.bid.boardFreeNothing' : 'cl.bid.boardNothing';
}
