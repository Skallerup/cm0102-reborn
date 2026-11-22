// Nyt spil i JavaScriptCore (macOS' jsc-skal) med processens footprint hvert sekund – Safaris hukommelse uden browseren.
// Brug: node scripts/jsc-newgame.mjs [world-fil] [land=England] [gc pr. trin=1]
import { build } from 'esbuild';
import { spawn, execSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const [file = 'public/data/world-original.json', nat = 'England', gcStep = '1'] = process.argv.slice(2);
const dir = mkdtempSync(join(process.env.TMPDIR ?? tmpdir(), 'jscng-'));
const out = join(dir, 'ng.js');
// jsc-skallen mangler TextDecoder/TextEncoder/structuredClone (findes i Safari)
const POLY = `
var TextDecoder = class { constructor(e) { this.e = (e || 'utf-8').toLowerCase(); } decode(b) { if (!b) return ''; const u = b instanceof Uint8Array ? b : new Uint8Array(b.buffer || b, b.byteOffset || 0, b.byteLength); let s = ''; for (let i = 0; i < u.length; i += 8192) s += String.fromCharCode.apply(null, u.subarray(i, i + 8192)); if (this.e === 'utf-8' || this.e === 'utf8') { try { return decodeURIComponent(escape(s)); } catch { return s; } } return s; } };
var TextEncoder = class { encode(s) { const b = unescape(encodeURIComponent(s)); const u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; } };
var structuredClone = function sc(v, m = new Map()) { if (v === null || typeof v !== 'object') return v; if (m.has(v)) return m.get(v);
  if (ArrayBuffer.isView(v)) { const c = v.slice(); m.set(v, c); return c; } if (v instanceof ArrayBuffer) { const c = v.slice(0); m.set(v, c); return c; }
  if (v instanceof Date) return new Date(v.getTime()); if (v instanceof Map) { const c = new Map(); m.set(v, c); for (const [k, x] of v) c.set(sc(k, m), sc(x, m)); return c; }
  if (v instanceof Set) { const c = new Set(); m.set(v, c); for (const x of v) c.add(sc(x, m)); return c; }
  if (Array.isArray(v)) { const c = new Array(v.length); m.set(v, c); for (let i = 0; i < v.length; i++) if (i in v) c[i] = sc(v[i], m); return c; }
  const c = {}; m.set(v, c); for (const k of Object.keys(v)) c[k] = sc(v[k], m); return c; };
var performance = { now: () => Date.now() };
`;
await build({ entryPoints: ['scripts/jsc-newgame-entry.ts'], bundle: true, format: 'iife', outfile: out, platform: 'neutral', target: 'es2022',
  define: { 'import.meta.env.BASE_URL': '"/"', 'import.meta.env': '{}' }, logLevel: 'error', mainFields: ['module', 'main'],
  banner: { js: POLY + 'var console = { log: (...a) => print(...a), warn: (...a) => print(...a), error: (...a) => print(...a), info: () => {}, debug: () => {} }; var process = undefined;' } });
const JSC = '/System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Helpers/jsc';
const p = spawn(JSC, [out, '--', file, nat, gcStep], { stdio: ['ignore', 'pipe', 'inherit'] });
let peak = 0, line = '';
const fp = () => { try { const o = execSync(`footprint --noCategories -f bytes -p ${p.pid}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); const m = o.match(/phys_footprint: (\d+) B/); return m ? Number(m[1]) / 1048576 : 0; } catch { return 0; } };
p.stdout.on('data', (d) => { for (const l of String(d).split('\n').filter(Boolean)) { line = l; console.log(`${l}  | fp ${fp().toFixed(0)} MB`); } });
const t = setInterval(() => { const f = fp(); if (f > peak) { peak = f; console.log(`  top ${f.toFixed(0)} MB (${line})`); } }, 500);
p.on('exit', (c) => { clearInterval(t); console.log(`jsc: exit ${c}, fp-top ${peak.toFixed(0)} MB`); });
