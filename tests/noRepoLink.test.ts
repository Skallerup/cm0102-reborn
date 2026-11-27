// Repoet er privat for spillerne: hverken src/, api/, index.html, public (uden genererede sider) eller SEO-skabelonerne må linke til det.
import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const walk = (d: string, out: string[] = []) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) { if (!['data', 'landing', 'cm-01-02', '2026-27', 'node_modules'].includes(f)) walk(p, out); }
    else if (/\.(ts|tsx|html|json|txt|xml|webmanifest|css)$/.test(f)) out.push(p);
  }
  return out;
};

describe('ingen link til vores GitHub-repo', () => {
  it('src, api, index.html, public og SEO-scripts', () => {
    // kun filer, git kender (genererede/gamle bygge-filer i .gitignore tæller ikke; de dækkes af kilden build-seo.ts)
    let tracked: Set<string> | null = null;
    try { tracked = new Set(execFileSync('git', ['ls-files'], { encoding: 'utf8', maxBuffer: 1 << 28 }).split('\n').filter(Boolean)); } catch { /* ikke et git-checkout */ }
    const files = [...walk('src'), ...walk('api'), ...walk('public'), ...walk('scripts/seo'), 'index.html', 'scripts/build-seo.ts']
      .filter((f) => !tracked || tracked.has(f));
    const hits = files.filter((f) => /github\.com\/skallerup|cm0102-reborn/i.test(readFileSync(f, 'utf8')) && !f.endsWith('changelogData.ts'));
    expect(hits).toEqual([]);
  });
});
