// Repoet er privat for spillerne: hverken src/, api/, index.html, public (uden genererede sider) eller SEO-skabelonerne må linke til det.
import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

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
    const files = [...walk('src'), ...walk('api'), ...walk('public'), ...walk('scripts/seo'), 'index.html', 'scripts/build-seo.ts'];
    const hits = files.filter((f) => /github\.com\/skallerup|cm0102-reborn/i.test(readFileSync(f, 'utf8')) && !f.endsWith('changelogData.ts'));
    expect(hits).toEqual([]);
  });
});
