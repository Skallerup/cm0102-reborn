// "Player Initialisation" som i det originale CM 01/02 (sub_535a80, Database.cpp) – kører for hver spiller, når et nyt
// spil bygges fra en CM-database. Porteret fra ejerens Bosman-projekt (player_generation/player_generation.ts +
// PLAYER_GENERATION.md, læst i cm0102.exe):
//  * PA: negativ PA (-2/-1), manglende PA og de tilfældige omslag, alle spillere får i hvert nyt spil
//  * CA over PA → CA = PA − rand(40)
//  * egenskaber databasen ikke har sat (0): kopieret fra den mest lignende af 250 tilfældige spillere ("skabelon")
// Ikke porteret (ukendt i originalen): afbalanceringen sub_538ec0/538bc0 og positionstabellen for spillere helt uden
// position. Udfyldningen sker på databasens 1-20-skala; world-filen har de viste værdier ved spilstart (cm0102.ts
// convert), så de 18 omregnede egenskaber regnes tilbage først og frem igen bagefter.
import { ATTRS, type AttrKey } from './attributes';

/** sub_90cfc0: rand(n) = 0..n−1 for n > 0, 0 for n = 0, −(|n|−1)..0 for n < 0 */
export function makeRand(next: () => number) {
  return (n: number): number => {
    n = Math.trunc(n);
    if (n === 0) return 0;
    const r = Math.floor(next() * Math.abs(n));
    return n > 0 ? r : -r;
  };
}
type Rand = (n: number) => number;
const trunc = Math.trunc;

// ---------------------------------------------------------------- PA (0x53621b..0x536c5d)

/** PA-tabellen ved omslag (0x9b5988) */
const PA_LEVEL = [1, 5, 8, 10, 15, 20, 25, 33, 45, 65, 90, 110, 127, 135, 142, 149, 155, 161, 166, 171, 175];

/** Originalens PA for en spiller i et nyt spil. `paDb` = databasens PA (kan være −2, −1, 0 eller 1-200). */
export function initialisePA(paDb: number, ca: number, age: number, clubLevel: number, rand: Rand): number {
  let pa = paDb;
  // tilfældige omslag for ALLE spillere (0x53621b)
  if (rand(2000) === 0) pa = -2; else if (rand(750) === 0) pa = -1; else if (rand(100) === 0) pa = 0;
  const finish = (v: number) => Math.min(200, Math.max(10, Math.max(v, ca)));
  const minus2 = () => { let v = rand(10) !== 0 ? 120 + rand(81) : 160 + rand(41); if (rand(20) === 0) v -= rand(50); else if (v > 165) v -= rand(30); return finish(v); };
  const minus1 = () => { let v = rand(10) !== 0 ? 80 + rand(81) : 120 + rand(81); if (rand(20) === 0) v -= rand(50); else if (v > 140) v -= rand(30); return finish(v); };
  const reroll = () => {
    let L: number;
    if (rand(100) === 0) L = rand(21);
    else if (rand(2) === 0) L = 6 + rand(6);
    else if (rand(2000) === 0) L = 1 + rand(20);
    else L = 4 + rand(7);
    if (L < 1 || L > 20) L = 3 + rand(10);
    return finish(rand(60) + PA_LEVEL[L] - 30);
  };
  if (pa === -2) return minus2();
  if (pa === -1) return minus1();
  if (pa > 140 && age < rand(30) && ca < 170 && rand(10010 - clubLevel) === 0) return minus1();
  if (pa >= 1 && pa <= 200) return age >= 25 || rand(25) !== 0 ? pa : reroll();
  return reroll();
}

/** CA over PA (0x536e5d) */
export const capCA = (ca: number, pa: number, rand: Rand): number => {
  if (ca <= pa) return ca;
  const v = pa - rand(40);
  return v < 1 ? rand(5) + 1 : v;
};

// ---------------------------------------------------------------- egenskaber (0x537640..0x537bd3)

/** Originalens array-rækkefølge (sub_53a610) for de felter, vi har: [vores nøgle, rolle-flag 1 = målmand / 2 = markspiller] */
const ARR: [AttrKey, 0 | 1 | 2][] = [
  ['anticipation', 0], ['crossing', 2], ['decisions', 0], ['dribbling', 2], ['finishing', 2], ['handling', 1], ['heading', 2],
  ['longShots', 2], ['marking', 2], ['offTheBall', 2], ['oneOnOnes', 0], ['passing', 2], ['penalties', 2], ['positioning', 0],
  ['reflexes', 0], ['tackling', 2], ['throwIns', 0], ['creativity', 2],
  // herfra: ikke-tekniske (originalens indeks ≥ 32)
  ['flair', 2], ['corners', 2], ['freeKicks', 0], ['technique', 2], ['strength', 0], ['stamina', 0], ['pace', 0], ['jumping', 0],
  ['influence', 0], ['dirtiness', 0], ['balance', 0], ['bravery', 0], ['consistency', 0], ['acceleration', 2], ['aggression', 0],
  ['agility', 0], ['importantMatches', 0], ['injuryProneness', 0], ['versatility', 0], ['teamwork', 2], ['workRate', 2],
  ['naturalFitness', 0], ['determination', 0],
];
const TECH = 18; // de første 18 er originalens "tekniske" (indeks < 32) – de omregnes også med CA
const IDX = ARR.map(([k]) => ATTRS.indexOf(k));
const A_JUMP = ATTRS.indexOf('jumping');

// de 18 omregnede egenskaber: hvilke er "høje" (vist med fuld CA) for hhv. målmand og markspiller (som cm0102.ts)
const GK_ATTR = new Set<AttrKey>(['handling', 'reflexes', 'oneOnOnes']);
const OUT_ATTR = new Set<AttrKey>(['crossing', 'dribbling', 'finishing', 'marking', 'offTheBall', 'throwIns', 'creativity']);
const high = (k: AttrKey, keeper: boolean) => (GK_ATTR.has(k) ? keeper : OUT_ATTR.has(k) ? !keeper : true);

/** sub_544380 efter omregningen ved spilstart (samme som cm0102.ts convert) */
export function shownAtStart(stored: number, ca: number, hi: boolean): number {
  const intrinsic = trunc(Math.max(-200, Math.min(200, 10 * stored - ca)) / 2);
  const t = ((hi ? ca : 0.1 * ca) + 2 * intrinsic) * 0.05 + 10;
  return Math.max(1, Math.min(20, trunc((0.1 * t * t + t) / 3 + 0.5)));
}
/** Den gemte 1-20-værdi, der giver `shown` (midten, hvis flere giver samme tal) */
export function storedFromShown(shown: number, ca: number, hi: boolean): number {
  let best: number[] = [], bd = 99;
  for (let v = 1; v <= 20; v++) {
    const d = Math.abs(shownAtStart(v, ca, hi) - shown);
    if (d < bd) { bd = d; best = [v]; } else if (d === bd) best.push(v);
  }
  return best[best.length >> 1];
}

/** En spiller som originalens udpakkede array: positioner (12) + egenskaber på databasens skala; 0 = mangler */
export interface InitRec { ca: number; pos: number[]; side: number[]; attrs: number[] }
interface Packed { ca: number; ent: Int16Array }
const NPOS = 11; // GK, SW, D, DM, M, AM, F, WB, R, L, C (fri rolle har vi ikke)

/** Pak en world-post ud på databasens skala (de 18 omregnede regnes tilbage fra den viste værdi) */
export function pack(r: InitRec): Packed {
  const keeper = (r.pos[0] ?? 0) >= 15;
  const ent = new Int16Array(NPOS + ARR.length);
  for (let i = 0; i < 8; i++) ent[i] = r.pos[i] ?? 0;
  ent[8] = r.side[2] ?? 0; ent[9] = r.side[0] ?? 0; ent[10] = r.side[1] ?? 0;
  ARR.forEach(([k], j) => {
    const v = r.attrs[IDX[j]] ?? 0;
    ent[NPOS + j] = v < 1 || v > 20 ? 0 : j < TECH ? storedFromShown(v, r.ca, high(k, keeper)) : v;
  });
  return { ca: r.ca, ent };
}

const ok = (v: number) => v >= 1 && v <= 20;

/**
 * Udfyld de manglende egenskaber som originalen. `attrs` (vores rækkefølge, viste værdier) ændres på stedet; kun
 * indgange med 0 udfyldes (og gyldige værdier i "forkert rolle" sænkes, som originalen gør, når noget mangler).
 * Returnerer false, hvis intet manglede.
 */
export function fillMissing(r: InitRec, age: number, pool: Packed[], rand: Rand): boolean {
  const me = pack(r);
  let missing = false;
  for (let j = 0; j < ARR.length; j++) if (!ok(me.ent[NPOS + j])) { missing = true; break; }
  if (!missing) return false;
  const keeper = me.ent[0] >= 15;
  // skabelon: den mest lignende af 250 tilfældige spillere (0x537640)
  let tpl: Packed | undefined, bestScore = Infinity;
  for (let n = 0; n < 250 && pool.length; n++) {
    const t = pool[rand(pool.length)];
    let score: number;
    if (me.ent[0] === 20 && t.ent[0] === 20) score = 0;
    else {
      score = trunc(Math.abs(me.ca - t.ca) * 2.5);
      for (let i = 0; i < me.ent.length; i++) {
        if (!ok(t.ent[i])) { score += 100; continue; }
        if (!ok(me.ent[i])) continue;
        const d = Math.abs(me.ent[i] - t.ent[i]);
        score += i === 0 ? d * 1000 : i < NPOS ? d * 25 : d * 16;
      }
    }
    if (score < bestScore) { bestScore = score; tpl = t; }
  }
  const wrong = (j: number) => (keeper && ARR[j][1] === 2) || (!keeper && ARR[j][1] === 1);
  const clampFill = (v: number) => (v < 1 ? rand(8) + 1 : v > 20 ? 20 : v);
  const out = new Int16Array(ARR.length);
  for (let j = 0; j < ARR.length; j++) {
    let v = me.ent[NPOS + j];
    if (ok(v)) { if (wrong(j)) v = Math.max(1, v - 10); out[j] = v; continue; }
    if (!tpl) {
      v = clampFill(rand(7) + trunc(me.ca / 5) - 3);
      if (wrong(j)) v = rand(5) + 1;
      out[j] = v;
      continue;
    }
    const t = tpl.ent[NPOS + j];
    if (ok(t)) {
      if (j < TECH) v = t + trunc((me.ca - tpl.ca) / 5);
      else { v = t; if (v <= 5) v += rand(5); else if (v >= 15) v -= rand(4); }
      v = clampFill(v + rand(6) - 3);
    } else v = clampFill(rand(11) + trunc(me.ca / 5) - 5);
    const k = ARR[j][0];
    if ((k === 'workRate' || k === 'naturalFitness') && v < 12) v += rand(13 - v);
    if ((k === 'strength' || k === 'stamina' || k === 'influence') && age < 22 && v > 15) v -= rand(5);
    if (wrong(j)) v = rand(10) + 1;
    out[j] = v;
  }
  // tilbage på vores skala: de 18 omregnede vises med CA
  for (let j = 0; j < ARR.length; j++) r.attrs[IDX[j]] = j < TECH ? shownAtStart(out[j], me.ca, high(ARR[j][0], keeper)) : out[j];
  if (me.ent[0] === 20 && r.attrs[A_JUMP] < 8) r.attrs[A_JUMP] = rand(6) + 5;
  return true;
}

/** Skabelonpuljen: alle databasens spillere med en CA (originalen tager tilfældige staff-poster med CA 1-200) */
export const makePool = (recs: InitRec[]): Packed[] => recs.filter((r) => r.ca >= 1 && r.ca <= 200).map(pack);
