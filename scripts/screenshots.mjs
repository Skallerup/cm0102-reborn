// Laver screenshots til forsiden (public/landing/*.webp) fra en rigtig spilsession.
// Kør: npm run dev (i en anden terminal) og derefter: node scripts/screenshots.mjs [url]
// Klublogoer blokeres, så billederne ikke indeholder varemærker (spillet viser sine egne farvemærker).
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://localhost:5173/cm0102-reborn/';
const out = 'public/landing';
const tmp = '/tmp/cm-shots';
mkdirSync(out, { recursive: true });
mkdirSync(tmp, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
await ctx.route(/cdn\.jsdelivr\.net\/gh\/luukhopman/, (r) => r.abort());
const page = await ctx.newPage();
const shots = [];
const shot = async (name, opts = {}) => {
  await page.waitForTimeout(350);
  const png = `${tmp}/${name}.png`;
  await page.screenshot({ path: png, ...opts });
  const webp = `${out}/${name}.webp`;
  execFileSync('cwebp', ['-quiet', '-q', '80', '-resize', opts.mobile ? '585' : '1600', '0', png, '-o', webp]);
  shots.push(webp);
};
const nav = (name) => page.locator('.sidenav').getByRole('button', { name: new RegExp(`^${name}`) }).click();

await page.goto(url);
  await page.locator('.lp-hero .lp-cta').click({ timeout: 5000 }).catch(() => {});
await page.getByRole('button', { name: 'Dansk' }).click();
await page.getByRole('button', { name: 'Nyt spil' }).click();
await page.getByPlaceholder('Dit navn').fill('Morten Olsen');
await page.getByText('FC København', { exact: true }).click();
await page.getByRole('button', { name: 'Start karrieren' }).click();
await page.getByText('Indbakke').first().waitFor({ timeout: 30000 });

// spol et stykke ind i sæsonen, så tabeller og statistik er fyldt
await page.evaluate(() => window.__cm.advance(60));
await page.evaluate(() => { const { gs, notify } = window.__cm; for (const n of gs().news) n.read = true; notify(); });

await nav('Taktik');
await shot('tactics');
await nav('Turneringer');
await shot('table');
await nav('Trup');
await page.locator('table.grid tbody tr').nth(1).click();
await shot('player');
await nav('Klub');
await shot('club');
await nav('Rangliste');
await shot('ranking');

// frem til næste kamp og se den live
for (let i = 0; i < 60; i++) {
  const label = await page.locator('.topbar .continue').textContent();
  if (label?.includes('Til kampen')) break;
  await page.getByRole('button', { name: 'Næste kamp »' }).click();
  await page.waitForTimeout(400);
}
await page.locator('.topbar .continue').click();
await page.getByRole('button', { name: /Kick-off/ }).waitFor({ timeout: 15000 });
await page.getByRole('button', { name: /Kick-off/ }).click();
await page.getByRole('button', { name: '4×' }).click().catch(() => {});
await page.waitForTimeout(3200);
await shot('match');
await page.getByRole('button', { name: 'Statistik' }).click();
await shot('match-stats');
const skip = page.getByRole('button', { name: 'Spring til slut' });
if (await skip.isVisible().catch(() => false)) await skip.click();
await page.getByRole('button', { name: 'Fortsæt ›' }).click();
await page.getByText('Kamprapport').waitFor();
await shot('report');

// pressemøde (efter kampen hvis inviteret, ellers et nyt)
const hasPress = await page.evaluate(() => !!window.__cm.gs().press);
if (hasPress) {
  await nav('Indbakke');
  const item = page.getByText(/Pressemøde|Pressen vil/).first();
  if (await item.isVisible().catch(() => false)) {
    await item.click();
    await page.getByRole('button', { name: 'Åbn' }).first().click();
    await page.locator('.panel button').first().click();
    await shot('press');
  }
}

// mobil
await page.setViewportSize({ width: 390, height: 844 });
await nav('Indbakke').catch(() => {});
await shot('mobile', { mobile: true });

await browser.close();
rmSync(tmp, { recursive: true, force: true });
console.log(shots.join('\n'));
