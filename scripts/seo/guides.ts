// Flere engelske guider (søgninger som "cm 01/02 download", "bosman", "hidden attributes", "best teams to manage")
// – med tal fra den originale database (buildDb) og links til databasesiderne.
import { A } from '../../src/game/attributes';
import { esc, type Page } from './layout';
import { pounds, type ClubSum, type DbOut } from './db';

type KP = DbOut['kept'][number];

const pl = (p: KP) => (p.url ? `<a href="${p.url}"><b>${esc(p.name)}</b></a>` : `<b>${esc(p.name)}</b>`);
const pa = (p: KP) => (p.paRaw === -2 ? 'R −2' : p.paRaw === -1 ? 'R −1' : String(p.pa));

/** sammenligningen af databaseudgaverne (build-seo.ts versionData) */
export interface VersionData {
  stats: { v: string; players: number; leagues: number; clubs: number }[];
  early: { name: string; from: string; to: string; ca: number }[];
  late: { name: string; from: string; to: string; ca: number }[];
  movedCount: number;
  added: { name: string; club: string; ca: number; dob: string }[];
  bosman60: { name: string; club: string; ca: number; age: number }[];
  url: (name: string, club: string) => string | null;
}
function ptable(rows: KP[], extra?: [string, (p: KP) => string]) {
  return `<div class="tw"><table><thead><tr><th>#</th><th>Player</th><th>Age</th><th>Position</th><th>Club</th>${extra ? `<th class="n">${extra[0]}</th>` : ''}<th class="n">CA</th><th class="n">PA</th></tr></thead><tbody>${rows.map((p, i) => `<tr><td>${i + 1}</td><td>${pl(p)}</td><td>${p.age}</td><td>${esc(p.posStr)}</td><td>${esc(p.clubName)}</td>${extra ? `<td class="n">${extra[1](p)}</td>` : ''}<td class="n">${p.ca}</td><td class="n">${pa(p)}</td></tr>`).join('')}</tbody></table></div>`;
}

/** de 5 bedste i en egenskab (blandt spillere med profil, ikke udfyldt – 0 = ikke sat i databasen) */
function topIn(K: KP[], key: keyof typeof A, n = 5, keepers = false): KP[] {
  return K.filter((p) => p.attrs[A[key]] > 0 && (keepers ? p.pos[0] >= 15 : p.pos[0] < 15)).sort((a, b) => b.attrs[A[key]] - a.attrs[A[key]] || b.ca - a.ca).slice(0, n);
}
const tops = (K: KP[], key: keyof typeof A, keepers = false) => topIn(K, key, 5, keepers).map((p) => `${pl(p)} (${p.attrs[A[key]]})`).join(', ');
function moveTable(rows: VersionData['late'], ver: VersionData, late: boolean) {
  return `<div class="tw"><table><thead><tr><th>#</th><th>Player</th><th>3.9.60</th><th>${late ? '3.9.68' : '3.9.65'}</th><th class="n">CA</th></tr></thead><tbody>${rows.map((p, i) => { const u = late ? ver.url(p.name, p.to) : null; return `<tr><td>${i + 1}</td><td>${u ? `<a href="${u}"><b>${esc(p.name)}</b></a>` : `<b>${esc(p.name)}</b>`}</td><td>${esc(p.from)}</td><td>${esc(p.to)}</td><td class="n">${p.ca}</td></tr>`; }).join('')}</tbody></table></div>`;
}
function ctable(rows: ClubSum[], cols: [string, (c: ClubSum) => string][]) {
  return `<div class="tw"><table><thead><tr><th>#</th><th>Club</th><th>League</th>${cols.map(([h]) => `<th class="n">${h}</th>`).join('')}</tr></thead><tbody>${rows.map((c, i) => `<tr><td>${i + 1}</td><td><a href="${c.url}"><b>${esc(c.name)}</b></a></td><td><a href="${c.leagueUrl}">${esc(c.league)}</a> <span class="note">${esc(c.nation)}</span></td>${cols.map(([, f]) => `<td class="n">${f(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

export const GUIDE_SLUGS = ['cm-01-02-26-27-squads/', 'cm-01-02-android/', 'cm-01-02-iphone-ipad/', 'cm-01-02-windows-11/', 'cm-01-02-cheat-tactics/', 'cm-01-02-money-cheat/', 'cm-01-02-work-permit/', 'cm-01-02-training/', 'cm-01-02-staff-guide/', 'cm-01-02-multiplayer/', 'cm-01-02-regens/', 'cm-01-02-player-values/', 'cm-01-02-world-cup-2002/', 'cm-01-02-richest-clubs/', 'cm-01-02-match-engine/', 'cm-01-02-attributes-explained/', 'cm-01-02-database-versions/', 'cm-01-02-download/', 'cm-01-02-bosman-guide/', 'cm-01-02-hidden-attributes/', 'cm-01-02-ca-pa-explained/', 'cm-01-02-best-teams-to-manage/', 'cm-01-02-tips/', 'free-football-manager-browser-game/', 'cm-01-02-guides/'];

export function guides(db: DbOut, ver: VersionData): Page[] {
  // stabslisternes top 5 fra den originale database (scripts/seo/staff.ts)
  const staffTable = (slug: string, cols: string[]) => { const rows = db.staffTop?.[slug] ?? []; return rows.length ? `<div class="tw"><table><thead><tr><th>Name</th><th>Job</th><th>Club</th>${cols.map((c) => `<th class="n">${c}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr><td>${r.url ? `<a href="${r.url}"><b>${esc(r.name)}</b></a>` : `<b>${esc(r.name)}</b>`}</td><td>${esc(r.role)}</td><td>${esc(r.club || 'Unattached')}</td>${r.v.map((v) => `<td class="n">${v || '–'}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : ''; };
  const staffAnswer = (slug: string) => { const r = db.staffTop?.[slug]?.[0]; return r ? `${r.name} (${r.role}${r.club ? `, ${r.club}` : ', unattached'}) tops the list in the original database.` : ''; };
  const K = db.kept;
  const yr = 2002;
  const bosman = K.filter((p) => p.contract && p.contract.startsWith(`${yr}-`) && p.clubName !== 'Free agent').sort((a, b) => b.ca - a.ca);
  const v = (p: KP, k: keyof typeof A) => p.attrs[A[k]];
  const stars = K.filter((p) => p.ca >= 150);
  const flaky = stars.filter((p) => v(p, 'consistency') > 0 && v(p, 'consistency') <= 9).sort((a, b) => v(a, 'consistency') - v(b, 'consistency') || b.ca - a.ca).slice(0, 15);
  const glass = stars.filter((p) => v(p, 'injuryProneness') >= 14).sort((a, b) => v(b, 'injuryProneness') - v(a, 'injuryProneness') || b.ca - a.ca).slice(0, 15);
  const bigGame = stars.filter((p) => v(p, 'importantMatches') >= 18).sort((a, b) => v(b, 'importantMatches') - v(a, 'importantMatches') || b.ca - a.ca).slice(0, 15);
  const loyal = stars.filter((p) => v(p, 'loyalty') >= 18).sort((a, b) => b.ca - a.ca).slice(0, 10);
  const hot = stars.filter((p) => v(p, 'temperament') > 0 && v(p, 'temperament') <= 6).sort((a, b) => v(a, 'temperament') - v(b, 'temperament') || b.ca - a.ca).slice(0, 10);
  const C = db.clubSum;
  const richest = C.slice().sort((a, b) => b.balance - a.balance).slice(0, 20);
  const strongest = C.slice().sort((a, b) => b.strength - a.strength).slice(0, 20);
  const youth = C.slice().sort((a, b) => b.kids - a.kids || b.strength - a.strength).slice(0, 15);
  const giants = C.filter((c) => c.tier >= 2).sort((a, b) => b.cap - a.cap).slice(0, 15);
  const lowest = C.filter((c) => c.tier >= 4 || (c.tier === 3 && c.nation === 'Scotland')).sort((a, b) => a.strength - b.strength).slice(0, 10);
  const pa180 = K.filter((p) => !p.paRaw && p.pa >= 180).length, pa190 = K.filter((p) => !p.paRaw && p.pa >= 190).length;
  const neg2 = K.filter((p) => p.paRaw === -2).length, neg1 = K.filter((p) => p.paRaw === -1).length;

  // "cheat players": de billigste med PA 170+ (ikke tilfældig PA)
  const cheat = K.filter((p) => !p.paRaw && p.pa >= 170 && p.value > 0).sort((a, b) => a.value - b.value || b.pa - a.pa).slice(0, 15);
  const pages: Page[] = [
    {
      slug: 'cm-01-02-android/',
      title: 'CM 01/02 on Android – Play Without a PC, APK or Emulator | CM Reborn',
      h1: 'Play CM 01/02 on Android – no PC, no APK',
      description: 'How to play Championship Manager 01/02 on an Android phone or tablet: no APK, no emulator and no PC – a free CM 01/02 remake that runs in Chrome, with the original 2001/02 database.',
      body: `<p class="lead">Championship Manager 01/02 was made for Windows in 2001, so it has never run on Android. The usual workarounds – emulators, Winlator, ExaGear or a remote desktop to your PC – are fiddly and drain the battery. There is a simpler way.</p>
<h2>The easy way: play in Chrome</h2>
<ol><li>Open <a href="/">cm0102reborn.com</a> in Chrome on your phone or tablet.</li><li>Tap <b>New game</b>, pick the original CM 01/02 database (3.9.60, 3.9.65 or 3.9.68) and a club.</li><li>Tap <b>Install</b> (or "Add to Home screen") – it then opens like an app and works offline.</li></ol>
<p>It is free, there is no APK to sideload and nothing to trust from a random download site. The screens are built for touch: tap a player to select, tap again to swap, hold and drag for forward runs.</p>
<h2>What about emulators?</h2>
<p>Running the real cm0102.exe on Android needs a Windows emulator, the game files and usually a no-CD fix. It can work on a fast phone, but the mouse-driven screens are hard to use with fingers, and saves are easy to lose. CM Reborn plays the same database with the classic look, made for touch.</p>
<p>More devices: <a href="/cm-01-02-iphone-ipad/">iPhone and iPad</a>, <a href="/cm-01-02-mac-ipad-chromebook/">Mac and Chromebook</a>, <a href="/cm-01-02-windows-11/">Windows 11 and Steam Deck</a>.</p>`,
      faq: [
        ['Can I play CM 01/02 on Android?', 'The original only runs on Windows, but CM Reborn – a free CM 01/02 remake – runs in Chrome on any Android phone or tablet, with the original 2001/02 database. No APK or PC needed.'],
        ['Is there a CM 01/02 APK?', 'There is no official Android version. CM Reborn needs no APK: open cm0102reborn.com and install it from the browser as an app.'],
        ['Does it work offline on Android?', 'Yes. Once installed from Chrome it works offline, and your saves stay on the device.'],
      ],
    },
    {
      slug: 'cm-01-02-iphone-ipad/',
      title: 'CM 01/02 on iPhone and iPad – Play Free in Safari | CM Reborn',
      h1: 'Play CM 01/02 on iPhone and iPad',
      description: 'Championship Manager 01/02 never came to iOS. Here is how to play a free CM 01/02 remake on iPhone and iPad in Safari – the original database, the classic look, saves on your device.',
      body: `<p class="lead">There has never been a Championship Manager 01/02 for iPhone or iPad, and Apple does not allow the Windows emulators needed to run the original. A browser game is the only way – and it works well.</p>
<h2>How to play</h2>
<ol><li>Open <a href="/">cm0102reborn.com</a> in Safari.</li><li>Tap <b>New game</b> and pick the original CM 01/02 database and a club.</li><li>Tap the share button → <b>Add to Home Screen</b>: it opens full-screen like an app and works offline.</li></ol>
<h2>Made for touch</h2>
<p>Tap to select players, tap again to swap them, hold and drag on the tactics pitch to give forward runs, and use the classic CM 01/02 screens or a modern look. On an iPad the classic screens fit exactly like on a PC monitor.</p>
<p>Also: <a href="/cm-01-02-android/">Android</a>, <a href="/cm-01-02-mac-ipad-chromebook/">Mac and Chromebook</a>, <a href="/play-cm-01-02-online/">play CM 01/02 online</a>.</p>`,
      faq: [
        ['Can I play CM 01/02 on an iPhone?', 'Not the original – it is a Windows game. CM Reborn, a free remake with the original 2001/02 database, runs in Safari on iPhone and iPad and can be added to the home screen.'],
        ['Is CM 01/02 in the App Store?', 'No. CM Reborn does not need the App Store: it runs in Safari and installs from the share menu.'],
      ],
    },
    {
      slug: 'cm-01-02-windows-11/',
      title: 'CM 01/02 on Windows 11 – "Asking for CD", Fixes and Steam Deck | CM Reborn',
      h1: 'CM 01/02 on Windows 11: the CD error, fixes and Steam Deck',
      description: 'Championship Manager 01/02 asking for the CD on Windows 10 or 11, crashing or the wrong resolution? The usual fixes – and how to skip them all and play in the browser, also on Steam Deck.',
      body: `<p class="lead">CM 01/02 is freeware since 2008, but the 2001 program still expects a CD in the drive and a 2001 computer. On Windows 10 and 11 that means a few familiar problems.</p>
<h2>"Please insert the CD" / asking for CD</h2>
<p>The game checks for its CD at start-up. The free download from the community (champman0102.net) comes with a no-CD version of the executable and the 3.9.68 patch – use that instead of an old disc image.</p>
<h2>Crashes, resolution and compatibility</h2>
<ul><li>Run it in compatibility mode for Windows XP and as administrator if it will not start.</li><li>The game runs at a fixed resolution; on a large monitor the community's starter kits and resolution patches help.</li><li>Keep your saves outside "Program Files", or Windows may hide them in a VirtualStore folder.</li></ul>
<h2>Steam Deck and Linux</h2>
<p>CM 01/02 is not on Steam, but it can be added as a non-Steam game and run through Proton or Wine. The desktop-era mouse controls are awkward on the Deck's touchscreen.</p>
<h2>Or skip it all</h2>
<p><a href="/">CM Reborn</a> is a free CM 01/02 remake in the browser: no CD, no compatibility settings, no patches – the original 3.9.60, 3.9.65 or 3.9.68 database, and it works the same on Windows 11, the Steam Deck's browser, a Mac or a phone. <a href="/cm-01-02-download/">More about the download →</a></p>`,
      faq: [
        ['Why does CM 01/02 ask for the CD?', 'The 2001 program checks for its CD at start-up. The community download includes a no-CD executable and the 3.9.68 patch – or play CM Reborn in the browser, which needs no CD at all.'],
        ['Does CM 01/02 work on Windows 11?', 'Usually yes, with the community download, compatibility mode and the no-CD executable. CM Reborn avoids the problems by running in the browser.'],
        ['Can I play CM 01/02 on Steam Deck?', 'The original can run through Proton as a non-Steam game. CM Reborn runs in the Deck\'s browser with no setup.'],
      ],
    },
    {
      slug: 'cm-01-02-cheat-tactics/',
      title: 'CM 01/02 Cheat Tactics & Cheat Players – Diablo, Wib Wob | CM Reborn',
      h1: 'CM 01/02 cheat tactics and cheat players',
      description: 'Why the famous CM 01/02 cheat tactics like Diablo and Wib Wob worked, what the match engine rewarded, and the cheap "cheat players" who become world-beaters – from the original database.',
      body: `<p class="lead">Every CM 01/02 veteran remembers a tactic downloaded from a forum that won everything – Diablo, Wib Wob, the 4-1-3-2 variants, WWW2 – and the "cheat players" bought for pennies who became world-beaters. Here is why they worked, and who those players are.</p>
<h2>Why the cheat tactics worked</h2>
<p>The famous tactics were shared as tactic files and loaded in the tactics screen. They did not change the game – they exploited how its match engine scored options. From the original's code (see <a href="/cm-01-02-match-engine/">how the match engine works</a>):</p>
<ul>
<li><b>Running at defenders paid off.</b> A player through on goal adds 1500 × distance to running, and the opponent's offside trap pushes good decision-makers to run in behind (+4000) – so fast forwards with forward runs broke defences again and again.</li>
<li><b>Defensive midfielders covered huge areas</b> in the original's positioning, so one or two DMCs made a team very hard to break down.</li>
<li><b>Hard tackling is four times Normal's challenge weight</b> (Easy 0.5, Normal 2, Hard 4): more ball won – and the AI rarely punished the extra fouls.</li>
<li><b>Instructions stacked:</b> Run With Ball, Long Shots and Cross Ball each add thousands of points to their option, so a tactic could force the same pattern every time.</li>
</ul>
<p>In CM Reborn no formation is overpowered on purpose – the shape decides where you outnumber the opponent, and every instruction has a price. <a href="/cm-01-02-tactics/">The classic formations explained →</a></p>
<h2>Cheat players: world-beaters for pennies</h2>
<p>The best value in CM 01/02 is potential: the value formula cuts the price of teenagers hard, so a 17-year-old with a PA of 170+ costs a fraction of a star. These are the cheapest players with a potential of 170 or more in the database:</p>
${ptable(cheat, ['Value', (p) => pounds(p.value)])}
<p>Plus the random-potential legends – Tsigalko, Cherno Samba, To Madeira – whose PA is rolled in every new game: <a href="/cm-01-02/lists/random-potential/">every random-potential player →</a> and <a href="/cm-01-02/lists/bargains/">the bargains list →</a>.</p>
<h2>And the "real" cheats?</h2>
<p>Money and work-permit cheats edited the save game or the database. CM Reborn has a database editor in the start menu for that – and <a href="/cm-01-02-work-permit/">the work permit rules</a> explain which non-EU players a British club can sign without one.</p>`,
      faq: [
        ['What is the best cheat tactic in CM 01/02?', 'The famous ones – Diablo, Wib Wob and the 4-1-3-2 variants – exploited forward runs, through balls, defensive midfielders and hard tackling in the original match engine. CM Reborn has no overpowered formation.'],
        ['Who are the cheat players in CM 01/02?', `Cheap teenagers with huge potential – the cheapest with a PA of 170+ are ${cheat.slice(0, 3).map((p) => p.name).join(', ')} – plus the random-potential legends like Tsigalko and Cherno Samba.`],
      ],
    },
    {
      slug: 'cm-01-02-money-cheat/',
      title: 'CM 01/02 Money Cheat – Unlimited Money, Editors & Legit Ways | CM Reborn',
      h1: 'CM 01/02 money cheat: unlimited money, editors and the legit ways',
      description: 'Is there a money cheat in CM 01/02? How players give their club unlimited money with database and save game editors, how to do it in CM Reborn with the built-in editor – and how to make money without cheating.',
      body: `<p class="lead">CM 01/02 has no cheat codes. When people talk about a "money cheat" they mean one of two things: editing the club's money with a fan-made tool, or a way of making money that the game never punished. Here are both – and how CM Reborn handles it.</p>
<h2>Editing the money in the original</h2>
<ul>
<li><b>Before the game starts:</b> a database editor changes a club's bank balance in the database files (club.dat). The game reads the balance when you start a new game and sets the transfer budget from it – about 70 % of the balance.</li>
<li><b>In a running save:</b> a save game editor changes the money in your saved game.</li>
</ul>
<p>Both are community tools, not part of the game. Back up your saves before you try one.</p>
<h2>Unlimited money in CM Reborn – no tools needed</h2>
<p>CM Reborn has a database editor built in:</p>
<ol>
<li>Open <a href="/">CM Reborn</a> and choose <b>Editor</b> in the start menu.</li>
<li>Name a new database, pick the base (the original 2001/02 database or 2026/27) and press <b>Create</b>.</li>
<li>Go to <b>Clubs</b>, find your club and set <b>Balance at start</b> (and the reputation, if you like). <b>Save</b>.</li>
<li>Press <b>New game</b> next to your database – your club starts with the money you gave it.</li>
</ol>
<p>The same editor changes players too: attributes, CA and PA – also the random −1/−2 potential – and you can create new players. Your database is saved in the browser and can be exported as a file.</p>
<h2>Making money without cheating</h2>
<ul>
<li><b>Sell at the peak.</b> A player's value falls quickly in his thirties – <a href="/cm-01-02-player-values/">how values are calculated</a>. Sell before the drop.</li>
<li><b>Sign for free.</b> Players whose contracts run out can be signed on a Bosman – <a href="/cm-01-02-bosman-guide/">the best ones in 2002</a>, and <a href="/cm-01-02-best-signings/">the best cheap signings</a>.</li>
<li><b>Buy young, sell old.</b> Wonderkids cost little and rise in value as their ability grows.</li>
<li><b>Win things.</b> Cup runs, European football and a high league finish bring prize money and bigger crowds.</li>
</ul>
<p>Want the money without editing anything? Start with one of <a href="/cm-01-02-richest-clubs/">the richest clubs</a>.</p>`,
      faq: [
        ['Is there a money cheat in CM 01/02?', 'No cheat code. Players edit the club\'s balance with a database editor before starting, or with a save game editor in a running save. In CM Reborn the built-in Editor sets any club\'s starting balance.'],
        ['How do I get unlimited money in CM 01/02?', 'In CM Reborn: Editor → create a database → Clubs → set "Balance at start" → New game. In the original you need a fan-made database or save game editor.'],
        ['How is the transfer budget set in CM 01/02?', 'From the bank balance at the start: about 70 % of it, rounded to whole £250,000 (or £25,000 for small clubs).'],
      ],
    },
    {
      slug: 'cm-01-02-work-permit/',
      title: 'CM 01/02 Work Permits – Signing Non-EU Players in England and Scotland | CM Reborn',
      h1: 'CM 01/02 work permits: signing non-EU players',
      description: 'How work permits work in CM 01/02: which players a British club needs a permit for in 2001/02, who gets one, the loan ban for non-EU players – and how CM Reborn handles it.',
      body: `<p class="lead">In 2001/02 a club in England, Scotland, Wales or Northern Ireland could not simply sign any player from outside the EU. CM 01/02 copies the rule – and it is why so many Brazilian and Argentine wonderkids were "impossible" to sign for Premier League clubs.</p>
<h2>Who needs a permit</h2>
<p>Players from outside the EU and EEA (EU countries plus Norway, Iceland and Liechtenstein) joining a British club. Players from EU countries – France, Italy, Spain, Holland, Denmark, Sweden and the rest – need nothing.</p>
<h2>Who gets one</h2>
<p>The real rule of the time: the player must have played 75 % of his country's competitive internationals in the last two years, and the country must be in FIFA's top 70 – otherwise an appeal for an exceptional talent. The database only holds a player's total caps, so CM Reborn uses an estimate: an established international (15+ caps), a big name (reputation 70+) or a high-class international (5+ caps and CA 140+) gets the permit.</p>
<h2>No loans</h2>
<p>As in the original ("… are not allowed to loan non-EU players"), British clubs cannot take non-EU players on loan.</p>
<h2>Ways round it</h2>
<ul><li>Sign young non-EU talents and wait for the caps, or play them abroad first.</li><li>Manage outside Britain – the rule only applies to British clubs.</li><li>Look for players with an EU second nationality.</li></ul>
<p>The rule applies to the original 2001/02 database only; the 2026/27 database follows today's rules. <a href="/cm-01-02-wonderkids/">The wonderkids worth waiting for →</a></p>`,
      faq: [
        ['How do I get a work permit in CM 01/02?', 'A non-EU player joining a British club needs one. In CM Reborn an established international (15+ caps), a big name or a high-class international with 5+ caps gets it; otherwise the move is blocked.'],
        ['Can I loan non-EU players in CM 01/02?', 'Not to a British club – as in the original, British clubs cannot loan players from outside the EU.'],
      ],
    },
    {
      slug: 'cm-01-02-staff-guide/',
      title: 'CM 01/02 Best Staff – Coaches, Scouts, Physios & Staff Attributes | CM Reborn',
      h1: 'CM 01/02 staff: attributes explained and the best coaches, scouts and physios',
      description: 'What the 21 staff attributes do in CM 01/02, which ones matter for coaches, scouts, physios and assistants – and the best staff in the database, including the ones you can hire for free.',
      body: `<p class="lead">Behind every CM 01/02 save is a backroom staff: coaches who develop your players, scouts who find the wonderkids, physios who get the injured back and an assistant who judges your squad. The database gives every one of them 21 staff attributes on the 1–20 scale – the tables below are read straight from the original database (patch 3.9.68).</p>
<h2>The staff attributes and what they are for</h2>
<div class="tw"><table><thead><tr><th>Attribute</th><th>Who needs it</th><th>What it is for</th></tr></thead><tbody>
<tr><td>Coaching</td><td>Coaches, assistant</td><td>General quality of the training they run</td></tr>
<tr><td>Coaching Technique</td><td>Coaches</td><td>Technical training (ball skills)</td></tr>
<tr><td>Coaching Goalkeepers</td><td>Goalkeeping coach</td><td>Training the keepers</td></tr>
<tr><td>Working with Youngsters</td><td>Youth and first-team coaches</td><td>Developing young players</td></tr>
<tr><td>Physiotherapy</td><td>Physio</td><td>Treating injuries</td></tr>
<tr><td>Judging Player Ability</td><td>Scouts, assistant</td><td>How good a player is now</td></tr>
<tr><td>Judging Player Potential</td><td>Scouts, assistant</td><td>How good a player can become</td></tr>
<tr><td>Motivating, Man Management, Discipline</td><td>Managers, assistant, coaches</td><td>Handling players and the dressing room</td></tr>
<tr><td>Tactical Knowledge</td><td>Managers, assistant</td><td>Reading and setting up a match</td></tr>
<tr><td>Attacking, Directness, Free Roles, Marking, Offside Trap, Pressing</td><td>Managers</td><td>The manager's preferred style of play</td></tr>
<tr><td>Business, Interference, Patience, Resources</td><td>Chairmen and directors</td><td>How the board runs the club</td></tr>
</tbody></table></div>
<p>What we know from the original's code: a scout is judged on <b>Judging Player Ability</b> and <b>Judging Player Potential</b> – they decide how accurate his report is (<a href="/cm-01-02-hidden-attributes/">attribute masking</a> lifts as he watches a player). The rest of the table follows the attribute names and the game's own descriptions; the exact training formula of the original has not been read from the code.</p>
<p class="note">Checked in the original (Man Utd's staff, 3.9.60): the attributes are in the database in alphabetical order, and the game shows Coaching as "Coaching Outfield Players". Attributes the database leaves empty are filled in when a new game starts, and a few others are shown slightly differently in the game (Jimmy Ryan's Coaching Goalkeepers 4 appears as 9).</p>
<h2>The best coaches</h2>${staffTable('best-coaches', ['Coaching', 'Technique', 'Motivating', 'Youngsters'])}
<p><a href="/cm-01-02/staff/best-coaches/">Top 50 coaches →</a> · <a href="/cm-01-02/staff/best-youth-coaches/">best youth coaches</a> · <a href="/cm-01-02/staff/best-goalkeeping-coaches/">best goalkeeping coaches</a></p>
<h2>The best scouts</h2>${staffTable('best-scouts', ['Judging Ability', 'Judging Potential', 'Youngsters'])}
<p><a href="/cm-01-02/staff/best-scouts/">Top 50 scouts →</a></p>
<h2>The best physios</h2>${staffTable('best-physios', ['Physiotherapy', 'Motivating', 'Discipline'])}
<p><a href="/cm-01-02/staff/best-physios/">Top 40 physios →</a></p>
<h2>The best assistant managers</h2>${staffTable('best-assistant-managers', ['Coaching', 'Judging Ability', 'Judging Potential', 'Man Management', 'Tactics'])}
<h2>Free at the start: staff without a club</h2>
<p>These have no club on 1 July 2001, so they cost nothing but wages – the quickest way to strengthen a small club's backroom.</p>${staffTable('best-free-staff', ['Coaching', 'Judging Ability', 'Judging Potential', 'Physiotherapy'])}
<p><a href="/cm-01-02/staff/best-free-staff/">All the best free staff →</a> · <a href="/cm-01-02/staff/">every staff list</a> · <a href="/2026-27/staff/">2026/27 staff</a></p>
<h2>Staff in CM Reborn</h2>
<p>CM Reborn keeps the staff side of CM 01/02: coaches by training area (their Coaching drives the weekly development), physios who speed up recoveries, scouts whose judging decides how precise the reports are, and AI managers whose Tactical Knowledge decides how well they adapt during a match. <a href="/cm-01-02-training/">How training works →</a></p>`,
      faq: [
        ['Who is the best coach in CM 01/02?', staffAnswer('best-coaches')],
        ['Who is the best scout in CM 01/02?', staffAnswer('best-scouts')],
        ['Who is the best physio in CM 01/02?', staffAnswer('best-physios')],
        ['What does Judging Player Potential do in CM 01/02?', 'It decides how well a scout or assistant estimates a player\'s potential – a scout with a high rating finds the real wonderkids, one with a low rating misjudges them.'],
      ],
    },
    {
      slug: 'cm-01-02-training/',
      title: 'CM 01/02 Best Training Schedule – How Training Works | CM Reborn',
      h1: 'CM 01/02 training: schedules, coaches and development',
      description: 'How training works in CM 01/02 and CM Reborn: training schedules and what each one improves, coaches by area, workload and injuries, and how young players reach their potential.',
      body: `<p class="lead">Training is where wonderkids become stars. In CM 01/02 you set schedules for groups of players and hire coaches; in CM Reborn it works the same way, with the schedules below.</p>
<h2>The schedules and what they improve</h2>
<div class="tw"><table><thead><tr><th>Schedule</th><th>Main attributes</th><th class="n">Workload</th></tr></thead><tbody>
<tr><td>General</td><td>Passing, technique, stamina, decisions, teamwork</td><td class="n">Normal</td></tr>
<tr><td>Goalkeeping</td><td>Handling, reflexes, one on ones, positioning</td><td class="n">Light</td></tr>
<tr><td>Defending</td><td>Tackling, marking, positioning, heading</td><td class="n">High</td></tr>
<tr><td>Ball control</td><td>Technique, passing, dribbling, creativity</td><td class="n">Light</td></tr>
<tr><td>Attacking</td><td>Dribbling, crossing, off the ball, pace</td><td class="n">High</td></tr>
<tr><td>Shooting</td><td>Finishing, long shots, off the ball, heading</td><td class="n">Normal</td></tr>
<tr><td>Fitness</td><td>Stamina, strength, pace, acceleration, agility</td><td class="n">Very high</td></tr>
<tr><td>Set pieces</td><td>Free kicks, corners, penalties</td><td class="n">Light</td></tr>
<tr><td>Rest</td><td>Recovery</td><td class="n">Very light</td></tr>
</tbody></table></div>
<h2>Coaches</h2>
<p>Coaches are the multiplier: assign them to areas (goalkeeping, defending, attacking, fitness …) and the schedules for that area work better. A good coaching staff matters more than any single schedule.</p>
<h2>Workload and injuries</h2>
<p>Heavy schedules – fitness above all – raise the risk of injuries and tire players before matches. Mix in rest around busy weeks, and remember that Natural Fitness decides how quickly a player recovers.</p>
<h2>Development</h2>
<p>Young players grow fastest before 24, with first-team football, good coaches and high professionalism and determination – up to their PA. As their CA rises, 18 technical and mental attributes rise with it. <a href="/cm-01-02-ca-pa-explained/">How CA and PA work →</a></p>`,
      faq: [
        ['What is the best training schedule in CM 01/02?', 'There is no single best one: general training for most players, the position schedules (defending, attacking, shooting) for specialists, fitness in pre-season – and good coaches assigned to each area.'],
        ['Does training make players reach their potential?', 'Training, coaches and first-team football let young players grow towards their PA, fastest before 24. They can never pass their PA.'],
      ],
    },
    {
      slug: 'cm-01-02-multiplayer/',
      title: 'Multiplayer Football Manager – Play CM 01/02 With Friends Online | CM Reborn',
      h1: 'Multiplayer football manager with friends – CM 01/02 online',
      description: 'Play a football manager with your friends online: CM Reborn lets you run your own clubs in the same CM 01/02 world, plus a fantasy draft league – free, in the browser, no download.',
      body: `<p class="lead">CM 01/02 had hot-seat and network games – several managers in the same save. CM Reborn brings that online, free and in the browser.</p>
<h2>Online games with friends</h2>
<ol><li>Start an online game and pick the database – the original 2001/02 or 2026/27.</li><li>Share the game code with your friends.</li><li>Everyone takes a club in the same world: you play against each other in the league, bid for the same players – and for each other's.</li></ol>
<h2>Fantasy draft league</h2>
<p>A different kind of multiplayer: fictional clubs draft their squads from the best players in the 2026/27 database in a live snake draft, then play seasons and play-offs against each other.</p>
<h2>Global rankings</h2>
<p>Single-player careers count too: the Hall of Fame and the career rankings compare managers from all over the world.</p>
<p><a href="/">Start a game →</a> · <a href="/play-cm-01-02-online/">Play CM 01/02 online</a> · <a href="/free-football-manager-browser-game/">A free football manager in your browser</a></p>`,
      faq: [
        ['Can I play CM 01/02 multiplayer online?', 'Yes. CM Reborn lets several managers run their own clubs in the same world online – share the game code with your friends. It is free and runs in the browser.'],
        ['Is there a free multiplayer football manager?', 'Yes. CM Reborn is free, needs no download and has online games with friends, a fantasy draft league and global rankings.'],
      ],
    },
    {
      slug: 'cm-01-02-regens/',
      title: 'CM 01/02 Regens Explained – How New Young Players Are Created | CM Reborn',
      h1: 'Regens in CM 01/02: how new players are born',
      description: 'How regens work in Championship Manager 01/02, read from the original code: a retired player is reborn as a 16–20-year-old with his potential, positions and most attributes – and how to find them.',
      body: `<p class="lead">"Regens" are the new young players that appear as the years go by in CM 01/02. They are not made up from nothing: the original game recycles retired players. This is how it works, read from the game's own code (player_regen.cpp in cm0102.exe).</p>
<h2>A retired player is reborn</h2>
<ul>
<li>When a player retires and does not stay on as staff, his player card – potential ability (PA), positions and attributes – goes into a queue with his nationality. Players under 30 are reborn at once; older ones within about two months, or early the next year.</li>
<li>The new player gets a new name from the same country. Nations with fewer than 100 players in the database are sometimes swapped for another small nation.</li>
<li><b>He inherits the PA, the positions and most of the attributes</b> of the retired player. So when a world-class striker retires, a future world-class striker appears somewhere in his country.</li>
</ul>
<h2>What is rolled again</h2>
<ul>
<li><b>Age:</b> usually 16–20; very rarely 15 or 21–26.</li>
<li><b>Current ability:</b> a share of the inherited PA – a forward starts at 30–90 % of it, a defender at 25–80 %, a keeper at 25–75 % – capped at 80–110 for the youngest (with a small chance of more).</li>
<li><b>Physical attributes</b> – acceleration, pace, agility, jumping, natural fitness, work rate, stamina and strength – are rolled from scratch, with stamina and strength lower for the youngest.</li>
<li><b>Mental attributes:</b> anticipation and decisions are lowered for teenagers, and big-match temperament and leadership are toned down.</li>
<li><b>Reputation</b> starts low, so regens are cheap – and often unknown to scouts.</li>
</ul>
<h2>The regens to look out for</h2>
<p>Because a regen inherits the potential and the nationality of the player who retired, the oldest stars in the database tell you which regens are coming – and where. These are the highest-potential players aged 33 or older at the start (original database, patch 3.9.68):</p>
${((): string => { const old = db.kept.filter((p) => p.age >= 33 && p.pa >= 150).sort((a, b) => b.pa - a.pa || b.age - a.age).slice(0, 20); return `<div class="tw"><table><thead><tr><th>Player</th><th class="n">Age</th><th>Position</th><th>Nation</th><th class="n">PA</th></tr></thead><tbody>${old.map((p) => `<tr><td>${p.url ? `<a href="${p.url}"><b>${esc(p.name)}</b></a>` : `<b>${esc(p.name)}</b>`}</td><td class="n">${p.age}</td><td>${esc(p.posStr)}</td><td>${esc(db.nationName?.(p.nation) ?? '')}</td><td class="n">${p.pa}</td></tr>`).join('')}</tbody></table></div>`; })()}
<p class="note">When they retire, a teenager from the same country with the same potential appears – usually within a season or two.</p>
<h2>Where to find them</h2>
<p>Younger regens usually go to a youth club or a small club in their country; some start without a club. Scout the countries whose great players have just retired – the potential is passed on. In CM Reborn regens work the same way: they inherit the positions, the attribute profile, the hidden attributes and the potential of the retired player. More on potential in <a href="/cm-01-02-ca-pa-explained/">CA and PA explained</a>, and the current talents in <a href="/cm-01-02-wonderkids/">the wonderkids guide</a>.</p>`,
      faq: [
        ['How do regens work in CM 01/02?', 'A retired player is reborn as a new young player from the same country, usually aged 16–20. He keeps the retired player\'s potential, positions and most attributes; age, current ability, reputation and the physical attributes are rolled again.'],
        ['Do regens keep the potential of the retired player?', 'Yes. The original never changes the potential in the regen code – a retired star becomes a regen with the same PA.'],
        ['How old are regens in CM 01/02?', 'Usually 16 to 20. About 1 in 400 is 21–26, and a very few are 15.'],
      ],
    },
    {
      slug: 'cm-01-02-player-values/',
      title: 'CM 01/02 Player Values – How the Game Calculates a Player\'s Price | CM Reborn',
      h1: 'How CM 01/02 calculates player values',
      description: 'Why Zidane is worth about £18m and a 34-year-old star almost nothing: the CM 01/02 value formula read from the original code, and what really sets a player\'s price.',
      body: `<p class="lead">The value in the database is not what you see in the game. When a new game starts, CM 01/02 calculates every player's value itself and overwrites the database's number. This is how, read from the original's code (contract_manager.cpp).</p>
<h2>The ingredients</h2>
<ul>
<li><b>Position sets the base:</b> forwards start from £13m, attacking midfielders £11m, midfielders £10m, defensive midfielders £9m, keepers £6m and the rest £8m.</li>
<li><b>Peak age:</b> 28 for forwards, 33 for keepers, 29 for everyone else. A player close to his peak is worth the most; an age table cuts the value hard for very young and old players (from 100 % at the peak to 10 % far from it).</li>
<li><b>Ability and reputation:</b> the core of the value grows with the square of an "ability number" built from the player's reputation and the club manager's judgement of him – a world-famous player is worth far more.</li>
<li><b>A few attributes</b> nudge it: flair, finishing, creativity, pace and leadership raise it; injury proneness lowers it.</li>
<li><b>International caps</b> make him count as "older" in the age table.</li>
<li><b>League and club:</b> a factor from the league's and the club's standing – the same player is worth more at a big club in a big league.</li>
<li><b>A release clause</b> caps the value.</li>
</ul>
<h2>What it means in practice</h2>
<ul>
<li>Stars at big clubs in their late twenties are the most expensive – Zidane is about £18m, Beckham about £18–19m at the start.</li>
<li>Teenagers with huge potential are cheap, because the age table cuts their value – which is why wonderkids are the best buys in the game.</li>
<li>Players over 32 lose value fast, whatever their ability.</li>
</ul>
<h2>How CM Reborn does it</h2>
<p>CM Reborn's values for the original database were fitted to the values the original shows for 3,134 players in its own player search (read on screen), using ability, age, club reputation, wage, the player's reputation and the league. The typical difference from the original is about a factor of 1.7, mostly individual noise the formula cannot see. Every player's value is on his profile in the <a href="/cm-01-02/">CM 01/02 database</a>; the cheapest good players are in <a href="/cm-01-02/lists/bargains/">the bargains list</a>.</p>`,
      faq: [
        ['How is player value calculated in CM 01/02?', 'From the player\'s position (a base of £6m–£13m), his age against a peak age (28 for forwards, 33 for keepers, 29 for others), his reputation and ability, a few attributes, his caps and the strength of his club and league.'],
        ['Why are wonderkids so cheap in CM 01/02?', 'The value formula cuts the price of very young players hard (an age table from 10 % to 100 %), so a 17-year-old with world-class potential costs a fraction of a star.'],
        ['Is the value in the CM 01/02 database used?', 'No. The game recalculates every player\'s value when a new game starts and overwrites the database\'s number.'],
      ],
    },
    {
      slug: 'cm-01-02-match-engine/',
      title: 'How the CM 01/02 Match Engine Works – Read From the Original Code | CM Reborn',
      h1: 'How the Championship Manager 01/02 match engine works',
      description: 'Inside the CM 01/02 match engine: 11 ticks a minute on a 9 × 12 grid, how the player on the ball chooses, how goals, cards, fatigue, injuries, ratings and substitutions are decided – read from cm0102.exe.',
      body: `<p class="lead">Championship Manager 01/02 never showed its match engine – just the commentary bar. Fans have since taken the original program apart, and this is what is inside, with the numbers from the code. (Sources: the reverse-engineering behind <a href="/">CM Reborn</a>; addresses refer to cm0102.exe.)</p>
<h2>A match is 990 ticks on a 9 × 12 grid</h2>
<p>The engine runs <b>11 ticks per minute</b> – 495 a half – and moves the 22 players over a pitch of 9 columns by 12 rows. Each tick the players get fresh "rolls" for decisions, creativity, flair and positioning, and the player on the ball decides what to do. Stoppage time builds up at every dead ball: rand(10) ticks go on the clock and up to 80 % of that is added at the end of the half.</p>
<h2>The player on the ball: pass, run, hold or shoot</h2>
<p>Every time a player has the ball, the game scores four options and picks the highest:</p>
<ul>
<li><b>Shoot</b> – close to goal 100 × Finishing + 3000 (headers 75 × Heading + 2500); further out only if the distance is within his flair-based range.</li>
<li><b>Pass</b> – the best pass option's weight × (pressure + defenders in the way + 4) / 5 – the more he is pressed, the more he wants to release it.</li>
<li><b>Run</b> – space in front of him, dribbling, an open run at goal, instructions like Run With Ball.</li>
<li><b>Hold</b> – shield the ball and wait for support (or waste time in the corner late on).</li>
</ul>
<p>Then each score gets random noise of up to <b>50 × (20 − decisions roll)</b>. That one line is why Decisions matters so much: a player with poor decisions picks almost at random, a top player picks the right option. The score line counts too – a side 3+ goals up shoots less and passes twice as willingly, a side chasing the game shoots more. <a href="/cm-01-02-attributes-explained/">What every attribute does →</a></p>
<h2>Goals</h2>
<p>A shot is on target when its shot score passes 240 (120 for penalties), and it is a goal when 100 × S / (S + K) is above 71 – the shooter's score against the keeper's. Across a full Premier League season the original averages <b>2.87 goals</b>, <b>17.2 shots</b> (10.3 on target), <b>5.0 corners</b> and <b>7.4 offsides</b> a match, with home / draw / away at 51 / 23 / 26 %.</p>
<h2>Referees and cards</h2>
<p>Every referee has a Discipline rating. It sets how readily he blows for a foul: a factor of Discipline × 0.1 above 10, and 1 + (Discipline − 10) × 0.05 below. Strict referees also add to the severity of each card decision (Discipline 20: +2, 18–19: +1, 10–17: 0, 5–9: −1, 3–4: −2, 2 or less: −3), and a team that keeps fouling goes over the referee's limit and gets carded sooner. A professional foul is a red card 87.5 % of the time. The season average: <b>1.70 yellow</b> and <b>0.14 red</b> cards a match.</p>
<h2>Fatigue and recovery</h2>
<p>Condition falls with every action and with how hard the player is running, scaled by Stamina and age: the age term peaks between 24 and 29 and drops after 30 and again after 34. At half-time a player gets back (Natural Fitness + 15) × 0.1 % of his condition. After 60 minutes the commentary calls the first player under 67.5 % "knackered".</p>
<h2>Knocks and injuries</h2>
<p>The risk of a knock is checked with every movement step and every challenge, scaled by Injury Proneness. The severity is rand(rand(102)) (re-rolled smaller two times in three when over 50); over 50 is an injury, and a player with too little condition left comes off.</p>
<h2>Ratings</h2>
<p>Every player starts on <b>6.1</b> (substitutes on 6.4). A goal is worth +0.65 (penalty +0.7), an assist +0.275, a good save +0.35 and a great save +0.6; a foul without a card −0.025, a yellow −0.225 and a straight red −1.0. The shown rating is rounded at full time.</p>
<h2>Substitutions by the computer</h2>
<p>The AI considers a change when the minute passes 10 + rand(50) and at least five minutes after its last one. It takes off the lowest by rating and condition – when his rating is under 6 after half-time, or his condition under 67.5 % after an hour.</p>
<h2>How CM Reborn uses this</h2>
<p>CM Reborn's own engine plays a match as a chain of passages over pitch zones and is calibrated against a full season played in the original CM 01/02. The rules above that it already uses: the referees and their Discipline, the card rules, stoppage time, fatigue by stamina and age, half-time recovery, knocks and the computer's substitutions. The rest of the ball-carrier rule is the next step.</p>`,
      faq: [
        ['How does the CM 01/02 match engine work?', 'It runs 11 ticks a minute with the 22 players on a 9 × 12 grid. Each time a player has the ball it scores four options – pass, run, hold and shoot – adds random noise that shrinks with his Decisions, and takes the highest.'],
        ['How many goals per game in CM 01/02?', 'About 2.87 a match in a Premier League season, with 17.2 shots (10.3 on target), 5 corners and 1.7 yellow cards.'],
        ['What rating does a player start on in CM 01/02?', '6.1 for starters and 6.4 for substitutes; a goal adds 0.65 and a yellow card costs 0.225.'],
        ['Do referees matter in CM 01/02?', 'Yes. Each referee has a Discipline rating that changes how many fouls are given and how quickly cards come out.'],
      ],
    },
    {
      slug: 'cm-01-02-attributes-explained/',
      title: 'CM 01/02 Attributes Explained – What Every Attribute Really Does | CM Reborn',
      h1: 'CM 01/02 attributes explained: what each one does in the match',
      description: 'What finishing, flair, decisions, teamwork, pace, stamina and the other CM 01/02 attributes actually do in the match engine – read from the original game\'s code – with the best players in each.',
      body: `<p class="lead">Championship Manager 01/02 shows 1–20 for every attribute, but they are not equal. Some feed directly into the player's choices on the ball, some only matter when he gets tired, and some do almost nothing for certain positions. This guide is based on the original game's own code (the ball-carrier decision, fatigue and discipline routines), with the best players in each attribute from the <a href="/cm-01-02/">CM 01/02 database</a> (3.9.68).</p>
<p class="note">"From the code" = read in cm0102.exe. Everything else is general CM 01/02 knowledge or how CM Reborn models it.</p>
<h2>Attacking</h2>
<ul>
<li><b>Finishing</b> – the heart of a close-range chance. From the code: a shot from close in scores 100 × Finishing + 3000 against passing, running or holding the ball, so a 20-finisher shoots almost every time he is near goal, while a 10 often looks for a pass. Best: ${tops(K, 'finishing')}.</li>
<li><b>Heading</b> – with the ball at head height the header scores 75 × Heading + 2500, but only very close to goal; further out it is heavily punished, so headers from distance are rare. Best: ${tops(K, 'heading')}.</li>
<li><b>Dribbling</b> – decides whether a player runs at defenders. From the code: one on one with the keeper, the choice to go round him is a duel of rand(10 × Dribbling) against rand(10 × Finishing), and a player who ignores instructions gets a run bonus of Dribbling³. Best: ${tops(K, 'dribbling')}.</li>
<li><b>Long Shots</b> – only counts from 2 to 4.5 "cells" out (roughly the edge of the box to 30 yards) and mostly when the player has the Long Shots instruction or does his own thing. Best: ${tops(K, 'longShots')}.</li>
<li><b>Flair</b> – the unpredictability attribute. From the code: it sets how far out a player will even consider shooting (3 + rand(3) + flair roll / 7 cells), gives tricks and snap shots (a chance of flair⁴ against 10000 × distance) and is the only way a wide player shoots from the flank. Best: ${tops(K, 'flair')}.</li>
<li><b>Free Kicks</b> – a direct free kick is taken when (rand(Free Kicks + 20) + flair roll) / 3 is greater than the distance to goal and the kick is central – so great free-kick takers shoot from further out. Best: ${tops(K, 'freeKicks')}.</li>
<li><b>Crossing, Passing, Technique</b> – drive the quality of the ball once the choice is made. Best passers: ${tops(K, 'passing')}. Best crossers: ${tops(K, 'crossing')}.</li>
</ul>
<h2>Mental – how a player thinks</h2>
<ul>
<li><b>Decisions</b> – the most underrated attribute. From the code: every option (pass, run, hold, shoot) gets random noise of up to 50 × (20 − decisions roll), where the roll is the better of two rand(Decisions + 2). A 20 makes the right choice almost every time; a 6 is a coin toss. Best: ${tops(K, 'decisions')}.</li>
<li><b>Creativity</b> – a roll of up to 0.8 × Creativity + 5, used when he sees the keeper off his line or a gap others miss. Best: ${tops(K, 'creativity')}.</li>
<li><b>Teamwork</b> – from the code: with a chance of 1 in Teamwork a player ignores your instructions and does his own thing (a dribble, a long shot). A 20 almost never does; a 5 does it every fifth time. Best: ${tops(K, 'teamwork')}.</li>
<li><b>Anticipation, Positioning, Off the Ball</b> – where a player is before the ball arrives; positioning also gives a roll of its own. Best positioning: ${tops(K, 'positioning')}.</li>
<li><b>Aggression and Bravery</b> – more challenges and more headers in traffic – and, with Dirtiness, more fouls.</li>
<li><b>Influence</b> (leadership) – a captain's attribute; it also raises the player's value.</li>
</ul>
<h2>Physical</h2>
<ul>
<li><b>Pace and Acceleration</b> – from the code: in the match, pace and acceleration count for 2/3 of their value against 1/2 for the other physical attributes, which is why fast forwards are so dangerous. Fastest: ${tops(K, 'pace')}.</li>
<li><b>Stamina</b> – how fast condition drops. From the code: fatigue depends on 0.65 × Stamina plus an age term (it peaks between 24 and 29 and falls after 30), and on how hard he is running. Best: ${tops(K, 'stamina')}.</li>
<li><b>Natural Fitness</b> – recovery: at half-time a player gets (Natural Fitness + 15) × 0.1 % of his condition back, and he recovers faster between matches. Best: ${tops(K, 'naturalFitness')}.</li>
<li><b>Strength, Jumping, Balance, Agility</b> – duels, headers and staying on your feet. Best in the air (jumping): ${tops(K, 'jumping')}.</li>
</ul>
<h2>Goalkeeping</h2>
<ul><li><b>Handling, Reflexes, One on Ones</b> – the saves; one on ones decides the duel against a forward through on goal. Best reflexes: ${tops(K, 'reflexes', true)}.</li></ul>
<h2>Hidden attributes</h2>
<p><b>Injury Proneness</b> scales the risk of a knock with every movement and challenge, <b>Sportsmanship</b> decides whether a player wastes time in the corner when protecting a late lead (rand(Sportsmanship) < rand(10)), and <b>Consistency</b>, <b>Important Matches</b> and <b>Dirtiness</b> do what the names say. More in <a href="/cm-01-02-hidden-attributes/">the hidden attributes guide</a>.</p>
<h2>Attributes and CA</h2>
<p>18 of the attributes – including finishing, passing, tackling, decisions and creativity – move with the player's current ability: about +1 for every 10 CA he gains. So a 17-year-old's numbers grow on their own as he develops. <a href="/cm-01-02-ca-pa-explained/">How CA, PA and the attributes fit together →</a></p>`,
      faq: [
        ['What is the most important attribute in CM 01/02?', 'For attackers, finishing and decisions: finishing decides how often a player shoots and scores from close range, and decisions removes the randomness from every choice he makes. For every outfield player, pace and acceleration count extra in the match.'],
        ['What does flair do in CM 01/02?', 'It makes a player try the unexpected: shots from further out, tricks and snap shots, and shots from wide positions that other players would never take.'],
        ['What does teamwork do in CM 01/02?', 'With a chance of 1 in his Teamwork value a player ignores your individual instructions and does his own thing. High teamwork means your tactics are followed.'],
        ['What does natural fitness do in CM 01/02?', 'It sets how quickly a player recovers – at half-time he gets back (Natural Fitness + 15) × 0.1 % of his condition – and how fast he is ready again between matches.'],
      ],
    },
    {
      slug: 'cm-01-02-database-versions/',
      title: 'CM 01/02 3.9.60 vs 3.9.65 vs 3.9.68 – Database Versions Compared | CM Reborn',
      h1: 'CM 01/02 database versions: 3.9.60, 3.9.65 and 3.9.68',
      description: `What changed between the three official Championship Manager 01/02 databases: ${ver.movedCount.toLocaleString('en')} players at a new club in 3.9.68 (Ferdinand, Anelka, Forlán …), the autumn 2001 moves in 3.9.65, and which one the game itself uses.`,
      body: `<p class="lead">Championship Manager 01/02 had three official databases. They all start the game in July 2001, but the squads are not the same – and the one most fans remember is not the one the game was released with. CM Reborn lets you choose any of them when you start a new game.</p>
<div class="tw"><table><thead><tr><th>Version</th><th>Squads from</th><th class="n">Players*</th><th class="n">Clubs*</th><th class="n">Playable leagues*</th></tr></thead><tbody>${ver.stats.map((x) => `<tr><td><b>${x.v}</b></td><td>${x.v === '3.9.60' ? 'Summer 2001 (the release, October 2001)' : x.v === '3.9.65' ? 'Autumn 2001 (official patch)' : 'Summer 2002 (final patch, 02/03 data)'}</td><td class="n">${x.players.toLocaleString('en')}</td><td class="n">${x.clubs.toLocaleString('en')}</td><td class="n">${x.leagues}</td></tr>`).join('')}</tbody></table></div>
<p class="note">* In CM Reborn: players aged 40 or under at clubs in the playable leagues, plus the notable players and cult heroes at other clubs.</p>
<h2>3.9.60 – the release</h2>
<p>The database CM 01/02 shipped with and still uses for the 2001/02 season: Rio Ferdinand at Leeds, Michael Owen on £30,000 a week, Juan Sebastián Verón just signed by Manchester United. If you want the game exactly as it was in October 2001, this is the one – and it is CM Reborn's default.</p>
<h2>3.9.65 – the patch</h2>
<p>The official 3.9.65 patch fixed bugs in the game (free kicks hitting the wall less often, harsher interest when deep in debt, fewer bankrupt non-league clubs rescued) and refreshed the data with the transfers of the autumn of 2001. The biggest moves compared with 3.9.60:</p>
${moveTable(ver.early, ver, false)}
<h2>3.9.68 – the final patch</h2>
<p>3.9.67 updated every squad to the 2002/03 season – without moving the start date – and 3.9.68 fixed a few last bugs. So you start in July 2001 with the squads of a year later. ${ver.movedCount.toLocaleString('en')} players are at a different club than in 3.9.60. The biggest names:</p>
${moveTable(ver.late, ver, true)}
<p>And these players are in 3.9.68 but not in 3.9.60 – mostly the young players who broke through in 2002:</p>
<div class="tw"><table><thead><tr><th>#</th><th>Player</th><th>Club in 3.9.68</th><th class="n">CA</th></tr></thead><tbody>${ver.added.map((p, i) => { const u = ver.url(p.name, p.club); return `<tr><td>${i + 1}</td><td>${u ? `<a href="${u}"><b>${esc(p.name)}</b></a>` : `<b>${esc(p.name)}</b>`}</td><td>${esc(p.club)}</td><td class="n">${p.ca}</td></tr>`; }).join('')}</tbody></table></div>
<h2>Which one should you play?</h2>
<ul><li><b>3.9.60</b> for the authentic 2001/02 season – the squads, wages and finances the game was built around.</li>
<li><b>3.9.68</b> for the squads most people remember from years of playing, with Ferdinand at Old Trafford.</li>
<li><b>3.9.65</b> if you want the release squads with the first round of corrections.</li></ul>
<p>The legends – Tsigalko at Dinamo Minsk, Cherno Samba at Millwall, To Madeira – are in every version. Browse every player in the <a href="/cm-01-02/">CM 01/02 database</a> (3.9.68), and see <a href="/cm-01-02-ca-pa-explained/">how CA, PA and the attributes work</a>.</p>`,
      faq: [
        ['What is the difference between CM 01/02 3.9.60 and 3.9.68?', `3.9.60 is the original release with the summer 2001 squads. 3.9.68 is the final patch with the 2002/03 squads (${ver.movedCount.toLocaleString('en')} players at a new club) but the same July 2001 start date.`],
        ['Which database does CM 01/02 use?', 'The game itself uses the 3.9.60 data for the 2001/02 season; the 3.9.68 patch replaces it with 2002/03 squads. CM Reborn lets you choose 3.9.60, 3.9.65 or 3.9.68.'],
        ['Is Rio Ferdinand at Leeds or Man Utd in CM 01/02?', 'At Leeds in 3.9.60 and 3.9.65, at Manchester United in 3.9.68.'],
      ],
    },
    {
      slug: 'cm-01-02-download/',
      title: 'CM 01/02 Download (Free) – or Play It Without Installing | CM Reborn',
      h1: 'Championship Manager 01/02 download: is it free, and do you need it?',
      description: 'Championship Manager 01/02 has been free to download since Eidos released it as freeware in 2008. Here is where the official download and patch 3.9.68 live, how to run it on Windows, Mac and Linux – and how to play it in a browser with no download at all.',
      body: `<p class="lead">Yes – CM 01/02 is free. In December 2008 Eidos released Championship Manager 01/02 as freeware, and the fan community has kept it alive ever since. But if you just want to play, you no longer need to download anything.</p>
<h2>Option 1: play in your browser (no download)</h2>
<p><a href="/">CM Reborn</a> is a free fan remake of CM 01/02 that runs in any browser. It ships with the original 2001/02 database in all three official versions (3.9.60, 3.9.65 and 3.9.68), the classic blue CM screens and a match engine calibrated against the original – and it works on Mac, iPad, Chromebook and phones, where the original never ran.</p>
<h2>Option 2: download the original</h2>
<ul>
<li><b>Where:</b> the community site <a href="https://champman0102.net" rel="nofollow noopener">champman0102.net</a> hosts the free download, the official 3.9.68 patch and unofficial data updates.</li>
<li><b>Windows 10/11:</b> it still runs, usually with compatibility settings or a no-CD fix from the community.</li>
<li><b>Mac and Linux:</b> only through Wine, CrossOver or a virtual machine.</li>
<li><b>iPad, Android, Chromebook:</b> not really – use a browser version instead.</li>
</ul>
<h2>Which database version: 3.9.60, 3.9.65 or 3.9.68?</h2>
<p>CM 01/02 had three official databases, and CM Reborn lets you pick any of them when you start a new game:</p>
<ul>
<li><b>3.9.60</b> – the original release (October 2001) and the one CM 01/02 itself uses for the 2001/02 season: squads from summer 2001, Rio Ferdinand still at Leeds, Owen on £30,000 a week.</li>
<li><b>3.9.65</b> – the official patch with the same 2001/02 squads and the data corrections from the update (it already has the autumn 2001 moves, such as Robbie Fowler at Leeds).</li>
<li><b>3.9.68</b> – the final patch: squads and transfers from 2002/03 (Ferdinand at Man Utd, Anelka at Man City), but the game still starts in July 2001. Tsigalko at Dinamo Minsk and Cherno Samba at Millwall are in every version.</li>
</ul>
<p>The <a href="/cm-01-02/">CM 01/02 database pages</a> show the 3.9.68 data – every player's attributes are on a profile page.</p>
<h2>Original vs. CM Reborn</h2>
<div class="tw"><table><thead><tr><th></th><th>CM 01/02 (original)</th><th>CM Reborn</th></tr></thead><tbody>
<tr><td>Price</td><td>Free (freeware since 2008)</td><td>Free, no ads</td></tr>
<tr><td>Install</td><td>Download, patch, compatibility fixes</td><td>None – open the website</td></tr>
<tr><td>Devices</td><td>Windows (Mac/Linux via Wine)</td><td>Any browser: PC, Mac, iPad, Android, iPhone, Chromebook</td></tr>
<tr><td>Database</td><td>2001/02 (+ fan updates)</td><td>Original 2001/02 and a 2026/27 database</td></tr>
<tr><td>Multiplayer</td><td>Hotseat / network</td><td>Online with friends, rankings, fantasy draft</td></tr>
</tbody></table></div>`,
      faq: [
        ['Is CM 01/02 free to download?', 'Yes. Eidos made Championship Manager 01/02 freeware in 2008. The community site champman0102.net hosts the download and patch 3.9.68.'],
        ['What is the difference between CM 01/02 3.9.60 and 3.9.68?', '3.9.60 is the original release with the summer 2001 squads, the one the game uses for 2001/02. 3.9.68 is the final patch with 2002/03 squads and transfers but the same July 2001 start date. CM Reborn has both, plus 3.9.65.'],
        ['Can I play CM 01/02 without downloading it?', 'Yes. CM Reborn is a free CM 01/02 remake that runs in the browser at cm0102reborn.com, with the original 2001/02 database.'],
        ['Does CM 01/02 work on Windows 11?', 'Usually yes, with compatibility settings and the community fixes. If it gives you trouble, the browser remake avoids the problem entirely.'],
      ],
    },
    {
      slug: 'cm-01-02-bosman-guide/',
      title: 'CM 01/02 Bosman Guide – Free Transfers, Pre-Contracts & the Best Targets | CM Reborn',
      h1: 'CM 01/02 Bosman guide: how free transfers work, and who to sign',
      description: `How Bosman free transfers work in Championship Manager 01/02: contracts, pre-contracts from January, wages and signing-on fees – plus the ${Math.min(25, bosman.length)} best players out of contract in summer ${yr}.`,
      body: `<p class="lead">The Bosman ruling is the cheapest way to build a squad in CM 01/02: when a player's contract runs out he can leave for nothing, and you only pay wages and a signing-on fee.</p>
<h2>How it works</h2>
<ol>
<li><b>Check the contract.</b> Every player's contract end date is on his profile. In the original database many contracts end on 30 June ${yr}.</li>
<li><b>From January:</b> players at clubs in another country, with six months or less left, can agree a pre-contract with you. The move happens when the season ends.</li>
<li><b>Out of contract:</b> once the contract has run out, any club can sign him as a free agent.</li>
<li><b>Pay for it in wages.</b> Free players ask for more money and a signing-on fee – and the best ones still choose the club with the biggest reputation.</li>
</ol>
<h2>Why world-class players won't join every club</h2>
<p>A player compares your club's reputation with his own. Ambitious players will not drop down to a much smaller club, even for free – older players (30+) are more willing to take a step down. That is how CM Reborn handles it too.</p>
<h2>Bosman targets in the 3.9.60 database</h2>
<p>CM Reborn's default database is 3.9.60 – the release the game itself uses for 2001/02 – and its contracts differ from the 3.9.68 patch below. These are the best players there whose contracts end on 30 June ${yr}:</p>
<div class="tw"><table><thead><tr><th>#</th><th>Player</th><th>Age</th><th>Club in 3.9.60</th><th class="n">CA</th></tr></thead><tbody>${ver.bosman60.map((p, i) => { const u = ver.url(p.name, p.club); return `<tr><td>${i + 1}</td><td>${u ? `<a href="${u}"><b>${esc(p.name)}</b></a>` : `<b>${esc(p.name)}</b>`}</td><td>${p.age}</td><td>${esc(p.club)}</td><td class="n">${p.ca}</td></tr>`; }).join('')}</tbody></table></div>
<h2>The best Bosman targets in ${yr} (3.9.68)</h2>
${ptable(bosman.slice(0, 25), ['Contract', (p) => p.contract.slice(0, 7)])}
<p><a href="/cm-01-02/lists/free-transfers-${yr}/">See all 100 players out of contract in ${yr} →</a> · <a href="/cm-01-02/lists/free-transfers-${yr + 1}/">${yr + 1} →</a> · <a href="/cm-01-02/lists/free-agents/">free agents at the start →</a></p>`,
      faq: [
        [`Who are the best free transfers in CM 01/02?`, `The best players out of contract in summer ${yr} include ${bosman.slice(0, 5).map((p) => `${p.name} (${p.clubName})`).join(', ')}.`],
        ['When can I sign a player on a Bosman in CM 01/02?', 'From January you can agree a pre-contract with players at foreign clubs who have six months or less left on their contract; players out of contract can be signed at any time.'],
      ],
    },
    {
      slug: 'cm-01-02-hidden-attributes/',
      title: 'CM 01/02 Hidden Attributes Explained – Consistency, Important Matches & More | CM Reborn',
      h1: 'CM 01/02 hidden attributes explained',
      description: 'What the hidden attributes in Championship Manager 01/02 do – consistency, important matches, injury proneness, dirtiness, versatility, adaptability, ambition, loyalty, pressure, professionalism, sportsmanship and temperament – with the stars who have the best and worst.',
      body: `<p class="lead">CM 01/02 never shows these numbers in the game, but they shape every player. All of them are on the 1–20 scale and stored in the database – CM Reborn shows them on every <a href="/cm-01-02/">player profile</a>.</p>
<h2>What each one does</h2>
<dl class="kv">
<div><dt>Consistency</dt><dd>How often he plays to his ability</dd></div>
<div><dt>Important Matches</dt><dd>Lifts or drops him in finals and derbies</dd></div>
<div><dt>Injury Proneness</dt><dd>High = injured more often</dd></div>
<div><dt>Dirtiness</dt><dd>Fouls and cards</dd></div>
<div><dt>Versatility</dt><dd>How well he copes out of position</dd></div>
<div><dt>Adaptability</dt><dd>How fast he settles abroad</dd></div>
<div><dt>Ambition</dt><dd>Wants a bigger club – won't step down</dd></div>
<div><dt>Loyalty</dt><dd>Stays happy and stays put</dd></div>
<div><dt>Pressure</dt><dd>Copes with expectation</dd></div>
<div><dt>Professionalism</dt><dd>Trains well, develops, behaves</dd></div>
<div><dt>Sportsmanship</dt><dd>Fair play</dd></div>
<div><dt>Temperament</dt><dd>Low = loses his head, red cards</dd></div>
</dl>
<h2>Inconsistent stars (CA 150+, consistency 9 or less)</h2>${ptable(flaky, ['Consistency', (p) => String(v(p, 'consistency'))])}
<h2>Injury-prone stars (injury proneness 14+)</h2>${ptable(glass, ['Injury prone', (p) => String(v(p, 'injuryProneness'))])}
<h2>Big-game players (important matches 18+)</h2>${ptable(bigGame, ['Imp. matches', (p) => String(v(p, 'importantMatches'))])}
${hot.length ? `<h2>Short fuses (temperament 6 or less)</h2>${ptable(hot, ['Temperament', (p) => String(v(p, 'temperament'))])}` : ''}
${loyal.length ? `<h2>One-club men (loyalty 18+)</h2>${ptable(loyal, ['Loyalty', (p) => String(v(p, 'loyalty'))])}` : ''}
<p>More: <a href="/cm-01-02/lists/most-consistent-players/">most consistent players</a> · <a href="/cm-01-02/lists/big-game-players/">big-game players</a> · <a href="/cm-01-02/lists/most-versatile-players/">most versatile</a></p>`,
      faq: [
        ['Can you see hidden attributes in CM 01/02?', 'Not in the game itself – you need an editor or a database viewer. CM Reborn shows them on every player page of its CM 01/02 database.'],
        ['What does consistency do in CM 01/02?', 'It decides how often a player performs at his real level. A low-consistency star can be brilliant one week and invisible the next.'],
      ],
    },
    {
      slug: 'cm-01-02-ca-pa-explained/',
      title: 'CM 01/02 CA and PA Explained – Current & Potential Ability, -1 and -2 | CM Reborn',
      h1: 'CA and PA in CM 01/02: current and potential ability explained',
      description: `What CA (current ability) and PA (potential ability) mean in Championship Manager 01/02, how they connect to the 1–20 attributes, and what a PA of -1 or -2 does (${neg2} players with -2 and ${neg1} with -1 among the profiles).`,
      body: `<p class="lead">Every player in CM 01/02 has two hidden numbers from 1 to 200: <b>CA</b>, how good he is now, and <b>PA</b>, the highest CA he can ever reach.</p>
<h2>CA – current ability</h2>
<p>CA is a budget. The game spreads it over the player's attributes depending on his position – a striker's CA goes into finishing and off the ball, a centre-back's into tackling and heading. A world-class player has a CA of 170–190.</p>
<h2>How CA moves the attributes</h2>
<p>The database stores every attribute as 1–20, but 18 of them – anticipation, crossing, decisions, dribbling, finishing, handling, heading, long shots, marking, off the ball, one on ones, passing, penalties, positioning, reflexes, tackling, throw-ins and creativity – are turned into an "intrinsic" value when a new game starts: <b>intrinsic = (10 × stored value − CA) / 2</b>. The screen then shows them through a curve, so at kick-off they look like this:</p>
<div class="tw"><table><thead><tr><th>Stored</th><th class="n">1</th><th class="n">3</th><th class="n">5</th><th class="n">8</th><th class="n">10</th><th class="n">12</th><th class="n">15</th><th class="n">18</th><th class="n">20</th></tr></thead><tbody><tr><td>Shown</td><td class="n">7</td><td class="n">8</td><td class="n">9</td><td class="n">11</td><td class="n">13</td><td class="n">14</td><td class="n">16</td><td class="n">18</td><td class="n">20</td></tr></tbody></table></div>
<p>After that the intrinsic value stays put and the shown number follows CA: roughly <b>+1 for every 10 CA</b> the player gains (a stored 12 shows 14 at CA 120, 15 at CA 140 and 17 at CA 160). That is why a youngster's technique "grows" as he develops, and why a veteran's slips when his CA falls. Attributes the database leaves at 0 are copied from the most similar of 250 random players when the game starts. (Read from the original game's code and checked against Beckham in CM 01/02 3.9.60.)</p>
<h2>PA – potential ability</h2>
<p>PA is the ceiling. A 17-year-old with CA 90 and PA 180 can become a superstar – if he plays, trains and stays fit. In the profiles, only ${pa180} players have a fixed PA of 180 or more, and ${pa190} have 190+.</p>
<h2>PA -1 and -2: random potential</h2>
<p>Some players have no fixed PA. The database stores a negative code and the game rolls a PA at the start of every new save. The exact rules from the original game's code:</p>
<ul><li><b>-2</b> (${neg2} players): 9 times in 10 a PA of 120–200, otherwise 160–200; then 1 time in 20 it drops by up to 49, and anything above 165 is otherwise trimmed by up to 29. On average <b>153</b>; half of all rolls land between 140 and 167, 1 in 10 reaches 180+ and about 1 in 35 reaches 190+.</li>
<li><b>-1</b> (${neg1} players): 9 times in 10 a PA of 80–160, otherwise 120–200, with the same 1-in-20 drop and trimming above 140. On average <b>118</b>, and only 1 in 50 reaches 170.</li></ul>
<h2>Even fixed PAs can change</h2>
<p>Every new game, every player has a small chance of a new potential: 1 in 2000 is treated as -2, 1 in 750 as -1 and 1 in 100 gets a fresh roll from the game's PA table – and 1 in 25 players under 25 is re-rolled as well. So roughly 1 % of all players, and 5 % of the young ones, are not the player the database describes. A PA is never set below the player's CA, and a CA above the PA is cut to PA minus up to 39.</p>
<p>That is why Cherno Samba could win the Ballon d'Or in one save and play in the Conference in the next. <a href="/cm-01-02/lists/random-potential/">See every random-potential player →</a></p>
<h2>How players reach their PA</h2>
<ul><li>Age: most growth happens before 24.</li><li>Playing time: first-team football beats the reserves.</li><li>Training and coaches, and the player's professionalism and determination.</li><li>Injuries cost development.</li></ul>`,
      faq: [
        ['What is a good PA in CM 01/02?', '150+ is an international, 170+ world class and 190+ one of the best in the world. A random -2 averages 153, and 1 in 10 rolls reach 180+.'],
        ['What does PA -2 mean?', 'The player has a random potential, rolled at the start of each new game: usually 120–200 (average 153), occasionally lower. PA -1 is usually 80–160 (average 118).'],
        ['Do attributes change with CA in CM 01/02?', 'Yes. 18 technical and mental attributes are stored relative to CA, so they rise by about 1 for every 10 CA a player gains and fall when his CA drops.'],
      ],
    },
    {
      slug: 'cm-01-02-best-teams-to-manage/',
      title: 'Best Teams to Manage in CM 01/02 – Richest, Strongest & Sleeping Giants | CM Reborn',
      h1: 'The best teams to manage in CM 01/02',
      description: 'Which club should you pick in Championship Manager 01/02? The richest clubs, the strongest squads, the best youth set-ups, sleeping giants in the lower leagues and the hardest challenges – from the original 3.9.68 database.',
      body: `<p class="lead">From an easy title with Real Madrid to dragging a fourth-tier side to Europe – here is how the clubs in the original 2001/02 database compare.</p>
<h2>Strongest squads (average CA of the best 16 players)</h2>${ctable(strongest, [['Strength', (c) => c.strength.toFixed(1)], ['Best player', (c) => esc(c.best)]])}
<h2>Richest clubs (bank balance at the start)</h2>${ctable(richest, [['Balance', (c) => pounds(c.balance)], ['Rep', (c) => String(c.rep)]])}
<h2>Best for wonderkids (most young players with high potential)</h2>${ctable(youth, [['Wonderkids', (c) => String(c.kids)], ['Strength', (c) => c.strength.toFixed(1)]])}
<h2>Sleeping giants (big stadiums outside the top flight)</h2>${ctable(giants, [['Capacity', (c) => c.cap.toLocaleString('en')], ['Strength', (c) => c.strength.toFixed(1)]])}
<h2>The hardest challenges</h2>${ctable(lowest, [['Strength', (c) => c.strength.toFixed(1)]])}
<p>Browse every league in the <a href="/cm-01-02/">CM 01/02 database</a>.</p>`,
      faq: [
        ['What is the best team in CM 01/02?', `By squad strength: ${strongest.slice(0, 3).map((c) => c.name).join(', ')}.`],
        ['Which club has the most money in CM 01/02?', `${richest[0].name} (${pounds(richest[0].balance)}), then ${richest[1].name} and ${richest[2].name}.`],
      ],
    },
    {
      slug: 'cm-01-02-tips/',
      title: 'CM 01/02 Tips & Tricks – A Beginner\'s Guide to Championship Manager 01/02 | CM Reborn',
      h1: 'CM 01/02 tips: how to win with any club',
      description: 'Practical Championship Manager 01/02 tips: picking a club, setting up tactics, finding wonderkids and Bosmans, managing money and keeping the board happy.',
      body: `<p class="lead">Twenty years on, the basics of CM 01/02 still win titles. Here is what matters most.</p>
<h2>1. Pick the right club</h2><p>A strong squad with a weak board expectation is the easy start; a big club in the second tier is the classic challenge. See <a href="/cm-01-02-best-teams-to-manage/">the best teams to manage</a>.</p>
<h2>2. Fix the tactics before the first match</h2><ul><li>Play a shape your best eleven fit: a player out of position loses a lot.</li><li>Give your playmaker the ball, your target man the crosses and your wingers the width.</li><li>Use runs (the arrows) for one or two players, not all of them.</li></ul><p>More in the <a href="/cm-01-02-tactics/">CM 01/02 tactics guide</a>.</p>
<h2>3. Sign young and free</h2><p>The best value is in <a href="/cm-01-02/lists/wonderkids/">wonderkids</a> bought early, <a href="/cm-01-02-bosman-guide/">Bosman free transfers</a> and the <a href="/cm-01-02/lists/bargains/">bargains</a>. Random-potential players are a gamble that can pay off big.</p>
<h2>4. Watch the hidden attributes</h2><p>A star with low consistency or high injury proneness can wreck a season. <a href="/cm-01-02-hidden-attributes/">Hidden attributes explained</a>.</p>
<h2>5. Money and the board</h2><ul><li>Wages kill more clubs than transfer fees – keep the wage bill under your budget.</li><li>Sell players nobody needs before their value drops.</li><li>Meet the board's expectation; a cup run buys you time.</li></ul>
<h2>6. Develop players</h2><p>Young players need first-team minutes and good coaches. Loan them out if they won't play. <a href="/cm-01-02-ca-pa-explained/">How CA and PA work</a>.</p>`,
    },
    {
      slug: 'free-football-manager-browser-game/',
      title: 'Free Football Manager Game in Your Browser – No Download | CM Reborn',
      h1: 'A free football manager game you play in your browser',
      description: 'Looking for a free football manager game that runs in the browser? CM Reborn has 50,000+ real players in two databases, a proper match engine, transfers, tactics, multiplayer and the classic Championship Manager look – no download, no ads.',
      body: `<p class="lead">CM Reborn is a complete football management game that runs in any web browser – free, without ads and without anything to install.</p>
<ul>
<li><b>Real players:</b> the 2026/27 season and the classic 2001/02 database from Championship Manager 01/02.</li>
<li><b>Manage everything:</b> tactics, training, transfers, contracts, scouting, finances, the board and the press.</li>
<li><b>A match engine that thinks:</b> watch the commentary or the 2D pitch and change tactics live.</li>
<li><b>Play together:</b> online leagues with friends, a fantasy draft and global rankings.</li>
<li><b>Anywhere:</b> PC, Mac, Chromebook, iPad, Android and iPhone – it installs as an app and works offline.</li>
<li><b>Ten languages</b> and seven currencies.</li>
</ul>
<h2>Classic or modern</h2><p>Choose the authentic Championship Manager 01/02 look with its blue menus, or a modern interface. Nostalgia is optional – the game underneath is the same.</p>
<p>Want to know who to sign first? Browse the <a href="/2026-27/">2026/27 database</a> or the <a href="/cm-01-02/">CM 01/02 database</a>.</p>`,
      faq: [
        ['Is there a free football manager game online?', 'Yes. CM Reborn is free in the browser at cm0102reborn.com – no download, no ads, no in-game purchases.'],
        ['Can I play a football manager game on iPad or Chromebook?', 'Yes. CM Reborn runs in the browser on iPad, Chromebook, Android and iPhone, and can be installed as an app.'],
      ],
    },
  ];
  const index: Page = {
    slug: 'cm-01-02-guides/',
    title: 'CM 01/02 Guides – Tactics, Wonderkids, Bosmans, Hidden Attributes | CM Reborn',
    h1: 'CM 01/02 guides',
    description: 'All CM Reborn guides to Championship Manager 01/02: download, tactics, wonderkids, best players, Bosman free transfers, hidden attributes, CA and PA, the best teams to manage and tips.',
    body: `<p class="lead">Guides to Championship Manager 01/02, built on the real CM 01/02 databases and on what is inside the original game's code.</p>
${([
      ['How CM 01/02 works', [
        ['/cm-01-02-match-engine/', 'How the match engine works', '11 ticks a minute on a 9 × 12 grid: how the player on the ball chooses, goals, cards, fatigue and ratings.'],
        ['/cm-01-02-attributes-explained/', 'What every attribute does', 'Finishing, flair, decisions, teamwork, pace and the rest – what each one does in the match, with the best players.'],
        ['/cm-01-02-ca-pa-explained/', 'CA and PA explained', 'Current and potential ability, the exact rules for random potential (-1 and -2) and how attributes move with CA.'],
        ['/cm-01-02-hidden-attributes/', 'Hidden attributes', 'Consistency, important matches, injury proneness, loyalty and temperament – the numbers the game never shows.'],
        ['/cm-01-02-database-versions/', '3.9.60 vs 3.9.65 vs 3.9.68', 'The three official databases compared: which players moved, and which version the game uses.'],
        ['/cm-01-02-regens/', 'Regens: how new players are born', 'What happens when a player retires, and why regens inherit his potential.'],
        ['/cm-01-02-player-values/', 'How player values are calculated', 'The value formula in the original – and why the database value is ignored.'],
      ]],
      ['Players', [
        ['/cm-01-02-wonderkids/', 'Wonderkids', 'The best young players, the random-potential cult heroes and the wonderkids in the 3.9.60 release.'],
        ['/cm-01-02-best-players/', 'Best players', 'The top 50 by current ability and the best in every position.'],
        ['/cm-01-02-3960-database/', 'The 3.9.60 database (ODB)', 'The best players and wonderkids in the database CM 01/02 shipped with – and the players only found there.'],
        ['/cm-01-02/lists/legends/', 'Legends and cult heroes', 'Tsigalko, Cherno Samba, To Madeira and every other name fans remember.'],
        ['/cm-01-02-bosman-guide/', 'Bosman free transfers', 'The best players out of contract in 2002 – sign them for nothing.'],
        ['/cm-01-02-best-signings/', 'Best signings: the must-sign players', 'Cheap stars, wonderkids that cost little, Bosman bargains and free agents.'],
      ]],
      ['Clubs and tactics', [
        ['/cm-01-02-tactics/', 'Tactics', 'The classic formations, what the team instructions do in the code, and how tactics work in CM Reborn.'],
        ['/cm-01-02-best-teams-to-manage/', 'Best teams to manage', 'The richest clubs, the strongest squads, the best youth set-ups and the hardest challenges.'],
        ['/cm-01-02-richest-clubs/', 'Richest clubs and transfer budgets', 'Every club\'s bank balance and transfer budget at the start, as the original sets them.'],
        ['/cm-01-02-world-cup-2002/', 'The 2002 World Cup', 'The real groups, the coaches and the strongest squads when the game reaches June 2002.'],
        ['/cm-01-02-tips/', 'Tips: how to win with any club', 'Squad building, tactics, training and the transfer market.'],
        ['/cm-01-02-cheat-tactics/', 'Cheat tactics and cheat players', 'Why Diablo, Wib Wob and friends worked, and the cheap world-beaters.'],
        ['/cm-01-02-money-cheat/', 'Money cheat and unlimited money', 'Editing the club\'s money – in the original and with CM Reborn\'s built-in editor – and the legit ways.'],
        ['/cm-01-02-training/', 'Training schedules', 'What each schedule improves, coaches, workload and development.'],
        ['/cm-01-02-staff-guide/', 'Staff: best coaches, scouts and physios', 'What the 21 staff attributes do, and the best staff in the database – including the ones without a club.'],
        ['/cm-01-02-work-permit/', 'Work permits', 'Signing non-EU players for a British club in 2001/02.'],
      ]],
      ['Playing CM 01/02 today', [
        ['/cm-01-02-download/', 'CM 01/02 download – or play without one', 'Where the free download and the patches are, and how to play in a browser instead.'],
        ['/cm-01-02-mac-ipad-chromebook/', 'Play on Mac, iPad and Chromebook', 'CM 01/02 on devices the original never ran on.'],
        ['/cm-01-02-android/', 'CM 01/02 on Android', 'No PC, no APK, no emulator.'],
        ['/cm-01-02-iphone-ipad/', 'CM 01/02 on iPhone and iPad', 'Play in Safari and add it to the home screen.'],
        ['/cm-01-02-windows-11/', 'Windows 11, the CD error and Steam Deck', 'The usual fixes – or skip them all.'],
        ['/cm-01-02-multiplayer/', 'Multiplayer with friends', 'Your own clubs in the same world, and a fantasy draft league.'],
        ['/cm-01-02-2026-update/', 'CM 01/02 with a 2026/27 database', 'Today\'s players in the classic game.'],
        ['/cm-01-02-26-27-squads/', 'CM 01/02 with 2026/27 squads – play online', 'For everyone looking for a "Championship Manager 26/27".'],
        ['/changelog/', "What's new in CM Reborn", 'The latest updates to the remake.'],
      ]],
    ] as [string, [string, string, string][]][]).map(([h, items]) => `<h2>${h}</h2><ul>${items.map(([u, t, d]) => `<li><a href="${u}"><b>${t}</b></a> – ${d}</li>`).join('')}</ul>`).join('\n')}`,
  };
  return [...pages, index];
}
