// Tid pr. spilledag i browseren (Chromium/WebKit, Vite-udviklingsserveren): et gemt spil (scripts/day-times.ts SAVES=… eller gen-late-save.ts)
// indlæses (strømmende, som Load Game), og Continue Game køres én dag ad gangen gennem dagens Web Worker (ui/dayRunner.ts, som __cm.advance):
// ms pr. dag, kopien frem/tilbage (__cmDayRun), tiden til næste tegning efter dagen (React), gem (serializeBytes + saveGame) og indlæsning.
//   nice -n 20 node scripts/perf-days.mjs <gem-fil> [dage=10] [chromium|webkit]   (PORT=<n>)
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { chromium, webkit } from 'playwright';
const [file, daysS = '10', engine = 'chromium'] = process.argv.slice(2);
const DAYS = Number(daysS);
const PORT = Number(process.env.PORT) || 5189;
const URL = `http://localhost:${PORT}/cm0102-reborn/`;
const server = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { stdio: 'ignore', env: { ...process.env, BROWSER: 'none' } });
process.on('exit', () => { try { server.kill(); } catch { /* */ } });
for (let i = 0; i < 80; i++) { try { if ((await fetch(URL)).ok) break; } catch { /* */ } await new Promise((r) => setTimeout(r, 500)); }
const browser = await (engine === 'webkit' ? webkit : chromium).launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
await page.addInitScript(() => { localStorage.setItem('cm0102.lang', 'en'); localStorage.setItem('cm0102.forceLogin', '1'); localStorage.setItem('cm-theme', 'retro'); localStorage.setItem('cm0102.mode', 'authentic'); localStorage.setItem('cm0102.db', 'original'); localStorage.setItem('cm0102.engine', 'original'); sessionStorage.setItem('cm0102.play', '1'); });
await page.route(/\/api\/account\?op=(config|prompt)/, (r) => r.fulfill({ json: { mail: true } }));
await page.goto(URL);
await page.waitForSelector('.cxs [data-field=new]');
const b64 = readFileSync(file).toString('base64');
console.log(`${engine} · ${file.split('/').pop()} · ${(b64.length * 0.75 / 1048576).toFixed(1)} MB gz`);
console.log(await page.evaluate(async (b64) => {
  const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const base = '/cm0102-reborn/src/game/';
  const st = await import(base + 'state.ts'); const sn = await import(base + 'snapshot.ts'); const sv = await import(base + 'save.ts');
  const t0 = performance.now();
  const g = await sn.deserializeState(new Blob([bin]));
  const t1 = performance.now();
  st.setGame(g); sv.upgradeLoaded();
  return `indlæs: parse ${(t1 - t0).toFixed(0)} ms + setGame ${(performance.now() - t1).toFixed(0)} ms`;
}, b64));
await page.waitForSelector('.cx-side', { timeout: 60000 });
await page.waitForFunction(() => !!(window.__cm && window.__cm.advance), null, { timeout: 60000 });
await page.waitForTimeout(3000);
const paint = () => new Promise((res) => { requestAnimationFrame(() => setTimeout(res, 0)); });
const rows = [];
for (let d = 0; d < DAYS; d++) {
  rows.push(await page.evaluate(async () => {
    const date = window.__cm.gs().date;
    const t0 = performance.now();
    await window.__cm.advance(1);
    const t1 = performance.now();
    await new Promise((res) => { requestAnimationFrame(() => setTimeout(res, 0)); });
    const s = window.__cmDayRun ?? {};
    return { date, ms: Math.round(t1 - t0), paint: Math.round(performance.now() - t1), send: s.sendMs, recv: s.recvMs };
  }));
}
for (const r of rows) console.log(`${r.date}  dag ${r.ms} ms (kopi frem ${r.send} / tilbage ${r.recv}) · tegning ${r.paint} ms`);
const avg = (k) => Math.round(rows.reduce((a, r) => a + (r[k] ?? 0), 0) / rows.length);
console.log(`gennemsnit: dag ${avg('ms')} ms · kopi frem ${avg('send')} · tilbage ${avg('recv')} · tegning ${avg('paint')} ms`);
console.log(await page.evaluate(async () => {
  const base = '/cm0102-reborn/src/game/';
  const sv = await import(base + 'save.ts'); const sn = await import(base + 'snapshot.ts'); const st = await import(base + 'state.ts');
  const long = []; new PerformanceObserver((l) => { for (const e of l.getEntries()) long.push(Math.round(e.duration)); }).observe({ entryTypes: ['longtask'] });
  let t = performance.now(); const parts = await sn.serializeBytes(st.gs()); const ser = performance.now() - t;
  t = performance.now(); await sv.saveGame(); const tot = performance.now() - t;
  await new Promise((r) => setTimeout(r, 300));
  return `gem: serializeBytes ${ser.toFixed(0)} ms (${(sn.gzSize(parts) / 1048576).toFixed(1)} MB) · saveGame i alt ${tot.toFixed(0)} ms · længste stop ${Math.max(0, ...long)} ms`;
}));
await browser.close(); server.kill(); process.exit(0);
