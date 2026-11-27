// CM 01/02's spejderrapport (nyheden 0x138e) – brødteksten fra SCOUT_MANAGER::write_scout_report_news_text 0x7f9d10 af nyhedens pladser
// (cmScout.ts newsOf). Nøglerne er strengenes adresser i exe'en (en.ts "cmsr.<adr>").
//   1. hvor han blev set: uden kamp "… has been watching … during recent weeks" (én spejder) / "Two of your scouts have been watching …";
//      med kamp (+0x5e): ligakamp ([0x40] = [0x42] = 0, ikke reserve) eller med rundens navn ("reserve", "friendly", ellers runden), sejr/
//      uafgjort/nederlag efter målene (resultatet "%d-%d" med det største tal først), "spotted"/"impressed" ved +0x66 = 2, ellers "watched".
//   2. vurderingen (stjernerne evne a, potentiale p): 0 a = 5, 1 a ≥ 3 og p = 5, 2 p = 5, 3 a = 4, 4 p = 4, 5 a = 3, 6 p = 3, 7 a = 2, 8 p = 2,
//      9 a = 1, ellers 10. Med flere spejdere tæller hver spejder i sin gruppe – men kun "a = 5" læses pr. spejder; resten af valget bruger den
//      første spejders stjerner (sic, 0x7fb438) – én sætning pr. gruppe: én spejder ved navn, to "Both …", tre+ "… all …".
//   3. arbejdstilladelsen (+0x58/+0x54) og EU-passet via anden nationalitet ("British" for de fem britiske/irske lande, ellers 0x6181d0).
// Ikke porteret: 0x5465a0 (beskrivelsen i stedet for positionsordet), rundens navn 0x4b4850 (vores rundenavne).
import type { GameState, NewsItem } from '../game/types';
import { CM_BRITISH } from '../game/cmPermit';
import { has, t } from '../i18n';

/** 0x5461b0 write_position_name (engelsk: den sidste skrevne vinder) */
export function positionWord(m: number): string {
  let w = '', cnt = 0;
  if (m & 1) { w = 'goalkeeper'; cnt = 1; }
  if (m & 2) { cnt++; w = 'sweeper'; }
  if (m & 4) { cnt++; w = m & 0x200 ? (!(m & 0x80) && !(m & 0x800) ? 'central defender' : 'defender') : 'full back'; }
  if (m & 8) { cnt++; if (!(m & 4) && !(m & 0x200)) w = 'attacking full back'; else if (m & 0x200) w = 'defensive midfielder'; }
  if (m & 0x10) { cnt++; w = 'midfielder'; }
  if (m & 0x20 && cnt === 0) { cnt = 1; w = m & 0x200 ? 'attacking midfielder' : m & 0x80 ? (m & 0x800 ? 'winger' : 'left winger') : 'right winger'; }
  if (m & 0x40 && m & 0x200) { cnt++; w = 'forward'; }
  if (cnt > 3) w = 'utility player';
  if (cnt === 0) w = 'player';
  return t(`cmsr.pos.${w.replace(/ /g, '_')}`);
}

const SINGLE = ['a7c800', 'a7c7ac', 'a7c76c', 'a7c744', 'a7c70c', 'a7c6dc', 'a7c6ac', 'a7c654', 'a7c5ec', 'a7c598', 'a7c51c'];
const ONE_OF = ['a7c4cc', 'a7c458', 'a7c3f8', 'a7c3b0', 'a7c358', 'a7c308', 'a7c2b8', 'a7c258', 'a7c1e8', 'a7c18c', 'a7c10c'];
const ALL = ['a7bc78', 'a7bb70', 'a7ba58', 'a7b968', 'a7b880', 'a7b798', 'a7b6b8', 'a7b5c4', 'a7b4a8', 'a7b390', 'a7b254'];
const BOTH = ['a7bc0c', 'a7bae0', 'a7b9dc', 'a7b904', 'a7b80c', 'a7b730', 'a7b64c', 'a7b548', 'a7b41c', 'a7b310', 'a7b190'];
const LISTS = ['', '', 'a7c0c0', 'a7c04c', 'a7bfb4', 'a7bef4', 'a7be04', 'a7bcf0'];
const PLAIN = { 1: { w: ['a7dae4', 'a7da34'], d: ['a7d7d8', 'a7d728'], l: ['a7d4c0', 'a7d404'] }, n: { w: ['a7d954', 'a7d888'], d: ['a7d648', 'a7d57c'], l: ['a7d318', 'a7d240'] } };
const STAGE = { 1: { w: ['a7d180', 'a7d0c0'], d: ['a7ce34', 'a7cd74'], l: ['a7cae0', 'a7ca14'] }, n: { w: ['a7cfd0', 'a7cef4'], d: ['a7cc88', 'a7cbac'], l: ['a7c918', 'a7c830'] } };

/** vurderingens gruppe af evne og potentiale (0x7fb1fa / 0x7fb438) */
export function ratingCat(a: number, p: number): number {
  if (a === 5) return 0;
  if (a >= 3 && p === 5) return 1;
  if (p === 5) return 2;
  if (a === 4) return 3;
  if (p === 4) return 4;
  if (a === 3) return 5;
  if (p === 3) return 6;
  if (a === 2) return 7;
  if (p === 2) return 8;
  if (a === 1) return 9;
  return 10;
}

const num = (n: number) => { const w = has(`num.${n}`) ? t(`num.${n}`) : String(n); return w.charAt(0).toUpperCase() + w.slice(1); };
const k = (key: string, p: Record<string, string | number> = {}) => t(`cmsr.${key}`, p);

/** 0x7f9d10 (del 1): brødteksten */
export function cmScoutReportBody(g: GameState, n: NewsItem): string {
  const q = n.params;
  const cnt = Math.min(3, Number(q.n) || 1), mode = Number(q.mode);
  const club = g.clubs[Number(q.club)];
  const base = { player: String(q.player ?? ''), last: String(q.last ?? ''), age: Number(q.age), pos: positionWord(Number(q.pos) || 0), club: club?.short ?? club?.name ?? '' };
  const parts: string[] = [];
  // 1. hvor han blev set
  if (q.mt === undefined) parts.push(cnt === 1 ? k('a7dc34', { ...base, scout: String(q.s0 ?? '') }) : k('a7db94', { ...base, num: num(cnt) }));
  else {
    const gf = Number(q.gf), ga = Number(q.ga);
    const res = gf > ga ? 'w' : gf === ga ? 'd' : 'l';
    const comp = String(q.comp ?? ''), rsv = Number(q.rsv) === 1;
    const plain = !rsv && g.comps[comp]?.type === 'league';
    const friendly = comp === 'FRIENDLY';
    const stage = rsv ? k('reserve') : friendly ? k('friendly') : q.stg && has(`stage.${q.stg}`) ? t(`stage.${q.stg}`) : g.comps[comp]?.name ?? '';
    const tab = (plain ? PLAIN : STAGE)[cnt === 1 ? 1 : 'n'][res];
    parts.push(k(tab[mode === 2 ? 0 : 1], { ...base, scout: String(q.s0 ?? ''), num: num(cnt), team: g.clubs[Number(q.mt)]?.name ?? '', opp: g.clubs[Number(q.mo)]?.name ?? '',
      score: `${Math.max(gf, ga)}-${Math.min(gf, ga)}`, stage }));
  }
  // 2. vurderingen
  const ab = (i: number) => Number(q[`a${i}`]) || 0, po = (i: number) => Number(q[`p${i}`]) || 0;
  if (cnt === 1) parts.push(k(SINGLE[ratingCat(ab(0), po(0))], { ...base, slast: String(q.l0 ?? '') }));
  else {
    const cat = Array.from({ length: cnt }, (_, i) => (ab(i) === 5 ? 0 : ratingCat(ab(0), po(0))));
    for (let c = 0; c <= 10; c++) {
      const who = cat.map((x, i) => (x === c ? i : -1)).filter((i) => i >= 0);
      if (!who.length) continue;
      if (who.length === 1) { parts.push(k(ONE_OF[c], { ...base, scout: String(q[`s${who[0]}`] ?? '') })); continue; }
      const names: Record<string, string> = {};
      who.forEach((i, j) => { names[`n${j + 1}`] = String(q[`s${i}`] ?? ''); });
      const list = k(LISTS[Math.min(who.length, 7)], names);
      parts.push(k((who.length > 2 ? ALL : BOTH)[c], { ...base, list }));
    }
  }
  // 3. arbejdstilladelsen
  const permit = Number(q.permit);
  if (permit === 1) parts.push(Number(q.granted) ? (cnt === 1 ? k('a711d0') : k('a7b124', base)) : cnt === 1 ? k('a71180') : k('a7b0d8'));
  else if (permit === 2) {
    const n2 = g.nations[Number(q.nat2)];
    const nat = n2 && CM_BRITISH.has(n2.name) ? k('british') : n2?.adj ?? n2?.name ?? '';
    parts.push(k('a71224', { ...base, anNat: k(/^[AEIOU]/i.test(nat) ? 'anNat.an' : 'anNat.a', { nat }) }));
  }
  return parts.filter(Boolean).join('\n\n');
}
