// Databasesiderne: én statisk side pr. kendt spiller, klub, liga og land + toplister (position, egenskab, Bosman …),
// bygget af spillets egne databaser. Egenskaberne er databasens egne tal (1-20); felter, databasen ikke har sat (0),
// vises som spillets genererede værdi i kursiv. Værdien er CM Reborns (spillets egen værdikurve), lønnen databasens.
// Bruges af scripts/build-seo.ts – skriver direkte til public/<prefix>/ og returnerer url'erne til sitemaps.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createGame, type WorldData } from '../../src/game/newgame';
import { gs } from '../../src/game/state';
import { ATTRS, GROUPS, A, naturalRole, positionString } from '../../src/game/attributes';
import { POSITIONS, SIDES, type Player, type Role } from '../../src/game/types';
import { realCompName } from '../../src/i18n/comps';
import { EU_EEA } from '../../src/game/rules2001';
import { logoUrl, setLogoData } from '../../src/ui/logos';
import { CLUB_INFO_2026 } from '../../src/game/data/clubInfo2026';
import { CTA, esc, render, slugify, type Crumb, type Page } from './layout';

export interface DbConf {
  file: string;
  /** url-præfiks: "cm-01-02" */
  prefix: string;
  /** "CM 01/02" */
  game: string;
  /** "2001/02" */
  season: string;
  /** "the original CM 01/02 database (patch 3.9.68)" */
  dbName: string;
  original: boolean;
  /** dato for indholdet (sitemap lastmod) – hæves, når siderne ændres */
  modified: string;
  /** kultspillernes navne (listen legends) */
  cult?: Set<string>;
  /** spillere, der får egen side */
  keep: (p: DP) => boolean;
  /** klubben i de andre databaseudgaver (kun den originale): navn + fødselsdato → [udgave, klub] */
  otherVersions?: (name: string, dob: string) => [string, string][];
}

type Row = (string | number)[];
interface Rating { ca: number; pa: number; paRaw?: number; attrs: number[]; pos: number[]; side: number[] }
type World = WorldData & {
  playerFields: string[]; players: Row[]; clubs: Row[]; ratings: Record<string, Rating>;
  clubRep?: Record<string, number>; clubFinance?: Record<string, [number, number, number]>;
  nationalTeams?: { nations: Record<string, { stadium?: string; cap?: number; fifa?: number; coach?: string; rep?: number; titles?: Record<string, number> }> };
};

/** spiller i databasen (+ spillets værdi) */
export interface DP {
  id: number; name: string; last: string; slug: string; url: string | null;
  dob: string; age: number; nation: number; club: number; league: string | null;
  dbPos: string; posStr: string; role: Role; foot: string; height: number; caps: number; intGoals: number;
  contract: string; wage: number; number: number; ca: number; pa: number; paRaw: number; attrs: number[]; game: number[];
  pos: number[]; side: number[]; value: number;
}
interface DC { id: number; name: string; slug: string; url: string; nation: number; league: string | null; stadium: string; cap: number; rep: number; balance: number; gate: number; facilities: number; colors: [string, string] | null; players: DP[]; strength: number; logo: string | null; photo: string | null; manager: string; managerNation: number | null; kit: string }
interface DL { id: string; name: string; real: string; slug: string; url: string; nation: number; tier: number; clubs: DC[] }
interface DN { idx: number; name: string; slug: string; url: string; players: DP[] }

/** ligaernes navne i 2001/02 (realCompName giver nutidens: "Championship", "Ligue 1" …) */
const ERA_2001: Record<string, string> = {
  'English Premier Division': 'Premier League', 'English First Division': 'First Division', 'English Second Division': 'Second Division', 'English Third Division': 'Third Division',
  'Scottish Premier Division': 'Scottish Premier League', 'Scottish First Division': 'Scottish First Division', 'Italian Serie A': 'Serie A', 'Italian Serie B': 'Serie B',
  'German First Division': 'Bundesliga', 'German Second Division': '2. Bundesliga', 'Spanish First Division': 'La Liga', 'Spanish Second Division': 'Segunda División',
  'French First Division': 'Division 1', 'French Second Division': 'Division 2', 'Dutch Premier Division': 'Eredivisie', 'Dutch First Division': 'Eerste Divisie',
  'Portuguese Premier League': 'Primeira Liga', 'Portuguese Second League': 'Segunda Liga', 'Danish Premier Division': 'Superligaen', 'Danish First Division': '1. division', 'Swedish Premier Division': 'Allsvenskan',
  'Norwegian Premier Division': 'Tippeligaen', 'Norwegian First Division': '1. divisjon', 'Turkish Premier Division': 'Süper Lig', 'Greek National A Division': 'Alpha Ethniki',
  'Russian Premier Division': 'Russian Top Division', 'Brazilian National First Division': 'Campeonato Brasileiro', 'Argentine Premier Division': 'Primera División',
  'American Major League': 'MLS', 'Japanese J-League 1': 'J.League Division 1', 'Korean League': 'K League', 'Mexican First Division': 'Primera División',
  'Austrian Premier Division': 'Austrian Bundesliga', 'Swiss National Division A': 'Nationalliga A', 'Croatian First Division': 'Prva HNL', 'Czech First Division': 'Czech First League',
  'Polish First Division': 'Ekstraklasa', 'Australian National Soccer League': 'National Soccer League', 'Belgian First Division': 'Belgian First Division',
};

const ROLE_NAME: Record<Role, string> = { GK: 'goalkeeper', CB: 'centre-back', FB: 'full-back', DM: 'defensive midfielder', CM: 'central midfielder', WM: 'wide midfielder', AM: 'attacking midfielder', W: 'winger', ST: 'striker' };
const ROLE_PLURAL: Record<Role, string> = { GK: 'goalkeepers', CB: 'centre-backs', FB: 'full-backs', DM: 'defensive midfielders', CM: 'central midfielders', WM: 'wide midfielders', AM: 'attacking midfielders', W: 'wingers', ST: 'strikers' };
const ATTR_LABEL: Record<string, string> = {
  crossing: 'Crossing', dribbling: 'Dribbling', finishing: 'Finishing', heading: 'Heading', longShots: 'Long Shots', marking: 'Marking', offTheBall: 'Off the Ball', passing: 'Passing', penalties: 'Penalties', tackling: 'Tackling', freeKicks: 'Free Kicks', corners: 'Corners', technique: 'Technique', throwIns: 'Throw Ins',
  aggression: 'Aggression', anticipation: 'Anticipation', bravery: 'Bravery', creativity: 'Creativity', decisions: 'Decisions', determination: 'Determination', flair: 'Flair', influence: 'Influence', positioning: 'Positioning', teamwork: 'Teamwork', workRate: 'Work Rate',
  acceleration: 'Acceleration', agility: 'Agility', balance: 'Balance', jumping: 'Jumping', naturalFitness: 'Natural Fitness', pace: 'Pace', stamina: 'Stamina', strength: 'Strength',
  handling: 'Handling', oneOnOnes: 'One on Ones', reflexes: 'Reflexes',
  consistency: 'Consistency', importantMatches: 'Important Matches', injuryProneness: 'Injury Proneness', dirtiness: 'Dirtiness', versatility: 'Versatility', adaptability: 'Adaptability', ambition: 'Ambition', loyalty: 'Loyalty', pressure: 'Pressure', professionalism: 'Professionalism', sportsmanship: 'Sportsmanship', temperament: 'Temperament',
};
const POS_LABEL: Record<string, string> = { GK: 'Goalkeeper', SW: 'Sweeper', D: 'Defender', DM: 'Defensive Midfielder', M: 'Midfielder', AM: 'Attacking Midfielder', ST: 'Forward', WB: 'Wing Back' };
const SIDE_LABEL: Record<string, string> = { L: 'Left', C: 'Centre', R: 'Right' };
const FOOT: Record<string, string> = { L: 'Left', R: 'Right', B: 'Both' };

const gbp = (eur: number) => eur * 0.86;
/** £ som i CM 01/02: £1.2m, £450k, £800 */
export function pounds(v: number): string {
  if (v >= 1e6) return `£${(v / 1e6).toFixed(v >= 1e7 ? 1 : 2).replace(/\.?0+$/, '')}m`;
  if (v >= 1e4) return `£${Math.round(v / 1e3)}k`;
  return `£${Math.round(v).toLocaleString('en')}`;
}
const longDate = (iso: string) => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const ord = (n: number) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;
const vc = (v: number) => (v >= 17 ? 'v5' : v >= 14 ? 'v4' : v >= 10 ? 'v3' : v >= 6 ? 'v2' : 'v1');
const listJoin = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

function write(slug: string, html: string) {
  mkdirSync(`public/${slug}`, { recursive: true });
  writeFileSync(`public/${slug}index.html`, html);
}

export interface ClubSum { name: string; url: string; league: string; leagueUrl: string; tier: number; nation: string; balance: number; rep: number; strength: number; kids: number; cap: number; stadium: string; best: string }
export interface DbOut { urls: Record<string, string[]>; playerUrl: Map<string, string>; kept: (DP & { clubName: string })[]; clubSum: ClubSum[]; players: number; clubs: number; leagues: number; nations: number; lists: number; hub: string; summary: string }

export function buildDb(conf: DbConf): DbOut {
  const world = JSON.parse(readFileSync(conf.file, 'utf8')) as World;
  setLogoData(JSON.parse(readFileSync('public/data/logos.json', 'utf8')));
  const stadiumBg = JSON.parse(readFileSync('public/data/stadium-bg.json', 'utf8')) as Record<string, string[]>;
  const playable = [...new Set(world.leagues.filter((l) => !l.hidden).map((l) => l.nation))];
  const eng = world.nations.findIndex((x) => x.name === 'England');
  const anyClub = world.clubs.find((c) => world.leagues.some((l) => l.id === c[4] && !l.hidden))![0] as number;
  createGame(world, { managerName: 'SEO', managerNation: eng, clubId: anyClub, activeNations: playable, lang: 'en', masking: false, seed: 1 });
  const g = gs();
  const P = conf.prefix;
  const start = `${world.season}-07-01`;
  const F = Object.fromEntries(world.playerFields.map((f, i) => [f, i]));
  const hiddenLeague = new Set(world.leagues.filter((l) => l.hidden).map((l) => l.id));
  const clubRow = new Map(world.clubs.map((c) => [c[0] as number, c]));
  const nationName = (i: number) => world.nations[i]?.name ?? '';
  // manageren: 2026/27 fra Wikipedias trænerlister (CLUB_INFO_2026), ellers databasens (club.dat 207 → "fornavn|efternavn|nation")
  const managerOf = (id: number, raw: string | undefined, clubNation: number) => {
    const info = !conf.original ? CLUB_INFO_2026[id] : undefined;
    if (info?.[0]) { const n = world.nations.findIndex((x) => x.name === info[2]); return { manager: info[0], managerNation: n >= 0 ? n : clubNation, kit: info[1] }; }
    const parts = (raw ?? '').split('|');
    const name = parts.length > 1 ? [parts[0], parts[1]].filter(Boolean).join(' ').trim() : (raw ?? '').trim();
    const nat = parts[2] !== undefined && world.nations[Number(parts[2])] ? Number(parts[2]) : name ? clubNation : null;
    return { manager: name, managerNation: nat, kit: info?.[1] ?? '' };
  };

  // ---------- spillere ----------
  const all: DP[] = [];
  for (const r of world.players) {
    const id = r[F.id] as number;
    const rt = world.ratings[String(id)];
    const gp: Player | undefined = g.players[id];
    if (!rt || !gp) continue;
    const dob = String(r[F.dob]);
    const age = world.season - Number(dob.slice(0, 4)) - (dob.slice(5) > start.slice(5) ? 1 : 0);
    const first = String(r[F.first] ?? '').trim(), last = String(r[F.last] ?? '').trim();
    const name = first ? `${first} ${last}` : last;
    const club = r[F.club] as number;
    const cr = clubRow.get(club);
    const league = cr ? String(cr[4] || '') || null : null;
    const pl = { pos: rt.pos, side: rt.side } as unknown as Player;
    all.push({
      id, name, last, slug: '', url: null, dob, age, nation: r[F.nation] as number, club: cr ? club : -1, league,
      dbPos: String(r[F.pos] ?? ''), posStr: positionString(pl), role: naturalRole(pl), foot: String(r[F.foot] ?? ''), height: Number(r[F.height] ?? 0),
      caps: Number(r[F.caps] ?? 0), intGoals: Number(r[F.intGoals] ?? 0), contract: String(r[F.contract] ?? ''), wage: Number(r[F.wage] ?? 0), number: Number(r[F.number] ?? 0),
      ca: rt.ca, pa: rt.pa, paRaw: Math.min(0, rt.paRaw ?? 0), attrs: rt.attrs, game: gp.attrs.map((v) => Math.round(v)), pos: rt.pos, side: rt.side, value: gbp(gp.value),
    });
  }
  // forventet PA (tilfældigt PA: midten af intervallet) – til sortering
  const expPa = (p: DP) => (p.paRaw === -2 ? 175 : p.paRaw === -1 ? 125 : p.pa);
  const paText = (p: DP) => (p.paRaw === -2 ? 'random (−2: usually 120–200)' : p.paRaw === -1 ? 'random (−1: usually 80–160)' : String(p.pa));
  const paCell = (p: DP) => (p.paRaw ? `<abbr title="Random potential: rolled for every new game (${p.paRaw === -2 ? 'usually 120–200, average 153' : 'usually 80–160, average 118'})">${p.paRaw === -2 ? 'R −2' : 'R −1'}</abbr>` : String(p.pa));

  // sider til de kendte spillere – entydige url'er (navn, ellers navn + klub, ellers + id)
  const kept = all.filter(conf.keep);
  const byName = new Map<string, DP[]>();
  for (const p of kept) { const s = slugify(p.name); byName.set(s, [...(byName.get(s) ?? []), p]); }
  const used = new Set<string>();
  for (const [s, ps] of byName) {
    for (const p of ps.sort((a, b) => b.ca - a.ca || a.id - b.id)) {
      let slug = s;
      if (ps.length > 1 && (used.has(slug) || ps[0] !== p)) slug = `${s}-${slugify(clubRow.get(p.club)?.[1] as string ?? 'free-agent')}`;
      if (used.has(slug)) slug = `${s}-${p.id}`;
      used.add(slug);
      p.slug = slug;
      p.url = `/${P}/players/${slug}/`;
    }
  }

  // ---------- klubber ----------
  const clubs = new Map<number, DC>();
  const clubSlugs = new Set<string>();
  const byClub = new Map<number, DP[]>();
  for (const p of all) if (p.club >= 0) byClub.set(p.club, [...(byClub.get(p.club) ?? []), p]);
  for (const c of world.clubs) {
    const id = c[0] as number;
    const ps = (byClub.get(id) ?? []).sort((a, b) => b.ca - a.ca);
    const league = String(c[4] || '') || null;
    const hidden = !league || hiddenLeague.has(league);
    if (hidden && ps.filter((p) => p.url).length < 2) continue; // skjulte klubber: kun med kendte spillere
    let slug = slugify(c[1] as string);
    if (clubSlugs.has(slug)) slug = `${slug}-${slugify(nationName(c[3] as number))}`;
    if (clubSlugs.has(slug)) slug = `${slug}-${id}`;
    clubSlugs.add(slug);
    const gc = g.clubs[id];
    const fin = world.clubFinance?.[id];
    const stad = String(c[5] ?? '');
    // kun billeder af netop det stadion (pakken bruger fx Emirates for Highbury – forkert på en side om 2001/02)
    const words = slugify(stad).split('-').filter((w) => w.length >= 4 && !['stadium', 'stadio', 'stade', 'stadion', 'estadio', 'park', 'arena'].includes(w));
    const imgs = (stadiumBg[stad] ?? []).filter((n) => words.length > 0 && words.some((w) => n.replace(/_/g, '-').includes(w)));
    const photo = imgs.find((n) => n.includes('exterior')) ?? imgs[0];
    clubs.set(id, {
      id, name: c[1] as string, slug, url: `/${P}/clubs/${slug}/`, nation: c[3] as number, league: hidden ? null : league, stadium: stad, cap: Number(c[6] ?? 0),
      rep: world.clubRep?.[id] ?? gc?.rep ?? 0, balance: fin ? fin[0] : gc ? gbp(gc.balance) : 0, gate: fin?.[1] ?? 0, facilities: fin?.[2] ?? gc?.facilities ?? 0,
      colors: (gc?.colors as [string, string]) ?? null, players: ps, strength: ps.slice(0, 16).reduce((s, p) => s + p.ca, 0) / Math.max(1, Math.min(16, ps.length)),
      logo: logoUrl(id), photo: photo ? `/stadiums/${photo}.jpg` : null,
      ...managerOf(id, c[7] as string | undefined, c[3] as number),
    });
  }
  const clubOf = (p: DP) => clubs.get(p.club);
  const clubName = (p: DP) => (p.club >= 0 ? (clubRow.get(p.club)?.[1] as string) : 'Free agent');
  const clubLink = (p: DP) => { const c = clubOf(p); return c ? `<a href="${c.url}">${esc(c.name)}</a>` : esc(clubName(p)); };

  // ---------- ligaer ----------
  const leagues = new Map<string, DL>();
  for (const l of world.leagues) {
    if (l.hidden) continue;
    const cs = [...clubs.values()].filter((c) => c.league === l.id).sort((a, b) => b.strength - a.strength);
    if (!cs.length) continue;
    const real = conf.original ? ERA_2001[l.name] ?? l.name : realCompName(l.name);
    const slug = slugify(l.name);
    leagues.set(l.id, { id: l.id, name: l.name, real, slug, url: `/${P}/leagues/${slug}/`, nation: l.nation, tier: l.tier ?? 1, clubs: cs });
  }
  const leagueTitle = (l: DL) => (l.real !== l.name ? `${l.real} (${l.name})` : l.name);

  // ---------- lande ----------
  const nations = new Map<number, DN>();
  const byNation = new Map<number, DP[]>();
  for (const p of all) byNation.set(p.nation, [...(byNation.get(p.nation) ?? []), p]);
  for (const [idx, ps] of byNation) {
    if (ps.filter((p) => p.url).length < 3 && !playable.includes(idx)) continue;
    const name = nationName(idx);
    if (!name) continue;
    nations.set(idx, { idx, name, slug: slugify(name), url: `/${P}/nations/${slugify(name)}/`, players: ps.sort((a, b) => b.ca - a.ca) });
  }
  const nationLink = (i: number) => { const n = nations.get(i); return n ? `<a href="${n.url}">${esc(n.name)}</a>` : esc(nationName(i)); };

  // ---------- fælles byggeklodser ----------
  const pLink = (p: DP) => (p.url ? `<a href="${p.url}"><b>${esc(p.name)}</b></a>` : `<b>${esc(p.name)}</b>`);
  function table(rows: DP[], o: { club?: boolean; nation?: boolean; pa?: boolean; value?: boolean; contract?: boolean; wage?: boolean; extra?: [string, (p: DP) => string] } = {}) {
    const c = { club: true, nation: true, pa: true, ...o };
    return `<div class="tw"><table><thead><tr><th>#</th><th>Player</th><th>Age</th><th>Position</th>${c.club ? '<th>Club</th>' : ''}${c.nation ? '<th>Nation</th>' : ''}${c.extra ? `<th class="n">${c.extra[0]}</th>` : ''}<th class="n">CA</th>${c.pa ? '<th class="n">PA</th>' : ''}${c.value ? '<th class="n">Value</th>' : ''}${c.wage ? '<th class="n">Wage</th>' : ''}${c.contract ? '<th>Contract</th>' : ''}</tr></thead><tbody>${rows.map((p, i) => `<tr><td>${i + 1}</td><td>${pLink(p)}</td><td>${p.age}</td><td>${esc(p.posStr)}</td>${c.club ? `<td>${clubLink(p)}</td>` : ''}${c.nation ? `<td>${nationLink(p.nation)}</td>` : ''}${c.extra ? `<td class="n">${c.extra[1](p)}</td>` : ''}<td class="n">${p.ca}</td>${c.pa ? `<td class="n">${paCell(p)}</td>` : ''}${c.value ? `<td class="n">${pounds(p.value)}</td>` : ''}${c.wage ? `<td class="n">${p.wage ? pounds(p.wage) + '/w' : '–'}</td>` : ''}${c.contract ? `<td>${p.contract ? p.contract.slice(0, 4) : '–'}</td>` : ''}</tr>`).join('')}</tbody></table></div>`;
  }
  /** kort tabel (lignende spillere, holdkammerater) */
  const mini = (rows: DP[], club: boolean) => `<div class="tw"><table><thead><tr><th>Player</th><th>Age</th><th>Position</th>${club ? '<th>Club</th>' : ''}<th class="n">CA</th><th class="n">PA</th></tr></thead><tbody>${rows.map((p) => `<tr><td>${pLink(p)}</td><td>${p.age}</td><td>${esc(p.posStr)}</td>${club ? `<td>${clubLink(p)}</td>` : ''}<td class="n">${p.ca}</td><td class="n">${paCell(p)}</td></tr>`).join('')}</tbody></table></div>`;
  const hubCrumb: Crumb = { name: `${conf.game} database`, url: `/${P}/` };
  const urls: Record<string, string[]> = { hub: [], players: [], clubs: [], leagues: [], nations: [], lists: [] };
  const emit = (kind: string, p: Page) => { write(p.slug, render({ modified: conf.modified, ...p })); urls[kind].push(p.slug); };
  const atStart = conf.original ? 'at the start of the 2001/02 season' : `at the start of the ${conf.season} season`;
  const attr = (p: DP, k: string) => { const i = A[k as keyof typeof A]; return p.attrs[i] || p.game[i]; };
  const wonder = (ps: DP[], maxAge = 21) => ps.filter((p) => p.age <= maxAge && (p.paRaw || p.pa >= 130)).sort((a, b) => expPa(b) - expPa(a) || b.ca - a.ca);

  // positionsgrupper (pladsens rating ≥ 15 i databasen)
  const PI = Object.fromEntries(POSITIONS.map((p, i) => [p, i])) as Record<string, number>;
  const SI = Object.fromEntries(SIDES.map((s, i) => [s, i])) as Record<string, number>;
  const at = (p: DP, pos: string[], side?: string) => pos.some((x) => p.pos[PI[x]] >= 15) && (!side || p.side[SI[side]] >= 15);
  const POS_GROUPS: { slug: string; name: string; one: string; test: (p: DP) => boolean }[] = [
    { slug: 'goalkeepers', name: 'goalkeepers', one: 'goalkeeper', test: (p) => p.pos[0] >= 15 },
    { slug: 'right-backs', name: 'right-backs', one: 'right-back', test: (p) => at(p, ['D', 'WB'], 'R') },
    { slug: 'left-backs', name: 'left-backs', one: 'left-back', test: (p) => at(p, ['D', 'WB'], 'L') },
    { slug: 'centre-backs', name: 'centre-backs', one: 'centre-back', test: (p) => at(p, ['D', 'SW'], 'C') },
    { slug: 'defensive-midfielders', name: 'defensive midfielders (DMC)', one: 'defensive midfielder', test: (p) => at(p, ['DM']) },
    { slug: 'central-midfielders', name: 'central midfielders', one: 'central midfielder', test: (p) => at(p, ['M'], 'C') },
    { slug: 'right-wingers', name: 'right midfielders and wingers', one: 'right winger', test: (p) => at(p, ['M', 'AM'], 'R') },
    { slug: 'left-wingers', name: 'left midfielders and wingers', one: 'left winger', test: (p) => at(p, ['M', 'AM'], 'L') },
    { slug: 'attacking-midfielders', name: 'attacking midfielders (AMC)', one: 'attacking midfielder', test: (p) => at(p, ['AM'], 'C') },
    { slug: 'strikers', name: 'strikers', one: 'striker', test: (p) => at(p, ['ST']) },
  ];
  const posGroupOf = (p: DP) => POS_GROUPS.find((x) => x.test(p));

  // ranglister til spillersiderne
  const rankIn = (ps: DP[], p: DP) => ps.indexOf(p) + 1;
  const sortedCa = all.slice().sort((a, b) => b.ca - a.ca);
  const posRank = new Map<string, DP[]>(POS_GROUPS.map((x) => [x.slug, sortedCa.filter(x.test)]));
  const ageRank = new Map<number, DP[]>();
  const wonderAll = wonder(all);

  // ---------- spillersider ----------
  for (const p of kept) {
    const c = clubOf(p);
    const l = p.league ? leagues.get(p.league) : undefined;
    const n = nations.get(p.nation);
    const grp = posGroupOf(p);
    const roleWord = grp?.one ?? ROLE_NAME[p.role];
    const isGk = p.role === 'GK';
    const outfield = ATTRS.filter((k) => !GROUPS.hidden.includes(k as never) && (isGk ? true : !GROUPS.goalkeeping.includes(k as never)));
    const best = outfield.filter((k) => !(isGk && GROUPS.technical.includes(k as never) && !['passing', 'throwIns'].includes(k))).map((k) => [k, attr(p, k)] as const).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const posList = grp ? posRank.get(grp.slug)! : [];
    const pr = grp ? rankIn(posList, p) : 0;
    const natList = n?.players ?? [];
    const nr = rankIn(natList, p);
    const clubList = c?.players ?? [];
    const cr = rankIn(clubList, p);
    const exp2002 = p.contract && p.contract <= `${world.season + 1}-06-30`;
    const random = p.paRaw !== 0;
    const youngRank = p.age <= 21 ? rankIn(wonderAll, p) : 0;
    const label = `${p.name}`;

    // tekst
    const intro: string[] = [];
    intro.push(`${esc(p.name)} is a ${p.age}-year-old ${roleWord} from ${n ? `<a href="${n.url}">${esc(n.name)}</a>` : esc(nationName(p.nation))}${c ? ` who plays for ${clubLink(p)}` : p.club < 0 ? ' without a club (free agent)' : ` at ${esc(clubName(p))}`} in ${conf.dbName}.`);
    intro.push(`He has a current ability (CA) of <b>${p.ca}</b> and ${random ? `a <b>random potential</b> – the database stores ${p.paRaw}, so the game rolls his potential ability at the start of every new save – ${p.paRaw === -2 ? 'usually between 120 and 200 (153 on average)' : 'usually between 80 and 160 (118 on average)'}` : `a potential ability (PA) of <b>${p.pa}</b>`}${!random && p.pa - p.ca >= 25 ? `, which leaves ${p.pa - p.ca} points of room to grow` : ''}.`);
    if (pr && pr <= 100) intro.push(`That makes him the ${ord(pr)} best ${grp!.one} in the database ${atStart}.`);
    else if (nr && nr <= 50 && n) intro.push(`He is the ${ord(nr)} best ${esc(n.name)} player in the database.`);
    if (youngRank && youngRank <= 200) intro.push(`Among players aged 21 or younger he ranks ${ord(youngRank)} by potential – one of the ${youngRank <= 50 ? 'top' : 'best-known'} ${conf.game} wonderkids.`);
    intro.push(`His best attributes are ${listJoin(best.map(([k, v]) => `${ATTR_LABEL[k].toLowerCase()} (${v})`))}.`);
    // de andre officielle udgaver (3.9.60 = den, spillet selv bruger til 2001/02)
    const other = (conf.otherVersions?.(p.name, p.dob) ?? []).filter(([, club]) => club !== clubName(p));
    if (other.length) {
      const byClub = new Map<string, string[]>();
      for (const [v, club] of other) byClub.set(club, [...(byClub.get(club) ?? []), v]);
      const parts = [...byClub].map(([club, vs]) => `in ${listJoin(vs)} he is ${club === 'Free agent' ? 'a free agent' : `at ${esc(club)}`}`);
      intro.push(`${parts.join('; ').replace(/^in/, 'In')} – <a href="/cm-01-02-database-versions/">see how the database versions differ</a>${other.some(([v]) => v === '3.9.60') ? ' (3.9.60 is the release the game itself uses for 2001/02)' : ''}.`);
    }

    const kv: [string, string][] = [
      ['Club', c ? clubLink(p) : esc(clubName(p))],
      ...other.map(([v, club]) => [`Club in ${v}`, esc(club)] as [string, string]),
      ...(l ? [['League', `<a href="${l.url}">${esc(l.real)}</a>`] as [string, string]] : []),
      ['Nationality', nationLink(p.nation)],
      ['Born', `${longDate(p.dob)} (age ${p.age})`],
      ['Position', esc(p.posStr)],
      ['Preferred foot', FOOT[p.foot] ?? '–'],
      ...(p.height ? [['Height', `${p.height} cm`] as [string, string]] : []),
      ...(p.number ? [['Squad number', String(p.number)] as [string, string]] : []),
      ['International caps', p.caps ? `${p.caps} (${p.intGoals} goals)` : '0'],
      ['Current ability (CA)', String(p.ca)],
      ['Potential ability (PA)', esc(paText(p))],
      ['Contract expires', p.contract ? longDate(p.contract) : '–'],
      ['Wage', p.wage ? `${pounds(p.wage)} a week` : '–'],
      ['Value in CM Reborn', pounds(p.value)],
    ];
    const attrList = (keys: readonly string[]) => `<ul>${keys.map((k) => { const i = A[k as keyof typeof A]; const v = p.attrs[i]; return `<li>${ATTR_LABEL[k]}${v ? `<b class="v ${vc(v)}">${v}</b>` : `<b class="v vx">${p.game[i]}*</b>`}</li>`; }).join('')}</ul>`;
    const missing = ATTRS.some((k) => !p.attrs[A[k]] && (isGk || !GROUPS.goalkeeping.includes(k as never)));
    const groups = (isGk ? ['goalkeeping', 'mental', 'physical', 'technical'] : ['technical', 'mental', 'physical']) as (keyof typeof GROUPS)[];
    const posRatings = POSITIONS.map((k, i) => [k, p.pos[i]] as const).filter(([, v]) => v >= 10).sort((a, b) => b[1] - a[1]);
    const sideRatings = SIDES.map((k, i) => [k, p.side[i]] as const).filter(([, v]) => v >= 10);
    const similar = (grp ? posList : sortedCa).filter((q) => q !== p && q.url && Math.abs(q.ca - p.ca) <= 6 && Math.abs(q.age - p.age) <= 4).slice(0, 6);
    const mates = clubList.filter((q) => q !== p && q.url).slice(0, 6);
    const permit = conf.original && !EU_EEA.has(nationName(p.nation));

    const faq: [string, string][] = [
      [`What is ${label}'s potential in ${conf.game}?`, random ? `${label} has a random potential in ${conf.dbName}: the database value is ${p.paRaw}, so his PA is rolled between ${p.paRaw === -2 ? '150 and 200' : '100 and 150'} in every new game. His current ability is ${p.ca}.` : `${label} has a potential ability (PA) of ${p.pa} and a current ability (CA) of ${p.ca} in ${conf.dbName}.`],
      [`How much does ${label} cost in ${conf.game}?`, `In CM Reborn he is valued at about ${pounds(p.value)} ${atStart}${p.wage ? `, on ${pounds(p.wage)} a week` : ''}. His contract runs until ${p.contract ? longDate(p.contract) : 'unknown'}${exp2002 ? ', so he can leave on a free transfer (Bosman) at the end of the season' : ''}. The selling club, his reputation and your club's reputation all change the price.`],
      [`Where can I find ${label} in ${conf.game}?`, `${label} starts the game at ${clubName(p)}${l ? ` in the ${l.real}` : ''}. Search for him with Find${c && !c.league ? ' – his club is in a league that is not playable, but you can still scout and buy him' : ''}.${permit && conf.original ? ` As a player from ${nationName(p.nation)} (outside the EU) he needs a work permit to join a British club – many caps or a big reputation make it easier.` : ''}`],
    ];

    emit('players', {
      noArticle: true,
      slug: p.url!.slice(1),
      title: `${p.name} ${conf.game} – ${random ? 'Random PA' : `CA ${p.ca} / PA ${p.pa}`}, Attributes & Price | CM Reborn`,
      h1: `${p.name} – ${conf.game} player profile`,
      description: `${p.name} (${p.age}, ${p.posStr}, ${clubName(p)}) in ${conf.game} ${conf.season}: CA ${p.ca}, PA ${paText(p)}, all attributes, hidden stats, position ratings, value and contract from ${conf.dbName}.`,
      crumbs: [hubCrumb, ...(l ? [{ name: l.real, url: l.url }] : n ? [{ name: n.name, url: n.url }] : []), ...(c ? [{ name: c.name, url: c.url }] : [])],
      ld: [{ '@type': 'Person', name: p.name, birthDate: p.dob, nationality: { '@type': 'Country', name: nationName(p.nation) }, ...(c ? { affiliation: { '@type': 'SportsTeam', name: c.name, url: `https://cm0102reborn.com${c.url}` } } : {}), description: `${roleWord} in ${conf.dbName}` }],
      body: `<p class="lead">${intro.join(' ')}</p>
<div class="tags">${p.posStr.split(' ')[0].split('/').map((x) => `<span>${esc(x)}</span>`).join('')}${random ? `<a href="/${P}/lists/random-potential/">Random PA</a>` : ''}${youngRank && youngRank <= 200 ? `<a href="/${P}/lists/wonderkids/">Wonderkid</a>` : ''}${exp2002 ? `<a href="/${P}/lists/free-transfers-${world.season + 1}/">Bosman ${world.season + 1}</a>` : ''}${grp ? `<a href="/${P}/lists/best-${grp.slug}/">Best ${esc(grp.name)}</a>` : ''}</div>
<h2>Profile</h2>
<dl class="kv">${kv.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
<h2>Attributes</h2>
<div class="attrs">${groups.map((gname) => `<section><h3>${gname[0].toUpperCase() + gname.slice(1)}</h3>${attrList(GROUPS[gname])}</section>`).join('')}</div>
<h2>Hidden attributes</h2>
<p class="note">CM 01/02 never shows these in the game – they decide how consistent he is, how he handles big matches and how often he gets injured.</p>
<div class="attrs"><section><h3>Hidden</h3>${attrList(GROUPS.hidden.slice(0, 6))}</section><section><h3>Personality</h3>${attrList(GROUPS.hidden.slice(6))}</section></div>
${missing ? '<p class="note">* Not set in the database (0) – the game generates these when you start a new save; the value shown is CM Reborn\'s.</p>' : ''}
<h2>Positions</h2>
<p>${posRatings.map(([k, v]) => `${POS_LABEL[k]} <b>${v}</b>`).join(' · ')}${sideRatings.length ? ` &nbsp;|&nbsp; Side: ${sideRatings.map(([k, v]) => `${SIDE_LABEL[k]} <b>${v}</b>`).join(' · ')}` : ''}</p>
<p class="note">Position and side ratings run from 1 to 20 – 20 is a natural, 15 or more is accomplished. Below 15 he loses effectiveness there.</p>
${(pr && pr <= 500) || (nr && nr <= 300) || cr ? `<h2>Rankings</h2><ul>${pr && pr <= 500 ? `<li>${ord(pr)} of ${posList.length.toLocaleString('en')} ${grp!.name} — <a href="/${P}/lists/best-${grp!.slug}/">see the best ${esc(grp!.name)}</a></li>` : ''}${nr && nr <= 300 && n ? `<li>${ord(nr)} of ${natList.length.toLocaleString('en')} players from <a href="${n.url}">${esc(n.name)}</a></li>` : ''}${cr && c ? `<li>${ord(cr)} best player at <a href="${c.url}">${esc(c.name)}</a></li>` : ''}</ul>` : ''}
${similar.length ? `<h2>Similar players</h2>${mini(similar, true)}` : ''}
${mates.length ? `<h2>${c ? `${esc(c.name)} team-mates` : 'Team-mates'}</h2>${mini(mates, false)}` : ''}`,
      faq,
    });
  }

  // ---------- klubsider ----------
  const strengthRank = (c: DC) => { const l = c.league ? leagues.get(c.league) : undefined; return l ? l.clubs.indexOf(c) + 1 : 0; };
  for (const c of clubs.values()) {
    const l = c.league ? leagues.get(c.league) : undefined;
    const n = nations.get(c.nation);
    const ps = c.players;
    const star = ps[0];
    const kid = wonder(ps)[0];
    const bosman = ps.filter((p) => p.contract && p.contract <= `${world.season + 1}-06-30`).slice(0, 10);
    const sr = strengthRank(c);
    const avgAge = ps.length ? ps.reduce((s, p) => s + p.age, 0) / ps.length : 0;
    const order: Role[] = ['GK', 'CB', 'FB', 'DM', 'CM', 'WM', 'AM', 'W', 'ST'];
    const squad = ps.slice().sort((a, b) => order.indexOf(a.role) - order.indexOf(b.role) || b.ca - a.ca);
    const intro: string[] = [];
    intro.push(`${esc(c.name)} ${l ? `play in the <a href="${l.url}">${esc(l.real)}</a>` : `are a club from ${n ? `<a href="${n.url}">${esc(n.name)}</a>` : esc(nationName(c.nation))} (their league is not playable, but the players can be scouted and signed)`} in ${conf.dbName}.`);
    if (c.stadium) intro.push(`They play at ${esc(c.stadium)}${c.cap ? ` (capacity ${c.cap.toLocaleString('en')})` : ''}.`);
    if (c.manager) intro.push(`The manager is ${esc(c.manager)}${c.managerNation !== null && c.managerNation !== c.nation ? ` (${esc(nationName(c.managerNation))})` : ''}.`);
    if (star) intro.push(`The best player in the squad is ${pLink(star)} (CA ${star.ca})${kid && kid !== star ? `, and the brightest young talent is ${pLink(kid)} (${kid.age}, PA ${paText(kid)})` : ''}.`);
    if (sr && l) intro.push(`By squad strength (average ability of the best 16 players) they rank ${ord(sr)} of ${l.clubs.length} in the league – ${sr <= 2 ? 'title contenders' : sr <= Math.ceil(l.clubs.length / 4) ? 'one of the top sides' : sr > l.clubs.length - 3 ? 'expect a relegation battle' : 'a mid-table squad'}.`);
    const kv: [string, string][] = [
      ...(l ? [['League', `<a href="${l.url}">${esc(l.real)}</a>`] as [string, string]] : []),
      ['Country', nationLink(c.nation)],
      ...(c.manager ? [['Manager', `${esc(c.manager)}${c.managerNation !== null ? ` <span class="note">(${esc(nationName(c.managerNation))})</span>` : ''}${l ? ` · <a href="/${P}/managers/">all managers</a>` : ''}`] as [string, string]] : []),
      ...(c.kit ? [['Kit manufacturer', esc(c.kit)] as [string, string]] : []),
      ...(c.stadium ? [['Stadium', esc(c.stadium)] as [string, string]] : []),
      ...(c.cap ? [['Capacity', c.cap.toLocaleString('en')] as [string, string]] : []),
      ...(c.gate ? [['Average attendance', c.gate.toLocaleString('en')] as [string, string]] : []),
      ['Reputation', `${c.rep}/100`],
      ...(conf.original && c.balance ? [['Bank balance', pounds(c.balance)] as [string, string]] : []),
      ...(c.facilities ? [['Training facilities', `${c.facilities}/20`] as [string, string]] : []),
      ['Players in database', String(ps.length)],
      ['Average age', avgAge.toFixed(1)],
      ...(c.colors ? [['Colours', `<span class="sw" style="background:${esc(c.colors[0])}"></span><span class="sw" style="background:${esc(c.colors[1])}"></span>`] as [string, string]] : []),
    ];
    const others = l ? l.clubs.filter((x) => x !== c) : [];
    emit('clubs', {
      slug: c.url.slice(1),
      title: `${c.name} ${conf.game} – Squad, Best Players & Wonderkids (${conf.season}) | CM Reborn`,
      h1: `${c.name} – ${conf.game} squad and players`,
      description: `${c.name} in ${conf.game} ${conf.season}: the full squad with CA/PA, the best players${kid ? ', wonderkids' : ''}${c.manager ? `, manager ${c.manager}` : ''}, stadium, budget and the players out of contract – from ${conf.dbName}.`,
      crumbs: [hubCrumb, ...(l ? [{ name: l.real, url: l.url }] : n ? [{ name: n.name, url: n.url }] : [])],
      image: c.photo ? `https://cm0102reborn.com${c.photo}` : undefined,
      ld: [{ '@type': 'SportsTeam', name: c.name, sport: 'Football', ...(c.logo ? { logo: c.logo } : {}), ...(c.manager ? { coach: { '@type': 'Person', name: c.manager, ...(c.managerNation !== null ? { nationality: nationName(c.managerNation) } : {}) } } : {}), ...(c.stadium ? { location: { '@type': 'StadiumOrArena', name: c.stadium, ...(c.cap ? { maximumAttendeeCapacity: c.cap } : {}) } } : {}), ...(l ? { memberOf: { '@type': 'SportsOrganization', name: l.real } } : {}) }],
      body: `<div class="hero">${c.logo ? `<img class="crest" src="${esc(c.logo)}" alt="${esc(c.name)} crest" loading="lazy" width="84" height="84">` : ''}<p class="lead" style="flex:1;min-width:260px">${intro.join(' ')}</p></div>
${c.photo ? `<img class="photo" src="${c.photo}" alt="${esc(c.stadium)}" loading="lazy">` : ''}
<dl class="kv">${kv.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
<h2>${esc(c.name)} squad in ${conf.game}</h2>
${table(squad, { club: false, contract: true, wage: true })}
${wonder(ps).length ? `<h2>Wonderkids at ${esc(c.name)}</h2>${table(wonder(ps).slice(0, 8), { club: false })}` : ''}
${bosman.length ? `<h2>Contracts expiring in ${world.season + 1} (Bosman)</h2><p>These players are out of contract at the end of the season – sign a new deal or lose them for free.</p>${table(bosman, { club: false, contract: true })}` : ''}
${others.length ? `<h2>Other clubs in the ${esc(l!.real)}</h2><div class="cols">${others.map((x) => `<a href="${x.url}">${esc(x.name)}</a>`).join('')}</div>` : ''}
${c.photo ? '<p class="note">Stadium photo: Naydav\'s CM0102 Background Image Pack.</p>' : ''}`,
      faq: [
        [`Who is the best player at ${c.name} in ${conf.game}?`, star ? `${star.name} (CA ${star.ca}, PA ${paText(star)}).${ps[1] ? ` Next are ${listJoin(ps.slice(1, 4).map((p) => `${p.name} (${p.ca})`))}.` : ''}` : 'The club has no players in the database.'],
        ...(kid ? [[`Who is the best wonderkid at ${c.name}?`, `${kid.name}, aged ${kid.age}, with a potential of ${paText(kid)}.`] as [string, string]] : []),
        ...(c.manager ? [[`Who is the manager of ${c.name} in ${conf.game}?`, `${c.manager}${c.managerNation !== null ? ` (${nationName(c.managerNation)})` : ''}${conf.original ? ', as in the original database' : ''}.${c.kit ? ` The kit is made by ${c.kit}.` : ''}`] as [string, string]] : []),
        [`Can I manage ${c.name} in CM Reborn?`, l ? `Yes. Start a new game with ${conf.original ? 'the original 2001/02 database' : `the ${conf.season} database`}, choose ${nationName(c.nation)} and pick ${c.name}.` : `No – ${c.name}'s league is not playable in this database, but you can scout and sign their players.`],
      ],
    });
  }

  // ---------- ligasider ----------
  for (const l of leagues.values()) {
    const ps = l.clubs.flatMap((c) => c.players).sort((a, b) => b.ca - a.ca);
    const kids = wonder(ps);
    const n = nations.get(l.nation);
    const others = [...leagues.values()].filter((x) => x.nation === l.nation && x !== l);
    emit('leagues', {
      slug: l.url.slice(1),
      title: `${l.real} ${conf.game} – Clubs, Best Players & Wonderkids (${conf.season}) | CM Reborn`,
      h1: `${leagueTitle(l)} in ${conf.game}`,
      description: `The ${l.real} in ${conf.game} ${conf.season}: all ${l.clubs.length} clubs ranked by squad strength, the best players and the top wonderkids in the league – from ${conf.dbName}.`,
      crumbs: [hubCrumb, ...(n ? [{ name: n.name, url: n.url }] : [])],
      body: `<p class="lead">The ${esc(l.real)} has ${l.clubs.length} clubs and ${ps.length.toLocaleString('en')} players in ${conf.dbName}${l.tier > 1 ? ` – it is tier ${l.tier} in ${esc(nationName(l.nation))}` : ''}. ${ps[0] ? `The best player is ${pLink(ps[0])} of ${clubLink(ps[0])} (CA ${ps[0].ca})` : ''}${kids[0] ? `, and the top wonderkid is ${pLink(kids[0])} (${kids[0].age}, PA ${paText(kids[0])})` : ''}.</p>
<h2>Clubs by squad strength</h2>
<p class="note">Average current ability of each club's best 16 players – a guide to who should finish where, not a prediction.</p>
<div class="tw"><table><thead><tr><th>#</th><th>Club</th><th>Stadium</th><th class="n">Capacity</th><th class="n">Rep</th><th>Best player</th><th class="n">Strength</th></tr></thead><tbody>${l.clubs.map((c, i) => `<tr><td>${i + 1}</td><td><a href="${c.url}"><b>${esc(c.name)}</b></a></td><td>${esc(c.stadium)}</td><td class="n">${c.cap ? c.cap.toLocaleString('en') : '–'}</td><td class="n">${c.rep}</td><td>${c.players[0] ? pLink(c.players[0]) : '–'}</td><td class="n">${c.strength.toFixed(1)}</td></tr>`).join('')}</tbody></table></div>
<h2>Best players in the ${esc(l.real)}</h2>${table(ps.slice(0, 30), { nation: true })}
${kids.length ? `<h2>Wonderkids in the ${esc(l.real)}</h2>${table(kids.slice(0, 20))}` : ''}
${others.length ? `<h2>Other leagues in ${esc(nationName(l.nation))}</h2><p>${others.map((x) => `<a href="${x.url}">${esc(x.real)}</a>`).join(' · ')}</p>` : ''}`,
      faq: [
        [`Who are the best players in the ${l.real} in ${conf.game}?`, listJoin(ps.slice(0, 5).map((p) => `${p.name} (${clubName(p)}, CA ${p.ca})`)) + '.'],
        [`Which ${l.real} club has the strongest squad in ${conf.game}?`, `${l.clubs[0].name}, followed by ${listJoin(l.clubs.slice(1, 3).map((c) => c.name))} (average ability of the best 16 players).`],
      ],
      list: { name: `${l.real} clubs in ${conf.game}`, items: l.clubs.map((c) => ({ name: c.name, url: c.url })) },
    });
  }

  // ---------- landesider ----------
  const nt = world.nationalTeams?.nations ?? {};
  for (const n of nations.values()) {
    const ps = n.players;
    const kids = wonder(ps);
    const info = nt[String(n.idx)];
    const ls = [...leagues.values()].filter((l) => l.nation === n.idx).sort((a, b) => a.tier - b.tier);
    const hiddenClubs = [...clubs.values()].filter((c) => c.nation === n.idx && !c.league);
    const squad = ps.filter((p) => p.url).slice(0, 23);
    const titles = info?.titles ? Object.entries(info.titles).filter(([, v]) => v > 0) : [];
    emit('nations', {
      slug: n.url.slice(1),
      title: `${n.name} in ${conf.game} – Best Players & Wonderkids (${conf.season}) | CM Reborn`,
      h1: `${n.name}: the best ${conf.game} players and wonderkids`,
      description: `The best ${n.name} players in ${conf.game} ${conf.season}, the top ${n.name} wonderkids${ls.length ? `, the ${ls.map((l) => l.real).slice(0, 2).join(' and ')}` : ''}${info?.coach ? ` and the national team` : ''} – from ${conf.dbName}.`,
      crumbs: [hubCrumb],
      body: `<p class="lead">${conf.dbName[0].toUpperCase() + conf.dbName.slice(1)} has ${ps.length.toLocaleString('en')} players from ${esc(n.name)}.${ps[0] ? ` The best is ${pLink(ps[0])} (${clubLink(ps[0])}, CA ${ps[0].ca})` : ''}${kids[0] ? ` and the biggest talent is ${pLink(kids[0])} (${kids[0].age}, PA ${paText(kids[0])})` : ''}.</p>
${info && (info.coach || info.stadium) ? `<h2>${esc(n.name)} national team</h2><dl class="kv">${info.coach ? `<div><dt>Coach</dt><dd>${esc(info.coach)}</dd></div>` : ''}${info.stadium ? `<div><dt>Stadium</dt><dd>${esc(info.stadium)}</dd></div>` : ''}${info.cap ? `<div><dt>Capacity</dt><dd>${info.cap.toLocaleString('en')}</dd></div>` : ''}${titles.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${v}</dd></div>`).join('')}</dl>` : ''}
${squad.length ? `<h2>The best ${esc(n.name)} players</h2>${table(ps.slice(0, 40), { nation: false })}` : ''}
${kids.length ? `<h2>${esc(n.name)} wonderkids</h2>${table(kids.slice(0, 30), { nation: false })}` : ''}
${ls.length ? `<h2>Leagues in ${esc(n.name)}</h2><ul>${ls.map((l) => `<li><a href="${l.url}">${esc(leagueTitle(l))}</a> – ${l.clubs.length} clubs</li>`).join('')}</ul>` : ''}
${hiddenClubs.length ? `<h2>Other ${esc(n.name)} clubs with notable players</h2><p class="note">These leagues are not playable, but their players can be scouted and signed.</p><div class="cols">${hiddenClubs.map((c) => `<a href="${c.url}">${esc(c.name)}</a>`).join('')}</div>` : ''}`,
      faq: [
        [`Who is the best ${n.name} player in ${conf.game}?`, ps[0] ? `${ps[0].name} (${clubName(ps[0])}, CA ${ps[0].ca}).${ps[1] ? ` Next: ${listJoin(ps.slice(1, 4).map((p) => p.name))}.` : ''}` : '–'],
        ...(kids[0] ? [[`Who is the best ${n.name} wonderkid in ${conf.game}?`, `${kids[0].name} (${clubName(kids[0])}), aged ${kids[0].age}, with a potential of ${paText(kids[0])}.`] as [string, string]] : []),
      ],
    });
  }

  // ---------- toplister ----------
  interface L { slug: string; title: string; h1: string; description: string; intro: string; rows: DP[]; extra?: [string, (p: DP) => string]; value?: boolean; contract?: boolean; wage?: boolean; group: string }
  const lists: L[] = [];
  const pool = all.filter((p) => p.club >= 0 || p.ca >= 100);
  for (const grp of POS_GROUPS) {
    lists.push({ group: 'Best players by position', slug: `best-${grp.slug}`, title: `Best ${grp.name} in ${conf.game} – Top 50 (${conf.season}) | CM Reborn`, h1: `The best ${grp.name} in ${conf.game}`, description: `The 50 best ${grp.name} in ${conf.game} ${conf.season} by current ability, with age, club, CA and PA – from ${conf.dbName}.`, intro: `The highest-rated ${grp.name} in ${conf.dbName}, sorted by current ability (CA). A player is listed when his rating for the position is 15 or more (accomplished or natural).`, rows: posRank.get(grp.slug)!.slice(0, 50), value: true });
    lists.push({ group: 'Wonderkids by position', slug: `wonderkid-${grp.slug}`, title: `${conf.game} Wonderkid ${grp.name[0].toUpperCase() + grp.name.slice(1)} – Best Young ${grp.one[0].toUpperCase() + grp.one.slice(1)}s | CM Reborn`, h1: `${conf.game} wonderkids: the best young ${grp.name}`, description: `The best young ${grp.name} (21 or younger) in ${conf.game} ${conf.season}, sorted by potential ability – including random-potential players – from ${conf.dbName}.`, intro: `${grp.name[0].toUpperCase() + grp.name.slice(1)} aged 21 or younger on 1 July ${world.season}, sorted by potential (random potential counted as the middle of its range).`, rows: wonder(pool).filter(grp.test).slice(0, 40), value: true });
  }
  const ATTR_LISTS: [string, string, string, boolean?][] = [
    ['pace', 'fastest-players', 'The fastest players'], ['acceleration', 'best-acceleration', 'The quickest off the mark (acceleration)'], ['finishing', 'best-finishers', 'The best finishers'], ['passing', 'best-passers', 'The best passers'],
    ['dribbling', 'best-dribblers', 'The best dribblers'], ['heading', 'best-headers', 'The best headers of the ball'], ['freeKicks', 'best-free-kick-takers', 'The best free-kick takers'], ['penalties', 'best-penalty-takers', 'The best penalty takers'],
    ['longShots', 'best-long-shots', 'The best long-range shooters'], ['crossing', 'best-crossers', 'The best crossers'], ['tackling', 'best-tacklers', 'The best tacklers'], ['marking', 'best-markers', 'The best man-markers'],
    ['creativity', 'most-creative-players', 'The most creative players'], ['technique', 'best-technique', 'The most technical players'], ['flair', 'most-flair', 'The players with the most flair'], ['stamina', 'best-stamina', 'The players with the best stamina'],
    ['strength', 'strongest-players', 'The strongest players'], ['jumping', 'best-jumpers', 'The best jumpers'], ['determination', 'most-determined-players', 'The most determined players'], ['influence', 'best-leaders', 'The best leaders (influence)'],
    ['consistency', 'most-consistent-players', 'The most consistent players (hidden)'], ['importantMatches', 'big-game-players', 'The best big-game players (important matches, hidden)'], ['versatility', 'most-versatile-players', 'The most versatile players (hidden)'], ['reflexes', 'best-goalkeeper-reflexes', 'The goalkeepers with the best reflexes'],
    ['throwIns', 'best-long-throws', 'The best throw-in takers'], ['corners', 'best-corner-takers', 'The best corner takers'],
  ];
  for (const [k, slug, h] of ATTR_LISTS) {
    const i = A[k as keyof typeof A];
    const rows = pool.filter((p) => p.attrs[i] > 0 && (k === 'reflexes' ? p.role === 'GK' : p.role !== 'GK')).sort((a, b) => b.attrs[i] - a.attrs[i] || b.ca - a.ca).slice(0, 50);
    lists.push({ group: 'Attribute leaders', slug, title: `${h.replace(/^The /, '')} in ${conf.game} (${ATTR_LABEL[k]}) | CM Reborn`, h1: `${h} in ${conf.game}`, description: `${h} in ${conf.game} ${conf.season}: the top 50 by ${ATTR_LABEL[k].toLowerCase()} (1–20), with club, age, CA and PA – read from ${conf.dbName}.`, intro: `Sorted by ${ATTR_LABEL[k].toLowerCase()} as stored in ${conf.dbName} (1–20), then by current ability.${GROUPS.hidden.includes(k as never) ? ' This is a hidden attribute – the original game never shows it.' : ''}`, rows, extra: [ATTR_LABEL[k], (p) => String(p.attrs[i])] });
  }
  const yr = world.season + 1;
  const bosman = (year: number) => pool.filter((p) => p.club >= 0 && p.contract && p.contract.slice(0, 4) === String(year) && p.contract.slice(5) <= '07-01').sort((a, b) => b.ca - a.ca);
  lists.push({ group: 'Transfers', slug: `free-transfers-${yr}`, title: `${conf.game} Free Transfers – Best Bosman Players ${yr} | CM Reborn`, h1: `${conf.game} free transfers: the best players out of contract in ${yr}`, description: `The best players whose contracts run out in summer ${yr} in ${conf.game} – sign them on a Bosman free transfer. CA, PA, wage and club from ${conf.dbName}.`, intro: `Their contracts expire in the summer of ${yr}. From January you can agree a pre-contract with players abroad, and the move happens for free when the contract runs out (the Bosman ruling).`, rows: bosman(yr).slice(0, 100), wage: true, contract: true });
  lists.push({ group: 'Transfers', slug: `free-transfers-${yr + 1}`, title: `${conf.game} Contracts Expiring ${yr + 1} – Future Bosman Targets | CM Reborn`, h1: `${conf.game}: the best players out of contract in ${yr + 1}`, description: `Players whose contracts end in summer ${yr + 1} in ${conf.game} – cheap now, free later. From ${conf.dbName}.`, intro: `Their clubs are under pressure to sell a year before the contract ends, so prices drop – or wait and sign them for free.`, rows: bosman(yr + 1).slice(0, 100), wage: true, contract: true });
  const bargains = pool.filter((p) => p.club >= 0 && p.age <= 30 && p.ca >= 120).sort((a, b) => b.ca / Math.max(50_000, b.value) - a.ca / Math.max(50_000, a.value)).slice(0, 60);
  lists.push({ group: 'Transfers', slug: 'bargains', title: `${conf.game} Bargains – Best Cheap Players to Sign | CM Reborn`, h1: `${conf.game} bargains: good players for little money`, description: `Cheap gems in ${conf.game} ${conf.season}: players with high ability and a low value, aged 30 or younger – with club, CA, PA and value.`, intro: `Current ability of 120 or more, aged 30 or younger, sorted by ability per pound of value (CM Reborn's valuation at the start of the game). Clubs may still ask for more than the value.`, rows: bargains, value: true, wage: true });
  const free = all.filter((p) => p.club < 0).sort((a, b) => b.ca - a.ca).slice(0, 60);
  if (free.length) lists.push({ group: 'Transfers', slug: 'free-agents', title: `${conf.game} Free Agents – Best Unattached Players at the Start | CM Reborn`, h1: `The best free agents in ${conf.game}`, description: `The best players without a club at the start of ${conf.game} ${conf.season} – sign them for nothing but wages.`, intro: `These players have no club on 1 July ${world.season}. Offer a contract and they can join straight away.`, rows: free });
  lists.push({ group: 'Wonderkids', slug: 'wonderkids', title: `${conf.game} Wonderkids – The 200 Best Young Players (${conf.season}) | CM Reborn`, h1: `${conf.game} wonderkids: the top 200`, description: `The 200 best young players (21 or younger) in ${conf.game} ${conf.season} by potential ability, including random-potential players, from ${conf.dbName}.`, intro: `Players aged 21 or younger on 1 July ${world.season}, sorted by potential ability. Random potential counts as the middle of its range.`, rows: wonder(pool).slice(0, 200), value: true });
  for (const age of [17, 18, 19]) lists.push({ group: 'Wonderkids', slug: `best-under-${age + 1}`, title: `${conf.game} Best Players Aged ${age} and Under – Wonderkids | CM Reborn`, h1: `${conf.game}: the best players aged ${age} or younger`, description: `The best ${age}-year-olds and younger in ${conf.game} ${conf.season}, sorted by potential ability – from ${conf.dbName}.`, intro: `Aged ${age} or younger on 1 July ${world.season}.`, rows: wonder(pool, age).slice(0, 60), value: true });
  const randoms = all.filter((p) => p.paRaw && p.age <= 25).sort((a, b) => a.paRaw - b.paRaw || b.ca - a.ca);
  if (randoms.length) lists.push({ group: 'Wonderkids', slug: 'random-potential', title: `${conf.game} Random Potential (PA -1 / -2) Players – Full List | CM Reborn`, h1: `${conf.game} random-potential players (PA -1 and -2)`, description: `Every young player with a random potential in ${conf.dbName}: -2 usually means PA 120–200 (average 153), -1 usually 80–160 (average 118), rolled in each new save. The source of legends like Cherno Samba.`, intro: `Instead of a fixed potential, the database stores -1 or -2 for these players, and the game rolls a new PA at the start of every save: -2 usually gives 120–200 (average 153, 1 in 10 reaches 180+), -1 usually 80–160 (average 118). <a href="/cm-01-02-ca-pa-explained/">The exact rules →</a> That is why some of them become world-beaters in one save and journeymen in the next. ${randoms.filter((p) => p.paRaw === -2).length} players have -2 and ${randoms.filter((p) => p.paRaw === -1).length} have -1 (aged 25 or younger).`, rows: randoms.slice(0, 400) });
  if (conf.cult?.size) {
    // i fanlistens rækkefølge; samme navn flere gange (fx Ronaldo) → den bedste
    const legends = [...conf.cult].flatMap((n) => all.filter((p) => p.name === n).sort((a, b) => b.ca - a.ca).slice(0, 1));
    lists.push({ group: 'Wonderkids', slug: 'legends', title: `${conf.game} Legends – The Cult Heroes Every Manager Remembers | CM Reborn`, h1: `${conf.game} legends: the cult heroes`, description: `${legends.slice(0, 5).map((p) => p.last).join(', ')} and ${Math.max(0, legends.length - 5)} more: the players CM 01/02 managers still talk about – with their real database attributes, CA and PA.`, intro: `The names the ${conf.game} community never forgot, collected from fan lists and forums – Belarusian strikers nobody had heard of, 15-year-olds who won the Ballon d'Or in your save, and free agents who carried teams. Most of them have a random potential, so how good they get changes from save to save. Click a name for every attribute.`, rows: legends, value: true });
  }
  lists.push({ group: 'Other', slug: 'best-veterans', title: `${conf.game} Best Veterans – Top Players Aged 32+ | CM Reborn`, h1: `The best veterans in ${conf.game} (32 and older)`, description: `Experienced players aged 32 or older in ${conf.game} ${conf.season} who can still do a job – cheap, often on short contracts.`, intro: `Aged 32 or older on 1 July ${world.season}, sorted by current ability.`, rows: pool.filter((p) => p.age >= 32).sort((a, b) => b.ca - a.ca).slice(0, 50), contract: true, wage: true });
  const lowLeague = [...leagues.values()].filter((l) => l.tier >= 3).flatMap((l) => l.clubs.flatMap((c) => c.players));
  if (lowLeague.length) lists.push({ group: 'Other', slug: 'lower-league-gems', title: `${conf.game} Lower League Gems – Best Players Below the Second Tier | CM Reborn`, h1: `${conf.game} lower-league gems`, description: `The best players and biggest talents in the third and fourth tiers in ${conf.game} ${conf.season} – perfect for a lower-league save.`, intro: `Players at clubs in the third tier or below, sorted by potential.`, rows: lowLeague.sort((a, b) => expPa(b) - expPa(a) || b.ca - a.ca).slice(0, 60), value: true });
  lists.push({ group: 'Best players by position', slug: 'best-players', title: `${conf.game} Best Players – Top 100 by Current Ability (${conf.season}) | CM Reborn`, h1: `The 100 best players in ${conf.game}`, description: `The 100 highest-rated players in ${conf.game} ${conf.season} by current ability, with club, nation, CA, PA and value – from ${conf.dbName}.`, intro: `Sorted by current ability (CA) ${atStart}.`, rows: sortedCa.slice(0, 100), value: true });
  for (const L of lists) {
    if (!L.rows.length) continue;
    emit('lists', {
      slug: `${P}/lists/${L.slug}/`, title: L.title, h1: L.h1, description: L.description, crumbs: [hubCrumb, { name: 'Lists', url: `/${P}/lists/` }],
      body: `<p class="lead">${L.intro}</p>${table(L.rows, { extra: L.extra, value: L.value, contract: L.contract, wage: L.wage })}
<p class="note">CA = current ability, PA = potential ability (1–200). R −2 / R −1 = random potential, rolled in every new game (−2 usually 120–200, −1 usually 80–160). Values are CM Reborn's at the start of the game.</p>
<h2>More ${conf.game} lists</h2><div class="cols">${lists.filter((x) => x !== L && x.group === L.group).map((x) => `<a href="/${P}/lists/${x.slug}/">${esc(x.h1.replace(` in ${conf.game}`, '').replace(`${conf.game}: `, '').replace(`${conf.game} `, ''))}</a>`).join('')}</div>`,
      list: { name: L.h1, items: L.rows.slice(0, 20).map((p) => ({ name: p.name, url: p.url ?? undefined })) },
    });
  }
  const listGroups = [...new Set(lists.map((l) => l.group))];
  const listIndex = listGroups.map((gr) => `<h3>${gr}</h3><div class="cols">${lists.filter((l) => l.group === gr && l.rows.length).map((l) => `<a href="/${P}/lists/${l.slug}/">${esc(l.h1.replace(`${conf.game}: `, '').replace(` in ${conf.game}`, ''))}</a>`).join('')}</div>`).join('');
  // ---------- managere (databasens egne – 2026/27 fra Wikipedias trænerlister) ----------
  {
    const mgrs = [...leagues.values()].flatMap((l) => l.clubs.filter((c) => c.manager).map((c) => ({ c, l }))).sort((a, b) => a.l.tier - b.l.tier || b.c.rep - a.c.rep);
    if (mgrs.length) {
      const natCount = new Map<string, number>();
      for (const { c } of mgrs) if (c.managerNation !== null) natCount.set(nationName(c.managerNation), (natCount.get(nationName(c.managerNation)) ?? 0) + 1);
      const topNat = [...natCount].sort((a, b) => b[1] - a[1]).slice(0, 5);
      const foreign = mgrs.filter(({ c }) => c.managerNation !== null && c.managerNation !== c.nation).length;
      const famous = mgrs.slice(0, 6).map(({ c }) => `${c.manager} (${c.name})`);
      emit('lists', {
        slug: `${P}/managers/`,
        title: `${conf.game} Managers ${conf.season} – Every Club's Manager | CM Reborn`,
        h1: `${conf.game} managers (${conf.season})`,
        description: `All ${mgrs.length} managers in ${conf.game} ${conf.season} – ${listJoin(famous.slice(0, 3))} and the rest – with nationality, club and league, from ${conf.dbName}.`,
        crumbs: [hubCrumb],
        body: `<p class="lead">The manager of every club in the playable leagues of ${conf.dbName}${conf.original ? ', exactly as in the original game' : ''}. ${foreign} of the ${mgrs.length} are managing abroad; the most common nationalities are ${listJoin(topNat.map(([n, k]) => `${esc(n)} (${k})`))}.</p>
<div class="tw"><table><thead><tr><th>#</th><th>Manager</th><th>Nationality</th><th>Club</th><th>League</th></tr></thead><tbody>${mgrs.map(({ c, l }, i) => `<tr><td>${i + 1}</td><td><b>${esc(c.manager)}</b></td><td>${c.managerNation !== null ? esc(nationName(c.managerNation)) : '–'}</td><td><a href="${c.url}">${esc(c.name)}</a></td><td><a href="${l.url}">${esc(l.real)}</a></td></tr>`).join('')}</tbody></table></div>
<p>In CM Reborn you take over from one of them – or from the outside as an unknown – and the board judges you against the club's expectations.</p>`,
        faq: [
          [`Who are the managers in ${conf.game} ${conf.season}?`, `${listJoin(famous)} lead the biggest clubs; all ${mgrs.length} are listed on this page.`],
          [`Can I replace ${mgrs[0].c.manager} at ${mgrs[0].c.name}?`, `Yes. Start a new game with ${conf.original ? 'the original 2001/02 database' : `the ${conf.season} database`} and pick ${mgrs[0].c.name} – the AI manager steps aside.`],
        ],
      });
    }
  }
  emit('lists', { slug: `${P}/lists/`, title: `${conf.game} Player Lists – Wonderkids, Bosmans, Best by Position | CM Reborn`, h1: `${conf.game} player lists`, description: `Every ${conf.game} ${conf.season} list in one place: best players by position, wonderkids, free transfers, bargains, the fastest players, the best free-kick takers and more.`, crumbs: [hubCrumb], body: `<p class="lead">Lists built from ${conf.dbName}. Click a player for all his attributes.</p>${listIndex}` });

  // ---------- A-Z ----------
  const letters = new Map<string, DP[]>();
  for (const p of kept) { const ch = slugify(p.last)[0]; const k = /[a-z]/.test(ch) ? ch : '0'; letters.set(k, [...(letters.get(k) ?? []), p]); }
  const letterKeys = [...letters.keys()].sort();
  const azNav = `<p class="tags">${letterKeys.map((k) => `<a href="/${P}/players/${k}/">${k === '0' ? '#' : k.toUpperCase()}</a>`).join('')}</p>`;
  for (const k of letterKeys) {
    const ps = letters.get(k)!.sort((a, b) => slugify(a.last).localeCompare(slugify(b.last)) || a.name.localeCompare(b.name));
    emit('lists', { slug: `${P}/players/${k}/`, title: `${conf.game} Players ${k === '0' ? '#' : k.toUpperCase()} – Surnames A–Z | CM Reborn`, h1: `${conf.game} players: ${k === '0' ? 'other' : k.toUpperCase()}`, description: `All ${ps.length} ${conf.game} players with a profile whose surname starts with ${k === '0' ? 'a number or symbol' : k.toUpperCase()} – attributes, CA and PA.`, crumbs: [hubCrumb, { name: 'Players A–Z', url: `/${P}/players/` }], body: `${azNav}<div class="cols">${ps.map((p) => `<a href="${p.url}">${esc(p.name)}</a>`).join('')}</div>` });
  }
  emit('lists', { slug: `${P}/players/`, title: `${conf.game} Players A–Z – ${kept.length.toLocaleString('en')} Player Profiles | CM Reborn`, h1: `${conf.game} players A–Z`, description: `Browse ${kept.length.toLocaleString('en')} ${conf.game} ${conf.season} player profiles by surname – every attribute, hidden stats, CA and PA.`, crumbs: [hubCrumb], body: `<p class="lead">Every player with a profile, by surname.</p>${azNav}` });

  // ---------- søgning + forsiden ----------
  const search = [
    ...kept.map((p) => [p.name, p.url!.slice(P.length + 2), `${clubName(p)} · ${p.posStr}`]),
    ...[...clubs.values()].map((c) => [c.name, c.url.slice(P.length + 2), 'Club']),
  ];
  writeFileSync(`public/${P}/search.json`, JSON.stringify(search));
  const byTier = [...leagues.values()].sort((a, b) => nationName(a.nation).localeCompare(nationName(b.nation)) || a.tier - b.tier);
  const script = `(()=>{let d=null;const q=document.getElementById('q'),r=document.getElementById('res');const n=s=>s.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'');q.addEventListener('input',async()=>{if(!d)d=await (await fetch('/${P}/search.json')).json();const t=n(q.value.trim());if(t.length<2){r.innerHTML='';return}const w=t.split(/\\s+/);const m=[];for(const x of d){const k=n(x[0]);if(w.every(y=>k.includes(y))){m.push(x);if(m.length>=30)break}}r.innerHTML=m.map(x=>'<a href="/${P}/'+x[1]+'">'+x[0].replace(/</g,'&lt;')+' <span class=note>'+x[2].replace(/</g,'&lt;')+'</span></a>').join('')||'<p class=note>No match</p>'})})()`;
  emit('hub', {
    slug: `${P}/`,
    title: `${conf.game} Database ${conf.season} – Every Player, Club & League | CM Reborn`,
    h1: `The ${conf.game} database (${conf.season})`,
    description: `Search ${kept.length.toLocaleString('en')} ${conf.game} player profiles with full attributes, hidden stats, CA and PA, plus ${clubs.size.toLocaleString('en')} clubs and ${leagues.size} leagues – read from ${conf.dbName}.`,
    ogType: 'website',
    body: `<p class="lead">Everything in ${conf.dbName}: ${all.length.toLocaleString('en')} players, ${clubs.size.toLocaleString('en')} clubs and ${leagues.size} playable leagues. Every profile shows the real attributes (1–20), the hidden ones, position ratings, CA and PA – and you can sign all of them in CM Reborn, free in your browser.</p>
<input id="q" type="search" placeholder="Search a player or club…" autocomplete="off" aria-label="Search the ${conf.game} database"><div id="res"></div>
${CTA}
<h2>Popular lists</h2><div class="tags">${['wonderkids', 'best-players', `free-transfers-${yr}`, 'bargains', 'random-potential', 'fastest-players', 'best-free-kick-takers', 'best-strikers', 'wonderkid-strikers', 'best-defensive-midfielders'].filter((s) => lists.some((l) => l.slug === s && l.rows.length)).map((s) => `<a href="/${P}/lists/${s}/">${esc(lists.find((l) => l.slug === s)!.h1.replace(`${conf.game}: `, '').replace(` in ${conf.game}`, ''))}</a>`).join('')}<a href="/${P}/managers/">Managers</a><a href="/${P}/lists/">All lists →</a></div>
<h2>Leagues</h2><div class="cols">${byTier.map((l) => `<a href="${l.url}">${esc(l.real)}${l.real !== l.name ? ` <span class="note">${esc(nationName(l.nation))}</span>` : ''}</a>`).join('')}</div>
<h2>Players by nationality</h2><div class="cols">${[...nations.values()].sort((a, b) => b.players.length - a.players.length).slice(0, 90).sort((a, b) => a.name.localeCompare(b.name)).map((n) => `<a href="${n.url}">${esc(n.name)}</a>`).join('')}</div>
<h2>Players A–Z</h2>${azNav}`,
    script,
  });

  const summary = `${kept.length} spillere, ${clubs.size} klubber, ${leagues.size} ligaer, ${nations.size} lande, ${urls.lists.length} lister`;
  const playerUrl = new Map(kept.map((p) => [`${p.name}|${clubName(p)}`, p.url!]));
  const clubSum: ClubSum[] = [...leagues.values()].flatMap((l) => l.clubs.map((c) => ({ name: c.name, url: c.url, league: l.real, leagueUrl: l.url, tier: l.tier, nation: nationName(c.nation), balance: c.balance, rep: c.rep, strength: c.strength, kids: wonder(c.players).length, cap: c.cap, stadium: c.stadium, best: c.players[0]?.name ?? '' })));
  return { urls, playerUrl, kept: kept.map((p) => ({ ...p, clubName: clubName(p) })), clubSum, players: kept.length, clubs: clubs.size, leagues: leagues.size, nations: nations.size, lists: urls.lists.length, hub: `/${P}/`, summary };
}
