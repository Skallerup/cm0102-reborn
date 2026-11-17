#!/usr/bin/env node
// Fælles måleværktøj for tunge målinger (sæsoner, soak, oraklet). Se CLAUDE.md "Målinger".
//   node scripts/measure.mjs [flag] -- <kommando …>
// Flag:
//   --oracle    resultatet afhænger ikke af vores kode (originalen/Bosman med fast frø): gemmes for altid på kommandoen alene
//   --light     kør uden for køen (korte målinger, < 1 min)
//   --force     kør igen, selvom resultatet findes
//   --list      vis gemte resultater   ·   --show <nøgle>  vis et gemt resultat
// Nøglen er kommandoen + kodens tilstand (HEAD's træ for src/ scripts/ public/data/ + ikke-committede ændringer dér), så samme
// måling på samme kode – i en hvilken som helst worktree – kun køres én gang. Tunge målinger kører én ad gangen på hele maskinen.
// Mislykkede kørsler gemmes ikke.
import { spawn, execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const DIR = process.env.CM_MEASURE_DIR || path.join(os.homedir(), '.cache', 'cm-measure');
const LOCK = path.join(DIR, 'lock');
fs.mkdirSync(DIR, { recursive: true, mode: 0o700 });

const argv = process.argv.slice(2);
const sep = argv.indexOf('--');
const flags = new Set(sep < 0 ? argv : argv.slice(0, sep));
const cmd = sep < 0 ? [] : argv.slice(sep + 1);
const sha = (s) => createHash('sha256').update(s).digest('hex');

if (flags.has('--list')) {
  const rows = fs.readdirSync(DIR).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
  rows.sort((a, b) => a.at.localeCompare(b.at));
  for (const r of rows) console.log(`${r.key.slice(0, 12)}  ${r.at.slice(0, 16)}  ${r.oracle ? 'orakel' : r.head.slice(0, 8) + (r.dirty ? '+' : ' ')}  ${Math.round(r.ms / 1000)} s  ${r.cmd}`);
  process.exit(0);
}
const showIdx = argv.indexOf('--show');
if (showIdx >= 0) {
  const k = argv[showIdx + 1];
  const f = fs.readdirSync(DIR).find((x) => x.startsWith(k) && x.endsWith('.out'));
  if (!f) { console.error('ukendt nøgle'); process.exit(1); }
  process.stdout.write(fs.readFileSync(path.join(DIR, f)));
  process.exit(0);
}
if (!cmd.length) { console.error('brug: node scripts/measure.mjs [--oracle|--light|--force] -- <kommando …>'); process.exit(2); }

const git = (...a) => execFileSync('git', a, { encoding: 'utf8', maxBuffer: 1 << 28 }).trim();
const cmdText = cmd.join(' ');
// miljøvariabler, der styrer målingerne (MODE=, GRID_JSON=, CM_SL=, SL_ON …), hører med til nøglen
const envKey = Object.keys(process.env).filter((k) => /^(MODE|GRID_|CM_|SL_|ADVANCE|SUBS|OLDTAC|RECOMP_|E2E_)/.test(k)).sort().map((k) => `${k}=${process.env[k]}`).join('\n');
let head = '', dirty = false, codeKey = '';
if (!flags.has('--oracle')) {
  head = git('rev-parse', 'HEAD');
  const paths = ['src', 'scripts', 'public/data'];
  const tree = git('rev-parse', ...paths.map((p) => `HEAD:${p}`));
  const diff = git('diff', 'HEAD', '--', ...paths);
  const untracked = git('ls-files', '--others', '--exclude-standard', '--', ...paths).split('\n').filter(Boolean)
    .map((f) => f + ':' + sha(fs.readFileSync(f))).join('\n');
  dirty = !!(diff || untracked);
  codeKey = tree + '\n' + sha(diff) + '\n' + sha(untracked);
}
const key = sha([flags.has('--oracle') ? 'oracle' : 'code', cmdText, envKey, codeKey].join('\n\0'));
const out = path.join(DIR, key + '.out'), meta = path.join(DIR, key + '.json');

if (!flags.has('--force') && fs.existsSync(out) && fs.existsSync(meta)) {
  const m = JSON.parse(fs.readFileSync(meta, 'utf8'));
  console.error(`[measure] gemt resultat ${key.slice(0, 12)} fra ${m.at.slice(0, 16)} (${Math.round(m.ms / 1000)} s sparet)`);
  process.stdout.write(fs.readFileSync(out));
  process.exit(0);
}

const alive = (pid) => { try { process.kill(pid, 0); return true; } catch { return false; } };
// Højst SLOTS tunge kørsler ad gangen på hele maskinen (standard 2: ~1,5 GB hver; MEASURE_SLOTS=1 for én ad gangen).
const SLOTS = Math.max(1, Number(process.env.MEASURE_SLOTS) || 2);
const slotDirs = Array.from({ length: SLOTS }, (_, i) => (i === 0 ? LOCK : `${LOCK}${i + 1}`));
let held = null;
async function lock() {
  let said = false;
  for (;;) {
    for (const d of slotDirs) {
      try { fs.mkdirSync(d); fs.writeFileSync(path.join(d, 'owner'), JSON.stringify({ pid: process.pid, cmd: cmdText, at: new Date().toISOString() })); held = d; return; }
      catch {
        let o = null; try { o = JSON.parse(fs.readFileSync(path.join(d, 'owner'), 'utf8')); } catch {}
        if (o && !alive(o.pid)) fs.rmSync(d, { recursive: true, force: true });
      }
    }
    if (!said) { console.error(`[measure] venter i kø (${SLOTS} pladser optaget)`); said = true; }
    await new Promise((r) => setTimeout(r, 5000));
  }
}
const unlock = () => { if (!held) return; try { const o = JSON.parse(fs.readFileSync(path.join(held, 'owner'), 'utf8')); if (o.pid === process.pid) fs.rmSync(held, { recursive: true, force: true }); } catch {} held = null; };

const heavy = !flags.has('--light');
if (heavy) { await lock(); for (const s of ['SIGINT', 'SIGTERM', 'exit']) process.on(s, () => { unlock(); if (s !== 'exit') process.exit(130); }); }
const t0 = Date.now();
const chunks = [];
const child = spawn(cmd[0], cmd.slice(1), { stdio: ['ignore', 'pipe', 'inherit'], env: process.env });
child.stdout.on('data', (d) => { chunks.push(d); process.stdout.write(d); });
const code = await new Promise((r) => child.on('close', r));
if (heavy) unlock();
if (code !== 0) { console.error(`[measure] kommandoen fejlede (kode ${code}) – ikke gemt`); process.exit(code ?? 1); }
const buf = Buffer.concat(chunks);
fs.writeFileSync(out, buf, { mode: 0o600 });
fs.writeFileSync(meta, JSON.stringify({ key, cmd: cmdText, env: envKey, oracle: flags.has('--oracle'), head, dirty, at: new Date().toISOString(), ms: Date.now() - t0, outSha: sha(buf) }), { mode: 0o600 });
console.error(`[measure] gemt som ${key.slice(0, 12)} (uddata-sha ${sha(buf).slice(0, 12)})`);
