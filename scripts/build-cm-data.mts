// Byg en spilbar database (JSON) fra en CM 01/02 Data-mappe.
//
// CM 01/02-databaser har et fast 2001-ur. "October 2026"-opdateringen er moderne trupper med
// fødselsdatoer skubbet ~25 år tilbage, så de passer til 2001-uret. Vi angiver den ønskede sæson,
// og alle datoer skubbes (sæson − 2001) år, så aldrene passer. Den originale 3.9.65-database spilles
// som 2001/02 (ingen forskydning).
//
// Brug: npx tsx scripts/build-cm-data.mts "<Data-mappe>" [out.json] [sæson]
import { readFileSync, readdirSync, writeFileSync, existsSync, copyFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
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
const w = parseCM0102(files, ORIGINAL ? { maxTiers: 4, allClubs: true } : {});

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
const EXTRA_TIERS: Record<string, number> = ORIGINAL ? { England: 4, Scotland: 4, Holland: 2, Portugal: 2, Argentina: 2, Mexico: 2, Norway: 2 } : {};
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
// Ratings/omdømme/farver: beskær til de spillere og klubber der er med (sparer plads)
const keptPlayers = new Set(w.players.map((p) => p[F.id] as number));
for (const k of Object.keys(w.ratings)) if (!keptPlayers.has(Number(k))) delete w.ratings[Number(k)];
for (const k of Object.keys(w.clubRep)) if (!keptClubs.has(Number(k))) delete w.clubRep[Number(k)];
for (const k of Object.keys(w.clubColors)) if (!keptClubs.has(Number(k))) delete w.clubColors[Number(k)];
// stab: kun i de klubber, der er med (andre klubbers folk bliver ledige, hvis de er gode nok – CA 100+); datoerne skubbes som spillernes
if (w.staff) {
  const shown = new Set(w.clubs.filter((c) => { const l = w.leagues.find((x) => x.id === c[4]); return l && !l.hidden; }).map((c) => c[0] as number));
  w.staff = w.staff.flatMap((s) => {
    // [10] = managerens taktiske egenskaber (kun for managere i de viste klubber – computerens taktik i gittermotoren)
    if (s[0] && !shown.has(s[0])) { if (s[7] < 100) return []; s = [0, s[1], s[2], s[3], s[4], 0, s[6], s[7], s[8], s[9]]; }
    return [[s[0], s[1], s[2], s[3], shift(s[4]), s[5], s[6], s[7], s[8], s[9], ...(s[5] === 5 && s[10] ? [s[10]] : [])] as typeof s];
  });
  // de ledige: kun de 600 bedste (world.json skal kunne ligge i appens offline-cache, højst 8 MB)
  const free = new Set(w.staff.filter((s) => !s[0]).sort((a, b) => b[7] - a[7]).slice(0, 600));
  w.staff = w.staff.filter((s) => s[0] || free.has(s));
}
// dommere: kun fra lande med spilbare ligaer (kampene dømmes af hjemmelandets dommere)
if (w.officials) { const playable = new Set(w.leagues.filter((l) => !l.hidden).map((l) => l.nation)); w.officials = w.officials.filter((o) => playable.has(o[2])); }
// landsholdene (originalen): nationalstadion, FIFA-koefficient, landstræner og tidligere slutrunder (scripts/build-national.py)
if (ORIGINAL && existsSync(new URL('./national-original.json', import.meta.url))) {
  const nt = JSON.parse(readFileSync(new URL('./national-original.json', import.meta.url), 'utf8')) as { nations: Record<string, unknown>; history: { y: number }[] };
  const byIdx: Record<number, unknown> = {};
  w.nations.forEach((n, i) => { if (nt.nations[n.name]) byIdx[i] = nt.nations[n.name]; });
  (w as unknown as { nationalTeams: unknown }).nationalTeams = { nations: byIdx, history: nt.history.filter((h) => h.y <= 2001) };
}
// originalens økonomi (saldo, tilskuere, træningsanlæg) bruges kun af den originale database
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

writeFileSync(out, JSON.stringify(w));
const kb = Math.round(statSync(out).size / 1024);

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
