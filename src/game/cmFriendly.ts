// Originalens venskabskampe for computerens klubber (comp/friendly.cpp, objektet Friendly [0xae2c74]) – kun den originale database i ægte
// tilstand (cmActive). Afkodet i ~/cm0102-engine/notes/preseason.md.
//
// Friendly::update 0x5c2460 (turneringernes vtbl+0x14(dato, 1) – forkørslen 0x5cc850 og hver dag): på dag-i-året +0x34e8 = 174 (Date(24, juni))
// og +0x34ea = 2 (3. januar), når spillets start [0xdd6ec8] ≤ dato + 8 uger (0x54c770), planlægges sæsonens venskabskampe: 0x5c27a0 →
//   0x5c2d40  vinduerne: for hvert aktivt land i sæsontabellen 0xb63d60: f = (start +0x2a − 1 uge) − i dag, e = max(3, f − 18) (dage fra i dag)
//   0x5c3040  (år ≠ 2001: minturneringer 0x5c3be0 – ikke porteret) + turnéerne 0x5c37d2: rækker med start ≥ i dag og slut − 52 uger ≤ i dag;
//             pr. klub (ikke menneskets 0x600a50, ikke i Europa [0x9cf6f8] på dag 174, ingen kampe endnu, division med tabel, højst 4) rand(3) ≠ 0 →
//             turnélandet 0x5c4680, niveau rand(2) + 1 + omdømme/1000, rand(2) + 3 kampe mod 0x5c5040's modstandere (niveau ·0,8 – under 1 → 10),
//             to eller flere → 0x5c4040: datoen i vinduet, kampene hver anden dag hos modstanderen (0x5c6f00 flag 0: hjemme = modstanderen)
//   0x5c4770  hjemlige: pr. klub (samme filtre) niveau omdømme/1000 + (rand(3) + 1, 3 → 2 ved rand(4) = 0), rand(3) + 4 kampe mod 0x5c4cb0's
//             modstandere, 0x5c4380: datoen i begges vinduer, hjemme = det svageste hold (niveau +5); listen +0x34d8 (sorteret på dato)
// Friendly::process_pending 0x5c2ae0 (dagligt): den hjemlige kamp en uge før datoen → tilbuddet 0x5c6f00 → kampen.
// *estimeret*: tilbuddets svar (0x5c5570/0x5c5f40 – computerens og menneskets klub siger altid ja), ledigheden 0x5c75a0/0x5c6b70 (ingen anden kamp
// for klubben dagen før, samme dag eller dagen efter), [0x9cf6f8] = Intertoto (cmClubEuro 330), bsearch-startpladsen i 0x5c4cb0 (første med
// niveauet). Modstanderens trup: originalen fylder trupper med for få spillere op med genererede spillere før kampen (cmVirtual.ts).
import type { GameState } from './types';
import { cmActive, cmRand, clubRepMem } from './cmPlayerData';
import { dayNum, seasonRow } from './cmFitness';
import { cmClubEuro } from './cmFitnessGame';
import { CM_NATION_FR } from './data/cmPreseason';
import { registerPrerun } from './cmPrerun';
import { newFixture } from './competitions';
import { fixturesOn } from './state';
import { isHumanClub } from './humans';

export const FRIENDLY_COMP = 'FRIENDLY';
export const isCmFriendly = (comp: string | undefined) => comp === FRIENDLY_COMP;
export const cmFriendlyOn = (g: GameState) => cmActive(g) && !g.draft;

const isoOf = (dn: number) => new Date(dn * 86400000).toISOString().slice(0, 10);
const yearOf = (dn: number) => new Date(dn * 86400000).getUTCFullYear();
const dateOf = (doy: number, y: number) => Math.round(Date.UTC(y, 0, 1) / 86400000) + doy;
const doyOf = (dn: number) => dn - dateOf(0, yearOf(dn));
const ftol = Math.trunc;

/** klubbens post (0x16 bytes): +0 klub, +4 kampe, +5 niveau (omdømme/1000), +6 land, +0xa modstandere, +0xe/+0x10 vinduet, +0x12 optagne datoer */
interface Rec { club: number; cnt: number; lvl: number; nation: number; opps: number[]; e: number; f: number; busy: number[] | null; league: string; rep: number }

const nf = (n: number) => CM_NATION_FR[n];
const neighbours = (a: number, b: number) => { const x = nf(a), y = nf(b); return !!x && !!y && (x.slice(6, 9).includes(b) || y.slice(6, 9).includes(a)); };
const rivals = (g: GameState, a: number, b: number) => {
  const ra = g.cmCrowd?.[a], rb = g.cmCrowd?.[b];
  return (!!ra && [ra[6], ra[7], ra[8]].includes(b)) || (!!rb && [rb[6], rb[7], rb[8]].includes(a));
};
/** [0x9cf6f8]: *estimeret* som Intertoto */
const inIntertoto = (g: GameState, club: number) => cmClubEuro(g, club) === 330;
const human = (g: GameState, club: number) => isHumanClub(club) || club === g.userClub;

/** de aktive rækker i sæsontabellen (land, start, slut) – i tabellens rækkefølge (nøglelandene alfabetisk) */
function rows(g: GameState, today: number): { nation: number; start: number; end: number }[] {
  const y = yearOf(today);
  return g.activeNations.filter((n) => seasonRow(n)).sort((a, b) => (g.nations[a]?.name ?? '').localeCompare(g.nations[b]?.name ?? '')).map((n) => {
    const [A, B] = seasonRow(n)!;
    return { nation: n, start: dateOf(A, y), end: A > B ? dateOf(B, y + 1) : dateOf(B, y) };
  });
}

/** en kamp for klubben dagen før, samme dag eller dagen efter (*estimeret* for 0x5c75a0/0x5c6b70/0x5acbe0) */
function busyDay(g: GameState, club: number, d: number): boolean {
  for (let k = -1; k <= 1; k++) for (const id of fixturesOn(isoOf(d + k))) { const f = g.fixtures[id]; if (f && (f.home === club || f.away === club)) return true; }
  return false;
}

function addFriendly(g: GameState, home: number, away: number, d: number): boolean {
  if (busyDay(g, home, d) || busyDay(g, away, d)) return false;
  const wd = new Date(d * 86400000).getUTCDay();
  newFixture(FRIENDLY_COMP, isoOf(d), home, away, 1, { slot: wd === 0 || wd === 6 ? 1 : 2 });       // 0x5af2f0: England lør/søn 1, ellers 2
  return true;
}

/** Friendly::plan_all 0x5c27a0 på dagen `today` */
export function cmFriendlyPlan(g: GameState, today: number): void {
  const rand = cmRand(g.seed ?? 0, today, 0x5c27a0);
  const recs: Rec[] = [];
  for (const c of Object.values(g.clubs)) {
    if (c.nation === undefined || c.nation < 0) continue;
    const rep = clubRepMem(g, c.id);
    recs.push({ club: c.id, cnt: 0, lvl: ftol(rep / 1000), nation: c.nation, opps: [], e: -1, f: -1, busy: null, league: c.league, rep });
  }
  const byLvl = recs.slice().sort((a, b) => b.lvl - a.lvl);                                    // qsort 0x5c5270
  const ptrs = recs.slice().sort((a, b) => a.nation - b.nation || b.lvl - a.lvl);             // qsort 0x5c5290
  const ofNation = (n: number) => ptrs.filter((r) => r.nation === n);
  const R = rows(g, today);
  // 0x5c2d40: vinduerne
  for (const row of R) {
    const fd = row.start - 7 - today;
    const e = Math.max(3, fd - 18);
    for (const r of ofNation(row.nation)) { r.e = e; r.f = fd; }
  }
  const planDay = doyOf(today) === 174;
  const link = (a: Rec, b: Rec) => { a.opps.push(b.club); b.opps.push(a.club); a.cnt++; b.cnt++; };
  const okRow = (row: { start: number; end: number }) => row.start >= today && row.end - 364 <= today;
  const organiser = (r: Rec, euroAlways: boolean) => !human(g, r.club) && !((euroAlways || planDay) && inIntertoto(g, r.club)) && g.comps[r.league]?.type === 'league';

  // 0x5c4680: turnélandet efter omdømmet (≥ 8000 alle, ≥ 6000/4000 samme verdensdel, ≥ 2000 samme +0x75, ellers ingen)
  const tourNation = (r: Rec): number | null => {
    const tier = r.rep >= 8000 ? 5 : r.rep >= 6000 ? 4 : r.rep >= 4000 ? 3 : r.rep >= 2000 ? 2 : 0;
    if (!tier) return null;
    const own = nf(r.nation);
    let best = -1, pick: number | null = null;
    for (let n = 0; n < g.nations.length; n++) {
      const x = nf(n);
      if (n === r.nation || !x || x[0] < 20 || x[2] !== 1 || x[1] > 2 || x[3] < 5) continue;
      if (tier === 2 ? !own || x[4] !== own[4] : tier < 5 ? !own || x[5] !== own[5] : false) continue;
      const v = rand(100);
      if (v > best) { best = v; pick = n; }
    }
    return pick;
  };
  // 0x5c5040: turnéens modstander i landet T (niveau ≤ bl)
  const tourOpp = (r: Rec, bl: number, T: number): Rec | null => {
    for (const o of ofNation(T)) {
      if (o.lvl > bl || (planDay && inIntertoto(g, o.club)) || o.club === r.club || o.opps.includes(r.club) || rivals(g, r.club, o.club)) continue;
      if (neighbours(r.nation, o.nation) && rand(2) === 0) continue;
      if (o.league === r.league) continue;
      if (o.cnt > rand(3) + 3) continue;
      if (rand(2) === 1) return o;
    }
    return null;
  };
  // 0x5c4cb0: den hjemlige modstander (fra niveauet L og nedefter)
  const domOpp = (r: Rec, L0: number): Rec | null => {
    let L = Math.max(1, Math.min(20, L0)), at = -1;
    for (; at < 0; L++) { if (L >= 20) { at = 0; break; } at = byLvl.findIndex((x) => x.lvl === L); }
    for (let i = at; i < byLvl.length; i++) {
      const o = byLvl[i];
      if (o.club === r.club || o.opps.includes(r.club) || (planDay && inIntertoto(g, o.club))) continue;
      if (o.e !== -1 && r.e !== -1 && (o.e > r.f || r.e > o.f)) continue;
      if (rivals(g, r.club, o.club)) continue;
      if (neighbours(r.nation, o.nation) && rand(2) === 0) continue;
      if (o.league === r.league) continue;
      if (o.cnt > rand(3) + 3) continue;
      const own = nf(r.nation), x = nf(o.nation);
      if (r.rep < 2000 ? o.nation !== r.nation : r.rep < 4000 ? !own || !x || own[4] !== x[4] : r.rep < 8000 ? !own || !x || own[5] !== x[5] : false) continue;
      if (r.cnt > rand(2) && o.nation !== r.nation) continue;
      if (rand(5) === 1) return o;
    }
    return null;
  };
  const busyNear = (r: Rec, d: number) => !!r.busy?.some((x) => x >= d - 1 && x <= d + 1);  // 0x5c45a0

  // 0x5c37d2: turnéerne
  for (const row of R) {
    if (!okRow(row)) continue;
    for (const r of ofNation(row.nation)) {
      if (!organiser(r, false) || r.opps.length || r.cnt > 4) continue;
      if (rand(3) === 0) continue;
      const T = tourNation(r);
      if (T === null) continue;
      let bl = rand(2) + 1 + r.lvl;
      const N = rand(2) + 3;
      const opps: Rec[] = [];
      while (r.cnt < N) {
        const o = tourOpp(r, bl, T);
        if (!o) break;
        opps.push(o); link(r, o);
        bl = ftol(bl * 0.8); if (bl < 1) bl = 10;
      }
      if (opps.length > 1) tour(r, opps);
    }
  }
  // 0x5c4040: turnéens datoer (vinduet ∩ den første modstanders; 2k + 1 dage)
  function tour(r: Rec, opps: Rec[]): void {
    let e = r.e, f = r.f;
    const o0 = opps[0];
    if (o0.e !== -1) { if (o0.e > e) e = o0.e; if (o0.f < f) f = o0.f; }
    f -= 2 * opps.length + 1;
    if (e >= f) return;
    let d = 0;
    for (let k = 0; k < 5; k++) { d = today + e + rand(f - e); if (!r.busy?.length) break; }   // 0x5c4162: et optaget datosæt giver altid et nyt forsøg (sic)
    for (const o of opps) {
      if (addFriendly(g, o.club, r.club, d)) { (r.busy ??= []).push(d); (o.busy ??= []).push(d); }
      d += 2;
    }
  }
  // 0x5c4770: de hjemlige
  const pending = (g.cmFrPending ??= []);
  for (const row of R) {
    if (!okRow(row)) continue;
    for (const r of ofNation(row.nation)) {
      if (!organiser(r, true)) continue;
      let bl = rand(3) + 1;
      if (bl === 3 && rand(4) === 0) bl = 2;
      let L = r.lvl + bl;
      const N = rand(3) + 4;
      for (let k = 0; r.cnt < N && k < N; k++) {
        const o = domOpp(r, L);
        if (o) {
          const [h, a] = r.lvl > o.lvl ? [o, r] : [r, o];
          // 0x5c4380: datoen i hjemmeholdets (og udeholdets) vindue
          let e = h.e, f = h.f;
          if (a.e !== -1) { if (a.e > e) e = a.e; if (a.f < f) f = a.f; }
          if (e >= f) continue;
          const d = today + e + rand(f - e);
          if (busyNear(h, d) || busyNear(a, d)) continue;
          pending.push({ d: isoOf(d), h: h.club, a: a.club });
          (h.busy ??= []).push(d); (a.busy ??= []).push(d);
          link(r, o);
        }
        L = ftol(L * 0.8); if (L < 1) L = 1;
      }
    }
  }
  pending.sort((x, y) => x.d.localeCompare(y.d));                                             // qsort 0x778e90
}

/** 0x5c2ae0: de hjemlige venskabskampe en uge før datoen bliver til kampe */
function processPending(g: GameState, today: number): void {
  const list = g.cmFrPending;
  if (!list?.length) return;
  const target = isoOf(today + 7);
  const keep: typeof list = [];
  for (const p of list) {
    if (p.d > target) { keep.push(p); continue; }
    if (p.d === target && g.clubs[p.h] && g.clubs[p.a]) addFriendly(g, p.h, p.a, today + 7);
  }
  g.cmFrPending = keep;
}

/** Friendly::update 0x5c2460 på dagen `today` (dagnummer) */
export function cmFriendlyDay(g: GameState, today = dayNum(g.date)): void {
  if (!cmFriendlyOn(g)) return;
  const doy = doyOf(today);
  const start = dayNum(g.cmFitStart ?? g.date);
  if ((doy === 174 || doy === 2) && start <= today + 56) cmFriendlyPlan(g, today);
  processPending(g, today);
}

// forkørslen 0x5cc850: turneringernes vtbl+0x14(dato, 1) ved tidspunkt 2
registerPrerun('comps1', (g, day) => cmFriendlyDay(g, day));
