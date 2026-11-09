// Ende-til-ende-test i en rigtig browser: klassisk og moderne udseende.
// Starter selv Vite (dev-tilstand, så testkrogene __cm/__cmNav/__cmPick findes), klikker igennem alle hovedskærme,
// tester taktikskærmen (byt spillere, flyt pladser, instruktioner) og spiller en hel kamp.
// Fejler ved sidefejl, tomme skærme eller rå oversættelsesnøgler. Kør: node scripts/e2e.mjs [klassisk|moderne]
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const PORT = 5187;
const URL = `http://localhost:${PORT}/cm0102-reborn/`;
const OUT = 'e2e-shots';
const only = process.argv[2];
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
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript((theme) => { localStorage.setItem('cm0102.lang', 'en'); localStorage.setItem('cm0102.forceLogin', '1'); localStorage.setItem('cm-theme', theme); localStorage.setItem('cm0102.mode', 'extended'); localStorage.setItem('cm0102.db', localStorage.getItem('cm0102.db') ?? 'modern'); sessionStorage.setItem('cm0102.play', '1'); }, look === 'klassisk' ? 'retro' : 'club');
  // NB: ægte CM 01/02 er standard ved nyt spil – testen kører det udvidede spil (træningskampe, pressemøder m.m.)
  const t = (k) => page.evaluate((key) => window.__cm.t(key), k);
  const go = (r) => page.evaluate((route) => window.__cmNav(route), r);
  const gs = (fn, arg) => page.evaluate(fn, arg);
  // klassisk (CM 01/02): Continue Game venter på trøjenummerlisten (beskeden 4/8) – Respond → Submit → Yes
  const answerSquadNumbers = async () => {
    if (!(await gs(() => { const g = window.__cm.gs(); return g.clubs[g.userClub]?.sqnDue === g.season; }))) return false;
    if (await page.locator('.cx-sqn .cx-ts-buttons button.primary').isVisible().catch(() => false)) await page.locator('.cx-sqn .cx-ts-buttons button.primary').click();
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

  await step('nyt spil', async () => {
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
    if (!(await page.evaluate(() => window.__cmPick(1920)))) throw new Error('klubben findes ikke');
    await page.getByRole('button', { name: await t('start.begin') }).click();
    await page.waitForFunction(() => { try { return !!window.__cm.gs().userClub; } catch { return false; } }, null, { timeout: 60000 });
  });

  const star = await gs(() => { const g = window.__cm.gs(); return Object.values(g.players).filter((p) => p.club === g.userClub).sort((a, b) => b.ca - a.ca)[0]?.id; });
  const other = await gs(() => { const g = window.__cm.gs(); return Object.values(g.clubs).find((c) => c.id !== g.userClub && c.league === g.clubs[g.userClub].league)?.id; });
  const screens = [
    { name: 'inbox' }, { name: 'squad' }, { name: 'player', id: star }, { name: 'tactics' }, { name: 'training' }, { name: 'fixtures' },
    { name: 'competitions' }, { name: 'competitions', id: 'CL' }, { name: 'international' }, { name: 'international', tab: 'fifa' }, { name: 'international', id: await gs(() => window.__cm.gs().clubs[window.__cm.gs().userClub].nation) }, { name: 'transfers' }, { name: 'scouting' }, { name: 'staff' }, { name: 'finance' }, { name: 'club', id: other },
    { name: 'club' }, { name: 'board' }, { name: 'assistant' }, { name: 'history' }, { name: 'awards' }, { name: 'jobs' }, { name: 'managers' },
    { name: 'find' }, { name: 'staff', id: Number(await gs(() => Object.keys(window.__cm.gs().staff)[0])) }, { name: 'nation', tab: 'managers' }, { name: 'nation', tab: 'jobs' }, { name: 'nation', tab: 'transfers' }, { name: 'options' }, { name: 'help' },
  ];
  for (const [i, r] of screens.entries()) await step(`skærm ${r.name}${r.id ? ` (${r.id})` : ''}`, async () => { await go(r); await checkScreen(r.name); if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/${look}-s${String(i).padStart(2, '0')}-${r.name}.png` }); });
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
  if (look === 'klassisk') await step('spillerens faner (klassisk)', async () => {
    await go({ name: 'player', id: star });
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-spiller-Profile.png` });
    for (const tab of ['Injuries & Bans', 'Contract', 'Transfer', 'History']) {
      await page.getByRole('button', { name: tab, exact: true }).first().click();
      await page.waitForTimeout(200);
      await checkScreen(`spiller ${tab}`);
      if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-spiller-${tab.replace(/[^a-z]/gi, '')}.png` });
    }
    for (const v of ['Achievements', 'Injuries', 'Bans', 'Playing Career']) {
      await page.locator('.cx-pl .cx-drop-btn', { hasText: 'View' }).first().click();
      await page.locator('.cx-drop-pop button', { hasText: v }).first().click();
      await page.waitForTimeout(150);
    }
  });
  if (look === 'klassisk') await step('anden klubs taktik (Tactics ▸)', async () => {
    const other = await gs(() => { const g = window.__cm.gs(); return Object.values(g.clubs).find((c) => c.id !== g.userClub && c.league === g.clubs[g.userClub].league).id; });
    await go({ name: 'club', id: other });
    await page.locator('.cx-subrow button', { hasText: 'Tactics' }).first().click();
    await page.waitForSelector('.cx-tac-view .cx-tac-slot', { timeout: 10000 });
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
    const r6 = await gs(() => window.__cm.gs().tactic.individual[6]?.run);
    if (!r6 || !(r6.x > s0.x) || !(r6.y !== s0.y)) throw new Error(`skråt løb blev ikke sat (${JSON.stringify(r6)} fra ${JSON.stringify(s0)})`);
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-loeb.png` });
    // et meget kort træk fjerner pilen
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
    await page.mouse.down({ button: 'right' });
    await page.mouse.move(b.x + b.width / 2 + 6, b.y + b.height / 2, { steps: 3 });
    await page.mouse.up({ button: 'right' });
    if (await gs(() => window.__cm.gs().tactic.individual[6]?.run)) throw new Error('kort træk fjernede ikke løbet');
  });
  if (look === 'klassisk') await step('byt bænk ↔ startopstilling i listen', async () => {
    await go({ name: 'tactics' });
    const before = await gs(() => { const t = window.__cm.gs().tactic; return { a: t.lineup[9], b: t.bench[0] }; });
    await page.locator('.cx-tac-row.bench .cx-tac-name').first().click();
    await page.locator('.cx-tac-row.xi .cx-tac-name').nth(9).click();
    const after = await gs(() => { const t = window.__cm.gs().tactic; return { a: t.lineup[9], b: t.bench[0] }; });
    if (after.a !== before.b || after.b !== before.a) throw new Error(`byttet mislykkedes ${JSON.stringify(before)} → ${JSON.stringify(after)}`);
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
    const order = await gs(() => window.__cm.gs().tactic.penOrder);
    if (order?.length !== 2) throw new Error(`rækkefølgen blev ikke sat: ${JSON.stringify(order)}`);
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-straffeskytter.png` });
    await page.locator('.cx-pens .cx-pen-done').click();
    await page.waitForSelector('.cx-tac-pitch', { timeout: 5000 });
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
    if (before !== await gs(() => JSON.stringify(window.__cm.gs().tactic.slots))) throw new Error('Paste gav ikke den kopierede formation tilbage');
  });
  if (look === 'klassisk') await step('Referee Stats', async () => {
    const lg = await gs(() => { const g = window.__cm.gs(); return g.clubs[g.userClub].league; });
    await go({ name: 'competitions', id: lg });
    await page.locator('.cx-subrow button, .cx-sub button', { hasText: 'Referee Stats' }).first().click();
    await page.waitForSelector('.cx-refs', { timeout: 5000 });
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-dommere.png` });
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
  if (look === 'klassisk') await step('Manager Status og Selected League(s)', async () => {
    await go({ name: 'mgrstatus' }); await page.waitForSelector('.cx-mstat .cx-chist-row', { timeout: 5000 });
    await go({ name: 'leagues' }); await page.waitForSelector('.cx-sl .cx-sl-row.lg-sel', { timeout: 5000 });
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-ligaer.png` });
    await go({ name: 'ranking' }); await page.waitForSelector('.cx-subtitle', { timeout: 5000 }); await page.waitForTimeout(800);
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-halloffame.png` });
    await checkScreen('hall of fame');
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
    await page.locator('.cx-ts-buttons button.primary', { hasText: 'Yes' }).click();
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
    await page.locator('.cx-bid .cx-ts-buttons button', { hasText: 'Back' }).click();
    await page.waitForSelector('.cx-bid', { state: 'detached', timeout: 5000 });
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
      await page.locator('.cx-sqn .cx-ts-buttons button.primary').click();
      await page.locator('.cx-confirm button.primary').click({ timeout: 5000 });
    } else {
      await page.locator('select[aria-label]').nth(1).selectOption(String(b));
    }
    await page.waitForTimeout(300);
    const ok = await gs(([id, n]) => { const g = window.__cm.gs(); const nums = Object.values(g.players).filter((p) => p.club === g.userClub && p.number).map((p) => p.number); return g.players[id].number === n && new Set(nums).size === nums.length; }, [a, b]);
    if (!ok) throw new Error('nummeret blev ikke flyttet');
  });
  // turneringsvælgeren skal skifte turnering, også når skærmen er åbnet på en bestemt (fx Champions League)
  await step('turneringsvælger skifter turnering', async () => {
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
      await page.locator('.cx-tac-row', { hasText: name }).first().click();
      await page.locator(slotSel).nth(9).click();
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
      await page.getByRole('button', { name: await t('cl.tac.with') }).click().catch(async () => page.getByRole('button', { name: 'With Ball' }).click());
      await page.locator('.cx-ti-row', { hasText: await t('ti.tempo') }).getByRole('button', { name: await t('ti.fast') }).click();
      await page.locator(slotSel).nth(10).click();
      await page.locator('.cx-ti-row', { hasText: await t('pi.holdUp') }).getByRole('button', { name: await t('common.yes') }).click();
    } else {
      await page.locator('.ti-row', { hasText: await t('ti.tempo') }).getByRole('radio', { name: await t('ti.fast') }).click();
      await page.locator(slotSel).nth(10).click();
      await page.locator('.ti-row', { hasText: await t('pi.holdUp') }).getByRole('radio', { name: await t('common.yes') }).click();
    }
    await page.waitForTimeout(200);
    const after = await gs(() => { const tc = window.__cm.gs().tactic; return { tempo: tc.team.tempo, hold: tc.individual[10]?.holdUp }; });
    if (after.tempo !== 2) throw new Error(`tempo blev ${after.tempo}`);
    if (after.hold !== true) throw new Error('"hold bolden" blev ikke sat');
    if ((await tac()) === before) throw new Error('taktikken ændrede sig ikke');
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
    // klassisk (CM 01/02): Continue Game → "Proceed to the match ?" (Yes) → Kick Off Match i sidebjælken
    const kick = await t(look === 'klassisk' ? 'cl.mt.kickoff' : 'match.kickoff');
    const labels = [await t('top.toTheMatch'), await t('top.toMatch'), await t('cl.continue'), await t('top.continue')].filter(Boolean);
    // klassisk: en skadet spiller på holdet stopper kampen (Team Selection), indtil holdet er rettet
    let injured = look === 'klassisk' ? await page.evaluate(() => { const g = window.__cm.gs(); const id = g.tactic?.lineup[3]; if (!id) return 0; g.players[id].injury = { key: 'hamstring', days: 60 }; return id; }) : 0;
    let selSeen = false;
    for (let i = 0; i < 120; i++) {
      if (await page.getByRole('button', { name: kick }).first().isVisible().catch(() => false)) break;
      let clicked = false;
      const selHead = await t('cl.mt.teamSel');
      if (injured && await page.locator('.cx-confirm .cx-subtitle', { hasText: selHead }).isVisible().catch(() => false)) {
        if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-teamselection.png` });
        // sidebjælken må ikke dækkes af boksen
        { const sb = await page.locator('.cx-side').boundingBox(); const db = await page.locator('.cx-confirm').boundingBox(); if (sb && db && db.x < sb.x + sb.width - 1) throw new Error(`Team Selection dækker sidebjælken (${db.x} < ${sb.x + sb.width})`); }
        await page.locator('.cx-confirm button.primary').click();
        // OK fører til truppen, hvor holdet kan rettes (CM 01/02)
        await page.waitForSelector('.cx-sq-row', { timeout: 10000 });
        await page.evaluate((id) => { window.__cm.gs().players[id].injury = null; }, injured);
        injured = 0; selSeen = true; await page.waitForTimeout(400); continue;
      }
      const yes = page.locator('.cx-confirm button.primary');
      if (await yes.isVisible().catch(() => false)) { await yes.click().catch(() => {}); await page.waitForTimeout(400); continue; }
      if (await answerSquadNumbers()) continue;
      for (const l of labels) {
        const b = page.getByRole('button', { name: l, exact: false }).first();
        if (await b.isVisible().catch(() => false)) { await b.click().catch(() => {}); clicked = true; break; }
      }
      if (!clicked) await go({ name: 'match' });
      await page.waitForTimeout(400);
    }
    if (look === 'klassisk' && !selSeen) throw new Error('Team Selection blev ikke vist for en skadet spiller');
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
  });

  // CM 01/02: Continue Game går gennem kampdagene (Evening Fixtures → resultater) frem til næste egne kamp uden at sætte sig fast
  if (look === 'klassisk') await step('Continue Game til næste kamp', async () => {
    let watched = 0;
    for (let i = 0; i < 80; i++) {
      const st = await gs(() => { const g = window.__cm.gs(); return { pf: g.pendingFixture, done: g.dayDone, date: g.date }; });
      if (st.pf) break;
      const yes = page.locator('.cx-confirm button.primary');
      if (await yes.isVisible().catch(() => false)) { await yes.click().catch(() => {}); await page.waitForTimeout(200); continue; }
      if (await answerSquadNumbers()) continue;
      if (await page.locator('.cx-md-panel').isVisible().catch(() => false) && !st.done) { watched++; if (process.env.SHOTS && watched === 1) await page.screenshot({ path: `${OUT}/klassisk-kampdag-uden-egen.png` }); }
      await page.locator('.cx-side .cx-continue').first().click({ timeout: 10000 });
      await page.waitForTimeout(250);
      if (i === 79) throw new Error(`Continue Game nåede ikke næste kamp (dato ${st.date})`);
    }
    await checkScreen('næste kamp');
  });
  if (look === 'klassisk') await step('Next Match → Progress', async () => {
    await go({ name: 'assistant' });
    const b = page.locator('.cx-greybtn', { hasText: 'Progress' });
    await b.click({ timeout: 5000 });
    await page.waitForSelector('.cx-prog svg circle.me', { timeout: 5000 });
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
  await page.addInitScript(() => { localStorage.setItem('cm0102.lang', 'en'); sessionStorage.setItem('cm0102.play', '1'); });
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
    await page.getByRole('button', { name: new RegExp(await t('ed.title')) }).first().click();
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
    // PA -2 som i originalen (playerInit.ts): oftest 120-200, 1 ud af 20 op til 49 lavere – men aldrig under CA
    if (!(p.pa >= 71 && p.pa >= p.ca)) throw new Error(`PA -2 slog ikke igennem: ${p.pa}`);
  });
  await ctx.close();
}

for (const look of ['klassisk', 'moderne']) if (!only || only === look) await run(look);
if (!only || only === 'editor') await editor();
await browser.close();
stop();
if (failures.length) {
  console.log(`\n${failures.length} fejl:\n${failures.map((f) => `  - ${f}`).join('\n')}`);
  process.exit(1);
}
console.log('\nAlle ende-til-ende-tests bestået');
process.exit(0);
