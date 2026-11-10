// Stabssiderne: trænere, assistenter, fysioterapeuter, spejdere og ledige stabsfolk fra databasen (scripts/build-staff.mts →
// scripts/seo/staff-<db>.json). Egenskaberne er databasens egne tal (1-20). Jobkoderne er aflæst af navnene i databasen
// og bekræftet i originalens Non-Playing Staff (se JOB).
import { readFileSync } from 'node:fs';
import { esc, slugify, type Crumb, type Page } from './layout';

export const STAFF_LABEL: Record<string, string> = {
  attacking: 'Attacking', business: 'Business', coaching: 'Coaching (Outfield Players)', coachingGk: 'Coaching Goalkeepers', coachingTechnique: 'Coaching Technique',
  directness: 'Directness', discipline: 'Discipline', freeRoles: 'Free Roles', interference: 'Interference', judgingAbility: 'Judging Player Ability',
  judgingPotential: 'Judging Player Potential', manHandling: 'Man Management', marking: 'Marking', motivating: 'Motivating', offside: 'Offside Trap',
  patience: 'Patience', physiotherapy: 'Physiotherapy', pressing: 'Pressing', resources: 'Resources', tactics: 'Tactical Knowledge', youngsters: 'Working with Youngsters',
  adaptability: 'Adaptability', ambition: 'Ambition', determination: 'Determination', loyalty: 'Loyalty', pressure: 'Pressure', professionalism: 'Professionalism', sportsmanship: 'Sportsmanship', temperament: 'Temperament',
};
/** korte kolonnenavne i tabellerne */
const SHORT: Record<string, string> = { coaching: 'Coaching', coachingTechnique: 'Technique', coachingGk: 'GK coaching', judgingAbility: 'Judging Ability', judgingPotential: 'Judging Potential', youngsters: 'Youngsters', physiotherapy: 'Physio', manHandling: 'Man Mgmt', tactics: 'Tactics' };
/** jobkoden i personposten (staff.dat +61). Bekræftet i originalens Non-Playing Staff (Man Utd, 3.9.60, 9/11-2026): 1 Chairman,
 *  2 Managing Director, 4 Director Of Football, 5 Manager, 6 Assistant Manager, 8 Coach, 9 Scout, 10 Physio. Resten er læst af hvem
 *  der har dem (11 = van der Gouw, spillende træner; 12 = spillende managere som Andy Preece) – 3/7/13/15 er *estimeret* */
export const JOB: Record<number, string> = {
  1: 'Chairman', 2: 'Managing Director', 3: 'Director', 4: 'Director of Football', 5: 'Manager', 6: 'Assistant Manager', 7: 'Coach', 8: 'Coach',
  9: 'Scout', 10: 'Physio', 11: 'Player/Coach', 12: 'Player/Manager', 13: 'Player/Assistant Manager', 15: 'Player/Coach',
};
const BOARD = new Set([1, 2, 3, 4]);

export interface SP {
  id: number; name: string; slug: string; url: string | null; dob: string; age: number; nation: string; cid: number; club: string; job: number;
  role: string; joined: number; ca: number; pa: number; rep: number; a: Record<string, number>; m: Record<string, number>; player: boolean;
}

export function loadStaff(file: string, P: string): SP[] {
  const d = JSON.parse(readFileSync(file, 'utf8')) as { attrs: string[]; mental: string[]; staff: (string | number | number[])[][] };
  const out: SP[] = [];
  for (const r of d.staff) {
    const [id, name, dob, nation, cid, club, , job, joined, ca, pa, rep, a, m, pl] = r as [number, string, string, string, number, string, string, number, number, number, number, number[], number[], number[], number];
    const [y, mo, da] = (dob || '1960-01-01').split('-').map(Number);
    // databaserne har et 2001-ur (2026/27-opdateringen har skubbet fødselsdatoerne tilbage)
    const age = 2001 - y - (mo > 7 || (mo === 7 && da > 1) ? 1 : 0);
    out.push({
      id, name, slug: '', url: null, dob, age, nation, cid, club, job: cid ? job : 0, role: cid ? JOB[job] ?? 'Staff' : 'Unattached', joined, ca, pa: pa > 0 ? pa : ca,
      rep: rep[1] ?? 0, a: Object.fromEntries(d.attrs.map((k, i) => [k, a[i]])), m: Object.fromEntries(d.mental.map((k, i) => [k, m[i]])), player: !!pl,
    });
  }
  void P;
  return out;
}

const vc = (v: number) => (v >= 17 ? 'v5' : v >= 14 ? 'v4' : v >= 10 ? 'v3' : v >= 6 ? 'v2' : 'v1');
const ord = (n: number) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;
const listJoin = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

/** en stabsliste: hvem, sorteret efter hvad, og hvilke kolonner */
interface SL { slug: string; h1: string; title: string; description: string; intro: string; pool: (s: SP) => boolean; score: (s: SP) => number; cols: string[]; n: number }

export interface StaffCtx {
  P: string; game: string; season: string; dbName: string; original: boolean; modified: string; hubCrumb: Crumb;
  staff: SP[];
  clubUrl: (cid: number) => string | null;
  nationUrl: (name: string) => string | null;
  emit: (kind: string, p: Page) => void;
}

export function staffLists(c: StaffCtx): SL[] {
  const notBoard = (s: SP) => !BOARD.has(s.job);
  const g = c.game;
  return [
    { slug: 'best-coaches', h1: `The best coaches in ${g}`, title: `${g} Best Coaches – Top 50 by Coaching`, description: `The 50 best coaches in ${c.dbName} by Coaching, with Coaching Technique, Motivating and Working with Youngsters – and who is unattached at the start.`, intro: `Sorted by Coaching, then Coaching Technique. Managers and assistants are included – many of the best coaches in the database are working as managers.`, pool: notBoard, score: (s) => s.a.coaching * 100 + s.a.coachingTechnique, cols: ['coaching', 'coachingTechnique', 'motivating', 'youngsters'], n: 50 },
    { slug: 'best-goalkeeping-coaches', h1: `The best goalkeeping coaches in ${g}`, title: `${g} Best Goalkeeping Coaches – Top 30`, description: `The 30 best goalkeeping coaches in ${c.dbName} by Coaching Goalkeepers, with club, age and Coaching.`, intro: `Sorted by Coaching Goalkeepers, then Coaching.`, pool: notBoard, score: (s) => s.a.coachingGk * 100 + s.a.coaching, cols: ['coachingGk', 'coaching', 'motivating'], n: 30 },
    { slug: 'best-youth-coaches', h1: `The best youth coaches in ${g}`, title: `${g} Best Youth Coaches – Working with Youngsters`, description: `The 40 coaches in ${c.dbName} who are best at Working with Youngsters – the staff to hire if your squad is full of wonderkids.`, intro: `Sorted by Working with Youngsters, then Coaching.`, pool: notBoard, score: (s) => s.a.youngsters * 100 + s.a.coaching, cols: ['youngsters', 'coaching', 'coachingTechnique', 'judgingPotential'], n: 40 },
    { slug: 'best-physios', h1: `The best physios in ${g}`, title: `${g} Best Physios – Top 40 by Physiotherapy`, description: `The 40 best physiotherapists in ${c.dbName} by Physiotherapy, with club and age – and the best ones without a club.`, intro: `Sorted by Physiotherapy, then current ability.`, pool: notBoard, score: (s) => s.a.physiotherapy * 1000 + s.ca, cols: ['physiotherapy', 'motivating', 'discipline'], n: 40 },
    { slug: 'best-scouts', h1: `The best scouts in ${g}`, title: `${g} Best Scouts – Judging Ability & Potential`, description: `The 50 best scouts in ${c.dbName} by Judging Player Ability and Judging Player Potential – the two attributes that decide how accurate a scout report is.`, intro: `Sorted by Judging Player Ability + Judging Player Potential. A scout with high Judging Player Potential spots the wonderkids; high Judging Player Ability tells you how good a player is now.`, pool: notBoard, score: (s) => (s.a.judgingAbility + s.a.judgingPotential) * 100 + s.a.judgingPotential, cols: ['judgingAbility', 'judgingPotential', 'youngsters'], n: 50 },
    { slug: 'best-assistant-managers', h1: `The best assistant managers in ${g}`, title: `${g} Best Assistant Managers – Top 30`, description: `The 30 best assistant managers in ${c.dbName}: Coaching, Judging Player Ability and Potential, Man Management and Tactical Knowledge.`, intro: `Assistant managers (and player/assistant managers), sorted by the average of Coaching, Judging Player Ability, Judging Player Potential, Man Management and Tactical Knowledge.`, pool: (s) => s.job === 6 || s.job === 13, score: (s) => s.a.coaching + s.a.judgingAbility + s.a.judgingPotential + s.a.manHandling + s.a.tactics, cols: ['coaching', 'judgingAbility', 'judgingPotential', 'manHandling', 'tactics'], n: 30 },
    { slug: 'best-managers-attributes', h1: `The best managers in ${g} by attributes`, title: `${g} Best Managers by Attributes – Tactics, Motivating`, description: `The managers in ${c.dbName} with the best attributes: Tactical Knowledge, Motivating, Man Management and Coaching – plus current ability.`, intro: `Managers (and player/managers), sorted by current ability, with their key attributes.`, pool: (s) => s.job === 5 || s.job === 12, score: (s) => s.ca * 100 + s.a.tactics + s.a.motivating, cols: ['tactics', 'motivating', 'manHandling', 'coaching', 'discipline'], n: 50 },
    { slug: 'best-free-staff', h1: `The best unattached staff in ${g}`, title: `${g} Best Free Staff – Coaches & Scouts Without a Club`, description: `The best coaches, scouts and physios without a club at the start of ${c.season} in ${c.dbName} – hire them for wages only.`, intro: `Staff with no club on 1 July 2001${c.original ? '' : ' (the database\'s clock)'}, sorted by current ability. Their best attributes show what they are good at.`, pool: (s) => !s.cid, score: (s) => s.ca, cols: ['coaching', 'judgingAbility', 'judgingPotential', 'physiotherapy'], n: 60 },
  ];
}

export interface StaffPrep { lists: SL[]; ranked: { l: SL; rows: SP[] }[]; keep: Set<SP> }

/** listerne og hvem der får en profil (url'erne sættes her, så klubsiderne kan linke, før siderne skrives) */
export function prepareStaff(c: StaffCtx): StaffPrep {
  const { P } = c;
  const lists = staffLists(c);
  const ranked = lists.map((l) => ({ l, rows: c.staff.filter(l.pool).filter((s) => l.cols.some((k) => s.a[k] > 0)).sort((a, b) => l.score(b) - l.score(a)).slice(0, l.n) }));
  // profiler: alle på listerne + managere og assistenter i klubberne med en side
  const keep = new Set<SP>(ranked.flatMap((x) => x.rows));
  for (const s of c.staff) if ((s.job === 5 || s.job === 6) && c.clubUrl(s.cid) && s.ca >= 100) keep.add(s);
  const slugs = new Set<string>();
  for (const s of [...keep].sort((a, b) => b.ca - a.ca)) {
    let slug = slugify(s.name);
    if (!slug) continue;
    if (slugs.has(slug)) slug = `${slug}-${slugify(s.club || s.nation)}`;
    if (slugs.has(slug)) slug = `${slug}-${s.id}`;
    slugs.add(slug);
    s.slug = slug; s.url = `/${P}/staff/${slug}/`;
  }
  return { lists, ranked, keep };
}

export function buildStaffPages(c: StaffCtx, prep: StaffPrep): { lists: number; profiles: number } {
  const { P, game } = c;
  const { lists, ranked, keep } = prep;
  const hub: Crumb = { name: 'Staff', url: `/${P}/staff/` };
  const sLink = (s: SP) => (s.url ? `<a href="${s.url}"><b>${esc(s.name)}</b></a>` : `<b>${esc(s.name)}</b>`);
  const cLink = (s: SP) => { const u = c.clubUrl(s.cid); return s.cid ? (u ? `<a href="${u}">${esc(s.club)}</a>` : esc(s.club)) : '<i>Unattached</i>'; };
  const nLink = (n: string) => { const u = c.nationUrl(n); return u ? `<a href="${u}">${esc(n)}</a>` : esc(n); };
  const cell = (v: number) => (v > 0 ? `<td class="n ${vc(v)}">${v}</td>` : '<td class="n">–</td>');
  const table = (rows: SP[], cols: string[]) => `<div class="tw"><table><thead><tr><th>#</th><th>Name</th><th>Job</th><th>Club</th><th>Nation</th><th class="n">Age</th>${cols.map((k) => `<th class="n" title="${esc(STAFF_LABEL[k])}">${esc(SHORT[k] ?? STAFF_LABEL[k])}</th>`).join('')}<th class="n">CA</th></tr></thead><tbody>${rows.map((s, i) => `<tr><td>${i + 1}</td><td>${sLink(s)}</td><td>${esc(s.role)}</td><td>${cLink(s)}</td><td>${nLink(s.nation)}</td><td class="n">${s.age}</td>${cols.map((k) => cell(s.a[k])).join('')}<td class="n">${s.ca}</td></tr>`).join('')}</tbody></table></div>`;
  const others = (l: SL) => `<h2>More ${esc(game)} staff lists</h2><div class="cols">${lists.filter((x) => x !== l).map((x) => `<a href="/${P}/staff/${x.slug}/">${esc(x.h1.replace(` in ${game}`, '').replace(/^The /, ''))}</a>`).join('')}<a href="/cm-01-02-staff-guide/">Staff attributes explained</a></div>`;

  for (const { l, rows } of ranked) {
    if (!rows.length) continue;
    const top = rows[0], free = rows.filter((s) => !s.cid);
    c.emit('lists', {
      slug: `${P}/staff/${l.slug}/`, title: `${l.title}${c.original ? '' : ` (${c.season})`} | CM Reborn`, h1: l.h1, description: l.description, crumbs: [c.hubCrumb, hub],
      body: `<p class="lead">${l.intro} The attributes are the database's own numbers (1–20) – exactly what the ${c.original ? 'original game' : 'game'} uses.${free.length && l.slug !== 'best-free-staff' ? ` ${free.length} of them have no club at the start – ${listJoin(free.slice(0, 3).map((s) => esc(s.name)))} can be hired straight away.` : ''}</p>
${table(rows, l.cols)}
<p class="note">CA = current ability of the staff member (0–200). "–" means the database leaves the attribute empty.</p>
${others(l)}`,
      faq: [
        [`Who is the best ${l.h1.replace(`The best `, '').replace(` in ${game}`, '').replace(/s( by attributes)?$/, '')} in ${game}?`, `${top.name} (${top.role}${top.cid ? `, ${top.club}` : ', unattached'}) – ${l.cols.slice(0, 2).map((k) => `${STAFF_LABEL[k]} ${top.a[k] || '–'}`).join(', ')}. ${rows[1] ? `Next: ${listJoin(rows.slice(1, 4).map((s) => s.name))}.` : ''}`],
        ...(free.length ? [[`Which good ${l.slug.replace('best-', '').replace(/-/g, ' ')} are free to hire at the start?`, `${listJoin(free.slice(0, 4).map((s) => `${s.name} (CA ${s.ca})`))}.`] as [string, string]] : []),
      ],
    });
  }
  // hubben
  c.emit('lists', {
    slug: `${P}/staff/`, title: `${game} Staff – Best Coaches, Scouts, Physios${c.original ? '' : ` ${c.season}`} | CM Reborn`, h1: `${game} staff: coaches, scouts and physios`,
    description: `Every coach, scout, physio and assistant manager in ${c.dbName} with their real attributes – the best at each job and the best ones without a club.`,
    crumbs: [c.hubCrumb],
    body: `<p class="lead">${c.staff.length.toLocaleString('en')} non-playing staff from ${c.dbName}: ${c.staff.filter((s) => s.job === 8).length.toLocaleString('en')} coaches, ${c.staff.filter((s) => s.job === 9).length.toLocaleString('en')} scouts, ${c.staff.filter((s) => s.job === 10).length.toLocaleString('en')} physios and ${c.staff.filter((s) => !s.cid).length.toLocaleString('en')} without a club. Their attributes are read straight from the database. <a href="/cm-01-02-staff-guide/">What the staff attributes do →</a></p>
${ranked.filter((x) => x.rows.length).map(({ l, rows }) => `<h2><a href="/${P}/staff/${l.slug}/">${esc(l.h1.replace(` in ${game}`, ''))}</a></h2>${table(rows.slice(0, 10), l.cols)}`).join('\n')}`,
  });
  // profiler
  let profiles = 0;
  const rankOf = new Map<SP, [SL, number][]>();
  for (const { l, rows } of ranked) rows.forEach((s, i) => rankOf.set(s, [...(rankOf.get(s) ?? []), [l, i + 1]]));
  const ATTR_GROUPS: [string, string[]][] = [
    ['Coaching', ['coaching', 'coachingTechnique', 'coachingGk', 'youngsters', 'physiotherapy']],
    ['Judging', ['judgingAbility', 'judgingPotential']],
    ['Management', ['motivating', 'manHandling', 'discipline', 'tactics']],
    ['Tactical style', ['attacking', 'directness', 'freeRoles', 'marking', 'offside', 'pressing']],
    ['Boardroom', ['business', 'interference', 'patience', 'resources']],
    ['Mental', ['adaptability', 'ambition', 'determination', 'loyalty', 'pressure', 'professionalism', 'sportsmanship', 'temperament']],
  ];
  for (const s of keep) {
    if (!s.url) continue;
    const val = (k: string) => s.a[k] ?? s.m[k] ?? 0;
    const best = Object.keys(s.a).filter((k) => !['business', 'interference', 'patience', 'resources'].includes(k)).sort((a, b) => s.a[b] - s.a[a]).slice(0, 3).filter((k) => s.a[k] >= 10);
    const colleagues = s.cid ? c.staff.filter((x) => x.cid === s.cid && x !== s && !BOARD.has(x.job)).sort((a, b) => a.job - b.job || b.ca - a.ca).slice(0, 12) : [];
    const ranks = rankOf.get(s) ?? [];
    c.emit('lists', {
      slug: s.url.slice(1),
      // højst ~65 tegn: klubben kun, når der er plads
      title: `${[`${s.name} – ${game} ${s.role}${s.cid ? `, ${s.club}` : ''}`, `${s.name} – ${game} ${s.role}`, `${s.name} (${game})`].find((x) => x.length <= 65) ?? s.name} | CM Reborn`,
      h1: `${s.name} – ${game} ${s.role.toLowerCase()}`,
      description: `${s.name} in ${c.dbName}: ${s.role.toLowerCase()}${s.cid ? ` at ${s.club}` : ' without a club'}, ${s.age} years old, from ${s.nation}. ${best.length ? `Best at ${listJoin(best.map((k) => `${STAFF_LABEL[k]} (${s.a[k]})`))}.` : ''} Every staff attribute.`,
      crumbs: [c.hubCrumb, hub],
      ld: [{ '@type': 'Person', name: s.name, ...(s.nation ? { nationality: s.nation } : {}), jobTitle: s.role, ...(s.cid ? { worksFor: { '@type': 'SportsTeam', name: s.club } } : {}) }],
      body: `<p class="lead">${esc(s.name)} is ${s.cid ? `the ${esc(s.role.toLowerCase())} of ${cLink(s)}` : 'without a club'} at the start of ${c.season} in ${esc(c.dbName)}${s.joined > 1900 && s.cid ? ` (at the club since ${s.joined})` : ''}. ${best.length ? `His strongest attributes are ${listJoin(best.map((k) => `${STAFF_LABEL[k]} (${s.a[k]})`))}.` : ''}${s.player ? ' He is also registered as a player.' : ''}</p>
<dl class="kv">${([['Job', esc(s.role)], ['Club', cLink(s)], ['Nation', nLink(s.nation)], ['Age', String(s.age)], ['Current ability', String(s.ca)], ['Potential ability', String(s.pa)], ['Reputation', String(s.rep)]] as [string, string][]).map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
${ranks.length ? `<h2>Rankings</h2><ul>${ranks.map(([l, i]) => `<li>${ord(i)} on <a href="/${P}/staff/${l.slug}/">${esc(l.h1.replace(` in ${game}`, '').toLowerCase())}</a></li>`).join('')}</ul>` : ''}
<h2>Attributes</h2>
<div class="attrs">${ATTR_GROUPS.map(([h, ks]) => `<section><h3>${h}</h3><ul>${ks.map((k) => { const v = val(k); return `<li>${esc(STAFF_LABEL[k])}<b class="v ${v ? vc(v) : 'vx'}">${v || '–'}</b></li>`; }).join('')}</ul></section>`).join('')}</div>
<p class="note">From ${esc(c.dbName)} (1–20). "–" = not set in the database – the game fills those in when a new game starts, and it shows a few of the others slightly differently (checked in the original: Jimmy Ryan's Coaching Goalkeepers 4 is shown as 9). <a href="/cm-01-02-staff-guide/">What each staff attribute does →</a></p>
${colleagues.length ? `<h2>${esc(s.club)} staff</h2><div class="tw"><table><thead><tr><th>Name</th><th>Job</th><th class="n">Age</th><th class="n">CA</th></tr></thead><tbody>${colleagues.map((x) => `<tr><td>${sLink(x)}</td><td>${esc(x.role)}</td><td class="n">${x.age}</td><td class="n">${x.ca}</td></tr>`).join('')}</tbody></table></div>` : ''}`,
      faq: [
        [`Is ${s.name} a good ${s.role === 'Unattached' ? 'member of staff' : s.role.toLowerCase()} in ${game}?`, `${s.name} has a current ability of ${s.ca}${best.length ? ` and is best at ${listJoin(best.map((k) => `${STAFF_LABEL[k]} (${s.a[k]})`))}` : ''}.${ranks[0] ? ` He is ${ord(ranks[0][1])} on the list of ${ranks[0][0].h1.replace('The ', '').replace(` in ${game}`, '').toLowerCase()}.` : ''}`],
        ...(s.cid ? [] : [[`Can I hire ${s.name} at the start of ${game}?`, `Yes – he has no club on 1 July, so he only asks for wages.`] as [string, string]]),
      ],
    });
    profiles++;
  }
  return { lists: ranked.filter((x) => x.rows.length).length, profiles };
}

/** klubsidens stabsafsnit */
export function clubStaffHtml(staff: SP[], cid: number, name: string): string {
  const xs = staff.filter((s) => s.cid === cid && !BOARD.has(s.job) && s.job !== 5).sort((a, b) => a.job - b.job || b.ca - a.ca);
  if (!xs.length) return '';
  const key = (s: SP) => (s.job === 10 ? ['physiotherapy'] : s.job === 9 ? ['judgingAbility', 'judgingPotential'] : s.a.coachingGk >= 14 && s.a.coachingGk >= s.a.coaching ? ['coachingGk'] : ['coaching', 'youngsters']).map((k) => `${STAFF_LABEL[k]} ${s.a[k] || '–'}`).join(', ');
  return `<h2>${esc(name)} staff</h2><div class="tw"><table><thead><tr><th>Name</th><th>Job</th><th class="n">Age</th><th>Key attributes</th><th class="n">CA</th></tr></thead><tbody>${xs.map((s) => `<tr><td>${s.url ? `<a href="${s.url}">${esc(s.name)}</a>` : esc(s.name)}</td><td>${esc(s.role)}</td><td class="n">${s.age}</td><td>${esc(key(s))}</td><td class="n">${s.ca}</td></tr>`).join('')}</tbody></table></div>`;
}
