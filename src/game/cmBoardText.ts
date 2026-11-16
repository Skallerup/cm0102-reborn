// Bestyrelsens tekster som i originalen (MANAGER_MANAGER, manager_manager.cpp 3.9.68) – kun den originale database i ægte tilstand.
// Kilde: ~/cm0102-engine/notes/board/notes-D-expect.md (afkodet af exe'en; teksterne ordret fra exe'ens strenge).
//
//   0x6a4ae0 news_board_expectations_text: overskriften ("Board want the title" …) og brødteksten 0x694440 build_board_expectation_text
//   0x6a4d40 news_board_confidence_update_text: "Board Confidence Update" + 0x690d80
//   0x690d80 build_board_confidence_text (504 blade: dage i jobbet, formuebånd 0x5986b0, ligabånd 0x690bd0, tillidsbånd 0x690b70,
//            løbet 0x690c30) – også Board Confidence-skærmen 0x6b2080 (manager_screens.cpp)
//   0x6a9470 svaret på Board Request (stadionudvidelsen)
//
// Ikke porteret: 0x693850 build_board_squad_opinion_text (formandens favoritter/uvenner blandt spillerne – kræver formandens
// relationer), som originalen tilføjer efter tillidsteksten, når formanden har nogen.
//
// Sprog: teksterne ligger i én pakke pr. sprog (`BoardPack`, src/i18n/boardPack.ts, data/cmBoard.<sprog>.json) og vælges ved visning
// (nyhederne gemmer, hvad der skal til for at bygge dem igen). Engelsk = originalens ordlyd (data/cmBoard.en.json + bladene i cmBoardTexts.json);
// et sprog, hvis pakke ikke er hentet, falder tilbage til engelsk.
import T from './data/cmBoardTexts.json';
import EN_JSON from './data/cmBoard.en.json';
import { getLang } from '../i18n';
import { boardPack, possessive, type BoardPack } from '../i18n/boardPack';

const D = T as { S: string[]; t60: number[][][][]; t30: number[][][]; t0: number[] };
const EN = { ...(EN_JSON as unknown as Omit<BoardPack, 'S'>), S: D.S } as BoardPack;
/** Pakken for det valgte sprog (engelsk, hvis sprogets pakke ikke findes) */
const P = (): BoardPack => boardPack(getLang()) ?? EN;
const fill = (s: string, club: string, n = 0) => s.replace(/\{club\}/g, club).replace(/\{n\}/g, String(n));

// ---------------------------------------------------------------- forventningerne (0x6a4ae0 / 0x694440)

/** 0x6a4ae0 overskriften (want_body = 0); `fa` = id > clubCount − 2·nationCount (landshold) */
export function expectTitle(f: number, fa = false): string {
  const t = P().title;
  if (fa) return t.fa;
  return f & 0x400 ? t.glory : f & 0x002 ? t.title : f & 0x085 ? t.hope : f & 0x030 ? t.difficult : f & 0x308 ? t.look : t.announce;
}

/** 0x694440 brødteksten. `nonEurope` = klubbens land ligger uden for Europa ("Continental"), `autoPromo` = divisionen har direkte oprykning.
 *  Finansvarianterne (bit 0x800) er udeladt: bitten sættes ingen steder i originalen (notes-D-expect.md §5.6). */
export function expectBody(club: string, f: number, nonEurope: boolean, autoPromo: boolean): string {
  const E = P().expect;
  const pick = (a: string[]) => a[f & 0x400 ? 1 : f & 0x100 ? 2 : 0];
  let s: string;
  if (f & 1) s = (nonEurope ? E.e1con : E.e1eu)[f & 0x400 ? 0 : f & 0x100 ? 1 : 2];
  else if (f & 2) s = f & (0x400 | 0x100) ? E.e2[0] : autoPromo ? E.e2[1] : E.e2[2];
  else if (f & 4) s = pick(E.promo);
  else if (f & 8) s = pick(E.playoff);
  else if (f & 0x40) s = pick(E.mid);
  else if (f & 0x10) s = pick(E.safe);
  else if (f & 0x20) s = pick(E.fight);
  else s = E.improve;
  return fill(s, club);
}

// ---------------------------------------------------------------- tilliden (0x690d80)

export interface ConfidenceIn {
  club: string;
  /** dage i jobbet: (år − ansat år)·365 − ansat dag + dag (0x6b2080 / 0x6a4c40) */
  days: number;
  /** 0x5986b0 −2…2, 0x690bd0 (B+0x12) og 0x690b70 (B+6) 0…6, 0x690c30 type 1…5 og længde */
  wealth: number; leagueBand: number; confBand: number; runType: number; runLen: number;
  /** halen: dage siden B+0x41 ("arrogance"), B+6 og B+0x16 (fansene) */
  arrogDays: number; conf: number; fans: number;
  /** landshold: nationaliteten ("English") – så bruges FA-teksterne */
  national?: string;
}

/** 0x690d80 build_board_confidence_text */
export const confidenceTitle = () => P().title.confidence;
export function confidenceText(i: ConfidenceIn): string {
  const p = P(), TAIL_ = p.tail, SS = p.S;
  const W = Math.max(-2, Math.min(2, i.wealth)) + 2;
  let main: string;
  if (i.national !== undefined) {
    const v = i.conf;
    main = p.faConf[v > 9500 ? 0 : v > 8500 ? 1 : v > 6500 ? 2 : v > 4275 ? 3 : v > 3500 ? 4 : 5].replace(/\{national\}/g, i.national);
  } else {
    if (i.days < 30) return fill(SS[D.t0[W]], i.club);
    const T5 = Math.max(1, Math.min(5, i.runType)) - 1;
    if (i.days < 60) return fill(SS[D.t30[W][i.confBand][T5]], i.club, i.runLen);
    main = fill(SS[D.t60[W][i.leagueBand][i.confBand][T5]], i.club, i.runLen);
  }
  // halen 0x693267 (dage ≥ 60 og landshold)
  let extra = '';
  if (i.arrogDays < 120 && i.conf < 6500) {
    if (i.conf > 4275) main = fill(i.fans > 1500 ? TAIL_.a1 : TAIL_.a2, i.club);
    else if (i.conf > 3500) main = fill(i.fans > 1500 ? TAIL_.a3 : TAIL_.a4, i.club);
  } else if (i.fans < -750) { if (i.conf < 3750) extra = TAIL_.f1; else if (i.conf < 5500) extra = TAIL_.f2; }
  else if (i.fans < -500) extra = TAIL_.f3;
  else if (i.fans > 1500) extra = TAIL_.f4;
  return extra ? `${main}\n\n${extra}` : main;
}

// ---------------------------------------------------------------- Board Request (0x6a9470)

/** 0x6a9470 overskriften pr. anmodning (1–6; ellers "oranges"). NB: anmodning 2 (træningsanlægget) har overskriften om ungdommen i originalen */
export const requestTitle = (req: number) => P().reqTitle[req] ?? P().reqTitle.def;

/** 0x6a9470 (want_body): klubbens lange navn, anmodningen og svarkoden fra 0x6a8810.
 *  Svarteksterne pr. anmodning (1 stadion, 2 træningsanlæg, 3 transferpenge 0x6a9812: koder 0..8, 4 løn 0x6a99f5: koder 0..6); koder uden for
 *  tabellen giver standardteksten. Anmodning 5 (tid): kode 0, 4, 6; ellers 0xa10234. */
export function requestReply(club: string, req: number, code: number): string {
  const p = P();
  let s: string;
  if (code === 0xc) s = p.rq.c;
  else if (code === 0xa) s = p.rq.a;
  else if (req === 5) s = p.time[code] ?? p.time.def;
  else { const [list, def] = p.reply[req] ?? [[], '']; s = list[code] ?? def; }
  return fill(s, club);
}

// ---------------------------------------------------------------- ultimatummet (0x9064a0 bekræftelsen, 0x6adb70 nyheden 0x178f)

/** 0x906610 "Please Confirm" (0xaa1bbc/0xaa1ca8/0xaa1da0, ellers 0xaa1e94) med klubbens korte navn (club +0x38) */
export function ultimatumConfirm(short: string, req: number): string {
  const p = P();
  return p.ultConfirm.replace(/\{what\}/g, p.ultWhat[req] ?? p.ultWhat.def).replace(/\{short\}/g, short);
}

/** 0x6adb70 overskriften: type 1 = "{kort navn} fans respond to speculation"; type 3: svar 2/3/4 = afslag, ellers ja (anmodning 4 deler 3's tekst) */
export function ultimatumTitle(type: number, req: number, res: number, short: string): string {
  const t = P().ultTitle;
  if (type === 1) return t.fans.replace(/\{short\}/g, short);
  const k = res === 2 || res === 3 || res === 4 ? 1 : 0;
  return (req === 1 ? t.stadium : req === 2 ? t.training : t.funds)[k];
}

/** 0x6adb70 brødteksten: klubbens lange navn (club +4), managerens navn (0x53dba0) og stadionets navn; `sub` = slot 7 (type 1: 1 kritisk /
 *  2 forstående; type 3: svaret), `small`/`poor` = slot 9/10 (tilhængernes stadion-/træningsflag). Tilhængerne (0xa13050 … 0xa13ffc): kritisk (slot 7 = 1)
 *  og forstående (2) pr. anmodning; anmodning 1 og 2 har to kritiske varianter. Bestyrelsens svar (0xa141c4 … 0xa14d30) pr. svarkode
 *  (1 ja, 2 fyret, 3 tilgivet) og anmodning 1–4; 4 = "inexperienced" (0xa14e5c, alle) */
export function ultimatumBody(type: number, req: number, sub: number, club: string, manager: string, stadium: string, small: boolean, poor: boolean): string {
  let s: string;
  const p = P(), FA = p.fans, BO = p.board;
  const i = req === 1 ? 0 : req === 2 ? 1 : req === 3 ? 2 : 3;
  if (type === 1) {
    if (sub === 2) s = [FA.s2, FA.t2, FA.f2, FA.w2][i];
    else s = req === 1 ? (small ? FA.s1b : FA.s1) : req === 2 ? (poor ? FA.t1 : FA.t1b) : req === 3 ? FA.f1 : FA.w1;
  } else if (sub === 4) s = p.inexp;
  else s = BO[sub]?.[i] ?? '';
  return s.replace(/\{club\}/g, club).replace(/\{m's\}/g, possessive(boardPack(getLang()) ? getLang() : 'en', manager)).replace(/\{m\}/g, manager).replace(/\{stadium\}/g, stadium);
}

/** 0x6a3060 brødteksten for ansættelsen: uden forrige klub 0xa09e18, fra en anden klub (art 3) 0xa0a2f8 */
export function appointText(club: string, manager: string, prevClub: string): string {
  const a = P().appoint;
  return (prevClub ? a.prev : a.plain).replace(/\{club\}/g, club).replace(/\{manager\}/g, manager).replace(/\{prevClub\}/g, prevClub);
}

// ---------------------------------------------------------------- nyhedernes tekst bygges ved visning

/** Det, der skal til for at bygge en bestyrelsesnyhed igen på det valgte sprog (gemt som JSON i nyhedens `bd`) */
export type BoardCmDesc =
  | { k: 'e'; club: string; f: number; ne: boolean; ap: boolean }
  | { k: 'c'; i: ConfidenceIn }
  | { k: 'r'; club: string; req: number; code: number }
  | { k: 'u'; type: number; req: number; res: number; sub: number; club: string; short: string; m: string; st: string; small: boolean; poor: boolean };

export function boardCmText(d: BoardCmDesc): { title: string; body: string } {
  switch (d.k) {
    case 'e': return { title: expectTitle(d.f), body: expectBody(d.club, d.f, d.ne, d.ap) };
    case 'c': return { title: confidenceTitle(), body: confidenceText(d.i) };
    case 'r': return { title: requestTitle(d.req), body: requestReply(d.club, d.req, d.code) };
    default: return { title: ultimatumTitle(d.type, d.req, d.res, d.short), body: ultimatumBody(d.type, d.req, d.sub, d.club, d.m, d.st, d.small, d.poor) };
  }
}
