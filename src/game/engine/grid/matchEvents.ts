// Originalens kommentarkø Match_Events (match_events.cpp) som i cm0102.exe 3.9.68 – linje for linje fra disassemblingen:
//   add_event 0x6d6f70, combine_with_previous_event 0x6d60b0, pick_weather_variant 0x6d5d80, add_event_at_front 0x6d5d00,
//   indpakningerne 0x7002f0 (uden p2) og 0x70a860 (kun side), konstruktøren 0x6d5bf0.
// Noter: ~/cm0102-engine/notes/6d6f70-commentary.md (og commentary-ids.md for id → begivenhed).
//
// Kommentaren er en del af kampens tilfældige tal: hvert add_event trækker 0–1 tal i kombinationen, ét rand(3) for vejret (når
// kampdata findes – altid i ligakampe) og ét rand(S) for varianten (kun ved > 1 variant). Kaldes ved originalens kaldsteder i motoren.
//
// Motoren kører "uden skærm": get_next_event 0x6d78b0 (skærmens læsning, flytter +0xc og nulstiller +5) kaldes aldrig, som i de kampe,
// man ikke ser, og i oraklet. I den kamp, man ser i originalen, læser skærmen køen i realtid, så opfølgerne (8639/8640/8675) og
// tilbagerulningen kan falde lidt anderledes dér. UI'et læser køen passivt (drain) og ændrer intet.

import type { Rand } from './gridMatch';
import { EVENT_TABLE } from './eventTable';

/** de dele af motoren, add_event læser (CM3_MATCH_ENGINE-offsets) */
export interface MatchEventsEngine {
  /** bolden +0x8ea7 (x 0..8) / +0x8ea8 (y 0..11) – sub_6d58f0 (feltet) */
  ballX: number; ballY: number;
  /** +0x8eab (siden, der sidst rørte/har bolden – sammenlignes med side1) */
  b8eab: number;
  /** +0x8eb3 – 2 = straffesparkskonkurrence: ingen kombination */
  shootout: number;
  /** uret +0x8ed0 (tik) og periodens slut +0x8ed4 (495/990/1155/1320) */
  clock: number; periodEnd: number;
  /** skuddets minut og side +0x8d4c/+0x8d4e (take_shot 0x702050 0x70213d/0x70215b; init −1/0) */
  shotMinute: number; shotSide: number;
}

/** én post i køen (14 bytes ved this+0x30): id, variant, minut, p1, side1, p2, side2, extra, del (+0xd) */
export interface EventEntry { id: number; variant: number; minute: number; p1: number; s1: number; p2: number; s2: number; extra: number; part: number; tick: number }

const QN = 12;          // køens længde
const LOGMAX = 0x2bc;   // 700 – loggen ved this+0x720

const s8 = (v: number) => ((v & 0xff) << 24) >> 24;
const s16 = (v: number) => ((v & 0xffff) << 16) >> 16;
const row = (id: number) => { const e = (id & 0x7fff) - 8000; return e >= 0 && e < 677 ? EVENT_TABLE[e] : null; };

/** Match_Events (this = engine+0x8f7a) – felterne med originalens offsets */
export class MatchEvents {
  /** +0 tilstand (konstruktøren: 1) */ b0 = 1;
  /** +1 siden for den seneste "follow-on"-begivenhed (0xff = ingen) */ b1 = -1;
  /** +2 køen er gået rundt */ b2 = 0;
  /** +3 positionsbillede 0x6d1770 (0 – sættes ikke af motoren) */ b3 = 0;
  /** +4 siden har skiftet */ b4 = 0;
  /** +5 venter på opfølger */ b5 = 0;
  /** +6 loggens længde */ w6 = 0;
  /** +8 skrivepladsen */ w8 = 0;
  /** +0xa pladsen ved +5 */ wa = -1;
  /** +0xc læsepladsen (skærmen) */ wc = 0;
  /** +0xe logget til og med */ we = 0;
  /** +0x2d68 periodens slut ved sidste kald */ d2d68 = -1;
  readonly q: EventEntry[] = Array.from({ length: QN }, () => ({ id: 0, variant: 0, minute: 0, p1: -1, s1: -1, p2: -1, s2: -1, extra: 0, part: -1, tick: 0 }));
  /** loggen (this+0x720) – kun antallet bruges af motoren; posterne gemmes til fejlsøgning */
  readonly log: EventEntry[] = [];
  /** engine+0x21e: flag pr. side og begivenhed (sat i 0x6d70b9; læses af 0x6d4b70 og 0x717470) */
  readonly happened: [Set<number>, Set<number>] = [new Set(), new Set()];
  /** posterne skrevet siden sidste drain() (UI'ets passive læsning) */
  private fresh: EventEntry[] = [];
  /** tikket (kun til UI/spor) */
  tick = 0;
  /** antal tilfældige tal trukket (fejlsøgning) */
  draws = 0;

  /** vejret engine+0x4756 (lav byte bl, næste byte bh) og banen engine+1 – sub_6d5d80; kampdata (fixture) findes og +0x18 er tom = gate */
  private rand: Rand;
  private eng: MatchEventsEngine;
  private weather: { lo: number; hi: number; pitch: number; gate: boolean };
  constructor(rand: Rand, eng: MatchEventsEngine, weather = { lo: 0, hi: 0, pitch: 0, gate: true }) { this.rand = rand; this.eng = eng; this.weather = weather; }

  private r(n: number): number { if (Math.trunc(n) !== 0) this.draws++; return this.rand(n); }

  /** 0x7002f0 match_add_event_no_players(id, eng, p1, side1, extra): p2 = side2 = −1 */
  addNoPlayers(id: number, p1: number, s1: number, extra = 0) { this.add(id, p1, s1, -1, -1, extra); }
  /** 0x70a860 match_events_add_side_event(id, eng, side1, extra): p1 = p2 = side2 = −1 */
  addSide(id: number, s1: number, extra = 0) { this.add(id, -1, s1, -1, -1, extra); }

  /** de nye poster i skriverækkefølge, der stadig står i køen (ikke rullet tilbage/overskrevet) – læser kun */
  drain(): EventEntry[] {
    const out = this.fresh.filter((e) => e.id !== 0 && this.q.includes(e));
    this.fresh = [];
    return out;
  }

  /** 0x6d5d00 add_event_at_front: skrivepladsen ét tilbage (den forrige post overskrives), loggen ét tilbage hvis dens sidste er samme id */
  private atFront(id: number, p1: number, s1: number, p2: number, s2: number, extra: number) {
    this.w8 = this.w8 === 0 ? 0xb : this.w8 - 1;
    if (this.w6 > 0 && this.log[this.w6 - 1] && this.log[this.w6 - 1].id === this.q[this.w8].id) this.w6--;
    this.add(id, p1, s1, p2, s2, extra);
  }

  /** kun spor/test: hvert kald (også de indlejrede, depth > 0) med argumenterne – som match_trace.c's c-linjer */
  onCall?: (id: number, p1: number, s1: number, p2: number, s2: number, extra: number, depth: number) => void;
  private depth = 0;
  /** 0x6d6f70 Match_Events::add_event(id, eng, p1, side1, p2, side2, extra) */
  add(id: number, p1: number, s1: number, p2 = -1, s2 = -1, extra = 0): void {
    this.onCall?.(s16(id), s8(p1), s8(s1), s8(p2), s8(s2), extra | 0, this.depth);
    this.depth++;
    try { this.add0(id, p1, s1, p2, s2, extra); } finally { this.depth--; }
  }
  private add0(id: number, p1: number, s1: number, p2: number, s2: number, extra: number): void {
    const E = this.eng;
    id = s16(id); p1 = s8(p1); s1 = s8(s1); p2 = s8(p2); s2 = s8(s2); extra |= 0;
    if (s1 < 0 || s1 > 1) return;                       // 0x6d6f7f/0x6d6f87
    if (s2 < -1 || s2 > 1) return;                      // 0x6d6f94/0x6d6f9d
    if (id < 0x1f40 || id >= 0x21e5) return;            // 0x6d6fac/0x6d6fb7
    // den lokale post (esp+0x20): id, p1 +5, side1 +6, p2 +7, side2 +8, extra +9
    const rec = { id, p1, s1, p2, s2, extra };
    if (E.shootout !== 2) {                             // 0x6d6fda
      const c = this.combine(rec);                      // 0x6d6ffd
      if (c > 0) { this.atFront(c, rec.p1, rec.s1, rec.p2, rec.s2, rec.extra); return; }   // 0x6d7024
      if (c < 0) id = -c;                               // 0x6d7035 (rec.id ændres ikke)
    }
    if (this.weather.gate) id = this.weatherVariant(rec.id);   // 0x6d703d–0x6d706e: læser rec.id (den oprindelige!)
    const t = row(id);
    const prio = t ? t[0] : 0;                          // 0x6d7072–0x6d709c
    this.happened[s1].add(id);                          // 0x6d70b9: engine[4·(1000·side + id) − 0x7ae2] = 1
    // minuttet (0x6d70c4–0x6d7172; kun til visning)
    const period = s16(E.periodEnd);
    const minByte = Math.trunc(s16(E.clock) / 11);
    if (this.d2d68 !== period) { this.d2d68 = period; this.w8 = 0; this.wc = 0; this.we = 0; this.b5 = 0; this.b2 = 0; }
    let mn = period === 990 ? 0x59 : period === 495 ? 0x2c : period === 1155 ? 0x68 : period === 1320 ? 0x77 : period >= 0 && period <= 1 ? minByte : s1;
    if (mn >= (minByte & 0xff)) mn = minByte;
    const slot = this.w8;
    const e: EventEntry = { id, variant: 0, minute: mn, p1, s1, p2, s2, extra, part: -1, tick: this.tick };
    this.q[slot] = e;
    // varianten 0x6d71a8–0x6d720b: ét rand(S) ved > 1 variant, første k med r < eff_0 + … + eff_k
    const ev = id - 8000, vr = ev >= 0 && ev < 677 ? EVENT_TABLE[ev] : null;
    if (vr && vr[4].length > 1) {
      const S = vr[4].reduce((a, b) => a + b, 0);
      const x = this.r(S);
      let acc = 0;
      for (let k = 0; k < vr[4].length; k++) { acc += vr[4][k]; if (x < acc) { e.variant = k; break; } }
    }
    this.fresh.push(e);
    // 0x6d72d0: loggen (report count > 0, follow-on eller en ventende side)
    if (t && (t[2] > 0 || t[1] !== 0 || this.b1 !== -1)) {
      let dx = this.w8;
      if (t[2] > 1) { for (let n = t[2] - 1; n > 0; n--) if (this.we !== dx) { dx--; if (dx < 0) dx = 0xb; } }   // 0x6d72fe–0x6d7317
      if (this.we === dx && dx !== this.w8) { dx++; if (dx >= 12) dx = 0; }                                    // 0x6d7319–0x6d732b
      while (this.w6 < LOGMAX) {                                                                                 // 0x6d732d
        const q = this.q[dx];
        if (q.id >= 0x1f40 && q.id < 0x21e5) {
          this.log[this.w6] = { ...q, part: -1 }; this.w6++;
          if (dx === this.w8) break;
          dx++; if (dx >= 12) dx = 0;
        } else {
          if (q.id !== 0) return;                       // 0x6d7458: hele kaldet slutter
          dx++; if (dx >= 12) dx = 0;
        }
      }
      this.we = dx;                                     // 0x6d747a
    }
    // 0x6d747e: No rollback – sletter de foregående poster tilbage til læsepladsen, standser ved prioritet 1/2
    if (t && t[3]) {
      let cx = this.w8 - 1; if (cx < 0) cx = 0xb;
      let bp: number;
      let skip = false;
      if (this.b2) bp = this.wc; else { bp = 0; if (this.wc === this.w8) skip = true; }
      while (!skip) {
        const q = this.q[cx];
        const r2 = row(q.id);
        if (r2 && (r2[0] === 1 || r2[0] === 2)) break;   // 0x6d74ed/0x6d750b
        if (this.b0 === 0) break;                        // 0x6d750f
        const stop = cx === bp;
        q.id = 0;
        cx--; if (cx < 0) cx = 0xb;
        if (stop) break;
      }
    }
    // 0x6d752e: læsepladsen skubbes, når skrivepladsen indhenter den
    if (this.wc === this.w8 && this.b2) {
      this.wc++; if (this.wc >= 12) this.wc = 0;
      this.q[this.wc].part = -1; this.q[this.wc].id &= 0x7fff;
    }
    this.w8++; if (this.w8 >= 12) { this.w8 = 0; this.b2 = 1; }        // 0x6d757a
    if (this.we === this.w8) { this.we++; if (this.we >= 12) this.we = 0; }  // 0x6d758f
    // 0x6d75ad: opfølger-tilstanden
    const follow = t ? t[1] : 0;
    if (this.b0 === 0 || (this.b0 === 3 && prio === 1) || prio === 2 || follow !== 0) {
      this.b5 = 1; this.wa = this.w8;
      if (follow !== 0) { this.b4 = 0; this.b1 = s1; }
    }
    if (this.b4) { this.b1 = -1; this.b4 = 0; }           // 0x6d75f4
    if (this.b1 !== -1) {                                // 0x6d7603
      this.wa = this.w8; this.b5 = 1;
      if (s1 !== this.b1) this.b4 = 1;
    }
    // 0x6d761e: 8531 SAVING_TACKLE → historie-begivenhederne 8607/8608 (0x717470) – kan ikke nås: id 8531 kommer kun fra en negativ
    // kombination, og vejret (gate altid sat i ligakampe) læser rec.id, så erstatningen tabes. Ikke porteret.
    if (id === 0x21bf || id === 0x21c0) return;          // 0x6d76b1/0x6d76bc
    if (!(this.b5 && this.b4 && this.wa === this.w8)) return;   // 0x6d76cb–0x6d76e9
    if (id > 0x1f86 && id < 0x1fbe) return;              // 0x6d76ef: skuddene 8071–8125 giver ingen opfølger
    const survived = () => {                             // 0x6d7760/0x6d77ed
      if (s16(E.shotMinute) === Math.trunc(s16(E.clock) / 11)) this.add(0x21e3, -1, E.shotSide === 0 ? 1 : 0, -1, -1, 0);
      else this.add(0x21c0, rec.p1, rec.s1, -1, -1, 0);
    };
    if (id > 0x2021 && id < 0x20d0) { survived(); return; }      // 0x6d7701–0x6d7708 (afleveringerne 8226–8399)
    if (id > 0x2131) { if (id === 0x213e || id === 0x2147) survived(); return; }    // 0x6d7713/0x6d7742
    if (id === 0x2130 || id === 0x2131) { this.add(0x21bf, rec.p1, rec.s1, -1, -1, 0); return; }   // 0x6d77c6
    const k = id - 0x1f46;                               // 0x6d7725: springtabellen 0x6d7874/0x6d7868
    if (k < 0 || k > 0x33) return;
    const j = JT[k];
    if (j === 0) survived(); else if (j === 1) this.add(0x21bf, rec.p1, rec.s1, -1, -1, 0);
  }

  /** 0x6d5d80 match_events_pick_weather_variant(&id, vejr-dword, banen): altid rand(3); ved 0 en vejrvariant */
  private weatherVariant(id: number): number {
    if (this.r(3) !== 0) return id;                      // 0x6d5d8a
    const { lo: bl, hi: bh, pitch: al } = this.weather;
    const flag = bl === 4 || bl === 3 || bl === 2;       // 0x6d5da7
    const W1: Record<number, number> = { 0x216f: 0x2199, 0x2150: 0x2197, 0x2112: 0x2195, 0x1fee: 0x218d, 0x1f49: 0x2182, 0x205a: 0x2190, 0x205b: 0x2191, 0x2079: 0x2192 };
    const W2: Record<number, number> = { 0x216f: 0x2199, 0x2150: 0x2197, 0x2112: 0x2195, 0x1fe6: 0x2193, 0x1fee: 0x218d, 0x1f48: 0x2181, 0x1f41: 0x2180, 0x1f44: 0x2187, 0x1f86: 0x2189, 0x1fa2: 0x218a };
    const W8: Record<number, number> = { 0x216f: 0x2199, 0x2150: 0x2197, 0x2112: 0x2195, 0x1fe6: 0x2193, 0x1fee: 0x218d, 0x205a: 0x218e, 0x205b: 0x218f, 0x1f4b: 0x2183, 0x1f41: 0x2184, 0x1f4a: 0x2188 };
    const W20: Record<number, number> = { 0x216f: 0x2199, 0x1fee: 0x218d, 0x1f42: 0x217c, 0x1f4b: 0x217d, 0x1f48: 0x2186 };
    const WF: Record<number, number> = { 0x2112: 0x2196, 0x1fa6: 0x2194, 0x1f8b: 0x218b, 0x1fbf: 0x218c, 0x211f: 0x217f };
    if (al === 1) { if (id in W1) return W1[id]; }
    else if (al === 2) { if (id in W2) return W2[id]; }
    else if (al === 8) { if (id in W8) return W8[id]; }
    else if (al === 0x40) { /* 0x6d5fb0 */ }
    else if (al === 0x10) { if (id === 0x1f48) return 0x2185; }
    else if (al === 0x20) { if (this.r(3) === 0 && id in W20) return W20[id]; }   // 0x6d5fcd: et ekstra rand(3)
    if (flag && id in WF) return WF[id];                 // 0x6d602e
    if ((bh === 3 || bh === 4 || bh === 5) && id === 0x1f4b) return 0x217e;   // 0x6d6089
    return id;
  }

  /** 0x6d60b0 combine_with_previous_event(&ny, eng): > 0 = læg den kombinerede begivenhed forrest, < 0 = erstat id, 0 = uændret */
  private combine(N: { id: number; p1: number; s1: number; p2: number; s2: number; extra: number }): number {
    const E0 = this.eng;
    const b20 = s8(E0.b8eab);
    // sub_6d58f0: 1 = bolden i feltet ved y 0..1, −1 = y 10..11 (x 2..6), ellers 0. (sub_6cb960 kaldes to gange, svaret bruges ikke)
    const cl = E0.ballX >= 2 && E0.ballX <= 6 ? (E0.ballY >= 0 && E0.ballY <= 1 ? 1 : E0.ballY >= 10 && E0.ballY <= 11 ? -1 : 0) : 0;
    if (this.w8 === this.w6) return 0;                   // 0x6d6133
    const E = this.q[this.w8 === 0 ? 0xb : this.w8 - 1];   // 0x6d614a
    const bx = N.id, bp = s16(E.id);
    const copy = () => { N.p1 = E.p1; N.s1 = E.s1; N.p2 = E.p2; N.s2 = E.s2; N.extra = E.extra; };
    const same = () => E.p1 === N.p1 && E.s1 === N.s1;
    const shot = (v: number) => v > 0x1f86 && v < 0x1fbe;
    const passEv = (v: number) => v >= 0x2021 && v <= 0x20d0;
    if (bx === 0x1f6f) { if (b20 === N.s1) return 0x21bb; }                        // 0x6d6164
    else if (bx === 0x1f92) { if (bp === 0x1f6c || bp === 0x1f6e) return -0x1f9c; }  // 0x6d618d
    if (bp === 0x1f7d && N.s1 !== E.s1 && bx === 0x1f46) return -0x219d;            // 0x6d61b0
    // 0x6d61d6
    let toMain = false;
    if (!shot(bx) && bx === 0x1f5f && cl === 0) toMain = true;
    if (!toMain) {
      if (shot(bx) || bx === 0x1f5f) {                                              // 0x6d61ef
        if (bp === 0x1f7e) { E.id = 0x219c; E.variant = this.r(2); return 0; }
      }
      if (shot(bx) && bp === 0x1f40) { E.id = 0x219b; return 0; }                    // 0x6d6216
    }
    // 0x6d623d: kæden på den forrige begivenhed
    const L6cde = (): number => {
      if (bx >= 0x2076 && bx <= 0x20d0 && bp === 0x2113) return same() ? -0x2159 : 0;
      return L6d1d();
    };
    const L6d1d = (): number => {
      if ((bp === 0x215b || bp === 0x215c || bp === 0x215a || bp === 0x215e || bp === 0x215f || bp === 0x215d) && bx === 0x1f70) return -0x2157;
      if (bp === 0x1f70) { if (bx !== 0x1f76 || E.s1 === N.s1) return 0; copy(); return 0x2165; }
      if (bp === 0x2150) { if (bx !== 0x1f75) return 0; copy(); return 0x2151; }
      const SET = [0x1f4b, 0x1f4c, 0x1f4e, 0x1f4f, 0x1f50, 0x1f51, 0x1f52, 0x1f53];
      if (SET.includes(bp) && SET.includes(bx) && this.r(2) !== 0) return -0x2169;   // 0x6d6e56
      if (bp === 0x216e) { if (bx !== 0x1f44 || !same()) return 0; return bp; }       // 0x6d6e72 (ingen kopi)
      if ((bp === 0x1f80 || bp === 0x2131 || bp === 0x2130) && bx === 0x1f46) { copy(); return bp; }
      if ((bp === 0x1f73 || (bp >= 0x20b9 && bp <= 0x20c4) || bp === 0x20d0 || bp === 0x1f80) && (bx === 0x1f46 || bx === 0x1f47)) { copy(); return bp; }
      return 0;
    };
    const L6cbf = (): number => {
      if (bx !== 0x1f70) return L6cde();
      if (E.s1 === N.s1) return -0x2157;
      return L6d1d();
    };
    const L6c95 = (): number => ((bx === 0x1f62 || bx === 0x2150) ? -0x2153 : L6cde());
    const L69a6 = (): number => {
      if (bx === 0x1f46 && this.r(5) !== 0 && E.s1 === N.s1 && E.p1 !== N.p1) {
        N.p2 = N.p1; N.s2 = N.s1; N.p1 = E.p1; N.s1 = E.s1; N.extra = E.extra; return 0x2147;
      }
      return L69f5();
    };
    const L69f5 = (): number => {
      if (bp === 0x2148) { if (bx === 0x1f60 || bx === 0x1f5f) { copy(); return 0x2149; } return L6cde(); }
      if (bp === 0x214a) { if (bx === 0x1f60 || bx === 0x1f5f) { copy(); return 0x214b; } return L6cde(); }
      if (bp === 0x214c) { if (bx === 0x1f60 || bx === 0x1f5f) { copy(); return 0x214d; } return L6cde(); }
      if (passEv(bp)) {                                                              // 0x6d6ac4
        if (passEv(bx) && N.extra >= 1 && N.extra <= 20 && E.extra >= 1 && E.extra <= 20 && N.p1 === E.p2 && N.p2 === E.p1) { copy(); return 0x214e; }
        if (bx === 0x1f47 && E.extra >= 1 && E.extra <= 20) {                        // 0x6d6b3f
          if (this.r(0x16 - E.extra) !== 0 && E.p2 === N.p1 && E.s2 === N.s1) { copy(); return bp; }
        }
      }
      if (bp === 0x214f) { if (bx === 0x1f92) { copy(); return bp; } return L6cde(); }  // 0x6d6b86
      if ((bp === 0x213e || bp === 0x1f71 || bp === 0x1f72) && bx === 0x1f75) { copy(); return 0x2151; }
      if (bp === 0x1f40) { if (bx === 0x1f9d) { copy(); return bx; } return L6cde(); }
      if (bp === 0x2021) { if (bx === 0x1f62 || bx === 0x1f63 || bx === 0x2150) return -0x2153; return L6cbf(); }
      if (bp === 0x1f55) { if (bx === 0x1f40) return -0x2152; return L6cde(); }
      if (bp === 0x2113) return L6c95();
      if (passEv(bp)) return L6cbf();
      return L6cde();
    };
    if (bp === 0x1f44) { if (bx === 0x1f43) { copy(); return 0x213f; } return L6cde(); }
    if (bp === 0x1f69) { if (bx === 0x1f9d) return this.r(3) === 0 ? 0x2198 : 0; return L6cde(); }
    if (passEv(bp) && (bx === 0x1f46 || bx === 0x213e || bx === 0x1f60 || bx === 0x1f5f) && E.s1 !== N.s1) {   // 0x6d62ad
      const al = E.s1;
      if (cl === -1) { if (al === 1) return -0x2178; }
      else if (cl === 1 && al === 0) return -0x2178;
    }
    if (bp === 0x1f6f) {                                                             // 0x6d62ea
      if (bx !== 0x1f46) return L6cde();
      if (N.s1 === E.s1 || cl === 0) return 0;
      N.s2 = N.s1; N.p2 = N.p1; N.p1 = E.p1; N.s1 = E.s1; return 0x2177;
    }
    if (bp === 0x2111) { if (bx !== 0x1f46) return L6cde(); if (!same()) return 0; copy(); return 0x2140; }
    if (bp === 0x210f) { if (bx !== 0x1f46) return L6cde(); if (!same()) return 0; copy(); return 0x2141; }
    if (bp === 0x1fe6 || bp === 0x1fe7) { if (bx !== 0x1f46) return L6cde(); if (!same()) return 0; copy(); return 0x2142; }
    if ((bp === 0x213e || bp === 0x1f71) && bx === 0x1f46 && same()) { copy(); return bx; }   // 0x6d6458
    if (bp === 0x213e) { if (bx === 0x1f41) { copy(); return bp; } return L69a6(); }        // 0x6d64a9
    if (bp === 0x1f41) { if (bx === 0x1f46) { copy(); return bx; } return L6cde(); }
    if (bp === 0x2113) {                                                             // 0x6d6523
      if (!shot(bx) && !(bx === 0x1f86 || bx === 0x1fbe)) return L6c95();
      if (this.r(3) !== 0 || !same()) return L6c95();
      copy(); return bx;
    }
    if (bp === 0x1f47) {                                                             // 0x6d6596
      if (bx === 0x1f44 || bx === 0x1f43) { if (!same()) return 0; copy(); return bx; }
      if ((bx === 0x1f45 || bx === 0x20de) && same()) { copy(); return bx; }
      return L6cde();
    }
    if (bp === 0x1f4d) {                                                             // 0x6d663b
      if (bx !== 0x1f4a) return L6cde();
      if (this.r(2) === 0 || E.p1 !== N.p1) return 0;
      if (!(E.s1 === N.s1 && E.p2 === N.p2 && E.s2 === N.s2)) {
        if (E.s1 !== N.s1) return 0;
        if (E.p2 !== -1 && N.p2 !== -1) return 0;
      }
      copy(); return 0x1f4a;
    }
    if (bp === 0x1f43) { if (bx !== 0x1f9d) return L6cde(); if (this.r(2) === 0) return 0; copy(); return bp; }   // 0x6d66de
    if ((bp === 0x1f62 || bp === 0x1f63 || bp === 0x2150) && bx === 0x1f46 && same()) { copy(); return bp; }      // 0x6d6787
    if (bp === 0x1f5d) { if (bx !== 0x1f6f) return L6cde(); copy(); return 0x2143; }
    if (passEv(bp) && bx === 0x1f46 && E.p2 === N.p1 && E.s2 === N.s1) { copy(); return bp; }   // 0x6d67fd
    if (bp === 0x1f60) { if (bx !== 0x1f6f) return L6cde(); copy(); return bx; }
    if (bp === 0x1f46) { if (bx !== 0x1f70) return L6cde(); copy(); return bx; }
    if (bp === 0x1f84) { if (bx !== 0x1f75) return L6cde(); if (this.r(3) === 0) return 0; copy(); return 0x2144; }
    if (bp === 0x1f85) { if (bx !== 0x1f75) return L6cde(); if (this.r(3) === 0) return 0; copy(); return 0x2145; }
    if (bp === 0x1f80) {                                                             // 0x6d6944
      if (bx !== 0x1f46) return L6cde();
      if (this.r(2) === 0 || E.s1 === N.s1) { copy(); return bp; }
      N.s2 = N.s1; N.p2 = N.p1; N.p1 = E.p1; N.s1 = E.s1; N.extra = E.extra; return 0x2146;
    }
    if (bp === 0x1f5e) return L69a6();
    return L69f5();
  }
}

/** springtabellen 0x6d7874 (id − 8006 → 0 = SURVIVED/CLEARED, 1 = ATTACK_COMES_TO_NOTHING, 2 = ingen) */
const JT = [0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1];
