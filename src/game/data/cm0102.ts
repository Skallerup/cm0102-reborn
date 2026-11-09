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
  feet?: [number, number] }

export interface CMWorld extends WorldData {
  kind: 'cm0102';
  /** 'stored' = egenskaberne står som i databasen (1-20); uden = ældre filer med de 18 allerede omregnet */
  attrScale?: 'stored';
  ratings: Record<number, CMRatings>;
  clubRep: Record<number, number>;
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
  staff?: [number, string, string, number, string, number, number[], number, number, number][];
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
export function parseCM0102(files: Record<string, ArrayBuffer>, opts: { maxTiers?: number; allClubs?: boolean } = {}): CMWorld {
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
  const nations: { name: string; code: string }[] = [];
  const nationVal = new Map<number, [number, number]>(); // nation +0x7E (økonomisk niveau 1-3), +0x8E (omdømme, i16)
  for (let o = 0; o + 290 <= files['nation.dat'].byteLength; o += 290) {
    const id = N.i32(o);
    nationIdx.set(id, nations.length);
    nationVal.set(id, [N.u8(o + 0x7e), N.i16(o + 0x8e)]);
    nations.push({ name: N.str(o + 4, 51), code: N.str(o + 83, 4) || N.str(o + 56, 3).toUpperCase() });
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
  if (files['stadium.dat']) {
    const St = new Reader(files['stadium.dat']);
    // post: id (4) · navn (51) · by (4) · 1 byte · kapacitet (4, byte 60) · siddepladser (4, byte 64) · …
    // (byte 59 gav et forkert tal for næsten alle stadioner, så alle endte på loftet 120.000)
    for (let o = 0; o + 78 <= files['stadium.dat'].byteLength; o += 78) {
      const cap = St.i32(o + 60);
      if (cap > 0 && cap <= 150_000) seatsOf.set(St.i32(o), cap);
      const nm = St.str(o + 4, 51).trim();
      if (nm) stadiumName.set(St.i32(o), nm);
    }
  }

  // klubber
  const CL = new Reader(files['club.dat']);
  type RawClub = { id: number; name: string; short: string; nation: number; division: number; rep: number; status: number; stadium: number; maxAtt: number; fg: number; bg: number; balance: number; avgAtt: number; training: number; manager: number };
  const rawClubs: RawClub[] = [];
  for (let o = 0; o + 581 <= files['club.dat'].byteLength; o += 581) {
    rawClubs.push({
      id: CL.i32(o), name: CL.str(o + 4, 51), short: CL.str(o + 56, 26), nation: CL.i32(o + 83), division: CL.i32(o + 87),
      stadium: CL.i32(o + 105), maxAtt: CL.i32(o + 123), rep: CL.i16(o + 128), fg: CL.i32(o + 131), bg: CL.i32(o + 135),
      balance: CL.i32(o + 101), status: CL.u8(o + 100), avgAtt: CL.i32(o + 115), training: CL.u8(o + 127),
      // klubbens manager (staff-id; ejerens Bosman-projekt, db.rs: club.dat 207)
      manager: CL.i32(o + 207),
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

  // stab (ikke-spillerposten, 68 bytes): 21 egenskaber i alfabetisk rækkefølge fra +14 (bekræftet i originalens Non-Playing Staff);
  // jobkoden i personposten +61 (5 Manager, 6 Assistant Manager, 8 Coach, 9 Scout, 10 Physio – bekræftet for Man Utd 3.9.60)
  const staff: NonNullable<CMWorld['staff']> = [];
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
      if (!att.some(Boolean)) continue;
      const here = inGame.has(club);
      if (here ? ![5, 6, 8, 9, 10].includes(job) : ca < 100) continue;
      const nation = nationIdx.get(S.i32(o + 26));
      if (nation === undefined) continue;
      const cn = S.i32(o + 12) >= 0 ? common[S.i32(o + 12)] ?? '' : '';
      const fn = cn ? '' : first[S.i32(o + 4)] ?? '', ln = cn || second[S.i32(o + 8)] || '';
      if (!ln) continue;
      let dob = S.date(o + 16);
      if (!dob) { const yob = S.i16(o + 24); dob = yob > 1900 && yob < 2100 ? `${yob}-01-01` : ''; }
      staff.push([here ? club : 0, fn, ln, nation, dob, here ? job : 0, att, ca, S.i16(np + 10), S.i32(o)]);
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
      Math.round(value), Math.round(value), S.u8(o + 34), S.u8(o + 35), contract ? `${contract.slice(0, 4)}-06-30` : '', 0, 0, 0, 0, 0, 0,
      // trøjenummeret (byte 4 i spillerposten, 0 = intet)
      Math.max(0, Math.min(99, S.i8(po + 4))),
      // ugentlig løn i pund (staff.dat 78)
      Math.max(0, S.i32(o + 78)),
    ]);
    const rep: [number, number, number] = [S.i16(po + 9), S.i16(po + 11), S.i16(po + 13)];
    const feet: [number, number] = [Math.max(0, Math.min(20, lf)), Math.max(0, Math.min(20, rf))];
    ratings[id] = paRaw !== undefined ? { ca, pa, attrs, pos, side, paRaw, rep, feet } : { ca, pa, attrs, pos, side, rep, feet };
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

  return {
    kind: 'cm0102', version: 1, attrScale: 'stored', source: 'Championship Manager 01/02 (brugerens egen installation)', season: 2001,
    nations, leagues, clubs, playerFields: fields, players, names: pool, ratings, clubRep, clubColors, clubFinance, valueClub, ...(officials.length ? { officials } : {}), ...(staff.length ? { staff } : {}), rules,
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
