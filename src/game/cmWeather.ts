// Originalens vejr (weather.cpp, Weather-objektet [0xde2f74]) – kun den originale database i ægte tilstand.
//
//   * Weather::load_config 0x922810 (create_game 0x828110, databasens dato): klimaområderne fra weather.cfg (0x922c40/0x922d20 – 44 områder,
//     fire perioder: startdag, 5 vind-, 5 nedbørs- og 7 varmetærskler; data/cmWeather.json, scripts/build-cm-weather.py) og fire bytes pr. by:
//     b0..b2 = ftol((rand(100) + rand(100)) · 0,5), b3 = rand(3) (0x922b06–0x922b96).
//   * Weather::update_city_weather 0x922ee0 – dagligt i tidspunkt 2 (forkørslen 0x5cca3b og hoveddagsløkken 0x5cd9aa, efter dagens kampe):
//     b = ftol((rand(100) + b) · 0,5), klemt til 0..100, for b0, b1, b2; rand(10) = 0 → b3 = rand(3).
//   * Weather::get_match_weather 0x923010 (init_match 0x6b8042 → engine+0x4756, Next Match 0x45e834): byen = stadionets (fixture+0x18 → +0x38),
//     ellers hjemmeklubbens stadion (+0x69) eller landets hovedstad (+0x53 → +0x7a); området = byens +0x34 (ellers byens lands hovedstads, ellers
//     0); perioden efter kampens dag (fixture+0x2a); rekorden [vind 0..4 (b2 mod W), nedbør 0/1/2/3/5 (b1 mod P), temperatur (varmebåndet af b2
//     mod H → 0x9232c0), byens b3] og under 0 °C sne/slud/hagl 6..9.
//   * Weather::get_temperature 0x9232c0: båndet · dagen modulo 6/7/8 + basis (−5 … 35), aftenkampe (fixture+0x3f = 2) koldere.
//   * Weather::get_pitch_condition 0x923970 (init_match 0x6b8055 → engine+1): banen af nedbør, temperatur, kapacitet (stadium +0x3c),
//     overdækning (+0x4c), undersoil heating (+0x4d) og fixturens hash (dag + udehold + hjemmehold + turnering) % 20.
//   * weather_format_description 0x9233a0 og pitch_condition_text 0x923b60: teksterne på kampskærmen og Next Match.
// Talrækken: originalens rand (0x90cfc0) trækkes af en egen deterministisk talrække (cmRand af spillets frø, dagen og adressen) – byernes
// tilstand er uafhængig af hinanden, så kun de byer, spillets klubber spiller i, føres.
// Ikke porteret: Weather::check_postponement 0x923630 (udsatte/afbrudte kampe med nyhederne 0x923cc0/0x924050 og init_match's afbrydelsesminut
// engine+0xf638) – kampene spilles altid.
import WX from './data/cmWeather.json';
import type { Fixture, GameState } from './types';
import { cmActive, cmLogic, cmRand } from './cmPlayerData';
import { registerPrerun } from './cmPrerun';

type Period = number[];   // [startdag, W0..W4, P0..P4, H0..H6]
const REGIONS = (WX as unknown as { regions: [number, string, Period[]][] }).regions;
const VERSIONS = (WX as unknown as { versions: Record<string, Record<string, [number, number, number, number, number]>> }).versions;

/** kampens vejr som originalens 4-byte rekord: [vind 0..4, nedbør 0..9, temperatur °C, byens vind 0..2] */
export type CmWeatherRec = [number, number, number, number];

// (MODERN_PARITY 12) 2026/27 i ægte tilstand: nye spil får opdateringens egne tabeller (g.cmWxTab fra world-cm.json – dens weather.cfg og byerne),
// som cm0102.exe læser med "October 2026 Data Update" i Data-mappen; ældre 2026-spil (uden tabellen) og udvidet tilstand er uændrede
export const cmWxOn = (g: GameState): boolean => (cmActive(g) || (cmLogic(g) && !!g.cmWxTab)) && !g.draft;

const dayNum = (iso: string) => Math.round(Date.parse(`${iso}T00:00:00Z`) / 86400000);
const doyOf = (iso: string) => { const y = +iso.slice(0, 4); return dayNum(iso) - Math.round(Date.UTC(y, 0, 1) / 86400000); };
const ftolHalf = (x: number) => Math.trunc(x * 0.5);
const pack = (b: number[]) => (b[0] & 0xff) | ((b[1] & 0xff) << 8) | ((b[2] & 0xff) << 16) | ((b[3] & 0xff) << 24);
const unpack = (v: number) => [v & 0xff, (v >> 8) & 0xff, (v >> 16) & 0xff, (v >>> 24) & 0xff];

function clubTable(g: GameState): Record<string, [number, number, number, number, number]> {
  return g.cmWxTab?.c ?? VERSIONS[g.dbVersion ?? '3.9.60'] ?? VERSIONS['3.9.60'];
}
const regionsOf = (g: GameState) => g.cmWxTab?.r ?? REGIONS;
/** byerne, spillets klubber spiller i (stigende id – fast rækkefølge for talrækken) */
function cities(g: GameState): number[] {
  const t = clubTable(g), s = new Set<number>();
  for (const id of Object.keys(g.clubs)) { const e = t[id]; if (e) s.add(e[0]); }
  return [...s].sort((a, b) => a - b);
}

/** 0x922810 0x922b06–0x922b96: byernes fire bytes ved spillets oprettelse */
export function cmWxInit(g: GameState, day: number): void {
  const rand = cmRand(g.seed ?? 0, 0x922810);
  const c: Record<number, number> = {};
  for (const id of cities(g)) {
    const b0 = ftolHalf(rand(100) + rand(100)), b1 = ftolHalf(rand(100) + rand(100)), b2 = ftolHalf(rand(100) + rand(100));
    c[id] = pack([b0, b1, b2, rand(3)]);
  }
  g.cmWx = { d: day, c };
}

/** 0x922ee0 for dagen `day` (dagnummer) – én gang pr. dag */
export function cmWxUpdate(g: GameState, day: number): void {
  if (!g.cmWx) cmWxInit(g, day - 1);
  const W = g.cmWx!;
  if (day <= W.d) return;
  const rand = cmRand(g.seed ?? 0, day, 0x922ee0);
  for (const id of cities(g)) {
    const b = unpack(W.c[id] ?? 0);
    for (let k = 0; k < 3; k++) b[k] = Math.max(0, Math.min(100, ftolHalf(rand(100) + b[k])));   // 0x922f00–0x922fd8
    if (rand(10) === 0) b[3] = rand(3);                                                            // 0x922fdb–0x922ff6
    W.c[id] = pack(b);
  }
  W.d = day;
}

/** hoveddagsløkken 0x5cccd0 (tidspunkt 2, efter dagens kampe): vejret for dagen, der lige er spillet */
export function cmWxDaily(g: GameState): void {
  if (cmWxOn(g)) cmWxUpdate(g, dayNum(g.date));
}
// forkørslen 0x5cc850 (tidspunkt 2): 0x922ee0 hver dag fra databasens dato til spillets start
registerPrerun('weather', (g, day) => { if (cmWxOn(g)) { if (!g.cmWx) cmWxInit(g, day - 1); cmWxUpdate(g, day); } });

/** 0x9232c0 Weather::get_temperature(båndet, fixture) */
export function cmTemperature(band: number, doy: number, evening: boolean): number {
  const x = doy * band;
  let t: number;
  switch (band) {
    case 0: t = (x % 6) + 1; break;
    case 1: t = (x % 6) - 5; break;
    case 2: t = (x % 7) + 7; break;
    case 3: t = (x % 8) + 14; break;
    case 4: t = (x % 7) + 22; break;
    case 5: t = (x % 6) + 29; break;
    case 6: t = (x % 6) + 35; break;
    default: t = -100;
  }
  if (evening) t = t < 10 ? t - 2 : Math.trunc(t * 0.8);                                         // fixture+0x3f = 2 (0x92334c–0x923377)
  return t;
}

/** hjemmeholdets by/område/stadion (scripts/build-cm-weather.py) – null: ingen by */
function venue(g: GameState, f: Fixture) { return clubTable(g)[f.home] ?? null; }

/** 0x923010 Weather::get_match_weather(rekord, fixture) med byernes tilstand nu. Stadionet er hjemmeholdets – også på neutral bane, hvor
 *  originalen bruger kampens stadion fixture+0x18 (spillets kampe har ikke et; *estimeret*). */
export function cmMatchWeather(g: GameState, f: Fixture): CmWeatherRec {
  const doy = doyOf(f.date), evening = (f.slot ?? 1) === 2;
  const v = venue(g, f);
  const reg = regionsOf(g)[v ? v[1] : 0][2];
  // 0x9230f3–0x923118: perioden (vinter før forårets startdag)
  const s = doy < reg[0][0] ? 3 : doy < reg[1][0] ? 0 : doy < reg[2][0] ? 1 : doy < reg[3][0] ? 2 : 3;
  if (!v) return [0, 0, cmTemperature(2, doy, evening), 0];                                       // 0x92311f: ingen by
  if (!g.cmWx) cmWxInit(g, dayNum(g.date));
  const b = unpack(g.cmWx!.c[v[0]] ?? 0).map((x) => (x << 24) >> 24);                            // signerede bytes (jge)
  const P = reg[s];
  const W = P.slice(1, 6), Pr = P.slice(6, 11), H = P.slice(11, 18);
  const wind = b[2] < W[0] ? 0 : b[2] < W[1] ? 1 : b[2] < W[2] ? 2 : b[2] < W[3] ? 3 : b[2] < W[4] ? 4 : 0;
  let precip = b[1] < Pr[0] ? 0 : b[1] < Pr[1] ? 1 : b[1] < Pr[2] ? 2 : b[1] < Pr[3] ? 3 : b[1] < Pr[4] ? 5 : 0;
  // 0x9231a2–0x923237: varmebåndet (sic: under H0 = bånd 1, under H1 = bånd 0), ellers 3
  const band = b[2] < H[0] ? 1 : b[2] < H[1] ? 0 : b[2] < H[2] ? 2 : b[2] < H[3] ? 3 : b[2] < H[4] ? 4 : b[2] < H[5] ? 5 : b[2] < H[6] ? 6 : 3;
  const temp = cmTemperature(band, doy, evening);
  const cw = b[3];
  if (temp < 0) {                                                                                  // 0x923248–0x9232ab: frost
    if (precip === 1) precip = 6;
    else if (precip === 2 || precip === 3) precip = cw === 0 ? 6 : cw === 1 ? 7 : 8;
    else if (precip === 5) precip = cw === 0 ? 8 : cw === 1 ? 7 : 9;
  }
  return [wind, precip, temp, cw];
}

let compIdx: (g: GameState, comp: string) => number = (_g, comp) => { const m = /^CM(\d+)$/.exec(comp); return m ? +m[1] : -1; };
/** turneringens id i originalen (gameInputs.ts CM_COMP_ID) – sat af kampmotorens indgange */
export function setCmWxCompId(fn: (g: GameState, comp: string) => number): void { compIdx = fn; }

/** 0x923970 Weather::get_pitch_condition(rekord, fixture): 0 Normal, 1 Muddy, 2 Damp, 4 Dry, 8 Water-logged, 0x10 Frozen, 0x20 Snowy, 0x40 Hard */
export function cmPitchCondition(g: GameState, f: Fixture, rec: CmWeatherRec): number {
  const v = venue(g, f);
  if (!v || v[3] !== 0) return 0;                                                                  // intet stadion / overdækket (+0x4c)
  const cap = v[2], heat = v[4] !== 0;
  // 0x923994–0x9239ae: (dag + udehold +0x10 + hjemmehold +0xc + turnering +0) % 20 – klubbernes indeks = databasens id
  const h = (doyOf(f.date) + f.away + f.home + compIdx(g, f.comp)) % 20;
  const [, p, T] = rec;
  const mild = T >= 1 && T < 29;
  if (p === 5 && mild) return heat ? (cap > 27500 ? 2 : 1) : (cap <= 17500 ? 8 : 1);
  if (p === 1 && mild) return heat ? (cap > 27500 ? (h >= 4 ? 0 : 2) : (h >= 6 ? 0 : 2)) : 2;
  if ((p === 2 || p === 3) && mild) return heat ? (cap > 27500 ? (h !== 0 ? 0 : 2) : (h >= 4 ? 0 : 2)) : (h >= 3 ? 0 : 2);
  if (p === 4 && mild) return heat ? (cap > 27500 ? (h >= 3 ? 0 : 2) : 2) : (cap > 17500 ? 2 : 1);
  if (T < 1 && (p === 1 || p === 8)) return heat ? 2 : cap > 45000 ? 2 : cap <= 12500 ? 0x10 : 1;
  if (p === 9) return heat ? (cap > 30000 ? 2 : 1) : (cap <= 20000 ? 0x20 : 1);
  if (p === 0 && T >= 29) return cap <= 35000 ? 0x40 : 4;
  return 0;
}

/** kampens vejr og bane: gemt ved kampstarten (Fixture.wx), ellers regnet af byernes tilstand nu (udsigten) */
export function cmFixtureWeather(g: GameState, f: Fixture): { rec: CmWeatherRec; pitch: number } {
  if (f.wx) return { rec: [f.wx[0], f.wx[1], f.wx[2], f.wx[3]], pitch: f.wx[4] };
  const rec = cmMatchWeather(g, f);
  return { rec, pitch: cmPitchCondition(g, f, rec) };
}

/** init_match 0x6b8042/0x6b8055: vejret og banen fastlægges ved kampstarten (på kampdagen) og gemmes på kampen */
export function cmWxFix(g: GameState, f: Fixture): void {
  if (!cmWxOn(g) || f.wx || f.date > g.date) return;
  const { rec, pitch } = cmFixtureWeather(g, f);
  f.wx = [...rec, pitch];
}

// ---------------------------------------------------------------- teksterne (0x9233a0 / 0x923b60)

const WIND_KEYS = ['', 'cmwx.w1', 'cmwx.w2', 'cmwx.w3', 'cmwx.w4'];
const PRECIP_KEYS = ['cmwx.p0', 'cmwx.p1', 'cmwx.p2', 'cmwx.p3', '', 'cmwx.p5', 'cmwx.p6', 'cmwx.p7', 'cmwx.p8', 'cmwx.p9'];
const PITCH_KEYS: Record<number, string> = { 0: 'pitch.normal', 1: 'pitch.muddy', 2: 'pitch.damp', 4: 'pitch.dry', 8: 'pitch.waterlogged', 0x10: 'pitch.frozen', 0x20: 'pitch.snowy', 0x40: 'pitch.hard' };

/** 0x9233a0 weather_format_description: "Breezy, Wet, 12°C" (vindstille: kun nedbør – tørt hedder "Dry" – og temperaturen) */
export function cmWeatherText(rec: CmWeatherRec, t: (k: string, p?: Record<string, string | number>) => string): string {
  const wind = WIND_KEYS[rec[0]] ? t(WIND_KEYS[rec[0]]) : '';
  const pk = PRECIP_KEYS[rec[1]] ?? '';
  const precip = rec[1] === 0 ? (wind ? '' : t('cmwx.p0')) : pk ? t(pk) : '';
  const temp = t('cmwx.temp', { n: rec[2] });
  return wind ? (precip ? `${wind}, ${precip}, ${temp}` : `${wind}, ${temp}`) : `${precip}, ${temp}`;
}

/** 0x923b60 pitch_condition_text */
export function cmPitchText(pitch: number, t: (k: string) => string): string { return t(PITCH_KEYS[pitch] ?? 'pitch.normal'); }
