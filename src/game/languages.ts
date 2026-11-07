// Spillerens sprog ("Fluent Languages" i CM 01/02): landets sprog + sproget i lande, hvor han har spillet i mindst to sæsoner.
// Landekoderne er dem i databasen (FIFA-lignende); sprogene er ISO 639-1, så navnene kan vises på spillerens eget sprog
// med Intl.DisplayNames. Lande, der ikke står her, har intet sprog (vises ikke).
import type { GameState, Player } from './types';

const BY_LANG: Record<string, string> = {
  en: 'ENG SCO WAL NIR IRL USA CAN AUS NZL JAM TRI GHA NGA RSA ZIM ZAM KEN UGA LBR SLE GAM BER BRB GRN BAH ANT SKN LCA VIN GUY BLZ MLT SIN MAS PHI IND BOT NAM MWI SWZ LES FIJ PNG HKG',
  da: 'DEN FRO GRL', de: 'GER AUT SUI LIE', fr: 'FRA SEN CIV CMR MLI GUI BFA TOG BEN GAB CGO COD MAD HAI LUX TUN ALG MAR NIG CHA CTA DJI MTN BDI RWA MON NCL TAH MTQ GLP REU GUF',
  es: 'ESP ARG URU PAR CHI PER BOL ECU COL VEN MEX CRC HON SLV GUA PAN NCA CUB DOM PUR EQG', pt: 'POR BRA ANG MOZ CPV GNB STP',
  it: 'ITA SMR', nl: 'NED BEL SUR ARU ANT CUW', sv: 'SWE', no: 'NOR', fi: 'FIN', is: 'ISL', pl: 'POL', cs: 'CZE', sk: 'SVK', hu: 'HUN',
  ro: 'ROU MDA', bg: 'BUL', sr: 'SRB SCG YUG MNE', hr: 'CRO', bs: 'BIH', sl: 'SVN', mk: 'MKD', sq: 'ALB KVX', el: 'GRE CYP', tr: 'TUR',
  ru: 'RUS BLR KAZ KGZ', uk: 'UKR', et: 'EST', lv: 'LVA', lt: 'LTU', ka: 'GEO', hy: 'ARM', az: 'AZE', he: 'ISR', uz: 'UZB', tk: 'TKM', tg: 'TJK',
  ar: 'KSA EGY UAE QAT IRQ JOR KUW LBN SYR OMA BHR LBY YEM SUD PLE', fa: 'IRN', ja: 'JPN', ko: 'KOR PRK', zh: 'CHN TPE', th: 'THA', vi: 'VIE', id: 'IDN',
};
const LANG = new Map<string, string>();
for (const [l, codes] of Object.entries(BY_LANG)) for (const c of codes.split(' ')) if (!LANG.has(c)) LANG.set(c, l);

/** Sprog for et land (ISO 639-1) ud fra landets kode, eller undefined */
export const nationLanguage = (g: GameState, nation: number): string | undefined => LANG.get(g.nations[nation]?.code ?? '');

/** Spillerens sprog: modersmålet først, så sprog fra lande, hvor han har spillet i mindst to sæsoner (også den nuværende klub) */
export function playerLanguages(g: GameState, p: Player): string[] {
  const out: string[] = [];
  const add = (l?: string) => { if (l && !out.includes(l)) out.push(l); };
  add(nationLanguage(g, p.nation));
  const seasons = new Map<string, number>();
  const count = (club: number, n = 1) => { const l = nationLanguage(g, g.clubs[club]?.nation ?? -1); if (l) seasons.set(l, (seasons.get(l) ?? 0) + n); };
  for (const h of p.history ?? []) count(h.club);
  if (p.club && p.joined) count(p.club, Math.max(0, (Date.parse(g.date) - Date.parse(p.joined)) / (365 * 864e5)));
  for (const [l, n] of seasons) if (n >= 2) add(l);
  return out;
}
