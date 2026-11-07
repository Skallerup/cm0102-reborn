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
    await page.locator('.cx-drop-sub button', { hasText: 'Europe' }).first().hover();
    if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-nationsclubs.png` });
    await page.locator('.cx-drop-sub .cx-drop-sub button').first().click();
    await page.waitForTimeout(300);
    await checkScreen('major club');
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
    await page.waitForSelector('.cx-inbox', { timeout: 5000 });
    const st = await gs(() => window.__cm.gs().offers.at(-1).status);
    if (st !== 'rejected') throw new Error(`buddet blev ikke afvist (${st})`);
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
    const [a, b] = await gs(() => { const g = window.__cm.gs(); const sq = Object.values(g.players).filter((p) => p.club === g.userClub).sort((x, y) => x.number - y.number); return [sq[1].id, sq[2].number]; });
    await page.locator('select[aria-label]').nth(1).selectOption(String(b));
    await page.waitForTimeout(300);
    const ok = await gs(([id, n]) => { const g = window.__cm.gs(); const sq = Object.values(g.players).filter((p) => p.club === g.userClub); return g.players[id].number === n && new Set(sq.map((p) => p.number)).size === sq.length; }, [a, b]);
    if (!ok) throw new Error('nummeret blev ikke byttet');
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
        await page.locator('.cx-confirm button.primary').click();
        await page.evaluate((id) => { window.__cm.gs().players[id].injury = null; }, injured);
        injured = 0; selSeen = true; await page.waitForTimeout(400); continue;
      }
      const yes = page.locator('.cx-confirm button.primary');
      if (await yes.isVisible().catch(() => false)) { await yes.click().catch(() => {}); await page.waitForTimeout(400); continue; }
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
      if (look === 'klassisk') { if (i === 0) await page.screenshot({ path: `${OUT}/klassisk-kamp.png` }); if (i === 0) { for (const k of [1, 2]) { await page.locator('.cx-side > button.cx-sbtn', { hasText: 'Tactics' }).nth(k - 1).click(); await page.waitForSelector('.cx-mt-tools', { timeout: 60000 }); await page.waitForTimeout(300); await page.screenshot({ path: `${OUT}/klassisk-kamptaktik-${k}.png` }); if (k === 2) { await page.locator('.cx-mt .c-name .link').first().click(); await page.waitForSelector('.cx-pl', { timeout: 10000 }); await page.locator('.cx-foot .cx-back').click(); await page.waitForSelector('.cx-side .cx-minute', { timeout: 10000 }); } if (await page.locator('.cx-foot .cx-mt-cancel').isVisible().catch(() => false)) { await page.locator('.cx-mt-tools .cx-drop-btn', { hasText: 'Tactics' }).click(); await page.locator('.cx-drop-pop [role=menuitem], .cx-drop-pop button', { hasText: 'Team Instructions' }).first().click(); await page.waitForSelector('.cx-tidlg', { timeout: 5000 }); await page.locator('.cx-tidlg .cx-tich', { hasText: 'Attacking' }).click(); { const on = await page.locator('.cx-tidlg .cx-tich.on').allTextContents(); if (!on.includes('Attacking')) throw new Error(`Attacking ikke valgt: ${on}`); } await page.waitForTimeout(400); await page.screenshot({ path: `${OUT}/klassisk-teaminstr-0.png` }); await page.locator('.cx-tidlg-arrow').first().click(); await page.waitForSelector('.cx-tidlg-menu'); await page.screenshot({ path: `${OUT}/klassisk-teaminstr.png` }); await page.locator('.cx-tidlg-menu button').first().click(); await page.locator('.cx-tidlg-foot button', { hasText: 'Ok' }).click(); await page.waitForSelector('.cx-tidlg', { state: 'detached', timeout: 5000 }); await page.locator('.cx-mt-tools .cx-drop-btn', { hasText: 'Edit' }).click(); { const bb = await page.locator('.cx-drop-pop').first().boundingBox(); const vw = page.viewportSize().width; if (!bb || bb.x < 0 || bb.x + bb.width > vw + 1) throw new Error(`Edit-menuen ligger uden for skærmen: ${JSON.stringify(bb)}`); } if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-edit.png` }); await page.keyboard.press('Escape'); } const cancel = page.locator('.cx-foot .cx-mt-cancel'); if (await cancel.isVisible().catch(() => false)) { await cancel.click(); await page.waitForTimeout(200); const yes2 = page.locator('.cx-confirm button.primary'); if (await yes2.isVisible().catch(() => false)) { if (process.env.SHOTS) await page.screenshot({ path: `${OUT}/klassisk-changesmade.png` }); await yes2.click(); } } } } if (i === 0) { for (const n of ['Match Stats', 'Action Zones', 'Match Report', 'Player Ratings', 'Latest Scores', 'League Table']) { const b = page.getByRole('button', { name: n, exact: true }).first(); if (await b.isVisible().catch(() => false)) { await b.click(); await page.waitForTimeout(200); await checkScreen(n); await page.screenshot({ path: `${OUT}/klassisk-kamp-${n.replace(/ /g, '')}.png` }); } } } await page.keyboard.press('e'); }
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
      if (await page.locator('.cx-md-panel').isVisible().catch(() => false) && !st.done) { watched++; if (process.env.SHOTS && watched === 1) await page.screenshot({ path: `${OUT}/klassisk-kampdag-uden-egen.png` }); }
      await page.locator('.cx-side .cx-continue').first().click({ timeout: 10000 });
      await page.waitForTimeout(250);
      if (i === 79) throw new Error(`Continue Game nåede ikke næste kamp (dato ${st.date})`);
    }
    await checkScreen('næste kamp');
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
    const p = await page.evaluate(() => Object.values(window.__cm.gs().players).find((x) => x.last === 'Tsigalko' && x.dob.startsWith('1983') && x.pos[0] < 15));
    if (p?.first !== 'Maksim') throw new Error(`navnet slog ikke igennem: ${p?.first}`);
    if (!(p.pa >= 150)) throw new Error(`PA -2 slog ikke igennem: ${p.pa}`);
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
