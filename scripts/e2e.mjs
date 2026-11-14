// Ende-til-ende-test i en rigtig browser: klassisk og moderne udseende.
// Starter selv Vite (dev-tilstand, så testkrogene __cm/__cmNav/__cmPick findes), klikker igennem alle hovedskærme,
// tester taktikskærmen (byt spillere, flyt pladser, instruktioner) og spiller en hel kamp.
// Fejler ved sidefejl, tomme skærme eller rå oversættelsesnøgler. Kør: node scripts/e2e.mjs [klassisk|moderne|editor]
// Det moderne udseende er slået fra for nu (src/ui/modernFlag.ts): 'moderne' springes over i standardkørslen og kører kun med `node scripts/e2e.mjs moderne`
// (eller E2E_MODERN=1) – testen slår det til via localStorage cm0102.modern (kun i DEV).
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const PORT = Number(process.env.PORT) || 5187; // PORT=<n>: en anden port, når en anden e2e kører (strictPort ville ellers teste den andens server)
const URL = `http://localhost:${PORT}/cm0102-reborn/`;
const OUT = 'e2e-shots';
const only = process.argv[2];
// E2E_ENGINE=original: den originale database (Arsenal) med originalens kampmotor (gittermotoren) – kun klassisk
const ENGINE_GRID = process.env.E2E_ENGINE === 'original';
mkdirSync(OUT, { recursive: true });

const server = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { stdio: 'ignore', env: { ...process.env, BROWSER: 'none' } });
const stop = () => { try { server.kill(); } catch { /* ignorer */ } };
process.on('exit', stop);
for (let i = 0; i < 60; i++) {
  try { if ((await fetch(URL)).ok) break; } catch { /* venter */ }
  await new Promise((r) => setTimeout(r, 500));
}

const failures = [];
const browser = await chromium.launch();
// rå i18n-nøgler, der er sluppet igennem (fx "pi.holdUp" eller "c.own-goal.1")
const RAW_KEY = /\b(?:c|cl|pi|pih|ti|tih|tac|acc|pitch|ref|sp|match|nav|opt|wx|top)\.[a-z][\w-]*(?:\.[\w-]+)*\b/;

async function run(look) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  // kontoens API findes ikke lokalt: lad som om login kan bruges (spørgsmålet om konto/opdateringsmails efter første sæson)
  const prompts = [];
  await page.route(/\/api\/account\?op=(config|prompt)/, async (r) => {
    if (r.request().url().includes('op=prompt')) { prompts.push(JSON.parse(r.request().postData() ?? '{}').answer); return r.fulfill({ json: { ok: true } }); }
    return r.fulfill({ json: { mail: true } });
  });
  const errors = [];
  page.on('pageerror', (e) => { errors.push(e.message); if (process.env.E2E_STACK) console.error('PAGEERROR', e.stack); });
  await page.addInitScript(({ theme, grid }) => { localStorage.setItem('cm0102.lang', 'en'); localStorage.setItem('cm0102.forceLogin', '1'); localStorage.setItem('cm-theme', theme); if (theme !== 'retro') localStorage.setItem('cm0102.modern', '1'); localStorage.setItem('cm0102.mode', grid ? 'authentic' : 'extended'); localStorage.setItem('cm0102.db', localStorage.getItem('cm0102.db') ?? (grid ? 'original' : 'modern')); if (grid) localStorage.setItem('cm0102.engine', 'original'); sessionStorage.setItem('cm0102.play', '1'); }, { theme: look === 'klassisk' ? 'retro' : 'club', grid: ENGINE_GRID });
  // NB: ægte CM 01/02 er standard ved nyt spil – testen kører det udvidede spil (træningskampe, pressemøder m.m.)
  const t = (k) => page.evaluate((key) => window.__cm.t(key), k);
  const go = (r) => page.evaluate((route) => window.__cmNav(route), r);
  const gs = (fn, arg) => page.evaluate(fn, arg);
  // klassisk taktik (CM 01/02): ændringer er en kladde, der først gemmes med Ok i bundbjælken
  const tacOk = async () => { if (look !== 'klassisk') return; await page.locator('.cx-foot .cx-tac-ok').click(); await page.waitForTimeout(150); };
  // klassisk (CM 01/02): Continue Game venter på trøjenummerlisten (beskeden 4/8) – Respond → Submit → Yes
  let sqnMissingSeen = false;
  const answerSquadNumbers = async () => {
    // før en kamp: spillere uden nummer (Squad Numbers med kun dem) – giv hver et ledigt nummer og Submit
    if (await page.locator('.cx-sqn').isVisible().catch(() => false) && await page.locator('.cx-sqn-box:empty').count()) {
      for (let k = 0; k < 5 && await page.locator('.cx-sqn-box:empty').count(); k++) {
        await page.locator('.cx-sqn-n.free:not([disabled])').first().click();
        await page.locator('.cx-sqn-box:empty').first().click();
      }
      sqnMissingSeen = true;
      if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-troejenumre-foer-kamp.png` });
      await page.locator('.cx-foot-btns button.primary').click();
      await page.waitForTimeout(300);
      return true;
    }
    // European Squad (31/8): Respond → Auto → Submit
    if (await gs(() => { const g = window.__cm.gs(); return g.clubs[g.userClub]?.euroDue === g.season; })) {
      if (await page.locator('.cx-eur').isVisible().catch(() => false)) { await page.locator('.cx-eur .cx-sqn-bar .cx-grey').first().click(); await page.locator('.cx-foot-btns button.primary').click(); }
      else if (await page.locator('.cx-respond').isVisible().catch(() => false)) await page.locator('.cx-respond').first().click();
      else return false;
      await page.waitForTimeout(300);
      return true;
    }
    if (!(await gs(() => { const g = window.__cm.gs(); return g.clubs[g.userClub]?.sqnDue === g.season; }))) return false;
    if (await page.locator('.cx-foot-btns button.primary').isVisible().catch(() => false)) await page.locator('.cx-foot-btns button.primary').click();
    else if (await page.locator('.cx-respond').isVisible().catch(() => false)) await page.locator('.cx-respond').first().click();
    else return false;
    await page.waitForTimeout(300);
    return true;
  };
  let n = 0;
  const step = async (name, fn) => {
    const before = errors.length;
    const t0 = Date.now();
    try {
      await fn();
      if (errors.length > before) throw new Error(`sidefejl: ${errors.slice(before).join(' | ')}`);
      console.log(`  ✓ ${look}: ${name} (${Date.now() - t0} ms)`);
    } catch (e) {
      failures.push(`${look}: ${name}: ${e.message.split('\n')[0]}`);
      console.log(`  ✗ ${look}: ${name}: ${e.message.split('\n')[0]}`);
      await page.screenshot({ path: `${OUT}/${look}-fejl-${++n}.png` }).catch(() => {});
    }
  };
  /** Skærmen skal have indhold og må ikke vise rå nøgler */
  const checkScreen = async (name) => {
    await page.waitForTimeout(350);
    const text = await page.locator('body').innerText();
    if (text.trim().length < 150) throw new Error(`${name}: skærmen er (næsten) tom`);
    const raw = text.match(RAW_KEY);
    if (raw) throw new Error(`${name}: rå oversættelsesnøgle "${raw[0]}"`);
  };

  // klassisk: originalens startmenu og forløb (ClassicStart.tsx): menu → Select League(s) → Enter Name → Select Nationality → Select Team →
  // klubbens trup (Take Control) → Please Confirm → Initialising game data
  if (look === 'klassisk') await step('nyt spil (klassisk startforløb)', async () => {
    await page.goto(URL);
    await page.waitForSelector('.cxs [data-field=new]');
    for (const f of ['database', 'rules', 'new', 'quick', 'restore', 'delete', 'network', 'settings', 'opts', 'extras']) if (!(await page.locator(`[data-field="${f}"]`).count())) throw new Error(`startmenuen mangler feltet ${f}`);
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-start-01-menu.png` });
    // databasevalget (øverste venstre felt): udgaver af den originale + 2026/27; vælg den, testen skal bruge
    await page.locator('[data-field=database]').click();
    if ((await page.locator('.cxs-grid.db .cxs-field').count()) < 4) throw new Error('databasevalget har for få valg');
    await page.locator(ENGINE_GRID ? '[data-field="db-3.9.60"]' : '[data-field="db-modern"]').click();
    // gemte spil og indstillinger åbner egne skærme og kan forlades igen
    await page.locator('[data-field=settings]').click(); await page.waitForSelector('.cxs-settings'); await page.locator('.cx-foot .cx-back').click();
    await page.locator('[data-field=restore]').click(); await page.waitForSelector('[data-saves]'); await page.locator('.cx-foot .cx-back').click();
    await page.waitForSelector('[data-field=new]');
    await page.locator('[data-field=new]').click();
    await page.waitForSelector('.cxs-lrow', { timeout: 60000 });
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-start-02-leagues.png` });
    const own = ENGINE_GRID ? { club: 'Arsenal', nation: 'England' } : { club: 'Brøndby', nation: 'Denmark' };
    if (own.nation !== 'England') await page.locator(`.cxs-lrow[data-nation="${own.nation}"] [data-sl=selected]`).click();
    if ((await page.locator('.cxs-lrow.lg-sel').count()) < 1) throw new Error('intet land er valgt');
    // BACKGROUND: et land kan sættes som baggrundsland (kun i baggrunden, ikke spilbart) og fjernes igen; SELECTED gør det spilbart
    const bgRow = page.locator('.cxs-lrow[data-nation="France"]');
    await bgRow.locator('[data-sl=background]').click();
    if ((await bgRow.getAttribute('data-state')) !== 'background') throw new Error('BACKGROUND kan ikke vælges');
    await bgRow.locator('[data-sl=background]').click();
    if ((await bgRow.getAttribute('data-state')) !== 'off') throw new Error('BACKGROUND kan ikke fravælges');
    await bgRow.locator('[data-sl=background]').click();
    if ((await page.locator('.cxs-lrow.lg-sel [data-sl=selected].on').count()) < 1) throw new Error('SELECTED er ikke markeret');
    // som i originalen står den laveste spilbare division kun ved et valgt land med flere end to divisioner (England)
    if (own.nation === 'England' && !(await page.locator('.cxs-lrow.lg-sel .lw').first().innerText()).trim()) throw new Error('laveste division mangler for et valgt land');
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-start-02b-leagues-bg.png` });
    await page.locator('.cx-foot .cx-next').click();
    await page.waitForSelector('[data-name=first]', { timeout: 20000 });
    await page.fill('[data-name=first]', 'E2E'); await page.fill('[data-name=second]', 'Tester');
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-start-03-name.png` });
    await page.locator('.cx-foot .cx-next').click();
    await page.waitForSelector('[data-nat]');
    if ((await page.locator('.cxs-it.sel').count()) !== 1) throw new Error('ingen forvalgt nationalitet');
    await page.locator('.cx-foot .cx-next').click();
    // Select Team venter på den midlertidige verden (bygges, mens man skriver navn) – baggrundslandet (Frankrig) har ingen spilbare klubber
    await page.waitForSelector('[data-club]', { timeout: 120000 });
    if (await page.locator('[data-club="Paris Saint-Germain"]').count()) throw new Error('et BACKGROUND-lands klub kan vælges');
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-start-06-team.png` });
    await page.locator(`[data-club="${own.club}"]`).click();
    // klubbens ÆGTE skærme: spillets egen trup (SquadClassic), faner og nederste knapper, Take Control i titelbjælken
    await page.waitForSelector('.cx-sq-orig, .cx-sq-cols', { timeout: 20000 });
    if ((await page.locator('.cx-sq-row, .cx-sq-name').count()) < 11) throw new Error('klubbens trup er tom');
    if ((await page.locator('.cx-tabrow button').count()) < 5) throw new Error('klubbens faner mangler');
    if (!(await page.locator('[data-take]').count())) throw new Error('Take Control mangler i titelbjælken');
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-start-07-club.png` });
    await page.locator('.cx-tabrow button', { hasText: /Info/ }).last().click();
    await page.waitForTimeout(400);
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-start-08-info.png` });
    // Back i bundbjælken fører til holdlisten, når der ikke er flere trin i klubbens egen historik
    await page.locator('.cx-foot .cx-back').click();
    if (!(await page.locator('[data-club]').count())) { await page.locator('.cx-foot .cx-back').click(); }
    await page.waitForSelector('[data-teams]');
    await page.locator(`[data-club="${own.club}"]`).click();
    // Take Control → Please Confirm → No (tilbage til klubben) → igen → Yes
    await page.locator('[data-take]').click();
    await page.waitForSelector('[data-confirm]');
    if (!(await page.locator('[data-confirm]').innerText()).includes(own.club)) throw new Error('bekræftelsen nævner ikke klubben');
    if (process.env.SHOTS) { await page.waitForTimeout(700); await page.screenshot({ path: `${OUT}/klassisk-start-09-confirm.png` }); }
    await page.locator('.cx-foot .cx-back').click();
    await page.waitForSelector('[data-teams]');
    await page.locator(`[data-club="${own.club}"]`).click();
    await page.waitForSelector('[data-take]');
    await page.locator('[data-take]').click();
    await page.waitForSelector('[data-confirm]');
    await page.locator('.cx-foot .cx-next').click();
    // indlæsningen vises i skærmens bund med trin og procent; siden må ikke fryse
    const t0 = Date.now();
    await page.waitForSelector('.cx-running .cx-run-bar', { timeout: 20000 });
    const barW = await page.locator('.cx-running .cx-run-bar').evaluate((el) => el.getBoundingClientRect().width);
    if (barW < 300) throw new Error(`indlæsningsbjælken er kun ${Math.round(barW)} px bred (skal fylde bundbjælken)`);
    await page.screenshot({ path: `${OUT}/${look}-nyt-spil-loader.png` });
    await page.waitForFunction(() => { try { return window.__cm.gs().manager.name === 'E2E Tester' && !!window.__cm.gs().userClub; } catch { return false; } }, null, { timeout: 90000 });
    const mgr = await page.evaluate(() => window.__cm.gs().manager.name);
    if (mgr !== 'E2E Tester') throw new Error(`managerens navn blev "${mgr}"`);
    if (ENGINE_GRID) console.log(`    nyt spil: ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  });
  else await step('nyt spil', async () => {
    await page.goto(URL);
    await page.getByRole('button', { name: await t('start.new') }).first().click();
    await page.waitForFunction(() => !!window.__cmPick, null, { timeout: 30000 });
    await page.getByPlaceholder(await t('start.managerPlaceholder')).fill('E2E Tester');
    // valget af officiel 01/02-database: tre udgaver under den originale – og tilbage til standarddatabasen
    if (look === 'moderne') {
      await page.locator('.db-opt', { hasText: await t('db.original') }).first().click();
      await page.locator('.db-ver-opt').nth(2).click();
      if ((await page.locator('.db-ver-opt').count()) !== 3) throw new Error('versionsvalget mangler');
      if ((await page.evaluate(() => localStorage.getItem('cm0102.dbver'))) !== '3.9.68') throw new Error('3.9.68 blev ikke valgt');
      await page.locator('.db-ver-opt').first().click();
      await page.locator('.db-opt', { hasText: await t('db.modern') }).first().click();
      await page.waitForFunction(() => !!window.__cmPick, null, { timeout: 30000 });
      await page.waitForTimeout(1500);
    }
    if (!(await page.evaluate((id) => window.__cmPick(id), ENGINE_GRID ? 676 : 1920))) throw new Error('klubben findes ikke');
    await page.getByRole('button', { name: await t('start.begin') }).click();
    // nyt spil kører i en Web Worker med en indlæsningsskærm (NewGameLoader) – siden må ikke fryse
    const t0 = Date.now();
    if (ENGINE_GRID) {
      await page.waitForSelector('.ng-loader .ng-bar span.on', { timeout: 20000 });
      await page.screenshot({ path: `${OUT}/${look}-nyt-spil-loader.png` });
    }
    await page.waitForFunction(() => { try { return !!window.__cm.gs().userClub; } catch { return false; } }, null, { timeout: 90000 });
    if (ENGINE_GRID) console.log(`    nyt spil: ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  });

  const star = await gs(() => { const g = window.__cm.gs(); return Object.values(g.players).filter((p) => p.club === g.userClub).sort((a, b) => b.ca - a.ca)[0]?.id; });
  const other = await gs(() => { const g = window.__cm.gs(); return Object.values(g.clubs).find((c) => c.id !== g.userClub && c.league === g.clubs[g.userClub].league)?.id; });
  // ægte CM 01/02 (klassisk): ingen er udtaget fra start (alle blå felter tomme) – Assistant ▸ Assistant Picks udtager holdet
  if (look === 'klassisk') await step('ingen udtaget fra start – Assistant Picks (klassisk)', async () => {
    await go({ name: 'squad' });
    await page.waitForTimeout(400);
    const n0 = await gs(() => { const g = window.__cm.gs(); return g.options.mode === 'authentic' ? g.tactic.lineup.filter(Boolean).length + g.tactic.bench.length : -1; });
    if (n0 > 0) throw new Error(`${n0} spillere er udtaget fra start`);
    if (n0 === 0) {
      if (await page.locator('.cx-selbtn.xi, .cx-selbtn.bench').count()) throw new Error('udtagelsesfelter er farvet fra start');
      await page.locator('.cx-drop-btn', { hasText: /^Assistant/ }).first().click();
      await page.locator('.cx-drop-pop button, .cx-drop-pop .cx-drop-item', { hasText: 'Assistant Picks' }).first().click();
      await page.waitForTimeout(300);
      if ((await gs(() => window.__cm.gs().tactic.lineup.filter(Boolean).length)) !== 11) throw new Error('assistenten udtog ikke 11 spillere');
    }
  });
  const screens = [
    { name: 'inbox' }, { name: 'squad' }, { name: 'player', id: star }, { name: 'tactics' }, { name: 'training' }, { name: 'fixtures' },
    { name: 'competitions' }, { name: 'competitions', id: 'CL' }, { name: 'international' }, { name: 'international', tab: 'fifa' }, { name: 'international', id: await gs(() => window.__cm.gs().clubs[window.__cm.gs().userClub].nation) }, { name: 'transfers' }, { name: 'scouting' }, { name: 'staff' }, { name: 'finance' }, { name: 'club', id: other },
    { name: 'club' }, { name: 'board' }, { name: 'assistant' }, { name: 'history' }, { name: 'awards' }, { name: 'jobs' }, { name: 'managers' },
    { name: 'find' }, { name: 'staff', id: Number(await gs(() => Object.keys(window.__cm.gs().staff)[0])) }, { name: 'nation', tab: 'managers' }, { name: 'nation', tab: 'jobs' }, { name: 'nation', tab: 'transfers' }, { name: 'options' }, { name: 'help' },
  ];
  for (const [i, r] of screens.entries()) await step(`skærm ${r.name}${r.id ? ` (${r.id})` : ''}`, async () => { await go(r); await checkScreen(r.name); if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/${look}-s${String(i).padStart(2, '0')}-${r.name}.png` }); });
  // standardbaggrunden i klassisk = originalens billeder (/original-bg/); nulstil sættet, hvis noget har gemt et andet
  if (look === 'klassisk') await step('baggrund fra originalen', async () => {
    for (const r of [{ name: 'inbox' }, { name: 'squad' }, { name: 'club' }, { name: 'training' }, { name: 'board' }, { name: 'transfers' }, { name: 'find' }]) {
      await go(r);
      await page.waitForFunction(() => document.documentElement.style.getPropertyValue('--cx-photo').includes('/original-bg/'), null, { timeout: 8000 })
        .catch(async () => { throw new Error(`${r.name}: baggrunden er ikke fra /original-bg/ (${await page.evaluate(() => document.documentElement.style.getPropertyValue('--cx-photo'))})`); });
      const ok = await page.evaluate(async () => { const u = document.documentElement.style.getPropertyValue('--cx-photo').match(/url\("?([^")]+)/)?.[1]; return u ? (await fetch(u)).ok : false; });
      if (!ok) throw new Error(`${r.name}: baggrundsbilledet kan ikke hentes`);
    }
  });
  if (look === 'klassisk') await step('competitions-menu', async () => {
    await page.locator('.cx-side .cx-sbtn', { hasText: /^Competitions$/ }).click();
    await page.locator('.cx-drop-subbtn', { hasText: 'World Cup' }).hover();
    await page.locator('.cx-drop-sub button', { hasText: 'FIFA World Cup' }).click();
    await page.waitForSelector('.cx-tbl, .cx-empty');
    await page.screenshot({ path: `${OUT}/klassisk-vm-historie.png` });
    await page.locator('.cx-side .cx-sbtn', { hasText: /^Competitions$/ }).click();
    await page.locator('.cx-drop-subbtn').nth(3).hover();
    await page.screenshot({ path: `${OUT}/klassisk-competitions-menu.png` });
    await page.locator('.cx-drop-sub button').first().click();
    await checkScreen('competitions');
  });
  if (look === 'klassisk') await step('nations & clubs-menuen (klassisk)', async () => {
    await page.locator('.cx-side .cx-drop-btn', { hasText: 'Nations' }).first().click();
    await page.locator('.cx-drop-pop button', { hasText: 'Major Clubs' }).first().hover();
    await page.locator('.cx-drop-sub button', { hasText: 'Europe' }).first().click();
    await page.waitForSelector('.cx-nc .cx-nc-row', { timeout: 5000 });
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-nationsclubs.png` });
    for (const tab of ['Nations', 'Under-21s']) { await page.getByRole('button', { name: tab, exact: true }).first().click(); await page.waitForTimeout(100); }
    for (const tab of ['League', 'Non-League', 'Other']) { await page.locator('.cx-subrow button', { hasText: tab }).first().click(); await page.waitForTimeout(100); }
    await page.locator('.cx-nc .cx-nc-row .cx-link').first().click();
    await page.waitForTimeout(300);
    await checkScreen('club fra Nations & Clubs');
  });
  if (look === 'klassisk') await step('staff search (klassisk)', async () => {
    await go({ name: 'transfers' });
    await page.getByRole('button', { name: 'Staff Search', exact: true }).first().click();
    await page.waitForTimeout(300);
    await checkScreen('staff search');
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-staffsearch.png` });
  });
  // runde 2 (ejerens billeder 300-309): Last Match uden kampe, målmandsegenskaber, Short List-filtre, spejdere, træning med træk og slip
  if (look === 'klassisk') await step('Last Match uden kampe (klassisk)', async () => {
    await go({ name: 'club' });
    await page.waitForTimeout(300);
    const lm = page.locator('.cx-subrow button', { hasText: 'Last Match' });
    if (await lm.isDisabled()) throw new Error('Last Match er grå før første kamp');
    await lm.click();
    await page.waitForSelector('.cx-norecent', { timeout: 3000 });
    const txt = await page.locator('.cx-norecent').innerText();
    if (!/No Recent Matches/i.test(txt) || !/No recent matches have been played/i.test(txt)) throw new Error('forkert tekst: ' + txt.slice(0, 80));
    await page.locator('.cx-onlyok button', { hasText: 'Ok' }).click();
    await page.waitForTimeout(200);
    if (await page.locator('.cx-norecent').count()) throw new Error('Ok lukkede ikke skærmen');
  });
  if (look === 'klassisk') await step('målmandsegenskab i søgningen giver kun målmænd + Short List-filtre + spejder (klassisk)', async () => {
    await go({ name: 'transfers' });
    await page.locator('.cx-greybtn', { hasText: 'Filters' }).first().click();
    await page.locator('.cx-fl-tabs button', { hasText: 'Attributes' }).click();
    for (let i = 0; i < 11; i++) await page.locator('button[aria-label="Reflexes +"]').click();
    await page.locator('.cx-filters .primary').click();
    await page.waitForTimeout(300);
    const pos = await page.locator('.cx-tbl tbody td.c-pos').allInnerTexts();
    if (!pos.length) throw new Error('ingen spillere med Reflexes 12+');
    if (pos.some((x) => x.trim() !== 'GK')) throw new Error('markspillere med høj Reflexes: ' + pos.filter((x) => x.trim() !== 'GK').join(','));
    // Short List kan filtreres som Player Search
    await gs(() => { const g = window.__cm.gs(); const ids = Object.values(g.players).filter((p) => p.club !== g.userClub && p.pos[0] < 20).slice(0, 3).map((p) => p.id); g.shortlist.push(...ids); window.__cm.notify(); });
    await go({ name: 'transfers', state: { tab: 'shortlist' } });
    await page.waitForTimeout(300);
    if (!(await page.locator('.cx-pager-line').innerText()).includes('Players currently on your shortlist')) throw new Error('teksten under Short List mangler');
    const all = await page.locator('.cx-tbl tbody tr').count();
    await page.locator('.cx-greybtn', { hasText: 'Filters' }).first().click();
    await page.locator('.cx-fl-tabs button', { hasText: 'Attributes' }).click();
    for (let i = 0; i < 12; i++) await page.locator('button[aria-label="Handling +"]').click();
    await page.locator('.cx-filters .primary').click();
    await page.waitForTimeout(300);
    if ((await page.locator('.cx-tbl tbody tr').count()) >= all) throw new Error('filteret virker ikke på Short List');
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-shortlist-filter.png` });
    // spejder: Assign Scout ▸ Next Opposition → bekræftelsen → opgaven er sat
    await go({ name: 'transfers', state: { tab: 'scout1' } });
    await page.waitForTimeout(300);
    if (!(await page.locator('.cx-pager-line').innerText()).includes('not assigned')) throw new Error('"not assigned" mangler');
    await page.locator('.cx-tools .cx-drop-btn', { hasText: /^Search/ }).first().click();
    await page.locator('.cx-drop-pop >> text=Assign Scout').first().hover();
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-scout-menu.png` });
    await page.locator('.cx-drop-pop >> text=Next Opposition').first().click();
    await page.waitForSelector('.cx-confirm', { timeout: 3000 });
    if (!(await page.locator('.cx-confirm').innerText()).includes('Assign scout')) throw new Error('bekræftelsen mangler');
    await page.locator('.cx-confirm button.primary').click();
    await page.waitForTimeout(300);
    const asg = await gs(() => Object.values(window.__cm.gs().staff).find((x) => x.club === window.__cm.gs().userClub && x.role === 'scout')?.assignment?.kind);
    if (asg !== 'nextOpp') throw new Error('spejderen blev ikke tildelt: ' + asg);
    if (ENGINE_GRID) {
      // original DB i ægte tilstand: en tildelt spejder har Recall Scout; Assign Scout → Club åbner Nations & Clubs → "Send scout to watch all … matches ?"
      const scoutAsg = () => gs(() => Object.values(window.__cm.gs().staff).filter((x) => x.club === window.__cm.gs().userClub && x.role === 'scout').sort((a, b) => a.id - b.id)[0]?.assignment?.kind ?? null);
      await page.locator('.cx-tools .cx-drop-btn', { hasText: /^Search/ }).first().click();
      await page.locator('.cx-drop-pop >> text=Recall Scout').first().click();
      await page.waitForTimeout(300);
      if ((await scoutAsg()) !== null) throw new Error('Recall Scout kaldte ikke spejderen hjem');
      await page.locator('.cx-tools .cx-drop-btn', { hasText: /^Search/ }).first().click();
      await page.locator('.cx-drop-pop >> text=Assign Scout').first().hover();
      await page.locator('.cx-drop-pop >> text=/^Club$/').first().click();
      await page.waitForSelector('.cx-nc-row', { timeout: 3000 });
      await page.locator('.cx-nc-row .cx-link').nth(1).click();
      await page.waitForSelector('.cx-confirm', { timeout: 3000 });
      if (!(await page.locator('.cx-confirm').innerText()).includes('Send scout to watch all')) throw new Error('"Send scout to watch all … matches ?" mangler');
      await page.locator('.cx-confirm button.primary').click();
      await page.waitForTimeout(300);
      if ((await scoutAsg()) !== 'club') throw new Error('spejderen blev ikke sendt til klubben');
      if (!/Scout \w\.\S+ assigned to/.test(await page.locator('.cx-pager-line').innerText())) throw new Error('linjen "Scout L.Kershaw assigned to …" mangler');
      if (!(await page.locator('.cx-tbl thead', { hasText: 'Rec' }).count())) throw new Error('kolonnen Rec mangler');
      if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-scout-klub.png` });
    }
  });
  if (look === 'klassisk' && ENGINE_GRID) await step('stabsprofilen og Approach To Sign (klassisk, original DB)', async () => {
    // en træner fra databasen i en anden klub, som kan blive træner hos os
    const sid = await gs(() => { const g = window.__cm.gs(); return Object.values(g.staff).find((s) => s.cmId !== undefined && s.club && s.club !== g.userClub && s.role === 'coach' && s.dob < '1970')?.id; });
    if (!sid) throw new Error('ingen træner fra databasen');
    await go({ name: 'staff', id: sid });
    await page.waitForTimeout(300);
    for (const l of ['Profile', 'Injuries & Bans', 'Contract', 'Transfer', 'History']) if (!(await page.locator('.tabs button, .cx-tabrow button', { hasText: l }).count())) throw new Error(`stabsprofilen mangler fanen ${l}`);
    const prof = await page.locator('.cx-staffp').innerText();
    for (const l of ['Born', 'Coaching Style', 'Preferred Formation', 'Preferred Style', 'Judging Player Ability']) if (!prof.includes(l)) throw new Error(`Profile mangler ${l}`);
    await page.locator('.tabs button, .cx-tabrow button', { hasText: 'Contract' }).first().click(); await page.waitForTimeout(200);
    if (!(await page.locator('.cx-staffp').innerText()).includes('Bonuses')) throw new Error('Contract mangler Bonuses');
    await page.locator('.tabs button, .cx-tabrow button', { hasText: 'Transfer' }).first().click(); await page.waitForTimeout(200);
    if (!(await page.locator('.cx-staffp').innerText()).includes('Fluent Languages')) throw new Error('Transfer mangler Fluent Languages');
    await page.locator('.tabs button, .cx-tabrow button', { hasText: 'History' }).first().click(); await page.waitForTimeout(200);
    if (!(await page.locator('.cx-staffp').innerText()).includes('Achievements')) throw new Error('History mangler Achievements');
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-stabsprofil.png` });
    // Action ▾ Approach To Sign → Set Role At Club → Offer Contract → "Offer contract to … ?" Yes
    await page.locator('.cx-act .cx-drop-btn').first().click();
    const acts = await page.locator('.cx-drop-pop').last().innerText();
    if (!/Approach To Sign/.test(acts) || !/Create Manager Note/.test(acts)) throw new Error(`Action-menuen: ${acts}`);
    await page.locator('.cx-drop-pop >> text=Approach To Sign').first().click();
    await page.waitForSelector('.cx-st-role', { timeout: 3000 });
    await page.locator('.cx-st-role', { hasText: 'Coach' }).first().click();
    await page.locator('.cx-dlg-foot button.primary').click();
    await page.waitForSelector('.cx-staff-neg', { timeout: 3000 });
    if (!(await page.locator('.cx-staff-neg').innerText()).includes('Your board will allow wages up to')) throw new Error('Offer Contract mangler lønloftet');
    await page.locator('.cx-staff-neg .cx-dlg-foot button.primary').click();
    if (!(await page.locator('.cx-staff-neg').innerText()).includes('Offer contract to')) throw new Error('"Offer contract to … ?" mangler');
    await page.locator('.cx-staff-neg .cx-dlg-foot button.primary').click();
    await page.waitForTimeout(300);
    const n = await gs((id) => (window.__cm.gs().cmStaffOffers ?? []).filter((o) => o.staff === id).length, sid);
    if (n !== 1) throw new Error('kontrakttilbuddet blev ikke sendt');
  });
  if (look === 'klassisk') await step('træning: træk spiller til fane + klik-flyt (klassisk)', async () => {
    await go({ name: 'training' });
    await page.waitForTimeout(300);
    const rows = page.locator('.cx-tbl tbody tr');
    const count = (k) => gs((kk) => { const g = window.__cm.gs(); return Object.values(g.players).filter((p) => p.club === g.userClub && p.training === kk).length; }, k);
    const b = await count('fitness');
    await rows.nth(2).dragTo(page.locator('.cx-tabrow button', { hasText: 'Fitness' }));
    if ((await count('fitness')) === b) {
      // spilleren stod måske allerede på Fitness: træk en anden række
      await rows.nth(5).dragTo(page.locator('.cx-tabrow button', { hasText: 'Fitness' }));
      if ((await count('fitness')) === b) throw new Error('træk til fanen flyttede ikke');
    }
    // klik-alternativet: vælg rækken, klik på en fane i nederste række
    const sh = await count('shooting');
    await rows.nth(7).locator('td.c-yel').first().click();
    if (!(await page.locator('tr.cx-tn-sel').count())) throw new Error('den valgte spiller er ikke markeret');
    // ægte CM 01/02: ingen hjælpelinje (findes ikke i originalen)
    if ((await gs(() => window.__cm.gs().options.mode === 'authentic')) && (await page.locator('.cx-tn-hint').count())) throw new Error('hjælpelinjen for valgt spiller står der stadig (findes ikke i CM 01/02)');
    await page.locator('.cx-tabrow button', { hasText: 'Shooting' }).click();
    if ((await count('shooting')) === sh) throw new Error('klik-flyt virkede ikke');
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-traening-traek.png` });
  });
  // Player & Staff Search som i CM 01/02: Search-menuen, egenskabsfilter, gemte indstillinger, fri spiller, Realism-kolonnen, Staff Search
  if (look === 'klassisk') await step('søgning: indstillinger, egenskabsfilter, stab (klassisk)', async () => {
    const ok = () => page.locator('.cx-filters .primary').click();
    const menu = async () => { await page.locator('.cx-drop-btn', { hasText: /^Search/ }).first().click(); await page.waitForTimeout(100); };
    const item = (l) => page.locator('.cx-drop-pop button', { hasText: l }).first();
    await gs(() => { for (const k of Object.keys(localStorage)) if (k.startsWith('cm0102.searchSettings') || k.startsWith('cm0102.transferFilters')) localStorage.removeItem(k); localStorage.removeItem('cm-realism'); });
    await go({ name: 'transfers' });
    await page.waitForTimeout(300);
    await menu();
    for (const l of ['Load Settings', 'Save Settings', 'Save Settings As', 'Delete Settings', 'Reset', 'Clear']) if (!(await item(l).count())) throw new Error(`Search-menuen mangler ${l}`);
    if (!(await item('Save Settings').isDisabled())) throw new Error('Save Settings skal være grå, når intet er hentet');
    await page.keyboard.press('Escape');
    // Realism: findes ikke i originalen – slået fra i ægte CM 01/02 (standard i klassisk), men kan slås til (Spilindstillinger)
    const heads = () => page.locator('.cx-tbl th').allInnerTexts();
    const authenticMode = await gs(() => window.__cm.gs().options.mode === 'authentic');
    if (authenticMode && (await heads()).some((h) => h.startsWith('Realism'))) throw new Error('Realism-kolonnen skal være slået fra som standard i ægte tilstand');
    await gs(() => localStorage.setItem('cm-realism', 'on'));
    await go({ name: 'transfers' }); await page.waitForTimeout(300);
    if (!(await heads()).some((h) => h.startsWith('Realism'))) throw new Error('Realism-kolonnen skal kunne slås til');
    await gs(() => localStorage.setItem('cm-realism', 'off'));
    await go({ name: 'transfers' }); await page.waitForTimeout(300);
    if ((await heads()).some((h) => h.startsWith('Realism'))) throw new Error('Realism-kolonnen skulle være slået fra');
    if (!(await heads()).some((h) => h.startsWith('Position'))) throw new Error('kolonnen hedder Position');
    // egenskabsfilter: Passing mindst 14
    await page.getByRole('button', { name: /^Filters/ }).click();
    await page.locator('.cx-fl-tabs button', { hasText: 'Attributes' }).click();
    if ((await page.locator('.cx-fl-attr').count()) !== 31) throw new Error('Attributes skal have 31 egenskaber');
    for (let i = 0; i < 13; i++) await page.getByRole('button', { name: 'Passing +' }).click();
    await page.getByRole('button', { name: 'Passing -' }).click();
    if (!((await page.locator('.cx-fl-attr', { hasText: 'Passing' }).innerText()).includes('13'))) throw new Error('Passing skulle stå på 13');
    await ok(); await page.waitForTimeout(400);
    const found = await page.locator('.cx-found').innerText();
    if (!/filtered out/.test(found)) throw new Error(`"(N filtered out)" mangler: ${found}`);
    // gem, hent og slet søgeindstillinger
    await menu(); await item('Save Settings As').click();
    await page.locator('.cx-dlg-input, .confirm-box input').first().fill('Passers');
    await page.locator('.cx-confirm button.primary, .confirm-box button.primary').first().click();
    if (!(await gs(() => (localStorage.getItem('cm0102.searchSettings') ?? '').includes('Passers')))) throw new Error('søgeindstillingerne blev ikke gemt');
    await menu(); await item('Clear').click(); await page.waitForTimeout(300);
    if (/filtered out/.test(await page.locator('.cx-found').innerText())) throw new Error('Clear skal fjerne filtrene');
    await menu(); await item('Load Settings').hover(); await page.locator('.cx-drop-sub button', { hasText: 'Passers' }).click(); await page.waitForTimeout(300);
    if (!/filtered out/.test(await page.locator('.cx-found').innerText())) throw new Error('Load Settings genskabte ikke filtrene');
    await menu(); await item('Delete Settings').hover(); await page.locator('.cx-drop-sub button', { hasText: 'Passers' }).click();
    await page.locator('.cx-confirm button.primary, .confirm-box button.primary').first().click(); await page.waitForTimeout(200);
    if (await gs(() => (localStorage.getItem('cm0102.searchSettings') ?? '').includes('Passers'))) throw new Error('søgeindstillingerne blev ikke slettet');
    await menu(); await item('Clear').click();
    // fri spiller: Club = No Club, Value = Free, Based = hans land
    await menu(); await item('Load Settings').hover(); await page.locator('.cx-drop-sub button', { hasText: 'Free transfers' }).click(); await page.waitForTimeout(300);
    const rows = await page.locator('.cx-tbl tbody tr').first().innerText();
    if (!/No Club/.test(rows) || !/Free/.test(rows)) throw new Error(`fri spiller skal vise No Club/Free: ${rows}`);
    if (/Sct|Fre\b/.test(rows)) throw new Error('ingen Sct/Fre-mærker i søgningen');
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-spillersoegning-fri.png` });
    // Staff Search: View-menuen, filter og ledige
    await page.getByRole('button', { name: 'Staff Search', exact: true }).first().click(); await page.waitForTimeout(300);
    await page.locator('.cx-drop-btn', { hasText: /^View/ }).click();
    for (const l of ['General', 'Attributes', 'Player Notes']) if (!(await item(l).count())) throw new Error(`Staff View mangler ${l}`);
    await item('Attributes').click(); await page.waitForTimeout(200);
    if (!(await heads()).some((h) => h.startsWith('Coa'))) throw new Error('Attributes-visningen mangler trænerevnen');
    await page.locator('.cx-drop-btn', { hasText: /^View/ }).click(); await item('General').click();
    await page.getByRole('button', { name: /^Filters/ }).click();
    for (const l of ['Text', 'Nationality', 'Age', 'Language', 'Based', 'Job', 'Interested']) if (!(await page.locator('.cx-filters .cx-set-grid > span', { hasText: new RegExp(`^${l}$`) }).count())) throw new Error(`Staff-filteret mangler ${l}`);
    await page.locator('.cx-filters .cx-set-grid > span', { hasText: /^Job$/ }).locator('xpath=following-sibling::div[1]').getByRole('button', { name: 'Specified' }).click();
    await page.locator('.cx-filters .cx-set-seg button', { hasText: 'Unemployed' }).click();
    await ok(); await page.waitForTimeout(300);
    const srow = await page.locator('.cx-tbl tbody tr').first().innerText();
    if (!/No Club\/Nation/.test(srow) || !/Unemployed/.test(srow)) throw new Error(`ledig stab skal vise No Club/Nation + Unemployed: ${srow}`);
    await page.getByRole('button', { name: /^Filters/ }).click();
    await page.locator('.cx-fl-tabs button', { hasText: 'Attributes' }).click();
    if ((await page.locator('.cx-fl-attr').count()) !== 7) throw new Error('stabens Attributes skal have 7 egenskaber');
    await page.locator('.cx-filters .modal-foot button', { hasText: 'Cancel' }).click();
    await gs(() => localStorage.removeItem('cm-realism'));
  });
  if (look === 'klassisk') await step('spillerens faner (klassisk)', async () => {
    await go({ name: 'player', id: star });
    // al statistik er for den igangværende sæson: Senior Club = Season total (ikke karrieren)
    await page.waitForSelector('.cx-pl-stats tbody tr', { timeout: 10000 });
    const stat = (await page.locator('.cx-pl-stats tbody tr').allInnerTexts()).map((r) => r.replace(/\s+/g, ' ').trim());
    const seasonRow = stat.find((r) => /^season total/i.test(r)), seniorRow = stat.find((r) => /^senior club/i.test(r));
    if (!seasonRow || !seniorRow || seasonRow.replace(/^season total/i, '').replace(/\s*\(\d+\)/, '').split(/\s+/)[1] !== seniorRow.replace(/^senior club/i, '').split(/\s+/)[1]) throw new Error(`Senior Club skal følge sæsonen: ${seasonRow} / ${seniorRow}`);
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-spiller-Profile.png` });
    for (const tab of ['Injuries & Bans', 'Contract', 'Transfer', 'History']) {
      await page.getByRole('button', { name: tab, exact: true }).first().click();
      await page.waitForTimeout(200);
      await checkScreen(`spiller ${tab}`);
      // ægte CM 01/02: ingen moderne bokse/hjælpetekster på spillerens faner (findes ikke i originalen)
      if ((await gs(() => window.__cm.gs().options.mode === 'authentic')) && (await page.locator('.cx-pl-hint, .cx-fl-hint, .main .insight').count())) throw new Error(`spillerens ${tab}-fane har en boks/hjælpetekst, der ikke findes i CM 01/02`);
      if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-spiller-${tab.replace(/[^a-z]/gi, '')}.png` });
    }
    for (const v of ['Achievements', 'Injuries', 'Bans', 'Playing Career']) {
      await page.locator('.cx-pl .cx-drop-btn', { hasText: 'View' }).first().click();
      await page.locator('.cx-drop-pop button', { hasText: v }).first().click();
      await page.waitForTimeout(150);
    }
  });
  // Game Options → Save Game (CM 01/02 "Enter File Name"): navngivet gemt spil
  if (look === 'klassisk') await step('Save Game med filnavn', async () => {
    await go({ name: 'inbox' });
    await page.locator('.cx-side .cx-drop-btn', { hasText: 'Game Options' }).first().click();
    await page.locator('.cx-drop-pop button', { hasText: 'Save Game' }).first().click();
    await page.waitForSelector('.cx-savegame .cx-sv-file input', { timeout: 5000 });
    await page.fill('.cx-savegame .cx-sv-file input', 'E2E SAVE');
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-save-game.png` });
    await page.locator('.cx-savegame .cx-sv-foot button.primary').click();
    await page.waitForSelector('.cx-savegame', { state: 'detached', timeout: 10000 });
  });
  if (look === 'klassisk') await step('anden klubs taktik (Tactics ▸)', async () => {
    const other = await gs(() => { const g = window.__cm.gs(); return Object.values(g.clubs).find((c) => c.id !== g.userClub && c.league === g.clubs[g.userClub].league).id; });
    await go({ name: 'club', id: other });
    await page.locator('.cx-subrow button', { hasText: 'Tactics' }).first().click();
    // CM 01/02: uden spillede kampe viser Tactics ▸ "No Recent Matches", ellers sidste kamps opstilling
    const played = await gs((cid) => Object.values(window.__cm.gs().fixtures).some((f) => f.result && (f.home === cid || f.away === cid)), other);
    await page.waitForSelector(played ? '.cx-tac-view .cx-tac-slot' : '.cx-norecent', { timeout: 10000 });
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-andenklub-taktik.png` });
  });
  if (look === 'klassisk') await step('Team Instructions før kampen (samme boks som i kampen)', async () => {
    await go({ name: 'tactics' });
    await page.locator('.cx-drop-btn', { hasText: 'Tactics' }).first().click();
    await page.locator('.cx-drop-pop button, .cx-drop-pop [role=menuitem]', { hasText: 'Team Instructions' }).first().click();
    await page.waitForSelector('.cx-tidlg', { timeout: 5000 });
    const before = await gs(() => window.__cm.gs().tactic.team.mentality);
    await page.locator('.cx-tidlg .cx-tich', { hasText: before >= 3 ? 'Defensive' : 'Attacking' }).first().click();
    await page.locator('.cx-tidlg-foot button', { hasText: 'Ok' }).click();
    if ((await gs(() => window.__cm.gs().tactic.team.mentality)) !== before) throw new Error('holdinstruktionen blev gemt før Ok');
    await tacOk();
    const after = await gs(() => window.__cm.gs().tactic.team.mentality);
    if (after === before) throw new Error('holdinstruktionen blev ikke gemt');
  });
  if (look === 'klassisk') await step('træning → Coaches', async () => {
    await go({ name: 'training' });
    await page.locator('.cx-greybtn', { hasText: 'Coaches' }).click();
    await page.waitForSelector('.cx-coaches .cx-coach-row', { timeout: 5000 });
    await page.locator('.cx-coaches .cx-coach-row .cx-tich').first().click();
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-coaches.png` });
    await page.locator('.cx-coaches .cx-tidlg-foot button', { hasText: 'Ok' }).click();
    if (!(await gs(() => Object.values(window.__cm.gs().staff).some((s) => s.coachAreas)))) throw new Error('trænerområdet blev ikke gemt');
  });
  if (look === 'klassisk') await step('løb fremad med højreklik på taktikbanen', async () => {
    await go({ name: 'tactics' });
    // højreklik uden træk (touchpad): menuen med retninger → Frem
    await page.locator('.cx-tac-slot:not(.empty)').nth(9).click({ button: 'right' });
    await page.locator('.cx-ctx button').first().click();
    await tacOk(); await go({ name: 'tactics' });
    const run = await gs(() => window.__cm.gs().tactic.individual[9]?.run);
    if (!run) throw new Error('løbet blev ikke sat fra menuen');
    // CM 01/02: højreklik og træk skråt (venstre-frem) → pil til nærmeste punkt i gitteret
    const slot = page.locator('.cx-tac-slot:not(.empty)').nth(6);
    const b = await slot.boundingBox();
    const pitch = await page.locator('.cx-tac-pitch').boundingBox();
    const s0 = await gs(() => window.__cm.gs().tactic.slots[6]);
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
    await page.mouse.down({ button: 'right' });
    await page.mouse.move(b.x + b.width / 2 - pitch.width * 0.2, b.y + b.height / 2 - pitch.height * 0.15, { steps: 8 });
    await page.mouse.up({ button: 'right' });
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-loeb.png` });
    await tacOk(); await go({ name: 'tactics' });
    const r6 = await gs(() => window.__cm.gs().tactic.individual[6]?.run);
    if (!r6 || !(r6.x > s0.x) || !(r6.y !== s0.y)) throw new Error(`skråt løb blev ikke sat (${JSON.stringify(r6)} fra ${JSON.stringify(s0)})`);
    // et meget kort træk fjerner pilen
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
    await page.mouse.down({ button: 'right' });
    await page.mouse.move(b.x + b.width / 2 + 6, b.y + b.height / 2, { steps: 3 });
    await page.mouse.up({ button: 'right' });
    await tacOk();
    if (await gs(() => window.__cm.gs().tactic.individual[6]?.run)) throw new Error('kort træk fjernede ikke løbet');
  });
  if (look === 'klassisk') await step('byt bænk ↔ startopstilling i listen', async () => {
    await go({ name: 'tactics' });
    const before = await gs(() => { const t = window.__cm.gs().tactic; return { a: t.lineup[9], b: t.bench[0] }; });
    await page.locator('.cx-tac-row.bench .cx-tac-name').first().click();
    await page.locator('.cx-tac-row.xi .cx-tac-name').nth(9).click();
    await tacOk();
    const after = await gs(() => { const t = window.__cm.gs().tactic; return { a: t.lineup[9], b: t.bench[0] }; });
    if (after.a !== before.b || after.b !== before.a) throw new Error(`byttet mislykkedes ${JSON.stringify(before)} → ${JSON.stringify(after)}`);
  });
  if (look === 'klassisk') await step('taktik som CM 01/02: trøjenumre, positioner, SB-pladser, Cancel/Ok', async () => {
    await go({ name: 'tactics' });
    const want = await gs(() => { const g = window.__cm.gs(); const tc = g.tactic; return { xi: tc.lineup.filter(Boolean).map((id) => String(g.players[id].number ?? '')), bench: tc.bench.length, pitch: tc.lineup.map((id) => (id ? String(g.players[id].number ?? '') : '')) }; });
    const nums = await page.locator('.cx-tac-row.xi .cx-tac-num').allTextContents();
    if (JSON.stringify(nums) !== JSON.stringify(want.xi)) throw new Error(`nummerfeltet er ikke trøjenumrene: ${nums} (ventet ${want.xi})`);
    const dots = await page.locator('.cx-tac-pitch .cx-tac-dot').allTextContents();
    if (JSON.stringify(dots) !== JSON.stringify(want.pitch)) throw new Error(`banens cirkler er ikke trøjenumrene: ${dots} (ventet ${want.pitch})`);
    const pos = await page.locator('.cx-tac-row.xi .cx-tac-pos').allTextContents();
    if (pos.length !== 11 || pos.some((x) => !x.trim())) throw new Error(`positionskolonnen: ${pos}`);
    const rows = await page.locator('.cx-tac-list > .cx-tac-row').count();
    const sb = await page.locator('.cx-tac-row.cx-tac-sbfree .cx-tac-num').allTextContents();
    if (rows !== 11 + Math.max(9, want.bench) || (sb.length && sb.at(-1) !== 'SB9')) throw new Error(`listen: ${rows} rækker, tomme pladser ${sb}`);
    if (await page.locator('.cx-tac-hint').count()) throw new Error('hjælpeteksten står der stadig');
    if (await page.locator('.cx-tac-row .cx-tac-tag', { hasText: /^(fk|cor|pen)$/ }).count()) throw new Error('fk/cor/pen vises i listen');
    // Cancel fortryder: byt to spillere, Continue Game er grå, Cancel → taktikken er som før
    const before = await gs(() => JSON.stringify(window.__cm.gs().tactic));
    await page.locator('.cx-tac-row.xi .cx-tac-name').nth(1).click();
    await page.locator('.cx-tac-row.xi .cx-tac-name').nth(2).click();
    if (!(await page.locator('.cx-side .cx-continue').isDisabled().catch(() => true))) throw new Error('Continue Game er ikke grå med ugemte ændringer');
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-taktik-kladde.png` });
    await page.locator('.cx-foot .cx-tac-cancel').click();
    await page.waitForTimeout(150);
    if ((await gs(() => JSON.stringify(window.__cm.gs().tactic))) !== before) throw new Error('Cancel fortrød ikke ændringen');
    // View → Whole Squad viser resten af truppen under bænkpladserne
    await go({ name: 'tactics' });
    await page.locator('.cx-drop-btn', { hasText: 'View' }).first().click();
    await page.locator('.cx-drop-pop button', { hasText: 'Whole Squad' }).first().click();
    const n = await page.locator('.cx-tac-row.rest').count();
    const restN = await gs(() => { const g = window.__cm.gs(); const tc = g.tactic; return Object.values(g.players).filter((p) => p.club === g.userClub && !p.reserves && !tc.lineup.includes(p.id) && !tc.bench.includes(p.id)).length; });
    if (n !== restN) throw new Error(`Whole Squad: ${n} rækker, ventet ${restN}`);
    await page.locator('.cx-drop-btn', { hasText: 'View' }).first().click();
    await page.locator('.cx-drop-pop button', { hasText: 'Whole Squad' }).first().click();
  });
  await step('konto og opdateringsmails efter første sæson', async () => {
    const title = await t('news.title');
    await page.evaluate(() => { const g = window.__cm.gs(); g.manager.history = [...(g.manager.history ?? []), { season: 2025, club: g.userClub, league: '', pos: 5 }]; window.__cm.notify?.(); });
    await go({ name: 'inbox' });
    await page.waitForSelector(`.modal-head:has-text("${title}")`, { timeout: 10000 });
    await page.waitForTimeout(500); if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/${look}-konto-spoergsmaal.png` });
    await page.locator('.modal .link-btn', { hasText: await t('news.later') }).click();
    await page.waitForSelector('.modal-head', { state: 'detached', timeout: 5000 });
    if (!prompts.includes('asked') || !prompts.includes('later')) throw new Error(`svarene blev ikke talt: ${prompts}`);
    const st = await page.evaluate(() => localStorage.getItem('cm0102.newsPrompt'));
    if (!st?.startsWith('later:')) throw new Error(`"Ikke nu" blev ikke husket: ${st}`);
    await page.evaluate(() => { const g = window.__cm.gs(); g.manager.history = g.manager.history.slice(0, -1); });
  });
  if (look === 'klassisk') await step('Penalty Takers', async () => {
    await go({ name: 'tactics' });
    await page.locator('.cx-drop-btn', { hasText: 'Tactics' }).first().click();
    await page.locator('.cx-drop-pop button, .cx-drop-pop [role=menuitem]', { hasText: 'Penalty Takers' }).first().click();
    await page.waitForSelector('.cx-pens .cx-pen-num', { timeout: 5000 });
    await page.locator('.cx-pens .cx-greybtn', { hasText: 'Clear Squad' }).click();
    const nums = page.locator('.cx-pens .cx-pen-num');
    await nums.nth(3).click(); await page.locator('.cx-pens .cx-pen-num:not(.on)').first().click();
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-straffeskytter.png` });
    await page.locator('.cx-pens .cx-pen-done').click();
    await page.waitForSelector('.cx-tac-pitch', { timeout: 5000 });
    await tacOk();
    const order = await gs(() => window.__cm.gs().tactic.penOrder);
    if (order?.length !== 2) throw new Error(`rækkefølgen blev ikke sat: ${JSON.stringify(order)}`);
    await go({ name: 'tactics' });
    // Save As: spillets egen navneboks (ikke browserens prompt)
    await page.locator('.cx-drop-btn', { hasText: 'Tactics' }).first().click();
    await page.locator('.cx-drop-pop button, .cx-drop-pop [role=menuitem]', { hasText: 'Save As' }).first().click();
    await page.locator('.cx-dlg-input').fill('E2E taktik');
    await page.locator('.cx-confirm button.primary').click();
    const saved = await gs(() => window.__cm.gs().savedTactics.map((x) => x.name));
    if (!saved.includes('E2E taktik')) throw new Error(`taktikken blev ikke gemt: ${saved}`);
    // Edit → Copy All, Reflect, Paste: formationen er som før
    const before = await gs(() => JSON.stringify(window.__cm.gs().tactic.slots));
    const edit = async (label) => { await page.locator('.cx-drop-btn', { hasText: 'Edit' }).first().click(); await page.locator('.cx-drop-pop button, .cx-drop-pop [role=menuitem]', { hasText: label }).first().click(); };
    await edit('Copy All'); await edit('Reflect'); await edit('Paste');
    await tacOk();
    if (before !== await gs(() => JSON.stringify(window.__cm.gs().tactic.slots))) throw new Error('Paste gav ikke den kopierede formation tilbage');
  });
  if (look === 'klassisk') await step('Referee Stats', async () => {
    const lg = await gs(() => { const g = window.__cm.gs(); return g.clubs[g.userClub].league; });
    await go({ name: 'competitions', id: lg });
    await page.locator('.cx-subrow button, .cx-sub button', { hasText: 'Referee Stats' }).first().click();
    await page.waitForSelector('.cx-refs', { timeout: 5000 });
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-dommere.png` });
  });
  if (look === 'klassisk') await step('trup: Sort By Condition viser konditionen i kolonnen (brugerønske #8)', async () => {
    await go({ name: 'squad' });
    await page.locator('.cx-drop-btn', { hasText: 'Sort By' }).first().click();
    await page.locator('.cx-drop-pop button', { hasText: 'Condition' }).first().click();
    // originalens visninger: Condition står i Selection-visningen (Selection Info: Position, Form, Morale, Cond.)
    await page.waitForFunction(() => /%$/.test(document.querySelector('.cx-sq-info[data-col="cond"]')?.textContent ?? ''), null, { timeout: 5000 });
    // brugerønske #10: udtagelsesmenuen (sidste spiller) ligger helt inden for skærmen og kan rulles
    const sel = page.locator('.cx-sel .cx-selbtn'); await sel.nth(await sel.count() - 1).click();
    const box = await page.evaluate(() => { const r = document.querySelector('.cx-sel .cx-drop-pop').getBoundingClientRect(); return { top: r.top, bottom: r.bottom, h: innerHeight }; });
    if (box.top < 0 || box.bottom > box.h) throw new Error(`udtagelsesmenuen går uden for skærmen: ${JSON.stringify(box)}`);
    await page.keyboard.press('Escape');
  });
  // ægte CM 01/02 (originalens trupskærm): View-menuen, blå udtagelsesfelter, grøn strimmel, ingen omklædningsrum, ligaens navn på knappen
  if (look === 'klassisk') await step('trup som i CM 01/02 (ægte tilstand): View-menu og farver', async () => {
    await gs(() => { window.__e2eSqMode = window.__cm.gs().options.mode; window.__cm.gs().options.mode = 'authentic'; });
    try {
      await go({ name: 'squad', state: { cview: 'trad' } });
      await page.waitForSelector('.cx-sq-orig .cx-sq-row', { timeout: 5000 });
      await page.locator('.cx-drop-btn', { hasText: 'View' }).first().click();
      const items = (await page.locator('.cx-drop-pop button').allInnerTexts()).map((s) => s.replace(/[✓▸]/g, '').trim()).filter(Boolean);
      const want = ['Traditional', 'Contract', 'Selection', 'Stats', 'More Stats', 'Attributes', 'Other', 'Penalty Takers'];
      if (JSON.stringify(items) !== JSON.stringify(want)) throw new Error(`View-menuen: ${JSON.stringify(items)}`);
      if (!(await page.locator('.cx-drop-pop .cx-drop-sep').count())) throw new Error('View-menuen mangler skillelinjen før Penalty Takers');
      await page.locator('.cx-drop-pop button', { hasText: 'Contract' }).first().click();
      await page.waitForFunction(() => document.querySelector('.cx-sq-head')?.textContent?.includes('Contract Info') && !!document.querySelector('.cx-sq-info[data-col="wage"]'), null, { timeout: 5000 });
      await go({ name: 'squad', state: { cview: 'trad' } });
      await page.waitForSelector('.cx-sq-orig .cx-sq-row', { timeout: 5000 });
      const look2 = await page.evaluate(() => {
        const bg = (el) => (el ? getComputedStyle(el).backgroundColor : '');
        const sel = document.querySelector('.cx-sq-orig .cx-selbtn.xi') ?? document.querySelector('.cx-sq-orig .cx-selbtn');
        const slot = document.querySelector('.cx-sq-orig .cx-slot:not(.filled):not(.off)') ?? document.querySelector('.cx-sq-orig .cx-slot');
        const full = document.querySelector('.cx-sq-orig .cx-slot.filled');
        return { sel: bg(sel), selFg: sel ? getComputedStyle(sel).color : '', slot: bg(slot), slotFg: slot ? getComputedStyle(slot).color : '', fullFg: full ? getComputedStyle(full).color : '',
          slots: [...document.querySelectorAll('.cx-sq-orig .cx-slot')].map((x) => x.textContent), off: document.querySelectorAll('.cx-sq-orig .cx-slot.off').length,
          tags: [...document.querySelectorAll('.cx-sq-orig .cx-sq-tag')].map((x) => x.textContent).filter(Boolean),
          stars: [...document.querySelectorAll('.cx-sq-orig .cx-sq-name')].some((x) => x.textContent.endsWith('*')),
          dressing: !!document.querySelector('.cx-sq-orig .panel'), count: /Team \d+\/11/.test(document.querySelector('.cx-sq-orig')?.textContent ?? ''),
          division: [...document.querySelectorAll('.cx-subrow button')].map((b) => b.textContent).find((x) => /\d+(st|nd|rd|th) in /.test(x ?? '')) ?? '' };
      });
      if (look2.sel !== 'rgb(0, 0, 125)' || look2.selFg !== 'rgb(255, 255, 255)') throw new Error(`udtagelsesfeltet skal være blåt med hvid tekst: ${look2.sel} / ${look2.selFg}`);
      if (look2.slot !== 'rgb(24, 63, 12)' || !['rgb(255, 255, 255)', 'rgb(255, 242, 31)'].includes(look2.slotFg)) throw new Error(`strimlen skal være mørkegrøn (#183f0c, målt i originalen) med hvid tekst: ${look2.slot} / ${look2.slotFg}`);
      if (look2.fullFg !== 'rgb(255, 242, 31)') throw new Error(`en optaget plads i strimlen skal have gul tekst (originalen): ${look2.fullFg}`);
      if (look2.slots[0] !== 'GK' || !look2.slots.includes('SB9')) throw new Error(`strimlen: ${look2.slots.join(' ')}`);
      if (look2.tags.some((x) => ['Int', 'Fgn', 'Wnt'].includes(x))) throw new Error(`ikke-originale mærker: ${look2.tags.join(' ')}`);
      if (look2.stars || look2.dressing || look2.count || look2.division) throw new Error(`ikke-originale elementer: ${JSON.stringify(look2)}`);
      // hover på et udtagelsesfelt må ikke ændre farven
      const b = page.locator('.cx-sq-orig .cx-selbtn').first(); await b.hover();
      if ((await b.evaluate((el) => getComputedStyle(el).backgroundColor)) !== 'rgb(0, 0, 125)') throw new Error('hover ændrer udtagelsesfeltets farve');
      // træk en plads fra strimlen ned på en spiller uden plads: spilleren sættes på pladsen (originalen)
      // en spiller uden plads, der står i listen (ikke skadet – forsæsonen giver startskader)
      const shown = await page.locator('.cx-sq-orig .cx-sq-row [data-pid]').evaluateAll((els) => els.map((e) => Number(e.getAttribute('data-pid'))));
      const free = await gs((ids) => { const g = window.__cm.gs(); const t = g.tactic; return ids.find((id) => { const p = g.players[id]; return p && !p.injury && !(p.banned > 0) && !t.lineup.includes(id) && !t.bench.includes(id); }) ?? 0; }, shown);
      if (free) {
        const target = page.locator(`.cx-sq-orig .cx-sq-row:has([data-pid="${free}"])`).first();
        await target.scrollIntoViewIfNeeded();
        await page.locator('.cx-sq-orig .cx-slot.xi').nth(1).dragTo(target);
        await page.waitForFunction((id) => window.__cm.gs().tactic.lineup[1] === id, free, { timeout: 5000 }).catch(() => { throw new Error('trækket fra strimlen ned på en spiller satte ham ikke på pladsen'); });
      }
      // klik på en besat plads i strimlen tømmer den
      const before = await gs(() => window.__cm.gs().tactic.lineup.filter(Boolean).length);
      await page.locator('.cx-sq-orig .cx-slot.filled').first().click();
      await page.waitForFunction((n) => window.__cm.gs().tactic.lineup.filter(Boolean).length === n - 1, before, { timeout: 5000 });
      if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-trup-original.png` });
      await page.locator('.cx-drop-btn', { hasText: 'Assistant' }).first().click();
      await page.locator('.cx-drop-pop button').first().click();
      // de andre klubfaner som originalen: Next Match med hub og Print, Fixtures med Cancel/Arrange, Stats med originalens 16 rækker
      await go({ name: 'assistant' });
      await page.waitForSelector('.cx-tabrow .cx-tabs button, .cx-tabrow button', { timeout: 5000 });
      if (await page.locator('.cx-print').count()) throw new Error('Print-knappen skal være fjernet');
      await go({ name: 'fixtures' });
      await page.locator('.cx-drop-btn', { hasText: 'Arrange' }).first().waitFor({ timeout: 5000 });
      // den originale database: computerens venskabskampe/turnéer i forsæsonen (cmFriendly.ts) står i Fixtures som "Friendly" før første ligakamp
      if (ENGINE_GRID) {
        const fc = await gs(() => {
          const g = window.__cm.gs();
          const firstLeague = (c) => Object.values(g.fixtures).filter((f) => g.comps[f.comp]?.type === 'league' && (f.home === c || f.away === c)).map((f) => f.date).sort()[0] ?? '9999';
          const f = Object.values(g.fixtures).find((x) => x.comp === 'FRIENDLY' && g.clubs[x.away]?.nation === g.clubs[g.userClub]?.nation && x.date < firstLeague(x.away));
          return f ? f.away : 0;
        });
        if (!fc) throw new Error('ingen venskabskamp før første ligakamp i den originale database');
        await go({ name: 'club', id: fc, state: { cview: 'fixtures' } });
        await page.locator('.cx-fx-comp.friendly', { hasText: 'Friendly' }).first().waitFor({ timeout: 5000 }).catch(() => { throw new Error('Fixtures viser ikke venskabskampen som "Friendly"'); });
        if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-venskabskampe-original.png` });
      }
      await go({ name: 'club', state: { cview: 'stats' } });
      await page.waitForSelector('.cx-finv-orig .cx-fin-stats', { timeout: 5000 });
      const n = await page.locator('.cx-finv-orig .cx-fin-stats > div').count();
      if (n !== 16) throw new Error(`Stats har ${n} rækker (originalen 16)`);
      // et resultat uden kamprapport (computerklubbernes kampe) kan åbnes: Match Overview med målscorerne
      const other = await gs(() => { const g = window.__cm.gs(); return Object.values(g.fixtures).find((f) => f.result && !g.reports[f.id] && f.home !== g.userClub && f.away !== g.userClub)?.id ?? 0; });
      if (other) {
        await go({ name: 'report', id: other });
        await page.waitForSelector('.match-screen .cx-tabrow, .match-screen .tabs', { timeout: 5000 }).catch(() => { throw new Error('et andet holds resultat åbner ikke kampskærmen'); });
      }
      // Funds (Player & Staff Search) åbner originalens Finances & Info – ikke den moderne økonomiskærm
      await go({ name: 'transfers' });
      await page.locator('.cx-funds').first().click();
      await page.waitForSelector('.cx-finv-orig', { timeout: 5000 }).catch(() => { throw new Error('Funds åbner ikke originalens økonomioversigt'); });
      if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-klubstats-original.png` });
    } finally {
      // tilbage til spillets tilstand (med E2E_ENGINE=original er den ægte – før blev den altid sat til 'extended')
      await gs(() => { window.__cm.gs().options.mode = window.__e2eSqMode ?? 'extended'; });
    }
  });
  if (look === 'klassisk') await step('klubbens History (Man Utd History)', async () => {
    await go({ name: 'squad' });
    await page.locator('.cx-subrow button', { hasText: 'History' }).last().click();
    await page.waitForSelector('.cx-chist .cx-chist-row', { timeout: 5000 });
    for (const tab of ['Competitions', 'Landmarks', 'Positions', 'Attendances']) { await page.getByRole('button', { name: tab, exact: true }).first().click(); await page.waitForTimeout(100); }
    for (const tab of ['Results', 'Sequences', 'Players', 'Transfers']) { await page.locator('.cx-subrow button', { hasText: tab }).first().click(); await page.waitForTimeout(100); }
    await page.getByRole('button', { name: 'Records', exact: true }).first().click();
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-klubhistorie.png` });
    await checkScreen('klubhistorie');
  });
  if (look === 'klassisk') await step('turneringens History (FA Premier League History)', async () => {
    const lg = await gs(() => { const g = window.__cm.gs(); return g.clubs[g.userClub].league; });
    await go({ name: 'competitions', id: lg });
    await page.waitForSelector('.cx-subrow button', { timeout: 5000 });
    await page.locator('.cx-subrow button', { hasText: 'History' }).last().click();
    await page.waitForSelector('.cx-chist-comp .cx-chist-wh', { timeout: 5000 });
    for (const tab of ['Records', 'Attendances', 'Results']) {
      await page.getByRole('button', { name: tab, exact: true }).first().click(); await page.waitForSelector('.cx-chist-comp .cx-chist-row, .cx-chist-comp .cx-empty', { timeout: 5000 });
    }
    for (const tab of ['Sequences', 'Teams', 'Players']) {
      await page.locator('.cx-subrow button', { hasText: tab }).first().click(); await page.waitForSelector('.cx-chist-comp .cx-chist-row, .cx-chist-comp .cx-empty', { timeout: 5000 });
    }
    await page.getByRole('button', { name: 'Records', exact: true }).first().click();
    const rows = await page.locator('.cx-chist-comp .cx-chist-row').count();
    if (rows < 15) throw new Error(`Records har ${rows} rækker`);
    await page.locator('.cx-tools button', { hasText: 'View' }).first().click(); await page.locator('.cx-drop-pop >> text=Current').click();
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-turneringshistorik.png` });
    await checkScreen('turneringens historik');
  });
  if (look === 'klassisk') await step('Manager Status og Selected League(s)', async () => {
    await go({ name: 'mgrstatus' }); await page.waitForSelector('.cx-mstat .cx-chist-row', { timeout: 5000 });
    await go({ name: 'leagues' }); await page.waitForSelector('.cx-sl .cx-sl-row.lg-sel', { timeout: 5000 });
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-ligaer.png` });
    await go({ name: 'ranking' }); await page.waitForSelector('.cx-subtitle', { timeout: 5000 }); await page.waitForTimeout(800);
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-halloffame.png` });
    await checkScreen('hall of fame');
  });
  if (look === 'klassisk') await step('Game Options → Om dette spil (database, tilstand, kampmotor)', async () => {
    await page.click('.cx-gopt');
    await page.locator('.cx-drop-pop >> text=About this game').click();
    await page.waitForSelector('.game-info table', { timeout: 5000 });
    const txt = await page.locator('.game-info').innerText();
    for (const k of ['Database', 'Mode', 'Match engine', 'Club', 'Version']) if (!txt.includes(k)) throw new Error(`Om dette spil mangler ${k}`);
    await page.waitForTimeout(500); await page.screenshot({ path: `${OUT}/klassisk-om-spillet.png` });
    await page.keyboard.press('Escape'); await page.mouse.click(5, 5);
    if (await page.locator('.modal-bg').count()) await page.locator('.modal-bg').first().click({ position: { x: 3, y: 3 } });
  });
  if (look === 'klassisk') await step('turneringsskærm: farver følger den valgte turnering', async () => {
    const lg = await gs(() => { const g = window.__cm.gs(); return g.clubs[g.userClub].league; });
    await go({ name: 'competitions', id: 'CL', state: { cid: lg } });
    await page.waitForTimeout(200);
    const bg = await page.locator('.cx-title').first().evaluate((el) => getComputedStyle(el).backgroundColor);
    if (bg === 'rgb(0, 0, 0)') throw new Error('ligaen fik Champions Leagues sorte titelbjælke');
  });
  if (look === 'klassisk') await step('UEFA Coefficients', async () => {
    await go({ name: 'coefficients' });
    await page.waitForSelector('.cx-coef tbody tr', { timeout: 5000 });
    if ((await page.locator('.cx-coef tbody tr').count()) < 10) throw new Error('for få lande i UEFA Coefficients');
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-koefficienter.png` });
  });
  if (look === 'klassisk') await step('slutrundens kampdag (VM)', async () => {
    await gs(() => { const g = window.__cm.gs(); g.intl ??= { results: [], history: [] }; g.intl.results.unshift({ date: g.date, home: g.clubs[g.userClub].nation, away: (g.clubs[g.userClub].nation + 1) % g.nations.length, hg: 1, ag: 0, kind: 'wc', stage: 'F' }); });
    await go({ name: 'intlday' });
    await page.waitForSelector('.cx-md-panel .cx-md-res', { timeout: 5000 });
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-vm-kampdag.png` });
    await gs(() => { window.__cm.gs().intl.results.shift(); });
  });
  if (look === 'klassisk') await step('jobtilbud (Respond i nyhederne)', async () => {
    const cid = await gs(() => {
      const g = window.__cm.gs();
      const c = Object.values(g.clubs).find((x) => x.id !== g.userClub && x.league === g.clubs[g.userClub].league);
      g.jobOffers.push(c.id);
      g.news.unshift({ id: g.nextId.news++, date: g.date, cat: 'job', key: 'news.jobOffer', params: { club: c.name }, read: false, link: { kind: 'club', id: c.id } });
      window.__cm.notify(); return c.id;
    });
    await go({ name: 'inbox' });
    await page.locator('.cx-nrow').first().click();
    await page.locator('.cx-nbar .cx-respond').click({ timeout: 5000 });
    await page.waitForSelector('.cx-job-answer', { timeout: 5000 });
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-jobtilbud.png` });
    await page.locator('.cx-job-answer button', { hasText: 'Reject' }).click();
    if (await gs((id) => window.__cm.gs().jobOffers.includes(id), cid)) throw new Error('jobtilbuddet blev ikke afvist');
  });
  if (look === 'klassisk') await step('svar på et bud (Respond)', async () => {
    await gs(() => {
      const g = window.__cm.gs();
      const p = Object.values(g.players).find((x) => x.club === g.userClub && !x.injury);
      const buyer = Object.values(g.clubs).find((c) => c.id !== g.userClub && c.league === g.clubs[g.userClub].league);
      const id = g.nextId.offer++;
      g.offers.push({ id, player: p.id, buyer: buyer.id, seller: g.userClub, fee: p.value, loan: false, status: 'pending', created: g.date, respondBy: g.date });
      g.news.unshift({ id: g.nextId.news++, date: g.date, cat: 'transfer', key: 'transfer.incomingBid', params: { club: buyer.name, player: `${p.first} ${p.last}`.trim(), fee: p.value }, read: false, link: { kind: 'offer', id } });
      window.__cm.notify();
    });
    await go({ name: 'inbox' });
    await page.locator('.cx-nrow').first().click();
    await page.locator('.cx-nbar .cx-respond').click({ timeout: 5000 });
    await page.waitForSelector('.cx-bid-answer', { timeout: 5000 });
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-svar-bud.png` });
    await page.locator('.cx-bid-answer button', { hasText: 'Reject' }).click();
    await page.locator('.cx-ts-opt', { hasText: 'important first team player' }).click();
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-afvis-bud.png` });
    await page.locator('.cx-ts-buttons button.primary, .cx-foot-btns button.primary', { hasText: 'Yes' }).click();
    await page.waitForSelector('.cx-inbox', { timeout: 5000 });
    const st = await gs(() => window.__cm.gs().offers.at(-1).status);
    if (st !== 'rejected') throw new Error(`buddet blev ikke afvist (${st})`);
    await page.locator('.cx-nrow', { hasText: 'transfer bid' }).first().click();
    if (!(await page.locator('.cx-nbody').textContent({ timeout: 5000 })).includes('rejected the offer')) throw new Error('svaret står ikke under nyheden');
  });
  if (look === 'klassisk') await step('bud på en spiller (Approach To Buy)', async () => {
    const pid = await gs(() => { const g = window.__cm.gs(); return Object.values(g.players).find((p) => p.club && p.club !== g.userClub && g.clubs[p.club]?.league === g.clubs[g.userClub].league).id; });
    await go({ name: 'player', id: pid });
    await page.locator('.cx-act .cx-drop-btn').click();
    await page.locator('.cx-drop-pop button, .cx-drop-pop [role=menuitem]', { hasText: 'Approach To Buy' }).first().click();
    await page.waitForSelector('.cx-bid .cx-bid-row', { timeout: 10000 });
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-bud.png` });
    // CM 01/02: pilen ved beløbet giver faste beløb (£0 … £20M), Exchange åbner "Add Player To … Transfer Bid"
    await page.locator('.cx-bid-amt .cx-drop-btn').first().click();
    await page.locator('.cx-drop-pop button', { hasText: /^£1(\.00)?M$/ }).first().click();
    if (!/£1(\.00)?M/.test(await page.locator('.cx-bid-amt .cx-drop-btn').first().innerText())) throw new Error('beløbslisten satte ikke £1M');
    await page.locator('.cx-bid .cx-bid-tools button', { hasText: 'Exchange' }).click();
    await page.waitForSelector('.cx-exch', { timeout: 5000 });
    if (!(await page.locator('.cx-exch .cx-sq-row').count()) && !(await page.locator('.cx-exch-none').innerText()).includes('not interested in a part-exchange deal')) throw new Error('Exchange-skærmen er tom');
    await page.locator('.cx-foot-btns button', { hasText: 'Back' }).click();
    await page.waitForSelector('.cx-bid .cx-bid-row', { timeout: 5000 });
    await page.locator('.cx-foot-btns button', { hasText: 'Back' }).click();
    await page.waitForSelector('.cx-bid', { state: 'detached', timeout: 5000 });
  });
  // CM 01/02's budskærm med den originale database (cmTransferBid.ts): alle rækker kan ændres, bytte via trupskærmen, buddet gemmer klausulerne
  if (look === 'klassisk' && ENGINE_GRID) await step('budskærmen: rater, videresalg, klausuler, offentligt og bytte (original)', async () => {
    // originalens budskærm gælder kun i ægte tilstand (cmActive) – e2e-spillet er udvidet
    const pid = await gs(() => { const g = window.__cm.gs(); window.__e2eBidMode = g.options.mode; g.options.mode = 'authentic'; window.__cm.notify(); return Object.values(g.players).find((p) => p.club && p.club !== g.userClub && g.clubs[p.club]?.league === g.clubs[g.userClub].league && p.value > 500000).id; });
    await go({ name: 'player', id: pid });
    await page.locator('.cx-act .cx-drop-btn').click();
    await page.locator('.cx-drop-pop button, .cx-drop-pop [role=menuitem]', { hasText: 'Approach To Buy' }).first().click();
    await page.waitForSelector('.cx-bid .cx-bid-row', { timeout: 10000 });
    const row = (txt) => page.locator('.cx-bid-row', { hasText: txt }).first();
    await row('Monthly Installments').locator('.cx-bid-tog').click();
    if (!(await row('Monthly Installments').innerText()).includes('6 months')) throw new Error('raterne blev ikke slået til (6 months)');
    await row('Monthly Installments').locator('button[aria-label="+"]').click();
    if (!(await row('Monthly Installments').innerText()).includes('12 months')) throw new Error('+ gav ikke 12 months');
    await row('Percentage of Next Sale').locator('button[aria-label="+"]').click();
    if (!(await row('Percentage of Next Sale').innerText()).includes('10%')) throw new Error('videresalget blev ikke 10%');
    await row('League Apps').locator('.cx-bid-tog').click();
    await row('League Apps').locator('.cx-bid-n').click();
    if (!(await row('League Apps').innerText()).includes('Fee after 20 League Apps.')) throw new Error('N gik ikke fra 10 til 20');
    await row('International Apps').locator('.cx-bid-amt .cx-drop-btn').click();
    await page.locator('.cx-drop-pop button', { hasText: /^£250K$/ }).first().click();
    await row('Make transfer bid public').locator('.cx-bid-yn').click();
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-budskaerm-original.png` });
    // Exchange: trupskærmen; knappen trykkes ned, og et klik på en tilladt spiller tager ham med (ellers åbnes profilen – så vi går tilbage)
    await page.locator('.cx-bid .cx-bid-tools button', { hasText: 'Exchange' }).click();
    await page.waitForSelector('.cx-exch .cx-sq-row', { timeout: 5000 });
    await page.locator('.cx-exch-btn').click();
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-bytte-original.png` });
    await page.locator('.cx-foot-btns button', { hasText: 'Back' }).click();
    await page.waitForSelector('.cx-bid .cx-bid-row', { timeout: 5000 });
    await page.locator('.cx-foot-btns button.primary', { hasText: 'Offer' }).click();
    await page.waitForTimeout(300);
    const o = await gs((id) => window.__cm.gs().offers.filter((x) => x.player === id).at(-1), pid);
    if (o && (o.months !== 12 || o.sellOn !== 10 || o.lgApps !== 20 || !o.intFee || !o.pub)) throw new Error(`buddets vilkår blev ikke gemt (${JSON.stringify(o)})`);
    await gs(() => { const g = window.__cm.gs(); g.options.mode = window.__e2eBidMode; window.__cm.notify(); });
  });
  // CM 01/02's transferliste med den originale database (cmTransferList.ts): Set Staff Transfer Status (billig udbudspris = værdien +0x52,
  // Not Needed, transferlistet) → Transfer-fanens Availability/Value/Future; transferanmodningen "X requests move" med Respond → Yes
  if (look === 'klassisk' && ENGINE_GRID) await step('transferliste og transferanmodning (original)', async () => {
    const pid = await gs(() => {
      const g = window.__cm.gs();
      // e2e sætter cm0102.mode = 'extended' (linje 41) – originalens transferliste gælder kun i ægte tilstand (cmActive)
      window.__e2eMode = g.options.mode; g.options.mode = 'authentic';
      const p = Object.values(g.players).filter((x) => x.club === g.userClub && !x.loan && !x.listed).sort((a, b) => b.ca - a.ca)[4];
      if (p.cmContract) { p.cmContract.b45 = 0; p.cmContract.b4e = 0; }
      window.__cm.notify(); return p.id;
    });
    await go({ name: 'player', id: pid });
    await page.locator('.cx-act .cx-drop-btn').click();
    await page.locator('.cx-drop-pop button, .cx-drop-pop [role=menuitem]', { hasText: 'Set Transfer Status' }).first().click();
    await page.waitForSelector('.cx-tstatus .cx-ts-price', { timeout: 5000 });
    // "=" sætter originalens formelværdi (0x8f77ac); under den gælder udbudsprisen som værdien (0x8ce1e5)
    await page.locator('.cx-ts-price button', { hasText: 'Auto' }).click();
    for (let i = 0; i < 4; i++) await page.locator('.cx-ts-price button[aria-label="-"]').click();
    const asking = (await page.locator('.cx-ts-price .cx-ts-val').innerText()).replace(/[^£$€\d.,MK kr]/g, '').trim();
    await page.locator('.cx-ts-opt', { hasText: 'not needed by the club' }).click();
    await page.locator('.cx-ts-opt', { hasText: 'This player is transfer listed' }).first().click();
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-transferstatus-original.png` });
    await page.locator('.cx-foot-btns button.primary', { hasText: 'Set' }).click();
    await page.waitForSelector('.cx-tstatus', { state: 'detached', timeout: 5000 });
    await page.getByRole('button', { name: 'Transfer', exact: true }).first().click();
    await page.waitForTimeout(200);
    const kv = (await page.locator('.cx-kv.cx-ruled').first().innerText()).replace(/\s+/g, ' ');
    if (!kv.includes('Transfer listed by club')) throw new Error(`Availability er ikke "Transfer listed by club": ${kv}`);
    if (!kv.includes(`Value ${asking}`)) throw new Error(`Value er ikke udbudsprisen ${asking}: ${kv}`);
    if (!/Future (Disappointed|Shocked|Angry|Surprised|Thinks he is too good|Believes he can force|Doesn't want|Feels|Wants|Unsettled|Is |Pleased|Looking)/.test(kv) || kv.includes('Happy to stay')) throw new Error(`Future er ikke originalens: ${kv}`);
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-transfer-future-original.png` });
    // transferanmodningen (nyheden 0xbbf) med to grunde → Respond → Transfer Request → Yes
    const p2 = await gs(() => {
      const g = window.__cm.gs();
      const p = Object.values(g.players).filter((x) => x.club === g.userClub && !x.loan && !x.listed).sort((a, b) => b.ca - a.ca)[6];
      g.news.unshift({ id: g.nextId.news++, date: g.date, cat: 'contract', key: 'cm.req', read: false, link: { kind: 'player', id: p.id },
        params: { player: p.last, full: `${p.first} ${p.last}`.trim(), club: g.clubs[g.userClub].name, flags: 0x210, sid: 4, agent: 0, nat: '', cnat: '', crep: 8000, old: 0, ans: 0 } });
      window.__cm.notify(); return p.id;
    });
    await go({ name: 'inbox' });
    await page.locator('.cx-nrow', { hasText: 'requests move' }).first().click();
    const body = await page.locator('.cx-nbody').textContent({ timeout: 5000 });
    if (!body.includes('has requested to leave') || !body.includes('wants regular first team football and feels he has been treated unfairly')) throw new Error(`anmodningens tekst: ${body}`);
    await page.locator('.cx-nbar .cx-req-respond').click({ timeout: 5000 });
    await page.waitForSelector('.cx-treq-answer', { timeout: 5000 });
    if (!(await page.locator('.cx-treq').innerText()).includes('on the transfer list at his own request ?')) throw new Error('Transfer Request-skærmen mangler spørgsmålet');
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-transferanmodning-original.png` });
    await page.locator('.cx-treq-answer button.primary', { hasText: 'Yes' }).click();
    await page.waitForSelector('.cx-inbox', { timeout: 5000 });
    if (!(await page.locator('.cx-nbody').textContent({ timeout: 5000 })).includes('The request has been granted.')) throw new Error('svaret står ikke under anmodningen');
    const req = await gs((id) => window.__cm.gs().players[id].cmContract?.b4e ?? 0, p2);
    if (!(req & 8)) throw new Error('spilleren er ikke listet efter eget ønske');
    await gs((ids) => { const g = window.__cm.gs(); for (const id of ids) { const p = g.players[id]; p.listed = false; p.wantsAway = undefined; p.squadStatus = undefined; p.cmAsk = undefined; if (p.cmContract) { p.cmContract.b4e = 0; p.cmContract.b45 = 0; } } g.options.mode = window.__e2eMode ?? g.options.mode; window.__cm.notify(); }, [pid, p2]);
  });
  await step('landshold', async () => { await go({ name: 'international', id: await gs(() => window.__cm.gs().clubs[window.__cm.gs().userClub].nation) }); await page.screenshot({ path: `${OUT}/${look}-landshold.png` }); });
  // Squad Numbers: skift en spillers nummer – en holdkammerat med samme nummer bytter
  await step('trøjenumre: skift nummer', async () => {
    await go({ name: 'squad', state: look === 'klassisk' ? { cview: 'tbl:numbers' } : { view: 'numbers' } });
    await page.waitForTimeout(400);
    const [a, b] = await gs(() => { const g = window.__cm.gs(); const sq = Object.values(g.players).filter((p) => p.club === g.userClub && !p.reserves).sort((x, y) => x.number - y.number); return [sq[1].id, sq[2].number]; });
    if (look === 'klassisk') {
      // CM 01/02: klik nummeret i talrækken (det bliver ledigt), klik spillerens blå felt, Submit → Yes
      await page.locator('.cx-sqn-n', { hasText: new RegExp(`^${b}$`) }).first().click();
      await page.locator(`.cx-sqn-box[data-pid="${a}"]`).click();
      if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-troejenumre.png` });
      await page.locator('.cx-foot-btns button.primary').click();
      await page.locator('.cx-confirm button.primary').click({ timeout: 5000 });
    } else {
      await page.locator('select[aria-label]').nth(1).selectOption(String(b));
    }
    await page.waitForTimeout(300);
    const ok = await gs(([id, n]) => { const g = window.__cm.gs(); const nums = Object.values(g.players).filter((p) => p.club === g.userClub && p.number).map((p) => p.number); return g.players[id].number === n && new Set(nums).size === nums.length; }, [a, b]);
    if (!ok) throw new Error('nummeret blev ikke flyttet');
  });
  // turneringsvælgeren skal skifte turnering, også når skærmen er åbnet på en bestemt (fx Champions League)
  // klassisk (CM 01/02) har ingen turneringsliste på skærmen – kun Competitions-menuen i sidebjælken
  if (look === 'moderne') await step('turneringsvælger skifter turnering', async () => {
    await go({ name: 'competitions', id: 'CL' });
    await page.waitForTimeout(300);
    const want = await gs(() => { const g = window.__cm.gs(); return g.comps[g.clubs[g.userClub].league].id; });
    await page.locator('.sel').first().click();
    await page.locator('.sel-opt').filter({ hasNotText: 'Champions' }).first().click();
    await page.waitForTimeout(300);
    const label = await page.locator('.sel .sel-label').first().innerText();
    if (/Champions/.test(label)) throw new Error(`valget blev ikke til en anden turnering (${label}, ${want})`);
  });

  // ---------- taktik ----------
  await go({ name: 'tactics' });
  await page.waitForTimeout(500);
  const tac = () => gs(() => JSON.stringify(window.__cm.gs().tactic));
  const slotSel = look === 'klassisk' ? '.cx-tac-slot' : '.pitch .slot';
  const pitchSel = look === 'klassisk' ? '.cx-tac-pitch' : '.pitch';

  await step('taktik: sæt en bænkspiller ind (klik spiller, klik plads)', async () => {
    const before = await gs(() => window.__cm.gs().tactic.lineup.slice());
    // en spiller uden for de 11 (bænken kan være tom ved spillets start)
    const sub = await gs(() => { const g = window.__cm.gs(); const tc = g.tactic; return tc.bench[0] ?? Object.values(g.players).find((p) => p.club === g.userClub && !tc.lineup.includes(p.id) && !p.injury && p.pos[0] < 15)?.id; });
    if (look === 'klassisk') {
      const name = await gs((id) => window.__cm.gs().players[id].last, sub);
      // spillere uden for bænken står kun i View → Whole Squad
      if (!(await page.locator('.cx-tac-row', { hasText: name }).count())) { await page.locator('.cx-drop-btn', { hasText: 'View' }).first().click(); await page.locator('.cx-drop-pop button', { hasText: 'Whole Squad' }).first().click(); }
      await page.locator('.cx-tac-row', { hasText: name }).first().click();
      await page.locator(slotSel).nth(9).click();
      await tacOk(); await go({ name: 'tactics' });
    } else {
      // moderne: klik pladsen og derefter spilleren i listen
      const name = await gs((id) => window.__cm.gs().players[id].last, sub);
      await page.locator(slotSel).nth(9).click();
      await page.locator('table.tac-players tr', { hasText: name }).first().click();
    }
    await page.waitForTimeout(300);
    const after = await gs(() => window.__cm.gs().tactic.lineup.slice());
    if (after[9] !== sub || JSON.stringify(after) === JSON.stringify(before)) throw new Error('opstillingen ændrede sig ikke');
  });

  await step('taktik: flyt en spillers plads (træk til tom plet)', async () => {
    const before = await gs(() => JSON.stringify(window.__cm.gs().tactic.slots));
    // moderne: slå "flyt pladser" til først – hjælpeteksten skifter, og banen flytter sig en smule
    if (look !== 'klassisk') { await page.getByRole('button', { name: new RegExp(await t('tac.movePos')) }).click(); await page.waitForTimeout(300); }
    const pitch = await page.locator(pitchSel).boundingBox();
    const s = page.locator(slotSel).nth(8);
    const b = await s.boundingBox();
    if (look === 'klassisk') {
      // klik på spilleren viser pladsgitteret (30 faste pladser) med den plads, han lander på, fremhævet
      await s.click(); await page.mouse.move(b.x + b.width / 2 - 40, b.y + b.height / 2 + 110, { steps: 4 });
      const spots = await page.locator('.cx-guides i').count(), hot = await page.locator('.cx-guides i.hot b').textContent().catch(() => '');
      if (spots !== 30 || !hot) throw new Error(`pladsgitteret: ${spots} pladser, fremhævet "${hot}"`);
      await s.click(); await page.waitForTimeout(100);
      await s.dragTo(page.locator(pitchSel), { targetPosition: { x: b.x - pitch.x - 40, y: b.y - pitch.y + 110 } });
      await page.waitForTimeout(200); await tacOk(); await go({ name: 'tactics' });
    } else {
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down();
      await page.mouse.move(b.x + b.width / 2 - 40, b.y + b.height / 2 + 110, { steps: 8 }); await page.mouse.up();
      await page.getByRole('button', { name: new RegExp(await t('tac.movePosDone')) }).click().catch(() => {});
    }
    await page.waitForTimeout(300);
    if ((await gs(() => JSON.stringify(window.__cm.gs().tactic.slots))) === before) throw new Error('pladsen blev ikke flyttet');
    if (!(await gs(() => window.__cm.gs().tactic.formation.endsWith('*')))) throw new Error('formationen blev ikke en egen formation');
  });

  await step('taktik: holdinstruktion og spillerinstruktion', async () => {
    const before = await tac();
    if (look === 'klassisk') {
      // CM 01/02: holdets instruktioner står i Tactics-menuen (Team Instructions), ikke på With/Without Ball
      await page.locator('.cx-drop-btn', { hasText: 'Tactics' }).first().click();
      await page.locator('.cx-drop-pop button, .cx-drop-pop [role=menuitem]', { hasText: 'Team Instructions' }).first().click();
      await page.locator('.cx-tidlg-row', { hasText: await t('cl.mt.ti.tackling') }).locator('.cx-tich:not(.on)').first().click();
      await page.locator('.cx-tidlg-foot .primary').click();
      await tacOk(); await go({ name: 'tactics' });
    } else {
      await page.locator('.ti-row', { hasText: await t('ti.tempo') }).getByRole('radio', { name: await t('ti.fast') }).click();
      await page.locator(slotSel).nth(10).click();
      await page.locator('.ti-row', { hasText: await t('pi.holdUp') }).getByRole('radio', { name: await t('common.yes') }).click();
    }
    await page.waitForTimeout(200);
    const after = await gs(() => { const tc = window.__cm.gs().tactic; return { tempo: tc.team.tempo, hold: tc.individual[10]?.holdUp }; });
    if (look !== 'klassisk') {
      if (after.tempo !== 2) throw new Error(`tempo blev ${after.tempo}`);
      if (after.hold !== true) throw new Error('"hold bolden" blev ikke sat');
    }
    if ((await tac()) === before) throw new Error('taktikken ændrede sig ikke');
  });

  if (look === 'klassisk') await step('taktik: With Ball – træk en spillers position i boldzonen', async () => {
    // CM 01/02: banen delt i 3 × 4 boldzoner (gul stiplet = valgt), positionsnavne i cirklerne og i listen; træk = nyt punkt i den zone
    await page.getByRole('button', { name: await t('cl.tac.with') }).click();
    await page.locator('.cx-zone-pitch').waitFor();
    // listen er den samme som på Overview (trøjenumre, navne, capt) – og ingen instruktionsboks
    const nums = await page.locator('.cx-tac-list .cx-tac-num').allTextContents();
    if (!/^\d+$/.test(nums[0]) || nums.length < 16 || await page.locator('.cx-zone-left, .cx-ti').count()) throw new Error(`listen: ${nums.join(' ')}`);
    const dots = await page.locator('.cx-zone-dot').allTextContents();
    if (dots.length !== 11 || !dots.every((x) => /^\d*$/.test(x))) throw new Error(`prikkerne skal have trøjenumre: ${dots.join(' ')}`);
    if (!(await page.locator('.cx-zone-pitch .cx-zone-sel').count())) throw new Error('den valgte boldzone vises ikke');
    const s = page.locator('.cx-zone-slot').nth(9);
    const b = await s.boundingBox();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down();
    await page.mouse.move(b.x + b.width / 2 + 25, b.y + b.height / 2 - 70, { steps: 8 }); await page.mouse.up();
    await page.waitForTimeout(200);
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-taktik-with-ball.png` });
    await tacOk(); await go({ name: 'tactics' });
    await page.waitForTimeout(200);
    const r = await gs(() => { const tc = window.__cm.gs().tactic; return { ok: !!tc.positions && tc.positions.posts.length === 11 && tc.positions.posts[9].length === 24, f: tc.formation }; });
    if (!r.ok) throw new Error('Tactic.positions blev ikke gemt efter Ok');
    if (!r.f.endsWith('*')) throw new Error(`formationen er ikke markeret ændret: ${r.f}`);
    await page.getByRole('button', { name: await t('cl.tac.overview') }).click().catch(() => {});
  });

  if (look === 'klassisk') await step('taktik: træk "capt" til en anden spiller', async () => {
    const before = await gs(() => window.__cm.gs().tactic.captain);
    const rows = page.locator('.cx-tac-list .cx-tac-row.xi');
    const src = page.locator('.cx-tac-list .cx-tac-tag.capt');
    await src.waitFor();
    const idx = await rows.evaluateAll((els) => els.findIndex((e) => e.querySelector('.cx-tac-tag.capt')));
    await src.dragTo(rows.nth(idx === 0 ? 1 : 0));
    await page.waitForTimeout(200);
    await tacOk(); await go({ name: 'tactics' });
    const after = await gs(() => window.__cm.gs().tactic.captain);
    if (!after || after === before) throw new Error(`anføreren blev ikke ændret (${before} -> ${after})`);
  });

  await step('taktik: samme taktik efter skift af udseende', async () => {
    const before = await tac();
    await page.evaluate(async (th) => { const m = await import('/cm0102-reborn/src/ui/theme.ts'); m.setTheme(th); }, look === 'klassisk' ? 'club' : 'retro');
    await page.waitForTimeout(800);
    await checkScreen('taktik i det andet udseende');
    if ((await tac()) !== before) throw new Error('taktikken ændrede sig ved skift af udseende');
    await page.evaluate(async (th) => { const m = await import('/cm0102-reborn/src/ui/theme.ts'); m.setTheme(th); }, look === 'klassisk' ? 'retro' : 'club');
    await page.waitForTimeout(500);
  });

  // ---------- kamp ----------
  await step('spil en hel kamp', async () => {
    // sæsonen starter i juli, første kamp i midten af august – spol frem til dagen før
    // (begge databaser: ellers bruger løkken op mod 120 klik på dag-for-dag-Continue før kampdagen)
    await page.evaluate(async () => { const c = window.__cm; const g = c.gs(); const f = Object.values(g.fixtures).filter((x) => x.home === g.userClub || x.away === g.userClub).sort((a, b) => a.date.localeCompare(b.date))[0]; if (!f) return; const days = Math.round((Date.parse(f.date) - Date.parse(g.date)) / 864e5) - 1; if (days > 0) await c.advance(days); const me = g.clubs[g.userClub]; me.sqnDue = undefined; me.euroDue = undefined; for (const n of g.news) n.read = true; });
    // klassisk (CM 01/02): Continue Game → "Proceed to the match ?" (Yes) → Kick Off Match i sidebjælken
    const kick = await t(look === 'klassisk' ? 'cl.mt.kickoff' : 'match.kickoff');
    const labels = [await t('top.toTheMatch'), await t('top.toMatch'), await t('cl.continue'), await t('top.continue')].filter(Boolean);
    // klassisk: en skadet spiller på holdet stopper kampen (Team Selection), indtil holdet er rettet
    // (først heles truppen, så en tilfældig rigtig skade ikke giver en anden Team Selection end testens)
    let injured = look === 'klassisk' ? await page.evaluate(() => { const g = window.__cm.gs(); for (const p of Object.values(g.players)) if (p.club === g.userClub) p.injury = null; const id = g.tactic?.lineup[3]; if (!id) return 0; g.players[id].injury = { key: 'hamstring', days: 60 }; return id; }) : 0;
    let selSeen = false;
    for (let i = 0; i < 120; i++) {
      if (await page.getByRole('button', { name: kick }).first().isVisible().catch(() => false)) break;
      let clicked = false;
      const selHead = await t('cl.mt.teamSel');
      // (boksen kan være på vej frem: vent kort på den, så Yes-grenen nedenfor ikke trykker OK på Team Selection)
      await page.locator('.cx-confirm').waitFor({ timeout: 600 }).catch(() => {});
      if (injured && await page.locator('.cx-confirm .cx-subtitle', { hasText: selHead }).isVisible().catch(() => false)) {
        if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-teamselection.png` });
        // sidebjælken må ikke dækkes af boksen
        { const sb = await page.locator('.cx-side').boundingBox(); const db = await page.locator('.cx-confirm').boundingBox(); if (sb && db && db.x < sb.x + sb.width - 1) throw new Error(`Team Selection dækker sidebjælken (${db.x} < ${sb.x + sb.width})`); }
        await page.locator('.cx-confirm button.primary').click();
        // OK fører til truppen, hvor holdet kan rettes (CM 01/02)
        await page.waitForSelector('.cx-sq-row', { timeout: 10000 });
        await page.evaluate(() => { const g = window.__cm.gs(); for (const p of Object.values(g.players)) if (p.club === g.userClub) p.injury = null; });
        injured = 0; selSeen = true; await page.waitForTimeout(400); continue;
      }
      const yes = page.locator('.cx-confirm button.primary');
      if (await yes.isVisible().catch(() => false)) {
        // Team Selection uden testens skade (en rigtig skade): OK → truppen, hel holdet
        if (await page.locator('.cx-confirm .cx-subtitle', { hasText: selHead }).isVisible().catch(() => false)) {
          await yes.click().catch(() => {}); await page.evaluate(() => { const g = window.__cm.gs(); for (const p of Object.values(g.players)) if (p.club === g.userClub) p.injury = null; });
          if (injured) { injured = 0; selSeen = true; }
          await page.waitForTimeout(400); continue;
        }
        await yes.click().catch(() => {}); await page.waitForTimeout(400); continue;
      }
      if (await answerSquadNumbers()) continue;
      for (const l of labels) {
        const b = page.getByRole('button', { name: l, exact: false }).first();
        if (await b.isVisible().catch(() => false)) { await b.click().catch(() => {}); clicked = true; break; }
      }
      if (!clicked) await go({ name: 'match' });
      if (ENGINE_GRID && process.env.E2E_TRACE) console.log('    trace', i, clicked, await page.evaluate(() => { const g = window.__cm.gs(); return `${g.date} pending=${!!g.pendingFixture} conf=${!!document.querySelector('.cx-confirm')} sub=${document.querySelector('.cx-confirm .cx-subtitle')?.textContent ?? ''} title=${document.querySelector('.cx-head h1, .cx-title')?.textContent ?? ''}`; }));
      await page.waitForTimeout(400);
    }
    if (look === 'klassisk' && !selSeen && !ENGINE_GRID) throw new Error('Team Selection blev ikke vist for en skadet spiller');
    // trøjenummer-trinnet tog nummeret fra en holdkammerat – originalen kræver et nummer før kampen
    if (look === 'klassisk' && !sqnMissingSeen && !ENGINE_GRID) throw new Error('Squad Numbers blev ikke vist før kampen for en spiller uden nummer');
    await page.getByRole('button', { name: kick }).first().click({ timeout: 10000 });
    await page.waitForTimeout(800);
    const toEnd = page.getByRole('button', { name: await t('match.toEnd') });
    const doneSel = look === 'klassisk' ? page.locator('.cx-side .cx-continue.continue') : page.getByRole('button', { name: await t('match.continue') }).first();
    for (let i = 0; i < 60 && !(await doneSel.isVisible().catch(() => false)); i++) {
      if (look === 'klassisk') { if (i === 0) await page.screenshot({ path: `${OUT}/klassisk-kamp.png` }); if (i === 0) { for (const k of [1, 2]) { await page.locator('.cx-side > button.cx-sbtn', { hasText: 'Tactics' }).nth(k - 1).click(); await page.waitForSelector('.cx-mt-tools', { timeout: 60000 }); await page.waitForTimeout(300); await page.screenshot({ path: `${OUT}/klassisk-kamptaktik-${k}.png` }); if (k === 2) { await page.locator('.cx-mt .c-name .link').first().click(); await page.waitForSelector('.cx-pl', { timeout: 10000 }); await page.locator('.cx-foot .cx-back').click(); await page.waitForSelector('.cx-side .cx-minute', { timeout: 10000 }); { const m0 = await page.locator('.cx-side .cx-minute').textContent(); await page.waitForTimeout(1500); const m1 = await page.locator('.cx-side .cx-minute').textContent(); if (m0 !== m1) throw new Error(`kampen startede selv efter en tur til spillersiden: ${m0} → ${m1}`); } } if (await page.locator('.cx-foot .cx-mt-cancel').isVisible().catch(() => false)) { await page.locator('.cx-mt-tools .cx-drop-btn', { hasText: 'Tactics' }).click(); await page.locator('.cx-drop-pop [role=menuitem], .cx-drop-pop button', { hasText: 'Team Instructions' }).first().click(); await page.waitForSelector('.cx-tidlg', { timeout: 5000 }); await page.locator('.cx-tidlg .cx-tich', { hasText: 'Attacking' }).click(); { const on = await page.locator('.cx-tidlg .cx-tich.on').allTextContents(); if (!on.includes('Attacking')) throw new Error(`Attacking ikke valgt: ${on}`); } await page.waitForTimeout(400); await page.screenshot({ path: `${OUT}/klassisk-teaminstr-0.png` }); await page.locator('.cx-tidlg-arrow').first().click(); await page.waitForSelector('.cx-tidlg-menu'); await page.screenshot({ path: `${OUT}/klassisk-teaminstr.png` }); await page.locator('.cx-tidlg-menu button').first().click(); await page.locator('.cx-tidlg-foot button', { hasText: 'Ok' }).click(); await page.waitForSelector('.cx-tidlg', { state: 'detached', timeout: 5000 }); { const sl = page.locator('.cx-mt .cx-tac-slot').nth(6); const bb = await sl.boundingBox(); const n0 = await page.locator('.cx-mt svg.runs line').count(); await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await page.mouse.down({ button: 'right' }); await page.mouse.move(bb.x + bb.width / 2 + 60, bb.y + bb.height / 2 - 70, { steps: 8 }); await page.mouse.up({ button: 'right' }); await page.waitForTimeout(200); const n1 = await page.locator('.cx-mt svg.runs line').count(); if (n1 !== n0 + 1) throw new Error(`løbepil i kampen: ${n0} → ${n1}`); if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-kamp-loeb.png` }); } await page.locator('.cx-mt-tools .cx-drop-btn', { hasText: 'Edit' }).click(); { const bb = await page.locator('.cx-drop-pop').first().boundingBox(); const vw = page.viewportSize().width; if (!bb || bb.x < 0 || bb.x + bb.width > vw + 1) throw new Error(`Edit-menuen ligger uden for skærmen: ${JSON.stringify(bb)}`); } if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-edit.png` }); await page.keyboard.press('Escape'); } const cancel = page.locator('.cx-foot .cx-mt-cancel'); if (await cancel.isVisible().catch(() => false)) { await cancel.click(); await page.waitForTimeout(200); const yes2 = page.locator('.cx-confirm button.primary'); if (await yes2.isVisible().catch(() => false)) { if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-changesmade.png` }); await yes2.click(); } } } } if (i === 0) { for (const n of ['Match Stats', 'Action Zones', 'Match Report', 'Player Ratings', 'Latest Scores', 'League Table']) { const b = page.getByRole('button', { name: n, exact: true }).first(); if (await b.isVisible().catch(() => false)) { await b.click(); await page.waitForTimeout(200); await checkScreen(n); await page.screenshot({ path: `${OUT}/klassisk-kamp-${n.replace(/ /g, '')}.png` }); } } } await page.keyboard.press('e'); }
      if (await toEnd.isVisible().catch(() => false)) await toEnd.click().catch(() => {});
      // pause med holdsnak/udskiftning: fortsæt
      const resume = page.getByRole('button', { name: await t('match.resume') }).first();
      if (await resume.isVisible().catch(() => false)) await resume.click().catch(() => {});
      await page.waitForTimeout(500);
    }
    if (look === 'klassisk') {
      // som i CM 01/02: ved slutfløjt bliver Next-knappen nederst til Continue
      await page.screenshot({ path: `${OUT}/klassisk-slutfloejt.png` });
      // 2D-banen er skjult for nu (HIGHLIGHTS_2D i Match.tsx)
      if (await page.getByText(await t('match.pitch2d'), { exact: true }).count()) throw new Error('2D-fanen skal være skjult');
      await page.locator('.cx-side .cx-continue').click({ timeout: 10000 });
    } else await page.getByRole('button', { name: await t('match.continue') }).first().click({ timeout: 10000 });
    await page.waitForTimeout(800);
    const played = await gs(() => { const g = window.__cm.gs(); return Object.values(g.fixtures).some((f) => f.result && (f.home === g.userClub || f.away === g.userClub)); });
    if (!played) throw new Error('kampen blev ikke spillet færdig');
    await checkScreen('efter kampen');
  });

  await step('kamprapport', async () => {
    const id = await gs(() => { const g = window.__cm.gs(); return Object.values(g.fixtures).filter((f) => f.result && (f.home === g.userClub || f.away === g.userClub)).sort((a, b) => b.date.localeCompare(a.date))[0]?.id; });
    await go({ name: 'report', id });
    await checkScreen('rapport');
    if (look === 'klassisk') await page.screenshot({ path: `${OUT}/klassisk-rapport.png` });
  });
  // ægte CM 01/02 med den originale database: kun originalens nyheder (ingen egne kampresultater, rygter, "Column:", træningsråd, trofæhyldest fra anfører/avis)
  if (look === 'klassisk' && ENGINE_GRID) await step('kun originalens nyheder (ægte tilstand, original DB)', async () => {
    const bad = await gs(() => window.__cm.gs().news.filter((n) => /^(match\.(won|drew|lost)|rumour\.interest|column\.month|news\.trainingAdvice|trophy\.(press|captain)\.)/.test(n.key ?? '')).map((n) => n.key));
    if (bad.length) throw new Error(`nyheder, der ikke findes i CM 01/02: ${[...new Set(bad)].join(', ')}`);
    // kampdagen: ingen "Press Continue Game to go to your match."
    if (await page.locator('.cx-md-hint').count()) throw new Error('kampdagens hjælpetekst står der stadig');
  });
  // CM 01/02: også computerklubbernes kampe kan ses som kampskærmen efter slutfløjt (kompakt rapport, g.miniReports)
  if (look === 'klassisk') await step('computerkamp som kampskærm (Player Ratings)', async () => {
    const id = await gs(() => { const g = window.__cm.gs(); return Object.keys(g.miniReports ?? {}).map(Number).find((i) => g.fixtures[i]?.result && g.fixtures[i].comp !== 'FRIENDLY'); });
    if (id === undefined) throw new Error('ingen kompakt rapport for en computerkamp');
    await go({ name: 'report', id });
    await page.getByRole('button', { name: 'Match Stats', exact: true }).first().click({ timeout: 5000 });
    if ((await page.locator('.cx-ms .cx-ms-row').count()) < 8) throw new Error('Match Stats er tom');
    await page.getByRole('button', { name: 'Action Zones', exact: true }).first().click({ timeout: 5000 });
    await page.waitForSelector('.cx-az', { timeout: 5000 });
    await page.getByRole('button', { name: 'Player Ratings', exact: true }).first().click({ timeout: 5000 });
    await page.waitForSelector('.cx-rt tr', { timeout: 5000 });
    const rows = await page.locator('.cx-rt tr').count();
    if (rows < 22) throw new Error(`Player Ratings har kun ${rows} rækker`);
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-computerkamp-karakterer.png` });
    await page.locator('.cx-subrow button').first().click({ timeout: 5000 });   // "<hjemmehold> Stats"
    if ((await page.locator('.cx-ts-tbl tbody tr').count()) < 11) throw new Error('Team Stats har under 11 rækker');
  });

  // CM 01/02: ulæste nyheder – Continue Game åbner den næste (ældste først) i stedet for at gå videre, og ingen springes over (ejerens fejl 13/11)
  if (look === 'klassisk') await step('Continue Game åbner de ulæste nyheder én ad gangen', async () => {
    // trøjenumre/European Squad venter ikke under testen (de stopper Continue Game før nyhederne)
    const due = await gs(() => { const c = window.__cm.gs().clubs[window.__cm.gs().userClub]; const d = [c.sqnDue, c.euroDue]; c.sqnDue = undefined; c.euroDue = undefined; return d; });
    const ids = await gs(() => {
      const g = window.__cm.gs();
      for (const n of g.news) n.read = true;
      const out = [];
      for (let i = 0; i < 3; i++) { const id = g.nextId.news++; out.push(id); g.news.unshift({ id, date: g.date, read: false, cat: 'board', key: 'board.cm', params: { club: 'E2E', title: `E2E news ${i}`, body: 'e2e' } }); }
      window.__cm.notify();
      return out;
    });
    const d0 = await gs(() => window.__cm.gs().date);
    await go({ name: 'competitions' });
    for (const [k, id] of ids.entries()) {
      await page.locator('.cx-side .cx-continue').first().click({ timeout: 10000 });
      await page.waitForSelector(`.cx-nrow.on[data-id="${id}"]`, { timeout: 5000 });
      await page.waitForTimeout(150);
      const unread = await gs((x) => x.filter((i) => !window.__cm.gs().news.find((n) => n.id === i)?.read), ids);
      if (unread.join() !== ids.slice(k + 1).join()) throw new Error(`efter tryk ${k + 1}: ulæste ${unread.join()} (ventede ${ids.slice(k + 1).join()})`);
      if (k === 0) await go({ name: 'squad' });
    }
    if ((await gs(() => window.__cm.gs().date)) !== d0) throw new Error('Continue Game gik videre, mens der var ulæste nyheder');
    await gs((d) => { const c = window.__cm.gs().clubs[window.__cm.gs().userClub]; c.sqnDue = d[0] ?? undefined; c.euroDue = d[1] ?? undefined; }, due);
  });

  // klassisk: indlæsningsbjælken (grå bjælke med datoen + blå fremdrift) vises med det samme, når Continue Game simulerer, og står til
  // simuleringen er færdig (ejeren 13/11: 3 s uden bjælke). Nyhederne dæmpes under målingen, så kørslen går til næste kamp.
  if (look === 'klassisk') await step('Continue Game viser indlæsningsbjælken med det samme', async () => {
    const saved = await gs(() => {
      const g = window.__cm.gs(); const c = g.clubs[g.userClub];
      const s = { m: g.options.mutedNews ?? null, d: [c.sqnDue ?? null, c.euroDue ?? null], pf: g.pendingFixture, done: g.dayDone, date: g.date };
      for (const n of g.news) n.read = true;
      g.options.mutedNews = ['match', 'transfer', 'contract', 'injury', 'board', 'scout', 'award', 'youth', 'job', 'general', 'finance'];
      c.sqnDue = undefined; c.euroDue = undefined; window.__cm.notify();
      return s;
    });
    if (saved.pf || !saved.done) { console.log(`    (springes over: kampdag ${saved.pf ?? ''} / dagen ikke spillet)`); }
    else {
      await go({ name: 'competitions' });
      // målt i siden (MutationObserver – også når simuleringen holder hovedtråden): hvornår bjælken kom i DOM'en og forsvandt, og hvornår
      // den første ramme med den blev tegnet (rAF); kørslen er færdig, når bjælken er væk
      await gs(() => {
        const m = { t0: performance.now(), on: -1, off: -1, paint: -1 };
        window.__bar = m;
        const ob = new MutationObserver(() => {
          const el = document.querySelector('.cx-running');
          if (el && m.on < 0) { m.on = performance.now() - m.t0; m.w = el.querySelector('.cx-run-bar')?.getBoundingClientRect().width ?? 0; requestAnimationFrame(() => { if (m.paint < 0) m.paint = performance.now() - m.t0; }); }
          if (!el && m.on >= 0 && m.off < 0) { m.off = performance.now() - m.t0; ob.disconnect(); }
        });
        ob.observe(document.body, { childList: true, subtree: true });
      });
      await page.locator('.cx-side .cx-continue').first().click({ timeout: 10000 });
      await page.waitForFunction(() => window.__bar.off >= 0 || performance.now() - window.__bar.t0 > 120000, null, { timeout: 130000, polling: 50 });
      const m = await gs(() => window.__bar);
      const days = await gs((d0) => Math.round((Date.parse(window.__cm.gs().date) - Date.parse(d0)) / 86400000), saved.date);
      console.log(`    bjælken: i DOM'en efter ${Math.round(m.on)} ms, tegnet efter ${Math.round(m.paint)} ms, væk efter ${Math.round(m.off)} ms (${days} dage simuleret)`);
      if (m.on < 0) throw new Error('indlæsningsbjælken blev ikke vist');
      if (m.on > 300) throw new Error(`indlæsningsbjælken kom først efter ${Math.round(m.on)} ms`);
      if (m.paint < 0 || m.paint > m.off) throw new Error('bjælken blev ikke tegnet før simuleringen');
      if (!(m.w >= 300)) throw new Error(`fremdriftsbjælken er kun ${Math.round(m.w ?? 0)} px bred (en tynd streg – skal fylde bundbjælken)`);
      // bjælken står hele kørslen: fra senest 300 ms efter klikket til simuleringen er færdig (fjernes først af run() efter runUntil)
      if (await page.locator('.cx-running').isVisible().catch(() => false)) throw new Error('bjælken står stadig');
    }
    await gs((s) => { const g = window.__cm.gs(); const c = g.clubs[g.userClub]; g.options.mutedNews = s.m ?? undefined; c.sqnDue = s.d[0] ?? undefined; c.euroDue = s.d[1] ?? undefined; window.__cm.notify(); }, saved);
  });

  // CM 01/02: Continue Game går gennem kampdagene (Evening Fixtures → resultater) frem til næste egne kamp uden at sætte sig fast
  if (look === 'klassisk') await step('Continue Game til næste kamp', async () => {
    let watched = 0;
    for (let i = 0; i < 200; i++) {
      const st = await gs(() => { const g = window.__cm.gs(); return { pf: g.pendingFixture, done: g.dayDone, date: g.date }; });
      if (st.pf) break;
      const yes = page.locator('.cx-confirm button.primary');
      if (await yes.isVisible().catch(() => false)) { await yes.click().catch(() => {}); await page.waitForTimeout(200); continue; }
      if (await answerSquadNumbers()) continue;
      if (await page.locator('.cx-md-panel').isVisible().catch(() => false) && !st.done) { watched++; if (process.env.SHOTS && watched === 1) await page.screenshot({ path: `${OUT}/klassisk-kampdag-uden-egen.png` }); }
      await page.locator('.cx-side .cx-continue').first().click({ timeout: 10000 });
      await page.waitForTimeout(250);
      if (i === 199) throw new Error(`Continue Game nåede ikke næste kamp (dato ${st.date})`);
    }
    await checkScreen('næste kamp');
  });
  if (look === 'klassisk') await step('Next Match → Progress', async () => {
    await go({ name: 'assistant' });
    const b = page.locator('.cx-greybtn', { hasText: 'Progress' });
    await b.click({ timeout: 5000 });
    await page.waitForSelector('.cx-prog', { timeout: 5000 });
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-progress.png` });
  });
  await page.screenshot({ path: `${OUT}/${look}-slut.png` });
  await ctx.close();
}

/** Database-editoren: opret en database, ret Tsigalko, start et nyt spil med den og se ændringen i spillet */
async function editor() {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  // editoren åbnes fra den klassiske startmenu (CM Reborn Options → Editor) og har det klassiske udseende
  await page.addInitScript(() => { localStorage.setItem('cm0102.lang', 'en'); localStorage.setItem('cm-theme', 'retro'); sessionStorage.setItem('cm0102.play', '1'); });
  const t = (k) => page.evaluate((key) => window.__cm.t(key), k);
  const step = async (name, fn) => {
    const before = errors.length;
    try {
      await fn();
      if (errors.length > before) throw new Error(`sidefejl: ${errors.slice(before).join(' | ')}`);
      console.log(`  ✓ editor: ${name}`);
    } catch (e) {
      failures.push(`editor: ${name}: ${e.message.split('\n')[0]}`);
      console.log(`  ✗ editor: ${name}: ${e.message.split('\n')[0]}`);
      await page.screenshot({ path: `${OUT}/editor-fejl.png` }).catch(() => {});
    }
  };
  await step('opret database og ret en spiller', async () => {
    await page.goto(URL);
    await page.waitForFunction(() => !!window.__cm, null, { timeout: 30000 });
    await page.waitForSelector('.cxs [data-field=opts]', { timeout: 30000 });
    await page.locator('[data-field=opts]').click();
    await page.locator('[data-testid=editor], [data-field=editor]').first().click();
    await page.waitForSelector('.cxl', { timeout: 10000 });
    await page.getByPlaceholder(await t('ed.newName')).fill('E2E Legends');
    await page.getByRole('button', { name: await t('ed.create'), exact: true }).click();
    await page.getByPlaceholder(await t('ed.searchPlayer')).fill('Tsigalko', { timeout: 60000 });
    await page.getByRole('row', { name: /Maxim Tsigalko/ }).click();
    await page.getByRole('textbox', { name: await t('ed.first') }).fill('Maksim');
    await page.locator('label', { hasText: await t('ed.pa') }).locator('select').selectOption('-2');
    await page.getByRole('button', { name: await t('ed.save'), exact: true }).first().click();
    await page.getByText(await t('ed.saved'), { exact: true }).waitFor();
  });
  await step('nyt spil med databasen', async () => {
    await page.getByRole('button', { name: await t('ed.play'), exact: true }).first().click();
    await page.waitForFunction(() => !!window.__cmPick, null, { timeout: 60000 });
    await page.getByText('E2E Legends').first().waitFor();
    await page.getByPlaceholder(await t('start.managerPlaceholder')).fill('E2E Editor');
    if (!(await page.evaluate(() => window.__cmPick(window.__cmClubId('Millwall'))))) throw new Error('Millwall findes ikke');
    await page.getByRole('button', { name: await t('start.begin') }).click();
    await page.waitForFunction(() => { try { return !!window.__cm.gs().userClub; } catch { return false; } }, null, { timeout: 60000 });
    const p = await page.evaluate(() => Object.values(window.__cm.gs().players).find((x) => x.last === 'Tsigalko' && x.pos[0] < 15));
    if (p?.first !== 'Maksim') throw new Error(`navnet slog ikke igennem: ${p?.first}`);
    // PA -2 som i originalen (playerInit.ts): oftest 120-200, 1 ud af 20 op til 49 lavere – men aldrig under CA.
    // Alle spillere kan desuden få et tilfældigt omslag (1/100 → PA 0, 1/750 → −1), der ender på CA (70) – det er ikke en fejl i editoren
    if (!(p.pa >= p.ca && (p.pa >= 71 || p.pa === p.ca))) throw new Error(`PA -2 slog ikke igennem: ${p.pa} (CA ${p.ca})`);
  });
  await ctx.close();
}

for (const look of ['klassisk', 'moderne']) if (only === look || (!only && (look === 'klassisk' || process.env.E2E_MODERN))) await run(look);
if (!only || only === 'editor') await editor();
await browser.close();
stop();
if (failures.length) {
  console.log(`\n${failures.length} fejl:\n${failures.map((f) => `  - ${f}`).join('\n')}`);
  process.exit(1);
}
console.log('\nAlle ende-til-ende-tests bestået');
process.exit(0);
