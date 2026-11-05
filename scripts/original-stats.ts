// Udtrækker kalibreringstal fra det ORIGINALE CM 01/02 (Bosman Edition, macOS) mens det kører en sæson.
//
// Brug: npx tsx scripts/original-stats.ts [mappe] [--db <Data-mappe>] [--json out.json]
//   mappe  = mappe med originalens .tmp-filer (default: ~/Library/Application Support/cm0102). Filerne læses kun.
//            Kopiér gerne mappen først, mens spillet kører – filerne skrives løbende.
//   --db   = den database spillet blev startet med (default: app-bundlens Data-<version> ud fra
//            settings.txt "database = 3.9.60"). Bruges til klub-/liga-/nationsnavne.
//
// ─────────────────────────────── AFKODEDE FORMATER ───────────────────────────────
// Alle tal little-endian. "rt-id" = spillets KØRSELS-id, som IKKE er databasens id: ved nyt spil smider
// originalen ca. halvdelen af klubberne i club.dat væk og nummererer resten fortløbende (samme rækkefølge
// som club.dat). Landsholdene (nat_club.dat, 426 stk.) lægges i forlængelse: rt-id = antal klubber +
// indeks i nat_club.dat (i det nuværende spil: 5183 + indeks). Konkurrence-id'er (club_comp.dat) er
// derimod databasens egne.
//
// match_stats_matches.tmp (69.000.000 bytes, forudallokeret)
//   4 tabeller á 17.250.000 bytes = 5000 poster á 3450 bytes. Tabellerne fyldes forfra; en post med år 0
//   afslutter tabellen. Tabel 1 = Champions League (set: alle CL-kvalifikationskampe), tabel 3 = bl.a.
//   landskampe og "lette" kampe uden holdstatistik; tabel 0/2 = blandet (venskabskampe, landskampe …).
//   Betydningen af tabellerne er IKKE sikker – scriptet bruger dem ikke til at bestemme turnering.
//   Post (3450 bytes):
//     0x000 i32 hjemmehold (rt-id)      0x004 i32 udehold (rt-id)
//     0x008 u16 dag i året (0 = 1. jan) 0x00A u16 år
//     0x00C … u16-tripler (hjem, ude, 0, sum) – zone-/boldbesiddelsestællere (ikke brugt)
//     0x034 i32 tilskuere              0x038 i32 billetindtægt
//     0x04D u8  spilleminutter inkl. tillægstid (91–96)
//     0x058 4-byte hændelser (spillerindeks, type, minut, ?) indtil 00000000 – type 1 er IKKE mål
//           (fx 4 stk. i en 3-0); ikke brugt.
//     Holdsektion H = 0x11C (hjem) og 0x11C + 1573 (ude), 1573 bytes:
//       H+0x03 u8 mål (= sum af spillernes mål)          H+0x05 u8 mål imod (målmandens tal)
//       H+0x0B u8 skud      H+0x0C u8 skud på mål        H+0x0D u8 hjørnespark (korr. 0,5 med skud)
//       H+0x0E u8 frispark (= modstanderens H+0x10 + H+0x11 i 81 % af kampene)
//       H+0x0F u8 ukendt, ~8,5 pr. hold, ukorreleret med alt (indkast?)
//       H+0x10 u8 frispark begået (korr. 0,43 med egne gule)   H+0x11 u8 offside
//       H+0x12 u8 gule kort H+0x13 u8 røde kort (= sum af spillernes kort)
//       H+0x14 u16 afleveringer  H+0x16 u16 heraf lykkedes  H+0x18 u16 tacklinger  H+0x1A u16 heraf vundet
//       H+0x1C u16 hovedstødsdueller i kampen (samme tal for begge hold)  H+0x1E u16 heraf vundet
//       H+0x20 u16 ukendt (korr. 0,69 med boldbesiddelse)   H+0x22 u8 boldbesiddelse % (hjem + ude = 100)
//       Navnene på 0x0D–0x11 er udledt statistisk (ingen skærmbillede af Match Stats) – se svaret.
//       H+0x74 20 spillerblokke á 73 bytes (første spillers id ligger på H+0x74):
//         +0x00 i32 spiller (rt-staff-id) +0x16 u16 fødselsår  +0x1C u8 nr. (1–20) +0x1D u8 position
//               (0xFE = skadet ud, 0xFD = udvist, 0xFF = ikke brugt)  +0x20 u8 kondition til sidst
//         +0x21 u8 mål  +0x22 u8 (målmand) mål imod  +0x25 u8 skud  +0x26 u8 skud på mål
//         +0x2C u8 gult kort  +0x2D u8 rødt kort  +0x30 u8 minut skiftet ud  +0x32 u8 minut skiftet ind
//         +0x33 u8 minut for skade  +0x34 u8 minut for rødt kort  (0xFF = ingen)
//   Verificeret mod skærmbilledet "Evening Results" 18.7.2001 (CL 1. kvalifikationsrunde, 2. kamp):
//   Barry Town 0-2 Sloga, Bohemians 2-0 Kaunas, Slavia Mozyr 0-1 Haka, Linfield 3-0 Kutaisi, Shamkir 2-0
//   Fylkir, Shirak 0-2 HB, Triesenberg 1-2 Levadia, Valletta 0-3 Sheriff, Ventspils 2-2 Avenir Beggen.
//   (NB: "Evening Fixtures"-skærmen før kampene viser 1. kamps resultat – ikke dagens.)
//
// player stats history.tmp – 47-byte poster (hver post står typisk to gange i træk):
//     0x00 u16 sæson (startår)  0x02 i32 klub (rt-id)  0x06 u16 kampe  0x08 u16 mål  … 0x2A u8 tag + i32
//   Svarer post for post til databasens staff_history.dat (17 bytes: id, person, år u16, klub i32, leje,
//   kampe, mål) for de spillere der er med i spillet. Det bruger vi til at FINDE rt-id → database-id:
//   unikke følger af 3 poster (år, kampe, mål) stemmer klubberne sammen; derefter monoton rensning (LIS),
//   udfyldning af huller hvor antallet passer, og til sidst divisionsgæt for klubber der spiller ligakampe
//   mod kendte klubber. Sæson 2001-poster (indeværende sæson) skrives kun for spillere der har forladt en
//   klub; ved sæsonens slutning bør alle få en – derfor bruges de ikke til topscorere endnu.
//
// fixtures_<år>.tmp – kampprogrammet for et kalenderår: i32 antal, derefter 79-byte poster:
//     0x00 i32 turnering (club_comp-id; 390–408 = nation_comp.dat: VM-kval., U21 …)  0x04 i32 ?  0x08 i32 ?
//     0x0C i32 hjemme (rt-id)  0x10 i32 ude  0x14 4 × pegere  0x24 u16 år + u16 dag (turneringens slutdato?)
//     0x28 u16 år + 0x2A u16 dag = kampdato   0x42 u8 ff (?)  0x43 u8 hjemmemål  0x44 u8 udemål
//     0x45 u8 hjemmemål ved pausen  0x46 u8 udemål ved pausen  (mål = ff: ikke spillet)
//     0x47/0x48 u8 stilling efter forlænget spilletid (pokal); 0x43/0x44 er efter 90 min. match_stats har
//     slutresultatet inkl. forlængelse – derfor de få "afvigelser" (alle i pokalturneringer).
//   Spillet lægger NÆSTE års program ud på disk og skriver det afviklede års (med resultater) ved årsskiftet:
//   under sæsonen findes fixtures_2001.tmp (jul–dec, med resultater) og fixtures_2002.tmp (jan–jun, endnu
//   uden resultater). Kampene i 2002 får derfor resultat fra match_stats. De engelske ligaer bruges også som
//   ankre i klubafbildningen (EPL-klubbernes rt-id'er sorteret = database-id'er sorteret).
//
// Ikke afkodet / ikke brugt: injury_history.tmp (variable spillerblokke), ban_history.tmp, club (league/
// cup/records) history, comp records history, past_*_awards, staff history, computer/human events.
// Skader pr. kamp tages derfor fra kampposten (spiller med skademinut), dvs. kun skader opstået i kampen.
// ──────────────────────────────────────────────────────────────────────────────────
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const opt = (name: string) => { const i = args.indexOf(name); if (i < 0) return undefined; const v = args[i + 1]; args.splice(i, 2); return v; };
const dbArg = opt('--db');
const jsonOut = opt('--json');
// originalens mappe (læses kun) – eller et snapshot af den
const DIR = args[0] ?? join(homedir(), 'Library/Application Support/cm0102');
const GAME = '/Applications/CM 01-02 Bosman Edition.app/Contents/Resources/game';

const read = (p: string) => { const b = readFileSync(p); return new DataView(b.buffer, b.byteOffset, b.byteLength); };
const str = (v: DataView, o: number, n: number) => {
  let s = ''; for (let i = 0; i < n; i++) { const c = v.getUint8(o + i); if (!c) break; s += String.fromCharCode(c); } return s.trim();
};
const u8 = (v: DataView, o: number) => v.getUint8(o);
const u16 = (v: DataView, o: number) => v.getUint16(o, true);
const i32 = (v: DataView, o: number) => v.getInt32(o, true);

// ---------- database ----------
let dbDir = dbArg;
if (!dbDir) {
  let ver = '3.9.60';
  try { const m = readFileSync(join(DIR, 'settings.txt'), 'latin1').match(/^database\s*=\s*([\d.]+)/m); if (m) ver = m[1]; } catch { /* default */ }
  dbDir = join(GAME, `Data-${ver}`);
  if (!existsSync(dbDir)) dbDir = join(GAME, 'Data');
}
const CL = read(join(dbDir, 'club.dat'));
const NC = read(join(dbDir, 'nat_club.dat'));
const CC = read(join(dbDir, 'club_comp.dat'));
const NA = read(join(dbDir, 'nation.dat'));
const SH = read(join(dbDir, 'staff_history.dat'));

type Club = { id: number; name: string; nation: number; div: number };
const clubs: Club[] = [];
for (let o = 0; o + 581 <= CL.byteLength; o += 581) clubs.push({ id: i32(CL, o), name: str(CL, o + 4, 51), nation: i32(CL, o + 83), div: i32(CL, o + 87) });
const natClubs: Club[] = [];
for (let o = 0; o + 581 <= NC.byteLength; o += 581) natClubs.push({ id: i32(NC, o), name: str(NC, o + 4, 51), nation: i32(NC, o + 83), div: -1 });
const comps = new Map<number, { name: string; nation: number }>();
for (let o = 0; o + 107 <= CC.byteLength; o += 107) comps.set(i32(CC, o), { name: str(CC, o + 4, 51), nation: i32(CC, o + 93) });
if (existsSync(join(dbDir, 'nation_comp.dat'))) { // landsholdsturneringer (VM-kval., U21 …) har egne id'er (390–408)
  const NCo = read(join(dbDir, 'nation_comp.dat'));
  for (let o = 0; o + 107 <= NCo.byteLength; o += 107) comps.set(i32(NCo, o), { name: str(NCo, o + 4, 51), nation: -1 });
}
const nations = new Map<number, string>();
for (let o = 0; o + 290 <= NA.byteLength; o += 290) nations.set(i32(NA, o), str(NA, o + 4, 51));
const clubById = new Map(clubs.map((c) => [c.id, c]));

// ---------- fixtures (ankre) ----------
type Fixture = { comp: number; home: number; away: number; year: number; day: number; hg: number; ag: number; hth: number; hta: number; file: string };
const fixtures: Fixture[] = [];
const fxFiles = readdirSync(DIR).filter((f) => /^fixtures_\d{4}\.tmp$/.test(f)).sort();
for (const f of fxFiles) {
  const F = read(join(DIR, f)); const n = i32(F, 0);
  for (let k = 0; k < n && 4 + (k + 1) * 79 <= F.byteLength; k++) {
    const o = 4 + k * 79;
    const hg = u8(F, o + 67), ag = u8(F, o + 68);
    fixtures.push({ comp: i32(F, o), home: i32(F, o + 12), away: i32(F, o + 16), year: u16(F, o + 40), day: u16(F, o + 42),
      hg: hg === 0xff ? -1 : hg, ag: ag === 0xff ? -1 : ag, hth: u8(F, o + 69), hta: u8(F, o + 70), file: f });
  }
}

// ---------- klubafbildning rt-id → database-id ----------
const PH = read(join(DIR, 'player stats history.tmp'));
type H = { y: number; club: number; apps: number; goals: number };
const rtHist: H[] = [];
{
  let prev = '';
  for (let o = 0; o + 47 <= PH.byteLength; o += 47) {
    const key = Buffer.from(PH.buffer, PH.byteOffset + o, 42).toString('hex');
    if (key === prev) continue;
    prev = key;
    rtHist.push({ y: u16(PH, o), club: i32(PH, o + 2), apps: u16(PH, o + 6), goals: u16(PH, o + 8) });
  }
}
const dbHist: H[] = [];
for (let o = 0; o + 17 <= SH.byteLength; o += 17) dbHist.push({ y: u16(SH, o + 8), club: i32(SH, o + 10), apps: u8(SH, o + 15), goals: u8(SH, o + 16) });
const tri = (a: H[], i: number) => `${a[i].y},${a[i].apps},${a[i].goals}|${a[i + 1].y},${a[i + 1].apps},${a[i + 1].goals}|${a[i + 2].y},${a[i + 2].apps},${a[i + 2].goals}`;
const triIdx = new Map<string, number>();
for (let i = 0; i + 2 < dbHist.length; i++) { const k = tri(dbHist, i); triIdx.set(k, triIdx.has(k) ? -1 : i); }
const votes = new Map<number, Map<number, number>>();
for (let i = 0; i + 2 < rtHist.length; i++) {
  const j = triIdx.get(tri(rtHist, i));
  if (j === undefined || j < 0) continue;
  for (let d = 0; d < 3; d++) {
    const r = rtHist[i + d].club, c = dbHist[j + d].club;
    if (r < 0 || c < 0) continue;
    const m = votes.get(r) ?? new Map(); m.set(c, (m.get(c) ?? 0) + 1); votes.set(r, m);
  }
}
let pairs: [number, number][] = [];
for (const [r, m] of votes) {
  const tot = [...m.values()].reduce((a, b) => a + b, 0);
  const [c, n] = [...m.entries()].sort((a, b) => b[1] - a[1])[0];
  if (n >= 2 && n >= 0.6 * tot) pairs.push([r, c]);
}
// ankre: de engelske ligaer i kampprogrammet (rt-id'er og database-id'er har samme rækkefølge)
const anchorMap = new Map<number, number>();
{
  const byComp = new Map<number, Set<number>>();
  for (const f of fixtures) { const s = byComp.get(f.comp) ?? new Set(); s.add(f.home); s.add(f.away); byComp.set(f.comp, s); }
  for (const [comp, rs] of byComp) {
    const dbs = clubs.filter((c) => c.div === comp).map((c) => c.id).sort((a, b) => a - b);
    const rt = [...rs].sort((a, b) => a - b);
    if (dbs.length === rt.length) rt.forEach((r, i) => anchorMap.set(r, dbs[i]));
  }
}
{
  const m = new Map(pairs); for (const [r, c] of anchorMap) m.set(r, c);
  pairs = [...m.entries()].sort((a, b) => a[0] - b[0]);
}
// længste voksende delfølge (monoton afbildning)
function lis(p: [number, number][]) {
  const tails: number[] = [], tIdx: number[] = [], prev = new Array(p.length).fill(-1);
  p.forEach(([, d], i) => {
    let lo = 0, hi = tails.length;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (tails[mid] < d) lo = mid + 1; else hi = mid; }
    tails[lo] = d; tIdx[lo] = i; prev[i] = lo > 0 ? tIdx[lo - 1] : -1;
  });
  const out: [number, number][] = []; let i = tIdx[tails.length - 1];
  while (i >= 0) { out.push(p[i]); i = prev[i]; }
  return out.reverse();
}
const NCLUB_RT = (() => { // antal klubber i kørslen = første landshold-id
  const last = clubs.length - 1; // sidste klub i club.dat har altid historik? fald tilbage på skøn
  const hit = pairs.find(([, d]) => d === clubs[last].id);
  return hit ? hit[0] + 1 : undefined;
})();
const clubMap = new Map<number, number>(); // rt → db-klub-id
const seq = lis(pairs);
for (const [r, d] of seq) clubMap.set(r, d);
const fillGaps = () => {
  const s = [...clubMap.entries()].sort((a, b) => a[0] - b[0]);
  for (let k = 0; k + 1 < s.length; k++) {
    const [r1, d1] = s[k], [r2, d2] = s[k + 1];
    if (r2 - r1 > 1 && r2 - r1 === d2 - d1) for (let x = 1; x < r2 - r1; x++) clubMap.set(r1 + x, d1 + x);
  }
};
fillGaps();
const natBase = NCLUB_RT ?? 5183;

// ---------- kampe ----------
const MS = read(join(DIR, 'match_stats_matches.tmp'));
const TAB = 17_250_000, REC = 3450, SEC = 1573, T0 = 0x11c;
type Side = { goals: number; shots: number; onTarget: number; corners: number; freeKicks: number; f0f: number; fouls: number; offsides: number;
  yellow: number; red: number; poss: number; passes: number; passesOk: number; tackles: number; tacklesWon: number; headers: number; headersWon: number; f20: number;
  injuries: number; subs: number; scorers: { player: number; born: number; goals: number }[] };
type Match = { table: number; date: string; day: number; year: number; home: number; away: number; minutes: number; att: number; detailed: boolean; h: Side; a: Side };
const matches: Match[] = [];
for (let t = 0; t < 4; t++) {
  for (let k = 0; k < 5000; k++) {
    const o = t * TAB + k * REC;
    if (o + REC > MS.byteLength) break;
    const year = u16(MS, o + 10);
    if (!year) break;
    const day = u16(MS, o + 8);
    const side = (s: number): Side => {
      const b = o + T0 + s * SEC;
      const sc: Side['scorers'] = []; let injuries = 0, subs = 0;
      for (let p = 0; p < 20; p++) {
        const q = o + 0x190 + s * SEC + p * 73;
        const g = u8(MS, q + 33);
        if (g && g < 20) sc.push({ player: i32(MS, q), born: u16(MS, q + 22), goals: g });
        const inj = u8(MS, q + 51); if (inj !== 0xff && inj > 0 && inj <= 130) injuries++;
        const on = u8(MS, q + 50); if (on !== 0xff && on > 0 && on <= 130) subs++;
      }
      return { goals: u8(MS, b + 3), shots: u8(MS, b + 0x0b), onTarget: u8(MS, b + 0x0c), corners: u8(MS, b + 0x0d), freeKicks: u8(MS, b + 0x0e),
        f0f: u8(MS, b + 0x0f), fouls: u8(MS, b + 0x10), offsides: u8(MS, b + 0x11), yellow: u8(MS, b + 0x12), red: u8(MS, b + 0x13),
        passes: u16(MS, b + 0x14), passesOk: u16(MS, b + 0x16), tackles: u16(MS, b + 0x18), tacklesWon: u16(MS, b + 0x1a),
        headers: u16(MS, b + 0x1c), headersWon: u16(MS, b + 0x1e), f20: u16(MS, b + 0x20), poss: u8(MS, b + 0x22), injuries, subs, scorers: sc };
    };
    const h = side(0), a = side(1);
    const dt = new Date(Date.UTC(year, 0, 1 + day));
    matches.push({ table: t, day, year, date: dt.toISOString().slice(0, 10), home: i32(MS, o), away: i32(MS, o + 4),
      minutes: u8(MS, o + 0x4d), att: i32(MS, o + 0x34), detailed: u8(MS, o + 0x4d) > 0 && h.passes + a.passes > 0, h, a });
  }
}

// divisionsgæt for klubber uden afbildning: kandidat i det monotone vindue med samme division som modstanderne
{
  const dbIdx = new Map(clubs.map((c, i) => [c.id, i]));
  for (let pass = 0; pass < 3; pass++) {
    const oppDiv = new Map<number, Map<number, number>>();
    for (const m of matches) for (const [x, y] of [[m.home, m.away], [m.away, m.home]]) {
      if (x >= natBase || clubMap.has(x) || !clubMap.has(y)) continue;
      const d = clubById.get(clubMap.get(y)!)!.div; if (d < 0) continue;
      const mm = oppDiv.get(x) ?? new Map(); mm.set(d, (mm.get(d) ?? 0) + 1); oppDiv.set(x, mm);
    }
    const s = [...clubMap.entries()].sort((a, b) => a[0] - b[0]);
    let added = 0;
    for (const [r, mm] of oppDiv) {
      const [div, n] = [...mm.entries()].sort((a, b) => b[1] - a[1])[0];
      if (n < 2) continue;
      let lo = -1, hi = s.length; // naboankre
      for (let k = 0; k < s.length; k++) { if (s[k][0] < r) lo = k; else { hi = k; break; } }
      const [r1, d1] = lo >= 0 ? s[lo] : [-1, -1]; const [r2, d2] = hi < s.length ? s[hi] : [natBase, clubs.length];
      const i1 = d1 < 0 ? -1 : dbIdx.get(d1)!, i2 = d2 >= clubs.length ? clubs.length : dbIdx.get(d2)!;
      const cand = clubs.slice(i1 + 1 + (r - r1 - 1), i2 - (r2 - r)).filter((c) => c.div === div);
      if (cand.length === 1) { clubMap.set(r, cand[0].id); added++; }
    }
    fillGaps();
    if (!added) break;
  }
}
const clubOf = (r: number): Club | undefined => r >= natBase ? natClubs[r - natBase] : clubById.get(clubMap.get(r)!);


// ---------- saml kampene: kampprogram (turnering + resultat) ⨝ match_stats (statistik) ----------
// fixtures_<år>.tmp har turnering og resultat for alle afviklede kampe det år (filen for det løbende år
// ligger først på disk, når året er omme – indtil da er resultatet ff). match_stats har statistik og
// resultat, men ingen turnering. Vi parrer på (hjemme, ude) og nærmeste dato (±45 dage, så udsatte kampe
// også findes); kampe uden fixture-post (fx venskabskampe aftalt senere) får turnering "?".
type Game = { comp: number; home: number; away: number; year: number; day: number; hg: number; ag: number; stats?: Match };
const fxByPair = new Map<string, Fixture[]>();
for (const f of fixtures) { const k = `${f.home}:${f.away}`; const l = fxByPair.get(k) ?? []; l.push(f); fxByPair.set(k, l); }
const dayNo = (y: number, d: number) => Date.UTC(y, 0, 1 + d) / 864e5;
const used = new Set<Fixture>();
const games: Game[] = [];
let mismatch = 0, joined = 0;
for (const m of matches) {
  const cands = (fxByPair.get(`${m.home}:${m.away}`) ?? []).filter((f) => !used.has(f) && f.year > 1990);
  const md = dayNo(m.year, m.day);
  const best = cands.map((f) => ({ f, dd: Math.abs(dayNo(f.year, f.day) - md) })).filter((x) => x.dd <= 45).sort((a, b) => a.dd - b.dd)[0]?.f;
  if (best) {
    used.add(best); joined++;
    if (best.hg >= 0 && (best.hg !== m.h.goals || best.ag !== m.a.goals)) mismatch++;
  }
  games.push({ comp: best?.comp ?? -1, home: m.home, away: m.away, year: m.year, day: m.day, hg: m.h.goals, ag: m.a.goals, stats: m });
}
for (const f of fixtures) if (!used.has(f) && f.hg >= 0) games.push({ comp: f.comp, home: f.home, away: f.away, year: f.year, day: f.day, hg: f.hg, ag: f.ag });

// ---------- statistik ----------
const SUMS = ['shots', 'onTarget', 'corners', 'freeKicks', 'f0f', 'fouls', 'offsides', 'yellow', 'red', 'injuries', 'subs', 'passes', 'passesOk', 'tackles', 'tacklesWon', 'headers', 'headersWon', 'f20'] as const;
type Agg = { n: number; nd: number; goals: number; hw: number; dr: number; aw: number; scores: Map<string, number>; att: number; mins: number; s: Record<string, number> };
const newAgg = (): Agg => ({ n: 0, nd: 0, goals: 0, hw: 0, dr: 0, aw: 0, scores: new Map(), att: 0, mins: 0, s: Object.fromEntries(SUMS.map((k) => [k, 0])) });
const add = (g: Agg, x: Game) => {
  g.n++; g.goals += x.hg + x.ag;
  if (x.hg > x.ag) g.hw++; else if (x.hg < x.ag) g.aw++; else g.dr++;
  const k = `${Math.max(x.hg, x.ag)}-${Math.min(x.hg, x.ag)}`;
  g.scores.set(k, (g.scores.get(k) ?? 0) + 1);
  const m = x.stats;
  if (m?.detailed) {
    g.nd++; g.att += m.att; g.mins += m.minutes;
    for (const f of SUMS) g.s[f] += m.h[f] + m.a[f];
  }
};
const pct = (a: number, b: number) => b ? `${(100 * a / b).toFixed(1)}%` : '-';
const per = (a: number, b: number, d = 2) => b ? (a / b).toFixed(d) : '-';
const show = (title: string, g: Agg, extra = '') => {
  console.log(`\n== ${title}${extra}`);
  if (!g.n) { console.log('   ingen kampe endnu'); return; }
  console.log(`   kampe ${g.n} (med statistik ${g.nd}) · mål/kamp ${per(g.goals, g.n)} · hjemme/uafgjort/ude ${pct(g.hw, g.n)} / ${pct(g.dr, g.n)} / ${pct(g.aw, g.n)} · 0-0 ${pct(g.scores.get('0-0') ?? 0, g.n)}`);
  const top = [...g.scores.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14).map(([k, v]) => `${k} ${pct(v, g.n)}`).join(', ');
  console.log(`   slutresultater (vinderens mål først): ${top}`);
  if (!g.nd) return;
  const q = g.s, n = g.nd;
  console.log(`   pr. kamp (begge hold): skud ${per(q.shots, n, 1)} · på mål ${per(q.onTarget, n, 1)} · hjørnespark ${per(q.corners, n, 1)} · frispark ${per(q.freeKicks, n, 1)} · frispark begået ${per(q.fouls, n, 1)} · offside ${per(q.offsides, n, 1)} · H+0F ${per(q.f0f, n, 1)} (indkast?)`);
  console.log(`                          gule ${per(q.yellow, n)} · røde ${per(q.red, n, 3)} · skader i kampen ${per(q.injuries, n, 3)} · udskiftninger ${per(q.subs, n, 1)} · spilletid ${per(g.mins, n, 1)} min · tilskuere ${Math.round(g.att / n)}`);
  console.log(`                          afleveringer ${per(q.passes, n, 0)} (${pct(q.passesOk, q.passes)} lykkedes) · tacklinger ${per(q.tackles, n, 1)} (${pct(q.tacklesWon, q.tackles)} vundet) · hovedstødsdueller ${per(q.headers / 2, n, 1)} (vundet = 50 % pr. definition) · H+20 ${per(q.f20, n, 1)}`);
};

const compName = (c: number) => c < 0 ? '? (ingen fixture-post)' : comps.get(c)?.name ?? `turnering ${c}`;
const isLeague = (c: number) => c >= 0 && divSize(c) >= 8;
function divSize(c: number) { let n = 0; for (const x of clubs) if (x.div === c) n++; return n; }
const divSizes = new Map<number, number>();
const dsz = (c: number) => { if (!divSizes.has(c)) divSizes.set(c, divSize(c)); return divSizes.get(c)!; };

const all = newAgg(), allLeague = newAgg();
const byComp = new Map<number, { agg: Agg; table: Map<number, { p: number; w: number; d: number; l: number; gf: number; ga: number; pts: number }>; scorers: Map<number, { club: number; born: number; goals: number }> }>();
for (const x of games) {
  add(all, x);
  const C = byComp.get(x.comp) ?? { agg: newAgg(), table: new Map(), scorers: new Map() };
  add(C.agg, x); byComp.set(x.comp, C);
  if (dsz(x.comp) < 8) continue; // ikke en liga
  add(allLeague, x);
  for (const [c, gf, ga] of [[x.home, x.hg, x.ag], [x.away, x.ag, x.hg]]) {
    const r = C.table.get(c) ?? { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 };
    r.p++; r.gf += gf; r.ga += ga;
    if (gf > ga) { r.w++; r.pts += 3; } else if (gf === ga) { r.d++; r.pts++; } else r.l++;
    C.table.set(c, r);
  }
  if (x.stats) for (const [s, c] of [[x.stats.h, x.home], [x.stats.a, x.away]] as const) for (const p of s.scorers) {
    if (p.player < 0) continue;
    const e = C.scorers.get(p.player) ?? { club: c, born: p.born, goals: 0 }; e.goals += p.goals; e.club = c; C.scorers.set(p.player, e);
  }
}
void isLeague;

const unmapped = new Set<number>();
for (const x of games) for (const r of [x.home, x.away]) if (!clubOf(r)) unmapped.add(r);
const lastDay = games.reduce((a, x) => Math.max(a, dayNo(x.year, x.day)), 0);
console.log(`CM 01/02-original: ${DIR}`);
console.log(`database ${dbDir} · ${clubMap.size} af ${clubs.length} klubber afbildet til kørsels-id (landshold fra ${natBase})`);
console.log(`match_stats: ${matches.length} kampe (tabel 0-3: ${[0, 1, 2, 3].map((t) => matches.filter((m) => m.table === t).length).join('/')}) · kampprogram: ${fxFiles.join(', ')} (${fixtures.length} poster, ${fixtures.filter((f) => f.hg >= 0).length} spillet)`);
console.log(`parret ${joined} (resultat afviger i ${mismatch}) · kampe i alt ${games.length} · seneste ${lastDay ? new Date(lastDay * 864e5).toISOString().slice(0, 10) : '-'} · klubber uden navn ${unmapped.size}`);
const ligaer = [...new Set(games.filter((x) => dsz(x.comp) >= 8).map((x) => x.comp))].map((c) => compName(c));
console.log(`ligaer med kampe: ${ligaer.join(', ') || '-'}`);
console.log('NB: originalen spiller kun ligaerne i de lande, der blev valgt ved spilstart – andre ligaer findes ikke i filerne.');

show('ALLE KAMPE (liga, pokal, Europa, venskab, reserver, landskampe)', all);
show('ALLE LIGAKAMPE', allLeague);

const FOCUS = ['English Premier Division', 'Spanish First Division', 'Italian Serie A', 'German First Division', 'French First Division', 'Danish Premier Division'];
const order = [...byComp.entries()].sort((a, b) => {
  const fa = FOCUS.indexOf(compName(a[0])), fb = FOCUS.indexOf(compName(b[0]));
  const la = dsz(a[0]) >= 8 ? 0 : 1, lb = dsz(b[0]) >= 8 ? 0 : 1;
  return (fa < 0 ? 99 : fa) - (fb < 0 ? 99 : fb) || la - lb || b[1].agg.n - a[1].agg.n;
});
const name = (r: number) => clubOf(r)?.name ?? `rt${r}`;
for (const [c, C] of order) {
  const league = dsz(c) >= 8;
  show(`${compName(c)}${league ? ` (liga, ${dsz(c)} klubber)` : ''}`, C.agg);
  if (!league) continue;
  const tab = [...C.table.entries()].sort((a, b) => b[1].pts - a[1].pts || (b[1].gf - b[1].ga) - (a[1].gf - a[1].ga) || b[1].gf - a[1].gf);
  const fmt = (e?: [number, { p: number; pts: number; gf: number; ga: number }]) => e ? `${name(e[0])} ${e[1].pts} p (${e[1].p} k, ${e[1].gf}-${e[1].ga})` : '-';
  const games2 = tab.reduce((a, e) => a + e[1].p, 0) / Math.max(1, tab.length);
  console.log(`   stilling efter ${games2.toFixed(1)} kampe i snit: nr. 1 ${fmt(tab[0])} · nr. 2 ${fmt(tab[1])} · sidst ${fmt(tab[tab.length - 1])}`);
  const sc = [...C.scorers.entries()].sort((a, b) => b[1].goals - a[1].goals).slice(0, 5);
  console.log(`   topscorere (mål – spiller-id, klub, født): ${sc.map(([p, e]) => `${e.goals} – ${p}, ${name(e.club)}, ${e.born}`).join(' · ') || '-'}`);
}

if (jsonOut) {
  writeFileSync(jsonOut, JSON.stringify(games.map((x) => ({ comp: compName(x.comp), date: new Date(dayNo(x.year, x.day) * 864e5).toISOString().slice(0, 10),
    home: name(x.home), away: name(x.away), hg: x.hg, ag: x.ag, stats: x.stats ? { h: x.stats.h, a: x.stats.a, minutes: x.stats.minutes, att: x.stats.att } : undefined }))));
  console.log(`\nkampene skrevet til ${jsonOut}`);
}
