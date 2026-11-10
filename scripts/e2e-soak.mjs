// Langtidstest i browseren: et nyt spil spilles 5 sæsoner, og alle hovedskærme åbnes flere gange pr. sæson.
// Fejler ved sidefejl, tomme skærme eller rå oversættelsesnøgler. Starter selv Vite (dev, så __cm-krogene findes).
// Kør: node scripts/e2e-soak.mjs <modern|original> <moderne|klassisk> [sæsoner] [klubnavn]
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';

const [db = 'modern', look = 'moderne', seasonsArg = '5', clubArg] = process.argv.slice(2);
const SEASONS = Number(seasonsArg);
const PORT = 5190 + Math.floor(Math.random() * 200);
const URL = `http://localhost:${PORT}/cm0102-reborn/`;
const OUT = `e2e-shots/soak-${db}-${look}`;
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
await page.addInitScript(([theme, dbv]) => {
  localStorage.setItem('cm0102.lang', 'en'); localStorage.setItem('cm-theme', theme); localStorage.setItem('cm0102.db', dbv); sessionStorage.setItem('cm0102.play', '1');
}, [look === 'klassisk' ? 'retro' : 'club', db]);
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
  for (const chunk of [45, 60, 60, 60, 60, 80]) {
    const before = errors.length;
    const ta = Date.now();
    try { await page.evaluate((d) => window.__cm.advance(d), chunk); }
    catch (e) { await problem(`advance ${chunk}`, e.message.split('\n')[0]); }
    if (errors.length > before) await problem(`advance (${await gs(() => window.__cm.gs().date)})`, `fejl: ${errors.slice(before).join(' | ').slice(0, 300)}`);
    const st = await gs(() => { const g = window.__cm.gs(); return { date: g.date, season: g.season, club: g.clubs[g.userClub]?.name ?? 'ARBEJDSLØS', conf: Math.round(g.board.confidence), bal: g.clubs[g.userClub]?.balance ?? 0, pend: g.pendingFixture }; });
    log(`  ${st.date} · ${st.club} · tillid ${st.conf} · saldo ${(st.bal / 1e6).toFixed(1)}m · ${Math.round((Date.now() - ta) / 1000)} s`);
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
}
log(`\n${SEASONS} sæsoner på ${Math.round((Date.now() - t0) / 60000)} min · ${issues.length} problemer`);
writeFileSync(`${OUT}/rapport.txt`, issues.join('\n'));
await browser.close();
stop();
process.exit(issues.length ? 1 : 0);
