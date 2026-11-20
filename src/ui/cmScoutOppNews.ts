// CM 01/02's Next Opposition-rapport (nyheden 0x138a med +0x19d, cmScoutAsg.ts) – teksten 0x7be670, kaldt fra 0x7b81f0's gren 0x7b8e0f
// (cm0102.exe 3.9.68). Pladserne: nøglespillerne (højst to – pid:flag:CA, faldende skøn), holdets bytes (0x549100…0x549940 i 0x7b81f0's
// rækkefølge, +0xc stemningen) og niveauet 0x549a30. Ved visningen (som originalen): klubbernes omdømme (+0x80), managerens ikke-spillerpost
// (formationen +0x43, Attacking +0xe, Directness +0x13) og navnene.
//   1. formationen: manageren (club +0xcf, ellers assistenten +0xd3) – stilen (0x7be820) og formationen (+0x43 1..9, ellers 4-4-2); uden
//      person "… are expected to play a 4-4-2 formation."
//   2. niveauet 0..6 (0x7be9ec, springtabellen 0x7bfbb0) med stemningen < −3 ("poor league position") og Work Rate-byten +0xb
//   3. niveau < 2: svaghederne (luftspil +5, fart +7, angreb/midtbane +0/+2, forsvar +1); ellers en skadet nøglespiller, så parrene
//      (midtbane/angriber, to angribere, to midtbanespillere, to forsvarere) og enkeltspillerne; uden nogen skriver 0x7bfa1c holdets
//      styrke over niveausætningen.
//   Teksten: "%s\n\n%s\n\n%s" (formation, niveau, 3.), "%s\n\n%s" eller "%s".
// Afvigelse: 0x7bf7e9 læser den ANDEN midtbanespillers flag (& 1, "Tricky winger") – med kun én er pladsen uinitialiseret i exe'en; her 0.
// Ikke porteret: spillernes links i teksten (0x7b8e9d – navnene står som tekst; nyheden linker til klubben).
import type { GameState, NewsItem, Player, Staff } from '../game/types';
import { clubRepMem } from '../game/cmPlayerData';
import { cmPrefFormation, tacByte } from '../game/cmStaff';
import { t } from '../i18n';

const k = (key: string, p: Record<string, string | number> = {}) => t(`cmsn.${key}`, p);
const s8 = (v: number) => (v << 24) >> 24;
const s16 = (v: number) => (v << 16) >> 16;
const full = (p: Player) => `${p.first} ${p.last}`.trim();
const short = (p: Player) => p.last || p.first;
/** 0x53dba0(s, …, 1): databasens fællesnavn, ellers "fornavn efternavn" (spillets navne har intet fællesnavn) */
const staffName = (s: Staff) => `${s.first} ${s.last}`.trim();

interface Key { pid: number; fl: number; ca: number; p?: Player }

/** titlens klubnavn (club +0x38) */
export function cmNextOppTitle(g: GameState, n: NewsItem): string {
  const c = g.clubs[Number(n.params.oc)];
  return c ? c.short || c.name : '';
}

/** 0x7be670 */
export function cmNextOppBody(g: GameState, n: NewsItem): string {
  const q = n.params;
  const opp = g.clubs[Number(q.oc)], me = g.clubs[Number(q.mc)];
  if (!opp || !me) return k('a759b4');
  const oName = opp.short || opp.name, mName = me.short || me.name;
  const kp: Key[] = String(q.kp ?? '').split('|').filter(Boolean).map((x) => { const [pid, fl, ca] = x.split(':').map(Number); return { pid, fl, ca, p: g.players[pid] }; });
  const tf = String(q.tf ?? '').split(',').map(Number);
  const T = (i: number) => tf[i] || 0;
  const lv = Number(q.lv) || 0;
  const orep = s16(clubRepMem(g, opp.id)), mrep = s16(clubRepMem(g, me.id));
  const mood = s8(T(12)), wr = T(11);

  // 1. 0x7be74f: manageren, ellers assistenten
  const mgr = g.staff[opp.manager] ?? Object.values(g.staff).find((s) => s.club === opp.id && s.role === 'assistant');
  let para1: string;
  if (!mgr || (!mgr.cmNp && !mgr.tac)) para1 = k('a77fa4', { club: oName });
  else {
    const form = cmPrefFormation(mgr) ?? '4-4-2';
    const e = s8(tacByte(mgr, 0x0e)), d = s8(tacByte(mgr, 0x13));
    const style = e >= 15 && d >= 15 ? 'a78258' : e >= 15 && d <= 5 ? 'a78220' : e <= 5 && d >= 15 ? 'a781ec' : e <= 5 && d <= 5 ? 'a781b4'
      : e >= 15 ? 'a78258' : e <= 5 ? 'a78188' : d >= 15 ? 'a78160' : d <= 5 ? 'a78138' : null;
    para1 = style ? k('a78084', { mgr: staffName(mgr), club: oName, style: k(style), form }) : k('a77ff4', { mgr: staffName(mgr), club: oName, form });
  }

  // 2. 0x7be9ec: niveauet
  const poor = mood < -3;
  const lvKey = lv === 6 ? (poor ? 'a77f30' : 'a77eec')
    : lv === 5 ? (wr && orep < mrep ? 'a77e90' : poor ? 'a77e14' : 'a77dd0')
    : lv === 4 ? (wr && orep < mrep ? 'a77d8c' : poor ? 'a77d10' : 'a77cd4')
    : lv === 3 ? (wr ? 'a77c8c' : 'a77c48')
    : lv === 2 ? 'a77a54'
    : lv === 1 ? (poor ? 'a77bbc' : !wr && orep > mrep ? 'a77b70' : 'a77b2c')
    : lv === 0 ? (!wr && orep > mrep ? 'a77adc' : 'a77a98') : null;
  const level = lvKey ? k(lvKey, { club: oName }) : null;

  // 0x7bfbd0/0x7bfc50/0x7bfcd0: midtbane (0x400), angribere (0x100), forsvarere (0x200) – databasens spillere, ikke skadede (0x40000)
  const pick = (bit: number) => kp.filter((x) => x.p && !x.p.regen && !(x.fl & 0x40000) && x.fl & bit);
  const M = pick(0x400), S = pick(0x100), D = pick(0x200);
  const top = kp[0];

  let extra: string | null = null;
  if (lv < 2) {
    // 0x7bec59: svaghederne
    if (T(5) && !wr && orep > mrep) extra = k('a77a1c');
    else if (T(5)) extra = k('a77998', { club: mName });
    else if (T(7)) extra = k('a77924', { club: mName });
    else if (T(0) && T(2)) extra = k('a778ac', { club: mName });
    else if (T(1)) extra = !T(2) && !T(0) ? k('a77858') : k('a77828');
  } else if (top && top.fl & 0x40000) {
    // 0x7bed85: den første nøglespiller er skadet
    const key = top.fl & 0x200 ? 'a777c8' : top.fl & 0x400 ? 'a77764' : top.fl & 0x100 ? 'a77704' : 'a776a8';
    extra = k(key, { player: top.p ? full(top.p) : '' });
  } else {
    extra = keyPlayers(g, kp, M, S, D, oName, mName);
    if (extra === null) {
      // 0x7bfa1c: holdets styrke – skrives over niveausætningen
      const f0 = T(0), f1 = T(1), f2 = T(2);
      const key = f1 ? (f2 && f0 ? 'a75d48' : !f2 && !f0 ? 'a75cd0' : 'a75b88')
        : f2 && f0 ? 'a75bfc' : T(4) ? 'a75aec' : T(9) ? 'a75a74' : null;
      if (key) return [para1, k(key, { club: key === 'a75bfc' ? mName : oName, opp: oName })].join('\n\n');
    }
  }
  return [para1, level, extra].filter((x): x is string => !!x).join('\n\n');
}

/** 0x7bee90–0x7bfa17: parrene og enkeltspillerne; null = ingen (0x7bfa1c) */
function keyPlayers(g: GameState, kp: Key[], M: Key[], S: Key[], D: Key[], oName: string, mName: string): string | null {
  void g;
  const top = kp[0];
  const nm = (x: Key | undefined) => (x?.p ? full(x.p) : '');
  const tf = top?.fl ?? 0;
  const m0 = M[0]?.fl ?? 0, m1 = M[1]?.fl ?? 0, s0 = S[0]?.fl ?? 0;
  // 0x7bee90: kreativ midtbanespiller og angriber
  if (S.length && M.length && m0 & 1) {
    if (m0 & 0x1000 && m0 & 0x4000) return k('a775e0', { striker: nm(S[0]), winger: nm(M[0]), club: mName });
    if (s0 & 4) return k('a774a0', { striker: nm(S[0]), mid: nm(M[0]), club: mName, midShort: M[0].p ? short(M[0].p) : '', strShort: S[0].p ? short(S[0].p) : '' });
    return k('a77410', { mid: nm(M[0]), striker: nm(S[0]) });
  }
  if (S.length > 1 && tf & 0x100) return k('a7737c', { a: nm(S[0]), b: nm(S[1]) });
  if (M.length > 1 && tf & 0x400) {
    // 0x7bf1a1: (sic) andet tilfælde nævner wingbacken som playmakeren
    if (m0 & 0x1000 && m1 & 1) return k(m0 & 0x2000 ? 'a772e0' : 'a77244', { a: nm(M[1]), b: nm(M[0]) });
    if (m1 & 0x1000 && m0 & 1) return m1 & 0x2000 ? k('a772e0', { a: nm(M[1]), b: nm(M[0]) }) : k('a77244', { a: nm(M[0]), b: nm(M[1]) });
    return k('a771c0', { a: nm(M[0]), b: nm(M[1]) });
  }
  if (D.length > 1 && tf & 0x200) return k('a7712c', { a: nm(D[0]), b: nm(D[1]), club: oName });
  if (S.length && tf & 0x100) return striker(S[0], oName, mName);
  if (M.length) {
    // 0x7bf7e9: "Tricky winger" efter den anden midtbanespillers Creativity-flag (sic)
    if (m0 & 0x1000 && tf & 0x400) return k(m1 & 1 ? 'a76178' : 'a760f8', { player: nm(M[0]) });
    if (tf & 0x400 && m0 & 1) return k('a7607c', { player: nm(M[0]) });
    if (tf & 0x400 && m0 & 2) return k('a75fe8', { player: nm(M[0]) });
  }
  if (D.length) {
    const f = D[0].fl;
    return k(f & 0x80 ? 'a75f5c' : f & 0x80000 ? 'a75edc' : 'a75e70', { player: nm(D[0]), club: oName });
  }
  if (M.length) return k('a75dec', { player: nm(M[0]), club: oName });
  return null;
}

/** 0x7bf333: én angriber – alder, ny, ung, så CA-trinene 160/125/100 med formen, målene, farten og luftspillet */
function striker(x: Key, oName: string, mName: string): string {
  const f = x.fl, ca = s16(x.ca), player = x.p ? full(x.p) : '';
  const air = f & 0x20, pow = f & 0x20 && f & 2;
  if (f & 0x10000) return k('a770a4', { player });
  if (f & 0x20000) return k('a7700c', { player, club: mName });
  if (f & 0x8000) return k('a76fb8', { player });
  if (ca > 160) {
    if (f & 0x1000000 && f & 0x200000) return k('a76ea4', { player, club: oName, opp: mName });
    if (f & 0x100000) return k('a76dec', { player, club: mName });
    if (f & 4) return k('a76d34', { player, club: mName });
    if (pow) return k('a76c94', { player, club: mName });
    return k(air ? 'a76bdc' : 'a76b48', { player, club: mName });
  }
  if (ca < 100) {
    const cons = f & 0x80000;
    if (cons && f & 0x1000000 && f & 0x200000) return k('a76ae0', { player });
    if (cons && f & 0x800000 && f & 0x200000) return k('a76a2c', { player, club: mName });
    if (cons && f & 0x800000) return k('a7699c', { player, club: mName });
    if (f & 0x400000 && f & 0x1000000) return k('a768ec', { player, club: mName });
    if (f & 4) return k('a76854', { player, club: mName });
    if (pow) return k('a767ac', { player, club: mName });
    if (air) return k('a766d8', { player, club: oName });
    return k('a7666c', { player });
  }
  if (ca < 125) {
    if (f & 0x80000) return k('a765f8', { player });
    if (pow) return k('a76564', { player, club: mName });
    return air ? k('a76494', { player, club: mName }) : k('a7641c', { player });
  }
  if (f & 1) return k('a763ac', { player });
  if (pow) return k('a76300', { player, club: mName });
  return air ? k('a76230', { player, club: mName }) : k('a761c0', { player });
}
