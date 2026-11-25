// Ydelsesmåling: tid fra klik på venstre bar-knapperne til næste tegning (klassisk, original 2001-database, Man Utd, spillet frem).
// Kør: nice -n 20 node scripts/perf-menus.mjs [dage=200]   (PROFILE=fil.cpuprofile skriver en CPU-profil, PORT=<n> en anden port)
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
const PORT = Number(process.env.PORT) || 5188;
const URL = `http://localhost:${PORT}/cm0102-reborn/`;
const DAYS = Number(process.argv[2] ?? 200);
const server = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { stdio: 'ignore', env: { ...process.env, BROWSER: 'none' } });
process.on('exit', () => { try { server.kill(); } catch { /* */ } });
for (let i = 0; i < 80; i++) { try { if ((await fetch(URL)).ok) break; } catch { /* */ } await new Promise((r) => setTimeout(r, 500)); }
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
page.on('console', (m) => { if (/^serializeBytes/.test(m.text())) console.log(m.text()); });
await page.addInitScript(() => { localStorage.setItem('cm0102.lang', 'en'); localStorage.setItem('cm0102.forceLogin', '1'); localStorage.setItem('cm-theme', 'retro'); localStorage.setItem('cm0102.mode', 'authentic'); localStorage.setItem('cm0102.db', 'original'); localStorage.setItem('cm0102.engine', 'original'); sessionStorage.setItem('cm0102.play', '1'); });
await page.route(/\/api\/account\?op=(config|prompt)/, (r) => r.fulfill({ json: { mail: true } }));
await page.goto(URL);
await page.waitForSelector('.cxs [data-field=new]');
if (process.env.LOAD) {
  // et gemt spil (scripts/gen-late-save.ts) lægges ind som spillet
  const b64 = readFileSync(process.env.LOAD).toString('base64');
  await page.evaluate(async (b64) => {
    const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const base = '/cm0102-reborn/src/game/';
    const st = await import(base + 'state.ts'); const sn = await import(base + 'snapshot.ts'); const sv = await import(base + 'save.ts');
    st.setGame(await sn.deserializeState(new Blob([bin]))); sv.upgradeLoaded();
  }, b64);
  await page.waitForSelector('.cx-side', { timeout: 60000 });
} else {
await page.locator('[data-field=database]').click();
await page.locator('[data-field="db-3.9.60"]').click();
await page.locator('[data-field=new]').click();
await page.waitForSelector('.cxs-lrow', { timeout: 60000 });
await page.locator('.cxs-lrow[data-nation="Denmark"] [data-sl=selected]').click();
await page.locator('.cx-foot .cx-next').click();
if (await page.locator('[data-season]').first().waitFor({ timeout: 3000 }).then(() => true).catch(() => false)) await page.locator('.cx-foot .cx-next').click();
await page.waitForSelector('[data-name=first]', { timeout: 20000 });
await page.fill('[data-name=first]', 'Perf'); await page.fill('[data-name=second]', 'Tester');
await page.locator('.cx-foot .cx-next').click();
await page.waitForSelector('[data-nat]'); await page.locator('.cx-foot .cx-next').click();
await page.waitForSelector('[data-club]', { timeout: 120000 });
await page.locator('[data-club="Man Utd"]').click();
await page.waitForSelector('[data-take]'); await page.locator('[data-take]').click();
await page.waitForSelector('[data-confirm]'); await page.locator('.cx-foot .cx-next').click();
await page.waitForFunction(() => { try { return window.__cm.gs().manager.name === 'Perf Tester' && !!window.__cm.gs().userClub; } catch { return false; } }, null, { timeout: 120000 });
await page.waitForSelector('.cx-side');
}
const t0 = Date.now();
await page.evaluate((d) => window.__cm.advance(d), DAYS);
console.log(`spillet frem ${DAYS} dage: ${((Date.now() - t0) / 1000).toFixed(1)} s; dato ${await page.evaluate(() => window.__cm.gs().date)}; nyheder ${await page.evaluate(() => window.__cm.gs().news.length)}`);
await page.waitForTimeout(4000);
console.log(await page.evaluate(async () => { const g = window.__cm.gs(); let t = performance.now(); const raw = JSON.stringify(g).length; const a = performance.now() - t; t = performance.now(); const b = await window.__cm.serializeState(g); return `JSON ${(raw / 1048576).toFixed(1)} MB (${a.toFixed(0)} ms), gzip ${(b.size / 1048576).toFixed(1)} MB (${(performance.now() - t).toFixed(0)} ms)`; }));
// tid fra klik til næste tegning
const paint = () => page.evaluate(() => new Promise((res) => { requestAnimationFrame(() => setTimeout(res, 0)); }));
const cdp = await page.context().newCDPSession(page);
if (process.env.PROFILE) { await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 200 }); await cdp.send('Profiler.start'); }
const targets = [
  ['Competitions', '.cx-side .cx-drop-btn:has-text("Competitions")'],
  ['Nations & Clubs', '.cx-side .cx-drop-btn:has-text("Nations")'],
  ['Find', '.cx-side .cx-drop-btn:has-text("Find")'],
  ['Game Options', '.cx-side .cx-drop-btn:has-text("Game Options")'],
];
await page.evaluate(() => { window.__saves = 0; window.__long = []; window.addEventListener('cm-saved', () => { window.__saves++; }); new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__long.push(Math.round(e.duration)); }).observe({ entryTypes: ['longtask'] }); });
const res = {};
for (let rep = 0; rep < 4; rep++) {
  for (const [name, sel] of targets) {
    const loc = page.locator(sel).first();
    if (!(await loc.count())) { res[name] = res[name] ?? ['saknes']; continue; }
    await page.evaluate(() => { window.__t = performance.now(); });
    await loc.dispatchEvent('click');
    await paint();
    const total = await page.evaluate(() => performance.now() - window.__t);
    (res[name] = res[name] ?? []).push(Math.round(total));
    await page.keyboard.press('Escape'); await page.waitForTimeout(200);
  }
}
if (process.env.SAVE) {
  // Gem Game: hvor længe blokeres siden (lange opgaver) under ét gem, og hvor lang tid tager det i alt
  const cdp2 = await page.context().newCDPSession(page);
  await cdp2.send('Profiler.enable'); await cdp2.send('Profiler.setSamplingInterval', { interval: 500 }); await cdp2.send('Profiler.start');
  console.log(await page.evaluate(async () => {
    window.__long = [];
    const sv = await import('/cm0102-reborn/src/game/save.ts');
    const sn = await import('/cm0102-reborn/src/game/snapshot.ts');
    const st = await import('/cm0102-reborn/src/game/state.ts');
    let t0 = performance.now(); const parts = await sn.serializeBytes(st.gs()); const ser = performance.now() - t0;
    console.log('serializeBytes ms', Math.round(ser), 'lange opgaver:', window.__long.join(' ')); window.__long = [];
    await new Promise((r) => setTimeout(r, 300));
    const t = performance.now(); await sv.saveGame(); const total = performance.now() - t;
    await new Promise((r) => setTimeout(r, 500));
    return `saveGame ${Math.round(total)} ms i alt; lange opgaver (ms): ${window.__long.join(' ')}`;
  }));
  writeFileSync(process.env.SAVE, JSON.stringify((await cdp2.send('Profiler.stop')).profile));
}
// skærmskift (hele Shell tegnes om, inkl. venstre bars menuer)
for (const [name, route] of [['squad', { name: 'squad' }], ['inbox', { name: 'inbox' }], ['fixtures', { name: 'fixtures' }], ['finance', { name: 'finance' }], ['inbox', { name: 'inbox' }]]) {
  await page.evaluate(() => { window.__t = performance.now(); });
  await page.evaluate((r) => window.__cmNav(r), route);
  await paint();
  (res[`nav ${name}`] = res[`nav ${name}`] ?? []).push(Math.round(await page.evaluate(() => performance.now() - window.__t)));
  await page.waitForTimeout(300);
}
if (process.env.PROFILE) { const { profile } = await cdp.send('Profiler.stop'); writeFileSync(process.env.PROFILE, JSON.stringify(profile)); }
await page.waitForTimeout(4000);
console.log('gem under klikkene:', await page.evaluate(() => window.__saves), 'lange opgaver (ms):', (await page.evaluate(() => window.__long)).join(' '));
for (const [k, v] of Object.entries(res)) console.log(k.padEnd(18), v.join(' '), 'ms');
await browser.close(); server.kill(); process.exit(0);
