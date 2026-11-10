// Skærmbilleder til forsiden på hvert sprog med det lands egne klubber (public/landing/{sprog}/*.webp):
// det moderne tema med 2026/27-databasen og det klassiske tema med den originale 2001/02-database.
// Kør: npm run dev (i en anden terminal) og derefter: node scripts/screenshots-i18n.mjs [sprog ...]
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { chromium } from 'playwright';

const url = process.env.URL ?? 'http://localhost:5173/cm0102-reborn/';
// [moderne klub (2026/27), klassisk klub (2001/02)] – id'er i world.json / world-original.json
const CLUBS = {
  en: [7023, 867],   // Man Utd, Arsenal
  da: [1920, 3806],  // Brøndby, FC København
  es: [9413, 1340],  // Real Madrid, Barcelona
  fr: [8593, 7136],  // PSG, Marseille
  de: [3766, 3234],  // Bayern, Dortmund
  it: [5691, 7369],  // Juventus, Milan
  pt: [4058, 2727],  // Flamengo, Corinthians
  tr: [4274, 3979],  // Galatasaray, Fenerbahçe
  sv: [7008, 4833],  // Malmö FF, Hammarby
  nb: [1703, 9665],  // Bodø/Glimt, Rosenborg
};
const langs = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(CLUBS);
const tmp = '/tmp/cm-shots';
mkdirSync(tmp, { recursive: true });
const browser = await chromium.launch();

async function run(lang, look) {
  const out = `public/landing/${lang}`;
  mkdirSync(out, { recursive: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log(`  [${lang}/${look}] fejl: ${e.message}`));
  await page.addInitScript(([l, theme]) => { localStorage.setItem('cm0102.lang', l); localStorage.setItem('cm-theme', theme); sessionStorage.setItem('cm0102.play', '1'); }, [lang, look === 'classic' ? 'retro' : 'club']);
  const t = (k) => page.evaluate((key) => window.__cm.t(key), k);
  const go = (r) => page.evaluate((route) => window.__cmNav(route), r);
  const shot = async (name, opts = {}) => {
    await page.waitForTimeout(1200);
    const png = `${tmp}/${lang}-${name}.png`;
    await page.screenshot({ path: png });
    execFileSync('cwebp', ['-quiet', '-q', '78', '-resize', opts.mobile ? '585' : '1600', '0', png, '-o', `${out}/${name}.webp`]);
    console.log(`  ${lang}/${name}`);
  };

  await page.goto(url);
  // sv/nb m.fl. hentes ved behov – vent på oversættelsen, før knapperne findes på navn
  await page.waitForFunction(() => window.__cm?.t('start.new') !== 'New game', null, { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: await t('start.new') }).first().click();
  if (look === 'classic') await page.locator('.db-opt').nth(1).click();
  await page.waitForFunction(() => !!window.__cmPick, null, { timeout: 30000 });
  await page.waitForTimeout(look === 'classic' ? 3500 : 1500);
  await page.getByPlaceholder(await t('start.managerPlaceholder')).fill('Alex Morgan');
  await page.locator('input[type=number]').last().fill('20262027');
  const club = CLUBS[lang][look === 'classic' ? 1 : 0];
  if (!(await page.evaluate((id) => window.__cmPick(id), club))) throw new Error(`klub ${club} findes ikke`);
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: await t('start.begin') }).click();
  await page.waitForFunction(() => { try { return !!window.__cm.gs().userClub; } catch { return false; } }, null, { timeout: 60000 });
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.__cm.advance(60));
  await page.evaluate(() => { const { gs, notify } = window.__cm; for (const n of gs().news) n.read = true; notify(); });
  await page.waitForTimeout(800);
  const star = await page.evaluate(() => { const g = window.__cm.gs(); return Object.values(g.players).filter((p) => p.club === g.userClub).sort((a, b) => b.ca - a.ca)[0].id; });
  const prefix = look === 'classic' ? 'classic' : 'modern';
  await go({ name: 'squad' }); await shot(`${prefix}-squad`);
  await go({ name: 'player', id: star }); await shot(`${prefix}-player`);
  await go({ name: 'competitions' }); await shot(`${prefix}-table`);
  if (look === 'classic') { await ctx.close(); return; }

  // det moderne tema: resten af forsidens billeder
  await go({ name: 'tactics' }); await shot('tactics');
  await go({ name: 'club' }); await shot('club');
  await go({ name: 'ranking' }); await shot('ranking');
  // frem til næste kamp og se den live
  const kick = await t('match.kickoff'), toThe = await t('top.toTheMatch'), toNext = await t('top.toMatch');
  for (let i = 0; i < 80; i++) {
    if (await page.getByRole('button', { name: kick }).count()) break;
    const b = page.getByRole('button', { name: toThe }).first();
    if (await b.isVisible().catch(() => false)) { await b.click(); await page.waitForTimeout(600); continue; }
    await page.getByRole('button', { name: toNext }).first().click().catch(() => {});
    await page.waitForTimeout(600);
  }
  await page.getByRole('button', { name: kick }).click();
  await page.getByRole('button', { name: '4×' }).click().catch(() => {});
  await page.waitForTimeout(3200);
  await shot('match');
  await page.getByRole('button', { name: await t('match.stats') }).click();
  await shot('match-stats');
  const skip = page.getByRole('button', { name: await t('match.toEnd') });
  if (await skip.isVisible().catch(() => false)) await skip.click();
  await page.getByRole('button', { name: await t('match.continue') }).click();
  await page.waitForTimeout(1500);
  await shot('report');
  // ingen invitation efter kampen: indkald selv til pressemøde om den spillede kamp
  await page.evaluate(() => { const { gs, invitePress, notify } = window.__cm; const g = gs(); if (g.press) return;
    const f = Object.values(g.fixtures).filter((x) => x.result && (x.home === g.userClub || x.away === g.userClub)).sort((a, b) => b.date.localeCompare(a.date))[0];
    for (let i = 0; f && !g.press && i < 40; i++) invitePress(f, 'post'); // tilfældigt, om pressen møder op
    notify(); });
  if (await page.evaluate(() => !!window.__cm.gs().press)) {
    await go({ name: 'press' });
    await page.waitForTimeout(800);
    await page.locator('.panel button').first().click().catch(() => {});
    await shot('press');
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await go({ name: 'inbox' });
  await shot('mobile', { mobile: true });
  await ctx.close();
}

for (const lang of langs) {
  for (const look of ['modern', 'classic']) {
    console.log(`${lang} – ${look}`);
    try { await run(lang, look); } catch (e) { console.log(`  FEJL ${lang}/${look}: ${e.message.split('\n')[0]}`); }
  }
}
await browser.close();
rmSync(tmp, { recursive: true, force: true });
