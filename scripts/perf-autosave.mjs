// Autogemmet efter en spilledag i browseren (Chromium/WebKit, Vite-udviklingsserveren), som scripts/perf-days.mjs: et gemt spil indlæses, og
// Continue Game køres én dag ad gangen gennem dagens Web Worker (__cm.advance). Efter hver dag ventes på selve autogemmet (Shell → scheduleAutosave →
// saveGame, hændelsen 'cm-saved'); hovedtrådens stop måles med en setTimeout-sonde (WebKit har ingen longtask): længste stop og summen af stop
// > 50 ms fra dagens slutning til gemmet er skrevet. SAVECHECK=1: arbejderens gem sammenlignes byte for byte med hovedtrådens (konsollen
// "savecheck SAME|DIFF", game/save.ts). Fanens phys_footprint (macOS footprint) måles hvert ½ s; SLOW=<faktor> drosler fanen (SIGSTOP/SIGCONT).
//   nice -n 20 node scripts/perf-autosave.mjs <gem-fil> [dage=5] [chromium|webkit]   (PORT=<n> SLOW=<f> SAVECHECK=1)
import { spawn, execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { chromium, webkit } from 'playwright';
const [file, daysS = '5', engine = 'chromium'] = process.argv.slice(2);
const DAYS = Number(daysS);
const PORT = Number(process.env.PORT) || 5247;
const URL = `http://localhost:${PORT}/cm0102-reborn/`;
// en anden (gammel) udviklingsserver på porten ville blive målt i stedet
try { await fetch(URL); console.error(`porten ${PORT} er optaget – PORT=<n>`); process.exit(2); } catch { /* fri */ }
const server = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { stdio: 'ignore', env: { ...process.env, BROWSER: 'none' } });
process.on('exit', () => { try { server.kill(); } catch { /* */ } });
for (let i = 0; i < 80; i++) { try { if ((await fetch(URL)).ok) break; } catch { /* */ } await new Promise((r) => setTimeout(r, 500)); }
const allTabPids = () => execSync('ps -A -o pid=,command=', { encoding: 'utf8', maxBuffer: 1 << 24 }).split('\n').filter((l) => l.includes('ms-playwright') && /WebContent|--type=renderer|-contentproc/.test(l)).map((l) => l.trim().split(/\s+/)[0]);
const old = new Set(allTabPids());
const browser = await (engine === 'webkit' ? webkit : chromium).launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
const checks = [];
page.on('console', (m) => { const t = m.text(); if (process.env.ALLCON) console.log('  c:', t.slice(0, 300)); if (t.startsWith('savecheck')) checks.push(t); else if (/dayWorker|fejlede/.test(t)) console.log('  console:', t.slice(0, 300)); });
await page.addInitScript((chk) => { localStorage.setItem('cm0102.lang', 'en'); localStorage.setItem('cm0102.forceLogin', '1'); localStorage.setItem('cm-theme', 'retro'); localStorage.setItem('cm0102.mode', 'authentic'); localStorage.setItem('cm0102.db', 'original'); localStorage.setItem('cm0102.engine', 'original'); if (chk) localStorage.setItem('cm0102.saveCheck', '1'); sessionStorage.setItem('cm0102.play', '1'); }, !!process.env.SAVECHECK);
await page.route(/\/api\/account\?op=(config|prompt)/, (r) => r.fulfill({ json: { mail: true } }));
await page.goto(URL);
await page.waitForSelector('.cxs [data-field=new]', { timeout: 30000 }).catch(async (e) => { await page.screenshot({ path: 'perf-autosave-fail.png' }); throw e; });
const tabPids = () => allTabPids().filter((x) => !old.has(x));
const foot = (key) => { try { const ps = tabPids(); if (!ps.length) return 0; const out = execSync(`footprint --noCategories -f bytes ${ps.map((x) => `-p ${x}`).join(' ')}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); return Math.max(0, ...[...out.matchAll(new RegExp(`${key}: (\\d+) B`, 'g'))].map((m) => Number(m[1]) / 1048576)); } catch { return 0; } };
let slowT = null;
const f = Number(process.env.SLOW);
const sig = (s) => { for (const p of tabPids()) { try { process.kill(Number(p), s); } catch { /* */ } } };
const slow = (on) => { if (!(f > 1)) return; if (on && !slowT) slowT = setInterval(() => { sig('SIGCONT'); setTimeout(() => sig('SIGSTOP'), 40 / f); }, 40); if (!on && slowT) { clearInterval(slowT); slowT = null; setTimeout(() => sig('SIGCONT'), 20); } };
process.on('exit', () => { if (slowT) clearInterval(slowT); sig('SIGCONT'); });
const b64 = readFileSync(file).toString('base64');
console.log(`${engine} · ${file.split('/').pop()} · ${(b64.length * 0.75 / 1048576).toFixed(1)} MB gz${f > 1 ? ` · SLOW ×${f}` : ''}`);
await page.evaluate(async (b64) => {
  const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const base = '/cm0102-reborn/src/game/';
  const st = await import(base + 'state.ts'); const sn = await import(base + 'snapshot.ts'); const sv = await import(base + 'save.ts');
  const saved = new Promise((res) => { window.addEventListener('cm-saved', res, { once: true }); });
  st.setGame(await sn.deserializeState(new Blob([bin]))); sv.upgradeLoaded();
  window.__firstSave = saved;
}, b64);
await page.waitForSelector('.cx-side', { timeout: 60000 });
await page.waitForFunction(() => !!(window.__cm && window.__cm.advance), null, { timeout: 60000 });
await page.evaluate(() => Promise.race([window.__firstSave, new Promise((r) => setTimeout(r, 30000))]));
await page.waitForTimeout(1500);
let peak = 0, sampling = false;
const sampler = setInterval(() => { if (sampling) peak = Math.max(peak, foot('phys_footprint')); }, 500);
const base0 = foot('phys_footprint');
const rows = [];
for (let d = 0; d < DAYS; d++) {
  sampling = true; slow(true);
  rows.push(await page.evaluate(async () => {
    const date = window.__cm.gs().date;
    let last = performance.now(), on = true; const stops = [];
    const tick = () => { const now = performance.now(); if (now - last > 50) stops.push({ at: last, d: now - last }); last = now; if (on) setTimeout(tick, 4); };
    setTimeout(tick, 4);
    const t0 = performance.now();
    await window.__cm.advance(1);
    const t1 = performance.now();
    const ts = await Promise.race([new Promise((res) => { window.addEventListener('cm-saved', () => res(performance.now()), { once: true }); }), new Promise((r) => setTimeout(() => r(-1), 60000))]);
    await new Promise((r) => setTimeout(r, 150));
    on = false;
    const after = stops.filter((s) => s.at >= t1 - 1);
    const ws = window.__cmDayRun?.save;
    return { date, day: Math.round(t1 - t0), save: ts < 0 ? -1 : Math.round(ts - t1), max: Math.round(Math.max(0, ...after.map((s) => s.d))), sum: Math.round(after.reduce((a, s) => a + s.d, 0)), dayMax: Math.round(Math.max(0, ...stops.filter((s) => s.at < t1 - 1).map((s) => s.d))), wms: ws?.ms, wmb: ws?.mb };
  }));
  slow(false); sampling = false;
  await page.waitForTimeout(800);
}
clearInterval(sampler);
for (const r of rows) console.log(`${r.date}  dag ${r.day} ms (længste stop under dagen ${r.dayMax}) · dag→gemt ${r.save} ms · hovedtrådens stop efter dagen: længste ${r.max} ms, i alt ${r.sum} ms${r.wms ? ` · arbejderens gem ${r.wms} ms ${r.wmb.toFixed(1)} MB` : ''}`);
const avg = (k) => Math.round(rows.reduce((a, r) => a + (r[k] ?? 0), 0) / rows.length);
console.log(`gennemsnit: dag ${avg('day')} ms · dag→gemt ${avg('save')} ms · stop efter dagen længste ${avg('max')} / i alt ${avg('sum')} ms`);
console.log(`phys_footprint (fanen): før ${base0.toFixed(0)} MB · top under dage+gem ${peak.toFixed(0)} MB · processens top ${foot('phys_footprint_peak').toFixed(0)} MB`);
if (checks.length) console.log(checks.join('\n'));
await browser.close(); server.kill(); process.exit(0);
