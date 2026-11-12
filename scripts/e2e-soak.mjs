// Langtidstest i browseren: et nyt spil spilles 5 sæsoner, og alle hovedskærme åbnes flere gange pr. sæson.
// Fejler ved sidefejl, tomme skærme eller rå oversættelsesnøgler. Starter selv Vite (dev, så __cm-krogene findes).
// Kør: node scripts/e2e-soak.mjs <modern|original> <moderne|klassisk> [sæsoner] [klubnavn]
// E2E_ENGINE=original: originalens kampmotor (gittermotoren, localStorage `cm0102.engine`) – kræver den originale database og det
// klassiske udseende (ægte tilstand, se gridEngineOn i sim.ts). Kontrollerer, at motoren bruges, og kampenes rapporter (mål, minutter,
// karakterer, udskiftninger, kampens spiller, kommentar). E2E_ENGINE=zone tvinger zonemotoren. PORT=<n> vælger Vite-porten.
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';

const [db = 'modern', look = 'moderne', seasonsArg = '5', clubArg] = process.argv.slice(2);
const SEASONS = Number(seasonsArg);
const ENGINE = process.env.E2E_ENGINE ?? '';
if (ENGINE === 'original' && (db !== 'original' || look !== 'klassisk')) { console.log('E2E_ENGINE=original kræver original + klassisk'); process.exit(2); }
// en ledig port (andre kan køre e2e/Vite samtidig – strictPort uden ledig port ville ellers teste en anden server)
const freePort = (p) => new Promise((res) => { const srv = createServer(); srv.once('error', () => res(false)); srv.listen(p, () => srv.close(() => res(true))); });
let PORT = Number(process.env.PORT) || 0;
for (let i = 0; !PORT && i < 50; i++) { const p = 5190 + Math.floor(Math.random() * 200); if (await freePort(p)) PORT = p; }
const URL = `http://localhost:${PORT}/cm0102-reborn/`;
const OUT = `e2e-shots/soak-${db}-${look}${ENGINE ? `-${ENGINE}` : ''}`;
mkdirSync(OUT, { recursive: true });
const server = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { stdio: 'ignore', env: { ...process.env, BROWSER: 'none' } });
const stop = () => { try { server.kill(); } catch { /* ignorer */ } };
process.on('exit', stop);
for (let i = 0; i < 80; i++) { try { if ((await fetch(URL)).ok) break; } catch { /* venter */ } await new Promise((r) => setTimeout(r, 500)); }

const RAW_KEY = /\b(?:c|cl|pi|pih|ti|tih|tac|acc|pitch|ref|sp|match|nav|opt|wx|top|comp|ban|fans|ed|stage|group|cat|col)\.[a-z][\w-]*(?:\.[\w-]+)*\b/;
const issues = [];
const log = (s) => { console.log(s); };
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource|net::ERR/.test(m.text())) errors.push(`console: ${m.text().slice(0, 200)}`); });
await page.addInitScript(([theme, dbv, engine]) => {
  localStorage.setItem('cm0102.lang', 'en'); localStorage.setItem('cm-theme', theme); localStorage.setItem('cm0102.db', dbv); sessionStorage.setItem('cm0102.play', '1');
  // gittermotoren kræver ægte tilstand (options.mode 'authentic' + klassisk udseende) – Start.tsx: alt andet end 'extended' = ægte
  if (engine) { localStorage.setItem('cm0102.engine', engine); if (engine === 'original') localStorage.setItem('cm0102.mode', 'authentic'); }
}, [look === 'klassisk' ? 'retro' : 'club', db, ENGINE]);
const t = (k) => page.evaluate((key) => window.__cm.t(key), k);
const go = (r) => page.evaluate((route) => window.__cmNav(route), r);
const gs = (fn, arg) => page.evaluate(fn, arg);
let shot = 0;
const problem = async (where, msg) => {
  issues.push(`${where}: ${msg}`);
  log(`  ✗ ${where}: ${msg}`);
  await page.screenshot({ path: `${OUT}/fejl-${++shot}.png` }).catch(() => {});
};
const checkScreen = async (where) => {
  await page.waitForTimeout(250);
  const text = await page.locator('body').innerText().catch(() => '');
  if (text.trim().length < 150) return problem(where, 'skærmen er (næsten) tom');
  const raw = text.match(RAW_KEY);
  if (raw) return problem(where, `rå oversættelsesnøgle "${raw[0]}"`);
  if (/\bNaN\b|undefined|\[object Object\]/.test(text)) return problem(where, `"${text.match(/\bNaN\b|undefined|\[object Object\]/)[0]}" på skærmen`);
};

// ---------- nyt spil ----------
const clubName = clubArg ?? (db === 'original' ? 'Leeds United' : 'Brentford');
await page.goto(URL);
await page.getByRole('button', { name: await t('start.new') }).first().click();
await page.waitForFunction(() => !!window.__cmPick && !!window.__cmClubId, null, { timeout: 60000 });
await page.getByPlaceholder(await t('start.managerPlaceholder')).fill('Soak Tester');
const cid = await page.evaluate((n) => window.__cmClubId(n) || window.__cmClubId(`${n} FC`), clubName);
if (!cid || !(await page.evaluate((id) => window.__cmPick(id), cid))) { console.log(`klubben ${clubName} findes ikke`); process.exit(2); }
await page.getByRole('button', { name: await t('start.begin') }).click();
await page.waitForFunction(() => { try { return !!window.__cm.gs().userClub; } catch { return false; } }, null, { timeout: 90000 });
log(`${db} · ${look} · ${clubName} · start ${await gs(() => window.__cm.gs().date)}`);
const engineInfo = await page.evaluate(async () => {
  const sim = await import('/cm0102-reborn/src/game/sim.ts');
  const g = window.__cm.gs();
  return { on: sim.gridEngineOn(g), mode: g.options.mode, engine: g.options.engine ?? '-', dev: localStorage.getItem('cm0102.engine') };
});
log(`motor: gridEngineOn=${engineInfo.on} · mode ${engineInfo.mode} · options.engine ${engineInfo.engine} · cm0102.engine ${engineInfo.dev}`);
if (ENGINE === 'original' && !engineInfo.on) { console.log('gittermotoren er IKKE slået til'); process.exit(2); }

// ---------- kampenes rapporter og resultater ----------
const seenReports = new Set();
const seenFix = new Set();
const leagueStats = { grid: { n: 0, goals: 0, home: 0, draw: 0, nil: 0, max: 0 }, zone: { n: 0, goals: 0, home: 0, draw: 0, nil: 0, max: 0 } };
const repStats = { n: 0, grid: 0, zone: 0, goals: 0 };
const checkMatches = async () => {
  const r = await page.evaluate(async ([seenR, seenF]) => {
    const rules = await import('/cm0102-reborn/src/game/rules.ts');
    const g = window.__cm.gs();
    const maxSubs = rules.maxSubs();
    const out = { reports: [], fixtures: [] };
    const myLeague = g.clubs[g.userClub]?.league;
    for (const [id, rep] of Object.entries(g.reports)) {
      if (seenR.includes(id)) continue;
      const f = g.fixtures[Number(id)];
      const name = (cid) => g.clubs[cid]?.short ?? g.clubs[cid]?.name ?? cid;
      const hg = rep.stats?.[0]?.goals, ag = rep.stats?.[1]?.goals;
      const bad = [];
      const lines = rep.players ?? [];
      for (const l of lines) {
        const pn = g.players[l.id] ? `${g.players[l.id].last ?? g.players[l.id].name ?? l.id}` : `#${l.id}`;
        if (!(l.minutes >= 0) || l.minutes > (rep.et ? 125 : 98)) bad.push(`${pn} ${l.minutes} min`);
        if (l.minutes > 0 && !(l.rating >= 1 && l.rating <= 10)) bad.push(`${pn} karakter ${l.rating}`);
        if (l.goals < 0 || l.goals > 6) bad.push(`${pn} ${l.goals} mål`);
      }
      for (const t of [0, 1]) {
        const subs = (rep.events ?? []).filter((e) => e.k === 'sub' && e.t === t).length;
        if (subs > maxSubs) bad.push(`hold ${t}: ${subs} udskiftninger (max ${maxSubs})`);
        const played = lines.filter((l) => l.team === t && l.minutes > 0).length;
        if (played < 7 || played > 11 + maxSubs) bad.push(`hold ${t}: ${played} spillere med minutter`);
        const gl = lines.filter((l) => l.team === t).reduce((a, l) => a + l.goals, 0);
        const og = (rep.events ?? []).filter((e) => e.k === 'goal' && e.og && e.t === t).length;
        const goals = t ? ag : hg;
        if (gl + og !== goals && gl !== goals) {
          const ev = (rep.events ?? []).filter((e) => e.k === 'goal' && e.t === t).map((e) => `${e.m}' p${e.p}${e.og ? ' sm' : ''}${e.pen ? ' str' : ''}${lines.some((l) => l.id === e.p) ? (lines.find((l) => l.id === e.p).team === t ? '' : ' (modstander)') : ' (ikke i rapporten)'}`);
          bad.push(`hold ${t}: ${goals} mål, spillerne ${gl} (+${og} selvmål) [${ev.join(', ')}]`);
        }
      }
      if (!rep.mom || !lines.some((l) => l.id === rep.mom)) bad.push(`kampens spiller mangler (${rep.mom})`);
      const com = rep.commentary ?? [];
      let rep3 = 0;
      for (let i = 2; i < com.length; i++) if (com[i].k === com[i - 1].k && com[i].k === com[i - 2].k && com[i].a === com[i - 1].a && com[i].a === com[i - 2].a && com[i].k !== 'pl-pass') rep3++;
      if (com.length && rep3 > 5) bad.push(`kommentaren gentager sig (${rep3}× tre ens linjer i træk)`);
      const goalEv = (rep.events ?? []).filter((e) => e.k === 'goal').length;
      if (goalEv !== hg + ag) bad.push(`${goalEv} mål-hændelser, resultatet ${hg}-${ag}`);
      if (hg + ag >= 11) bad.push(`urimeligt resultat ${hg}-${ag}`);
      // gittermotoren (runde 10C): kampstatistikken er originalens tællere (MATCH_PLAYER +1/+2/+4/+5/+7/+8, holdblokken) – ikke tomme/flade
      if (rep.engine === 'original') {
        for (const t of [0, 1]) {
          const s = rep.stats[t], mine = lines.filter((l) => l.team === t);
          const sum = (k) => mine.reduce((a, l) => a + (l[k] ?? 0), 0);
          if (!(s.passes > 50) || !(s.tackles > 0) || !(s.headers > 0) || s.throwIns === undefined) bad.push(`hold ${t}: tom statistik (afl. ${s.passes}, tackl. ${s.tackles}, hovedst. ${s.headers}, indkast ${s.throwIns})`);
          if (sum('passes') !== s.passes || sum('passesOk') !== s.passesCompleted) bad.push(`hold ${t}: afleveringer ${sum('passes')}/${sum('passesOk')} ≠ holdets ${s.passes}/${s.passesCompleted}`);
          if (sum('tckA') !== s.tackles || sum('tackles') !== s.tacklesWon || sum('hea') !== s.headers || sum('heaW') !== s.headersWon) bad.push(`hold ${t}: tacklinger/hovedstød stemmer ikke med holdets`);
          if (!(rep.heat?.[t]?.reduce((a, v) => a + v, 0) > 0)) bad.push(`hold ${t}: tomt varmekort`);
        }
        if (!rep.momentum?.some((v) => v !== 0)) bad.push('momentum er fladt');
        if (!(rep.stats[0].possession + rep.stats[1].possession === 100)) bad.push(`besiddelse ${rep.stats[0].possession}/${rep.stats[1].possession}`);
      }
      out.reports.push({ id, engine: rep.engine ?? 'zone', score: `${name(rep.home)} ${hg}-${ag} ${name(rep.away)}`, date: f?.date, comp: f?.comp, goals: hg + ag, ncom: com.length, bad });
    }
    const sf = new Set(seenF);
    for (const f of Object.values(g.fixtures)) {
      if (!f?.result || sf.has(f.id) || f.home === undefined) continue;
      const lg = g.comps[f.comp];
      if (!lg || lg.type !== 'league') continue;
      const grid = f.comp === myLeague;
      out.fixtures.push({ id: f.id, grid, hg: f.result.hg, ag: f.result.ag, d: f.date, s: `${g.clubs[f.home]?.short} ${f.result.hg}-${f.result.ag} ${g.clubs[f.away]?.short} (${f.comp} ${f.date})` });
    }
    return out;
  }, [[...seenReports], [...seenFix]]);
  for (const rep of r.reports) {
    seenReports.add(rep.id); repStats.n++; repStats[rep.engine === 'original' ? 'grid' : 'zone']++; repStats.goals += rep.goals;
    if (ENGINE === 'original' && rep.engine !== 'original') await problem(`kamp ${rep.id}`, `spillet med ${rep.engine}-motoren: ${rep.score} (${rep.comp} ${rep.date})`);
    if (rep.ncom === 0) await problem(`kamp ${rep.id}`, `ingen kommentar: ${rep.score}`);
    if (rep.bad.length) await problem(`kamp ${rep.id} (${rep.engine}, ${rep.comp} ${rep.date}) ${rep.score}`, rep.bad.join('; '));
  }
  for (const f of r.fixtures) {
    seenFix.add(f.id);
    const st = leagueStats[f.grid ? 'grid' : 'zone'];
    st.n++; st.goals += f.hg + f.ag; if (f.hg > f.ag) st.home++; if (f.hg === f.ag) st.draw++; if (f.hg + f.ag === 0) st.nil++; st.max = Math.max(st.max, f.hg + f.ag);
    if (f.hg + f.ag >= 11 || f.hg >= 9 || f.ag >= 9) await problem('resultat', `urimeligt: ${f.s}`);
  }
};
const fmtStats = (st) => st.n ? `${st.n} kampe · ${(st.goals / st.n).toFixed(2)} mål · H/U ${Math.round(100 * st.home / st.n)}/${Math.round(100 * st.draw / st.n)} % · 0-0 ${Math.round(100 * st.nil / st.n)} % · max ${st.max}` : '-';

const screens = async () => {
  const g = await gs(() => { const g = window.__cm.gs(); const mine = Object.values(g.players).filter((p) => p.club === g.userClub); return {
    star: mine.sort((a, b) => b.ca - a.ca)[0]?.id, other: Object.values(g.clubs).find((c) => c.id !== g.userClub && c.league === g.clubs[g.userClub]?.league)?.id,
    staff: Number(Object.keys(g.staff)[0]), employed: !!g.userClub, news: g.news.slice(0, 6).map((n) => n.id), cup: Object.values(g.comps).find((c) => c.type === 'cup')?.id,
    euro: ['CL', 'UEFA', 'UECL'].find((k) => g.comps[k]), report: Object.keys(g.reports).pop() }; });
  const list = [
    { name: 'inbox' }, { name: 'squad' }, { name: 'player', id: g.star }, { name: 'tactics' }, { name: 'training' }, { name: 'fixtures' },
    { name: 'competitions' }, ...(g.cup ? [{ name: 'competitions', id: g.cup }] : []), ...(g.euro ? [{ name: 'competitions', id: g.euro }] : []),
    { name: 'international' }, { name: 'transfers' }, { name: 'scouting' }, { name: 'staff' }, { name: 'finance' }, { name: 'club', id: g.other }, { name: 'club' }, { name: 'board' },
    { name: 'assistant' }, { name: 'history' }, { name: 'awards' }, { name: 'jobs' }, { name: 'managers' }, { name: 'find' }, { name: 'staff', id: g.staff },
    { name: 'nation', tab: 'managers' }, { name: 'nation', tab: 'jobs' }, { name: 'nation', tab: 'transfers' }, { name: 'options' }, { name: 'help' },
    ...(g.report ? [{ name: 'report', id: Number(g.report) }] : []),
  ].filter((r) => g.employed || !['squad', 'tactics', 'training', 'finance', 'board', 'assistant', 'scouting', 'staff'].includes(r.name) || r.id);
  for (const r of list) {
    const before = errors.length;
    try { await go(r); await checkScreen(`${r.name}${r.id ? `(${r.id})` : ''}${r.tab ? `/${r.tab}` : ''}`); }
    catch (e) { await problem(r.name, e.message.split('\n')[0]); }
    if (errors.length > before) await problem(`${r.name}${r.id ? `(${r.id})` : ''}`, `sidefejl: ${errors.slice(before).join(' | ').slice(0, 300)}`);
  }
  // åbn de nyeste nyheder (brødteksten tegnes)
  await go({ name: 'inbox' });
  for (const id of g.news) {
    const before = errors.length;
    await page.locator(`[data-id="${id}"]`).first().click({ timeout: 1500 }).catch(() => {});
    if (errors.length > before) await problem(`nyhed ${id}`, `sidefejl: ${errors.slice(before).join(' | ').slice(0, 300)}`);
  }
  await checkScreen('inbox efter nyheder');
};

// ---------- sæsonerne ----------
const t0 = Date.now();
const startSeason = await gs(() => window.__cm.gs().season);
for (let s = 1; s <= SEASONS; s++) {
  const tS = Date.now();
  for (const chunk of [45, 60, 60, 60, 60, 80]) {
    const before = errors.length;
    const ta = Date.now();
    // en hængende kamp/dag: giv op efter 20 min pr. bid
    let timer;
    try { await Promise.race([page.evaluate((d) => window.__cm.advance(d), chunk), new Promise((_, rej) => { timer = setTimeout(() => rej(new Error(`advance ${chunk} hænger (> 20 min)`)), 20 * 60000); })]); }
    catch (e) { await problem(`advance ${chunk}`, e.message.split('\n')[0]); if (/hænger/.test(e.message)) { log(`  ${await gs(() => window.__cm.gs().date).catch(() => '?')}`); break; } }
    finally { clearTimeout(timer); }
    if (errors.length > before) await problem(`advance (${await gs(() => window.__cm.gs().date)})`, `fejl: ${errors.slice(before).join(' | ').slice(0, 300)}`);
    const st = await gs(() => { const g = window.__cm.gs(); return { date: g.date, season: g.season, club: g.clubs[g.userClub]?.name ?? 'ARBEJDSLØS', conf: Math.round(g.board.confidence), bal: g.clubs[g.userClub]?.balance ?? 0, pend: g.pendingFixture }; });
    log(`  ${st.date} · ${st.club} · tillid ${st.conf} · saldo ${(st.bal / 1e6).toFixed(1)}m · ${Math.round((Date.now() - ta) / 1000)} s`);
    await checkMatches().catch((e) => problem('kampkontrol', e.message.split('\n')[0]));
    await screens();
    // fyret: arbejdsløs-skærmene er testet – tag så det første jobtilbud (eller søg), så sæsonerne spilles med en klub
    if (st.club === 'ARBEJDSLØS') {
      const got = await page.evaluate(async () => {
        const m = await import('/cm0102-reborn/src/game/actions.ts');
        const g = window.__cm.gs();
        for (let i = 0; i < 40 && !g.userClub; i++) {
          const offer = g.jobOffers.find((id) => g.clubs[id]?.manager === 0);
          if (offer) { m.act({ t: 'acceptJob', club: offer }); break; }
          for (const id of g.vacancies.slice(0, 3)) m.act({ t: 'applyJob', club: id });
          await window.__cm.advance(3);
        }
        window.__cm.notify();
        return g.clubs[g.userClub]?.name ?? '';
      });
      log(`  nyt job: ${got || 'intet'}`);
    }
    if (st.season >= startSeason + SEASONS) break;
  }
  await page.screenshot({ path: `${OUT}/saeson-${s}.png` });
  log(`  sæson ${s} på ${Math.round((Date.now() - tS) / 60000)} min · egen liga ${fmtStats(leagueStats.grid)}`);
  log(`  andre ligaer ${fmtStats(leagueStats.zone)} · rapporter ${repStats.n} (gitter ${repStats.grid}, zone ${repStats.zone}, ${repStats.n ? (repStats.goals / repStats.n).toFixed(2) : '-'} mål)`);
}
log(`\n${SEASONS} sæsoner på ${Math.round((Date.now() - t0) / 60000)} min · ${issues.length} problemer`);
writeFileSync(`${OUT}/rapport.txt`, issues.join('\n'));
await browser.close();
stop();
process.exit(issues.length ? 1 : 0);
