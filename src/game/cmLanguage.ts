// Originalens sprog (player_stats.cpp, læst i cm0102.exe 3.9.68 – runde 9b, 12/11-2026; sikkert): PlayerStats' sprogtabel (+0x3c: poster à 6
// bytes – staff-id, sprog, flydende 0..10, sorteret), kontraktens +0x4f lave nibble (= flydende i klubbens sprog, 0x53ce90 = nibble − 10 i
// kampværdierne sub_6ec010) og den daglige indlæring i 0x5ce2d0.
//
//   0x7c6930 get_native_language_points(staff, L): nation +0x78 = L → 500, +0x79 = L → 300; Sverige L 22/32, Norge L 30/32, Danmark L 22/30
//            → 500, Belgien L 7 → 1000 (nøglelandene [0x9cf4a8]/[0x9cf408]/[0x9cf2c0]/[0x9cf244]); ellers anden nationalitet +0x1e: samme med
//            300/300/100 (Belgien L 7 → 500). Hovedsproget +0x77 giver 0 (0x7c6830 svarer 10 for det uden tabellen).
//   0x7bfd50 PlayerStats::PlayerStats (spilstarten, create_game 0x828ebb): for hver stab og L = 1..64: p = point, t = (20 − Adaptability)·10;
//            p ≠ 0 og p ≥ t → add_language(L, min(10, (p − t)/50)). (Ikke-spillere uden spillerpost i en udenlandsk klub: år i klubben ·
//            Adaptability · 0,05 – kun stab, ikke porteret: spillets stab har ingen sprog.)
//   0x7c6830 get_language_fluency(staff, club, L, brug kontrakten): klubbens land har samme sprog (+0x77) som spillerens land eller anden
//            nationalitet → 10; spillerens land/anden nationalitet har sproget L → 10; ellers tabellen (0 uden post).
//   0x85e960 generate_initial_contract / 0x866ee0 reset_morale_state: +0x4f lave nibble = min(10, 0x7c6830(staff, klub, klubbens sprog, 0)).
//   0x5ce2d0 0x5d2fb3: nibble < 10 og rand(ftol(100 − Adaptability·3,5)) = 0 → nibble + 1; nibble 1 → add_language(klubbens sprog, 1),
//            ellers improve_language(+1, højst 10).
// Forkørslen 1/1–14/7-2001 (0x5cc850, hele spillet dag for dag) er ikke med: målt mod ls20 (396 kampspillere 18.–25/8) passer kontraktens
// nibble bedst UDEN indlæring i forkørslen (351/396 ens, Σ(spil − orig) +21; med daglig indlæring 1/1→ 342/396, +180; fra ankomstdatoen
// 348, +58) – formentlig fordi 0x5ce2d0 kun kører dagligt for klubber, hvis division har en tabelpost [0xadadfc] (0x5ce46d), og 2001/02's
// tabeller først oprettes ved sæsonstarten (*antaget*, ikke læst).
// Spillets data: Nation.lang = [+0x77, +0x78, +0x79] (world-filen), Player.cmLang = tabellens poster for spilleren (sprog → flydende;
// kun dem, 0x7c6830 kan læse – hovedsprogene springes over), Player.cmNation2 (+0x1e), Adaptability (+0x56).
import type { GameState, Player } from './types';
import { ATTRS } from './attributes';

const s8 = (v: number) => (v << 24) >> 24;
const adaptOf = (p: Player) => s8(p.attrs[ATTRS.indexOf('adaptability' as never)] || 10);
type Nat = { name: string; lang?: number[] } | undefined;

/** 0x7c6930: point for sproget L af spillerens land og anden nationalitet */
export function nativePoints(nat: Nat, nat2: Nat, L: number): number {
  const keyed = (n: Nat, hit: number): number | null => {
    if (!n) return null;
    if (n.name === 'Sweden') { if (L === 0x16 || L === 0x20) return hit; }
    else if (n.name === 'Norway') { if (L === 0x1e || L === 0x20) return hit; }
    else if (n.name === 'Denmark') { if (L === 0x16 || L === 0x1e) return hit; }
    else if (n.name === 'Belgium') { if (L === 7) return hit === 500 ? 1000 : 500; }
    return null;
  };
  if (!nat) return 0;
  const a = keyed(nat, 500);
  if (a !== null) return a;
  if (nat.lang?.[1] === L) return 500;
  if (nat.lang?.[2] === L) return 300;
  if (!nat2) return 0;
  const b = keyed(nat2, 300);
  if (b !== null) return b;
  if (nat2.lang?.[1] === L) return 300;
  return nat2.lang?.[2] === L ? 100 : 0;
}

/** originalens startdato for England (0x830520: lørdagen nærmest 10/8 − 4 uger) – [0xdd6ec8], da PlayerStats bygges */
export const ORIGINAL_START = '2001-07-14';
const dayNo = (iso: string) => Math.round(Date.parse(`${iso}T00:00:00Z`) / 86400000);

/**
 * 0x7bfd50 for én spiller: (1) de indfødte point (0x7c6930) for L = 1..64 over tærsklen (20 − Adaptability)·10; (2) med karrierehistorik
 * (`lg` = CMRatings.lg, world-filen): dagene pr. sprog, for den nuværende klubs sprog (når det ikke er hans lands) mindst dagene fra han kom
 * til klubben til startdatoen (0x54cdb0 mod [0xdd6ec8]), og min(10, (dage − tærskel)/50) lagt til (højst 10) eller som ny post.
 * Poster for spillerens hovedsprog (og den anden nationalitets) udelades – 0x7c6830 læser dem aldrig.
 */
export function initialLanguages(g: GameState, p: Player, lg?: number[]): Record<number, number> | undefined {
  const nat = g.nations[p.nation], nat2 = p.cmNation2 !== undefined ? g.nations[p.cmNation2] : undefined;
  if (!nat?.lang) return undefined;
  const t = (20 - adaptOf(p)) * 10;
  const tab: Record<number, number> = {};
  const skip = (L: number) => L === nat.lang![0] || L === nat2?.lang?.[0];
  for (let L = 1; L <= 0x40; L++) {
    const pts = nativePoints(nat, nat2, L);
    if (pts === 0 || pts < t || skip(L)) continue;
    tab[L] = Math.min(10, Math.trunc((pts - t) / 50));
  }
  if (lg) {
    const days = new Map<number, number>();
    for (let k = 0; k + 1 < lg.length; k += 2) days.set(lg[k], lg[k + 1]);
    const Lc = g.nations[g.clubs[p.club]?.nation ?? -1]?.lang?.[0];
    if (p.club && Lc && Lc !== nat.lang[0]) {
      const since = p.cmJoined ? dayNo(ORIGINAL_START) - dayNo(p.cmJoined) : 0;
      const d = (days.get(Lc) ?? 0) > since ? days.get(Lc)! : since;
      days.set(Lc, (d << 16) >> 16);
    }
    for (let L = 1; L <= 0x40; L++) {
      const d = days.get(L) ?? 0;
      if (d === 0 || d < t || skip(L)) continue;
      const fl = Math.min(10, Math.trunc((d - t) / 50));
      tab[L] = tab[L] !== undefined ? Math.min(10, tab[L] + fl) : fl;
    }
  }
  return Object.keys(tab).length ? tab : undefined;
}

/** 0x7c6830(spiller, klub, L, 0): hvor flydende spilleren er i sproget L (0..10) */
export function languageFluency(g: GameState, p: Player, club: number, L: number): number {
  const nat = g.nations[p.nation], nat2 = p.cmNation2 !== undefined ? g.nations[p.cmNation2] : undefined;
  const cn = g.nations[g.clubs[club]?.nation ?? -1];
  if (cn?.lang) {
    const cl = cn.lang[0];
    if (nat?.lang?.[0] === cl || nat2?.lang?.[0] === cl) return 10;
  }
  if (nat?.lang?.[0] === L || nat2?.lang?.[0] === L) return 10;
  return p.cmLang?.[L] ?? 0;
}

/** kontraktens +0x4f lave nibble ved en ny kontrakt (0x85e960/0x866ee0): min(10, flydende i klubbens sprog); 10 uden sprogdata */
export function contractLanguageNibble(g: GameState, p: Player, club: number): number {
  const cn = g.nations[g.clubs[club]?.nation ?? -1];
  if (!cn?.lang || !g.nations[p.nation]?.lang) return 10;
  return Math.min(10, languageFluency(g, p, club, cn.lang[0]));
}

/** 0x5ce2d0 0x5d2fb3–0x5d3049: den daglige indlæring af klubbens sprog (kontraktens nibble og tabellen) */
export function languageDay(g: GameState, p: Player, c: { b4f?: number }, rand: (n: number) => number): void {
  if (c.b4f === undefined) return;
  if ((c.b4f & 0xf) >= 10) return;
  if (rand(Math.trunc(100 - adaptOf(p) * 3.5)) !== 0) return;
  c.b4f = (c.b4f & 0xf0) | ((c.b4f & 0xf) + 1);
  const L = g.nations[g.clubs[p.club]?.nation ?? -1]?.lang?.[0];
  if (L === undefined) return;
  const tab = (p.cmLang ??= {});
  // nibble 1 → add_language(L, 1) (en ny post – en eksisterende bliver stående, og opslaget finder den første: samme værdi som før + 1 ikke);
  // ellers improve_language(+1, højst 10)
  if ((c.b4f & 0xf) === 1) { if (tab[L] === undefined) tab[L] = 1; }
  else tab[L] = Math.min(10, (tab[L] ?? 0) + 1);
}
