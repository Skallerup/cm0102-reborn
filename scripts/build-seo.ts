// Statiske SEO-sider (rent HTML – kan læses af søgemaskiner og AI-crawlere uden JavaScript), bygget ud fra
// spillets egne databaser: hvad CM 01/02-fans søger efter (wonderkids, bedste spillere, taktik, data-update,
// spil på Mac/iPad/Chromebook, spil online). Skriver public/<side>/index.html, public/sitemap.xml og public/llms.txt.
// Kør: npx tsx scripts/build-seo.ts  (køres også før build: "prebuild" i package.json)
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { CSS, CTA, SITE, TODAY, esc, render, type Page } from './seo/layout';
import { buildDb } from './seo/db';
import { alternatesFor, langPages, toPage } from './seo/i18n';
import { guides } from './seo/guides';

/** dato for databasesidernes indhold (sitemap lastmod) – hæv den, når siderne ændres mærkbart */
const CONTENT_DATE = '2026-11-07';

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
    return [{ name: first ? `${first} ${last}` : last, age, pos: String(r[F.pos]), club: club.get(r[F.club] as number) ?? 'Free agent', nation: w.nations[r[F.nation] as number]?.name ?? '', ca: rt.ca, pa: rt.pa, random: !!rt.paRaw, dob }];
  });
}
const O = players(orig), M = players(modern);

// databasesiderne først (spillernavnene i guiderne linker til profilerne)
const CULT_LIST = (JSON.parse(readFileSync('scripts/cult-players.json', 'utf8')) as { first: string; last: string }[]).map((c) => `${c.first} ${c.last}`.trim());
const cultSet = new Set(CULT_LIST);
const dbO = buildDb({
  file: SEO_ORIGINAL, prefix: 'cm-01-02', game: 'CM 01/02', season: '2001/02', dbName: 'the original CM 01/02 database (patch 3.9.68)', original: true, modified: CONTENT_DATE,
  cult: cultSet,
  keep: (p) => p.ca >= 120 || (p.age <= 23 && (p.pa >= 145 || p.paRaw === -2)) || (p.age <= 21 && p.paRaw === -1 && p.ca >= 60) || p.caps >= 30 || cultSet.has(p.name),
});
const dbM = buildDb({
  file: 'public/data/world.json', prefix: '2026-27', game: 'CM 01/02 2026/27', season: '2026/27', dbName: 'the CM 01/02 2026/27 database (October 2026 data update)', original: false, modified: CONTENT_DATE,
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
    title: 'Play CM 01/02 Online – Free in Your Browser (No Download) | CM Reborn',
    h1: 'Play CM 01/02 online – free, in your browser',
    description: `Play a Championship Manager 01/02 style football manager online for free: the original 2001/02 database and a 2026/27 update, ${nM}+ real players, the classic CM look, multiplayer – no download, works on Mac, PC, iPad and phone.`,
    body: `<p class="lead">CM Reborn is a free fan remake of Championship Manager 01/02 that runs straight in your browser. Pick the original 2001/02 database or the 2026/27 update, choose the classic CM 01/02 look or a modern one, and you are managing your club in seconds – no installer, no emulator, no patch files.</p>
${CTA}
<h2>What you get</h2>
<ul>
<li><b>Two databases:</b> the original CM 01/02 database (patch 3.9.68, season 2001/02, ${nO} players in ${leaguesO} leagues) and the community 2026/27 update (${nM} players in ${leaguesM} leagues).</li>
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
    title: 'CM 01/02 Tactics – The Classic Formations Explained | CM Reborn',
    h1: 'CM 01/02 tactics: the classic formations, and why they worked',
    description: 'The famous CM 01/02 tactics explained: 4-4-2, the overpowered DMC, the 4-2-4 with arrows, through balls and the offside trap – and how they play in CM Reborn, where no formation is a cheat code.',
    body: `<p class="lead">CM 01/02 is remembered for tactics that broke the match engine. Here is what the classic ones did, and how the same ideas play out in CM Reborn.</p>
<h2>The famous CM 01/02 exploits</h2>
<ul>
<li><b>The DMC.</b> In the original, a defensive midfielder covered far more of the pitch than any other role, so one or two DMCs made almost any team solid.</li>
<li><b>4-2-4 with forward arrows.</b> Four forwards, with the wide midfielders pushed on with arrows, overloaded the defence and scored freely.</li>
<li><b>Through balls and pace.</b> Fast strikers against a high line were almost unstoppable, especially with "run with ball" and "through balls" on.</li>
<li><b>Offside trap and hard tackling.</b> A popular combination that the AI rarely punished.</li>
</ul>
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
      ['Which languages are supported?', 'English, Danish, Swedish, Norwegian, Spanish, French, German, Italian, Brazilian Portuguese and Turkish.'],
    ],
  },
];

pages.push(...guides(dbO));

// landingssider på de andre sprog (hreflang til hinanden og til den engelske)
const LP = langPages(nO, nM);
const ALTS = alternatesFor(LP, 'play-cm-01-02-online/');
for (const p of pages) {
  mkdirSync(`public/${p.slug}`, { recursive: true });
  writeFileSync(`public/${p.slug}index.html`, render({ ...p, faqSchema: true, ...(p.slug === 'play-cm-01-02-online/' ? { alternates: ALTS } : {}) }));
}
for (const lp of LP) {
  mkdirSync(`public/${lp.slug}`, { recursive: true });
  writeFileSync(`public/${lp.slug}index.html`, render(toPage(lp, ALTS)));
}
writeFileSync('public/seo.css', CSS);

// sitemaps: et indeks + én fil pr. slags side (Google: højst 50.000 url'er pr. fil)
const groups: [string, string[], string, string][] = [
  ['guides', ['', ...pages.map((p) => p.slug), ...LP.map((p) => p.slug), '?draft=1', '?community=1'], TODAY, 'weekly'],
  ...(['hub', 'lists', 'leagues', 'nations', 'clubs', 'players'] as const).flatMap((k) => [
    [`cm-01-02-${k}`, dbO.urls[k], CONTENT_DATE, 'monthly'] as [string, string[], string, string],
    [`2026-27-${k}`, dbM.urls[k], CONTENT_DATE, 'monthly'] as [string, string[], string, string],
  ]),
];
const xml = (u: string) => `${SITE}/${u}`.replace(/&/g, '&amp;');
for (const [name, us, mod, freq] of groups) {
  writeFileSync(`public/sitemap-${name}.xml`, `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${us.map((u) => `  <url><loc>${xml(u)}</loc><lastmod>${mod}</lastmod><changefreq>${freq}</changefreq></url>`).join('\n')}
</urlset>
`);
}
writeFileSync('public/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${groups.map(([name, , mod]) => `  <sitemap><loc>${SITE}/sitemap-${name}.xml</loc><lastmod>${mod}</lastmod></sitemap>`).join('\n')}
</sitemapindex>
`);

// llms.txt: kort, faktuel beskrivelse til AI-tjenester (https://llmstxt.org)
writeFileSync('public/llms.txt', `# CM Reborn

> CM Reborn (cm0102reborn.com) is a free fan remake of Championship Manager 01/02 that runs in any web browser – no download, no ads. It has the original CM 01/02 database (patch 3.9.68, season 2001/02, ${nO} players) and a 2026/27 database (${nM} players), the classic CM 01/02 look or a modern look, online multiplayer, a fantasy draft league and global rankings. It works on Mac, Windows, Linux, Chromebook, iPad, iPhone and Android, and in ten languages.

Key facts:
- Price: free. No ads, no in-game purchases.
- Play: open https://cm0102reborn.com, choose New game, pick a database and a look.
- Databases: original CM 01/02 3.9.68 (2001/02, ${leaguesO} leagues) and 2026/27 (${leaguesM} leagues); real squad numbers, clubs and stadiums.
- Classic CM 01/02 screens: blue menus, Match Overview with commentary, squad selection, tactics with player runs, Staff Search, Find, stadium backgrounds on matchdays.
- Match engine calibrated against a full season of the original CM 01/02.
- Saves are stored in the browser (export/import, optional cloud saves). Installable as an app (PWA), works offline.
- Independent fan project, not affiliated with Sports Interactive, SEGA or Eidos.

## CM 01/02 database (2001/02, patch 3.9.68)
- [Database home and search](${SITE}/cm-01-02/): ${dbO.players.toLocaleString('en')} player profiles with every attribute (1–20), hidden attributes, CA and PA; ${dbO.clubs} clubs, ${dbO.leagues} leagues, ${dbO.nations} nations.
- [All lists](${SITE}/cm-01-02/lists/): best players by position, wonderkids, Bosman free transfers, bargains, random-potential (PA -1/-2) players, attribute leaders.
- Player profile URL pattern: ${SITE}/cm-01-02/players/<first-last>/ (e.g. ${SITE}/cm-01-02/players/thierry-henry/)
- Club URL pattern: ${SITE}/cm-01-02/clubs/<club>/ (e.g. ${SITE}/cm-01-02/clubs/arsenal/)

## 2026/27 database
- [Database home and search](${SITE}/2026-27/): ${dbM.players.toLocaleString('en')} player profiles, ${dbM.clubs} clubs, ${dbM.leagues} leagues.
- [All lists](${SITE}/2026-27/lists/)

## Guides
${pages.map((p) => `- [${p.h1}](${SITE}/${p.slug}): ${p.description}`).join('\n')}

## Other languages
${LP.map((p) => `- [${p.h1}](${SITE}/${p.slug}) (${p.lang})`).join('\n')}

## Play
- [Start a new game](${SITE}/)
- [Fantasy draft league](${SITE}/?draft=1)
- [Community hub](${SITE}/?community=1)
`);
console.log(`${pages.length} guider · CM 01/02: ${dbO.summary} · 2026/27: ${dbM.summary}`);
