// Computerens trupplan 0x83cb40 (cmSquadPlan.ts) i vores spil: originalens felter af spiltilstanden og trupstatus tilbage (Player.squadStatus og
// kontraktens +0x4f/+0x4e i Player.cmContract), som computerens holdudtagelse 0x6e2f20 (aiTeam.ts → roleScore.ts) læser. Kun den originale
// database i ægte tilstand (cmActive); egen talrække (cmRand) – spillets rng og den moderne database/zonemotoren røres ikke.
//
// Tidspunkterne som i originalen: spilstarten 0x83a1b0 (alle klubber: arg3 = 0, arg4 = 1; menneskets klub også med P1 = P2 = 1 som ved
// overtagelsen 0x84abe0), hver dag 0x5cccd0 → dailyGate → 0x83a730 (arg3 = 1, arg4 = 0) og managerskiftet 0x84abe0 (0, 1, cmSquadPlanClub).
//
// *estimeret* (findes ikke i vores spil): B-holdene 0x540a50 (ingen partner), klubbernes plads i landets turneringsliste [0xae2d14] (−1),
// kontraktens +0xc (lønnen i £ – ved spilstarten −1 som originalens poster før 0x83a1b0's lønberegning), +0x35 (2, deltid 1), +0x49 (0),
// forhandlingerne 0x8c1870/0x8cca10/0x8c5cf0/0x8c5e40 (ingen), managerens ikke-spillerpost (databasens rå værdier, ellers 10),
// staff+0x65's lister (tomme), sproget 0x7c6830 (10 når han taler klubbens sprog, ellers 0). Sidevirkningerne til førsteholdet/reserverne
// (0x4cc0b0/0x4cc0f0), fritstilling (0x8c16b0) og transferlisten (0x842320) skrives kun i kontrakten (+0x4e) – de driver ikke vores
// Player.reserves/listed (transfers.ts' egen AI-listning er uændret; næste skridt i docs/ENGINE_PORT_PLAN.md).

import type { GameState, Player } from './types';
import { ATTRS } from './attributes';
import { ageOn } from './dates';
import { setClub, squad } from './state';
import { isHumanClub } from './humans';
import { cmActive, cmContractOf, cmRand, cmUnhappy, clubRepMem, nationRepMem, squadPlacement, statusCode } from './cmPlayerData';
import { cmClubEuro, cmFitRead } from './cmFitnessGame';
import { clubStrength, dailyGate, financeStatus, newPlanEntry, planSquad, type PlanEntry, type PlanInput, type PlanPlayer, type PlanSlot } from './cmSquadPlan';
import { aiPickCtx, playerRecord, roleDataOf } from './engine/grid/aiTeam';
import { roleScore, type Day } from './engine/grid/roleScore';
import { planScore, type ManagerBlockIn } from './engine/grid/planScore';
import { nationLanguage, playerLanguages } from './languages';
import { SQUAD_STATUSES } from './squadStatus';
import { dislikesClub, dislikesPerson, favoursClub, favoursPerson, managerStaff } from './cmRelations';

const GBP = 0.86;                                                             // £ = € · 0,86 (newgame.ts)
const dayNum = (iso: string) => Math.round(Date.parse(iso + 'T00:00:00Z') / 86400000);
const dayOf = (iso: string): Day => { const d = new Date(iso + 'T00:00:00Z'), y = d.getUTCFullYear(); return { day: Math.round((d.getTime() - Date.UTC(y, 0, 1)) / 86400000), year: y }; };
const sh = (p: Player, k: string) => p.attrs[ATTRS.indexOf(k as never)] || 10;
const BRITISH = new Set(['ENG', 'SCO', 'WAL', 'NIR', 'IRL']);
/** club_comp.dat +105 for Europa-turneringerne (326 European Champions Cup 20, 328 UEFA Cup 18, 330 Inter-Toto Cup 8) – fallback uden compRep */
const EURO_REP: Record<number, number> = { 326: 20, 328: 18, 330: 8 };

// ---------------------------------------------------------------- planlæggerens tilstand pr. klub (gemmes kompakt)

type SlotRow = [number, number, number, number, number, number, number, number, number];
interface PlanStore { s: SlotRow[]; st: number; fm: number; c: number }
const toRow = (s: PlanSlot): SlotRow => [s.role, s.mask, s.b24, s.f, s.s13, s.s17, s.idx, s.day, s.year];
const fromRow = (r: SlotRow): PlanSlot => ({ role: r[0], mask: r[1], b24: r[2], f: r[3], s13: r[4], s17: r[5], idx: r[6], day: r[7], year: r[8] });
function entryOf(g: GameState, cid: number): PlanEntry {
  const st = g.cmPlan?.[cid];
  if (!st) return newPlanEntry();
  return { slots: st.s.map(fromRow), state: st.st, form: st.fm, counter: st.c };
}
function storeEntry(g: GameState, cid: number, e: PlanEntry): void {
  (g.cmPlan ??= {})[cid] = { s: e.slots.map(toRow), st: e.state, fm: e.form, c: e.counter } satisfies PlanStore;
}

// ---------------------------------------------------------------- spillerne

function planPlayer(g: GameState, p: Player, fit: ReturnType<typeof cmFitRead>, startCall: boolean): PlanPlayer {
  const c = p.contract ? cmContractOf(p) : null;
  const end = p.contract ? dayOf(p.contract.expires) : { day: 0, year: 0 };
  const joined = dayOf(p.joined ?? p.cmJoined ?? g.date);   // staff +0x3e: skiftet i spillet går forud for databasens dato
  const inj = fit.injury(p);
  const r = p.cmFit;
  return {
    id: p.id, generated: !!p.regen, job: 0xb, age: ageOn(p.dob, g.date), clubId: p.loan ? p.loan.from : p.club,
    b5a: sh(p, 'pressure'), b5b: sh(p, 'professionalism'), value: Math.round(p.value * GBP), joinedDay: joined.day, joinedYear: joined.year,
    rec: playerRecord(p),
    contract: c ? { b3d: c.b3d, b3e: c.b3e, b3f: c.b3f, b45: c.b45, b49: 0, b4e: c.b4e ?? 0, b4f: c.b4f ?? ((statusCode(p) << 4) | 10),
      b35: p.contract?.partTime ? 1 : 2, endDay: end.day, endYear: end.year, wage: startCall ? -1 : Math.round((p.contract?.wage ?? 0) * GBP) } : null,
    injW2c: inj ? inj.w2c : null, recurring: r && r.rt !== -1 ? Math.max(1, r.rl) : 0, retiring: !!p.cmRetire,
    loan: !!p.loan, inTransfer: false, bid: false, deal1: false, deal2: false, fatigue: fit.fatigue(p),
  };
}

/** managerens ikke-spillerpost (0x48 bytes) af databasens rå værdier: tac [+0xe, +0x13, +0x15, +0x1a, +0x1c, +0x1f, +0x21, +0x43] og
 *  [Coaching +0x10, JPA +0x17, JPP +0x18, Physio +0x1e, Motivating +0x1b, Discipline +0x14, Tactics +0x21]; resten 10 (*estimeret*) */
function managerNp(g: GameState, cid: number): number[] | null {
  const st = g.staff[g.clubs[cid]?.manager ?? -1];
  if (!st) return null;
  const np = new Array(0x48).fill(10);
  const a = st.attrs as unknown as Record<string, number>;
  const put = (o: number, v: number | undefined) => { if (v !== undefined && v > 0) np[o] = v; };
  put(0x10, a.coaching); put(0x17, a.judgingAbility); put(0x18, a.judgingPotential); put(0x1e, a.physio); put(0x1b, a.motivating);
  put(0x14, a.discipline); put(0x21, a.tactics);
  if (st.tac) [0x0e, 0x13, 0x15, 0x1a, 0x1c, 0x1f, 0x21, 0x43].forEach((o, k) => put(o, st.tac![k]));
  return np;
}

// ---------------------------------------------------------------- én klub

/** 0x83cb40(entry, klub, daily, first) for en klub i vores spil */
export function cmSquadPlanClub(g: GameState, cid: number, daily: boolean, first: boolean, human?: boolean): void {
  if (!cmActive(g)) return;
  const club = g.clubs[cid];
  if (!club) return;
  const e = entryOf(g, cid);
  const fit = cmFitRead(g);
  const hum = human ?? isHumanClub(cid);
  const all = squad(cid);
  const pl = all.map((p) => planPlayer(g, p, fit, first && !daily && !g.cmPlan?.[cid]));
  const byId = new Map(all.map((p) => [p.id, p]));
  const rep = clubRepMem(g, cid);
  const [status, minAtt] = g.cmClubStat?.[cid] ?? [1, 0];
  // en aktiv liga (nation +0x11c / [0xadadfc]): ligaen spilles – lande uden simulerede ligaer har ingen turnering (0x83cb40 springer dem oftest over)
  const lg = g.leagues[club.league];
  const compId = (id?: string) => (id ? +(id.match(/(\d+)$/)?.[1] ?? NaN) : NaN);
  const leagueRep = lg ? g.cmCompRep?.[compId(club.league)] ?? null : null;
  const euro = cmClubEuro(g, cid);
  const euroRep = euro > -1 ? g.cmCompRep?.[euro] ?? EURO_REP[euro] ?? null : null;
  const count = all.filter((p) => !p.regen).length;
  const { T, R } = clubStrength({ rep, minAtt, status, leagueRep, leagueActive: !!lg && !lg.hidden && !!g.comps[club.league], euroRep, squadCount: count,
    finance: financeStatus(Math.round(club.balance * GBP), rep) });
  const st = g.staff[club.manager ?? -1];
  const mj = st?.career?.[st.career.length - 1]?.from ? dayOf(st.career[st.career.length - 1].from) : { day: 0, year: 1900 };
  const today = dayOf(g.date);
  const ind: PlanInput = {
    clubId: cid, daily, first, rep, status, national: false, hasNation: true, activeLeague: !!lg && !lg.hidden && !!g.comps[club.league],
    human1: hum, human2: hum, humanSettings: false, bTeam: false, partnerIsParent: false,
    x18: euro > -1 && (euro !== 330 || rep < 5000),
    managerId: st ? st.id : null, managerForm: st ? (st.tac?.[7] ?? null) : null, managerJoinedDay: mj.day, managerJoinedYear: mj.year,
    T, R, daysSinceStart: dayNum(g.date) - dayNum(g.cmStart ?? g.date), today, squad: pl,
  };
  const ctxPick = aiPickCtx(cid) ?? {};
  const np = managerNp(g, cid);
  const mgrBlock: ManagerBlockIn | undefined = np ? { np, j59: 10, b59: 10, b5b: 10, rel: { d30: false, d60: false, m840: false, m810: false } } : undefined;
  // managerblokkens forhold pr. spiller (0x6e79da/0x6e7a14: spilleren og klubben, 0x6e7a5b/0x6e7a72: manageren og spilleren – cmRelations.ts)
  const mgrPerson = managerStaff(g, cid);
  const mgrOf = (p: Player): ManagerBlockIn | undefined => (mgrBlock && (p.cmRel || mgrPerson?.cmRel)
    ? { ...mgrBlock, rel: { d30: dislikesClub(p, cid), d60: favoursClub(p, cid), m840: dislikesPerson(mgrPerson, p.id), m810: favoursPerson(mgrPerson, p.id) } } : mgrBlock);
  const yearAgo = dayOf(`${+g.date.slice(0, 4) - 1}${g.date.slice(4)}`);
  const clubLang = nationLanguage(g, club.nation);
  const cache = new Map<number, ReturnType<typeof roleDataOf>>();
  const dataOf = (p: Player) => { let d = cache.get(p.id); if (!d) { d = roleDataOf(p, ctxPick, ageOn(p.dob, g.date)); cache.set(p.id, d); } return d; };
  const rand = cmRand(g.seed ?? 0, cid, dayNum(g.date), 0x83cb40);
  const releaseQ: number[] = [];
  planSquad(e, ind, {
    rand,
    value: (pp, mask, flags) => {
      const p = byId.get(pp.id)!, d = dataOf(p), c = pp.contract;
      const inj = pp.injW2c !== null ? fit.injury(p) : null;
      const pLang = nationLanguage(g, p.nation);
      return planScore({
        id: p.id, real: !p.regen, age: pp.age, joined: { day: pp.joinedDay, year: pp.joinedYear }, rec: pp.rec!, pos: mask, flags,
        hasClub: true, atClub: pp.clubId === cid, stHasClub: pp.clubId > 0, sameNationClub: (g.clubs[pp.clubId]?.nation ?? -1) === club.nation,
        mgrJoined: hum ? mj : null, today, yearAgo,
        nationRep: nationRepMem(g, p.nation), british: BRITISH.has(g.nations[p.nation]?.code ?? ''), caps: p.caps, b56: sh(p, 'adaptability'),
        langDiff: !!clubLang && !!pLang && clubLang !== pLang, lang: clubLang && playerLanguages(g, p).includes(clubLang) ? 10 : 0,
        nationOfClub: p.nation === club.nation || p.cmNation2 === club.nation,
        clubRep: rep, stClubRep: clubRepMem(g, pp.clubId), listed: !!p.listed, daysNoClub: 0,
        league69: leagueRep, mgr: mgrOf(p) ?? { np: null, j59: 10, b59: 10, b5b: 10, rel: { d30: false, d60: false, m840: false, m810: false } },
        data: { ...d, contract: c ? { b3d: c.b3d, b3e: c.b3e, b3f: c.b3f, b44: p.cmContract?.b44 ?? 0, b45: c.b45, b4f: c.b4f } : null,
          injury: () => (inj ? { w28: inj.w28, w2c: inj.w2c } : null) },
      });
    },
    role: (pp, mask, flags) => {
      const p = byId.get(pp.id)!, d = dataOf(p), c = pp.contract;
      return roleScore({
        id: p.id, age: pp.age, atClub: pp.clubId === cid, joined: { day: pp.joinedDay, year: pp.joinedYear }, realPlayer: !p.regen, nationFlag11c: true,
        rec: pp.rec!, pos: mask, att: 0, lo: 0, hi: 0, tb: 0, tf: 0, flags,
        mgrJoined: st ? mj : null, today, yearAgo, captain: false, setPiece: 0,
        data: { ...d, contract: c ? { b3e: c.b3e, b3f: c.b3f, b44: p.cmContract?.b44 ?? 0, b45: c.b45, b4f: c.b4f } : null },
        ...(mgrBlock ? { mgrBlock: mgrOf(p), hasClub: true } : {}),
      });
    },
    judge: (pp, kind, hint) => dataOf(byId.get(pp.id)!).judge(kind, hint),
    // 0x4cc0b0/0x4cc0f0: staff +0x5e skiftes kun fra reserverne (1) til førsteholdet (2) og omvendt – klubber uden reservehold (0) intet
    promote: (pp) => { const p = byId.get(pp.id); if (p && squadPlacement(g, p, cid) === 1) p.cmPlace = 2; },
    demote: (pp) => { const p = byId.get(pp.id); if (p && squadPlacement(g, p, cid) === 2) p.cmPlace = 1; },
    // 0x842320: kontraktens +0x4e |= 1 (sat i planSquad) – Player.listed følger efter planen nedenfor
    transferList: () => {},
    // 0x8c16b0 TRANSFER_MANAGER::queue_free_transfer: lægges i listen +0x92c (hvornår den behandles, er ikke afkodet – hos os straks, *estimeret*)
    release: (pp) => { if (!hum) releaseQ.push(pp.id); },
    unhappy: (pp) => { const p = byId.get(pp.id); if (p && pp.contract) { syncBack(p, pp); cmUnhappy(g, p, cid); } },
    leaguePos: () => count,
  });
  // tilbage i vores spiller: kontraktens felter og trupstatus (computerens klubber – menneskets status sætter manageren selv)
  for (const pp of pl) {
    const p = byId.get(pp.id);
    if (!p || !pp.contract) continue;
    syncBack(p, pp);
    if (!hum) {
      const code = pp.contract.b4f >> 4;
      p.squadStatus = code >= 1 && code <= 7 ? SQUAD_STATUSES[code - 1] : undefined;
      // +0x4e bit 1 (0x842320 transferlisten) og bit 2 (lejelisten) – computerens klubber sætter kun spillere til salg/leje her (transfers.ts'
      // egen listning er slået fra med den originale database i ægte tilstand); transferønsket (bit 8) er spillerens eget og ikke en listning
      const k = pp.contract.b4e;
      if (!!(k & 1) !== !!p.listed) { p.listed = !!(k & 1); p.listPrice = undefined; }
      p.loanListed = k & 2 ? true : undefined;
    }
  }
  for (const id of releaseQ) {
    const p = byId.get(id);
    if (!p || p.club !== cid || p.loan || p.contract?.futureClub) continue;
    setClub(p, 0);
    p.contract = null;
  }
  storeEntry(g, cid, e);
}
function syncBack(p: Player, pp: PlanPlayer): void {
  const c = cmContractOf(p), k = pp.contract!;
  c.b3d = k.b3d; c.b3e = k.b3e; c.b3f = k.b3f; c.b45 = k.b45; c.b4e = k.b4e; c.b4f = k.b4f;
}

// ---------------------------------------------------------------- spilstarten og dagen

/** 0x83a1b0 (newgame, efter trupperne og konditionsmodulets start): alle klubber i en aktiv liga (de skjulte spiller aldrig – *estimeret*: springes over) */
export function cmSquadPlanStart(g: GameState): void {
  if (!cmActive(g)) return;
  g.cmStart = g.date;
  for (const c of Object.values(g.clubs)) {
    if (!c.league || g.leagues[c.league]?.hidden) continue;
    cmSquadPlanClub(g, c.id, false, true, false);
    if (isHumanClub(c.id)) cmSquadPlanClub(g, c.id, false, true, true);   // overtagelsen 0x84abe0 (P1 = P2 = 1)
  }
}

/** 0x5cccd0 (hver dag, efter datoskiftet – sim.ts newDay før konditionsmodulet): +8-tælleren og 0x83a730 for de klubber, porten åbner */
export function cmSquadPlanDaily(g: GameState): void {
  if (!cmActive(g) || !g.cmPlan) return;
  const day = dayNum(g.date);
  for (const c of Object.values(g.clubs)) {
    if (!c.league || g.leagues[c.league]?.hidden) continue;
    const st = g.cmPlan[c.id];
    if (!st) continue;
    const e = entryOf(g, c.id);
    const go = dailyGate(e, cmRand(g.seed ?? 0, c.id, day, 0x5cdc68));
    storeEntry(g, c.id, e);
    if (go) cmSquadPlanClub(g, c.id, true, false);
  }
}
