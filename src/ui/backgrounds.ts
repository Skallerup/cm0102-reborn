// Baggrundsbilleder i det klassiske tema (Sunday League Pack, 800x600, konverteret fra .RGN til JPEG).
// Ét tilfældigt billede pr. spildag: det samme hele dagen, et nyt når man går videre – aldrig to dage i træk ens.

const NAMES = [
  'boardroom1', 'boardroom2', 'fans1', 'goalpost1', 'goalpost2', 'goalpost3',
  ...Array.from({ length: 20 }, (_, i) => `play${i + 1}`).filter((n) => n !== 'play12'),
  ...Array.from({ length: 7 }, (_, i) => `scramble${i + 1}`),
  'tackle2', 'tackle3', 'tackle4',
  ...Array.from({ length: 5 }, (_, i) => `team${i + 1}`),
  ...Array.from({ length: 6 }, (_, i) => `training${i + 1}`),
  ...Array.from({ length: 6 }, (_, i) => `trophy${i + 1}`),
];
export const BACKGROUNDS: readonly string[] = NAMES;

/** Lille, stabil hash (FNV-1a) → deterministisk "tilfældigt" valg uden at gemme noget */
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12;
  return h >>> 0;
}

const N = NAMES.length;
const dayNo = (iso: string) => Math.floor(Date.parse(`${iso}T12:00:00Z`) / 86400000);

/** Seedet blanding af alle billeder for én "runde" på N dage (Fisher–Yates med xorshift) */
function cycle(c: number, seed: string): number[] {
  const a = Array.from({ length: N }, (_, i) => i);
  let x = hash(`${seed}|${c}`) || 1;
  for (let i = N - 1; i > 0; i--) {
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5; x >>>= 0;
    const j = x % (i + 1); [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Indeks for dagens billede. Alle billeder vises én gang, før nogen gentages, og to dage i træk
 * er aldrig ens (heller ikke ved overgangen mellem to runder). Seed (fx klubben) giver hver karriere sin egen rækkefølge.
 */
export function backgroundIndex(iso: string, seed: string | number = ''): number {
  const d = dayNo(iso), c = Math.floor(d / N), k = d - c * N;
  const cur = cycle(c, String(seed));
  // runden starter med forrige rundes sidste billede → byt de to første
  if (cur[0] === cycle(c - 1, String(seed))[N - 1]) [cur[0], cur[1]] = [cur[1], cur[0]];
  return cur[k];
}

/** Valgt baggrundspakke fra fællesskabet (Spilindstillinger → Baggrunde); tom = spillets egne billeder */
const PACK_KEY = 'cm-bgpack';
export interface BgPack { id: number; title: string; images: string[] }
export function bgPack(): BgPack | null {
  try { const v = JSON.parse(localStorage.getItem(PACK_KEY) ?? 'null'); return v?.images?.length ? v : null; } catch { return null; }
}
export function setBgPack(p: BgPack | null) {
  try { if (p) localStorage.setItem(PACK_KEY, JSON.stringify(p)); else localStorage.removeItem(PACK_KEY); } catch { /* privat vindue */ }
}

export function backgroundUrl(iso: string, seed: string | number = ''): string {
  const pack = bgPack();
  if (pack) return pack.images[(dayNo(iso) + String(seed).length) % pack.images.length];
  return `${import.meta.env.BASE_URL}bg/${NAMES[backgroundIndex(iso, seed)]}.jpg`;
}

// ---------- stadioner på kampdage (Naydav's CM0102 Background Image Pack, se scripts/build-stadium-bg.py) ----------

let stadiums: Record<string, string[]> | null = null;
let stadiumsLoading: Promise<void> | null = null;
/** Henter oversigten stadionnavn → billeder (kun én gang; uden net = ingen stadionbilleder) */
export function loadStadiumBgs(): Promise<void> {
  stadiumsLoading ??= fetch(`${import.meta.env.BASE_URL}data/stadium-bg.json`)
    .then((r) => (r.ok ? r.json() : {})).then((d: Record<string, string[]>) => { stadiums = d; }).catch(() => { stadiums = {}; });
  return stadiumsLoading;
}
/** Billede af stadionet (samme hele dagen, skifter mellem stadionets billeder fra kamp til kamp) – null hvis pakken ikke har det */
export function stadiumBgUrl(stadium: string | undefined, iso: string): string | null {
  const imgs = stadium ? stadiums?.[stadium] : undefined;
  if (!imgs?.length) return null;
  return `${import.meta.env.BASE_URL}stadiums/${imgs[dayNo(iso) % imgs.length]}.jpg`;
}

// ---------- baggrunde pr. skærm (Naydav's pakke, scripts/build-screen-bg.py) ----------
// Som CM 01/02's pics.cfg: klubbens skærme = stadion udefra eller klubbens billede, turneringer = turneringens billede,
// træning/bestyrelse/transfer = deres egne, kampdage = stadion indefra. Ugens øvrige skærme: ens egen klub og hverdagen.

interface ScreenBgs { clubs: Record<string, string[]>; comps: Record<string, string[]>; nations: Record<string, string[]>; training: string[]; boardroom: string[]; transfer: string[] }
let screens: ScreenBgs | null = null;
let screensLoading: Promise<void> | null = null;
export function loadScreenBgs(): Promise<void> {
  screensLoading ??= fetch(`${import.meta.env.BASE_URL}data/screen-bg.json`)
    .then((r) => (r.ok ? r.json() : null)).then((d: ScreenBgs | null) => { screens = d; }).catch(() => { screens = null; });
  return screensLoading;
}
/**
 * Hvilket sæt: originalens egne billeder (standard), de nye skærmbilleder (Naydav) eller den gamle Sunday League-pakke.
 * Gemmes som 'original' | 'screens' | 'sunday'; intet gemt (eller ukendt) = originalen.
 */
const SET_KEY = 'cm-bg-set';
export type BgSet = 'original' | 'screens' | 'sunday';
export const bgSet = (): BgSet => { try { const v = localStorage.getItem(SET_KEY); return v === 'sunday' || v === 'screens' ? v : 'original'; } catch { return 'original'; } };
export const setBgSet = (v: BgSet) => { try { localStorage.setItem(SET_KEY, v); } catch { /* ignorér */ } };
export const sundayLeague = () => bgSet() === 'sunday';

// ---------- CM 01/02's egne baggrundsbilleder (scripts/build-original-bg.py: Pictures/*.RGN → public/original-bg/*.jpg) ----------
// Som originalens pics.cfg: [NATIONS] = landets rotation (en klub/spiller/turnering uden eget billede får et tilfældigt af dem –
// i originalens pics.cfg findes kun England), [TRAINING] [BOARDROOM] [TRANSFER] [TROPHY] [SI] = egne lister.
// Billederne er allerede mørklagt i RGN-filerne.

interface OriginalBgs { ext: string; cfg: Record<string, Record<string, string[]>> }
let originals: OriginalBgs | null = null;
let originalsLoading: Promise<void> | null = null;
export function loadOriginalBgs(): Promise<void> {
  originalsLoading ??= fetch(`${import.meta.env.BASE_URL}data/original-bg.json`)
    .then((r) => (r.ok ? r.json() : null)).then((d: OriginalBgs | null) => { originals = d; }).catch(() => { originals = null; });
  return originalsLoading;
}
export const originalBgsReady = () => !!originals;
export type OriginalKind = 'nation' | 'training' | 'boardroom' | 'transfer' | 'trophy' | 'si';
const SECTION: Record<OriginalKind, string> = { nation: 'NATIONS', training: 'TRAINING', boardroom: 'BOARDROOM', transfer: 'TRANSFER', trophy: 'TROPHY', si: 'SI' };
/** Et billede fra originalens pics.cfg: landets liste (hvis pics.cfg har den), ellers en tilfældig post. Fast pr. dag og salt. */
export function originalBgUrl(kind: OriginalKind, iso: string, salt: string | number = '', nation?: string): string | null {
  const entries = originals?.cfg[SECTION[kind]] ?? {};
  const keys = Object.keys(entries);
  if (!originals || !keys.length) return null;
  const list = (nation ? entries[nation] : undefined) ?? entries[keys[hash(`${iso}|${salt}|e`) % keys.length]];
  if (!list?.length) return null;
  return `${import.meta.env.BASE_URL}original-bg/${list[hash(`${iso}|${salt}`) % list.length]}.jpg`;
}

const pick = (list: string[] | undefined, iso: string, salt = 0) => (list?.length ? list[(dayNo(iso) + salt) % list.length] : undefined);
const screenUrl = (n: string) => `${import.meta.env.BASE_URL}screens/${n}.jpg`;
const stadiumUrl = (n: string) => `${import.meta.env.BASE_URL}stadiums/${n}.jpg`;

/** Stadionets billeder delt i udefra og indefra/kamp */
function stadiumImgs(stadium: string | undefined, outside: boolean): string[] {
  const all = stadium ? stadiums?.[stadium] ?? [] : [];
  const ext = all.filter((n) => n.includes('exterior'));
  return outside ? ext : all.filter((n) => !n.includes('exterior'));
}
/** Kampdage: stadion indefra (fuldt stadion) – udefra kun, hvis det er det eneste */
export function matchdayBgUrl(stadium: string | undefined, iso: string): string | null {
  const inside = stadiumImgs(stadium, false);
  const n = pick(inside.length ? inside : stadiumImgs(stadium, true), iso);
  return n ? stadiumUrl(n) : null;
}
/** Alle pakkens billeder af én slags (kampbilleder med fulde tribuner, eller stadioner udefra) – til klubber uden egne fotos */
let pools: Record<string, string[]> = {};
function pool(kind: 'game' | 'exterior'): string[] {
  if (!stadiums) return [];
  return (pools[kind] ??= Object.values(stadiums).flat().filter((n) => n.includes(`_${kind}_`)).sort());
}
/** Kampdag uden stadionfoto: et kampbillede med fulde tribuner fra pakken (fast pr. dag og hjemmehold) */
export function genericMatchdayUrl(iso: string, seed: number): string | null {
  const n = pick(pool('game'), iso, seed);
  return n ? stadiumUrl(n) : null;
}
/** Klub uden foto udefra og uden klubbillede: et stadion udefra fra pakken (fast pr. dag og klub) */
export function genericClubUrl(iso: string, seed: number): string | null {
  const n = pick(pool('exterior'), iso, seed);
  return n ? stadiumUrl(n) : null;
}
/** Aftenkamp (projektørlys): som i CM 01/02 spilles midtugekampe og europæiske kampe om aftenen – weekendkampe om dagen */
export function eveningFixture(iso: string, continental: boolean): boolean {
  if (continental) return true;
  const d = new Date(`${iso}T12:00:00Z`).getUTCDay();
  return d !== 0 && d !== 6;
}
/** En klub: stadion udefra eller klubbens eget billede (skifter fra dag til dag) */
// ---------- klubpakker fra fællesskabet: en godkendt pakke med en klub vises på klubbens skærme og hjemmekampe for alle ----------

let clubPacks: { key: string; images: string[] }[] | null = null;
let clubPacksLoading: Promise<void> | null = null;
const CLUB_WORDS = new Set(['fc', 'afc', 'cf', 'sc', 'ac', 'the', 'club', 'de', 'football']);
/** "Chelsea FC" = "chelsea", "Atlético Madrid" = "atletico madrid" */
export const normClub = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\./g, '').replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter((w) => w && !CLUB_WORDS.has(w)).join(' ');
export function loadClubPacks(): Promise<void> {
  clubPacksLoading ??= import('../online/hub').then(({ listSkins }) => listSkins()).then((r) => {
    // ældre pakker uden klubfelt matches på navnet ("Chelsea"); et tomt felt betyder en almindelig pakke
    clubPacks = (r?.rows ?? []).map((p) => ({ key: normClub(p.club ?? p.title), images: p.images })).filter((x) => x.key && x.images.length);
  }).catch(() => { clubPacks = []; });
  return clubPacksLoading;
}
export function clubPackUrl(club: { name: string; short?: string } | undefined, iso: string): string | null {
  if (!club || !clubPacks?.length) return null;
  const keys = [normClub(club.name), club.short ? normClub(club.short) : ''].filter(Boolean);
  return pick(clubPacks.find((p) => keys.includes(p.key))?.images, iso) ?? null;
}

export function clubBgUrl(club: { id?: number; name: string; short?: string; stadium?: string } | undefined, iso: string): string | null {
  if (!club) return null;
  const pack = clubPackUrl(club, iso);
  if (pack) return pack;
  // stadion udefra først, ellers klubbens eget billede – og til sidst et stadion udefra fra pakken, så klubskærmen altid viser "udenfor stadionet"
  const opts = [...stadiumImgs(club.stadium, true).map(stadiumUrl), ...(screens?.clubs[club.name] ?? []).map(screenUrl)];
  return pick(opts, iso) ?? genericClubUrl(iso, club.id ?? club.name.length);
}
export const compBgUrl = (name: string | undefined, iso: string): string | null => { const n = name ? pick(screens?.comps[name], iso) : undefined; return n ? screenUrl(n) : null; };
export const nationBgUrl = (name: string | undefined, iso: string): string | null => { const n = name ? pick(screens?.nations[name], iso) : undefined; return n ? screenUrl(n) : null; };
export const miscBgUrl = (kind: 'training' | 'boardroom' | 'transfer', iso: string, salt = 0): string | null => { const n = pick(screens?.[kind], iso, salt); return n ? screenUrl(n) : null; };
export const screenBgsReady = () => !!screens;
