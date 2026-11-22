// Som webkit-parse-bench.mjs, men WebKit (Playwrights MiniBrowser) startes UDEN Playwright/inspektøren – er hentningens hukommelse et
// måleartefakt? En lille http-server leverer public/data og en side, der kører metoden i en Web Worker og melder tilbage.
// Brug: node scripts/webkit-fetch-raw.mjs [fil=world-original-normal.json] [metode=bytes|json|keys|range|none]
import http from 'node:http';
import { spawn, execSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
const [file = 'world-original-normal.json', m = 'bytes'] = process.argv.slice(2);
const PORT = 5197;
const bench = readFileSync(new URL('./webkit-parse-bench.mjs', import.meta.url), 'utf8');
const WORKER = bench.slice(bench.indexOf('const WORKER = `') + 16, bench.indexOf('`;\nfor (let r'));
let done;
const result = new Promise((r) => { done = r; });
const srv = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname === '/') { res.setHeader('content-type', 'text/html'); res.end(`<script>const w = new Worker(URL.createObjectURL(new Blob([${JSON.stringify(WORKER)}], { type: 'text/javascript' }))); w.onmessage = (e) => { setTimeout(() => { w.terminate(); fetch('/done?ms=' + e.data.ms); }, 1500); }; setTimeout(() => w.postMessage({ url: location.origin + '/data/${file}', m: '${m}' }), 1500);</script>`); return; }
  if (u.pathname === '/done') { res.end('ok'); done(u.searchParams.get('ms')); return; }
  if (u.pathname.startsWith('/data/')) {
    const p = new URL(`../public${u.pathname}`, import.meta.url);
    const size = statSync(p).size, buf = readFileSync(p);
    const rg = /bytes=(\d+)-(\d+)/.exec(req.headers.range ?? '');
    if (rg) { const a = Number(rg[1]), b = Math.min(size - 1, Number(rg[2])); res.writeHead(206, { 'content-type': 'application/json', 'content-range': `bytes ${a}-${b}/${size}`, 'content-length': b - a + 1 }); res.end(buf.subarray(a, b + 1)); return; }
    res.writeHead(200, { 'content-type': 'application/json', 'content-length': size }); res.end(buf); return;
  }
  res.statusCode = 404; res.end();
}).listen(PORT);
const old = new Set(execSync('ps -A -o pid=,command=', { encoding: 'utf8' }).split('\n').filter((l) => /WebContent/.test(l)).map((l) => l.trim().split(/\s+/)[0]));
const pw = spawn(`${homedir()}/Library/Caches/ms-playwright/webkit-2370/pw_run.sh`, ['--headless', '--no-startup-window', `http://localhost:${PORT}/`].slice(0, 1).concat([`http://localhost:${PORT}/`]), { stdio: 'ignore' });
let peak = 0, pids = [];
const tm = setInterval(() => {
  pids = execSync('ps -A -o pid=,command=', { encoding: 'utf8' }).split('\n').filter((l) => /WebContent/.test(l) && l.includes('ms-playwright')).map((l) => l.trim().split(/\s+/)[0]).filter((x) => !old.has(x));
  if (!pids.length) return;
  try { const o = execSync(`footprint --noCategories -f bytes ${pids.map((x) => `-p ${x}`).join(' ')}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); peak = Math.max(peak, ...[...o.matchAll(/phys_footprint_peak: (\d+) B/g)].map((x) => Number(x[1]) / 1048576)); } catch { /* */ }
}, 300);
const ms = await Promise.race([result, new Promise((r) => setTimeout(() => r('timeout'), 60000))]);
await new Promise((r) => setTimeout(r, 600));
clearInterval(tm);
console.log(`${m} (${file}) uden Playwright: WebContent-top ${peak.toFixed(0)} MB, ${ms} ms, pid ${pids.join(',')}`);
pw.kill(); srv.close();
process.exit(0);
