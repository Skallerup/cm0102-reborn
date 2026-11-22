// Originalens "reservekampe" – baggrundskampene med fixture −2 (cm0102.exe 3.9.68 0x84b940/0x84be20). Kun den originale database i ægte
// tilstand (cmActive). Afkodet 16/11-2026 (~/cm0102-engine/notes/reserve-matches.md).
//
// (RETTET 20/11) Klubberne i de spilbare ligaer har reservekampe – turneringen "Reserve" ([0x9cf684]) får kopier af ligakampene hver uge
// (reservemanageren 0x7e6380 – cmReserveMatches.ts). Det, 0x84be20 spiller, er kampe for alle klubber UDEN for de spilbare
// ligaer (baggrundslandene og de ikke-spilbare rækker), så deres spillere får kampe, kondition, statistik og kontrakttællere:
//
//   0x84b940  grupperne (ved nyt spil 0x829e1c og på hver sæsonopdatering 0x5d5d58 for et spilbart land, ikke på spilstartens dato):
//             puljen = klubberne i klubrækkefølgen, hvis division (+0x57) og +0x60 ikke spilles ([0xadadfc][div] = 0) og som ikke er landshold
//             (0x775790); sorteret efter omdømme +0x80 (ombytningssortering, faldende), n/2 ombytninger af plads a = rand(n) med
//             b = a − rand(n/150) + rand(n/150) (indtil 0 ≤ b < n); ⌈n/16⌉ grupper à 16, de første 16 − (n mod 16) à 15 (når n mod 16 ≠ 0).
//   0x84be20  dagligt (0x5cdac9, i dagsløkken 0x5cccd0 efter 0x79bf40 og før 0x68f9c0): G ombytninger af to tilfældige klubber mellem
//             gruppe a = rand(G) og b = a − rand(G/150) + rand(G/150). Gruppe i spiller i dag, når dag-i-året mod 7 = i mod 7 og måneden
//             (0x54cfb0, 0 = januar) ≤ 4 eller ≥ 7 (ingen kampe i juni og juli). Pr. klub i gruppen: kamp (alle slags) fra 2 dage før til
//             3 dage efter (0x5acbe0) eller intet land (+0x53) → −1; ellers antallet af spillere i truppen +0xd7 med spillerpost, ikke
//             skadet (0x62c400 = 2) og ikke hos landsholdet (0x7757d0). Ombytningssortering faldende; klar = antal > 0; er klar > 2: klar²
//             ombytninger af rand(klar), rand(klar). Parvis 0–1, 2–3 …, så længe den første har > 0 og den anden > −1.
//   kampen    fixture −2 (+0x3a = 2, +0x40/+0x41 = 1, intet stadion/turnering): fyldspillerne 0x90d2f0, hele kampmotoren (init_match 0x6b7f20,
//             run_match_steps 0x6b98c0), resultatposten 0x729ff0, PlayerStats 0x7c0d70 (kategori pr. hold rand(9) ? 2 : 3 – liga/pokal; karaktererne
//             i de «hurtige» kampes snit +0x20/+0x28 – engine+0 = 1 fra init_match(…, 1, 0, 0) 0x84c3e8), kontraktens tællere og bonusserne 0x4ca6d0 (+0x3a ≠ 1: ikke venskabskamp), konditionen/skaderne 0x62c080,
//             AWARD_MANAGER 0x4134c0 (ingen turnering → ingen priser), arbejdstilladelsen 0x8c39f0; fyldspillerne ud igen 0x90d6b0.
//             Ingen tabel, ingen økonomi (FinanceTable 0x59a5d0 kaldes ikke), ingen karantæner (Discipline 0x55ca00 kaldes ikke), ingen
//             bestyrelse, ingen nyheder.
//
// *estimeret*: tallene trækkes af spillets frø (cmRand – originalens talrække 0x90cfc0 er ikke vores), kampene spilles af zonemotoren med
// originalens profil (gittermotoren for ~100 kampe om dagen koster for meget tid; CM_RES_GRID=1 slår den til), landsholdsophold 0x7757d0
// (ingen – som cmVirtual.ts), +0x60 (spillets klubber har én division), 0x5acbe0's −2-filter (spillets kampprogram har ingen −2-kampe).
import type { GameState, Fixture, MatchReport } from './types';
import { cmActive, cmLogic, cmRand, clubRepMem } from './cmPlayerData';
import { fixturesOn, gs, squadIds } from './state';
import { addDays } from './dates';
import { cmUpdateDay } from './cmSeason';

export const RES_COMP = 'RES';
export const isResFixture = (f: { comp: string } | undefined) => f?.comp === RES_COMP;

/** gruppernes og kampenes tilstand (gemt i spillet) */
export interface CmResState {
  /** grupperne à 15–16 klub-id'er (0x84b940) */
  groups: number[][];
  /** sidst bygget (ISO-dato) */
  built: string;
  /** spillede baggrundskampe i alt (til måling) */
  played?: number;
}

/** kampen spilles af sim.ts (registreret dér – undgår en cirkulær import) */
type Player_ = (f: Fixture, salt: number) => MatchReport | null;
let playMatch: Player_ | null = null;
export function setResMatchPlayer(fn: Player_): void { playMatch = fn; }

/** kun til tests, der ikke bruger reservekampene (kalender-/tilmeldingstests): springer de daglige reservekampe over */
export const RES_SKIP = { on: false };
// (MODERN_PARITY 12) 2026/27 i ægte tilstand: nye spil får tilstanden ved spilstarten (cmResNewGame – grupperne bygges på den første dag som
// for 2001); ældre 2026-spil og udvidet tilstand beholder spillets egne reservekampe (reserves.ts)
export const cmResOn = (g: GameState) => (cmActive(g) || (cmLogic(g) && !!g.cmRes)) && !g.draft;
/** (2026/27) spilstarten: baggrundskampene 0x84b940/0x84be20 slås til */
export function cmResNewGame(g: GameState): void { if (!g.draft) g.cmRes = { groups: [], built: '', played: 0 }; }

const dn = (iso: string) => Math.round(Date.parse(iso + 'T00:00:00Z') / 86400000);
/** [0xae2c90]: dag i året (0 = 1. januar) */
const doyOf = (iso: string) => dn(iso) - Math.round(Date.UTC(+iso.slice(0, 4), 0, 1) / 86400000);
/** 0x54cfb0: måneden, 0 = januar */
const monthOf = (iso: string) => +iso.slice(5, 7) - 1;

/** [0xadadfc][division] ≠ 0: klubbens liga spilles (som cmVirtual.ts) */
function running(g: GameState, cid: number): boolean {
  const lg = g.clubs[cid]?.league;
  return !!lg && g.comps[lg]?.type === 'league' && !g.leagues[lg]?.hidden;
}

/** 0x84b940's pulje: klubberne i klubrækkefølgen, hvis liga ikke spilles (spillets klubber er aldrig landshold) */
export function cmResPool(g: GameState): number[] {
  return Object.keys(g.clubs).map(Number).sort((a, b) => a - b).filter((c) => !running(g, c));
}

/** 0x84b940: grupperne */
export function cmResBuild(g: GameState): CmResState {
  const list = cmResPool(g);
  const n = list.length;
  const rand = cmRand(g.seed ?? 0, dn(g.date), 0x84b940);
  const rep = new Map(list.map((c) => [c, clubRepMem(g, c) << 16 >> 16]));   // +0x80 (word)
  // 0x84bbc1: ombytningssortering – plads i mod alle senere j: rep[i] < rep[j] → byt
  for (let i = 0; i < n - 1; i++) for (let j = i + 1; j < n; j++) if (rep.get(list[i])! < rep.get(list[j])!) { const t = list[i]; list[i] = list[j]; list[j] = t; }
  // 0x84bc4a: n/2 ombytninger i nærheden (n/150)
  const w = Math.trunc(n / 150);
  for (let k = Math.trunc(n / 2); k > 0; k--) {
    const a = rand(n);
    let b: number;
    do b = a - rand(w) + rand(w); while (b < 0 || b >= n);
    const t = list[a]; list[a] = list[b]; list[b] = t;
  }
  // 0x84bcc0: ⌈n/16⌉ grupper; med rest r ≠ 0 får de første 16 − r grupper 15 klubber
  const G = Math.trunc(n / 16) + (n % 16 ? 1 : 0), r = n % 16;
  const groups: number[][] = [];
  let k = 0;
  for (let gi = 0; gi < G; gi++) {
    const grp: number[] = [];
    for (let j = 0; j < 16 && k < n; j++) {
      grp.push(list[k++]);
      if (r && gi < 16 - r && j === 14) break;
    }
    groups.push(grp);
  }
  return { groups, built: g.date, played: g.cmRes?.played ?? 0 };
}

/** 0x5d5d58: sæsonopdateringens dag for et spilbart land (nøglelandstabellens +0x15 – som cmFinance.ts) */
function seasonUpdate(g: GameState): boolean {
  const md = g.date.slice(5);
  return g.activeNations.some((n) => cmUpdateDay(g, n) === md);
}

/** 0x84be20's tælling for én klub: −1 = kamp fra 2 dage før til 3 dage efter (eller intet land), ellers antal klar */
function readyCount(g: GameState, cid: number, from: string, to: string): number {
  const c = g.clubs[cid];
  if (!c) return -1;
  for (let d = from; d <= to; d = addDays(d, 1)) for (const id of fixturesOn(d)) { const f = g.fixtures[id]; if (f && (f.home === cid || f.away === cid)) return -1; }
  if (c.nation === undefined || c.nation < 0 || !g.nations[c.nation]) return -1;          // +0x53
  let n = 0;
  for (const pid of squadIds(cid)) { const p = g.players[pid]; if (p && p.club === cid && !p.virtual && !p.injury) n++; }
  return Math.min(n, 127);
}

/** kampene, der skal spilles i dag (0x84be20 uden selve kampene) – [hjemme, ude] */
export function cmResPairs(g: GameState, st: CmResState): [number, number][] {
  const rand = cmRand(g.seed ?? 0, dn(g.date), 0x84be20);
  const groups = st.groups, G = groups.length;
  // 0x84be81: G ombytninger mellem to grupper tæt på hinanden
  const w = Math.trunc(G / 150);
  for (let i = 0; i < G; i++) {
    const a = rand(G);
    let b: number;
    do b = a - rand(w) + rand(w); while (b < 0 || b >= G);
    const ia = rand(groups[a].length), ib = rand(groups[b].length);
    if (!groups[a].length || !groups[b].length) continue;
    const t = groups[a][ia]; groups[a][ia] = groups[b][ib]; groups[b][ib] = t;
  }
  const out: [number, number][] = [];
  const doy = doyOf(g.date), mon = monthOf(g.date);
  if (!(mon <= 4 || mon >= 7)) return out;
  const from = addDays(g.date, -2), to = addDays(g.date, 3);
  for (let gi = 0; gi < G; gi++) {
    if (doy % 7 !== gi % 7) continue;
    const clubs = groups[gi].slice();
    const cnt = clubs.map((c) => readyCount(g, c, from, to));
    const ready = cnt.filter((x) => x > 0).length;
    // 0x84c159: ombytningssortering faldende efter antal
    for (let i = 0; i < clubs.length - 1; i++) for (let j = i + 1; j < clubs.length; j++) if (cnt[i] < cnt[j]) {
      let t = cnt[i]; cnt[i] = cnt[j]; cnt[j] = t; t = clubs[i]; clubs[i] = clubs[j]; clubs[j] = t;
    }
    // 0x84c1ca: klar² tilfældige ombytninger blandt de klare
    if (ready > 2) for (let k = ready * ready; k > 0; k--) {
      const a = rand(ready), b = rand(ready);
      let t = cnt[a]; cnt[a] = cnt[b]; cnt[b] = t; t = clubs[a]; clubs[a] = clubs[b]; clubs[b] = t;
    }
    // 0x84c249: parvis, så længe den første har spillere og den anden ikke er optaget
    for (let k = 0; k < clubs.length - 1; k += 2) {
      if (!(cnt[k] > 0) || !(cnt[k + 1] > -1)) break;
      out.push([clubs[k], clubs[k + 1]]);
    }
  }
  return out;
}

/** dagligt (sim.ts newDay): grupperne bygges ved behov og på sæsonopdateringen, og dagens baggrundskampe spilles */
export function cmResDaily(g: GameState = gs()): number {
  if (!cmResOn(g)) return 0;
  if (!g.cmRes || !g.cmRes.built || (seasonUpdate(g) && g.cmRes.built !== g.date)) g.cmRes = cmResBuild(g);
  const pairs = cmResPairs(g, g.cmRes);
  if (!playMatch) return 0;
  let n = 0;
  const day = dn(g.date);
  pairs.forEach(([home, away], k) => {
    // fixture −2: ikke i kampprogrammet (id < 0 – deterministisk pr. dag og kamp, rører ikke spillets id-tæller)
    const f: Fixture = { id: -(day * 256 + k + 1), comp: RES_COMP, date: g.date, home, away, round: 0 };
    if (playMatch!(f, k)) n++;
  });
  g.cmRes.played = (g.cmRes.played ?? 0) + n;
  return n;
}
