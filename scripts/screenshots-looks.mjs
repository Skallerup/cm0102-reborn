// Skærmbilleder til forsidens "To udseender": samme spil (samme seed) i det moderne og det klassiske tema.
// Kør: npm run dev (i en anden terminal) og derefter: node scripts/screenshots-looks.mjs [url]
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://localhost:5173/cm0102-reborn/';
const out = 'public/landing';
const tmp = '/tmp/cm-shots';
mkdirSync(out, { recursive: true });
mkdirSync(tmp, { recursive: true });
const browser = await chromium.launch();

for (const look of ['modern', 'classic']) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
  const page = await ctx.newPage();
  await page.addInitScript((theme) => { localStorage.setItem('cm0102.lang', 'en'); localStorage.setItem('cm-theme', theme); }, look === 'classic' ? 'retro' : 'club');
  const shot = async (name) => {
    await page.waitForTimeout(1200);
    const png = `${tmp}/${look}-${name}.png`;
    await page.screenshot({ path: png });
    execFileSync('cwebp', ['-quiet', '-q', '78', '-resize', '1600', '0', png, '-o', `${out}/${look}-${name}.webp`]);
    console.log(`${look}-${name}`);
  };
  await page.goto(url);
  await page.locator('.lp-hero .lp-cta').click({ timeout: 5000 }).catch(() => {});
  await page.getByRole('button', { name: /New game/ }).click();
  await page.getByPlaceholder('Your name').fill('Alex Morgan');
  await page.locator('input[type=number]').last().fill('20262027');
  await page.getByText('Aston Villa', { exact: true }).click();
  await page.getByRole('button', { name: 'Start career' }).click();
  await page.waitForTimeout(4000);
  await page.evaluate(() => window.__cm.advance(60));
  await page.evaluate(() => { const { gs, notify } = window.__cm; for (const n of gs().news) n.read = true; notify(); });
  await page.waitForTimeout(800);
  // truppens bedste spiller (samme i begge udseender)
  const star = await page.evaluate(() => { const g = window.__cm.gs(); return Object.values(g.players).filter((p) => p.club === g.userClub).sort((a, b) => b.ca - a.ca)[0].last; });
  if (look === 'modern') {
    const nav = async (name, group) => {
      const btn = page.locator('.sidenav').getByRole('button', { name: new RegExp(`^${name}`) });
      if (!(await btn.count()) && group) await page.locator('.sidenav .nav-head', { hasText: group }).first().click();
      await btn.first().click();
    };
    await nav('Squad'); await shot('squad');
    await page.locator('table.grid a', { hasText: star }).first().click(); await shot('player');
    await nav('Competitions', 'Matches'); await shot('table');
  } else {
    await page.locator('.cx-side .cx-mgr').click(); await page.locator('.cx-drop-pop button', { hasText: /Squad$/ }).click(); await shot('squad');
    await page.locator('.cx-sq-name', { hasText: star }).first().click(); await shot('player');
    await page.locator('.cx-side button', { hasText: 'Competitions' }).click(); await shot('table');
  }
  await ctx.close();
}
await browser.close();
