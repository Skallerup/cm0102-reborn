// Skærmbilleder til forsiden på hvert sprog med det lands egne klubber (public/landing/{sprog}/*.webp):
// kun det klassiske CM 01/02-udseende med den originale 2001/02-database (3.9.60).
// Starter selv Vite (dev-tilstand, så testkrogene __cm/__cmNav findes). Kør: node scripts/screenshots-i18n.mjs [sprog ...]
// (PORT=<n> vælger en anden port). Billederne: classic-start, -match, -report, -tactics, -squad, -news, -transfer, -player, -table.
import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import { chromium } from 'playwright';

const PORT = Number(process.env.PORT) || 5681;
const url = `http://localhost:${PORT}/cm0102-reborn/`;
// klub (id i world-original.json) pr. sprog
const CLUBS = {
  en: 676,   // Arsenal
  da: 3058,  // FC København
  es: 1066,  // Barcelona
  fr: 5759,  // Marseille
  de: 2585,  // Dortmund
  it: 5934,  // Milan
  pt: 2178,  // Corinthians
  tr: 3199,  // Fenerbahçe
  sv: 3913,  // Hammarby
  nb: 7755,  // Rosenborg
};
const world = JSON.parse(readFileSync('public/data/world-original.json', 'utf8'));
const clubInfo = (id) => { const c = world.clubs.find((x) => x[0] === id); return { club: c[2], nation: world.nations[c[3]].name }; };
const langs = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(CLUBS);
const tmp = '/tmp/cm-shots';
mkdirSync(tmp, { recursive: true });

const server = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { stdio: 'ignore', env: { ...process.env, BROWSER: 'none' } });
const stop = () => { try { server.kill(); } catch { /* ignorer */ } };
process.on('exit', stop);
for (let i = 0; i < 60; i++) { try { if ((await fetch(url)).ok) break; } catch { /* venter */ } await new Promise((r) => setTimeout(r, 500)); }
const browser = await chromium.launch();

async function run(lang) {
  const out = `public/landing/${lang}`;
  mkdirSync(out, { recursive: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log(`  [${lang}] fejl: ${e.message}`));
  await page.addInitScript((l) => { localStorage.setItem('cm0102.lang', l); localStorage.setItem('cm-theme', 'retro'); localStorage.setItem('cm0102.mode', 'authentic'); localStorage.setItem('cm0102.db', 'original'); localStorage.setItem('cm-cx-speed', '4'); sessionStorage.setItem('cm0102.play', '1'); }, lang);
  const go = (r) => page.evaluate((route) => window.__cmNav(route), r);
  const shot = async (name) => {
    await page.waitForTimeout(1200);
    const png = `${tmp}/${lang}-${name}.png`;
    await page.screenshot({ path: png });
    execFileSync('cwebp', ['-quiet', '-q', '78', '-resize', '1600', '0', png, '-o', `${out}/${name}.webp`]);
    console.log(`  ${lang}/${name}`);
  };
  const own = clubInfo(CLUBS[lang]);

  await page.goto(url);
  await page.waitForSelector('.cxs [data-field=new]', { timeout: 30000 });
  await page.waitForTimeout(1500);
  await shot('classic-start');
  await page.locator('[data-field=database]').click();
  await page.locator('[data-field="db-3.9.60"]').click();
  await page.locator('[data-field=new]').click();
  await page.waitForSelector('.cxs-lrow', { timeout: 60000 });
  const row = page.locator(`.cxs-lrow[data-nation="${own.nation}"]`);
  if ((await row.getAttribute('class'))?.includes('lg-sel') !== true) await row.locator('[data-sl=selected]').click();
  // alle andre forvalgte lande fravælges ikke – klubben skal bare findes
  await page.locator('.cx-foot .cx-next').click();
  await page.waitForSelector('[data-name=first]', { timeout: 20000 });
  await page.fill('[data-name=first]', 'Alex'); await page.fill('[data-name=second]', 'Morgan');
  await page.locator('.cx-foot .cx-next').click();
  await page.waitForSelector('[data-nat]');
  await page.locator('.cx-foot .cx-next').click();
  await page.waitForSelector('[data-club]', { timeout: 120000 });
  await page.locator(`[data-club="${own.club}"]`).click();
  await page.waitForSelector('[data-take]', { timeout: 20000 });
  await page.locator('[data-take]').click();
  await page.waitForSelector('[data-confirm]');
  await page.locator('.cx-foot .cx-next').click();
  await page.waitForFunction(() => { try { return !!window.__cm.gs().userClub && window.__cm.gs().manager.name.includes('Morgan'); } catch { return false; } }, null, { timeout: 120000 });
  await page.waitForTimeout(2500);
  await page.evaluate(() => { const g = window.__cm.gs(); for (const c of Object.values(g.clubs)) { c.sqnDue = undefined; c.euroDue = undefined; } });

  // frem til dagen før første kamp (originalens kalender: ca. 17/8-2001)
  await page.evaluate(async () => {
    const c = window.__cm; const g = c.gs();
    const f = Object.values(g.fixtures).filter((x) => x.home === g.userClub || x.away === g.userClub).sort((a, b) => a.date.localeCompare(b.date))[0];
    const d = new Date(f.date + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() - 1);
    await c.advance(Math.round((d.getTime() - new Date(g.date + 'T12:00:00Z').getTime()) / 864e5));
  });
  await page.evaluate(() => { const g = window.__cm.gs(); for (const p of Object.values(g.players)) if (p.club === g.userClub) p.injury = null; for (const c of Object.values(g.clubs)) { c.sqnDue = undefined; c.euroDue = undefined; } window.__cm.notify(); });
  await go({ name: 'inbox' }); await shot('classic-news');
  await go({ name: 'squad' }); await shot('classic-squad');
  await go({ name: 'tactics' }); await shot('classic-tactics');
  const star = await page.evaluate(() => { const g = window.__cm.gs(); return Object.values(g.players).filter((p) => p.club === g.userClub).sort((a, b) => b.ca - a.ca)[0].id; });
  await go({ name: 'player', id: star }); await shot('classic-player');
  await go({ name: 'competitions' }); await shot('classic-table');

  // transferbud: et bud på en stjerne hos en anden klub, dagene efter svarer klubben
  const target = await page.evaluate(() => {
    const g = window.__cm.gs(); const me = g.clubs[g.userClub];
    const lg = Object.values(g.clubs).filter((c) => c.league === me.league && c.id !== me.id);
    const ps = Object.values(g.players).filter((p) => lg.some((c) => c.id === p.club)).sort((a, b) => b.ca - a.ca);
    return ps[Math.floor(ps.length * 0.02)]?.id ?? ps[0].id;
  });
  await go({ name: 'player', id: target });
  await page.waitForTimeout(500);
  // Action → Approach To Buy (andet punkt) åbner originalens budskærm
  await page.locator('.cx-act .cx-drop-btn').click();
  await page.locator('.cx-drop-pop button').nth(1).click();
  await page.waitForTimeout(800);
  await shot('classic-transfer');

  // kampen: Kick Off og lidt spil
  await page.locator('.cx-foot .cx-back, .cx-foot-btns button').first().click({ timeout: 3000 }).catch(() => {});
  await go({ name: 'inbox' });
  await page.waitForTimeout(500);
  const kickLabel = await page.evaluate(() => window.__cm.t('cl.mt.kickoff'));
  const contLabel = await page.evaluate(() => window.__cm.t('cl.continue'));
  const kick = page.getByRole('button', { name: kickLabel }).first();
  for (let i = 0; i < 60 && !(await kick.isVisible().catch(() => false)); i++) {
    await page.evaluate(() => { const { gs, notify } = window.__cm; for (const n of gs().news) n.read = true; notify(); });
    const yes = page.locator('.cx-confirm button.primary');
    if (await yes.isVisible().catch(() => false)) await yes.click({ timeout: 2000 }).catch(() => {});
    else await page.getByRole('button', { name: contLabel }).first().click({ timeout: 2000 }).catch(() => {});
    await page.waitForTimeout(500);
  }
  if (!(await kick.isVisible().catch(() => false))) await page.screenshot({ path: '/private/tmp/claude-501/-Users-martinskallerup-cm0102/f457e0b2-8651-4321-abbf-468fa7b4e9d1/scratchpad/debug.png' });
  await kick.click({ timeout: 10000 }).catch(async (e) => { await page.screenshot({ path: '/private/tmp/claude-501/-Users-martinskallerup-cm0102/f457e0b2-8651-4321-abbf-468fa7b4e9d1/scratchpad/debug.png' }); throw e; });
  await page.waitForTimeout(500);
  // spil til ca. 55. minut (tavlen viser minuttet øverst i sidebjælken) – og vis Match Overview og Match Stats
  for (let i = 0; i < 1500; i++) {
    const min = await page.evaluate(() => Number((document.querySelector('.cx-side')?.textContent ?? '').trim().match(/^\d+/)?.[0] ?? '0'));
    if (min >= 55) break;
    await page.waitForTimeout(100);
  }
  await shot('classic-match');
  await page.locator('.cx-tabrow button').nth(1).click().catch(() => {});
  await shot('classic-report');
  await ctx.close();
}

for (const lang of langs) {
  console.log(lang);
  try { await run(lang); } catch (e) { console.log(`  FEJL ${lang}: ${e.message.split('\n')[0]}`); }
}
await browser.close();
stop();
rmSync(tmp, { recursive: true, force: true });
process.exit(0);
