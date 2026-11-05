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
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript((theme) => { localStorage.setItem('cm0102.lang', 'en'); localStorage.setItem('cm-theme', theme); sessionStorage.setItem('cm0102.play', '1'); }, look === 'klassisk' ? 'retro' : 'club');
  const t = (k) => page.evaluate((key) => window.__cm.t(key), k);
  const go = (r) => page.evaluate((route) => window.__cmNav(route), r);
  const gs = (fn, arg) => page.evaluate(fn, arg);
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
    if (!(await page.evaluate(() => window.__cmPick(1920)))) throw new Error('klubben findes ikke');
    await page.getByRole('button', { name: await t('start.begin') }).click();
    await page.waitForFunction(() => { try { return !!window.__cm.gs().userClub; } catch { return false; } }, null, { timeout: 60000 });
  });

  const star = await gs(() => { const g = window.__cm.gs(); return Object.values(g.players).filter((p) => p.club === g.userClub).sort((a, b) => b.ca - a.ca)[0]?.id; });
  const other = await gs(() => { const g = window.__cm.gs(); return Object.values(g.clubs).find((c) => c.id !== g.userClub && c.league === g.clubs[g.userClub].league)?.id; });
  const screens = [
    { name: 'inbox' }, { name: 'squad' }, { name: 'player', id: star }, { name: 'tactics' }, { name: 'training' }, { name: 'fixtures' },
    { name: 'competitions' }, { name: 'transfers' }, { name: 'scouting' }, { name: 'staff' }, { name: 'finance' }, { name: 'club', id: other },
    { name: 'club' }, { name: 'board' }, { name: 'assistant' }, { name: 'history' }, { name: 'awards' }, { name: 'jobs' }, { name: 'managers' },
    { name: 'find' }, { name: 'options' }, { name: 'help' },
  ];
  for (const r of screens) await step(`skærm ${r.name}${r.id ? ` (${r.id})` : ''}`, async () => { await go(r); await checkScreen(r.name); });

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
    const kick = await t('match.kickoff');
    const labels = [await t('top.toTheMatch'), await t('top.toMatch'), await t('cl.continue'), await t('top.continue')].filter(Boolean);
    for (let i = 0; i < 120; i++) {
      if (await page.getByRole('button', { name: kick }).first().isVisible().catch(() => false)) break;
      let clicked = false;
      for (const l of labels) {
        const b = page.getByRole('button', { name: l, exact: false }).first();
        if (await b.isVisible().catch(() => false)) { await b.click().catch(() => {}); clicked = true; break; }
      }
      if (!clicked) await go({ name: 'match' });
      await page.waitForTimeout(400);
    }
    await page.getByRole('button', { name: kick }).first().click({ timeout: 10000 });
    await page.waitForTimeout(800);
    const toEnd = page.getByRole('button', { name: await t('match.toEnd') });
    for (let i = 0; i < 60 && !(await page.getByRole('button', { name: await t('match.continue') }).first().isVisible().catch(() => false)); i++) {
      if (await toEnd.isVisible().catch(() => false)) await toEnd.click().catch(() => {});
      // pause med holdsnak/udskiftning: fortsæt
      const resume = page.getByRole('button', { name: await t('match.resume') }).first();
      if (await resume.isVisible().catch(() => false)) await resume.click().catch(() => {});
      await page.waitForTimeout(500);
    }
    await page.getByRole('button', { name: await t('match.continue') }).first().click({ timeout: 10000 });
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

  await page.screenshot({ path: `${OUT}/${look}-slut.png` });
  await ctx.close();
}

for (const look of ['klassisk', 'moderne']) if (!only || only === look) await run(look);
await browser.close();
stop();
if (failures.length) {
  console.log(`\n${failures.length} fejl:\n${failures.map((f) => `  - ${f}`).join('\n')}`);
  process.exit(1);
}
console.log('\nAlle ende-til-ende-tests bestået');
process.exit(0);
