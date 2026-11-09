// Flere engelske guider (søgninger som "cm 01/02 download", "bosman", "hidden attributes", "best teams to manage")
// – med tal fra den originale database (buildDb) og links til databasesiderne.
import { A } from '../../src/game/attributes';
import { esc, type Page } from './layout';
import { pounds, type ClubSum, type DbOut } from './db';

type KP = DbOut['kept'][number];

const pl = (p: KP) => (p.url ? `<a href="${p.url}"><b>${esc(p.name)}</b></a>` : `<b>${esc(p.name)}</b>`);
const pa = (p: KP) => (p.paRaw === -2 ? 'R 150+' : p.paRaw === -1 ? 'R 100+' : String(p.pa));
function ptable(rows: KP[], extra?: [string, (p: KP) => string]) {
  return `<div class="tw"><table><thead><tr><th>#</th><th>Player</th><th>Age</th><th>Position</th><th>Club</th>${extra ? `<th class="n">${extra[0]}</th>` : ''}<th class="n">CA</th><th class="n">PA</th></tr></thead><tbody>${rows.map((p, i) => `<tr><td>${i + 1}</td><td>${pl(p)}</td><td>${p.age}</td><td>${esc(p.posStr)}</td><td>${esc(p.clubName)}</td>${extra ? `<td class="n">${extra[1](p)}</td>` : ''}<td class="n">${p.ca}</td><td class="n">${pa(p)}</td></tr>`).join('')}</tbody></table></div>`;
}
function ctable(rows: ClubSum[], cols: [string, (c: ClubSum) => string][]) {
  return `<div class="tw"><table><thead><tr><th>#</th><th>Club</th><th>League</th>${cols.map(([h]) => `<th class="n">${h}</th>`).join('')}</tr></thead><tbody>${rows.map((c, i) => `<tr><td>${i + 1}</td><td><a href="${c.url}"><b>${esc(c.name)}</b></a></td><td><a href="${c.leagueUrl}">${esc(c.league)}</a> <span class="note">${esc(c.nation)}</span></td>${cols.map(([, f]) => `<td class="n">${f(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

export const GUIDE_SLUGS = ['cm-01-02-download/', 'cm-01-02-bosman-guide/', 'cm-01-02-hidden-attributes/', 'cm-01-02-ca-pa-explained/', 'cm-01-02-best-teams-to-manage/', 'cm-01-02-tips/', 'free-football-manager-browser-game/', 'cm-01-02-guides/'];

export function guides(db: DbOut): Page[] {
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

  const pages: Page[] = [
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
<h2>The best Bosman targets in ${yr}</h2>
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
<p>CA is a budget. The game spreads it over the player's attributes depending on his position – a striker's CA goes into finishing and off the ball, a centre-back's into tackling and heading. Many technical and mental attributes are stored "intrinsically" in the database and shown relative to CA, so when a player's CA rises, those attributes rise with it. A world-class player has a CA of 170–190.</p>
<h2>PA – potential ability</h2>
<p>PA is the ceiling. A 17-year-old with CA 90 and PA 180 can become a superstar – if he plays, trains and stays fit. In the profiles, only ${pa180} players have a fixed PA of 180 or more, and ${pa190} have 190+.</p>
<h2>PA -1 and -2: random potential</h2>
<p>Some players have no fixed PA. The database stores a negative code and the game rolls a PA at the start of every new save:</p>
<ul><li><b>-2</b>: PA between 150 and 200 (${neg2} players)</li><li><b>-1</b>: PA between 100 and 150 (${neg1} players)</li></ul>
<p>That is why Cherno Samba could win the Ballon d'Or in one save and play in the Conference in the next. <a href="/cm-01-02/lists/random-potential/">See every random-potential player →</a></p>
<h2>How players reach their PA</h2>
<ul><li>Age: most growth happens before 24.</li><li>Playing time: first-team football beats the reserves.</li><li>Training and coaches, and the player's professionalism and determination.</li><li>Injuries cost development.</li></ul>`,
      faq: [
        ['What is a good PA in CM 01/02?', '150+ is an international, 170+ world class and 190+ one of the best in the world. Random -2 gives 150–200.'],
        ['What does PA -2 mean?', 'The player has a random potential, rolled between 150 and 200 at the start of each new game.'],
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
    body: `<p class="lead">Guides to Championship Manager 01/02, built on the real 3.9.68 database.</p><ul>${[
      ['/cm-01-02-tips/', 'CM 01/02 tips: how to win with any club'], ['/cm-01-02-tactics/', 'CM 01/02 tactics'], ['/cm-01-02-wonderkids/', 'CM 01/02 wonderkids'], ['/cm-01-02-best-players/', 'CM 01/02 best players'],
      ['/cm-01-02-bosman-guide/', 'Bosman free transfers'], ['/cm-01-02-hidden-attributes/', 'Hidden attributes explained'], ['/cm-01-02-ca-pa-explained/', 'CA and PA explained'], ['/cm-01-02-best-teams-to-manage/', 'Best teams to manage'],
      ['/cm-01-02/lists/legends/', 'CM 01/02 legends and cult heroes'], ['/cm-01-02-download/', 'CM 01/02 download – or play without one'], ['/cm-01-02-mac-ipad-chromebook/', 'Play on Mac, iPad and Chromebook'], ['/cm-01-02-2026-update/', 'CM 01/02 with a 2026/27 database'],
    ].map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join('')}</ul>`,
  };
  return [...pages, index];
}
