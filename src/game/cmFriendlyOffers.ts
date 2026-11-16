// Originalens tilbud om venskabskampe (comp/friendly.cpp, objektet Friendly [0xae2c74]) – både computerens (planlagt af cmFriendly.ts) og
// menneskets (Fixtures → Arrange ▾ Home Friendly / Away Friendly / Tour). Kun den originale database i ægte tilstand (cmFriendlyOn).
// Afkodet 16/11-2026 i ~/cm0102-engine/notes/friendly-human.md (cm0102.exe 3.9.68, tools/cmdis.py).
//
// Friendly +0x34c8: FriendlyMatch (0x19 bytes): +0 dato, +8 åben invitation (mennesket har valgt dato, ikke modstander), +0xc arrangøren,
//   +0x10 hjemme, +0x14 ude, +0x18 tilstand (1 sendt, 2 venter på et menneske, 3 accepteret, 4 afvist). Her `CmFrMatch`.
// Friendly +0x34d4: de ventende svar (pegere til +0x34c8) – her `pend`.
// Friendly +0x34cc: FriendlyDatesRequest (0x107 bytes) – en turné: klubben, landet og op til 10 datoer med modstander/tilstand – her `CmFrTour`.
//
//   0x5c6b70 friendly_is_club_free_on_date(dato, klub, art 0): ingen kamp for klubben fra dagen før til dato + hvile (0x5c74d0: art 0 → 1 dag)
//   0x5c75a0 get_club_date_status: 4 valgt · 5 tilbud på dagen · 6 turnédag · 2 optaget · 1 ledig (≥ 7 dage frem) – uden turneringerne (3)
//   0x5c6f00 add_friendly_match · 0x5c5570 send_friendly_request · 0x5c5f40 process_friendly_reply (svaret efter omdømmet – ingen tilfældighed)
//   0x5c2460 update_for_date: svarene +0x34d4, oprydningen af +0x34c8 (uden modstander eller passeret dato) og turnédatoerne (dato − 2 < i dag)
//   0x5c6570 on_friendly_fixture_cancelled · 0x5c87b0 remove_friendly_match · 0x5c85d0 cancel_friendly_dates_request · 0x5c57d0 schedule_assign
// Ikke porteret: Friendly Cup/League (Tournament, 0x5c6e00/0x5c5820 – menuen viser den grå) og landsholdenes venskabskampe 0x5cbb00.
import type { GameState } from './types';
import { addNews, fixturesOn, unindexFixture } from './state';
import { newFixture } from './competitions';
import { asOwner, isHumanClub } from './humans';
import { clubRepMem } from './cmPlayerData';

export const FRIENDLY_COMP = 'FRIENDLY';

export interface CmFrMatch {
  d: string; org: number; home: number; away: number;
  /** +0x18: 1 sendt (venter på svar), 2 venter på et menneskes svar, 3 accepteret, 4 afvist */
  st: number;
  /** +8: åben invitation (mennesket har valgt datoen og vælger nu modstanderen – "Choose Friendly Teams") */
  open?: 1;
  /** i listen +0x34d4 (svaret ved næste Friendly::update) */
  pend?: 1;
}
export interface CmFrTour { club: number; nation: number; slots: { d: string; opp: number; st: number }[] }

export const DAY = 86400000;
export const frDn = (iso: string) => Math.round(Date.parse(`${iso}T00:00:00Z`) / DAY);
export const frIso = (dn: number) => new Date(dn * DAY).toISOString().slice(0, 10);

const S = (g: GameState) => (g.cmFrH ??= { m: [], t: [] });

/** forkørslen 0x5cc850 kører, før menneskets manager sidder i klubben (0x600a50 er falsk) – sat af cmFriendly.ts */
let prerun = false;
export function setFrPrerun(b: boolean): void { prerun = b; }
/** 0x600a50/0x7875e0: et menneske styrer klubben (og får nyheden) */
export const frHuman = (g: GameState, club: number) => !prerun && !!club && (isHumanClub(club) || club === g.userClub);

/** 0x5acbe0: klubbens kampe i [a, b] (dagnumre) */
function hasFixture(g: GameState, club: number, a: number, b: number): boolean {
  for (let d = a; d <= b; d++) for (const id of fixturesOn(frIso(d))) { const f = g.fixtures[id]; if (f && (f.home === club || f.away === club)) return true; }
  return false;
}
/** 0x5c6b70 med art 0 (en enkelt venskabskamp – hvile 0x5c74d0 = 1): ingen kamp fra dagen før til dagen efter. (Art ≠ 0 – turneringerne –
 *  kræver desuden, at datoen ligger uden for landets sæson 0xb63d60 +0x2a/+0x39; ikke brugt her.) */
export function cmFrFree(g: GameState, club: number, d: number): boolean {
  return !!g.clubs[club] && !hasFixture(g, club, d - 1, d + 1);
}
/** 0x5ae870(klubbens stadion +0x69, dato): en anden kamp spilles på stadionet den dag (delte stadioner – cmCrowd[3] er stadionets id) */
export function cmFrStadiumBusy(g: GameState, club: number, d: number): boolean {
  const st = g.cmCrowd?.[club]?.[3];
  if (st === undefined || st < 0) return false;
  for (const id of fixturesOn(frIso(d))) { const f = g.fixtures[id]; if (f && g.cmCrowd?.[f.home]?.[3] === st) return true; }
  return false;
}

export type FrStatus = 1 | 2 | 4 | 5 | 6;
export interface FrDay { s: FrStatus; m?: CmFrMatch; t?: CmFrTour }

/** Friendly::get_club_date_status 0x5c75a0 (dagnummer `d`, `chosen` = de valgte datoer sorteret, `tour` = art 0xb). Turneringerne (status 3)
 *  findes ikke her. Kaldes med check_stadium = 1 (som datoskærmen 0x470869, Invite Club 0x483238 og 0x5c2ae0). */
export function cmFrDateStatus(g: GameState, club: number, d: number, chosen: number[] = [], tour = false, today = frDn(g.date)): FrDay {
  if (chosen.includes(d)) return { s: 4 };
  const st = S(g);
  // +0x34c8: tilbud med begge hold, hvor klubben er med, inden for en dag
  for (const m of st.m) {
    if (!m.home || !m.away || (m.home !== club && m.away !== club)) continue;
    const md = frDn(m.d);
    if (d < md - 1 || d > md + 1) continue;
    if (d === md) {
      // modstanderen har fået en anden kamp: tilbuddet slettes (0x5c87b0 via 0x68d1f0), og dagen vurderes igen
      const other = m.home === club ? m.away : m.home;
      if (!cmFrFree(g, other, d)) { removeMatch(g, m); return cmFrDateStatus(g, club, d, chosen, tour, today); }
      return { s: 5, m };
    }
    return { s: 2 };
  }
  // +0x34cc: klubbens turnédatoer (dagen før/efter = optaget)
  for (const t of st.t) {
    if (t.club !== club) continue;
    for (const sl of t.slots) { const sd = frDn(sl.d); if (sd === d) return { s: 6, t }; if (Math.abs(sd - d) === 1) return { s: 2 }; }
  }
  if (!tour) {
    if (!cmFrFree(g, club, d) || cmFrStadiumBusy(g, club, d) || today > d - 7) return { s: 2 };
    return { s: 1 };
  }
  // 0x5c7e32: turnéen – dagene mellem de valgte og den nye skal være ledige, ikke to dage i træk, højst 3 dage fra de valgte
  if (chosen.length) {
    const first = chosen[0], last = chosen[chosen.length - 1];
    let a = 0, b = 0;
    if (first > d) { a = d; b = first - 1; } else if (last < d) { a = last + 1; b = d + 1; }
    for (let x = a; x < b; x++) if (!cmFrFree(g, club, x)) return { s: 2 };       // sic: før den første tjekkes til first − 2, efter den sidste til d
    if (chosen.includes(d - 1) || chosen.includes(d + 1)) return { s: 2 };
    if (first - 3 > d || last + 3 < d) return { s: 2 };
    return { s: today > d - 7 ? 2 : 1 };
  }
  if (!cmFrFree(g, club, d)) return { s: 2 };
  return { s: today > d - 7 ? 2 : 1 };
}

/** 0x5c87b0 (+ dens referencer i +0x34d4) */
export function removeMatch(g: GameState, m: CmFrMatch): void {
  const st = S(g);
  st.m = st.m.filter((x) => x !== m);
}

/** Friendly::add_friendly_match 0x5c6f00(klub, dato, modstander, hjemme): genbruger klubbens åbne invitation (0x5c88f0(null, klub)); værtens
 *  stadion må ikke være optaget (0x5ae870) – ellers null */
export function cmFrAddMatch(g: GameState, club: number, d: number, opp: number, atHome: boolean): CmFrMatch | null {
  const st = S(g);
  let m = st.m.find((x) => x.org === club && x.open);
  const host = atHome ? club : opp;
  if (host && cmFrStadiumBusy(g, host, d)) return null;
  if (!m) { m = { d: '', org: club, home: 0, away: 0, st: 1 }; st.m.push(m); }
  m.d = frIso(d); m.org = club; m.st = 1; delete m.open; delete m.pend;
  m.home = atHome ? club : opp; m.away = atHome ? opp : club;
  return m;
}

/** den indbudte klub (den af +0x10/+0x14, der ikke er arrangøren) */
export const invitedOf = (m: CmFrMatch) => (m.org === m.home ? m.away : m.home);

/** Friendly::send_friendly_request 0x5c5570: i listen +0x34d4; er den indbudte et menneske, venter tilbuddet på ham (tilstand 2) og han får
 *  nyheden 6 "{arrangør} - {indbudt} friendly proposal" (0x77cd8e) */
export function cmFrSend(g: GameState, m: CmFrMatch): void {
  const inv = invitedOf(m);
  m.pend = 1;
  if (inv && m.st === 1 && frHuman(g, inv)) {
    m.st = 2;
    const H = g.clubs[m.home], A = g.clubs[m.away], O = g.clubs[m.org], I = g.clubs[inv];
    if (!H || !A || !O || !I) return;
    // 0x77ce44: arrangøren hjemme → "have offered … a friendly match at {stadion}", ellers "have challenged … to a friendly match at {stadion}"
    asOwner(inv, () => addNews({ cat: 'match', key: 'cmfr.proposal', params: { org: O.name, inv: I.name, stadium: H.stadium, date: m.d, body: m.org === m.home ? 'offered' : 'challenged' }, link: { kind: 'club', id: O.id } }));
  }
}

/** venskabskampen som kamp (0x5aa680, fixture +0x3a = 1 – ingen turnering) */
export function cmFrFixture(home: number, away: number, d: number): void {
  const wd = new Date(d * DAY).getUTCDay();
  newFixture(FRIENDLY_COMP, frIso(d), home, away, 1, { slot: wd === 0 || wd === 6 ? 1 : 2 });       // 0x5af2f0: England lør/søn 1, ellers 2
}

/** Friendly::process_friendly_reply 0x5c5f40(tilbud, force): computerens svar efter omdømmet (klub +0x80) – faktoren f = 1,65 (den indbudte ude)
 *  eller 1,32 (hjemme), ·0,925 andet land, ·0,85 anden nation +0x76, ·0,85 anden verdensdel +0x71, og hjemme hos den indbudte
 *  ·(1 + arrangørens mindste tilskuertal +0x77 / ((0,55 · afstanden mellem stadionernes byer + 1) · 40.000)). Ja, hvis arrangørens omdømme
 *  ≥ den indbudtes / f, eller forskellen ≤ 600 · f. Nyheden 7 til arrangøren; ja → kampen. */
export function cmFrReply(g: GameState, m: CmFrMatch, force = false): void {
  const org = m.org, inv = invitedOf(m);
  if (!org) return;
  if (inv && m.st === 1 && (!frHuman(g, inv) || force)) {
    const O = g.clubs[org], I = g.clubs[inv];
    if (!O || !I) m.st = 4;
    else {
      let f = inv === m.home ? 1.32 : 1.65;
      if (I.nation !== O.nation) f *= 0.925;
      if ((g.cmNation76?.[I.nation] ?? 0) !== (g.cmNation76?.[O.nation] ?? 0)) f *= 0.85;
      if ((g.cmNationCont?.[I.nation] ?? -1) !== (g.cmNationCont?.[O.nation] ?? -1)) f *= 0.85;
      if (inv === m.home) {
        const a = cityOf(g, org), b = cityOf(g, inv);
        if (a && b) {
          const dx = a[1] - b[1], dy = a[0] - b[0];
          f *= 1 + (g.cmCrowd?.[org]?.[1] ?? 0) / ((Math.sqrt(dy * dy + dx * dx) * 0.55 + 1) * 40000);
        }
      }
      const ro = clubRepMem(g, org), ri = clubRepMem(g, inv);
      m.st = ro < ri / f && ri - ro > 600 * f ? 4 : 3;
    }
    const In = g.clubs[inv], On = g.clubs[org];
    if (In && On && frHuman(g, org)) asOwner(org, () => addNews({ cat: 'match', key: m.st === 3 ? 'cmfr.accepts' : 'cmfr.rejects', params: { inv: In.name, org: On.name, date: m.d }, link: { kind: 'club', id: In.id } }));
  }
  if (m.st === 3) cmFrFixture(m.home, m.away, frDn(m.d));
  if (m.st === 3 || m.st === 4) {
    // 0x5c6740: turnéens dato med denne modstander
    for (const t of S(g).t) {
      if (t.club !== org) continue;
      const sl = t.slots.find((x) => x.d === m.d && x.opp === inv);
      if (sl) { if (m.st === 3) sl.st = 3; else { sl.opp = 0; sl.st = 0; } }
    }
    removeMatch(g, m);
  } else delete m.pend;
}

/** stadionets by (cmCrowd[4]) → city.dat +0x23/+0x2b */
function cityOf(g: GameState, club: number): [number, number] | null {
  const c = g.cmCrowd?.[club]?.[4];
  const src = g.cmCities;
  if (c === undefined || c < 0 || !src || 2 * c + 1 >= src.length) return null;
  return [src[2 * c], src[2 * c + 1]];
}

/** del af Friendly::update 0x5c2460 efter 0x5c2ae0: svarene +0x34d4, oprydningen af +0x34c8 og turnédatoerne */
export function cmFrUpdate(g: GameState, today: number): void {
  const st = g.cmFrH;
  if (!st) return;
  for (const m of st.m.slice()) if (m.pend) cmFrReply(g, m);
  // 0x5c262f: tilbud uden begge hold (også menneskets åbne invitation) eller med en passeret dato slettes
  st.m = st.m.filter((m) => m.home && m.away && frDn(m.d) >= today);
  // 0x5c271c: turnédatoer, hvor dato − 2 < i dag, slettes (+0x15 = 0); en turné uden datoer forsvinder
  for (const t of st.t) t.slots = t.slots.filter((s) => frDn(s.d) - 2 >= today);
  st.t = st.t.filter((t) => t.slots.length);
}

// ------------------------------------------------------------------------------------------------ menneskets side (club_screens.cpp)

/** Friendly::find_human_club_open_invitation 0x5c68b0 */
export const cmFrOpenMatch = (g: GameState): CmFrMatch | undefined => g.cmFrH?.m.find((m) => m.org === g.userClub && m.open);
/** Friendly::find_human_club_open_dates_request 0x5c6920: turnéen med en dato uden modstander */
export const cmFrOpenTour = (g: GameState): CmFrTour | undefined => g.cmFrH?.t.find((t) => t.club === g.userClub && t.slots.some((s) => !s.opp));

/** datoskærmens Next 0x470fe0 for Home/Away Friendly: 0x5c6f00(klub, dato, 0, hjemme) og +8 = 1 – så åbner Choose Friendly Teams 0x5a0650 */
export function cmFrArrange(g: GameState, d: number, home: boolean): 'ok' | 'stadium' {
  const m = cmFrAddMatch(g, g.userClub, d, 0, home);
  if (!m) return 'stadium';
  m.open = 1;
  return 'ok';
}

/** klubskærmens knap 0x482a40: "Invite Club" (0x66 tilbuddet, 0x67 turnéen – klubben skal være i turnélandet) */
export function cmFrInviteKind(g: GameState, club: number): 'match' | 'tour' | null {
  if (!club || club === g.userClub || !g.clubs[club]) return null;
  if (cmFrOpenMatch(g)) return 'match';
  const t = cmFrOpenTour(g);
  if (t && g.clubs[club].nation === t.nation) return 'tour';
  return null;
}

/** 0x482d10 handling 0x66/0x67: datoen og om klubben kan (0x5c6b70 og 0x5c75a0 = 1 for den indbudte). `home`: mennesket er hjemme
 *  ("Invite For Friendly"/"Invite … for a friendly match") – ellers "Offer Friendly"/"Challenge … to a friendly match" */
export function cmFrInviteCheck(g: GameState, club: number): { date: string; ok: boolean; home: boolean } | null {
  const kind = cmFrInviteKind(g, club);
  if (kind === 'match') {
    const m = cmFrOpenMatch(g)!;
    const d = frDn(m.d);
    return { date: m.d, home: m.home === g.userClub, ok: cmFrFree(g, club, d) && cmFrDateStatus(g, club, d).s === 1 };
  }
  if (kind === 'tour') {
    const t = cmFrOpenTour(g)!;
    const sl = t.slots.find((s) => !s.opp)!;
    const d = frDn(sl.d);
    return { date: sl.d, home: true, ok: cmFrFree(g, club, d) && cmFrDateStatus(g, club, d).s === 1 };
  }
  return null;
}

/** Please Confirm → Yes: kode 0xc (0x482d81: den anden side = klubben, 0x5c5570, +8 = 0) og kode 0xd (0x482de3: 0x5c57d0 til turnéens første
 *  ledige dato, så 0x5c6f00(mennesket, dato, modstander, ude) + 0x5c5570 for hver tildelt dato) */
export function cmFrInvite(g: GameState, club: number): 'ok' | 'none' | 'unavailable' {
  const chk = cmFrInviteCheck(g, club);
  if (!chk) return 'none';
  if (!chk.ok) return 'unavailable';
  if (cmFrInviteKind(g, club) === 'match') {
    const m = cmFrOpenMatch(g)!;
    if (m.home === m.org) m.away = club; else m.home = club;
    cmFrSend(g, m);
    delete m.open;
    return 'ok';
  }
  const t = cmFrOpenTour(g)!;
  const sl = t.slots.find((s) => !s.opp)!;
  sl.opp = club; sl.st = 1;
  for (const s of t.slots) {
    if (s.st !== 1) continue;
    s.st = 2;
    const m = cmFrAddMatch(g, t.club, frDn(s.d), s.opp, false);
    if (m) cmFrSend(g, m);
  }
  return 'ok';
}

/** Friendly::add_friendly_dates_request 0x5c71f0: turnéen (op til 10 datoer) */
export function cmFrTour(g: GameState, nation: number, dates: number[]): 'ok' | 'none' {
  if (!dates.length || !g.nations[nation]) return 'none';
  const st = S(g);
  st.t = st.t.filter((t) => t.club !== g.userClub || t.slots.some((s) => s.opp));
  st.t.push({ club: g.userClub, nation, slots: dates.slice(0, 10).sort((a, b) => a - b).map((d) => ({ d: frIso(d), opp: 0, st: 0 })) });
  return 'ok';
}

/** 0x5c52d0: klubbens omdømme i trin 1–5 (2000/4000/6000/8000) */
export const frRepTier = (rep: number) => (rep >= 8000 ? 5 : rep >= 6000 ? 4 : rep >= 4000 ? 3 : rep >= 2000 ? 2 : 1);

/** Arrange Friendly Tour 0x471a90: landene (verdensdel +0x71, +0x84 ≤ 2, ikke eget, +0x86 ≠ 0) og om de kan vælges: under trin 4 kun samme
 *  nation +0x76, under trin 5 kun samme verdensdel */
export function cmFrTourNations(g: GameState, frNation: (n: number) => readonly number[] | undefined): { nation: number; ok: boolean }[] {
  const me = g.clubs[g.userClub];
  if (!me) return [];
  const tier = frRepTier(clubRepMem(g, me.id));
  const out: { nation: number; ok: boolean }[] = [];
  for (let n = 0; n < g.nations.length; n++) {
    const x = frNation(n);
    if (n === me.nation || !x || x[5] === undefined || x[5] < 0 || x[1] > 2 || !x[0]) continue;
    if (!Object.values(g.clubs).some((c) => c.nation === n)) continue;
    let ok = true;
    if (tier < 4 && (g.cmNation76?.[n] ?? 0) !== (g.cmNation76?.[me.nation] ?? 0)) ok = false;
    if (tier < 5 && (g.cmNationCont?.[n] ?? -1) !== (g.cmNationCont?.[me.nation] ?? -1)) ok = false;
    out.push({ nation: n, ok });
  }
  return out.sort((a, b) => (g.nations[a.nation]?.name ?? '').localeCompare(g.nations[b.nation]?.name ?? ''));
}

/** Fixtures' Cancel: 0x5c6570 (en aftalt venskabskamp – kampen slettes, den anden klub får "friendly cancelled"), 0x5c87b0 (et tilbud),
 *  0x5c85d0 (turnéen: kampene og tilbuddene på alle dens datoer) */
export function cmFrCancel(g: GameState, what: { fixture?: number; match?: string; tour?: number }): 'ok' | 'none' {
  const st = S(g);
  if (what.fixture !== undefined) {
    const f = g.fixtures[what.fixture];
    if (!f || f.comp !== FRIENDLY_COMP || f.result || (f.home !== g.userClub && f.away !== g.userClub)) return 'none';
    const other = f.home === g.userClub ? f.away : f.home;
    const H = g.clubs[f.home], A = g.clubs[f.away];
    if (H && A) asOwner(other, () => addNews({ cat: 'match', key: 'cmfr.cancelled', params: { home: H.name, away: A.name, date: f.date } }));
    for (const t of st.t) if (t.club === g.userClub) { const sl = t.slots.find((s) => s.d === f.date && s.opp === other); if (sl) { sl.opp = 0; sl.st = 0; } }
    unindexFixture(f.id, f.date);
    delete g.fixtures[f.id];
    return 'ok';
  }
  if (what.match !== undefined) {
    const m = st.m.find((x) => x.org === g.userClub && x.d === what.match && !x.open);
    if (!m) return 'none';
    removeMatch(g, m);
    return 'ok';
  }
  if (what.tour !== undefined) {
    const t = st.t[what.tour];
    if (!t || t.club !== g.userClub) return 'none';
    for (const s of t.slots) {
      for (const id of fixturesOn(s.d).slice()) { const f = g.fixtures[id]; if (f && f.comp === FRIENDLY_COMP && (f.home === t.club || f.away === t.club) && !f.result) { unindexFixture(f.id, f.date); delete g.fixtures[f.id]; } }
      st.m = st.m.filter((m) => !(m.org === t.club && m.d === s.d));
    }
    st.t.splice(what.tour, 1);
    return 'ok';
  }
  return 'none';
}

/** Invitationsskærmen 0x4744b0 (computerens tilbud til mennesket): Yes → tilstand 3, ellers 4, så 0x5c5f40 */
export function cmFrAnswer(g: GameState, date: string, org: number, yes: boolean): 'ok' | 'none' | 'unavailable' {
  const m = g.cmFrH?.m.find((x) => x.st === 2 && x.org === org && x.d === date && invitedOf(x) === g.userClub);
  if (!m) return 'none';
  // 0x5ca090: kampen kan stadig spilles? (mennesket har fået en anden kamp → "unavailable for this match")
  if (yes && !cmFrFree(g, g.userClub, frDn(m.d))) return 'unavailable';
  m.st = yes ? 3 : 4;
  cmFrReply(g, m, false);
  return 'ok';
}
/** nyhedens tilbud venter stadig på svar */
export const cmFrProposalOpen = (g: GameState, date: string, org: number) => !!g.cmFrH?.m.some((x) => x.st === 2 && x.org === org && x.d === date && invitedOf(x) === g.userClub);
