// Databasens hentning + tolkning i en Web Worker i WebKit: fanens footprint-top pr. metode (hukommelse, telefoner 22/11).
// Brug: PROD=<vite build-mappe> node scripts/webkit-parse-bench.mjs [fil=world-original-normal.json] [metoder=json,keys,text,bytes,keys:ratings+players] [gentagelser=2]
import { spawn, execSync } from 'node:child_process';
import { webkit } from 'playwright';
const [file = 'world-original-normal.json', methods = 'json,keys', reps = '2'] = process.argv.slice(2);
const PORT = Number(process.env.PORT) || 5196;
const URL = `http://localhost:${PORT}/cm0102-reborn/`;
const server = spawn('npx', ['vite', 'preview', '--outDir', process.env.PROD, '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
process.on('exit', () => { try { server.kill(); } catch { /* */ } });
for (let i = 0; i < 60; i++) { try { if ((await fetch(URL)).ok) break; } catch { /* */ } await new Promise((r) => setTimeout(r, 500)); }
const old = new Set(execSync('ps -A -o pid=,command=', { encoding: 'utf8' }).split('\n').filter((l) => l.includes('ms-playwright')).map((l) => l.trim().split(/\s+/)[0]));
const browser = await webkit.launch();
// hver kørsel i sin egen fane (egen WebContent-proces): processens egen top (phys_footprint_peak) – ingen prøvetagning, der misser toppen
const pids = () => execSync('ps -A -o pid=,command=', { encoding: 'utf8' }).split('\n').filter((l) => l.includes('ms-playwright') && /WebContent/.test(l)).map((l) => l.trim().split(/\s+/)[0]).filter((x) => !old.has(x));
const fp = (key, ps) => { try { const o = execSync(`footprint --noCategories -f bytes ${ps.map((x) => `-p ${x}`).join(' ')}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); return Math.max(0, ...[...o.matchAll(new RegExp(`${key}: (\\d+) B`, 'g'))].map((m) => Number(m[1]) / 1048576)); } catch { return 0; } };
const WORKER = `
function jsonTopKeys(buf, want) {
  const out = {}; const dec = new TextDecoder(); const n = buf.length; let i = 0;
  const ws = () => { while (i < n && (buf[i] === 0x20 || buf[i] === 0x0a || buf[i] === 0x0d || buf[i] === 0x09)) i++; };
  const str = () => { i++; while (i < n) { const c = buf[i++]; if (c === 0x5c) i++; else if (c === 0x22) return; } };
  ws(); i++;
  for (;;) { ws(); if (i >= n || buf[i] === 0x7d) break; if (buf[i] === 0x2c) { i++; ws(); }
    const k0 = i; str(); const key = JSON.parse(dec.decode(buf.subarray(k0, i))); ws(); i++; ws(); const v0 = i; let depth = 0;
    while (i < n) { const c = buf[i]; if (c === 0x22) { str(); if (depth === 0) break; continue; } if (c === 0x7b || c === 0x5b) depth++; else if (c === 0x7d || c === 0x5d) { if (depth === 0) break; if (--depth === 0) { i++; break; } } else if (depth === 0 && c === 0x2c) break; i++; }
    if (!want || want.has(key)) out[key] = JSON.parse(dec.decode(buf.subarray(v0, i))); }
  return out; }
let keep;
onmessage = async (e) => { const { url, m } = e.data; const t = performance.now();
  if (m === 'json') keep = await (await fetch(url)).json();
  else if (m === 'text') keep = JSON.parse(await (await fetch(url)).text());
  else if (m.startsWith('keys')) keep = jsonTopKeys(new Uint8Array(await (await fetch(url)).arrayBuffer()), m.includes(':') ? new Set(m.slice(5).split('+')) : null);
  else if (m === 'none') keep = { a: 1 };
  else if (m === 'stream') { const r = await fetch(url); const ch = []; let o = 0; const rd = r.body.getReader(); for (;;) { const { done, value } = await rd.read(); if (done) break; ch.push(value); o += value.length; } keep = { ch, o }; }
  else if (m === 'range') { const parts = []; const N = 4 << 20; for (let a = 0; ; a += N) { const r = await fetch(url, { headers: { Range: 'bytes=' + a + '-' + (a + N - 1) } }); const b = new Uint8Array(await r.arrayBuffer()); parts.push(b); if (r.status !== 206 || b.length < N) break; } keep = { parts }; }
  else if (m === 'xhr') keep = { b: await new Promise((ok) => { const x = new XMLHttpRequest(); x.responseType = 'arraybuffer'; x.onload = () => ok(x.response); x.open('GET', url); x.send(); }) };
  else if (m === 'bytes') keep = { b: new Uint8Array(await (await fetch(url)).arrayBuffer()) };
  postMessage({ ms: performance.now() - t, n: Object.keys(keep).length }); };`;
for (let r = 0; r < Number(reps); r++) for (const m of methods.split(',')) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(URL + 'robots.txt').catch(() => {});
  await page.waitForTimeout(500);
  const ps = pids().filter((x) => !old.has(x));
  const base = fp('phys_footprint', ps);
  const res = await page.evaluate(async ([code, url, m]) => { const w = new Worker(URL.createObjectURL(new Blob([code], { type: 'text/javascript' }))); const r = await new Promise((ok) => { w.onmessage = (e) => ok(e.data); w.postMessage({ url, m }); }); await new Promise((ok) => setTimeout(ok, 1000)); w.terminate(); return r; }, [WORKER, `${URL}data/${file}`, m]);
  const peak = fp('phys_footprint_peak', ps);
  console.log(`${m.padEnd(5)} før ${base.toFixed(0)} MB, processens top ${peak.toFixed(0)} MB (+${(peak - base).toFixed(0)}), ${res.ms.toFixed(0)} ms`);
  for (const x of ps) old.add(x);
  await ctx.close();
}
await browser.close();
process.exit(0);
