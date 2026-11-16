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
  // pladsholderens eksempel kan indeholde linjeskift ("<%s - wage amount(e.g.\n 20000)> p/w") – `strings` deler strengen der
  const rawLines = raw.split('\n');
  const lines: string[] = [];
  for (let i = 0; i < rawLines.length; i++) {
    let l = rawLines[i];
    for (let n = 0; n < 2 && i + 1 < rawLines.length && l.lastIndexOf('<') > l.lastIndexOf('>') && /<%/.test(l.slice(l.lastIndexOf('<'))); n++) l += ' ' + rawLines[++i];
    lines.push(l);
  }
  for (const line of lines) {
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

/** Kildekoden pr. fil som blokke (én pr. deklaration i kolonne 0), uden importlinjer */
interface Block { file: string; name: string; text: string }
function sourceBlocks(): { blocks: Block[]; rest: string } {
  const blocks: Block[] = [];
  let rest = '';
  for (const f of walk(join(ROOT, 'src'))) {
    const src = readFileSync(f, 'utf8').replace(/^import[\s\S]*?from\s+['"][^'"]+['"];?/gm, (m) => '\n'.repeat(m.split('\n').length - 1));
    let cur: Block | null = null;
    for (const line of src.split('\n')) {
      const m = /^(?:export\s+)?(?:default\s+)?(?:async\s+)?(?:function|const|let|class)\s+([A-Za-z_]\w*)/.exec(line);
      if (m) { cur = { file: f, name: m[1], text: '' }; blocks.push(cur); }
      if (cur) cur.text += line + '\n'; else rest += line + '\n';
    }
  }
  return { blocks, rest };
}

/**
 * Funktioner, der kun nås fra det moderne udseende (slået fra: MODERN_ENABLED = false i ui/modernFlag.ts – kun gamle udvidede gemte spil):
 * `Modern*`-komponenterne og alt, hvis eneste forekomster ligger i sådanne funktioner (fastpunkt over funktionsnavne i src/).
 */
function modernOnlyFunctions(blocks: Block[]): Set<string> {
  const names = [...new Set(blocks.map((b) => b.name))];
  const refs = new Map<string, Set<number>>(); // navn → de blokke, der nævner det
  const known = new Set(names);
  blocks.forEach((b, i) => {
    for (const id of new Set(b.text.match(/[A-Za-z_]\w*/g) ?? [])) if (id !== b.name && known.has(id)) (refs.get(id) ?? refs.set(id, new Set()).get(id)!).add(i);
  });
  const m = new Set(names.filter((n) => /^Modern[A-Z]/.test(n)));
  for (let changed = true; changed;) {
    changed = false;
    for (const n of names) {
      if (m.has(n)) continue;
      const r = refs.get(n);
      if (!r || !r.size) continue;
      if ([...r].every((i) => m.has(blocks[i].name))) { m.add(n); changed = true; }
    }
  }
  return m;
}

/** Nøgler, som koden refererer: bogstaveligt eller via et præfiks (`'cl.x.' + n`, `\`cl.x.${n}\``). `live` = ikke kun fra det moderne udseende. */
function referencedKeys(keys: string[]): { all: Set<string>; live: Set<string> } {
  const { blocks, rest } = sourceBlocks();
  const m = modernOnlyFunctions(blocks);
  const make = (src: string, only?: Set<string>) => {
    const prefixes = new Set<string>();
    for (const x of src.matchAll(/['"`]([A-Za-z][\w.]*\.)(?:\$\{|['"`]\s*\+)/g)) prefixes.add(x[1]);
    for (const x of src.matchAll(/['"`]([A-Za-z][\w]*\.[\w.]*?)['"`]\s*\+/g)) prefixes.add(x[1]);
    const pl = [...prefixes];
    // bogstavelige nøgler: alle punktum-adskilte navne i koden (og deres foranstillede dele) – hurtigere end src.includes pr. nøgle
    const toks = new Set<string>();
    for (const x of src.matchAll(/[A-Za-z][\w-]*(?:\.[\w-]+)+/g)) { let s = x[0]; for (;;) { toks.add(s); const i = s.lastIndexOf('.'); if (i < 0) break; s = s.slice(0, i); } }
    const ref = new Set<string>();
    for (const k of keys) if ((!only || only.has(k)) && (toks.has(k) || pl.some((p) => k.startsWith(p)) || src.includes(k))) ref.add(k);
    return ref;
  };
  const all = make(rest + blocks.map((b) => b.text).join(''));
  return { all, live: make(rest + blocks.filter((b) => !m.has(b.name)).map((b) => b.text).join(''), all) };
}

export interface Result {
  total: number;
  checked: number;
  allowed: number;
  unreferenced: number;
  /** kun refereret fra det moderne udseende (udvidet tilstand, slået fra) */
  modernOnly: number;
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
  const { all: refd, live } = referencedKeys(keys);
  const res: Result = { total: keys.length, checked: 0, allowed: 0, unreferenced: 0, modernOnly: 0, original: 0, non: {}, areas: {} };
  for (const k of keys) {
    if (allow.prefixes.some((p) => k.startsWith(p.prefix)) || allow.keys.some((a) => a.key === k) || pats.some((r) => r.test(k))) { res.allowed++; continue; }
    if (!refd.has(k)) { res.unreferenced++; continue; }
    if (!live.has(k)) { res.modernOnly++; continue; }
    // nyheder, der ikke sendes i ægte tilstand (src/game/newsFilter.ts), og deres brødtekster/varianter
    if (ORIGINAL_OFF_NEWS.some((o) => (o.endsWith('.') ? k.startsWith(o) : k === o || k.startsWith(o + '.')))) { res.allowed++; continue; }
    const text = en[k];
    const letters = (text.match(/\p{L}/gu) || []).length;
    if (letters < allow.minLetters) { res.allowed++; continue; }
    res.checked++;
    // genitiv efter en pladsholder ("{player}'s loan") = originalens "<navn>{s} loan" (blob'en tømmer {s})
    const segs = text.replace(/\b\d+\b/g, '{n}').replace(/(\{[^}]*\})['’]s\b/g, '$1').replace(/(\{[^}]*\})\s*p\/w\b/g, '$1').split(/\{[^}]*\}/).map(norm).filter((s) => s.length > 0);
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
  console.log(`Nøgler: ${r.total} · uden for ægte tilstand (allow-liste/ingen bogstaver): ${r.allowed} · ikke refereret i koden: ${r.unreferenced} · kun i det moderne udseende (udvidet): ${r.modernOnly}`);
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
