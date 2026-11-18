// Byg en spilbar database (JSON) fra en CM 01/02 Data-mappe.
//
// CM 01/02-databaser har et fast 2001-ur. "October 2026"-opdateringen er moderne trupper med
// fødselsdatoer skubbet ~25 år tilbage, så de passer til 2001-uret. Vi angiver den ønskede sæson,
// og alle datoer skubbes (sæson − 2001) år, så aldrene passer. Den originale 3.9.65-database spilles
// som 2001/02 (ingen forskydning).
//
// Brug: npx tsx scripts/build-cm-data.mts "<Data-mappe>" [out.json] [sæson]
import { readFileSync, readdirSync, writeFileSync, existsSync, copyFileSync, statSync } from 'node:fs';
import { join, resolve, basename, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { parseCM0102 } from '../src/game/data/cm0102';
import { CLUB_NAME_FIXES } from '../src/game/data/clubNames';

// Standard: Data-mappen fra den udpakkede "October 2026 Data Update.zip" (pak zip'en ud i .data-update/)
const dir = process.argv[2] ?? '.data-update/October 2026 Data Update';
const out = process.argv[3] ?? 'public/data/world.json';
const SEASON = Number(process.argv[4] ?? 2026);
const SHIFT = SEASON - 2001; // CM-databasen har 2001-ur; skub datoer så sæsonen passer
if (!existsSync(dir)) {
  console.error(`Data-mappe ikke fundet: ${dir} (angiv stien som argument)`);
  process.exit(1);
}

const files: Record<string, ArrayBuffer> = {};
for (const f of readdirSync(dir)) {
  if (!f.toLowerCase().endsWith('.dat')) continue;
  const b = readFileSync(join(dir, f));
  files[f.toLowerCase()] = b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
}

// Den originale database: alle klubber læses, så talenterne uden for de spilbare ligaer kan komme med (se nedenfor)
const ORIGINAL = SEASON === 2001;

// 2026/27: datasættets rækker rettet til virkeligheden (scripts/data/divisions-2026.json) – klubbens division (club.dat +87) sættes, før
// parseren læser filen, så ligaerne, reglerne og holdantallet følger af sig selv
type DivFix = { size: number; add?: string[]; remove?: string[]; rest?: string | null; rules?: Record<string, number> };
const DIV_FIXES: Record<string, DivFix> = SEASON >= 2026
  ? (JSON.parse(readFileSync(new URL('./data/divisions-2026.json', import.meta.url), 'utf8')) as { leagues: Record<string, DivFix> }).leagues : {};
if (Object.keys(DIV_FIXES).length) {
  const dec = new TextDecoder('windows-1252');
  const str = (buf: ArrayBuffer, o: number, n: number) => { const b = new Uint8Array(buf, o, n); const e = b.indexOf(0); return dec.decode(b.subarray(0, e < 0 ? n : e)).trim(); };
  const CC = new DataView(files['club_comp.dat']), CL = new DataView(files['club.dat']);
  const compByName = new Map<string, { id: number; nation: number }>();
  for (let o = 0; o + 107 <= CC.byteLength; o += 107) compByName.set(str(files['club_comp.dat'], o + 4, 51), { id: CC.getInt32(o, true), nation: CC.getInt32(o + 93, true) });
  const clubs: { o: number; name: string; nation: number }[] = [];
  for (let o = 0; o + 581 <= CL.byteLength; o += 581) clubs.push({ o, name: str(files['club.dat'], o + 4, 51), nation: CL.getInt32(o + 83, true) });
  const comp = (name: string) => { const c = compByName.get(name); if (!c) throw new Error(`divisions-2026.json: turneringen "${name}" findes ikke`); return c; };
  const club = (name: string, nation: number) => {
    const hit = clubs.filter((c) => c.name === name && c.nation === nation);
    if (hit.length !== 1) throw new Error(`divisions-2026.json: klubben "${name}" findes ${hit.length} gange i landet`);
    return hit[0];
  };
  for (const [league, fix] of Object.entries(DIV_FIXES)) {
    const L = comp(league);
    const rest = fix.rest ? comp(fix.rest).id : -1;
    for (const n of fix.remove ?? []) { const c = club(n, L.nation); if (CL.getInt32(c.o + 87, true) !== L.id) throw new Error(`divisions-2026.json: "${n}" står ikke i ${league}`); CL.setInt32(c.o + 87, rest, true); }
    for (const n of fix.add ?? []) CL.setInt32(club(n, L.nation).o + 87, L.id, true);
  }
  for (const [league, fix] of Object.entries(DIV_FIXES)) {
    const id = comp(league).id, n = clubs.filter((c) => CL.getInt32(c.o + 87, true) === id).length;
    if (n !== fix.size) throw new Error(`divisions-2026.json: ${league} har ${n} klubber, ikke ${fix.size}`);
  }
  console.error(`rækkerne 2026/27: ${Object.keys(DIV_FIXES).length} ligaer rettet (scripts/data/divisions-2026.json)`);
}

// moderne: tre rækker læses, så Danmarks 2. division kan komme med (TIERS nedenfor bestemmer, hvad der beholdes)
// 2026/27 (MODERN_PARITY 13): stabens hukommelse 0x524d70 (staffMem – Staff Search); world.json er uændret (kun world-cm*.json får den)
const w = parseCM0102(files, ORIGINAL ? { maxTiers: 4, allClubs: true, cmMem: true } : { maxTiers: 3, staffMem: true });

// skub en ISO-dato (yyyy-mm-dd) frem med SHIFT år
const shift = (iso: string) => {
  if (!iso) return iso;
  const y = Number(iso.slice(0, 4));
  if (!y) return iso;
  return `${y + SHIFT}${iso.slice(4)}`;
};

const F = Object.fromEntries(w.playerFields.map((f, i) => [f, i]));
const start = `${SEASON}-07-01`;
const ageAt = (dob: string) => {
  const [y, m, d] = dob.split('-').map(Number);
  const [sy, sm, sd] = start.split('-').map(Number);
  let a = sy - y; if (sm < m || (sm === m && sd < d)) a--; return a;
};

// ---- Trim til et spilbart omfang (CM-dataen har 51 nationer × 2 tiers = 1652 klubber, for tungt
// til mobil/PWA). Vi beholder begge divisioner for de store og tier-1 for en bred vifte af resten,
// så antallet lander på niveau med den moderne database (~660 klubber / ~24k spillere). ----
const TWO_TIER = new Set(['England', 'Spain', 'Italy', 'Germany', 'France', 'Denmark']);
const ONE_TIER = new Set(['Holland', 'Portugal', 'Belgium', 'Scotland', 'Turkey', 'Austria',
  'Switzerland', 'Greece', 'Norway', 'Sweden', 'Poland', 'Czech Republic', 'Croatia', 'Romania',
  'Serbia', 'Ukraine', 'Russia', 'Brazil', 'Argentina', 'Mexico', 'United States', 'Japan',
  'Saudi Arabia', 'Colombia', 'South Korea', 'Australia']);
// Originalen: legender, der blev fjernet i 3.9.68-opdateringen (fx Tó Madeira), hentes fra 3.9.65-databasen, hvis den
// ligger lokalt (.orig-db/Original-3.9.65-…, fra data-sources-release'n). De får id 8.000.000 + deres 3.9.65-id og
// kommer på deres klub fra dengang, hvis den findes i 3.9.68 (ellers fri agent). Listen: scripts/legacy-players.json.
const LEGACY_DIR = '.orig-db/Original-3.9.65-Database-Swedish_fixed';
// 3.9.60 (originalens egen 2001/02-database) har legenderne i forvejen – kun 3.9.68 mangler dem
// NO_LEGACY=1: databasen præcis som originalen (valget af 01/02-database ved nyt spil) – legenderne kun til SEO-siderne
if (ORIGINAL && !/3\.9\.6[05]/.test(dir) && !process.env.NO_LEGACY && existsSync(LEGACY_DIR)) {
  const want = JSON.parse(readFileSync(new URL('./legacy-players.json', import.meta.url), 'utf8')) as { first?: string; last: string; dob: string }[];
  const lf: Record<string, ArrayBuffer> = {};
  for (const f of readdirSync(LEGACY_DIR)) {
    if (!f.toLowerCase().endsWith('.dat')) continue;
    const b = readFileSync(join(LEGACY_DIR, f));
    lf[f.toLowerCase()] = b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
  }
  const old = parseCM0102(lf, { maxTiers: 4, allClubs: true });
  const OF = Object.fromEntries(old.playerFields.map((f, i) => [f, i]));
  const oldClub = new Map(old.clubs.map((c) => [c[0] as number, c[1] as string]));
  const byName = new Map(w.clubs.map((c) => [c[1] as string, c[0] as number]));
  for (const l of want) {
    if (w.players.some((p) => p[F.last] === l.last && p[F.dob] === l.dob)) continue;
    const row = old.players.find((p) => p[OF.last] === l.last && p[OF.dob] === l.dob && (!l.first || p[OF.first] === l.first));
    if (!row) { console.error(`legende ikke fundet i 3.9.65: ${l.last}`); continue; }
    const id = 8_000_000 + (row[OF.id] as number);
    const copy = w.playerFields.map((f) => (OF[f] !== undefined ? row[OF[f]] : f === 'wage' ? 0 : 0));
    copy[F.id] = id;
    // klubben fra dengang; et B-hold, der ikke findes i 3.9.68, erstattes af førsteholdet (Sporting B → Sporting)
    const oc = oldClub.get(row[OF.club] as number) ?? '';
    copy[F.club] = byName.get(oc) ?? byName.get(oc.replace(/ B$/, '')) ?? 0;
    w.players.push(copy);
    w.ratings[id] = old.ratings[row[OF.id] as number];
    console.error(`legende fra 3.9.65: ${l.last} → ${oc} (${copy[F.club] ? `i 3.9.68: ${w.clubs.find((c) => c[0] === copy[F.club])?.[1]}` : 'fri agent'})`);
  }
}

// Originalen: flere rækker i de lande, hvor de lavere rækker rummer kendte køb (Zamora, Earnshaw, Mexicos 2. række …)
const EXTRA_TIERS: Record<string, number> = ORIGINAL ? { England: 4, Scotland: 4, Holland: 2, Portugal: 2, Argentina: 2, Mexico: 2, Norway: 2 }
  // 2026/27: Danmarks 2. division (12 klubber med trupper i datasættet) – rækkerne rettet i divisions-2026.json
  : { Denmark: 3 };
const nationName = (idx: number) => w.nations[idx]?.name ?? '';
const keptLeagues = new Set<string>();
for (const l of w.leagues) {
  const nm = nationName(l.nation);
  if (l.tier <= (EXTRA_TIERS[nm] ?? (TWO_TIER.has(nm) ? 2 : ONE_TIER.has(nm) ? 1 : 0))) keptLeagues.add(l.id);
}
// Originalen: klubber uden for de spilbare ligaer kommer med, hvis de har en spiller, man går efter i CM 01/02
// (stort/tilfældigt potentiale, god nok allerede, eller på listen over kultspillere i cult-players.json). De ligger i
// en skjult liga pr. land/division (`hidden`), der ikke spilles – som de ikke-spilbare lande i originalen.
const hiddenLeagues: typeof w.leagues = [];
const hiddenKeep = new Set<number>();
if (ORIGINAL) {
  const cult = JSON.parse(readFileSync(new URL('./cult-players.json', import.meta.url), 'utf8')) as { first: string; last: string; club: string }[];
  const norm = (x: string) => x.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]/g, '');
  const clubNm = new Map(w.clubs.map((c) => [c[0] as number, c[1] as string]));
  const cultKey = new Set(cult.map((c) => `${norm(c.first)}|${norm(c.last)}`));
  // hele navnet samlet: kælenavne står i databasen som efternavn uden fornavn ("João Paiva", "Tó Madeira")
  const cultFull = new Set(cult.map((c) => norm(c.first + c.last)));
  const cultLast = new Map<string, string>(cult.map((c) => [norm(c.last), norm(c.club)]));
  const notable = (p: (string | number)[]) => {
    const r = w.ratings[p[F.id] as number];
    if (!r) return false;
    const age = ageAt(p[F.dob] as string);
    if (r.paRaw === -2 || r.pa >= 150 || r.ca >= 120 || (r.paRaw === -1 && age <= 21)) return true;
    const first = norm(p[F.first] as string), last = norm(p[F.last] as string);
    if (cultKey.has(`${first}|${last}`) || cultFull.has(first + last)) return true;
    // kun efternavn (kælenavne i databasen): kræv at klubben også passer
    const club = cultLast.get(last);
    return !!club && norm(clubNm.get(p[F.club] as number) ?? '').includes(club.slice(0, 6));
  };
  const keep = new Set<number>();
  const clubLeague = new Map(w.clubs.map((c) => [c[0] as number, c[4] as string]));
  for (const p of w.players) {
    const club = p[F.club] as number;
    if (club && !keptLeagues.has(clubLeague.get(club) ?? '') && notable(p)) keep.add(club);
  }
  const realLeague = new Map(w.leagues.map((l) => [l.id, l]));
  const hid = new Map<string, (typeof w.leagues)[number]>();
  for (const c of w.clubs) {
    if (!keep.has(c[0] as number)) continue;
    // rigtig liga (kun ét land) beholder navnet; samlepuljer og klubber uden division samles pr. land
    const real = realLeague.get(c[4] as string);
    const id = real ? `H${real.id}` : `HN${c[3]}`;
    if (!hid.has(id)) hid.set(id, { id, name: real?.name ?? nationName(c[3] as number), nation: c[3] as number, tier: 9, hidden: true });
    c[4] = id;
    keptLeagues.add(id);
  }
  hiddenLeagues.push(...hid.values());
  // de skjulte klubber spiller ikke kampe: talenterne + de bedste op til HIDDEN_SQUAD spillere (sparer plads og tid)
  const HIDDEN_SQUAD = 16;
  const byClub = new Map<number, (string | number)[][]>();
  for (const p of w.players) { const c = p[F.club] as number; if (keep.has(c)) (byClub.get(c) ?? byClub.set(c, []).get(c)!).push(p); }
  for (const list of byClub.values()) {
    const ca = (p: (string | number)[]) => w.ratings[p[F.id] as number]?.ca ?? 0;
    const top = list.filter(notable);
    const rest = list.filter((p) => !notable(p) && ageAt(p[F.dob] as string) <= 34).sort((x, y) => ca(y) - ca(x));
    for (const p of [...top, ...rest.slice(0, Math.max(0, HIDDEN_SQUAD - top.length))]) hiddenKeep.add(p[F.id] as number);
  }
  console.error(`skjulte klubber: ${keep.size} i ${hid.size} skjulte ligaer`);
}
w.leagues = [...w.leagues.filter((l) => keptLeagues.has(l.id)), ...hiddenLeagues];
const keptClubs = new Set<number>();
w.clubs = w.clubs.filter((c) => keptLeagues.has(c[4] as string));
const hiddenIds = new Set(hiddenLeagues.map((l) => l.id));
const clubLg = new Map(w.clubs.map((c) => [c[0] as number, c[4] as string]));
const hiddenLeagueOf = (club: number) => hiddenIds.has(clubLg.get(club) ?? '');
for (const c of w.clubs) keptClubs.add(c[0] as number);
// klubber uden kapacitet i databasen (flere små klubber i de nye rækker/skjulte klubber): ligaens median × 0,6
{
  const byLg = new Map<string, number[]>();
  for (const c of w.clubs) if ((c[6] as number) > 0) (byLg.get(c[4] as string) ?? byLg.set(c[4] as string, []).get(c[4] as string)!).push(c[6] as number);
  for (const c of w.clubs) {
    if ((c[6] as number) > 0) continue;
    const xs = (byLg.get(c[4] as string) ?? []).sort((a, b) => a - b);
    c[6] = Math.max(2000, Math.round(((xs[Math.floor(xs.length / 2)] ?? 8000) * 0.6) / 100) * 100);
  }
}
// ret forkert stavede klubnavne (fx "Bröndby IF", "FC Copenhagen")
for (const c of w.clubs) {
  const fix = CLUB_NAME_FIXES[c[1] as string];
  if (fix) { c[1] = fix[0]; if (fix[1]) c[2] = fix[1]; }
}

// Spillere: beholdes hvis klubben er med; frie agenter (klub 0) beholdes som signérbare stjerner.
// Desuden frasorteres ex-spiller-trænere (staff-poster med en spiller-post, alle 40+ med værdi 0).
const before = w.players.length;
w.players = w.players.filter((p) => {
  const club = p[F.club] as number;
  if (club && !keptClubs.has(club)) return false;
  if (club && ORIGINAL && hiddenLeagueOf(club) && !hiddenKeep.has(p[F.id] as number)) return false;
  return ageAt(shift(p[F.dob] as string)) <= 40;
});
const dropped = before - w.players.length;

// Reglerne: fjern droppede ligaer og hæng ikke op/nedrykning op på en liga der ikke er med
for (const id of Object.keys(w.rules)) if (!keptLeagues.has(id)) delete w.rules[id];
for (const r of Object.values(w.rules)) {
  if (r.below && !keptLeagues.has(r.below)) { delete r.below; delete r.relegated; }
  if (r.above && !keptLeagues.has(r.above)) { delete r.above; delete r.promoted; }
}
// 2026/27: rundeantal og op-/nedrykning fra divisions-2026.json (fx dansk 1./2. division: 12 klubber, 3 runder, 2 op/2 ned)
for (const [league, fix] of Object.entries(DIV_FIXES)) {
  if (!fix.rules) continue;
  const l = w.leagues.find((x) => x.name === league && !x.hidden);
  if (l && w.rules[l.id]) Object.assign(w.rules[l.id], fix.rules);
}
// Ratings/omdømme/farver: beskær til de spillere og klubber der er med (sparer plads)
const keptPlayers = new Set(w.players.map((p) => p[F.id] as number));
for (const k of Object.keys(w.ratings)) if (!keptPlayers.has(Number(k))) delete w.ratings[Number(k)];
for (const k of Object.keys(w.clubRep)) if (!keptClubs.has(Number(k))) delete w.clubRep[Number(k)];
for (const k of Object.keys(w.clubColors)) if (!keptClubs.has(Number(k))) delete w.clubColors[Number(k)];
if (w.cmRaw) { for (const t of [w.cmRaw.clubRep, w.cmRaw.clubStat ?? {}, w.cmRaw.crowd ?? {}, w.cmRaw.fin ?? {}, w.cmRaw.chair ?? {}, w.cmRaw.chairBoard ?? {}] as Record<number, unknown>[]) for (const k of Object.keys(t)) if (!keptClubs.has(Number(k))) delete t[Number(k)]; }
/** 2026/27: stabens ikke-spillerpost pr. person-id → world-cm.json (cmRaw.staffNp) */
const staffNp2026 = new Map<number, number[]>();
/** (MODERN_PARITY 7) 2026/27: bestyrelse/managerjob – staff[12] (omdømmerne og de skjulte egenskaber), [13] (ankomstdatoen) og [14] (landsholdet
 *  +0x24/+0x28) pr. person-id → world-cm.json (cmRaw.staffBx) */
const staffBx2026 = new Map<number, [number[], string, number[]]>();
/** (MODERN_PARITY 13) 2026/27: stabens hukommelse [15] (0x524d70 – Staff Search) pr. person-id → world-cm.json (cmRaw.staffMem); de øvrige ikke-spillere
 *  (staffX i originalens format med [11]..[16]) og deres klubbers navne → world-cm-staff.json */
const staffMem2026 = new Map<number, 1 | number[]>();
let staffX2026: NonNullable<typeof w.staff> | null = null, clubNames2026: Record<number, [string, number]> | null = null;
// stab: kun i de klubber, der er med (andre klubbers folk bliver ledige, hvis de er gode nok – CA 100+); datoerne skubbes som spillernes
if (w.staff) {
  const shown = new Set(w.clubs.filter((c) => { const l = w.leagues.find((x) => x.id === c[4]); return l && !l.hidden; }).map((c) => c[0] as number));
  const dropped: NonNullable<typeof w.staff> = [];
  const src = new Map<NonNullable<typeof w.staff>[number], NonNullable<typeof w.staff>[number]>();
  const out = (s: NonNullable<typeof w.staff>[number], full = ORIGINAL) => {
    const np = full && s[11] ? [s[11]] : [];
    // [14] = landsholdet +0x24/+0x28 (kun den originale database: viljen 0x844780); [15]/[16] = hukommelsen og klub/job (Staff Search)
    const bx = full && s[11] && s[12] ? [s[12], s[13] ? shift(s[13]) : '', s[14] ?? [-1, 0], ...(s[15] !== undefined ? [s[15], s[16] ?? [-1, 0]] : [])] : [];
    return [s[0], s[1], s[2], s[3], shift(s[4]), s[5], s[6], s[7], s[8], s[9], ...(s[5] === 5 && s[10] ? [s[10]] : np.length ? [null] : []), ...np, ...bx] as typeof s;
  };
  w.staff = w.staff.flatMap((s) => {
    // [10] = managerens taktiske egenskaber (kun for managere i de viste klubber – computerens taktik i gittermotoren)
    // [11] = hele ikke-spillerposten (kun den originale database: originalens spilstart cmStaffInit.ts)
    // [12] = omdømmerne +8/+0xc og de skjulte egenskaber (kun den originale database: bestyrelse/managerjob cmBoard.ts)
    if (s[0] && !shown.has(s[0])) { if (s[7] < 100) { dropped.push(s); return []; } s = [0, s[1], s[2], s[3], s[4], 0, s[6], s[7], s[8], s[9], null, s[11], s[12], s[13], s[14], s[15], s[16]]; }
    const r = out(s); src.set(r, s);
    return [r];
  });
  // de ledige: kun de 600 bedste (world.json skal kunne ligge i appens offline-cache, højst 8 MB)
  const free = new Set(w.staff.filter((s) => !s[0]).sort((a, b) => b[7] - a[7]).slice(0, 600));
  for (const s of w.staff) if (!s[0] && !free.has(s)) dropped.push(src.get(s)!);
  w.staff = w.staff.filter((s) => s[0] || free.has(s));
  if (!ORIGINAL) for (const r of w.staff) { const x = src.get(r); const s11 = x?.[11]; if (s11) staffNp2026.set(r[9], s11); if (s11 && x?.[12]) staffBx2026.set(r[9], [x[12], x[13] ? shift(x[13]) : '', x[14] ?? [-1, 0]]); if (x?.[15] !== undefined) staffMem2026.set(r[9], x[15]); }
  // Staff Search (0x7afa70): originalens hukommelse efter 0x524d70 – de øvrige ikke-spillere, der kan være med (altid, eller når et spilbart
  // land vælges), i samme format med [0] = 0, [5] = jobbet +0x3d og [16] = [klub, job]; klubberne uden for spillet får deres navn i clubNames
  if (w.staffX) {
    const playable = new Set(w.leagues.filter((l) => !l.hidden).map((l) => l.nation));
    const inMem = (s: NonNullable<typeof w.staff>[number]) => s[15] === 1 || (Array.isArray(s[15]) && s[15].some((n) => playable.has(n)));
    const xs = [...w.staffX, ...dropped.map((s) => { const r = s.slice() as typeof s; r[0] = 0; r[5] = s[16]?.[1] ?? 0; return r; })].filter(inMem);
    const before = xs.length;
    w.staffX = xs.map((s) => { const r = out(s, true); r[10] = s[5] === 5 ? r[10] : null; return r; });
    const known = new Set(w.clubs.map((c) => c[0] as number));
    const names: Record<number, [string, number]> = {};
    for (const s of w.staffX) { const c = s[16]?.[0] ?? -1; if (c >= 0 && !known.has(c) && w.clubNames?.[c]) names[c] = w.clubNames[c]; }
    // turneringernes tidligere vindere (compHist): kun de turneringer, spillet har, og navnene på klubberne uden for spillet
    if (w.compHist) {
      const keep = new Set(w.leagues.map((l) => l.id));
      for (const k of Object.keys(w.compHist)) if (k.startsWith('CM') && !keep.has(k)) delete w.compHist[k];
      for (const rows of Object.values(w.compHist)) for (const [, a, b] of rows) for (const c of [a, b]) if (c >= 0 && !known.has(c) && w.clubNames?.[c]) names[c] = w.clubNames[c];
    }
    w.clubNames = names;
    console.log(`Staff Search: ${w.staff.length} i spillets stab + ${before} andre ikke-spillere (${Object.keys(names).length} klubber uden for spillet)`);
    // 2026/27: ikke i world.json (world-cm-staff.json, se nederst)
    if (!ORIGINAL) { staffX2026 = w.staffX; clubNames2026 = names; delete w.staffX; delete w.clubNames; }
  } else { delete w.staffX; delete w.clubNames; }
}
// (forholdene) præferencerne kun for de personer og klubber, der er med (cmRelations.ts – id'er uden for spillet bliver 0 ved nyt spil)
if (w.cmRaw?.prefs) {
  const keptStaff = new Set((w.staff ?? []).map((s) => s[9]));
  for (const k of Object.keys(w.cmRaw.prefs)) if (!keptPlayers.has(Number(k)) && !keptStaff.has(Number(k))) delete w.cmRaw.prefs[Number(k)];
  for (const k of Object.keys(w.cmRaw.clubPrefs ?? {})) if (!keptClubs.has(Number(k))) delete w.cmRaw.clubPrefs![Number(k)];
}
// nationernes sprog (nation +0x77/+0x78/+0x79) kun i den originale database (originalens sprogtabel, cmLanguage.ts)
// (MODERN_PARITY 12) 2026/27: i world-cm.json (cmRaw.nationLang pr. nationsindeks) – world.json uændret
const nationLang2026 = ORIGINAL ? null : (w.nations as { lang?: number[] }[]).map((n) => n.lang ?? [0, 0, 0]);
if (!ORIGINAL) for (const n of w.nations as { lang?: number[] }[]) delete n.lang;
// dommere: kun fra lande med spilbare ligaer (kampene dømmes af hjemmelandets dommere)
if (w.officials) { const playable = new Set(w.leagues.filter((l) => !l.hidden).map((l) => l.nation)); w.officials = w.officials.filter((o) => playable.has(o[2])); }
// landsholdene (originalen): nationalstadion, FIFA-koefficient, landstræner og tidligere slutrunder (scripts/build-national.py)
if (ORIGINAL && existsSync(new URL('./national-original.json', import.meta.url))) {
  const nt = JSON.parse(readFileSync(new URL('./national-original.json', import.meta.url), 'utf8')) as { nations: Record<string, unknown>; history: { y: number }[] };
  const byIdx: Record<number, unknown> = {};
  w.nations.forEach((n, i) => { if (nt.nations[n.name]) byIdx[i] = nt.nations[n.name]; });
  (w as unknown as { nationalTeams: unknown }).nationalTeams = { nations: byIdx, history: nt.history.filter((h) => h.y <= 2001) };
}
// originalens økonomi (saldo, tilskuere, træningsanlæg – club.dat +101/+115/+127): world.json kun for den originale database; 2026/27 (MODERN_PARITY 4,
// originalens økonomi i ægte tilstand) i world-cm.json som cmRaw.clubFin – world.json uændret
const clubFin2026 = ORIGINAL ? null : Object.fromEntries(Object.entries(w.clubFinance ?? {}).filter(([k]) => keptClubs.has(Number(k))));
if (!ORIGINAL) delete w.clubFinance;
else for (const k of Object.keys(w.clubFinance ?? {})) if (!keptClubs.has(Number(k))) delete w.clubFinance![Number(k)];

// Datoer skubbes +25 år (så 2026/27 giver de rigtige aldre). Markedsværdierne i denne opdatering er
// mangelfulde/uensartede (de fleste er 0, og de få der er sat, bliver overinflateret af parserens
// 2001→nu-faktor), så vi nulstiller dem og lader spillet udlede værdien konsistent fra CA/PA/alder.
for (const p of w.players) {
  p[F.dob] = shift(p[F.dob] as string);
  if (p[F.contract]) p[F.contract] = shift(p[F.contract] as string);
  p[F.value] = 0;
  p[F.maxValue] = 0;
}
w.season = SEASON;
const label = SEASON === 2001 ? `original ${dir.match(/3\.9\.6\d/)?.[0] ?? '3.9.68'}-database` : 'October 2026 Data Update';
w.source = `Championship Manager 01/02 – ${label} (${SEASON}/${String(SEASON + 1).slice(2)})`;

// gem den tidligere moderne database som backup, første gang
if (existsSync(out)) {
  const backup = out.replace(/world\.json$/, 'world-modern.json');
  if (!existsSync(backup)) { copyFileSync(out, backup); console.error('gemte tidligere database som', backup); }
}

// 2026/27 (17/11, MODERN_PARITY): originalens rå værdier (cmRaw – klub-/landsomdømme, turneringernes omdømme, tilskuerposterne, byerne,
// præferencerne …) til originalens logik i ægte tilstand (cmLogic, fx gittermotoren) i en separat fil world-cm.json, så world.json kan blive i
// appens offline-cache (højst 10 MB); ui/world.ts henter den med world.json og lægger den på som CMWorld.cmRaw
const cmOut = out.replace(/world([^/]*)\.json$/, 'world$1-cm.json');
const cmSide = !ORIGINAL && w.cmRaw && cmOut !== out ? w.cmRaw : null;
// (MODERN_PARITY 12) originalens vejr på 2026/27: opdateringens egen weather.cfg (29 områder – 3.9.68 har 44) og hjemmeholdets by/område/stadion
// som scripts/build-cm-weather.py for 2001: stadium +0x38 byen, ellers klubbens nation (+0x53) → hovedstaden (+0x7a); området = byens +0x34,
// hvis 0 ≤ indeks < antal, ellers byens nation (+0x1f) → hovedstadens +0x34, ellers 0 (0x923010)
if (cmSide && existsSync(join(dir, 'weather.cfg'))) {
  const lines = readFileSync(join(dir, 'weather.cfg'), 'latin1').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
  const n = parseInt(lines[0], 10), r: [number, string, number[][]][] = [];
  for (let i = 1, k = 0; k < n; k++) {
    const m = /^(-?\d+)\s+(.*)$/.exec(lines[i++])!;
    const per: number[][] = [];
    for (let q = 0; q < 4; q++) {
      const v = lines[i++].replace(/^\w+:\s*/, '').split(',').map((x) => parseInt(x.trim().replace(/^[WPH]/, ''), 10));
      if (v.length !== 18) throw new Error(`weather.cfg: ${lines[i - 1]}`);
      per.push(v);
    }
    r.push([parseInt(m[1], 10), m[2].trim(), per]);
  }
  if (r.some((x, i) => x[0] !== i)) throw new Error('weather.cfg: områderne er ikke 0..n−1');
  const Ci = new DataView(files['city.dat']), St = new DataView(files['stadium.dat']), Cl = new DataView(files['club.dat']), Na = new DataView(files['nation.dat']);
  const city = new Map<number, [number, number]>(), capital = new Map<number, number>(), stad = new Map<number, [number, number, number, number]>(), club = new Map<number, [number, number]>();
  for (let o = 0; o + 56 <= Ci.byteLength; o += 56) city.set(Ci.getInt32(o, true), [Ci.getInt32(o + 0x1f, true), Ci.getInt32(o + 0x34, true)]);
  for (let o = 0; o + 290 <= Na.byteLength; o += 290) capital.set(Na.getInt32(o, true), Na.getInt32(o + 0x7a, true));
  for (let o = 0; o + 78 <= St.byteLength; o += 78) stad.set(St.getInt32(o, true), [St.getInt32(o + 0x38, true), St.getInt32(o + 0x3c, true), St.getInt8(o + 0x4c), St.getInt8(o + 0x4d)]);
  for (let o = 0; o + 581 <= Cl.byteLength; o += 581) club.set(Cl.getInt32(o, true), [Cl.getInt32(o + 0x53, true), Cl.getInt32(o + 0x69, true)]);
  const ok = (x: number) => x >= 0 && x < n;
  const c: Record<number, [number, number, number, number, number]> = {};
  for (const row of w.clubs) {
    const cl = club.get(row[0] as number);
    if (!cl) continue;
    const st = stad.get(cl[1]);
    let cid = st && city.has(st[0]) ? st[0] : -1;
    if (cid < 0) cid = city.has(capital.get(cl[0]) ?? -1) ? capital.get(cl[0])! : -1;
    if (cid < 0) continue;                                                         // ingen by: vindstille, tørt og 2-båndets temperatur
    let reg = city.get(cid)![1];
    if (!ok(reg)) { const cap = capital.get(city.get(cid)![0]) ?? -1; reg = city.has(cap) && ok(city.get(cap)![1]) ? city.get(cap)![1] : 0; }
    c[row[0] as number] = [cid, reg, st ? st[1] : 0, st ? st[2] : 0, st ? st[3] : 0];
  }
  cmSide.wx = { r, c };
  console.error(`vejret: ${n} områder, ${Object.keys(c).length} klubber med by`);
}
// (MODERN_PARITY 12) prisernes tidligere vindere (staff_comp_history.dat, 58 bytes – som scripts/build-cm-awards.py for 2001): [år, [1., 2., 3.]]
// pr. pris-id, nyeste først; navnene slås op på +0x33 i first/second/common_names.dat (opdateringens id'er peger ofte forkert – vist som originalen)
if (cmSide && files['staff_comp_history.dat'] && files['staff_comp.dat']) {
  const names = (f: string) => {
    const m = new Map<number, string>(), b = files[f], D = new DataView(b), dec = new TextDecoder('latin1');
    for (let o = 0; o + 60 <= b.byteLength; o += 60) { const u = new Uint8Array(b, o, 51), e = u.indexOf(0); m.set(D.getInt32(o + 0x33, true), dec.decode(u.subarray(0, e < 0 ? 51 : e))); }
    return m;
  };
  const fst = names('first_names.dat'), snd = names('second_names.dat'), com = names('common_names.dat');
  const nAw = Math.floor(files['staff_comp.dat'].byteLength / 101);
  const H = new DataView(files['staff_comp_history.dat']), hist: Record<number, [number, (string | null)[]][]> = {};
  for (let o = 0; o + 58 <= H.byteLength; o += 58) {
    const aid = H.getInt32(o + 4, true);
    if (aid < 0 || aid >= nAw) continue;
    const places: (string | null)[] = [];
    for (let k = 0; k < 3; k++) {
      const f = H.getInt32(o + 0xa + 16 * k, true), s2 = H.getInt32(o + 0xe + 16 * k, true), c = H.getInt32(o + 0x12 + 16 * k, true);
      if (f < 0 && s2 < 0 && c < 0) { places.push(null); continue; }
      places.push(snd.has(s2) ? [fst.get(f) ?? '', snd.get(s2)!].filter(Boolean).join(' ') : (com.get(c) || fst.get(f) || ''));
    }
    while (places.length && places[places.length - 1] === null) places.pop();
    (hist[aid] ??= []).push([H.getUint16(o + 8, true), places]);
  }
  for (const v of Object.values(hist)) v.sort((a, b) => b[0] - a[0]);
  cmSide.awHist = hist;
}
// (MODERN_PARITY 12) venskabskampenes nation.dat-felter (Friendly 0x5c4680/0x5c4cb0/0x5c5040 – som build-preseason.mts' CM_NATION_FR for 3.9.60)
if (cmSide && files['nation.dat']) {
  const N = new DataView(files['nation.dat']), fr: Record<number, number[]> = {};
  for (let o = 0; o + 290 <= N.byteLength; o += 290) fr[N.getInt32(o, true)] = [N.getInt16(o + 0x86, true), N.getUint8(o + 0x84), N.getUint8(o + 0x7e), N.getInt16(o + 0x8e, true), N.getUint8(o + 0x75), N.getInt32(o + 0x71, true), N.getInt32(o + 0x110, true), N.getInt32(o + 0x114, true), N.getInt32(o + 0x118, true)];
  cmSide.nationFr = fr;
}
if (cmSide && nationLang2026) cmSide.nationLang = nationLang2026;
if (cmSide && clubFin2026 && Object.keys(clubFin2026).length) cmSide.clubFin = clubFin2026;
if (cmSide) delete w.cmRaw;
// (MODERN_PARITY 5+6) stabens ikke-spillerpost (staff[11] fra parseCM0102 – i world.json kun for den originale database) for den stab, world-filen har
if (cmSide && staffNp2026.size) cmSide.staffNp = Object.fromEntries([...staffNp2026].sort((a, b) => a[0] - b[0]));
if (cmSide && staffBx2026.size) cmSide.staffBx = Object.fromEntries([...staffBx2026].sort((a, b) => a[0] - b[0]));
if (cmSide && staffMem2026.size) cmSide.staffMem = Object.fromEntries([...staffMem2026].sort((a, b) => a[0] - b[0]));
// landsholdene (staff +0x24): nat_club.dat's id'er følger club.dat's (A-holdet = antallet af klubber + nationens id)
if (cmSide && staffBx2026.size && files['nat_club.dat']) cmSide.natOff = new DataView(files['nat_club.dat']).getInt32(0, true);
writeFileSync(out, JSON.stringify(w));
const kb = Math.round(statSync(out).size / 1024);
if (cmSide) {
  writeFileSync(cmOut, JSON.stringify({ source: w.source, cmRaw: cmSide }));
  console.error(`cmRaw (originalens logik i ægte tilstand) -> ${cmOut} (${Math.round(statSync(cmOut).size / 1024)} KB)`);
}
// (MODERN_PARITY 13) Staff Search's øvrige ikke-spillere (0x7afa70 – originalens hukommelse efter 0x524d70) i en egen fil, som kun hentes ved et nyt
// spil (ikke i appens offline-cache): staffX i originalens format og navnene på deres klubber uden for spillet
const staffOut = cmOut.replace(/-cm\.json$/, '-cm-staff.json');
if (cmSide && staffX2026 && staffOut !== cmOut) {
  writeFileSync(staffOut, JSON.stringify({ source: w.source, staffX: staffX2026, clubNames: clubNames2026 ?? {} }));
  console.error(`Staff Search (${staffX2026.length} ikke-spillere) -> ${staffOut} (${Math.round(statSync(staffOut).size / 1024)} KB)`);
}

// ---- Spillerkarrierer (staff_history.dat) → en separat fil, der først hentes, når en profil åbnes.
// Post (17 bytes): id (4) · person-id (4) · sæsonens startår (2) · klub (4) · leje (1) · kampe (1) · mål (1).
// Klubnavnene tages fra hele club.dat (også klubber, der ikke er med i spillet).
const careersOut = out.replace(/world([^/]*)\.json$/, 'careers$1.json').replace('careers.json', 'careers-cm.json');
if (files['staff_history.dat'] && careersOut !== out) {
  const H = new DataView(files['staff_history.dat']);
  const C = new DataView(files['club.dat']);
  const dec = new TextDecoder('windows-1252');
  const str = (o: number, len: number) => { const b = new Uint8Array(files['club.dat'], o, len); const e = b.indexOf(0); return dec.decode(b.subarray(0, e < 0 ? len : e)).trim(); };
  const clubName = new Map<number, string>();
  for (let o = 0; o + 581 <= files['club.dat'].byteLength; o += 581) {
    const long = str(o + 4, 51);
    clubName.set(C.getInt32(o, true), CLUB_NAME_FIXES[long]?.[1] ?? str(o + 56, 26) ?? long);
  }
  const rows = new Map<number, [number, number, number, number, number][]>();
  for (let o = 0; o + 17 <= files['staff_history.dat'].byteLength; o += 17) {
    const pid = H.getInt32(o + 4, true);
    if (!keptPlayers.has(pid)) continue;
    const club = H.getInt32(o + 10, true);
    if (!clubName.has(club)) continue;
    const year = H.getInt16(o + 8, true) + SHIFT;
    (rows.get(pid) ?? rows.set(pid, []).get(pid)!).push([year, club, H.getUint8(o + 15), H.getUint8(o + 16), H.getUint8(o + 14) ? 1 : 0]);
  }
  let first = Infinity;
  for (const list of rows.values()) for (const r of list) first = Math.min(first, r[0]);
  const used = new Set<number>();
  const players: Record<string, number[]> = {};
  for (const [pid, list] of rows) {
    // ældste sæson først; inden for samme sæson i databasens rækkefølge
    list.sort((a, b) => a[0] - b[0]);
    // seneste sæson før spilstart ligger allerede i spillet som den aktuelle – medtag kun tidligere
    players[pid] = list.filter((r) => r[0] < SEASON).flatMap((r) => { used.add(r[1]); return [r[0] - first, r[1], r[2], r[3], 0, r[4]]; });
    if (!players[pid].length) delete players[pid];
  }
  const clubs = Object.fromEntries([...used].map((id) => [id, clubName.get(id)]));
  writeFileSync(careersOut, JSON.stringify({ source: w.source, first, fields: ['season', 'club', 'apps', 'goals', 'assists', 'loan'], clubs, players }));
  console.error(`karrierer: ${Object.keys(players).length} spillere, ${Object.keys(clubs).length} klubber -> ${careersOut} (${Math.round(statSync(careersOut).size / 1024)} KB)`);
}

// sanitetstjek: alder ved sæsonstart (dob er nu allerede skubbet)
const ages = w.players.map((p) => ageAt(p[F.dob] as string)).sort((a, b) => a - b);
const med = ages[Math.floor(ages.length / 2)];
console.error(`OK: season ${w.season}, ${w.leagues.length} ligaer, ${w.clubs.length} klubber, ${w.players.length} spillere (frasorteret ${dropped}: over 40 eller uden for de medtagne klubber) -> ${out} (${kb} KB)`);
console.error(`aldre ved ${start}: min ${ages[0]}, median ${med}, max ${ages[ages.length - 1]} (under 15: ${ages.filter((a) => a < 15).length}, over 40: ${ages.filter((a) => a > 40).length})`);

// ---- Byggeloggen (scripts/data/world-builds.json): kilde og sha256 for hver world-fil i public/data. tests/worldBuild.test.ts kræver, at den
// committede fil har den sha256, så en fil, der er rettet i hånden (uden at køre dette script), fanges; scripts/world-repro.ts bygger filerne
// igen fra kilderne og sammenligner. Byg til en anden mappe (fx /tmp) for at prøve uden at røre loggen.
if (resolve(dirname(out)) === resolve('public/data')) {
  const logFile = 'scripts/data/world-builds.json';
  const log = existsSync(logFile) ? JSON.parse(readFileSync(logFile, 'utf8')) : {};
  const sha = (f: string) => createHash('sha256').update(readFileSync(f)).digest('hex');
  const src = dir.includes('.orig-db/') ? dir.slice(dir.indexOf('.orig-db/')) : dir;
  log[basename(out)] = { source: src.replace(/\/+$/, ''), season: SEASON, ...(process.env.NO_LEGACY ? { noLegacy: true } : {}), sha256: sha(out),
    ...(existsSync(careersOut) && careersOut !== out ? { careers: basename(careersOut), careersSha256: sha(careersOut) } : {}),
    ...(cmSide ? { cm: basename(cmOut), cmSha256: sha(cmOut) } : {}),
    ...(cmSide && staffX2026 && existsSync(staffOut) ? { cmStaff: basename(staffOut), cmStaffSha256: sha(staffOut) } : {}), reproducible: true };
  writeFileSync(logFile, JSON.stringify(Object.fromEntries(Object.entries(log).sort(([a], [b]) => a.localeCompare(b))), null, 2) + '\n');
  console.error(`byggeloggen: ${logFile} (${basename(out)})`);
}
