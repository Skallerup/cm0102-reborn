// Turneringsnavne: CM-databaserne har engelske beskrivende navne ("Danish Premier Division"). På dansk
// vises ligaernes egne navne (Superligaen, Premier League …), og pokalturneringerne ("Denmark Cup") får
// deres rigtige navne. Navne der ikke kendes, vises uændret – fx de moderne databasers navne.
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

/** Nationale pokalturneringer ("<land> Cup" i databasen) */
const CUPS: Record<string, string> = {
  Denmark: 'Pokalturneringen', England: 'FA Cup', Scotland: 'Scottish Cup', Germany: 'DFB-Pokal', Italy: 'Coppa Italia',
  Spain: 'Copa del Rey', France: 'Coupe de France', Netherlands: 'KNVB Beker', Holland: 'KNVB Beker', Portugal: 'Taça de Portugal',
  Sweden: 'Svenska Cupen', Norway: 'NM Cup', Austria: 'ÖFB-Cup', Switzerland: 'Schweizer Cup', Belgium: 'Beker van België',
  Turkey: 'Tyrkiets pokal', 'Türkiye': 'Tyrkiets pokal', Greece: 'Grækenlands pokal',
};

export function compLabel<T extends string | undefined>(name: T, lang: 'da' | 'en'): T {
  if (!name || lang !== 'da') return name;
  const league = LEAGUES_DA[name];
  if (league) return league as T;
  if (name.startsWith('Playoff ')) return `Playoff ${compLabel(name.slice(8), lang)}` as T;
  const nation = name.endsWith(' Cup') ? name.slice(0, -4) : '';
  if (CUPS[nation]) return CUPS[nation] as T;
  if (nation && isNationName(nation)) {
    const n = nationLabel(nation, lang);
    return `${n}${/[sxz]$/.test(n) ? '' : 's'} pokal` as T;
  }
  return name;
}
