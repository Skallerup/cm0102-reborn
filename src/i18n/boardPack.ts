// Bestyrelsens tekster (cmBoardText.ts) på spillets sprog: én lille pakke pr. sprog (src/game/data/cmBoard.<sprog>.json), hentet ved behov
// sammen med sprogets øvrige tekster (ensureLang). Engelsk ligger i selve spilmodulet. Må ikke importere motoren (forsidens bundle).
export interface BoardPack {
  /** de 290 blade til tillidsteksten (0x690d80), samme rækkefølge som data/cmBoardTexts.json */
  S: string[];
  title: Record<'fa' | 'glory' | 'title' | 'hope' | 'difficult' | 'look' | 'announce' | 'confidence' | 'faExp' | 'faConf' | 'faPerf' | 'faOffer', string>;
  /** Football Association-tillid (6 trin, fra "delighted" til "very disappointed"), {national} = nationaliteten */
  faConf: string[];
  tail: Record<'a1' | 'a2' | 'a3' | 'a4' | 'f1' | 'f2' | 'f3' | 'f4', string>;
  reqTitle: Record<string, string>;
  rq: { c: string; a: string };
  reply: Record<string, [string[], string]>;
  time: Record<string, string>;
  ultConfirm: string;
  ultWhat: Record<string, string>;
  ultTitle: { fans: string; stadium: string[]; training: string[]; funds: string[] };
  fans: Record<'s1' | 's1b' | 't1' | 't1b' | 'f1' | 'w1' | 's2' | 't2' | 'f2' | 'w2', string>;
  board: Record<string, string[]>;
  inexp: string;
  appoint: { prev: string; plain: string };
  expect: Record<'e1eu' | 'e1con' | 'e2' | 'promo' | 'playoff' | 'mid' | 'safe' | 'fight', string[]> & { improve: string };
  /** landsholdene (forbundet): turneringernes navne, forventningerne 0x6a4550, vurderingen 0x6a5b40 (delighted … very disappointed),
   *  jobtilbuddet 0x6a5120 (venter/accepteret/afslået) og afgangen 0x6a1d60 */
  faComp: Record<'wc' | 'euro' | 'euroq', string>;
  faExp: Record<'u21' | 'friendly' | 'win' | 'qualFrom' | 'qualFor' | 'hopeQualFrom' | 'secondPhase' | 'secondRound' | 'qf' | 'sf' | 'hopeWin' | 'perform', string>;
  faPerf: string[];
  faOffer: string[];
  faDep: Record<'tSack' | 'tResign' | 'tRetire' | 'resign' | 'retire' | 'sack' | 'relieved' | 'pressure' | 'poor', string>;
  /** bestyrelsens kampreaktion (0x138c): afsenderen (0x6a69c0's start), overskrifterne 0x6a6310, stimens sætninger og de 80 skabeloner
   *  ({b} afsender, {sc} resultat, {opp} modstander, {comp} turnering) – mangler den i et sprog, bruges engelsk */
  match?: MatchPack;
  /** presse/tilhængere: 0x6a1190 (0x1777 "manager under pressure"), 0x6a5e30 (0x1782 supporterprotesten), 0x6ac880 (0x178d ultimatummet);
   *  safe.<grund> = [formanden, forbundet, bestyrelsen] ({ch} formandens navn) */
  press: PressPack;
}
export interface PressPack {
  tConsider: string; tConsiderFa: string; tVote: string; tVoteFa: string; listFa: string; list: string; expects: string; meeting: string; warned: string;
  safe: Record<'plain' | 'motiv' | 'staff' | 'senior' | 'unrest', string[]>;
  protestT: string; protest: string; ultT: string; ult: string;
}
export interface MatchPack {
  b: Record<'club' | 'fa', string>;
  h: Record<'dDel' | 'dHappy' | 'dFury' | 'dUnhappy' | 'dReact' | 'del' | 'pleases' | 'fury' | 'unhappy' | 'react', string>;
  run: Record<string, string>;
  t: string[];
}

const packs: Record<string, BoardPack> = {};
const LAZY: Record<string, () => Promise<{ default: unknown }>> = {
  da: () => import('../game/data/cmBoard.da.json'), de: () => import('../game/data/cmBoard.de.json'), es: () => import('../game/data/cmBoard.es.json'),
  fr: () => import('../game/data/cmBoard.fr.json'), it: () => import('../game/data/cmBoard.it.json'), pt: () => import('../game/data/cmBoard.pt.json'),
  tr: () => import('../game/data/cmBoard.tr.json'), sv: () => import('../game/data/cmBoard.sv.json'), nb: () => import('../game/data/cmBoard.nb.json'),
};
/** Sprogets pakke, når den er hentet (engelsk og ikke-hentede sprog: undefined → engelsk) */
export const boardPack = (lang: string): BoardPack | undefined => packs[lang];
/** Hent sprogets pakke (kaldes af ensureLang) */
export async function loadBoardPack(lang: string): Promise<void> {
  if (packs[lang] || !LAZY[lang]) return;
  try { const p = (await LAZY[lang]()).default as BoardPack; if (Array.isArray(p?.S)) packs[lang] = p; } catch { /* offline uden cache: engelsk bruges i stedet */ }
}
/** Genitiv af managerens navn ({m's}): -s på dansk/svensk/norsk/tysk (apostrof efter s/x/z), ellers navnet uændret (sprogene uden genitiv bruger {m}) */
export function possessive(lang: string, m: string): string {
  if (lang === 'en') return /s$/i.test(m) ? `${m}'` : `${m}'s`;
  if (lang === 'da' || lang === 'sv' || lang === 'nb') return /[sxz]$/i.test(m) ? m : `${m}s`;
  if (lang === 'de') return /[sxzß]$/i.test(m) ? `${m}'` : `${m}s`;
  return m;
}
