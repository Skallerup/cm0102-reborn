// Find det hurtigt: npx tsx scripts/where.ts <0xadresse|emne ...>
// Viser på én gang: src/ (fil:linje), noter + hooks i ~/cm0102-engine, tests/, scripts/ og docs/RELEASE_LOG.md.
// Flere ord = alle skal matche (linjen eller filnavnet). Ren node – ingen rg/grep nødvendig.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { homedir } from 'node:os';
process.stdout.on('error', (e: NodeJS.ErrnoException) => { if (e.code === 'EPIPE') process.exit(0); throw e; }); // tåler | head

const root = join(import.meta.dirname, '..');
const engine = process.env.CM_ENGINE ?? join(homedir(), 'cm0102-engine');
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const MAX = Number(process.env.WHERE_MAX ?? 30);
if (!args.length) { console.log('brug: npx tsx scripts/where.ts <0xadresse|emne ...>   (WHERE_MAX=n for flere hits)'); process.exit(1); }

const isAddr = args.length === 1 && /^(0x)?[0-9a-f]{5,8}$/i.test(args[0]) && /[0-9]/.test(args[0]);
const addr = isAddr ? args[0].toLowerCase().replace(/^0x/, '').replace(/^0+/, '') : '';
const terms = isAddr ? [addr] : args.map((a) => a.toLowerCase());
// adresse: match "0x6b7f20", "0x006b7f20" og bart "6b7f20" som helt ord
const addrRe = isAddr ? new RegExp(`(?<![0-9a-z])(0x)?0*${addr}(?![0-9a-z])`, 'i') : null;
const lineHit = (s: string) => (addrRe ? addrRe.test(s) : terms.every((t) => s.toLowerCase().includes(t)));

const SKIP = new Set(['node_modules', '.git', 'dist', 'data', 'public', 'seo-out', 'worktrees', '.claude']);
const TEXT = /\.(ts|tsx|mts|mjs|js|json|md|c|h|txt|css|sh|py|swift)$/;
function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (TEXT.test(e.name) && statSync(p).size < 2_000_000) out.push(p);
  }
  return out;
}

interface Hit { file: string; line: number; text: string; score: number }
function grep(files: string[], base: string): Hit[] {
  const hits: Hit[] = [];
  for (const f of files) {
    const rel = relative(base, f);
    const nameHit = terms.every((t) => rel.toLowerCase().includes(t));
    let src: string;
    try { src = readFileSync(f, 'utf8'); } catch { continue; }
    const lines = src.split('\n');
    let n = 0;
    for (let i = 0; i < lines.length && n < 5; i++) {
      if (lines[i].length > 400) continue;
      if (!lineHit(lines[i])) continue;
      const t = lines[i].trim();
      // relevans: filnavn-match > kommentarer/definitioner > øvrige
      const score = (nameHit ? 5 : 0) + (/^(\/\/|\*|#)/.test(t) ? 2 : 0) + (/^(export |function |const |class |interface |type )/.test(t) ? 1 : 0) + (lines[i].toLowerCase().includes(terms.join(' ')) ? 1 : 0);
      hits.push({ file: rel, line: i + 1, text: t.length > 150 ? t.slice(0, 150) + '…' : t, score });
      n++;
    }
    if (nameHit && !n) hits.push({ file: rel, line: 1, text: '(filnavn matcher)', score: 5 });
  }
  return hits.sort((a, b) => b.score - a.score || a.file.localeCompare(b.file) || a.line - b.line);
}
function section(title: string, hits: Hit[], max = MAX) {
  if (!hits.length) return;
  const files = new Set(hits.map((h) => h.file)).size;
  console.log(`\n== ${title} (${hits.length} hits i ${files} filer${hits.length > max ? `, viser ${max}` : ''}) ==`);
  for (const h of hits.slice(0, max)) console.log(`${h.file}:${h.line}: ${h.text}`);
}

console.log(`where: ${isAddr ? '0x' + addr : args.join(' ')}`);

if (existsSync(engine)) {
  if (isAddr) {
    const hd = join(engine, 'hooks');
    const f = existsSync(hd) ? readdirSync(hd).find((n) => n.replace(/\.c$/, '').replace(/^0x/, '').replace(/^0+/, '').toLowerCase() === addr) : undefined;
    if (f) {
      const p = join(hd, f);
      const txt = readFileSync(p, 'utf8').split('\n');
      console.log(`\n== C-hook: ${p} (${txt.length} linjer) ==`);
      console.log(txt.slice(0, 12).join('\n'));
    } else console.log(`\n(ingen hooks/${addr}.c)`);
  }
  section('noter ~/cm0102-engine/notes', grep(walk(join(engine, 'notes')), engine), 15);
  if (!isAddr) section('hooks ~/cm0102-engine/hooks', grep(walk(join(engine, 'hooks')), engine), 8);
  section('claude-memory', grep(walk(join(engine, 'claude-memory')), engine), 6);
} else console.log(`\n(${engine} findes ikke – springer noter/hooks over)`);

section('src/', grep(walk(join(root, 'src')), root), MAX);
section('tests/', grep(walk(join(root, 'tests')), root), 12);
section('scripts/', grep(walk(join(root, 'scripts')).filter((f) => !f.endsWith('where.ts')), root), 12);
section('docs/ (undtagen RELEASE_LOG)', grep(walk(join(root, 'docs')).filter((f) => !f.endsWith('RELEASE_LOG.md')), root), 10);
const rl = join(root, 'docs/RELEASE_LOG.md');
if (existsSync(rl)) section('docs/RELEASE_LOG.md', grep([rl], root).sort((a, b) => a.line - b.line), 8);
