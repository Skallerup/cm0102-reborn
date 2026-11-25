// Spillernes værdi som originalen (cmValueOn – CONTRACT_MANAGER-delen, alle CM-databaser i ægte tilstand, MODERN_PARITY §0 E): staff +0x52 = 0x4d0c60(staff, kontraktens klub, 0, −1, …)
// som CONTRACT_MANAGER::daily_update's 0x4c7ec5 (cmContract.ts staffStep) – håndporteret i cmValue.ts (kontrolleret mod den oversatte) og her kørt på
// posterne bygget af spillets data (cmContractGame.ts buildWantMem); resultatet står i Player.value (€).
//
// Hvornår originalen regner: hver dag i tidspunkt 2 for alle personer med kontrakt og klub – computerens spillere på ulige dage i året (dag 0 =
// 1/1), ikke-spillere hver dag, menneskets spillere hver dag med flag 1 (så længe kontraktens +0x4e & 4 er sat – Set Staff Transfer Status med egen
// udbudspris rydder den: Player.cmAsk). Uden kontrakt/klub: 0. En aktiv frikøbsklausul (+0x21) er loftet.
//
// Rettelser til buildWantMem's poster for værdien (målt mod oraklets spilstart 14/7-2001, scripts/cm-value-diff.ts):
//   – menneskets manager er en rigtig person i originalen: klubben +0x39, nationen +0x1a og en ikke-spillerpost (oraklets: CA 3, Judging Player
//     Ability/Potential −15/10 – *målt*, ét spil) – managerens kendskab 0x5408c0 = 0 (samme klub), så omdømmet er +0xb (før +0xd).
//   – computerklubber, hvis manager ikke er i originalens hukommelse (Staff.cmMem – udlandets klubber uden indlæst manager): +0xcf = 0, så
//     kendskabet er 4 (verdensomdømmet +0xd) og bedømmelsen 0x6e86d0 uden manager.
// Tilbage (tilfældigt i originalen, ikke det samme spil for spil): 0x6e86d0's spredning er en hash af personens og managerens hukommelses-id og
// spillets frø – id'erne er rækkefølgen af de indlæste personer efter 0x524d70's terningslag, så de kan ikke genskabes; trupplanens +0x3d,
// forkørslens kontraktforlængelser og de udfyldte egenskaber.
import type { GameState, Player } from './types';
import { buildWantMem, type WantMem } from './cmContractGame';
import { playerValue_4d0c60, seenRep_5407e0, judge_6e86d0 } from './cmValue';
import { hasActiveReleaseClause_867b50 } from './cmContractWant';
import { clubAt, getContract } from './cmMem';
import { humanClub_600a50, writeHumanMgr } from './cmWageGame';
import { cmActive, cmLogic } from './cmPlayerData';
import { isHumanClub } from './humans';
import { cmGbp } from './cmMoney';

/** (MODERN_PARITY §0 E) originalens +0x52 (CONTRACT_MANAGER::daily_update 0x4c7ec5): 2001-verdenen, eller en CM-database i ægte tilstand fra et
 *  spil startet med CONTRACT_MANAGER (g.cmCmMgr – newgame.ts). Ældre 2026/27-spil beholder spillets egen værdimodel (training.ts). */
export const cmValueOn = (g: GameState): boolean => cmActive(g) || (cmLogic(g) && !g.draft && g.cmCmMgr === 1);
/** CM_VALUE_MGR=sel (målinger mod oraklet, databasestørrelse 2): kun de valgte landes managere er i hukommelsen (Staff.cmMem er Maximum's) */
const MGR_SEL = typeof process !== 'undefined' && process.env?.CM_VALUE_MGR === 'sel';
const HUMAN_NP_ADR = 0x67f00000;

/** stabile id'er til 0x6e86d0's spredning pr. hukommelse: personpost → id (spillerne: Player.id; managerne: 500.000 + Staff.id; menneskets
 *  manager 499.999). buildWageMem tildeler staben og de genererede spillere id'er i byggerækkefølgen, så samme spiller ellers fik en anden værdi
 *  alt efter hvilke klubber, der blev bygget (de daglige mod de månedlige). */
const STABLE = new WeakMap<WantMem, Map<number, number>>();

/** Hukommelsen til værdien for klubberne `clubs` (buildWantMem med rettelserne ovenfor) */
export function cmValueMem(g: GameState, clubs: Iterable<number>): WantMem {
  const M = buildWantMem(g, clubs);
  const m = M.c.m;
  const ids = new Map<number, number>();
  for (const [p, st] of M.W.players) ids.set(st, p.id);
  STABLE.set(M, ids);
  let hn = 0;
  for (const [cid] of Object.entries(g.clubs)) {
    const a = M.W.clubOf(+cid);
    if (!a) continue;
    const mg = m.u32(a + 0xcf);
    if (!mg) continue;
    if (isHumanClub(+cid)) {
      writeHumanMgr(m, mg, a, M.W.natOf(g.manager.nation), HUMAN_NP_ADR + 0x40 * hn++, g, +cid);
      ids.set(mg, 499_999);
    } else if (g.cmStaffMem && (!g.staff[g.clubs[+cid].manager ?? -1]?.cmMem || (MGR_SEL && !g.activeNations?.includes(g.clubs[+cid].nation)))) m.w32(a + 0xcf, 0);
    else ids.set(mg, 500_000 + (g.clubs[+cid].manager ?? 0));
  }
  return M;
}

/** +0x52 (£) for en spiller i hukommelsen (0 uden kontrakt/klub) */
export function cmValueAt(M: WantMem, st: number): number {
  const m = M.c.m, c = M.c;
  const k = getContract(m, st);
  const club = k ? clubAt(m, m.s32(k + 4)) : 0;
  if (!k || !club || m.s32(club) !== m.s32(k + 4)) return 0;
  // managerens bud 0x6e86d0 med de stabile id'er (personens og managerens +0 byttes kun under kaldet; omdømmet 0x5407e0 med de byggede)
  let J = -1;
  const ids = STABLE.get(M);
  if (ids) {
    const mg = m.u32(club + 0xcf);
    const R = seenRep_5407e0(c, st, mg, 0);
    const s0 = m.s32(st), m0 = mg ? m.s32(mg) : 0;
    m.w32(st, ids.get(st) ?? s0); if (mg) m.w32(mg, ids.get(mg) ?? m0);
    J = judge_6e86d0(c, mg, st, club, 1, R);
    m.w32(st, s0); if (mg) m.w32(mg, m0);
    if ((J & 0xffff) === 0xffff) J = -1;
  }
  let v = playerValue_4d0c60(c, st, club, 0, J, humanClub_600a50(c, club) ? 1 : 0) | 0;
  if (hasActiveReleaseClause_867b50(m, k) && v > m.s32(k + 0x21)) v = m.s32(k + 0x21);
  return v;
}

/** +0x52 (£) for spillerne i `players` (standard: alle med kontrakt) – nøgle = spiller-id */
export function cmValuesGbp(g: GameState, players?: Iterable<Player>): Map<number, number> {
  const ps = [...(players ?? Object.values(g.players))].filter((p) => p.club && p.contract && !p.virtual);
  const clubs = new Set<number>();
  for (const p of ps) clubs.add(p.loan?.from ?? p.club);
  const M = cmValueMem(g, clubs);
  const out = new Map<number, number>();
  for (const p of ps) { const st = M.W.staffOf(p); if (st) out.set(p.id, cmValueAt(M, st)); }
  return out;
}

/** Player.value = originalens +0x52 for spillerne (menneskets spillere med egen udbudspris cmAsk beholder den). Værdien 0 (kontrakten udløbet)
 *  skrives ikke – spillet viser ellers £0 for en spiller, der stadig er i klubben. */
export function cmValuesApply(g: GameState, players?: Iterable<Player>): number {
  if (!cmValueOn(g)) return 0;
  const vals = cmValuesGbp(g, players);
  let n = 0;
  for (const [id, v] of vals) {
    const p = g.players[id];
    if (!p || v <= 0) continue;
    // £ → € med faktoren for kontraktens klub (cmMoney.ts – den originale database: 0,86)
    const k = cmGbp(g, p.loan?.from ?? p.club);
    if (p.cmAsk && p.cmAsk.club === p.club) { p.cmAsk.f = v / k; continue; }
    p.value = v / k; n++;
  }
  return n;
}

const dayOfYear = (iso: string) => { const y = +iso.slice(0, 4); return Math.round((Date.parse(iso.slice(0, 10) + 'T00:00:00Z') - Date.UTC(y, 0, 1)) / 86400000); };

/** Dagens 0x4c7ec5 (sim.ts, lige efter CONTRACT_MANAGER-porten): menneskets spillere hver dag, computerens på ulige dage i året – for hastighedens
 *  skyld kun klubberne i de valgte lande (resten den 1. i måneden, training.ts monthlyValues – *estimeret*: originalen regner dem også på ulige dage) */
export function cmValuesDaily(g: GameState): number {
  if (!cmValueOn(g) || g.date.slice(8, 10) === '01') return 0;
  const odd = dayOfYear(g.date) % 2 !== 0;
  const active = new Set(g.activeNations ?? []);
  const ps: Player[] = [];
  for (const p of Object.values(g.players)) {
    if (!p.club || !p.contract || p.virtual) continue;
    const home = p.loan?.from ?? p.club;
    if (isHumanClub(home) || (odd && active.has(g.clubs[home]?.nation ?? -1))) ps.push(p);
  }
  const t0 = performance.now();
  const n = ps.length ? cmValuesApply(g, ps) : 0;
  VALUE_STATS.days++; VALUE_STATS.ms += performance.now() - t0; VALUE_STATS.n += n;
  return n;
}
/** målinger: dage, spillere regnet, tid (ms) */
export const VALUE_STATS = { days: 0, n: 0, ms: 0 };

/** 0x59ef0a (process_club_finance_events 0x59ed70, cmFinEvents.ts): menneskets klub går i betalingsstandsning – spillernes +0x52 sættes ned til
 *  0x4d0c60(spiller, klub, 0, −1, 1) (de 50 i truppen med kontrakt i klubben), og kontraktens +0x4e får 4 (egen udbudspris væk – Player.cmAsk) */
export function cmReceivershipValues(g: GameState, cid: number): void {
  const ps = Object.values(g.players).filter((p) => p.club === cid && !p.loan && p.contract && !p.virtual);
  if (!ps.length) return;
  const M = cmValueMem(g, [cid]);
  const club = M.W.clubOf(cid), k = cmGbp(g, cid);
  for (const p of ps.slice(0, 50)) {
    const st = M.W.staffOf(p);
    if (!st) continue;
    const v = playerValue_4d0c60(M.c, st, club, 0, -1, 1) | 0;
    if (v < Math.round(p.value * k)) { p.value = v / k; delete p.cmAsk; }
  }
}
