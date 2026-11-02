// Byg spillets default-database (public/data/world.json) fra en CM 01/02 Data-mappe.
//
// Dataopdateringen ("October 2026") er moderne 2026-trupper lagt ind i CM 01/02-formatet, hvor
// fødselsdatoerne er skubbet ~25 år tilbage, så aldrene passer til originalens 2001-ur. For at spille
// sæsonen 2026/27 med korrekte aldre skubber vi alle datoer +25 år igen og sætter season=2026.
//
// Brug: npx tsx scripts/build-cm-data.mts "<Data-mappe>" [public/data/world.json]
import { readFileSync, readdirSync, writeFileSync, existsSync, copyFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parseCM0102 } from '../src/game/data/cm0102';

const SHIFT = 25; // 2026 - 2001
const SEASON = 2026;

// Standard: Data-mappen fra den udpakkede "October 2026 Data Update.zip" (pak zip'en ud i .data-update/)
const dir = process.argv[2] ?? '.data-update/October 2026 Data Update';
const out = process.argv[3] ?? 'public/data/world.json';
if (!existsSync(dir)) {
  console.error(`Data-mappe ikke fundet: ${dir}\nPak "October 2026 Data Update.zip" ud i .data-update/ (eller angiv stien som argument).`);
  process.exit(1);
}

const files: Record<string, ArrayBuffer> = {};
for (const f of readdirSync(dir)) {
  if (!f.toLowerCase().endsWith('.dat')) continue;
  const b = readFileSync(join(dir, f));
  files[f.toLowerCase()] = b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
}

const w = parseCM0102(files);

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
const nationName = (idx: number) => w.nations[idx]?.name ?? '';
const keptLeagues = new Set<string>();
for (const l of w.leagues) {
  const nm = nationName(l.nation);
  if (TWO_TIER.has(nm) || (ONE_TIER.has(nm) && l.tier === 1)) keptLeagues.add(l.id);
}
w.leagues = w.leagues.filter((l) => keptLeagues.has(l.id));
const keptClubs = new Set<number>();
w.clubs = w.clubs.filter((c) => keptLeagues.has(c[4] as string));
for (const c of w.clubs) keptClubs.add(c[0] as number);

// Spillere: beholdes hvis klubben er med; frie agenter (klub 0) beholdes som signérbare stjerner.
// Desuden frasorteres ex-spiller-trænere (staff-poster med en spiller-post, alle 40+ med værdi 0).
const before = w.players.length;
w.players = w.players.filter((p) => {
  const club = p[F.club] as number;
  if (club && !keptClubs.has(club)) return false;
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
w.source = `Championship Manager 01/02 – October 2026 Data Update (${SEASON}/${String(SEASON + 1).slice(2)})`;

// gem den tidligere moderne database som backup, første gang
if (existsSync(out)) {
  const backup = out.replace(/world\.json$/, 'world-modern.json');
  if (!existsSync(backup)) { copyFileSync(out, backup); console.error('gemte tidligere database som', backup); }
}

writeFileSync(out, JSON.stringify(w));
const kb = Math.round(statSync(out).size / 1024);

// sanitetstjek: alder ved sæsonstart (dob er nu allerede skubbet)
const ages = w.players.map((p) => ageAt(p[F.dob] as string)).sort((a, b) => a - b);
const med = ages[Math.floor(ages.length / 2)];
console.error(`OK: season ${w.season}, ${w.leagues.length} ligaer, ${w.clubs.length} klubber, ${w.players.length} spillere (frasorteret ${dropped} over 40) -> ${out} (${kb} KB)`);
console.error(`aldre ved ${start}: min ${ages[0]}, median ${med}, max ${ages[ages.length - 1]} (under 15: ${ages.filter((a) => a < 15).length}, over 40: ${ages.filter((a) => a > 40).length})`);
