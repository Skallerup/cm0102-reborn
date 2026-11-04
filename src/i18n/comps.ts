// Turneringsnavne: CM-databaserne har engelske beskrivende navne ("Danish Premier Division"). På dansk
// vises ligaernes egne navne (Superligaen, Premier League …), og pokalturneringerne ("Denmark Cup") får
// deres rigtige navne. Navne der ikke kendes, vises uændret – fx de moderne databasers navne.
import type { Lang } from '../game/types';
import { isNationName, nationLabel } from './nations';

const LEAGUES_DA: Record<string, string> = {
  'Danish Premier Division': 'Superligaen', 'Danish First Division': '1. division',
  'English Premier Division': 'Premier League', 'English First Division': 'Championship',
  'Scottish Premier Division': 'Scottish Premiership',
  'Spanish First Division': 'LaLiga', 'Spanish Second Division': 'LaLiga 2',
  'German First Division': 'Bundesliga', 'German Second Division': '2. Bundesliga',
  'Italian Serie A': 'Serie A', 'Italian Serie B': 'Serie B',
  'French First Division': 'Ligue 1', 'French Second Division': 'Ligue 2',
  'Dutch Premier Division': 'Eredivisie', 'Belgian First Division': 'Pro League',
  'Portuguese Premier League': 'Liga Portugal', 'Swedish Premier Division': 'Allsvenskan',
  'Norwegian Premier Division': 'Eliteserien', 'Austrian First Division': 'Bundesliga',
  'Austrian Premier Division': 'Bundesliga', 'Swiss Super League': 'Super League',
  'Swiss National Division A': 'Nationalliga A', 'Turkish Premier Division': 'Süper Lig',
  'Greek National A Division': 'Super League', 'Croatian First Division': 'HNL',
  'Czech First Division': '1. liga', 'Polish First Division': 'Ekstraklasa',
  'Serbian First Division': 'SuperLiga', 'Romanian First League': 'Liga 1',
  'Russian Premier Division': 'Premier Liga', 'Ukrainian Premier League': 'Premier Liha',
  'American Major League': 'MLS', 'Mexican First Division': 'Liga MX',
  'Brazilian National First Division': 'Série A', 'Argentine Premier Division': 'Liga Profesional',
  'Colombian First Division': 'Primera A', 'Japanese J-League 1': 'J1 League', 'Korean League': 'K League 1',
  'Australian National Soccer League': 'A-League', 'Saudi Premier League': 'Saudi Pro League',
};

/** Pokalturneringerne i CM-databaserne (deres engelske navne) */
const CM_CUPS_DA: Record<string, string> = {
  'Danish Cup': 'Pokalturneringen', 'English FA Cup': 'FA Cup', 'Scottish Cup': 'Scottish Cup', 'German Cup': 'DFB-Pokal',
  'German League Cup': 'Ligapokal', 'Italian Cup': 'Coppa Italia', 'Spanish Cup': 'Copa del Rey', 'French Cup': 'Coupe de France',
  'Dutch Cup': 'KNVB Beker', 'Dutch Super Cup': 'Johan Cruijff Schaal', 'Portuguese Cup': 'Taça de Portugal', 'Portuguese Super Cup': 'Supertaça',
  'Belgian Cup': 'Beker van België', 'Swedish Cup': 'Svenska Cupen', 'Norwegian Cup': 'NM Cup', 'Austrian FA Cup': 'ÖFB-Cup',
  'Swiss Cup': 'Schweizer Cup', 'Turkish FA Cup': 'Tyrkiets pokal', 'Greek Cup': 'Grækenlands pokal', 'Croatian Cup': 'Kroatiens pokal',
  'Czech FA Cup': 'Tjekkiets pokal', 'Polish FA Cup': 'Polens pokal', 'Romanian Cup': 'Rumæniens pokal', 'Russian Cup': 'Ruslands pokal',
  'Ukrainian Cup': 'Ukraines pokal', 'Serbian Cup': 'Serbiens pokal', 'US Open Cup': 'US Open Cup', 'Mexican Cup': 'Copa MX',
  'Brazilian Cup': 'Copa do Brasil', 'Argentine Super Cup': 'Supercopa Argentina', 'Colombian Cup': 'Copa Colombia',
  'Japanese Cup': "Kejserens pokal", 'Japanese Super Cup': 'Japans supercup', 'Korean FA Cup': 'Korea Cup', 'Australia Cup': 'Australia Cup',
  "Saudi King's Cup": 'Kongens pokal', 'PrepreLibertadores Cup': 'Pre-Libertadores',
};

/** Nationale pokalturneringer ("<land> Cup" i databasen) */
const CUPS: Record<string, string> = {
  Denmark: 'Pokalturneringen', England: 'FA Cup', Scotland: 'Scottish Cup', Germany: 'DFB-Pokal', Italy: 'Coppa Italia',
  Spain: 'Copa del Rey', France: 'Coupe de France', Netherlands: 'KNVB Beker', Holland: 'KNVB Beker', Portugal: 'Taça de Portugal',
  Sweden: 'Svenska Cupen', Norway: 'NM Cup', Austria: 'ÖFB-Cup', Switzerland: 'Schweizer Cup', Belgium: 'Beker van België',
  Turkey: 'Tyrkiets pokal', 'Türkiye': 'Tyrkiets pokal', Greece: 'Grækenlands pokal',
};

const DANISH_WORDS = /pokal\b|^Pokalturneringen$|^Kejserens|^Kongens|^Japans/;

export function compLabel<T extends string | undefined>(name: T, lang: Lang): T {
  // engelsk: CM-databasernes egne navne; de øvrige sprog: ligaernes og pokalernes rigtige navne
  if (!name || lang === 'en') return name;
  // danske fællesbetegnelser ("Tyrkiets pokal") bruges kun på dansk – de rigtige egennavne på alle sprog
  const own = (v: string | undefined) => (v && (lang === 'da' || !DANISH_WORDS.test(v)) ? v : undefined);
  const league = own(LEAGUES_DA[name]) ?? own(CM_CUPS_DA[name]);
  if (league) return league as T;
  if (name.startsWith('Playoff ')) return `Playoff ${compLabel(name.slice(8), lang)}` as T;
  const nation = name.endsWith(' Cup') ? name.slice(0, -4) : '';
  if (own(CUPS[nation])) return CUPS[nation] as T;
  if (nation && isNationName(nation)) {
    const n = nationLabel(nation, lang);
    if (lang !== 'da') return ({ es: `Copa de ${n}`, fr: `Coupe de ${n}`, de: `${n} Pokal` } as Record<string, string>)[lang] as T ?? name;
    return `${n}${/[sxz]$/.test(n) ? '' : 's'} pokal` as T;
  }
  return name;
}
