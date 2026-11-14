// Import af den originale Championship Manager 01/02-database fra spillerens EGEN installation.
//
// Databasen er ophavsretligt beskyttet og følger derfor ikke med spillet: brugeren vælger sin
// "Data"-mappe fra den gratis udgave (2008), og filerne læses og konverteres lokalt i browseren.
// Filformatet (index.dat + faste poststørrelser) er beskrevet af fællesskabets værktøjer
// (TransferTool, CM0102Patcher); omregningen af "intrinsiske" evner følger CM0102Patcher.
import type { WorldData } from '../newgame';

export const CM_REQUIRED = ['index.dat', 'staff.dat', 'club.dat', 'nation.dat', 'club_comp.dat', 'first_names.dat', 'second_names.dat', 'common_names.dat'];

/** Spillerevner fra CM-databasen (overskriver de afledte evner ved spilstart) */
export interface CMRatings { ca: number; pa: number; attrs: number[]; pos: number[]; side: number[]; /** databasens rå PA, når `pa` er et skøn (negativ: -2/-1 = tilfældig, 0 = mangler, eller under CA) – originalens regler køres i newgame.ts (playerInit.ts) */ paRaw?: number;
  /** omdømme fra spillerposten (byte 9/11/13, 0-10000): hjemme, nuværende, verden – originalens værdi følger dem */
  rep?: [number, number, number];
  /** fødderne fra spillerposten (venstre, højre; 1-20) – bruges i originalens afbalancering (sub_538ec0) */
  feet?: [number, number];
  /** Free Role (spillerpost +0x1a, 1-20; udeladt = 1) – originalens udvælgelse 0x6e2f20 og positionsfaktoren læser den */
  fr?: number;
  /** staff +0x1e: anden nationalitet (indeks i world.nations; udeladt = ingen) – originalens EU-regel 0x53d740 og arbejdstilladelsens historik */
  n2?: number;
  /** staff +0x3e: datoen han kom til klubben (ISO; udeladt = mangler) – arbejdstilladelsens historik 0x8c6e60 og kontraktens dage i klubben */
  j?: string;
  /** sprogtabellens "dage" fra karrierehistorien (PlayerStats 0x7bfd50, 0x7c0b74–0x7c0c51 – cmLanguage.ts): [sprog, dage, …] for
   *  spillere med mindst én historikpost før 2001 (tom = posterne findes, men gav ingen dage); udeladt = ingen poster */
  lg?: number[] }

export interface CMWorld extends WorldData {
  kind: 'cm0102';
  /** 'stored' = egenskaberne står som i databasen (1-20); uden = ældre filer med de 18 allerede omregnet */
  attrScale?: 'stored';
  ratings: Record<number, CMRatings>;
  clubRep: Record<number, number>;
  /** databasens rå værdier, som originalens spilstart (sub_535a80) bruger til at udfylde manglende spilleromdømme: klubbens omdømme
   *  (club.dat +128, i16) og landets (nation.dat +0x8e, i16) pr. nationsindeks */
  cmRaw?: { clubRep: Record<number, number>; nationRep: number[];
    /** club.dat +100 status (1 professionel, 2 semiprofessionel, 3 amatør) og +119 (mindste tilskuertal) – computerens trupplan 0x83cb40/0x7bca90 */
    clubStat?: Record<number, [number, number] | [number, number, number, number]>;
    /** club_comp.dat +105 (turneringens omdømme, i hukommelsen +0x69) pr. turnerings-id (ligaen `CM<id>`, Europa 326/328/330) */
    compRep?: Record<number, number>;
    /** (runde 9) tilskuertallet sub_85cba0: club.dat +115/+119/+123 (gns./mindst/højst), stadionet +105 (id) med stadium.dat +56 (byen) og +60
     *  (kapaciteten, rå), rivalerne +179/+183/+187 (klub-id'er, −1 = ingen) */
    crowd?: Record<number, [number, number, number, number, number, number, number, number, number]>;
    /** city.dat (56 bytes pr. by, i fil-rækkefølge = hukommelsens [0xae23ac]): +0x23 og +0x2b (doubles) fladt [c23, c2b, c23, c2b, …] */
    cities?: number[];
    /** nation.dat +0x7e pr. nationsindeks (udeholdets land i afstandsleddet sub_85d8a0) */
    nation7e?: number[];
    /** nation.dat +0x85 (s8) pr. nationsindeks – staffStatens ungdomsled 0x5ce8f0 ((+0x85·0,2 + 0,6)·klubbens omdømme) */
    nation85?: number[];
    /** nation.dat +0x76 pr. nationsindeks (sprog-/regionsgruppen – lønnen 0x862720/0x864550: udlændinge fra en anden gruppe end klubbens land) */
    nation76?: number[];
    /** (forholdene, staff+0x65) personernes præferencer fra staff.dat +97..+144 (originaludgavens 157-bytes post): 12 id'er i hukommelsens
     *  rækkefølge – +4/+8/+0xc klubber (0x547d60), +0x10/+0x14/+0x18 klubber (0x547d30), +0x1c/+0x20/+0x24 personer (0x547810), +0x28/+0x2c/+0x30
     *  personer (0x547840); 0 = ingen (databasens −1). Kun personer i world-filen med mindst én præference. */
    prefs?: Record<number, number[]>;
    /** klubbens personer club.dat +155..+175 (= hukommelsens +0x9b/+0x9f/+0xa3 – 0x547790 – og +0xa7/+0xab/+0xaf – 0x5477d0); 0 = ingen */
    clubPrefs?: Record<number, number[]>;
    /** (økonomien) pr. klub: [division club.dat +87 (turnerings-id), PLC +130 (s8), stadionets +76/+77 (stadium.dat, s8)] */
    fin?: Record<number, [number, number, number, number]>;
    /** (økonomien) klubbens formand (club.dat +191): [CA (np +4), PA (+6), de 21 egenskaber +0x0e..+0x22 (rå), jobkoden (personpost +61),
     *  yndlingsformationen +0x43, nationen (indeks), personpost +0x57 og +0x59 (s8)] – spilstarten udfylder de manglende (cmStaffInit) */
    chair?: Record<number, number[]>;
    /** (økonomien) turnerings-id'et for "A Lower Division" (nøgle-id'et [0x9cf764]; −1 = findes ikke) */
    lowerDiv?: number
    /** viljen 0x844780: nation +0x71 (verdensdelens id) pr. nationsindeks, "Europe"s id ([0x9cfa10]) og byernes +0x33 (s8, city.dat-rækkefølge) */
    nationCont?: number[]; europe?: number; city33?: number[];
    /** bestyrelse/managerjob (cmBoard.ts): nation +0x75 (u8), +0x85 (s8), +0x88 (i32) pr. nationsindeks */
    nationBoard?: [number, number, number][];
    /** bestyrelse/managerjob: formanden (club.dat +0xbf → staff.dat): [ikke-spillerpost +0x16, +0x1d (Patience), personpost +0x57 (Ambition),
     *  nationsindeks (−1)] pr. klub – kun formænd med ikke-spillerpost */
    chairBoard?: Record<number, [number, number, number, number]> };
  clubColors: Record<number, [string, string]>;
  /** originalens økonomi ved start (£): saldo (club.dat 101), gns. tilskuere (115), træningsanlæg 0-20 (127) */
  clubFinance?: Record<number, [number, number, number]>;
  /** originalens værdiformel (sub_4d0c60): [klubfaktor cf, landets omdømme (nation +0x8E), managerens vurdering af
   *  talent (Judging Player Potential vist, 0 = ingen manager), managerens staff-id] pr. klub */
  valueClub?: Record<number, [number, number, number, number]>;
  /** dommere fra officials.dat: [fornavn, efternavn, nation, Discipline (byte 0x25, 0 = ikke vurderet), 0x27, omdømme] */
  officials?: [string, string, number, number, number, number][];
  /** stab fra databasen (ikke-spillerposten): [klub (0 = ledig), fornavn, efternavn, nation, fødselsdato, job (5 manager,
   *  6 assistent, 8 træner, 9 spejder, 10 fysioterapeut), egenskaber [Coaching, Judging Player Ability, Judging Player Potential,
   *  Physiotherapy, Motivating, Discipline, Tactical Knowledge] (0 = ikke sat), CA, omdømme (0-200), staff-id] */
  /** … [10] = managerens taktiske egenskaber (ikke-spillerposten): [Attacking +0x0e, Directness +0x13, Free Roles +0x15, Marking +0x1a,
   *  Offside +0x1c, Pressing +0x1f, Tactics +0x21, yndlingsformation +0x43 (1..9)] – originalens computer-taktik (aiPrematch/aiTacticChoice) */
  /** … [11] = ikke-spillerposten til originalens spilstart: [PA +6, de 21 egenskaber +0x0e..+0x22 (rå 1..20, 0 = ikke sat), jobkoden]
   *  (cmStaffInit.ts – kun den originale database) */
  /** … [12] = bestyrelse/managerjob (cmBoard.ts): [ikke-spillerpost +8, +0xc (rå), personpost +0x56..+0x5d, +0x22]; [13] = personpost +0x3e
   *  (ankomstdatoen, ISO; '' = mangler); [14] = personpost +0x24 (landsholdet, nations-id i filen; −1 = intet) og +0x28 (jobbet dér) – viljen 0x844780 */
  staff?: [number, string, string, number, string, number, number[], number, number, number, (number[] | null)?, number[]?, number[]?, string?, number[]?, (1 | number[])?, number[]?][];
  /** (kun den originale database, Staff Search) [15] = om originalen har personen i hukommelsen efter 0x524d70 (1 = altid, ellers de nationer, hvis
   *  valg beholder ham), [16] = [klub (databasens id), job +0x3d]. `staffX` = ikke-spillere uden for spillets stab (formænd, direktører, stab i
   *  klubber uden for spillet …) i samme format med [0] = 0 og [5] = jobbet; `clubNames` = [kort navn, nationsindeks] for deres klubber. */
  staffX?: NonNullable<CMWorld['staff']>;
  clubNames?: Record<number, [string, number]>;
  rules: Record<string, { rounds: number; relegated?: number; below?: string; promoted?: number; above?: string; cup?: string; wealth: number }>;
}

const dec = new TextDecoder('windows-1252');
/** Antal rækker pr. land der importeres (flere gør simulationen langsom) */
const DEFAULT_TIERS = 2;

class Reader {
  v: DataView;
  buf: ArrayBuffer;
  constructor(buf: ArrayBuffer) { this.buf = buf; this.v = new DataView(buf); }
  i32(o: number) { return this.v.getInt32(o, true); }
  i16(o: number) { return this.v.getInt16(o, true); }
  u8(o: number) { return this.v.getUint8(o); }
  i8(o: number) { return this.v.getInt8(o); }
  str(o: number, len: number) {
    const bytes = new Uint8Array(this.buf, o, len);
    const end = bytes.indexOf(0);
    return dec.decode(bytes.subarray(0, end < 0 ? len : end)).trim();
  }
  /** CM-dato: dag i året (0-baseret) + år */
  date(o: number): string | null {
    const day = this.i16(o), year = this.i16(o + 2);
    if (year <= 1900 || year > 2100) return null;
    const d = new Date(Date.UTC(year, 0, 1 + Math.max(0, day)));
    return d.toISOString().slice(0, 10);
  }
}

// Databasen gemmer ALLE egenskaber som 1-20 (0 = mangler); de 18 interne omregnes først ved nyt spil med originalens
// kæde (playerInit.ts shownFromStored: intern → sub_538ec0 → sub_538bc0 → sub_544380).

// Player-postens felter fra offset 15 (efter ID, trøjenummer, CA, PA og tre omdømmer)
const PF = ['Goalkeeper', 'Sweeper', 'Defender', 'DefensiveMidfielder', 'Midfielder', 'AttackingMidfielder', 'Attacker', 'WingBack',
  'RightSide', 'LeftSide', 'Central', 'FreeRole', 'Acceleration', 'Aggression', 'Agility', 'Anticipation', 'Balance', 'Bravery',
  'Consistency', 'Corners', 'Crossing', 'Decisions', 'Dirtiness', 'Dribbling', 'Finishing', 'Flair', 'FreeKicks', 'Handling', 'Heading',
  'ImportantMatches', 'InjuryProneness', 'Jumping', 'Leadership', 'LeftFoot', 'LongShots', 'Marking', 'Movement', 'NaturalFitness',
  'OneOnOnes', 'Pace', 'Passing', 'Penalties', 'Positioning', 'Reflexes', 'RightFoot', 'Stamina', 'Strength', 'Tackling', 'Teamwork',
  'Technique', 'ThrowIns', 'Versatility', 'Vision', 'WorkRate'] as const;
type PField = (typeof PF)[number];

// Vores ATTRS-rækkefølge → kilde (P = player-post, S = staff-post)
const MAP: [string, 'P' | 'S', string][] = [
  ['crossing', 'P', 'Crossing'], ['dribbling', 'P', 'Dribbling'], ['finishing', 'P', 'Finishing'], ['heading', 'P', 'Heading'],
  ['longShots', 'P', 'LongShots'], ['marking', 'P', 'Marking'], ['offTheBall', 'P', 'Movement'], ['passing', 'P', 'Passing'],
  ['penalties', 'P', 'Penalties'], ['tackling', 'P', 'Tackling'], ['freeKicks', 'P', 'FreeKicks'], ['corners', 'P', 'Corners'],
  ['technique', 'P', 'Technique'], ['throwIns', 'P', 'ThrowIns'],
  ['aggression', 'P', 'Aggression'], ['anticipation', 'P', 'Anticipation'], ['bravery', 'P', 'Bravery'], ['creativity', 'P', 'Vision'],
  ['decisions', 'P', 'Decisions'], ['determination', 'S', 'Determination'], ['flair', 'P', 'Flair'], ['influence', 'P', 'Leadership'],
  ['positioning', 'P', 'Positioning'], ['teamwork', 'P', 'Teamwork'], ['workRate', 'P', 'WorkRate'],
  ['acceleration', 'P', 'Acceleration'], ['agility', 'P', 'Agility'], ['balance', 'P', 'Balance'], ['jumping', 'P', 'Jumping'],
  ['naturalFitness', 'P', 'NaturalFitness'], ['pace', 'P', 'Pace'], ['stamina', 'P', 'Stamina'], ['strength', 'P', 'Strength'],
  ['handling', 'P', 'Handling'], ['oneOnOnes', 'P', 'OneOnOnes'], ['reflexes', 'P', 'Reflexes'],
  ['consistency', 'P', 'Consistency'], ['importantMatches', 'P', 'ImportantMatches'], ['injuryProneness', 'P', 'InjuryProneness'],
  ['dirtiness', 'P', 'Dirtiness'], ['versatility', 'P', 'Versatility'], ['adaptability', 'S', 'Adaptability'], ['ambition', 'S', 'Ambition'],
  ['loyalty', 'S', 'Loyalty'], ['pressure', 'S', 'Pressure'], ['professionalism', 'S', 'Professionalism'], ['sportsmanship', 'S', 'Sportsmanship'],
  ['temperament', 'S', 'Temperament'],
];
const STAFF_ATTR_OFS: Record<string, number> = { Adaptability: 86, Ambition: 87, Determination: 88, Loyalty: 89, Pressure: 90, Professionalism: 91, Sportsmanship: 92, Temperament: 93 };

interface IndexRec { name: string; fileId: number; count: number; offset: number }

function readIndex(buf: ArrayBuffer): IndexRec[] {
  const r = new Reader(buf);
  const out: IndexRec[] = [];
  for (let o = 8; o + 67 <= buf.byteLength; o += 67) out.push({ name: r.str(o, 51), fileId: r.i32(o + 51), count: r.i32(o + 55), offset: r.i32(o + 59) });
  return out;
}

function hashStr(s: string) { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; }

/** Konverter CM 01/02's Data-mappe til spillets verdensformat */
/** `maxTiers`: rækker pr. land. `allClubs`: alle klubber og spillere kommer med – klubber uden for de importerede
 *  ligaer får liga-id `CMX<division>` (uden liga-post); byggescriptet afgør, hvad der beholdes. */
export function parseCM0102(files: Record<string, ArrayBuffer>, opts: { maxTiers?: number; allClubs?: boolean; cmMem?: boolean } = {}): CMWorld {
  const MAX_TIERS = opts.maxTiers ?? DEFAULT_TIERS;
  const missing = CM_REQUIRED.filter((f) => !files[f]);
  if (missing.length) throw new Error(`missing:${missing.join(',')}`);
  const index = readIndex(files['index.dat']);
  // staff.dat rummer fire tabeller: personer, ikke-spillere, spillere og præferencer (i den rækkefølge)
  // Postens størrelse findes ud fra afstanden til næste tabel (originaludgaven: 157 bytes pr. person med
  // præferencerne indbygget; senere udgaver: 110 bytes + en separat præferencetabel)
  const staffTables = index.filter((x) => x.name.toLowerCase() === 'staff.dat' && x.count > 0).sort((a, b) => a.offset - b.offset);
  if (staffTables.length < 2) throw new Error('index');
  const sizes = staffTables.map((tb, i) => Math.round(((staffTables[i + 1]?.offset ?? files['staff.dat'].byteLength) - tb.offset) / tb.count));
  const tStaff = staffTables[0];
  const staffSize = sizes[0];
  const pi = sizes.findIndex((sz, i) => i > 0 && sz === 70);
  if (pi < 0) throw new Error('index');
  const tPlayer = staffTables[pi];
  const playerSize = 70;
  const S = new Reader(files['staff.dat']);
  // spillerdata findes via spillerpostens eget ID
  const playerAt = new Map<number, number>();
  for (let k = 0; k < tPlayer.count; k++) playerAt.set(S.i32(tPlayer.offset + k * playerSize), tPlayer.offset + k * playerSize);
  // Referencen til spillerdata ligger et sted i de sidste bytes (varierer med databaseversionen).
  // Faldgruber: (1) et nabofelt indeholder spillerens EGET id (id-feltet, ikke en peger), og
  // (2) et andet felt kan ramme mange poster, men kun få DISTINKTE (alle peger på samme default-post).
  // Det ægte peger-felt kendes på at det linker til flest FORSKELLIGE spiller-poster (tæt på 1-til-1),
  // uden at være en selvreference. Derfor scorer vi på antal distinkte poster, ikke på rå hits.
  const probe = Math.min(tStaff.count, 20000);
  const candidateOffsets = new Set<number>([97]);
  for (let off = staffSize - 24; off <= staffSize - 2; off++) if (off > 0) candidateOffsets.add(off);
  const scored = [...candidateOffsets].map((off) => {
    const seen = new Set<number>();
    for (let k = 0; k < probe; k++) {
      const o = tStaff.offset + k * staffSize;
      const ref = S.i32(o + off);
      if (ref === S.i32(o)) continue; // postens eget id-felt – ikke en spiller-reference
      const po = playerAt.get(ref);
      if (po !== undefined) seen.add(po);
    }
    return { off, distinct: seen.size };
  }).sort((a, b) => b.distinct - a.distinct);
  if (!scored[0] || scored[0].distinct < probe * 0.05) throw new Error('index');
  const PLAYER_REF = scored[0].off;
  // ikke-spillere (68 bytes: CA +4, Judging Player Potential +0x18) – referencen findes som spillerens (flest distinkte id'er)
  const tNon = staffTables.find((_, i) => i > 0 && sizes[i] === 68);
  const nonAt = new Map<number, number>();
  if (tNon) for (let k = 0; k < tNon.count; k++) nonAt.set(S.i32(tNon.offset + k * 68), tNon.offset + k * 68);
  let NON_REF = -1;
  if (tNon) {
    let bestN = 0;
    for (const off of candidateOffsets) {
      if (off === PLAYER_REF) continue;
      const seen = new Set<number>();
      for (let k = 0; k < probe; k++) { const o = tStaff.offset + k * staffSize; const v = S.i32(o + off); if (v !== S.i32(o) && nonAt.has(v)) seen.add(v); }
      if (seen.size > bestN) { bestN = seen.size; NON_REF = off; }
    }
    if (bestN < probe * 0.01) NON_REF = -1;
  }

  // navne
  const names = (file: string) => {
    const r = new Reader(files[file]);
    const out: string[] = [];
    for (let o = 0; o + 60 <= files[file].byteLength; o += 60) out[r.i32(o + 51)] = r.str(o, 51);
    return out;
  };
  const first = names('first_names.dat'), second = names('second_names.dat'), common = names('common_names.dat');

  // nationer
  const N = new Reader(files['nation.dat']);
  const nationIdx = new Map<number, number>();
  // lang: nation +0x77 (sproget, 8 = engelsk) og +0x78/+0x79 (andre sprog) – originalens sprogtabel 0x7bfd50/0x7c6930 (cmLanguage.ts)
  const nations: { name: string; code: string; lang: number[] }[] = [];
  const nationVal = new Map<number, [number, number, number]>(); // nation +0x7E (økonomisk niveau 1-3), +0x8E (omdømme, i16), +0x85 (s8 – staffState 0x5ce8f0)
  // bestyrelse/managerjob (cmBoard.ts): nation +0x75 (u8), +0x85 (s8), +0x88 (i32) pr. nationsindeks
  const nationBoard: [number, number, number][] = [];
  // viljen 0x844780: nation +0x71 (verdensdelen, continent.dat-id) og "Europe"s id
  const nationCont: number[] = [];
  const nation76: number[] = [];
  let europe = -1;
  if (files['continent.dat']) { const Co = new Reader(files['continent.dat']);                // 198 bytes pr. verdensdel: +0 id, +4 navnet
    for (let o = 0; o + 198 <= files['continent.dat'].byteLength; o += 198) if (Co.str(o + 4, 25) === 'Europe') europe = Co.i32(o); }
  for (let o = 0; o + 290 <= files['nation.dat'].byteLength; o += 290) {
    const id = N.i32(o);
    nationIdx.set(id, nations.length);
    nationVal.set(id, [N.u8(o + 0x7e), N.i16(o + 0x8e), N.i8(o + 0x85)]);
    nationBoard.push([N.u8(o + 0x75), (N.u8(o + 0x85) << 24) >> 24, N.i32(o + 0x88)]);
    nationCont.push(N.i32(o + 0x71));
    nation76.push(N.u8(o + 0x76));
    nations.push({ name: N.str(o + 4, 51), code: N.str(o + 83, 4) || N.str(o + 56, 3).toUpperCase(), lang: [N.u8(o + 0x77), N.u8(o + 0x78), N.u8(o + 0x79)] });
  }

  // turneringer (ligaer findes som de divisioner klubberne spiller i)
  const CC = new Reader(files['club_comp.dat']);
  const comps = new Map<number, { name: string; short: string; nation: number; rep: number }>();
  for (let o = 0; o + 107 <= files['club_comp.dat'].byteLength; o += 107) {
    comps.set(CC.i32(o), { name: CC.str(o + 4, 51), short: CC.str(o + 56, 26), nation: CC.i32(o + 93), rep: CC.i16(o + 105) });
  }

  // farver
  const colours = new Map<number, string>();
  if (files['colour.dat']) {
    const C = new Reader(files['colour.dat']);
    for (let o = 0; o + 58 <= files['colour.dat'].byteLength; o += 58) {
      const hex = (n: number) => n.toString(16).padStart(2, '0');
      colours.set(C.i32(o), `#${hex(C.u8(o + 55))}${hex(C.u8(o + 56))}${hex(C.u8(o + 57))}`);
    }
  }

  // stadioner (kapacitet)
  const seatsOf = new Map<number, number>();
  const stadiumName = new Map<number, string>();
  const stadiumRaw = new Map<number, [number, number]>();   // (runde 9) stadium.dat +56 byen, +60 kapaciteten (rå)
  const stadiumFlags = new Map<number, [number, number]>(); // (økonomien) stadium.dat +76/+77 (s8) – månedens stadionudgift 0x59c3d4
  if (files['stadium.dat']) {
    const St = new Reader(files['stadium.dat']);
    // post: id (4) · navn (51) · by (4) · 1 byte · kapacitet (4, byte 60) · siddepladser (4, byte 64) · …
    // (byte 59 gav et forkert tal for næsten alle stadioner, så alle endte på loftet 120.000)
    for (let o = 0; o + 78 <= files['stadium.dat'].byteLength; o += 78) {
      const cap = St.i32(o + 60);
      if (cap > 0 && cap <= 150_000) seatsOf.set(St.i32(o), cap);
      stadiumRaw.set(St.i32(o), [St.i32(o + 56), cap]);
      stadiumFlags.set(St.i32(o), [St.i8(o + 76), St.i8(o + 77)]);
      const nm = St.str(o + 4, 51).trim();
      if (nm) stadiumName.set(St.i32(o), nm);
    }
  }

  // (runde 9) byerne (city.dat): koordinaterne til tilskuertallets afstandsled
  let cities: number[] | null = null;
  if (files['city.dat']) {
    const Ci = new DataView(files['city.dat']);
    cities = [];
    for (let o = 0; o + 56 <= files['city.dat'].byteLength; o += 56) cities.push(Ci.getFloat64(o + 0x23, true), Ci.getFloat64(o + 0x2b, true));
  }
  // viljen 0x844780: byens +0x33 (s8) – klubbens grundled (stadion → by)
  const city33: number[] = [];
  if (files['city.dat']) { const Ci = new DataView(files['city.dat']); for (let o = 0; o + 56 <= files['city.dat'].byteLength; o += 56) city33.push(Ci.getInt8(o + 0x33)); }

  // klubber
  const CL = new Reader(files['club.dat']);
  type RawClub = { id: number; name: string; short: string; nation: number; division: number; lastDiv: number; lastPos: number; rep: number; status: number; stadium: number; maxAtt: number; fg: number; bg: number; balance: number; avgAtt: number; minAtt: number; training: number; manager: number; rivals: [number, number, number]; prefs: number[]; plc: number; chairman: number }
  const rawClubs: RawClub[] = [];
  for (let o = 0; o + 581 <= files['club.dat'].byteLength; o += 581) {
    rawClubs.push({
      id: CL.i32(o), name: CL.str(o + 4, 51), short: CL.str(o + 56, 26), nation: CL.i32(o + 83), division: CL.i32(o + 87),
      // sidste sæsons division (+0x5b) og placering (+0x5f) – Comp_Stats' +0x72 ved spilstart (klubbens stemning 0x5cd61d)
      lastDiv: CL.i32(o + 91), lastPos: CL.u8(o + 95),
      stadium: CL.i32(o + 105), maxAtt: CL.i32(o + 123), rep: CL.i16(o + 128), fg: CL.i32(o + 131), bg: CL.i32(o + 135),
      balance: CL.i32(o + 101), status: CL.u8(o + 100), avgAtt: CL.i32(o + 115), minAtt: CL.i32(o + 119), training: CL.u8(o + 127),
      // klubbens manager (staff-id; ejerens Bosman-projekt, db.rs: club.dat 207)
      manager: CL.i32(o + 207),
      rivals: [CL.i32(o + 179), CL.i32(o + 183), CL.i32(o + 187)],
      // (forholdene) klubbens yndlings- og uønskede personer +155/+159/+163 og +167/+171/+175 (staff-id'er, −1 = ingen) = hukommelsens +0x9b..+0xaf
      prefs: [155, 159, 163, 167, 171, 175].map((k) => CL.i32(o + k)),
      // (økonomien) PLC +130 og formanden +191 (staff-id)
      plc: CL.i8(o + 130), chairman: CL.i32(o + 191),
    });
  }
  // ligaer: divisioner med mindst 8 klubber; niveau efter omdømme inden for landet
  const divClubs = new Map<number, RawClub[]>();
  for (const c of rawClubs) if (comps.has(c.division) && nationIdx.has(c.nation)) divClubs.set(c.division, [...(divClubs.get(c.division) ?? []), c]);
  // rigtige ligaer: 8-30 klubber i et land (store samlepuljer for amatørklubber springes over)
  const allLeagues = [...divClubs.entries()].filter(([id, cs]) => cs.length >= 8 && cs.length <= 30 && nationIdx.has(comps.get(id)!.nation)).map(([id]) => id);
  const nationLeagues = new Map<number, number[]>();
  for (const id of allLeagues) { const n = comps.get(id)!.nation; nationLeagues.set(n, [...(nationLeagues.get(n) ?? []), id]); }
  const leagueComps = [...nationLeagues.values()].flatMap((ids) => ids.sort((a, b) => comps.get(b)!.rep - comps.get(a)!.rep || divClubs.get(b)!.length - divClubs.get(a)!.length).slice(0, MAX_TIERS));
  const byNation = new Map<number, number[]>();
  for (const id of leagueComps) {
    const n = comps.get(id)!.nation;
    byNation.set(n, [...(byNation.get(n) ?? []), id]);
  }
  const leagues: WorldData['leagues'] = [];
  const rules: CMWorld['rules'] = {};
  const lid = (compId: number) => `CM${compId}`;
  const maxCompRep = Math.max(1, ...leagueComps.map((id) => comps.get(id)!.rep));
  for (const [nation, ids] of byNation) {
    if (!nationIdx.has(nation)) continue;
    const sorted = ids.sort((a, b) => comps.get(b)!.rep - comps.get(a)!.rep || divClubs.get(b)!.length - divClubs.get(a)!.length);
    // pokalturnering: landets mest prestigefyldte nationale turnering der ikke er en liga
    const cup = [...comps.entries()].filter(([id, c]) => c.nation === nation && !leagueComps.includes(id) && /cup|pokal|copa|coppa|coupe|pokaal|taça|beker/i.test(c.name)).sort((a, b) => b[1].rep - a[1].rep)[0];
    sorted.forEach((id, i) => {
      const c = comps.get(id)!;
      const tier = i + 1;
      leagues.push({ id: lid(id), name: c.name, nation: nationIdx.get(nation)!, tier });
      const wealth = Math.max(0.25, Math.min(2, (c.rep / maxCompRep) * 2.1)) * (tier === 1 ? 1 : 0.6);
      const n = divClubs.get(id)!.length;
      rules[lid(id)] = {
        rounds: n > 24 ? 1 : n <= 10 ? 4 : 2,
        wealth: Math.round(wealth * 100) / 100,
        ...(i + 1 < sorted.length ? { relegated: 3, below: lid(sorted[i + 1]) } : {}),
        ...(i > 0 ? { promoted: 3, above: lid(sorted[i - 1]) } : {}),
        ...(tier === 1 && cup ? { cup: cup[1].name } : {}),
      };
    });
  }
  const leagueSet = new Set(leagueComps);
  const maxClubRep = Math.max(1, ...rawClubs.map((c) => c.rep));
  const clubs: WorldData['clubs'] = [];
  const clubRep: Record<number, number> = {};
  const clubColors: Record<number, [string, string]> = {};
  const clubFinance: Record<number, [number, number, number]> = {};
  const valueClub: Record<number, [number, number, number, number]> = {};
  for (const c of rawClubs) {
    if (!leagueSet.has(c.division) && !(opts.allClubs && nationIdx.has(c.nation))) continue;
    const seats = seatsOf.get(c.stadium) || (c.maxAtt > 0 && c.maxAtt <= 150_000 ? c.maxAtt : 0);
    clubs.push([c.id, c.name, c.short || c.name, nationIdx.get(c.nation)!, leagueSet.has(c.division) ? lid(c.division) : `CMX${c.division}`, stadiumName.get(c.stadium) ?? '', Math.min(120_000, seats), '']);
    clubRep[c.id] = Math.max(3, Math.min(98, Math.round(Math.pow(c.rep / maxClubRep, 0.7) * 98)));
    const fg = colours.get(c.fg), bg = colours.get(c.bg);
    if (fg && bg) clubColors[c.id] = [bg, fg];
    clubFinance[c.id] = [c.balance, Math.max(0, c.avgAtt), Math.min(20, c.training)];
    // sub_4d0c60 0x4d110d..0x4d128a: cf = (25·divisionens omdømme² + klubbens omdømme) / (f·1000), f = (niveau+1)/2,
    // ×2 semiprofessionel, ×7,5 amatør. Klub uden division: nation +0x85 – ikke porteret (0x4d11xx, *ukendt*), bruger 1
    const nv = nationVal.get(c.nation);
    let f = ((nv && nv[0] >= 1 && nv[0] <= 3 ? nv[0] : 3) + 1) * 0.5;
    if (c.status === 2) f *= 2; else if (c.status === 3) f *= 7.5;
    const x = comps.get(c.division)?.rep ?? 1;
    valueClub[c.id] = [nv ? (25 * x * x + c.rep) / (f * 1000) : 0, nv?.[1] ?? 0, 0, c.manager];
  }
  const inGame = new Set(clubs.map((c) => c[0]));
  for (const id of Object.keys(valueClub)) if (!inGame.has(+id)) delete valueClub[+id];
  // managerne (club.dat 207 → staff.dat): navnet i clubs[7], så spillet bruger databasens rigtige managere
  {
    const want = new Map(rawClubs.filter((c) => inGame.has(c.id) && c.manager > 0).map((c) => [c.manager, c.id]));
    const coach = new Map<number, string>();
    for (let i = 0; i < tStaff.count && coach.size < want.size; i++) {
      const o = tStaff.offset + i * staffSize;
      if (o + staffSize > files['staff.dat'].byteLength) break;
      const club = want.get(S.i32(o));
      if (club === undefined) continue;
      // managerens Judging Player Potential (ikke-spiller +0x18) vist via sub_544410: display(CA + 2·trunc(clamp(10v−CA, ±200)/2))
      const np = NON_REF >= 0 ? nonAt.get(S.i32(o + NON_REF)) : undefined;
      if (np !== undefined && valueClub[club]) {
        const nca = S.i16(np + 4), jp = S.u8(np + 0x18);
        const t = (nca + 2 * Math.trunc(Math.max(-200, Math.min(200, 10 * jp - nca)) / 2)) * 0.05 + 10;
        valueClub[club][2] = Math.max(1, Math.min(20, Math.trunc((t * t * 0.1 + t) / 3 + 0.5)));
      }
      const cn = S.i32(o + 12) >= 0 ? common[S.i32(o + 12)] ?? '' : '';
      // "fornavn|efternavn|nation" (newgame deler ved |), så "Sir Alex" + "Ferguson" ikke bliver "Sir" + "Alex Ferguson"
      const nm = cn ? `|${cn}` : `${first[S.i32(o + 4)] ?? ''}|${second[S.i32(o + 8)] ?? ''}`;
      // tredje felt: managerens nationalitet (staff.dat 26 → nationens nummer i world.nations)
      const nat = nationIdx.get(S.i32(o + 26));
      if (nm.replace('|', '').trim()) coach.set(club, nat === undefined ? nm : `${nm}|${nat}`);
    }
    for (const c of clubs) c[7] = coach.get(c[0]) ?? '';
  }
  // formændene (club.dat +0xbf): bestyrelsens Patience m.m. (cmBoard.ts)
  const chairBoard: Record<number, [number, number, number, number]> = {};
  if (NON_REF >= 0) {
    const want = new Map(rawClubs.filter((c) => inGame.has(c.id) && c.chairman > 0).map((c) => [c.chairman, c.id]));
    for (let i = 0; i < tStaff.count && Object.keys(chairBoard).length < want.size; i++) {
      const o = tStaff.offset + i * staffSize;
      if (o + staffSize > files['staff.dat'].byteLength) break;
      const club = want.get(S.i32(o));
      if (club === undefined) continue;
      const np = nonAt.get(S.i32(o + NON_REF));
      if (np === undefined) continue;
      chairBoard[club] = [(S.u8(np + 0x16) << 24) >> 24, (S.u8(np + 0x1d) << 24) >> 24, (S.u8(o + 0x57) << 24) >> 24, nationIdx.get(S.i32(o + 26)) ?? -1];
    }
  }

  // stab (ikke-spillerposten, 68 bytes): 21 egenskaber i alfabetisk rækkefølge fra +14 (bekræftet i originalens Non-Playing Staff);
  // jobkoden i personposten +61 (5 Manager, 6 Assistant Manager, 8 Coach, 9 Scout, 10 Physio – bekræftet for Man Utd 3.9.60)
  const staff: NonNullable<CMWorld['staff']> = [];
  const staffX: NonNullable<CMWorld['staff']> = [];
  const mem = opts.cmMem && NON_REF >= 0 ? trimMemory() : null;
  /** 0x524d70 database_trim_staff_tables med databasestørrelsen "Maximum" (game.cfg +4 & 7 = 4; ejerens indstilling): hvem originalen beholder
   *  i hukommelsen ved et nyt spil. Uafhængigt af de valgte lande (1 = altid): de 10 bedste ikke-spillere (+4) og 100 bedste spillere (+5) pr.
   *  nationalitet (antal = clamp(nation +0x8e, 5, 15)·10/15 og ·100/15, 0x524ff5–0x525288), Collin Samuel/Devon Mitchell (0x525394), landstræner
   *  (+0x24 og +0x28 = 5/12), klubomdømme ≥ 7500, landskampe > 0, ikke-spillerpost CA ≥ 150, PA ≥ 150/−1/−2, +8 ≥ 160, +0xa ≥ 155, +0xc ≥ 150,
   *  spillerpost +5/+7/+9/+0xb/+0xd tilsvarende og rand(30) = 0 for resten (0x5259a5 – *estimeret* som en fast hash pr. person). Ellers: de
   *  nationer (world-indeks), hvis valg beholder ham – nationalitet +0x1a, anden nationalitet +0x1e og klubbens land (+0x39 → +0x53). */
  function trimMemory() {
    const clubOf = new Map(rawClubs.map((c) => [c.id, c]));
    const top = new Map<number, { ids: number[]; v: number[]; min: number; cap: number }>();
    const topP = new Map<number, { ids: number[]; v: number[]; min: number; cap: number }>();
    const add = (t: Map<number, { ids: number[]; v: number[]; min: number; cap: number }>, nat: number, mul: number, id: number, v: number) => {
      let e = t.get(nat);
      if (!e) { const r = nationVal.get(nat)?.[1] ?? 0; e = { ids: [], v: [], min: 0, cap: Math.trunc((Math.max(5, Math.min(15, r)) * mul) / 15) }; t.set(nat, e); }
      if (e.ids.length < e.cap) {
        if (e.ids.length === 0 || v < e.v[e.min]) e.min = e.ids.length;
        e.ids.push(id); e.v.push(v);
      } else if (v > e.v[e.min]) {
        e.ids[e.min] = id; e.v[e.min] = v;
        for (let k = 0; k < e.ids.length; k++) if (k === 0 || e.v[k] < e.v[e.min]) e.min = k;
      }
    };
    for (let i = 0; i < tStaff.count; i++) {
      const o = tStaff.offset + i * staffSize;
      if (o + staffSize > files['staff.dat'].byteLength) break;
      const np = nonAt.get(S.i32(o + NON_REF)), pl = playerAt.get(S.i32(o + PLAYER_REF));
      if (np !== undefined) add(top, S.i32(o + 26), 10, S.i32(o), S.i16(np + 4));
      if (pl !== undefined) add(topP, S.i32(o + 26), 100, S.i32(o), S.i16(pl + 5));
    }
    const keep = new Set<number>();
    for (const t of [top, topP]) for (const e of t.values()) for (const id of e.ids) keep.add(id);
    return (o: number, np: number): 1 | number[] => {
      const id = S.i32(o), pl = playerAt.get(S.i32(o + PLAYER_REF));
      const fn = first[S.i32(o + 4)] ?? '', sn = second[S.i32(o + 8)] ?? '';
      const club = clubOf.get(S.i32(o + 57));
      const big = (b: number, k: number, a: number, c: number, d: number, e: number) => S.i16(b + k) >= 150 || S.i16(b + k + 2) >= 150 || [-1, -2].includes(S.i16(b + k + 2))
        || S.i16(b + a) >= 160 || S.i16(b + c) >= 155 || S.i16(b + d) >= e;
      if (keep.has(id) || (fn === 'Collin' && sn === 'Samuel') || (fn === 'Devon' && sn === 'Mitchell')
        || (S.i32(o + 0x24) >= 0 && [5, 12].includes(S.u8(o + 0x28))) || (club && club.rep >= 7500) || S.u8(o + 0x22) > 0
        || big(np, 4, 8, 0xa, 0xc, 150) || (pl !== undefined && big(pl, 5, 9, 0xb, 0xd, 150)) || hashStr(`trim${id}`) % 30 === 0) return 1;
      const out: number[] = [];
      for (const n of [S.i32(o + 26), S.i32(o + 30), club?.nation ?? -1]) { const x = nationIdx.get(n); if (x !== undefined && !out.includes(x)) out.push(x); }
      return out;
    };
  }
  if (NON_REF >= 0) {
    // Coaching +16, Discipline +20, Judging Ability +23, Judging Potential +24, Motivating +27, Physiotherapy +30, Tactics +33
    const OFS = [16, 23, 24, 30, 27, 20, 33];
    for (let i = 0; i < tStaff.count; i++) {
      const o = tStaff.offset + i * staffSize;
      if (o + staffSize > files['staff.dat'].byteLength) break;
      const np = nonAt.get(S.i32(o + NON_REF));
      if (np === undefined) continue;
      const club = S.i32(o + 57), job = S.u8(o + 61);
      const ca = S.i16(np + 4);
      const att = OFS.map((k) => { const v = S.u8(np + k); return v >= 1 && v <= 20 ? v : 0; });
      const here = inGame.has(club);
      // kernen (spillets stab): de gamle regler; resten (opts.cmMem) kommer i staffX, når originalen kan have dem i hukommelsen
      const core = att.some(Boolean) && (here ? [5, 6, 8, 9, 10].includes(job) : ca >= 100);
      if (!core && !mem) continue;
      const nation = nationIdx.get(S.i32(o + 26));
      if (nation === undefined) continue;
      const cn = S.i32(o + 12) >= 0 ? common[S.i32(o + 12)] ?? '' : '';
      const fn = cn ? '' : first[S.i32(o + 4)] ?? '', ln = cn || second[S.i32(o + 8)] || '';
      if (!ln) continue;
      let dob = S.date(o + 16);
      if (!dob) { const yob = S.i16(o + 24); dob = yob > 1900 && yob < 2100 ? `${yob}-01-01` : ''; }
      const tac = [0x0e, 0x13, 0x15, 0x1a, 0x1c, 0x1f, 0x21, 0x43].map((k) => S.u8(np + k));
      // [11] = hele ikke-spillerposten til originalens spilstart (cmStaffInit.ts, sub_535a80 0x537d59–0x5388cf + 0x538a70): PA +6,
      // de 21 egenskaber +0x0e..+0x22 (rå, 0 = ikke sat) og databasens jobkode (personpost +61, også for ledige)
      const raw = [S.i16(np + 6)];
      for (let k = 0x0e; k <= 0x22; k++) raw.push(S.u8(np + k));
      raw.push(job);
      // [12] = bestyrelse/managerjob (cmBoard.ts): ikke-spillerpostens omdømmer +8 (hjemme) og +0xc (verden) (rå, ×50 ved spilstart – +0xa er
      // [8]), personpostens skjulte egenskaber +0x56..+0x5d og +0x22 (landskampe)
      const bx = [S.i16(np + 8), S.i16(np + 12)];
      for (let k = 0x56; k <= 0x5d; k++) bx.push(S.u8(o + k));
      bx.push(S.u8(o + 0x22));
      const row: NonNullable<CMWorld['staff']>[number] = [core && here ? club : 0, fn, ln, nation, dob, core ? (here ? job : 0) : job, att, ca, S.i16(np + 10), S.i32(o), tac, raw, bx, S.date(o + 62) ?? '', [S.i32(o + 0x24), S.u8(o + 0x28)]];
      // [15] = hukommelsen (0x524d70), [16] = [klubben +0x39 (databasens id, −1 = ingen), jobbet +0x3d] – kun til Staff Search
      if (mem) row.push(mem(o, np), [club, job]);
      (core ? staff : staffX).push(row);
    }
  }

  // sprogtabellens dage af karrierehistorien (PlayerStats::PlayerStats 0x7bfd50 0x7c0748–0x7c0c7f, kørt på databasens 1/1-2001): for hver
  // historikpost (staff_history.dat 17 bytes: +4 person, +8 sæsonens år, +10 klub, +15 kampe) før 2001 i en klub i et andet land (end
  // personens to nationaliteter) med sproget L (nation +0x77, 1..64): dage[L] += 2·(3·(kampe + 30) + år − 2001) (16 bit); er klubben den
  // nuværende: dage[L] = ftol(max(0,7·(365·(2001 − år ind) − dag ind), dage[L])). Resten (tærsklen af Adaptability, den nuværende klub
  // til startdatoen) i newgame.ts (cmLanguage.ts initialLanguages).
  const histLang = new Map<number, number[]>();
  if (files['staff_history.dat']) {
    const H = new DataView(files['staff_history.dat']);
    const natLang = new Map<number, number>();
    for (let o = 0; o + 290 <= files['nation.dat'].byteLength; o += 290) natLang.set(N.i32(o), N.u8(o + 0x77));
    const clubNat = new Map<number, number>(rawClubs.map((c) => [c.id, c.nation]));
    const who = new Map<number, number>();                                         // staff-id → postens offset i staff.dat
    for (let i = 0; i < tStaff.count; i++) { const o = tStaff.offset + i * staffSize; if (o + staffSize > files['staff.dat'].byteLength) break; who.set(S.i32(o), o); }
    const w16 = (v: number) => (v << 16) >> 16;
    // posterne pr. person i årsrækkefølge (filen er ikke grupperet; i hukommelsen er tabellen sorteret pr. person – *antaget*: efter år,
    // inden for et år i filens rækkefølge)
    const rows = new Map<number, [number, number, number][]>();
    for (let o = 0; o + 17 <= files['staff_history.dat'].byteLength; o += 17) {
      const pid = H.getInt32(o + 4, true), year = H.getInt16(o + 8, true);
      if (!who.has(pid) || year < 1900 || year >= 2001) continue;
      (rows.get(pid) ?? rows.set(pid, []).get(pid)!).push([year, H.getInt32(o + 10, true), H.getUint8(o + 15)]);
    }
    for (const [pid, list] of rows) {
      list.sort((a, b) => a[0] - b[0]);
      const so = who.get(pid)!;
      const days = new Int16Array(65);
      for (const [year, club, apps] of list) {
        const cn = clubNat.get(club);
        if (club <= 0 || cn === undefined || cn === S.i32(so + 26) || cn === S.i32(so + 30)) continue;
        const L = natLang.get(cn) ?? 0;
        if (L < 1 || L > 64) continue;
        days[L] = w16(days[L] + w16(2 * w16(3 * (apps + 30) - 2001 + year)));
        if (S.i32(so + 57) === club) {
          const D = 365 * (2001 - (S.i16(so + 64) & 0xffff)) - S.i16(so + 62);
          days[L] = Math.trunc(Math.max(0.7 * D, days[L]));
        }
      }
      const out: number[] = [];
      for (let L = 1; L <= 64; L++) if (days[L]) out.push(L, days[L]);
      histLang.set(pid, out);
    }
  }

  // spillere
  const fields = ['id', 'first', 'last', 'dob', 'nation', 'club', 'pos', 'foot', 'height', 'value', 'maxValue', 'caps', 'intGoals', 'contract', 'apps', 'minutes', 'goals', 'assists', 'yellows', 'reds', 'number', 'wage'];
  const players: WorldData['players'] = [];
  const ratings: Record<number, CMRatings> = {};
  const pName = names; void pName;
  for (let i = 0; i < tStaff.count; i++) {
    const o = tStaff.offset + i * staffSize;
    if (o + staffSize > files['staff.dat'].byteLength) break;
    const pRef = S.i32(o + PLAYER_REF);
    const po = playerAt.get(pRef);
    if (pRef < 0 || po === undefined) continue;
    const id = S.i32(o);
    // nogle spillere (fx Cherno Samba i 3.9.60) har kun fødselsåret (byte 24) – datoens år står som 1900
    let dob = S.date(o + 16);
    if (!dob) { const yob = S.i16(o + 24); if (yob > 1900 && yob < 2100) dob = new Date(Date.UTC(yob, 0, 1 + Math.max(0, S.i16(o + 16)))).toISOString().slice(0, 10); }
    const nation = nationIdx.get(S.i32(o + 26));
    if (!dob || nation === undefined) continue;
    let club = S.i32(o + 57);
    if (!inGame.has(club)) club = 0;
    const get = (f: PField) => S.i8(po + 15 + PF.indexOf(f));
    const ca = Math.max(1, S.i16(po + 5));
    // spillere uden for de importerede ligaer kommer kun med som fri agenter, hvis de er gode nok
    if (!club && ca < 120) continue;
    let pa = S.i16(po + 7);
    const rawPa = pa;
    const age = 2001 - Number(dob.slice(0, 4));
    // negativ PA = tilfældig potentiale i originalen: et deterministisk skøn ud fra alder
    if (pa <= 0 || pa < ca) pa = Math.min(200, ca + Math.round(((hashStr(String(id)) % 1000) / 1000) * Math.max(5, (24 - age) * 6)));
    // databasens egen PA, når den ikke er brugbar som den står (negativ, 0 eller under CA) – newgame.ts kører originalens regler
    const paRaw = pa !== rawPa ? rawPa : undefined;
    // 0 betyder "ikke sat" i originaldatabasen (spillet finder selv på en værdi) – markeres med 0,
    // så spillet ved start bruger en rolleprofil ud fra position og CA i stedet
    const attrs = MAP.map(([, src, f]) => {
      if (src === 'S') { const v = S.i8(o + STAFF_ATTR_OFS[f]); return v > 0 ? Math.min(20, v) : 0; }
      const raw = get(f as PField);
      // uden for 1-20 = mangler (originalen udfylder dem ved spilstart)
      if (raw < 1 || raw > 20) return 0;
      // alle egenskaber gemmes som i databasen (1-20); de 18 interne regnes om ved nyt spil (playerInit.ts
      // shownFromStored – originalens kæde med afbalanceringen sub_538ec0/sub_538bc0)
      return raw;
    });
    const pos = ['Goalkeeper', 'Sweeper', 'Defender', 'DefensiveMidfielder', 'Midfielder', 'AttackingMidfielder', 'Attacker', 'WingBack'].map((f) => Math.max(1, Math.min(20, get(f as PField))));
    const side = [get('LeftSide'), get('Central'), get('RightSide')].map((v) => Math.max(1, Math.min(20, v)));
    const lf = get('LeftFoot'), rf = get('RightFoot');
    const foot = lf >= 15 && rf >= 15 ? 'B' : lf > rf ? 'L' : 'R';
    const firstName = first[S.i32(o + 4)] ?? '', lastName = second[S.i32(o + 8)] ?? '', commonName = S.i32(o + 12) >= 0 ? common[S.i32(o + 12)] ?? '' : '';
    const contract = S.date(o + 70);
    // 2001-værdier i pund → euro i nutidens prisniveau (×1,6 for valuta, ×2 for fodboldinflation)
    const value = Math.max(0, S.i32(o + 82)) * 3.2;
    players.push([
      id, commonName ? '' : firstName, commonName || lastName || firstName, dob, nation, club, subPos(pos, side), foot, 0,
      Math.round(value), Math.round(value), S.u8(o + 34), S.u8(o + 35), contract ? (opts.cmMem ? contract : `${contract.slice(0, 4)}-06-30`) : '', 0, 0, 0, 0, 0, 0,
      // trøjenummeret (byte 4 i spillerposten, 0 = intet)
      Math.max(0, Math.min(99, S.i8(po + 4))),
      // ugentlig løn i pund (staff.dat 78)
      Math.max(0, S.i32(o + 78)),
    ]);
    const rep: [number, number, number] = [S.i16(po + 9), S.i16(po + 11), S.i16(po + 13)];
    const feet: [number, number] = [Math.max(0, Math.min(20, lf)), Math.max(0, Math.min(20, rf))];
    const fr = Math.max(1, Math.min(20, get('FreeRole')));
    const n2 = nationIdx.get(S.i32(o + 30)), joined = S.date(o + 62);
    ratings[id] = { ca, pa, attrs, pos, side, ...(paRaw !== undefined ? { paRaw } : {}), rep, feet, ...(fr !== 1 ? { fr } : {}),
      ...(n2 !== undefined && n2 !== nation ? { n2 } : {}), ...(joined ? { j: joined } : {}), ...(histLang.has(id) ? { lg: histLang.get(id) } : {}) };
  }

  // dommere (officials.dat, 43 bytes pr. post): navne-id 4/8, nation 22 (16 bit), omdømme 26, Discipline 0x25, 0x27
  const officials: NonNullable<CMWorld['officials']> = [];
  if (files['officials.dat']) {
    const O = new DataView(files['officials.dat']);
    for (let o = 0; o + 43 <= files['officials.dat'].byteLength; o += 43) {
      const nat = nationIdx.get(O.getInt16(o + 22, true));
      const last = second[O.getInt32(o + 8, true)] ?? '';
      if (nat === undefined || !last) continue;
      officials.push([first[O.getInt32(o + 4, true)] ?? '', last, nat, O.getUint8(o + 0x25), O.getUint8(o + 0x27), O.getInt32(o + 26, true)]);
    }
  }

  // navnepuljer til regens (pr. nation)
  const pool: Record<string, [string[], string[]]> = {};
  const fi = fields.indexOf('first'), la = fields.indexOf('last'), na = fields.indexOf('nation');
  const counts = new Map<number, [Map<string, number>, Map<string, number>]>();
  for (const r of players) {
    const n = r[na] as number;
    if (!counts.has(n)) counts.set(n, [new Map(), new Map()]);
    const [fc, lc] = counts.get(n)!;
    if (r[fi]) fc.set(r[fi] as string, (fc.get(r[fi] as string) ?? 0) + 1);
    lc.set(r[la] as string, (lc.get(r[la] as string) ?? 0) + 1);
  }
  for (const [n, [fc, lc]] of counts) {
    if (lc.size < 15) continue;
    const top = (m: Map<string, number>, k: number) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, k).map(([s]) => s);
    pool[String(n)] = [top(fc, 250), top(lc, 400)];
  }

  // (forholdene) præferencerne +97..+144 for de personer, der kommer med (spillere og stab) – kun den originale udgaves 157-bytes post
  // (senere udgaver og fællesskabets rettelser: 110 bytes + en præferencetabel à 52 bytes (+0 id, +4..+51 de 12) – referencen findes som spillerens)
  const prefs: Record<number, number[]> = {};
  const tPref = staffTables.find((_, i) => i > 0 && sizes[i] === 52);
  const prefAt = new Map<number, number>();
  if (tPref) for (let k = 0; k < tPref.count; k++) prefAt.set(S.i32(tPref.offset + k * 52), tPref.offset + k * 52 + 4);
  let PREF_REF = -1;
  if (staffSize < 145 && tPref) {
    let bestP = 0;
    for (const off of candidateOffsets) {
      if (off === PLAYER_REF || off === NON_REF) continue;
      const seen = new Set<number>();
      for (let k = 0; k < probe; k++) { const v = S.i32(tStaff.offset + k * staffSize + off); if (prefAt.has(v)) seen.add(v); }   // (præferencepostens id = personens)
      if (seen.size > bestP) { bestP = seen.size; PREF_REF = off; }
    }
    if (bestP < probe * 0.05) PREF_REF = -1;
  }
  if (staffSize >= 145 || PREF_REF >= 0) {
    const keep = new Set<number>([...players.map((p) => p[0] as number), ...staff.map((x) => x[9])]);
    for (let i = 0; i < tStaff.count; i++) {
      const o = tStaff.offset + i * staffSize;
      if (o + staffSize > files['staff.dat'].byteLength) break;
      const id = S.i32(o);
      if (!keep.has(id)) continue;
      const at = staffSize >= 145 ? o + 97 : prefAt.get(S.i32(o + PREF_REF));
      if (at === undefined) continue;
      const v = Array.from({ length: 12 }, (_, k) => { const x = S.i32(at + 4 * k); return x > 0 ? x : 0; });
      if (v.some(Boolean)) prefs[id] = v;
    }
  }
  const clubPrefs = Object.fromEntries(rawClubs.filter((c) => clubRep[c.id] !== undefined && c.prefs.some((x) => x > 0)).map((c) => [c.id, c.prefs.map((x) => (x > 0 ? x : 0))]));
  // (økonomien, cmFinance.ts) formanden: personpost +0x57/+0x59 og ikke-spillerposten +0x0f (Business) / +0x20
  const chairOf = new Map<number, number[]>();
  {
    const want = new Set(rawClubs.filter((c) => inGame.has(c.id) && c.chairman > 0).map((c) => c.chairman));
    for (let i = 0; i < tStaff.count && want.size; i++) {
      const o = tStaff.offset + i * staffSize;
      if (o + staffSize > files['staff.dat'].byteLength) break;
      const sid = S.i32(o);
      if (!want.has(sid)) continue;
      want.delete(sid);
      const np = NON_REF >= 0 ? nonAt.get(S.i32(o + NON_REF)) : undefined;
      if (np === undefined) continue;
      const raw = [S.i16(np + 4), S.i16(np + 6)];
      for (let k = 0x0e; k <= 0x22; k++) raw.push(S.u8(np + k));
      raw.push(S.u8(o + 61), S.u8(np + 0x43), nationIdx.get(S.i32(o + 26)) ?? -1, S.i8(o + 0x57), S.i8(o + 0x59));
      chairOf.set(sid, raw);
    }
  }
  const lowerDiv = [...comps.entries()].find(([, c]) => c.name === 'A Lower Division')?.[0] ?? -1;
  const finClubs = rawClubs.filter((c) => clubRep[c.id] !== undefined && inGame.has(c.id));
  const fin = Object.fromEntries(finClubs.map((c) => {
    const sf = stadiumFlags.get(c.stadium) ?? [0, 0];
    return [c.id, [c.division, c.plc, sf[0], sf[1]]];
  })) as Record<number, [number, number, number, number]>;
  const chair = Object.fromEntries(finClubs.filter((c) => chairOf.has(c.chairman)).map((c) => [c.id, chairOf.get(c.chairman)!])) as Record<number, number[]>;

  return {
    kind: 'cm0102', version: 1, attrScale: 'stored', source: 'Championship Manager 01/02 (brugerens egen installation)', season: 2001,
    nations, leagues, clubs, playerFields: fields, players, names: pool, ratings, clubRep, clubColors, clubFinance, valueClub,
    cmRaw: { clubRep: Object.fromEntries(rawClubs.filter((c) => clubRep[c.id] !== undefined).map((c) => [c.id, c.rep])), nationRep: [...nationIdx.keys()].map((id) => nationVal.get(id)![1]),
      clubStat: Object.fromEntries(rawClubs.filter((c) => clubRep[c.id] !== undefined && inGame.has(c.id)).map((c) => [c.id, [c.status, c.minAtt, c.lastDiv, c.lastPos]])),
      compRep: Object.fromEntries([...comps.entries()].map(([id, c]) => [id, c.rep])),
      crowd: Object.fromEntries(rawClubs.filter((c) => clubRep[c.id] !== undefined && inGame.has(c.id)).map((c) => {
        const st = stadiumRaw.get(c.stadium);
        return [c.id, [c.avgAtt, c.minAtt, c.maxAtt, st ? c.stadium : -1, st ? st[0] : -1, st ? st[1] : -1, ...c.rivals.map((r) => (r >= 0 ? r : -1))] as [number, number, number, number, number, number, number, number, number]];
      })),
      ...(cities ? { cities } : {}),
      nation7e: [...nationIdx.keys()].map((id) => nationVal.get(id)![0]),
      nation85: [...nationIdx.keys()].map((id) => nationVal.get(id)![2]),
      nation76,
      fin, chair, chairBoard, nationBoard, lowerDiv, nationCont, europe, ...(city33.length ? { city33 } : {}), ...(Object.keys(prefs).length ? { prefs, clubPrefs } : {}) }, ...(officials.length ? { officials } : {}), ...(staff.length ? { staff } : {}), ...(staffX.length ? { staffX, clubNames: Object.fromEntries(rawClubs.filter((c) => nationIdx.has(c.nation)).map((c) => [c.id, [c.short || c.name, nationIdx.get(c.nation)!]])) } : {}), rules,
  };
}

export function subPos(pos: number[], side: number[]): string {
  if (pos[0] >= 15) return 'GK';
  const [L, C, R] = side;
  const wide = Math.max(L, R) >= 15 && C < 15 ? (L >= R ? 'L' : 'R') : '';
  const best = [2, 3, 4, 5, 6, 7].sort((a, b) => pos[b] - pos[a])[0];
  switch (best) {
    case 2: return wide ? `${wide}B` : 'CB';
    case 7: return wide === 'L' ? 'LB' : 'RB';
    case 3: return 'DM';
    case 4: return wide ? `${wide}M` : 'CM';
    case 5: return wide ? `${wide}W` : 'AM';
    default: return pos[5] >= 15 ? 'SS' : 'CF';
  }
}
