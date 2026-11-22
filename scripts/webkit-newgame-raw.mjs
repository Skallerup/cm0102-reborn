// Det klassiske nye-spil-forløb (som webkit-newgame.mjs: 3.9.60, England, Arsenal) i WebKit UDEN Playwright: Playwrights inspektør gemmer
// hvert svars indhold i fanens proces (målt 22/11: +180 MB pr. hentet 31 MB-database – findes ikke i Safari på en telefon). Her leverer en lille
// http-server prod-bygningen med et indsat styrescript (samme klik som webkit-newgame.mjs), og MiniBrowseren (Playwright.app) startes direkte.
// Brug: PROD=<vite build-mappe> node scripts/webkit-newgame-raw.mjs [DBSIZE=normal|maximum] [TICK=150]
import http from 'node:http';
import { spawn, execSync } from 'node:child_process';
import { readFileSync, statSync, existsSync, mkdtempSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join, extname } from 'node:path';
const PROD = process.env.PROD, PORT = Number(process.env.PORT) || 5198, BASE = '/cm0102-reborn/';
const DBSIZE = process.env.DBSIZE ?? 'normal';
const t0 = Date.now();
const T = () => `${((Date.now() - t0) / 1000).toFixed(1)} s`;
const DRIVER = `(() => {
  const ls = { 'cm0102.lang': 'en', 'cm0102.forceLogin': '1', 'cm-theme': 'retro', 'cm0102.mode': 'authentic', 'cm0102.db': 'original', 'cm0102.engine': 'original', 'cm0102.inapp.seen': String(Date.now()), 'cm0102.dbsize': '${DBSIZE}', 'cm0102.ngTrace': '${process.env.NOTRACE ? 0 : 1}' };
  for (const k in ls) localStorage.setItem(k, ls[k]);
  sessionStorage.setItem('cm0102.play', '1');
  const log = (s) => fetch('/__log?s=' + encodeURIComponent(s)).catch(() => {});
  const cl = console.log; console.log = (...a) => { const s = a.join(' '); if (s.startsWith('ngtrace')) log(s); cl(...a); };
  addEventListener('error', (e) => log('FEJL ' + e.message));
  const q = (s) => document.querySelector(s);
  const wait = async (s, ms = 300000, gone = false) => { const t = Date.now(); while (Date.now() - t < ms) { if (!!q(s) !== gone) return q(s); await new Promise((r) => setTimeout(r, 100)); } throw new Error('venter: ' + s); };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const click = async (s) => (await wait(s)).click();
  const fill = async (s, v) => { const el = await wait(s); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })); };
  (async () => {
    try {
      await wait('.cxs [data-field=new]', 120000);
      await click('[data-field=database]'); await click('[data-field="db-3.9.60"]'); await click('[data-field=new]');
      await wait('.cxs-lrow', 120000); await sleep(3000); log('MARK Select League');
      await click('.cx-foot .cx-next');
      await sleep(3000); if (q('[data-season]')) await click('.cx-foot .cx-next');
      await fill('[data-name=first]', 'Mem'); await fill('[data-name=second]', 'Test'); await sleep(200);
      await click('.cx-foot .cx-next'); await wait('[data-nat]'); await click('.cx-foot .cx-next');
      await wait('[data-club]'); await sleep(3000); log('MARK Select Team');
      await click('[data-club="Arsenal"]'); await click('[data-take]'); await wait('[data-confirm]'); await click('.cx-foot .cx-next');
      await sleep(3000); await wait('.cx-running', 600000, true); await wait('.cx-side .cx-continue', 600000); await sleep(3000);
      log('MARK nyt spil'); log('SLUT');
    } catch (e) { log('FEJL ' + e.message); log('SLUT'); }
  })();
})();`;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.m4a': 'audio/mp4' };
let finish;
const finished = new Promise((r) => { finish = r; });
let phase = 'start', peak = 0, peakAt = '';
const srv = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname === '/__log') { const s = u.searchParams.get('s'); res.end('ok'); if (s.startsWith('MARK ')) { console.log(`${s.slice(5)} ${T()} top ${peak.toFixed(0)} MB (${peakAt}) nu ${fp('phys_footprint').toFixed(0)} MB`); phase = s.slice(5); } else if (s === 'SLUT') finish(); else console.log(`  t ${T()} ${s} fp ${fp('phys_footprint').toFixed(0)} MB`); return; }
  if (u.pathname.startsWith('/api/')) { res.setHeader('content-type', 'application/json'); res.end('{"ok":true,"mail":true}'); return; }
  let p = u.pathname.startsWith(BASE) ? u.pathname.slice(BASE.length) : u.pathname.slice(1);
  let f = join(PROD, decodeURIComponent(p));
  if (!p || !existsSync(f) || statSync(f).isDirectory()) f = join(PROD, 'index.html');
  res.setHeader('content-type', TYPES[extname(f)] ?? 'application/octet-stream');
  let body = readFileSync(f);
  if (f.endsWith('index.html')) body = Buffer.from(String(body).replace('<head>', `<head><script>${DRIVER}</script>`));
  res.end(body);
}).listen(PORT);
const old = new Set(execSync('ps -A -o pid=,command=', { encoding: 'utf8' }).split('\n').filter((l) => /WebContent/.test(l)).map((l) => l.trim().split(/\s+/)[0]));
const pids = () => execSync('ps -A -o pid=,command=', { encoding: 'utf8' }).split('\n').filter((l) => /WebContent/.test(l) && l.includes('ms-playwright')).map((l) => l.trim().split(/\s+/)[0]).filter((x) => !old.has(x));
const fp = (key) => { try { const ps = pids(); if (!ps.length) return 0; const o = execSync(`footprint --noCategories -f bytes ${ps.map((x) => `-p ${x}`).join(' ')}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); return Math.max(0, ...[...o.matchAll(new RegExp(`${key}: (\\d+) B`, 'g'))].map((m) => Number(m[1]) / 1048576)); } catch { return 0; } };
const pw = spawn(`${homedir()}/Library/Caches/ms-playwright/webkit-2370/pw_run.sh`, // en frisk profil pr. kørsel (ellers genoptager siden det sidste spil); HEADLESS=1 uden vindue
  [`--user-data-dir=${mkdtempSync(join(process.env.TMPDIR ?? tmpdir(), 'wkraw-'))}`, ...(process.env.HEADLESS ? ['--headless'] : []), `http://localhost:${PORT}${BASE}`], { stdio: 'ignore' });
const tm = setInterval(() => { const v = fp('phys_footprint'); if (process.env.TIMELINE) console.log(`  t ${T()} ${phase} fp ${v.toFixed(0)} MB`); if (v > peak) { peak = v; peakAt = phase; } }, Number(process.env.TICK) || 150);
await Promise.race([finished, new Promise((r) => setTimeout(r, 600000))]);
clearInterval(tm);
console.log(`phys_footprint_peak (fanens proces): ${fp('phys_footprint_peak').toFixed(0)} MB; prøvernes top ${peak.toFixed(0)} MB (${peakAt}) – ${T()}`);
pw.kill(); srv.close();
try { execSync('pkill -f "webkit-2370/Playwright.app"'); } catch { /* */ }
process.exit(0);
