// CM 01/02's nyheder om spejderopgaverne (cmScoutAsg.ts) – teksterne af nyhedens pladser som originalens tekstfunktioner (cm0102.exe 3.9.68):
//   0x1389 (0x7b7840) "… search started" / "Scout X has started his … search, and will report back with his findings."
//   0x138a (0x7b81f0) "… search update/completed" – antallet 0, 1 eller flere, "so far" eller "has completed"
//   0x138b (0x7b95c0) "Recommended player in … search": vurderingen af stjernerne (evne a, potentiale p): uden kamp a = 5, p = 5, a = 4, p = 4,
//            a = 3, p = 3, a = 2, p = 2, a = 1, ellers "does not believe … good enough" – med "of <klub>", når han har en klub; med kampen
//            (turneringssøgningens 5-stjernede fund): a = 5 eller (a = 4 og p = 5) "an excellent signing", a = 3 og p = 5 "a good signing",
//            ellers p = 5 "an excellent prospect for the future" – sejr/uafgjort/nederlag, ligakamp uden stadie, ellers med stadiet
//            ("reserve", "Friendly", runden). Derefter styrkerne (0x7bdee0 af ordet fra 0x7bd9d0) og arbejdstilladelsen.
// Nøglerne er strengenes adresser i exe'en (en.ts "cmsn.<adr>"; fælles tekster fra 0x138e under "cmsr.").
// Ikke porteret: 0x5465a0 (beskrivelsen i stedet for positionsordet), rundens navn 0x4b4850 (vores rundenavne) – som i 0x138e.
import type { GameState, NewsItem } from '../game/types';
import { CM_BRITISH } from '../game/cmPermit';
import { compName, has, natName, t } from '../i18n';
import { positionWord } from './cmScoutNews';

const k = (key: string, p: Record<string, string | number> = {}) => t(`cmsn.${key}`, p);
const REG = ['', 'Africa', 'Asia', 'Caribbean', 'CentralAmerica', 'CentralEurope', 'EasternEurope', 'MiddleEast', 'NorthAfrica', 'NorthAmerica', 'Oceania',
  'Scandinavia', 'SouthAmerica', 'SouthernEurope', 'UK'];
/** 0x616f20 (stil −1: "Scandinavia", stil 1: "Scandinavian") */
export const cmRegionName = (r: number, adj = false) => (r >= 1 && r <= 14 ? t(`cmsn.reg${adj ? 'A' : ''}.${REG[r]}`) : '');

/** pladsernes navne til overskriften og brødteksten: {nat} (nationalitetsordet, 0x6181d0 stil 1), {reg}, {comp} */
export function cmScoutAsgParams(g: GameState, n: NewsItem, p: Record<string, string | number>): void {
  const q = n.params;
  const nat = g.nations[Number(q.nation)];
  // engelsk som originalen: nationalitetsordet ("French search"); de andre sprog: landets/regionens navn ("søgning i Frankrig")
  const en = t('cl.locale').startsWith('en');
  if (Number(q.nation) >= 0 && nat) p.nat = en ? nat.adj ?? natName(nat.name) : natName(nat.name);
  if (Number(q.region) >= 1) p.reg = cmRegionName(Number(q.region), en);
  if (q.comp) p.comp = compName(g.leagues[String(q.comp)]?.name ?? g.comps[String(q.comp)]?.name) ?? String(q.comp);
  p.body = cmScoutAsgBody(g, n, p);
}

const ix = (q: Record<string, string | number>) => (Number(q.nation) >= 0 ? 0 : Number(q.region) >= 1 ? 1 : q.comp ? 2 : Number(q.youth) ? 3 : -1);
const STARTED = ['a7048c', 'a70420', 'a703b4', 'a7032c'];
/** [færdig 0, 1, n, hidtil 0, 1, n] pr. opgavetype */
const DONE = [['a70fb4', 'a70f4c', 'a70ed8', 'a70e74', 'a70e10', 'a70da4'], ['a70d30', 'a70cc8', 'a70c54', 'a70bf0', 'a70b8c', 'a70b20'],
  ['a70aac', 'a70a44', 'a709d0', 'a7096c', 'a70908', 'a7089c'], ['a70828', 'a707bc', 'a70754', 'a706f8', 'a7069c', 'a7063c']];
/** 0x7bbe86: [med klub, uden] for a = 5, p = 5, a = 4, p = 4, a = 3, p = 3, a = 2, p = 2, a = 1, ellers */
const PLAIN: [string, string][] = [['a71c60', 'a71bf0'], ['a71b60', 'a71ae0'], ['a71a64', 'a719fc'], ['a71970', 'a718f8'], ['a71874', 'a71804'], ['a7177c', 'a71708'],
  ['a7167c', 'a71600'], ['a71564', 'a714dc'], ['a71454', 'a713e0'], ['a71354', 'a712d8']];
/** med kampen: [liga sejr, uafgjort, nederlag, stadie sejr, uafgjort, nederlag] for "excellent signing", "good signing", "excellent prospect" */
const MATCH = { ex: ['a72100', 'a72038', 'a71f6c', 'a71e94', 'a71dbc', 'a71ce0'], good: ['a74f28', 'a72510', 'a72448', 'a72374', 'a722a4', 'a721cc'],
  pros: ['a74d84', 'a74cb0', 'a74bd8', 'a74aec', 'a74a08', 'a74920'] };

function cmScoutAsgBody(g: GameState, n: NewsItem, p: Record<string, string | number>): string {
  const q = n.params, i = ix(q);
  const key = n.key.slice(5);
  const base = { scout: String(q.scout ?? ''), nat: String(p.nat ?? ''), reg: String(p.reg ?? ''), comp: String(p.comp ?? '') };
  // 0x1389
  if (['a70304', 'a702dc', 'a702b4', 'a7029c'].includes(key)) return i < 0 ? '' : k(STARTED[i], { ...base, what: k('a70398') });
  // 0x138a
  if (['a70614', 'a705c4', 'a70574', 'a70534', 'a705ec', 'a7059c', 'a7054c', 'a70520'].includes(key)) {
    if (i < 0) return '';
    const cnt = Number(q.n) || 0, done = Number(q.done) === 1;
    return k(DONE[i][(done ? 0 : 3) + (cnt === 0 ? 0 : cnt === 1 ? 1 : 2)], { ...base, n: cnt, what: k('a7088c') });
  }
  return recBody(g, n);
}

/** 0x7b95c0 brødteksten (pladsen 0x88 = 0: "Recommended player …") */
function recBody(g: GameState, n: NewsItem): string {
  const q = n.params;
  const a = Number(q.ab) || 0, pt = Number(q.pt) || 0;
  const club = g.clubs[Number(q.club)];
  const base = { scout: String(q.scout ?? ''), age: Number(q.age), pos: positionWord(Number(q.pos) || 0), player: String(q.player ?? ''), club: club?.name ?? '' };
  const parts: string[] = [];
  if (q.mt === undefined) {
    const c = a === 5 ? 0 : pt === 5 ? 1 : a === 4 ? 2 : pt === 4 ? 3 : a === 3 ? 4 : pt === 3 ? 5 : a === 2 ? 6 : pt === 2 ? 7 : a === 1 ? 8 : 9;
    parts.push(k(PLAIN[c][club ? 0 : 1], base));
  } else {
    const gf = Number(q.gf), ga = Number(q.ga);
    const res = gf > ga ? 0 : gf === ga ? 1 : 2;
    const comp = String(q.mcomp ?? ''), rsv = Number(q.rsv) === 1;
    const plain = !rsv && g.comps[comp]?.type === 'league';
    const friendly = comp === 'FRIENDLY' || comp.startsWith('FR');
    const stage = rsv ? t('cmsr.reserve') : friendly ? k('friendly') : q.stg && has(`stage.${q.stg}`) ? t(`stage.${q.stg}`) : g.comps[comp]?.name ?? '';
    const tab = a === 5 || (a === 4 && pt === 5) ? MATCH.ex : a === 3 && pt === 5 ? MATCH.good : MATCH.pros;
    parts.push(k(tab[(plain ? 0 : 3) + res], { ...base, team: g.clubs[Number(q.mt)]?.name ?? '', opp: g.clubs[Number(q.mo)]?.name ?? '',
      score: `${Math.max(gf, ga)}-${Math.min(gf, ga)}`, stage }));
  }
  // 0x7bdee0: styrkerne (svaghederne er altid 0 – se cmScoutAsg.ts)
  const extra = goodText(Number(q.good) || 0, String(q.slast ?? ''), String(q.last ?? ''));
  if (extra) parts.push(extra);
  // arbejdstilladelsen
  const permit = Number(q.permit);
  if (permit === 1) parts.push(Number(q.granted) ? t('cmsr.a711d0') : a >= 4 || pt >= 4 ? k('a71124') : t('cmsr.a71180'));
  else if (permit === 2) {
    const n2 = g.nations[Number(q.nat2)];
    const nat = n2 && CM_BRITISH.has(n2.name) ? t('cmsr.british') : n2?.adj ?? n2?.name ?? '';
    parts.push(t('cmsr.a71224', { last: String(q.last ?? ''), anNat: t(/^[AEIOU]/i.test(nat) ? 'cmsr.anNat.an' : 'cmsr.anNat.a', { nat }) }));
  }
  return parts.filter(Boolean).join('\n\n');
}

/** 0x7bdee0 med svaghederne 0: dødboldene og op til to gode sider */
export function goodText(w: number, scout: string, player: string): string {
  const spec: string[] = [];
  if (w & 0x100) spec.push(k(w & 0x400 ? 'a7598c' : 'a7596c'));
  else if (w & 0x400) spec.push(k('a75950'));
  if (w & 0x200) spec.push(k(w & 4 ? 'a7591c' : 'a75900'));
  const pos: string[] = [];
  if (w & 0x1000) pos.push(k(w & 0x20 ? 'a758f4' : 'a758e8'));
  else if (w & 0x20) pos.push(k('a758d0'));
  for (const [bit, key] of [[2, 'a758c8'], [1, 'a758bc'], [4, 'a758a0'], [8, 'a75890'], [0x10, 'a75880'], [0x40, 'a75874'], [0x80, 'a7586c']] as const)
    if (w & bit && pos.length < 2) pos.push(k(key));
  const posText = pos.length === 2 ? k('a75578', { a: pos[0], b: pos[1] }) : pos.length === 1 ? k('a75548', { a: pos[0] }) : '';
  const named = spec.length === 2 ? k('a75680', { player, a: spec[0], b: spec[1] }) : spec.length === 1 ? k('a75604', { player, a: spec[0] }) : '';
  const the = spec.length === 2 ? k('a7563c', { a: spec[0], b: spec[1] }) : spec.length === 1 ? k('a755e0', { a: spec[0] }) : '';
  if (pos.length) return spec.length ? k('a753d0', { scout, player, pos: posText, spec: the }) : k('a75360', { player, pos: posText });
  return spec.length ? k('a74fec', { spec: named }) : '';
}
