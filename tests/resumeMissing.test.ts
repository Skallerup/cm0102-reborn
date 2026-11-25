// ResumeMissing (25/11): et ryddet lager er ikke en kodefejl – pegeren ryddes stille og spilleren får en besked; kun et ulæseligt lager meldes.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('genoptag: manglende seneste spil', () => {
  const src = readFileSync('src/ui/AppPage.tsx', 'utf8');
  it('meldes kun som fejl, når lageret ikke kunne læses; ellers ryddes pegeren og beskeden vises', () => {
    expect(src).toMatch(/if \(rd\.idbError\) reportError\(new Error\(`ResumeMissing/);
    expect(src).toMatch(/else \{ forgetLast\(\); window\.dispatchEvent\(new Event\('cm-resume-missing'\)\); \}/);
    expect(src).toContain("start.lastMissingCloud");
  });
  it('opdaterings-toasten skjules under oprettelsen', () => {
    expect(readFileSync('src/ui/UpdateToast.tsx', 'utf8')).toMatch(/creatingNewGame\(\)/);
  });
});
