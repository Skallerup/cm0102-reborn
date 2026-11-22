// Det klassiske nye-spil-forløb med den originale database (3.9.60, England, Arsenal) + Continue Game i WebKit (Safari "RangeError: Out of memory" 19/11).
// Brug: node scripts/webkit-newgame.mjs [klik på Continue=4] [webkit|chromium]
// Samme trin som scripts/e2e.mjs' klassiske startforløb (dev-server, testkrogen window.__cm).
import { spawn, execSync } from 'node:child_process';
import { webkit, chromium } from 'playwright';

const conts = Number(process.argv[2] ?? 4);
const kind = process.argv[3] ?? 'webkit';
const PORT = Number(process.env.PORT) || 5194;
const URL = `http://localhost:${PORT}/cm0102-reborn/`;
// PROD=<mappe>: en produktionsbygning (npx vite build --outDir <mappe>) via vite preview – testkrogen findes ikke, så kun DOM'en
const PROD = process.env.PROD;
const server = spawn('npx', PROD ? ['vite', 'preview', '--outDir', PROD, '--port', String(PORT), '--strictPort'] : ['vite', '--port', String(PORT), '--strictPort'], { stdio: 'ignore', env: { ...process.env, BROWSER: 'none' } });
const stop = () => { try { server.kill(); } catch { /* */ } };
process.on('exit', stop);
for (let i = 0; i < 60; i++) { try { if ((await fetch(URL)).ok) break; } catch { /* */ } await new Promise((r) => setTimeout(r, 500)); }
const START_PIDS = execSync('ps -A -o pid=,command=', { encoding: 'utf8', maxBuffer: 1 << 24 }).split('\n').filter((l) => l.includes('ms-playwright')).map((l) => l.trim().split(/\s+/)[0]);
const browser = await (kind === 'chromium' ? chromium : webkit).launch();
// UA=<user agent>: fx Facebook-appens browser på iPhone (FBAN/FBIOS)
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...(process.env.UA ? { userAgent: process.env.UA } : {}) });
const page = await ctx.newPage();
await page.route(/\/api\//, (r) => r.fulfill({ json: { ok: true, mail: true } }));
const errs = [];
page.on('console', (m) => { const t = m.text(); if (t.startsWith('ngtrace ')) { console.log(`  t ${T()} ${t} fp ${rssNow().toFixed(0)} MB`); return; } if (/memory|fejlede|error|RangeError/i.test(t)) { console.log('  console: ' + t.slice(0, 400)); errs.push(t); } });
page.on('pageerror', (e) => { console.log('PAGEERROR ' + e.message + '\n' + (e.stack ?? '').slice(0, 1200)); errs.push(e.message); });
// TIMELINE: arbejdernes start/slut (hvilket trin toppen ligger i, også når der ikke vises en fremdriftsbjælke)
let nW = 0;
if (process.env.TIMELINE) page.on('worker', (w) => { const k = ++nW; console.log(`  t ${T()} arbejder ${k} start`); w.on('close', () => console.log(`  t ${T()} arbejder ${k} slut`)); });
page.on('crash', () => { console.log('CRASH'); errs.push('crash'); });
await page.addInitScript(() => { localStorage.setItem('cm0102.lang', 'en'); localStorage.setItem('cm0102.forceLogin', '1'); localStorage.setItem('cm-theme', 'retro'); localStorage.setItem('cm0102.mode', 'authentic'); localStorage.setItem('cm0102.db', 'original'); localStorage.setItem('cm0102.engine', 'original'); localStorage.setItem('cm0102.inapp.seen', String(Date.now())); sessionStorage.setItem('cm0102.play', '1'); });
// DBSIZE=normal|maximum: originalens databasestørrelse (ui/dbSize.ts); NGSPLIT=0: spilstarten i én arbejder (startGame.ts newGameStages)
// SLPARTS=n: ønskelisternes klubløkke i n arbejdere (startGame.ts newGameStages)
if (process.env.DBSIZE || process.env.NGSPLIT || process.env.SLPARTS) await page.addInitScript(([z, sp, sl]) => { if (z) localStorage.setItem('cm0102.dbsize', z); if (sp) localStorage.setItem('cm0102.ngSplit', sp); if (sl) localStorage.setItem('cm0102.ngSlParts', sl); }, [process.env.DBSIZE ?? '', process.env.NGSPLIT ?? '', process.env.SLPARTS ?? '']);
// KEEPLOAD=1: indlæsningens arbejder beholdes til den midlertidige verdens første trin (som før 22/11 – startGame.ts openStartWorld)
if (process.env.TIMELINE) await page.addInitScript(() => { localStorage.setItem('cm0102.ngTrace', '1'); });
if (process.env.KEEPLOAD) await page.addInitScript(() => { localStorage.setItem('cm0102.ngKeepLoad', '1'); });
// NOWORKER=1: uden Web Workers (som når dagens arbejder fejler – alt i hovedtråden)
if (process.env.NOWORKER) await page.addInitScript(() => { Object.defineProperty(window, 'Worker', { value: undefined, configurable: true }); });
// Chromium: hovedtrådens levende V8-heap efter en GC (CDP) ved hvert trin
const cdp = kind === 'chromium' ? await ctx.newCDPSession(page) : null;
// HEAPPROF=<fil-præfiks>: hovedtrådens allokeringsprofil (levende objekter) ved hvert trin (Chromium)
if (cdp && process.env.HEAPPROF) { await cdp.send('HeapProfiler.enable'); await cdp.send('HeapProfiler.startSampling', { samplingInterval: 65536 }); }
let profN = 0;
const saveProf = async () => { if (!cdp || !process.env.HEAPPROF) return; const { profile } = await cdp.send('HeapProfiler.getSamplingProfile'); (await import('node:fs')).writeFileSync(`${process.env.HEAPPROF}-${++profN}.heapprofile`, JSON.stringify(profile)); };
const mainHeap = async () => { await saveProf(); if (!cdp) return ''; await cdp.send('HeapProfiler.collectGarbage'); const u = await cdp.send('Runtime.getHeapUsage'); return ` hovedtråd ${(u.usedSize / 1048576).toFixed(0)} MB`; };
const t0 = Date.now();
// fanens proces (WebKit: WebContent, Chromium: renderer) – største RSS undervejs (hovedtråd + arbejdere i samme proces)
let peakRss = 0, peakAt = '';
// macOS: phys_footprint (med komprimeret hukommelse – RSS falder under pres) via footprint(1); `peak` = processens egen top
const allTabPids = () => execSync('ps -A -o pid=,command=', { encoding: 'utf8', maxBuffer: 1 << 24 }).split('\n').filter((l) => l.includes('ms-playwright') && /WebContent|--type=renderer/.test(l)).map((l) => l.trim().split(/\s+/)[0]);
// (kun denne browsers processer – ældre kørslers kan stadig være i gang med at lukke)
const oldPids = new Set(START_PIDS);
const tabPids = () => allTabPids().filter((x) => !oldPids.has(x));
const foot = (key) => { try { const ps = tabPids(); if (!ps.length) return 0; const out = execSync(`footprint --noCategories -f bytes ${ps.map((x) => `-p ${x}`).join(' ')}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); const v = [...out.matchAll(new RegExp(`${key}: (\\d+) B`, 'g'))].map((m) => Number(m[1]) / 1048576); lastPer = `${ps.length} pid [${v.map((x) => x.toFixed(0)).join(',')}]`; return Math.max(0, ...v); } catch { return 0; } };
let lastPer = '';
const rssNow = () => foot('phys_footprint');
let phase = 'start';
// TIMELINE=1: fanens footprint hvert sekund med trinnet under fremdriftsbjælken ([data-ng-step])
let ngStep = '';
const stepT = process.env.TIMELINE ? setInterval(() => { page.evaluate(() => document.querySelector('[data-ng-step]')?.getAttribute('data-ng-step') ?? '').then((s) => { ngStep = s; }).catch(() => {}); }, 500) : null;
const rssT = setInterval(() => { const r = rssNow(); if (process.env.TIMELINE) console.log(`  t ${T()} ${phase}/${ngStep} fp ${r.toFixed(0)} MB ${lastPer}`); if (r > peakRss) { peakRss = r; peakAt = phase + (ngStep ? '/' + ngStep : ''); } }, Number(process.env.TICK) || 1000);
const T = () => `${((Date.now() - t0) / 1000).toFixed(1)} s`;
let res = 'ok';
try {
  await page.goto(URL);
  await page.waitForSelector('.cxs [data-field=new]', { timeout: 120000 });
  await page.locator('[data-field=database]').click();
  await page.locator('[data-field="db-3.9.60"]').click();
  await page.waitForSelector('[data-field=new]');
  await page.locator('[data-field=new]').click();
  await page.waitForSelector('.cxs-lrow', { timeout: 120000 });
  await page.waitForTimeout(3000);
  console.log(`Select League(s) ${T()} fp nu ${rssNow().toFixed(0)} MB top ${peakRss.toFixed(0)} MB${await mainHeap()}`); phase = 'preview';
  await page.locator('.cx-foot .cx-next').click();
  if (await page.locator('[data-season]').first().waitFor({ timeout: 3000 }).then(() => true).catch(() => false)) await page.locator('.cx-foot .cx-next').click();
  await page.waitForSelector('[data-name=first]', { timeout: 20000 });
  await page.fill('[data-name=first]', 'Mem'); await page.fill('[data-name=second]', 'Test');
  await page.locator('.cx-foot .cx-next').click();
  await page.waitForSelector('[data-nat]');
  await page.locator('.cx-foot .cx-next').click();
  await page.waitForSelector('[data-club]', { timeout: 300000 });
  await page.waitForTimeout(3000); console.log(`Select Team ${T()} fp-top ${peakRss.toFixed(0)} MB (${peakAt}) nu ${rssNow().toFixed(0)} MB${await mainHeap()}`); phase = 'take control';
  await page.locator('[data-club="Arsenal"]').click();
  await page.waitForSelector('[data-take]', { timeout: 60000 });
  await page.locator('[data-take]').click();
  await page.waitForSelector('[data-confirm]');
  await page.locator('.cx-foot .cx-next').click();
  await page.waitForTimeout(3000);
  await page.waitForSelector('.cx-running', { state: 'detached', timeout: 600000 }).catch(() => {});
  await page.waitForSelector('.cx-side .cx-continue', { timeout: 600000 });
  await page.waitForTimeout(3000); console.log(`nyt spil ${T()} fp-top ${peakRss.toFixed(0)} MB (${peakAt}) nu ${rssNow().toFixed(0)} MB${await mainHeap()}`); phase = 'continue';
  for (let i = 0; i < conts; i++) {
    const dateNow = () => page.evaluate(() => { try { return window.__cm?.gs?.().date ?? document.querySelector('.cx-date, .cx-top-date')?.textContent ?? '?'; } catch { return '?'; } });
    const d0 = await dateNow();
    await page.waitForSelector('.cx-running', { state: 'detached', timeout: 600000 }).catch(() => {});
    const btn = page.locator('.cx-side .cx-continue').first();
    if (await btn.isDisabled().catch(() => true)) { console.log('Continue er grå – stopper'); break; }
    await btn.click({ timeout: 10000 });
    phase = 'continue ' + (i + 1);
    await page.waitForTimeout(2000);
    await page.waitForSelector('.cx-running', { state: 'detached', timeout: 600000 }).catch(() => {});
    console.log(`Continue ${i + 1}: ${d0} → ${await dateNow()} ${T()} fp-top ${peakRss.toFixed(0)} MB (${peakAt}) nu ${rssNow().toFixed(0)} MB${await mainHeap()}`);
  }
  // SNAP=<fil>: hovedtrådens heap-snapshot til sidst (Chromium) – hvem holder de gamle spil
  if (cdp && process.env.SNAP) {
    const fs = await import('node:fs'); const fd = fs.openSync(process.env.SNAP, 'w');
    cdp.on('HeapProfiler.addHeapSnapshotChunk', (e) => fs.writeSync(fd, e.chunk));
    await cdp.send('HeapProfiler.takeHeapSnapshot', { reportProgress: false });
    fs.closeSync(fd);
  }
} catch (e) { res = 'afbrudt: ' + e.message.split('\n')[0]; }
clearInterval(rssT); if (stepT) clearInterval(stepT);
console.log(`phys_footprint_peak (fanens proces): ${foot('phys_footprint_peak').toFixed(0)} MB`);
console.log(`${kind}: fp-top ${peakRss.toFixed(0)} MB (${peakAt}) – ${errs.length ? 'FEJL ' + errs.length : res} (${T()})`);
await browser.close();
stop();
process.exit(0);
