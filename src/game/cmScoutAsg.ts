// Originalens spejderopgaver (PLAYER_SEARCH, listetype 4 med en opgave – cm0102.exe 3.9.68) – Assign Scout ▸ Nation/Region/Youth Players
// og turneringssøgningen. Porteret 17/11-2026 (afkodet med ~/cm0102-engine/tools/cmdis.py; listens felter i cmScout.ts' hoved):
//
//   0x7ae9c0 set_assignment(nation, region, turnering, ungdom, næste modstander): opgaven sættes, runden +0x1b5 = 0 og rapportdagen +0x1ad =
//            i dag + rand(3) + 1 (turnering: dog mindst turneringens første kampdag + 2, 0x48d500 → +0x1b6/+0x1be); derefter 0x7b0050.
//   0x7b0050 build_table: alle spillere uden for klubben (ikke 0x7a7eb0 – pensionering meldt – og ikke 0x8cca10 – aftalt skifte), skønnet
//            est = rand(500) − rand(500) + 0x6e2f20(flag 0x1e82, dommer = spejderen, klub 0) og potentialet (under 25 år) med flag 0x1f00; for
//            ungdomssøgningen pot = 2·(pot + 100·PA)/3 og ×0,85 (est < 5250) / ×0,9 (est < 7000, over 19 år); de fysiske gange som 0x7b62a0;
//            over 24 år i ungdomssøgningen 0. Med: est eller pot over 0,6·L (L = 0x7bca90 i 1750..35000) og viljen 0x846920(…, 1, 0, 1) ≥ 3,15.
//            Stjernerne som 0x7b62a0 (cmStaff.scoutJudgement). Dækningen (anden løkke): opgavens land, regionen (nation +0x76) eller
//            ungdom (under 20 år, samme kontinent som klubben eller pot > 33333, med klub kun ved 0x846920(…, 0, 0, 5) ≥ 3,5); spillere fra
//            klubbens eget land, som spejderen kender (0x5407e0 ≥ 4000), fjernes. Tabellen trimmes tilfældigt til rand(CA/3 + 2·Professionalism
//            + 20) + 50 (spejderens ikke-spillerpost +4 og +0x5b) og sorteres efter spiller (0x7bce50). Alle poster får flaget 1 (ny).
//            (Dækningen tjekkes her før skønnet – samme udfald: de fjernede indgår ikke, og trimningen fjerner tilfældige poster, så
//            rækkefølgen før den er ligegyldig for, hvilke der bliver.)
//   0x7aee80 recall: opgaven nulstilles (tabellen og runden bliver stående – listen vises på Scout #n).
//   0x7b3e20 run_scout_day (aften, fra 0x7f8750 for menneskeklubbernes ti lister): kun på rapportdagen. Runde 0 → nyheden 0x1389
//            ("… has started his … search"). Ellers renses tabellen (0x7b1520), poster uden for opgaven fjernes igen (og ungdom: 20+ år, en
//            klub, ikke samme kontinent og pot ≤ 40000), og n = (rand(50) + 75)·antal/(100·max) nye poster rapporteres (max = 8 runder,
//            turnering 1; sidste runde: alle nye) – en tilfældig ny post ad gangen (og de andre nye fra samme klub med den): flaget fjernes,
//            og ved 4+ stjerner kommer nyheden 0x138b (src/ui/cmScoutAsgNews.ts). Runde max → 0x138a "completed" og opgaven nulstilles
//            (tom tabel: ingen nyhed); runde max/2 → 0x138a "so far". Næste rapportdag: turnering → sidste kampdag + 2, ellers i dag +
//            rand(7) + 2; runden + 1.
//   0x7b62a0 force 0 (turneringssøgningens kampe, 0x7b5be0 – cmScout.ts): posten opdateres eller indsættes (kun nation/turnering/ungdom/
//            region), et nyt 5-stjernet fund giver straks 0x138b med kampen.
//   0x7b7490 scout_covers_nation med opgave (cmScout.ts coversNation): klubbens/opgavens land, regionen – ungdom/turnering dækker intet.
//   0x7bd9d0 + 0x7bdd70 styrkerne i nyheden 0x138b (rapportens "… also reflects favourably on …"): egenskab > 14 + spejderens skøn (Judging
//            Ability), og 0x7bdd70: (spiller-id + spejder-id) % 17 + 4·|Man Management − 10| − 8 > 35 − værdien (+ 2·(22 − alder) for unge,
//            − (10000 − kendskab)/1000 når spejderen kender ham). Svaghederne kræver staffState +0xb bit 0x40, som kun en udviklerkommando i
//            exe'en sætter (0x7a3c12) – de er altid 0.
//   Next Opposition (+0x19d, modstanderen +0x1a1 – porteret 20/11-2026): 0x7aed83 sætter opgaven uden rand(3) med rapportdagen i morgen og
//            runden 1 (ingen "started"); 0x7b0216 finder klubbens første uspillede kamp fra i morgen til i dag + 8 uger (ikke venskabskampe,
//            0x5acbe0) – uden kamp ingen tabel; tabellen er alle modstanderens spillere (staff +0x39) med skøn og stjerner, uden grænser,
//            vilje og dækning. 0x7b3e20: én runde, posterne bliver i renseløkken, ingen 0x138b; runde 1 → 0x138a "{klub} scouting completed"
//            med analysen (cmNextOppAnalysis: nøglespillerne 0x7b4ec1, holdets bytes 0x549100–0x549940 og niveauet 0x549a30) – rapportens tekst
//            er 0x7be670 (src/ui/cmScoutAsgNews.ts). Opgaven nulstilles ikke; 0x7f8c00 sætter den forfra efter hver af klubbens kampe.
// Ikke porteret: Club (klubvagten +0x170/0x7bd310) – kører stadig som før (scouting.ts); mediernes rygte om interessen (0x754740 i 0x7b62a0 – 0x84b6f0's vurdering med en delvist
//   uinitialiseret post); 0x5465a0 (spillerens beskrivelse i stedet for positionsordet, som i 0x138e).
// Tilfældige tal: cmRand (egen talrække – spillets rng røres ikke).
import type { GameState, Player, Staff } from './types';
import { addDays, ageOn } from './dates';
import { addNews } from './state';
import { asOwner } from './humans';
import { clubRepMem, cmActive, cmGenerated, cmFormRatings, cmRand, leagueAverage, newCmContract, statAvg, statusCode, staffJoined } from './cmPlayerData';
import { cmClubLevelOf, cmStaffAttr } from './cmStaff';
import { cmKnowSee } from './cmKnow';
import { cmNeedsPermit, cmPermitOn, cmWorkPermit, CM_EU } from './cmPermit';
import { workPermitGranted } from './rules2001';
import { playerRecord, roleDataOf } from './engine/grid/aiTeam';
import { recentForm, roleScore, type Day } from './engine/grid/roleScore';
import { ATTRS } from './attributes';
import { posMask as posMaskOf } from './cmScout';
import REGION from './data/cmNationRegion.json';

/** tabelposten (0x2d bytes): +0xc spilleren, +0x18 set, +0x20 flag (bit 0 = ikke rapporteret), +0x21/+0x25 skønnene, +0x29/+0x2a stjernerne */
export interface CmAsgRow { pid: number; seen: string; f: number; est: number; pot: number; ab: number; pt: number }
/** listens opgave (+0x18c nation, +0x194 region 1..14, +0x195 turnering, +0x199 ungdom), +0x1ad rapportdagen, +0x1b5 runden,
 *  +0x1b6/+0x1be turneringens første/sidste kampdag, +0x1ee tabellen */
export interface CmAsg { nation: number; region: number; comp: string | null; youth: boolean; date: string; round: number; cStart?: string; cEnd?: string; tab: CmAsgRow[];
  /** +0x19d Next Opposition og +0x1a1 modstanderen (klub-id, −1 = ingen) */
  opp?: boolean; oppClub?: number }

const s8 = (v: number) => (v << 24) >> 24;
const s16 = (v: number) => (v << 16) >> 16;
const ftol = Math.trunc;
const dayNo = (iso: string) => Math.round(Date.parse(iso + 'T00:00:00Z') / 86400000);
const dayOf = (iso: string): Day => { const d = new Date(iso.slice(0, 10) + 'T00:00:00Z'), y = d.getUTCFullYear(); return { day: Math.round((d.getTime() - Date.UTC(y, 0, 1)) / 86400000), year: y }; };
/** nation +0x76 (kontinentet/regionen 1..14): den originale database fra 3.9.68's nation.dat (cmNationRegion.json); 2026/27 fra databasens egen
 *  nation.dat (g.cmNation76 – opdateringen har bl.a. Italien/Spanien/Portugal i region 13) */
export const cmRegionOf = (g: GameState, n: number | undefined) => (n === undefined || n < 0 ? -1
  : !cmActive(g) && g.cmNation76 ? g.cmNation76[n] ?? -1 : (REGION as Record<string, number>)[g.nations[n]?.name ?? ''] ?? -1);
/** nation +0x7f = 2 (EU/EØS, 0x53d740): den originale database efter CM_EU, 2026/27 fra databasens nation.dat (g.cmNation7f) */
export const cmEuNation = (g: GameState, n: number | undefined) => n !== undefined && n >= 0
  && (!cmActive(g) && g.cmNation7f ? g.cmNation7f[n] === 2 : CM_EU.has(g.nations[n]?.name ?? ''));
const eu = cmEuNation;
/** spillerens land for spejderne: klubbens (+0x39 → +0x53), ellers nationaliteten (+0x1a) */
const natOf = (g: GameState, p: Player) => (p.club ? g.clubs[p.club]?.nation ?? -1 : p.nation);
/** kontraktens klub (0x4cf5a0) */
const homeOf = (p: Player) => (p.loan ? p.loan.from : p.club) || 0;
const sh = (p: Player, k: string) => s8(Math.round(p.attrs[ATTRS.indexOf(k as never)] || 10));

/** 0x846920 (cmAiBid.ts cmWill – registreres derfra, så spejdermodulerne ikke trækker ønskelisternes hukommelse ind ved indlæsningen) */
type WillFn = (g: GameState, p: Player, clubId: number, a3: number, a4: number, status: number) => number;
let willFn: WillFn = () => -1;
export function registerScoutWill(fn: WillFn): void { willFn = fn; }
export const cmWill: WillFn = (...a) => willFn(...a);

export const cmAsgOf = (g: GameState, s: Staff | undefined): CmAsg | undefined => (s ? g.cmScoutAsg?.[s.id] : undefined);
/** en opgave er sat (0x7aefd0) */
export const cmAsgOn = (a: CmAsg | undefined): a is CmAsg => !!a && (a.nation >= 0 || a.region >= 0 || !!a.comp || a.youth || !!a.opp);

/** 0x5407e0(spiller, spejder, 0) – som cmScout.ts */
function repSeen(g: GameState, p: Player, club: number): number {
  const r = p.cmRepMem ?? p.cmRep ?? [p.rep * 2, p.rep * 2, p.rep * 2];
  const w = (i: number) => s16(Math.round(r[i] * 50));
  const me = g.clubs[club], pc = p.club ? g.clubs[p.club] : undefined;
  return pc && me && (pc.id === me.id || pc.league === me.league) ? w(1) : (pc?.nation ?? p.nation) === me?.nation ? w(0) : w(2);
}

/** 0x6e2f20(spiller, post, 0, 0, flag, klub 0, 0, spejderen, −1, …) – rolleværdien med spejderen som dommer */
function scoutRole(g: GameState, p: Player, s: Staff, club: number, flags: number, age: number, rec: number[]): number {
  const judge = { id: s.cmId ?? s.id, ja: cmStaffAttr(s, 'judgingAbility'), jp: cmStaffAttr(s, 'judgingPotential') };
  const d = { ...roleDataOf(p, { cm: true, date: g.date, gameSeed: g.seed, leagueAvg: leagueAverage(g), judge }, age), repSeen: repSeen(g, p, club) };
  return roleScore({ id: p.id, age, atClub: !p.club, joined: dayOf(staffJoined(p) ?? g.date), realPlayer: !cmGenerated(g, p), rec, pos: 0, att: 0, lo: 0, hi: 0, tb: 0, tf: 0,
    flags, mgrJoined: dayOf(s.cmJoined ?? s.career?.[s.career.length - 1]?.from ?? g.date), today: dayOf(g.date), yearAgo: dayOf(`${+g.date.slice(0, 4) - 1}${g.date.slice(4)}`),
    captain: false, setPiece: 0, data: d, hasClub: false });
}

/** fysikkens tal: s = Pace + Acceleration (+0x36 + +0x1b), m = Jumping + Stamina + Strength + Teamwork + Work Rate */
function physical(rec: number[]): { s: number; m: number } {
  const u = (o: number) => s8(rec[o]);
  return { s: s8(u(0x36) + u(0x1b)), m: s8(u(0x44) + u(0x3f) + u(0x3d) + u(0x3c) + u(0x2e)) };
}
/** stjernerne (0x7b07c6 / 0x7b687b): over 1,2·L og 2·omdømmet + 12750 → 5, over L og 2·omdømmet + `four` → 4, over 0,8·L 3, 0,7·L 2, 0,6·L 1 */
export const starsOfEst = (x: number, L: number, rep2: number, four: number) => (x > 1.2 * L && x > rep2 + 12750 ? 5 : x > L && x > rep2 + four ? 4 : x > 0.8 * L ? 3 : x > 0.7 * L ? 2 : x > 0.6 * L ? 1 : 0);

/** 0x7b0050's skøn (est, pot) af en spiller */
function estimate(g: GameState, p: Player, s: Staff, club: number, youth: boolean, rnd: (n: number) => number): { est: number; pot: number; age: number } {
  const rec = playerRecord(p), age = ageOn(p.dob, g.date);
  const { s: sp, m } = physical(rec);
  const mul = (x: number, k: number) => ftol(x * k);
  const r1 = rnd(500), r2 = rnd(500);
  let est = r1 - r2 + scoutRole(g, p, s, club, 0x1e82, age, rec);
  if (m > 75 && sp > 30) est = mul(est, 1.2); else if (m > 65 && sp > 24) est = mul(est, 1.1); else if (m > 50 && sp > 24) est = mul(est, 1.05);
  if (sp < 15) est = mul(est, 0.75); else if (sp < 20) est = mul(est, 0.95);
  if (m < 25) est = mul(est, 0.85); else if (m < 40) est = mul(est, 0.95);
  if (age > 34) est = mul(est, 0.85);
  let pot = 0;
  if (age < 25) {
    const r3 = rnd(500), r4 = rnd(500);
    pot = r3 - r4 + scoutRole(g, p, s, club, 0x1f00, age, rec);
    if (youth) {
      pot = ftol((2 * (pot + 100 * s16(p.pa))) / 3);                     // 0x7b05b2
      if (est < 5250) pot = mul(pot, 0.85); else if (est < 7000 && age > 19) pot = mul(pot, 0.9);
    }
    if (sp < 15) pot = mul(pot, 0.75); else if (sp < 24) pot = mul(pot, 0.95);
    if (m < 30) pot = mul(pot, 0.75); else if (m < 45) pot = mul(pot, 0.9);
    if (m > 75 && sp > 30) pot = mul(pot, 1.2); else if (m > 65 && sp > 24) pot = mul(pot, 1.1); else if (m > 50 && sp > 24) pot = mul(pot, 1.05);
  }
  if (youth && age > 24) { est = 0; pot = 0; }
  return { est, pot, age };
}

/** dækningen i 0x7b0050's anden løkke (uden 0x846920-delen for ungdom) */
function covered(g: GameState, a: CmAsg, p: Player, club: number, age: number, pot: number | null): boolean {
  const nat = natOf(g, p);
  if (a.nation >= 0 && nat >= 0 && nat === a.nation) return true;
  if (a.region >= 0 && nat >= 0 && cmRegionOf(g, nat) === a.region) return true;
  if (a.youth && age < 20) {
    const same = nat >= 0 && cmRegionOf(g, nat) === cmRegionOf(g, g.clubs[club]?.nation);
    return same || (pot !== null && pot > 0x8235);
  }
  return false;
}

/** 0x7b0050 */
function buildTable(g: GameState, s: Staff, a: CmAsg, rnd: (n: number) => number): void {
  const club = s.club;
  a.tab = [];
  if (!club || !g.clubs[club]) return;
  const L = Math.min(35000, Math.max(1750, cmClubLevelOf(g, club)));
  const rep2 = 2 * s16(clubRepMem(g, club));
  const cn = g.clubs[club].nation;
  const out: CmAsgRow[] = [];
  // 0x7b0216: Next Opposition – klubbens næste kamp (ellers ingen tabel; +0x1a1 bliver stående)
  let opp = 0;
  if (a.opp) {
    const o = cmNextOpponent(g, club);
    if (o === null) return;
    a.oppClub = opp = o;
  }
  const ids = Object.keys(g.players).map(Number).sort((x, y) => x - y);
  for (const id of ids) {
    const p = g.players[id];
    if (!p || p.virtual || homeOf(p) === club || p.cmRetire || p.contract?.futureClub) continue;
    const age = ageOn(p.dob, g.date);
    if (opp) {
      // 0x7b0405: kun modstanderens spillere (staff +0x39); 0x7b06e7/0x7b0c16: uden grænserne, viljen og dækningen
      if (p.club !== opp) continue;
      const { est, pot } = estimate(g, p, s, club, false, rnd);
      out.push({ pid: p.id, seen: g.date, f: 1, est, pot, ab: starsOfEst(est, L, rep2, 10750), pt: starsOfEst(pot, L, rep2, 10500) });
      continue;
    }
    // (dækningen før skønnet – se filhovedet)
    if (!a.youth && !covered(g, a, p, club, age, null)) continue;
    if (a.youth && age >= 20) continue;
    const { est, pot } = estimate(g, p, s, club, a.youth, rnd);
    if (!covered(g, a, p, club, age, pot)) continue;
    if (!(est > 0.6 * L) && !(pot > 0.6 * L)) continue;
    if (cmWill(g, p, club, 1, 0, 1) < 3.15) continue;
    // ungdom med klub: 0x846920(spiller, klub, 0, 0, 5, 0) ≥ [0x968e38] = 3,5
    if (a.youth && p.club && !(cmWill(g, p, club, 0, 0, 5) >= 3.5)) continue;
    if (natOf(g, p) === cn && repSeen(g, p, club) >= 4000) continue;
    out.push({ pid: p.id, seen: g.date, f: 1, est, pot, ab: starsOfEst(est, L, rep2, 10750), pt: starsOfEst(pot, L, rep2, 10500) });
  }
  // 0x7b0ceb: rand(CA/3 + 2·Professionalism + 20) + 50 poster bliver
  const keep = rnd(ftol(s16(s.ca ?? 0) / 3) + 2 * s8(s.cmHid?.[5] ?? 10) + 20) + 50;
  while (out.length > keep) {
    const i = rnd(out.length);
    out[i] = out[out.length - 1];
    out.pop();
  }
  a.tab = out.sort((x, y) => x.pid - y.pid);
}

const ASG_KIND = { nation: 'nation', region: 'region', comp: 'league', youth: 'youth' } as const;

/** 0x7b0216: 0x5acbe0(i morgen 0x54c5b0(1), i dag + 8 uger 0x54c770(8), klub, liste, −1, −2, 1) – klubbens kampe dag for dag og tidspunkt for
 *  tidspunkt, hvor klubbens side har flaget +0x40/+0x41 = 1 (ikke venskabskampe); den første uspillede (+0x43 = 0xff) → modstanderen */
export function cmNextOpponent(g: GameState, club: number): number | null {
  const from = addDays(g.date, 1), to = addDays(g.date, 56);
  let best: { date: string; slot: number; id: number; opp: number } | null = null;
  for (const f of Object.values(g.fixtures)) {
    if ((f.home !== club && f.away !== club) || f.date < from || f.date > to || f.result || isFriendlyFx(g, f.comp)) continue;
    const slot = f.slot ?? 1;
    if (!best || f.date < best.date || (f.date === best.date && (slot < best.slot || (slot === best.slot && f.id < best.id))))
      best = { date: f.date, slot, id: f.id, opp: f.home === club ? f.away : f.home };
  }
  return best && best.opp && g.clubs[best.opp] ? best.opp : null;
}
/** fixture +0x40/+0x41 = 0: venskabskampene (og reserveholdets kampe – cmReserves.ts RES_COMP, uden turnering i g.comps) */
const isFriendlyFx = (g: GameState, c: string) => !g.comps[c] || c === 'FRIENDLY' || c.startsWith('FR');

/** 0x7ae9c0 + 0x7b0050: opgaven sættes (Assign Scout ▸ Nation / Region / Youth Players / Next Opposition, turneringen) */
export function cmAssignScout(g: GameState, s: Staff, o: { nation?: number; region?: number; comp?: string; youth?: boolean; nextOpp?: boolean }): void {
  const a: CmAsg = (g.cmScoutAsg ??= {})[s.id] ?? { nation: -1, region: -1, comp: null, youth: false, date: g.date, round: 0, tab: [] };
  g.cmScoutAsg[s.id] = a;
  const rnd = cmRand(g.seed ?? 0, s.id, dayNo(g.date), 0x7ae9c0);
  // 0x7aed83: Next Opposition – ingen rand(3): rapportdagen i morgen og runden 1 (ingen "started"-nyhed – max runder er 1)
  const other = (o.nation !== undefined && o.nation >= 0) || (o.region !== undefined && o.region >= 1 && o.region <= 14) || !!o.comp || !!o.youth;
  if (o.nextOpp && !other) {
    a.nation = -1; a.region = -1; a.comp = null; a.opp = true;
    a.date = addDays(g.date, 1);
    a.round = 1;
    buildTable(g, s, a, rnd);
    s.assignment = { kind: 'nextOpp', target: a.oppClub !== undefined && a.oppClub >= 0 ? a.oppClub : 0, since: g.date };
    return;
  }
  a.date = addDays(g.date, rnd(3) + 1);
  if (o.nation !== undefined && o.nation >= 0) { a.nation = o.nation; a.region = -1; a.comp = null; }
  else if (o.region !== undefined && o.region >= 1 && o.region <= 14) { a.nation = -1; a.region = o.region; a.comp = null; }
  else if (o.comp) {
    a.nation = -1; a.region = -1; a.comp = o.comp;
    // 0x48d500: turneringens første og sidste kampdag
    const ds = Object.values(g.fixtures).filter((f) => f.comp === o.comp).map((f) => f.date).sort();
    a.cStart = ds[0] ?? g.date; a.cEnd = ds[ds.length - 1] ?? g.date;
    const st2 = addDays(a.cStart, 2);
    if (st2 > a.date) a.date = st2;
  } else if (o.youth) { a.nation = -1; a.region = -1; a.comp = null; a.youth = true; }
  else return;
  a.round = 0;
  buildTable(g, s, a, rnd);
  s.assignment = a.nation >= 0 ? { kind: 'nation', target: a.nation, since: g.date } : a.region >= 0 ? { kind: 'region', target: a.region, since: g.date }
    : a.comp ? { kind: ASG_KIND.comp, target: a.comp, since: g.date } : { kind: 'youth', target: 0, since: g.date };
}

/** 0x7aee80 */
export function cmRecallScout(g: GameState, s: Staff): void {
  const a = cmAsgOf(g, s);
  if (a) { a.nation = -1; a.region = -1; a.comp = null; a.youth = false; a.opp = false; a.oppClub = -1; }
  s.assignment = null;
}

/** 0x7b7490 med en opgave (0x7aefd0): klubben/landet/regionen – ungdom og turnering dækker intet */
export function cmAsgCovers(g: GameState, a: CmAsg, nation: number): boolean {
  if (a.nation > -1 && a.nation === nation) return true;
  if (a.region > -1 && cmRegionOf(g, nation) === a.region) return true;
  return false;
}

/** 0x7b1520 + filtrene i 0x7b40d7: tabellen renses; antallet af nye poster */
function cleanTable(g: GameState, s: Staff, a: CmAsg): number {
  const club = s.club, cn = g.clubs[club]?.nation;
  let fresh = 0;
  for (let i = 0; i < a.tab.length; i++) {
    const r = a.tab[i], p = g.players[r.pid];
    const remove = () => { a.tab[i] = a.tab[a.tab.length - 1]; a.tab.pop(); i--; };
    if (!p || p.virtual) { remove(); continue; }
    // 0x7b410e: kendskabet (Attribute Masking, 0x5b09d0 med spejderen)
    if (g.options.masking) cmKnowSee(g, p, cmStaffAttr(s, 'judgingAbility'), s.id);
    // 0x7b4148: Next Opposition – posterne bliver
    if (a.opp) { if (r.f & 1) fresh++; continue; }
    const nat = natOf(g, p);
    if (a.nation > -1 && nat >= 0 && nat !== a.nation) { remove(); continue; }
    if (a.region > -1 && nat >= 0 && cmRegionOf(g, nat) !== a.region) { remove(); continue; }
    if (a.youth) {
      if (ageOn(p.dob, g.date) >= 20) { remove(); continue; }
      if ((nat < 0 || cmRegionOf(g, nat) !== cmRegionOf(g, cn)) && !(r.pot > 40000)) { remove(); continue; }
      if (p.club) { remove(); continue; }
    }
    if (nat === cn && repSeen(g, p, club) >= 4000) { remove(); continue; }
    if (homeOf(p) === club) { remove(); continue; }
    if (p.cmRetire) { remove(); continue; }
    if (r.f & 1) fresh++;
  }
  a.tab.sort((x, y) => x.pid - y.pid);
  return fresh;
}

/** 0x7b0050/0x7b3e20's tilladelsespladser: (1, får den) eller (2 EU-pas via anden nationalitet i en britisk klub / 0, 0) */
function permitSlots(g: GameState, s: Staff, p: Player, club: number): { permit: number; granted: number } {
  // modulet: den originale database i ægte tilstand eller et spil startet med 0x8c7950-porten (cmPermitOn – også 2026/27)
  if (!cmActive(g) && !cmPermitOn(g)) return { permit: 0, granted: 0 };
  // 0x7b4450/0x7b4473: 0x8c7560(…, 0) og 0x8c7950(spiller, land, 0, 0, 1) med tilfældighed (egen talrække – spillets rng røres ikke)
  if (cmNeedsPermit(g, p, club, true)) {
    const ok = cmPermitOn(g) ? cmWorkPermit(g, p, null, cmRand(g.seed ?? 0, s.id, p.id, dayNo(g.date), 0x7b3e20, 0x8c7950)) : workPermitGranted(p);
    return { permit: 1, granted: ok ? 1 : 0 };
  }
  const two = !eu(g, p.nation) && p.cmNation2 !== undefined && p.cmNation2 >= 0 && eu(g, p.cmNation2) && cmRegionOf(g, g.clubs[club]?.nation) === 0xe;
  return { permit: two ? 2 : 0, granted: 0 };
}

/** 0x7bdd70: lægger spejderen mærke til egenskaben? */
function notices(g: GameState, s: Staff, p: Player, v: number): boolean {
  if (!s.cmNp && !s.attrs) return false;
  const age = ageOn(p.dob, g.date);
  let lim = 0x23 - v;
  if (age < 22) lim += 2 * (22 - age);
  let k = repSeen(g, p, s.club);
  const days = (iso: string | undefined) => (iso ? dayNo(g.date) - dayNo(iso) : 0);
  if (s.club && s.club === p.club && days(s.cmJoined) > 150 && days(p.joined ?? p.cmJoined) > 150) {
    const x = k * 1.5, y = (days(p.joined ?? p.cmJoined) + 1300) * 5;
    k = ftol(y > x ? y : x);
  }
  if (s16(k) > 5000) lim += ftol(-(10000 - s16(k)) / 1000);
  const mm = cmStaffAttr(s, 'manManagement');
  return (((p.id + s.id) % 17) + 4 * Math.abs(mm - 10) - 8) > lim;
}

/** 0x7bd9d0: styrkerne spejderen lægger mærke til (ordet: bit 0 Leadership, 1 Loyalty, 2 Pressure, 3 Determination, 4 Work Rate, 5 Professionalism,
 *  6 Temperament, 7 Bravery, 0x100 Corners, 0x200 Penalties, 0x400 Free Kicks, 0x1000 Consistency) */
export function scoutGood(g: GameState, s: Staff, p: Player): number {
  if (!s.club) return 0;
  const ja = cmStaffAttr(s, 'judgingAbility');
  const n0 = 0x1e - ja;
  const id = p.id;
  let n = n0 < id % 30 ? 0 : s8(((n0 % 8) + (id % 7)) - 3);
  if (n & 1) n = s8(-n);
  const rec = playerRecord(p);
  const R = (o: number) => s8(rec[o]);
  const T = n + 14;
  let w = 0;
  const chk = (v: number, lim: number, bit: number) => { if (v > lim && notices(g, s, p, v)) w |= bit; };
  chk(R(0x2f), T, 1);
  chk(R(0x21), n + 15, 0x1000);
  chk(sh(p, 'loyalty'), T, 2);
  chk(sh(p, 'pressure'), T, 4);
  chk(sh(p, 'determination'), T, 8);
  chk(R(0x44), T, 0x10);
  chk(sh(p, 'professionalism'), T, 0x20);
  chk(sh(p, 'temperament'), T, 0x40);
  chk(R(0x20), T, 0x80);
  if (R(0xf) !== 20) {
    chk(R(0x22), T, 0x100);
    chk(R(0x29), T, 0x400);
    chk(R(0x38), T, 0x200);
  }
  return w;
}

/** nyheden 0x138b (0x7b44b2 / 0x7b49bf / 0x7b704a) – pladserne som tekstfunktionen 0x7b95c0 læser dem */
export function sendRecommendation(g: GameState, s: Staff, a: CmAsg, p: Player, ab: number, pt: number,
  match?: { team: number; opp: number; gf: number; ga: number; reserve: boolean; comp: string; stage: string; round: number }): void {
  const club = s.club;
  const home = homeOf(p);
  const params: Record<string, string | number> = {
    scout: `${s.first} ${s.last}`.trim(), slast: s.last || s.first, pid: p.id, player: `${p.first} ${p.last}`.trim(), last: p.last || p.first,
    age: ageOn(p.dob, g.date), pos: posMaskOf(p), club: home || -1, ab, pt,
    nation: a.nation, region: a.region, comp: a.comp ?? '', youth: a.youth ? 1 : 0,
    ...permitSlots(g, s, p, club), nat2: p.cmNation2 ?? -1, good: scoutGood(g, s, p),
  };
  if (match) Object.assign(params, { mt: match.team, mo: match.opp, gf: match.gf, ga: match.ga, rsv: match.reserve ? 1 : 0, mcomp: match.comp, stg: match.stage, rnd: match.round });
  asOwner(club, () => addNews({ cat: 'scout', key: keyOf(a, 'rec'), params, link: { kind: 'player', id: p.id } }));
}

/** overskriften pr. opgavetype [nation, region, turnering, ungdom] (0x7b7840 / 0x7b81f0 / 0x7b95c0) */
const KEY = { started: ['a70304', 'a702dc', 'a702b4', 'a7029c'], done: ['a70614', 'a705c4', 'a70574', 'a70534'], update: ['a705ec', 'a7059c', 'a7054c', 'a70520'],
  rec: ['a710c0', 'a7108c', 'a71058', 'a7103c'] };
const kindIx = (a: CmAsg) => (a.nation > -1 ? 0 : a.region > -1 ? 1 : a.comp ? 2 : a.youth ? 3 : -1);
const keyOf = (a: CmAsg, k: keyof typeof KEY) => { const i = kindIx(a); return `cmsn.${i < 0 ? 'a71028' : KEY[k][i]}`; };
const asgParams = (a: CmAsg, s: Staff) => ({ scout: `${s.first} ${s.last}`.trim(), nation: a.nation, region: a.region, comp: a.comp ?? '', youth: a.youth ? 1 : 0 });

/** 0x7b3e20 PLAYER_SEARCH::run_scout_day for én liste */
export function cmRunScoutDay(g: GameState, s: Staff): void {
  const a = cmAsgOf(g, s);
  if (!cmAsgOn(a) || !s.club || !g.clubs[s.club]) return;
  if (a.date !== g.date) return;
  const club = s.club;
  const rnd = cmRand(g.seed ?? 0, s.id, dayNo(g.date), 0x7b3e20);
  if (a.round === 0) {
    asOwner(club, () => addNews({ cat: 'scout', key: keyOf(a, 'started'), params: asgParams(a, s) }));
  } else {
    // 0x7b408d: turneringen og Next Opposition har én runde
    const max = a.comp || a.opp ? 1 : 8;
    const fresh = cleanTable(g, s, a);
    const cnt = a.tab.length;
    let n = a.round < max ? ftol(((rnd(50) + 75) * cnt) / (max * 100)) : fresh;
    n = Math.max(n, 1) < fresh ? Math.max(n, 1) : fresh;
    let reported = cnt - fresh;
    // [esp+0x30]: kontraktklubben for den sidst trukne post (0x8c7560 i analysen) – uden trækning antallet nye (0 – ingen klub)
    let lastClub = 0;
    const report = (r: CmAsgRow) => {
      r.seen = g.date; r.f &= ~1; n--; reported++;
      const p = g.players[r.pid];
      // 0x7b4481: Next Opposition sender ingen anbefalinger
      if (p && !a.opp && (r.ab >= 4 || r.pt >= 4)) sendRecommendation(g, s, a, p, r.ab, r.pt);
    };
    while (n > 0) {
      const r = a.tab[rnd(cnt)];
      if (!(r.f & 1)) continue;
      report(r);
      // 0x7b4803: de andre nye fra spillerens klub
      const pc = homeOf(g.players[r.pid]);
      lastClub = pc;
      if (pc) for (const q of a.tab) if (q.f & 1 && g.players[q.pid] && homeOf(g.players[q.pid]) === pc) report(q);
    }
    if (a.round === max && a.opp) {
      // 0x7b4d99–0x7b59e6: nyheden 0x138a med analysen af modstanderen; uden modstander eller tabel sættes opgaven forfra (ingen nyhed) –
      // opgaven nulstilles ikke (0x7b59d9), den sættes igen efter klubbens næste kamp (0x7f8ce3)
      const oc = a.oppClub ?? -1;
      if (oc >= 0 && g.clubs[oc] && a.tab.length) {
        const params = { ...asgParams(a, s), n: reported, done: 1, opp: 1, oc, mc: club, ...cmNextOppAnalysis(g, a, oc, club, lastClub) };
        asOwner(club, () => addNews({ cat: 'scout', key: 'cmsn.a704f8', params, link: { kind: 'club', id: oc } }));
      } else cmAssignScout(g, s, { nation: a.nation, region: a.region, comp: a.comp ?? undefined, youth: a.youth, nextOpp: true });
    } else if (a.round === max) {
      if (a.tab.length) asOwner(club, () => addNews({ cat: 'scout', key: keyOf(a, 'done'), params: { ...asgParams(a, s), n: reported, done: 1 } }));
      // 0x7b59ad: tom tabel → opgaven sættes forfra (ny tabel) og nulstilles straks
      else cmAssignScout(g, s, { nation: a.nation, region: a.region, comp: a.comp ?? undefined, youth: a.youth });
      cmRecallScout(g, s);
      s.scoutList = a.tab.map((r) => r.pid);
    } else if (a.round === Math.trunc(max / 2)) {
      asOwner(club, () => addNews({ cat: 'scout', key: keyOf(a, 'update'), params: { ...asgParams(a, s), n: reported, done: 0 } }));
    }
  }
  // 0x7b5b6a: næste rapportdag
  a.date = a.comp ? addDays(a.cEnd ?? g.date, 2) : addDays(g.date, rnd(7) + 2);
  a.round++;
}

// ---------------------------------------------------------------- Next Opposition: analysen i nyheden 0x138a (0x7b4ec1–0x7b5817)

/** posten (0x1a bytes) for en nøglespiller: +0 skønnet, +4 spilleren, +0x14 flagene, +0x18 CA */
export interface CmOppKey { est: number; pid: number; fl: number; ca: number }

/** 0x7b4f1a–0x7b542c: postens flag af spillerposten (+0x61), statistikken og kontrakten */
export function cmOppKeyRow(g: GameState, p: Player, r: CmAsgRow): CmOppKey {
  const rec = playerRecord(p);
  const R = (o: number) => s8(rec[o]);
  const W = (o: number) => s16(rec[o] | (rec[o + 1] << 8));
  let est = r.est;
  // 0x7b50ba: kontrakten (0x4cf5a0) +0x3d under 25 → skønnet 0
  if (p.club) { const c = p.cmContract ?? newCmContract(statusCode(p)); if (s8(c.b3d) < 25) est = 0; }
  let fl = 0;
  if (R(0x11) === 20) fl = 0x200;                                            // Defender
  if (R(0x15) === 20) {                                                      // Attacker: midt, ellers (offensiv) midtbane, ellers forsvar
    if (R(0x19) === 20) fl |= 0x100;
    else if (R(0x14) === 20 || R(0x13) === 20) fl |= 0x1000;
    else if (R(0x11) === 20 || R(0x12) === 20) fl |= 0x2000;
    else fl |= 0x100;
  }
  if (R(0x14) === 20 || R(0x12) === 20 || R(0x13) === 20) {
    fl |= R(0x11) === 20 ? 0x2000 : 0x400;
    if (R(0x18) === 20 || R(0x17) === 20) fl |= 0x1000;                      // venstre/højre
  }
  if (R(0xf) === 20) fl |= 0x800;
  if (R(0x2e) > 18 && R(0x2b) > 14 && R(0x3d) > 15) fl |= 0x20;              // Jumping, Heading, Strength
  else if (R(0x2e) < 6) fl |= 0x10;
  if (R(0x44) > 14 && R(0x1c) > 10 && R(0x3e) > 14) fl |= 2;                 // Work Rate, Aggression, Tackling
  if (R(0x36) > 18) fl |= 4; else if (R(0x36) < 6) fl |= 8;                  // Pace
  if (R(0x21) > 15) fl |= 0x80000; else if (R(0x21) < 5) fl |= 0x400000;     // Consistency
  if (R(0x2f) > 14) fl |= 0x80;                                              // Influence
  // 0x7b525f: PlayerStats kategori 6 – over 5 kampe: målene pr. kamp (angribere over 15) og formen mod spillets karaktersnit (float)
  const apps = statAvg(p, 6, 1, 6.5);
  if (apps > 5) {
    const per = statAvg(p, 6, 2, 6.5) / (apps > 1 ? apps : 1);
    if (R(0x15) > 15) { if (per < 0.25) fl |= 0x200000; else if (per > 0.65) fl |= 0x100000; }
    const L = Math.fround(leagueAverage(g));
    const v = recentForm(cmFormRatings(p)) * 0.2;
    if (v > L + 0.25) fl |= 0x800000; else if (v < L - 0.35) fl |= 0x1000000;
  }
  if (R(0x43) > 14) fl |= 1;                                                 // Creativity
  if (R(0x3d) > 14) fl |= 0x4000;                                            // Strength
  const age = ageOn(p.dob, g.date);
  if (age < 22 && W(0xb) < 5750) fl |= 0x8000;
  if (age > 34) fl |= 0x10000;
  // 0x54cdb0(i dag, staff +0x3e): under 65 dage i klubben (uden ankomstdato: intet flag)
  const joined = staffJoined(p);
  if (joined && dayNo(g.date) - dayNo(joined) < 65) fl |= 0x20000;
  if (p.injury) fl |= 0x40000;                                               // 0x62c400 = 2
  return { est, pid: p.id, fl, ca: W(5) };
}

/** klubbens trup (+0xd7) – databasens spillere (id < [0xae2364]) med spillerpost */
const realSquad = (g: GameState, club: number) => Object.values(g.players).filter((p) => p.club === club && !cmGenerated(g, p)).sort((a, b) => a.id - b.id);

/** Comp_Stats-rækken (0x4a4850) i klubbens division (+0x57): [kampe, mål for (+0x69), mål imod (+0x6a)] som bytes; null uden række */
function divRow(g: GameState, club: number): [number, number, number] | null {
  const lid = g.clubs[club]?.league;
  const comp = lid ? g.comps[lid] : undefined;
  if (!lid || !comp || comp.type !== 'league' || g.leagues[lid]?.hidden) return null;
  const row = comp.table.find((r) => r.club === club);
  return row ? [row.p & 0xff, row.gf & 0xff, row.ga & 0xff] : null;
}

/** 0x549100…0x549940 + 0x549470: holdets bytes i 0x7b81f0's rækkefølge (+0..+0xb; +8 sættes ikke) og stemningen +0xc */
export function cmOppTeamFlags(g: GameState, club: number): number[] {
  const rep = s16(clubRepMem(g, club));
  const tq = (div: number, add: number, lo: number, hi: number) => { const v = s16(Math.trunc(rep / div) + add); return v < lo ? lo : v > hi ? hi : v; };
  const jq = (cap: number) => Math.min(s16(Math.trunc(rep / 500) + 5), cap);
  const fit = realSquad(g, club).filter((p) => !p.injury).map((p) => playerRecord(p));
  const R = (r: number[], o: number) => s8(r[o]);
  const CA = (r: number[]) => s16(r[5] | (r[6] << 8));
  const count = (pred: (r: number[]) => boolean) => fit.filter(pred).length;
  const mid = (r: number[]) => R(r, 0x14) === 20 || R(r, 0x12) === 20 || R(r, 0x13) === 20;
  const row = divRow(g, club);
  const T2 = tq(75, 25, 40, 135);
  const f: number[] = new Array(13).fill(0);
  // +0 0x5492c0 angrebet: under 1,5 mål pr. kamp (heltalsdivision) → 0, ellers over én angriber med CA > T
  f[0] = row && row[0] && Math.trunc(row[1] / row[0]) < 1.5 ? 0 : +(count((r) => R(r, 0x15) === 20 && CA(r) > tq(65, 40, 40, 150)) > 1);
  // +1 0x549100 forsvaret: over 1,35 mål imod pr. kamp → 0, ellers over to forsvarere
  f[1] = row && row[0] && Math.trunc(row[2] / row[0]) > 1.35 ? 0 : +(count((r) => R(r, 0x11) === 20 && CA(r) > tq(65, 40, 40, 145)) > 2);
  f[2] = +(count((r) => mid(r) && CA(r) > tq(65, 40, 40, 145)) > 2);                                     // 0x549200 midtbanen
  f[3] = +(count((r) => mid(r) && CA(r) > T2 && R(r, 0x43) > jq(14) && R(r, 0x37) > jq(14)) > 1);        // 0x549940 Creativity + Passing
  f[4] = +(count((r) => mid(r) && CA(r) > T2 && R(r, 0x44) > jq(14) && R(r, 0x3e) > jq(14)) > 1);        // 0x549850 Work Rate + Tackling
  f[5] = +(count((r) => R(r, 0x11) === 20 && CA(r) > T2 && R(r, 0x2e) > jq(13)) <= 1);                   // 0x5495b0 forsvarere i luften
  f[6] = +(count((r) => R(r, 0x15) === 20 && CA(r) > T2 && R(r, 0x2e) > jq(13)) <= 1);                   // 0x5494d0 angribere i luften
  f[7] = +(count((r) => R(r, 0x11) === 20 && CA(r) > T2 && R(r, 0x36) > jq(10)) <= 1);                   // 0x549690 forsvarets fart
  f[9] = +(count((r) => R(r, 0x15) === 20 && CA(r) > T2 && R(r, 0x36) > jq(17)) > 0);                    // 0x549770 hurtige angribere
  f[10] = +fit.some((r) => R(r, 0xf) === 20);                                                            // 0x549470 en målmand
  f[11] = +(count((r) => CA(r) > tq(65, 40, 40, 140) && R(r, 0x44) > 14) > 4);                           // 0x5493c0 Work Rate
  f[12] = s8(g.cmClubMood?.[club] ?? 0);                                                                 // [0xae2d14] + 6·klub + 4
  return f;
}

/** 0x549a30(modstanderen, egen klub): holdets niveau 0..6 */
export function cmOppLevel(g: GameState, opp: number, mine: number): number {
  const recs = realSquad(g, opp).map((p) => playerRecord(p));
  const CA = (r: number[]) => s16(r[5] | (r[6] << 8));
  const RP = (r: number[]) => s16(r[0xb] | (r[0xc] << 8));
  recs.sort((a, b) => CA(b) - CA(a) || RP(b) - RP(a));                      // 0x549c30
  // 0x549aa7: de første min(n − 1, 16) (sic)
  let sum = 0, k = 0;
  for (let i = 0; i < recs.length - 1 && i < 16; i++) { sum += CA(recs[i]); k++; }
  const orep = s16(clubRepMem(g, opp));
  let al: number;
  if (!k) al = orep > 7250 ? 6 : orep > 5750 ? 5 : orep > 4750 ? 4 : orep > 3250 ? 3 : orep > 2250 ? 2 : 1;
  else { const av = Math.trunc(sum / k); al = av > 155 ? 6 : av > 135 ? 5 : av > 110 ? 4 : av > 85 ? 3 : av > 60 ? 2 : av > 40 ? 1 : 0; }
  const me = g.clubs[mine];
  if (me) {
    const mrep = s16(clubRepMem(g, mine));
    if (mrep > 7250) {
      if (orep < 4250 && al > 2) al -= 2;
      if (orep < 7250 && al > 0) al--;
    } else if (mrep < 4250 && al < 5) al++;
    if (me.league === g.clubs[opp]?.league) {
      const d = s16(mrep - orep), mood = (c: number) => s8(g.cmClubMood?.[c] ?? 0);
      if (d > 1250 && al > 0 && mood(mine) >= 0 && mood(opp) <= 0) al--;
      else if (d < 1250 && al < 5 && mood(opp) >= 0 && mood(mine) <= 0) al++;
    }
  }
  return al < 0 ? 0 : al > 6 ? 6 : al;
}

/** 0x7b4ec1–0x7b5817: nyhedens pladser – højst to nøglespillere (4+ stjerner eller 3 og omdømme > 6750, ikke 0x8c7560 i den sidst trukne
 *  posts klub; faldende skøn 0x7be640), holdets bytes og niveauet */
export function cmNextOppAnalysis(g: GameState, a: CmAsg, opp: number, mine: number, lastClub: number): Record<string, string | number> {
  const rows: CmOppKey[] = [];
  for (const r of a.tab) {
    const p = g.players[r.pid];
    if (!p) continue;
    const rec = playerRecord(p);
    const rp = s16(rec[0xb] | (rec[0xc] << 8));
    if (!((rp > 6750 && s8(r.ab) === 3) || s8(r.ab) > 3)) continue;
    if (lastClub && cmNeedsPermit(g, p, lastClub, false)) continue;
    rows.push(cmOppKeyRow(g, p, r));
  }
  rows.sort((x, y) => y.est - x.est || y.pid - x.pid);
  const kp = rows.slice(0, 2);
  return { kp: kp.map((k) => `${k.pid}:${k.fl}:${k.ca}`).join('|'), tf: cmOppTeamFlags(g, opp).join(','), lv: cmOppLevel(g, opp, mine) };
}

/** 0x7f8c00 (0x7f8cb0): efter en kamp, hvor begge sider har flaget +0x40/+0x41 (ikke venskabskampe), sættes menneskeklubbens lister med
 *  Next Opposition forfra (0x7ae9c0 → den næste modstander, rapporten i morgen) */
export function cmNextOppAfterMatch(g: GameState, f: { comp: string; home: number; away: number }, human: (club: number) => boolean, lists: (club: number) => Staff[]): void {
  if (!g.cmScoutAsg || isFriendlyFx(g, f.comp)) return;
  for (const club of [f.home, f.away]) {
    if (!club || !human(club)) continue;
    for (const s of lists(club)) if (g.cmScoutAsg[s.id]?.opp) cmAssignScout(g, s, { nextOpp: true });
  }
}

/** 0x7b62a0's tabeldel (0x7b69cf–0x7b6bf8): posten opdateres eller indsættes – true, hvis den allerede var 5-stjernet */
export function cmAsgRecord(g: GameState, s: Staff, p: Player, est: number, pot: number, ab: number, pt: number): boolean {
  const a = cmAsgOf(g, s);
  if (!a) return false;
  const r = a.tab.find((x) => x.pid === p.id);
  if (r) {
    const five = r.ab === 5 || r.pt === 5;
    Object.assign(r, { seen: g.date, est, pot, ab, pt });
    return five;
  }
  if (!ab && !pt) return false;
  if (a.nation <= -1 && !a.comp && !a.youth && a.region <= -1) return false;
  a.tab.push({ pid: p.id, seen: g.date, f: 0, est, pot, ab, pt });
  a.tab.sort((x, y) => x.pid - y.pid);
  return false;
}
