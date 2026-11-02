// Fokuseret røgtest: nyt spil på default-databasen (CM 2026/27), spol frem og åbn Champions League
// for at bekræfte at den nye 36-holds ligafase-tabel renderes i UI'et uden konsolfejl.
// Kør: npm run dev (i en anden terminal), derefter: node scripts/smoke-cl.mjs [url]
import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://localhost:5173/cm0102-reborn/';
const errors = [];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });

const log = (s) => console.log(s);

await page.goto(url);
await page.getByRole('button', { name: 'DA', exact: true }).click().catch(() => {});
await page.waitForTimeout(300);
await page.getByRole('button', { name: /Spil( gratis)? nu/ }).first().click();
await page.waitForTimeout(300);
log('✓ startskærm (dansk)');

await page.getByRole('button', { name: 'Nyt spil' }).click();
await page.getByPlaceholder('Dit navn').fill('CL Tester');
await page.locator('.sel, select').first().waitFor();
// standard-ligaen er engelsk – vælg Liverpool
await page.getByText('Liverpool', { exact: true }).click();
await page.getByRole('button', { name: 'Start karrieren' }).click();
await page.getByText('Indbakke').first().waitFor({ timeout: 30000 });
log('✓ nyt spil startet (CM 2026/27)');

// bekræft sæson og CL-struktur via dev-hook
const info = await page.evaluate(() => {
  const g = window.__cm.gs();
  const cl = g.comps.CL;
  return { season: g.season, date: g.date, source: g.options, dbKind: g.dbKind, clClubs: cl?.clubs.length, clTable: cl?.table.length, clStage: cl?.stage };
});
log(`  season=${info.season} date=${info.date} dbKind=${info.dbKind} | CL: ${info.clClubs} hold, tabel ${info.clTable}, stage ${info.clStage}`);
if (info.season !== 2026) throw new Error(`forventede season 2026, fik ${info.season}`);
if (info.clClubs !== 36 || info.clTable !== 36) throw new Error(`forventede 36-holds CL, fik ${info.clClubs}/${info.clTable}`);

// spol ~140 dage frem, så ligafasen har spillet nogle runder
await page.evaluate(() => window.__cm.advance(140));
await page.waitForTimeout(500);
log('✓ spolet ~140 dage frem');

// udvid KAMPE-gruppen og åbn Turneringer → Champions League
await page.locator('.sidenav button', { hasText: 'KAMPE' }).first().click();
await page.waitForTimeout(200);
await page.locator('.sidenav').getByRole('button', { name: 'Turneringer', exact: true }).click();
await page.waitForTimeout(300);
await page.locator('.sel').first().click();
await page.waitForTimeout(150);
// søgefelt vises kun ved >10 valg; ellers vælges direkte i listen
const search = page.locator('.sel-search');
if (await search.count()) await search.fill('Champions');
await page.locator('.sel-opt', { hasText: 'Champions League' }).first().click();
await page.waitForTimeout(400);

// bekræft at ligafase-tabellen renderes (panel med titlen "Ligafase, runde")
const panel = page.locator('.panel', { hasText: 'Ligafase' }).first();
await panel.waitFor({ timeout: 5000 });
const rows = await panel.locator('table.grid tbody tr').count();
log(`✓ Champions League-ligafase renderet med ${rows} rækker`);
await page.screenshot({ path: 'smoke-shots/cl-league-phase.png' });
if (rows < 30) throw new Error(`forventede ~36 rækker i ligafase-tabellen, fik ${rows}`);

await browser.close();
if (errors.length) {
  console.log(`\n${errors.length} konsolfejl:\n` + [...new Set(errors)].slice(0, 15).join('\n'));
  process.exit(1);
}
console.log('\nIngen konsolfejl – CL-ligafase virker i UI ✔');
