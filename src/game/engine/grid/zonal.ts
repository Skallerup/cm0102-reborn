// Zonevalget sub_6bc030 (sikker; notes/6bc030-zonal-pick.md): hvilken modstander en forsvarer skal dække. Kaldes fra markeringsrunden
// i sub_6b98c0 (0x6ba213/0x6ba30b = loop.ts assignMarking). Kandidaterne er boldholderen (højst 2,0 fra markørens nuværende felt)
// og alle modstandere i de 3×3 felter omkring markørens taktiske felt (sub_6c2be0, uden søjledriften sub_715f50 – zonevalget kalder
// den ikke). Hver kandidat får en "trussel"-score; højeste score vinder (16-bit signed, første kandidat sættes ubetinget, derefter
// kun strengt større). Originalens rand-rækkefølge pr. kandidat: rand(5·(21 − Positioning-rul)), rand(30), [rand(30)], [rand(nm + 1)].
// Verden (gitter, ry, statistik) gives udefra (ZonalWorld), så funktionen kan testes uden en hel kamp.
import { cellDist } from './helpers';
import { instrLo, type Rand } from './loop';

export type ZSide = 0 | 1;

/** Det zonevalget læser på en MATCH_PLAYER (offsets fra noten). */
export interface ZonalPlayer {
  side: ZSide; slot: number; active: boolean;     // +0x27, +0x19 (inaktiv = slot < 0)
  x: number; y: number;                           // +0x102/+0x103
  rating: number;                                 // +0x35 kampkarakter ×1000
  shots: number; shotsOnTarget: number;           // +0x0a / +0x0b
  penGoalsWon: number;                            // +0x10 (notens "assists" – se gridMatch.ts: tælles kun ved straffemål)
  freeRoleRating: number;                         // rec+0x1a
  pos: number; posAttack: number;                 // sub_6c38c0 / sub_6c38f0 (0 uden for 0..10)
  instr: bigint;                                  // +0x188b+8·slot (lav dword bit 0x800000)
  tacticByte: number;                             // taktik +0x5b4+slot (bit 1: ingen zonedækning "?")
  roll: { positioning: number; flair: number };   // +0x10a / +0x109
  marks: object | null;                           // +0x1aa – NB: markeringsrunden nulstiller den før valget (0x6ba165, sikker), så
                                                  //   straks-returerne nedenfor rammer kun, når zonevalget kaldes uden for runden
  markers: readonly unknown[];                    // +0x1ae[..+0x101]
}

export interface ZonalWorld<P extends ZonalPlayer = ZonalPlayer> {
  carrier: P | null;                              // engine+0xf582
  receiver: P | null;                             // engine+0xf57a
  players: P[];                                   // begge sider i originalens slot-orden (engine+0x4796 + side·8920)
  teamFlags: [number, number];                    // engine+0x9766 + 0x18e3·side (0x400 offside-fælde, 0x1000 kontra)
  counterFlag: [boolean, boolean];                // engine+6+side
  lineSide1: number; lineSide0: number;           // engine+0x8eaf / +0x8eb0 (offside-linjerne, sub_6c4130)
  /** fixture-klubbernes +0x53 er ens ("?": nation eller division) */
  sameClubGroup: boolean;
  /** staff+0x1a */
  nation(p: P): number | string;
  /** rec+0x9 / +0xb / +0xd: hjemme-, nuværende og verdensry (rå værdier fra spillerposten) */
  reps(p: P): [number, number, number];
  /** kampfloats +0xad (Jumping) og +0xb1 (Long shots) */
  jumping(p: P): number;
  longShots(p: P): number;
  tacticalCell(p: P): [number, number];           // sub_6c2be0(p, &x, &y, 1)
  manMarkTarget(p: P): P | null;                  // sub_7160f0
  freeRun(p: P): 0 | 1 | 2;                       // sub_6cb780 – her bruges kun ≠ 0
  /** gitterlisten for (x, y), side: originalen indsætter i handlingsrækkefølgen (sub_6bd760) – *estimeret* som slot-orden */
  cellList?(x: number, y: number, side: ZSide): P[];
  /** (ydelse 14/11) sidens spillere i players' rækkefølge (= players.filter(side)) – læses kun */
  sideList?(side: ZSide): readonly P[];
  /** til test/fejlsøgning: hver kandidats endelige score (før 16-bit-sammenligningen) */
  onScore?(p: P, score: number): void;
}

const ftol = Math.trunc;                                                        // sub_945640 (RC = mod nul)
const f32 = Math.fround;
const i16 = (v: number) => (v << 16) >> 16;                                     // cmp ax, word
const CF = [0x140, 0x240, 0x440];                                               // angriber + LC / C / RC

/** sub_70dfa0 (sikker) */
const inOwnHalf = (o: ZonalPlayer) => (o.side === 0 ? o.y < 6 : o.y >= 6);
/** afstandstabellen 0xa15e44 (sub_6f09b0) – 1000 uden for 0..8/0..11 (float32) */
const D = (dx: number, dy: number) => f32(cellDist(dx, dy));

export function zonalPick<P extends ZonalPlayer>(w: ZonalWorld<P>, p: P, rand: Rand): P | null {
  const side = p.side, opp = (1 - side) as ZSide;
  if (p.tacticByte & 1) return null;                                            // 0x6bc073 (samme test som kalderen 0x6ba1c1)
  const mm = w.manMarkTarget(p);                                                // 0x6bc08a
  if (mm && mm.active) return mm;
  const [zx, zy] = w.tacticalCell(p);                                           // 0x6bc0d1 → [esp+0x13] / [esp+0x12]
  let best: P | null = null, bestScore = 0;
  const pr = p.roll.positioning;                                                // +0x10a: 0 ⇒ rand(105), 20 ⇒ rand(5)
  const myNation = w.nation(p);
  const opps = w.sideList ? w.sideList(opp) : w.players.filter((o) => o.side === opp);   // (ydelse 14/11) sidens liste i samme rækkefølge

  const reputation = (o: P) => {                                                // 0x6bc508 / 0x6bcae6
    const [home, cur, world] = w.reps(o);
    if (w.nation(o) === myNation) return home;
    return w.sameClubGroup ? cur : world;
  };
  const ownGoalDist = (x: number, y: number) => f32(D(x - 4, y - (side === 0 ? 0 : 11)) + 5);   // markørens EGET mål, +5
  const support = (x: number, y: number) => {                                   // modstanderens markspillere tæt på (x, y)
    let s = 0;
    for (const o of opps) {
      if (!o.active || o.pos === 1) continue;                                   // slot < 0 / sub_717410 == 1
      const d = D(o.x - x, o.y - y);
      if (d === 0) s += 3; else if (d <= 1.5) s += 1;
    }
    return s;
  };
  // markørens zone i egen halvdel + Positioning-rul ≠ 0: lad kandidaten i egen halvdel stå (0x6bc34c / 0x6bc79a)
  const stays = (o: P) => pr !== 0 && inOwnHalf(o) && (side === 1 ? zy >= 6 : zy < 6);
  const instrFlag = (o: P) =>                                                   // sub_7163f0
    w.teamFlags[o.side] & 0x1000 ? w.counterFlag[o.side] : (instrLo(o as never) & 0x800000) !== 0;
  const consider = (o: P, score: number) => { w.onScore?.(o, score); if (!best || i16(score) > i16(bestScore)) { best = o; bestScore = score; } };
  /** sub_715f30 → sub_6c4130: hvor langt o står forbi modstandernes bageste linje (0 for boldholderen) */
  const offsideAmount = (o: P) => (o === w.carrier ? 0 : o.side === 1 ? w.lineSide0 - o.y : o.y - w.lineSide1);
  const cellList = w.cellList ?? ((x: number, y: number, s: ZSide) => w.players.filter((o) => o.active && o.side === s && o.x === x && o.y === y));

  // ---------------- 1) boldholderen (pseudo-rækken zy − 2, første søjle). NB: ingen sidetest i originalen (sikker) – med
  // "men behind ball" kan markøren altså vælge sin egen boldholder.
  const c = w.carrier;
  if (c && D(c.x - p.x, c.y - p.y) <= 2) {                                      // 0x6bc192: > 2,0 → spring over
    const zoneD = D(c.x - zx, c.y - zy), sup = support(c.x, c.y), goalD = ownGoalDist(c.x, c.y), nm = c.markers.length;
    if (nm !== 3 && !stays(c)) {
      let r = rand(5 * (21 - pr));                                              // 0x6bc39b
      if (goalD < 5 && c.roll.flair !== 0) r += ftol(225 - goalD * 10);         // DØD GREN (goalD ≥ 5 altid) – bevaret for troskab
      if (rand(30) < w.longShots(c) && rand(30) < w.longShots(p)) r += ftol(225 - goalD * 10);   // 0x6bc3d9 / 0x6bc3f8
      r -= 100 * nm;
      if (w.freeRun(c) !== 0) { if (c === p.marks) return c; r += 175; }       // 0x6bc446 – straks-retur
      else if (c === p.marks && rand(nm + 1) === 0) return c;                   // 0x6bc47a – straks-retur
      const s = 10 * (c.shots + c.shotsOnTarget + 20) - ftol(goalD * goalD - 100) - sup * sup * sup
        + ftol(c.rating / 200) - ftol(-7.5 * c.penGoalsWon) - ftol(zoneD * zoneD * 50);
      consider(c, r + s + ftol(reputation(c) / 100) - 50);
    }
  }

  // ---------------- 2) modstanderne i 3×3 felterne om zonen: rækkerne zy−1..zy+1, søjlerne zx−1..zx+1
  for (let cy = zy - 1; cy <= zy + 1; cy++) {
    if (cy < 0 || cy > 11) continue;
    for (let cx = zx - 1; cx <= zx + 1; cx++) {
      if (cx < 0 || cx > 8) continue;
      const list = cellList(cx, cy, opp);
      if (list.length === 0) continue;
      const zoneD = D(cx - zx, cy - zy), sup = support(cx, cy), goalD = ownGoalDist(cx, cy);
      for (const o of list) {
        if (o === w.carrier) continue;
        const nm = o.markers.length;
        if (nm === 3) continue;
        if (stays(o)) continue;
        if (o !== w.receiver) {                                                 // 0x6bc803 / 0x6bc814
          const a = offsideAmount(o);
          if (w.teamFlags[side] & 0x400 && pr !== 0 ? a >= 0 : a > 0) continue; // offside-fælde: på linjen tæller også
        }
        let r = rand(5 * (21 - pr));                                            // 0x6bc833
        if (rand(30) < w.jumping(o) && rand(30) < w.jumping(p)) r += ftol(225 - goalD * 10);   // 0x6bc83c / 0x6bc85b
        r -= 100 * nm;
        if (w.freeRun(o) !== 0) { if (o === p.marks) return o; r += 175; }      // 0x6bc8ab – straks-retur
        else if (o === p.marks && rand(nm + 1) === 0) {                         // 0x6bc8d5
          if (o === w.receiver) return o;                                       // straks-retur (boldholderen kan ikke ske her)
          r += 20;
        }
        r += 10 * (o.shots + o.shotsOnTarget + 10) - ftol(180 - o.rating * 0.03) - ftol(goalD * goalD - 100)
          - ftol(-7.5 * o.penGoalsWon) - sup * sup - ftol(zoneD * zoneD * 50);
        const pf = o.active && o.slot >= 0 && o.slot <= 10 ? o.pos : 0, pa = o.active && o.slot >= 0 && o.slot <= 10 ? o.posAttack : 0;
        if (pf & 0x20 && !(pf & 0x800) && !(pf & 0x80)) r += 10 * o.freeRoleRating;      // central AM: fri rolle-vurdering
        else if (!CF.includes(pf) && CF.includes(pa)) r += 125;                 // rykker op som central angriber i angreb
        else if (instrFlag(o)) r += 40;                                         // 0x6bcada
        consider(o, r + ftol(reputation(o) / 100) - 50);
      }
    }
  }
  return best;
}
