/**
 * K3 – teksttjek (docs/ORIGINAL_PARITY.md): finder de engelske tekster i src/i18n/en.ts, der kan vises i ægte tilstand med den
 * originale database, og tjekker dem mod strengene i originalens exe (scripts/data/cm0102-strings.txt.gz = `strings -n 4
 * cm0102.exe`, kun strenge, ingen kode). Pladsholdere: vores {param} ↔ originalens %s/%d/<Staff - …>/{}.
 *
 * Kør:  npx tsx scripts/text-parity.ts            (rapport pr. område)
 *       npx tsx scripts/text-parity.ts --top      (de vigtigste ikke-originale tekster)
 *       npx tsx scripts/text-parity.ts --list [præfiks]
 *       npx tsx scripts/text-parity.ts --update   (skriver scripts/data/text-parity-baseline.json – kun når tallet er faldet)
 *
 * Undtagelser står i scripts/data/text-parity-allow.json (med begrundelse). Afgrænsningen er statisk: gating med extended()
 * kan ikke aflæses af kildeteksten, så tallene er en ØVRE grænse for det, spilleren ser i ægte tilstand.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { en } from '../src/i18n/en';
import { ORIGINAL_OFF_NEWS } from '../src/game/newsFilter';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'scripts', 'data');

interface Allow {
  prefixes: { prefix: string; reason: string }[];
  keys: { key: string; reason: string }[];
  patterns: { regex: string; reason: string }[];
  /** Tekster uden bogstaver/ord (tal, tegn) og meget korte fælles ord tæller ikke */
  minLetters: number;
}

/** Fælles normalisering: små bogstaver, kun bogstaver/tal, enkelte mellemrum */
function norm(s: string): string {
  return s.toLowerCase().replace(/[’']/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

function loadBlob(): string {
  const raw = gunzipSync(readFileSync(join(DATA, 'cm0102-strings.txt.gz'))).toString('latin1');
  const out: string[] = [];
  for (const line of raw.split('\n')) {
    const t = line
      .replace(/<[^<>]*>/g, ' ') // <%s - Club Name (eg. Everton)>
      .replace(/\{\w*\}/g, ' ') // {}, {s}, {b} (stil-koder)
      .replace(/%[-+# 0]*\d*(?:\.\d+)?[a-zA-Z]/g, ' '); // %s %d %2d %.1f
    const n = norm(t);
    if (n.length >= 2) out.push(n);
  }
  return '\n' + out.join('\n') + '\n';
}

function walk(dir: string, out: string[] = []): string[] {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) { if (f !== 'i18n' && f !== 'data') walk(p, out); } else if (/\.(ts|tsx)$/.test(f)) out.push(p);
  }
  return out;
}

/** Nøgler, som koden refererer: bogstaveligt eller via et præfiks (`'cl.x.' + n`, `\`cl.x.${n}\``) */
function referencedKeys(keys: string[]): Set<string> {
  const src = walk(join(ROOT, 'src')).map((f) => readFileSync(f, 'utf8')).join('\n');
  const prefixes = new Set<string>();
  for (const m of src.matchAll(/['"`]([A-Za-z][\w.]*\.)(?:\$\{|['"`]\s*\+)/g)) prefixes.add(m[1]);
  for (const m of src.matchAll(/['"`]([A-Za-z][\w]*\.[\w.]*?)['"`]\s*\+/g)) prefixes.add(m[1]);
  const pl = [...prefixes];
  const ref = new Set<string>();
  for (const k of keys) {
    if (src.includes(k) || pl.some((p) => k.startsWith(p))) ref.add(k);
  }
  return ref;
}

export interface Result {
  total: number;
  checked: number;
  allowed: number;
  unreferenced: number;
  original: number;
  /** ikke-originale: nøgle → tekst */
  non: Record<string, string>;
  /** område (præfiks) → antal */
  areas: Record<string, number>;
}

export function analyze(): Result {
  const allow = JSON.parse(readFileSync(join(DATA, 'text-parity-allow.json'), 'utf8')) as Allow;
  const blob = loadBlob();
  const pats = allow.patterns.map((p) => new RegExp(p.regex));
  const keys = Object.keys(en);
  const refd = referencedKeys(keys);
  const res: Result = { total: keys.length, checked: 0, allowed: 0, unreferenced: 0, original: 0, non: {}, areas: {} };
  for (const k of keys) {
    if (allow.prefixes.some((p) => k.startsWith(p.prefix)) || allow.keys.some((a) => a.key === k) || pats.some((r) => r.test(k))) { res.allowed++; continue; }
    if (!refd.has(k)) { res.unreferenced++; continue; }
    // nyheder, der ikke sendes i ægte tilstand (src/game/newsFilter.ts), og deres brødtekster/varianter
    if (ORIGINAL_OFF_NEWS.some((o) => (o.endsWith('.') ? k.startsWith(o) : k === o || k.startsWith(o + '.')))) { res.allowed++; continue; }
    const text = en[k];
    const letters = (text.match(/\p{L}/gu) || []).length;
    if (letters < allow.minLetters) { res.allowed++; continue; }
    res.checked++;
    const segs = text.split(/\{[^}]*\}/).map(norm).filter((s) => s.length > 0);
    if (!segs.length) { res.allowed++; res.checked--; continue; }
    if (found(blob, segs)) { res.original++; continue; }
    res.non[k] = text;
    const area = k.split('.')[0];
    res.areas[area] = (res.areas[area] || 0) + 1;
  }
  return res;
}

/** Alle segmenter skal stå i samme streng i exe'en (længste først, resten i samme linje) */
function found(blob: string, segs: string[]): boolean {
  const sorted = [...segs].sort((a, b) => b.length - a.length);
  const first = ' ' + sorted[0] + ' ';
  const lineHit = (needle: string, from: number, to: number) => (' ' + blob.slice(from, to) + ' ').includes(needle);
  let i = 0;
  // linjerne er enkelte ord/sætninger omgivet af \n; vi tillader at segmentet står i en hvilken som helst linje
  const padded = (b: string, n: string) => b.includes(n);
  if (sorted.length === 1) {
    // hele linjen eller et ord-aligneret stykke (vi tæller linjen som padded med mellemrum)
    return padded(blob.replace(/\n/g, ' \n '), first) || blob.includes('\n' + sorted[0] + '\n');
  }
  while ((i = blob.indexOf(sorted[0], i)) !== -1) {
    const from = blob.lastIndexOf('\n', i) + 1;
    let to = blob.indexOf('\n', i);
    if (to === -1) to = blob.length;
    const line = ' ' + blob.slice(from, to) + ' ';
    if (line.includes(first) && sorted.slice(1).every((s) => line.includes(' ' + s + ' '))) return true;
    i = to + 1;
  }
  void lineHit;
  return false;
}

function main() {
  const args = process.argv.slice(2);
  const r = analyze();
  const nonCount = Object.keys(r.non).length;
  const baseFile = join(DATA, 'text-parity-baseline.json');
  if (args.includes('--list')) {
    const p = args[args.indexOf('--list') + 1] || '';
    for (const [k, v] of Object.entries(r.non)) if (k.startsWith(p)) console.log(k + '\t' + v.replace(/\n/g, ' / '));
    return;
  }
  console.log(`Nøgler: ${r.total} · uden for ægte tilstand (allow-liste/ingen bogstaver): ${r.allowed} · ikke refereret i koden: ${r.unreferenced}`);
  console.log(`Tjekket: ${r.checked} · findes i exe'ens strenge: ${r.original} · IKKE originale: ${nonCount}`);
  console.log('Pr. område:');
  for (const [a, n] of Object.entries(r.areas).sort((x, y) => y[1] - x[1])) console.log('  ' + a.padEnd(12) + n);
  if (args.includes('--top')) {
    for (const [k, v] of Object.entries(r.non).filter(([k]) => TOP.some((p) => k.startsWith(p))).slice(0, 50)) console.log(k + '\t' + v.replace(/\n/g, ' / '));
  }
  if (args.includes('--update')) {
    const base = { total: nonCount, areas: r.areas };
    writeFileSync(baseFile, JSON.stringify(base, null, 1) + '\n');
    console.log('Baseline skrevet: ' + nonCount);
  }
}

/** Områder, spilleren møder mest (nyheder, skærme, transfers, bestyrelse, skader) – bruges af --top */
const TOP = ['news.', 'transfer.', 'board.', 'injury.', 'fin.', 'comp.', 'contract.', 'bid.', 'offer.', 'cm.', 'cxs.', 'cl.'];

if (process.argv[1] && process.argv[1].endsWith('text-parity.ts')) main();
