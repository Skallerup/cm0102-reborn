// Statiske SEO-sider (rent HTML – kan læses af søgemaskiner og AI-crawlere uden JavaScript), bygget ud fra
// spillets egne databaser: hvad CM 01/02-fans søger efter (wonderkids, bedste spillere, taktik, data-update,
// spil på Mac/iPad/Chromebook, spil online). Skriver public/<side>/index.html, public/sitemap.xml og public/llms.txt.
// Kør: npx tsx scripts/build-seo.ts  (køres også før build: "prebuild" i package.json)
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { CTA, SITE, TODAY, esc, render, shotFig, slugify, type Page } from './seo/layout';
import { contentDate, dateOf, saveLastmod } from './seo/lastmod';
import { langDevices } from './seo/i18nDevices';
import { buildDb, pounds } from './seo/db';
import { WC2002 } from '../src/game/international';
import { CHANGELOG } from '../src/ui/changelogData';
import { langGuides } from './seo/i18nGuides';
import { alternatesFor, langPages, toPage } from './seo/i18n';
import { guides } from './seo/guides';

/** dato for databasesidernes indhold (sitemap lastmod) – hæv den, når siderne ændres mærkbart */
const CONTENT_DATE = '2026-11-09';

type Row = (string | number)[];
interface World { season: number; playerFields: string[]; players: Row[]; clubs: Row[]; nations: { name: string }[]; leagues: { id: string; name: string; nation: number; tier?: number }[]; ratings: Record<string, { ca: number; pa: number; paRaw?: number }> }
const load = (f: string) => JSON.parse(readFileSync(f.includes('/') ? f : `public/data/${f}`, 'utf8')) as World;
// SEO-siderne bygger (indtil videre) på 3.9.68 – spillet bruger 3.9.60 (public/data/world-original.json), som ejerens
// originale CM 01/02 gør for 2001/02. Url'erne skal være stabile, så de indekserede sider ikke forsvinder.
export const SEO_ORIGINAL = 'scripts/seo/world-original-3968.json';
const orig = load(SEO_ORIGINAL);
const modern = load('world.json');

interface P { name: string; age: number; pos: string; club: string; nation: string; ca: number; pa: number; random: boolean; dob: string }
function players(w: World): P[] {
  const F = Object.fromEntries(w.playerFields.map((f, i) => [f, i]));
  const club = new Map(w.clubs.map((c) => [c[0] as number, c[1] as string]));
  const start = `${w.season}-07-01`;
  return w.players.flatMap((r) => {
    const rt = w.ratings[String(r[F.id])];
    if (!rt) return [];
    const dob = r[F.dob] as string;
    const age = Number(start.slice(0, 4)) - Number(dob.slice(0, 4)) - (dob.slice(5) > start.slice(5) ? 1 : 0);
    const first = String(r[F.first] ?? '').trim(), last = String(r[F.last] ?? '').trim();
    return [{ name: first ? `${first} ${last}` : last, age, pos: String(r[F.pos]), club: club.get(r[F.club] as number) ?? 'Free agent', nation: w.nations[r[F.nation] as number]?.name ?? '', ca: rt.ca, pa: rt.pa, random: (rt.paRaw ?? 0) < 0, dob }];
  });
}
const O = players(orig), M = players(modern);

// de tre officielle udgaver: rækker pr. spiller (navn + fødselsår) til sammenligningen og spillerprofilerne
type VR = { name: string; dob: string; club: string; ca: number; pa: number; random: boolean };
const verRows = (w: World): Map<string, VR> => {
  const F = Object.fromEntries(w.playerFields.map((f, i) => [f, i]));
  const club = new Map(w.clubs.map((c) => [c[0] as number, c[1] as string]));
  const m = new Map<string, VR>();
  const dup = new Set<string>();
  for (const r of w.players) {
    const name = [String(r[F.first] ?? '').trim(), String(r[F.last] ?? '').trim()].filter(Boolean).join(' ');
    // navn + fødselsår (datoerne er rettet med en dag hist og her mellem udgaverne, fx Lampard 21/6 → 20/6)
    const k = `${name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()}|${String(r[F.dob]).slice(0, 4)}`;
    if (m.has(k)) dup.add(k);
    else { const rt = w.ratings[String(r[F.id])]; m.set(k, { name, dob: r[F.dob] as string, club: club.get(r[F.club] as number) ?? 'Free agent', ca: rt?.ca ?? 0, pa: rt?.pa ?? 0, random: (rt?.paRaw ?? 0) < 0 }); }
  }
  // navne, der ikke er entydige (to "Raúl" født samme år), sammenlignes ikke
  for (const k of dup) m.delete(k);
  return m;
};
const VER = { '3.9.60': load('world-original.json'), '3.9.65': load('world-original-3965.json') };
// 3.9.60-spillerne (wonderkids i spillets standardudgave)
const O60 = players(VER['3.9.60']);
const verA = verRows(VER['3.9.60']), verB = verRows(VER['3.9.65']);
const verKey = (name: string, dob: string) => `${name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()}|${dob.slice(0, 4)}`;
// 3.9.60-udgaven af en spiller (CA/PA på profilen) og 3.9.60-trupperne pr. klub (til- og afgange på klubsiderne)
const in60 = (name: string, dob: string) => verA.get(verKey(name, dob));
const squad60 = new Map<string, VR[]>();
for (const p of verA.values()) (squad60.get(p.club) ?? squad60.set(p.club, []).get(p.club)!).push(p);
const otherVersions = (name: string, dob: string): [string, string][] => {
  const k = verKey(name, dob);
  return ([['3.9.60', verA.get(k)?.club], ['3.9.65', verB.get(k)?.club]] as [string, string | undefined][]).filter((x): x is [string, string] => !!x[1]);
};

// databasesiderne først (spillernavnene i guiderne linker til profilerne)
const CULT_LIST = (JSON.parse(readFileSync('scripts/cult-players.json', 'utf8')) as { first: string; last: string }[]).map((c) => `${c.first} ${c.last}`.trim());
const cultSet = new Set(CULT_LIST);
const dbO = buildDb({
  file: SEO_ORIGINAL, prefix: 'cm-01-02', game: 'CM 01/02', season: '2001/02', dbName: 'the original CM 01/02 database (patch 3.9.68)', original: true, modified: CONTENT_DATE, staffFile: 'scripts/seo/staff-3968.json',
  cult: cultSet, otherVersions, in60, squad60: (club: string) => squad60.get(club) ?? [],
  keep: (p) => p.ca >= 120 || (p.age <= 23 && (p.pa >= 145 || p.paRaw === -2)) || (p.age <= 21 && p.paRaw === -1 && p.ca >= 60) || p.caps >= 30 || cultSet.has(p.name),
});
const dbM = buildDb({
  file: 'public/data/world.json', prefix: '2026-27', game: 'CM 01/02 2026/27', season: '2026/27', dbName: 'the CM 01/02 2026/27 database (October 2026 data update)', original: false, modified: CONTENT_DATE, staffFile: 'scripts/seo/staff-2026.json',
  keep: (p) => p.ca >= 132 || (p.age <= 21 && p.pa >= 150) || p.caps >= 50,
});
const urlO = dbO.playerUrl, urlM = dbM.playerUrl;

const link = (p: P) => { const u = urlO.get(`${p.name}|${p.club}`) ?? urlM.get(`${p.name}|${p.club}`); return u ? `<a href="${u}"><b>${esc(p.name)}</b></a>` : `<b>${esc(p.name)}</b>`; };
function table(rows: P[], opts: { pa?: boolean } = {}) {
  return `<div class="tw"><table><thead><tr><th>#</th><th>Player</th><th>Age</th><th>Pos</th><th>Club</th><th>Nation</th><th class="n">CA</th>${opts.pa === false ? '' : '<th class="n">PA</th>'}</tr></thead><tbody>${rows.map((p, i) => `<tr><td>${i + 1}</td><td>${link(p)}</td><td>${p.age}</td><td>${esc(p.pos)}</td><td>${esc(p.club)}</td><td>${esc(p.nation)}</td><td class="n">${p.ca}</td>${opts.pa === false ? '' : `<td class="n">${p.random ? '<abbr title="Random potential in the original database – rolled for every new game">random</abbr>' : p.pa}</td>`}</tr>`).join('')}</tbody></table></div>`;
}

// ---------- data til siderne ----------
const young = (ps: P[], maxAge: number) => ps.filter((p) => p.age <= maxAge && !p.random && p.pa >= 150).sort((a, b) => b.pa - a.pa || b.ca - a.ca).slice(0, 50);
const best = (ps: P[]) => ps.slice().sort((a, b) => b.ca - a.ca || b.pa - a.pa).slice(0, 50);
const randomKids = O.filter((p) => p.random && p.age <= 21 && p.club !== 'Free agent').sort((a, b) => b.ca - a.ca);
const CULT = ['Cherno Samba', 'Tonton Zola Moukoko', 'Ricardo Quaresma', 'Zlatan Ibrahimovic', 'Antonio Cassano', 'Mido', 'Mateja Kezman', 'Alexandr Kerzhakov', 'Mikel Arteta', 'Rafael van der Vaart', 'Javier Saviola', 'Jermain Defoe'];
const cult = CULT.map((n) => O.find((p) => p.name === n)).filter((p): p is P => !!p);
const byPos = (ps: P[], test: (pos: string) => boolean, n = 10) => ps.filter((p) => test(p.pos)).sort((a, b) => b.ca - a.ca).slice(0, n);
const GK = (s: string) => s === 'GK', DEF = (s: string) => /^(CB|LB|RB|SW|LWB|RWB|D)/.test(s), MID = (s: string) => /^(DM|CM|AM|LM|RM|LW|RW)/.test(s), ATT = (s: string) => /^(CF|SS|ST|F)/.test(s);

const nM = M.length.toLocaleString('en'), nO = O.length.toLocaleString('en');
const leaguesM = modern.leagues.length, leaguesO = orig.leagues.length;

const pages: Page[] = [
  {
    slug: 'play-cm-01-02-online/',
    title: 'Play Championship Manager 01/02 Online Free (CM 01/02) | CM Reborn',
    h1: 'Play CM 01/02 online – free, in your browser',
    description: `Play a Championship Manager 01/02 style football manager online for free: the original 2001/02 database and a 2026/27 update, ${nM}+ real players, the classic CM look, multiplayer – no download, works on Mac, PC, iPad and phone.`,
    body: `<p class="lead">CM Reborn is a free fan remake of Championship Manager 01/02 that runs straight in your browser. Pick the original 2001/02 database or the 2026/27 update, choose the classic CM 01/02 look or a modern one, and you are managing your club in seconds – no installer, no emulator, no patch files.</p>
${CTA}
${shotFig('en', 'classic-squad', 'The squad screen in the classic CM 01/02 look – CM Reborn in the browser')}
<h2>What you get</h2>
<ul>
<li><b>Two databases:</b> the original CM 01/02 database for 2001/02 – choose the official release 3.9.60 (the one CM 01/02 itself uses), patch 3.9.65 or the final patch 3.9.68 (${nO} players in ${leaguesO} leagues) – and the community 2026/27 update (${nM} players in ${leaguesM} leagues).</li>
<li><b>The classic CM 01/02 screens:</b> the blue menus, the yellow-on-blue match commentary, Match Overview, the squad screen with selection buttons, Staff Search, Find – and stadium backgrounds on matchdays.</li>
<li><b>A match engine calibrated against the original:</b> we played a full season of the original CM 01/02 and matched goals per game (2.87), home wins, cards, corners and shots on target.</li>
<li><b>Real squad numbers</b> from the database, wonderkids with random potential, transfers, loans, press conferences, board confidence and the sack.</li>
<li><b>Online multiplayer</b> with friends, a fantasy draft league and global rankings.</li>
<li><b>Saves in your browser</b> (and optional cloud saves) – close the tab and continue later. It installs as an app and works offline.</li>
<li>Ten languages: English, Dansk, Svenska, Norsk, Español, Français, Deutsch, Italiano, Português and Türkçe.</li>
</ul>
<h2>Do I need the original game?</h2>
<p>No. CM Reborn is built from scratch and runs on its own. If you still play the original CM 01/02 (it has been free since 2008), you will feel at home: the screens, the database and the way the match plays out are modelled on it.</p>
<h2>How is it different from the original?</h2>
<p>It runs anywhere (Mac, Windows, Linux, Chromebook, iPad, Android, iPhone), it has an optional modern look, a 2026/27 database, multiplayer and a match engine without the famous exploits – but the classic look and the 2001/02 database are there for the nostalgia.</p>`,
    faq: [
      ['Can I play Championship Manager 01/02 online?', 'You can play CM Reborn, a free fan remake of CM 01/02, online in any browser at cm0102reborn.com – with the original 2001/02 database or a 2026/27 update, no download needed.'],
      ['Is it free?', 'Yes. CM Reborn is free, with no ads and no in-game purchases.'],
      ['Does it work on Mac?', 'Yes. It runs in Safari, Chrome, Firefox and Edge on Mac, Windows, Linux, Chromebook, iPad and phones.'],
    ],
  },
  {
    slug: 'cm-01-02-wonderkids/',
    title: 'CM 01/02 Wonderkids – Best Young Players (3.9.68 Database) | CM Reborn',
    h1: 'CM 01/02 wonderkids: the best young players in the original database',
    description: 'The real CM 01/02 wonderkids from the original 3.9.68 database: the 50 highest-potential players aged 21 or younger, the random-potential legends like Cherno Samba and Quaresma, and where to find them.',
    body: `<p class="lead">These are the wonderkids of Championship Manager 01/02, read directly from the original 3.9.68 database – not from memory. CA is current ability and PA is potential ability (both 1–200). Ages are on 1 July 2001.</p>
<h2>The cult heroes</h2>
<p>The names every CM 01/02 player remembers. Several of them do not have a fixed PA in the database: The original stores a negative code (-1 or -2), and the game rolls their potential at the start of every new save – shown as "random" below. That is why Cherno Samba became a world-beater in some saves and a journeyman in others. ${randomKids.length} players aged 21 or younger have random potential in 3.9.68.</p>
${table(cult)}
<h2>Top 50 wonderkids with fixed potential (age 21 or younger)</h2>
${table(young(O, 21))}
<h2>Wonderkids in 3.9.60 – the release</h2>
<p>CM 01/02 shipped with the 3.9.60 database and uses it for the 2001/02 season; the 3.9.68 patch updated the squads to 2002/03 (<a href="/cm-01-02-database-versions/">see the differences</a>). These are the top 20 young players with fixed potential in 3.9.60, as you meet them in CM Reborn's default database:</p>
${table(young(O60, 21).slice(0, 20))}
<h2>Best wonderkids by position</h2>
<h3>Goalkeepers</h3>${table(young(O, 21).filter((p) => GK(p.pos)).slice(0, 5))}
<h3>Defenders</h3>${table(young(O, 21).filter((p) => DEF(p.pos)).slice(0, 8))}
<h3>Midfielders</h3>${table(young(O, 21).filter((p) => MID(p.pos)).slice(0, 8))}
<h3>Strikers</h3>${table(young(O, 21).filter((p) => ATT(p.pos)).slice(0, 8))}
<p class="note">Want the same list for today's players? See the <a href="/cm-01-02-2026-update/">2026/27 database wonderkids</a>.</p>`,
    faq: [
      ['Who is the best wonderkid in CM 01/02?', `By fixed potential in the 3.9.68 database: ${young(O, 21).slice(0, 3).map((p) => `${p.name} (${p.club}, PA ${p.pa})`).join(', ')}. The cult heroes like Cherno Samba and Ricardo Quaresma have random potential and can become even better.`],
      ['Why is Cherno Samba so good in CM 01/02?', 'In the original 3.9.68 database Cherno Samba (Millwall, born 1985) has a random potential code. The game rolls his potential at the start of each save, and it is often very high – which made him a legend.'],
      ['Can I sign these wonderkids in CM Reborn?', 'Yes. Choose the original 2001/02 database when you start a new game – all of these players are in it with their real clubs.'],
    ],
    list: { name: 'CM 01/02 wonderkids', items: young(O, 21).slice(0, 20).map((p) => ({ name: p.name })) },
  },
  {
    slug: 'cm-01-02-best-players/',
    title: 'CM 01/02 Best Players – Top 50 by Ability (3.9.68) | CM Reborn',
    h1: 'CM 01/02 best players: the top 50 in the original database',
    description: 'The best players in Championship Manager 01/02 (patch 3.9.68), sorted by current ability: Zidane, Vieri, Vieira, Kahn, Totti, Ronaldo and more – plus the best per position.',
    body: `<p class="lead">The highest-rated players in CM 01/02 at the start of the 2001/02 season, read from the original 3.9.68 database. CA = current ability, PA = potential ability.</p>
${table(best(O))}
<h2>Best players by position</h2>
<h3>Goalkeepers</h3>${table(byPos(O, GK, 8))}
<h3>Defenders</h3>${table(byPos(O, DEF))}
<h3>Midfielders</h3>${table(byPos(O, MID))}
<h3>Strikers</h3>${table(byPos(O, ATT))}
<p class="note">Looking for young talent instead? See the <a href="/cm-01-02-wonderkids/">CM 01/02 wonderkids</a>.</p>`,
    faq: [
      ['Who is the best player in CM 01/02?', `By current ability in 3.9.68 the top players are ${best(O).slice(0, 4).map((p) => `${p.name} (${p.ca})`).join(', ')}.`],
      ['What do CA and PA mean?', 'CA (current ability) is how good a player is now and PA (potential ability) is the highest level he can reach, both on a scale from 1 to 200.'],
    ],
    list: { name: 'CM 01/02 best players', items: best(O).slice(0, 20).map((p) => ({ name: p.name })) },
  },
  {
    // 3.9.60 = udgivelsen, "the original database" (ODB) – søgningerne: "cm 01/02 best players 3.9.60", "odb best players", "60 database"
    slug: 'cm-01-02-3960-database/',
    title: 'CM 01/02 3.9.60 Database (ODB) – Best Players & Wonderkids | CM Reborn',
    h1: 'The CM 01/02 3.9.60 database: best players and wonderkids',
    description: `The original CM 01/02 database as it shipped (3.9.60, the "ODB"): the 50 best players, the best per position, the wonderkids, the random-potential youngsters and the players who only exist in 3.9.60.`,
    body: (() => {
      const kids = young(O60, 21).slice(0, 40);
      const rnd = O60.filter((p) => p.random && p.age <= 21 && p.club !== 'Free agent').sort((a, b) => b.ca - a.ca).slice(0, 30);
      // med i 3.9.68? samme navn eller samme efternavn med samme fødselsår (navnene er skrevet om mellem udgaverne)
      const norm = (x: string) => x.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      const keys = (p: P) => [`${norm(p.name)}|${p.dob.slice(0, 4)}`, `${norm(p.name).split(' ').pop()}|${p.dob.slice(0, 4)}`];
      const k68 = new Set(O.flatMap(keys));
      const only60 = O60.filter((p) => !keys(p).some((k) => k68.has(k)) && p.club !== 'Free agent').sort((a, b) => b.ca - a.ca).slice(0, 30);
      return `<p class="lead">3.9.60 is the database CM 01/02 shipped with – the one the community calls the original database (ODB). The game uses it for the 2001/02 season, and so does CM Reborn by default. The later patches changed a lot: 3.9.68 moved the squads on to 2002/03 (Ferdinand at Man Utd) and removed some cult heroes. <a href="/cm-01-02-database-versions/">The three versions compared →</a></p>
${CTA}
<h2>The 50 best players in 3.9.60</h2>${table(best(O60))}
<h2>Best players by position</h2>
<h3>Goalkeepers</h3>${table(byPos(O60, GK, 8))}
<h3>Defenders</h3>${table(byPos(O60, DEF))}
<h3>Midfielders</h3>${table(byPos(O60, MID))}
<h3>Strikers</h3>${table(byPos(O60, ATT))}
<h2>Wonderkids in 3.9.60</h2><p>Aged 21 or younger with a fixed potential of 150 or more, sorted by potential.</p>${table(kids)}
${rnd.length ? `<h2>Random-potential youngsters (PA −1/−2)</h2><p>Their potential is rolled again in every new game – <a href="/cm-01-02-ca-pa-explained/">the exact rules</a>. Sorted by current ability.</p>${table(rnd)}` : ''}
${only60.length ? `<h2>Players you only find in 3.9.60</h2><p>Not found under the same name in the 3.9.68 patch – mostly players who retired or left Europe in 2002 (a few were only renamed). The best of them by current ability.</p>${table(only60)}` : ''}
<p class="note">CA = current ability, PA = potential ability (1–200), read from the 3.9.60 database files. <a href="/cm-01-02-best-players/">The best players in 3.9.68 →</a> · <a href="/cm-01-02-wonderkids/">wonderkids</a></p>`;
    })(),
    faq: [
      ['What is the ODB in CM 01/02?', 'The original database – 3.9.60, the one CM 01/02 shipped with for the 2001/02 season. The 3.9.65 and 3.9.68 patches updated it; CM Reborn lets you choose any of the three and uses 3.9.60 by default.'],
      ['Who is the best player in the CM 01/02 3.9.60 database?', `${best(O60).slice(0, 4).map((p) => `${p.name} (${p.club}, CA ${p.ca})`).join(', ')}.`],
      ['Who are the best wonderkids in 3.9.60?', `${young(O60, 21).slice(0, 4).map((p) => `${p.name} (${p.club}, PA ${p.pa})`).join(', ')}.`],
    ],
    list: { name: 'CM 01/02 3.9.60 best players', items: best(O60).slice(0, 20).map((p) => ({ name: p.name })) },
  },
  {
    // "cm 01/02 best signings", "must sign players", "players to buy", "best buys"
    slug: 'cm-01-02-best-signings/',
    title: 'CM 01/02 Best Signings – Must-Sign Players & Best Buys | CM Reborn',
    h1: 'CM 01/02 best signings: the must-sign players',
    description: 'The players every CM 01/02 manager should buy: cheap stars, wonderkids that cost little, the best Bosman free transfers in 2002 and the best free agents – from the original database.',
    body: (() => {
      const K = dbO.kept;
      const row = (p: (typeof K)[number], i: number) => `<tr><td>${i + 1}</td><td>${p.url ? `<a href="${p.url}"><b>${esc(p.name)}</b></a>` : `<b>${esc(p.name)}</b>`}</td><td>${p.age}</td><td>${esc(p.posStr)}</td><td>${esc(p.clubName)}</td><td class="n">${p.ca}</td><td class="n">${p.paRaw ? 'random' : p.pa}</td><td class="n">${p.value ? pounds(p.value) : '–'}</td></tr>`;
      const tbl = (rows: typeof K) => `<div class="tw"><table><thead><tr><th>#</th><th>Player</th><th>Age</th><th>Position</th><th>Club</th><th class="n">CA</th><th class="n">PA</th><th class="n">Value</th></tr></thead><tbody>${rows.map(row).join('')}</tbody></table></div>`;
      const cheapStars = K.filter((p) => p.club >= 0 && p.ca >= 130 && p.value > 0 && p.value <= 1_500_000 && p.age <= 30).sort((a, b) => b.ca - a.ca).slice(0, 25);
      const kidsCheap = K.filter((p) => p.club >= 0 && p.age <= 19 && (p.pa >= 165 || p.paRaw === -2) && p.value > 0 && p.value <= 2_000_000).sort((a, b) => (b.paRaw === -2 ? 175 : b.pa) - (a.paRaw === -2 ? 175 : a.pa) || b.ca - a.ca).slice(0, 25);
      const bos = K.filter((p) => p.club >= 0 && p.contract && p.contract.slice(0, 4) === '2002' && p.ca >= 140).sort((a, b) => b.ca - a.ca).slice(0, 20);
      const free = K.filter((p) => p.club < 0).sort((a, b) => b.ca - a.ca).slice(0, 15);
      return `<p class="lead">The signings that make a CM 01/02 save: proven players at bargain prices, teenagers who become world-beaters, and the stars you can have for nothing. Read from the original database (patch 3.9.68) with CM Reborn's values at the start of the game – clubs may still ask for more than the value.</p>
${CTA}
<h2>Cheap stars (value £1.5m or less)</h2><p>Current ability 130+ and aged 30 or younger.</p>${tbl(cheapStars)}
<h2>Wonderkids that cost little</h2><p>Aged 19 or younger with a potential of 165+ (or a random potential of −2), valued at £2m or less.</p>${tbl(kidsCheap)}
<h2>Free in 2002: the best Bosman signings</h2><p>Contracts expiring in the summer of 2002 – agree a pre-contract and sign them for free. <a href="/cm-01-02-bosman-guide/">How Bosman transfers work →</a></p>${tbl(bos)}
${free.length ? `<h2>Free agents at the start</h2>${tbl(free)}` : ''}
<p class="note">More: <a href="/cm-01-02/lists/bargains/">bargains</a> · <a href="/cm-01-02/lists/free-players-by-position/">free players by position</a> · cheap <a href="/cm-01-02/lists/cheap-strikers/">strikers</a>, <a href="/cm-01-02/lists/cheap-centre-backs/">centre-backs</a>, <a href="/cm-01-02/lists/cheap-goalkeepers/">goalkeepers</a> · <a href="/cm-01-02-wonderkids/">wonderkids</a></p>`;
    })(),
    faq: [
      ['Who are the best signings in CM 01/02?', 'Cheap proven players (CA 130+ for £1.5m or less), teenagers with a potential of 165+ that still cost little, and the stars whose contracts run out in 2002 – all listed on this page from the original database.'],
      ['Who should I buy first in CM 01/02?', 'A wonderkid or two while they are cheap, and a proven player for the weakest position. Check the Bosman list before you pay a fee – many good players are free a year later.'],
    ],
  },
  {
    slug: 'cm-01-02-2026-update/',
    title: 'CM 01/02 2026/27 Update – Best Players & Wonderkids | CM Reborn',
    h1: 'CM 01/02 with a 2026/27 database: best players and wonderkids',
    description: `Play CM 01/02 with today's players: the 2026/27 database with ${nM} players in ${leaguesM} leagues. The best players, the top wonderkids and how to play it free in your browser.`,
    body: `<p class="lead">CM Reborn includes the community 2026/27 data update for CM 01/02: ${nM} real players in ${leaguesM} leagues, with real squad numbers, clubs and stadiums. Start a new game, choose the standard database and you are managing in the 2026/27 season.</p>
${CTA}
<h2>Best players in the 2026/27 database</h2>
${table(best(M).slice(0, 30))}
<h2>Top wonderkids (age 20 or younger)</h2>
${table(young(M, 20).slice(0, 30))}`,
    faq: [
      ['Is there a CM 01/02 update for 2026?', `Yes. CM Reborn ships with a 2026/27 database (${nM} players, ${leaguesM} leagues) and runs in the browser, so you do not have to patch the original game.`],
      ['Who are the best wonderkids in the 2026/27 database?', young(M, 20).slice(0, 4).map((p) => `${p.name} (${p.club})`).join(', ') + '.'],
    ],
    list: { name: 'CM 01/02 2026/27 wonderkids', items: young(M, 20).slice(0, 20).map((p) => ({ name: p.name })) },
  },
  {
    slug: 'cm-01-02-tactics/',
    title: 'CM 01/02 Best Tactics & Formations – The Classics Explained | CM Reborn',
    h1: 'CM 01/02 tactics: the classic formations, and why they worked',
    description: 'The best CM 01/02 tactics and formations explained: the overpowered DMC, 4-2-4 with arrows, what each team instruction really does in the original code – and how tactics play in CM Reborn.',
    body: `<p class="lead">CM 01/02 is remembered for tactics that broke the match engine. Here is what the classic ones did, and how the same ideas play out in CM Reborn.</p>
<h2>The famous CM 01/02 exploits</h2>
<ul>
<li><b>The DMC.</b> In the original, a defensive midfielder covered far more of the pitch than any other role, so one or two DMCs made almost any team solid.</li>
<li><b>4-2-4 with forward arrows.</b> Four forwards, with the wide midfielders pushed on with arrows, overloaded the defence and scored freely.</li>
<li><b>Through balls and pace.</b> Fast strikers against a high line were almost unstoppable, especially with "run with ball" and "through balls" on.</li>
<li><b>Offside trap and hard tackling.</b> A popular combination that the AI rarely punished.</li>
</ul>
<h2>What the team instructions do in the original's code</h2>
<p>Read from CM 01/02's own match engine (cm0102.exe):</p>
<ul>
<li><b>Passing style</b> shifts the weights the passer gives long and short options: Long −1000 short / +1000 long, Direct −750 / +500, Short +250 / −250. Mixed changes nothing.</li>
<li><b>Tackling</b> sets how hard the opponents are challenged: Easy 0.5, Normal 2, Hard 4 – eight times the challenges of Easy, and more fouls with them.</li>
<li><b>Run With Ball</b> adds 10 × (space + 400) to the run option (minus the pass score), and more for a flair player – but only outside his own box, under little pressure and at least two "cells" from goal.</li>
<li><b>Hold Up Ball</b> adds 3500 to holding when the player has his back to goal in the attacking half.</li>
<li><b>Long Shots</b> adds 2 × (200 × rand(Long Shots) + space) to shooting from 2 to 4.5 cells out.</li>
<li><b>Cross Ball</b> adds 2000 (6000 near goal) to running down the wing, and from the byline the winger crosses nine times out of ten.</li>
<li><b>The opponent's offside trap</b> makes a player with good decisions run in behind (4000 to the run option) instead of passing.</li>
<li><b>Teamwork</b> decides how often all of this is ignored: with a chance of 1 in Teamwork the player does his own thing.</li>
</ul>
<p>More in <a href="/cm-01-02-match-engine/">how the CM 01/02 match engine works</a> and <a href="/cm-01-02-attributes-explained/">what every attribute does</a>.</p>
<h2>How tactics work in CM Reborn</h2>
<p>CM Reborn has no special rules for any formation. The pitch is split into zones, and the shape of your formation decides where you have more players than the opponent. Four strikers leave the midfield empty, so the other team wins more duels and more of the ball. A player out of position gets worse. The result is that classic ideas still work in the right situation, but nothing wins every match.</p>
<ul>
<li><b>Overloads matter:</b> attack where the opponent is weak (the assistant shows you which side).</li>
<li><b>Instructions have a price:</b> pressing tires players, a high line invites through balls, and hard tackling brings cards.</li>
<li><b>Player instructions:</b> playmaker, target man, run with ball, long shots, crossing – per player, like in CM 01/02.</li>
<li><b>Test it yourself:</b> the built-in tactics benchmark plays many matches with your tactic and shows the points per game.</li>
</ul>`,
    faq: [
      ['What is the best formation in CM 01/02?', 'In the original, narrow formations with one or two defensive midfielders and the 4-2-4 with arrows were the strongest because of how the match engine worked. In CM Reborn no formation is overpowered – the best one depends on your players and the opponent.'],
      ['Does the DMC exploit work in CM Reborn?', 'No. Every role covers its own zones, so a DMC protects the defence but does not cover the whole pitch.'],
    ],
  },
  {
    slug: 'cm-01-02-mac-ipad-chromebook/',
    title: 'Play CM 01/02 on Mac, iPad, Chromebook & Android – No Install | CM Reborn',
    h1: 'Play CM 01/02 on Mac, iPad, Chromebook and Android',
    description: 'The original CM 01/02 only runs on Windows. CM Reborn is a free CM 01/02 remake that runs in the browser on Mac, iPad, iPhone, Chromebook, Android and Linux – with the 2001/02 database.',
    body: `<p class="lead">The original Championship Manager 01/02 is a Windows game. On a Mac you need Wine, a wrapper app or a virtual machine, and on an iPad or a Chromebook it is close to impossible. CM Reborn runs in any modern browser instead.</p>
<h2>How to play</h2>
<ol>
<li>Open <a href="/">cm0102reborn.com</a> in Safari, Chrome, Firefox or Edge.</li>
<li>Choose <b>New game</b>, pick a database (the original 2001/02 or 2026/27) and the classic CM 01/02 look.</li>
<li>Optional: add it to your home screen or dock ("Install app") – it then opens like a normal app and works offline.</li>
</ol>
<h2>Works on</h2>
<ul><li>Mac (Intel and Apple Silicon)</li><li>iPad and iPhone</li><li>Chromebook</li><li>Android phones and tablets</li><li>Windows and Linux</li></ul>
<p>Your save is stored in the browser on that device. With a free account you can also keep saves in the cloud and continue on another device.</p>`,
    faq: [
      ['Can I play CM 01/02 on a Mac?', 'The original needs Windows (or Wine/a virtual machine). CM Reborn, a free CM 01/02 remake, runs directly in Safari or Chrome on any Mac.'],
      ['Can I play CM 01/02 on iPad?', 'Yes – open cm0102reborn.com in Safari and add it to the home screen. It works offline too.'],
    ],
  },
  {
    slug: 'faq/',
    title: 'CM Reborn FAQ – the Free CM 01/02 Remake in Your Browser',
    h1: 'CM Reborn – frequently asked questions',
    description: 'Everything about CM Reborn, the free browser remake of Championship Manager 01/02: price, databases, saves, multiplayer, devices and how it compares to the original.',
    body: `<p class="lead">CM Reborn is an independent, free fan remake of Championship Manager 01/02 that runs in the browser.</p>`,
    faq: [
      ['What is CM Reborn?', 'A free football manager in the browser, built from scratch and inspired by Championship Manager 01/02, with the original 2001/02 database, a 2026/27 database, the classic CM look and a modern look.'],
      ['Does it cost anything?', 'No. It is free, with no ads or in-game purchases.'],
      ['Do I need to install anything?', 'No. It runs in your browser, and you can install it as an app on phone and desktop. It works offline too.'],
      ['Where is my game saved?', 'Automatically in your browser on your device. You can export and import saves, and with a free account keep them in the cloud.'],
      ['Are the players real?', `Yes: ${nO} players in the original CM 01/02 database (2001/02) and ${nM} in the 2026/27 database.`],
      ['Can I play with friends?', 'Yes. Create an online game, share the code and run your own clubs in the same world. There is also a fantasy draft league.'],
      ['Is this the original Championship Manager?', 'No. It is an independent fan project, not affiliated with Sports Interactive, SEGA or Eidos.'],
      ['Which CM 01/02 database versions can I play?', 'All three official ones: 3.9.60 (the release, which CM 01/02 itself uses for 2001/02 and CM Reborn\'s default), 3.9.65 and the final patch 3.9.68 with the 2002/03 squads – plus a 2026/27 database. You choose when you start a new game.'],
      ['Are the attributes the same as in CM 01/02?', 'Yes. CM Reborn converts the database exactly as the original does: 18 attributes are stored relative to CA, attributes the database leaves empty are filled from a similar player, and random potential (PA -1/-2) is rolled in every new game with the original\'s rules.'],
      ['Which languages are supported?', 'English, Danish, Swedish, Norwegian, Spanish, French, German, Italian, Brazilian Portuguese and Turkish.'],
    ],
  },
];

// VM 2002 i CM 01/02: de rigtige grupper, landstrænerne og trupperne fra 3.9.60 (spillets standard)
{
  type NW = World & { nationalTeams?: { nations: Record<string, { coach?: string; fifa?: number }> } };
  const w = VER['3.9.60'] as NW;
  const nt = w.nationalTeams?.nations ?? {};
  const byNation = new Map<string, P[]>();
  for (const p of O60) (byNation.get(p.nation) ?? byNation.set(p.nation, []).get(p.nation)!).push(p);
  for (const ps of byNation.values()) ps.sort((a, b) => b.ca - a.ca);
  const strength = (n: string) => { const ps = (byNation.get(n) ?? []).slice(0, 23); return ps.length ? ps.reduce((t, p) => t + p.ca, 0) / ps.length : 0; };
  const nUrl = (n: string) => `/cm-01-02/nations/${slugify(n)}/`;
  const teams = WC2002.flat();
  const ranked = teams.slice().sort((a, b) => strength(b) - strength(a));
  const coach = (n: string) => nt[String(w.nations.findIndex((x) => x.name === n))]?.coach ?? '';
  const best3 = (n: string) => (byNation.get(n) ?? []).slice(0, 3).map((p) => `${link(p)} (${p.ca})`).join(', ');
  pages.push({
    slug: 'cm-01-02-world-cup-2002/',
    title: 'World Cup 2002 in CM 01/02 – Groups, Squads & Favourites | CM Reborn',
    h1: 'The 2002 World Cup in CM 01/02',
    description: `CM 01/02 plays the real 2002 World Cup in South Korea and Japan: the eight groups, every coach and the strongest squads in the original database – ${ranked.slice(0, 3).join(', ')} are the favourites.`,
    body: `<p class="lead">If you play CM 01/02 into the summer of 2002, the World Cup in South Korea and Japan is played with the real 32 teams and the real groups. CM Reborn does the same – your players go to the tournament, come back tired (or injured), and if you manage a national team you can take them yourself. Squads here are from the 3.9.60 database the game uses for 2001/02; the coaches are those in the original game's national team data, which partly reflects the 2002 updates (France already has Jacques Santini, appointed in July 2002).</p>
<h2>The favourites by squad strength</h2>
<p>Average current ability (CA) of each nation's best 23 players in the database:</p>
<div class="tw"><table><thead><tr><th>#</th><th>Nation</th><th class="n">Squad CA</th><th>Coach (game data)</th><th>Best players</th></tr></thead><tbody>${ranked.slice(0, 12).map((n, i) => `<tr><td>${i + 1}</td><td><a href="${nUrl(n)}"><b>${esc(n)}</b></a></td><td class="n">${strength(n).toFixed(1)}</td><td>${esc(coach(n)) || '–'}</td><td>${best3(n)}</td></tr>`).join('')}</tbody></table></div>
<h2>The groups</h2>
${WC2002.map((grp, gi) => `<h3>Group ${'ABCDEFGH'[gi]}</h3><div class="tw"><table><thead><tr><th>Nation</th><th class="n">Squad CA</th><th>Coach</th><th>Best players</th></tr></thead><tbody>${grp.slice().sort((a, b) => strength(b) - strength(a)).map((n) => `<tr><td><a href="${nUrl(n)}"><b>${esc(n)}</b></a></td><td class="n">${strength(n).toFixed(1)}</td><td>${esc(coach(n)) || '–'}</td><td>${best3(n)}</td></tr>`).join('')}</tbody></table></div>`).join('\n')}
<h2>How the World Cup works in CM Reborn</h2>
<ul><li>The tournament starts on 1 June 2002 with the real groups; later World Cups and European Championships have qualifiers.</li>
<li>Each nation takes its best 23 players – your stars miss the start of pre-season if they go deep.</li>
<li>Managers with enough reputation are offered national team jobs, and can pick the squad themselves.</li></ul>
<p>See also <a href="/cm-01-02/">the CM 01/02 database</a> and <a href="/cm-01-02-best-players/">the best players in CM 01/02</a>.</p>`,
    faq: [
      ['Is the 2002 World Cup in CM 01/02?', 'Yes. The game plays the 2002 World Cup in South Korea and Japan in June 2002 with the real 32 teams and groups – and CM Reborn does too.'],
      ['Who wins the World Cup in CM 01/02?', `It changes from save to save, but by squad strength in the database ${ranked[0]}, ${ranked[1]} and ${ranked[2]} are the favourites.`],
      ['Which group is England in at the 2002 World Cup in CM 01/02?', 'Group F, with Argentina, Nigeria and Sweden – as in real life.'],
    ],
  });
}

// "Championship Manager 26/27" (søgeordsanalysen): CM 01/02 med 2026/27-trupperne – navnet kun beskrivende (varemærke)
pages.push({
  slug: 'cm-01-02-26-27-squads/',
  title: 'Championship Manager 26/27? Play CM 01/02 With 2026/27 Squads | CM Reborn',
  h1: 'CM 01/02 with 2026/27 squads – play online, free',
  description: `Looking for a Championship Manager 26/27? Play the free CM 01/02 remake with ${nM} real 2026/27 players in ${leaguesM} leagues – in your browser, no download, on any device.`,
  body: `<p class="lead">There is no official Championship Manager 26/27 – the series ended long ago. But you can play the classic CM 01/02 game with today's squads: CM Reborn is a free fan remake that runs in your browser with a 2026/27 database of ${nM} real players in ${leaguesM} leagues.</p>
${CTA}
<h2>How to play</h2>
<ol><li>Open <a href="/">cm0102reborn.com</a> – on a PC, Mac, phone or tablet.</li><li>Tap <b>New game</b> and pick the <b>CM 2026/27</b> database.</li><li>Choose the classic CM 01/02 look or a modern one, pick a country and a club, and start.</li></ol>
<h2>The best players in the 2026/27 database</h2>
${table(best(M).slice(0, 15))}
<h2>The best young players</h2>
${table(young(M, 21).slice(0, 15))}
<p>Every player, club and league: <a href="/2026-27/">the 2026/27 database</a> · managers: <a href="/2026-27/managers/">2026/27 managers</a> · <a href="/2026-27/kits/">kit manufacturers</a>.</p>
<p>Prefer the original? The <a href="/cm-01-02/">CM 01/02 database</a> from 2001/02 is the default in CM Reborn.</p>`,
  faq: [
    ['Is there a Championship Manager 26/27?', `No official one. CM Reborn is a free CM 01/02 remake with a 2026/27 database (${nM} players), played in the browser.`],
    ['How do I play CM 01/02 with 2026/27 squads?', 'Open cm0102reborn.com, start a new game and pick the CM 2026/27 database. It is free and needs no download.'],
    ['Does it work on mobile?', 'Yes – in any browser on Android, iPhone and iPad, and it can be installed as an app.'],
  ],
});

// "What's new": spillets egen ændringslog (src/ui/changelogData.ts) som statisk side – viser søgemaskinerne, at sitet lever
{
  const recent = CHANGELOG.slice(0, 12);
  pages.push({
    slug: 'changelog/',
    title: "What's New in CM Reborn – Updates and Changelog",
    h1: "What's new in CM Reborn",
    description: `The latest updates to CM Reborn, the free CM 01/02 remake in your browser: version ${recent[0].version} (${recent[0].date}) – ${recent[0].title.en}.`,
    modified: recent[0].date,
    body: `<p class="lead">CM Reborn is updated almost every day. These are the latest versions – the same list you see in the game under "What's new".</p>
${recent.map((v) => `<h2 id="v${esc(v.version)}">${esc(v.version)} – ${esc(v.title.en)}</h2><p class="note">${esc(v.date)}</p><ul>${v.items.map((it) => `<li>${esc(it.en)}</li>`).join('')}</ul>`).join('\n')}
<p><a href="/">Play the latest version →</a> · <a href="/changelog/feed.xml">RSS feed</a></p>`,
  });
}
// RSS-feed for opdateringerne (/changelog/feed.xml)
{
  const rfc = (d: string) => new Date(`${d}T12:00:00Z`).toUTCString();
  const x = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  mkdirSync('public/changelog', { recursive: true });
  writeFileSync('public/changelog/feed.xml', `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>
<title>CM Reborn – what's new</title><link>${SITE}/changelog/</link><description>Updates to CM Reborn, the free CM 01/02 remake in your browser.</description><language>en</language>
<atom:link href="${SITE}/changelog/feed.xml" rel="self" type="application/rss+xml"/>
${CHANGELOG.slice(0, 20).map((v) => `<item><title>${x(`${v.version} – ${v.title.en}`)}</title><link>${SITE}/changelog/#v${v.version}</link><guid isPermaLink="false">cm-reborn-${v.version}</guid><pubDate>${rfc(v.date)}</pubDate><description>${x(v.items.map((it) => it.en).join(' · '))}</description></item>`).join('\n')}
</channel></rss>
`);
}

// 404-siden (Vercel viser public/404.html for ukendte stier) og flyttede sider (sider, der forsvandt, da databasen blev genbygget)
writeFileSync('public/404.html', render({
  slug: '404/', title: 'Page not found | CM Reborn', h1: 'This page is not here', noindex: true, noArticle: true, modified: CONTENT_DATE,
  description: 'The page you were looking for does not exist. Search the CM 01/02 database, read the guides or start a new game of CM Reborn.',
  body: `<p class="lead">The page you were looking for has moved or never existed. Try one of these instead:</p>
<ul><li><a href="/">Play CM Reborn</a> – the free CM 01/02 remake in your browser</li><li><a href="/cm-01-02/">Search the CM 01/02 database</a> (every player, club and league)</li><li><a href="/2026-27/">The 2026/27 database</a></li><li><a href="/cm-01-02-guides/">All CM 01/02 guides</a></li><li><a href="/cm-01-02-wonderkids/">CM 01/02 wonderkids</a></li></ul>`,
}));
const MOVED: [string, string, string][] = [
  // [gammel sti, ny sti, hvorfor]
  ['cm-01-02/players/tarek-thabet/', '/cm-01-02/nations/tunisia/', 'Tarek Thabet is no longer in the CM 01/02 database pages (his club only keeps its 16 best players).'],
];
for (const [from, to, why] of MOVED) {
  if ([...urlO.values()].includes(`/${from}`)) continue; // siden findes igen
  mkdirSync(`public/${from}`, { recursive: true });
  writeFileSync(`public/${from}index.html`, render({ slug: to.slice(1), title: 'Moved | CM Reborn', h1: 'This page has moved', noindex: true, noArticle: true, redirect: to, modified: CONTENT_DATE, description: why, body: `<p class="lead">${esc(why)} <a href="${to}">Continue →</a></p>` }));
}

// databaseudgaverne (3.9.60 / 3.9.65 / 3.9.68) sammenlignet – til guiden cm-01-02-database-versions
function versionData() {
  const ver = { ...VER, '3.9.68': orig } as const;
  const a = verA, b = verB, c = verRows(orig);
  const moved = (x: Map<string, VR>, y: Map<string, VR>) => [...x].flatMap(([k, p]) => { const q = y.get(k); return q && q.club !== p.club && p.club !== 'Free agent' ? [{ name: p.name, from: p.club, to: q.club, ca: Math.max(p.ca, q.ca) }] : []; }).sort((m, n) => n.ca - m.ca);
  const stats = Object.entries(ver).map(([v, w]) => ({ v, players: w.players.length, leagues: w.leagues.filter((l) => !(l as { hidden?: boolean }).hidden).length, clubs: w.clubs.length }));
  return {
    stats, early: moved(a, b).slice(0, 15), late: moved(a, c).slice(0, 30), movedCount: moved(a, c).length,
    // Bosman 2002 i 3.9.60 (spillets standard): kontrakter, der udløber 30/6-2002, ved klubber i de spilbare ligaer
    bosman60: (() => {
      const w = VER['3.9.60']; const F = Object.fromEntries(w.playerFields.map((f, i) => [f, i]));
      const lg = new Map(w.leagues.map((l) => [l.id, l])); const cl = new Map(w.clubs.map((x) => [x[0] as number, x]));
      return w.players.flatMap((r) => {
        const club = cl.get(r[F.club] as number); const l = club ? lg.get(club[4] as string) : undefined;
        if (!club || !l || (l as { hidden?: boolean }).hidden || !String(r[F.contract] ?? '').startsWith('2002-')) return [];
        const name = [String(r[F.first] ?? '').trim(), String(r[F.last] ?? '').trim()].filter(Boolean).join(' ');
        return [{ name, club: club[1] as string, ca: w.ratings[String(r[F.id])]?.ca ?? 0, age: 2001 - Number(String(r[F.dob]).slice(0, 4)) }];
      }).sort((x, y) => y.ca - x.ca).slice(0, 20);
    })(),
    // nye i 3.9.68: ingen spiller i 3.9.60 med samme fødselsår og et fælles navneord (stavemåder skifter: "Cafú", "Makélélé")
    added: (() => {
      const tok = (n: string) => n.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().split(/[^a-z]+/).filter((w) => w.length >= 3);
      const byYear = new Map<string, Set<string>>();
      for (const p of a.values()) { const y = p.dob.slice(0, 4); const t = byYear.get(y) ?? byYear.set(y, new Set()).get(y)!; for (const w of tok(p.name)) t.add(w); }
      return [...c.values()].filter((p) => { const t = byYear.get(p.dob.slice(0, 4)); return !t || !tok(p.name).some((w) => t.has(w)); }).sort((m, n) => n.ca - m.ca).slice(0, 15);
    })(),
    url: (name: string, club: string) => urlO.get(`${name}|${club}`) ?? null,
  };
}
pages.push(...guides(dbO, versionData()));

// de rigeste klubber ved start (3.9.60 = spillets standard; originalen: saldo = club.dat 101 ± 8 %, Transfer Funds ≈ 70 % i hele £250K)
{
  type W = World & { clubFinance?: Record<string, [number, number, number]>; clubRep?: Record<string, number> };
  const w60 = VER['3.9.60'] as W, w68 = orig as W;
  const fin68 = new Map(w68.clubs.map((c) => [c[1] as string, (w68.clubFinance?.[String(c[0])] ?? [0])[0]]));
  const lg = new Map(w60.leagues.map((l) => [l.id, l]));
  const funds = (b: number) => { if (b <= 0) return 0; const st = b >= 5_000_000 ? 250_000 : 25_000; return Math.floor((b * 0.7) / st) * st; };
  const money = (v: number) => (v >= 1e6 ? `£${(v / 1e6).toFixed(1)}m` : v > 0 ? `£${Math.round(v / 1000)}k` : v < 0 ? `−£${(Math.abs(v) / 1e6).toFixed(1)}m` : '£0');
  const rows = w60.clubs.filter((c) => { const l = lg.get(c[4] as string); return l && !(l as { hidden?: boolean }).hidden; })
    .map((c) => ({ name: c[1] as string, league: lg.get(c[4] as string)!.name, nation: w60.nations[c[3] as number]?.name ?? '', bal: (w60.clubFinance?.[String(c[0])] ?? [0])[0], b68: fin68.get(c[1] as string) }));
  const top = rows.slice().sort((a, b) => b.bal - a.bal).slice(0, 50);
  const poorest = rows.filter((r) => r.bal < 0).sort((a, b) => a.bal - b.bal).slice(0, 15);
  const clubUrl = new Map(dbO.clubSum.map((c) => [c.name, c.url]));
  const cl = (n: string) => (clubUrl.get(n) ? `<a href="${clubUrl.get(n)}"><b>${esc(n)}</b></a>` : `<b>${esc(n)}</b>`);
  pages.push({
    slug: 'cm-01-02-richest-clubs/',
    title: 'CM 01/02 Richest Clubs – Bank Balance & Transfer Budget at the Start | CM Reborn',
    h1: 'CM 01/02 richest clubs: bank balance and transfer budget',
    description: `Which clubs have the most money in CM 01/02? ${top.slice(0, 3).map((r) => `${r.name} (${money(r.bal)})`).join(', ')} – the start balance and transfer budget of every club, as the original sets them.`,
    body: `<p class="lead">How much money you start with in Championship Manager 01/02 – measured in the original game. The bank balance at the start is the club's balance in the database ± 8 %, and the board gives you about <b>70 % of it as transfer funds</b> (in whole £250,000 steps). Figures for the 3.9.60 database the game uses for 2001/02, with the 3.9.68 patch alongside – the patch changed several clubs' money a lot (Manchester United start with about £33m in 3.9.60 but £10m in 3.9.68).</p>
<h2>The 50 richest clubs (3.9.60)</h2>
<div class="tw"><table><thead><tr><th>#</th><th>Club</th><th>League</th><th class="n">Balance</th><th class="n">Transfer funds*</th><th class="n">3.9.68</th></tr></thead><tbody>${top.map((r, i) => `<tr><td>${i + 1}</td><td>${cl(r.name)}</td><td>${esc(r.league)} <span class="note">${esc(r.nation)}</span></td><td class="n">${money(r.bal)}</td><td class="n">${money(funds(r.bal))}</td><td class="n">${r.b68 === undefined ? '–' : money(r.b68)}</td></tr>`).join('')}</tbody></table></div>
<p class="note">* About 70 % of the balance; the actual start balance varies by up to 8 % from game to game.</p>
${poorest.length ? `<h2>Clubs that start in debt</h2><p>These clubs start the game in the red – no transfer budget, and the board watches every wage.</p><div class="tw"><table><thead><tr><th>#</th><th>Club</th><th>League</th><th class="n">Balance</th></tr></thead><tbody>${poorest.map((r, i) => `<tr><td>${i + 1}</td><td>${cl(r.name)}</td><td>${esc(r.league)} <span class="note">${esc(r.nation)}</span></td><td class="n">${money(r.bal)}</td></tr>`).join('')}</tbody></table></div>` : ''}
<p>Want a challenge? See <a href="/cm-01-02-best-teams-to-manage/">the best teams to manage</a>, or <a href="/cm-01-02-database-versions/">how the database versions differ</a>.</p>`,
    faq: [
      ['Which club has the most money in CM 01/02?', `${top[0].name}, with about ${money(top[0].bal)} in the 3.9.60 database, followed by ${top[1].name} and ${top[2].name}.`],
      ['How big is the transfer budget in CM 01/02?', 'About 70 % of the club\'s bank balance at the start, rounded down to whole £250,000 (or £25,000 for clubs with less than £5m).'],
      ['How much money do Manchester United have in CM 01/02?', 'About £33m and £24m to spend in the 3.9.60 database; the 3.9.68 patch lowered their balance to about £10m.'],
    ],
  });
}

// landingssider på de andre sprog (hreflang til hinanden og til den engelske)
const LP = langPages(nO, nM);
const ALTS = alternatesFor(LP, 'play-cm-01-02-online/');
// guider på de andre sprog (bedste spillere i 3.9.60 og 2026/27-databasen) med hreflang til de engelske
const DEV = langDevices(Object.fromEntries(LP.map((p) => [p.lang, [p.slug, p.nav]])));
const LG = langGuides({ best60: best(O60), kids60: young(O60, 21), bestM: best(M), kidsM: young(M, 20), nM, leaguesM, link, nav: Object.fromEntries(LP.map((p) => [p.lang, [p.slug, p.nav]])) });
for (const p of pages) {
  mkdirSync(`public/${p.slug}`, { recursive: true });
  // guiderne hører under guideoversigten i brødkrummen (BreadcrumbList)
  const guideCrumb = p.slug.startsWith('cm-01-02-') && p.slug !== 'cm-01-02-guides/' && !p.crumbs ? { crumbs: [{ name: 'Guides', url: '/cm-01-02-guides/' }] } : {};
  // "Related guides" nederst på hver guide (interne links mellem guiderne)
  const RELATED: [string, string][] = [['cm-01-02-match-engine/', 'How the match engine works'], ['cm-01-02-attributes-explained/', 'What every attribute does'], ['cm-01-02-ca-pa-explained/', 'CA and PA explained'], ['cm-01-02-wonderkids/', 'Wonderkids'], ['cm-01-02-database-versions/', '3.9.60 vs 3.9.68'], ['cm-01-02-regens/', 'Regens'], ['cm-01-02-player-values/', 'Player values'], ['cm-01-02-tactics/', 'Tactics']];
  const related = 'crumbs' in guideCrumb ? `\n<h2>Related guides</h2><ul>${RELATED.filter(([u]) => u !== p.slug).slice(0, 6).map(([u, t]) => `<li><a href="/${u}">${t}</a></li>`).join('')}</ul>` : '';
  // skærmbilleder (billedsøgning, og:image) på indgangssiderne: [mappe, billede, alt, bredde, højde, klasse]
  const SHOT: Record<string, [string, string, string, number?, number?, string?]> = {
    'cm-01-02-android/': ['en', 'mobile', 'CM Reborn on a phone – the classic CM 01/02 look', 585, 1266, 'phone'],
    'cm-01-02-iphone-ipad/': ['en', 'mobile', 'CM Reborn on an iPhone – the classic CM 01/02 look', 585, 1266, 'phone'],
    'cm-01-02-windows-11/': ['en', 'classic-table', 'The league table in the classic CM 01/02 look – no CD needed'],
    'cm-01-02-mac-ipad-chromebook/': ['en', 'classic-player', 'A player profile in the classic CM 01/02 look on a Mac'],
    'cm-01-02-tactics/': ['en', 'tactics', 'The tactics screen in CM Reborn'],
    'cm-01-02-match-engine/': ['en', 'match', 'A match in CM Reborn'],
    'cm-01-02-multiplayer/': ['en', 'ranking', 'The global rankings in CM Reborn'],
  };
  const shot = SHOT[p.slug];
  const body = shot ? p.body.replace('</p>', `</p>${shotFig(...shot)}`) : p.body;
  const image = shot ? `/landing/${shot[0]}/${shot[1]}.webp` : p.slug === 'play-cm-01-02-online/' ? '/landing/en/classic-squad.webp' : undefined;
  const page: Page = { ...p, body: body + related, ...guideCrumb, faqSchema: true, ...(image ? { image } : {}), ...(p.slug === 'play-cm-01-02-online/' ? { alternates: ALTS } : p.slug === 'cm-01-02-3960-database/' ? { alternates: LG.altBest } : p.slug === 'cm-01-02-2026-update/' ? { alternates: LG.altUpd } : p.slug === 'cm-01-02-windows-11/' ? { alternates: DEV.alt } : {}) };
  writeFileSync(`public/${p.slug}index.html`, render({ ...page, modified: page.modified ?? contentDate(page.slug, page.title + page.description + page.body, CONTENT_DATE) }));
}
for (const lp of LP) {
  mkdirSync(`public/${lp.slug}`, { recursive: true });
  const lpage = toPage(lp, ALTS, [...LG.pages, ...DEV.pages].filter((x) => x.lang === lp.lang).map((x) => [`/${x.slug}`, x.h1]));
  writeFileSync(`public/${lp.slug}index.html`, render({ ...lpage, modified: contentDate(lpage.slug, lpage.title + lpage.description + lpage.body, CONTENT_DATE) }));
}
for (const p of [...LG.pages, ...DEV.pages]) {
  mkdirSync(`public/${p.slug}`, { recursive: true });
  writeFileSync(`public/${p.slug}index.html`, render({ ...p, modified: contentDate(p.slug, p.title + p.description + p.body, CONTENT_DATE) }));
}

// Om-siden: hvem der laver spillet, hvordan det er bygget, og at det ikke er det officielle spil (E-E-A-T)
const ABOUT: Page = {
  slug: 'about/', title: 'About CM Reborn – a Free Fan Remake of CM 01/02 | CM 01/02 Reborn', h1: 'About CM Reborn',
  description: 'Who makes CM Reborn, how the free Championship Manager 01/02 remake is built from the original databases, what it costs (nothing), how your data is handled and how to help.',
  crumbs: [], ogType: 'website',
  body: `<p class="lead">CM Reborn is an independent, free fan remake of Championship Manager 01/02 that runs in the browser. It is made by one developer in Denmark, with help from the CM 01/02 community, and the code is open source on <a href="https://github.com/Skallerup/cm0102-reborn" rel="noopener">GitHub</a>.</p>
<h2>What it is – and is not</h2>
<p>It is not the original game and it is not affiliated with Sports Interactive, SEGA or Eidos, who made and published Championship Manager 01/02 in 2001. CM Reborn is written from scratch: its own match engine, screens and online features. What it shares with the original is the data – the real CM 01/02 database (patches 3.9.60, 3.9.65 and 3.9.68, which the publisher released as freeware in 2008) and a community data update for 2026/27 – and the look of the classic screens, rebuilt as a tribute.</p>
<h2>How it is built</h2>
<ul><li><b>The databases</b> are read directly from the original game files, so every player has the attributes, CA and PA, contract and value from the real database (<a href="/cm-01-02/">browse them</a>).</li><li><b>The match engine</b> is calibrated against a full season of the original: goals per game, home wins, cards, corners and shots on target match the real thing (<a href="/cm-01-02-match-engine/">how it works</a>).</li><li><b>Player development, regens, finances and transfers</b> follow the rules found in the original game and documented by the community (<a href="/cm-01-02-regens/">regens</a>, <a href="/cm-01-02-player-values/">values</a>).</li><li><b>The guides</b> on this site are generated from the same databases – the numbers are read from the data, not from memory.</li></ul>
<h2>Free, no ads, no tracking you did not agree to</h2>
<p>CM Reborn is free, with no ads and no in-game purchases. Your saved games live in your own browser (and in the cloud only if you create an account). Anonymous usage statistics are collected only with your consent. There are no third-party trackers in the game.</p>
<h2>Where it came from</h2>
<p>The project started in 2026 as a way to play CM 01/02 on a Mac, an iPad and a phone – devices the 2001 Windows game never ran on. It grew into a full remake with the classic screens, two databases, online multiplayer, a fantasy draft league and global rankings, released as <a href="/changelog/">frequent updates</a>.</p>
<h2>Help, feedback and credits</h2>
<p>Bug reports, ideas and data corrections are welcome in the <a href="/?community=1">community hub</a>, where you can also see the credits: the CM 01/02 community behind the data updates and patches, the Bosman project's documentation of the original, and the players who test and translate the game into ten languages. Want to join the project? Use the form on the <a href="/">front page</a>.</p>`,
  faq: [
    ['Is CM Reborn the official Championship Manager 01/02?', 'No. It is an independent fan remake, built from scratch and not affiliated with Sports Interactive, SEGA or Eidos. It uses the original database, which has been freeware since 2008.'],
    ['Who makes CM Reborn?', 'One developer in Denmark, with help from the CM 01/02 community. The source code is public on GitHub.'],
    ['Does it cost anything?', 'No. CM Reborn is free, with no ads and no in-game purchases.'],
  ], faqSchema: true,
};
mkdirSync('public/about', { recursive: true });
writeFileSync('public/about/index.html', render({ ...ABOUT, modified: contentDate(ABOUT.slug, ABOUT.title + ABOUT.description + ABOUT.body, TODAY) }));

// sitemaps: et indeks + én fil pr. slags side (Google: højst 50.000 url'er pr. fil)
const groups: [string, string[], string, string][] = [
  ['guides', ['', ...pages.map((p) => p.slug), ...LP.map((p) => p.slug), ...LG.pages.map((p) => p.slug), ...DEV.pages.map((p) => p.slug), 'about/'], TODAY, 'weekly'],
  ...(['hub', 'lists', 'leagues', 'nations', 'clubs', 'players'] as const).flatMap((k) => [
    [`cm-01-02-${k}`, dbO.urls[k], CONTENT_DATE, 'monthly'] as [string, string[], string, string],
    [`2026-27-${k}`, dbM.urls[k], CONTENT_DATE, 'monthly'] as [string, string[], string, string],
  ]),
];
// stadionfotos på klubsiderne (billed-sitemap)
const IMAGES: Record<string, string[]> = { ...dbO.images, ...dbM.images };
const xml = (u: string) => `${SITE}/${u}`.replace(/&/g, '&amp;');
// <lastmod> pr. side fra indholdet (scripts/seo/lastmod.ts); forsiden ("") får byggedagen; indekset gruppens nyeste dato
const lastmod = (u: string, mod: string) => (u ? dateOf(u) ?? mod : mod);
const newest = (us: string[], mod: string) => us.reduce((m, u) => (lastmod(u, mod) > m ? lastmod(u, mod) : m), '');
for (const [name, us, mod, freq] of groups) {
  writeFileSync(`public/sitemap-${name}.xml`, `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${us.map((u) => `  <url><loc>${xml(u)}</loc><lastmod>${lastmod(u, mod)}</lastmod><changefreq>${freq}</changefreq>${(IMAGES[u] ?? []).map((i) => `<image:image><image:loc>${SITE}${i}</image:loc></image:image>`).join('')}</url>`).join('\n')}
</urlset>
`);
}
writeFileSync('public/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${groups.map(([name, us, mod]) => `  <sitemap><loc>${SITE}/sitemap-${name}.xml</loc><lastmod>${newest(us, mod)}</lastmod></sitemap>`).join('\n')}
</sitemapindex>
`);

// llms.txt: kort, faktuel beskrivelse til AI-tjenester (https://llmstxt.org)
writeFileSync('public/llms.txt', `# CM Reborn

> CM Reborn (cm0102reborn.com) is a free fan remake of Championship Manager 01/02 that runs in any web browser – no download, no ads. It has the original CM 01/02 database for 2001/02 in all three official versions (3.9.60, 3.9.65 and 3.9.68; ${nO} players in 3.9.68) and a 2026/27 database (${nM} players), the classic CM 01/02 look or a modern look, online multiplayer, a fantasy draft league and global rankings. It works on Mac, Windows, Linux, Chromebook, iPad, iPhone and Android, and in ten languages.

Key facts:
- Price: free. No ads, no in-game purchases.
- Play: open https://cm0102reborn.com, choose New game, pick a database and a look.
- Databases: original CM 01/02 for 2001/02 – 3.9.60 (default), 3.9.65 or 3.9.68 (${leaguesO} leagues) – and 2026/27 (${leaguesM} leagues); real squad numbers, managers, clubs and stadiums; attributes, random potential (PA -1/-2) and starting finances as in the original game.
- Classic CM 01/02 screens: blue menus, Match Overview with commentary, squad selection, tactics with player runs, Staff Search, Find, stadium backgrounds on matchdays.
- Match engine calibrated against a full season of the original CM 01/02.
- Saves are stored in the browser (export/import, optional cloud saves). Installable as an app (PWA), works offline.
- Independent fan project, not affiliated with Sports Interactive, SEGA or Eidos.

## CM 01/02 database (2001/02, patch 3.9.68)
- [Database home and search](${SITE}/cm-01-02/): ${dbO.players.toLocaleString('en')} player profiles with every attribute (1–20), hidden attributes, CA and PA; ${dbO.clubs} clubs, ${dbO.leagues} leagues, ${dbO.nations} nations.
- [All lists](${SITE}/cm-01-02/lists/): best players by position, wonderkids, Bosman free transfers, bargains, random-potential (PA -1/-2) players, attribute leaders.
- [Managers](${SITE}/cm-01-02/managers/): every club's manager in the original database (Sir Alex Ferguson, Wenger, Lippi …) with nationality.
- Player profile URL pattern: ${SITE}/cm-01-02/players/<first-last>/ (e.g. ${SITE}/cm-01-02/players/thierry-henry/)
- Club URL pattern: ${SITE}/cm-01-02/clubs/<club>/ (e.g. ${SITE}/cm-01-02/clubs/arsenal/)

## 2026/27 database
- [Database home and search](${SITE}/2026-27/): ${dbM.players.toLocaleString('en')} player profiles, ${dbM.clubs} clubs, ${dbM.leagues} leagues.
- [All lists](${SITE}/2026-27/lists/)
- [Managers](${SITE}/2026-27/managers/): the 2026/27 head coaches of every club, with nationality.

## Guides
${pages.map((p) => `- [${p.h1}](${SITE}/${p.slug}): ${p.description}`).join('\n')}

## Other languages
${LP.map((p) => `- [${p.h1}](${SITE}/${p.slug}) (${p.lang})`).join('\n')}

## Play
- [Start a new game](${SITE}/)
- [Fantasy draft league](${SITE}/?draft=1)
- [Community hub](${SITE}/?community=1)
`);
// hvilken commit der er live (IndexNow-workflowen venter på den): Vercel sætter VERCEL_GIT_COMMIT_SHA under bygningen
writeFileSync('public/build.json', JSON.stringify({ sha: process.env.VERCEL_GIT_COMMIT_SHA ?? '', built: new Date().toISOString() }));
saveLastmod();
console.log(`${pages.length} guider · CM 01/02: ${dbO.summary} · 2026/27: ${dbM.summary}`);
