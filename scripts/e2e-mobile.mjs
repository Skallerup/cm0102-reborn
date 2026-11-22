// Mobiltest (fase 1): iPhone 13 og Pixel 7 (viewport, isMobile, hasTouch, page.tap) gennem forsiden, nyt spil (original database),
// hovedskærmene og en kamp – i klassisk og moderne udseende. Tager et skærmbillede pr. skærm og logger pr. skærm:
//  - utrykbare elementer (elementFromPoint på midten er ikke knappen/en efterkommer/en forfader → noget ligger ovenpå)
//  - klikmål under 32×32 px
//  - elementer, der kun har mus-lyttere (mouseenter/over/down/up) uden pointer/touch/click (CDP) – og en statisk scanning af src/
//  - vandret overflow (side og elementer, der stikker ud over skærmen)
//  - tekst, der klippes (overflow hidden uden ellipsis) eller knapper, der overlapper hinanden
// Kør: node scripts/e2e-mobile.mjs [klassisk|moderne] [iphone|pixel]   (MOBILE_OUT=<mappe> til skærmbillederne, PORT=<n>)
// Én browser ad gangen, ingen skærmbilleder i git. Rapport: <OUT>/report-<enhed>-<look>.json + oversigt på stdout.
import { spawn, execSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { chromium, devices } from 'playwright';

const PORT = Number(process.env.PORT) || 5189;
const URL = `http://localhost:${PORT}/cm0102-reborn/`;
const OUT = process.env.MOBILE_OUT || 'e2e-mobile-shots';
mkdirSync(OUT, { recursive: true });
const lookArg = process.argv[2], devArg = process.argv[3];
const LOOKS = lookArg ? [lookArg] : ['klassisk', 'moderne'];
const DEVICES = { iphone: devices['iPhone 13'], pixel: devices['Pixel 7'] };
const DEVS = devArg ? [devArg] : ['iphone', 'pixel'];

const server = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { stdio: 'ignore', env: { ...process.env, BROWSER: 'none' } });
const stop = () => { try { server.kill(); } catch { /* ignorer */ } };
process.on('exit', stop);
for (let i = 0; i < 60; i++) {
  try { if ((await fetch(URL)).ok) break; } catch { /* venter */ }
  await new Promise((r) => setTimeout(r, 500));
}

/** Kører i siden: finder trykbare elementer i synsfeltet og vurderer dem */
function auditInPage() {
  const vw = window.innerWidth, vh = window.innerHeight;
  const sel = 'button, a[href], input, select, textarea, [role=button], [role=menuitem], [role=menuitemcheckbox], [role=tab], summary, [draggable=true], .cx-sbtn, label[for]';
  const vis = (el) => {
    const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && Number(cs.opacity) > 0.05;
  };
  const name = (el) => `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.') : ''}${(el.innerText || el.getAttribute('aria-label') || el.title || '').trim().slice(0, 24) ? ` "${(el.innerText || el.getAttribute('aria-label') || el.title || '').trim().replace(/\s+/g, ' ').slice(0, 24)}"` : ''}`;
  const out = { covered: [], underBar: [], small: [], overflow: [], clipped: [], overlap: [], count: 0 };
  // alt, der ligger i en vandret rullende beholder, er ikke overflow
  const inHScroll = (el) => { for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) { const cs = getComputedStyle(p); if ((cs.overflowX === 'auto' || cs.overflowX === 'scroll') && p.scrollWidth > p.clientWidth) return true; } return false; };
  const els = [...document.querySelectorAll(sel)].filter((el) => vis(el) && !el.disabled);
  const rects = [];
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw) continue; // uden for synsfeltet (rulleområder)
    // kun den synlige del
    const x0 = Math.max(r.left, 0), x1 = Math.min(r.right, vw), y0 = Math.max(r.top, 0), y1 = Math.min(r.bottom, vh);
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    // skjulte filer/skjult input hører ikke med
    if (el.tagName === 'INPUT' && el.type === 'hidden') continue;
    out.count++;
    const top = document.elementFromPoint(cx, cy);
    if (top && top !== el && !el.contains(top) && !top.contains(el) && !(el.tagName === 'LABEL' && el.control && (el.control === top || el.contains(top)))) {
      // dækket af en fast/klæbende bjælke (sidebjælke, bundknapper, titel), mens elementet er rullet delvist ind under den: ikke en fejl, kun rulning
      const bar = top.closest('.cx-side, .cx-foot, .cx-head, .cx-title, .cx-foot-custom, .cx-date, footer, aside, .topbar, .mobile-tabs');
      (bar && !el.closest('.cx-side, .cx-foot') ? out.underBar : out.covered).push({ el: name(el), by: name(top), at: [Math.round(cx), Math.round(cy)] });
    }
    if (r.width < 32 || r.height < 32) out.small.push({ el: name(el), w: Math.round(r.width), h: Math.round(r.height) });
    if (!inHScroll(el) && (r.right > vw + 1 || r.left < -1)) out.overflow.push({ el: name(el), left: Math.round(r.left), right: Math.round(r.right) });
    rects.push({ el, r });
  }
  // knapper, der overlapper hinanden (samme niveau, over 20 % af den mindste)
  for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
    const a = rects[i], b = rects[j];
    if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
    const w = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left), h = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
    if (w > 2 && h > 2) {
      const small = Math.min(a.r.width * a.r.height, b.r.width * b.r.height);
      if ((w * h) / small > 0.2) {
        // overlap mellem to elementer, hvor den ene ligger over den anden (fx menu over knap), tæller kun som overlap, hvis de er i samme beholder
        if (a.el.parentElement === b.el.parentElement || a.el.closest('.cx-side') && b.el.closest('.cx-side')) out.overlap.push({ a: name(a.el), b: name(b.el), px: `${Math.round(w)}x${Math.round(h)}` });
      }
    }
  }
  // tekst der klippes: overflow hidden/clip uden ellipsis, hvor indholdet er bredere/højere end boksen
  for (const el of document.querySelectorAll('button, a, td, th, span, div, li, label, h1, h2, h3, p')) {
    if (out.clipped.length >= 25) break;
    if (!el.childNodes.length || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
    const cs = getComputedStyle(el);
    if (!vis(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) continue;
    const hide = (v) => v === 'hidden' || v === 'clip';
    const wide = el.scrollWidth > el.clientWidth + 2, tall = el.scrollHeight > el.clientHeight + 2;
    if ((hide(cs.overflowX) && wide && cs.textOverflow !== 'ellipsis') || (hide(cs.overflowY) && tall && cs.webkitLineClamp === 'none' && el.clientHeight > 0)) out.clipped.push({ el: name(el), sw: el.scrollWidth, cw: el.clientWidth, sh: el.scrollHeight, ch: el.clientHeight });
  }
  out.pageOverflowX = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  out.bodyOverflowX = document.body.scrollWidth - document.body.clientWidth;
  out.vw = vw; out.vh = vh;
  return out;
}

const summary = [];
const failures = [];
const slug = (s) => s.replace(/[^a-z0-9]+/gi, '-').toLowerCase();

async function run(devKey, look) {
  const dev = { ...DEVICES[devKey] }; delete dev.defaultBrowserType;
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...dev });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route(/\/api\/account\?op=(config|prompt)/, (r) => r.fulfill({ json: r.request().url().includes('op=prompt') ? { ok: true } : { mail: true } }));
  await page.addInitScript(({ theme }) => {
    localStorage.setItem('cm0102.lang', 'en'); localStorage.setItem('cm0102.forceLogin', '1'); localStorage.setItem('cm-theme', theme);
    if (theme !== 'retro') localStorage.setItem('cm0102.modern', '1');
    localStorage.setItem('cm0102.mode', 'authentic'); localStorage.setItem('cm0102.db', 'original'); localStorage.setItem('cm0102.engine', 'original');
    sessionStorage.setItem('cm0102.play', '1');
  }, { theme: look === 'klassisk' ? 'retro' : 'club' });
  const tag = `${devKey}-${look}`;
  const report = { device: devKey, look, screens: {} };
  const gs = async (fn, arg) => { await page.waitForFunction(() => !!window.__cm && !!window.__cmNav, null, { timeout: 30000 }); return page.evaluate(fn, arg); };
  const go = (r) => page.evaluate((route) => window.__cmNav(route), r);

  /** Mus-kun-lyttere via CDP: elementer med mouse*-lyttere men uden pointer/touch/click */
  const mouseOnly = async () => {
    const found = [];
    try {
      const { result } = await cdp.send('Runtime.evaluate', { expression: `Array.from(document.querySelectorAll('button, a, [role=button], [role=menuitem], .cx-sbtn, [draggable=true]'))` });
      const { result: props } = await cdp.send('Runtime.getProperties', { objectId: result.objectId, ownProperties: true });
      for (const p of props.slice(0, 400)) {
        if (!p.value?.objectId || !/^\d+$/.test(p.name)) continue;
        const { listeners } = await cdp.send('DOMDebugger.getEventListeners', { objectId: p.value.objectId });
        const types = new Set(listeners.map((l) => l.type));
        const mouse = ['mouseenter', 'mouseover', 'mousedown', 'mouseup', 'mousemove'].filter((x) => types.has(x));
        if (mouse.length && !['click', 'pointerdown', 'pointerup', 'touchstart', 'touchend'].some((x) => types.has(x))) {
          const d = await cdp.send('Runtime.callFunctionOn', { objectId: p.value.objectId, functionDeclaration: 'function(){return this.tagName+"."+(this.className||"")+" "+(this.innerText||"").trim().slice(0,20)}', returnByValue: true });
          found.push({ el: d.result.value, mouse });
        }
      }
    } catch (e) { found.push({ el: 'CDP-fejl', mouse: [e.message.slice(0, 60)] }); }
    return found;
  };

  const shot = async (name, extra = {}) => {
    await page.waitForTimeout(450);
    const file = join(OUT, `${tag}-${slug(name)}.png`);
    await page.screenshot({ path: file }).catch(() => {});
    const a = await page.evaluate(auditInPage);
    a.mouseOnly = await mouseOnly();
    a.file = file; Object.assign(a, extra);
    report.screens[name] = a;
    const bad = a.covered.length + a.small.length + a.overflow.length + a.clipped.length + a.overlap.length + a.mouseOnly.length + (a.pageOverflowX > 1 ? 1 : 0);
    console.log(`  ${tag}: ${name}: ${a.count} mål, utrykbare ${a.covered.length}, små ${a.small.length}, overflow ${a.overflow.length}${a.pageOverflowX > 1 ? ` (side +${a.pageOverflowX}px)` : ''}, klip ${a.clipped.length}, overlap ${a.overlap.length}, mus-kun ${a.mouseOnly.length}${bad ? '' : ' ✓'}`);
  };
  const step = async (name, fn) => {
    const before = errors.length;
    try { await fn(); if (errors.length > before) throw new Error(`sidefejl: ${errors.slice(before).join(' | ')}`); }
    catch (e) { failures.push(`${tag}: ${name}: ${e.message.split('\n')[0]}`); console.log(`  ✗ ${tag}: ${name}: ${e.message.split('\n')[0]}`); await page.screenshot({ path: join(OUT, `${tag}-fejl-${slug(name)}.png`) }).catch(() => {}); }
  };

  // ---------- forsiden ----------
  await step('forsiden', async () => {
    await page.goto(URL);
    await page.waitForTimeout(1500);
    await shot('forsiden');
  });

  // ---------- nyt spil (original database, Arsenal) med tap ----------
  if (look === 'klassisk') await step('nyt spil (klassisk)', async () => {
    await page.goto(URL);
    await page.waitForSelector('.cxs [data-field=new]');
    await shot('startmenu');
    await page.tap('[data-field=database]');
    await shot('start-database');
    await page.tap('[data-field="db-3.9.60"]');
    await page.tap('[data-field=new]');
    await page.waitForSelector('.cxs-lrow', { timeout: 60000 });
    await shot('start-leagues');
    await page.tap('.cx-foot .cx-next');
    await page.waitForSelector('[data-name=first]', { timeout: 20000 });
    await page.fill('[data-name=first]', 'E2E'); await page.fill('[data-name=second]', 'Tester');
    await shot('start-navn');
    await page.tap('.cx-foot .cx-next');
    await page.waitForSelector('[data-nat]');
    await page.tap('.cx-foot .cx-next');
    await page.waitForSelector('[data-club]', { timeout: 120000 });
    await shot('start-hold');
    await page.tap('[data-club="Arsenal"]');
    await page.waitForSelector('[data-take]', { timeout: 20000 });
    await shot('start-klub');
    await page.tap('[data-take]');
    await page.waitForSelector('[data-confirm]');
    await shot('start-bekraeft');
    await page.tap('.cx-foot .cx-next');
    await page.waitForFunction(() => { try { return window.__cm.gs().manager.name === 'E2E Tester' && !!window.__cm.gs().userClub; } catch { return false; } }, null, { timeout: 120000 });
  });
  else await step('nyt spil (moderne)', async () => {
    await page.goto(URL);
    await page.tap('button:has-text("New game"), button:has-text("Start")');
    await page.waitForFunction(() => !!window.__cmPick, null, { timeout: 30000 });
    await page.fill('input[placeholder]', 'E2E Tester');
    await shot('start-nyt-spil');
    if (!(await page.evaluate((id) => window.__cmPick(id), 676))) throw new Error('klubben findes ikke');
    await page.waitForTimeout(300);
    await shot('start-klub-valgt');
    await page.getByRole('button', { name: /begin|start career|kick/i }).last().tap();
    await page.waitForFunction(() => { try { return !!window.__cm.gs().userClub; } catch { return false; } }, null, { timeout: 120000 });
  });

  const star = await gs(() => { const g = window.__cm.gs(); return Object.values(g.players).filter((p) => p.club === g.userClub).sort((a, b) => b.ca - a.ca)[0]?.id; });
  const screens = [
    ['inbox', { name: 'inbox' }], ['squad', { name: 'squad' }], ['tactics', { name: 'tactics' }], ['player', { name: 'player', id: star }],
    ['club', { name: 'club' }], ['competitions', { name: 'competitions' }], ['transfers', { name: 'transfers' }], ['finances', { name: 'board' }],
    ['fixtures', { name: 'fixtures' }], ['training', { name: 'training' }], ['find', { name: 'find' }], ['game-options', { name: 'options' }],
  ];
  for (const [label, route] of screens) await step(`skærm ${label}`, async () => {
    await go(route);
    await shot(label);
    // lang skærm: ét billede mere efter rul, så bunden også ses (knapper nederst)
    await page.evaluate(() => { for (const el of document.querySelectorAll('.cx-main, .main, main')) el.scrollTo?.(0, 99999); window.scrollTo(0, 99999); });
    await shot(`${label}-bund`, { folded: await page.evaluate(() => document.querySelector('.shell')?.hasAttribute('data-fold') ?? false) });
  });

  // klassisk: Game Options-menuen i sidebjælken, Competitions-menuen og Continue Game
  if (look === 'klassisk') {
    await step('Game Options-menu (sidebjælke)', async () => {
      await go({ name: 'inbox' });
      await page.tap('.cx-side .cx-gopt');
      await shot('game-options-menu');
      await page.keyboard.press('Escape');
    });
    await step('Competitions-menu', async () => {
      await page.locator('.cx-side').getByRole('button', { name: 'Competitions', exact: true }).tap();
      await shot('competitions-menu');
      await page.keyboard.press('Escape');
    });
    await step('Continue Game', async () => {
      await go({ name: 'inbox' });
      await page.tap('.cx-side .cx-continue');
      await shot('continue-game');
    });
  } else await step('Continue (moderne)', async () => {
    await go({ name: 'inbox' });
    await page.getByRole('button', { name: /continue/i }).first().tap();
    await shot('continue');
  });

  // ---------- en kamp ----------
  // som scripts/e2e.mjs: svar på det, der spærrer Continue Game (trøjenumre, European Squad, bud/rygter/ønsker), og vent på forrige kørsel
  const answerBlocking = async () => {
    if (look !== 'klassisk') return false;
    if (await page.locator('.cx-sqn-list.tall').isVisible().catch(() => false)) {
      for (let k = 0; k < 6 && await page.locator('.cx-sqn-box:empty').count(); k++) {
        await page.locator('.cx-sqn-n.free:not([disabled])').first().tap().catch(() => {});
        await page.locator('.cx-sqn-box:empty').first().tap().catch(() => {});
      }
      await shot('trojenumre-foer-kamp');
      await page.locator('.cx-foot-btns button.primary').tap().catch(() => {});
      await page.waitForTimeout(300); return true;
    }
    const due = await page.evaluate(() => { const g = window.__cm.gs(); const c = g.clubs[g.userClub]; return { sqn: c?.sqnDue === g.season, eur: c?.euroDue === g.season }; });
    if (due.eur) {
      if (await page.locator('.cx-eur').isVisible().catch(() => false)) { await page.locator('.cx-eur .cx-sqn-bar .cx-grey').first().tap(); await page.locator('.cx-foot-btns button.primary').tap(); }
      else if (await page.locator('.cx-respond').isVisible().catch(() => false)) await page.locator('.cx-respond').first().tap();
      else return false;
      await page.waitForTimeout(300); return true;
    }
    if (await page.locator('.cx-inbox').isVisible().catch(() => false) && await page.locator('.cx-side .cx-continue').isDisabled().catch(() => false) && !due.sqn) {
      const fixed = await page.evaluate(() => { const g = window.__cm.gs(); let k = 0; for (const o of g.offers) if (o.status === 'pending' && o.seller === g.userClub) { o.status = 'rejected'; k++; } if (g.jobOffers.length) { g.jobOffers.length = 0; k++; } for (const n of g.news) if ((n.key === 'cm.rum' || n.key === 'cm.req') && !n.params.ans) { n.params = { ...n.params, ans: 3 }; k++; } window.__cm.notify(); return k; });
      if (!fixed && await page.locator('.cx-nbar .cx-respond').isVisible().catch(() => false)) await page.locator('.cx-nbar .cx-respond').first().tap();
      await page.waitForTimeout(300); return true;
    }
    if (!due.sqn) return false;
    if (await page.locator('.cx-foot-btns button.primary').isVisible().catch(() => false)) await page.locator('.cx-foot-btns button.primary').tap();
    else if (await page.locator('.cx-respond').isVisible().catch(() => false)) await page.locator('.cx-respond').first().tap();
    else return false;
    await page.waitForTimeout(300); return true;
  };
  const clearInjuries = () => page.evaluate(() => { const g = window.__cm.gs(); for (const p of Object.values(g.players)) if (p.club === g.userClub) p.injury = null; });
  const fastForward = () => page.evaluate(async () => { const c = window.__cm; const g = c.gs(); const f = Object.values(g.fixtures).filter((x) => x.home === g.userClub || x.away === g.userClub).sort((a, b) => a.date.localeCompare(b.date))[0]; if (!f) return; const days = Math.round((Date.parse(f.date) - Date.parse(g.date)) / 864e5) - 1; if (days > 0) await c.advance(days); const g2 = c.gs(); const me = g2.clubs[g2.userClub]; me.sqnDue = undefined; me.euroDue = undefined; for (const n of g2.news) n.read = true; });
  await step('kamp', async () => {
    // Continue Game-trinnet ovenfor har startet en kørsel: vent på den, før der spoles (ellers sidder kørslen fast på 2 %)
    await page.waitForSelector('.cx-running', { state: 'detached', timeout: 180000 }).catch(() => {});
    await fastForward(); await fastForward(); await clearInjuries();
    const kick = await page.evaluate((l) => window.__cm.t(l ? 'cl.mt.kickoff' : 'match.kickoff'), look === 'klassisk');
    const labels = await page.evaluate(() => [window.__cm.t('top.toTheMatch'), window.__cm.t('top.toMatch'), window.__cm.t('cl.continue'), window.__cm.t('top.continue')].filter(Boolean));
    // klassisk: en skadet spiller giver Team Selection (OK → truppen) – vis den én gang
    let injured = look === 'klassisk' ? await page.evaluate(() => { const g = window.__cm.gs(); const id = g.tactic?.lineup[3]; if (!id) return 0; g.players[id].injury = { key: 'hamstring', days: 60 }; return id; }) : 0;
    const selHead = await page.evaluate(() => window.__cm.t('cl.mt.teamSel'));
    for (let i = 0; i < 120; i++) {
      await page.waitForSelector('.cx-running', { state: 'detached', timeout: 120000 }).catch(() => {});
      if (await page.getByRole('button', { name: kick }).first().isVisible().catch(() => false)) break;
      await page.locator('.cx-confirm').waitFor({ timeout: 600 }).catch(() => {});
      const yes = page.locator('.cx-confirm button.primary');
      if (await yes.isVisible().catch(() => false)) {
        if (await page.locator('.cx-confirm .cx-subtitle', { hasText: selHead }).isVisible().catch(() => false)) {
          if (injured) await shot('team-selection');
          await yes.tap().catch(() => {});
          await clearInjuries(); injured = 0;
          await page.waitForTimeout(400); continue;
        }
        await yes.tap().catch(() => {}); await page.waitForTimeout(400); continue;
      }
      if (await answerBlocking()) continue;
      let clicked = false;
      for (const l of labels) { const b = page.getByRole('button', { name: l, exact: false }).first(); if (await b.isVisible().catch(() => false)) { await b.tap().catch(() => {}); clicked = true; break; } }
      if (!clicked) await go({ name: 'match' });
      if (i % 15 === 14) console.log('    kamp-spor', i, await page.evaluate(() => { const g = window.__cm.gs(); return `${g.date} pending=${!!g.pendingFixture} confirm=${!!document.querySelector('.cx-confirm')} running=${!!document.querySelector('.cx-running')} knapper=${[...document.querySelectorAll('button')].filter((b) => b.offsetParent).map((b) => b.innerText.trim().slice(0, 14)).slice(0, 14).join('|')}`; }));
      await page.waitForTimeout(400);
    }
    await shot('foer-kamp');
    await page.getByRole('button', { name: kick }).first().tap({ timeout: 10000 });
    await page.waitForTimeout(1500);
    await shot('kamp-i-gang');
    // faner i kampen (klassisk): Tactics og de øvrige visninger
    if (look === 'klassisk') {
      for (const n of ['Match Stats', 'Action Zones', 'Match Report', 'Player Ratings', 'Latest Scores', 'League Table']) {
        const b = page.getByRole('button', { name: n, exact: true }).first();
        if (await b.isVisible().catch(() => false)) { await b.tap().catch(() => {}); await shot(`kamp-${n}`); }
      }
      const tac = page.locator('.cx-side > button.cx-sbtn', { hasText: 'Tactics' }).first();
      if (await tac.isVisible().catch(() => false)) { await tac.tap().catch(() => {}); await page.waitForSelector('.cx-mt-tools', { timeout: 20000 }).catch(() => {}); await shot('kamp-taktik'); }
    }
    const toEnd = page.getByRole('button', { name: await page.evaluate(() => window.__cm.t('match.toEnd')) });
    const doneSel = look === 'klassisk' ? page.locator('.cx-side .cx-continue.continue') : page.getByRole('button', { name: await page.evaluate(() => window.__cm.t('match.continue')) }).first();
    for (let i = 0; i < 60 && !(await doneSel.isVisible().catch(() => false)); i++) {
      if (await page.locator('.cx-foot .cx-mt-cancel').isVisible().catch(() => false)) { await page.locator('.cx-foot .cx-mt-cancel').tap().catch(() => {}); await page.waitForTimeout(200); const y2 = page.locator('.cx-confirm button.primary'); if (await y2.isVisible().catch(() => false)) await y2.tap().catch(() => {}); }
      if (look === 'klassisk') await page.keyboard.press('e');
      if (await toEnd.isVisible().catch(() => false)) await toEnd.tap().catch(() => {});
      const resume = page.getByRole('button', { name: await page.evaluate(() => window.__cm.t('match.resume')) }).first();
      if (await resume.isVisible().catch(() => false)) await resume.tap().catch(() => {});
      await page.waitForTimeout(500);
    }
    await shot('kamp-slut');
    if (look === 'klassisk') await page.locator('.cx-side .cx-continue').tap({ timeout: 10000 });
    else await page.getByRole('button', { name: await page.evaluate(() => window.__cm.t('match.continue')) }).first().tap({ timeout: 10000 });
    await page.waitForTimeout(800);
    await shot('efter-kamp');
  });
  await step('kamprapport', async () => {
    const id = await page.evaluate(() => { const g = window.__cm.gs(); return Object.values(g.fixtures).filter((f) => f.result && (f.home === g.userClub || f.away === g.userClub)).sort((a, b) => b.date.localeCompare(a.date))[0]?.id; });
    if (!id) throw new Error('ingen spillet kamp');
    await go({ name: 'report', id });
    await shot('kamprapport');
    await page.evaluate(() => { for (const el of document.querySelectorAll('.cx-main, .main, main')) el.scrollTo?.(0, 99999); window.scrollTo(0, 99999); });
    await shot('kamprapport-bund');
  });

  writeFileSync(join(OUT, `report-${tag}.json`), JSON.stringify(report, null, 1));
  for (const [n, a] of Object.entries(report.screens)) summary.push({ tag, screen: n, targets: a.count, covered: a.covered.length, small: a.small.length, overflow: a.overflow.length + (a.pageOverflowX > 1 ? 1 : 0), clipped: a.clipped.length, overlap: a.overlap.length, mouseOnly: a.mouseOnly.length });
  await browser.close();
}

// statisk scanning: mus-kun-hændelser i src/ui (grov – React-lyttere ses ikke af CDP)
function staticScan() {
  const hits = {};
  const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (/\.tsx$/.test(f)) { const s = readFileSync(p, 'utf8'); for (const m of s.matchAll(/\b(onMouseEnter|onMouseOver|onMouseDown|onMouseUp|onMouseMove|onMouseLeave)=/g)) hits[`${p}:${m[1]}`] = (hits[`${p}:${m[1]}`] ?? 0) + 1; } } };
  walk('src');
  return hits;
}

for (const d of DEVS) for (const l of LOOKS) await run(d, l);
writeFileSync(join(OUT, 'summary.json'), JSON.stringify({ summary, staticMouse: staticScan(), failures }, null, 1));
console.table(summary);
if (failures.length) { console.log('\nFEJL:\n' + failures.join('\n')); process.exitCode = 1; }
console.log(`\nSkærmbilleder og rapporter: ${OUT}`);
stop();
void execSync;
